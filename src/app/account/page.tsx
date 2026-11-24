"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Heart, PackageCheck, ShoppingBasket, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";

export default function AccountWorkspacePage() {
  const { orders, favoriteProductIds, products, experienceBookings, cart } = useDemoStore();
  const favProducts = products.filter((p) => favoriteProductIds.includes(p.id));

  return (
    <WorkspaceShell
      workspaceId="W01"
      title="Không gian Cá nhân · Khách hàng Ngọc Linh (Demo)"
      subtitle="Theo dõi đơn hàng COD demo, nông sản yêu thích và lịch đặt trải nghiệm tại vườn"
      scopeBadge="W01 Cá nhân · TP.HCM / Đồng Nai (Demo)"
      navItems={[
        { label: "Tổng quan cá nhân", href: "/account", icon: <User className="h-4 w-4" />, active: true },
        { label: `Đơn hàng (${orders.length})`, href: "/account/orders", icon: <PackageCheck className="h-4 w-4" /> },
        { label: `Giỏ hàng (${cart.reduce((s, i) => s + i.quantity, 0)})`, href: "/cart", icon: <ShoppingBasket className="h-4 w-4" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Đơn hàng Demo</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{orders.length}</p>
            <Link href="/account/orders" className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline">
              Xem chi tiết & chuỗi vận chuyển →
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Sản phẩm yêu thích</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{favProducts.length}</p>
            <p className="mt-2 text-xs text-[#52645A]">Lưu tạm trên trình duyệt demo</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Lịch trải nghiệm đã gửi</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">
              {experienceBookings.length}
            </p>
            <p className="mt-2 text-xs text-[#52645A]">Trạng thái chờ chủ vườn xác nhận</p>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <PackageCheck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Đơn hàng gần nhất (Đồng bộ W01 ↔ W02)</span>
            </h2>
            <Link href="/account/orders" className="text-sm font-semibold text-[#245B3D] hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 2).map((ord) => (
              <Link
                key={ord.id}
                href={`/account/orders/${ord.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-4 hover:bg-[#EAF0E5]"
              >
                <div>
                  <p className="tabular-nums font-bold text-[#245B3D]">{ord.id}</p>
                  <p className="text-sm font-semibold text-[#25352B]">
                    {ord.items.map((i) => `${i.productName} (${i.quantity} ${i.unitLabel})`).join(", ")}
                  </p>
                  <p className="text-xs text-[#52645A]">{ord.farmName} · {ord.createdAtLabel}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums font-bold text-[#25352B]">{formatVnd(ord.totalVnd)}</p>
                  <Badge tone="info" className="mt-1">{ord.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Lịch trải nghiệm miệt vườn</span>
          </h2>
          <div className="mt-3 space-y-2">
            {experienceBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/50 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#25352B]">{b.packageTitle}</p>
                  <p className="text-xs text-[#52645A]">
                    {b.farmName} · {b.guestCount} khách · Ngày {b.dateLabel}
                  </p>
                </div>
                <Badge tone="warning">{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Heart className="h-5 w-5 text-[#A32D2D]" aria-hidden="true" />
            <span>Nông sản đã lưu yêu thích ({favProducts.length})</span>
          </h2>
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3">
            {favProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
