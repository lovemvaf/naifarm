import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/types/naifarm";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FIXTURE_USD_PER_VND = 1 / 25400; // Clearly labeled fixture conversion reference (25/11/2026)

export function formatVnd(amount: number, locale: Locale = "vi", showUsdEstimate = false): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN").format(rounded);
  const vndText = locale === "en" ? `${formatted} VND` : `${formatted} đ`;
  if (!showUsdEstimate || rounded <= 0) return vndText;
  const usd = (rounded * FIXTURE_USD_PER_VND).toFixed(2);
  return `${vndText} (~$${usd} est.)`;
}

export function formatCompactVnd(amount: number, locale: Locale = "vi"): string {
  if (Math.abs(amount) >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return locale === "en" ? `${m}M VND` : `${m} tr đ`;
  }
  return formatVnd(amount, locale);
}

export function formatDateVi(isoOrDisplay: string, locale: Locale = "vi"): string {
  if (/^\d{2}\/\d{2}\/\d{4}/.test(isoOrDisplay)) {
    if (locale === "vi") return isoOrDisplay;
    const [d, m, y] = isoOrDisplay.slice(0, 10).split("/");
    const tail = isoOrDisplay.slice(10);
    return `${y}-${m}-${d}${tail}`;
  }
  const parsed = new Date(isoOrDisplay);
  if (Number.isNaN(parsed.getTime())) return isoOrDisplay;
  const d = String(parsed.getDate()).padStart(2, "0");
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const y = parsed.getFullYear();
  if (locale === "en") {
    return `${y}-${m}-${d}`;
  }
  return `${d}/${m}/${y}`;
}
