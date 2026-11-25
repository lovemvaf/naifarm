import type { Locale, Product, ProductCategory } from "@/types/naifarm";

const CATEGORY_EN: Record<ProductCategory, string> = {
  "Trái cây tươi": "Fresh Tropical Fruit",
  "Bưởi & Cây có múi": "Pomelo & Citrus",
  "Chôm chôm & Sầu riêng": "Rambutan & Durian",
  "Hạt điều & Rang củi": "Wood-Roasted Cashews",
  "Cà phê & Ca cao": "Roasted Coffee & Cacao",
  "Mật ong & Rượu trái cây": "Wild Honey & Craft Fruit Wine",
  "Nông sản chế biến & Mứt": "Dried Fruit & Preserves",
  "Rau củ & Nấm sạch": "Fresh Greens & Mushrooms",
  "Tiêu & Gia vị vùng đồi": "Hillside Pepper & Spices",
  "Quà tặng OCOP & Combo": "OCOP Gift Boxes & Bundles",
  "Thảo mộc & Gia vị hữu cơ mẫu": "Herbs & Organic-Style Sample Lots",
  "Đặc sản du lịch & Hộp quà": "Orchard Tour Keepsakes & Sets",
};

const KEYWORDS_VI_TO_EN: [RegExp, string][] = [
  [/Chôm chôm Java/gi, "Java Rambutan"],
  [/Chôm chôm nhãn/gi, "Longan Rambutan"],
  [/Chôm chôm tuyển chọn/gi, "Selected Grade Rambutan"],
  [/Chôm chôm/gi, "Rambutan"],
  [/Sầu riêng Ri6/gi, "Ri6 Durian"],
  [/Sầu riêng Monthong/gi, "Monthong Durian"],
  [/Sầu riêng tuyển chọn/gi, "Selected Grade Durian"],
  [/Sầu riêng/gi, "Durian"],
  [/Bưởi da xanh Tân Triều/gi, "Tan Trieu Green-Skin Pomelo"],
  [/Bưởi đường lá cam/gi, "Orange-Leaf Sweet Pomelo"],
  [/Bưởi/gi, "Pomelo"],
  [/Hạt điều/gi, "Cashew Nuts"],
  [/Xoài sấy dẻo/gi, "Soft-Dried Mango"],
  [/Xoài/gi, "Mango"],
  [/Mật ong/gi, "Blossom Honey"],
  [/Cà phê/gi, "Coffee"],
  [/Ca cao|Cacao/gi, "Cacao"],
  [/Hồ tiêu|Tiêu/gi, "Black Pepper"],
  [/Nấm bào ngư/gi, "Oyster Mushrooms"],
  [/Rau nhíp/gi, "Forest Fern Greens"],
  [/Rượu bưởi/gi, "Pomelo Wine (18+)"],
  [/Mứt vỏ bưởi/gi, "Candied Pomelo Peel"],
  [/NaiBox 95/gi, "NaiBox 95 Dong Nai Collection"],
  [/NaiRescue/gi, "NaiRescue Surplus Rescue Box"],
  [/Nhà vườn Ba Tư/gi, "Ba Tu Family Orchard"],
  [/HTX Nông nghiệp Tân Triều/gi, "Tan Trieu Agricultural Cooperative"],
  [/HTX/gi, "Coop"],
];

export function localizeCategory(cat: ProductCategory, locale: Locale): string {
  return locale === "en" ? CATEGORY_EN[cat] ?? cat : cat;
}

export function localizeProductName(product: Pick<Product, "name" | "enName">, locale: Locale): string {
  if (locale === "vi") return product.name;
  if (product.enName) return product.enName;
  let out = product.name;
  for (const [pattern, replacement] of KEYWORDS_VI_TO_EN) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function localizeUnit(unitLabel: string, locale: Locale): string {
  if (locale === "vi") return unitLabel;
  return unitLabel
    .replace(/\bgiỏ\b/gi, "basket")
    .replace(/\bhộp\b/gi, "box")
    .replace(/\bhũ\b/gi, "jar")
    .replace(/\blọ\b/gi, "jar")
    .replace(/\bchum\b/gi, "bottle")
    .replace(/\btúi\b/gi, "bag")
    .replace(/\bthùng\b/gi, "crate")
    .replace(/\bgói\b/gi, "pack")
    .replace(/\bthanh\b/gi, "bar");
}

export function localizeAdminUnitName(
  viName: string,
  code: string | undefined,
  locale: Locale,
): string {
  if (locale === "vi") return code ? `${viName} (${code})` : viName;
  let enName = viName;
  if (viName.startsWith("Phường ")) {
    enName = `${viName.slice(7)} Ward, Dong Nai City`;
  } else if (viName.startsWith("Xã ")) {
    enName = `${viName.slice(3)} Commune, Dong Nai City`;
  }
  return code ? `${enName} (${viName} · ${code})` : `${enName} (${viName})`;
}
