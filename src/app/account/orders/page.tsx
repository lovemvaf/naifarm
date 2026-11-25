"use client";

import Image from "next/image";

import React from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck, ShoppingBasket, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import type { OrderStatus } from "@/types/naifarm";
import { assetUrl } from "@/lib/storage/assets";

const STATUS_META: Record<OrderStatus, { label: string; tone: "warning" | "info" | "success" | "danger" }> = {
  pending_confirm: { label: "Chờ nhà vườn xác nhận", tone: "warning" },
  preparing: { label: "Đang chuẩn bị tại vườn", tone: "info" },
  shipping: { label: "Đang trên xe mát", tone: "info" },
  ready_pickup: { label: "Sẵn sàng nhận tại vườn", tone: "success" },
  completed: { label: "Đã giao hoàn tất", tone: "success" },
  cancelled: { label: "Đã hủy", tone: "danger" },
};

export default function OrdersListPage() {
  const { hydrated, orders, cart } = useDemoStore();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-muted">
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W01"
      title="Theo dõi Đơn hàng & Chuỗi vận chuyển lạnh (S07)"
      subtitle="Cùng mã đơn với Nhà vườn W02 — mọi thay đổi trạng thái tại W02 cập nhật trực tiếp tại đây"
      scopeBadge="COD · Thanh toán khi nhận hàng"
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
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-base font-bold text-primary">{ord.id}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {ord.farmName} · Đặt lúc {ord.createdAtLabel} · {ord.paymentLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-lg font-bold text-primary">{formatVnd(ord.totalVnd)}</p>
                  <p className="text-xs text-muted">
                    {ord.deliveryMethod === "pickup" ? "Nhận tại vườn (0 đ)" : "Giao tận nơi (+20.000 đ)"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={assetUrl(ord.items[0]?.image || "stitch/stitch-07.webp")}
                    alt={ord.items[0]?.productName || ord.id}
                    className="h-16 w-20 rounded-[10px] border border-border object-cover"
                    width={512}
                    height={279}
                  />
                  <div className="text-sm">
                    {ord.items.map((item) => (
                      <p key={item.productId} className="font-semibold text-foreground">
                        {item.productName} × {item.quantity} {item.unitLabel}
                      </p>
                    ))}
                    <p className="text-xs text-muted">{ord.deliveryAddress}</p>
                  </div>
                </div>

                <Link
                  href={`/account/orders/${ord.id}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover"
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
