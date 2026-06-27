import { Router } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminGuard } from "../middleware/auth";

const router = Router();

// POST /auth/login (Deprecated for stateless direct Firebase login)
router.post("/auth/login", async (req, res): Promise<void> => {
  res.status(400).json({
    error: "Deprecated. Please authenticate directly on the client side using the Firebase SDK.",
  });
});

// POST /auth/logout
router.post("/auth/logout", async (req, res) => {
  res.json({ message: "Logged out" });
});

// GET /auth/me
router.get("/auth/me", adminGuard, async (req, res): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({
      id: req.admin.id,
      email: req.admin.email,
      name: req.admin.name,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/change-password
router.post("/auth/change-password", adminGuard, async (req, res): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body as Record<string, unknown>;
    if (!currentPassword || typeof currentPassword !== "string") {
      res.status(400).json({ error: "Current password is required" });
      return;
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      req.log.error("Missing GOOGLE_API_KEY / VITE_FIREBASE_API_KEY env variable");
      res.status(500).json({ error: "Internal server error: auth configuration missing" });
      return;
    }

    // 1. Verify current password by attempting to sign in with Firebase
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: req.admin.email,
          password: currentPassword,
          returnSecureToken: true,
        }),
      }
    );

    if (!signInRes.ok) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const signInData = (await signInRes.json()) as { idToken: string };

    // 2. Change the password in Firebase using the user's new token
    const updateRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: signInData.idToken,
          password: newPassword,
          returnSecureToken: true,
        }),
      }
    );

    if (!updateRes.ok) {
      res.status(500).json({ error: "Failed to update password in Firebase" });
      return;
    }

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
