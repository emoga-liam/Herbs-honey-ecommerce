import React, { createContext, useContext } from "react";
import { useGetSiteSettings } from "@workspace/api-client-react";
import type { SiteSettings } from "@workspace/api-client-react";

const DEFAULTS: SiteSettings = {
  heroTitle: "Nature's Sweetness, Herb-Infused",
  heroSubtitle:
    "Premium herbs-infused honey sachets in four delicious flavors — Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Each 15ml sachet brings nature's goodness to your cup.",
  heroCtaText: "Shop All Products",
  heroCtaSecondaryText: "Buy in Bulk",
  companyTagline: "Farm Fresh Grocery · Abuja, Nigeria",
  aboutText:
    "Farm Fresh Grocery (FFG) is a proudly Nigerian brand committed to delivering nature's best. Our herbs-infused honey sachets are distributed across Abuja by GRICH20 International General Services Limited, ensuring quality and freshness in every order.",
  contactPhone: "09061602332",
  contactEmail: "info@ffgfoods.com",
  contactAddress: "68 Trade More Avenue, Lugbe, Abuja",
  whatsappNumber: "+2349061602332",
  footerText:
    "Distributed by GRICH20 International General Services Limited. All rights reserved.",
  announcementBanner: "",
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
