"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Package,
  TrendingDown,
  TrendingUp,
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
import { getManagerStrategyCards } from "@/lib/commerce/promotion-engine";
import { PERIOD_WINDOWS, computeBusinessMetrics } from "@/lib/metrics/business-metrics";
import { formatVnd } from "@/lib/format";
import { Badge, Card } from "@/components/ui/Primitives";
import type { ChannelKind, PeriodKey } from "@/types/naifarm";

export function FarmerOverviewAnalytics({
  farmIdFilter,
  farmName,
}: {
  farmIdFilter?: string;
  farmName: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const {
    hydrated,
    orders,
    warehouseStocks,
    inventoryMovements,
    expenses,
    receivablesPayables,
    missions,
    volunteerHours,
    refundRequests,
    campaigns,
  } = useDemoStore();

  const [scopeMode, setScopeMode] = useState<"org_tt_scenario" | "farm">("org_tt_scenario");
  const [channelFilter, setChannelFilter] = useState<"all" | ChannelKind>("all");
  const [periodKey, setPeriodKey] = useState<PeriodKey>("org_tt_nov_1_24");

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
        farmIdFilter: scopeMode === "farm" ? farmIdFilter : undefined,
        organizationIdFilter: scopeMode === "org_tt_scenario" ? "org-tt-scenario" : undefined,
        channelFilter: channelFilter === "all" ? undefined : channelFilter,
        refDateIso: "2026-11-25",
      }),
    [
      orders,
      warehouseStocks,
      inventoryMovements,
      expenses,
      receivablesPayables,
      missions,
      volunteerHours,
      periodKey,
      farmIdFilter,
      scopeMode,
      channelFilter,
    ],
  );

  const pendingApprovals = campaigns.filter(
    (c) => c.status === "draft" || c.status === "submitted",
  ).length;
  const strategyCards = useMemo(
    () => getManagerStrategyCards(report, pendingApprovals, locale),
    [report, pendingApprovals, locale],
  );

  const chartData = useMemo(
    () => [
      { name: "GMV (Trước giảm/hoàn)", value: report.gmvVnd },
      { name: "Doanh số ròng (Net)", value: report.netMerchandiseSalesVnd },
      { name: "Giá vốn (COGS)", value: report.cogsVnd },
      { name: "Lợi nhuận gộp", value: Math.max(0, report.grossProfitVnd) },
      { name: "Chi phí vận hành", value: report.operatingExpensesVnd },
      { name: "Kết quả nội bộ", value: Math.max(0, report.internalOperatingResultVnd) },
    ],
    [report],
  );

  const pendingRefunds = refundRequests.filter(
    (r) => r.status === "pending_maker" && (!farmIdFilter || r.farmId === farmIdFilter),
  );
  const pendingOrdersCount = orders.filter(
    (o) =>
      o.status === "pending_confirm" && (!farmIdFilter || o.farmId === farmIdFilter),
  ).length;

  return (
    <div className="space-y-5">
      {/* Period & Scenario / Channel Selectors */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-[#D6DED2] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#25352B]">
              {scopeMode === "org_tt_scenario"
                ? isEn
                  ? "Cooperative BI Dashboard — HTX Nông nghiệp Tân Triều (20 Members)"
                  : "Bảng chỉ số Quản trị HTX Nông nghiệp Tân Triều (20 hộ xã viên)"
                : `${isEn ? "Orchard Operating Overview" : "Tổng quan hiệu quả vận hành"} — ${farmName}`}
            </h2>
            <p className="text-xs text-[#52645A]">
              {isEn ? "Period:" : "Kỳ đối chiếu:"}{" "}
              <strong>{isEn ? report.period.labelEn : report.period.label}</strong> (Asia/Ho_Chi_Minh)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label={isEn ? "Scope selector" : "Phạm vi số liệu"}
              value={scopeMode}
              onChange={(e) => setScopeMode(e.target.value as "org_tt_scenario" | "farm")}
              className="min-h-[36px] rounded-[10px] border border-[#788A7B] bg-[#FAF8F1] px-2.5 text-xs font-semibold"
            >
              <option value="org_tt_scenario">
                {isEn ? "HTX Tân Triều (Reconciled Bi)" : "HTX Nông nghiệp Tân Triều (Số liệu đối chiếu)"}
              </option>
              <option value="farm">
                {isEn ? `Selected farm: ${farmName}` : `Nhà vườn đang chọn: ${farmName}`}
              </option>
            </select>
            <select
              aria-label={isEn ? "Channel filter" : "Lọc kênh bán"}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as "all" | ChannelKind)}
              className="min-h-[36px] rounded-[10px] border border-[#788A7B] bg-white px-2.5 text-xs font-semibold"
            >
              <option value="all">{isEn ? "All channels" : "Mọi kênh bán"}</option>
              <option value="marketplace">Marketplace</option>
              <option value="direct_orchard">{isEn ? "Direct orchard" : "Tại vườn"}</option>
              <option value="group_tour">{isEn ? "Tour booking" : "Đoàn tham quan"}</option>
              <option value="b2b_inquiry">B2B / Wholesale</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#EAEFE6] pt-3">
          {(Object.keys(PERIOD_WINDOWS) as PeriodKey[]).map((key) => {
            const active = periodKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPeriodKey(key)}
                className={`min-h-[34px] cursor-pointer rounded-full px-3 text-xs font-semibold transition ${
                  active
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#FAF8F1] text-[#25352B] hover:bg-[#EAF0E5]"
                }`}
              >
                {isEn ? PERIOD_WINDOWS[key].labelEn : PERIOD_WINDOWS[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deterministic Strategy Suggestions */}
      {strategyCards.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {strategyCards.slice(0, 3).map((st) => (
            <div
              key={st.id}
              className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs"
            >
              <p className="font-bold text-[#245B3D]">{isEn ? st.titleEn : st.titleVi}</p>
              <p className="mt-1 text-[#52645A]">{isEn ? st.rationaleEn : st.rationaleVi}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Warning banner when COGS lines missing */}
      {report.missingCostLinesCount > 0 ? (
        <div className="flex items-start gap-2.5 rounded-[12px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-3.5 text-xs text-[#80520C]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Có <strong>{report.missingCostLinesCount} dòng hàng</strong> chưa nhập giá vốn (costSnapshot = null).
            Hệ thống không tự ước tính thay để tránh sai lệch biên lợi nhuận gộp.
          </span>
        </div>
      ) : null}

      {/* Core KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-[#52645A]">Doanh số hàng hóa ròng (Net Sales)</p>
          <p className="mt-1 tabular-nums text-xl font-bold text-[#245B3D]">
            {formatVnd(report.netMerchandiseSalesVnd)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {report.netSalesDeltaPct !== null ? (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  report.netSalesDeltaPct >= 0 ? "text-[#24603B]" : "text-[#A32D2D]"
                }`}
              >
                {report.netSalesDeltaPct >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {report.netSalesDeltaPct > 0 ? "+" : ""}
                {report.netSalesDeltaPct}% so với kỳ trước
              </span>
            ) : (
              <span className="text-[#52645A]">Không đủ kỳ so sánh</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-[#52645A]">
            GMV: <strong className="tabular-nums">{formatVnd(report.gmvVnd)}</strong> ·{" "}
            {report.completedOrdersCount}/{report.ordersTotalCount} đơn hoàn thành
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-[#52645A]">Lợi nhuận gộp &amp; Kết quả nội bộ</p>
          <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">
            {formatVnd(report.grossProfitVnd)}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#24603B]">
            Biên gộp: {report.grossMarginPct !== null ? `${report.grossMarginPct}%` : "Chưa đủ dữ liệu"}
          </p>
          <p className="mt-1 text-[11px] text-[#52645A]">
            Kết quả nội bộ ước tính:{" "}
            <strong className="tabular-nums">{formatVnd(report.internalOperatingResultVnd)}</strong>
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-[#52645A]">Chất lượng giao đơn &amp; Hoàn tiền</p>
          <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">
            {report.aovVnd !== null ? formatVnd(report.aovVnd) : "N/A"}
            <span className="ml-1 text-xs font-medium text-[#52645A]">/ đơn (AOV)</span>
          </p>
          <p className="mt-1 text-xs text-[#52645A]">
            Đúng hẹn:{" "}
            <strong className="text-[#24603B]">
              {report.onTimeDeliveryPct !== null ? `${report.onTimeDeliveryPct}%` : "Chưa có"}
            </strong>{" "}
            · Khách quay lại:{" "}
            <strong>
              {report.repeatCustomerRatePct !== null ? `${report.repeatCustomerRatePct}%` : "Chưa có"}
            </strong>
          </p>
          <p className="mt-1 text-[11px] text-[#52645A]">
            Hoàn tiền:{" "}
            <strong>
              {report.refundRatePct !== null ? `${report.refundRatePct}% đơn` : "0%"} (
              {report.refundValueRatePct ?? 0}% giá trị)
            </strong>
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-[#52645A]">Kho khả dụng &amp; Công nợ</p>
          <p className="mt-1 tabular-nums text-xl font-bold text-[#25352B]">
            {formatVnd(report.inventoryValueVnd)}
          </p>
          <p className="mt-1 text-xs text-[#52645A]">
            Vòng quay tồn:{" "}
            <strong>{report.inventoryTurnover !== null ? `${report.inventoryTurnover}x` : "N/A"}</strong> ·
            Lô quá hạn: <strong className="text-[#A32D2D]">{report.expiredStockLotsCount}</strong>
          </p>
          <p className="mt-1 text-[11px] text-[#52645A]">
            Phải thu: <strong className="tabular-nums">{formatVnd(report.receivableOpenVnd)}</strong> · Quá
            hạn: <strong>{report.overdueDebtCount}</strong>
          </p>
        </Card>
      </div>

      {/* Chart + Accessible HTML Table + Exception Queue */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="space-y-4 p-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <BarChart3 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Cơ cấu doanh thu, giá vốn &amp; kết quả nội bộ (VNĐ)</span>
            </h3>
            <Badge tone="neutral">Số liệu nội bộ theo kỳ</Badge>
          </div>

          <div className="h-[260px] w-full min-w-0">
            {hydrated ? (
              <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAE0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#52645A" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#52645A" }}
                    tickFormatter={(val: number) => `${Math.round(val / 1000000)}tr`}
                  />
                  <Tooltip formatter={(val) => formatVnd(Number(val ?? 0))} />
                  <Bar dataKey="value" fill="#245B3D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[12px] bg-[#FAF8F1] text-xs text-[#52645A]">
                Đang tải biểu đồ...
              </div>
            )}
          </div>

          {/* Accessible HTML Table Fallback */}
          <div className="overflow-x-auto border-t border-[#EAEFE6] pt-3">
            <table
              aria-label="Bảng đối chiếu chỉ tiêu tài chính nội bộ"
              className="w-full min-w-[460px] border-collapse text-left text-xs"
            >
              <thead>
                <tr className="border-b border-[#D6DED2] text-[#52645A]">
                  <th className="py-2 pr-3 font-semibold">Chỉ tiêu</th>
                  <th className="py-2 px-3 text-right font-semibold">Giá trị</th>
                  <th className="py-2 pl-3 font-semibold">Định nghĩa kế toán nội bộ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFE6]">
                <tr>
                  <td className="py-2 pr-3 font-semibold text-[#25352B]">GMV</td>
                  <td className="py-2 px-3 text-right tabular-nums font-bold">{formatVnd(report.gmvVnd)}</td>
                  <td className="py-2 pl-3 text-[#52645A]">Đơn đã xác nhận trở lên, trước giảm giá &amp; hoàn tiền</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-[#245B3D]">Doanh số hàng hóa ròng</td>
                  <td className="py-2 px-3 text-right tabular-nums font-bold text-[#245B3D]">
                    {formatVnd(report.netMerchandiseSalesVnd)}
                  </td>
                  <td className="py-2 pl-3 text-[#52645A]">Đơn hoàn thành − Chiết khấu − Hoàn tiền hàng hóa</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-[#25352B]">Giá vốn hàng bán (COGS)</td>
                  <td className="py-2 px-3 text-right tabular-nums">{formatVnd(report.cogsVnd)}</td>
                  <td className="py-2 pl-3 text-[#52645A]">
                    Theo costSnapshot × số lượng thực bán (đã trừ hàng nhập lại)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-[#25352B]">Chi phí vận hành</td>
                  <td className="py-2 px-3 text-right tabular-nums">{formatVnd(report.operatingExpensesVnd)}</td>
                  <td className="py-2 pl-3 text-[#52645A]">Vật tư, bao bì, vận chuyển nội bộ &amp; nhân công thời vụ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Exception Alerts + Sell-Through by Unit */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
              <AlertTriangle className="h-4 w-4 text-[#80520C]" aria-hidden="true" />
              <span>Hàng chờ &amp; cảnh báo cần xử lý</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                <span>Đơn mới chờ nhà vườn xác nhận</span>
                <Badge tone={pendingOrdersCount > 0 ? "warning" : "success"}>{pendingOrdersCount} đơn</Badge>
              </li>
              <li className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                <span>Đề xuất hoàn tiền chờ duyệt</span>
                <Badge tone={pendingRefunds.length > 0 ? "warning" : "success"}>{pendingRefunds.length} phiếu</Badge>
              </li>
              <li className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                <span>Lô tồn quá hạn lưu hành</span>
                <Badge tone={report.expiredStockLotsCount > 0 ? "danger" : "success"}>
                  {report.expiredStockLotsCount} lô
                </Badge>
              </li>
              <li className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                <span>Công nợ quá hạn</span>
                <Badge tone={report.overdueDebtCount > 0 ? "danger" : "success"}>
                  {report.overdueDebtCount} khoản
                </Badge>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
              <Package className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Tỷ lệ tiêu thụ tách theo từng đơn vị</span>
            </h3>
            <div className="space-y-2 text-xs">
              {report.sellThroughByUnit.map((row) => (
                <div
                  key={row.unitLabel}
                  className="flex items-center justify-between rounded-[10px] border border-[#EAEFE6] px-3 py-2"
                >
                  <div>
                    <p className="font-bold text-[#25352B]">Đơn vị: {row.unitLabel}</p>
                    <p className="text-[11px] text-[#52645A]">
                      Bán {row.soldQty} / Nguồn cung {row.beginningPlusInboundQty}
                    </p>
                  </div>
                  <Badge tone="info">
                    {row.sellThroughPct !== null ? `${row.sellThroughPct}%` : "N/A"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
