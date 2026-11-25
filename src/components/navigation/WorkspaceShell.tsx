"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
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
  const { locale, t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 lg:px-8">
      <h1 className="sr-only">{title}</h1>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-6",
          collapsed ? "lg:grid-cols-[74px_minmax(0,1fr)]" : "lg:grid-cols-[248px_minmax(0,1fr)]",
        )}
      >
        <aside aria-label={`Menu ${workspaceId}`} className="hidden self-start lg:block">
          <div className="sticky top-24 rounded-[16px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_2px_8px_rgba(37,53,43,0.05)]">
            <div className="flex items-center justify-between gap-2 px-1.5 pb-2">
              {!collapsed ? (
                <p className="text-xs font-semibold text-[#52645A]">{t.nav.workspaceLabel}</p>
              ) : (
                <span className="text-[11px] font-bold text-[#245B3D]">{workspaceId}</span>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? t.workspaces.sidebarExpand : t.workspaces.sidebarCollapse}
                title={collapsed ? t.workspaces.sidebarExpand : t.workspaces.sidebarCollapse}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#D6DED2] bg-[#FAF8F1] text-[#25352B] hover:bg-[#EAF0E5] cursor-pointer"
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.active ?? pathname === item.href;
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={cn(
                        "flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 text-left text-sm cursor-pointer",
                        collapsed ? "justify-center px-0" : "",
                        isActive
                          ? "bg-[#245B3D] font-semibold text-white"
                          : "text-[#25352B] hover:bg-[#EAF0E5]",
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={buildLocalizedHref(item.href, locale)}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    className={cn(
                      "flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 text-sm",
                      collapsed ? "justify-center px-0" : "",
                      isActive
                        ? "bg-[#245B3D] font-semibold text-white"
                        : "text-[#25352B] hover:bg-[#EAF0E5]",
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
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
                        : "border border-[#D6DED2] bg-white text-[#25352B]",
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
                  href={buildLocalizedHref(item.href, locale)}
                  className={cn(
                    "inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
                    isActive
                      ? "bg-[#245B3D] text-white"
                      : "border border-[#D6DED2] bg-white text-[#25352B]",
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
