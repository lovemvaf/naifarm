import type { AdminGrant, OrganizationKind, WorkspaceId } from "@/types/naifarm";

export interface CapabilityDefinition {
  key: string;
  label: string;
  description: string;
  allowedWorkspaces: WorkspaceId[];
  allowedOrgKinds?: OrganizationKind[];
  makerCheckerRequired?: boolean;
}

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    key: "catalog.browse",
    label: "Xem & tìm kiếm nông sản, truy xuất QR",
    description: "Xem giá bán, tồn khả dụng và hồ sơ truy xuất công khai.",
    allowedWorkspaces: ["W01", "W02", "W03", "W04", "W05", "W06"],
  },
  {
    key: "commerce.checkout",
    label: "Đặt hàng & theo dõi đơn",
    description: "Tạo đơn tách theo nhà vườn, gửi đánh giá khi đơn hoàn thành.",
    allowedWorkspaces: ["W01", "W05"],
  },
  {
    key: "farm.publish_sku",
    label: "Đăng bán & quản lý mùa vụ nhà vườn",
    description: "Đăng SKU 3 bước, bật/tắt trạng thái bán, ghi nhật ký mùa vụ.",
    allowedWorkspaces: ["W02", "W05", "W06"],
    allowedOrgKinds: ["coop"],
  },
  {
    key: "inventory.adjust",
    label: "Điều chỉnh kho & nhập/xuất lô (có lý do bắt buộc)",
    description: "Ghi sổ kho theo mã lô, tách tồn khả dụng/đặt giữ/cách ly.",
    allowedWorkspaces: ["W02", "W05", "W06"],
    allowedOrgKinds: ["coop", "logistics"],
  },
  {
    key: "refund.approve",
    label: "Phê duyệt hoàn tiền & chi trả xã viên",
    description: "Bắt buộc tách quyền Maker (lập đề xuất) khác Checker (duyệt chi).",
    allowedWorkspaces: ["W02", "W05", "W06"],
    allowedOrgKinds: ["coop"],
    makerCheckerRequired: true,
  },
  {
    key: "volunteer.approve_hours",
    label: "Duyệt giờ công tình nguyện 2 lớp",
    description: "Yêu cầu chủ vườn W02 xác nhận trước khi Điều phối W04 duyệt (không tự duyệt).",
    allowedWorkspaces: ["W04", "W06"],
    makerCheckerRequired: true,
  },
  {
    key: "quality.verify_or_recall",
    label: "Đối chiếu hồ sơ chất lượng & Tạm giữ/Thu hồi lô",
    description: "Cập nhật trạng thái 26 chuẩn, khóa bán lô có vấn đề và phân tích phả hệ.",
    allowedWorkspaces: ["W04", "W05", "W06"],
    allowedOrgKinds: ["authority", "coop", "mentor"],
  },
  {
    key: "school.grade_minor",
    label: "Chấm điểm học sinh & kiểm soát đồng thuận phụ huynh",
    description: "Chặn công bố/chấm hoạt động ngoại khóa nếu học sinh dưới 18 tuổi thiếu giấy đồng thuận.",
    allowedWorkspaces: ["W05", "W06"],
    allowedOrgKinds: ["school"],
  },
  {
    key: "admin.grants_and_gis",
    label: "Cấp/thu hồi quyền phạm vi & quản trị dữ liệu GIS",
    description: "Mọi thay đổi quyền bắt buộc ghi lý do và lưu bản ghi Trước/Sau.",
    allowedWorkspaces: ["W06"],
  },
  {
    key: "campaign.create",
    label: "Soạn & lên lịch chiến dịch / ưu đãi",
    description: "Tạo bản nháp chiến dịch, gửi duyệt (Maker không tự duyệt phát hành).",
    allowedWorkspaces: ["W02", "W04", "W05"],
  },
  {
    key: "campaign.approve",
    label: "Phê duyệt phát hành chiến dịch & ưu đãi",
    description: "Kiểm tra ngân sách, quy tắc tồn và tính trung thực nội dung VI/EN trước giờ mở.",
    allowedWorkspaces: ["W04", "W06"],
    makerCheckerRequired: true,
  },
  {
    key: "calendar.manage",
    label: "Quản lý sự kiện nội bộ trong NaiCalendar",
    description: "Tạo/sửa lịch công việc theo phạm vi; mốc ngày lễ chính thức luôn khóa chỉ đọc.",
    allowedWorkspaces: ["W02", "W03", "W04", "W05", "W06"],
  },
  {
    key: "experience.manage",
    label: "Mở ca trải nghiệm vườn & xác nhận check-in",
    description: "Quản lý sức chứa ca, an toàn dị ứng và phản hồi yêu cầu tham quan.",
    allowedWorkspaces: ["W02", "W05"],
  },
  {
    key: "learning.grade",
    label: "Chấm điểm bài tập & duyệt rubric lớp học",
    description: "Chỉ dành cho giáo viên/cố vấn được giao lớp; không tính chồng sang giờ tình nguyện.",
    allowedWorkspaces: ["W05"],
    allowedOrgKinds: ["school", "mentor"],
    makerCheckerRequired: true,
  },
  {
    key: "report.export",
    label: "Xuất báo cáo CSV & In đối chiếu theo phạm vi",
    description: "Chỉ xuất các dòng đang hiển thị theo đúng quyền tổ chức/kỳ.",
    allowedWorkspaces: ["W02", "W04", "W05", "W06"],
  },
];

export interface MinorSafeguardCheck {
  allowPublicCommerce: boolean;
  allowPublicChat: boolean;
  allowAlcoholCatalog: boolean;
  allowFieldTripSubmission: boolean;
  reasonVi?: string;
  reasonEn?: string;
}

export function evaluateMinorSafeguarding(
  isMinor: boolean | undefined,
  hasGuardianConsent: boolean | undefined,
): MinorSafeguardCheck {
  if (!isMinor) {
    return {
      allowPublicCommerce: true,
      allowPublicChat: true,
      allowAlcoholCatalog: true,
      allowFieldTripSubmission: true,
    };
  }
  return {
    allowPublicCommerce: false,
    allowPublicChat: false,
    allowAlcoholCatalog: false,
    allowFieldTripSubmission: Boolean(hasGuardianConsent),
    reasonVi: hasGuardianConsent
      ? "Chế độ học sinh có đồng thuận phụ huynh: ẩn đồ uống có cồn, giao dịch mua bán độc lập và chat công khai."
      : "Chưa có xác nhận đồng thuận phụ huynh: tạm khóa nộp hoạt động ngoại khóa thực địa.",
    reasonEn: hasGuardianConsent
      ? "Supervised minor account (consent verified): public commerce, adult items, and stranger chat disabled."
      : "Pending guardian consent: external field trips and submissions are blocked.",
  };
}

export function evaluateCapability(
  workspaceId: WorkspaceId,
  orgKind: OrganizationKind | undefined,
  capabilityKey: string,
  adminGrants: AdminGrant[] = [],
  refDateIso = "2026-11-25",
): { allowed: boolean; reason: string } {
  const def = CAPABILITY_DEFINITIONS.find((c) => c.key === capabilityKey);
  if (!def) {
    return { allowed: false, reason: "Không tìm thấy định nghĩa quyền truy cập." };
  }

  // Check active temporary admin grant override if explicitly matched
  const matchingGrant = adminGrants.find(
    (g) =>
      g.active &&
      g.workspaceScope === workspaceId &&
      g.capability.toLowerCase().includes(capabilityKey.split(".")[0]) &&
      g.expiresAt >= refDateIso,
  );

  if (matchingGrant) {
    return {
      allowed: true,
      reason: `Được cấp quyền hiệu lực (${matchingGrant.unitScope}) đến ${matchingGrant.expiresAt}.`,
    };
  }

  if (!def.allowedWorkspaces.includes(workspaceId)) {
    return {
      allowed: false,
      reason: `Vai trò ${workspaceId} không có quyền "${def.label}".`,
    };
  }

  if (workspaceId === "W05" && def.allowedOrgKinds && orgKind && !def.allowedOrgKinds.includes(orgKind)) {
    return {
      allowed: false,
      reason: `Loại hình tổ chức "${orgKind}" hiện tại không bật tác vụ "${def.label}".`,
    };
  }

  return {
    allowed: true,
    reason: def.makerCheckerRequired
      ? "Hợp lệ — áp dụng quy tắc phê duyệt độc lập (Maker ≠ Checker)."
      : "Được phép trong phạm vi vai trò hiện tại.",
  };
}

export function checkMakerChecker(
  makerName: string | undefined,
  checkerName: string | undefined,
): { allowed: boolean; reason?: string } {
  const m = (makerName ?? "").trim().toLowerCase();
  const c = (checkerName ?? "").trim().toLowerCase();
  if (!c) {
    return { allowed: false, reason: "Thiếu danh tính người duyệt (Checker)." };
  }
  if (m && (m === c || m.includes(c) || c.includes(m))) {
    return {
      allowed: false,
      reason: "Vi phạm quy tắc tách quyền Maker–Checker: người lập yêu cầu không được tự phê duyệt.",
    };
  }
  return { allowed: true };
}

export function hasMinorConsent(
  isMinor: boolean,
  hasGuardianConsent: boolean,
): { allowed: boolean; reason?: string } {
  if (isMinor && !hasGuardianConsent) {
    return {
      allowed: false,
      reason: "Tài khoản học sinh dưới 18 tuổi chưa có xác nhận đồng thuận của phụ huynh/người giám hộ.",
    };
  }
  return { allowed: true };
}

export function detectConflictOrExpiry(
  grant: AdminGrant,
  refDateIso = "2026-11-25",
): { hasIssue: boolean; statusText: string } {
  if (!grant.active) {
    return { hasIssue: true, statusText: "Đã tạm thu hồi" };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(grant.expiresAt) && grant.expiresAt < refDateIso) {
    return { hasIssue: true, statusText: `Quá hạn (${grant.expiresAt}) — cần gia hạn hoặc thu hồi` };
  }
  return { hasIssue: false, statusText: `Hiệu lực đến ${grant.expiresAt}` };
}
