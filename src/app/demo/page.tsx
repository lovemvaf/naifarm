"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
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
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

const DEMO_FLOWS = [
  {
    code: "Flow A",
    title: "Khám phá Chợ → Nhà vườn Ba Tư / Chú Ba Minh → Sản phẩm → Quét QR & 3D",
    desc: "Kiểm chứng bố cục 60/40, tách biệt tự khai vs đối chiếu, QR SVG thật trên lô NF-DEMO-001 và mô hình 3D Bưởi Tân Triều.",
    links: [
      { label: "Trang chủ (/)", href: "/" },
      { label: "Vườn Ba Tư", href: "/farms/nha-vuon-ba-tu-long-khanh" },
      { label: "Bưởi Tân Triều + 3D", href: "/products/buoi-da-xanh-tan-trieu" },
      { label: "Truy xuất NF-DEMO-001", href: "/trace/NF-DEMO-001" },
    ],
  },
  {
    code: "Flow B",
    title: "Giỏ hàng → Thanh toán COD Demo ↔ Nhà vườn Xử lý đơn (W01 ↔ W02)",
    desc: "Thêm sản phẩm vào giỏ, đặt hàng tại /checkout, chuyển trạng thái ở /farmer và thấy đồng bộ ngay tại /account/orders.",
    links: [
      { label: "Giỏ hàng (/cart)", href: "/cart" },
      { label: "Thanh toán (/checkout)", href: "/checkout" },
      { label: "Đơn của Khách (/account/orders)", href: "/account/orders" },
      { label: "Xử lý đơn W02 (/farmer)", href: "/farmer" },
    ],
  },
  {
    code: "Flow C",
    title: "Nhà nông U50+ Đăng bán 3 bước bằng ảnh & giọng nói mô phỏng",
    desc: "Nút 56px dễ bấm, chế độ lỗi mic dự phòng, AI gợi ý bản nháp có cảnh báo minh họa, đăng bán lên ngay Chợ /marketplace.",
    links: [
      { label: "Mở Wizard 3 bước (/farmer/publish)", href: "/farmer/publish" },
      { label: "Xem trên Chợ (/marketplace)", href: "/marketplace" },
    ],
  },
  {
    code: "Flow D",
    title: "Chuỗi 2 lớp Thanh niên Tình nguyện: TNV Nộp → W02 Xác nhận → W04 Duyệt giờ",
    desc: "Bảo đảm tính liêm chính giờ công: W04 bị khóa duyệt cho tới khi chủ vườn xác nhận đã nhận bàn giao tại W02.",
    links: [
      { label: "Bảng nhiệm vụ W03 (/volunteer)", href: "/volunteer" },
      { label: "Chủ vườn xác nhận W02 (/farmer)", href: "/farmer" },
      { label: "Điều phối duyệt giờ W04 (/coordinator)", href: "/coordinator" },
    ],
  },
  {
    code: "Flow E–G",
    title: "Bản đồ số Đồng Nai, Livestream Replay & Góc học mở 3D",
    desc: "Split map + đặt lịch trải nghiệm (/explore), phòng replay ghim giỏ (/live), bài học hạt điều + Quiz + 3D (/learn).",
    links: [
      { label: "Bản đồ & Du lịch (/explore)", href: "/explore" },
      { label: "Livestream OCOP (/live)", href: "/live" },
      { label: "Góc học mở (/learn)", href: "/learn" },
    ],
  },
  {
    code: "Flow H",
    title: "Tổ chức HTX / Roadmap (W05) & Quản trị Phân quyền Kiểm toán (W06)",
    desc: "Một shell thống nhất cho HTX/B2B/Trường học (/organization) và cấp/thu hồi quyền ghi Audit Log (/admin).",
    links: [
      { label: "Hợp tác xã & Đối tác W05 (/organization)", href: "/organization" },
      { label: "Quản trị RBAC Demo W06 (/admin)", href: "/admin" },
    ],
  },
];

export default function JudgeDemoHubPage() {
  const { resetDemoState, orders, products, missions } = useDemoStore();

  const handleReset = () => {
    resetDemoState();
    toast.success("Đã khôi phục toàn bộ dữ liệu mẫu NaiFarm về trạng thái ban đầu!");
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-8 space-y-8">
      <div className="rounded-[20px] border border-[#D6DED2] bg-gradient-to-br from-white to-[#EAF0E5] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Hackathon TP. Đồng Nai 2026 · Group 8</Badge>
              <Badge tone="info">Frontend-Only High-Fidelity Prototype</Badge>
            </div>
            <h1 className="font-[family-name:var(--font-lora)] text-3xl font-bold text-[#25352B] sm:text-4xl">
              Trung tâm Trình diễn & Kiểm chứng (Judge Demo Hub)
            </h1>
            <p className="text-sm text-[#52645A] sm:text-base">
              Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị. Toàn bộ 12 màn hình trích xuất từ
              Google Stitch (<span className="font-mono font-semibold">12256474506032242478</span>)
              và 6 không gian W01–W06 vận hành đồng bộ trên bộ nhớ trình duyệt.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button variant="gold" size="lg" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              <span>Khôi phục Dữ liệu Mẫu (Reset Demo)</span>
            </Button>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#245B3D]">
              <span className="rounded-full bg-white px-3 py-1 border border-[#D6DED2] tabular-nums">
                {products.length} sản phẩm
              </span>
              <span className="rounded-full bg-white px-3 py-1 border border-[#D6DED2] tabular-nums">
                {orders.length} đơn demo
              </span>
              <span className="rounded-full bg-white px-3 py-1 border border-[#D6DED2] tabular-nums">
                {missions.length} nhiệm vụ TNV
              </span>
            </div>
          </div>
        </div>
      </div>

      <DemoBanner
        title="Cam kết Trung thực Dữ liệu & Phạm vi Frontend"
        detail="Prototype không sử dụng cơ sở dữ liệu, API backend, thanh toán hay AI key runtime. Dữ liệu gắn nhãn minh bạch giữa 'Nhà vườn tự khai' và 'Hồ sơ đã đối chiếu (Demo)' — không giả mạo chứng nhận OCOP pháp lý."
      />

      {/* Interactive Demo Flows */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[#25352B]">
            8 Luồng Trình diễn Liên hoàn cho Ban Giám khảo
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DEMO_FLOWS.map((flow) => (
            <Card key={flow.code} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <Badge tone="neutral">{flow.code}</Badge>
                <h3 className="text-lg font-bold text-[#25352B]">{flow.title}</h3>
                <p className="text-sm text-[#52645A]">{flow.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAF0E5]">
                {flow.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#245B3D]/35 bg-[#F5F3E9] px-3 py-1.5 text-xs font-semibold text-[#245B3D] hover:bg-[#245B3D] hover:text-white transition"
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

      {/* Stitch Export Coverage Table */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-[#25352B]">
              Đối chiếu 12 Màn hình Stitch Gốc & Blueprint V3
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#24603B]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            12/12 export cục bộ + 4 màn hình tái dựng Blueprint đều đã ánh xạ route thật
          </span>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EAF0E5] text-xs font-semibold text-[#245B3D]">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Blueprint IDs</th>
                  <th className="px-4 py-3">Tên màn hình</th>
                  <th className="px-4 py-3">Không gian</th>
                  <th className="px-4 py-3">Nguồn chuẩn</th>
                  <th className="px-4 py-3">Đường dẫn kiểm thử</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0E5]">
                {STITCH_SCREEN_COVERAGE.map((row) => (
                  <tr key={row.stitchId} className="hover:bg-[#F5F3E9]/60">
                    <td className="px-4 py-3 font-bold text-[#245B3D] tabular-nums">
                      {row.stitchId}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#52645A]">
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
                        {row.kind === "verified-stitch" ? "Stitch PNG + HTML" : "Blueprint V3"}
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
