import { INITIAL_FARMS } from "./farms";
import type {
  MissionStatus,
  SupportRequest,
  VolunteerHourRecord,
  VolunteerMission,
} from "@/types/naifarm";

const GOLDEN_MISSIONS: VolunteerMission[] = [
  {
    id: "NF-MIS-01",
    title: "Số hóa 5 sản phẩm vườn Ba Tư & hướng dẫn đăng bán 3 bước",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    administrativeUnitCode: "26080",
    location: "Phường Long Khánh, Thành phố Đồng Nai",
    mode: "Trực tiếp tại vườn",
    skillTag: "Chụp ảnh & AI đăng bán",
    assigneeName: "Minh Anh",
    expectedHours: 2,
    submittedHours: 2,
    approvedHours: 0,
    dueDate: "24/11/2026",
    deliverableSummary:
      "5 hồ sơ sản phẩm (35.000–120.000 đ/kg), ảnh thực tế, mã lô NF-DEMO-001 và hướng dẫn chú Ba Tư tự thao tác.",
    evidenceNote:
      "Đã cùng Tuấn đến vườn Ba Tư chụp ảnh 5 sản phẩm chôm chôm – sầu riêng, tạo mã lô NF-DEMO-001 và hướng dẫn chú thử bước ghi âm đăng bán.",
    evidenceImage: "/images/stitch/stitch-32.jpg",
    status: "submitted",
    isDemo: true,
  },
  {
    id: "NF-MIS-02",
    title: "Cân kiểm tra, dán tem QR & ghi hình nhật ký bưởi Tân Triều",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    administrativeUnitCode: "26188",
    location: "Phường Tân Triều, Thành phố Đồng Nai",
    mode: "Trực tiếp tại vườn",
    skillTag: "Thiết lập QR & Nhật ký",
    assigneeName: "Nguyễn Văn An",
    expectedHours: 3,
    submittedHours: 3,
    approvedHours: 3,
    dueDate: "23/11/2026",
    deliverableSummary: "Dán tem QR cho 20 thùng bưởi lô NF-TT-2026-01 và cập nhật 3 mốc nhật ký tại liếp.",
    evidenceNote: "Đã hoàn thành dán tem và kiểm tra quét QR mở đúng hộ chiếu lô.",
    evidenceImage: "/images/stitch/stitch-31.jpg",
    status: "coordinator_approved",
    isDemo: true,
  },
  {
    id: "NF-MIS-03",
    title: "Biên tập mô tả sản phẩm & lịch livestream cho HTX Xuân Lộc",
    farmId: "farm-htx-xuan-loc",
    farmName: "HTX Nông nghiệp Xuân Lộc",
    administrativeUnitCode: "26425",
    location: "Hỗ trợ từ xa (Online) · Phường Xuân Lộc",
    mode: "Hỗ trợ từ xa (Online)",
    skillTag: "Livestream bán hàng",
    expectedHours: 2,
    submittedHours: 0,
    approvedHours: 0,
    dueDate: "28/11/2026",
    deliverableSummary:
      "Soạn kịch bản phiên live giới thiệu hạt điều rang củi & gắn thẻ sản phẩm vào phòng Live.",
    status: "open",
    isDemo: true,
  },
];

const SKILL_TAGS: VolunteerMission["skillTag"][] = [
  "Chụp ảnh & AI đăng bán",
  "Thiết lập QR & Nhật ký",
  "Livestream bán hàng",
];

const VOLUNTEER_NAMES = [
  "Minh Anh",
  "Tuấn",
  "Nguyễn Văn An",
  "Hương Giang",
  "Khánh Linh",
  "Hùng Dũng",
  "Lan Phương",
  "Thế Bảo",
];

const EXTRA_STATUSES: MissionStatus[] = [
  "open",
  "open",
  "assigned",
  "submitted",
  "farm_accepted",
  "coordinator_approved",
  "revision_requested",
];

const EXTRA_MISSIONS: VolunteerMission[] = Array.from({ length: 37 }, (_, idx) => {
  const num = idx + 4;
  const missionId = `NF-MIS-${String(num).padStart(2, "0")}`;
  const farm = INITIAL_FARMS[idx % INITIAL_FARMS.length];
  const skillTag = SKILL_TAGS[idx % SKILL_TAGS.length];
  const status = EXTRA_STATUSES[idx % EXTRA_STATUSES.length];
  const online = idx % 3 === 1;
  const assigneeName = status === "open" ? undefined : VOLUNTEER_NAMES[idx % VOLUNTEER_NAMES.length];
  const expectedHours = 2 + (idx % 3);
  const submittedHours =
    status === "submitted" || status === "farm_accepted" || status === "coordinator_approved" || status === "revision_requested"
      ? expectedHours
      : 0;
  const approvedHours = status === "coordinator_approved" ? expectedHours : 0;

  return {
    id: missionId,
    title: `${skillTag} — ${farm.name} (${farm.administrativeUnitName})`,
    farmId: farm.id,
    farmName: farm.name,
    administrativeUnitCode: farm.administrativeUnitCode,
    location: online ? `Hỗ trợ từ xa (Online) · ${farm.administrativeUnitName}` : `${farm.administrativeUnitName}, Thành phố Đồng Nai`,
    mode: online ? "Hỗ trợ từ xa (Online)" : "Trực tiếp tại vườn",
    skillTag,
    assigneeName,
    expectedHours,
    submittedHours,
    approvedHours,
    dueDate: `${String(20 + (idx % 10)).padStart(2, "0")}/11/2026`,
    deliverableSummary: `Hỗ trợ ${farm.name} chuẩn hóa ảnh sản phẩm, nhật ký mùa vụ và tem QR đồng bộ tại ${farm.administrativeUnitName}.`,
    evidenceNote:
      submittedHours > 0
        ? `Hoàn thành minh chứng hỗ trợ ${farm.name} và gửi ảnh kiểm tra quy trình.`
        : undefined,
    evidenceImage: submittedHours > 0 ? "/images/stitch/stitch-32.jpg" : undefined,
    revisionReason:
      status === "revision_requested"
        ? "Cần bổ sung ảnh chụp tem QR thực tế gắn trên giỏ sản phẩm."
        : undefined,
    status,
    isDemo: true,
  };
});

export const INITIAL_MISSIONS: VolunteerMission[] = [...GOLDEN_MISSIONS, ...EXTRA_MISSIONS];

// 120 VolunteerHourRecords across 40 missions for Youth Impact Pass analytics
export const INITIAL_VOLUNTEER_HOURS: VolunteerHourRecord[] = Array.from({ length: 120 }, (_, idx) => {
  const mission = INITIAL_MISSIONS[idx % INITIAL_MISSIONS.length];
  const statuses: VolunteerHourRecord["status"][] = [
    "approved",
    "approved",
    "pending_coordinator",
    "pending_farmer",
    "revision",
  ];
  const st = statuses[idx % statuses.length];
  return {
    id: `HR-${String(idx + 1).padStart(3, "0")}`,
    missionId: mission.id,
    volunteerName: mission.assigneeName ?? VOLUNTEER_NAMES[idx % VOLUNTEER_NAMES.length],
    farmId: mission.farmId,
    farmName: mission.farmName,
    hours: 1 + (idx % 3),
    status: st,
    recordedDate: `${String(5 + (idx % 20)).padStart(2, "0")}/11/2026`,
    note: `Phiên hỗ trợ ${mission.skillTag.toLowerCase()} cho ${mission.farmName}.`,
  };
});

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "REQ-DEMO-01",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    title: "Cần hỗ trợ chụp ảnh & chạy thử phiên Live cuối tuần",
    needType: "Chụp ảnh sản phẩm & Livestream tại vườn",
    preferredTime: "Sáng Thứ Bảy 28/11/2026 (08:30)",
    locationMode: "Tại vườn",
    note: "Chú Ba Tư muốn hai bạn Minh Anh và Tuấn qua vườn hỗ trợ quay đoạn cắt chôm chôm đầu buổi sáng.",
    status: "Chờ điều phối phân công",
    createdAtLabel: "24/11/2026 · 08:45",
  },
  ...INITIAL_FARMS.slice(2, 11).map((farm, idx) => ({
    id: `REQ-DEMO-${String(idx + 2).padStart(2, "0")}`,
    farmId: farm.id,
    farmName: farm.name,
    title: `Hỗ trợ cập nhật tem QR & mô tả mùa vụ — ${farm.administrativeUnitName}`,
    needType: idx % 2 === 0 ? "Thiết lập QR & Nhật ký" : "Chụp ảnh & AI đăng bán",
    preferredTime: `${String(25 + (idx % 5)).padStart(2, "0")}/11/2026 · 09:00`,
    locationMode: (idx % 2 === 0 ? "Tại vườn" : "Online") as "Tại vườn" | "Online",
    note: `Chủ vườn đề nghị điều phối TNV hỗ trợ rà soát thông tin lô hàng mới tại ${farm.administrativeUnitName}.`,
    status: (idx % 3 === 0 ? "Đã tạo nhiệm vụ" : "Chờ điều phối phân công") as
      | "Chờ điều phối phân công"
      | "Đã tạo nhiệm vụ",
    createdAtLabel: "24/11/2026 · 10:15",
  })),
];
