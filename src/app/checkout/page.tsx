"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { DeliveryMethod } from "@/types/naifarm";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, products, addressBook, placeDemoOrder } = useDemoStore();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [customerName, setCustomerName] = useState("Ngọc Linh (Demo)");
  const [customerPhone, setCustomerPhone] = useState("090x xxx 128");
  const [deliveryAddress, setDeliveryAddress] = useState(
    addressBook[0]?.fullAddress ??
      "Số 45/2 Đường Nguyễn Ái Quốc, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam (Địa chỉ minh họa)",
  );
  const [submitting, setSubmitting] = useState(false);

  const detailed = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.productId);
      return p ? { ...c, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = detailed.reduce((sum, i) => sum + i.product.priceVnd * i.quantity, 0);
  const shippingFee = deliveryMethod === "delivery" ? 20000 : 0;
  const total = subtotal + shippingFee;

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title="Chưa có sản phẩm để thanh toán"
          description="Quay lại Chợ OCOP để chọn nông sản trước khi đặt đơn hàng demo."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Về Chợ OCOP
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-4 py-8 lg:px-8">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Quay lại Giỏ hàng</span>
      </Link>

      <div>
        <Badge tone="gold">W01 · R4 · S06 Đặt hàng COD Demo (NaiAI tạm ẩn để tập trung)</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Xác nhận Phương thức Nhận hàng & Đặt đơn Demo
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (submitting) return;
          if (deliveryMethod === "delivery" && deliveryAddress.trim().length < 5) {
            toast.error("Vui lòng nhập địa chỉ giao hàng minh họa khi chọn Giao tận nơi.");
            return;
          }
          setSubmitting(true);
          const res = placeDemoOrder({
            customerName,
            customerPhoneDemo: customerPhone,
            deliveryMethod,
            deliveryAddress,
          });
          if (res.ok && res.orderId) {
            toast.success(res.message);
            router.push(`/account/orders/${res.orderId}`);
          } else {
            toast.error(res.message);
            setSubmitting(false);
          }
        }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="space-y-5 lg:col-span-7">
          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-[#25352B]">1. Chọn hình thức nhận nông sản</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer flex-col justify-between rounded-[14px] border-2 p-4 ${
                  deliveryMethod === "delivery"
                    ? "border-[#245B3D] bg-[#EAF0E5]/70"
                    : "border-[#D6DED2] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#25352B]">Giao tận nơi (Xe mát HTX)</p>
                    <p className="mt-1 text-xs text-[#52645A]">
                      Giao trong ngày tuyến Đồng Nai – TP.HCM
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "delivery"}
                    onChange={() => setDeliveryMethod("delivery")}
                    className="mt-1 h-4 w-4 accent-[#245B3D]"
                  />
                </div>
                <p className="mt-3 tabular-nums text-sm font-bold text-[#245B3D]">+20.000 đ (Demo)</p>
              </label>

              <label
                className={`flex cursor-pointer flex-col justify-between rounded-[14px] border-2 p-4 ${
                  deliveryMethod === "pickup"
                    ? "border-[#245B3D] bg-[#EAF0E5]/70"
                    : "border-[#D6DED2] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#25352B]">Nhận trực tiếp tại vườn</p>
                    <p className="mt-1 text-xs text-[#52645A]">
                      Ghé thăm vườn & đối chiếu tận tay cùng chủ vườn
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="mt-1 h-4 w-4 accent-[#245B3D]"
                  />
                </div>
                <p className="mt-3 tabular-nums text-sm font-bold text-[#24603B]">0 đ (Miễn phí)</p>
              </label>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-[#25352B]">2. Thông tin người nhận (Dữ liệu Demo)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="block text-sm font-semibold text-[#25352B]">
                  Họ tên khách hàng (Demo)
                </label>
                <input
                  id="co-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="co-phone" className="block text-sm font-semibold text-[#25352B]">
                  Số liên hệ minh họa
                </label>
                <input
                  id="co-phone"
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                />
              </div>
            </div>

            {deliveryMethod === "delivery" ? (
              <div>
                <label htmlFor="co-address" className="block text-sm font-semibold text-[#25352B]">
                  Địa chỉ giao hàng minh họa
                </label>
                <input
                  id="co-address"
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-[10px] bg-[#EAF0E5] px-3.5 py-3 text-sm text-[#245B3D]">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Bạn sẽ nhận hàng trực tiếp tại {detailed[0].product.farmName} (0 đ phí giao).</span>
              </div>
            )}

            <div className="rounded-[12px] border border-[#D6DED2] bg-[#FFF2D8]/60 p-3.5 text-sm text-[#25352B]">
              <p className="font-bold">Thanh toán: COD Demo (Mô phỏng khi nhận hàng)</p>
              <p className="mt-0.5 text-xs text-[#52645A]">
                Không tích hợp cổng thanh toán ngân hàng hay ví điện tử thật ở giai đoạn prototype.
              </p>
            </div>
          </Card>
        </div>

        <Card className="h-fit space-y-4 p-5 lg:col-span-5">
          <h2 className="text-lg font-bold text-[#25352B]">Tóm tắt đơn hàng Demo</h2>
          <ul className="space-y-3 border-b border-[#D6DED2] pb-4">
            {detailed.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#25352B]">{product.name}</p>
                  <p className="tabular-nums text-xs text-[#52645A]">
                    {quantity} {product.unitLabel} × {formatVnd(product.priceVnd)}
                  </p>
                </div>
                <span className="tabular-nums font-bold text-[#25352B]">
                  {formatVnd(product.priceVnd * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#52645A]">Tiền hàng</span>
              <span className="tabular-nums font-semibold">{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52645A]">
                {deliveryMethod === "delivery" ? "Phí giao tận nơi (Demo)" : "Nhận tại vườn"}
              </span>
              <span className="tabular-nums font-semibold">{formatVnd(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#D6DED2] pt-3 text-base">
              <span className="font-bold text-[#25352B]">Tổng cộng (COD Demo)</span>
              <span className="tabular-nums text-xl font-bold text-[#245B3D]">{formatVnd(total)}</span>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span>{submitting ? "Đang tạo đơn demo..." : "Xác nhận đặt hàng (Demo)"}</span>
          </Button>

          <p className="flex items-center gap-1.5 text-xs text-[#52645A]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <span>Đơn hàng mới sẽ xuất hiện ngay tại Không gian Nhà nông W02 để xử lý.</span>
          </p>
        </Card>
      </form>
    </div>
  );
}
