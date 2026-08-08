import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/** Confirms Express can open a Postgres connection via DATABASE_URL. */
router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("select 1 as ok");
    } finally {
      client.release();
    }
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({
      status: "error",
      database: "unreachable",
      // Safe enough for ops: connection errors, not credentials
      error: message.split("\n")[0]?.slice(0, 200) ?? "database connection failed",
      hint:
        "Hostinger often cannot reach Supabase’s direct DB host (IPv6). Use the Session pooler URI from Supabase → Project Settings → Database → Connect.",
    });
  }
});

export default router;
