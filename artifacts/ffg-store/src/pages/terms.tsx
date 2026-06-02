import { Layout } from "@/components/layout";
import { Link } from "wouter";

const LAST_UPDATED = "1 June 2025";

export default function TermsPage() {
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="font-cormorant font-bold text-5xl text-amber-100 mb-3">Terms & Conditions</h1>
          <p className="text-amber-200/40 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-amber-200/70 leading-relaxed">
          <Section title="1. Acceptance of Terms">
            By accessing and placing an order with Grich20 International General Services Limited ("Grich20", "we", "us", or "our"), you confirm that you are in agreement with and bound by the terms and conditions contained herein. These terms apply to the entire website and any email or other type of communication between you and Grich20.
          </Section>

          <Section title="2. Products">
            Grich20 sells herbs-infused honey sachets and boxes including Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon flavors. All products are produced in Nigeria and are subject to availability. We reserve the right to discontinue any product at any time.
            <br /><br />
            Product images are for illustration purposes. Actual packaging may vary slightly from what is shown on the website.
          </Section>

          <Section title="3. Pricing">
            All prices are listed in Nigerian Naira (₦) and are inclusive of applicable taxes where required. Prices are subject to change without notice. We reserve the right to modify pricing at any time. The price applicable to your order will be the price shown at the time you place your order.
          </Section>

          <Section title="4. Orders and Payment">
            Orders are subject to acceptance and availability. After placing an order, you will receive a confirmation. This confirmation is not acceptance of your order — acceptance occurs when your order is dispatched.
            <br /><br />
            We accept payment via Paystack (card, bank transfer, USSD) and payment on delivery. Payment on delivery requires confirmation by our team before dispatch. We reserve the right to cancel any order for any reason, including suspected fraud or pricing errors.
          </Section>

          <Section title="5. Delivery">
            We currently deliver within Abuja, Nigeria. Delivery timelines are estimates only and are not guaranteed. Grich20 is not responsible for delays caused by circumstances beyond our control, including adverse weather conditions, traffic, or third-party logistics issues.
            <br /><br />
            Risk of loss and title for products passes to you upon delivery. If you are not available to receive your order, we will attempt to contact you to reschedule.
          </Section>

          <Section title="6. Returns and Refunds">
            If you receive a damaged or incorrect product, please contact us within 48 hours of delivery at info@grich20.com or via WhatsApp. We will arrange a replacement or refund at our discretion.
            <br /><br />
            Due to the perishable and consumable nature of our products, we do not accept returns of opened or used products unless they are defective.
          </Section>

          <Section title="7. User Accounts">
            You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Section>

          <Section title="8. Intellectual Property">
            All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Grich20 International General Services Limited and is protected by Nigerian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </Section>

          <Section title="9. Limitation of Liability">
            To the fullest extent permitted by law, Grich20 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products. Our total liability to you for any claim arising from these terms shall not exceed the amount you paid for the relevant order.
          </Section>

          <Section title="10. Changes to These Terms">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes your acceptance of the revised terms.
          </Section>

          <Section title="11. Governing Law">
            These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Abuja, Nigeria.
          </Section>

          <Section title="12. Contact Us">
            If you have any questions about these Terms & Conditions, please contact us:
            <ul className="mt-3 space-y-1 list-none pl-0">
              <li><strong className="text-amber-300">Company:</strong> Grich20 International General Services Limited</li>
              <li><strong className="text-amber-300">Address:</strong> 68 Trade More Avenue, Lugbe, Abuja</li>
              <li><strong className="text-amber-300">Email:</strong> info@grich20.com</li>
              <li><strong className="text-amber-300">Phone:</strong> 09061602332</li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-amber-900/20 flex gap-4 text-sm">
          <Link href="/privacy" className="text-amber-500 hover:text-amber-400">Privacy Policy</Link>
          <Link href="/" className="text-amber-200/40 hover:text-amber-300">← Back to Store</Link>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-cormorant font-bold text-xl text-amber-300 mb-3">{title}</h2>
      <div className="text-amber-200/60 leading-relaxed">{children}</div>
    </div>
  );
}
