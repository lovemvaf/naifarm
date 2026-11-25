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
    statusLabel: "HTX đã đối chiếu nội bộ",
    standardType: "OCOP",
    prefix: "MAU-OCOP",
    starLevelLabel: "Hồ sơ mẫu tham khảo — không phải chứng nhận pháp lý",
  },
  {
    status: "vietgap_declared_demo",
    statusLabel: "Tự khai quy trình VietGAP",
    standardType: "VietGAP",
    prefix: "MAU-VG",
  },
  {
    status: "ocop_declared_demo",
    statusLabel: "Hồ sơ tự khai OCOP",
    standardType: "OCOP",
    prefix: "MAU-OCOP",
    starLevelLabel: "Hồ sơ mẫu chờ đánh giá phân hạng",
  },
  {
    status: "pending_review",
    statusLabel: "Đang chờ đối chiếu hồ sơ",
    standardType: "Mã số vùng trồng",
    prefix: "MAU-MSVT",
  },
  {
    status: "needs_revision",
    statusLabel: "Cần bổ sung chứng từ",
    standardType: "ATTP cơ sở",
    prefix: "MAU-ATTP",
  },
  {
    status: "expired_demo",
    statusLabel: "Hồ sơ mẫu đã hết hạn",
    standardType: "VietGAP",
    prefix: "MAU-VG",
  },
  {
    status: "unverified",
    statusLabel: "Chưa đối chiếu hồ sơ",
    standardType: "Mã số vùng trồng",
    prefix: "MAU-MSVT",
  },
];

export const INITIAL_CERTIFICATIONS: FarmCertification[] = INITIAL_FARMS.map((farm, index) => {
  let pick = STATUS_DETAILS[index % STATUS_DETAILS.length];
  if (farm.id === "farm-ba-minh-tan-trieu") {
    pick = STATUS_DETAILS[0];
  } else if (farm.id === "farm-ba-tu-demo") {
    pick = STATUS_DETAILS[1];
  } else if (farm.id === "farm-co-tu-cam-my") {
    pick = STATUS_DETAILS[3];
  } else if (farm.id === "farm-htx-xuan-loc") {
    pick = STATUS_DETAILS[0];
  } else if (index === 8) {
    pick = STATUS_DETAILS[4];
  } else if (index === 13) {
    pick = STATUS_DETAILS[5];
  } else if (index === 16) {
    pick = STATUS_DETAILS[6];
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
    scopeSummary: `Hồ sơ mẫu áp dụng cho nhóm nông sản: ${farm.mainCrops.slice(0, 2).join(", ")} tại ${farm.administrativeUnitName} (${farm.areaHa} ha).`,
    issuerLabel:
      pick.status === "coop_checked_demo"
        ? "HTX & Điều phối viên đối chiếu nội bộ (Hồ sơ mẫu)"
        : "Nhà vườn & Thanh niên hỗ trợ ghi nhận (Hồ sơ mẫu)",
    issuedDateDemo: isExpired ? "15/05/2024" : "10/08/2026",
    validUntilDemo: isExpired ? "15/05/2026 (Hết hạn)" : "10/08/2028",
    qrBatchCode:
      farm.id === "farm-ba-tu-demo"
        ? "NF-DEMO-001"
        : farm.id === "farm-ba-minh-tan-trieu"
        ? "NF-TT-2026-01"
        : farm.id === "farm-htx-xuan-loc"
        ? "NF-XL-2026-03"
        : `NF-DN-${codeNumber}`,
    disclaimer: "Hồ sơ mẫu trong không gian trải nghiệm — không có giá trị chứng nhận pháp lý.",
    isDemo: true,
  };
});
