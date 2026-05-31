import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
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

export default router;
