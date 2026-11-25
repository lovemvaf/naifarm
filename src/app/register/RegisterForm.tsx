"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Primitives";

const ROLE_HOME: Record<string, string> = {
  customer: "/account",
  farmer: "/farmer",
  volunteer: "/volunteer",
  organization: "/organization",
};

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "customer", label: "Khách mua & Cá nhân (W01)" },
  { value: "farmer", label: "Nhà nông / Chủ vườn (W02)" },
  { value: "volunteer", label: "Thanh niên Tình nguyện (W03)" },
  { value: "organization", label: "Tổ chức & Đối tác (W05)" },
];

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        data: { full_name: fullName, phone, role },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.replace(ROLE_HOME[role] ?? "/account");
      return;
    }
    setNotice("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
    setLoading(false);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
          <Sprout className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-[family-name:var(--font-lora)] text-2xl font-bold text-[#25352B]">
          Đăng ký tài khoản NaiFarm
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[16px] border border-[#D6DED2] bg-white p-6 shadow-[0_2px_8px_rgba(37,53,43,0.06)]"
      >
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-sm font-semibold text-[#25352B]">
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-[#25352B]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-sm font-semibold text-[#25352B]">
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-[#25352B]">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role" className="block text-sm font-semibold text-[#25352B]">
            Vai trò
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="rounded-[10px] bg-[#FDECEC] px-3 py-2 text-sm text-[#A32D2D]">{error}</p>
        ) : null}
        {notice ? (
          <p className="rounded-[10px] bg-[#E6F3E9] px-3 py-2 text-sm text-[#24603B]">{notice}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </Button>

        <p className="text-center text-sm text-[#52645A]">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-[#245B3D]">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
