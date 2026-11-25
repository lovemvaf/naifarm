"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  MapPin,
  QrCode,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { applyPromotionsToCart } from "@/lib/commerce/promotion-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import { SepayPaymentBox } from "@/components/payment/SepayPaymentBox";

const DELIVERY_SLOTS = [
  "Sáng hôm nay (08:30 – 11:30)",
  "Chiều hôm nay (14:00 – 17:30)",
  "Sáng mai (08:30 – 11:30)",
  "Cuối tuần (09:00 – 16:00)",
];

export default function CheckoutPage() {
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";
  const {
    cart,
    products,
    orders,
    addressBook,
    authUser,
    promotions,
    appliedPromoCodes,
    activeClockIso,
    placeDemoOrder,
    markOrderPaid,
  } = useDemoStore();

  const [customerName, setCustomerName] = useState(authUser?.name ?? "Ngọc Linh");
  const [customerPhone, setCustomerPhone] = useState("090x xxx 128");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "sepay_bank">("sepay_bank");
  const [addressScope, setAddressScope] = useState<"dongnai" | "outside">("dongnai");
  const [unitCode, setUnitCode] = useState(authUser?.unitCode ?? "26041");
  const [streetDetail, setStreetDetail] = useState("Số 18 Đường Nguyễn Ái Quốc");
  const [outsideAddress, setOutsideAddress] = useState("TP. Hồ Chí Minh — Quận Bình Thạnh, Số 45 Điện Biên Phủ");
  const [deliverySlotLabel, setDeliverySlotLabel] = useState(DELIVERY_SLOTS[1]);
  const [couponCode, setCouponCode] = useState("");
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);

  const lineSummary = useMemo(() => {
    const farms = new Set<string>();
    let subtotal = 0;
    for (const c of cart) {
      const p = products.find((x) => x.id === c.productId);
      if (!p) continue;
      farms.add(p.farmId);
      const opt = p.weightOptions?.find((o) => o.label === c.selectedOptionLabel);
      subtotal += (opt?.priceVnd ?? p.priceVnd) * c.quantity;
    }
    return {
      farmCount: Math.max(1, farms.size),
      subtotalVnd: subtotal,
    };
  }, [cart, products]);

  const activeCodes = [
    ...(couponCode.trim() ? [couponCode.trim().toUpperCase()] : []),
    ...appliedPromoCodes,
  ];
  const shippingFeeVnd = deliveryMethod === "delivery" ? lineSummary.farmCount * 20000 : 0;
  const promoEvaluation = applyPromotionsToCart(
    promotions,
    activeCodes,
    lineSummary.subtotalVnd,
    shippingFeeVnd,
    locale,
    activeClockIso,
    Boolean(authUser?.isMinor),
  );
  const discountVnd = promoEvaluation.totalMerchDiscountVnd;
  const totalVnd = promoEvaluation.finalTotalVnd;

  const selectedUnit = ADMINISTRATIVE_UNITS.find((u) => u.maDvhc === unitCode);
  const composedAddress =
    deliveryMethod === "pickup"
      ? "Nhận trực tiếp tại nhà vườn theo mã đơn"
      : addressScope === "dongnai"
      ? `${streetDetail.trim() || "Trung tâm"}, ${selectedUnit?.diaChiChuan ?? "Tỉnh Đồng Nai"}`
      : outsideAddress.trim() || "Ngoài tỉnh Đồng Nai";

  if (placedOrderIds.length > 0) {
    const placedOrders = orders.filter((o) => placedOrderIds.includes(o.id));
    return (
      <div className="mx-auto max-w-[780px] space-y-6 px-4 py-10">
        <Card className="space-y-5 border-[#245B3D] p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E6F3E9] text-[#24603B]">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <Badge tone="success">Đã ghi nhận đơn hàng</Badge>
              <h1 className="mt-2 font-editorial text-2xl font-bold text-[#25352B]">
                Đặt hàng thành công ({placedOrderIds.length} đơn theo nhà vườn)
              </h1>
              <p className="mt-1 text-sm text-[#52645A]">
                {paymentMethod === "sepay_bank"
                  ? "Vui lòng quét mã VietQR bên dưới để chuyển khoản tới MBBank (tự động xác nhận qua SePay Webhook)."
                  : "Đơn hàng trong không gian trải nghiệm, không phát sinh thanh toán hoặc giao hàng thực tế."}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-[14px] bg-[#FAF8F1] p-4">
            <p className="text-xs font-bold text-[#52645A] uppercase">Mã đơn vừa tạo</p>
            <div className="flex flex-wrap gap-2">
              {placedOrderIds.map((oid) => (
                <Link
                  key={oid}
                  href={`/account/orders/${oid}`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-3.5 text-sm font-bold text-[#245B3D] hover:bg-[#EAF0E5]"
                >
                  <span>{oid}</span>
                </Link>
              ))}
            </div>
          </div>

          {paymentMethod === "sepay_bank" ? (
            <div className="space-y-4">
              {placedOrders.map((ord) => (
                <SepayPaymentBox
                  key={ord.id}
                  orderId={ord.id}
                  amountVnd={ord.totalVnd}
                  initialPaid={ord.paymentStatus === "paid_bank"}
                  onPaymentSuccess={() => markOrderPaid(ord.id)}
                />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/orders"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              Xem toàn bộ đơn hàng
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[12px] border border-[#D6DED2] bg-white px-5 text-sm font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              Tiếp tục khám phá chợ OCOP
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1160px] space-y-6 px-4 py-8 lg:px-6">
      <div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay lại giỏ hàng</span>
        </Link>
        <h1 className="mt-2 font-editorial text-2xl font-bold text-[#25352B] md:text-3xl">
          Xác nhận thông tin đặt hàng
        </h1>
      </div>

      {cart.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" aria-hidden="true" />}
          title="Chưa có sản phẩm để thanh toán"
          description="Vui lòng chọn nông sản vào giỏ trước khi tạo đơn."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[46px] items-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Mở Chợ nông sản
            </Link>
          }
        />
      ) : (
        <form
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
          onSubmit={(e) => {
            e.preventDefault();
            const res = placeDemoOrder({
              customerName,
              customerPhoneDemo: customerPhone,
              deliveryMethod,
              deliveryAddress: composedAddress,
              deliverySlotLabel,
              couponCode: couponCode.trim() || undefined,
              paymentMethod,
            });
            if (!res.ok) {
              notifyError(res.message);
              return;
            }
            notifySuccess(res.message);
            setPlacedOrderIds(res.orderIds ?? (res.orderId ? [res.orderId] : []));
          }}
        >
          <div className="space-y-5 lg:col-span-8">
            <Card className="space-y-4 p-5">
              <h2 className="text-base font-bold text-[#25352B]">1. Người nhận nông sản</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="chk-name" className="block text-xs font-semibold text-[#25352B]">
                    Họ tên người nhận
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-semibold text-[#25352B]">
                    Số liên hệ
                  </label>
                  <input
                    id="chk-phone"
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                  />
                </div>
              </div>

              {addressBook.length > 0 ? (
                <div className="space-y-2 border-t border-[#EAEFE6] pt-3">
                  <p className="text-xs font-semibold text-[#52645A]">Chọn nhanh từ sổ địa chỉ đã lưu:</p>
                  <div className="flex flex-wrap gap-2">
                    {addressBook.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setCustomerName(addr.recipientName);
                          setCustomerPhone(addr.phoneDemo);
                          setAddressScope("dongnai");
                          setUnitCode(addr.administrativeUnitCode);
                          setStreetDetail(addr.detailAddress);
                        }}
                        className="cursor-pointer rounded-full border border-[#D6DED2] bg-[#FAF8F1] px-3 py-1.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                      >
                        {addr.label}: {addr.recipientName}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="space-y-4 p-5">
              <h2 className="text-base font-bold text-[#25352B]">2. Phương thức &amp; địa chỉ nhận hàng</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-[12px] border p-3.5 text-left ${
                    deliveryMethod === "delivery"
                      ? "border-[#245B3D] bg-[#EAF0E5]"
                      : "border-[#D6DED2] bg-white"
                  }`}
                >
                  <Truck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#25352B]">Giao tận nơi</p>
                    <p className="text-xs text-[#52645A]">20.000 đ / mỗi nhà vườn</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-[12px] border p-3.5 text-left ${
                    deliveryMethod === "pickup"
                      ? "border-[#245B3D] bg-[#EAF0E5]"
                      : "border-[#D6DED2] bg-white"
                  }`}
                >
                  <MapPin className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#25352B]">Nhận trực tiếp tại vườn</p>
                    <p className="text-xs text-[#52645A]">Miễn phí vận chuyển</p>
                  </div>
                </button>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-3 border-t border-[#EAEFE6] pt-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressScope("dongnai")}
                      className={`min-h-[38px] cursor-pointer rounded-full px-4 text-xs font-semibold ${
                        addressScope === "dongnai"
                          ? "bg-[#245B3D] text-white"
                          : "border border-[#D6DED2] bg-white text-[#25352B]"
                      }`}
                    >
                      Trong tỉnh Đồng Nai (95 xã/phường)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressScope("outside")}
                      className={`min-h-[38px] cursor-pointer rounded-full px-4 text-xs font-semibold ${
                        addressScope === "outside"
                          ? "bg-[#245B3D] text-white"
                          : "border border-[#D6DED2] bg-white text-[#25352B]"
                      }`}
                    >
                      Ngoài tỉnh (TP.HCM, Bình Dương, Hà Nội...)
                    </button>
                  </div>

                  {addressScope === "dongnai" ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="chk-unit" className="block text-xs font-semibold text-[#25352B]">
                          Xã / Phường thuộc tỉnh Đồng Nai
                        </label>
                        <select
                          id="chk-unit"
                          value={unitCode}
                          onChange={(e) => setUnitCode(e.target.value)}
                          className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                        >
                          {ADMINISTRATIVE_UNITS.map((u) => (
                            <option key={u.maDvhc} value={u.maDvhc}>
                              {u.tenDayDu} ({u.maDvhc})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="chk-street" className="block text-xs font-semibold text-[#25352B]">
                          Số nhà / Tên đường / Ấp
                        </label>
                        <input
                          id="chk-street"
                          type="text"
                          value={streetDetail}
                          onChange={(e) => setStreetDetail(e.target.value)}
                          className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="chk-outside" className="block text-xs font-semibold text-[#25352B]">
                        Địa chỉ nhận hàng ngoài tỉnh Đồng Nai
                      </label>
                      <input
                        id="chk-outside"
                        type="text"
                        value={outsideAddress}
                        onChange={(e) => setOutsideAddress(e.target.value)}
                        placeholder="Ví dụ: TP. Thủ Đức, TP. Hồ Chí Minh - Số 12 Võ Văn Ngân"
                        className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="chk-slot" className="block text-xs font-semibold text-[#25352B]">
                      Khung giờ mong muốn
                    </label>
                    <select
                      id="chk-slot"
                      value={deliverySlotLabel}
                      onChange={(e) => setDeliverySlotLabel(e.target.value)}
                      className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                    >
                      {DELIVERY_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="space-y-4 p-5">
              <h2 className="text-base font-bold text-[#25352B]">3. Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sepay_bank")}
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-[12px] border p-3.5 text-left transition-all ${
                    paymentMethod === "sepay_bank"
                      ? "border-[#245B3D] bg-[#EAF0E5]"
                      : "border-[#D6DED2] bg-white hover:border-[#788A7B]"
                  }`}
                >
                  <QrCode className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#25352B]">Chuyển khoản VietQR</p>
                      <Badge tone="success" className="text-[10px] px-2 py-0.5">SePay · MBBank</Badge>
                    </div>
                    <p className="text-xs text-[#52645A]">Quét mã QR qua MBBank, tự động xác nhận</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-[12px] border p-3.5 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#245B3D] bg-[#EAF0E5]"
                      : "border-[#D6DED2] bg-white hover:border-[#788A7B]"
                  }`}
                >
                  <Banknote className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#25352B]">Thanh toán khi nhận (COD)</p>
                    <p className="text-xs text-[#52645A]">Tiền mặt khi giao tận nơi hoặc tại vườn</p>
                  </div>
                </button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-24 space-y-4 p-5">
              <h2 className="text-base font-bold text-[#25352B]">
                {isEn ? "Order Summary" : "Tóm tắt đơn hàng"}
              </h2>
              <div>
                <label htmlFor="chk-coupon" className="flex items-center gap-1.5 text-xs font-semibold text-[#25352B]">
                  <Tag className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  <span>{t.commerce.promoCodePlaceholder}</span>
                </label>
                <input
                  id="chk-coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="DANGBAN25, HTXTANTRIEU, NAIFARM10..."
                  className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm uppercase"
                />
                {promoEvaluation.rejected.map((rej) => (
                  <p key={rej.code} className="mt-1 text-[11px] font-medium text-[#A32D2D]">
                    {isEn ? rej.reasonEn : rej.reasonVi}
                  </p>
                ))}
              </div>

              <div className="space-y-2 border-y border-[#EAEFE6] py-3 text-sm">
                <div className="flex justify-between text-[#52645A]">
                  <span>{t.commerce.subtotalLabel}</span>
                  <span className="tabular-nums font-semibold text-[#25352B]">
                    {formatVnd(lineSummary.subtotalVnd, locale, showUsd)}
                  </span>
                </div>
                <div className="flex justify-between text-[#52645A]">
                  <span>{t.commerce.discountLabel}</span>
                  <span className="tabular-nums font-semibold text-[#24603B]">
                    -{formatVnd(discountVnd, locale)}
                  </span>
                </div>
                <div className="flex justify-between text-[#52645A]">
                  <span>{t.commerce.shippingEstimateLabel}</span>
                  <span className="tabular-nums font-semibold text-[#25352B]">
                    {formatVnd(Math.max(0, shippingFeeVnd - promoEvaluation.totalShipDiscountVnd), locale)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-bold text-[#245B3D]">
                  <span>{t.commerce.totalLabel}</span>
                  <span className="tabular-nums">{formatVnd(totalVnd, locale, showUsd)}</span>
                </div>
              </div>

              <div className="rounded-[12px] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
                <p className="inline-flex items-center gap-1 font-semibold text-[#25352B]">
                  <Sparkles className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  <span>{t.commerce.checkoutExperienceNotice}</span>
                </p>
                {showUsd ? <p className="mt-1 text-[#80520C]">{t.commerce.usdEstimateNote}</p> : null}
                <p className="mt-1">
                  <Link href={buildLocalizedHref("/events?tab=deals", locale)} className="font-semibold text-[#245B3D] underline">
                    {t.events.tabDeals} →
                  </Link>
                </p>
              </div>

              {authUser?.isMinor ? (
                <div className="rounded-[10px] border border-[#A32D2D] bg-[#FDECEC] p-3 text-xs font-semibold text-[#A32D2D]">
                  {isEn
                    ? "Supervised minor account cannot place independent commercial orders."
                    : "Tài khoản học sinh dưới 18 tuổi không tự chốt đơn thương mại."}
                </div>
              ) : null}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={Boolean(authUser?.isMinor)}>
                {t.commerce.confirmOrderBtn}
              </Button>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
