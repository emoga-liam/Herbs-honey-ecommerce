import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    let products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));

    if (params.flavor) {
      products = products.filter((p) => p.flavor === params.flavor);
    }
    if (params.type) {
      products = products.filter((p) => p.type === params.type);
    }
    if (params.inStock !== undefined) {
      products = products.filter((p) => p.inStock === params.inStock);
    }

    res.json(
      products.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ?? null,
        notes: undefined,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.featured, true))
      .orderBy(desc(productsTable.createdAt));
    res.json(
      products.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ?? null,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/:id
router.get("/products/:id", async (req, res): Promise<void> => {
  try {
    const params = GetProductParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    res.json({ ...product, imageUrl: product.imageUrl ?? null, createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /products (admin)
router.post("/products", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const body = CreateProductBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const [product] = await db.insert(productsTable).values(body.data).returning();
    res.status(201).json({ ...product, imageUrl: product.imageUrl ?? null, createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /products/:id (admin)
router.patch("/products/:id", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const params = UpdateProductParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const body = UpdateProductBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const [product] = await db
      .update(productsTable)
      .set(body.data)
      .where(eq(productsTable.id, params.data.id))
      .returning();

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json({ ...product, imageUrl: product.imageUrl ?? null, createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /products/:id (admin)
router.delete("/products/:id", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const params = DeleteProductParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
