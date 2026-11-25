import React from "react";
import Link from "next/link";
import { Compass, Home, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-soft text-primary">
        <Sprout className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">404 · Không tìm thấy trang</p>
      <h1 className="mt-2 font-[family-name:var(--font-lora)] text-3xl font-bold text-foreground">
        Đường dẫn này chưa có trên Chợ NaiFarm
      </h1>
      <p className="mt-2 text-sm text-muted">
        Bạn có thể quay về Trang chủ Chợ OCOP Thanh niên hoặc mở Trung tâm Trình diễn Giám khảo để
        chọn nhanh toàn bộ 16 tuyến màn hình hợp lệ.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>Về Trang chủ Chợ OCOP</span>
        </Link>
        <Link
          href="/demo"
          className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] border border-primary bg-white px-5 text-sm font-semibold text-primary hover:bg-surface-soft"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
          <span>Mở Trung tâm Trình diễn</span>
        </Link>
      </div>
    </div>
  );
}
