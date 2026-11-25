"use client";

import React, { useMemo, useState } from "react";
import { Boxes, ClipboardCheck, Truck } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { InventoryMovement } from "@/types/naifarm";

export function FarmerInventoryProcurementPanel({
  farmId,
  actorName,
}: {
  farmId: string;
  actorName: string;
}) {
  const {
    warehouses,
    warehouseStocks,
    inventoryMovements,
    products,
    suppliers,
    purchaseOrders,
    recordInventoryMovement,
    advancePurchaseOrder,
  } = useDemoStore();

  const farmWarehouses = useMemo(
    () => warehouses.filter((w) => w.farmId === farmId || w.id === "WH-HTX-01"),
    [warehouses, farmId],
  );
  const warehouseIds = new Set(farmWarehouses.map((w) => w.id));
  const scopedStocks = warehouseStocks.filter((s) => warehouseIds.has(s.warehouseId));

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(farmWarehouses[0]?.id ?? warehouses[0]?.id ?? "");
  const [selectedProductId, setSelectedProductId] = useState(
    products.find((p) => p.farmId === farmId)?.id ?? products[0]?.id ?? "P01",
  );
  const [movementType, setMovementType] = useState<InventoryMovement["type"]>("inbound");
  const [quantityDelta, setQuantityDelta] = useState(10);
  const [reason, setReason] = useState("");

  const refMs = Date.parse("2026-11-25T00:00:00Z");

  return (
    <div className="space-y-6">
      {/* Warehouses & Stock Buckets + FEFO */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Boxes className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Tồn kho theo lô, ô kệ &amp; cảnh báo cận hạn (FEFO)</span>
            </h2>
            <p className="text-xs text-[#52645A]">
              Khả dụng thực = Thực tế − Đặt giữ − Tạm khóa. Không cộng lẫn các đơn vị tính (kg, hộp, chai).
            </p>
          </div>
          <Badge tone="neutral">{farmWarehouses.length} kho liên kết</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#D6DED2] text-[#52645A]">
                <th className="py-2 pr-3 font-semibold">Kho / Ô kệ</th>
                <th className="py-2 px-3 font-semibold">Mã lô &amp; Mặt hàng</th>
                <th className="py-2 px-3 text-right font-semibold">Thực tế</th>
                <th className="py-2 px-3 text-right font-semibold">Đặt giữ</th>
                <th className="py-2 px-3 text-right font-semibold">Tạm khóa / Cách ly</th>
                <th className="py-2 px-3 text-right font-semibold">Khả dụng thực</th>
                <th className="py-2 pl-3 font-semibold">Hạn FEFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFE6]">
              {scopedStocks.map((st) => {
                const prod = products.find((p) => p.id === st.productId);
                const available = Math.max(0, st.onHandQty - st.reservedQty - st.blockedQty);
                const daysLeft = st.expiryDateIso
                  ? Math.round((Date.parse(`${st.expiryDateIso}T00:00:00Z`) - refMs) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <tr key={st.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-bold text-[#25352B]">{st.warehouseId}</p>
                      <p className="text-[11px] text-[#52645A]">Kệ: {st.binCode}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-[#25352B]">{prod?.name ?? st.productId}</p>
                      <p className="font-mono text-[11px] text-[#245B3D]">{st.batchCode}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {st.onHandQty} {st.unitLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{st.reservedQty}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#A32D2D]">
                      {st.blockedQty + st.quarantineQty}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#245B3D]">
                      {available} {st.unitLabel}
                    </td>
                    <td className="py-2.5 pl-3">
                      {daysLeft === null ? (
                        <span className="text-[#52645A]">Không đặt hạn</span>
                      ) : daysLeft < 0 ? (
                        <Badge tone="danger">Quá hạn ({st.expiryDateIso})</Badge>
                      ) : daysLeft <= 10 ? (
                        <Badge tone="warning">Cận hạn {daysLeft} ngày</Badge>
                      ) : (
                        <Badge tone="success">{st.expiryDateIso}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inventory Movement Form */}
        <form
          className="grid grid-cols-1 gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 md:grid-cols-12"
          onSubmit={(e) => {
            e.preventDefault();
            const signedDelta =
              movementType === "outbound" || movementType === "loss"
                ? -Math.abs(quantityDelta)
                : movementType === "inbound" || movementType === "return_restock"
                ? Math.abs(quantityDelta)
                : quantityDelta;

            const res = recordInventoryMovement({
              warehouseId: selectedWarehouseId,
              productId: selectedProductId,
              type: movementType,
              quantityDelta: signedDelta,
              reason,
              actorName,
            });
            if (res.ok) {
              notifySuccess(res.message);
              setReason("");
            } else {
              notifyError(res.message);
            }
          }}
        >
          <div className="md:col-span-3">
            <label htmlFor="mv-wh" className="block text-[11px] font-semibold text-[#25352B]">
              Kho xử lý
            </label>
            <select
              id="mv-wh"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="mt-1 min-h-[38px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
            >
              {farmWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label htmlFor="mv-prod" className="block text-[11px] font-semibold text-[#25352B]">
              Sản phẩm
            </label>
            <select
              id="mv-prod"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 min-h-[38px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
            >
              {products.slice(0, 25).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="mv-type" className="block text-[11px] font-semibold text-[#25352B]">
              Loại phiếu
            </label>
            <select
              id="mv-type"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as InventoryMovement["type"])}
              className="mt-1 min-h-[38px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
            >
              <option value="inbound">Nhập kho</option>
              <option value="outbound">Xuất kho</option>
              <option value="transfer">Chuyển kho nội bộ</option>
              <option value="adjustment">Kiểm kê điều chỉnh</option>
              <option value="loss">Hao hụt</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="mv-qty" className="block text-[11px] font-semibold text-[#25352B]">
              SL
            </label>
            <input
              id="mv-qty"
              type="number"
              value={quantityDelta}
              onChange={(e) => setQuantityDelta(Number(e.target.value) || 0)}
              className="mt-1 min-h-[38px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2 text-xs tabular-nums"
            />
          </div>
          <div className="md:col-span-3 flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="mv-reason" className="block text-[11px] font-semibold text-[#25352B]">
                Lý do (bắt buộc)
              </label>
              <input
                id="mv-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Thu hoạch lứa sáng..."
                className="mt-1 min-h-[38px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
              />
            </div>
            <Button type="submit" size="sm" variant="primary">
              Ghi sổ kho
            </Button>
          </div>
        </form>

        <div className="space-y-1.5 text-xs">
          <p className="font-bold text-[#25352B]">Lịch sử nhập/xuất gần nhất ({inventoryMovements.length})</p>
          {inventoryMovements.slice(0, 5).map((m) => (
            <div key={m.id} className="flex flex-wrap justify-between gap-2 rounded-[8px] bg-[#FAF8F1] px-3 py-1.5">
              <span>
                <strong>{m.id}</strong> · {m.batchCode} · {m.reason}
                {m.isInternalTransfer ? " (Chuyển nội bộ — không tính bán)" : ""}
              </span>
              <span className="tabular-nums font-bold text-[#245B3D]">
                {m.quantityDelta >= 0 ? "+" : ""}
                {m.quantityDelta} {m.unitLabel}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Suppliers & Procurement PO */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="space-y-3 p-5 lg:col-span-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Truck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Nhà cung ứng vật tư nông nghiệp ({suppliers.length})</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            {suppliers.map((sup) => (
              <div key={sup.id} className="rounded-[10px] border border-[#EAEFE6] p-3">
                <p className="font-bold text-[#25352B]">{sup.name}</p>
                <p className="text-[#245B3D]">{sup.category} · {sup.administrativeUnitName}</p>
                <p className="mt-1 text-[#52645A]">{sup.ratingNote}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5 lg:col-span-7">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <ClipboardCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Đơn mua vật tư &amp; QC đầu vào ({purchaseOrders.length})</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#25352B]">
                      {po.id} · {po.itemName} ({po.quantity} {po.unitLabel})
                    </p>
                    <p className="text-[#52645A]">
                      {po.supplierName} · Tổng: <strong className="tabular-nums">{formatVnd(po.totalVnd)}</strong> · Dự
                      kiến: {po.expectedDateIso}
                    </p>
                  </div>
                  <Badge
                    tone={
                      po.status === "received_qc_pass"
                        ? "success"
                        : po.status === "qc_rejected"
                        ? "danger"
                        : po.status === "po_approved"
                        ? "info"
                        : "warning"
                    }
                  >
                    {po.status === "received_qc_pass"
                      ? "Đã nhập · Đạt QC"
                      : po.status === "qc_rejected"
                      ? "Không đạt QC"
                      : po.status === "po_approved"
                      ? "Đã duyệt PO"
                      : "Nháp RFQ"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {po.status === "rfq_draft" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        advancePurchaseOrder(po.id, "po_approved", "Đã chốt đơn giá & ngày giao");
                        notifySuccess(`Đã duyệt đơn mua ${po.id}.`);
                      }}
                    >
                      Duyệt đơn mua (PO)
                    </Button>
                  ) : null}
                  {po.status === "po_approved" ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          advancePurchaseOrder(po.id, "received_qc_pass", "Kiểm tra bao bì & hạn dùng đạt chuẩn");
                          notifySuccess(`Đã nghiệm thu đạt QC cho ${po.id}.`);
                        }}
                      >
                        Nhận hàng · Đạt QC
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          advancePurchaseOrder(po.id, "qc_rejected", "Sai quy cách cần đổi lô");
                          notifyError(`Đã ghi nhận trả lô ${po.id} do không đạt QC.`);
                        }}
                      >
                        Từ chối QC
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
