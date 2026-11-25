"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  ExternalLink,
  Heart,
  MapPin,
  PackageCheck,
  Settings,
  ShoppingBasket,
  User,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { Badge, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";

export default function AccountWorkspacePage() {
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

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
          ? `${t.workspaces.w01Title} · ${authUser.name}`
          : t.workspaces.w01Title
      }
      navItems={[
        {
          label: isEn ? "Account Overview" : "Tổng quan cá nhân",
          href: "/account",
          icon: <User className="h-4 w-4" />,
          active: true,
        },
        {
          label: `${isEn ? "Orders" : "Đơn hàng"} (${orders.length})`,
          href: "/account/orders",
          icon: <PackageCheck className="h-4 w-4" />,
        },
        {
          label: `${t.nav.favorites} (${favProducts.length})`,
          href: "/account/favorites",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          label: `${t.nav.cartShort} (${cart.reduce((s, i) => s + i.quantity, 0)})`,
          href: "/cart",
          icon: <ShoppingBasket className="h-4 w-4" />,
        },
        {
          label: t.nav.accountSettings,
          href: "/account/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ]}
    >
      <div className="space-y-6">
        {!authUser ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-[#D7A34D] bg-[#FFF2D8]/50 p-4">
            <div className="text-xs text-[#25352B]">
              <p className="font-bold">
                {isEn
                  ? "Browsing as a guest visitor."
                  : "Bạn đang xem dưới chế độ Khách vãng lai."}
              </p>
              <p className="mt-0.5 text-[#52645A]">
                {isEn
                  ? "Choose an experience profile to sync your cart, orders, tour bookings, and workspace permissions."
                  : "Chọn nhanh một tài khoản để đồng bộ giỏ hàng, lịch sử đơn, đặt lịch tour và quyền không gian làm việc."}
              </p>
            </div>
            <Link
              href={buildLocalizedHref("/sign-in", locale)}
              className="inline-flex min-h-[38px] items-center rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              {t.nav.signIn} / {t.nav.quickAccess}
            </Link>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">{isEn ? "Recorded orders" : "Đơn hàng đã ghi nhận"}</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{orders.length}</p>
            <Link
              href={buildLocalizedHref("/account/orders", locale)}
              className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Track orders & deliveries →" : "Xem chi tiết & chuỗi vận chuyển →"}
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">{isEn ? "Saved favorites" : "Sản phẩm yêu thích"}</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{favProducts.length}</p>
            <Link
              href={buildLocalizedHref("/account/favorites", locale)}
              className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Open Favorites & Compare →" : "Mở Yêu thích & So sánh →"}
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">{isEn ? "Saved addresses" : "Sổ địa chỉ nhận hàng"}</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{addressBook.length}</p>
            <Link
              href={buildLocalizedHref("/account/settings", locale)}
              className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Manage addresses →" : "Quản lý địa chỉ nhận hàng →"}
            </Link>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#52645A]">{isEn ? "Unread alerts" : "Thông báo chưa đọc"}</p>
            <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">{unreadCount}</p>
            <Link
              href={buildLocalizedHref("/account/settings#notifications", locale)}
              className="mt-2 inline-block text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Open notifications →" : "Mở hộp thông báo →"}
            </Link>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <PackageCheck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "Recent Orders" : "Đơn hàng gần nhất"}</span>
            </h2>
            <Link
              href={buildLocalizedHref("/account/orders", locale)}
              className="text-sm font-semibold text-[#245B3D] hover:underline"
            >
              {isEn ? `View all (${orders.length}) →` : `Xem tất cả (${orders.length}) →`}
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <Link
                key={ord.id}
                href={buildLocalizedHref(`/account/orders/${ord.id}`, locale)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-4 hover:bg-[#EAF0E5]"
              >
                <div>
                  <p className="tabular-nums font-bold text-[#245B3D]">{ord.id}</p>
                  <p className="text-sm font-semibold text-[#25352B]">
                    {ord.items.map((i) => `${i.productName} (${i.quantity} ${i.unitLabel})`).join(", ")}
                  </p>
                  <p className="text-xs text-[#52645A]">
                    {ord.farmName} · {ord.createdAtLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums font-bold text-[#25352B]">
                    {formatVnd(ord.totalVnd, locale, showUsd)}
                  </p>
                  <Badge tone="info" className="mt-1">
                    {ord.status}
                  </Badge>
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
                <span>{isEn ? "Address Book" : "Sổ địa chỉ nhận hàng"}</span>
              </h2>
              <Link
                href={buildLocalizedHref("/account/settings", locale)}
                className="text-xs font-semibold text-[#245B3D] hover:underline"
              >
                {isEn ? "Add address →" : "Thêm địa chỉ →"}
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
                    {addr.isDefault ? <Badge tone="success">{isEn ? "Default" : "Mặc định"}</Badge> : null}
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
                <span>{isEn ? "Recent Notifications" : "Thông báo gần đây"}</span>
              </h2>
              <Link
                href={buildLocalizedHref("/account/settings#notifications", locale)}
                className="text-xs font-semibold text-[#245B3D] hover:underline"
              >
                {isEn ? `View all (${notifications.length}) →` : `Xem tất cả (${notifications.length}) →`}
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  href={buildLocalizedHref(n.href, locale)}
                  className="block rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs hover:bg-[#EAF0E5]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#25352B]">{n.title}</span>
                    {!n.read ? <Badge tone="warning">{isEn ? "New" : "Mới"}</Badge> : null}
                  </div>
                  <p className="mt-1 text-[#52645A]">{n.message}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn
                  ? `Orchard Tour Bookings (${experienceBookings.length})`
                  : `Lịch trải nghiệm miệt vườn (${experienceBookings.length})`}
              </span>
            </h2>
            <Link
              href={buildLocalizedHref("/explore?view=tours", locale)}
              className="text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Browse new orchard tours →" : "Đặt thêm tour vườn →"}
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {experienceBookings.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                href={buildLocalizedHref(`/account/bookings/${b.id}`, locale)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/50 p-3 text-sm hover:bg-[#EAF0E5]"
              >
                <div>
                  <p className="font-semibold text-[#25352B]">
                    {isEn && b.packageTitleEn ? b.packageTitleEn : b.packageTitle}
                  </p>
                  <p className="text-xs text-[#52645A]">
                    {b.id} · {b.farmName} · {b.guestCount} {isEn ? "guests" : "khách"} · {b.dateLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warning">{b.status}</Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Heart className="h-5 w-5 text-[#A32D2D]" aria-hidden="true" />
              <span>
                {isEn
                  ? `Saved Favorites (${favProducts.length})`
                  : `Nông sản đã lưu yêu thích (${favProducts.length})`}
              </span>
            </h2>
            <Link
              href={buildLocalizedHref("/account/favorites", locale)}
              className="text-xs font-semibold text-[#245B3D] underline"
            >
              {isEn ? "Compare & Recently Viewed →" : "So sánh & Đã xem →"}
            </Link>
          </div>
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
