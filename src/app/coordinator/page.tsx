"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  Lock,
  Truck,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

type CoordinatorTab = "dispatch" | "documents" | "hours" | "analytics";

const COLD_CHAIN_TRIPS = [
  {
    id: "TRIP-DN-01",
    route: "Phường Long Khánh → Điểm gom TP. Đồng Nai",
    farmSummary: "Nhà vườn Ba Tư · Chôm chôm Java & Sầu riêng Ri6",
    departure: "24/11/2026 · 15:30",
    tempTarget: "10°C – 12°C (Xe mát minh họa)",
    status: "Đang mở nhận ghép sọt",
  },
  {
    id: "TRIP-DN-02",
    route: "Cù lao Tân Triều → Chợ đầu mối & TP.HCM",
    farmSummary: "Vườn Bưởi Chú Ba Minh & HTX Tân Triều",
    departure: "25/11/2026 · 05:30",
    tempTarget: "14°C – 16°C (Thùng thoáng rơm khô)",
    status: "Đã chốt lịch (Demo)",
  },
];

const emptySubscribe = () => () => {};

export default function CoordinatorWorkspacePage() {
  const {
    hydrated,
    missions,
    supportRequests,
    docCases,
    orders,
    products,
    setActiveWorkspace,
    approveMissionHoursByCoordinator,
    requestMissionRevision,
    reviewDocumentCase,
  } = useDemoStore();

  const [tab, setTab] = useState<CoordinatorTab>("hours");
  const [unitScope, setUnitScope] = useState("Phường Long Khánh (Giới hạn đơn vị)");
  const [revisionOpenId, setRevisionOpenId] = useState<string | null>(null);
  const [revisionReason, setRevisionReason] = useState(
    "Vui lòng chụp rõ tem QR sau khi dán lên sọt và bổ sung ghi chú thời gian thực hiện."
  );
  const [docNotes, setDocNotes] = useState<Record<string, string>>({});
  const chartMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    setActiveWorkspace("W04");
  }, [setActiveWorkspace]);

  const handleApproveHours = (missionId: string) => {
    const res = approveMissionHoursByCoordinator(missionId);
    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleRequestRevision = (missionId: string) => {
    if (!revisionReason.trim()) {
      toast.error("Vui lòng nhập lý do cần bổ sung minh chứng.");
      return;
    }
    requestMissionRevision(missionId, revisionReason.trim());
    setRevisionOpenId(null);
    toast.success(`Đã gửi yêu cầu bổ sung cho nhiệm vụ ${missionId}.`);
  };

  const analyticsData = [
    {
      name: "Đơn hàng Demo",
      soLuong: orders.length,
    },
    {
      name: "Sản phẩm mở bán",
      soLuong: products.length,
    },
    {
      name: "Nhiệm vụ TNV",
      soLuong: missions.length,
    },
    {
      name: "Yêu cầu Nhà vườn",
      soLuong: supportRequests.length,
    },
    {
      name: "Hồ sơ đối chiếu",
      soLuong: docCases.filter((d) => d.status === "Hồ sơ đã đối chiếu (Demo)").length,
    },
  ];

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
        Đang tải Không gian Điều phối viên...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W04"
      title="Không gian Điều phối viên Cơ sở"
      subtitle="Phân công hỗ trợ nhà vườn, đối chiếu chứng từ minh họa và duyệt giờ công 2 lớp"
      scopeBadge={unitScope}
      navItems={[
        {
          label: `S24c · Duyệt giờ công 2 lớp (${missions.length})`,
          href: "#hours",
          active: tab === "hours",
          onClick: () => setTab("hours"),
          icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `S24b · Đối chiếu chứng từ (${docCases.length})`,
          href: "#documents",
          active: tab === "documents",
          onClick: () => setTab("documents"),
          icon: <FileCheck2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `S24a · Yêu cầu vườn & Xe mát (${supportRequests.length})`,
          href: "#dispatch",
          active: tab === "dispatch",
          onClick: () => setTab("dispatch"),
          icon: <Truck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "S24d · Thống kê Demo trực tiếp",
          href: "#analytics",
          active: tab === "analytics",
          onClick: () => setTab("analytics"),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Unit Scope Switcher */}
        <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#52645A]">Phạm vi phụ trách (Scoped Governance Demo)</p>
            <p className="text-sm font-bold text-[#25352B]">
              Điều phối viên cơ sở chỉ thao tác trong đơn vị được cấp quyền W06
            </p>
          </div>
          <select
            aria-label="Chọn phạm vi đơn vị điều phối"
            value={unitScope}
            onChange={(e) => setUnitScope(e.target.value)}
            className="min-h-[42px] rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm font-semibold text-[#245B3D]"
          >
            <option>Phường Long Khánh (Giới hạn đơn vị)</option>
            <option>Cụm Cù lao Tân Triều — Vĩnh Cửu</option>
            <option>Liên cụm Đồng Nai (Góc nhìn trình diễn)</option>
          </select>
        </Card>

        {/* Tab 1: S24c Dual-Layer Hours Approval */}
        {tab === "hours" ? (
          <section id="hours" className="space-y-4">
            <DemoBanner
              title="Quy tắc kiểm chứng 2 lớp bắt buộc (S24c)"
              detail="Điều phối viên chỉ có thể duyệt cộng giờ vào Youth Impact Pass khi trạng thái nhiệm vụ là 'Chủ vườn W02 đã xác nhận bàn giao'. Nếu còn ở trạng thái 'TNV vừa nộp', hệ thống khóa nút Duyệt."
            />

            {missions.map((m) => {
              const farmAccepted = m.status === "farm_accepted";
              const approved = m.status === "coordinator_approved";
              const submittedOnly = m.status === "submitted";
              return (
                <Card key={m.id} className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums text-xs font-bold text-[#245B3D]">
                          {m.id}
                        </span>
                        <Badge
                          tone={
                            approved
                              ? "success"
                              : farmAccepted
                              ? "info"
                              : submittedOnly
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {approved
                            ? `Đã duyệt +${m.approvedHours} giờ`
                            : farmAccepted
                            ? "Lớp 1 (W02) đã xác nhận · Sẵn sàng duyệt giờ"
                            : submittedOnly
                            ? "Chờ Chủ vườn W02 xác nhận trước"
                            : m.status === "revision_requested"
                            ? "Đã yêu cầu TNV bổ sung"
                            : "Chưa nộp minh chứng"}
                        </Badge>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-[#25352B]">{m.title}</h3>
                      <p className="text-xs text-[#52645A]">
                        TNV: <span className="font-semibold text-[#25352B]">{m.assigneeName ?? "Chưa nhận"}</span>{" "}
                        · Vườn: {m.farmName} · Giờ đề nghị: {m.submittedHours || m.expectedHours} giờ
                      </p>
                    </div>
                  </div>

                  {m.evidenceNote ? (
                    <div className="flex flex-col gap-3 rounded-[12px] bg-[#F5F3E9] p-3.5 sm:flex-row sm:items-center">
                      {m.evidenceImage ? (
                        <img
                          src={m.evidenceImage}
                          alt={`Minh chứng ${m.id}`}
                          className="h-16 w-24 rounded-[8px] object-cover"
                        />
                      ) : null}
                      <p className="text-sm text-[#25352B]">
                        <span className="font-bold">Báo cáo minh chứng: </span>
                        {m.evidenceNote}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    {approved ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#24603B]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Đã ghi nhận {m.approvedHours} giờ vào Youth Impact Pass của {m.assigneeName}
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          disabled={!farmAccepted}
                          onClick={() => handleApproveHours(m.id)}
                        >
                          {farmAccepted ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Lock className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span>
                            {farmAccepted
                              ? `Duyệt cộng ${m.submittedHours || m.expectedHours} giờ`
                              : "Khóa duyệt (Chờ W02 xác nhận bàn giao)"}
                          </span>
                        </Button>

                        {submittedOnly ? (
                          <Link
                            href="/farmer"
                            className="inline-flex min-h-[44px] items-center rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-bold text-[#245B3D] hover:bg-[#EAF0E5]"
                          >
                            Mở W02 (/farmer) để chủ vườn xác nhận →
                          </Link>
                        ) : null}

                        {submittedOnly || farmAccepted ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setRevisionOpenId(m.id)}
                          >
                            Yêu cầu bổ sung minh chứng
                          </Button>
                        ) : null}
                      </>
                    )}
                  </div>

                  {revisionOpenId === m.id ? (
                    <div className="rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-3.5 space-y-2.5">
                      <label htmlFor={`rev-${m.id}`} className="block text-xs font-bold text-[#25352B]">
                        Lý do yêu cầu Thanh niên bổ sung:
                      </label>
                      <input
                        id={`rev-${m.id}`}
                        value={revisionReason}
                        onChange={(e) => setRevisionReason(e.target.value)}
                        className="min-h-[42px] w-full rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRequestRevision(m.id)}
                        >
                          Gửi yêu cầu bổ sung
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRevisionOpenId(null)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </section>
        ) : null}

        {/* Tab 2: S24b Document Comparison */}
        {tab === "documents" ? (
          <section id="documents" className="space-y-4">
            <div
              role="note"
              className="flex items-start gap-3 rounded-[14px] border border-[#D7A34D]/50 bg-[#FFF2D8] p-4 text-sm text-[#25352B]"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#80520C] mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-[#80520C]">
                  Ranh giới pháp lý: Đối chiếu chứng từ (Demo) ≠ Cấp chứng nhận OCOP
                </p>
                <p className="text-xs text-[#80520C]">
                  Điều phối viên chỉ đối chiếu tính đầy đủ của ảnh chụp hồ sơ tự khai trên hệ thống.
                  Thẩm quyền cấp sao OCOP chính thức thuộc Hội đồng đánh giá OCOP có thẩm quyền.
                </p>
              </div>
            </div>

            {docCases.map((c) => (
              <Card key={c.id} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums text-xs font-bold text-[#245B3D]">{c.id}</span>
                      <Badge
                        tone={
                          c.status === "Hồ sơ đã đối chiếu (Demo)"
                            ? "success"
                            : c.status === "Yêu cầu bổ sung"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-[#25352B]">{c.documentTitle}</h3>
                    <p className="text-xs text-[#52645A]">
                      {c.farmName} · Nộp lúc {c.submittedAt}
                    </p>
                  </div>
                </div>

                <p className="rounded-[10px] bg-[#F5F3E9] px-3 py-2 text-xs text-[#52645A]">
                  {c.scopeNote}
                </p>

                {c.reviewerNote ? (
                  <p className="text-xs font-semibold text-[#24603B]">
                    Ghi chú đối chiếu: {c.reviewerNote}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={docNotes[c.id] ?? ""}
                    onChange={(e) => setDocNotes((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Ghi chú đối chiếu minh họa (ví dụ: Đã kiểm tra ảnh bản scan và địa chỉ vườn)..."
                    aria-label={`Ghi chú đối chiếu ${c.id}`}
                    className="min-h-[42px] flex-1 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const note =
                          docNotes[c.id]?.trim() ||
                          "Đã đối chiếu bản scan hồ sơ tự khai (Demo — không thay thế chứng nhận OCOP chính thức).";
                        reviewDocumentCase(c.id, "Hồ sơ đã đối chiếu (Demo)", note);
                        toast.success(`Đã đánh dấu ${c.id} là Hồ sơ đã đối chiếu (Demo).`);
                      }}
                    >
                      Đánh dấu Đã đối chiếu (Demo)
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const note =
                          docNotes[c.id]?.trim() || "Cần bổ sung ảnh mặt sau phiếu thu hoạch.";
                        reviewDocumentCase(c.id, "Yêu cầu bổ sung", note);
                        toast.info(`Đã chuyển ${c.id} sang Yêu cầu bổ sung.`);
                      }}
                    >
                      Yêu cầu bổ sung
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        ) : null}

        {/* Tab 3: S24a Support Requests & Cold-Chain Dispatch */}
        {tab === "dispatch" ? (
          <section id="dispatch" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-bold text-[#25352B]">
                Yêu cầu hỗ trợ từ Nhà vườn ({supportRequests.length})
              </h2>
              <div className="space-y-3">
                {supportRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="tabular-nums text-xs font-bold text-[#245B3D]">{req.id}</span>
                      <Badge tone="info">{req.status}</Badge>
                    </div>
                    <p className="font-bold text-[#25352B]">{req.title}</p>
                    <p className="text-xs text-[#52645A]">
                      {req.farmName} · {req.preferredTime} · {req.locationMode}
                    </p>
                    <p className="text-sm text-[#25352B]">{req.note}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/volunteer"
                className="inline-flex min-h-[44px] items-center rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-bold text-[#245B3D] hover:bg-[#EAF0E5]"
              >
                Mở bảng Nhiệm vụ Thanh niên (/volunteer) →
              </Link>
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-bold text-[#25352B]">
                Điều phối chuyến gom lạnh liên kết HTX (Minh họa)
              </h2>
              <div className="space-y-3">
                {COLD_CHAIN_TRIPS.map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="tabular-nums text-xs font-bold text-[#245B3D]">
                        {trip.id}
                      </span>
                      <Badge tone="neutral">{trip.status}</Badge>
                    </div>
                    <p className="font-bold text-[#25352B]">{trip.route}</p>
                    <p className="text-xs text-[#52645A]">{trip.farmSummary}</p>
                    <p className="text-xs font-semibold text-[#245B3D]">
                      Khởi hành: {trip.departure} · Nhiệt độ mục tiêu: {trip.tempTarget}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

        {/* Tab 4: S24d Live Demo Analytics */}
        {tab === "analytics" ? (
          <section id="analytics" className="space-y-5">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#25352B]">
                  Biểu đồ chỉ số thực hành trên Prototype (S24d)
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#52645A]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Cập nhật tức thì
                </span>
              </div>

              <div className="h-[280px] w-full">
                {chartMounted ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analyticsData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D6DED2" />
                      <XAxis dataKey="name" tick={{ fill: "#25352B", fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "#52645A", fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="soLuong" name="Số lượng (Demo)" fill="#245B3D" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[12px] bg-[#F5F3E9] text-sm text-[#52645A]">
                    Đang dựng biểu đồ...
                  </div>
                )}
              </div>

              {/* Accessible data table mirror */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D6DED2] text-xs text-[#52645A]">
                      <th className="py-2 pr-4 font-semibold">Chỉ số trạng thái Demo</th>
                      <th className="py-2 font-semibold">Số lượng hiện có</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.map((row) => (
                      <tr key={row.name} className="border-b border-[#EAF0E5]">
                        <td className="py-2 pr-4 font-medium text-[#25352B]">{row.name}</td>
                        <td className="py-2 font-bold text-[#245B3D] tabular-nums">{row.soLuong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
