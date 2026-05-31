import { Router } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router = Router();

// GET /orders (admin)
router.get("/orders", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const query = ListOrdersQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    let orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    if (params.status) {
      orders = orders.filter((o) => o.status === params.status);
    }
    if (params.limit) {
      orders = orders.slice(0, params.limit);
    }

    res.json(orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /orders
router.post("/orders", async (req, res): Promise<void> => {
  try {
    const body = CreateOrderBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const { customerName, customerEmail, customerPhone, deliveryAddress, notes, items } = body.data;

    // Fetch products to compute total and get names
    const productIds = items.map((i) => i.productId);
    const products = await db.select().from(productsTable);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product.id,
        productName: product.name,
        productType: product.type,
        quantity: item.quantity,
        priceKobo: product.priceKobo,
      };
    });

    const totalKobo = orderItems.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        notes: notes ?? null,
        items: orderItems,
        totalKobo,
        status: "pending",
      })
      .returning();

    res.status(201).json({ ...order, createdAt: order.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /orders/:id
router.get("/orders/:id", async (req, res): Promise<void> => {
  try {
    const params = GetOrderParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    res.json({ ...order, createdAt: order.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /orders/:id/status (admin)
router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const params = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const body = UpdateOrderStatusBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const [order] = await db
      .update(ordersTable)
      .set({ status: body.data.status })
      .where(eq(ordersTable.id, params.data.id))
      .returning();

    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({ ...order, createdAt: order.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
