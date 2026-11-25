"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  Download,
  FileCheck2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { ScopeSelector } from "@/components/permissions/ScopeSelector";
import { QualityCenterPanel } from "@/components/quality/QualityCenterPanel";
import { buildScopedCsvContent, triggerCsvDownload } from "@/lib/export/csv-export";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

type CoordTab = "hours" | "documents" | "quality" | "dispatch" | "analytics";

export default function CoordinatorWorkspacePage() {
  const {
    hydrated,
    setActiveWorkspace,
    activeScopeUnitCode,
    missions,
    docCases,
    supportRequests,
    logisticsTrips,
    credentialRecords,
    approveMissionHoursByCoordinator,
    requestMissionRevision,
    reviewDocumentCase,
    updateCredentialLifecycle,
    renewCredentialRecord,
    updateLogisticsTripStatus,
  } = useDemoStore();

  const [tab, setTab] = useState<CoordTab>("hours");
  const [reviewerIdentity, setReviewerIdentity] = useState("Thu Hà (Điều phối viên W04)");
  const [revisionNoteMap, setRevisionNoteMap] = useState<Record<string, string>>({});
  const [docNotes, setDocNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveWorkspace("W04");
  }, [setActiveWorkspace]);

  const scopedMissions = useMemo(() => {
    if (activeScopeUnitCode === "ALL") return missions;
    return missions.filter((m) => !m.administrativeUnitCode || m.administrativeUnitCode === activeScopeUnitCode);
  }, [missions, activeScopeUnitCode]);

  const analyticsRows = useMemo(
    () => [
      { stage: "Chủ vườn xác nhận", count: scopedMissions.filter((m) => m.status === "farm_accepted").length },
      { stage: "Đã duyệt giờ công", count: scopedMissions.filter((m) => m.status === "coordinator_approved").length },
      { stage: "Chờ đối chiếu hồ sơ", count: docCases.filter((d) => d.status === "Chờ đối chiếu").length },
      { stage: "Hồ sơ đã đối chiếu", count: docCases.filter((d) => d.status === "Hồ sơ đã đối chiếu").length },
      { stage: "Yêu cầu bổ sung", count: docCases.filter((d) => d.status === "Yêu cầu bổ sung").length },
    ],
    [scopedMissions, docCases],
  );

  const exportImpactCsv = () => {
    const csv = buildScopedCsvContent(
      ["Mã NV", "Tên nhiệm vụ", "Nhà vườn", "Người thực hiện", "Giờ duyệt", "Trạng thái"],
      scopedMissions.map((m) => [m.id, m.title, m.farmName, m.assigneeName ?? "Chưa nhận", m.approvedHours, m.status]),
      {
        reportTitle: "Báo cáo Điều phối & Tác động Thanh niên",
        periodLabel: "Tháng 11/2026",
        scopeLabel: activeScopeUnitCode === "ALL" ? "Toàn tỉnh Đồng Nai (95 xã/phường)" : `Mã ĐVHC ${activeScopeUnitCode}`,
      },
    );
    triggerCsvDownload(`naifarm-dieu-phoi-${activeScopeUnitCode}.csv`, csv);
    notifySuccess("Đã xuất báo cáo điều phối theo phạm vi CSV.");
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
        Đang mở Không gian Điều phối viên...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W04"
      title="Không gian Điều phối viên Cơ sở"
      navItems={[
        {
          label: `Duyệt giờ công 2 lớp (${scopedMissions.length})`,
          href: "#hours",
          active: tab === "hours",
          onClick: () => setTab("hours"),
          icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Đối chiếu chứng từ (${docCases.length})`,
          href: "#documents",
          active: tab === "documents",
          onClick: () => setTab("documents"),
          icon: <FileCheck2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Trung tâm Chất lượng (26 chuẩn)",
          href: "#quality",
          active: tab === "quality",
          onClick: () => setTab("quality"),
          icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Điều phối & Chuyến gom (${supportRequests.length})`,
          href: "#dispatch",
          active: tab === "dispatch",
          onClick: () => setTab("dispatch"),
          icon: <Truck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Báo cáo tác động & CSV",
          href: "#analytics",
          active: tab === "analytics",
          onClick: () => setTab("analytics"),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
          <ScopeSelector label="Phạm vi điều phối theo ĐVHC" />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor="coord-reviewer" className="font-semibold text-[#52645A]">
              Điều phối viên ký duyệt:
            </label>
            <select
              id="coord-reviewer"
              value={reviewerIdentity}
              onChange={(e) => setReviewerIdentity(e.target.value)}
              className="min-h-[38px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs font-semibold text-[#25352B]"
            >
              <option value="Thu Hà (Điều phối viên W04)">Thu Hà (Điều phối viên W04 — Hợp lệ)</option>
              <option value="Minh Anh">Minh Anh (Thử tự duyệt nhiệm vụ mình làm — kiểm tra chặn)</option>
            </select>
          </div>
        </Card>

        {/* Tab 1: Dual-layer hours */}
        {tab === "hours" ? (
          <section id="hours" className="space-y-4">
            <DemoBanner
              title="Quy tắc phê duyệt 2 lớp & chống tự duyệt"
              detail="Điều phối viên chỉ có thể duyệt giờ công khi Chủ vườn W02 đã xác nhận bàn giao thực tế và người duyệt khác người thực hiện."
            />

            {scopedMissions.map((m) => {
              const farmAccepted = m.status === "farm_accepted";
              const approved = m.status === "coordinator_approved";
              const isSlaAlert = m.status === "submitted" || m.status === "revision_requested";
              return (
                <Card key={m.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#245B3D]">{m.id}</span>
                        <Badge tone={approved ? "success" : farmAccepted ? "info" : "warning"}>
                          {approved
                            ? `Đã duyệt +${m.approvedHours} giờ`
                            : farmAccepted
                            ? "Chủ vườn W02 đã xác nhận — sẵn sàng duyệt"
                            : m.status}
                        </Badge>
                        {isSlaAlert ? (
                          <Badge tone="danger">
                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                            <span>Cảnh báo SLA chờ xử lý</span>
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="mt-1 text-base font-bold text-[#25352B]">{m.title}</h2>
                      <p className="text-xs text-[#52645A]">
                        {m.farmName} · Phụ trách: <strong>{m.assigneeName ?? "Chưa nhận"}</strong> · Đề nghị:{" "}
                        <strong>{m.submittedHours}/{m.expectedHours} giờ</strong>
                      </p>
                    </div>
                  </div>

                  {!approved ? (
                    <div className="flex flex-col gap-2 border-t border-[#EAEFE6] pt-3 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!farmAccepted}
                        onClick={() => {
                          const res = approveMissionHoursByCoordinator(m.id, reviewerIdentity);
                          if (res.ok) notifySuccess(res.message);
                          else notifyError(res.message);
                        }}
                      >
                        Duyệt giờ công (+{m.submittedHours}h)
                      </Button>

                      <input
                        type="text"
                        value={revisionNoteMap[m.id] ?? ""}
                        onChange={(e) => setRevisionNoteMap((prev) => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="Lý do yêu cầu bổ sung ảnh / nhật ký..."
                        className="min-h-[38px] flex-1 rounded-[8px] border border-[#788A7B] bg-white px-3 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          requestMissionRevision(
                            m.id,
                            revisionNoteMap[m.id]?.trim() || "Cần bổ sung ảnh chụp rõ mã lô QR và ngày thực hiện.",
                          );
                          notifyInfo(`Đã chuyển ${m.id} sang Yêu cầu bổ sung.`);
                        }}
                      >
                        Yêu cầu bổ sung
                      </Button>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </section>
        ) : null}

        {/* Tab 2: Document Review */}
        {tab === "documents" ? (
          <section id="documents" className="space-y-4">
            {docCases.map((c) => (
              <Card key={c.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#245B3D]">{c.id}</span>
                      <Badge
                        tone={
                          c.status === "Hồ sơ đã đối chiếu"
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

                <p className="rounded-[10px] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">{c.scopeNote}</p>
                {c.reviewerNote ? (
                  <p className="text-xs font-semibold text-[#24603B]">Ghi chú đối chiếu: {c.reviewerNote}</p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={docNotes[c.id] ?? ""}
                    onChange={(e) => setDocNotes((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Ghi chú đối chiếu hồ sơ (VD: Đã khớp địa bàn và thời hạn hiệu lực)..."
                    aria-label={`Ghi chú đối chiếu ${c.id}`}
                    className="min-h-[40px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const note =
                        docNotes[c.id]?.trim() ||
                        "Đã đối chiếu bản scan hồ sơ nhà vườn và phạm vi sản phẩm.";
                      reviewDocumentCase(c.id, "Hồ sơ đã đối chiếu", note);
                      notifySuccess(`Đã đánh dấu ${c.id} là Hồ sơ đã đối chiếu.`);
                    }}
                  >
                    Đánh dấu Đã đối chiếu
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const note = docNotes[c.id]?.trim() || "Cần bổ sung ảnh mặt sau phiếu thu hoạch.";
                      reviewDocumentCase(c.id, "Yêu cầu bổ sung", note);
                      notifyInfo(`Đã chuyển ${c.id} sang Yêu cầu bổ sung.`);
                    }}
                  >
                    Yêu cầu bổ sung
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        ) : null}

        {/* Tab 3: 26-type Quality Center */}
        {tab === "quality" ? (
          <QualityCenterPanel
            records={credentialRecords}
            roleMode="coordinator"
            onChangeStatus={(id, nextStatus, note) => {
              updateCredentialLifecycle(id, nextStatus, note, reviewerIdentity);
              notifySuccess(`Đã cập nhật trạng thái hồ sơ ${id}.`);
            }}
            onRenew={(id) => {
              const created = renewCredentialRecord(id, reviewerIdentity);
              if (created) notifySuccess(`Đã tạo bản ghi gia hạn ${created.id}.`);
            }}
          />
        ) : null}

        {/* Tab 4: Dispatch & Logistics */}
        {tab === "dispatch" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="space-y-3 p-5">
              <h2 className="text-lg font-bold text-[#25352B]">
                Yêu cầu hỗ trợ từ Nhà vườn ({supportRequests.length})
              </h2>
              <div className="space-y-3 text-xs">
                {supportRequests.map((req) => (
                  <div key={req.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#245B3D]">{req.id}</span>
                      <Badge tone="info">{req.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#25352B]">{req.title}</p>
                    <p className="text-[#52645A]">
                      {req.farmName} · {req.preferredTime} · {req.locationMode}
                    </p>
                    <p className="mt-1 text-[#25352B]">{req.note}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/volunteer"
                className="inline-flex min-h-[40px] items-center rounded-[10px] border border-[#245B3D] px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
              >
                Phân công trên bảng Thanh niên →
              </Link>
            </Card>

            <Card className="space-y-3 p-5">
              <h2 className="text-lg font-bold text-[#25352B]">
                Điều phối chuyến gom hàng mát ({logisticsTrips.length})
              </h2>
              <div className="space-y-3 text-xs">
                {logisticsTrips.map((trip) => (
                  <div key={trip.id} className="rounded-[12px] border border-[#D6DED2] bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[#245B3D]">{trip.id}</span>
                      <Badge
                        tone={
                          trip.status === "delivered_pod"
                            ? "success"
                            : trip.status === "failed_reschedule"
                            ? "danger"
                            : "info"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#25352B]">{trip.routeLabel}</p>
                    <p className="text-[#52645A]">
                      Tài xế: {trip.driverName} · {trip.parcelCount} kiện · {trip.plannedDeparture}
                    </p>
                    {trip.podNote ? <p className="mt-1 text-[#24603B]">Ghi nhận: {trip.podNote}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {trip.status !== "delivered_pod" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            updateLogisticsTripStatus(
                              trip.id,
                              "delivered_pod",
                              "Điều phối viên xác nhận đã bàn giao điểm gom.",
                            );
                            notifySuccess(`Đã hoàn tất chuyến ${trip.id}.`);
                          }}
                        >
                          Xác nhận giao POD
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Tab 5: Analytics & CSV */}
        {tab === "analytics" ? (
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">Thống kê điều phối &amp; Đối chiếu theo phạm vi</h2>
                <p className="text-xs text-[#52645A]">Dữ liệu tổng hợp trực tiếp từ trạng thái hồ sơ và nhiệm vụ.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={exportImpactCsv}>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Xuất CSV phạm vi</span>
              </Button>
            </div>

            <div className="h-[260px] w-full min-w-0">
              {hydrated ? (
                <ResponsiveContainer width="100%" height={260} minWidth={0}>
                  <BarChart data={analyticsRows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5EAE0" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#52645A" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#52645A" }} />
                    <Tooltip formatter={(val) => [`${val ?? 0} mục`, "Số lượng"]} />
                    <Bar dataKey="count" fill="#245B3D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div className="overflow-x-auto border-t border-[#EAEFE6] pt-3">
              <table aria-label="Bảng số liệu điều phối" className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D6DED2] text-[#52645A]">
                    <th className="py-2 pr-3 font-semibold">Chỉ mục xử lý</th>
                    <th className="py-2 pl-3 text-right font-semibold">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE6]">
                  {analyticsRows.map((row) => (
                    <tr key={row.stage}>
                      <td className="py-2 pr-3 font-semibold text-[#25352B]">{row.stage}</td>
                      <td className="py-2 pl-3 text-right tabular-nums font-bold text-[#245B3D]">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
