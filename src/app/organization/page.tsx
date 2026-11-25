"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  ClipboardList,
  GraduationCap,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";

type OrgViewMode = "coop" | "b2b" | "school";

export default function OrganizationWorkspacePage() {
  const { hydrated, farms, products, batches, rfqRequests, submitRfq, setActiveWorkspace } =
    useDemoStore();
  const [mode, setMode] = useState<OrgViewMode>("coop");
  const [rfqCompany, setRfqCompany] = useState("");
  const [rfqNote, setRfqNote] = useState(
    "Quan tâm đặt sỉ Bưởi da xanh Tân Triều và Hạt điều vỏ lụa theo tháng."
  );

  useEffect(() => {
    setActiveWorkspace("W05");
  }, [setActiveWorkspace]);

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqCompany.trim() || !rfqNote.trim()) {
      toast.error("Vui lòng nhập tên đơn vị và nhu cầu sản phẩm.");
      return;
    }
    try {
      const created = await submitRfq({
        company: rfqCompany.trim(),
        note: rfqNote.trim(),
      });
      toast.success(`Đã gửi yêu cầu báo giá ${created.id} tới HTX.`);
      setRfqCompany("");
      setRfqNote("");
    } catch {
      toast.error("Không gửi được yêu cầu báo giá. Vui lòng đăng nhập bằng tài khoản tổ chức.");
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-muted">
        Đang mở Không gian Tổ chức Đối tác...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W05"
      title="Không gian Tổ chức & Đối tác"
      subtitle="Một shell thống nhất cho Hợp tác xã xã viên (Active MVP), Doanh nghiệp B2B (Roadmap) và Nhà trường (Roadmap)"
      scopeBadge={
        mode === "coop"
          ? "HTX Nông nghiệp Tân Triều (Active MVP)"
          : "Chế độ Minh họa Lộ trình (Roadmap)"
      }
      navItems={[
        {
          label: "HTX Nông nghiệp & Gom lô",
          href: "#coop",
          active: mode === "coop",
          onClick: () => setMode("coop"),
          icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Doanh nghiệp B2B (Roadmap)",
          href: "#b2b",
          active: mode === "b2b",
          onClick: () => setMode("b2b"),
          icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Nhà trường — Lớp học Vườn",
          href: "#school",
          active: mode === "school",
          onClick: () => setMode("school"),
          icon: <GraduationCap className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Org Role Selector */}
        <Card className="p-4">
          <p className="mb-2 text-xs font-semibold text-muted">
            Chọn loại hình tổ chức trong W05 (Hạn chế phân mảnh shell):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("coop")}
              className={`min-h-[44px] rounded-[12px] px-4 text-sm font-semibold transition cursor-pointer ${
                mode === "coop"
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-foreground hover:bg-surface-soft"
              }`}
            >
              HTX Nông nghiệp (Active MVP)
            </button>
            <button
              type="button"
              onClick={() => setMode("b2b")}
              className={`min-h-[44px] rounded-[12px] px-4 text-sm font-semibold transition cursor-pointer ${
                mode === "b2b"
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-foreground hover:bg-surface-soft"
              }`}
            >
              Doanh nghiệp B2B · RFQ (Roadmap)
            </button>
            <button
              type="button"
              onClick={() => setMode("school")}
              className={`min-h-[44px] rounded-[12px] px-4 text-sm font-semibold transition cursor-pointer ${
                mode === "school"
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-foreground hover:bg-surface-soft"
              }`}
            >
              Nhà trường · Farm as a Classroom (Roadmap)
            </button>
          </div>
        </Card>

        {/* MODE 1: COOPERATIVE ACTIVE MVP (S37-S40) */}
        {mode === "coop" ? (
          <div id="coop" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs font-semibold text-muted">Nhà vườn thành viên kết nối</p>
                <p className="mt-1 tabular-nums text-2xl font-bold text-primary">{farms.length} vườn</p>
                <p className="text-xs text-muted">Tân Triều, Long Khánh, Xuân Lộc, Cẩm Mỹ</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-muted">Mã lô truy xuất đang theo dõi</p>
                <p className="mt-1 tabular-nums text-2xl font-bold text-primary">
                  {batches.length} mã lô QR
                </p>
                <p className="text-xs text-muted">Chuẩn tách biệt tự khai & đối chiếu</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-muted">Mặt hàng sẵn sàng gom đơn</p>
                <p className="mt-1 tabular-nums text-2xl font-bold text-primary">
                  {products.length} sản phẩm
                </p>
                <p className="text-xs text-muted">Đồng bộ tồn kho từ W02</p>
              </Card>
            </div>

            <Card className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Danh sách Nhà vườn & Lô hàng HTX quản lý (S37–S40)
                </h2>
                <Badge tone="success">HTX đối chiếu minh họa</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {farms.map((farm) => {
                  const fBatches = batches.filter((b) => b.farmId === farm.id);
                  return (
                    <div
                      key={farm.id}
                      className="rounded-[14px] border border-border bg-background p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-foreground">{farm.name}</h3>
                          <p className="inline-flex items-center gap-1 text-xs text-muted">
                            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            {farm.addressLabel} · {farm.areaHa} ha
                          </p>
                        </div>
                        <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                          {farm.ocopLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        Cây trồng chính: {farm.mainCrops.join(", ")}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {fBatches.map((b) => (
                          <Link
                            key={b.batchCode}
                            href={`/trace/${b.batchCode}`}
                            className="inline-flex items-center gap-1 rounded-full border border-primary bg-white px-3 py-1 text-xs font-semibold text-primary"
                          >
                            <QrCode className="h-3 w-3" aria-hidden="true" />
                            {b.batchCode}
                          </Link>
                        ))}
                        <Link
                          href={`/farms/${farm.slug}`}
                          className="text-xs font-bold text-primary underline ml-auto"
                        >
                          Xem hồ sơ vườn
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : null}

        {/* MODE 2: B2B RFQ ROADMAP PREVIEW (S48) */}
        {mode === "b2b" ? (
          <div id="b2b" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Kết nối Thu mua Doanh nghiệp B2B (Roadmap S48)
                </h2>
                <Badge tone="warning">Phiên bản Lộ trình</Badge>
              </div>
              <DemoBanner
                title="Yêu cầu báo giá B2B"
                detail="Doanh nghiệp bếp ăn / siêu thị gửi nhu cầu thu mua định kỳ theo lô QR từ HTX. Yêu cầu được lưu trên Supabase và hiển thị cho tài khoản tổ chức."
              />

              <div className="space-y-3">
                {rfqRequests.length === 0 ? (
                  <p className="rounded-[12px] border border-dashed border-border bg-background p-4 text-sm text-muted">
                    Chưa có yêu cầu báo giá nào.
                  </p>
                ) : (
                  rfqRequests.map((rfq) => (
                    <div
                      key={rfq.id}
                      className="rounded-[12px] border border-border bg-background p-4 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="tabular-nums text-xs font-bold text-primary">
                          {rfq.id}
                        </span>
                        <span className="text-xs font-semibold text-muted">
                          {rfq.createdAtLabel}
                        </span>
                      </div>
                      <p className="font-bold text-foreground">{rfq.company}</p>
                      <p className="text-sm text-primary">{rfq.note}</p>
                      <p className="text-xs font-semibold text-warning">{rfq.status}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Gửi đề nghị báo giá (RFQ)</h3>
              <form onSubmit={handleSubmitRfq} className="space-y-3">
                <div>
                  <label htmlFor="rfq-company" className="mb-1 block text-xs font-semibold">
                    Tên đơn vị thu mua
                  </label>
                  <input
                    id="rfq-company"
                    value={rfqCompany}
                    onChange={(e) => setRfqCompany(e.target.value)}
                    className="min-h-[44px] w-full rounded-[10px] border border-border bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="rfq-note" className="mb-1 block text-xs font-semibold">
                    Nhu cầu sản phẩm & tần suất giao
                  </label>
                  <textarea
                    id="rfq-note"
                    rows={3}
                    value={rfqNote}
                    onChange={(e) => setRfqNote(e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-white p-3 text-sm"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  <Package className="h-4 w-4" aria-hidden="true" />
                  <span>Gửi yêu cầu RFQ</span>
                </Button>
              </form>

              <div className="rounded-[12px] bg-surface-soft p-3 text-xs text-primary">
                Tham khảo giá bán lẻ niêm yết hiện tại từ các vườn:{" "}
                {products
                  .slice(0, 3)
                  .map((p) => `${p.name} (${formatVnd(p.priceVnd)})`)
                  .join(" · ")}
                .
              </div>
            </Card>
          </div>
        ) : null}

        {/* MODE 3: SCHOOL CLASSROOM ROADMAP PREVIEW (S49) */}
        {mode === "school" ? (
          <div id="school" className="space-y-5">
            <DemoBanner
              title="Mô hình Farm as a Classroom — Học tập gắn với nhà vườn Đồng Nai (Roadmap S49)"
              detail="Kết hợp trực tiếp bài học mở ở /learn với các chuyến tham quan an toàn tại Cù lao Tân Triều và Long Khánh."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground">
                    Chuyên đề 1: Nhật ký Bưởi Tân Triều & Chuyển đổi số
                  </h3>
                </div>
                <p className="text-sm text-muted">
                  Học sinh quan sát quy trình chăm sóc bưởi, tự quét mã QR {batches[1]?.batchCode ?? "NF-TT-2026-01"} và
                  nghe câu chuyện nghề nông từ Chú Ba Minh cùng đội Thanh niên tình nguyện.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href="/learn"
                    className="inline-flex min-h-[42px] items-center rounded-[10px] bg-primary px-4 text-xs font-bold text-white"
                  >
                    Mở Học liệu & 3D Bưởi
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex min-h-[42px] items-center rounded-[10px] border border-primary bg-white px-4 text-xs font-bold text-primary"
                  >
                    Đặt lịch tham quan vườn
                  </Link>
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Truck className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground">
                    Cam kết an toàn trải nghiệm học đường
                  </h3>
                </div>
                <ul className="space-y-1.5 text-sm text-muted list-disc pl-5">
                  <li>Nhóm tối đa 20–25 học sinh mỗi buổi kèm giáo viên và tình nguyện viên.</li>
                  <li>Không sử dụng nông cụ sắc nhọn khi chưa có người hướng dẫn trực tiếp.</li>
                  <li>Các em có thể thực hành ngay bài trắc nghiệm ở Góc học mở sau chuyến đi.</li>
                </ul>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
