"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Compass,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  QrCode,
  Radio,
  RefreshCcw,
  ShoppingBasket,
  Store,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { cn } from "@/lib/format";
import { assetUrl } from "@/lib/storage/assets";
import type { AppRole, WorkspaceId } from "@/types/naifarm";

const ROLE_LABEL: Record<AppRole, string> = {
  customer: "Khách mua",
  farmer: "Chủ vườn",
  volunteer: "Tình nguyện viên",
  coordinator: "Điều phối viên",
  organization: "Tổ chức / HTX",
  admin: "Quản trị viên",
};

const WORKSPACE_OPTIONS: {
  id: WorkspaceId;
  code: string;
  label: string;
  role: string;
  href: string;
  appRole: AppRole;
}[] = [
  { id: "W01", code: "W01", label: "Cá nhân & Khách mua", role: "Khách mua", href: "/account", appRole: "customer" },
  { id: "W02", code: "W02", label: "Nhà nông", role: "Chủ vườn", href: "/farmer", appRole: "farmer" },
  { id: "W03", code: "W03", label: "Thanh niên Tình nguyện", role: "Tình nguyện viên", href: "/volunteer", appRole: "volunteer" },
  { id: "W04", code: "W04", label: "Điều phối cộng đồng", role: "Điều phối viên", href: "/coordinator", appRole: "coordinator" },
  { id: "W05", code: "W05", label: "Tổ chức & Đối tác", role: "HTX / DN / Trường", href: "/organization", appRole: "organization" },
  { id: "W06", code: "W06", label: "Quản trị nền tảng", role: "Quản trị viên", href: "/admin", appRole: "admin" },
];

function inferPathScopedWorkspace(pathname: string): WorkspaceId | null {
  if (pathname.startsWith("/farmer")) return "W02";
  if (pathname.startsWith("/volunteer")) return "W03";
  if (pathname.startsWith("/coordinator")) return "W04";
  if (pathname.startsWith("/organization")) return "W05";
  if (pathname.startsWith("/admin")) return "W06";
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname === "/" ||
    pathname.startsWith("/marketplace")
  ) {
    return "W01";
  }
  return null;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkspace, setActiveWorkspace, cart, role, profile, session, signOut, resetDemoState } =
    useDemoStore();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const pathWorkspace = inferPathScopedWorkspace(pathname);
  const effectiveWorkspace = pathWorkspace ?? activeWorkspace;

  useEffect(() => {
    if (pathWorkspace && pathWorkspace !== activeWorkspace) {
      setActiveWorkspace(pathWorkspace);
    }
  }, [pathWorkspace, activeWorkspace, setActiveWorkspace]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentWs = WORKSPACE_OPTIONS.find((w) => w.id === effectiveWorkspace) ?? WORKSPACE_OPTIONS[0];

  const allowedWorkspaces = WORKSPACE_OPTIONS.filter(
    (ws) => role === "admin" || ws.appRole === role
  );

  const navItems = [
    { href: "/marketplace", label: "Chợ OCOP", icon: Store },
    { href: "/explore", label: "Bản đồ & Nhà vườn", icon: Compass },
    { href: "/live", label: "OCOP Live", icon: Radio },
    { href: "/learn", label: "Học & 3D", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6DED2] bg-[#F5F3E9]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-[10px] py-1 pr-2 text-[#25352B]">
            <Image
              src={assetUrl("stitch/stitch-01.webp")}
              alt="Logo NaiFarm"
              width={36}
              height={36}
              className="h-9 w-9 rounded-[10px] border border-[#D6DED2] object-cover"
            />
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-[#245B3D]">NaiFarm</span>
              <span className="hidden text-[11px] font-medium text-[#52645A] sm:block">
                Chợ OCOP Thanh niên · Đồng Nai
              </span>
            </div>
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors duration-150",
                    active ? "bg-[#EAF0E5] text-[#245B3D] font-semibold" : "text-[#25352B] hover:bg-[#EAF0E5]/70"
                  )}
                >
                  <Icon className="h-4 w-4 text-[#245B3D]" aria-hidden="true" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/trace/NF-DEMO-001"
            className="hidden items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 py-2 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5] md:inline-flex"
            title="Quét / Tra cứu Hộ chiếu QR"
          >
            <QrCode className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            <span>Truy xuất QR</span>
          </Link>

          <Link
            href="/cart"
            aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            className="relative inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
          >
            <ShoppingBasket className="h-4 w-4 text-[#245B3D]" aria-hidden="true" strokeWidth={1.75} />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="tabular-nums inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#245B3D] px-1.5 text-[11px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((o) => !o)}
                aria-expanded={switcherOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#19472E] cursor-pointer"
              >
                <Layers className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
                <span className="hidden md:inline">{currentWs.code} · {currentWs.label}</span>
                <span className="md:hidden">{currentWs.code}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </button>

              {switcherOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSwitcherOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    aria-label="Chuyển không gian làm việc"
                    className="absolute right-0 z-50 mt-2 w-[300px] rounded-[14px] border border-[#D6DED2] bg-white p-2 shadow-[0_16px_48px_rgba(37,53,43,0.18)]"
                  >
                    <div className="border-b border-[#D6DED2] px-3 py-2">
                      <p className="text-xs font-semibold text-[#245B3D]">
                        {profile?.fullName ?? "Tài khoản"}
                      </p>
                      <p className="text-[11px] text-[#52645A]">
                        Vai trò: {role ? ROLE_LABEL[role] : "Khách"}
                      </p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {allowedWorkspaces.map((ws) => {
                        const active = ws.id === effectiveWorkspace;
                        return (
                          <button
                            key={ws.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setActiveWorkspace(ws.id);
                              setSwitcherOpen(false);
                              router.push(ws.href);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-sm cursor-pointer",
                              active ? "bg-[#EAF0E5] font-semibold text-[#245B3D]" : "text-[#25352B] hover:bg-[#F5F3E9]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-[#245B3D] px-1.5 py-0.5 text-[11px] font-bold text-white">
                                {ws.code}
                              </span>
                              <span>{ws.label}</span>
                            </div>
                            <User className="h-4 w-4 text-[#52645A]" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#D6DED2] pt-2 px-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setSwitcherOpen(false);
                          try {
                            await resetDemoState();
                            toast.success("Đã tải lại dữ liệu từ máy chủ.");
                          } catch {
                            toast.error("Không tải lại được dữ liệu. Vui lòng thử lại.");
                          }
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-[8px] px-2.5 text-xs font-semibold text-[#80520C] hover:bg-[#FFF2D8] cursor-pointer"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Tải lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setSwitcherOpen(false);
                          try {
                            await signOut();
                            toast.success("Đã đăng xuất.");
                            router.push("/");
                          } catch {
                            toast.error("Không đăng xuất được. Vui lòng thử lại.");
                          }
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-[8px] px-2.5 text-xs font-semibold text-[#A32D2D] hover:bg-[#FDECEC] cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
