import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw } from "lucide-react";

const SECTIONS = [
  {
    title: "🏠 Homepage Hero",
    desc: "The large banner at the top of your homepage",
    fields: [
      { key: "heroTitle", label: "Hero Title", multiline: false, placeholder: "Nature's Sweetness, Herb-Infused" },
      { key: "heroSubtitle", label: "Hero Subtitle", multiline: true, placeholder: "A short description under the title..." },
      { key: "heroCtaText", label: "Primary Button Text", multiline: false, placeholder: "Shop All Products" },
      { key: "heroCtaSecondaryText", label: "Secondary Button Text", multiline: false, placeholder: "Buy in Bulk" },
    ],
  },
  {
    title: "🏢 Brand & Company",
    desc: "Branding text shown across the site",
    fields: [
      { key: "companyTagline", label: "Company Tagline (navbar badge)", multiline: false, placeholder: "Farm Fresh Grocery · Abuja, Nigeria" },
      { key: "aboutText", label: "About Section Text", multiline: true, placeholder: "Tell customers about FFG Foods..." },
      { key: "footerText", label: "Footer Text", multiline: false, placeholder: "Distributed by GRICH20 International..." },
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
      { key: "contactEmail", label: "Email Address", multiline: false, placeholder: "info@ffgfoods.com" },
      { key: "contactAddress", label: "Physical Address", multiline: false, placeholder: "68 Trade More Avenue, Lugbe, Abuja" },
      { key: "whatsappNumber", label: "WhatsApp Number (with country code)", multiline: false, placeholder: "+2349061602332" },
    ],
  },
];

export default function AdminSiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

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
          toast({ title: "✅ Settings saved!", description: "Your site changes are now live." });
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
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-card border rounded-xl animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Customize text, contact info, and content across your website. Changes are live immediately.</p>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!dirty || updateSettings.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : dirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl bg-card border border-border p-6">
            <div className="mb-5 pb-4 border-b border-border">
              <h3 className="font-serif font-bold text-lg">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </div>
            <div className="space-y-4">
              {section.fields.map(({ key, label, multiline, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="font-medium">{label}</Label>
                  {multiline ? (
                    <Textarea
                      value={form[key] ?? ""}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={placeholder}
                      rows={4}
                      className="resize-y"
                    />
                  ) : (
                    <Input
                      value={form[key] ?? ""}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dirty && (
        <div className="fixed bottom-6 right-6 flex gap-2 shadow-2xl">
          <Button onClick={handleSave} disabled={updateSettings.isPending} size="lg" className="gap-2 font-bold shadow-lg">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
