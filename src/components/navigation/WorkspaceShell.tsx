"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import type { WorkspaceId } from "@/types/naifarm";

export interface WorkspaceNavItem {
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
}

export function WorkspaceShell({
  workspaceId,
  title,
  navItems,
  children,
}: {
  workspaceId: WorkspaceId;
  title: string;
  subtitle?: string;
  scopeBadge?: string;
  navItems: WorkspaceNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <h1 className="sr-only">{title}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label={`Menu ${workspaceId}`} className="hidden lg:block">
          <div className="sticky top-24 rounded-[16px] border border-[#D6DED2] bg-white p-3 shadow-[0_2px_8px_rgba(37,53,43,0.05)]">
            <p className="px-3 pb-2 text-xs font-semibold text-[#52645A]">Không gian làm việc</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.active ?? pathname === item.href;
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className={cn(
                        "flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 text-left text-sm cursor-pointer",
                        isActive
                          ? "bg-[#245B3D] font-semibold text-white"
                          : "text-[#25352B] hover:bg-[#EAF0E5]"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 text-sm",
                      isActive
                        ? "bg-[#245B3D] font-semibold text-white"
                        : "text-[#25352B] hover:bg-[#EAF0E5]"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Mobile horizontal workspace tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const isActive = item.active ?? pathname === item.href;
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                      isActive
                        ? "bg-[#245B3D] text-white"
                        : "border border-[#D6DED2] bg-white text-[#25352B]"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
                    isActive
                      ? "bg-[#245B3D] text-white"
                      : "border border-[#D6DED2] bg-white text-[#25352B]"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
