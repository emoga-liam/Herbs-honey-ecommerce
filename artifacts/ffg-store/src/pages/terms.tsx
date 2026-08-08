import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useSettings } from "@/contexts/settings-context";

const SECTION_TITLES = [
  "1. Acceptance of Terms",
  "2. Products",
  "3. Pricing",
  "4. Orders and Payment",
  "5. Delivery",
  "6. Returns and Refunds",
  "7. User Accounts",
  "8. Intellectual Property",
  "9. Limitation of Liability",
  "10. Changes to These Terms",
  "11. Governing Law",
  "12. Contact Us",
];

export default function TermsPage() {
  const s = useSettings();

  const sectionBodies = [
    s.termsS1, s.termsS2, s.termsS3, s.termsS4,
    s.termsS5, s.termsS6, s.termsS7, s.termsS8,
    s.termsS9, s.termsS10, s.termsS11, s.termsS12,
  ];

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="font-cormorant font-bold text-5xl text-foreground mb-3">Terms & Conditions</h1>
          <p className="text-muted-foreground text-sm">Last updated: {s.termsLastUpdated || "1 June 2025"}</p>
        </div>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          {SECTION_TITLES.map((title, i) => (
            <div key={title}>
              <h2 className="font-cormorant font-bold text-xl text-foreground mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{sectionBodies[i] || ""}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4 text-sm">
          <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">← Back to Store</Link>
        </div>
      </div>
    </Layout>
  );
}
