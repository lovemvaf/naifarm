import type { AssetManifestEntry } from "@/types/naifarm";

const CATEGORY_HINTS: Record<number, string[]> = {
  1: ["brand", "logo"],
  2: ["hero", "pomelo", "rambutan", "orchard"],
  3: ["pomelo", "citrus"],
  4: ["durian"],
  5: ["cashew", "coffee"],
  6: ["honey", "processed"],
  7: ["rambutan"],
  8: ["cashew", "cocoa", "coffee"],
  9: ["produce", "spices"],
  10: ["produce", "mango", "passionfruit"],
  11: ["farmer", "portrait", "orchard"],
  12: ["farmer", "orchard"],
  13: ["farmer", "portrait"],
  14: ["jackfruit", "produce"],
  15: ["pomelo"],
  16: ["avocado", "produce"],
  17: ["processed", "beverage"],
  18: ["processed", "jam"],
  19: ["orchard", "tour"],
  20: ["orchard", "tour"],
  21: ["combo", "orchard", "gift"],
  22: ["orchard", "people"],
  24: ["pomelo"],
  25: ["pomelo", "combo"],
  26: ["pomelo"],
  27: ["pomelo"],
  28: ["pomelo"],
  29: ["vegetables", "hydroponic"],
  30: ["youth", "volunteer", "orchard"],
  31: ["combo", "qr", "gift"],
  32: ["rambutan", "volunteer"],
  33: ["processed", "rice-cracker"],
  34: ["cashew"],
  35: ["vegetables"],
  36: ["vegetables"],
  37: ["vegetables"],
  38: ["durian", "orchard"],
  39: ["cashew", "roasting"],
  40: ["rambutan"],
  41: ["banana", "produce"],
  42: ["guava", "produce"],
  43: ["mango", "produce"],
  44: ["pomelo"],
  45: ["pomelo"],
  46: ["pomelo"],
  47: ["processed", "dried-fruit"],
  48: ["processed", "spices"],
  49: ["durian"],
  50: ["cashew", "combo"],
  51: ["cashew", "cocoa"],
  52: ["combo", "snack"],
  53: ["pomelo"],
  54: ["farmer", "portrait"],
  55: ["tea", "processed"],
  56: ["packaging", "orchard"],
  57: ["mushroom", "vegetables"],
  60: ["pepper", "spices"],
  61: ["pepper", "spices"],
  62: ["pepper", "spices"],
  63: ["coffee", "combo"],
  65: ["cashew", "taro"],
};

const PNG_NUMBERS = new Set([23, 58, 64]);

const PRODUCT_EDITORIAL_ASSETS: Array<{ file: string; tags: string[]; alt: string }> = [
  { file: "black-pepper.jpg", tags: ["pepper", "spices"], alt: "Tiêu đen Đồng Nai minh họa" },
  { file: "white-pepper.jpg", tags: ["pepper", "spices"], alt: "Tiêu trắng tiêu sọ minh họa" },
  { file: "pepper-spice-set.jpg", tags: ["pepper", "spices", "combo"], alt: "Bộ gia vị tiêu Đồng Nai minh họa" },
  { file: "avocado-booth7.jpg", tags: ["avocado", "produce"], alt: "Bơ sáp Booth 7 minh họa" },
  { file: "cashew-butter.jpg", tags: ["cashew", "processed"], alt: "Bơ hạt điều minh họa" },
  { file: "mangosteen.jpg", tags: ["mangosteen", "produce"], alt: "Măng cụt Long Khánh minh họa" },
  { file: "hydroponic-greens.jpg", tags: ["vegetables", "hydroponic"], alt: "Rau xanh thủy canh sạch minh họa" },
  { file: "mushroom-oyster.jpg", tags: ["mushroom", "vegetables"], alt: "Nấm bào ngư tươi minh họa" },
  { file: "mushroom-reishi.jpg", tags: ["mushroom", "processed"], alt: "Nấm linh chi đỏ sấy khô minh họa" },
  { file: "dried-mango.jpg", tags: ["mango", "dried-fruit", "processed"], alt: "Xoài sấy dẻo Đồng Nai minh họa" },
  { file: "jackfruit-chips.jpg", tags: ["jackfruit", "dried-fruit", "processed"], alt: "Mít sấy giòn minh họa" },
  { file: "dragonfruit-pineapple.jpg", tags: ["dragonfruit", "pineapple", "dried-fruit"], alt: "Thanh long & khóm sấy giòn minh họa" },
  { file: "banana-dried.jpg", tags: ["banana", "dried-fruit"], alt: "Chuối sáp sấy dẻo minh họa" },
  { file: "longan-dried.jpg", tags: ["longan", "dried-fruit"], alt: "Long nhãn sấy khô minh họa" },
  { file: "macadamia-nuts.jpg", tags: ["macadamia", "nuts"], alt: "Hạt macca nứt vỏ minh họa" },
  { file: "chocolate-cacao.jpg", tags: ["cacao", "chocolate"], alt: "Socola và cacao Đồng Nai minh họa" },
  { file: "st25-rice-lotus.jpg", tags: ["rice", "grains"], alt: "Gạo sạch Đồng Nai minh họa" },
  { file: "turmeric-ginger.jpg", tags: ["turmeric", "ginger", "processed"], alt: "Tinh bột nghệ gừng mật ong minh họa" },
  { file: "guava-fresh.jpg", tags: ["guava", "produce"], alt: "Ổi nữ hoàng giòn ngọt minh họa" },
  { file: "ocop-gift-basket.jpg", tags: ["combo", "gift", "ocop"], alt: "Giỏ quà nông sản OCOP minh họa" },
  { file: "passionfruit-citrus.jpg", tags: ["passionfruit", "citrus", "beverage"], alt: "Chanh dây & nước cốt trái cây minh họa" },
  { file: "taro-bamboo.jpg", tags: ["taro", "vegetables"], alt: "Khoai môn & măng tươi minh họa" },
  { file: "pomelo-oil.jpg", tags: ["pomelo", "essential-oil", "processed"], alt: "Tinh dầu hoa bưởi Tân Triều minh họa" },
];

export const ASSET_MANIFEST: AssetManifestEntry[] = [
  ...Array.from({ length: 65 }, (_, idx) => {
    const num = idx + 1;
    const code = String(num).padStart(2, "0");
    const isPng = PNG_NUMBERS.has(num);
    const ext = isPng ? "png" : "jpg";
    const tags = CATEGORY_HINTS[num] ?? ["produce", "dong-nai"];
    return {
      assetId: `ASSET-STITCH-${code}`,
      localPath: `/images/stitch/stitch-${code}.${ext}`,
      categoryTags: tags,
      sourceOrigin: "Google Stitch Project 12256474506032242478 local export",
      license: "Tài nguyên ảnh minh họa nội bộ phục vụ không gian trải nghiệm NaiFarm",
      checkedAt: "2026-11-25",
      mime: isPng ? "image/png" : "image/jpeg",
      altTemplate: `Ảnh minh họa nông sản Đồng Nai (${tags.join(", ")})`,
    };
  }),
  ...PRODUCT_EDITORIAL_ASSETS.map((item, idx) => ({
    assetId: `ASSET-PROD-${String(idx + 1).padStart(2, "0")}`,
    localPath: `/images/products/${item.file}`,
    categoryTags: item.tags,
    sourceOrigin: "NaiFarm V5 curated studio produce photography (generated editorial asset)",
    license: "Tài nguyên ảnh minh họa nông sản nội bộ NaiFarm V5 (chỉ dùng trình diễn, không đại diện bao bì thương hiệu thật)",
    checkedAt: "2026-11-25",
    mime: "image/jpeg",
    altTemplate: item.alt,
  })),
];

export function findAssetByPath(localPath: string): AssetManifestEntry | undefined {
  return ASSET_MANIFEST.find((a) => a.localPath === localPath);
}
