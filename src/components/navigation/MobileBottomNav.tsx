"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  Compass,
  QrCode,
  Shield,
  ShoppingBasket,
  Store,
  User,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { cart, missions } = useDemoStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const openMissions = missions.filter((m) => m.status === "open").length;

  const isFarmerRoute = pathname.startsWith("/farmer");
  const isVolunteerRoute = pathname.startsWith("/volunteer");
  const isAdminOrCoordRoute =
    pathname.startsWith("/coordinator") ||
    pathname.startsWith("/organization") ||
    pathname.startsWith("/admin");

  let items: { href: string; label: string; icon: typeof Store; badge?: number }[] = [
    { href: "/marketplace", label: t.nav.mobileTabMarket, icon: Store },
    { href: "/explore", label: t.nav.mobileTabExplore, icon: Compass },
    { href: "/trace/scan", label: t.nav.mobileTabScan, icon: QrCode },
    {
      href: "/cart",
      label: t.nav.mobileTabCart,
      icon: ShoppingBasket,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { href: "/account", label: t.nav.mobileTabAccount, icon: User },
  ];

  if (isFarmerRoute) {
    items = [
      { href: "/farmer", label: locale === "en" ? "Orchard" : "Nhà nông", icon: Store },
      { href: "/farmer/publish", label: locale === "en" ? "Quick List" : "Đăng bán", icon: QrCode },
      { href: "/events?tab=calendar", label: locale === "en" ? "Calendar" : "Lịch", icon: CalendarDays },
      { href: "/marketplace", label: t.nav.mobileTabMarket, icon: Compass },
    ];
  } else if (isVolunteerRoute) {
    items = [
      {
        href: "/volunteer",
        label: locale === "en" ? "Missions" : "Nhiệm vụ",
        icon: ClipboardCheck,
        badge: openMissions > 0 ? openMissions : undefined,
      },
      { href: "/learn", label: t.nav.learn, icon: Compass },
      { href: "/events", label: locale === "en" ? "Events" : "Sự kiện", icon: CalendarDays },
      { href: "/marketplace", label: t.nav.mobileTabMarket, icon: Store },
    ];
  } else if (isAdminOrCoordRoute) {
    items = [
      { href: "/coordinator", label: locale === "en" ? "Coord" : "Điều phối", icon: Users },
      { href: "/organization", label: locale === "en" ? "Org" : "Tổ chức", icon: Store },
      { href: "/admin", label: locale === "en" ? "Admin" : "Quản trị", icon: Shield },
      { href: "/events", label: locale === "en" ? "Calendar" : "Lịch", icon: CalendarDays },
    ];
  }

  return (
    <nav
      aria-label={t.nav.mobileNavAria}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D6DED2] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <div
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          return (
            <Link
              key={item.href}
              href={buildLocalizedHref(item.href, locale)}
              className={cn(
                "relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold whitespace-nowrap",
                active ? "text-[#245B3D]" : "text-[#52645A]",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#245B3D] px-1 text-[10px] font-bold text-white tabular-nums">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
