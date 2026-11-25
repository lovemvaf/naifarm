import { INITIAL_FARMS } from "./farms";
import type { DiaryEntry, ProductionSeason } from "@/types/naifarm";

const STAGES: DiaryEntry["stage"][] = [
  "Làm đất & Tỉa cành",
  "Bón phân hữu cơ",
  "Kiểm soát sinh học",
  "Tưới & Chăm sóc",
  "Đo độ Brix & Khảo sát",
  "Thu hoạch & Đóng gói",
];

const PHOTOS = [
  "/images/stitch/stitch-19.jpg",
  "/images/stitch/stitch-40.jpg",
  "/images/stitch/stitch-28.jpg",
  "/images/stitch/stitch-26.jpg",
  "/images/stitch/stitch-32.jpg",
  "/images/stitch/stitch-27.jpg",
  "/images/stitch/stitch-50.jpg",
  "/images/stitch/stitch-30.jpg",
];

export const INITIAL_SEASONS: ProductionSeason[] = [
  ...INITIAL_FARMS.map((farm, index) => {
    const num = String(index + 1).padStart(2, "0");
    const defaultBatch =
      farm.id === "farm-ba-minh-tan-trieu"
        ? "NF-TT-2026-01"
        : farm.id === "farm-ba-tu-demo"
        ? "NF-DEMO-001"
        : farm.id === "farm-htx-xuan-loc"
        ? "NF-XL-2026-03"
        : `NF-DN-${String(index + 1).padStart(3, "0")}`;

    const statuses: ProductionSeason["status"][] = [
      "đang thu hoạch",
      "đang thu hoạch",
      "sắp thu hoạch",
      "đang chăm sóc",
      "đang thu hoạch",
      "đã kết thúc",
    ];

    return {
      id: `SEASON-${num}`,
      farmId: farm.id,
      farmName: farm.name,
      administrativeUnitCode: farm.administrativeUnitCode,
      administrativeUnitName: farm.administrativeUnitName,
      cropName: farm.mainCrops[0] ?? "Nông sản địa phương",
      variety: farm.mainCrops[1] ?? farm.mainCrops[0] ?? "Giống tuyển chọn",
      seasonName: `Vụ Thu Đông 2026 · ${farm.name}`,
      startDate: "05/08/2026",
      expectedHarvestDate: "28/11/2026",
      areaHa: farm.areaHa,
      growingZoneCode: farm.growingZoneCode ?? `DEMO-MSVT-${farm.administrativeUnitCode}-01`,
      status: statuses[index % statuses.length],
      summary: `Theo dõi toàn bộ quy trình chăm sóc, kiểm soát sinh học và thu hoạch ${farm.mainCrops[0]} tại ${farm.administrativeUnitName}.`,
      batchCodes: [defaultBatch],
      isDemo: true as const,
    };
  }),
  // 6 additional winter-spring 2027 pre-season cycles = 30 ProductionSeasons total
  ...INITIAL_FARMS.slice(0, 6).map((farm, index) => {
    const num = String(25 + index).padStart(2, "0");
    return {
      id: `SEASON-${num}`,
      farmId: farm.id,
      farmName: farm.name,
      administrativeUnitCode: farm.administrativeUnitCode,
      administrativeUnitName: farm.administrativeUnitName,
      cropName: farm.mainCrops[0] ?? "Nông sản địa phương",
      variety: "Lứa đón vụ Tết 2027",
      seasonName: `Vụ Đông Xuân 2026–2027 · ${farm.name}`,
      startDate: "10/11/2026",
      expectedHarvestDate: "20/01/2027",
      areaHa: Number((farm.areaHa * 0.6).toFixed(1)),
      growingZoneCode: farm.growingZoneCode ?? `DEMO-MSVT-${farm.administrativeUnitCode}-02`,
      status: "đang chăm sóc" as const,
      summary: `Chuẩn bị lứa trái vụ Đông Xuân phục vụ giỏ quà Tết Thanh niên tại ${farm.administrativeUnitName}.`,
      batchCodes: [`NF-DN-${String(25 + index).padStart(3, "0")}`],
      isDemo: true as const,
    };
  }),
];

const BUILT_DIARIES: DiaryEntry[] = [];
let seq = 1;

// Generate 11 detailed diary entries per first 24 seasons + 8 per remaining 6 = 312 DiaryEntries total
for (const season of INITIAL_SEASONS) {
  const count = Number(season.id.replace("SEASON-", "")) <= 24 ? 11 : 8;
  for (let step = 0; step < count; step += 1) {
    const id = `DIARY-${String(seq).padStart(3, "0")}`;
    seq += 1;
    const stage = STAGES[step % STAGES.length];
    const day = String(1 + ((step * 3) % 27)).padStart(2, "0");
    const month = step < 5 ? "09" : step < 9 ? "10" : "11";
    const batchCode = season.batchCodes[0] ?? "NF-DEMO-001";
    const sourceDeclaration: DiaryEntry["sourceDeclaration"] =
      step % 3 === 0
        ? "Nhà vườn tự khai"
        : step % 3 === 1
        ? "Thanh niên hỗ trợ ghi nhận"
        : "HTX đối chiếu (Demo)";

    BUILT_DIARIES.push({
      id,
      seasonId: season.id,
      batchCode,
      farmId: season.farmId,
      farmName: season.farmName,
      dateLabel: `${day}/${month}/2026 · ${String(6 + (step % 4)).padStart(2, "0")}:${step % 2 === 0 ? "15" : "45"}`,
      stage,
      title: `${stage} — ${season.cropName} (${season.administrativeUnitName})`,
      detail: `Ghi nhận ${stage.toLowerCase()} cho khu vườn ${season.areaHa} ha. Tuân thủ thời gian cách ly hữu cơ và lưu ảnh đối chiếu theo mã lô ${batchCode}.`,
      actorName:
        sourceDeclaration === "Thanh niên hỗ trợ ghi nhận"
          ? "Đoàn viên TNV & Chủ vườn"
          : sourceDeclaration === "HTX đối chiếu (Demo)"
          ? "Ban Kiểm tra HTX (Demo)"
          : season.farmName,
      sourceDeclaration,
      photo: PHOTOS[(step + seq) % PHOTOS.length],
      isDemo: true,
    });
  }
}

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = BUILT_DIARIES;
