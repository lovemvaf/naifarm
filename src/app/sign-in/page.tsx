"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
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
  const { demoAccounts, authUser, signInDemoAccount, signOutDemo } = useDemoStore();
  const [selectedId, setSelectedId] = useState<string>(authUser?.id ?? demoAccounts[0]?.id ?? "");
  const [simulatedEmail, setSimulatedEmail] = useState("");

  const handleOneClickDemo = (accountId: string) => {
    const logged = signInDemoAccount(accountId);
    if (!logged) return;
    toast.success(`Đã vào chế độ Demo: ${logged.name} (${logged.roleLabel})`);
    router.push(WORKSPACE_HOME[logged.workspaceId]);
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target =
      demoAccounts.find(
        (acc) =>
          simulatedEmail.trim() &&
          acc.emailDemo.toLowerCase().includes(simulatedEmail.trim().toLowerCase()),
      ) ??
      demoAccounts.find((acc) => acc.id === selectedId) ??
      demoAccounts[0];
    if (target) {
      handleOneClickDemo(target.id);
    }
  };

  return (
    <div className="mx-auto max-w-[1040px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="info">Đăng nhập Trải nghiệm (Frontend Demo)</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Đăng nhập NaiFarm — Chọn nhanh 6 vai trò trải nghiệm
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Hệ thống hoạt động hoàn toàn ở phía trình duyệt để phục vụ trình diễn Hackathon 2026: không
          thu thập hay lưu trữ mật khẩu thật.
        </p>
      </div>

      <DemoBanner
        title="Trải nghiệm tài khoản Demo 1 chạm"
        detail="Chọn một trong 6 vai trò bên dưới để trải nghiệm ngay Không gian Khách mua (W01), Nhà nông (W02), Thanh niên Tình nguyện (W03), Điều phối (W04), Tổ chức/HTX (W05) hoặc Quản trị (W06)."
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
              <p className="text-xs font-semibold text-[#245B3D]">Đang đăng nhập phiên Demo</p>
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
                toast.info("Đã trở về trạng thái Khách vãng lai.");
              }}
              className="min-h-[42px] rounded-[10px] border border-[#D6DED2] bg-white px-4 text-xs font-semibold text-[#25352B] hover:bg-[#F5F3E9]"
            >
              Đăng xuất Demo
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-base font-bold text-[#25352B]">
            Trải nghiệm nhanh 1 chạm (6 tài khoản mẫu)
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {demoAccounts.slice(0, 6).map((acc) => {
              const isSelected = acc.id === selectedId;
              return (
                <Card
                  key={acc.id}
                  className={
                    isSelected
                      ? "flex flex-col justify-between border-[#245B3D] bg-[#FAF8F1] p-4"
                      : "flex flex-col justify-between p-4"
                  }
                >
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
                    onClick={() => handleOneClickDemo(acc.id)}
                    className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#19472E]"
                  >
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Trải nghiệm tài khoản demo</span>
                  </button>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="h-fit space-y-4 p-5 lg:col-span-5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
            <Sparkles className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Đăng nhập bằng Email minh họa</span>
          </div>
          <form onSubmit={handleSimulatedSubmit} className="space-y-4">
            <div>
              <label htmlFor="demo-email" className="block text-xs font-semibold text-[#25352B]">
                Email tài khoản Demo
              </label>
              <input
                id="demo-email"
                type="text"
                value={simulatedEmail}
                onChange={(e) => setSimulatedEmail(e.target.value)}
                placeholder="Ví dụ: ngoclinh.buyer@naifarm-demo.local"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="demo-role-pick" className="block text-xs font-semibold text-[#25352B]">
                Hoặc chọn hồ sơ mặc định khi đăng nhập thử
              </label>
              <select
                id="demo-role-pick"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {demoAccounts.slice(0, 6).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {acc.roleLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
              <p className="flex items-center gap-1.5 font-semibold text-[#245B3D]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Không yêu cầu hoặc lưu mật khẩu</span>
              </p>
              <p className="mt-1">
                Phiên trải nghiệm lưu tạm trong <code>localStorage</code> trình duyệt và có thể đăng
                xuất bất kỳ lúc nào.
              </p>
            </div>
            <button
              type="submit"
              className="min-h-[46px] w-full rounded-[12px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              Vào phiên Demo
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D6DED2] pt-3 text-xs">
            <Link href="/forgot-password" className="font-semibold text-[#245B3D] hover:underline">
              Quên thông tin phiên Demo?
            </Link>
            <Link href="/sign-up" className="font-semibold text-[#245B3D] hover:underline">
              Đăng ký tài khoản mới →
            </Link>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-[#52645A]">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#80520C]" aria-hidden="true" />
            <span>
              Các vai trò Điều phối viên (W04), Tổ chức (W05) và Quản trị (W06) không cấp từ form đăng ký công khai.
            </span>
          </p>
        </Card>
      </div>
    </div>
  );
}
