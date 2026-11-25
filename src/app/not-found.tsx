import React from "react";
import Link from "next/link";
import { Compass, Home, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
        <Sprout className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#245B3D]">404 · Không tìm thấy trang</p>
      <h1 className="mt-2 font-[family-name:var(--font-lora)] text-3xl font-bold text-[#25352B]">
        Đường dẫn này chưa có trên Chợ NaiFarm
      </h1>
      <p className="mt-2 text-sm text-[#52645A]">
        Bạn có thể quay về Trang chủ Chợ OCOP Thanh niên hoặc mở trang Truy cập nhanh để chọn tuyến
        màn hình phù hợp.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>Về Trang chủ Chợ OCOP</span>
        </Link>
        <Link
          href="/demo"
          className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] border border-[#245B3D] bg-white px-5 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
          <span>Truy cập nhanh</span>
        </Link>
      </div>
    </div>
  );
}
