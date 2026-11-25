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
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { STITCH_SCREEN_COVERAGE } from "@/data/demo/stitch-registry";
import { notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

const QUICK_FLOWS = [
  {
    code: "Journey A",
    title: "Chợ nông sản → Nhà vườn Ba Tư → Chi tiết sản phẩm → Quét QR & Giải phẫu 2D",
    enTitle: "OCOP Market → Ba Tu Orchard → Product Detail → QR Scan & 2D Anatomy",
    desc: "Khám phá gian hàng theo mùa, phân biệt hồ sơ tự khai với đối chiếu, sinh mã QR thật và xem sơ đồ 2D sản phẩm.",
    enDesc: "Browse seasonal produce, inspect QR lot passports, and interact with 2D produce cross-section diagrams.",
    links: [
      { label: "Trang chủ (/)", enLabel: "Home (/)", href: "/" },
      { label: "Vườn Ba Tư", enLabel: "Ba Tu Orchard", href: "/farms/nha-vuon-ba-tu-long-khanh" },
      { label: "Bưởi Tân Triều + 2D", enLabel: "Tan Trieu Pomelo + 2D", href: "/products/buoi-da-xanh-tan-trieu" },
      { label: "Quét mã QR (/trace/scan)", enLabel: "QR Scanner (/trace/scan)", href: "/trace/scan" },
      { label: "Hộ chiếu NF-DEMO-001", enLabel: "Passport NF-DEMO-001", href: "/trace/NF-DEMO-001" },
    ],
  },
  {
    code: "Journey B",
    title: "Giỏ hàng → Đặt hàng → Nhà vườn xử lý đơn & Nhật ký mùa vụ",
    enTitle: "Cart → Checkout → Farmer Order Handling & Harvest Diary",
    desc: "Thêm giỏ hàng nhiều nhà vườn, đặt hàng tại /checkout, cập nhật trạng thái đơn và ghi nhật ký mùa vụ tại /farmer.",
    enDesc: "Multi-farm checkout, farmer fulfillment status updates, and harvest logs synced directly to QR passports.",
    links: [
      { label: "Truy cập nhanh 6 hồ sơ (/sign-in)", enLabel: "Quick Profile Switch (/sign-in)", href: "/sign-in" },
      { label: "Giỏ hàng (/cart)", enLabel: "Cart (/cart)", href: "/cart" },
      { label: "Đặt hàng (/checkout)", enLabel: "Checkout (/checkout)", href: "/checkout" },
      { label: "Nhà nông & HTX (/farmer)", enLabel: "Farmer Portal (/farmer)", href: "/farmer" },
    ],
  },
  {
    code: "Journey C",
    title: "Nhà nông đăng bán nhanh 3 bước & Creative Studio",
    enTitle: "Farmer 3-Step Quick Listing & Creative Studio",
    desc: "Nút thao tác cỡ lớn dễ đọc cho nhà vườn, gợi ý nội dung song ngữ và tạo video giới thiệu OCOP.",
    enDesc: "Accessible large controls for orchard owners with draft voice/caption support and OCOP studio cards.",
    links: [
      { label: "Đăng bán nhanh 3 bước (/farmer/publish)", enLabel: "3-Step Listing (/farmer/publish)", href: "/farmer/publish" },
      { label: "Chợ OCOP (/marketplace)", enLabel: "OCOP Market (/marketplace)", href: "/marketplace" },
    ],
  },
  {
    code: "Journey D",
    title: "Tình nguyện số 2 lớp xác nhận: Thanh niên nộp → Nhà vườn xác nhận → Điều phối duyệt giờ",
    enTitle: "2-Tier Volunteer Verification: Youth Submit → Farmer Confirm → Coordinator Approve",
    desc: "Bảo đảm tách quyền phê duyệt: điều phối viên chỉ duyệt giờ công sau khi nhà vườn đã xác nhận đầu ra thực tế.",
    enDesc: "Maker-checker separation: coordinators approve hours only after orchard hosts confirm actual delivery.",
    links: [
      { label: "Thanh niên tình nguyện (/volunteer)", enLabel: "Youth Volunteer (/volunteer)", href: "/volunteer" },
      { label: "Nhà vườn xác nhận (/farmer)", enLabel: "Farmer Confirm (/farmer)", href: "/farmer" },
      { label: "Điều phối cộng đồng (/coordinator)", enLabel: "Coordinator (/coordinator)", href: "/coordinator" },
    ],
  },
  {
    code: "Journey E–G",
    title: "Bản đồ Đồng Nai & GPS, Chất lượng 26 chuẩn, OCOP Live & Học tập 2D",
    enTitle: "Dong Nai GIS Map & GPS, 26 Quality Standards, Live & 2D Academy",
    desc: "Định vị nhà vườn trong 95 phường/xã Đồng Nai, tra cứu 26 chuẩn chất lượng, phòng livestream và bài học 2D.",
    enDesc: "Local GeoJSON Dong Nai vector map across 95 wards & communes, quality standards, live replays, and sequential learning.",
    links: [
      { label: "Bản đồ nhà vườn (/explore)", enLabel: "Orchard Map (/explore)", href: "/explore" },
      { label: "Trung tâm chất lượng (/quality)", enLabel: "Quality Hub (/quality)", href: "/quality" },
      { label: "Tìm kiếm (/search)", enLabel: "Global Search (/search)", href: "/search?q=Phuoc+Son" },
      { label: "Phòng OCOP Live (/live)", enLabel: "OCOP Live (/live)", href: "/live" },
      { label: "Học tập 2D (/learn)", enLabel: "2D Learning (/learn)", href: "/learn" },
    ],
  },
  {
    code: "Journey H",
    title: "Tổ chức & Đối tác, Quản trị Phân quyền & CMS",
    enTitle: "Partner Organizations, Platform Governance & Local CMS",
    desc: "Khung điều hành thống nhất cho HTX, Doanh nghiệp mua, Trường học (/organization) và Quản trị (/admin).",
    enDesc: "Unified operations across Cooperatives, B2B buyers, Schools (/organization), and Governance/CMS (/admin).",
    links: [
      { label: "Tổ chức & Đối tác (/organization)", enLabel: "Organizations (/organization)", href: "/organization" },
      { label: "Quản trị & CMS (/admin)", enLabel: "Governance & CMS (/admin)", href: "/admin" },
      { label: "Chính sách & Minh bạch (/policies)", enLabel: "Policies (/policies)", href: "/policies" },
    ],
  },
];

export default function QuickAccessHubPage() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { resetDemoState, orders, products, missions } = useDemoStore();

  const handleReset = () => {
    resetDemoState();
    notifySuccess(t.toasts.resetDone);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
      <div className="rounded-[20px] border border-[#D6DED2] bg-gradient-to-br from-white to-[#EAF0E5] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{t.home.heroBadge}</Badge>
              <Badge tone="info">{t.brand.experienceSpaceBadge}</Badge>
            </div>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-[#25352B] sm:text-4xl">
              {isEn ? "Quick Access to NaiFarm Journeys" : "Truy cập nhanh các luồng nghiệp vụ NaiFarm"}
            </h1>
            <p className="text-sm text-[#52645A] sm:text-base">
              {isEn
                ? "Direct navigation across OCOP marketplace, QR traceability, cooperative governance, and community portals running in browser memory."
                : "Lối tắt điều hướng tới toàn bộ các phân hệ thương mại, truy xuất nguồn gốc, quản trị HTX và cộng đồng trên bộ nhớ trình duyệt."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button variant="gold" size="lg" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              <span>{t.nav.resetExperience}</span>
            </Button>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#245B3D]">
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {products.length} {isEn ? "listings" : "sản phẩm"}
              </span>
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {orders.length} {isEn ? "orders" : "đơn hàng"}
              </span>
              <span className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 tabular-nums">
                {missions.length} {isEn ? "missions" : "nhiệm vụ TNV"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DemoBanner
        title={isEn ? "Experience Workspace Notice" : "Lưu ý không gian trải nghiệm"}
        detail={t.brand.experienceSpaceNotice}
      />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[#25352B]">
            {isEn ? "Role & Journey Shortcuts" : "Lộ trình kiểm tra nhanh theo vai trò"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {QUICK_FLOWS.map((flow) => (
            <Card key={flow.code} className="flex flex-col justify-between space-y-4 p-5">
              <div className="space-y-2">
                <Badge tone="neutral">{flow.code}</Badge>
                <h3 className="text-lg font-bold text-[#25352B]">{isEn ? flow.enTitle : flow.title}</h3>
                <p className="text-sm text-[#52645A]">{isEn ? flow.enDesc : flow.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#EAF0E5] pt-2">
                {flow.links.map((link) => (
                  <Link
                    key={link.href}
                    href={buildLocalizedHref(link.href, locale)}
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#245B3D]/35 bg-[#F5F3E9] px-3 py-1.5 text-xs font-semibold text-[#245B3D] transition hover:bg-[#245B3D] hover:text-white"
                  >
                    <span>{isEn ? link.enLabel : link.label}</span>
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
              {isEn ? "Screen Coverage & Route Directory" : "Bản đồ màn hình & đường dẫn hệ thống"}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#24603B]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {isEn ? "All listed routes active locally" : "Toàn bộ tuyến màn hình đều kết nối trực tiếp"}
          </span>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EAF0E5] text-xs font-semibold text-[#245B3D]">
                <tr>
                  <th className="px-4 py-3">{isEn ? "Code" : "Mã"}</th>
                  <th className="px-4 py-3">{isEn ? "Module" : "Phân hệ"}</th>
                  <th className="px-4 py-3">{isEn ? "Screen Name" : "Tên màn hình"}</th>
                  <th className="px-4 py-3">{isEn ? "Portal" : "Không gian"}</th>
                  <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                  <th className="px-4 py-3">{isEn ? "Route" : "Đường dẫn"}</th>
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
                        {isEn ? "Ready" : "Sẵn sàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={buildLocalizedHref(row.route, locale)}
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
