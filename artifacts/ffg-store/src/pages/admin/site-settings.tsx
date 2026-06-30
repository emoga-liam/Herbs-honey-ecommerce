import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, ImageIcon, AlertCircle, ChevronDown } from "lucide-react";

const SECTIONS = [
  {
    title: "💳 Payment Settings",
    desc: "Configure online payment. Paste your Paystack payment link here — once set, customers can pay online at checkout. Leave blank to show a 'coming soon' message instead.",
    fields: [
      {
        key: "paystackLink",
        label: "Paystack Payment Link",
        multiline: false,
        placeholder: "https://paystack.com/pay/your-link-here",
      },
    ],
  },
  {
    title: "🏠 Homepage Hero",
    desc: "The large banner section at the top of your homepage",
    fields: [
      { key: "heroTitle", label: "Hero Title", multiline: false, placeholder: "Nature's Sweetness, Herb-Infused" },
      { key: "heroSubtitle", label: "Hero Subtitle", multiline: true, placeholder: "A short description under the title..." },
      { key: "heroCtaText", label: "Primary Button Text", multiline: false, placeholder: "Shop All Products" },
      { key: "heroCtaSecondaryText", label: "Secondary Button Text", multiline: false, placeholder: "Buy in Bulk" },
    ],
  },
  {
    title: "🖼️ Hero Images",
    desc: "The product photos displayed on the homepage hero. Paste direct image URLs (e.g. from Google Drive, Cloudinary, or any hosted image).",
    fields: [
      { key: "heroImageUrl", label: "Main Hero Image URL (large photo, right side)", multiline: false, placeholder: "https://example.com/main-product.jpg", isImage: true },
      { key: "heroSecondaryImageUrl", label: "Secondary Image URL (small photo, bottom-left — visible on larger screens)", multiline: false, placeholder: "https://example.com/secondary-product.jpg", isImage: true },
    ],
  },
  {
    title: "🏢 Brand & Company",
    desc: "Branding text shown across the site",
    fields: [
      { key: "companyTagline", label: "Company Tagline (hero badge)", multiline: false, placeholder: "Grich20 · Abuja, Nigeria" },
      { key: "aboutText", label: "About Section Text", multiline: true, placeholder: "Tell customers about Grich20..." },
      { key: "footerText", label: "Footer Text", multiline: false, placeholder: "Grich20 International General Services Limited..." },
    ],
  },
  {
    title: "📣 Announcement",
    desc: "A banner shown at the top of the site (leave blank to hide)",
    fields: [
      { key: "announcementBanner", label: "Announcement Banner Text", multiline: false, placeholder: "e.g. Free delivery on orders over ₦45,000!" },
    ],
  },
  {
    title: "📞 Contact Information",
    desc: "Contact details shown on the contact page and footer",
    fields: [
      { key: "contactPhone", label: "Phone Number", multiline: false, placeholder: "09061602332" },
      { key: "contactEmail", label: "Email Address", multiline: false, placeholder: "info@grich20.com" },
      { key: "contactAddress", label: "Physical Address", multiline: false, placeholder: "68 Trade More Avenue, Lugbe, Abuja" },
      { key: "whatsappNumber", label: "WhatsApp Number (with country code)", multiline: false, placeholder: "+2349061602332" },
    ],
  },
];

const PAGE_SECTIONS = [
  {
    id: "contact",
    title: "📞 Contact Page Content",
    desc: "Text shown on the public contact page",
    fields: [
      { key: "contactHeroSubtitle", label: "Hero Subtitle", multiline: true, rows: 2, placeholder: "Questions about our products? Want to place a bulk order? We'd love to hear from you." },
      { key: "contactInfoDesc", label: "Contact Info Description", multiline: false, placeholder: "Reach us through any of these channels. We respond quickly!" },
      { key: "contactBusinessHours", label: "Business Hours", multiline: true, rows: 4, placeholder: "Monday – Friday: 8am – 6pm\nSaturday: 9am – 4pm\nSunday: Closed", hint: "One entry per line, e.g. 'Monday – Friday: 8am – 6pm'" },
    ],
  },
  {
    id: "terms",
    title: "📜 Terms & Conditions",
    desc: "All 12 sections of the Terms & Conditions page. Titles are fixed; edit the body text for each section.",
    fields: [
      { key: "termsLastUpdated", label: "Last Updated Date", multiline: false, placeholder: "e.g. 1 June 2025" },
      { key: "termsS1", label: "Section 1 — Acceptance of Terms", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS2", label: "Section 2 — Products", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS3", label: "Section 3 — Pricing", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS4", label: "Section 4 — Orders and Payment", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS5", label: "Section 5 — Delivery", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS6", label: "Section 6 — Returns and Refunds", multiline: true, rows: 5, placeholder: "" },
      { key: "termsS7", label: "Section 7 — User Accounts", multiline: true, rows: 4, placeholder: "" },
      { key: "termsS8", label: "Section 8 — Intellectual Property", multiline: true, rows: 4, placeholder: "" },
      { key: "termsS9", label: "Section 9 — Limitation of Liability", multiline: true, rows: 4, placeholder: "" },
      { key: "termsS10", label: "Section 10 — Changes to These Terms", multiline: true, rows: 3, placeholder: "" },
      { key: "termsS11", label: "Section 11 — Governing Law", multiline: true, rows: 3, placeholder: "" },
      { key: "termsS12", label: "Section 12 — Contact Us", multiline: true, rows: 5, placeholder: "" },
    ],
  },
  {
    id: "privacy",
    title: "🔒 Privacy Policy",
    desc: "All 11 sections of the Privacy Policy page. Titles are fixed; edit the body text for each section.",
    fields: [
      { key: "privacyLastUpdated", label: "Last Updated Date", multiline: false, placeholder: "e.g. 1 June 2025" },
      { key: "privacyS1", label: "Section 1 — Introduction", multiline: true, rows: 4, placeholder: "" },
      { key: "privacyS2", label: "Section 2 — Information We Collect", multiline: true, rows: 6, placeholder: "" },
      { key: "privacyS3", label: "Section 3 — How We Use Your Information", multiline: true, rows: 6, placeholder: "" },
      { key: "privacyS4", label: "Section 4 — Information Sharing", multiline: true, rows: 6, placeholder: "" },
      { key: "privacyS5", label: "Section 5 — Data Security", multiline: true, rows: 4, placeholder: "" },
      { key: "privacyS6", label: "Section 6 — Cookies", multiline: true, rows: 4, placeholder: "" },
      { key: "privacyS7", label: "Section 7 — Your Rights", multiline: true, rows: 6, placeholder: "" },
      { key: "privacyS8", label: "Section 8 — Data Retention", multiline: true, rows: 4, placeholder: "" },
      { key: "privacyS9", label: "Section 9 — Children's Privacy", multiline: true, rows: 3, placeholder: "" },
      { key: "privacyS10", label: "Section 10 — Changes to This Policy", multiline: true, rows: 3, placeholder: "" },
      { key: "privacyS11", label: "Section 11 — Contact Us", multiline: true, rows: 5, placeholder: "" },
    ],
  },
];

function ImagePreview({ url }: { url: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setError(false); setLoaded(false); }, [url]);

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-amber-900/40 bg-amber-900/10 h-40 flex flex-col items-center justify-center gap-2 text-amber-200/30">
        <ImageIcon className="h-8 w-8" />
        <p className="text-xs">Paste an image URL above to preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-amber-900/30 relative">
      {!loaded && !error && (
        <div className="h-40 bg-amber-900/10 animate-pulse flex items-center justify-center">
          <p className="text-xs text-amber-200/30">Loading preview...</p>
        </div>
      )}
      {error ? (
        <div className="h-40 rounded-xl border border-red-900/40 bg-red-900/10 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="text-xs text-red-400">Could not load image — check the URL</p>
        </div>
      ) : (
        <img src={url} alt="Hero preview" className={`w-full h-48 object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)} onError={() => setError(true)} />
      )}
      {loaded && (
        <div className="absolute bottom-2 right-2 bg-green-900/80 text-green-300 text-xs px-2 py-1 rounded-full border border-green-700/40">
          ✓ Live on homepage
        </div>
      )}
    </div>
  );
}

export default function AdminSiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [openPages, setOpenPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (settings) setForm(settings as unknown as Record<string, string>);
  }, [settings]);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateSettings.mutate(
      { data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
          setDirty(false);
          toast({ title: "✅ Settings saved!", description: "Changes are now live on your site." });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" }),
      }
    );
  };

  const handleReset = () => {
    if (settings) { setForm(settings as unknown as Record<string, string>); setDirty(false); }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Site Settings">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-card border rounded-xl animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-muted-foreground text-sm">Customize all text and images on your website. Changes go live immediately when saved.</p>
        <div className="flex gap-2 flex-shrink-0">
          {dirty && (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 border-amber-800/60 text-amber-400">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!dirty || updateSettings.isPending} className="gap-2 bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : dirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl bg-card border border-border p-6">
            <div className="mb-5 pb-4 border-b border-border">
              <h3 className="font-cormorant font-bold text-lg text-amber-300">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </div>
            <div className="space-y-4">
              {section.fields.map((fieldDef) => (
                <div key={fieldDef.key} className="space-y-2">
                  <Label className="font-medium text-amber-200/70">{fieldDef.label}</Label>
                  {fieldDef.multiline ? (
                    <Textarea value={form[fieldDef.key] ?? ""} onChange={(e) => set(fieldDef.key, e.target.value)}
                      placeholder={fieldDef.placeholder} rows={4} className="resize-y" />
                  ) : (
                    <Input value={form[fieldDef.key] ?? ""} onChange={(e) => set(fieldDef.key, e.target.value)}
                      placeholder={fieldDef.placeholder} />
                  )}
                  {'isImage' in fieldDef && fieldDef.isImage && <ImagePreview url={form[fieldDef.key] ?? ""} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Page Content Sections — collapsible */}
      <div className="mt-4 space-y-3">
        <div className="mb-2">
          <h3 className="font-cormorant font-bold text-xl text-amber-200">Page Content</h3>
          <p className="text-sm text-muted-foreground">Click a page to expand and edit its content.</p>
        </div>
        {PAGE_SECTIONS.map((section) => {
          const isOpen = openPages.has(section.id);
          const toggle = () =>
            setOpenPages((prev) => {
              const next = new Set(prev);
              if (next.has(section.id)) next.delete(section.id);
              else next.add(section.id);
              return next;
            });
          return (
            <div key={section.id} className="rounded-xl bg-card border border-border overflow-hidden">
              <button
                type="button"
                onClick={toggle}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-amber-900/10 transition-colors"
              >
                <div>
                  <span className="font-cormorant font-bold text-lg text-amber-300">{section.title}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-amber-400 flex-shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-border pt-5 space-y-4">
                  {section.fields.map((fieldDef) => (
                    <div key={fieldDef.key} className="space-y-2">
                      <Label className="font-medium text-amber-200/70">{fieldDef.label}</Label>
                      {fieldDef.multiline ? (
                        <Textarea
                          value={form[fieldDef.key] ?? ""}
                          onChange={(e) => set(fieldDef.key, e.target.value)}
                          placeholder={fieldDef.placeholder}
                          rows={fieldDef.rows ?? 4}
                          className="resize-y font-mono text-sm"
                        />
                      ) : (
                        <Input
                          value={form[fieldDef.key] ?? ""}
                          onChange={(e) => set(fieldDef.key, e.target.value)}
                          placeholder={fieldDef.placeholder}
                        />
                      )}
                      {"hint" in fieldDef && fieldDef.hint && (
                        <p className="text-xs text-muted-foreground">{fieldDef.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating save button */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={handleSave} disabled={updateSettings.isPending} size="lg"
            className="gap-2 font-bold shadow-xl bg-amber-500 hover:bg-amber-400 text-[#060d07] rounded-full px-6">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
