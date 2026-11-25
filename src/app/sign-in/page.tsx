"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LogIn, ShieldAlert, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifyAccountSwitch, notifySignOut } from "@/lib/toast";
import { stripWorkspaceCodePrefix } from "@/lib/format";
import { localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import type { WorkspaceId } from "@/types/naifarm";

const WORKSPACE_HOME: Record<WorkspaceId, string> = {
  W01: "/account",
  W02: "/farmer",
  W03: "/volunteer",
  W04: "/coordinator",
  W05: "/organization",
  W06: "/admin",
};

export default function SignInPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const {
    demoAccounts,
    roleBundleAccounts,
    authUser,
    supabaseQuickSignIn,
    supabaseRealSignIn,
    signOutDemo,
  } = useDemoStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [quickPendingId, setQuickPendingId] = useState<string | null>(null);
  const [showBundles, setShowBundles] = useState(false);

  const handleQuickSignIn = async (accountId: string) => {
    setQuickPendingId(accountId);
    try {
      const result = await supabaseQuickSignIn(accountId);
      if (!result.ok || !result.account) {
        toast.error(result.message);
        return;
      }
      const acc = result.account;
      notifyAccountSwitch(
        `${acc.name} (${isEn && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel})`,
        locale,
      );
      router.push(buildLocalizedHref(WORKSPACE_HOME[acc.workspaceId], locale));
    } finally {
      setQuickPendingId(null);
    }
  };

  const handleRealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error(isEn ? "Please enter your email and password." : "Vui lòng nhập email và mật khẩu.");
      return;
    }
    setPending(true);
    try {
      const result = await supabaseRealSignIn(email.trim(), password);
      if (!result.ok || !result.account) {
        toast.error(result.message);
        return;
      }
      const acc = result.account;
      notifyAccountSwitch(
        `${acc.name} (${isEn && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel})`,
        locale,
      );
      router.push(buildLocalizedHref(WORKSPACE_HOME[acc.workspaceId], locale));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 overflow-x-clip px-4 py-8 lg:px-8">
      <div>
        <Badge tone="info">
          {isEn ? "Quick Access · Experience Workspace" : "Truy cập nhanh · Không gian trải nghiệm"}
        </Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          {isEn
            ? "Sign in to NaiFarm — Choose an experience profile"
            : "Đăng nhập NaiFarm — Chọn nhanh 6 hồ sơ trải nghiệm"}
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          {isEn
            ? "Sessions run locally in your browser so you can explore every role smoothly without entering real credentials."
            : "Phiên hoạt động cục bộ trên trình duyệt để bạn trải nghiệm đầy đủ các không gian chức năng mà không cần nhập mật khẩu thật."}
        </p>
      </div>

      <DemoBanner
        title={isEn ? "1-Tap Workspace Switcher" : "Truy cập nhanh 1 chạm"}
        detail={
          isEn
            ? "Pick a profile below to preview Buyer, Orchard & Cooperative, Youth Volunteer, Community Coordinator, Partner Organization, or Governance views."
            : "Chọn một hồ sơ bên dưới để trải nghiệm ngay không gian Khách mua, Nhà nông & HTX, Thanh niên Tình nguyện, Điều phối, Tổ chức & Đối tác hoặc Quản trị."
        }
      />

      {authUser ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-[#245B3D] bg-[#EAF0E5]/70 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: authUser.avatarBg }}
            >
              {authUser.avatarText}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#245B3D]">
                {isEn ? "Active session · Experience workspace" : "Đang hoạt động · Không gian trải nghiệm"}
              </p>
              <p className="truncate text-base font-bold text-[#25352B]">
                {authUser.name} ·{" "}
                {stripWorkspaceCodePrefix(
                  isEn && authUser.roleLabelEn ? authUser.roleLabelEn : authUser.roleLabel,
                )}
              </p>
              <p className="text-xs text-[#52645A]">
                {localizeAdminUnitName(authUser.unitName, undefined, locale)}, {t.brand.cityLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildLocalizedHref(WORKSPACE_HOME[authUser.workspaceId], locale)}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              <span>{isEn ? "Open active workspace" : "Vào không gian hiện tại"}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => {
                signOutDemo();
                notifySignOut(locale);
              }}
              className="min-h-[42px] rounded-[10px] border border-[#D6DED2] bg-white px-4 text-xs font-semibold text-[#25352B] hover:bg-[#F5F3E9] cursor-pointer"
            >
              {t.nav.signOut}
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-7 xl:col-span-8">
          <h2 className="text-base font-bold text-[#25352B]">
            {isEn ? "1-Tap Profiles (6 Role Views)" : "Chọn tài khoản 1 chạm (6 hồ sơ theo vai trò)"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {demoAccounts.slice(0, 6).map((acc) => {
              const isSelected = acc.id === authUser?.id;
              const cleanRoleLabel = stripWorkspaceCodePrefix(
                isEn && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel,
              );
              return (
                <Card
                  key={acc.id}
                  className={
                    isSelected
                      ? "flex min-w-0 flex-col justify-between border-[#245B3D] bg-[#FAF8F1] p-4"
                      : "flex min-w-0 flex-col justify-between p-4"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: acc.avatarBg }}
                        >
                          {acc.avatarText}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#25352B]">{acc.name}</p>
                          <p className="truncate text-[11px] font-semibold text-[#245B3D]">
                            {cleanRoleLabel}
                          </p>
                        </div>
                      </div>
                      {!acc.canPublicSignUp ? (
                        <Badge tone="warning">{isEn ? "Scoped role" : "Phân quyền nội bộ"}</Badge>
                      ) : (
                        <Badge tone="success">{isEn ? "Standard" : "Phổ thông"}</Badge>
                      )}
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#52645A]">
                      {isEn && acc.bioEn ? acc.bioEn : acc.bio}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-[#52645A]">
                      {isEn ? "Area" : "Địa bàn"}: {localizeAdminUnitName(acc.unitName, undefined, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={quickPendingId !== null}
                    onClick={() => void handleQuickSignIn(acc.id)}
                    className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {quickPendingId === acc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {quickPendingId === acc.id
                        ? isEn
                          ? "Signing in..."
                          : "Đang đăng nhập..."
                        : isEn
                        ? "Use this profile"
                        : "Chọn tài khoản này"}
                    </span>
                  </button>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="h-fit min-w-0 space-y-4 p-5 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
            <LogIn className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>{isEn ? "Sign in with Email & Password" : "Đăng nhập bằng Email & Mật khẩu"}</span>
          </div>
          <form onSubmit={(e) => void handleRealSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-xs font-semibold text-[#25352B]">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@naifarm.vn"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Password" : "Mật khẩu"}
              </label>
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{pending ? (isEn ? "Signing in..." : "Đang đăng nhập...") : isEn ? "Sign in" : "Đăng nhập"}</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D6DED2] pt-3 text-xs">
            <Link href={buildLocalizedHref("/forgot-password", locale)} className="font-semibold text-[#245B3D] hover:underline">
              {isEn ? "Access help?" : "Quên thông tin truy cập?"}
            </Link>
            <Link href={buildLocalizedHref("/sign-up", locale)} className="font-semibold text-[#245B3D] hover:underline">
              {t.nav.signUp} →
            </Link>
          </div>
          {authUser ? (
            <button
              type="button"
              onClick={() => {
                signOutDemo();
                notifySignOut(locale);
              }}
              className="w-full rounded-[10px] bg-[#FDECEC] px-3 py-2 text-xs font-semibold text-[#A32D2D] hover:bg-[#FAD6D6] cursor-pointer"
            >
              {t.nav.signOut}
            </button>
          ) : null}
          <p className="flex items-start gap-1.5 text-[11px] text-[#52645A]">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#80520C]" aria-hidden="true" />
            <span>
              {isEn
                ? "Coordinator, Organization, and Platform Governance scopes are granted through internal review, not public signup."
                : "Các vai trò Điều phối, Tổ chức và Quản trị không cấp từ form đăng ký công khai."}
            </span>
          </p>
        </Card>
      </div>

      {/* Expandable 15 Permission Role Bundles (incl. Minor Safeguarding account) */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#25352B]">
              {isEn
                ? `15 Granular Permission Role Bundles`
                : `15 Hồ sơ Phân quyền chi tiết theo vai trò`}
            </h2>
            <p className="text-xs text-[#52645A]">
              {isEn
                ? "Includes Coop Accountant, Warehouse Lead, Tour Guide, School Teacher, Supervised Minor (<18), and Platform Governance."
                : "Bao gồm Kế toán HTX, Thủ kho FEFO, Hướng dẫn viên tour, Giáo viên trường học, Học sinh dưới 18 tuổi và Kiểm soát viên."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBundles((v) => !v)}
            className="min-h-[38px] rounded-[10px] border border-[#245B3D] bg-[#EAF0E5] px-3 text-xs font-semibold text-[#245B3D] cursor-pointer"
          >
            {showBundles
              ? t.nav.closeButton
              : isEn
              ? `Show ${roleBundleAccounts.length} role bundles`
              : `Mở ${roleBundleAccounts.length} hồ sơ quyền`}
          </button>
        </div>

        {showBundles ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {roleBundleAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex flex-col justify-between rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <Badge tone={acc.isMinor ? "warning" : "neutral"}>{acc.workspaceId}</Badge>
                    <span className="font-mono text-[11px] text-[#52645A]">
                      {acc.bundleId ?? "role"}
                    </span>
                  </div>
                  <p className="mt-1.5 font-bold text-[#25352B]">{acc.name}</p>
                  <p className="font-semibold text-[#245B3D]">
                    {isEn && acc.roleLabelEn ? acc.roleLabelEn : acc.roleLabel}
                  </p>
                  <p className="mt-1 text-[11px] text-[#52645A]">
                    {isEn && acc.bioEn ? acc.bioEn : acc.bio}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSignIn(acc.id)}
                  className="mt-3 min-h-[36px] rounded-[8px] bg-[#245B3D] px-3 font-semibold text-white hover:bg-[#19472E] cursor-pointer"
                >
                  {isEn ? "Switch to this bundle" : "Dùng hồ sơ quyền này"}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
