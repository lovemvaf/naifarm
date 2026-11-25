import Fuse from "fuse.js";
import { ADMINISTRATIVE_UNITS, HISTORICAL_ALIASES } from "@/lib/geography/administrative-lookup";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import type {
  Farm,
  LearningLesson,
  Product,
  TraceBatch,
  VolunteerMission,
} from "@/types/naifarm";

export type SearchResultKind =
  | "product"
  | "farm"
  | "administrative_unit"
  | "batch"
  | "lesson"
  | "mission";

export interface GlobalSearchItem {
  id: string;
  kind: SearchResultKind;
  kindLabel: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  href: string;
  image?: string;
  searchableNormalized: string;
  scoreHint: number;
}

export interface SearchSourceBundle {
  products: Product[];
  farms: Farm[];
  batches: TraceBatch[];
  lessons: LearningLesson[];
  missions: VolunteerMission[];
}

/**
 * Indexes ONLY public and non-privileged entities for Global Search.
 * Strictly excludes W06 admin grants, audit logs, and private support tickets.
 */
export function buildSearchCorpus(bundle: SearchSourceBundle): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = [];

  for (const prod of bundle.products) {
    items.push({
      id: `prod-${prod.id}`,
      kind: "product",
      kindLabel: "Nông sản",
      title: prod.name,
      subtitle: `${prod.farmName} · ${prod.administrativeUnitName} · ${prod.priceVnd.toLocaleString("vi-VN")} đ/${prod.unitLabel}`,
      badgeText: prod.seasonStatus === "in_season" ? "Đang vào mùa" : "Hẹn mùa",
      href: `/products/${prod.slug}`,
      image: prod.image,
      searchableNormalized: normalizeSearchText(
        `${prod.name} ${prod.category} ${prod.farmName} ${prod.administrativeUnitName} ${prod.batchCode} ${(prod.tags ?? []).join(" ")}`,
      ),
      scoreHint: 1,
    });
  }

  for (const farm of bundle.farms) {
    items.push({
      id: `farm-${farm.id}`,
      kind: "farm",
      kindLabel: "Nhà vườn",
      title: farm.name,
      subtitle: `${farm.administrativeUnitName}, Thành phố Đồng Nai · ${farm.areaHa} ha · ${farm.mainCrops.slice(0, 2).join(", ")}`,
      badgeText: farm.ocopLabel,
      href: `/farms/${farm.slug}`,
      image: farm.bannerImage,
      searchableNormalized: normalizeSearchText(
        `${farm.name} ${farm.ownerName} ${farm.administrativeUnitName} ${farm.administrativeUnitCode} ${farm.zoneLabel} ${farm.mainCrops.join(" ")}`,
      ),
      scoreHint: 0.95,
    });
  }

  for (const unit of ADMINISTRATIVE_UNITS) {
    items.push({
      id: `unit-${unit.maDvhc}`,
      kind: "administrative_unit",
      kindLabel: "Đơn vị hành chính Đồng Nai",
      title: `${unit.tenDayDu} (Mã ${unit.maDvhc})`,
      subtitle: `${unit.diaChiChuan}${unit.chuyenXaLenPhuong2026 ? " · Nâng cấp Phường 2026" : ""}`,
      badgeText: unit.chuyenXaLenPhuong2026 ? "Phường mới 2026" : unit.loai,
      href: `/explore?unit=${encodeURIComponent(unit.maDvhc)}`,
      searchableNormalized: normalizeSearchText(
        `${unit.maDvhc} ${unit.tenDayDu} ${unit.tenKhongDau} ${unit.maBuuChinhThamKhao}`,
      ),
      scoreHint: 0.9,
    });
  }

  for (const batch of bundle.batches) {
    items.push({
      id: `batch-${batch.batchCode}`,
      kind: "batch",
      kindLabel: "Hộ chiếu QR",
      title: `Lô ${batch.batchCode} · ${batch.productName}`,
      subtitle: `${batch.farmName} · ${batch.administrativeUnitName} · Thu hoạch ${batch.harvestDate}`,
      badgeText: "Mã lô QR",
      href: `/trace/${encodeURIComponent(batch.batchCode)}`,
      searchableNormalized: normalizeSearchText(
        `${batch.batchCode} ${batch.productName} ${batch.farmName} ${batch.administrativeUnitName}`,
      ),
      scoreHint: 0.92,
    });
  }

  for (const lesson of bundle.lessons) {
    items.push({
      id: `lesson-${lesson.id}`,
      kind: "lesson",
      kindLabel: "Học tập",
      title: lesson.title,
      subtitle: `${lesson.topicTag} · ${lesson.durationLabel} · ${lesson.regionName}`,
      badgeText: "Học liệu 2D",
      href: `/learn?lesson=${encodeURIComponent(lesson.slug)}`,
      image: lesson.image,
      searchableNormalized: normalizeSearchText(
        `${lesson.title} ${lesson.topicTag} ${lesson.regionName} ${lesson.summary}`,
      ),
      scoreHint: 0.85,
    });
  }

  for (const mission of bundle.missions) {
    items.push({
      id: `mission-${mission.id}`,
      kind: "mission",
      kindLabel: "Nhiệm vụ TNV",
      title: `${mission.id} · ${mission.title}`,
      subtitle: `${mission.farmName} · ${mission.mode} · ${mission.expectedHours} giờ`,
      badgeText: mission.skillTag,
      href: `/volunteer?mission=${encodeURIComponent(mission.id)}`,
      searchableNormalized: normalizeSearchText(
        `${mission.id} ${mission.title} ${mission.farmName} ${mission.location} ${mission.skillTag}`,
      ),
      scoreHint: 0.82,
    });
  }

  return items;
}

export function runGlobalSearch(
  query: string,
  bundle: SearchSourceBundle,
  limit = 40,
): {
  results: GlobalSearchItem[];
  matchedAliasNote: string | null;
} {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return { results: [], matchedAliasNote: null };
  }

  const aliasMatch = HISTORICAL_ALIASES.find(
    (entry) =>
      normalized.includes(entry.aliasNormalized) ||
      entry.aliasNormalized.includes(normalized),
  );

  const corpus = buildSearchCorpus(bundle);
  const exactHits = corpus.filter((item) => item.searchableNormalized.includes(normalized));

  const fuse = new Fuse(corpus, {
    keys: ["searchableNormalized", "title", "subtitle"],
    threshold: 0.34,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const fuzzyHits = fuse.search(normalized).map((r) => r.item);
  const seen = new Set<string>();
  const combined: GlobalSearchItem[] = [];

  for (const item of [...exactHits, ...fuzzyHits]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    combined.push(item);
    if (combined.length >= limit) break;
  }

  return {
    results: combined,
    matchedAliasNote: aliasMatch ? `${aliasMatch.alias}: ${aliasMatch.note}` : null,
  };
}
