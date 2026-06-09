import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
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

function toProduct(p: {
  id: number; name: string; description: string; priceKobo: number;
  flavor: string; type: string; imageUrl: string | null;
  inStock: boolean; stockCount: number; featured: boolean;
  categoryId: number | null; createdAt: Date; categoryName?: string | null;
}) {
  return {
    ...p,
    imageUrl: p.imageUrl ?? null,
    categoryId: p.categoryId ?? null,
    categoryName: p.categoryName ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

async function selectAllProducts() {
  return db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      priceKobo: productsTable.priceKobo,
      flavor: productsTable.flavor,
      type: productsTable.type,
      imageUrl: productsTable.imageUrl,
      inStock: productsTable.inStock,
      stockCount: productsTable.stockCount,
      featured: productsTable.featured,
      categoryId: productsTable.categoryId,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(desc(productsTable.createdAt));
}

// GET /products
router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    let products = await selectAllProducts();

    if (params.flavor) products = products.filter((p) => p.flavor === params.flavor);
    if (params.type) products = products.filter((p) => p.type === params.type);
    if (params.inStock !== undefined) products = products.filter((p) => p.inStock === params.inStock);
    if (params.categoryId !== undefined) products = products.filter((p) => p.categoryId === params.categoryId);
    if (params.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    res.json(products.map(toProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  try {
    const products = await selectAllProducts();
    res.json(products.filter((p) => p.featured).map(toProduct));
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

    const [product] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        priceKobo: productsTable.priceKobo,
        flavor: productsTable.flavor,
        type: productsTable.type,
        imageUrl: productsTable.imageUrl,
        inStock: productsTable.inStock,
        stockCount: productsTable.stockCount,
        featured: productsTable.featured,
        categoryId: productsTable.categoryId,
        createdAt: productsTable.createdAt,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, params.data.id));

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(toProduct(product));
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
    const catRow = product.categoryId
      ? (await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)))[0]
      : null;
    res.status(201).json(toProduct({ ...product, categoryName: catRow?.name ?? null }));
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
    const catRow = product.categoryId
      ? (await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)))[0]
      : null;
    res.json(toProduct({ ...product, categoryName: catRow?.name ?? null }));
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
