import { Router } from "express";
import { db, productsTable, categoriesTable, productImagesTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

type ProductRow = {
  id: number; name: string; description: string; priceKobo: number;
  flavor: string; type: string; imageUrl: string | null;
  inStock: boolean; stockCount: number; featured: boolean;
  categoryId: number | null; minOrderQty: number; createdAt: Date;
  categoryName?: string | null;
};

type ImageRow = { id: number; productId: number; imageUrl: string; sortOrder: number };

function toProduct(p: ProductRow, images: ImageRow[]) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    priceKobo: p.priceKobo,
    flavor: p.flavor,
    type: p.type,
    imageUrl: p.imageUrl ?? null,
    inStock: p.inStock,
    stockCount: p.stockCount,
    featured: p.featured,
    categoryId: p.categoryId ?? null,
    categoryName: p.categoryName ?? null,
    minOrderQty: p.minOrderQty,
    images: images
      .filter((i) => i.productId === p.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ id: i.id, imageUrl: i.imageUrl, sortOrder: i.sortOrder })),
    createdAt: p.createdAt.toISOString(),
  };
}

async function selectAllProducts(): Promise<ProductRow[]> {
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
      minOrderQty: productsTable.minOrderQty,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(desc(productsTable.createdAt));
}

async function getImagesForProducts(productIds: number[]): Promise<ImageRow[]> {
  if (productIds.length === 0) return [];
  return db
    .select({ id: productImagesTable.id, productId: productImagesTable.productId, imageUrl: productImagesTable.imageUrl, sortOrder: productImagesTable.sortOrder })
    .from(productImagesTable)
    .where(inArray(productImagesTable.productId, productIds));
}

async function saveImages(productId: number, images: { imageUrl: string; sortOrder: number }[]) {
  await db.delete(productImagesTable).where(eq(productImagesTable.productId, productId));
  if (images.length > 0) {
    await db.insert(productImagesTable).values(
      images.map((img, i) => ({ productId, imageUrl: img.imageUrl, sortOrder: img.sortOrder ?? i }))
    );
  }
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

    const images = await getImagesForProducts(products.map((p) => p.id));
    res.json(products.map((p) => toProduct(p, images)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  try {
    const products = await selectAllProducts();
    const featured = products.filter((p) => p.featured);
    const images = await getImagesForProducts(featured.map((p) => p.id));
    res.json(featured.map((p) => toProduct(p, images)));
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
        minOrderQty: productsTable.minOrderQty,
        createdAt: productsTable.createdAt,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, params.data.id));

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    const images = await getImagesForProducts([product.id]);
    res.json(toProduct(product, images));
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

    const { images, ...productData } = body.data;
    // Auto-set imageUrl to first image if provided
    const coverUrl = images.length > 0 ? images[0].imageUrl : productData.imageUrl ?? null;
    const [product] = await db.insert(productsTable).values({ ...productData, imageUrl: coverUrl }).returning();

    await saveImages(product.id, images);

    const catRow = product.categoryId
      ? (await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)))[0]
      : null;
    const savedImages = await getImagesForProducts([product.id]);
    res.status(201).json(toProduct({ ...product, categoryName: catRow?.name ?? null }, savedImages));
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

    const { images, ...productData } = body.data;

    // Auto-set imageUrl to first image when images are provided
    let updateData: typeof productData & { imageUrl?: string | null } = productData;
    if (images !== undefined && images.length > 0) {
      updateData = { ...productData, imageUrl: images[0].imageUrl };
    } else if (images !== undefined && images.length === 0) {
      updateData = { ...productData, imageUrl: null };
    }

    const [product] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, params.data.id))
      .returning();

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    if (images !== undefined) {
      await saveImages(product.id, images);
    }

    const catRow = product.categoryId
      ? (await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)))[0]
      : null;
    const savedImages = await getImagesForProducts([product.id]);
    res.json(toProduct({ ...product, categoryName: catRow?.name ?? null }, savedImages));
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
