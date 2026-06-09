import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /categories (public)
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    res.json(categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /categories (admin)
router.post("/categories", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }
    const [category] = await db
      .insert(categoriesTable)
      .values({ name: name.trim(), description: description?.trim() ?? "" })
      .returning();
    res.status(201).json({ ...category, createdAt: category.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /categories/:id (admin)
router.patch("/categories/:id", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }
    const [category] = await db
      .update(categoriesTable)
      .set({ name: name.trim(), description: description?.trim() ?? "" })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!category) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ ...category, createdAt: category.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /categories/:id (admin)
router.delete("/categories/:id", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
    const [category] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    if (!category) { res.status(404).json({ error: "Category not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
