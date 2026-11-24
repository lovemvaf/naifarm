"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  PackageCheck,
  Radio,
  ShoppingBasket,
  Sprout,
  Store,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/format";
import { useDemoStore } from "@/context/DemoStoreContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useDemoStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const isFarmerRoute = pathname.startsWith("/farmer");
  const isYouthRoute = pathname.startsWith("/volunteer") || pathname.startsWith("/learn");

  const items = isFarmerRoute
    ? [
        { href: "/farmer", label: "Nhà nông", icon: Sprout },
        { href: "/farmer/publish", label: "Đăng bán", icon: Store },
        { href: "/live", label: "Lịch Live", icon: Radio },
        { href: "/marketplace", label: "Chợ", icon: Compass },
      ]
    : isYouthRoute
      ? [
          { href: "/volunteer", label: "Nhiệm vụ", icon: Users },
          { href: "/learn", label: "Học & 3D", icon: Compass },
          { href: "/live", label: "OCOP Live", icon: Radio },
          { href: "/marketplace", label: "Chợ", icon: Store },
        ]
      : [
          { href: "/marketplace", label: "Chợ", icon: Store },
          { href: "/explore", label: "Khám phá", icon: Compass },
          { href: "/live", label: "Live", icon: Radio },
          { href: "/cart", label: `Giỏ (${cartCount})`, icon: ShoppingBasket },
          { href: "/account/orders", label: "Đơn & Tôi", icon: pathname.startsWith("/account") ? PackageCheck : User },
        ];

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D6DED2] bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg px-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
                  active ? "text-[#245B3D] font-bold" : "text-[#52645A]"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={active ? 2.2 : 1.75} />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
