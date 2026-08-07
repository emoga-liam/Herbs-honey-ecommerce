import type { Request, Response, NextFunction } from "express";
import { db, adminsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function adminGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
    return;
  }

  const idToken = authHeader.substring(7);

  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      req.log.error("Missing GOOGLE_API_KEY / VITE_FIREBASE_API_KEY env variable");
      res.status(500).json({ error: "Internal server error: auth configuration missing" });
      return;
    }

    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!firebaseRes.ok) {
      res.status(401).json({ error: "Unauthorized: Invalid Firebase token" });
      return;
    }

    const data = (await firebaseRes.json()) as { users?: Array<{ email: string }> };
    const email = data.users?.[0]?.email;

    if (!email) {
      res.status(401).json({ error: "Unauthorized: Could not retrieve email from token" });
      return;
    }

    // Lookup email in adminsTable (case-insensitive)
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(sql`lower(${adminsTable.email}) = ${email.toLowerCase()}`);
    if (!admin) {
      res.status(403).json({ error: "Forbidden: You are not registered as an admin" });
      return;
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };

    next();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}
