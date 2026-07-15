import express, { type Express } from "express";
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

// Serve uploaded product images
app.use("/api/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use("/api", router);

// Resolve built frontend static directory
const frontendPath = path.resolve(__dirname, "..", "..", "ffg-store", "dist", "public");

// Serve frontend static assets (CSS, JS, images)
app.use(express.static(frontendPath));

// Fallback for SPA (Single Page Application) routing: serve index.html for all non-API GET requests
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

export default app;
