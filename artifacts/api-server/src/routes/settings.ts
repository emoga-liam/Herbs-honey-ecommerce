import { Router } from "express";
import { db, siteSettings } from "@workspace/db";

const router = Router();

const DEFAULTS: Record<string, string> = {
  heroTitle: "Nature's Sweetness, Herb-Infused",
  heroSubtitle:
    "Premium herbs-infused honey sachets in four delicious flavors — Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Each 15ml sachet brings nature's goodness to your cup.",
  heroCtaText: "Shop All Products",
  heroCtaSecondaryText: "Buy in Bulk",
  heroImageUrl: "",
  heroSecondaryImageUrl: "",
  companyTagline: "Grich20 · Abuja, Nigeria",
  aboutText:
    "Grich20 International General Services Limited is a proudly Nigerian company committed to delivering nature's best. Our herbs-infused honey sachets are crafted with premium natural ingredients and distributed fresh across Abuja.",
  contactPhone: "09061602332",
  contactEmail: "info@grich20.com",
  contactAddress: "68 Trade More Avenue, Lugbe, Abuja",
  whatsappNumber: "+2349061602332",
  footerText: "Grich20 International General Services Limited. All rights reserved.",
  announcementBanner: "",
  // Contact page content
  contactHeroSubtitle: "Questions about our products? Want to place a bulk order? We'd love to hear from you.",
  contactInfoDesc: "Reach us through any of these channels. We respond quickly!",
  contactBusinessHours: "Monday – Friday: 8am – 6pm\nSaturday: 9am – 4pm\nSunday: Closed",
  // Terms & Conditions
  termsLastUpdated: "1 June 2025",
  termsS1: `By accessing and placing an order with Grich20 International General Services Limited ("Grich20", "we", "us", or "our"), you confirm that you are in agreement with and bound by the terms and conditions contained herein. These terms apply to the entire website and any email or other type of communication between you and Grich20.`,
  termsS2: `Grich20 sells herbs-infused honey sachets and boxes including Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon flavors. All products are produced in Nigeria and are subject to availability. We reserve the right to discontinue any product at any time.\n\nProduct images are for illustration purposes. Actual packaging may vary slightly from what is shown on the website.`,
  termsS3: `All prices are listed in Nigerian Naira (₦) and are inclusive of applicable taxes where required. Prices are subject to change without notice. We reserve the right to modify pricing at any time. The price applicable to your order will be the price shown at the time you place your order.`,
  termsS4: `Orders are subject to acceptance and availability. After placing an order, you will receive a confirmation. This confirmation is not acceptance of your order — acceptance occurs when your order is dispatched.\n\nWe accept payment via Paystack (card, bank transfer, USSD) and payment on delivery. Payment on delivery requires confirmation by our team before dispatch. We reserve the right to cancel any order for any reason, including suspected fraud or pricing errors.`,
  termsS5: `We currently deliver within Abuja, Nigeria. Delivery timelines are estimates only and are not guaranteed. Grich20 is not responsible for delays caused by circumstances beyond our control, including adverse weather conditions, traffic, or third-party logistics issues.\n\nRisk of loss and title for products passes to you upon delivery. If you are not available to receive your order, we will attempt to contact you to reschedule.`,
  termsS6: `If you receive a damaged or incorrect product, please contact us within 48 hours of delivery at info@grich20.com or via WhatsApp. We will arrange a replacement or refund at our discretion.\n\nDue to the perishable and consumable nature of our products, we do not accept returns of opened or used products unless they are defective.`,
  termsS7: `You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.`,
  termsS8: `All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Grich20 International General Services Limited and is protected by Nigerian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  termsS9: `To the fullest extent permitted by law, Grich20 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products. Our total liability to you for any claim arising from these terms shall not exceed the amount you paid for the relevant order.`,
  termsS10: `We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes your acceptance of the revised terms.`,
  termsS11: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Abuja, Nigeria.`,
  termsS12: `If you have any questions about these Terms & Conditions, please contact us:\n\nCompany: Grich20 International General Services Limited\nAddress: 68 Trade More Avenue, Lugbe, Abuja\nEmail: info@grich20.com\nPhone: 09061602332`,
  // Privacy Policy
  privacyLastUpdated: "1 June 2025",
  privacyS1: `Grich20 International General Services Limited ("Grich20", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and place orders with us.`,
  privacyS2: `Information you provide directly:\n- Name, email address, phone number, and delivery address when placing an order\n- Account credentials when you register (email and password, or Google account)\n- Messages you send via our contact form\n\nInformation collected automatically:\n- Browser type, IP address, and pages visited (via standard web analytics)\n- Order history and preferences`,
  privacyS3: `We use the information we collect to:\n- Process and fulfill your orders\n- Communicate with you about your order status\n- Send order confirmations and delivery updates\n- Respond to your enquiries and customer service requests\n- Improve our website and product offerings\n- Comply with legal obligations\n\nWe do not sell your personal data to third parties. We do not use your information for unsolicited marketing without your consent.`,
  privacyS4: `We may share your information with:\n- Delivery partners — to fulfil your order (name, phone, address only)\n- Payment processors (Paystack) — to process payments securely. Paystack has its own privacy policy governing payment data\n- Firebase (Google) — for authentication services. Google's privacy policy applies to data processed by Firebase\n- Law enforcement — when required by law or to protect our rights`,
  privacyS5: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your passwords are never stored in plain text.\n\nHowever, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.`,
  privacyS6: `Our website uses cookies to enhance your browsing experience. These include:\n- Session cookies for keeping you logged in\n- Local storage for your shopping cart\n\nYou can control cookies through your browser settings, though some features may not function correctly without them.`,
  privacyS7: `Under applicable data protection law, you have the right to:\n- Access the personal information we hold about you\n- Request correction of inaccurate information\n- Request deletion of your personal information\n- Object to or restrict processing of your personal information\n- Withdraw consent where processing is based on consent\n\nTo exercise these rights, please contact us at info@grich20.com.`,
  privacyS8: `We retain your personal information for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are typically retained for 7 years for accounting and legal purposes.`,
  privacyS9: `Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If we discover that a child under 13 has provided us personal information, we will delete it promptly.`,
  privacyS10: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of the website after changes constitute acceptance.`,
  privacyS11: `For any privacy-related questions or to exercise your rights:\n\nCompany: Grich20 International General Services Limited\nAddress: 68 Trade More Avenue, Lugbe, Abuja\nEmail: info@grich20.com\nPhone: 09061602332`,
};

function rowsToSettings(rows: { key: string; value: string }[]) {
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

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

router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  req.log.info({ name, email, phone, subject }, "Contact form submission received");
  res.json({ message: "Thank you for your message. We will get back to you shortly!" });
});

export default router;
