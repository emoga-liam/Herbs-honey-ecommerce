import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return "₦" + naira.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

import hibiscusImg from "@assets/2872ce8d-6380-4c6b-a560-6d9f7fb623f1_1780225496305.jpeg";
import gingerLemonImg from "@assets/809e0ca4-e2be-498f-89c7-244382c248f6_1780225496305.jpeg";
import cinnamonLemonImg from "@assets/921c6749-f396-4f85-acfc-d73e896868d3_1780225496305.jpeg";
import originalImg from "@assets/c1585aa0-b0f6-4fb2-8541-fa1821eb6998_1780225496305.jpeg";
import boxImg from "@assets/1bb59fff-c60a-495a-a645-92b6f7c19b0c_1780225496305.jpeg";

export function getProductImage(flavor: string, type: string, imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  if (type === "box") return boxImg;
  switch (flavor) {
    case "hibiscus": return hibiscusImg;
    case "ginger-lemon": return gingerLemonImg;
    case "cinnamon-lemon": return cinnamonLemonImg;
    default: return originalImg;
  }
}
