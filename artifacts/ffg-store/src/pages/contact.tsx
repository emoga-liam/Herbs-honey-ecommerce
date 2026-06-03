import { useState } from "react";
import { useSubmitContactForm } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle, Clock } from "lucide-react";

export default function ContactPage() {
  const settings = useSettings();
  const { toast } = useToast();
  const submitContact = useSubmitContactForm();
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(
      { data: form },
      {
        onSuccess: () => { setSent(true); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); },
        onError: () => toast({ title: "Failed to send message. Please try again.", variant: "destructive" }),
      }
    );
  };

  const contactItems = [
    { icon: Phone, label: "Phone", value: settings.contactPhone, href: `tel:${settings.contactPhone}` },
    { icon: Mail, label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: MapPin, label: "Address", value: settings.contactAddress, href: "#" },
    { icon: MessageCircle, label: "WhatsApp", value: settings.whatsappNumber, href: `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}` },
  ];

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-900 via-[#1a1200] to-amber-950 text-amber-50 py-16 border-b border-amber-900/30">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h1 className="font-serif font-bold text-5xl mb-4 text-amber-300">Get In Touch</h1>
          <p className="text-amber-200/70 max-w-xl mx-auto text-lg">
            {settings.contactHeroSubtitle || "Questions about our products? Want to place a bulk order? We'd love to hear from you."}
          </p>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-bold text-2xl mb-2">Contact Information</h2>
              <p className="text-muted-foreground text-sm">
                {settings.contactInfoDesc || "Reach us through any of these channels. We respond quickly!"}
              </p>
            </div>

            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{value}</p>
                </div>
              </a>
            ))}

            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-5 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-sm">Business Hours</h3>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {settings.contactBusinessHours || "Monday – Friday: 8am – 6pm\nSaturday: 9am – 4pm\nSunday: Closed"}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-12 text-center">
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                <h3 className="font-serif font-bold text-2xl text-green-800 dark:text-green-400 mb-2">Message Sent!</h3>
                <p className="text-green-700 dark:text-green-500">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <Button onClick={() => setSent(false)} variant="outline" className="mt-6 border-green-400 text-green-700">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border p-8">
                <h2 className="font-serif font-bold text-2xl mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Full Name *</Label>
                      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Amaka Johnson" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email Address *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone Number</Label>
                      <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="e.g. 0901234567" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subject *</Label>
                      <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        placeholder="e.g. Bulk Order Inquiry" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message *</Label>
                    <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help you..." rows={6} className="resize-none" required />
                  </div>
                  <Button type="submit" size="lg" className="w-full font-bold gap-2" disabled={submitContact.isPending}>
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
