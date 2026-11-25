"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Compass,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  Menu,
  QrCode,
  Radio,
  RotateCcw,
  Search,
  Settings,
  ShoppingBasket,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { runGlobalSearch } from "@/lib/search/search-engine";
import { cn } from "@/lib/format";
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
  if (pathname.startsWith("/volunteer") || pathname.startsWith("/learn")) return "W03";
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
    notifications,
    resetDemoState,
  } = useDemoStore();

  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const avatarBoxRef = useRef<HTMLDivElement>(null);

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
      if (avatarBoxRef.current && !avatarBoxRef.current.contains(target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const searchPreview = useMemo(() => {
    if (searchText.trim().length < 2) return [];
    return runGlobalSearch(
      searchText,
      { products, farms, batches, lessons, missions },
      6,
    ).results;
  }, [searchText, products, farms, batches, lessons, missions]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems = [
    { href: "/marketplace", label: "Chợ OCOP", icon: Store },
    { href: "/explore", label: "Bản đồ", icon: Compass },
    { href: "/live", label: "OCOP Live", icon: Radio },
    { href: "/learn", label: "Học tập", icon: GraduationCap },
    { href: "/trace/scan", label: "Quét QR", icon: QrCode },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6DED2] bg-[#F5F3E9]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2.5 px-3 sm:px-4 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-[10px] py-1 pr-1 text-[#25352B]"
        >
          <img
            src="/images/stitch/stitch-01.jpg"
            alt="Logo NaiFarm"
            width={34}
            height={34}
            className="h-8 w-8 rounded-[9px] border border-[#D6DED2] object-cover sm:h-9 sm:w-9"
          />
          <div className="leading-tight whitespace-nowrap">
            <span className="block text-base font-bold tracking-tight text-[#245B3D]">
              NaiFarm
            </span>
            <span className="hidden text-[10px] font-medium text-[#52645A] xl:block">
              Chợ OCOP Thanh niên · Đồng Nai
            </span>
          </div>
        </Link>

        {/* Primary Desktop Links */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-[#EAF0E5] text-[#245B3D]"
                    : "text-[#25352B] hover:bg-[#EFECE0]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Global Search */}
        <div ref={searchBoxRef} className="relative hidden max-w-[290px] flex-1 md:block">
          <form onSubmit={handleSearchSubmit}>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Tìm nông sản, phường/xã, mã lô..."
              aria-label="Tìm kiếm nhanh trên NaiFarm"
              className="min-h-[38px] w-full rounded-[10px] border border-[#C7D2C2] bg-white pr-3 pl-9 text-xs text-[#25352B] placeholder:text-[#687A70]"
            />
          </form>

          {searchOpen && searchText.trim().length >= 2 ? (
            <div className="absolute top-[44px] right-0 left-0 z-50 rounded-[14px] border border-[#D6DED2] bg-white p-2 shadow-[0_14px_32px_rgba(37,53,43,0.16)]">
              {searchPreview.length > 0 ? (
                <div className="space-y-1">
                  {searchPreview.map((hit) => (
                    <Link
                      key={hit.id}
                      href={hit.href}
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
                    href={`/search?q=${encodeURIComponent(searchText.trim())}`}
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-[10px] bg-[#F5F3E9] px-3 py-2 text-center text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                  >
                    Xem tất cả kết quả cho &ldquo;{searchText.trim()}&rdquo; →
                  </Link>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-[#52645A]">
                  Chưa có gợi ý khớp. Nhấn Enter để tìm mở rộng.
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Right Actions: Cart + Guest Auth / Signed-in Avatar + Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/cart"
            className="flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5]"
            aria-label={`Giỏ hàng, đang có ${cartCount} sản phẩm`}
          >
            <ShoppingBasket className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span className="hidden xl:inline">Giỏ</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#245B3D] px-1.5 text-[11px] font-bold text-white tabular-nums">
              {cartCount}
            </span>
          </Link>

          {authUser ? (
            <div ref={avatarBoxRef} className="relative flex items-center gap-1.5">
              <Link
                href="/account/settings"
                className="relative hidden min-h-[38px] min-w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5] sm:inline-flex"
                aria-label={`Thông báo (${unreadNotifs} chưa đọc)`}
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
                className="flex min-h-[38px] items-center gap-2 rounded-[10px] border border-[#245B3D]/30 bg-white px-2 py-1 text-left text-xs font-semibold text-[#25352B] whitespace-nowrap hover:bg-[#EAF0E5]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: authUser.avatarBg }}
                >
                  {authUser.avatarText}
                </span>
                <span className="hidden max-w-[96px] truncate sm:inline">{authUser.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#52645A]" aria-hidden="true" />
              </button>

              {avatarOpen ? (
                <div
                  role="menu"
                  aria-label="Menu tài khoản Demo"
                  className="absolute top-[46px] right-0 z-50 w-[290px] rounded-[16px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_16px_40px_rgba(37,53,43,0.18)]"
                >
                  <div className="rounded-[12px] bg-[#FAF8F1] px-3 py-2.5">
                    <p className="text-xs font-bold text-[#25352B]">{authUser.name}</p>
                    <p className="text-[11px] font-semibold text-[#245B3D]">{authUser.roleLabel}</p>
                    <p className="text-[11px] text-[#52645A]">
                      {authUser.unitName} · Demo Session
                    </p>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Link
                      href={WORKSPACE_HOME[authUser.workspaceId]}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Layers className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>Không gian làm việc ({authUser.workspaceId})</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <User className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>Tài khoản &amp; Đơn hàng</span>
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <Settings className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>Cài đặt, Địa chỉ &amp; Thông báo</span>
                    </Link>
                    <Link
                      href="/demo"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>Trung tâm Trình diễn BGK</span>
                    </Link>
                  </div>

                  <div className="mt-2 border-t border-[#D6DED2] pt-2">
                    <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#52645A]">
                      Chuyển nhanh vai trò Demo
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {demoAccounts.slice(0, 6).map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            signInDemoAccount(acc.id);
                            setAvatarOpen(false);
                            toast.info(`Đã chuyển sang ${acc.roleLabel}`);
                            router.push(WORKSPACE_HOME[acc.workspaceId]);
                          }}
                          className={cn(
                            "rounded-[8px] px-2 py-1.5 text-left text-[11px] font-medium transition",
                            acc.id === authUser.id
                              ? "bg-[#245B3D] text-white"
                              : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                          )}
                        >
                          {acc.workspaceId} · {acc.name.split(" ").slice(-1)[0]}
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
                        toast.success("Đã đặt lại toàn bộ dữ liệu demo.");
                      }}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium text-[#52645A] hover:bg-[#F5F3E9]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reset Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        signOutDemo();
                        setAvatarOpen(false);
                        toast.info("Đã đăng xuất về chế độ Khách.");
                      }}
                      className="inline-flex items-center gap-1 rounded-[8px] bg-[#FDECEC] px-2.5 py-1.5 text-[11px] font-semibold text-[#A32D2D] hover:bg-[#FAD6D6]"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/sign-in"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-3 text-xs font-semibold text-[#245B3D] whitespace-nowrap hover:bg-[#EAF0E5]"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white whitespace-nowrap hover:bg-[#19472E]"
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="border-t border-[#D6DED2] bg-white px-4 py-4 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm nông sản, phường/xã, mã lô QR..."
              aria-label="Tìm kiếm trên di động"
              className="min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-[#F5F3E9] pr-3 pl-9 text-sm text-[#25352B]"
            />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 text-xs font-semibold text-[#25352B]"
                >
                  <Icon className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-[#EAF0E5] px-3 text-xs font-semibold text-[#245B3D]"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Demo BGK</span>
            </Link>
          </div>

          {!authUser ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#D6DED2] pt-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center justify-center rounded-[10px] border border-[#245B3D] bg-white text-xs font-semibold text-[#245B3D]"
              >
                Đăng nhập Demo
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center justify-center rounded-[10px] bg-[#245B3D] text-xs font-semibold text-white"
              >
                Đăng ký mới
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
