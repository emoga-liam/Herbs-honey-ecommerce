import { Router } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc, count, sum } from "drizzle-orm";

const router = Router();

// GET /admin/stats
router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!req.session?.adminId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(ordersTable);
    const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(productsTable);

    const revenueResult = await db.select({ total: sum(ordersTable.totalKobo) }).from(ordersTable);
    const totalRevenueKobo = Number(revenueResult[0]?.total ?? 0);

    const allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const recentOrders = allOrders.slice(0, 5);

    // Group by status
    const statusMap = new Map<string, number>();
    for (const order of allOrders) {
      statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
    }
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    res.json({
      totalOrders,
      totalRevenueKobo,
      pendingOrders,
      totalProducts,
      recentOrders: recentOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
      ordersByStatus,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
