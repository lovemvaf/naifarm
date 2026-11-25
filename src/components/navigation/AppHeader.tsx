"use client";

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Compass,
  GraduationCap,
  Heart,
  Layers,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  QrCode,
  Radio,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { useSeasonalTheme } from "@/context/SeasonalThemeContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { runGlobalSearch } from "@/lib/search/search-engine";
import { notifyAccountSwitch, notifySignOut, notifySuccess } from "@/lib/toast";
import { cn, stripWorkspaceCodePrefix } from "@/lib/format";
import type { WorkspaceId } from "@/types/naifarm";

const WORKSPACE_HOME: Record<WorkspaceId, string> = {
  W01: "/account",
  W02: "/farmer",
  W03: "/volunteer",
  W04: "/coordinator",
  W05: "/organization",
  W06: "/admin",
};

function inferPathScopedWorkspace(pathname: string): WorkspaceId | null {
  if (pathname.startsWith("/farmer")) return "W02";
  if (pathname.startsWith("/volunteer")) return "W03";
  if (pathname.startsWith("/coordinator")) return "W04";
  if (pathname.startsWith("/organization")) return "W05";
  if (pathname.startsWith("/admin")) return "W06";
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout")
  ) {
    return "W01";
  }
  return null;
}

interface PriorityNavDef {
  id: string;
  href: string;
  labelVi: string;
  labelEn: string;
  /** Fixed language-independent slot width >= max(VI width, EN width) so VI<->EN never shifts controls */
  slotPx: number;
  icon: typeof Store;
}

const PRIORITY_NAV_ITEMS: PriorityNavDef[] = [
  { id: "market", href: "/marketplace", labelVi: "Chợ nông sản", labelEn: "Marketplace", slotPx: 104, icon: Store },
  { id: "farms", href: "/farms", labelVi: "Nhà vườn", labelEn: "Farms", slotPx: 80, icon: Sprout },
  { id: "map", href: "/explore", labelVi: "Bản đồ", labelEn: "Map", slotPx: 72, icon: MapPin },
  { id: "learn", href: "/learn", labelVi: "Học tập", labelEn: "Learning", slotPx: 78, icon: GraduationCap },
  { id: "events", href: "/events", labelVi: "Sự kiện", labelEn: "Events", slotPx: 72, icon: CalendarDays },
  { id: "live", href: "/live", labelVi: "OCOP Live", labelEn: "OCOP Live", slotPx: 86, icon: Radio },
];

const MORE_BUTTON_PX = 74;
const NAV_GAP_PX = 4;

function computeVisibleNavCount(containerWidth: number): number {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 5;
  const budgetForItems = containerWidth - MORE_BUTTON_PX - NAV_GAP_PX;
  let used = 0;
  let count = 0;
  for (let i = 0; i < PRIORITY_NAV_ITEMS.length; i += 1) {
    const needed = PRIORITY_NAV_ITEMS[i].slotPx + (i > 0 ? NAV_GAP_PX : 0);
    if (used + needed <= budgetForItems) {
      used += needed;
      count += 1;
    } else {
      break;
    }
  }
  return Math.max(0, count);
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchListId = useId();
  const { locale, setLocale, t } = useLocale();
  const isEn = locale === "en";
  const { activeTheme } = useSeasonalTheme();
  const {
    authUser,
    demoAccounts,
    activeWorkspace,
    setActiveWorkspace,
    signInDemoAccount,
    signOutDemo,
    cart,
    products,
    farms,
    batches,
    lessons,
    missions,
    tourPackages,
    livestreams,
    campaigns,
    notifications,
    resetDemoState,
  } = useDemoStore();

  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [compactSearchOpen, setCompactSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleNavCount, setVisibleNavCount] = useState<number>(5);

  const navZoneRef = useRef<HTMLElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const compactSearchBoxRef = useRef<HTMLDivElement>(null);
  const compactSearchInputRef = useRef<HTMLInputElement>(null);
  const moreBoxRef = useRef<HTMLDivElement>(null);
  const avatarBoxRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const pathWorkspace = inferPathScopedWorkspace(pathname);

  useEffect(() => {
    if (pathWorkspace && pathWorkspace !== activeWorkspace) {
      setActiveWorkspace(pathWorkspace);
    }
  }, [pathWorkspace, activeWorkspace, setActiveWorkspace]);

  // Measure actual Zone B container width (not just viewport!) with zero layout thrashing
  useLayoutEffect(() => {
    const el = navZoneRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      const next = computeVisibleNavCount(w);
      setVisibleNavCount((prev) => (prev === next ? prev : next));
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (compactSearchOpen) {
      requestAnimationFrame(() => compactSearchInputRef.current?.focus());
    }
  }, [compactSearchOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (compactSearchBoxRef.current && !compactSearchBoxRef.current.contains(target)) {
        setCompactSearchOpen(false);
      }
      if (moreBoxRef.current && !moreBoxRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (avatarBoxRef.current && !avatarBoxRef.current.contains(target)) {
        setAvatarOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setCompactSearchOpen(false);
        setMoreOpen(false);
        setAvatarOpen(false);
        if (mobileOpen) {
          setMobileOpen(false);
          mobileToggleRef.current?.focus();
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [mobileOpen]);

  const searchPreview = useMemo(() => {
    if (searchText.trim().length < 2) return [];
    return runGlobalSearch(
      searchText,
      {
        products,
        farms,
        batches,
        lessons,
        missions,
        tours: tourPackages,
        livestreams,
        campaigns,
      },
      6,
    ).results;
  }, [searchText, products, farms, batches, lessons, missions, tourPackages, livestreams, campaigns]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadgeText = cartCount > 99 ? "99+" : String(cartCount);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const alwaysSecondaryItems = useMemo(
    () => [
      { id: "tours", href: "/explore?view=tours", labelVi: "Du lịch trải nghiệm", labelEn: "Orchard Tours", icon: Compass },
      { id: "scan", href: "/trace/scan", labelVi: t.nav.scanQr, labelEn: t.nav.scanQr, icon: QrCode },
      { id: "quality", href: "/quality", labelVi: t.nav.quality, labelEn: t.nav.quality, icon: ShieldCheck },
      { id: "calendar", href: "/events?tab=calendar", labelVi: t.nav.calendar, labelEn: t.nav.calendar, icon: CalendarDays },
      { id: "volunteer", href: "/volunteer", labelVi: "Hoạt động tình nguyện", labelEn: "Youth Volunteering", icon: Users },
      { id: "favorites", href: "/account/favorites", labelVi: t.nav.favorites, labelEn: t.nav.favorites, icon: Heart },
      { id: "quick", href: "/demo", labelVi: t.nav.quickAccess, labelEn: t.nav.quickAccess, icon: Layers },
    ],
    [t],
  );

  const visiblePrimaryItems = PRIORITY_NAV_ITEMS.slice(0, visibleNavCount);
  const overflowPrimaryItems = PRIORITY_NAV_ITEMS.slice(visibleNavCount);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    setSearchOpen(false);
    setCompactSearchOpen(false);
    setMobileOpen(false);
    const target = trimmed
      ? buildLocalizedHref(`/search?q=${encodeURIComponent(trimmed)}`, locale)
      : buildLocalizedHref("/search", locale);
    router.push(target);
  };

  const linkHref = (href: string) => buildLocalizedHref(href, locale);
  const isNavItemActive = (href: string) => {
    const clean = href.split("?")[0];
    return pathname === clean || (clean !== "/" && pathname.startsWith(`${clean}/`));
  };

  const renderSearchDropdown = () => {
    if (!searchOpen || searchText.trim().length < 2) return null;
    return (
      <div
        id={searchListId}
        role="listbox"
        className="absolute top-[44px] right-0 z-50 w-[min(320px,calc(100vw-24px))] rounded-[14px] border border-[#D6DED2] bg-white p-2 shadow-[0_14px_32px_rgba(37,53,43,0.16)]"
      >
        {searchPreview.length > 0 ? (
          <div className="space-y-1">
            {searchPreview.map((hit) => (
              <Link
                key={hit.id}
                href={linkHref(hit.href)}
                role="option"
                aria-selected="false"
                onClick={() => {
                  setSearchOpen(false);
                  setCompactSearchOpen(false);
                }}
                className="flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left hover:bg-[#EAF0E5]"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#25352B]">{hit.title}</p>
                  <p className="truncate text-[11px] text-[#52645A]">
                    {hit.kindLabel} · {hit.subtitle}
                  </p>
                </div>
              </Link>
            ))}
            <Link
              href={linkHref(`/search?q=${encodeURIComponent(searchText.trim())}`)}
              onClick={() => {
                setSearchOpen(false);
                setCompactSearchOpen(false);
              }}
              className="block rounded-[10px] bg-[#F5F3E9] px-3 py-2 text-center text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              {t.nav.searchSeeAll} &ldquo;{searchText.trim()}&rdquo; →
            </Link>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-[#52645A]">{t.nav.searchEmptyHint}</div>
        )}
      </div>
    );
  };

  const isOperationalRoute =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/farmer") ||
    pathname.startsWith("/organization") ||
    pathname.startsWith("/coordinator") ||
    pathname.startsWith("/admin");

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 border-b border-[#D6DED2] bg-white/95 backdrop-blur-sm"
    >
      {/* Compact seasonal announcement micro-bar (desktop/tablet public pages only, fixed 28px height, zero VI/EN shift) */}
      {!isOperationalRoute ? (
        <div
          className="hidden h-7 items-center border-b border-[#DCE3D6] md:flex"
          style={{
            backgroundColor: activeTheme.accentTokens.toplineBg,
            color: activeTheme.accentTokens.toplineText,
          }}
        >
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 text-[11.5px] font-medium lg:px-6">
            <p className="min-w-0 truncate">
              {isEn ? activeTheme.toplineNoticeEn : activeTheme.toplineNoticeVi}
            </p>
            <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
              <Link href={linkHref("/events?tab=calendar")} className="font-semibold hover:underline">
                {isEn ? "Calendar" : "Lịch sự kiện"}
              </Link>
              <Link href={linkHref("/trace/scan")} className="font-semibold hover:underline">
                {isEn ? "QR Trace" : "Truy xuất QR"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main 3-Zone Header Row (Strict Priority Navigation — ZERO overlap, ZERO VI/EN shift, Fits 320px+) */}
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-1 px-2 min-[380px]:gap-2 min-[380px]:px-3 sm:px-4 lg:gap-3 lg:px-6">
        {/* ZONE A — BRAND (Fixed width across VI/EN) */}
        <Link
          href={linkHref("/")}
          data-header-zone="brand"
          className="flex shrink-0 items-center gap-1.5 rounded-[10px] py-1 pr-0.5 text-[#25352B] min-[380px]:gap-2 min-[380px]:pr-1 sm:w-[172px] lg:w-[176px] xl:w-[186px]"
        >
          <img
            src="/images/stitch/stitch-01.jpg"
            alt={t.brand.name}
            width={34}
            height={34}
            className="h-7 w-7 shrink-0 rounded-[8px] border border-[#D6DED2] object-cover min-[380px]:h-8 min-[380px]:w-8 min-[380px]:rounded-[9px] sm:h-9 sm:w-9"
          />
          <div className="min-w-0 leading-tight whitespace-nowrap">
            <span className="block text-[15px] font-extrabold tracking-tight text-[#245B3D] min-[380px]:text-[17px]">
              {t.brand.name}
            </span>
            <span className="hidden truncate text-[10px] font-medium text-[#52645A] sm:block">
              {t.brand.subtitle}
            </span>
          </div>
        </Link>

        {/* ZONE B — PRIORITY NAVIGATION + MORE (Measures actual width; identical visible items in VI and EN) */}
        <nav
          ref={navZoneRef}
          data-header-zone="nav"
          aria-label={t.nav.mainNavAria}
          className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
        >
          {visiblePrimaryItems.map((item) => {
            const active = isNavItemActive(item.href);
            const label = isEn ? item.labelEn : item.labelVi;
            return (
              <Link
                key={item.id}
                data-nav-id={item.id}
                href={linkHref(item.href)}
                aria-current={active ? "page" : undefined}
                style={{ width: `${item.slotPx}px` }}
                className={cn(
                  "flex h-[38px] shrink-0 items-center justify-center rounded-[10px] px-2 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-[#245B3D] text-white"
                    : "text-[#25352B] hover:bg-[#EAF0E5] hover:text-[#245B3D]",
                )}
              >
                <span>{label}</span>
              </Link>
            );
          })}

          <div ref={moreBoxRef} className="relative shrink-0" style={{ width: `${MORE_BUTTON_PX}px` }}>
            <button
              type="button"
              data-nav-id="more"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                "flex h-[38px] w-full items-center justify-center gap-1 rounded-[10px] px-2 text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer",
                moreOpen || overflowPrimaryItems.some((item) => isNavItemActive(item.href))
                  ? "bg-[#EAF0E5] text-[#245B3D]"
                  : "text-[#25352B] hover:bg-[#EAF0E5] hover:text-[#245B3D]",
              )}
            >
              <span>{t.nav.more}</span>
              <ChevronDown
                className={cn("h-3.5 w-3.5 shrink-0 transition-transform", moreOpen ? "rotate-180" : "")}
                aria-hidden="true"
              />
            </button>

            {moreOpen ? (
              <div
                role="menu"
                aria-label={t.nav.more}
                className="absolute top-[44px] left-0 z-50 w-64 max-w-[calc(100vw-24px)] rounded-[14px] border border-[#D6DED2] bg-white p-1.5 shadow-[0_14px_32px_rgba(37,53,43,0.16)]"
              >
                {overflowPrimaryItems.length > 0 ? (
                  <div className="mb-1 border-b border-[#EAEFE6] pb-1">
                    {overflowPrimaryItems.map((item) => {
                      const Icon = item.icon;
                      const active = isNavItemActive(item.href);
                      return (
                        <Link
                          key={item.id}
                          data-more-nav-id={item.id}
                          href={linkHref(item.href)}
                          role="menuitem"
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex min-h-[40px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-semibold",
                            active
                              ? "bg-[#EAF0E5] text-[#245B3D]"
                              : "text-[#25352B] hover:bg-[#EAF0E5] hover:text-[#245B3D]",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                          <span>{isEn ? item.labelEn : item.labelVi}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}

                {alwaysSecondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      data-more-nav-id={item.id}
                      href={linkHref(item.href)}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className="flex min-h-[38px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5] hover:text-[#245B3D]"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                      <span>{isEn ? item.labelEn : item.labelVi}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>

        {/* ZONE C — UTILITIES (Fixed stable geometry across VI/EN, never overlaps Zone B) */}
        <div data-header-zone="utilities" className="flex shrink-0 items-center justify-end gap-1 min-[380px]:gap-1.5">
          {/* Desktop >= 1280px: Stable fixed-width inline Search */}
          <div
            ref={searchBoxRef}
            data-header-control="search-inline"
            className="relative hidden w-[180px] shrink-0 xl:block 2xl:w-[214px]"
          >
            <form onSubmit={handleSearchSubmit}>
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#52645A]"
                aria-hidden="true"
              />
              <input
                type="search"
                role="combobox"
                aria-expanded={searchOpen && searchText.trim().length >= 2}
                aria-controls={searchListId}
                aria-autocomplete="list"
                value={searchText}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder={t.nav.searchPlaceholder}
                aria-label={t.nav.searchAria}
                className="h-[38px] w-full rounded-[10px] border border-[#C7D2C2] bg-[#FAFBF8] pr-7 pl-8 text-xs text-[#25352B] placeholder:text-[#52645A]"
              />
              {searchText ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setSearchOpen(false);
                  }}
                  aria-label={isEn ? "Clear search" : "Xóa từ khóa"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-[#52645A] hover:text-[#25352B] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </form>
            {renderSearchDropdown()}
          </div>

          {/* Tablet / Compact Laptop (768px..1279px): Compact Search Icon + Popover */}
          <div
            ref={compactSearchBoxRef}
            data-header-control="search-compact"
            className="relative hidden shrink-0 md:block xl:hidden"
          >
            <button
              type="button"
              onClick={() => {
                setCompactSearchOpen((v) => !v);
                setSearchOpen(true);
              }}
              aria-expanded={compactSearchOpen}
              aria-label={t.nav.searchAria}
              className={cn(
                "flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border transition-colors cursor-pointer",
                compactSearchOpen
                  ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                  : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            {compactSearchOpen ? (
              <div className="absolute top-[46px] right-0 z-50 w-[min(320px,calc(100vw-24px))] rounded-[14px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_14px_32px_rgba(37,53,43,0.16)]">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#52645A]"
                    aria-hidden="true"
                  />
                  <input
                    ref={compactSearchInputRef}
                    type="search"
                    value={searchText}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setSearchOpen(true);
                    }}
                    placeholder={t.nav.searchPlaceholder}
                    aria-label={t.nav.searchAria}
                    className="h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-[#FAFBF8] pr-8 pl-8 text-xs text-[#25352B]"
                  />
                  {searchText ? (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      aria-label={isEn ? "Clear search" : "Xóa từ khóa"}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-[#52645A] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </form>
                {searchText.trim().length >= 2 ? (
                  <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                    {searchPreview.length > 0 ? (
                      <>
                        {searchPreview.map((hit) => (
                          <Link
                            key={hit.id}
                            href={linkHref(hit.href)}
                            onClick={() => {
                              setCompactSearchOpen(false);
                              setSearchOpen(false);
                            }}
                            className="block rounded-[8px] px-2.5 py-2 hover:bg-[#EAF0E5]"
                          >
                            <p className="truncate text-xs font-bold text-[#25352B]">{hit.title}</p>
                            <p className="truncate text-[11px] text-[#52645A]">
                              {hit.kindLabel} · {hit.subtitle}
                            </p>
                          </Link>
                        ))}
                        <Link
                          href={linkHref(`/search?q=${encodeURIComponent(searchText.trim())}`)}
                          onClick={() => setCompactSearchOpen(false)}
                          className="block rounded-[8px] bg-[#F5F3E9] px-3 py-2 text-center text-xs font-semibold text-[#245B3D]"
                        >
                          {t.nav.searchSeeAll} →
                        </Link>
                      </>
                    ) : (
                      <p className="p-2 text-center text-xs text-[#52645A]">{t.nav.searchEmptyHint}</p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Stable VI | EN Switcher (Fixed 56px on <380px, 66px on >=380px) */}
          <div
            role="group"
            data-header-control="locale"
            aria-label={t.nav.languageSwitchAria}
            className="inline-flex h-[36px] w-[56px] shrink-0 items-center justify-between rounded-[10px] border border-[#D6DED2] bg-white p-0.5 min-[380px]:h-[38px] min-[380px]:w-[66px]"
          >
            <button
              type="button"
              data-locale-btn="vi"
              onClick={() => setLocale("vi")}
              aria-pressed={locale === "vi"}
              className={cn(
                "h-[30px] w-[25px] rounded-[7px] text-center text-[10.5px] font-bold transition-colors cursor-pointer min-[380px]:h-[32px] min-[380px]:w-[30px] min-[380px]:rounded-[8px] min-[380px]:text-[11px]",
                locale === "vi"
                  ? "bg-[#245B3D] text-white"
                  : "text-[#52645A] hover:text-[#25352B]",
              )}
            >
              {t.nav.languageLabelVi}
            </button>
            <button
              type="button"
              data-locale-btn="en"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={cn(
                "h-[30px] w-[25px] rounded-[7px] text-center text-[10.5px] font-bold transition-colors cursor-pointer min-[380px]:h-[32px] min-[380px]:w-[30px] min-[380px]:rounded-[8px] min-[380px]:text-[11px]",
                locale === "en"
                  ? "bg-[#245B3D] text-white"
                  : "text-[#52645A] hover:text-[#25352B]",
              )}
            >
              {t.nav.languageLabelEn}
            </button>
          </div>

          {/* Stable Cart Button (Handles 0, 1, 99+ without changing box width) */}
          <Link
            href={linkHref("/cart")}
            data-header-control="cart"
            className="flex h-[36px] w-[46px] shrink-0 items-center justify-center gap-0.5 rounded-[10px] border border-[#D6DED2] bg-white px-1 text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5] min-[380px]:h-[38px] min-[380px]:w-[56px] min-[380px]:gap-1 min-[380px]:px-1.5 2xl:w-[88px] 2xl:px-2"
            aria-label={`${t.nav.cartAria}: ${cartCount}`}
          >
            <ShoppingBasket className="h-3.5 w-3.5 shrink-0 text-[#245B3D] min-[380px]:h-4 min-[380px]:w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{t.nav.cartShort}</span>
            <span className="inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#245B3D] px-1 text-[10px] font-bold text-white tabular-nums min-[380px]:h-5 min-[380px]:min-w-[20px] min-[380px]:text-[10.5px]">
              {cartBadgeText}
            </span>
          </Link>

          {/* Account Trigger / Auth Slots (Fixed widths so long account/org names NEVER shift nav) */}
          {authUser ? (
            <div ref={avatarBoxRef} data-header-control="account" className="relative flex shrink-0 items-center gap-1.5">
              <Link
                href={linkHref("/account/settings#notifications")}
                className="relative hidden h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5] sm:inline-flex"
                aria-label={`${t.nav.notificationsAria} (${unreadNotifs})`}
              >
                <Bell className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                {unreadNotifs > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#A32D2D] px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadNotifs}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                data-account-trigger="true"
                onClick={() => setAvatarOpen((v) => !v)}
                aria-expanded={avatarOpen}
                aria-haspopup="menu"
                aria-label={t.nav.accountMenuAria}
                title={authUser.name}
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center gap-1 rounded-[10px] border border-[#245B3D]/35 bg-white px-1 text-left text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5] cursor-pointer min-[380px]:h-[38px] min-[380px]:w-[38px] sm:w-[138px] sm:justify-between sm:px-2"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: authUser.avatarBg }}
                  >
                    {authUser.avatarText}
                  </span>
                  <span className="hidden min-w-0 truncate sm:inline">{authUser.name}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-[#52645A] sm:block" aria-hidden="true" />
              </button>

              {avatarOpen ? (
                <div
                  role="menu"
                  aria-label={t.nav.accountMenuAria}
                  className="absolute top-[46px] right-0 z-50 max-h-[calc(100dvh-84px)] w-[min(296px,calc(100vw-24px))] overflow-y-auto rounded-[14px] border border-[#D6DED2] bg-white p-2 shadow-[0_14px_36px_rgba(37,53,43,0.18)]"
                >
                  <div className="rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-[#25352B]">{authUser.name}</p>
                      <span className="shrink-0 rounded-full bg-[#EAF0E5] px-2 py-0.5 text-[10px] font-semibold text-[#245B3D]">
                        {t.brand.experienceSpaceBadge}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-[#245B3D]">
                      {stripWorkspaceCodePrefix(
                        isEn && authUser.roleLabelEn ? authUser.roleLabelEn : authUser.roleLabel,
                      )}
                    </p>
                    <p className="truncate text-[11px] text-[#52645A]">{authUser.unitName}</p>
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <Link
                      href={linkHref(WORKSPACE_HOME[authUser.workspaceId])}
                      onClick={() => setAvatarOpen(false)}
                      className="flex min-h-[38px] items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Layers className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.workspaceLabel}</span>
                    </Link>
                    <Link
                      href={linkHref("/account")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex min-h-[38px] items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <User className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.accountOrders}</span>
                    </Link>
                    <Link
                      href={linkHref("/account/settings")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex min-h-[38px] items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Settings className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.accountSettings}</span>
                    </Link>
                    <Link
                      href={linkHref("/demo")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex min-h-[38px] items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>{t.nav.quickAccess}</span>
                    </Link>
                  </div>

                  <div className="mt-1.5 border-t border-[#EAEFE6] pt-1.5">
                    <p className="px-2 pb-1 text-[10.5px] font-bold text-[#52645A]">
                      {t.nav.switchWorkspaceTitle}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {demoAccounts.slice(0, 6).map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            signInDemoAccount(acc.id);
                            setAvatarOpen(false);
                            notifyAccountSwitch(
                              stripWorkspaceCodePrefix(
                                isEn && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel,
                              ),
                              locale,
                            );
                            if (pathname !== "/live" && pathname !== "/live/demo") {
                              router.push(linkHref(WORKSPACE_HOME[acc.workspaceId]));
                            }
                          }}
                          className={cn(
                            "min-h-[34px] rounded-[8px] px-2 py-1 text-left text-[11px] font-semibold transition cursor-pointer",
                            acc.id === authUser.id
                              ? "bg-[#245B3D] text-white"
                              : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                          )}
                        >
                          <span className="block truncate">{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#EAEFE6] pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        resetDemoState();
                        setAvatarOpen(false);
                        notifySuccess(t.toasts.resetDone);
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-[8px] px-2 text-[11px] font-medium text-[#52645A] hover:bg-[#F5F3E9] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.nav.resetExperience}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarOpen(false);
                        signOutDemo();
                        notifySignOut(locale);
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-[8px] bg-[#FDECEC] px-2.5 text-[11px] font-semibold text-[#A32D2D] hover:bg-[#FAD6D6] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.nav.signOut}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              data-header-control="account"
              className="hidden shrink-0 items-center sm:grid sm:grid-cols-[84px_80px] sm:gap-1.5"
            >
              <Link
                href={linkHref("/sign-in")}
                className="inline-flex h-[38px] w-full items-center justify-center gap-1 rounded-[10px] border border-[#245B3D] bg-white px-1.5 text-xs font-semibold text-[#245B3D] whitespace-nowrap hover:bg-[#EAF0E5]"
              >
                <LogIn className="hidden h-3.5 w-3.5 shrink-0 xl:inline-block" aria-hidden="true" />
                <span>{t.nav.signIn}</span>
              </Link>
              <Link
                href={linkHref("/sign-up")}
                className="inline-flex h-[38px] w-full items-center justify-center gap-1 rounded-[10px] bg-[#245B3D] px-1.5 text-xs font-semibold text-white whitespace-nowrap hover:bg-[#19472E]"
              >
                <UserPlus className="hidden h-3.5 w-3.5 shrink-0 xl:inline-block" aria-hidden="true" />
                <span>{t.nav.signUp}</span>
              </Link>
            </div>
          )}

          {/* Mobile & Tablet Drawer Toggle (< 1024px) */}
          <button
            ref={mobileToggleRef}
            type="button"
            data-header-control="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.nav.closeMenuAria : t.nav.openMenuAria}
            aria-expanded={mobileOpen}
            className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] min-[380px]:h-[38px] min-[380px]:w-[38px] lg:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Row 2: Compact visible search bar (< 768px) */}
      <div className="border-t border-[#E5EAE1] bg-[#FAF8F1] px-3 py-1.5 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            aria-label={t.nav.searchAria}
            className="min-h-[40px] w-full rounded-[10px] border border-[#C7D2C2] bg-white pr-8 pl-9 text-sm text-[#25352B] placeholder:text-[#52645A]"
          />
          {searchText ? (
            <button
              type="button"
              onClick={() => setSearchText("")}
              aria-label={isEn ? "Clear search" : "Xóa từ khóa"}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#52645A] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </form>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileOpen ? (
        <div className="max-h-[calc(100dvh-116px)] overflow-y-auto border-t border-[#D6DED2] bg-white px-4 py-4 shadow-[0_14px_32px_rgba(37,53,43,0.12)] lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {PRIORITY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={linkHref(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-[44px] items-center gap-2 rounded-[10px] border px-3 text-xs font-semibold",
                    active
                      ? "border-[#245B3D] bg-[#245B3D] text-white"
                      : "border-[#D6DED2] bg-[#FAF8F1] text-[#25352B]",
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-[#245B3D]")}
                    aria-hidden="true"
                  />
                  <span className="truncate">{isEn ? item.labelEn : item.labelVi}</span>
                </Link>
              );
            })}
            {alwaysSecondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={linkHref(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B]"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                  <span className="truncate">{isEn ? item.labelEn : item.labelVi}</span>
                </Link>
              );
            })}
          </div>

          {!authUser ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#D6DED2] pt-3">
              <Link
                href={linkHref("/sign-in")}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-[10px] border border-[#245B3D] bg-white text-xs font-semibold text-[#245B3D]"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href={linkHref("/sign-up")}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-[10px] bg-[#245B3D] text-xs font-semibold text-white"
              >
                {t.nav.signUp}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
