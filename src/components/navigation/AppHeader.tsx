"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
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

/**
 * Only explicitly path-scoped role portals switch the active workspace.
 * Public hubs (/learn, /live, /explore, /events, /marketplace) never hijack visitors into W03.
 */
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

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchListId = useId();
  const { locale, setLocale, t } = useLocale();
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const moreBoxRef = useRef<HTMLDivElement>(null);
  const avatarBoxRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const pathWorkspace = inferPathScopedWorkspace(pathname);

  useEffect(() => {
    if (pathWorkspace && pathWorkspace !== activeWorkspace) {
      setActiveWorkspace(pathWorkspace);
    }
  }, [pathWorkspace, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setSearchOpen(false);
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
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const primaryNavItems = useMemo(
    () => [
      { href: "/marketplace", label: t.nav.market, icon: Store },
      { href: "/explore", label: t.nav.explore, icon: Compass },
      { href: "/live", label: t.nav.live, icon: Radio },
      { href: "/learn", label: t.nav.learn, icon: GraduationCap },
      { href: "/events", label: t.nav.events, icon: CalendarDays },
    ],
    [t],
  );

  const secondaryNavItems = useMemo(
    () => [
      { href: "/farms", label: t.nav.farms, icon: Sprout },
      { href: "/trace/scan", label: t.nav.scanQr, icon: QrCode },
      { href: "/quality", label: t.nav.quality, icon: ShieldCheck },
      { href: "/events?tab=calendar", label: t.nav.calendar, icon: CalendarDays },
      { href: "/account/favorites", label: t.nav.favorites, icon: Heart },
      { href: "/demo", label: t.nav.quickAccess, icon: Layers },
    ],
    [t],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    const target = trimmed
      ? buildLocalizedHref(`/search?q=${encodeURIComponent(trimmed)}`, locale)
      : buildLocalizedHref("/search", locale);
    router.push(target);
  };

  const linkHref = (href: string) => buildLocalizedHref(href, locale);

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6DED2] bg-[#F5F3E9]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-1.5 px-3 sm:px-4 lg:grid lg:grid-cols-[128px_minmax(0,1fr)_136px_auto] lg:gap-1.5 xl:grid-cols-[172px_minmax(0,1fr)_216px_auto] xl:gap-2.5 xl:px-5 2xl:grid-cols-[204px_minmax(0,1fr)_264px_auto]">
        {/* Brand */}
        <Link
          href={linkHref("/")}
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-[10px] py-1 pr-1 text-[#25352B]"
        >
          <img
            src="/images/stitch/stitch-01.jpg"
            alt={t.brand.name}
            width={34}
            height={34}
            className="h-8 w-8 shrink-0 rounded-[9px] border border-[#D6DED2] object-cover sm:h-9 sm:w-9"
          />
          <div className="min-w-0 leading-tight whitespace-nowrap">
            <span className="block text-base font-bold tracking-tight text-[#245B3D]">
              {t.brand.name}
            </span>
            <span className="hidden truncate text-[10px] font-medium text-[#52645A] 2xl:block">
              {t.brand.subtitle}
            </span>
          </div>
        </Link>

        {/* Primary 5 Desktop Links + Secondary More Dropdown in Fixed Logical Grid Slots */}
        <nav
          aria-label={t.nav.mainNavAria}
          className="hidden min-w-0 items-center justify-center lg:grid lg:grid-cols-[70px_70px_78px_62px_66px_54px] lg:gap-0.5 xl:grid-cols-[86px_84px_92px_76px_82px_68px] xl:gap-1 2xl:grid-cols-[96px_92px_98px_84px_90px_76px]"
        >
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={linkHref(item.href)}
                className={cn(
                  "flex min-h-[38px] w-full items-center justify-center gap-1 rounded-[10px] px-1 text-[11.5px] font-semibold whitespace-nowrap transition-colors xl:text-[12.5px]",
                  active
                    ? "bg-[#EAF0E5] text-[#245B3D]"
                    : "text-[#25352B] hover:bg-[#EFECE0]",
                )}
              >
                <Icon className="hidden h-3.5 w-3.5 shrink-0 2xl:inline-block" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div ref={moreBoxRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                "flex min-h-[38px] w-full items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer xl:text-[12.5px]",
                moreOpen
                  ? "bg-[#EAF0E5] text-[#245B3D]"
                  : "text-[#25352B] hover:bg-[#EFECE0]",
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
                className="absolute top-[44px] left-0 z-50 w-60 rounded-[14px] border border-[#D6DED2] bg-white p-1.5 shadow-[0_14px_32px_rgba(37,53,43,0.16)]"
              >
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={linkHref(item.href)}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className="flex min-h-[40px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5] hover:text-[#245B3D]"
                    >
                      <Icon className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>

        {/* Desktop Global Search Combobox */}
        <div
          ref={searchBoxRef}
          className="relative hidden min-w-0 w-full lg:block"
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
              className="min-h-[38px] w-full rounded-[10px] border border-[#C7D2C2] bg-white pr-2.5 pl-8 text-xs text-[#25352B] placeholder:text-[#687A70]"
            />
          </form>

          {searchOpen && searchText.trim().length >= 2 ? (
            <div
              id={searchListId}
              role="listbox"
              className="absolute top-[44px] right-0 left-0 z-50 min-w-[290px] rounded-[14px] border border-[#D6DED2] bg-white p-2 shadow-[0_14px_32px_rgba(37,53,43,0.16)]"
            >
              {searchPreview.length > 0 ? (
                <div className="space-y-1">
                  {searchPreview.map((hit) => (
                    <Link
                      key={hit.id}
                      href={linkHref(hit.href)}
                      role="option"
                      aria-selected="false"
                      onClick={() => setSearchOpen(false)}
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
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-[10px] bg-[#F5F3E9] px-3 py-2 text-center text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                  >
                    {t.nav.searchSeeAll} &ldquo;{searchText.trim()}&rdquo; →
                  </Link>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-[#52645A]">
                  {t.nav.searchEmptyHint}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Right Actions: Always-visible VI|EN Toggle + Fixed-Width Cart + Auth + Mobile Menu */}
        <div className="flex shrink-0 items-center justify-end gap-1 xl:gap-1.5">
          {/* Clean VI | EN Text Switcher (No flag-only language buttons; visible on all viewports) */}
          <div
            role="group"
            aria-label={t.nav.languageSwitchAria}
            className="inline-flex w-[66px] shrink-0 items-center justify-between rounded-[10px] border border-[#D6DED2] bg-white p-0.5"
          >
            <button
              type="button"
              onClick={() => setLocale("vi")}
              aria-pressed={locale === "vi"}
              className={cn(
                "min-h-[32px] w-[30px] rounded-[8px] text-center text-[11px] font-bold transition-colors cursor-pointer",
                locale === "vi"
                  ? "bg-[#245B3D] text-white"
                  : "text-[#52645A] hover:text-[#25352B]",
              )}
            >
              {t.nav.languageLabelVi}
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={cn(
                "min-h-[32px] w-[30px] rounded-[8px] text-center text-[11px] font-bold transition-colors cursor-pointer",
                locale === "en"
                  ? "bg-[#245B3D] text-white"
                  : "text-[#52645A] hover:text-[#25352B]",
              )}
            >
              {t.nav.languageLabelEn}
            </button>
          </div>

          <Link
            href={linkHref("/cart")}
            className="flex min-h-[38px] w-[54px] shrink-0 items-center justify-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-1.5 text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5] 2xl:w-[88px] 2xl:px-2.5"
            aria-label={`${t.nav.cartAria}: ${cartCount}`}
          >
            <ShoppingBasket className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <span className="hidden 2xl:inline">{t.nav.cartShort}</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#245B3D] px-1.5 text-[11px] font-bold text-white tabular-nums">
              {cartCount}
            </span>
          </Link>

          {authUser ? (
            <div ref={avatarBoxRef} className="relative flex items-center gap-1.5">
              <Link
                href={linkHref("/account/settings#notifications")}
                className="relative hidden min-h-[38px] min-w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5] sm:inline-flex"
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
                onClick={() => setAvatarOpen((v) => !v)}
                aria-expanded={avatarOpen}
                aria-haspopup="menu"
                aria-label={t.nav.accountMenuAria}
                className="flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#245B3D]/30 bg-white px-2 py-1 text-left text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5] cursor-pointer"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: authUser.avatarBg }}
                >
                  {authUser.avatarText}
                </span>
                <span className="hidden max-w-[82px] truncate sm:inline lg:hidden xl:inline">{authUser.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#52645A]" aria-hidden="true" />
              </button>

              {avatarOpen ? (
                <div
                  role="menu"
                  aria-label={t.nav.accountMenuAria}
                  className="absolute top-[46px] right-0 z-50 w-[308px] rounded-[16px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_16px_40px_rgba(37,53,43,0.18)]"
                >
                  <div className="rounded-[12px] bg-[#FAF8F1] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#25352B]">{authUser.name}</p>
                      <span className="rounded-full bg-[#EAF0E5] px-2 py-0.5 text-[10px] font-semibold text-[#245B3D]">
                        {t.brand.experienceSpaceBadge}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#245B3D]">
                      {stripWorkspaceCodePrefix(
                        locale === "en" && authUser.roleLabelEn ? authUser.roleLabelEn : authUser.roleLabel,
                      )}
                    </p>
                    <p className="text-[11px] text-[#52645A]">{authUser.unitName}</p>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Link
                      href={linkHref(WORKSPACE_HOME[authUser.workspaceId])}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Layers className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.workspaceLabel}</span>
                    </Link>
                    <Link
                      href={linkHref("/account")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <User className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.accountOrders}</span>
                    </Link>
                    <Link
                      href={linkHref("/account/settings")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Settings className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.nav.accountSettings}</span>
                    </Link>
                    <Link
                      href={linkHref("/demo")}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>{t.nav.quickAccess}</span>
                    </Link>
                  </div>

                  <div className="mt-2 border-t border-[#D6DED2] pt-2">
                    <p className="px-2 pb-1 text-[11px] font-bold text-[#52645A]">
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
                                locale === "en" && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel,
                              ),
                              locale,
                            );
                            router.push(linkHref(WORKSPACE_HOME[acc.workspaceId]));
                          }}
                          className={cn(
                            "rounded-[8px] px-2 py-1.5 text-left text-[11px] font-medium transition cursor-pointer",
                            acc.id === authUser.id
                              ? "bg-[#245B3D] text-white"
                              : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                          )}
                        >
                          <span className="block truncate font-semibold">{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#D6DED2] pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetDemoState();
                        setAvatarOpen(false);
                        notifySuccess(t.toasts.resetDone);
                      }}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium text-[#52645A] hover:bg-[#F5F3E9] cursor-pointer"
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
                      className="inline-flex items-center gap-1 rounded-[8px] bg-[#FDECEC] px-2.5 py-1.5 text-[11px] font-semibold text-[#A32D2D] hover:bg-[#FAD6D6] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.nav.signOut}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden shrink-0 items-center sm:grid sm:grid-cols-[78px_72px] sm:gap-1 xl:grid-cols-[90px_82px] xl:gap-1.5">
              <Link
                href={linkHref("/sign-in")}
                className="inline-flex min-h-[38px] w-full items-center justify-center gap-1 rounded-[10px] border border-[#245B3D] bg-white px-1 text-[11.5px] font-semibold text-[#245B3D] whitespace-nowrap hover:bg-[#EAF0E5] xl:text-xs"
              >
                <LogIn className="hidden h-3.5 w-3.5 shrink-0 xl:inline-block" aria-hidden="true" />
                <span>{t.nav.signIn}</span>
              </Link>
              <Link
                href={linkHref("/sign-up")}
                className="inline-flex min-h-[38px] w-full items-center justify-center gap-1 rounded-[10px] bg-[#245B3D] px-1 text-[11.5px] font-semibold text-white whitespace-nowrap hover:bg-[#19472E] xl:text-xs"
              >
                <UserPlus className="hidden h-3.5 w-3.5 shrink-0 xl:inline-block" aria-hidden="true" />
                <span>{t.nav.signUp}</span>
              </Link>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            ref={mobileToggleRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.nav.closeMenuAria : t.nav.openMenuAria}
            aria-expanded={mobileOpen}
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] lg:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="border-t border-[#D6DED2] bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#52645A]">
              {t.nav.languageSwitchAria}
            </span>
            <div
              role="group"
              aria-label={t.nav.languageSwitchAria}
              className="inline-flex items-center rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-0.5"
            >
              <button
                type="button"
                onClick={() => setLocale("vi")}
                aria-pressed={locale === "vi"}
                className={cn(
                  "min-h-[34px] rounded-[8px] px-3 text-xs font-bold cursor-pointer",
                  locale === "vi" ? "bg-[#245B3D] text-white" : "text-[#52645A]",
                )}
              >
                Tiếng Việt (VI)
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                className={cn(
                  "min-h-[34px] rounded-[8px] px-3 text-xs font-bold cursor-pointer",
                  locale === "en" ? "bg-[#245B3D] text-white" : "text-[#52645A]",
                )}
              >
                English (EN)
              </button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mb-3">
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
              className="min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-[#F5F3E9] pr-3 pl-9 text-sm text-[#25352B]"
            />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.concat(secondaryNavItems).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={linkHref(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 text-xs font-semibold text-[#25352B]"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {!authUser ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#D6DED2] pt-3">
              <Link
                href={linkHref("/sign-in")}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center justify-center rounded-[10px] border border-[#245B3D] bg-white text-xs font-semibold text-[#245B3D]"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href={linkHref("/sign-up")}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center justify-center rounded-[10px] bg-[#245B3D] text-xs font-semibold text-white"
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
