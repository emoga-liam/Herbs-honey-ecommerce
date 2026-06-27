import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare module "express-session" {
  interface SessionData {
    adminId: number;
  }
}

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use("/api/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use("/api", router);

export default app;
