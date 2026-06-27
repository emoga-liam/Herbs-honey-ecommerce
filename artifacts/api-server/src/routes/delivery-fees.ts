import { Router } from "express";
import { db, deliveryFeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminGuard } from "../middleware/auth";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

// GET /delivery-fees (public)
const router = Router();

router.get("/delivery-fees", async (req, res) => {
  try {
    const fees = await db.select().from(deliveryFeesTable).orderBy(deliveryFeesTable.state);

    // Ensure all 37 states are present (fill gaps with 0)
    const feeMap = new Map(fees.map((f) => [f.state, f]));
    const result = NIGERIAN_STATES.map((state) =>
      feeMap.get(state) ?? { id: 0, state, feeKobo: 0 }
    );

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /delivery-fees — bulk upsert (admin)
router.put("/delivery-fees", adminGuard, async (req, res): Promise<void> => {
  try {
    const entries = req.body as Array<{ state: string; feeKobo: number }>;
    if (!Array.isArray(entries)) { res.status(400).json({ error: "Expected array" }); return; }

    for (const entry of entries) {
      if (!entry.state || typeof entry.feeKobo !== "number") continue;
      await db
        .insert(deliveryFeesTable)
        .values({ state: entry.state, feeKobo: entry.feeKobo })
        .onConflictDoUpdate({
          target: deliveryFeesTable.state,
          set: { feeKobo: entry.feeKobo, updatedAt: new Date() },
        });
    }

    const fees = await db.select().from(deliveryFeesTable).orderBy(deliveryFeesTable.state);
    const feeMap = new Map(fees.map((f) => [f.state, f]));
    const result = NIGERIAN_STATES.map((state) =>
      feeMap.get(state) ?? { id: 0, state, feeKobo: 0 }
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { NIGERIAN_STATES };
export default router;
