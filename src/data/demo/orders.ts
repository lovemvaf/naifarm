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
  "Ngọc Linh",
  "Minh Khang",
  "Thảo Vy",
  "Hoàng Nam",
  "Lan Anh",
  "Quốc Việt",
  "Thu Trang",
  "Gia Huy",
  "Phương Uyên",
  "Đức Thịnh",
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

const GOLDEN_ORDERS: DemoOrder[] = [
  {
    id: "NF-ORD-DEMO-01",
    customerName: "Ngọc Linh",
    customerPhoneDemo: "090x xxx 128 (Demo)",
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
        image: "/images/stitch/stitch-07.jpg",
      },
    ],
    deliveryMethod: "delivery",
    deliveryAddress: "Số 18 Đường Hùng Vương, Phường Long Khánh, Thành phố Đồng Nai, Việt Nam (Địa chỉ minh họa)",
    subtotalVnd: 70000,
    shippingFeeVnd: 20000,
    totalVnd: 90000,
    paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)",
    status: "pending_confirm",
    createdAtLabel: "24/11/2026 · 09:15",
    timeline: [
      { step: "Khách đặt đơn COD (Demo)", time: "09:15 24/11", done: true },
      { step: "Nhà vườn Ba Tư xác nhận đơn", time: "Đang chờ", done: false },
      { step: "Hái tại vườn & đóng giỏ rơm", time: "Chưa thực hiện", done: false },
      { step: "Chuyến xe mát giao hàng", time: "Chưa thực hiện", done: false },
    ],
    isDemo: true,
  },
  {
    id: "NF-ORD-DEMO-02",
    customerName: "Ngọc Linh",
    customerPhoneDemo: "090x xxx 128 (Demo)",
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
        image: "/images/stitch/stitch-03.jpg",
      },
    ],
    deliveryMethod: "delivery",
    deliveryAddress: "Số 45/2 Nguyễn Ái Quốc, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam (Địa chỉ minh họa)",
    subtotalVnd: 225000,
    shippingFeeVnd: 20000,
    totalVnd: 245000,
    paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)",
    status: "shipping",
    createdAtLabel: "23/11/2026 · 16:40",
    timeline: [
      { step: "Khách đặt đơn COD (Demo)", time: "16:40 23/11", done: true },
      { step: "Chú Ba Minh xác nhận đơn", time: "17:05 23/11", done: true },
      { step: "Đóng thùng rơm & dán QR NF-TT-2026-01", time: "07:30 24/11", done: true },
      { step: "Đang trên chuyến xe mát HTX (Dự kiến giao chiều nay)", time: "09:45 24/11", done: false },
    ],
    isDemo: true,
  },
];

const EXTRA_ORDERS: DemoOrder[] = Array.from({ length: 80 }, (_, idx) => {
  const num = idx + 3;
  const orderId = `NF-ORD-DEMO-${String(num).padStart(2, "0")}`;
  const inSeasonProducts = INITIAL_PRODUCTS.filter((p) => p.seasonStatus === "in_season");
  const prod = inSeasonProducts[idx % inSeasonProducts.length];
  const farm = farmById.get(prod.farmId) ?? INITIAL_FARMS[0];
  const unitCode = DELIVERY_UNIT_CODES[idx % DELIVERY_UNIT_CODES.length];
  const unit = getAdministrativeUnitByCode(unitCode);
  const status = STATUS_CYCLE[idx % STATUS_CYCLE.length];
  const deliveryMethod: DeliveryMethod = status === "ready_pickup" || idx % 4 === 3 ? "pickup" : "delivery";
  const quantity = 1 + (idx % 3);
  const subtotalVnd = prod.priceVnd * quantity;
  const shippingFeeVnd = deliveryMethod === "pickup" ? 0 : 20000;
  const customerName = CUSTOMERS[idx % CUSTOMERS.length];
  const day = String(1 + (idx % 24)).padStart(2, "0");

  return {
    id: orderId,
    customerName,
    customerPhoneDemo: `091x xxx ${String(200 + num).slice(-3)} (Demo)`,
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
        image: prod.image,
      },
    ],
    deliveryMethod,
    deliveryAddress:
      deliveryMethod === "pickup"
        ? `Nhận trực tiếp tại ${farm.addressLabel}`
        : unit
        ? `${formatAdministrativeAddress(`Số ${10 + idx} Đường Số ${1 + (idx % 9)}`, unit)} (Địa chỉ minh họa)`
        : `Số ${10 + idx}, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam (Địa chỉ minh họa)`,
    subtotalVnd,
    shippingFeeVnd,
    totalVnd: subtotalVnd + shippingFeeVnd,
    paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)",
    status,
    createdAtLabel: `${day}/11/2026 · ${String(8 + (idx % 10)).padStart(2, "0")}:20`,
    timeline: [
      { step: "Khách đặt đơn COD (Demo)", time: `${day}/11`, done: true },
      { step: `${farm.name} xác nhận đơn`, time: status === "pending_confirm" ? "Đang chờ" : `${day}/11`, done: status !== "pending_confirm" && status !== "cancelled" },
      { step: "Chuẩn bị & dán mã lô QR", time: status === "shipping" || status === "completed" || status === "ready_pickup" ? `${day}/11` : "Chưa thực hiện", done: status === "shipping" || status === "completed" || status === "ready_pickup" },
      { step: deliveryMethod === "pickup" ? "Sẵn sàng nhận tại vườn" : "Hoàn tất giao hàng", time: status === "completed" ? `${day}/11` : "Chờ cập nhật", done: status === "completed" },
    ],
    cancelReason: status === "cancelled" ? "Khách đổi lịch nhận sang cuối tuần (Dữ liệu mô phỏng)" : undefined,
    isDemo: true,
  };
});

export const INITIAL_ORDERS: DemoOrder[] = [...GOLDEN_ORDERS, ...EXTRA_ORDERS];
