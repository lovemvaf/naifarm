import { INITIAL_FARMS } from "./farms";
import { INITIAL_PRODUCTS } from "./products";
import { getAdministrativeUnitByCode } from "@/lib/geography/administrative-lookup";
import { formatAdministrativeAddress } from "@/lib/geography/normalize-address";
import type { DeliveryMethod, DemoOrder, OrderStatus } from "@/types/naifarm";

const DELIVERY_UNIT_CODES = [
  "26041",
  "26068",
  "26080",
  "26188",
  "26425",
  "26326",
  "26368",
  "25195",
  "25210",
  "26206",
];

const CUSTOMERS = [
  { id: "CUST-01", name: "Ngọc Linh" },
  { id: "CUST-02", name: "Minh Khang" },
  { id: "CUST-03", name: "Thảo Vy" },
  { id: "CUST-04", name: "Hoàng Nam" },
  { id: "CUST-05", name: "Lan Anh" },
  { id: "CUST-06", name: "Quốc Việt" },
  { id: "CUST-07", name: "Thu Trang" },
  { id: "CUST-08", name: "Gia Huy" },
  { id: "CUST-09", name: "Phương Uyên" },
  { id: "CUST-10", name: "Đức Thịnh" },
];

const STATUS_CYCLE: OrderStatus[] = [
  "pending_confirm",
  "preparing",
  "shipping",
  "ready_pickup",
  "completed",
  "cancelled",
];

const farmById = new Map(INITIAL_FARMS.map((f) => [f.id, f]));

const PAYMENT_LABEL = "Thanh toán khi nhận hàng (không gian trải nghiệm)";

const GOLDEN_ORDERS: DemoOrder[] = [
  {
    id: "NF-ORD-DEMO-01",
    parentOrderId: "PAR-2026-1124-01",
    customerId: "CUST-01",
    customerName: "Ngọc Linh",
    customerPhoneDemo: "090x xxx 128",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    administrativeUnitCode: "26080",
    items: [
      {
        productId: "P01",
        productName: "Chôm chôm Java Long Khánh",
        unitLabel: "kg",
        quantity: 2,
        unitPriceVnd: 35000,
        costSnapshotVnd: 23000,
        batchCode: "NF-DEMO-001",
        image: "/images/stitch/stitch-07.jpg",
      },
    ],
    deliveryMethod: "delivery",
    deliverySlotLabel: "Chiều 24/11/2026 (14:00 – 17:00)",
    deliveryAddress: "Số 18 Đường Hùng Vương, Phường Long Khánh, Thành phố Đồng Nai, Việt Nam",
    subtotalVnd: 70000,
    discountVnd: 0,
    taxVnd: 0,
    shippingFeeVnd: 20000,
    totalVnd: 90000,
    refundedMerchandiseVnd: 0,
    refundedShippingVnd: 0,
    platformFeeVnd: 3500,
    paymentLabel: PAYMENT_LABEL,
    paymentStatus: "unpaid",
    settlementStatus: "pending",
    status: "pending_confirm",
    orderDateIso: "2026-11-24T09:15:00+07:00",
    promisedDateIso: "2026-11-25T17:00:00+07:00",
    createdAtLabel: "24/11/2026 · 09:15",
    timeline: [
      { step: "Khách gửi đơn hàng", time: "09:15 24/11", done: true },
      { step: "Nhà vườn Ba Tư xác nhận đơn", time: "Đang chờ", done: false },
      { step: "Hái tại vườn & đóng giỏ rơm", time: "Chưa thực hiện", done: false },
      { step: "Chuyến xe mát giao hàng", time: "Chưa thực hiện", done: false },
    ],
    isDemo: true,
  },
  {
    id: "NF-ORD-DEMO-02",
    parentOrderId: "PAR-2026-1123-02",
    customerId: "CUST-01",
    customerName: "Ngọc Linh",
    customerPhoneDemo: "090x xxx 128",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    administrativeUnitCode: "26041",
    items: [
      {
        productId: "P06",
        productName: "Bưởi da xanh Tân Triều",
        unitLabel: "kg",
        quantity: 5,
        unitPriceVnd: 45000,
        costSnapshotVnd: 30000,
        batchCode: "NF-TT-2026-01",
        image: "/images/stitch/stitch-03.jpg",
      },
    ],
    deliveryMethod: "delivery",
    deliverySlotLabel: "Chiều 24/11/2026 (14:00 – 17:00)",
    deliveryAddress: "Số 45/2 Nguyễn Ái Quốc, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam",
    subtotalVnd: 225000,
    discountVnd: 15000,
    taxVnd: 0,
    shippingFeeVnd: 20000,
    totalVnd: 230000,
    refundedMerchandiseVnd: 0,
    refundedShippingVnd: 0,
    platformFeeVnd: 10500,
    couponCode: "MUAVU15",
    paymentLabel: PAYMENT_LABEL,
    paymentStatus: "unpaid",
    settlementStatus: "pending",
    status: "shipping",
    orderDateIso: "2026-11-23T16:40:00+07:00",
    confirmedAtIso: "2026-11-23T17:05:00+07:00",
    promisedDateIso: "2026-11-25T17:00:00+07:00",
    createdAtLabel: "23/11/2026 · 16:40",
    timeline: [
      { step: "Khách gửi đơn hàng", time: "16:40 23/11", done: true },
      { step: "Chú Ba Minh xác nhận đơn", time: "17:05 23/11", done: true },
      { step: "Đóng thùng rơm & dán QR NF-TT-2026-01", time: "07:30 24/11", done: true },
      { step: "Đang trên chuyến xe mát HTX (Dự kiến giao chiều nay)", time: "09:45 24/11", done: false },
    ],
    isDemo: true,
  },
];

// Generate 166 additional relational orders spanning 2 full periods:
// Orders #03..#82 -> October 2026 (2026-10-01 .. 2026-10-28)
// Orders #83..#168 -> November 2026 (2026-11-01 .. 2026-11-25)
const EXTRA_ORDERS: DemoOrder[] = Array.from({ length: 166 }, (_, idx) => {
  const num = idx + 3;
  const orderId = `NF-ORD-DEMO-${String(num).padStart(2, "0")}`;
  const inSeasonProducts = INITIAL_PRODUCTS.filter((p) => p.seasonStatus === "in_season");
  const prod = inSeasonProducts[idx % inSeasonProducts.length];
  const farm = farmById.get(prod.farmId) ?? INITIAL_FARMS[0];
  const unitCode = DELIVERY_UNIT_CODES[idx % DELIVERY_UNIT_CODES.length];
  const unit = getAdministrativeUnitByCode(unitCode);

  const isOct = num <= 82;
  const monthNum = isOct ? 10 : 11;
  const maxDay = isOct ? 28 : 24;
  const dayNum = 1 + (idx % maxDay);
  const dayStr = String(dayNum).padStart(2, "0");
  const monthStr = String(monthNum).padStart(2, "0");

  // Make October mostly completed/historical with some refunds; keep #168 completed for Nov missing-cost COGS test
  const isMissingCostEdgeCase = num === 168;
  const status: OrderStatus = isMissingCostEdgeCase
    ? "completed"
    : isOct
    ? idx % 10 === 0
      ? "cancelled"
      : "completed"
    : STATUS_CYCLE[idx % STATUS_CYCLE.length];

  const deliveryMethod: DeliveryMethod = status === "ready_pickup" || idx % 5 === 4 ? "pickup" : "delivery";
  const quantity = 1 + (idx % 4);
  const subtotalVnd = prod.priceVnd * quantity;
  const discountVnd = idx % 7 === 0 ? 10000 : 0;
  const shippingFeeVnd = deliveryMethod === "pickup" ? 0 : 20000;
  const isPartialRefund = status === "completed" && idx % 15 === 2;
  const isFullRefund = status === "completed" && idx % 31 === 5;
  const refundedMerchandiseVnd = isFullRefund
    ? subtotalVnd - discountVnd
    : isPartialRefund
    ? prod.priceVnd
    : 0;
  const refundedShippingVnd = isFullRefund ? shippingFeeVnd : 0;
  const isLateDelivery = status === "completed" && idx % 9 === 0;

  const customer = CUSTOMERS[idx % CUSTOMERS.length];
  const unitCost = isMissingCostEdgeCase ? null : Math.round(prod.priceVnd * 0.66);
  const orderDateIso = `2026-${monthStr}-${dayStr}T${String(8 + (idx % 10)).padStart(2, "0")}:20:00+07:00`;
  const promisedDay = String(Math.min(maxDay + 1, dayNum + 1)).padStart(2, "0");
  const deliveredDay = isLateDelivery
    ? String(Math.min(maxDay + 3, dayNum + 3)).padStart(2, "0")
    : promisedDay;
  const promisedDateIso = `2026-${monthStr}-${promisedDay}T18:00:00+07:00`;
  const deliveredDateIso = status === "completed" ? `2026-${monthStr}-${deliveredDay}T15:30:00+07:00` : undefined;
  const platformFeeVnd =
    status === "completed" ? Math.round((subtotalVnd - discountVnd - refundedMerchandiseVnd) * 0.05) : 0;

  // Group every pair #84/#85, #90/#91 into a multi-seller parent checkout
  const parentOrderId =
    num >= 84 && num % 6 === 0
      ? `PAR-2026-${monthStr}-${dayStr}`
      : num >= 85 && (num - 1) % 6 === 0
      ? `PAR-2026-${monthStr}-${String(1 + ((idx - 1) % maxDay)).padStart(2, "0")}`
      : undefined;

  return {
    id: orderId,
    parentOrderId,
    customerId: customer.id,
    customerName: customer.name,
    customerPhoneDemo: `091x xxx ${String(200 + num).slice(-3)}`,
    farmId: farm.id,
    farmName: farm.name,
    administrativeUnitCode: unitCode,
    items: [
      {
        productId: prod.id,
        productName: prod.name,
        unitLabel: prod.unitLabel,
        quantity,
        unitPriceVnd: prod.priceVnd,
        costSnapshotVnd: unitCost,
        batchCode: prod.batchCode,
        restockedQty: isPartialRefund ? 1 : isFullRefund ? quantity : 0,
        image: prod.image,
      },
    ],
    deliveryMethod,
    deliverySlotLabel: deliveryMethod === "pickup" ? "Nhận trực tiếp tại vườn" : "Giao trong ngày 14:00 – 17:30",
    deliveryAddress:
      deliveryMethod === "pickup"
        ? `Nhận trực tiếp tại ${farm.addressLabel}`
        : unit
        ? formatAdministrativeAddress(`Số ${10 + idx} Đường Số ${1 + (idx % 9)}`, unit)
        : `Số ${10 + idx}, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam`,
    subtotalVnd,
    discountVnd,
    taxVnd: 0,
    shippingFeeVnd,
    totalVnd: Math.max(0, subtotalVnd - discountVnd + shippingFeeVnd),
    refundedMerchandiseVnd,
    refundedShippingVnd,
    platformFeeVnd,
    couponCode: discountVnd > 0 ? "NAIFARM10" : undefined,
    paymentLabel: PAYMENT_LABEL,
    paymentStatus: isFullRefund
      ? "refunded_full"
      : isPartialRefund
      ? "refunded_partial"
      : status === "completed"
      ? "collected_cod"
      : "unpaid",
    settlementStatus: status === "completed" && !isPartialRefund ? "settled" : "pending",
    status,
    orderDateIso,
    confirmedAtIso: status !== "pending_confirm" && status !== "cancelled" ? orderDateIso : undefined,
    completedAtIso: deliveredDateIso,
    refundedAtIso: refundedMerchandiseVnd > 0 ? deliveredDateIso : undefined,
    promisedDateIso,
    deliveredDateIso,
    createdAtLabel: `${dayStr}/${monthStr}/2026 · ${String(8 + (idx % 10)).padStart(2, "0")}:20`,
    timeline: [
      { step: "Khách gửi đơn hàng", time: `${dayStr}/${monthStr}`, done: true },
      {
        step: `${farm.name} xác nhận đơn`,
        time: status === "pending_confirm" ? "Đang chờ" : `${dayStr}/${monthStr}`,
        done: status !== "pending_confirm" && status !== "cancelled",
      },
      {
        step: `Chuẩn bị & dán mã lô ${prod.batchCode}`,
        time:
          status === "shipping" || status === "completed" || status === "ready_pickup"
            ? `${dayStr}/${monthStr}`
            : "Chưa thực hiện",
        done: status === "shipping" || status === "completed" || status === "ready_pickup",
      },
      {
        step: deliveryMethod === "pickup" ? "Sẵn sàng nhận tại vườn" : "Hoàn tất giao hàng",
        time: status === "completed" ? `${deliveredDay}/${monthStr}` : "Chờ cập nhật",
        done: status === "completed",
      },
    ],
    cancelReason: status === "cancelled" ? "Khách thay đổi lịch nhận hàng sang cuối tuần" : undefined,
    isDemo: true,
  };
});

export const INITIAL_ORDERS: DemoOrder[] = [...GOLDEN_ORDERS, ...EXTRA_ORDERS];
