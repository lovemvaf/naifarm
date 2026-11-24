"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PackageCheck, QrCode, ShoppingBasket, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Card, EmptyState } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { orders, cart, products } = useDemoStore();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-[820px] px-4 py-12">
        <EmptyState
          icon={<PackageCheck className="h-6 w-6" />}
          title={`Không tìm thấy đơn hàng ${orderId}`}
          description="Kiểm tra lại danh sách đơn hàng demo hoặc tạo đơn mới từ Giỏ hàng."
          action={
            <Link
              href="/account/orders"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Về danh sách đơn hàng
            </Link>
          }
        />
      </div>
    );
  }

  const firstProduct = products.find((p) => p.id === order.items[0]?.productId);

  return (
    <WorkspaceShell
      workspaceId="W01"
      title={`Chi tiết Đơn hàng ${order.id} (S07)`}
      subtitle="Trạng thái minh họa theo thời gian thực giữa Khách hàng (W01) và Nhà vườn (W02)"
      scopeBadge="COD Demo · Không hiển thị Đã thanh toán online"
      navItems={[
        { label: "Tổng quan cá nhân", href: "/account", icon: <User className="h-4 w-4" /> },
        { label: `Đơn hàng (${orders.length})`, href: "/account/orders", icon: <PackageCheck className="h-4 w-4" />, active: true },
        { label: `Giỏ hàng (${cart.reduce((s, i) => s + i.quantity, 0)})`, href: "/cart", icon: <ShoppingBasket className="h-4 w-4" /> },
      ]}
    >
      <div className="space-y-6">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Tất cả đơn hàng</span>
        </Link>

        <Card className="border-[#245B3D]/30 bg-[#E6F3E9] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-[#24603B]" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">
                  Cảm ơn bạn đã đồng hành cùng nhà nông & Trí thức trẻ Đồng Nai!
                </h2>
                <p className="text-sm text-[#24603B]">
                  Mã đơn <strong className="tabular-nums">{order.id}</strong> · {order.paymentLabel}. Thử chuyển sang{" "}
                  <Link href="/farmer" className="underline font-bold">
                    Không gian Nhà nông (W02)
                  </Link>{" "}
                  để bấm cập nhật trạng thái đơn này.
                </p>
              </div>
            </div>
            <Badge tone="info">{order.status}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-base font-bold text-[#25352B]">Tiến trình xử lý đơn & Chuỗi vận chuyển</h3>
            <ol className="mt-4 space-y-4 border-l-2 border-[#D6DED2] pl-5">
              {order.timeline.map((step, i) => (
                <li key={step.step + i} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full ${
                      step.done ? "bg-[#245B3D]" : "border-2 border-[#788A7B] bg-white"
                    }`}
                  />
                  <p className={`text-sm font-semibold ${step.done ? "text-[#25352B]" : "text-[#52645A]"}`}>
                    {step.step}
                  </p>
                  <p className="text-xs text-[#52645A]">{step.time}</p>
                </li>
              ))}
            </ol>
            {order.cancelReason ? (
              <p className="mt-4 rounded-lg bg-[#FDECEC] p-3 text-xs font-medium text-[#A32D2D]">
                Lý do hủy đơn: {order.cancelReason}
              </p>
            ) : null}
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="text-base font-bold text-[#25352B]">Sản phẩm & Chi tiết thanh toán</h3>
            <div className="space-y-2 border-b border-[#D6DED2] pb-3 text-sm">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2">
                  <span>
                    {item.productName} × {item.quantity} {item.unitLabel}
                  </span>
                  <span className="tabular-nums font-semibold">
                    {formatVnd(item.unitPriceVnd * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#52645A]">Tạm tính nông sản</span>
                <span className="tabular-nums">{formatVnd(order.subtotalVnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52645A]">Phí vận chuyển</span>
                <span className="tabular-nums">{formatVnd(order.shippingFeeVnd)}</span>
              </div>
              <div className="flex justify-between border-t border-[#D6DED2] pt-2 text-base font-bold text-[#245B3D]">
                <span>Tổng cần thanh toán COD (Demo)</span>
                <span className="tabular-nums">{formatVnd(order.totalVnd)}</span>
              </div>
            </div>
            <p className="text-xs text-[#52645A]">Địa chỉ: {order.deliveryAddress}</p>
            {firstProduct ? (
              <Link
                href={`/trace/${firstProduct.batchCode}`}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[#245B3D] bg-[#EAF0E5] px-4 text-xs font-semibold text-[#245B3D]"
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
                <span>Xem Hộ chiếu QR lô {firstProduct.batchCode}</span>
              </Link>
            ) : null}
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
