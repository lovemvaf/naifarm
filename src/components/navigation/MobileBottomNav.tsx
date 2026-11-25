"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  Compass,
  QrCode,
  Radio,
  Shield,
  ShoppingBasket,
  Store,
  User,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { cn } from "@/lib/format";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { authUser, cart, missions } = useDemoStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const openMissions = missions.filter((m) => m.status === "open").length;

  const isFarmerRoute = pathname.startsWith("/farmer");
  const isVolunteerRoute = pathname.startsWith("/volunteer") || pathname.startsWith("/learn");
  const isAdminOrCoordRoute =
    pathname.startsWith("/coordinator") ||
    pathname.startsWith("/organization") ||
    pathname.startsWith("/admin");

  const isFarmer = isFarmerRoute || (authUser?.workspaceId === "W02" && pathname === "/live");
  const isVolunteer = isVolunteerRoute || (authUser?.workspaceId === "W03" && pathname === "/live");
  const isAdminOrCoord = isAdminOrCoordRoute;

  let items: { href: string; label: string; icon: typeof Store; badge?: number }[] = [
    { href: "/marketplace", label: "Chợ", icon: Store },
    { href: "/explore", label: "Bản đồ", icon: Compass },
    { href: "/trace/scan", label: "Quét QR", icon: QrCode },
    { href: "/cart", label: "Giỏ", icon: ShoppingBasket, badge: cartCount > 0 ? cartCount : undefined },
    { href: "/account", label: "Tôi", icon: User },
  ];

  if (isFarmer) {
    items = [
      { href: "/farmer", label: "Nhà nông", icon: Store },
      { href: "/farmer/publish", label: "Đăng bán", icon: QrCode },
      { href: "/live", label: "Live", icon: Radio },
      { href: "/marketplace", label: "Xem chợ", icon: Compass },
    ];
  } else if (isVolunteer) {
    items = [
      { href: "/volunteer", label: "Nhiệm vụ", icon: ClipboardCheck, badge: openMissions > 0 ? openMissions : undefined },
      { href: "/learn", label: "Học tập", icon: Compass },
      { href: "/live", label: "Live", icon: Radio },
      { href: "/marketplace", label: "Chợ", icon: Store },
    ];
  } else if (isAdminOrCoord) {
    items = [
      { href: "/coordinator", label: "Điều phối", icon: Users },
      { href: "/organization", label: "Tổ chức", icon: Store },
      { href: "/admin", label: "Quản trị", icon: Shield },
      { href: "/demo", label: "Truy cập", icon: Compass },
    ];
  }

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D6DED2] bg-white/95 backdrop-blur-sm lg:hidden"
    >
      <div
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
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
