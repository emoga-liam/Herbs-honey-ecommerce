import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

// POST /auth/login
router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  try {
    const body = AdminLoginBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const { email, password } = body.data;
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
    if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

    req.session!.adminId = admin.id;
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/logout
router.post("/auth/logout", async (req, res) => {
  req.session?.destroy(() => {});
  res.json({ message: "Logged out" });
});

// GET /auth/me
router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Not authenticated" }); return; }
  try {
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, req.session.adminId));
    if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/change-password
router.post("/auth/change-password", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Not authenticated" }); return; }
  try {
    const { currentPassword, newPassword } = req.body as Record<string, unknown>;
    if (!currentPassword || typeof currentPassword !== "string") {
      res.status(400).json({ error: "Current password is required" }); return;
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" }); return;
    }
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, req.session.adminId));
    if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(adminsTable).set({ passwordHash: newHash }).where(eq(adminsTable.id, admin.id));
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
