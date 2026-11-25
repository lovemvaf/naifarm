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

/**
 * Extract the base package/unit noun for compact stock counts
 * (e.g. "hộp 500g" -> "hộp" / "boxes", "túi 3 kg" -> "túi" / "bags", avoiding duplicate weight "Còn 34 túi 500g").
 */
export function formatStockCountUnit(unitLabel: string, locale: Locale = "vi"): string {
  const lower = unitLabel.trim().toLowerCase();
  if (locale === "en") {
    if (lower.startsWith("hộp quà")) return "gift boxes";
    if (lower.startsWith("bộ quà") || lower.startsWith("bộ")) return "sets";
    if (lower.startsWith("giỏ")) return "baskets";
    if (lower.startsWith("thùng")) return "crates";
    if (lower.startsWith("hộp")) return "boxes";
    if (lower.startsWith("hũ") || lower.startsWith("lọ")) return "jars";
    if (lower.startsWith("chum")) return "jars";
    if (lower.startsWith("chai")) return "bottles";
    if (lower.startsWith("túi")) return "bags";
    if (lower.startsWith("gói")) return "packs";
    if (lower.startsWith("khay")) return "trays";
    if (lower.startsWith("bó")) return "bunches";
    if (lower.startsWith("thanh")) return "bars";
    if (lower.startsWith("trái")) return "fruits";
    if (lower.startsWith("nải")) return "hands";
    if (lower === "kg") return "kg";
    return lower;
  }
  if (lower.startsWith("hộp quà")) return "hộp quà";
  if (lower.startsWith("bộ quà")) return "bộ quà";
  if (lower.startsWith("túi quà")) return "túi quà";
  const firstWord = lower.split(/[\s~]/)[0];
  return firstWord || unitLabel;
}

/**
 * Strip internal workspace engineering prefixes (e.g. "W01 · ", "W03 - ") for customer-facing display.
 */
export function stripWorkspaceCodePrefix(label: string): string {
  return label.replace(/^W0[1-6]\s*[·:-]\s*/i, "").trim();
}
