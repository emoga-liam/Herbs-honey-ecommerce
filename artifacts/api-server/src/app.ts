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

// Trust the reverse proxy so rate limiters see the real client IP/host.
app.set("trust proxy", 1);

app.use(compression());

// Resolve built frontend static directory early so hashed assets skip request logging.
const frontendPath = path.resolve(
  process.env.FRONTEND_DIR ??
    path.resolve(__dirname, "..", "..", "ffg-store", "dist", "public"),
);

// Hashed Vite assets: long cache, served before pino for lower TTFB on static.
app.use(
  "/assets",
  express.static(path.join(frontendPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }),
);

// Favicon / SEO assets: moderate cache (not HTML).
const longLivedStatic = new Set([
  "favicon.jpg",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "opengraph.jpg",
]);
app.use(
  express.static(frontendPath, {
    maxAge: 0,
    setHeaders(res, filePath) {
      const base = path.basename(filePath);
      if (longLivedStatic.has(base)) {
        res.setHeader("Cache-Control", "public, max-age=604800"); // 7d
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

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
  handlePaystackWebhook(req as express.Request, res as express.Response);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Fallback for SPA routing: serve index.html for all non-API GET requests
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

export default app;
