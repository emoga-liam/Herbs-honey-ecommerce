import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useSettings } from "@/contexts/settings-context";

const SECTION_TITLES = [
  "1. Introduction",
  "2. Information We Collect",
  "3. How We Use Your Information",
  "4. Information Sharing",
  "5. Data Security",
  "6. Cookies",
  "7. Your Rights",
  "8. Data Retention",
  "9. Children's Privacy",
  "10. Changes to This Policy",
  "11. Contact Us",
];

export default function PrivacyPage() {
  const s = useSettings();

  const sectionBodies = [
    s.privacyS1, s.privacyS2, s.privacyS3, s.privacyS4,
    s.privacyS5, s.privacyS6, s.privacyS7, s.privacyS8,
    s.privacyS9, s.privacyS10, s.privacyS11,
  ];

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="font-cormorant font-bold text-5xl text-amber-100 mb-3">Privacy Policy</h1>
          <p className="text-amber-200/40 text-sm">Last updated: {s.privacyLastUpdated || "1 June 2025"}</p>
        </div>

        <div className="space-y-8 text-amber-200/70 leading-relaxed">
          {SECTION_TITLES.map((title, i) => (
            <div key={title}>
              <h2 className="font-cormorant font-bold text-xl text-amber-300 mb-3">{title}</h2>
              <p className="text-amber-200/60 leading-relaxed whitespace-pre-wrap">{sectionBodies[i] || ""}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-amber-900/20 flex gap-4 text-sm">
          <Link href="/terms" className="text-amber-500 hover:text-amber-400">Terms & Conditions</Link>
          <Link href="/" className="text-amber-200/40 hover:text-amber-300">← Back to Store</Link>
        </div>
      </div>
    </Layout>
  );
}
