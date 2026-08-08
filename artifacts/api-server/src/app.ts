import express, { type Express } from "express";
import compression from "compression";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { handlePaystackWebhook } from "./routes/payment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// Trust the reverse proxy (Replit's shared proxy sets X-Forwarded-For)
// so rate limiters and session cookies see the real client IP/host.
app.set("trust proxy", 1);

app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Webhook endpoint: MUST use raw body to preserve signature integrity
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), (req, res) => {
  // Re-run pinoHttp manually since we skip it for this route
  handlePaystackWebhook(req as express.Request, res as express.Response);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images. FRONTEND_DIR and UPLOADS_DIR make the same
// server bundle portable to standalone hosts such as Hostinger.
const uploadsPath = path.resolve(
  process.env.UPLOADS_DIR ?? path.resolve(__dirname, "..", "uploads"),
);
app.use(
  "/api/uploads",
  express.static(uploadsPath, {
    maxAge: "7d",
  }),
);

app.use("/api", router);

// Resolve built frontend static directory
const frontendPath = path.resolve(
  process.env.FRONTEND_DIR ??
    path.resolve(__dirname, "..", "..", "ffg-store", "dist", "public"),
);

// Hashed Vite assets: cache hard
app.use(
  "/assets",
  express.static(path.join(frontendPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }),
);

// Remaining frontend files (favicon, robots, etc.); HTML must not be cached long
app.use(
  express.static(frontendPath, {
    maxAge: 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

// Fallback for SPA (Single Page Application) routing: serve index.html for all non-API GET requests
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

export default app;
