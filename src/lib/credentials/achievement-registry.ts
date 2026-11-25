/**
 * Deterministic Achievement Credential Registry & Verification Helper (V5-M06).
 * Strictly marked as non-legal youth learning & community experience certificates.
 */

export interface AchievementCredential {
  id: string;
  recipientName: string;
  titleVi: string;
  titleEn: string;
  programVi: string;
  programEn: string;
  issuedAt: string;
  hoursCompleted: number;
  scoreText: string;
  organizerVi: string;
  organizerEn: string;
  wardName: string;
  status: "valid_sample" | "revoked_sample";
  disclosureVi: string;
  disclosureEn: string;
}

export const INITIAL_ACHIEVEMENT_CREDENTIALS: AchievementCredential[] = [
  {
    id: "NF-CERT-2026-001",
    recipientName: "Minh Anh",
    titleVi: "Chứng nhận Tình nguyện viên Số & Đại sứ Nông sản Đồng Nai",
    titleEn: "NaiFarm Digital Youth Volunteer & Dong Nai Produce Ambassador",
    programVi: "Đồng hành số hóa nhà vườn Tân Triều & Long Khánh",
    programEn: "Field Digitization & Traceability Support · Long Khanh & Tan Trieu",
    issuedAt: "25/11/2026",
    hoursCompleted: 18,
    scoreText: "95/100 · Đạt chuẩn thực hành",
    organizerVi: "Không gian Trải nghiệm NaiFarm · Nhóm 8 Hackathon Đồng Nai",
    organizerEn: "NaiFarm Youth OCOP Experience · Hackathon Dong Nai",
    wardName: "Phường Long Khánh, Thành phố Đồng Nai",
    status: "valid_sample",
    disclosureVi:
      "Chứng nhận hoàn thành trải nghiệm trong ứng dụng NaiFarm — không phải văn bằng hoặc chứng chỉ pháp lý nhà nước.",
    disclosureEn:
      "In-app experience achievement record — illustrative learning/volunteer certificate, not an official academic or state credential.",
  },
  {
    id: "NF-CERT-2026-002",
    recipientName: "Bảo Ngọc",
    titleVi: "Chứng nhận Hoàn thành Chuyên đề NaiAcademy · Giải phẫu Nông sản 2D",
    titleEn: "NaiAcademy Completion Certificate · 2D Produce & Traceability",
    programVi: "Học tập 6 bước tuần tự & Quy tắc an toàn hạt điều / truy xuất QR",
    programEn: "6-Step Sequential Course · Dong Nai Crops & QR Stewardship",
    issuedAt: "25/11/2026",
    hoursCompleted: 6,
    scoreText: "100/100 · Đạt tối đa 6/6 bước",
    organizerVi: "NaiAcademy · Đồng Nai Youth OCOP Market",
    organizerEn: "NaiAcademy · Dong Nai Youth OCOP Market",
    wardName: "Phường Trấn Biên, Thành phố Đồng Nai",
    status: "valid_sample",
    disclosureVi:
      "Chứng nhận hoàn thành chuyên đề học tập nội bộ — dùng trình diễn minh bạch với mã QR đối chiếu.",
    disclosureEn:
      "Internal course completion record for demo verification — includes scannable verification QR.",
  },
  {
    id: "NF-CERT-2026-003",
    recipientName: "Ban Chủ nhiệm HTX Tân Triều",
    titleVi: "Chứng nhận Đơn vị Đồng hành Truy xuất Nguồn gốc Mùa vụ 2026",
    titleEn: "Partner Cooperative Traceability & Orchard Stewardship Recognition",
    programVi: "Triển khai nhật ký lô NF-TT-2026-01 & đối chiếu chứng từ",
    programEn: "Batch Traceability Operations (NF-TT-2026-01) & Field Support",
    issuedAt: "24/11/2026",
    hoursCompleted: 24,
    scoreText: "20 hộ thành viên tham gia",
    organizerVi: "Điều phối Cộng đồng NaiFarm",
    organizerEn: "NaiFarm Community Coordination Network",
    wardName: "Phường Tân Triều, Thành phố Đồng Nai",
    status: "valid_sample",
    disclosureVi:
      "Chứng nhận ghi nhận đóng góp trong không gian trải nghiệm NaiFarm — không thay thế quyết định khen thưởng hành chính.",
    disclosureEn:
      "Experience recognition record inside NaiFarm — does not replace official municipal or legal citations.",
  },
];

export function resolveAchievementCredential(
  id: string,
  dynamicOverride?: Partial<AchievementCredential>,
): AchievementCredential | null {
  const existing = INITIAL_ACHIEVEMENT_CREDENTIALS.find(
    (c) => c.id.toUpperCase() === id.trim().toUpperCase(),
  );
  if (existing) {
    return dynamicOverride ? { ...existing, ...dynamicOverride } : existing;
  }
  if (id.trim().toUpperCase().startsWith("NF-CERT-")) {
    return {
      ...INITIAL_ACHIEVEMENT_CREDENTIALS[0],
      id: id.trim().toUpperCase(),
      ...dynamicOverride,
    };
  }
  return null;
}
