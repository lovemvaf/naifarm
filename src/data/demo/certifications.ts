import type { CertificationStatus, FarmCertification } from "@/types/naifarm";
import { INITIAL_FARMS } from "./farms";

const STATUS_DETAILS: {
  status: CertificationStatus;
  statusLabel: string;
  standardType: FarmCertification["standardType"];
  prefix: string;
  starLevelLabel?: string;
}[] = [
  {
    status: "coop_checked_demo",
    statusLabel: "HTX đã đối chiếu nội bộ (Demo)",
    standardType: "OCOP",
    prefix: "DEMO-OCOP",
    starLevelLabel: "Gợi ý phân hạng 3–4 sao (Mẫu tham khảo — không phải chứng nhận pháp lý)",
  },
  {
    status: "vietgap_declared_demo",
    statusLabel: "Tự khai VietGAP (Demo)",
    standardType: "VietGAP",
    prefix: "DEMO-VG",
  },
  {
    status: "ocop_declared_demo",
    statusLabel: "Tự khai OCOP (Demo)",
    standardType: "OCOP",
    prefix: "DEMO-OCOP",
    starLevelLabel: "Hồ sơ tự khai chờ đánh giá phân hạng (Mẫu Demo)",
  },
  {
    status: "pending_review",
    statusLabel: "Đang chờ đối chiếu hồ sơ (Demo)",
    standardType: "Mã số vùng trồng",
    prefix: "DEMO-MSVT",
  },
  {
    status: "needs_revision",
    statusLabel: "Cần bổ sung chứng từ (Demo)",
    standardType: "ATTP cơ sở",
    prefix: "DEMO-ATTP",
  },
  {
    status: "expired_demo",
    statusLabel: "Hồ sơ mẫu đã hết hạn (Demo)",
    standardType: "VietGAP",
    prefix: "DEMO-VG",
  },
  {
    status: "unverified",
    statusLabel: "Chưa có chứng nhận chính thức",
    standardType: "Mã số vùng trồng",
    prefix: "DEMO-MSVT",
  },
];

export const INITIAL_CERTIFICATIONS: FarmCertification[] = INITIAL_FARMS.map((farm, index) => {
  // Preserve specific authentic statuses for Golden & key farms
  let pick = STATUS_DETAILS[index % STATUS_DETAILS.length];
  if (farm.id === "farm-ba-minh-tan-trieu") {
    pick = STATUS_DETAILS[0]; // coop_checked_demo OCOP demo
  } else if (farm.id === "farm-ba-tu-demo") {
    pick = STATUS_DETAILS[1]; // vietgap_declared_demo for Ba Tư
  } else if (farm.id === "farm-co-tu-cam-my") {
    pick = STATUS_DETAILS[3]; // pending_review
  } else if (farm.id === "farm-htx-xuan-loc") {
    pick = STATUS_DETAILS[0];
  } else if (index === 8) {
    pick = STATUS_DETAILS[4]; // needs_revision
  } else if (index === 13) {
    pick = STATUS_DETAILS[5]; // expired_demo
  } else if (index === 16) {
    pick = STATUS_DETAILS[6]; // unverified
  }

  const codeNumber = String(index + 1).padStart(3, "0");
  const certificateCode = `${pick.prefix}-${codeNumber}`;
  const isExpired = pick.status === "expired_demo";

  return {
    id: `CERT-${codeNumber}`,
    farmId: farm.id,
    farmName: farm.name,
    administrativeUnitCode: farm.administrativeUnitCode,
    administrativeUnitName: farm.administrativeUnitName,
    standardType: pick.standardType,
    certificateCode,
    starLevelLabel: pick.starLevelLabel,
    status: pick.status,
    statusLabel: pick.statusLabel,
    scopeSummary: `Áp dụng minh họa cho nhóm nông sản: ${farm.mainCrops.slice(0, 2).join(", ")} tại ${farm.administrativeUnitName} (${farm.areaHa} ha).`,
    issuerLabel:
      pick.status === "coop_checked_demo"
        ? "HTX & Điều phối viên đối chiếu nội bộ (Dữ liệu mô phỏng)"
        : "Nhà vườn & Thanh niên hỗ trợ ghi nhận (Tự khai Demo)",
    issuedDateDemo: isExpired ? "15/05/2024" : "10/08/2026",
    validUntilDemo: isExpired ? "15/05/2026 (Hết hạn mẫu)" : "10/08/2028",
    qrBatchCode:
      farm.id === "farm-ba-tu-demo"
        ? "NF-DEMO-001"
        : farm.id === "farm-ba-minh-tan-trieu"
        ? "NF-TT-2026-01"
        : farm.id === "farm-htx-xuan-loc"
        ? "NF-XL-2026-03"
        : `NF-DN-${codeNumber}`,
    disclaimer: "Hồ sơ chứng nhận minh họa — không có giá trị chứng nhận pháp lý.",
    isDemo: true,
  };
});
