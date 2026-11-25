"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck, ShieldAlert, UserPlus } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import type { AppRole } from "@/types/naifarm";

const ROLE_OPTIONS: { value: AppRole; label: string; enLabel: string; home: string }[] = [
  { value: "customer", label: "Cá nhân & Khách mua", enLabel: "Personal & Buyer", home: "/account" },
  { value: "farmer", label: "Nhà nông / Chủ vườn", enLabel: "Orchard Owner / Farmer", home: "/farmer" },
  { value: "volunteer", label: "Thanh niên Tình nguyện", enLabel: "Youth Volunteer", home: "/volunteer" },
  { value: "organization", label: "Tổ chức / HTX / Doanh nghiệp", enLabel: "Organization / Cooperative / Business", home: "/organization" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { supabaseRealSignUp, signUpDemoGuest } = useDemoStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("customer");
  const [unitCode, setUnitCode] = useState("26041");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (name.trim().length < 2) {
      setErrorMsg(isEn ? "Please enter at least 2 characters for your display name." : "Vui lòng nhập họ tên tối thiểu 2 ký tự.");
      return;
    }
    if (!email.trim() || password.length < 6) {
      setErrorMsg(isEn ? "Please provide an email and password with at least 6 characters." : "Vui lòng nhập email và mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setPending(true);
    try {
      const result = await supabaseRealSignUp(email.trim(), password, name.trim(), role);
      if (!result.ok) {
        const fallback = signUpDemoGuest({
          name,
          emailDemo: email,
          requestedRole: role === "farmer" ? "W02" : role === "volunteer" ? "W03" : "W01",
          unitCode,
        });
        if (fallback.ok) {
          notifySuccess(
            isEn
              ? "Created a local browser experience account."
              : "Đã tạo tài khoản trải nghiệm cục bộ trên trình duyệt.",
          );
          router.push(
            buildLocalizedHref(
              role === "farmer" ? "/farmer" : role === "volunteer" ? "/volunteer" : "/account",
              locale,
            ),
          );
          return;
        }
        setErrorMsg(fallback.message);
        notifyError(fallback.message);
        return;
      }
      notifySuccess(result.message);
      setAwaitingConfirm(true);
    } finally {
      setPending(false);
    }
  };

  if (awaitingConfirm) {
    return (
      <div className="mx-auto max-w-[640px] space-y-6 px-4 py-12 lg:px-8">
        <Card className="space-y-4 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="font-editorial text-2xl font-semibold text-[#25352B]">
            Kiểm tra hộp thư của bạn
          </h1>
          <p className="text-sm text-[#52645A]">
            NaiFarm đã gửi liên kết xác minh tới <strong>{email}</strong>. Mở email và bấm xác nhận để
            hoàn tất đăng ký, sau đó đăng nhập lại.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/sign-in"
              className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              Về trang đăng nhập
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-[12px] border border-[#245B3D] bg-white px-5 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              Về trang chủ
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role) ?? ROLE_OPTIONS[0];

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">{isEn ? "Sign Up" : "Đăng ký tài khoản"}</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          {isEn ? "Create a NaiFarm Account" : "Tạo tài khoản NaiFarm"}
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          {isEn
            ? "Free registration for Buyers, Orchard Owners, Youth Volunteers, or Organizations & Cooperatives."
            : "Đăng ký miễn phí cho Khách mua, Nhà nông, Thanh niên Tình nguyện hoặc Tổ chức/HTX."}
        </p>
      </div>

      <DemoBanner
        title={isEn ? "Role Access Safeguard" : "Quy tắc phân quyền an toàn"}
        detail={
          isEn
            ? "Public registration covers Buyer, Farmer, Volunteer, and Organization roles. Coordinator and Governance scopes require internal approval."
            : "Đăng ký công khai chỉ mở cho Khách mua, Nhà nông, Thanh niên Tình nguyện và Tổ chức/HTX. Quyền Điều phối và Quản trị được cấp qua phê duyệt nội bộ."
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Display Name" : "Họ và tên hiển thị"} <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? "e.g. Minh Quan Nguyen" : "Ví dụ: Nguyễn Minh Quân"}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-[#25352B]">
                Email <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="quan.nguyen@example.com"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Password" : "Mật khẩu"} <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEn ? "Minimum 6 characters" : "Tối thiểu 6 ký tự"}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup-role" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Account Role" : "Vai trò tham gia"}
              </label>
              <select
                id="signup-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isEn ? option.enLabel : option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="signup-unit" className="block text-xs font-semibold text-[#25352B]">
              {isEn ? "Ward / Commune in Dong Nai City" : "Phường / Xã tại Thành phố Đồng Nai"}
            </label>
            <select
              id="signup-unit"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            >
              {ADMINISTRATIVE_UNITS.map((unit) => (
                <option key={unit.maDvhc} value={unit.maDvhc}>
                  {localizeAdminUnitName(unit.tenDayDu, undefined, locale)}
                </option>
              ))}
            </select>
          </div>

          {errorMsg ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[10px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{pending ? (isEn ? "Creating account..." : "Đang tạo tài khoản...") : isEn ? "Create Account" : "Tạo tài khoản"}</span>
          </button>

          <p className="text-center text-xs text-[#52645A]">
            {isEn ? "Already have an account?" : "Đã có tài khoản sẵn?"}{" "}
            <Link href={buildLocalizedHref("/sign-in", locale)} className="font-semibold text-[#245B3D] hover:underline">
              {isEn ? "Sign in now →" : "Đăng nhập ngay →"}
            </Link>
            {" · "}
            {isEn
              ? `Next destination: ${selectedRole.home}`
              : `Sau khi đăng ký, bạn sẽ vào ${selectedRole.home}.`}
          </p>
        </form>
      </Card>
    </div>
  );
}