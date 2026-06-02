import { Layout } from "@/components/layout";
import { Link } from "wouter";

const LAST_UPDATED = "1 June 2025";

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="font-cormorant font-bold text-5xl text-amber-100 mb-3">Privacy Policy</h1>
          <p className="text-amber-200/40 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-amber-200/70 leading-relaxed">
          <Section title="1. Introduction">
            Grich20 International General Services Limited ("Grich20", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and place orders with us.
          </Section>

          <Section title="2. Information We Collect">
            <strong className="text-amber-300 block mb-2">Information you provide directly:</strong>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, phone number, and delivery address when placing an order</li>
              <li>Account credentials when you register (email and password, or Google account)</li>
              <li>Messages you send via our contact form</li>
            </ul>
            <strong className="text-amber-300 block mt-4 mb-2">Information collected automatically:</strong>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type, IP address, and pages visited (via standard web analytics)</li>
              <li>Order history and preferences</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Send order confirmations and delivery updates</li>
              <li>Respond to your enquiries and customer service requests</li>
              <li>Improve our website and product offerings</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do <strong className="text-amber-300">not</strong> sell your personal data to third parties. We do not use your information for unsolicited marketing without your consent.</p>
          </Section>

          <Section title="4. Information Sharing">
            We may share your information with:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-amber-300">Delivery partners</strong> — to fulfil your order (name, phone, address only)</li>
              <li><strong className="text-amber-300">Payment processors (Paystack)</strong> — to process payments securely. Paystack has its own privacy policy governing payment data</li>
              <li><strong className="text-amber-300">Firebase (Google)</strong> — for authentication services. Google's privacy policy applies to data processed by Firebase</li>
              <li><strong className="text-amber-300">Law enforcement</strong> — when required by law or to protect our rights</li>
            </ul>
          </Section>

          <Section title="5. Data Security">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your passwords are never stored in plain text.
            <br /><br />
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
          </Section>

          <Section title="6. Cookies">
            Our website uses cookies to enhance your browsing experience. These include:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Session cookies for keeping you logged in</li>
              <li>Local storage for your shopping cart</li>
            </ul>
            You can control cookies through your browser settings, though some features may not function correctly without them.
          </Section>

          <Section title="7. Your Rights">
            Under applicable data protection law, you have the right to:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your personal information</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            To exercise these rights, please contact us at info@grich20.com.
          </Section>

          <Section title="8. Data Retention">
            We retain your personal information for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are typically retained for 7 years for accounting and legal purposes.
          </Section>

          <Section title="9. Children's Privacy">
            Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If we discover that a child under 13 has provided us personal information, we will delete it promptly.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of the website after changes constitute acceptance.
          </Section>

          <Section title="11. Contact Us">
            For any privacy-related questions or to exercise your rights:
            <ul className="mt-3 space-y-1 list-none pl-0">
              <li><strong className="text-amber-300">Company:</strong> Grich20 International General Services Limited</li>
              <li><strong className="text-amber-300">Address:</strong> 68 Trade More Avenue, Lugbe, Abuja</li>
              <li><strong className="text-amber-300">Email:</strong> info@grich20.com</li>
              <li><strong className="text-amber-300">Phone:</strong> 09061602332</li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-amber-900/20 flex gap-4 text-sm">
          <Link href="/terms" className="text-amber-500 hover:text-amber-400">Terms & Conditions</Link>
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
