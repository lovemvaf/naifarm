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
    expiryDate: "29/11/2026",
    quantityKg: 120,
    remainingKg: 30,
    storageCondition: "Giỏ tre thoáng mát 14–18°C, tránh ánh nắng trực tiếp",
    childBatchCodes: ["NF-DN-050"],
    lotStatus: "active",
    declarationLevel: "Nhà vườn tự khai · Thanh niên hỗ trợ ghi nhận (Chưa xác minh OCOP chính thức)",
    docStatus: "Hồ sơ mẫu đang hoàn thiện",
    summary:
      "Lô NF-DEMO-001 gồm chôm chôm Java và sầu riêng thu hoạch tại Nhà vườn Ba Tư (2,5 ha). Dữ liệu nhật ký hiển thị minh bạch nguồn khai báo.",
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
        visibility: "public",
        eventType: "care",
      },
      {
        id: "ev-02",
        dateLabel: "23/11/2026 · 06:15",
        stage: "Thu hoạch & Đóng gói",
        title: "Thu hoạch 120 kg đợt đầu sáng sớm",
        detail: "Cắt chùm khi trái chuyển đỏ đều, tránh nắng gắt để giữ độ giòn và màu vỏ tươi.",
        actorCategory: "Chủ vườn Ba Tư & Đoàn viên Minh Anh",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-07.jpg",
        visibility: "public",
        eventType: "harvest",
        quantityKg: 120,
        unitLabel: "kg",
      },
      {
        id: "ev-03",
        dateLabel: "24/11/2026 · 08:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Phân loại, đóng giỏ & gắn mã QR lô NF-DEMO-001",
        detail: "Đoàn viên Tuấn hỗ trợ cân kiểm tra (60 kg bán lẻ trực tiếp + 60 kg góp lô gom HTX NF-DN-050).",
        actorCategory: "Đoàn viên Tuấn & Minh Anh",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-32.jpg",
        visibility: "public",
        eventType: "pack",
        quantityKg: 120,
        unitLabel: "kg",
      },
      {
        id: "ev-04-internal",
        dateLabel: "24/11/2026 · 08:45",
        stage: "Đo độ Brix & Khảo sát",
        title: "Ghi chú giá vốn & phân bổ nội bộ HTX",
        detail: "Thông tin chi phí thu gom nội bộ của tổ hợp tác (ẩn trên trang truy xuất công khai).",
        actorCategory: "Kế toán tổ hợp tác",
        sourceDeclaration: "HTX đối chiếu",
        visibility: "internal",
        eventType: "inspection",
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
    expiryDate: "15/12/2026",
    quantityKg: 260,
    remainingKg: 42,
    storageCondition: "Kho mát khô ráo 16–20°C, thông gió tốt",
    childBatchCodes: ["NF-DN-050"],
    lotStatus: "active",
    declarationLevel: "Nhà vườn tự khai · HTX Tân Triều đối chiếu chứng từ (Hồ sơ mẫu)",
    docStatus: "Hồ sơ đã đối chiếu (mẫu nội bộ — không thay thế chứng nhận pháp lý)",
    summary:
      "Lô bưởi Tân Triều cắt tại liếp, đo độ ngọt Brix tham khảo và đóng thùng bảo vệ cuống tươi.",
    events: [
      {
        id: "ev-tt-01",
        dateLabel: "05/11/2026 · 08:00",
        stage: "Kiểm soát sinh học",
        title: "Bọc trái sinh học chống ruồi đục quả",
        detail: "Chú Ba Minh bao trái bằng túi lưới thoáng khí tại liếp A3.",
        actorCategory: "Chủ vườn Ba Minh",
        sourceDeclaration: "Nhà vườn tự khai",
        photo: "/images/stitch/stitch-31.jpg",
        visibility: "public",
        eventType: "care",
      },
      {
        id: "ev-tt-02",
        dateLabel: "22/11/2026 · 06:30",
        stage: "Đo độ Brix & Khảo sát",
        title: "Thu hoạch tại liếp & kiểm tra độ ngọt Brix",
        detail: "Cắt trái đạt độ tuổi thu hoạch, độ ngọt đo tham khảo đạt 11,8° Brix.",
        actorCategory: "Chú Ba Minh & TNV Nguyễn Văn An",
        sourceDeclaration: "Thanh niên hỗ trợ ghi nhận",
        photo: "/images/stitch/stitch-26.jpg",
        visibility: "public",
        eventType: "harvest",
        quantityKg: 260,
        unitLabel: "kg",
      },
      {
        id: "ev-tt-03",
        dateLabel: "23/11/2026 · 09:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Cân trọng lượng, lót rơm & dán tem QR tại vườn",
        detail: "HTX Tân Triều đối chiếu chứng từ lô và bàn giao chuyến xe mát.",
        actorCategory: "HTX Tân Triều & TNV Nguyễn Văn An",
        sourceDeclaration: "HTX đối chiếu",
        photo: "/images/stitch/stitch-27.jpg",
        visibility: "public",
        eventType: "pack",
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
    expiryDate: "20/05/2027",
    quantityKg: 400,
    remainingKg: 145,
    storageCondition: "Hộp kín chống ẩm dưới 25°C, tránh ánh sáng trực tiếp",
    lotStatus: "active",
    declarationLevel: "HTX đối chiếu nội bộ & Nhật ký rang củi truyền thống (Hồ sơ mẫu)",
    docStatus: "Hồ sơ đã đối chiếu",
    summary:
      "Lô điều rang củi thu mua từ xã viên Phường Xuân Lộc, tách cỡ W240 và đóng hũ kín.",
    events: [
      {
        id: "ev-xl-01",
        dateLabel: "15/11/2026 · 08:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Phân loại điều thô đạt độ ẩm chuẩn tại kho HTX",
        detail: "Kiểm tra độ ẩm trước khi đưa vào lò rang củi truyền thống.",
        actorCategory: "Tổ kiểm tra HTX Xuân Lộc",
        sourceDeclaration: "HTX đối chiếu",
        photo: "/images/stitch/stitch-34.jpg",
        visibility: "public",
        eventType: "receive",
      },
      {
        id: "ev-xl-02",
        dateLabel: "20/11/2026 · 14:00",
        stage: "Thu hoạch & Đóng gói",
        title: "Rang củi vừa lửa & đóng hũ gắn tem NF-XL-2026-03",
        detail: "Hoàn tất đóng gói 400 kg (800 hũ 500g) kèm tem QR truy xuất.",
        actorCategory: "Xưởng HTX & TNV Xuân Lộc",
        sourceDeclaration: "HTX đối chiếu",
        photo: "/images/stitch/stitch-39.jpg",
        visibility: "public",
        eventType: "pack",
      },
      {
        id: "ev-xl-03",
        dateLabel: "21/11/2026 · 08:30",
        stage: "Thu hoạch & Đóng gói",
        title: "Kiểm tra độ kín nắp hút chân không & xuất kho đợt 1",
        detail: "Niêm phong nắp hũ, đối chiếu hồ sơ xưởng và chuyển lên điểm tập kết Đồng Nai.",
        actorCategory: "Tổ đóng gói HTX Xuân Lộc",
        sourceDeclaration: "HTX đối chiếu",
        photo: "/images/stitch/stitch-39.jpg",
        visibility: "public",
        eventType: "release",
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
      visibility: "public",
      eventType: "care",
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
      visibility: "public",
      eventType: "inspection",
    },
    {
      id: `${code}-ev3`,
      dateLabel: "24/11/2026 · 08:30",
      stage: "Thu hoạch & Đóng gói",
      title: `Đóng gói & dán tem QR lô ${code}`,
      detail: `Hoàn tất đóng gói theo quy chuẩn hồ sơ mẫu, sẵn sàng tra cứu hộ chiếu QR công khai.`,
      actorCategory: `HTX & ${farmName}`,
      sourceDeclaration: "HTX đối chiếu",
      photo,
      visibility: "public",
      eventType: "pack",
    },
  ];
}

const EXISTING_CODES = new Set(GOLDEN_BATCHES.map((b) => b.batchCode));
const EXTRA_BATCHES: TraceBatch[] = [];

for (let i = 1; i <= INITIAL_PRODUCTS.length; i += 1) {
  const code = `NF-DN-${String(i).padStart(3, "0")}`;
  if (EXISTING_CODES.has(code)) continue;
  const linkedProduct =
    INITIAL_PRODUCTS.find((p) => p.batchCode === code) ??
    INITIAL_PRODUCTS[(i - 1) % INITIAL_PRODUCTS.length];
  const linkedFarm =
    INITIAL_FARMS.find((f) => f.id === linkedProduct.farmId) ??
    INITIAL_FARMS[(i - 1) % INITIAL_FARMS.length];

  const isPoolingChild = code === "NF-DN-050";
  const isQuarantine = code === "NF-DN-098";
  const isRecalledRoot = code === "NF-DN-099";
  const isRecalledChild = code === "NF-DN-100";
  const isExpired = code === "NF-DN-101";

  const lotStatus: TraceBatch["lotStatus"] = isQuarantine
    ? "quarantine"
    : isRecalledRoot || isRecalledChild
    ? "recalled"
    : isExpired
    ? "expired"
    : "active";

  const events = buildEventsForBatch(
    code,
    linkedProduct.name,
    linkedFarm.name,
    linkedFarm.administrativeUnitName,
    linkedProduct.image,
  );

  if (isRecalledRoot || isRecalledChild) {
    events.push({
      id: `${code}-recall-ev`,
      dateLabel: "25/11/2026 · 09:10",
      stage: "Thu hoạch & Đóng gói",
      title: `Cảnh báo giữ lô / thu hồi kiểm thử (${code})`,
      detail: "Bộ phận QC tạm giữ lô và ngưng mở bán trên chợ do kiểm tra chênh lệch độ ẩm/bảo quản.",
      actorCategory: "Kiểm soát chất lượng HTX",
      sourceDeclaration: "HTX đối chiếu",
      visibility: "public",
      eventType: "recall",
    });
  }

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
    harvestDate: isExpired ? "01/11/2026" : "21/11/2026",
    packDate: isExpired ? "02/11/2026" : "24/11/2026",
    expiryDate: isExpired ? "15/11/2026" : "05/12/2026",
    quantityKg: 100 + (i % 6) * 20,
    remainingKg: isRecalledRoot || isQuarantine || isExpired ? 0 : 35,
    storageCondition: "Bảo quản mát 12–18°C theo khuyến nghị đóng gói",
    parentBatchCodes: isPoolingChild
      ? ["NF-DEMO-001", "NF-TT-2026-01"]
      : isRecalledChild
      ? ["NF-DN-099"]
      : undefined,
    childBatchCodes: isRecalledRoot ? ["NF-DN-100"] : undefined,
    lotStatus,
    declarationLevel:
      linkedFarm.ocopStatus === "coop_checked_demo"
        ? "Nhà vườn tự khai · HTX đối chiếu chứng từ"
        : "Nhà vườn tự khai · Thanh niên hỗ trợ ghi nhận",
    docStatus: isRecalledRoot || isRecalledChild
      ? "Đã tạm thu hồi kiểm tra"
      : isQuarantine
      ? "Đang tạm giữ chờ kiểm tra QC"
      : isExpired
      ? "Lô đã qua hạn sử dụng khuyến nghị"
      : linkedFarm.ocopLabel,
    summary: `Lô ${code} (${linkedProduct.name}) thu hoạch tại ${linkedFarm.name}, ${linkedFarm.administrativeUnitName}. Dữ liệu đồng bộ với Nhật ký mùa vụ.`,
    events,
    isDemo: true,
  });
}

export const INITIAL_BATCHES: TraceBatch[] = [...GOLDEN_BATCHES, ...EXTRA_BATCHES];

const batchCodes = new Set(INITIAL_BATCHES.map((batch) => batch.batchCode));
for (const product of INITIAL_PRODUCTS) {
  if (batchCodes.has(product.batchCode)) continue;
  batchCodes.add(product.batchCode);
  INITIAL_BATCHES.push({
    batchCode: product.batchCode,
    productId: product.id,
    productName: product.name,
    farmId: product.farmId,
    farmName: product.farmName,
    administrativeUnitCode: product.administrativeUnitCode,
    administrativeUnitName: product.administrativeUnitName,
    region: product.region,
    seasonId: product.seasonId,
    harvestDate: "21/11/2026",
    packDate: "24/11/2026",
    lotStatus: "active",
    declarationLevel: "Hồ sơ minh họa theo sản phẩm · Nhà vườn tự khai",
    docStatus: "Hồ sơ mẫu minh họa (Demo)",
    summary: `Lô mẫu ${product.batchCode} (${product.name}) tại ${product.farmName}, ${product.administrativeUnitName}. Phục vụ tra cứu QR minh họa 3 chặng.`,
    events: buildEventsForBatch(
      product.batchCode,
      product.name,
      product.farmName,
      product.administrativeUnitName,
      product.image,
    ),
    isDemo: true,
  });
}
