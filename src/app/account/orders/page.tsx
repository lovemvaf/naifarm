"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck, RefreshCw, Search } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { OrderStatus } from "@/types/naifarm";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirm: "Chờ nhà vườn xác nhận",
  preparing: "Đang đóng gói",
  shipping: "Đang giao hàng",
  ready_pickup: "Chờ nhận tại vườn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_TONES: Record<OrderStatus, "warning" | "info" | "success" | "danger"> = {
  pending_confirm: "warning",
  preparing: "info",
  shipping: "info",
  ready_pickup: "info",
  completed: "success",
  cancelled: "danger",
};

export default function OrdersListPage() {
  const { orders, addToCart } = useDemoStore();
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [searchText, setSearchText] = useState("");

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      const itemsMatch = o.items.some((i) => i.productName.toLowerCase().includes(q));
      return (
        o.id.toLowerCase().includes(q) ||
        o.farmName.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        itemsMatch
      );
    });
  }, [orders, statusFilter, searchText]);

  return (
    <div className="mx-auto max-w-[1160px] space-y-6 px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-editorial text-2xl font-bold text-[#25352B] md:text-3xl">
            Lịch sử &amp; theo dõi đơn hàng ({orders.length})
          </h1>
          <p className="mt-1 text-sm text-[#52645A]">
            Theo dõi trạng thái chuẩn bị tại vườn, mã lô truy xuất, yêu cầu hoàn tiền hoặc đặt lại nhanh.
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[12px] bg-[#245B3D] px-4 text-sm font-semibold text-white hover:bg-[#19472E]"
        >
          <span>Mua thêm nông sản</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo mã đơn NF-ORD-..., tên sản phẩm hoặc tên nhà vườn..."
            aria-label="Tìm kiếm đơn hàng"
            className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending_confirm", "preparing", "shipping", "ready_pickup", "completed", "cancelled"] as const).map(
            (st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`min-h-[34px] cursor-pointer rounded-full px-3.5 text-xs font-semibold ${
                    active
                      ? "bg-[#245B3D] text-white"
                      : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]"
                  }`}
                >
                  {st === "all" ? "Tất cả" : STATUS_LABELS[st]}
                </button>
              );
            },
          )}
        </div>
      </Card>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<PackageCheck className="h-6 w-6" aria-hidden="true" />}
          title="Không có đơn hàng khớp điều kiện lọc"
          description="Thử chuyển sang tất cả trạng thái hoặc tìm theo mã đơn khác."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.slice(0, 40).map((order) => (
            <Card key={order.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAEFE6] pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-base font-bold text-[#245B3D] hover:underline"
                    >
                      {order.id}
                    </Link>
                    <Badge tone={STATUS_TONES[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                    {order.parentOrderId ? (
                      <Badge tone="neutral">Tách theo vườn · {order.parentOrderId}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {order.farmName} · {order.createdAtLabel} · {order.deliverySlotLabel ?? order.deliveryAddress}
                  </p>
                </div>
                <p className="tabular-nums text-base font-bold text-[#25352B]">{formatVnd(order.totalVnd)}</p>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  {order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-12 w-12 rounded-[10px] border border-[#D6DED2] object-cover"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-[#25352B]">{item.productName}</p>
                        <p className="text-[#52645A]">
                          {item.quantity} {item.unitLabel} · {formatVnd(item.unitPriceVnd)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      let added = 0;
                      for (const item of order.items) {
                        const res = addToCart(item.productId, item.quantity);
                        if (res.ok) added += 1;
                      }
                      if (added > 0) notifySuccess(`Đã thêm ${added} mặt hàng từ đơn ${order.id} vào giỏ.`);
                      else notifyError("Không thể đặt lại do sản phẩm tạm ngưng hoặc hết tồn.");
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Mua lại</span>
                  </Button>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#19472E]"
                  >
                    <span>Chi tiết đơn</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
