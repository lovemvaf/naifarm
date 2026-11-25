import type { Product } from "@/types/naifarm";

/**
 * Deterministic related-products recommendation ranking:
 * Priority: same category (+4) -> same region/unit (+3) -> same farm (+2) -> in season (+1).
 * Excludes self. Never claims live personalized ML ranking.
 */
export function getRelatedProducts(
  current: Product,
  allProducts: Product[],
  limit = 4,
): Product[] {
  return allProducts
    .filter((p) => p.id !== current.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === current.category) score += 4;
      if (candidate.administrativeUnitCode === current.administrativeUnitCode) score += 3;
      if (candidate.farmId === current.farmId) score += 2;
      if (candidate.seasonStatus === "in_season" && candidate.stockKg > 0) score += 1;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || a.candidate.priceVnd - b.candidate.priceVnd)
    .slice(0, limit)
    .map((x) => x.candidate);
}
