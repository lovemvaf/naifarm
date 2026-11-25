"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, HelpCircle, RotateCcw } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { notifySuccess } from "@/lib/toast";
import { Badge, Card } from "@/components/ui/Primitives";

export default function ForgotPasswordPage() {
  const { resetDemoState } = useDemoStore();
  const [emailInput, setEmailInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    notifySuccess("Đã hiển thị hướng dẫn khôi phục truy cập.");
  };

  return (
    <div className="mx-auto max-w-[640px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="info">Hỗ trợ truy cập · Không gian trải nghiệm</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Khôi phục quyền truy cập tài khoản
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Trong không gian trải nghiệm hiện tại, hệ thống không thu thập hoặc lưu trữ mật khẩu thật.
          Bạn luôn có thể chọn lại 6 tài khoản có sẵn hoặc đặt lại dữ liệu mặc định.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recover-email" className="block text-xs font-semibold text-[#25352B]">
              Email hoặc tên tài khoản cần tra cứu
            </label>
            <input
              id="recover-email"
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Ví dụ: ngoclinh@example.com"
              className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E] cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            <span>Kiểm tra hướng dẫn khôi phục</span>
          </button>
        </form>

        {submitted ? (
          <div className="rounded-[12px] border border-[#245B3D]/30 bg-[#EAF0E5] p-4 text-xs text-[#25352B]">
            <p className="flex items-center gap-1.5 font-bold text-[#245B3D]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Không gửi email ra hệ thống bên ngoài</span>
            </p>
            <p className="mt-1 leading-relaxed text-[#52645A]">
              Bạn có thể quay lại trang Đăng nhập để chọn 1 chạm vào bất kỳ hồ sơ nào, hoặc nhấn
              nút đặt lại dữ liệu trải nghiệm bên dưới.
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
