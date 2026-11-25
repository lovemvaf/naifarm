"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, UserPlus } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import type { WorkspaceId } from "@/types/naifarm";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpDemoGuest } = useDemoStore();
  const [name, setName] = useState("");
  const [emailDemo, setEmailDemo] = useState("");
  const [requestedRole, setRequestedRole] = useState<WorkspaceId>("W01");
  const [unitCode, setUnitCode] = useState("26041");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = signUpDemoGuest({
      name,
      emailDemo,
      requestedRole,
      unitCode,
    });
    if (!result.ok || !result.account) {
      setErrorMsg(result.message);
      notifyError(result.message);
      return;
    }
    notifySuccess(result.message);
    router.push(
      result.account.workspaceId === "W02"
        ? "/farmer"
        : result.account.workspaceId === "W03"
        ? "/volunteer"
        : "/account",
    );
  };

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">Đăng ký tài khoản · Không gian trải nghiệm</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Tạo tài khoản NaiFarm
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Đăng ký miễn phí cho Khách mua (W01), Nhà nông (W02) hoặc Thanh niên Tình nguyện (W03) —
          dữ liệu lưu cục bộ trên trình duyệt để trải nghiệm luồng nghiệp vụ.
        </p>
      </div>

      <DemoBanner
        title="Quy tắc phân quyền an toàn"
        detail="Đăng ký công khai chỉ mở cho vai trò Khách mua, Nhà nông và Thanh niên Tình nguyện. Quyền Điều phối (W04), Tổ chức (W05) và Quản trị (W06) được cấp qua phê duyệt nội bộ."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-[#25352B]">
                Họ và tên hiển thị <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Quân"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-[#25352B]">
                Email liên hệ
              </label>
              <input
                id="signup-email"
                type="email"
                value={emailDemo}
                onChange={(e) => setEmailDemo(e.target.value)}
                placeholder="quan.nguyen@example.com"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-role" className="block text-xs font-semibold text-[#25352B]">
                Vai trò tham gia
              </label>
              <select
                id="signup-role"
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as WorkspaceId)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                <option value="W01">Cá nhân &amp; Khách mua</option>
                <option value="W02">Nhà nông / Chủ vườn</option>
                <option value="W03">Thanh niên Tình nguyện</option>
              </select>
            </div>

            <div>
              <label htmlFor="signup-unit" className="block text-xs font-semibold text-[#25352B]">
                Phường / Xã tại Thành phố Đồng Nai
              </label>
              <select
                id="signup-unit"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {ADMINISTRATIVE_UNITS.map((unit) => (
                  <option key={unit.maDvhc} value={unit.maDvhc}>
                    {unit.tenDayDu} ({unit.maDvhc})
                  </option>
                ))}
              </select>
            </div>
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
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span>Tạo tài khoản trải nghiệm</span>
          </button>

          <p className="text-center text-xs text-[#52645A]">
            Đã có tài khoản sẵn?{" "}
            <Link href="/sign-in" className="font-semibold text-[#245B3D] hover:underline">
              Truy cập nhanh theo vai trò →
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
