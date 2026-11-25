import Image from "next/image";
import React from "react";
import Link from "next/link";
import { assetUrl } from "@/lib/storage/assets";

export function AppFooter() {
  return (
    <footer className="mt-14 border-t border-border bg-surface-warm pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image
                src={assetUrl("stitch/stitch-01.webp")}
                alt="Logo NaiFarm"
                className="h-8 w-8 rounded-lg border border-border object-cover"
                width={512}
                height={512}
              />
              <span className="text-lg font-bold text-primary">NaiFarm · Chợ OCOP Thanh niên</span>
            </div>
            <p className="mt-2 font-editorial text-sm font-medium text-foreground">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">
              Nền tảng Chợ OCOP Thanh niên Thành phố Đồng Nai 2026. Dữ liệu nhà vườn, nông sản, hồ
              sơ OCOP, mã QR và đơn hàng COD được lưu trữ trên Supabase.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Khám phá Chợ & Truy xuất</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/marketplace" className="hover:text-primary">Danh mục nông sản Đồng Nai</Link></li>
              <li><Link href="/farms" className="hover:text-primary">Hồ sơ nhà vườn Tân Triều & Long Khánh</Link></li>
              <li><Link href="/trace/NF-DEMO-001" className="hover:text-primary">Hộ chiếu QR lô NF-DEMO-001</Link></li>
              <li><Link href="/explore" className="hover:text-primary">Bản đồ & Du lịch sinh thái</Link></li>
              <li><Link href="/live" className="hover:text-primary">Phòng OCOP Live Story</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Không gian Hệ sinh thái</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/farmer" className="hover:text-primary">W02 · Nhà nông & Đăng bán 3 bước</Link></li>
              <li><Link href="/volunteer" className="hover:text-primary">W03 · Thanh niên Tình nguyện</Link></li>
              <li><Link href="/learn" className="hover:text-primary">Học tập Hạt điều & Thư viện 3D</Link></li>
              <li><Link href="/coordinator" className="hover:text-primary">W04 · Điều phối cộng đồng</Link></li>
              <li><Link href="/demo" className="font-semibold text-primary hover:underline">Trung tâm Trình diễn BGK</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted">
          <span>Group 8 · Hackathon Đồng Nai 2026 · NaiFarm Platform</span>
          <span>Thanh toán COD khi nhận hàng · Dữ liệu đồng bộ Supabase</span>
        </div>
      </div>
    </footer>
  );
}
