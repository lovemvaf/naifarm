"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  Layers,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { STITCH_SCREEN_COVERAGE } from "@/data/demo/stitch-registry";
import { notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

const QUICK_FLOWS = [
  {
    code: "Hành trình A",
    title: "Chợ nông sản → Nhà vườn Ba Tư → Chi tiết sản phẩm → Quét QR & Giải phẫu 2D",
    desc: "Khám phá gian hàng theo mùa, phân biệt hồ sơ tự khai với đối chiếu, sinh mã QR thật, kiểm tra hợp lệ khi quét và xem sơ đồ 2D sản phẩm.",
    links: [
      { label: "Trang chủ (/)", href: "/" },
      { label: "Vườn Ba Tư", href: "/farms/nha-vuon-ba-tu-long-khanh" },
      { label: "Bưởi Tân Triều + 2D", href: "/products/buoi-da-xanh-tan-trieu" },
      { label: "Quét mã QR (/trace/scan)", href: "/trace/scan" },
      { label: "Hộ chiếu NF-DEMO-001", href: "/trace/NF-DEMO-001" },
    ],
  },
  {
    code: "Hành trình B",
    title: "Giỏ hàng → Đặt hàng → Nhà vườn xử lý đơn & Nhật ký mùa vụ",
    desc: "Thêm giỏ hàng nhiều nhà vườn, đặt hàng tại /checkout, cập nhật trạng thái đơn và ghi nhật ký mùa vụ tại /farmer đồng bộ ngay sang tem QR.",
    links: [
      { label: "Truy cập nhanh 6 tài khoản (/sign-in)", href: "/sign-in" },
      { label: "Giỏ hàng (/cart)", href: "/cart" },
      { label: "Đặt hàng (/checkout)", href: "/checkout" },
      { label: "Nhà nông & HTX (/farmer)", href: "/farmer" },
    ],
  },
  {
    code: "Hành trình C",
    title: "Nhà nông đăng bán nhanh 3 bước bằng ảnh & giọng nói",
    desc: "Nút thao tác cỡ lớn dễ đọc cho nhà vườn, gợi ý nội dung soạn sẵn có thể chỉnh sửa và đăng thẳng lên Chợ OCOP.",
    links: [
      { label: "Đăng bán nhanh 3 bước (/farmer/publish)", href: "/farmer/publish" },
      { label: "Chợ OCOP (/marketplace)", href: "/marketplace" },
    ],
  },
  {
    code: "Hành trình D",
    title: "Tình nguyện số 2 lớp xác nhận: Thanh niên nộp → Nhà vườn xác nhận → Điều phối duyệt giờ",
    desc: "Bảo đảm tách quyền phê duyệt: điều phối viên chỉ duyệt giờ công sau khi nhà vườn đã xác nhận đầu ra thực tế.",
    links: [
      { label: "Thanh niên tình nguyện (/volunteer)", href: "/volunteer" },
      { label: "Nhà vườn xác nhận (/farmer)", href: "/farmer" },
      { label: "Điều phối cộng đồng (/coordinator)", href: "/coordinator" },
    ],
  },
  {
    code: "Hành trình E–G",
    title: "Bản đồ nhà vườn & GPS, Trung tâm Chất lượng 26 loại, Livestream & Học tập 2D",
    desc: "Định vị các nhà vườn trên bản đồ, lọc 95 phường/xã Đồng Nai, tra cứu 26 loại tiêu chuẩn chất lượng, phòng phát lại và 12 bài học 2D.",
    links: [
      { label: "Bản đồ nhà vườn (/explore)", href: "/explore" },
      { label: "Trung tâm chất lượng 26 loại (/quality)", href: "/quality" },
      { label: "Tìm kiếm toàn trang (/search)", href: "/search?q=Phuoc+Son" },
      { label: "Phòng OCOP Live (/live)", href: "/live" },
      { label: "Học tập 2D (/learn)", href: "/learn" },
    ],
  },
  {
    code: "Hành trình H",
    title: "Tổ chức & Đối tác (6 loại hình) & Quản trị hệ thống phân quyền",
    desc: "Một khung điều hành thống nhất cho HTX, Doanh nghiệp mua, Trường học, Tài trợ, Logistics, Chuyên gia (/organization) và Quản trị (/admin).",
    links: [
      { label: "Tổ chức & Đối tác (/organization)", href: "/organization" },
      { label: "Quản trị & Kiểm toán (/admin)", href: "/admin" },
      { label: "Chính sách & Minh bạch (/policies)", href: "/policies" },
    ],
  },
];

export default function QuickAccessHubPage() {
  const { resetDemoState, orders, products, missions } = useDemoStore();

  const handleReset = () => {
    resetDemoState();
    notifySuccess("Đã khôi phục toàn bộ dữ liệu trải nghiệm về mặc định.");
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
      <div className="rounded-[20px] border border-[#D6DED2] bg-gradient-to-br from-white to-[#EAF0E5] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Chợ OCOP Thanh niên · Đồng Nai</Badge>
              <Badge tone="info">Không gian trải nghiệm · Không lập chỉ mục tìm kiếm</Badge>
            </div>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-[#25352B] sm:text-4xl">
              Truy cập nhanh các luồng nghiệp vụ NaiFarm
            </h1>
            <p className="text-sm text-[#52645A] sm:text-base">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị. Lối tắt điều hướng tới toàn bộ các
              phân hệ thương mại, truy xuất nguồn gốc, quản trị HTX và cộng đồng trên bộ nhớ trình duyệt.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button variant="gold" size="lg" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              <span>Khôi phục dữ liệu trải nghiệm</span>
            </Button>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#245B3D]">
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {products.length} sản phẩm thực hành
              </span>
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {orders.length} đơn hàng
              </span>
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {missions.length} nhiệm vụ TNV
              </span>
            </div>
          </div>
        </div>
      </div>

      <DemoBanner
        title="Lưu ý không gian trải nghiệm"
        detail="Các thao tác đặt hàng, thanh toán, nhật ký hay cấp quyền tại đây chỉ chạy cục bộ để trình diễn quy trình — không phát sinh giao dịch tài chính thật hoặc chứng nhận pháp lý."
      />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[#25352B]">
            Lộ trình kiểm tra nhanh theo vai trò
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {QUICK_FLOWS.map((flow) => (
            <Card key={flow.code} className="flex flex-col justify-between space-y-4 p-5">
              <div className="space-y-2">
                <Badge tone="neutral">{flow.code}</Badge>
                <h3 className="text-lg font-bold text-[#25352B]">{flow.title}</h3>
                <p className="text-sm text-[#52645A]">{flow.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#EAF0E5] pt-2">
                {flow.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#245B3D]/35 bg-[#F5F3E9] px-3 py-1.5 text-xs font-semibold text-[#245B3D] transition hover:bg-[#245B3D] hover:text-white"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-[#25352B]">
              Bản đồ màn hình &amp; đường dẫn hệ thống
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#24603B]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Toàn bộ tuyến màn hình đều kết nối trực tiếp
          </span>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EAF0E5] text-xs font-semibold text-[#245B3D]">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Phân hệ</th>
                  <th className="px-4 py-3">Tên màn hình</th>
                  <th className="px-4 py-3">Không gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Đường dẫn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0E5]">
                {STITCH_SCREEN_COVERAGE.map((row) => (
                  <tr key={row.stitchId} className="hover:bg-[#F5F3E9]/60">
                    <td className="px-4 py-3 font-bold text-[#245B3D] tabular-nums">
                      {row.stitchId}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#52645A]">
                      {row.blueprintIds}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#25352B]">{row.title}</p>
                      <p className="text-xs text-[#52645A]">{row.note}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{row.workspace}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#24603B]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Sẵn sàng
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={row.route}
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#245B3D] underline"
                      >
                        {row.route}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
