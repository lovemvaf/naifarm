import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { z } from "zod";
import type { AdministrativeMetadata, DongNaiAdministrativeUnit } from "../src/lib/geography/types";

const CsvRowSchema = z.object({
  ma_dvhc: z.string().min(1),
  ma_cap_tren: z.literal("75"),
  ten_cap_tren: z.literal("Thành phố Đồng Nai"),
  loai_cap_tren: z.string().min(1),
  cap_hanh_chinh: z.coerce.number().int().positive(),
  ten: z.string().min(1),
  loai: z.enum(["Phường", "Xã"]),
  ten_day_du: z.string().min(1),
  ten_khong_dau: z.string().min(1),
  slug: z.string().min(1),
  dia_chi_chuan: z.string().min(1),
  ma_quoc_gia: z.string().min(1),
  ma_buu_chinh_tham_khao: z.string().optional().default(""),
  website_ubnd: z.string().optional().default(""),
  trang_thai: z.string().min(1),
  moc_ra_soat: z.string().min(1),
  tu_ngay_loai_hien_hanh: z.string().optional().default(""),
  tu_ngay_cap_tren_hien_hanh: z.string().min(1),
  chuyen_xa_len_phuong_2026: z.enum(["true", "false"]),
  can_cu_sap_xep_2025: z.string().min(1),
  can_cu_thanh_lap_phuong_2026: z.string().optional().default(""),
  can_cu_cap_tren: z.string().min(1),
  dien_tich_km2_de_an_2026: z.string().optional().default(""),
  dan_so_de_an_2026: z.string().optional().default(""),
  mat_do_de_an_nguoi_km2: z.string().optional().default(""),
  trang_thai_so_lieu: z.string().min(1),
  vi_do_wgs84: z.string().optional().default(""),
  kinh_do_wgs84: z.string().optional().default(""),
  geometry_wkt: z.string().optional().default(""),
  crs_geometry: z.string().optional().default(""),
  trang_thai_gis: z.string().min(1),
  trang_thai_dieu_chinh_dia_gioi: z.string().min(1),
  ghi_chu: z.string().optional().default(""),
  dien_tich_hien_trang_theo_to_trinh_11_2026: z.string().optional().default(""),
  dan_so_theo_to_trinh_11_2026: z.string().optional().default(""),
  dien_tich_de_xuat_km2: z.string().optional().default(""),
  nguon_ma_dvhc: z.string().min(1),
  nguon_sap_xep_2025: z.string().min(1),
  nguon_phap_ly_2026: z.string().min(1),
  nguon_danh_muc_hien_hanh: z.string().min(1),
  nguon_dien_tich_dan_so: z.string().min(1),
  nguon_buu_chinh_tham_khao: z.string().min(1),
  nguon_dieu_chinh: z.string().optional().default(""),
});

function toNullableNumber(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableString(raw: string): string | null {
  const cleaned = raw.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function main() {
  const projectRoot = process.cwd();
  const csvPath = path.join(projectRoot, "data", "raw", "Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Missing raw CSV at ${csvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const parsed = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse error: ${JSON.stringify(parsed.errors.slice(0, 5))}`);
  }

  const slugCounts = new Map<string, string[]>();
  const validatedRows = parsed.data.map((row, idx) => {
    const res = CsvRowSchema.safeParse(row);
    if (!res.success) {
      throw new Error(`Invalid row #${idx + 1} (${row.ma_dvhc ?? "?"}): ${res.error.message}`);
    }
    const r = res.data;
    const list = slugCounts.get(r.slug) ?? [];
    list.push(r.ma_dvhc);
    slugCounts.set(r.slug, list);
    return r;
  });

  const duplicateRawSlugs: Record<string, string[]> = {};
  for (const [slug, codes] of slugCounts.entries()) {
    if (codes.length > 1) {
      duplicateRawSlugs[slug] = codes;
    }
  }

  const units: DongNaiAdministrativeUnit[] = validatedRows.map((r) => {
    const hasDuplicateSlug = (slugCounts.get(r.slug)?.length ?? 0) > 1;
    const uniqueSlug = hasDuplicateSlug ? `${r.slug}-${r.ma_dvhc}` : r.slug;

    return {
      maDvhc: r.ma_dvhc,
      maCapTren: r.ma_cap_tren,
      tenCapTren: r.ten_cap_tren,
      loaiCapTren: r.loai_cap_tren,
      capHanhChinh: r.cap_hanh_chinh,
      ten: r.ten,
      loai: r.loai,
      tenDayDu: r.ten_day_du,
      tenKhongDau: r.ten_khong_dau,
      slug: r.slug,
      uniqueSlug,
      diaChiChuan: r.dia_chi_chuan,
      maQuocGia: r.ma_quoc_gia,
      maBuuChinhThamKhao: r.ma_buu_chinh_tham_khao,
      websiteUbnd: r.website_ubnd,
      trangThai: r.trang_thai,
      mocRaSoat: r.moc_ra_soat,
      tuNgayLoaiHienHanh: toNullableString(r.tu_ngay_loai_hien_hanh),
      tuNgayCapTrenHienHanh: r.tu_ngay_cap_tren_hien_hanh,
      chuyenXaLenPhuong2026: r.chuyen_xa_len_phuong_2026 === "true",
      canCuSapXep2025: r.can_cu_sap_xep_2025,
      canCuThanhLapPhuong2026: toNullableString(r.can_cu_thanh_lap_phuong_2026),
      canCuCapTren: r.can_cu_cap_tren,
      dienTichKm2DeAn2026: toNullableNumber(r.dien_tich_km2_de_an_2026),
      danSoDeAn2026: toNullableNumber(r.dan_so_de_an_2026),
      matDoDeAnNguoiKm2: toNullableNumber(r.mat_do_de_an_nguoi_km2),
      trangThaiSoLieu: r.trang_thai_so_lieu,
      viDoWgs84: toNullableNumber(r.vi_do_wgs84),
      kinhDoWgs84: toNullableNumber(r.kinh_do_wgs84),
      geometryWkt: toNullableString(r.geometry_wkt),
      crsGeometry: toNullableString(r.crs_geometry),
      trangThaiGis: r.trang_thai_gis,
      trangThaiDieuChinhDiaGioi: r.trang_thai_dieu_chinh_dia_gioi,
      ghiChu: toNullableString(r.ghi_chu),
      dienTichHienTrangTheoToTrinh112026: toNullableNumber(r.dien_tich_hien_trang_theo_to_trinh_11_2026),
      danSoTheoToTrinh112026: toNullableNumber(r.dan_so_theo_to_trinh_11_2026),
      dienTichDeXuatKm2: toNullableNumber(r.dien_tich_de_xuat_km2),
      nguonMaDvhc: r.nguon_ma_dvhc,
      nguonSapXep2025: r.nguon_sap_xep_2025,
      nguonPhapLy2026: r.nguon_phap_ly_2026,
      nguonDanhMucHienHanh: r.nguon_danh_muc_hien_hanh,
      nguonDienTichDanSo: r.nguon_dien_tich_dan_so,
      nguonBuuChinhThamKhao: r.nguon_buu_chinh_tham_khao,
      nguonDieuChinh: toNullableString(r.nguon_dieu_chinh),
    };
  });

  const upgradedCodes = units.filter((u) => u.chuyenXaLenPhuong2026).map((u) => u.maDvhc);
  const pendingAdjustmentUnits = units
    .filter((u) => u.trangThaiDieuChinhDiaGioi !== "chua_tim_thay_thay_doi_co_hieu_luc")
    .map((u) => u.maDvhc);

  const metadata: AdministrativeMetadata = {
    datasetVersion: "2026-11-25",
    mocRaSoat: "2026-11-25",
    maCapTren: "75",
    tenCapTren: "Thành phố Đồng Nai",
    loaiCapTren: "Thành phố trực thuộc trung ương",
    totalUnits: units.length,
    phuongCount: units.filter((u) => u.loai === "Phường").length,
    xaCount: units.filter((u) => u.loai === "Xã").length,
    upgradedXaToPhuong2026Count: upgradedCodes.length,
    upgradedXaToPhuong2026Codes: upgradedCodes,
    duplicateRawSlugs,
    pendingAdjustmentUnits,
    gisVerifiedCoordinatesCount: units.filter((u) => u.viDoWgs84 !== null && u.kinhDoWgs84 !== null).length,
    gisVerifiedPolygonCount: units.filter((u) => u.geometryWkt !== null).length,
    gisNotice:
      "Bộ dữ liệu địa giới hành chính 25/11/2026 hiện có trang_thai_gis = chua_xac_minh_toa_do_va_polygon (0/95 đơn vị có tọa độ WGS84 hoặc WKT polygon xác minh). Bản đồ NaiFarm chỉ sử dụng tọa độ điểm minh họa vùng sinh thái.",
    sourceFile: "data/raw/Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv",
  };

  const outDir = path.join(projectRoot, "src", "data", "geography");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "dong-nai-administrative-units.json"),
    `${JSON.stringify(units, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(outDir, "administrative-metadata.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `IMPORTED_ADMIN_DATA total=${metadata.totalUnits} phuong=${metadata.phuongCount} xa=${metadata.xaCount} upgraded2026=${metadata.upgradedXaToPhuong2026Count} duplicateSlugs=${JSON.stringify(metadata.duplicateRawSlugs)}`,
  );
}

main();
