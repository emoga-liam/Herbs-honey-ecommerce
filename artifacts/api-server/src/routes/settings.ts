import { Router } from "express";
import { db, siteSettings } from "@workspace/db";

const router = Router();

const DEFAULTS: Record<string, string> = {
  heroTitle: "Nature's Sweetness, Herb-Infused",
  heroSubtitle:
    "Premium herbs-infused honey sachets in four delicious flavors — Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Each 15ml sachet brings nature's goodness to your cup.",
  heroCtaText: "Shop All Products",
  heroCtaSecondaryText: "Buy in Bulk",
  companyTagline: "Grich20 · Abuja, Nigeria",
  aboutText:
    "Grich20 International General Services Limited is a proudly Nigerian company committed to delivering nature's best. Our herbs-infused honey sachets are crafted with premium natural ingredients and distributed fresh across Abuja.",
  contactPhone: "09061602332",
  contactEmail: "info@grich20.com",
  contactAddress: "68 Trade More Avenue, Lugbe, Abuja",
  whatsappNumber: "+2349061602332",
  footerText: "Grich20 International General Services Limited. All rights reserved.",
  announcementBanner: "",
};

function rowsToSettings(rows: { key: string; value: string }[]) {
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

// GET /settings — public
router.get("/settings", async (req, res) => {
  try {
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);
    res.json(rowsToSettings(rows));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PATCH /settings — admin only
router.patch("/settings", async (req, res) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== "string") continue;
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
    }
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);
    res.json(rowsToSettings(rows));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// POST /contact — public
router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  req.log.info({ name, email, phone, subject }, "Contact form submission received");
  res.json({ message: "Thank you for your message. We will get back to you shortly!" });
});

export default router;
