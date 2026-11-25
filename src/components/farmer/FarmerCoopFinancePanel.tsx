"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, GitMerge, ShieldAlert, Users, Wallet } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { buildScopedCsvContent, triggerCsvDownload } from "@/lib/export/csv-export";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";

export function FarmerCoopFinancePanel({
  farmId,
  farmName,
}: {
  farmId: string;
  farmName: string;
}) {
  const {
    farms,
    coopPools,
    memberDeliveries,
    expenses,
    receivablesPayables,
    settleMemberDelivery,
  } = useDemoStore();

  const [checkerIdentity, setCheckerIdentity] = useState("Kế toán trưởng HTX Minh Châu");

  const scopedExpenses = expenses.filter((e) => !farmId || e.farmId === farmId || e.farmId === "farm-ba-tu-demo");
  const scopedDebts = receivablesPayables.filter(
    (d) => !farmId || d.farmId === farmId || d.farmId === "farm-ba-tu-demo",
  );

  const exportFinanceCsv = () => {
    const headers = ["Mã khoản", "Phân loại", "Diễn giải", "Số tiền (VNĐ)", "Ngày/Hạn", "Trạng thái"];
    const rows = [
      ...scopedExpenses.map((e) => [e.id, `Chi phí: ${e.category}`, e.description, e.amountVnd, e.dateIso, "Đã ghi nhận"]),
      ...scopedDebts.map((d) => [
        d.id,
        d.kind === "receivable" ? "Công nợ phải thu" : "Công nợ phải trả",
        d.counterpartyName,
        d.originalVnd - d.paidVnd,
        d.dueDateIso,
        d.status,
      ]),
    ];
    const csv = buildScopedCsvContent(headers, rows, {
      reportTitle: `Sổ quản trị tài chính nội bộ — ${farmName}`,
      periodLabel: "Tháng 10–11/2026",
      scopeLabel: farmName,
    });
    triggerCsvDownload(`naifarm-so-noi-bo-${farmId}.csv`, csv);
    notifySuccess("Đã xuất tệp CSV sổ quản trị nội bộ (UTF-8 BOM).");
  };

  return (
    <div className="space-y-6">
      {/* HTX Members & Consent Notice */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Users className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Xã viên liên kết &amp; Gom lô hợp tác xã (Pooling)</span>
            </h2>
            <p className="text-xs text-[#52645A]">
              Hồ sơ xã viên hiển thị phạm vi chia sẻ được đồng thuận; giữ nguyên truy xuất lô cha khi gom lô chung.
            </p>
          </div>
          <Badge tone="info">Phạm vi xã viên HTX</Badge>
        </div>

        {/* Coop Pools */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {coopPools.map((pool) => (
            <div key={pool.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#245B3D]">
                  <GitMerge className="h-4 w-4" aria-hidden="true" />
                  <span>{pool.title}</span>
                </span>
                <Badge tone="success">{pool.totalCommittedQty} {pool.unitLabel}</Badge>
              </div>
              <p className="mt-1.5 text-[#52645A]">
                Lô gom hỗn hợp:{" "}
                <Link href={`/trace/${pool.mixedBatchCode}`} className="font-mono font-bold text-[#245B3D] underline">
                  {pool.mixedBatchCode}
                </Link>{" "}
                · Đơn đích: {pool.targetOrderCode}
              </p>
            </div>
          ))}
        </div>

        {/* Maker-Checker Settlement Table */}
        <div className="space-y-3 border-t border-[#EAEFE6] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#25352B]">
              Phiếu giao hàng xã viên &amp; đối soát (Maker ≠ Checker)
            </h3>
            <select
              value={checkerIdentity}
              onChange={(e) => setCheckerIdentity(e.target.value)}
              aria-label="Chọn người duyệt đối soát xã viên"
              className="min-h-[36px] rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
            >
              <option value="Kế toán trưởng HTX Minh Châu">Kế toán trưởng HTX Minh Châu (Hợp lệ)</option>
              <option value="Thủ kho Hai Hùng">Thủ kho Hai Hùng (Trùng Maker — kiểm tra chặn)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#D6DED2] text-[#52645A]">
                  <th className="py-2 pr-3 font-semibold">Phiếu / Xã viên</th>
                  <th className="py-2 px-3 font-semibold">Nông sản &amp; Hạng</th>
                  <th className="py-2 px-3 text-right font-semibold">SL</th>
                  <th className="py-2 px-3 text-right font-semibold">Thực nhận sau phí</th>
                  <th className="py-2 px-3 font-semibold">Maker / Checker</th>
                  <th className="py-2 pl-3 text-right font-semibold">Đối soát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFE6]">
                {memberDeliveries.map((md) => (
                  <tr key={md.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-bold text-[#25352B]">{md.memberFarmName}</p>
                      <p className="font-mono text-[11px] text-[#52645A]">{md.id} · {md.deliveredDateIso}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold">{md.productName}</p>
                      <p className="text-[11px] text-[#52645A]">{md.gradeLabel}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {md.deliveredQty} {md.unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#245B3D]">
                      {formatVnd(md.netPayableVnd)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#52645A]">
                      Lập: {md.makerName}
                      {md.checkerName ? <span className="block">Duyệt: {md.checkerName}</span> : null}
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      {md.settlementStatus === "da_duyet_thanh_toan" ? (
                        <Badge tone="success">Đã duyệt chi</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            const res = settleMemberDelivery(md.id, checkerIdentity);
                            if (res.ok) notifySuccess(res.message);
                            else notifyError(res.message);
                          }}
                        >
                          Duyệt chi trả
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs pt-2">
          {farms.slice(0, 6).map((f) => (
            <div key={f.id} className="rounded-[10px] border border-[#EAEFE6] px-3 py-2">
              <p className="font-bold text-[#25352B]">{f.name}</p>
              <p className="text-[11px] text-[#52645A]">
                {f.ownerName} · {f.administrativeUnitName} · Đồng thuận chia sẻ HTX
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Internal Finance Ledger & CSV Export */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Wallet className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Sổ chi phí &amp; Công nợ quản trị nội bộ</span>
            </h2>
          </div>
          <Button size="sm" variant="secondary" onClick={exportFinanceCsv}>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất CSV phạm vi hiện tại</span>
          </Button>
        </div>

        <div className="flex items-start gap-2.5 rounded-[12px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-3 text-xs text-[#80520C]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Sổ quản trị nội bộ</strong> — chỉ dùng theo dõi chi phí canh tác, bao bì và công nợ tạm tính
            trong HTX/nhà vườn, <strong>không thay thế báo cáo tài chính hoặc kê khai thuế pháp lý</strong>.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#25352B]">Chi phí vận hành ({scopedExpenses.length} khoản)</h3>
            <div className="space-y-2 text-xs">
              {scopedExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                  <div>
                    <p className="font-semibold text-[#25352B]">{e.description}</p>
                    <p className="text-[11px] text-[#52645A]">{e.dateIso} · Nhóm: {e.category}</p>
                  </div>
                  <span className="tabular-nums font-bold text-[#25352B]">{formatVnd(e.amountVnd)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#25352B]">Công nợ theo dõi ({scopedDebts.length} hồ sơ)</h3>
            <div className="space-y-2 text-xs">
              {scopedDebts.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-[10px] border border-[#EAEFE6] px-3 py-2">
                  <div>
                    <p className="font-semibold text-[#25352B]">{d.counterpartyName}</p>
                    <p className="text-[11px] text-[#52645A]">
                      {d.kind === "receivable" ? "Phải thu" : "Phải trả"} · Hạn: {d.dueDateIso}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums font-bold text-[#245B3D]">
                      {formatVnd(Math.max(0, d.originalVnd - d.paidVnd))}
                    </p>
                    <Badge tone={d.status === "overdue" ? "danger" : d.status === "settled" ? "success" : "warning"}>
                      {d.status === "overdue" ? "Quá hạn" : d.status === "settled" ? "Đã tất toán" : "Đang mở"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
