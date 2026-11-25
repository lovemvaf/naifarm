import { INITIAL_FARMS } from "@/data/demo/farms";
import { INITIAL_PRODUCTS } from "@/data/demo/products";
import type {
  ChannelKind,
  DemoOrder,
  ExpenseEntry,
  InventoryMovement,
  OrganizationUnit,
  ReceivablePayable,
  Warehouse,
  WarehouseStock,
} from "@/types/naifarm";

/**
 * 20 HTX Tan Trieu Scenario Member Household Farms ("org-tt-scenario").
 * Synthetic cooperative model separating member households, 2 warehouses, and 3 channels.
 */
export const HTX_TT_MEMBER_FARM_IDS: string[] = [
  "farm-ba-minh-tan-trieu",
  "farm-tan-an-buoi",
  "farm-tri-an-xoai",
  "farm-tran-bien-rau",
  "farm-bien-hoa-nam",
  "farm-nhon-trach-tra",
  "farm-long-thanh-mit",
  "farm-phu-ly-nam-rau",
  "farm-thanh-son-chuoi",
  "farm-dau-giay-nam",
  "farm-tt-ho-01",
  "farm-tt-ho-02",
  "farm-tt-ho-03",
  "farm-tt-ho-04",
  "farm-tt-ho-05",
  "farm-tt-ho-06",
  "farm-tt-ho-07",
  "farm-tt-ho-08",
  "farm-tt-ho-09",
  "farm-tt-ho-10",
];

export const ORG_TT_SCENARIO: OrganizationUnit = {
  id: "org-tt-scenario",
  name: "HTX Nông nghiệp & Bưởi Tân Triều (Mô hình kịch bản)",
  enName: "Tan Trieu Pomelo Agricultural Cooperative (Scenario Model)",
  kind: "coop",
  administrativeUnitCode: "26188",
  administrativeUnitName: "Phường Tân Triều",
  memberFarmIds: HTX_TT_MEMBER_FARM_IDS,
  warehouseIds: ["WH-TT-01", "WH-TT-02"],
  channels: ["online_market", "wholesale_b2b", "farm_outlet"],
  collectionZones: [
    "Cù lao Tân Triều",
    "Dọc sông Đồng Nai – Tân An",
    "Cụm Trảng Bom – Trị An",
  ],
  isSampleScenario: true,
  summary:
    "Kịch bản HTX chuyên bưởi Tân Triều & sản phẩm chế biến gồm 20 hộ thành viên, 2 kho thu gom, 3 kênh bán hàng (Chợ online, Bán sỉ B2B, Điểm bán vườn).",
  enSummary:
    "Cooperative scenario model for pomelo and processed specialty lines across 20 member households, 2 cold hubs, and 3 sales channels.",
};

export const HTX_TT_EXTRA_WAREHOUSE: Warehouse = {
  id: "WH-TT-02",
  name: "Kho Sơ chế & Đóng hộp Bến Cá Tân Triều (HTX)",
  farmId: "farm-tt-ho-05",
  administrativeUnitCode: "26188",
  administrativeUnitName: "Phường Tân Triều",
  storageType: "kho_mat",
  bins: ["TTC-A1 (Bưởi tuyển)", "TTC-B1 (Đóng hộp)", "TTC-QC (Kiểm tra/Cách ly)"],
};

const farmMap = new Map(INITIAL_FARMS.map((f) => [f.id, f]));
const productByFarm = new Map<string, (typeof INITIAL_PRODUCTS)[number]>();
for (const prod of INITIAL_PRODUCTS) {
  if (!productByFarm.has(prod.farmId)) {
    productByFarm.set(prod.farmId, prod);
  }
}

const CHANNELS: ChannelKind[] = ["online_market", "wholesale_b2b", "farm_outlet"];

// Exact per-30-order November block (×8 blocks = 240 completed orders):
// Gross=22,500,000 ×8=180,000,000 | Disc=750,000 ×8=6,000,000 | Ref=500,000 ×8=4,000,000
// Net=170,000,000 | COGS=14,875,000 ×8=119,000,000 | GrossProfit=51,000,000 (30.0%) | AOV=708,333
function buildHtxNovOrders(): DemoOrder[] {
  const orders: DemoOrder[] = [];
  for (let block = 0; block < 8; block += 1) {
    for (let i = 0; i < 30; i += 1) {
      const globalIdx = block * 30 + i;
      const memberFarmId = HTX_TT_MEMBER_FARM_IDS[globalIdx % HTX_TT_MEMBER_FARM_IDS.length];
      const farm = farmMap.get(memberFarmId) ?? INITIAL_FARMS[0];
      const prod = productByFarm.get(memberFarmId) ?? INITIAL_PRODUCTS[1];
      const channel = CHANNELS[i % CHANNELS.length];

      // 30 orders summing to exact 22,500,000 gross:
      // 15 × 600,000 + 15 × 900,000 = 9,000,000 + 13,500,000 = 22,500,000
      const isLarger = i % 2 === 1;
      const quantity = isLarger ? 10 : 10;
      const unitPriceVnd = isLarger ? 90000 : 60000;
      const subtotalVnd = unitPriceVnd * quantity; // 600k or 900k

      // Discounts sum to exact 750,000 per 30 orders: first 15 orders get 50,000 each
      const discountVnd = i < 15 ? 50000 : 0;

      // Refunds sum to exact 500,000 per 30 orders: orders i=2 and i=3 get 250,000 each
      const hasRefund = i === 2 || i === 3;
      const refundedMerchandiseVnd = hasRefund ? 250000 : 0;
      const restockedQty = 0; // Keep costSnapshot directly aligned to 14,875,000/block

      // COGS per 30 orders summing to exact 14,875,000:
      // i < 15: 15 orders × 10 × 45,000 = 6,750,000
      // 15..28 (14 orders): 14 orders × 10 × 55,000 = 7,700,000
      // i === 29 (1 order): 1 × 10 × 42,500 = 425,000
      // 6,750,000 + 7,700,000 + 425,000 = 14,875,000 × 8 = 119,000,000
      const costSnapshotVnd = i < 15 ? 45000 : i < 29 ? 55000 : 42500;

      const dayNum = 1 + (globalIdx % 24);
      const dayStr = String(dayNum).padStart(2, "0");
      const orderDateIso = `2026-11-${dayStr}T${String(8 + (i % 10)).padStart(2, "0")}:15:00+07:00`;
      const deliveredDateIso = `2026-11-${dayStr}T16:40:00+07:00`;
      const deliveryMethod = channel === "farm_outlet" ? "pickup" : "delivery";

      orders.push({
        id: `NF-TT-NOV-${String(globalIdx + 1).padStart(3, "0")}`,
        organizationId: "org-tt-scenario",
        channel,
        customerId: `TT-CUST-${String((globalIdx % 48) + 1).padStart(2, "0")}`,
        customerName:
          channel === "wholesale_b2b"
            ? `Khách sỉ Đồng Nai #${(globalIdx % 12) + 1}`
            : `Khách HTX #${(globalIdx % 36) + 1}`,
        customerPhoneDemo: "090x xxx 000",
        farmId: farm.id,
        farmName: farm.name,
        administrativeUnitCode: farm.administrativeUnitCode,
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            unitLabel: "kg",
            quantity,
            unitPriceVnd,
            costSnapshotVnd,
            batchCode: prod.batchCode,
            restockedQty,
            image: prod.image,
          },
        ],
        deliveryMethod,
        deliverySlotLabel:
          deliveryMethod === "pickup" ? "Nhận tại kho HTX Tân Triều" : "Chuyến xe mát HTX trong ngày",
        deliveryAddress: `${farm.administrativeUnitName}, Thành phố Đồng Nai, Việt Nam`,
        subtotalVnd,
        discountVnd,
        taxVnd: 0,
        shippingFeeVnd: 0,
        totalVnd: subtotalVnd - discountVnd,
        refundedMerchandiseVnd,
        refundedShippingVnd: 0,
        platformFeeVnd: 0,
        couponCode: discountVnd > 0 ? "HTXTANTRIEU" : undefined,
        paymentLabel: "Đối soát nội bộ HTX (không gian trải nghiệm)",
        paymentStatus: hasRefund ? "refunded_partial" : "collected_cod",
        settlementStatus: "settled",
        status: "completed",
        orderDateIso,
        confirmedAtIso: orderDateIso,
        completedAtIso: deliveredDateIso,
        refundedAtIso: hasRefund ? deliveredDateIso : undefined,
        promisedDateIso: `2026-11-${dayStr}T18:00:00+07:00`,
        deliveredDateIso,
        createdAtLabel: `${dayStr}/11/2026 · 09:15`,
        timeline: [
          { step: "Ghi nhận đơn theo kênh HTX", time: `${dayStr}/11`, done: true },
          { step: "Xuất kho Tân Triều & đối soát", time: `${dayStr}/11`, done: true },
          { step: "Hoàn tất giao nhận", time: `${dayStr}/11`, done: true },
        ],
        isDemo: true,
      });
    }
  }
  return orders;
}

// Exact per-25-order October block (×8 blocks = 200 completed orders):
// Gross=18,750,000 ×8=150,000,000 | Disc=625,000 ×8=5,000,000 | Ref=375,000 ×8=3,000,000
// Net=142,000,000 | COGS=12,750,000 ×8=102,000,000 | GrossProfit=40,000,000 (28.17%) | AOV=710,000
function buildHtxOctOrders(): DemoOrder[] {
  const orders: DemoOrder[] = [];
  for (let block = 0; block < 8; block += 1) {
    for (let i = 0; i < 25; i += 1) {
      const globalIdx = block * 25 + i;
      const memberFarmId = HTX_TT_MEMBER_FARM_IDS[globalIdx % HTX_TT_MEMBER_FARM_IDS.length];
      const farm = farmMap.get(memberFarmId) ?? INITIAL_FARMS[0];
      const prod = productByFarm.get(memberFarmId) ?? INITIAL_PRODUCTS[1];
      const channel = CHANNELS[i % CHANNELS.length];

      // 25 orders × 750,000 = 18,750,000 exact!
      const quantity = 10;
      const unitPriceVnd = 75000;
      const subtotalVnd = 750000;

      // 25 orders × 25,000 = 625,000 exact!
      const discountVnd = 25000;

      // i=0..2 (3 orders × 125,000) = 375,000 exact!
      const hasRefund = i < 3;
      const refundedMerchandiseVnd = hasRefund ? 125000 : 0;

      // 25 orders × 10 × 51,000 = 12,750,000 exact!
      const costSnapshotVnd = 51000;

      const dayNum = 1 + (globalIdx % 24);
      const dayStr = String(dayNum).padStart(2, "0");
      const orderDateIso = `2026-10-${dayStr}T09:10:00+07:00`;
      const deliveredDateIso = `2026-10-${dayStr}T16:15:00+07:00`;
      const deliveryMethod = channel === "farm_outlet" ? "pickup" : "delivery";

      orders.push({
        id: `NF-TT-OCT-${String(globalIdx + 1).padStart(3, "0")}`,
        organizationId: "org-tt-scenario",
        channel,
        customerId: `TT-CUST-${String((globalIdx % 42) + 1).padStart(2, "0")}`,
        customerName:
          channel === "wholesale_b2b"
            ? `Đối tác sỉ T10 #${(globalIdx % 10) + 1}`
            : `Khách HTX #${(globalIdx % 32) + 1}`,
        customerPhoneDemo: "090x xxx 000",
        farmId: farm.id,
        farmName: farm.name,
        administrativeUnitCode: farm.administrativeUnitCode,
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            unitLabel: "kg",
            quantity,
            unitPriceVnd,
            costSnapshotVnd,
            batchCode: prod.batchCode,
            restockedQty: 0,
            image: prod.image,
          },
        ],
        deliveryMethod,
        deliverySlotLabel:
          deliveryMethod === "pickup" ? "Nhận tại kho HTX Tân Triều" : "Chuyến xe mát HTX trong ngày",
        deliveryAddress: `${farm.administrativeUnitName}, Thành phố Đồng Nai, Việt Nam`,
        subtotalVnd,
        discountVnd,
        taxVnd: 0,
        shippingFeeVnd: 0,
        totalVnd: subtotalVnd - discountVnd,
        refundedMerchandiseVnd,
        refundedShippingVnd: 0,
        platformFeeVnd: 0,
        couponCode: "HTXT10",
        paymentLabel: "Đối soát nội bộ HTX (không gian trải nghiệm)",
        paymentStatus: hasRefund ? "refunded_partial" : "collected_cod",
        settlementStatus: "settled",
        status: "completed",
        orderDateIso,
        confirmedAtIso: orderDateIso,
        completedAtIso: deliveredDateIso,
        refundedAtIso: hasRefund ? deliveredDateIso : undefined,
        promisedDateIso: `2026-10-${dayStr}T18:00:00+07:00`,
        deliveredDateIso,
        createdAtLabel: `${dayStr}/10/2026 · 09:10`,
        timeline: [
          { step: "Ghi nhận đơn theo kênh HTX", time: `${dayStr}/10`, done: true },
          { step: "Xuất kho Tân Triều & đối soát", time: `${dayStr}/10`, done: true },
          { step: "Hoàn tất giao nhận", time: `${dayStr}/10`, done: true },
        ],
        isDemo: true,
      });
    }
  }
  return orders;
}

export const HTX_TT_NOV_ORDERS: DemoOrder[] = buildHtxNovOrders();
export const HTX_TT_OCT_ORDERS: DemoOrder[] = buildHtxOctOrders();

/**
 * Modeled HTX operating expenses:
 * - Nov 01–24/2026: exact sum = 21,000,000 VND -> Modeled Pre-tax Operating Result = 30,000,000
 * - Oct 01–24/2026: exact sum = 18,000,000 VND -> Modeled Pre-tax Operating Result = 22,000,000
 */
export const HTX_TT_EXPENSES: (ExpenseEntry & { organizationId: string })[] = [
  {
    id: "EXP-TT-NOV-01",
    organizationId: "org-tt-scenario",
    farmId: "farm-ba-minh-tan-trieu",
    category: "dong_goi",
    description: "Thùng carton 5 lớp, rơm lót cuống & tem QR lô bưởi HTX T11",
    amountVnd: 6500000,
    dateIso: "2026-11-06",
  },
  {
    id: "EXP-TT-NOV-02",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-01",
    category: "van_chuyen_noi_bo",
    description: "Nhiên liệu & điều phối xe mát gom hàng từ 20 hộ thành viên (01–24/11)",
    amountVnd: 7200000,
    dateIso: "2026-11-12",
  },
  {
    id: "EXP-TT-NOV-03",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-02",
    category: "nhan_cong_thoi_vu",
    description: "Tổ phân loại bưởi, cân QC đầu vào và bốc xếp kho Bến Cá",
    amountVnd: 5100000,
    dateIso: "2026-11-18",
  },
  {
    id: "EXP-TT-NOV-04",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-05",
    category: "vat_tu",
    description: "Vật tư vệ sinh kho mát và bao bì chống ẩm T11",
    amountVnd: 2200000,
    dateIso: "2026-11-22",
  },
  {
    id: "EXP-TT-OCT-01",
    organizationId: "org-tt-scenario",
    farmId: "farm-ba-minh-tan-trieu",
    category: "dong_goi",
    description: "Thùng đóng gói & nhãn lô truy xuất bưởi HTX T10",
    amountVnd: 5400000,
    dateIso: "2026-10-08",
  },
  {
    id: "EXP-TT-OCT-02",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-03",
    category: "van_chuyen_noi_bo",
    description: "Chi phí chuyến xe gom bưởi liên xã tháng 10 (01–24/10)",
    amountVnd: 6200000,
    dateIso: "2026-10-15",
  },
  {
    id: "EXP-TT-OCT-03",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-04",
    category: "nhan_cong_thoi_vu",
    description: "Công sơ chế & phân loại trái tại điểm gom HTX tháng 10",
    amountVnd: 4400000,
    dateIso: "2026-10-20",
  },
  {
    id: "EXP-TT-OCT-04",
    organizationId: "org-tt-scenario",
    farmId: "farm-tt-ho-06",
    category: "vat_tu",
    description: "Vật tư kiểm ẩm, lưới bọc trái dùng chung tháng 10",
    amountVnd: 2000000,
    dateIso: "2026-10-23",
  },
];

/**
 * Exact Pomelo Stock Ledger Fixture for HTX Tan Trieu:
 * Opening: 2,000 kg + Inbound: 3,800 kg - Outbound: 4,100 kg - Loss: 50 kg = On-hand: 1,650 kg
 * Reserved: 300 kg | Quarantine/Blocked: 100 kg (non-overlapping) | Available: 1,250 kg
 */
export const HTX_TT_POMELO_OPENING_KG = 2000;

export const HTX_TT_POMELO_STOCKS: WarehouseStock[] = [
  {
    id: "STK-TT-POM-01",
    warehouseId: "WH-TT-01",
    productId: "P06",
    batchCode: "NF-TT-2026-01",
    binCode: "TT-B1 (Bưởi tươi)",
    unitLabel: "kg",
    unitCostVnd: 32000,
    onHandQty: 1100,
    reservedQty: 200,
    blockedQty: 0,
    quarantineQty: 0,
    expiryDateIso: "2026-12-10",
    minThreshold: 250,
    maxThreshold: 2500,
  },
  {
    id: "STK-TT-POM-02",
    warehouseId: "WH-TT-02",
    productId: "P07",
    batchCode: "NF-TT-2026-01",
    binCode: "TTC-QC (Kiểm tra/Cách ly)",
    unitLabel: "kg",
    unitCostVnd: 31000,
    onHandQty: 550,
    reservedQty: 100,
    blockedQty: 100,
    quarantineQty: 100,
    expiryDateIso: "2026-12-03",
    minThreshold: 150,
    maxThreshold: 1500,
  },
];

export const HTX_TT_POMELO_MOVEMENTS: InventoryMovement[] = [
  {
    id: "MOV-TT-IN-01",
    warehouseId: "WH-TT-01",
    productId: "P06",
    batchCode: "NF-TT-2026-01",
    type: "inbound",
    quantityDelta: 2400,
    unitLabel: "kg",
    dateIso: "2026-11-05",
    actorName: "Thủ kho HTX Bình An",
    reason: "Nhập bưởi từ 12 hộ xã viên đợt đầu 01–10/11",
  },
  {
    id: "MOV-TT-IN-02",
    warehouseId: "WH-TT-02",
    productId: "P07",
    batchCode: "NF-TT-2026-01",
    type: "inbound",
    quantityDelta: 1400,
    unitLabel: "kg",
    dateIso: "2026-11-14",
    actorName: "Thủ kho HTX Bình An",
    reason: "Nhập bưởi đường lá cam đợt giữa tháng 11",
  },
  {
    id: "MOV-TT-OUT-01",
    warehouseId: "WH-TT-01",
    productId: "P06",
    batchCode: "NF-TT-2026-01",
    type: "outbound",
    quantityDelta: -2750,
    unitLabel: "kg",
    dateIso: "2026-11-19",
    actorName: "Kinh doanh HTX",
    reason: "Xuất bán qua 3 kênh (Chợ online, B2B, Điểm bán vườn)",
  },
  {
    id: "MOV-TT-OUT-02",
    warehouseId: "WH-TT-02",
    productId: "P07",
    batchCode: "NF-TT-2026-01",
    type: "outbound",
    quantityDelta: -1350,
    unitLabel: "kg",
    dateIso: "2026-11-22",
    actorName: "Kinh doanh HTX",
    reason: "Xuất giao đơn hàng hợp đồng tuần 3",
  },
  {
    id: "MOV-TT-LOSS-01",
    warehouseId: "WH-TT-02",
    productId: "P07",
    batchCode: "NF-TT-2026-01",
    type: "loss",
    quantityDelta: -50,
    unitLabel: "kg",
    dateIso: "2026-11-24",
    actorName: "Tổ QC HTX Tân Triều",
    reason: "Hao hụt dập vỏ tự nhiên trong quá trình phân loại",
  },
];

export const HTX_TT_AR_AP_AGING_ITEMS: ReceivablePayable[] = [
  {
    id: "RP-TT-01",
    farmId: "farm-ba-minh-tan-trieu",
    kind: "receivable",
    counterpartyName: "Hệ thống Thực phẩm Sạch Biên Hòa (Trong hạn)",
    originalVnd: 18500000,
    paidVnd: 8500000,
    dueDateIso: "2026-12-05",
    status: "open",
  },
  {
    id: "RP-TT-02",
    farmId: "farm-tt-ho-01",
    kind: "receivable",
    counterpartyName: "Đơn vị Quà tặng Doanh nghiệp Đồng Nai (Quá hạn 1–30 ngày)",
    originalVnd: 12000000,
    paidVnd: 4000000,
    dueDateIso: "2026-11-10",
    status: "overdue",
  },
  {
    id: "RP-TT-03",
    farmId: "farm-tt-ho-02",
    kind: "receivable",
    counterpartyName: "Cửa hàng Đặc sản Long Thành (Quá hạn 31–60 ngày)",
    originalVnd: 7400000,
    paidVnd: 2400000,
    dueDateIso: "2026-10-12",
    status: "overdue",
  },
  {
    id: "RP-TT-04",
    farmId: "farm-tt-ho-03",
    kind: "payable",
    counterpartyName: "Đối soát hộ xã viên Tân Triều đợt 2 (Chờ duyệt chi)",
    originalVnd: 28000000,
    paidVnd: 12000000,
    dueDateIso: "2026-12-02",
    status: "open",
  },
  {
    id: "RP-TT-05",
    farmId: "farm-tt-ho-04",
    kind: "payable",
    counterpartyName: "Nhà cung cấp Bao bì & Thùng rơm (Quá hạn 61–90 ngày — đang rà soát)",
    originalVnd: 6200000,
    paidVnd: 1200000,
    dueDateIso: "2026-09-10",
    status: "overdue",
  },
  {
    id: "RP-TT-06",
    farmId: "farm-tt-ho-05",
    kind: "receivable",
    counterpartyName: "Công nợ cũ quý III đã trích dự phòng (>90 ngày)",
    originalVnd: 3500000,
    paidVnd: 1500000,
    dueDateIso: "2026-08-10",
    status: "overdue",
  },
];
