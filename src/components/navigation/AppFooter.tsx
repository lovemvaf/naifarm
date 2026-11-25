import React from "react";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-14 border-t border-[#D6DED2] bg-[#EFECE0] pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Group 1: Thương hiệu */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/stitch/stitch-01.jpg"
                alt="Logo NaiFarm"
                width={34}
                height={34}
                className="h-9 w-9 rounded-lg border border-[#D6DED2] object-cover"
              />
              <div>
                <span className="block text-base font-bold text-[#245B3D]">
                  NaiFarm · Chợ OCOP Thanh niên
                </span>
                <span className="block text-[11px] text-[#52645A]">
                  Thành phố Đồng Nai · Group 8 Hackathon 2026
                </span>
              </div>
            </div>
            <p className="mt-3 font-editorial text-sm font-semibold text-[#25352B]">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#52645A]">
              Nguyên mẫu giao diện Frontend-Only thuộc bài thi Nhóm 8. Toàn bộ giá bán, tồn kho,
              hồ sơ VietGAP/OCOP mẫu, mã QR, giỏ hàng COD và lịch trình đều ở chế độ minh họa
              kiểm thử UX/UI.
            </p>
          </div>

          {/* Group 2: Mua sắm & Truy xuất */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-[#25352B]">Mua sắm &amp; Truy xuất</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
              <li>
                <Link href="/marketplace" className="hover:text-[#245B3D]">
                  Chợ nông sản Đồng Nai (10 danh mục)
                </Link>
              </li>
              <li>
                <Link href="/farms" className="hover:text-[#245B3D]">
                  Danh bạ 24 nhà vườn &amp; HTX
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[#245B3D]">
                  Bản đồ OpenStreetMap &amp; Du lịch vườn
                </Link>
              </li>
              <li>
                <Link href="/trace/scan" className="hover:text-[#245B3D]">
                  Quét mã QR / Tải ảnh tem truy xuất
                </Link>
              </li>
              <li>
                <Link href="/trace/NF-DEMO-001" className="hover:text-[#245B3D]">
                  Hộ chiếu QR mẫu NF-DEMO-001
                </Link>
              </li>
            </ul>
          </div>

          {/* Group 3: Cộng đồng & Không gian */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-[#25352B]">Cộng đồng &amp; Học tập</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
              <li>
                <Link href="/farmer" className="hover:text-[#245B3D]">
                  W02 · Không gian Nhà nông &amp; Mùa vụ
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="hover:text-[#245B3D]">
                  W03 · Thanh niên Tình nguyện số
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-[#245B3D]">
                  NaiAcademy · 12 Bài học &amp; Giải phẫu 2D
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-[#245B3D]">
                  OCOP Live Story Room
                </Link>
              </li>
              <li>
                <Link href="/coordinator" className="hover:text-[#245B3D]">
                  W04 · Điều phối cộng đồng
                </Link>
              </li>
            </ul>
          </div>

          {/* Group 4: Hỗ trợ & Trình diễn */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-[#25352B]">Hỗ trợ &amp; Tài khoản</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
              <li>
                <Link href="/sign-in" className="hover:text-[#245B3D]">
                  Đăng nhập Demo (6 vai trò)
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#245B3D]">
                  Tìm kiếm toàn hệ sinh thái
                </Link>
              </li>
              <li>
                <Link href="/organization" className="hover:text-[#245B3D]">
                  W05 · Đối tác &amp; HTX
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#245B3D]">
                  W06 · Quản trị minh bạch
                </Link>
              </li>
              <li>
                <Link href="/demo" className="font-semibold text-[#245B3D] hover:underline">
                  Trung tâm Trình diễn BGK
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#D6DED2] pt-5 text-xs text-[#52645A] md:flex-row md:items-center md:justify-between">
          <span>
            Dữ liệu địa giới hành chính tham chiếu: 95 Phường/Xã Thành phố Đồng Nai (mốc rà soát
            25/11/2026) · Tọa độ bản đồ là điểm minh họa sinh thái.
          </span>
          <span>
            Không lưu mật khẩu hoặc dữ liệu cá nhân thật · Không thu tiền hoặc chứng nhận pháp lý
          </span>
        </div>
      </div>
    </footer>
  );
}
