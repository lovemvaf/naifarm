"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  QrCode,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { OrderStatus } from "@/types/naifarm";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirm: "Chờ nhà vườn xác nhận",
  preparing: "Đang đóng gói tại vườn",
  shipping: "Đang giao hàng",
  ready_pickup: "Chờ khách nhận tại vườn",
  completed: "Đã giao hoàn tất",
  cancelled: "Đã hủy",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const {
    orders,
    refundRequests,
    productReviews,
    updateOrderStatus,
    requestOrderRefund,
    submitProductReview,
  } = useDemoStore();

  const order = orders.find((o) => o.id === decodeURIComponent(orderId));
  const [refundReason, setRefundReason] = useState("Trái bị dập nhẹ khi vận chuyển");
  const [refundAmount, setRefundAmount] = useState(order ? Math.round(order.subtotalVnd * 0.3) : 30000);
  const [restockQty, setRestockQty] = useState(0);
  const [reviewRating, setReviewRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedReviewProductId, setSelectedReviewProductId] = useState(order?.items[0]?.productId ?? "");

  if (!order) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <EmptyState
          icon={<XCircle className="h-6 w-6" aria-hidden="true" />}
          title={`Không tìm thấy đơn hàng ${orderId}`}
          description="Mã đơn không tồn tại hoặc đã bị đặt lại trong bộ nhớ trình duyệt."
          action={
            <Link
              href="/account/orders"
              className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Về danh sách đơn hàng
            </Link>
          }
        />
      </div>
    );
  }

  const orderRefunds = refundRequests.filter((r) => r.orderId === order.id);
  const maxEligibleRefund = Math.max(
    0,
    order.subtotalVnd - (order.discountVnd ?? 0) - (order.refundedMerchandiseVnd ?? 0),
  );
  const canCancel = order.status === "pending_confirm" || order.status === "preparing";
  const alreadyReviewed = productReviews.some(
    (rv) => rv.orderId === order.id && rv.productId === selectedReviewProductId,
  );

  return (
    <div className="mx-auto max-w-[1040px] space-y-6 px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Quay lại lịch sử đơn hàng</span>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-editorial text-2xl font-bold text-[#25352B]">Đơn hàng {order.id}</h1>
            <Badge tone={order.status === "completed" ? "success" : order.status === "cancelled" ? "danger" : "info"}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#52645A]">
            {order.farmName} · Tạo lúc {order.createdAtLabel}
          </p>
        </div>

        {canCancel ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              updateOrderStatus(order.id, "cancelled", "Khách hàng hủy trước khi xuất vườn");
              notifySuccess(`Đã hủy đơn ${order.id}.`);
            }}
          >
            Hủy đơn hàng
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          {/* Recorded 2D Delivery Timeline */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold text-[#25352B]">Tiến trình xử lý &amp; giao nhận đã ghi nhận</h2>
            <ol className="space-y-3">
              {order.timeline.map((step, idx) => (
                <li key={`${step.step}-${idx}`} className="flex items-start gap-3">
                  <CheckCircle2
                    className={`mt-0.5 h-5 w-5 shrink-0 ${step.done ? "text-[#245B3D]" : "text-[#9AA89D]"}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#25352B]">{step.step}</p>
                    <p className="text-xs text-[#52645A]">{step.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {/* Items + QR links */}
          <Card className="space-y-3 p-5">
            <h2 className="text-base font-bold text-[#25352B]">Chi tiết nông sản &amp; mã lô QR</h2>
            <div className="divide-y divide-[#EAEFE6]">
              {order.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-16 w-16 rounded-[10px] border border-[#D6DED2] object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#25352B]">{item.productName}</p>
                      <p className="text-xs text-[#52645A]">
                        {item.quantity} {item.unitLabel} × {formatVnd(item.unitPriceVnd)}
                      </p>
                      {item.batchCode ? (
                        <Link
                          href={`/trace/${item.batchCode}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#245B3D] hover:underline"
                        >
                          <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Truy xuất lô {item.batchCode}</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <span className="tabular-nums text-sm font-bold text-[#25352B]">
                    {formatVnd(item.unitPriceVnd * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Verified Purchase Review */}
          {order.status === "completed" ? (
            <Card className="space-y-3 p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <Star className="h-4 w-4 text-[#D7A34D]" aria-hidden="true" />
                <span>Đánh giá từ đơn hàng đã hoàn thành</span>
              </h2>
              {alreadyReviewed ? (
                <p className="rounded-[10px] bg-[#E6F3E9] p-3 text-xs font-semibold text-[#24603B]">
                  Bạn đã gửi đánh giá xác thực cho sản phẩm trong đơn hàng này.
                </p>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = submitProductReview(
                      selectedReviewProductId,
                      order.id,
                      reviewRating,
                      reviewComment || "Nông sản tươi đúng mô tả từ vườn Đồng Nai.",
                    );
                    if (res.ok) {
                      notifySuccess(res.message);
                      setReviewComment("");
                    } else {
                      notifyError(res.message);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="rev-item" className="block text-xs font-semibold text-[#25352B]">
                        Chọn mặt hàng
                      </label>
                      <select
                        id="rev-item"
                        value={selectedReviewProductId}
                        onChange={(e) => setSelectedReviewProductId(e.target.value)}
                        className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      >
                        {order.items.map((it) => (
                          <option key={it.productId} value={it.productId}>
                            {it.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rev-star" className="block text-xs font-semibold text-[#25352B]">
                        Mức độ hài lòng (1–5 sao)
                      </label>
                      <select
                        id="rev-star"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                        className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      >
                        <option value={5}>5 sao — Rất hài lòng</option>
                        <option value={4}>4 sao — Tốt</option>
                        <option value={3}>3 sao — Bình thường</option>
                        <option value={2}>2 sao — Cần cải thiện</option>
                        <option value={1}>1 sao — Chưa đạt</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ độ tươi, đóng gói và thời gian giao..."
                    className="w-full rounded-[10px] border border-[#788A7B] bg-white p-3 text-sm"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    Gửi đánh giá đã mua
                  </Button>
                </form>
              )}
            </Card>
          ) : null}
        </div>

        <div className="space-y-5 lg:col-span-5">
          {/* Payment & Shipping Summary */}
          <Card className="space-y-3 p-5">
            <h2 className="text-base font-bold text-[#25352B]">Thanh toán &amp; nhận hàng</h2>
            <div className="space-y-1.5 text-sm text-[#52645A]">
              <p>
                <strong className="text-[#25352B]">Người nhận:</strong> {order.customerName} ({order.customerPhoneDemo})
              </p>
              <p>
                <strong className="text-[#25352B]">Địa chỉ:</strong> {order.deliveryAddress}
              </p>
              <p>
                <strong className="text-[#25352B]">Khung giờ:</strong> {order.deliverySlotLabel ?? "Theo lịch hẹn vườn"}
              </p>
            </div>
            <div className="space-y-1.5 border-t border-[#EAEFE6] pt-3 text-sm">
              <div className="flex justify-between text-[#52645A]">
                <span>Tiền hàng</span>
                <span className="tabular-nums">{formatVnd(order.subtotalVnd)}</span>
              </div>
              {order.discountVnd ? (
                <div className="flex justify-between text-[#24603B]">
                  <span>Ưu đãi</span>
                  <span className="tabular-nums">-{formatVnd(order.discountVnd)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[#52645A]">
                <span>Phí giao</span>
                <span className="tabular-nums">{formatVnd(order.shippingFeeVnd)}</span>
              </div>
              {order.refundedMerchandiseVnd ? (
                <div className="flex justify-between text-[#A32D2D]">
                  <span>Đã hoàn tiền hàng</span>
                  <span className="tabular-nums">-{formatVnd(order.refundedMerchandiseVnd)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[#EAEFE6] pt-2 text-base font-bold text-[#245B3D]">
                <span>Tổng đơn</span>
                <span className="tabular-nums">{formatVnd(order.totalVnd)}</span>
              </div>
            </div>
          </Card>

          {/* Refund Request Workflow */}
          {order.status !== "cancelled" ? (
            <Card className="space-y-3 p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <RotateCcw className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Yêu cầu hoàn tiền một phần / toàn phần</span>
              </h2>
              <p className="text-xs text-[#52645A]">
                Hạn mức hàng hóa có thể đề xuất hoàn: <strong className="tabular-nums">{formatVnd(maxEligibleRefund)}</strong>.
                Yêu cầu sẽ qua hàng chờ duyệt tách quyền (Maker–Checker).
              </p>

              {maxEligibleRefund > 0 ? (
                <form
                  className="space-y-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = requestOrderRefund(order.id, refundReason, refundAmount, restockQty);
                    if (res.ok) notifySuccess(res.message);
                    else notifyError(res.message);
                  }}
                >
                  <div>
                    <label htmlFor="rf-reason" className="block text-xs font-semibold text-[#25352B]">
                      Lý do đề xuất hoàn
                    </label>
                    <input
                      id="rf-reason"
                      type="text"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="rf-amt" className="block text-xs font-semibold text-[#25352B]">
                        Số tiền hoàn (đ)
                      </label>
                      <input
                        id="rf-amt"
                        type="number"
                        min={1000}
                        max={maxEligibleRefund}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                        className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="rf-restock" className="block text-xs font-semibold text-[#25352B]">
                        Số lượng nhập lại kho
                      </label>
                      <input
                        id="rf-restock"
                        type="number"
                        min={0}
                        value={restockQty}
                        onChange={(e) => setRestockQty(Number(e.target.value) || 0)}
                        className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs tabular-nums"
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="secondary" size="sm" className="w-full">
                    Gửi đề xuất hoàn tiền
                  </Button>
                </form>
              ) : null}

              {orderRefunds.length > 0 ? (
                <div className="space-y-2 border-t border-[#EAEFE6] pt-3">
                  {orderRefunds.map((rf) => (
                    <div key={rf.id} className="rounded-[10px] bg-[#FAF8F1] p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#25352B]">{rf.id}</span>
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
                            : "Chờ tài chính duyệt"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[#52645A]">
                        {formatVnd(rf.amountVnd)} · {rf.reason} · Lập bởi {rf.makerName}
                        {rf.checkerName ? ` · Duyệt bởi ${rf.checkerName}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
