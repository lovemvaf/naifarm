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
  const { hydrated, cart, products, placeDemoOrder, profile } = useDemoStore();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [customerName, setCustomerName] = useState(profile?.fullName ?? "");
  const [customerPhone, setCustomerPhone] = useState(profile?.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("Phường Trấn Biên, TP. Đồng Nai");
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

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12 text-sm text-muted">
        Đang tải thông tin thanh toán...
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title="Chưa có sản phẩm để thanh toán"
          description="Quay lại Chợ OCOP để chọn nông sản trước khi đặt đơn hàng."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-white"
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
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Quay lại Giỏ hàng</span>
      </Link>

      <div>
        <Badge tone="gold">W01 · R4 · S06 Đặt hàng COD</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-foreground">
          Xác nhận Phương thức Nhận hàng & Đặt đơn
        </h1>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (submitting) return;
          if (deliveryMethod === "delivery" && deliveryAddress.trim().length < 5) {
            toast.error("Vui lòng nhập địa chỉ giao hàng khi chọn Giao tận nơi.");
            return;
          }
          setSubmitting(true);
          const res = await placeDemoOrder({
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
            <h2 className="text-lg font-bold text-foreground">1. Chọn hình thức nhận nông sản</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer flex-col justify-between rounded-[14px] border-2 p-4 ${
                  deliveryMethod === "delivery"
                    ? "border-primary bg-surface-soft/70"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">Giao tận nơi (Xe mát HTX)</p>
                    <p className="mt-1 text-xs text-muted">
                      Giao trong ngày tuyến Đồng Nai – TP.HCM
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "delivery"}
                    onChange={() => setDeliveryMethod("delivery")}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                </div>
                <p className="mt-3 tabular-nums text-sm font-bold text-primary">+20.000 đ</p>
              </label>

              <label
                className={`flex cursor-pointer flex-col justify-between rounded-[14px] border-2 p-4 ${
                  deliveryMethod === "pickup"
                    ? "border-primary bg-surface-soft/70"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">Nhận trực tiếp tại vườn</p>
                    <p className="mt-1 text-xs text-muted">
                      Ghé thăm vườn & đối chiếu tận tay cùng chủ vườn
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                </div>
                <p className="mt-3 tabular-nums text-sm font-bold text-success">0 đ (Miễn phí)</p>
              </label>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-foreground">2. Thông tin người nhận</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="block text-sm font-semibold text-foreground">
                  Họ tên khách hàng
                </label>
                <input
                  id="co-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-input bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="co-phone" className="block text-sm font-semibold text-foreground">
                  Số liên hệ
                </label>
                <input
                  id="co-phone"
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-input bg-white px-3 text-sm"
                />
              </div>
            </div>

            {deliveryMethod === "delivery" ? (
              <div>
                <label htmlFor="co-address" className="block text-sm font-semibold text-foreground">
                  Địa chỉ giao hàng
                </label>
                <input
                  id="co-address"
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1 min-h-[46px] w-full rounded-[10px] border border-input bg-white px-3 text-sm"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-soft px-3.5 py-3 text-sm text-primary">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Bạn sẽ nhận hàng trực tiếp tại {detailed[0].product.farmName} (0 đ phí giao).</span>
              </div>
            )}

            <div className="rounded-[12px] border border-border bg-warning-bg/60 p-3.5 text-sm text-foreground">
              <p className="font-bold">Thanh toán: COD (Thanh toán khi nhận hàng)</p>
              <p className="mt-0.5 text-xs text-muted">
                Chưa tích hợp cổng thanh toán ngân hàng hay ví điện tử.
              </p>
            </div>
          </Card>
        </div>

        <Card className="h-fit space-y-4 p-5 lg:col-span-5">
          <h2 className="text-lg font-bold text-foreground">Tóm tắt đơn hàng</h2>
          <ul className="space-y-3 border-b border-border pb-4">
            {detailed.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{product.name}</p>
                  <p className="tabular-nums text-xs text-muted">
                    {quantity} {product.unitLabel} × {formatVnd(product.priceVnd)}
                  </p>
                </div>
                <span className="tabular-nums font-bold text-foreground">
                  {formatVnd(product.priceVnd * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Tiền hàng</span>
              <span className="tabular-nums font-semibold">{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">
                {deliveryMethod === "delivery" ? "Phí giao tận nơi" : "Nhận tại vườn"}
              </span>
              <span className="tabular-nums font-semibold">{formatVnd(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <span className="font-bold text-foreground">Tổng cộng (COD)</span>
              <span className="tabular-nums text-xl font-bold text-primary">{formatVnd(total)}</span>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span>{submitting ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}</span>
          </Button>

          <p className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>Đơn hàng mới sẽ xuất hiện ngay tại Không gian Nhà nông W02 để xử lý.</span>
          </p>
        </Card>
      </form>
    </div>
  );
}
