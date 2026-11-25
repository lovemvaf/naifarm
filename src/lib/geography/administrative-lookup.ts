import unitsJson from "@/data/geography/dong-nai-administrative-units.json";
import metadataJson from "@/data/geography/administrative-metadata.json";
import aliasesJson from "@/data/geography/historical-aliases.json";
import { normalizeSearchText } from "./normalize-address";
import type {
  AdministrativeMetadata,
  DongNaiAdministrativeUnit,
  HistoricalAliasEntry,
} from "./types";

export const ADMINISTRATIVE_UNITS = unitsJson as DongNaiAdministrativeUnit[];
export const ADMINISTRATIVE_METADATA = metadataJson as AdministrativeMetadata;
export const HISTORICAL_ALIASES = aliasesJson as HistoricalAliasEntry[];

const UNIT_BY_CODE = new Map<string, DongNaiAdministrativeUnit>(
  ADMINISTRATIVE_UNITS.map((unit) => [unit.maDvhc, unit]),
);

const UNIT_BY_UNIQUE_SLUG = new Map<string, DongNaiAdministrativeUnit>(
  ADMINISTRATIVE_UNITS.map((unit) => [unit.uniqueSlug, unit]),
);

export function getAdministrativeUnitByCode(
  code: string | undefined | null,
): DongNaiAdministrativeUnit | undefined {
  if (!code) return undefined;
  return UNIT_BY_CODE.get(code.trim());
}

export function getAdministrativeUnitByUniqueSlug(
  slug: string | undefined | null,
): DongNaiAdministrativeUnit | undefined {
  if (!slug) return undefined;
  return UNIT_BY_UNIQUE_SLUG.get(slug.trim());
}

export function getPhuongList(): DongNaiAdministrativeUnit[] {
  return ADMINISTRATIVE_UNITS.filter((unit) => unit.loai === "Phường");
}

export function getXaList(): DongNaiAdministrativeUnit[] {
  return ADMINISTRATIVE_UNITS.filter((unit) => unit.loai === "Xã");
}

export function getUpgradedPhuong2026List(): DongNaiAdministrativeUnit[] {
  return ADMINISTRATIVE_UNITS.filter((unit) => unit.chuyenXaLenPhuong2026);
}

export function searchAdministrativeUnits(query: string): {
  matches: DongNaiAdministrativeUnit[];
  matchedAlias: HistoricalAliasEntry | null;
} {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return { matches: ADMINISTRATIVE_UNITS, matchedAlias: null };
  }

  const directMatches = ADMINISTRATIVE_UNITS.filter((unit) => {
    const haystacks = [
      unit.maDvhc,
      normalizeSearchText(unit.ten),
      normalizeSearchText(unit.tenDayDu),
      normalizeSearchText(unit.tenKhongDau),
      unit.slug,
      unit.maBuuChinhThamKhao,
    ];
    return haystacks.some((item) => item.includes(normalized));
  });

  const matchedAlias =
    HISTORICAL_ALIASES.find(
      (entry) =>
        normalized.includes(entry.aliasNormalized) ||
        entry.aliasNormalized.includes(normalized),
    ) ?? null;

  if (matchedAlias) {
    const seen = new Set(directMatches.map((u) => u.maDvhc));
    const aliasUnits = matchedAlias.candidateCodes
      .map((code) => UNIT_BY_CODE.get(code))
      .filter((u): u is DongNaiAdministrativeUnit => Boolean(u && !seen.has(u.maDvhc)));
    return {
      matches: [...directMatches, ...aliasUnits],
      matchedAlias,
    };
  }

  return { matches: directMatches, matchedAlias: null };
}

export function getPhuocSonNotice(): {
  unit: DongNaiAdministrativeUnit;
  currentAreaKm2: number | null;
  proposedAreaKm2: number | null;
  legalNote: string;
} | null {
  const unit = UNIT_BY_CODE.get("25420");
  if (!unit) return null;
  return {
    unit,
    currentAreaKm2: unit.dienTichHienTrangTheoToTrinh112026 ?? unit.dienTichKm2DeAn2026,
    proposedAreaKm2: unit.dienTichDeXuatKm2,
    legalNote:
      unit.ghiChu ??
      "Chủ trương đã thông qua (chờ quyết định cấp có thẩm quyền); chưa áp dụng diện tích đề xuất.",
  };
}
