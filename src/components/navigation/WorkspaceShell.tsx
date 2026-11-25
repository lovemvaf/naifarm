"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Sprout } from "lucide-react";
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
    <div className="mx-auto max-w-[1360px] px-3 py-5 sm:px-4 lg:px-6 lg:py-6">
      <h1 className="sr-only">{title}</h1>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-5 lg:gap-6",
          collapsed
            ? "lg:grid-cols-[72px_minmax(0,1fr)]"
            : "lg:grid-cols-[248px_minmax(0,1fr)]",
        )}
      >
        {/* V9 Approved Deep Forest Green (#183D2A) Desktop Workspace Sidebar */}
        <aside aria-label={`Menu ${workspaceId}`} className="hidden self-start lg:block">
          <div className="sticky top-[84px] rounded-[18px] border border-[#123021] bg-[#183D2A] p-3 text-white shadow-[0_8px_24px_rgba(24,61,42,0.18)]">
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/14 px-1.5 pb-2.5">
              {!collapsed ? (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-[#F4C465]">
                    <Sprout className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold tracking-wide text-[#F4C465] uppercase">
                      {workspaceId}
                    </p>
                    <p className="truncate text-xs font-semibold text-white/90">
                      {t.nav.workspaceLabel}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="sr-only">{t.nav.workspaceLabel}</span>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? t.workspaces.sidebarExpand : t.workspaces.sidebarCollapse}
                title={collapsed ? t.workspaces.sidebarExpand : t.workspaces.sidebarCollapse}
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-white/18 bg-white/10 text-white hover:bg-white/20"
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
                        "flex min-h-[42px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 text-left text-[13.5px] transition-colors",
                        collapsed ? "justify-center px-0" : "",
                        isActive
                          ? "bg-white/18 font-semibold text-white ring-1 ring-white/22"
                          : "text-white/82 hover:bg-white/10 hover:text-white",
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
                      "flex min-h-[42px] items-center gap-2.5 rounded-[10px] px-3 text-[13.5px] transition-colors",
                      collapsed ? "justify-center px-0" : "",
                      isActive
                        ? "bg-white/18 font-semibold text-white ring-1 ring-white/22"
                        : "text-white/82 hover:bg-white/10 hover:text-white",
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
          <div className="nf-scroll-x mb-4 flex gap-2 pb-1 lg:hidden">
            {navItems.map((item) => {
              const isActive = item.active ?? pathname === item.href;
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap",
                      isActive
                        ? "bg-[#183D2A] text-white"
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
                    "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap",
                    isActive
                      ? "bg-[#183D2A] text-white"
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
