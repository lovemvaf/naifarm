import { INITIAL_FARMS } from "./farms";
import { INITIAL_PRODUCTS } from "./products";
import type { BatchEvent, TraceBatch } from "@/types/naifarm";

const GOLDEN_BATCHES: TraceBatch[] = [
  {
    batchCode: "NF-DEMO-001",
    productId: "P01",
    productName: "Chôm chôm Java Long Khánh",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    administrativeUnitCode: "26080",
    administrativeUnitName: "Phường Long Khánh",
    region: "Phường Long Khánh, Thành phố Đồng Nai, Việt Nam",
    seasonId: "SEASON-02",
    harvestDate: "23/11/2026",
    packDate: "24/11/2026",
    declarationLevel: "Nhà vườn tự khai · Thanh niên hỗ trợ ghi nhận (Chưa xác minh OCOP chính thức)",
    docStatus: "Đang hoàn thiện hồ sơ tự khai (Demo)",
    summary:
      "Lô NF-DEMO-001 gồm 30 kg chôm chôm Java và sầu riêng thu hoạch tại Nhà vườn Ba Tư (2,5 ha). Dữ liệu nhật ký hiển thị trung thực theo nguồn khai báo nội bộ.",
    events: [
      {
        id: "ev-01",
        dateLabel: "10/11/2026 · 07:30",
        stage: "Bón phân hữu cơ",
        title: "Chăm sóc & dọn cỏ hữu cơ trước thu hoạch",
        detail: "Chú Ba Tư ghi nhận lần bón phân hữu cơ cuối vụ và làm sạch gốc liếp chôm chôm khu B (tự khai).",
        actorCategory: "Chủ vườn Ba Tư",
        sourceDeclaration: "Nhà vườn tự khai",
        photo: "/images/stitch/stitch-40.jpg",
      },
      {
        id: "ev-02",
        dateLabel: "23/11/2026 · 06:15",
        stage: "Thu hoạch & Đóng gói",
        title: "Thu hoạch 30 kg đợt đầu sáng sớm",
        detail: "Cắt chùm khi trái chuyển đỏ đều, tránh nắng gắt để giữ độ giòn và màu vỏ tươi.",
        actorCategory: "Chủ vườn Ba Tư & Đoàn viên Minh Anh",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-07.jpg",
      },
      {
        id: "ev-03",
        dateLabel: "24/11/2026 · 08:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Phân loại, đóng giỏ rơm & gắn mã QR lô NF-DEMO-001",
        detail: "Đoàn viên Tuấn hỗ trợ kiểm tra trọng lượng, chụp ảnh thực tế và dán nhãn truy xuất demo lên từng giỏ.",
        actorCategory: "Đoàn viên Tuấn & Minh Anh",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-32.jpg",
      },
    ],
    isDemo: true,
  },
  {
    batchCode: "NF-TT-2026-01",
    productId: "P06",
    productName: "Bưởi da xanh Tân Triều",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    administrativeUnitCode: "26188",
    administrativeUnitName: "Phường Tân Triều",
    region: "Phường Tân Triều, Thành phố Đồng Nai, Việt Nam",
    seasonId: "SEASON-01",
    harvestDate: "22/11/2026",
    packDate: "23/11/2026",
    declarationLevel: "Nhà vườn tự khai · HTX Tân Triều đã đối chiếu chứng từ (Demo)",
    docStatus: "Hồ sơ đã đối chiếu (Demo — không phải chứng nhận pháp lý)",
    summary:
      "Lô bưởi Tân Triều được cắt tại liếp, đo độ ngọt Brix tham khảo và đóng thùng rơm bảo vệ cuống tươi.",
    events: [
      {
        id: "ev-tt-01",
        dateLabel: "05/11/2026 · 08:00",
        stage: "Kiểm soát sinh học",
        title: "Bọc trái sinh học chống ruồi đục quả",
        detail: "Chú Ba Minh thực hiện bao trái bằng túi lưới thoáng khí tại liếp A3.",
        actorCategory: "Chủ vườn Ba Minh",
        sourceDeclaration: "Nhà vườn tự khai",
        photo: "/images/stitch/stitch-28.jpg",
      },
      {
        id: "ev-tt-02",
        dateLabel: "22/11/2026 · 06:30",
        stage: "Đo độ Brix & Khảo sát",
        title: "Thu hoạch tại liếp & kiểm tra độ ngọt Brix",
        detail: "Cắt trái đạt độ tuổi thu hoạch, độ ngọt mẫu đo tham khảo đạt 11.8° Brix.",
        actorCategory: "Chú Ba Minh & TNV Nguyễn Văn An",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-26.jpg",
      },
      {
        id: "ev-tt-03",
        dateLabel: "23/11/2026 · 09:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Cân trọng lượng, lót rơm & dán tem QR tại vườn",
        detail: "HTX Tân Triều đối chiếu chứng từ lô và bàn giao đơn vị vận chuyển mát.",
        actorCategory: "HTX Tân Triều & TNV Nguyễn Văn An",
        sourceDeclaration: "HTX đối chiếu (Demo)",
        photo: "/images/stitch/stitch-27.jpg",
      },
    ],
    isDemo: true,
  },
  {
    batchCode: "NF-XL-2026-03",
    productId: "P08",
    productName: "Hạt điều rang muối vỏ lụa Xuân Lộc",
    farmId: "farm-htx-xuan-loc",
    farmName: "HTX Nông nghiệp Xuân Lộc",
    administrativeUnitCode: "26425",
    administrativeUnitName: "Phường Xuân Lộc",
    region: "Phường Xuân Lộc, Thành phố Đồng Nai, Việt Nam",
    seasonId: "SEASON-04",
    harvestDate: "18/11/2026",
    packDate: "20/11/2026",
    declarationLevel: "HTX đối chiếu nội bộ & Nhật ký chế biến củi truyền thống (Demo)",
    docStatus: "Hồ sơ đã đối chiếu (Demo)",
    summary:
      "Mẻ hạt điều rang củi truyền thống giữ nguyên vỏ lụa giòn thơm tại Phường Xuân Lộc.",
    events: [
      {
        id: "ev-xl-01",
        dateLabel: "15/11/2026 · 09:00",
        stage: "Làm đất & Tỉa cành",
        title: "Phân loại hạt điều thô & phơi nắng 2 lượt",
        detail: "Kiểm tra độ ẩm nguyên liệu đầu vào trước khi đưa vào chảo rang.",
        actorCategory: "Tổ sơ chế HTX Xuân Lộc",
        sourceDeclaration: "Nhà vườn tự khai",
        photo: "/images/stitch/stitch-39.jpg",
      },
      {
        id: "ev-xl-02",
        dateLabel: "19/11/2026 · 14:30",
        stage: "Thu hoạch & Đóng gói",
        title: "Rang muối bằng củi tự nhiên giữ vỏ lụa",
        detail: "Rang đều tay với muối hạt tinh nhằm giữ độ bùi không cháy xém.",
        actorCategory: "Nghệ nhân rang HTX Xuân Lộc",
        sourceDeclaration: "HTX đối chiếu (Demo)",
        photo: "/images/stitch/stitch-50.jpg",
      },
      {
        id: "ev-xl-03",
        dateLabel: "20/11/2026 · 10:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Hút chân không & dán tem QR lô NF-XL-2026-03",
        detail: "Nhóm TNV Số hóa Xuân Lộc gắn mã QR truy xuất cho từng hộp 500g.",
        actorCategory: "TNV Xuân Lộc",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-05.jpg",
      },
    ],
    isDemo: true,
  },
];

function buildEventsForBatch(
  code: string,
  productName: string,
  farmName: string,
  unitName: string,
  photo: string,
): BatchEvent[] {
  return [
    {
      id: `${code}-ev1`,
      dateLabel: "08/11/2026 · 07:30",
      stage: "Bón phân hữu cơ",
      title: `Chăm sóc hữu cơ & ghi nhật ký ${productName}`,
      detail: `Chủ vườn tại ${unitName} cập nhật chăm sóc hữu cơ trước thu hoạch.`,
      actorCategory: farmName,
      sourceDeclaration: "Nhà vườn tự khai",
      photo,
    },
    {
      id: `${code}-ev2`,
      dateLabel: "20/11/2026 · 06:45",
      stage: "Đo độ Brix & Khảo sát",
      title: `Khảo sát chất lượng đầu vụ ${productName}`,
      detail: `Đoàn viên thanh niên hỗ trợ chụp ảnh lô hàng và ghi nhận thông số cảm quan tại vườn.`,
      actorCategory: `TNV & ${farmName}`,
      sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
      photo,
    },
    {
      id: `${code}-ev3`,
      dateLabel: "24/11/2026 · 08:30",
      stage: "Thu hoạch & Đóng gói",
      title: `Đóng gói & dán tem QR lô ${code}`,
      detail: `Hoàn tất đóng gói theo tiêu chuẩn demo, sẵn sàng tra cứu hộ chiếu QR công khai.`,
      actorCategory: `HTX & ${farmName}`,
      sourceDeclaration: "HTX đối chiếu (Demo)",
      photo,
    },
  ];
}

const EXISTING_CODES = new Set(GOLDEN_BATCHES.map((b) => b.batchCode));
const EXTRA_BATCHES: TraceBatch[] = [];

// Ensure every NF-DN-001..NF-DN-0XX exists covering all products & certifications
for (let i = 1; i <= INITIAL_PRODUCTS.length; i += 1) {
  const code = `NF-DN-${String(i).padStart(3, "0")}`;
  if (EXISTING_CODES.has(code)) continue;
  const linkedProduct =
    INITIAL_PRODUCTS.find((p) => p.batchCode === code) ??
    INITIAL_PRODUCTS[(i - 1) % INITIAL_PRODUCTS.length];
  const linkedFarm =
    INITIAL_FARMS.find((f) => f.id === linkedProduct.farmId) ??
    INITIAL_FARMS[(i - 1) % INITIAL_FARMS.length];

  EXTRA_BATCHES.push({
    batchCode: code,
    productId: linkedProduct.id,
    productName: linkedProduct.name,
    farmId: linkedFarm.id,
    farmName: linkedFarm.name,
    administrativeUnitCode: linkedFarm.administrativeUnitCode,
    administrativeUnitName: linkedFarm.administrativeUnitName,
    region: `${linkedFarm.administrativeUnitName}, Thành phố Đồng Nai, Việt Nam`,
    seasonId: linkedProduct.seasonId,
    harvestDate: "21/11/2026",
    packDate: "24/11/2026",
    declarationLevel:
      linkedFarm.ocopStatus === "coop_checked_demo"
        ? "Nhà vườn tự khai · HTX đối chiếu chứng từ (Demo)"
        : "Nhà vườn tự khai · Thanh niên hỗ trợ ghi nhận (Demo)",
    docStatus: linkedFarm.ocopLabel,
    summary: `Lô ${code} (${linkedProduct.name}) thu hoạch tại ${linkedFarm.name}, ${linkedFarm.administrativeUnitName}. Dữ liệu mô phỏng đồng bộ với Nhật ký mùa vụ.`,
    events: buildEventsForBatch(
      code,
      linkedProduct.name,
      linkedFarm.name,
      linkedFarm.administrativeUnitName,
      linkedProduct.image,
    ),
    isDemo: true,
  });
}

export const INITIAL_BATCHES: TraceBatch[] = [...GOLDEN_BATCHES, ...EXTRA_BATCHES];
