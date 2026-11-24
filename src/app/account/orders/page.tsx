"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck, ShoppingBasket, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import type { OrderStatus } from "@/types/naifarm";

const STATUS_META: Record<OrderStatus, { label: string; tone: "warning" | "info" | "success" | "danger" }> = {
  pending_confirm: { label: "Chờ nhà vườn xác nhận", tone: "warning" },
  preparing: { label: "Đang chuẩn bị tại vườn", tone: "info" },
  shipping: { label: "Đang trên xe mát", tone: "info" },
  ready_pickup: { label: "Sẵn sàng nhận tại vườn", tone: "success" },
  completed: { label: "Đã giao hoàn tất (Demo)", tone: "success" },
  cancelled: { label: "Đã hủy", tone: "danger" },
};

export default function OrdersListPage() {
  const { orders, cart } = useDemoStore();

  return (
    <WorkspaceShell
      workspaceId="W01"
      title="Theo dõi Đơn hàng & Chuỗi vận chuyển lạnh (S07)"
      subtitle="Cùng mã đơn với Nhà vườn W02 — mọi thay đổi trạng thái tại W02 cập nhật trực tiếp tại đây"
      scopeBadge="COD Demo · Không thu tiền thật"
      navItems={[
        { label: "Tổng quan cá nhân", href: "/account", icon: <User className="h-4 w-4" /> },
        { label: `Đơn hàng (${orders.length})`, href: "/account/orders", icon: <PackageCheck className="h-4 w-4" />, active: true },
        { label: `Giỏ hàng (${cart.reduce((s, i) => s + i.quantity, 0)})`, href: "/cart", icon: <ShoppingBasket className="h-4 w-4" /> },
      ]}
    >
      <div className="space-y-4">
        {orders.map((ord) => {
          const meta = STATUS_META[ord.status];
          return (
            <Card key={ord.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D6DED2] pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-base font-bold text-[#245B3D]">{ord.id}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {ord.farmName} · Đặt lúc {ord.createdAtLabel} · {ord.paymentLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-lg font-bold text-[#245B3D]">{formatVnd(ord.totalVnd)}</p>
                  <p className="text-xs text-[#52645A]">
                    {ord.deliveryMethod === "pickup" ? "Nhận tại vườn (0 đ)" : "Giao tận nơi (+20.000 đ)"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={ord.items[0]?.image || "/images/stitch/stitch-07.jpg"}
                    alt={ord.items[0]?.productName || ord.id}
                    className="h-16 w-20 rounded-[10px] border border-[#D6DED2] object-cover"
                  />
                  <div className="text-sm">
                    {ord.items.map((item) => (
                      <p key={item.productId} className="font-semibold text-[#25352B]">
                        {item.productName} × {item.quantity} {item.unitLabel}
                      </p>
                    ))}
                    <p className="text-xs text-[#52645A]">{ord.deliveryAddress}</p>
                  </div>
                </div>

                <Link
                  href={`/account/orders/${ord.id}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>Theo dõi chi tiết</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}
