export type AdministrativeUnitType = "Phường" | "Xã";

export interface DongNaiAdministrativeUnit {
  maDvhc: string;
  maCapTren: string;
  tenCapTren: string;
  loaiCapTren: string;
  capHanhChinh: number;
  ten: string;
  loai: AdministrativeUnitType;
  tenDayDu: string;
  tenKhongDau: string;
  slug: string;
  uniqueSlug: string;
  diaChiChuan: string;
  maQuocGia: string;
  maBuuChinhThamKhao: string;
  websiteUbnd: string;
  trangThai: "active" | string;
  mocRaSoat: string;
  tuNgayLoaiHienHanh: string | null;
  tuNgayCapTrenHienHanh: string;
  chuyenXaLenPhuong2026: boolean;
  canCuSapXep2025: string;
  canCuThanhLapPhuong2026: string | null;
  canCuCapTren: string;
  dienTichKm2DeAn2026: number | null;
  danSoDeAn2026: number | null;
  matDoDeAnNguoiKm2: number | null;
  trangThaiSoLieu: string;
  viDoWgs84: number | null;
  kinhDoWgs84: number | null;
  geometryWkt: string | null;
  crsGeometry: string | null;
  trangThaiGis: "chua_xac_minh_toa_do_va_polygon" | string;
  trangThaiDieuChinhDiaGioi: string;
  ghiChu: string | null;
  dienTichHienTrangTheoToTrinh112026: number | null;
  danSoTheoToTrinh112026: number | null;
  dienTichDeXuatKm2: number | null;
  nguonMaDvhc: string;
  nguonSapXep2025: string;
  nguonPhapLy2026: string;
  nguonDanhMucHienHanh: string;
  nguonDienTichDanSo: string;
  nguonBuuChinhThamKhao: string;
  nguonDieuChinh: string | null;
}

export interface AdministrativeMetadata {
  datasetVersion: string;
  mocRaSoat: string;
  maCapTren: string;
  tenCapTren: string;
  loaiCapTren: string;
  totalUnits: number;
  phuongCount: number;
  xaCount: number;
  upgradedXaToPhuong2026Count: number;
  upgradedXaToPhuong2026Codes: string[];
  duplicateRawSlugs: Record<string, string[]>;
  pendingAdjustmentUnits: string[];
  gisVerifiedCoordinatesCount: number;
  gisVerifiedPolygonCount: number;
  gisNotice: string;
  sourceFile: string;
}

export interface HistoricalAliasEntry {
  alias: string;
  aliasNormalized: string;
  note: string;
  candidateCodes: string[];
}
