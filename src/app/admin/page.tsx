"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  Clock,
  Database,
  Download,
  Eye,
  EyeOff,
  FileSearch,
  Lock,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Store,
  Wallet,
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
import { useLocale } from "@/context/LocaleContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { NaiCalendarBoard } from "@/components/calendar/NaiCalendarBoard";
import { AccessDeniedCard } from "@/components/permissions/AccessDeniedCard";
import { PermissionMatrix } from "@/components/permissions/PermissionMatrix";
import { ScopeSelector } from "@/components/permissions/ScopeSelector";
import { QualityCenterPanel } from "@/components/quality/QualityCenterPanel";
import { AdministrativeBoundaryLayer } from "@/components/map/AdministrativeBoundaryLayer";
import { resolveCampaignRuntimeState } from "@/lib/commerce/promotion-engine";
import { formatVnDateTime } from "@/lib/clock/vn-clock";
import { PERIOD_WINDOWS, computeBusinessMetrics } from "@/lib/metrics/business-metrics";
import { impactAnalysisForRecall } from "@/lib/quality/recall-engine";
import { buildScopedCsvContent, triggerCsvDownload } from "@/lib/export/csv-export";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "@/data/reference/ocop-public-reference";
import { formatVnd } from "@/lib/format";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { PeriodKey } from "@/types/naifarm";

type AdminTab =
  | "overview"
  | "merchants"
  | "catalog"
  | "orders"
  | "quality"
  | "finance"
  | "campaigns"
  | "calendar"
  | "permissions"
  | "support_gis";

export default function AdminWorkspacePage() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const {
    hydrated,
    setActiveWorkspace,
    authUser,
    activeClockIso,
    setClockOverrideIso,
    activeScopeUnitCode,
    farms,
    products,
    batches,
    orders,
    refundRequests,
    credentialRecords,
    warehouseStocks,
    inventoryMovements,
    expenses,
    receivablesPayables,
    missions,
    volunteerHours,
    campaigns,
    auditLogs,
    tickets,
    toggleProductVisibility,
    decideRefundRequest,
    updateCredentialLifecycle,
    renewCredentialRecord,
    holdOrRecallBatch,
    updateTicketStatus,
    advanceCampaignStatus,
  } = useDemoStore();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [periodKey, setPeriodKey] = useState<PeriodKey>("current_month");
  const [recallTargetBatch, setRecallTargetBatch] = useState("NF-DN-099");
  const [recallReason, setRecallReason] = useState("Kiểm tra dư lượng lô mẫu — phong tỏa cả lô con kế thừa");
  const [checkerIdentity, setCheckerIdentity] = useState("Trưởng ban Kiểm soát Tài chính");
  const [auditSearch, setAuditSearch] = useState("");

  useEffect(() => {
    setActiveWorkspace("W06");
  }, [setActiveWorkspace]);

  const report = useMemo(
    () =>
      computeBusinessMetrics({
        orders,
        stocks: warehouseStocks,
        movements: inventoryMovements,
        expenses,
        debts: receivablesPayables,
        missions,
        hourRecords: volunteerHours,
        periodKey,
        refDateIso: "2026-11-25",
      }),
    [orders, warehouseStocks, inventoryMovements, expenses, receivablesPayables, missions, volunteerHours, periodKey],
  );

  const recallImpact = useMemo(
    () => impactAnalysisForRecall(recallTargetBatch, batches, orders),
    [recallTargetBatch, batches, orders],
  );

  const scopedFarms = useMemo(() => {
    if (activeScopeUnitCode === "ALL") return farms;
    return farms.filter((f) => f.administrativeUnitCode === activeScopeUnitCode);
  }, [farms, activeScopeUnitCode]);

  const filteredAudits = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter((a) =>
      `${a.action} ${a.actor} ${a.target} ${a.note}`.toLowerCase().includes(q),
    );
  }, [auditLogs, auditSearch]);

  const chartData = useMemo(
    () => [
      { metric: "GMV", amount: report.gmvVnd },
      { metric: "Net Merchandise", amount: report.netMerchandiseSalesVnd },
      { metric: "Thu thực từ khách", amount: report.totalCustomerCollectedVnd },
      { metric: "Doanh thu nền tảng", amount: report.platformRevenueVnd },
      { metric: "Chi phí vận hành", amount: report.operatingExpensesVnd },
    ],
    [report],
  );

  const exportPlatformCsv = () => {
    const csv = buildScopedCsvContent(
      ["Chỉ tiêu", "Giá trị (VNĐ)", "Kỳ dữ liệu", "Ghi chú tách bạch"],
      [
        ["GMV (Tổng giá trị đơn đã xác nhận trở lên)", report.gmvVnd, report.period.label, "Trước chiết khấu và hoàn tiền"],
        ["Net Merchandise Sales", report.netMerchandiseSalesVnd, report.period.label, "Đơn hoàn thành − Chiết khấu − Hoàn hàng hóa"],
        ["Customer Cash Collected", report.totalCustomerCollectedVnd, report.period.label, "Gồm phí giao ròng + thuế nếu có"],
        ["Platform Revenue (Phí sàn ròng)", report.platformRevenueVnd, report.period.label, "Tách biệt hoàn toàn với doanh số nhà vườn"],
        ["COGS", report.cogsVnd, report.period.label, `Thiếu costSnapshot ở ${report.missingCostLinesCount} dòng`],
      ],
      {
        reportTitle: "Báo cáo Điều hành Toàn nền tảng NaiFarm",
        periodLabel: report.period.label,
        scopeLabel: activeScopeUnitCode === "ALL" ? "Toàn tỉnh Đồng Nai (95 xã/phường)" : activeScopeUnitCode,
      },
    );
    triggerCsvDownload(`naifarm-admin-finance-${periodKey}.csv`, csv);
    notifySuccess("Đã xuất báo cáo điều hành & tài chính CSV.");
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
        Đang mở Trung tâm Điều hành Quản trị...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W06"
      title="Trung tâm Điều hành Quản trị"
      navItems={[
        {
          label: "Tổng quan điều hành",
          href: "#overview",
          active: tab === "overview",
          onClick: () => setTab("overview"),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Nhà vườn & HTX (${scopedFarms.length})`,
          href: "#merchants",
          active: tab === "merchants",
          onClick: () => setTab("merchants"),
          icon: <Store className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Danh mục sản phẩm (${products.length})`,
          href: "#catalog",
          active: tab === "catalog",
          onClick: () => setTab("catalog"),
          icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Đơn hàng & Hoàn tiền (${refundRequests.length})`,
          href: "#orders",
          active: tab === "orders",
          onClick: () => setTab("orders"),
          icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Chất lượng & Thu hồi lô",
          href: "#quality",
          active: tab === "quality",
          onClick: () => setTab("quality"),
          icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Tài chính & Đối soát",
          href: "#finance",
          active: tab === "finance",
          onClick: () => setTab("finance"),
          icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Chiến dịch & Đồng hồ (${campaigns.length})`,
          href: "#campaigns",
          active: tab === "campaigns",
          onClick: () => setTab("campaigns"),
          icon: <Megaphone className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Lịch Hệ thống (NaiCalendar)",
          href: "#calendar",
          active: tab === "calendar",
          onClick: () => setTab("calendar"),
          icon: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Phân quyền & Kiểm toán (${auditLogs.length})`,
          href: "#permissions",
          active: tab === "permissions",
          onClick: () => setTab("permissions"),
          icon: <Lock className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Hỗ trợ & Dữ liệu GIS (${tickets.length})`,
          href: "#support_gis",
          active: tab === "support_gis",
          onClick: () => setTab("support_gis"),
          icon: <Database className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Global Period & Unit Scope Bar */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <ScopeSelector label="Lọc địa bàn quản trị" />
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PERIOD_WINDOWS) as PeriodKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriodKey(key)}
                className={`min-h-[34px] cursor-pointer rounded-full px-3 text-xs font-semibold ${
                  periodKey === key
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#FAF8F1] text-[#25352B]"
                }`}
              >
                {key === "current_month"
                  ? "T11/2026"
                  : key === "previous_month"
                  ? "T10/2026"
                  : key === "last_7d"
                  ? "7 ngày"
                  : key === "last_30d"
                  ? "30 ngày"
                  : "Tất cả"}
              </button>
            ))}
          </div>
        </Card>

        {/* Tab 1: Executive Overview */}
        {tab === "overview" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4">
                <p className="text-xs font-semibold text-[#52645A]">GMV Toàn sàn (Trước giảm/hoàn)</p>
                <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">{formatVnd(report.gmvVnd)}</p>
                <p className="mt-1 text-[11px] text-[#52645A]">{report.ordersTotalCount} đơn phát sinh trong kỳ</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-[#52645A]">Doanh số hàng hóa ròng (Net Sales)</p>
                <p className="mt-1 tabular-nums text-xl font-bold text-[#245B3D]">
                  {formatVnd(report.netMerchandiseSalesVnd)}
                </p>
                <p className="mt-1 text-[11px] text-[#24603B]">
                  Biến động kỳ trước: {report.netSalesDeltaPct !== null ? `${report.netSalesDeltaPct}%` : "N/A"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-[#52645A]">Doanh thu nền tảng (Platform Revenue)</p>
                <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">
                  {formatVnd(report.platformRevenueVnd)}
                </p>
                <p className="mt-1 text-[11px] text-[#52645A]">Tách bạch hoàn toàn khỏi tiền hàng nhà vườn</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold text-[#52645A]">Chỉ số Vận hành &amp; Tình nguyện</p>
                <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">
                  {report.confirmedVolunteerHours} giờ duyệt
                </p>
                <p className="mt-1 text-[11px] text-[#52645A]">
                  Hỗ trợ {report.uniqueFarmsSupported} vườn · Giao đúng hẹn {report.onTimeDeliveryPct ?? 0}%
                </p>
              </Card>
            </div>

            <Card className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#25352B]">
                  Tách bạch GMV, Doanh số ròng &amp; Doanh thu nền tảng ({report.period.label})
                </h2>
                <Badge tone="neutral">Số liệu nội bộ theo kỳ</Badge>
              </div>
              <div className="h-[260px] w-full min-w-0">
                {hydrated ? (
                  <ResponsiveContainer width="100%" height={260} minWidth={0}>
                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5EAE0" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#52645A" }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#52645A" }}
                        tickFormatter={(v: number) => `${Math.round(v / 1000000)}tr`}
                      />
                      <Tooltip formatter={(val) => formatVnd(Number(val ?? 0))} />
                      <Bar dataKey="amount" fill="#245B3D" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <div className="overflow-x-auto border-t border-[#EAEFE6] pt-3">
                <table aria-label="Bảng đối chiếu số liệu điều hành" className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D6DED2] text-[#52645A]">
                      <th className="py-2 pr-3 font-semibold">Chỉ tiêu</th>
                      <th className="py-2 pl-3 text-right font-semibold">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEFE6]">
                    {chartData.map((row) => (
                      <tr key={row.metric}>
                        <td className="py-2 pr-3 font-semibold text-[#25352B]">{row.metric}</td>
                        <td className="py-2 pl-3 text-right tabular-nums font-bold text-[#245B3D]">
                          {formatVnd(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Tab 2: Merchants & HTX */}
        {tab === "merchants" ? (
          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-[#25352B]">
              Danh bạ Nhà vườn &amp; HTX trải nghiệm ({scopedFarms.length} cơ sở)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D6DED2] text-[#52645A]">
                    <th className="py-2 pr-3 font-semibold">Tên nhà vườn / Chủ thể</th>
                    <th className="py-2 px-3 font-semibold">Chủ vườn</th>
                    <th className="py-2 px-3 font-semibold">ĐVHC Đồng Nai</th>
                    <th className="py-2 px-3 text-right font-semibold">Diện tích</th>
                    <th className="py-2 pl-3 font-semibold">Hồ sơ OCOP / VietGAP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE6]">
                  {scopedFarms.map((f) => (
                    <tr key={f.id}>
                      <td className="py-2.5 pr-3 font-bold text-[#25352B]">
                        <Link href={`/farms/${f.slug}`} className="hover:text-[#245B3D] hover:underline">
                          {f.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-[#52645A]">{f.ownerName}</td>
                      <td className="py-2.5 px-3 text-[#52645A]">
                        {f.administrativeUnitName} ({f.administrativeUnitCode})
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{f.areaHa} ha</td>
                      <td className="py-2.5 pl-3">
                        <Badge tone="neutral">{f.ocopLabel}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {/* Tab 3: Catalog Governance */}
        {tab === "catalog" ? (
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">
                  Quản trị Danh mục SKU ({products.length} mặt hàng trải nghiệm)
                </h2>
                <p className="text-xs text-[#52645A]">
                  Tách biệt hoàn toàn khỏi {OCOP_PUBLIC_REFERENCE_CATALOG.length} hồ sơ công bố chính thức trong{" "}
                  <Link href="/marketplace?collection=public_ref" className="font-semibold text-[#245B3D] underline">
                    Danh mục OCOP tham khảo
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D6DED2] text-[#52645A]">
                    <th className="py-2 pr-3 font-semibold">SKU &amp; Tên sản phẩm</th>
                    <th className="py-2 px-3 font-semibold">Nhà vườn</th>
                    <th className="py-2 px-3 font-semibold">Mã lô</th>
                    <th className="py-2 px-3 text-right font-semibold">Giá bán</th>
                    <th className="py-2 px-3 font-semibold">Trạng thái</th>
                    <th className="py-2 pl-3 text-right font-semibold">Kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE6]">
                  {products.slice(0, 24).map((p) => {
                    const b = batches.find((bat) => bat.batchCode === p.batchCode);
                    const isBlocked =
                      b?.lotStatus === "quarantine" || b?.lotStatus === "recalled" || b?.lotStatus === "expired";
                    return (
                      <tr key={p.id}>
                        <td className="py-2 pr-3 font-bold text-[#25352B]">{p.name}</td>
                        <td className="py-2 px-3 text-[#52645A]">{p.farmName}</td>
                        <td className="py-2 px-3 font-mono text-[#245B3D]">{p.batchCode}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatVnd(p.priceVnd)}</td>
                        <td className="py-2 px-3">
                          {isBlocked ? (
                            <Badge tone="danger">Khóa theo lô ({b?.lotStatus})</Badge>
                          ) : (
                            <Badge tone={p.seasonStatus === "in_season" ? "success" : "warning"}>
                              {p.seasonStatus}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              toggleProductVisibility(p.id);
                              notifyInfo(`Đã chuyển trạng thái hiển thị cho ${p.name}.`);
                            }}
                            className="inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-[8px] border border-[#D6DED2] px-2.5 text-xs font-semibold hover:bg-[#EAF0E5]"
                          >
                            {p.seasonStatus === "out_of_season" ? (
                              <>
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Mở</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Ẩn</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {/* Tab 4: Orders & Refunds */}
        {tab === "orders" ? (
          <div className="space-y-5">
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#25352B]">
                  Hàng chờ Hoàn tiền toàn sàn ({refundRequests.length})
                </h2>
                <select
                  value={checkerIdentity}
                  onChange={(e) => setCheckerIdentity(e.target.value)}
                  aria-label="Chọn người kiểm soát duyệt hoàn tiền"
                  className="min-h-[36px] rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
                >
                  <option value="Trưởng ban Kiểm soát Tài chính">Trưởng ban Kiểm soát Tài chính (Hợp lệ)</option>
                  <option value="CSKH NaiFarm">CSKH NaiFarm (Trùng Maker — kiểm tra chặn)</option>
                </select>
              </div>
              <div className="space-y-2.5 text-xs">
                {refundRequests.map((rf) => (
                  <div key={rf.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5">
                    <div>
                      <p className="font-bold text-[#25352B]">
                        {rf.id} · Đơn {rf.orderId} · {formatVnd(rf.amountVnd)}
                      </p>
                      <p className="text-[#52645A]">
                        {rf.reason} · Lập: {rf.makerName}
                        {rf.checkerName ? ` · Duyệt: ${rf.checkerName}` : ""}
                      </p>
                    </div>
                    {rf.status === "pending_maker" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            const res = decideRefundRequest(rf.id, "approved_by_finance", checkerIdentity);
                            if (res.ok) notifySuccess(res.message);
                            else notifyError(res.message);
                          }}
                        >
                          Duyệt hoàn
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const res = decideRefundRequest(rf.id, "rejected", checkerIdentity);
                            if (res.ok) notifyInfo(res.message);
                            else notifyError(res.message);
                          }}
                        >
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <Badge tone={rf.status === "approved_by_finance" ? "success" : "danger"}>{rf.status}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Tab 5: Quality 26 Types + Lot Hold/Recall & Impact Analysis */}
        {tab === "quality" ? (
          <div className="space-y-6">
            <Card className="space-y-4 border-2 border-[#D7A34D]/60 p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                <ShieldAlert className="h-5 w-5 text-[#A32D2D]" aria-hidden="true" />
                <span>Tạm giữ / Thu hồi lô &amp; Phân tích phả hệ lan truyền</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label htmlFor="recall-batch" className="block text-xs font-semibold text-[#25352B]">
                    Chọn mã lô kiểm soát
                  </label>
                  <select
                    id="recall-batch"
                    value={recallTargetBatch}
                    onChange={(e) => setRecallTargetBatch(e.target.value)}
                    className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs font-mono"
                  >
                    <option value="NF-DN-099">NF-DN-099 (Lô cha kích hoạt thu hồi lan truyền)</option>
                    <option value="NF-DN-098">NF-DN-098 (Lô tạm giữ QC)</option>
                    <option value="NF-DN-050">NF-DN-050 (Lô gom hỗn hợp HTX)</option>
                    <option value="NF-DEMO-001">NF-DEMO-001 (Vườn Ba Tư)</option>
                  </select>
                </div>
                <div className="md:col-span-5">
                  <label htmlFor="recall-reason" className="block text-xs font-semibold text-[#25352B]">
                    Lý do kỹ thuật / kiểm tra QC
                  </label>
                  <input
                    id="recall-reason"
                    type="text"
                    value={recallReason}
                    onChange={(e) => setRecallReason(e.target.value)}
                    className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                </div>
                <div className="flex items-end gap-2 md:col-span-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const res = holdOrRecallBatch(recallTargetBatch, "recalled", recallReason, "Admin W06");
                      notifyInfo(res.message);
                    }}
                  >
                    Thu hồi dây chuyền
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const res = holdOrRecallBatch(recallTargetBatch, "active", "Đạt kiểm tra tái lưu hành", "Admin W06");
                      notifySuccess(res.message);
                    }}
                  >
                    Mở lại lô
                  </Button>
                </div>
              </div>

              <div className="rounded-[12px] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
                <p>
                  <strong className="text-[#25352B]">Tác động phả hệ dự kiến:</strong>{" "}
                  {recallImpact.affectedBatchCodes.join(" → ")} · Ảnh hưởng{" "}
                  <strong>{recallImpact.affectedOrders.length}</strong> đơn hàng ({recallImpact.affectedOrders.map((o) => o.id).join(", ") || "chưa có đơn"}).
                </p>
              </div>
            </Card>

            <QualityCenterPanel
              records={credentialRecords}
              roleMode="admin"
              onChangeStatus={(id, nextStatus, note) => {
                updateCredentialLifecycle(id, nextStatus, note, "Quản trị Hệ thống W06");
                notifySuccess(`Đã cập nhật trạng thái hồ sơ ${id}.`);
              }}
              onRenew={(id) => {
                const created = renewCredentialRecord(id, "Quản trị Hệ thống W06");
                if (created) notifySuccess(`Đã tạo bản ghi gia hạn ${created.id}.`);
              }}
            />
          </div>
        ) : null}

        {/* Tab 6: Finance & CSV */}
        {tab === "finance" ? (
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">Đối soát tài chính toàn nền tảng</h2>
                <p className="text-xs text-[#52645A]">
                  Sổ quản trị nội bộ — không thay thế báo cáo tài chính hoặc kê khai thuế pháp lý.
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={exportPlatformCsv}>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Xuất CSV đối soát</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-[12px] bg-[#FAF8F1] p-4">
                <p className="text-[#52645A]">Thu từ khách hàng (Customer Cash Collected)</p>
                <p className="mt-1 tabular-nums text-lg font-bold text-[#25352B]">
                  {formatVnd(report.totalCustomerCollectedVnd)}
                </p>
              </div>
              <div className="rounded-[12px] bg-[#FAF8F1] p-4">
                <p className="text-[#52645A]">Dòng hàng thiếu costSnapshot</p>
                <p className="mt-1 tabular-nums text-lg font-bold text-[#80520C]">
                  {report.missingCostLinesCount} dòng
                </p>
              </div>
              <div className="rounded-[12px] bg-[#FAF8F1] p-4">
                <p className="text-[#52645A]">Công nợ mở / quá hạn toàn hệ thống</p>
                <p className="mt-1 tabular-nums text-lg font-bold text-[#245B3D]">
                  {formatVnd(report.receivableOpenVnd)} ({report.overdueDebtCount} quá hạn)
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Tab 7: Permissions & Audit Trail */}
        {tab === "permissions" ? (
          <div className="space-y-6">
            <PermissionMatrix />

            <Card className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                  <FileSearch className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>Nhật ký kiểm toán trước/sau ({filteredAudits.length})</span>
                </h2>
                <input
                  type="search"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Tìm theo tác vụ, người duyệt, mục tiêu..."
                  className="min-h-[38px] w-full max-w-xs rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D6DED2] text-[#52645A]">
                      <th className="py-2 pr-3 font-semibold">Thời điểm</th>
                      <th className="py-2 px-3 font-semibold">Người thao tác</th>
                      <th className="py-2 px-3 font-semibold">Tác vụ</th>
                      <th className="py-2 px-3 font-semibold">Mục tiêu</th>
                      <th className="py-2 pl-3 font-semibold">Chi tiết / Trước → Sau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEFE6]">
                    {filteredAudits.slice(0, 30).map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums text-[#52645A]">{log.time}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#25352B]">{log.actor}</td>
                        <td className="py-2.5 px-3">
                          <code className="rounded bg-[#EAF0E5] px-2 py-0.5 text-[11px] font-semibold text-[#245B3D]">
                            {log.action}
                          </code>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#25352B]">{log.target}</td>
                        <td className="py-2.5 pl-3 text-[#52645A]">
                          {log.note}
                          {log.beforeSummary && log.afterSummary ? (
                            <span className="mt-0.5 block font-semibold text-[#245B3D]">
                              {log.beforeSummary} → {log.afterSummary}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Tab 8: Support Tickets & GIS Data Center (25/11/2026 provenance lives here!) */}
        {tab === "support_gis" ? (
          <div className="space-y-6">
            <AdministrativeBoundaryLayer />

            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#25352B]">
                  Phiếu Hỗ trợ &amp; Rà soát Địa giới ({tickets.length})
                </h2>
                <Badge tone="info">Kênh điều phối nội bộ</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {tickets.map((tkt) => (
                  <Card key={tkt.id} className="space-y-2 p-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="tabular-nums font-bold text-[#245B3D]">{tkt.id}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={tkt.priority === "Ưu tiên" ? "warning" : "neutral"}>{tkt.priority}</Badge>
                        <Badge
                          tone={
                            tkt.status === "Đã phản hồi"
                              ? "success"
                              : tkt.status === "Đang xử lý"
                              ? "info"
                              : "warning"
                          }
                        >
                          {tkt.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#25352B]">{tkt.subject}</p>
                    <p className="text-[#52645A]">
                      {tkt.requesterName} ({tkt.roleLabel}) · {tkt.administrativeUnitName} ({tkt.administrativeUnitCode})
                    </p>
                    <p className="rounded-lg bg-[#FAF8F1] p-2.5 text-[#52645A]">{tkt.note}</p>
                    {tkt.status !== "Đã phản hồi" ? (
                      <div className="flex gap-2 pt-1">
                        {tkt.status === "Mới tiếp nhận" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              updateTicketStatus(tkt.id, "Đang xử lý");
                              notifyInfo(`Đã tiếp nhận xử lý ${tkt.id}.`);
                            }}
                          >
                            Nhận xử lý
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateTicketStatus(tkt.id, "Đã phản hồi");
                            notifySuccess(`Đã đánh dấu hoàn tất ${tkt.id}.`);
                          }}
                        >
                          Đánh dấu đã phản hồi
                        </Button>
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "campaigns" ? (
          <div className="space-y-5">
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                    <Clock className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                    <span>
                      {isEn
                        ? "Asia/Ho_Chi_Minh Campaign Clock Test Switcher"
                        : "Kiểm thử Đồng hồ Hệ thống (Asia/Ho_Chi_Minh)"}
                    </span>
                  </h2>
                  <p className="text-xs text-[#52645A]">
                    {isEn ? "Active clock:" : "Đồng hồ hiện tại:"}{" "}
                    <strong>{formatVnDateTime(activeClockIso, locale)}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "25/11/2026 (Default Active)", iso: "2026-11-25T12:00:00+07:00" },
                    { label: "24/11/2026 (Culture Day)", iso: "2026-11-24T12:00:00+07:00" },
                    { label: "05/12/2026 (Soil & Youth)", iso: "2026-12-05T09:00:00+07:00" },
                  ].map((preset) => (
                    <Button
                      key={preset.iso}
                      size="sm"
                      variant={activeClockIso === preset.iso ? "primary" : "secondary"}
                      onClick={() => {
                        setClockOverrideIso(
                          preset.iso === "2026-11-25T12:00:00+07:00" ? null : preset.iso,
                        );
                        notifySuccess(`${isEn ? "Clock set:" : "Đã chuyển mốc đồng hồ:"} ${preset.label}`);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="space-y-3 p-5">
              <h3 className="text-base font-bold text-[#25352B]">
                {isEn ? "Campaign Approval & Governance (Maker ≠ Checker)" : "Quản trị Chiến dịch & Phê duyệt (Maker ≠ Checker)"}
              </h3>
              <div className="space-y-2.5 text-xs">
                {campaigns.slice(0, 10).map((c) => {
                  const rt = resolveCampaignRuntimeState(c, activeClockIso);
                  return (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={rt === "active" ? "success" : "info"}>{rt}</Badge>
                          <span className="font-bold text-[#25352B]">{isEn ? c.titleEn : c.titleVi}</span>
                        </div>
                        <p className="mt-0.5 text-[#52645A]">
                          Maker: {c.makerName} · Approver: {c.approverName ?? "Pending"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.status === "submitted" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              const res = advanceCampaignStatus(c.id, "approved", "Quản trị viên W06");
                              if (res.ok) notifySuccess(res.message);
                              else notifyError(res.message);
                            }}
                          >
                            {isEn ? "Approve" : "Duyệt"}
                          </Button>
                        ) : null}
                        {c.status === "active" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const res = advanceCampaignStatus(c.id, "paused", "Quản trị viên W06");
                              if (res.ok) notifyInfo(res.message);
                              else notifyError(res.message);
                            }}
                          >
                            {isEn ? "Pause" : "Tạm dừng"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "calendar" ? <NaiCalendarBoard scope="W06" allowCreate /> : null}

        {tab === "permissions" && authUser && authUser.workspaceId !== "W06" ? (
          <AccessDeniedCard
            title={t.workspaces.accessDeniedTitle}
            reason={`${t.workspaces.accessDeniedBody} (${authUser.workspaceId} -> W06)`}
          />
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
