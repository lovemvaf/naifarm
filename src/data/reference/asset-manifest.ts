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

export const ASSET_MANIFEST: AssetManifestEntry[] = Array.from({ length: 65 }, (_, idx) => {
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
});

export function findAssetByPath(localPath: string): AssetManifestEntry | undefined {
  return ASSET_MANIFEST.find((a) => a.localPath === localPath);
}
