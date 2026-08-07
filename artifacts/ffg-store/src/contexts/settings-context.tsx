import React, { createContext, useContext } from "react";
import { useGetSiteSettings } from "@workspace/api-client-react";
import type { SiteSettings } from "@workspace/api-client-react";

const DEFAULTS: SiteSettings = {
  heroTitle: "Nature's Sweetness, Herb-Infused",
  heroSubtitle:
    "Premium herbs-infused honey sachets in four delicious flavors — Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Each 15ml sachet brings nature's goodness to your cup.",
  heroCtaText: "Shop All Products",
  heroCtaSecondaryText: "Buy in Bulk",
  heroImageUrl: "",
  heroSecondaryImageUrl: "",
  companyTagline: "GRICH20 · Abuja, Nigeria",
  aboutText:
    "GRICH20 is a proudly Nigerian company committed to delivering nature's best. Our herbs-infused honey sachets are crafted with premium natural ingredients and distributed fresh across Abuja.",
  contactPhone: "09061602332",
  contactEmail: "info@grich20.online",
  contactAddress: "68 Trade More Avenue, Lugbe, Abuja",
  whatsappNumber: "+2349061602332",
  footerText: "GRICH20. All rights reserved.",
  announcementBanner: "",
  contactHeroSubtitle: "Questions about our products? Want to place a bulk order? We'd love to hear from you.",
  contactInfoDesc: "Reach us through any of these channels. We respond quickly!",
  contactBusinessHours: "Monday – Friday: 8am – 6pm\nSaturday: 9am – 4pm\nSunday: Closed",
  termsLastUpdated: "1 June 2025",
  termsS1: "", termsS2: "", termsS3: "", termsS4: "",
  termsS5: "", termsS6: "", termsS7: "", termsS8: "",
  termsS9: "", termsS10: "", termsS11: "", termsS12: "",
  privacyLastUpdated: "1 June 2025",
  privacyS1: "", privacyS2: "", privacyS3: "", privacyS4: "",
  privacyS5: "", privacyS6: "", privacyS7: "", privacyS8: "",
  privacyS9: "", privacyS10: "", privacyS11: "",
};

const SettingsContext = createContext<SiteSettings>(DEFAULTS);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useGetSiteSettings();
  return (
    <SettingsContext.Provider value={data ?? DEFAULTS}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
