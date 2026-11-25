import type { DongNaiAdministrativeUnit } from "./types";

/**
 * Removes Vietnamese diacritics and normalizes spacing for deterministic matching
 * across accented and unaccented user searches.
 */
export function stripVietnameseDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSearchText(input: string): string {
  return stripVietnameseDiacritics(input).toLowerCase();
}

/**
 * Formats an address strictly according to the 25/11/2026 administrative standard
 * without legacy district level ("Huyện / Thị xã").
 */
export function formatAdministrativeAddress(
  detailAddress: string | undefined | null,
  unit: Pick<DongNaiAdministrativeUnit, "diaChiChuan">,
): string {
  const cleanDetail = (detailAddress ?? "").trim().replace(/,+$/, "");
  if (!cleanDetail) {
    return unit.diaChiChuan;
  }
  return `${cleanDetail}, ${unit.diaChiChuan}`;
}

export function formatPostalDisplay(unit: Pick<DongNaiAdministrativeUnit, "maBuuChinhThamKhao">): string {
  return unit.maBuuChinhThamKhao ? `Mã bưu chính tham khảo: ${unit.maBuuChinhThamKhao}` : "Chưa có mã bưu chính";
}
