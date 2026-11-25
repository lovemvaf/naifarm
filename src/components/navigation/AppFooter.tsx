import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const FOOTER_GROUPS = [
  {
    title: "Mua sắm & Truy xuất",
    links: [
      { href: "/marketplace", label: "Chợ nông sản Đồng Nai" },
      { href: "/farms", label: "Danh bạ nhà vườn & HTX" },
      { href: "/explore", label: "Bản đồ nhà vườn & du lịch vườn" },
      { href: "/quality", label: "Trung tâm chất lượng & OCOP" },
      { href: "/trace/scan", label: "Quét tem truy xuất nguồn gốc" },
    ],
  },
  {
    title: "Cộng đồng & Học tập",
    links: [
      { href: "/farmer", label: "Không gian Nhà nông & HTX" },
      { href: "/volunteer", label: "Thanh niên tình nguyện số" },
      { href: "/learn", label: "Góc học tập & giải phẫu 2D" },
      { href: "/live", label: "Phòng OCOP Live" },
      { href: "/coordinator", label: "Điều phối cộng đồng" },
    ],
  },
  {
    title: "Hỗ trợ & Chính sách",
    links: [
      { href: "/sign-in", label: "Đăng nhập / Truy cập nhanh" },
      { href: "/search", label: "Tìm kiếm toàn trang" },
      { href: "/organization", label: "Hợp tác xã & Tổ chức" },
      { href: "/admin", label: "Quản trị hệ thống" },
      { href: "/policies", label: "Chính sách & Minh bạch dữ liệu" },
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="mt-14 border-t border-[#D6DED2] bg-[#EFECE0] pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          {/* Giới thiệu thương hiệu */}
          <div className="sm:col-span-2 lg:col-span-4">
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
                  Thành phố Đồng Nai
                </span>
              </div>
            </div>
            <p className="mt-3 font-editorial text-sm font-semibold text-[#25352B]">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#52645A]">
              Nền tảng kết nối nông sản Đồng Nai, nhật ký mùa vụ minh bạch, truy xuất nguồn gốc QR và
              thanh niên tình nguyện đồng hành cùng nhà vườn địa phương.
            </p>
          </div>

          {FOOTER_GROUPS.map((group, idx) => (
            <div
              key={group.title}
              className={idx === 2 ? "lg:col-span-2" : "lg:col-span-3"}
            >
              {/* Mobile collapsible accordion */}
              <details className="group rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 px-3.5 py-2.5 sm:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#25352B]">
                  <span>{group.title}</span>
                  <ChevronDown
                    className="h-4 w-4 text-[#52645A] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="mt-2.5 space-y-2 border-t border-[#D6DED2] pt-2.5 text-sm text-[#52645A]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block py-0.5 hover:text-[#245B3D]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Desktop & Tablet list */}
              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-[#25352B]">{group.title}</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-[#245B3D]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#D6DED2] pt-5 text-xs text-[#52645A] md:flex-row md:items-center md:justify-between">
          <span>© 2026 NaiFarm · Chợ OCOP Thanh niên Đồng Nai</span>
          <span>
            Không gian trải nghiệm — không phát sinh thanh toán thật, giao hàng thật hoặc cấp chứng nhận pháp lý
          </span>
        </div>
      </div>
    </footer>
  );
}
