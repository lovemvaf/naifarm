"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Primitives";

const ROLE_HOME: Record<string, string> = {
  customer: "/account",
  farmer: "/farmer",
  volunteer: "/volunteer",
  coordinator: "/coordinator",
  organization: "/organization",
  admin: "/admin",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect") ?? "";
  const redirect =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    const home = ROLE_HOME[(profile?.role as string) ?? "customer"] ?? "/account";
    router.replace(redirect || home);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
          <Sprout className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-[family-name:var(--font-lora)] text-2xl font-bold text-[#25352B]">
          Đăng nhập NaiFarm
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Chợ OCOP Thanh niên · Thành phố Đồng Nai
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[16px] border border-[#D6DED2] bg-white p-6 shadow-[0_2px_8px_rgba(37,53,43,0.06)]"
      >
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
          <label htmlFor="password" className="block text-sm font-semibold text-[#25352B]">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B] outline-none focus:border-[#245B3D]"
          />
        </div>

        {error ? (
          <p className="rounded-[10px] bg-[#FDECEC] px-3 py-2 text-sm text-[#A32D2D]">{error}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>

        <p className="text-center text-sm text-[#52645A]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-[#245B3D]">
            Đăng ký
          </Link>
        </p>
      </form>

      <div className="mt-4 rounded-[12px] border border-[#D6DED2] bg-[#EAF0E5] px-4 py-3 text-xs text-[#25352B]">
        <p className="font-semibold">Tài khoản demo (mật khẩu naifarm123)</p>
        <ul className="mt-1 space-y-0.5 tabular-nums text-[#52645A]">
          <li>customer@naifarm.vn · Ngọc Linh (W01)</li>
          <li>farmer.batu@naifarm.vn · Chú Ba Tư (W02)</li>
          <li>volunteer@naifarm.vn · Minh Anh (W03)</li>
          <li>coordinator@naifarm.vn · Thu Hà (W04)</li>
          <li>org@naifarm.vn · HTX Tân Triều (W05)</li>
          <li>admin@naifarm.vn · Quản trị (W06)</li>
        </ul>
      </div>
    </div>
  );
}
