"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, HelpCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { notifySuccess } from "@/lib/toast";
import { Badge, Card } from "@/components/ui/Primitives";

export default function ForgotPasswordPage() {
  const { resetDemoState, supabaseResetPassword } = useDemoStore();
  const [emailInput, setEmailInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Vui lòng nhập email cần đặt lại mật khẩu.");
      return;
    }
    setPending(true);
    try {
      const result = await supabaseResetPassword(emailInput.trim());
      if (result.ok) {
        setDemoMode(false);
        setSubmitted(true);
        notifySuccess(result.message);
        return;
      }
      setDemoMode(true);
      setSubmitted(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[640px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="info">Hỗ trợ truy cập</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Khôi phục quyền truy cập tài khoản
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu từ NaiFarm.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recover-email" className="block text-xs font-semibold text-[#25352B]">
              Email tài khoản cần đặt lại mật khẩu
            </label>
            <input
              id="recover-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="ten@naifarm.vn"
              className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{pending ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}</span>
          </button>
        </form>

        {submitted ? (
          <div className="rounded-[12px] border border-[#245B3D]/30 bg-[#EAF0E5] p-4 text-xs text-[#25352B]">
            <p className="flex items-center gap-1.5 font-bold text-[#245B3D]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>
                {demoMode
                  ? "Chế độ trải nghiệm — chưa gửi email"
                  : "Đã gửi liên kết đặt lại mật khẩu"}
              </span>
            </p>
            <p className="mt-1 leading-relaxed text-[#52645A]">
              {demoMode
                ? "Supabase chưa kết nối trong môi trường này. Bạn có thể quay lại trang Đăng nhập để chọn tài khoản trải nghiệm, hoặc đặt lại dữ liệu trải nghiệm bên dưới."
                : `Kiểm tra hộp thư ${emailInput.trim()} và bấm liên kết để đặt mật khẩu mới. Nếu không thấy email, hãy kiểm tra thư mục Spam.`}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D6DED2] pt-4">
          <button
            type="button"
            onClick={() => {
              resetDemoState();
              notifySuccess("Đã đặt lại toàn bộ dữ liệu trải nghiệm mặc định.");
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#F5F3E9] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Đặt lại dữ liệu trải nghiệm</span>
          </button>
          <Link
            href="/sign-in"
            className="text-xs font-semibold text-[#245B3D] hover:underline"
          >
            Quay lại Đăng nhập →
          </Link>
        </div>
      </Card>
    </div>
  );
}