"use client";

import React from "react";
import Link from "next/link";
import { Bell, Calendar, Heart, MapPin, PackageCheck, Settings, ShoppingBasket, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";

export default function AccountWorkspacePage() {
  const {
    authUser,
    orders,
    favoriteProductIds,
    products,
    experienceBookings,
    cart,
    notifications,
    addressBook,
  } = useDemoStore();
  const favProducts = products.filter((p) => favoriteProductIds.includes(p.id));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WorkspaceShell
      workspaceId="W01"
      title={
        authUser
          ? `Không gian Cá nhân · ${authUser.name}`
          : "Không gian Cá nhân · Khách mua & Thành viên"
      }
      subtitle="Theo dõi đơn hàng, sổ địa chỉ, nông sản yêu thích và lịch trải nghiệm"
      scopeBadge={authUser ? `${authUser.roleLabel} · ${authUser.unitName}` : "Chế độ Khách · W01"}
      navItems={[
        { label: "Tổng quan cá nhân", href: "/account", icon: <User className="h-4 w-4" />, active: true },
        { label: `Đơn hàng (${orders.length})`, href: "/account/orders", icon: <PackageCheck className="h-4 w-4" /> },
        { label: `Giỏ hàng (${cart.reduce((s, i) => s + i.quantity, 0)})`, href: "/cart", icon: <ShoppingBasket className="h-4 w-4" /> },
        { label: "Cài đặt & Địa chỉ", href: "/account/settings", icon: <Settings className="h-4 w-4" /> },
      ]}
    >
      <div className="space-y-6">
        {!authUser ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-[#D7A34D] bg-[#FFF2D8]/50 p-4">
            <div className="text-xs text-[#25352B]">
              <p className="font-bold">Bạn đang xem dưới chế độ Khách vãng lai.</p>
              <p className="mt-0.5 text-[#52645A]">
                Chọn nhanh một tài khoản để đồng bộ giỏ hàng, lịch sử đơn và quyền không gian làm việc.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="inline-flex min-h-[38px] items-center rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              Đăng nhập / Truy cập nhanh
            </Link>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Đơn hàng đã ghi nhận</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{orders.length}</p>
            <Link href="/account/orders" className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline">
              Xem chi tiết &amp; chuỗi vận chuyển →
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Sản phẩm yêu thích</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{favProducts.length}</p>
            <p className="mt-2 text-xs text-[#52645A]">Lưu cục bộ trong trình duyệt</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Sổ địa chỉ nhận hàng</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{addressBook.length}</p>
            <Link href="/account/settings" className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline">
              Quản lý địa chỉ nhận hàng →
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">Thông báo chưa đọc</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{unreadCount}</p>
            <Link href="/account/settings#notifications" className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline">
              Mở hộp thông báo →
            </Link>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <PackageCheck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Đơn hàng gần nhất</span>
            </h2>
            <Link href="/account/orders" className="text-sm font-semibold text-[#245B3D] hover:underline">
              Xem tất cả ({orders.length}) →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 3).map((ord) => (
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Sổ địa chỉ nhận hàng</span>
              </h2>
              <Link href="/account/settings" className="text-xs font-semibold text-[#245B3D] hover:underline">
                Thêm địa chỉ →
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {addressBook.slice(0, 3).map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#25352B]">{addr.label}</span>
                    {addr.isDefault ? <Badge tone="success">Mặc định</Badge> : null}
                  </div>
                  <p className="mt-1 text-[#52645A]">
                    {addr.recipientName} · {addr.phoneDemo}
                  </p>
                  <p className="mt-0.5 text-[#25352B]">{addr.fullAddress}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <Bell className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Thông báo gần đây</span>
              </h2>
              <Link href="/account/settings#notifications" className="text-xs font-semibold text-[#245B3D] hover:underline">
                Xem tất cả ({notifications.length}) →
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  className="block rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs hover:bg-[#EAF0E5]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#25352B]">{n.title}</span>
                    {!n.read ? <Badge tone="warning">Mới</Badge> : null}
                  </div>
                  <p className="mt-1 text-[#52645A]">{n.message}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Lịch trải nghiệm miệt vườn ({experienceBookings.length})</span>
          </h2>
          <div className="mt-3 space-y-2">
            {experienceBookings.slice(0, 4).map((b) => (
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
