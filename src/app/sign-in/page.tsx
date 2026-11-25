"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, LogIn, ShieldAlert, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { notifyAccountSwitch, notifySignOut } from "@/lib/toast";
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
  const { demoAccounts, authUser, supabaseQuickSignIn, supabaseRealSignIn, signOutDemo } = useDemoStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [quickPendingId, setQuickPendingId] = useState<string | null>(null);

  const handleQuickSignIn = async (accountId: string) => {
    setQuickPendingId(accountId);
    try {
      const result = await supabaseQuickSignIn(accountId);
      if (!result.ok || !result.account) {
        toast.error(result.message);
        return;
      }
      notifyAccountSwitch(`${result.account.name} (${result.account.roleLabel})`);
      router.push(WORKSPACE_HOME[result.account.workspaceId]);
    } finally {
      setQuickPendingId(null);
    }
  };

  const handleRealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setPending(true);
    try {
      const result = await supabaseRealSignIn(email.trim(), password);
      if (!result.ok || !result.account) {
        toast.error(result.message);
        return;
      }
      notifyAccountSwitch(`${result.account.name} (${result.account.roleLabel})`);
      router.push(WORKSPACE_HOME[result.account.workspaceId]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1040px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="info">Đăng nhập · Email &amp; mật khẩu</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Đăng nhập NaiFarm
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Dùng tài khoản NaiFarm của bạn, hoặc chọn nhanh một hồ sơ trải nghiệm theo vai trò bên dưới.
        </p>
      </div>

      <DemoBanner
        title="Tài khoản trải nghiệm theo vai trò"
        detail="Các hồ sơ trải nghiệm dùng mật khẩu chung naifarm123. Không gian Khách mua (W01), Nhà nông (W02), Thanh niên Tình nguyện (W03), Điều phối (W04), Tổ chức (W05) và Quản trị (W06)."
      />

      {authUser ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-[#245B3D] bg-[#EAF0E5]/70 p-5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: authUser.avatarBg }}
            >
              {authUser.avatarText}
            </span>
            <div>
              <p className="text-xs font-semibold text-[#245B3D]">Đang đăng nhập</p>
              <p className="text-base font-bold text-[#25352B]">
                {authUser.name} · {authUser.roleLabel}
              </p>
              <p className="text-xs text-[#52645A]">{authUser.unitName}, Thành phố Đồng Nai</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={WORKSPACE_HOME[authUser.workspaceId]}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              <span>Vào không gian hiện tại</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => {
                signOutDemo();
                notifySignOut();
              }}
              className="min-h-[42px] rounded-[10px] border border-[#D6DED2] bg-white px-4 text-xs font-semibold text-[#25352B] hover:bg-[#F5F3E9] cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-base font-bold text-[#25352B]">Chọn nhanh tài khoản theo vai trò</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {demoAccounts.slice(0, 6).map((acc) => (
              <Card key={acc.id} className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: acc.avatarBg }}
                      >
                        {acc.avatarText}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#25352B]">{acc.name}</p>
                        <p className="text-[11px] font-semibold text-[#245B3D]">{acc.roleLabel}</p>
                      </div>
                    </div>
                    {!acc.canPublicSignUp ? (
                      <Badge tone="warning">Phân quyền nội bộ</Badge>
                    ) : (
                      <Badge tone="success">Phổ thông</Badge>
                    )}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#52645A]">{acc.bio}</p>
                  <p className="mt-2 text-[11px] font-medium text-[#52645A]">
                    Địa bàn: {acc.unitName} ({acc.unitCode})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickSignIn(acc.id)}
                  disabled={quickPendingId !== null}
                  className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                >
                  {quickPendingId === acc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{quickPendingId === acc.id ? "Đang đăng nhập..." : "Chọn tài khoản này"}</span>
                </button>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit space-y-4 p-5 lg:col-span-5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
            <LogIn className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Đăng nhập bằng email</span>
          </div>
          <form onSubmit={handleRealSubmit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-xs font-semibold text-[#25352B]">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@naifarm.vn"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-xs font-semibold text-[#25352B]">
                Mật khẩu
              </label>
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
            <div className="rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
              <p className="flex items-center gap-1.5 font-semibold text-[#245B3D]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tài khoản trải nghiệm dùng mật khẩu naifarm123</span>
              </p>
              <p className="mt-1">
                Ví dụ: customer@naifarm.vn, farmer.batu@naifarm.vn, volunteer@naifarm.vn,
                coordinator@naifarm.vn, org@naifarm.vn, admin@naifarm.vn.
              </p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              <span>{pending ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D6DED2] pt-3 text-xs">
            <Link href="/forgot-password" className="font-semibold text-[#245B3D] hover:underline">
              Quên mật khẩu?
            </Link>
            <Link href="/sign-up" className="font-semibold text-[#245B3D] hover:underline">
              Đăng ký tài khoản mới →
            </Link>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-[#52645A]">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#80520C]" aria-hidden="true" />
            <span>
              Vai trò Điều phối (W04) và Quản trị (W06) không cấp từ form đăng ký công khai.
            </span>
          </p>
        </Card>
      </div>
    </div>
  );
}