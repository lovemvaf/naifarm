import React from "react";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-14 border-t border-[#D6DED2] bg-[#EFECE0] pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/stitch/stitch-01.jpg"
                alt="Logo NaiFarm"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg border border-[#D6DED2] object-cover"
              />
              <span className="text-lg font-bold text-[#245B3D]">NaiFarm · Chợ OCOP Thanh niên</span>
            </div>
            <p className="mt-2 font-editorial text-sm font-medium text-[#25352B]">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#52645A]">
              Nguyên mẫu giao diện Frontend-Only thuộc bài thi Nhóm 8 — Hackathon Thành phố Đồng Nai
              2026. Toàn bộ dữ liệu sản phẩm, hồ sơ OCOP, mã QR, giỏ hàng COD và lịch trình đều ở
              chế độ minh họa demo.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#25352B]">Khám phá Chợ & Truy xuất</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
              <li><Link href="/marketplace" className="hover:text-[#245B3D]">Danh mục nông sản Đồng Nai</Link></li>
              <li><Link href="/farms" className="hover:text-[#245B3D]">Hồ sơ nhà vườn Tân Triều & Long Khánh</Link></li>
              <li><Link href="/trace/NF-DEMO-001" className="hover:text-[#245B3D]">Hộ chiếu QR lô NF-DEMO-001</Link></li>
              <li><Link href="/explore" className="hover:text-[#245B3D]">Bản đồ & Du lịch sinh thái</Link></li>
              <li><Link href="/live" className="hover:text-[#245B3D]">Phòng OCOP Live Story</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#25352B]">Không gian Hệ sinh thái</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
              <li><Link href="/farmer" className="hover:text-[#245B3D]">W02 · Nhà nông & Đăng bán 3 bước</Link></li>
              <li><Link href="/volunteer" className="hover:text-[#245B3D]">W03 · Thanh niên & Youth Pass</Link></li>
              <li><Link href="/learn" className="hover:text-[#245B3D]">Học tập Hạt điều & Thư viện 3D</Link></li>
              <li><Link href="/coordinator" className="hover:text-[#245B3D]">W04 · Điều phối cộng đồng</Link></li>
              <li><Link href="/demo" className="font-semibold text-[#245B3D] hover:underline">Trung tâm Trình diễn BGK</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#D6DED2] pt-5 text-xs text-[#52645A]">
          <span>Group 8 · Hackathon Đồng Nai 2026 · Frontend-Only High-Fidelity Prototype</span>
          <span>Không lưu dữ liệu cá nhân thật · Không kết nối thanh toán hoặc backend thực</span>
        </div>
      </div>
    </footer>
  );
}
