"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, PlusCircle, Radio, RotateCcw, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { OrderStatus } from "@/types/naifarm";

const ORDER_STATUS_VI: Record<OrderStatus, string> = {
  pending_confirm: "Chờ xác nhận",
  preparing: "Đang đóng gói",
  shipping: "Đang giao",
  ready_pickup: "Chờ nhận tại vườn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export function FarmerCommercePanel({
  farmId,
  farmName,
  ownerName,
}: {
  farmId: string;
  farmName: string;
  ownerName: string;
}) {
  const {
    products,
    orders,
    refundRequests,
    livestreams,
    experienceBookings,
    toggleProductVisibility,
    updateOrderStatus,
    decideRefundRequest,
    createLivestreamSession,
  } = useDemoStore();

  const [checkerIdentity, setCheckerIdentity] = useState("Kế toán HTX Minh Châu");
  const [liveTitle, setLiveTitle] = useState("");
  const [liveTime, setLiveTime] = useState("26/11/2026 · 19:30");

  const farmProducts = useMemo(
    () => products.filter((p) => p.farmId === farmId),
    [products, farmId],
  );
  const farmOrders = useMemo(
    () => orders.filter((o) => o.farmId === farmId),
    [orders, farmId],
  );
  const farmRefunds = useMemo(
    () => refundRequests.filter((r) => r.farmId === farmId),
    [refundRequests, farmId],
  );
  const farmLives = useMemo(
    () => livestreams.filter((l) => l.farmId === farmId),
    [livestreams, farmId],
  );
  const farmBookings = useMemo(
    () => experienceBookings.filter((b) => b.farmId === farmId),
    [experienceBookings, farmId],
  );

  const customerSummaries = useMemo(() => {
    const map = new Map<
      string,
      { name: string; phone: string; count: number; netSpentVnd: number; lastOrder: string }
    >();
    for (const o of farmOrders) {
      if (o.status === "cancelled") continue;
      const key = o.customerId ?? o.customerName;
      const existing = map.get(key) ?? {
        name: o.customerName,
        phone: o.customerPhoneDemo,
        count: 0,
        netSpentVnd: 0,
        lastOrder: o.createdAtLabel,
      };
      existing.count += 1;
      existing.netSpentVnd += Math.max(0, o.subtotalVnd - (o.discountVnd ?? 0) - (o.refundedMerchandiseVnd ?? 0));
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.netSpentVnd - a.netSpentVnd);
  }, [farmOrders]);

  return (
    <div className="space-y-6">
      {/* SKU Catalog Management */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#25352B]">Danh mục nông sản đang mở bán ({farmProducts.length})</h2>
            <p className="text-xs text-[#52645A]">
              Chuyển trạng thái mở bán / tạm ngưng vụ mà không làm mất lịch sử mã lô QR.
            </p>
          </div>
          <Link
            href="/farmer/publish"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>Đăng nông sản mới (3 bước)</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#D6DED2] text-[#52645A]">
                <th className="py-2 pr-3 font-semibold">Sản phẩm</th>
                <th className="py-2 px-3 font-semibold">Mã lô</th>
                <th className="py-2 px-3 text-right font-semibold">Đơn giá</th>
                <th className="py-2 px-3 text-right font-semibold">Tồn bán</th>
                <th className="py-2 px-3 font-semibold">Trạng thái mùa</th>
                <th className="py-2 pl-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFE6]">
              {farmProducts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-3">
                    <Link href={`/products/${p.slug}`} className="font-bold text-[#25352B] hover:text-[#245B3D]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#245B3D]">{p.batchCode}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                    {formatVnd(p.priceVnd)}/{p.unitLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {p.stockKg} {p.unitLabel}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      tone={
                        p.seasonStatus === "in_season"
                          ? "success"
                          : p.seasonStatus === "pre_order"
                          ? "info"
                          : "warning"
                      }
                    >
                      {p.seasonStatus === "in_season"
                        ? "Đang vào mùa"
                        : p.seasonStatus === "pre_order"
                        ? "Đặt trước"
                        : "Tạm ngưng"}
                    </Badge>
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        toggleProductVisibility(p.id);
                        notifyInfo(`Đã chuyển trạng thái mở bán cho ${p.name}.`);
                      }}
                      className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-[8px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      {p.seasonStatus === "out_of_season" ? (
                        <>
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Mở lại</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Tạm ẩn</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Orders & Refund Maker-Checker */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="space-y-3 p-5 lg:col-span-7">
          <h3 className="text-base font-bold text-[#25352B]">Xử lý đơn hàng của vườn ({farmOrders.length})</h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {farmOrders.slice(0, 15).map((ord) => (
              <div key={ord.id} className="rounded-[12px] border border-[#EAEFE6] bg-[#FAF8F1] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/account/orders/${ord.id}`} className="font-bold text-[#245B3D] hover:underline">
                      {ord.id}
                    </Link>
                    <span className="ml-2 text-[#52645A]">
                      {ord.customerName} · {formatVnd(ord.totalVnd)}
                    </span>
                  </div>
                  <Badge tone={ord.status === "completed" ? "success" : ord.status === "cancelled" ? "danger" : "info"}>
                    {ORDER_STATUS_VI[ord.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ord.status === "pending_confirm" ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        updateOrderStatus(ord.id, "preparing");
                        notifySuccess(`Đã xác nhận soạn hàng đơn ${ord.id}.`);
                      }}
                    >
                      Xác nhận &amp; soạn hàng
                    </Button>
                  ) : null}
                  {ord.status === "preparing" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        updateOrderStatus(ord.id, ord.deliveryMethod === "pickup" ? "ready_pickup" : "shipping");
                        notifySuccess(`Đã chuyển trạng thái giao nhận cho đơn ${ord.id}.`);
                      }}
                    >
                      {ord.deliveryMethod === "pickup" ? "Báo sẵn tại vườn" : "Giao đơn đi"}
                    </Button>
                  ) : null}
                  {(ord.status === "shipping" || ord.status === "ready_pickup") ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        updateOrderStatus(ord.id, "completed");
                        notifySuccess(`Đã hoàn tất giao đơn ${ord.id}.`);
                      }}
                    >
                      Đánh dấu hoàn thành
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Refunds Maker-Checker */}
        <Card className="space-y-3 p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <RotateCcw className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Yêu cầu hoàn tiền ({farmRefunds.length})</span>
            </h3>
          </div>
          <div>
            <label htmlFor="rf-checker" className="block text-[11px] font-semibold text-[#52645A]">
              Người duyệt độc lập (Checker khác người lập Maker)
            </label>
            <select
              id="rf-checker"
              value={checkerIdentity}
              onChange={(e) => setCheckerIdentity(e.target.value)}
              className="mt-1 min-h-[36px] w-full rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
            >
              <option value="Kế toán HTX Minh Châu">Kế toán HTX Minh Châu (Hợp lệ tách quyền)</option>
              <option value="Bác Ba Tư">Bác Ba Tư (Thử tự duyệt / kiểm tra chặn)</option>
              <option value="Ngọc Linh">Ngọc Linh (Trùng khách hàng / CSKH)</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {farmRefunds.length === 0 ? (
              <p className="text-xs text-[#52645A]">Chưa có phiếu hoàn tiền nào cho vườn này.</p>
            ) : (
              farmRefunds.map((rf) => (
                <div key={rf.id} className="rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#25352B]">
                      {rf.id} · Đơn {rf.orderId}
                    </span>
                    <Badge
                      tone={
                        rf.status === "approved_by_finance"
                          ? "success"
                          : rf.status === "rejected"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {rf.status === "approved_by_finance"
                        ? "Đã duyệt hoàn"
                        : rf.status === "rejected"
                        ? "Từ chối"
                        : "Chờ duyệt"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[#52645A]">
                    {formatVnd(rf.amountVnd)} · Người lập: <strong>{rf.makerName}</strong>
                  </p>
                  <p className="text-[#52645A]">{rf.reason}</p>
                  {rf.status === "pending_maker" ? (
                    <div className="mt-2 flex gap-2">
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
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Scoped Customer Directory + Marketing Live & Bookings */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="space-y-3 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Users className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Khách hàng đã mua từ {farmName} ({customerSummaries.length})</span>
          </h3>
          <div className="space-y-2 text-xs">
            {customerSummaries.slice(0, 6).map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2"
              >
                <div>
                  <p className="font-bold text-[#25352B]">{c.name}</p>
                  <p className="text-[11px] text-[#52645A]">
                    {c.phone} · {c.count} đơn · Gần nhất: {c.lastOrder}
                  </p>
                </div>
                <span className="tabular-nums font-bold text-[#245B3D]">{formatVnd(c.netSpentVnd)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Radio className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Phiên phát sóng &amp; Lịch tham quan ({farmLives.length} phiên · {farmBookings.length} đoàn)</span>
          </h3>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!liveTitle.trim()) return;
              createLivestreamSession({
                title: liveTitle.trim(),
                farmId,
                scheduleLabel: liveTime,
                hostYouth: "Thanh niên số Đồng Nai",
                pinnedProductId: farmProducts[0]?.id ?? "P01",
                summary: `Phiên giới thiệu nông sản tại ${farmName} cùng ${ownerName}.`,
              });
              setLiveTitle("");
              notifySuccess("Đã lên lịch phiên livestream tại vườn.");
            }}
          >
            <input
              type="text"
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
              placeholder="Tên phiên phát sóng thu hoạch mới..."
              className="min-h-[38px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary">
              Lên lịch phát
            </Button>
          </form>

          <div className="space-y-2 text-xs">
            {farmLives.map((live) => (
              <div key={live.id} className="rounded-[10px] border border-[#EAEFE6] px-3 py-2">
                <p className="font-bold text-[#25352B]">{live.title}</p>
                <p className="text-[11px] text-[#52645A]">{live.scheduleLabel} · Dẫn cùng: {live.hostYouth}</p>
              </div>
            ))}
            {farmBookings.map((b) => (
              <div key={b.id} className="rounded-[10px] bg-[#EAF0E5] px-3 py-2">
                <p className="font-bold text-[#245B3D]">Khách tham quan: {b.guestName} ({b.guestCount} người)</p>
                <p className="text-[11px] text-[#52645A]">{b.packageTitle} · Ngày {b.dateLabel}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
