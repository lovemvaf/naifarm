import Fuse from "fuse.js";
import { ADMINISTRATIVE_UNITS, HISTORICAL_ALIASES } from "@/lib/geography/administrative-lookup";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import type {
  CampaignRecord,
  Farm,
  LearningLesson,
  LivestreamSession,
  Product,
  TourPackage,
  TraceBatch,
  VolunteerMission,
} from "@/types/naifarm";

export type SearchResultKind =
  | "product"
  | "farm"
  | "administrative_unit"
  | "batch"
  | "lesson"
  | "mission"
  | "tour"
  | "live"
  | "event";

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
  tours?: TourPackage[];
  livestreams?: LivestreamSession[];
  campaigns?: CampaignRecord[];
}

const EN_VI_SYNONYMS: [string, string][] = [
  ["pomelo", "buoi"],
  ["rambutan", "chom chom"],
  ["durian", "sau rieng"],
  ["cashew", "hat dieu"],
  ["coffee", "ca phe"],
  ["cocoa", "ca cao"],
  ["cacao", "ca cao"],
  ["honey", "mat ong"],
  ["pepper", "tieu"],
  ["mango", "xoai"],
  ["mushroom", "nam"],
  ["banana", "chuoi"],
  ["jackfruit", "mit"],
  ["tea", "tra"],
  ["tour", "trai nghiem"],
  ["festival", "ngay hoi su kien"],
  ["cultural", "van hoa di san"],
];

function expandBilingualKeywords(rawNorm: string): string {
  let out = rawNorm;
  for (const [en, vi] of EN_VI_SYNONYMS) {
    if (out.includes(en)) out = `${out} ${vi}`;
    if (out.includes(vi)) out = `${out} ${en}`;
  }
  return out;
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
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(
          `${prod.name} ${prod.enName ?? ""} ${prod.category} ${prod.farmName} ${prod.administrativeUnitName} ${prod.batchCode} ${(prod.tags ?? []).join(" ")}`,
        ),
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
      badgeText: lesson.ambassadorLevel ?? "Học liệu 2D",
      href: `/learn/${encodeURIComponent(lesson.slug)}`,
      image: lesson.image,
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(
          `${lesson.title} ${lesson.titleEn ?? ""} ${lesson.topicTag} ${lesson.regionName} ${lesson.summary}`,
        ),
      ),
      scoreHint: 0.85,
    });
  }

  for (const tour of bundle.tours ?? []) {
    items.push({
      id: `tour-${tour.id}`,
      kind: "tour",
      kindLabel: "Trải nghiệm vườn",
      title: tour.titleVi,
      subtitle: `${tour.farmName} · ${tour.administrativeUnitName} · ${tour.adultPriceVnd.toLocaleString("vi-VN")} đ`,
      badgeText: tour.languages.includes("en") ? "VI / EN Tour" : "Tour vườn",
      href: `/experiences/${encodeURIComponent(tour.slug)}`,
      image: tour.image,
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(
          `${tour.titleVi} ${tour.titleEn} ${tour.farmName} ${tour.administrativeUnitName}`,
        ),
      ),
      scoreHint: 0.86,
    });
  }

  for (const live of bundle.livestreams ?? []) {
    items.push({
      id: `live-${live.id}`,
      kind: "live",
      kindLabel: "OCOP Live",
      title: live.title,
      subtitle: `${live.farmName} · ${live.scheduleLabel}`,
      badgeText: live.status === "replay_demo" ? "Phát lại" : "Lịch dự kiến",
      href: `/live/${encodeURIComponent(live.id)}`,
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(
          `${live.title} ${live.titleEn ?? ""} ${live.farmName} ${live.hostYouth}`,
        ),
      ),
      scoreHint: 0.78,
    });
  }

  for (const cmp of bundle.campaigns ?? []) {
    if (cmp.status === "draft" || cmp.status === "cancelled") continue;
    items.push({
      id: `cmp-${cmp.id}`,
      kind: "event",
      kindLabel: "Sự kiện & Ưu đãi",
      title: cmp.titleVi,
      subtitle: `${cmp.organizer}`,
      badgeText:
        cmp.status === "ended"
          ? "Recap"
          : cmp.status === "active"
          ? "Đang diễn ra"
          : "Sắp diễn ra",
      href: `/events/${encodeURIComponent(cmp.slug)}`,
      image: cmp.bannerImage,
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(`${cmp.titleVi} ${cmp.titleEn} ${cmp.subtitleVi} ${cmp.subtitleEn}`),
      ),
      scoreHint: 0.8,
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
      searchableNormalized: expandBilingualKeywords(
        normalizeSearchText(
          `${mission.id} ${mission.title} ${mission.titleEn ?? ""} ${mission.farmName} ${mission.location} ${mission.skillTag}`,
        ),
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

  const expandedQuery = expandBilingualKeywords(normalized);
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
  const synonymHits =
    expandedQuery !== normalized
      ? corpus.filter((item) =>
          expandedQuery
            .split(" ")
            .some((kw) => kw.length >= 3 && item.searchableNormalized.includes(kw)),
        )
      : [];

  const seen = new Set<string>();
  const combined: GlobalSearchItem[] = [];

  for (const item of [...exactHits, ...synonymHits, ...fuzzyHits]) {
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
