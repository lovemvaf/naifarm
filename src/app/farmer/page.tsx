"use client";

import Image from "next/image";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  FilePlus2,
  HandHelping,
  MapPin,
  PackageCheck,
  QrCode,
  Radio,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import type { DemoOrder, OrderStatus } from "@/types/naifarm";
import { assetUrl } from "@/lib/storage/assets";

type FarmerTab = "orders" | "diary" | "support" | "pass";

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "warning" | "info" | "success" | "danger" | "neutral" }
> = {
  pending_confirm: { label: "Chờ nhà vườn xác nhận", tone: "warning" },
  preparing: { label: "Đang đóng gói tại vườn", tone: "info" },
  shipping: { label: "Đang giao hàng", tone: "info" },
  ready_pickup: { label: "Sẵn sàng nhận tại vườn", tone: "success" },
  completed: { label: "Đã hoàn thành", tone: "success" },
  cancelled: { label: "Đã hủy đơn", tone: "danger" },
};

const emptySubscribe = () => () => {};

const QUICK_CANCEL_REASONS = [
  "Vườn vừa hết lứa hái chín hôm nay, hẹn lứa sau.",
  "Trời mưa lớn chưa kịp cắt trái sáng nay.",
  "Khách đề nghị đổi ngày nhận hàng.",
];

export default function FarmerWorkspacePage() {
  const {
    hydrated,
    farms,
    products,
    batches,
    orders,
    missions,
    supportRequests,
    profile,
    role,
    setActiveWorkspace,
    updateOrderStatus,
    addHarvestDiaryEvent,
    submitSupportRequest,
    confirmMissionByFarmer,
  } = useDemoStore();

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [activeTab, setActiveTab] = useState<FarmerTab>("orders");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState(QUICK_CANCEL_REASONS[0]);

  // Harvest Diary form
  const [diaryBatchCode, setDiaryBatchCode] = useState("NF-DEMO-001");
  const [diaryTitle, setDiaryTitle] = useState("Kiểm tra độ chín & hái lứa mới sáng nay");
  const [diaryDetail, setDiaryDetail] = useState(
    "Nhà vườn tự khai: thu hái thủ công vào sáng sớm, xếp sọt thoáng và đóng gói theo đơn đặt."
  );

  // Youth Support request form (S12)
  const [reqNeedType, setReqNeedType] = useState("Chụp ảnh & đăng bán sản phẩm mới");
  const [reqTime, setReqTime] = useState("Sáng Chủ Nhật 29/11/2026 (08:30)");
  const [reqMode, setReqMode] = useState<"Tại vườn" | "Online">("Tại vườn");
  const [reqNote, setReqNote] = useState(
    "Nhờ các bạn thanh niên hướng dẫn cập nhật thêm nhật ký QR và chụp ảnh sọt chôm chôm mới hái."
  );

  useEffect(() => {
    setActiveWorkspace("W02");
  }, [setActiveWorkspace]);

  const siteOrigin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );
  const isAdminViewer = role === "admin";
  const selectableFarms = isAdminViewer
    ? farms
    : farms.filter((farm) => farm.id === profile?.farmId);
  const activeFarmId =
    selectedFarmId || profile?.farmId || (isAdminViewer ? farms[0]?.id ?? "" : "");
  const activeFarm = selectableFarms.find((farm) => farm.id === activeFarmId) ?? selectableFarms[0];
  const farmProducts = activeFarm
    ? products.filter((p) => p.farmId === activeFarm.id)
    : [];
  const visibleOrders = activeFarm
    ? showAllOrders
      ? orders
      : orders.filter((o) => o.farmId === activeFarm.id)
    : [];
  const farmMissions = activeFarm
    ? missions.filter((m) => m.farmId === activeFarm.id || m.status === "submitted")
    : [];
  const pendingConfirmMissions = farmMissions.filter((m) => m.status === "submitted");
  const farmBatches = activeFarm
    ? batches.filter((b) => b.farmId === activeFarm.id)
    : [];
  const effectiveDiaryBatchCode = farmBatches.some(
    (b) => b.batchCode === diaryBatchCode
  )
    ? diaryBatchCode
    : farmBatches[0]?.batchCode ?? "";

  const handleConfirmDeliverable = async (missionId: string, title: string) => {
    try {
      await confirmMissionByFarmer(missionId);
      toast.success(`Đã xác nhận kết quả "${title}". Điều phối viên W04 có thể duyệt giờ công.`);
    } catch {
      toast.error("Không xác nhận được kết quả. Vui lòng thử lại.");
    }
  };

  const handleAdvanceOrder = async (order: DemoOrder) => {
    try {
      if (order.status === "pending_confirm") {
        await updateOrderStatus(order.id, "preparing");
        toast.success(`Đơn ${order.id} đã chuyển sang "Đang đóng gói tại vườn".`);
      } else if (order.status === "preparing") {
        const nextStatus: OrderStatus =
          order.deliveryMethod === "pickup" ? "ready_pickup" : "shipping";
        await updateOrderStatus(order.id, nextStatus);
        toast.success(
          nextStatus === "ready_pickup"
            ? `Đơn ${order.id} đã sẵn sàng để khách nhận tại vườn.`
            : `Đơn ${order.id} đã bàn giao vận chuyển.`
        );
      } else if (order.status === "shipping" || order.status === "ready_pickup") {
        await updateOrderStatus(order.id, "completed");
        toast.success(`Đơn ${order.id} đã hoàn thành!`);
      }
    } catch {
      toast.error("Không cập nhật được trạng thái đơn. Vui lòng thử lại.");
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    if (!cancelReason.trim()) {
      toast.error("Bác vui lòng chọn hoặc nhập lý do hủy đơn.");
      return;
    }
    try {
      await updateOrderStatus(cancelOrderId, "cancelled", cancelReason.trim());
      toast.success(`Đã cập nhật hủy đơn ${cancelOrderId} kèm lý do cho khách hàng.`);
      setCancelOrderId(null);
    } catch {
      toast.error("Không hủy được đơn. Vui lòng thử lại.");
    }
  };

  const handleAddDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() || !diaryDetail.trim()) {
      toast.error("Bác vui lòng nhập tiêu đề và nội dung mốc nhật ký.");
      return;
    }
    if (!effectiveDiaryBatchCode) {
      toast.error("Chưa có mã lô hàng cho vườn này.");
      return;
    }
    try {
      const now = new Date();
      const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} (Mới ghi)`;
      await addHarvestDiaryEvent(effectiveDiaryBatchCode, {
        dateLabel,
        title: diaryTitle.trim(),
        detail: diaryDetail.trim(),
        actorCategory: `${activeFarm.ownerName} (Chủ vườn W02)`,
        sourceDeclaration: "Nhà vườn tự khai",
        photo: "stitch/stitch-53.webp",
      });
      toast.success(`Đã ghi thêm mốc nhật ký vào lô ${effectiveDiaryBatchCode}.`);
    } catch {
      toast.error("Không ghi được nhật ký. Vui lòng thử lại.");
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await submitSupportRequest({
        farmId: activeFarm.id,
        farmName: activeFarm.name,
        title: `${reqNeedType} — ${activeFarm.name}`,
        needType: reqNeedType,
        preferredTime: reqTime,
        locationMode: reqMode,
        note: reqNote.trim() || "Cần thanh niên hỗ trợ thao tác số hóa sản phẩm.",
      });
      toast.success(`Đã gửi yêu cầu ${created.id} tới Điều phối viên W04.`);
    } catch {
      toast.error("Không gửi được yêu cầu. Vui lòng thử lại.");
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-lg text-muted">
        Đang mở Không gian Nhà vườn...
      </div>
    );
  }

  if (!activeFarm) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <Card className="space-y-3 p-6">
          <h1 className="text-xl font-bold text-foreground">Tài khoản chưa được gắn với nhà vườn</h1>
          <p className="text-base text-muted">
            Hồ sơ nhà nông cần được quản trị viên gắn mã nhà vườn trước khi đăng bán và xử lý đơn.
          </p>
          <Link
            href="/account"
            className="inline-flex min-h-[44px] items-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-white"
          >
            Về Không gian Cá nhân
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W02"
      title="Không gian Nhà vườn"
      subtitle="Chữ to, nút bấm rõ — tự đăng nông sản, xác nhận đơn và ghi nhật ký mùa vụ"
      scopeBadge="Dữ liệu Supabase — Tự quản nhà vườn"
      navItems={[
        {
          label: "Đăng bán nhanh (3 bước)",
          href: "/farmer/publish",
          icon: <Camera className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: `Đơn hàng cần xử lý (${visibleOrders.length})`,
          href: "#orders",
          active: activeTab === "orders",
          onClick: () => setActiveTab("orders"),
          icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Nhật ký thu hoạch",
          href: "#diary",
          active: activeTab === "diary",
          onClick: () => setActiveTab("diary"),
          icon: <FilePlus2 className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: `Thanh niên hỗ trợ (${pendingConfirmMissions.length})`,
          href: "#support",
          active: activeTab === "support",
          onClick: () => setActiveTab("support"),
          icon: <HandHelping className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Thẻ Nhà vườn & QR",
          href: "#pass",
          active: activeTab === "pass",
          onClick: () => setActiveTab("pass"),
          icon: <QrCode className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Livestream tại vườn",
          href: "/live",
          icon: <Radio className="h-5 w-5" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6 text-[17px] leading-[1.6]">
        {/* Farm Switcher + Giant Primary CTA */}
        <Card className="border-2 border-primary/25 bg-gradient-to-br from-white to-background p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Giao diện U50+ Dễ đọc</Badge>
                <Badge tone={activeFarm.ocopStatus === "coop_checked_demo" ? "info" : "warning"}>
                  {activeFarm.ocopLabel}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Xin chào, {activeFarm.ownerName} · {activeFarm.name}
              </h2>
              <p className="inline-flex items-center gap-1.5 text-base text-muted">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {activeFarm.addressLabel} · Diện tích {activeFarm.areaHa} ha
              </p>

              {selectableFarms.length > 1 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-sm font-semibold text-muted">Đổi vườn đang xem:</span>
                  {selectableFarms.map((farm) => (
                    <button
                      key={farm.id}
                      type="button"
                      onClick={() => {
                        setSelectedFarmId(farm.id);
                        const firstBatch = batches.find((b) => b.farmId === farm.id);
                        if (firstBatch) setDiaryBatchCode(firstBatch.batchCode);
                      }}
                      className={`min-h-[44px] rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer ${
                        activeFarm?.id === farm.id
                          ? "bg-primary text-white"
                          : "border border-border bg-white text-foreground hover:bg-surface-soft"
                      }`}
                    >
                      {farm.ownerName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/farmer/publish"
                className="inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-[14px] bg-primary px-7 py-3.5 text-[18px] font-bold text-white shadow-[0_6px_16px_rgba(36,91,61,0.22)] hover:bg-primary-hover"
              >
                <Camera className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span>Chụp ảnh & Nói để bán</span>
              </Link>
              <Link
                href="/live"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-primary bg-white px-5 text-base font-semibold text-primary hover:bg-surface-soft"
              >
                <Radio className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Mở Livestream tại vườn</span>
              </Link>
              <Link
                href={`/farms/${activeFarm.slug}`}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-border bg-white px-5 text-base font-semibold text-foreground hover:bg-surface-soft"
              >
                <span>Xem trang vườn ngoài Chợ</span>
              </Link>
            </div>
          </div>
        </Card>

        {/* Highlight Banner if Youth Deliverable is awaiting Farm confirmation */}
        {pendingConfirmMissions.length > 0 && activeTab !== "support" ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-[16px] border-2 border-accent bg-warning-bg p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">
                Có {pendingConfirmMissions.length} việc hỗ trợ từ Thanh niên đang chờ bác xác nhận
              </p>
              <p className="text-sm text-muted">
                {pendingConfirmMissions[0].assigneeName} đã nộp ảnh và bàn giao công việc{" "}
                <span className="font-semibold">{pendingConfirmMissions[0].id}</span>.
              </p>
            </div>
            <Button variant="gold" size="lg" onClick={() => setActiveTab("support")}>
              Kiểm tra & Xác nhận ngay
            </Button>
          </div>
        ) : null}

        {/* TAB 1: ORDERS (S11) */}
        {activeTab === "orders" ? (
          <section id="orders" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-foreground">
                Đơn đặt mua cần xử lý ({visibleOrders.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAllOrders((prev) => !prev)}
                className="min-h-[44px] rounded-[10px] border border-border bg-white px-4 text-sm font-semibold text-primary hover:bg-surface-soft cursor-pointer"
              >
                {showAllOrders ? "Chỉ xem đơn của vườn đang chọn" : "Xem tất cả đơn trên hệ thống"}
              </button>
            </div>

            {visibleOrders.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              return (
                <Card key={order.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-soft pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums text-lg font-bold text-primary">
                          {order.id}
                        </span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                      <p className="mt-1 text-base text-foreground">
                        Khách hàng: <span className="font-semibold">{order.customerName}</span> ·{" "}
                        {order.createdAtLabel}
                      </p>
                      <p className="text-sm text-muted">
                        Hình thức:{" "}
                        <span className="font-semibold text-foreground">
                          {order.deliveryMethod === "pickup"
                            ? "Khách tới nhận tại vườn (0 đ)"
                            : `Giao tận nơi (${order.deliveryAddress})`}
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted">Tổng tiền thu dự kiến (COD)</p>
                      <p className="tabular-nums text-2xl font-bold text-primary">
                        {formatVnd(order.totalVnd)}
                      </p>
                    </div>
                  </div>

                  <ul className="my-4 space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-background px-4 py-2.5 text-base"
                      >
                        <span className="font-medium text-foreground">
                          {item.productName} × {item.quantity} ({item.unitLabel})
                        </span>
                        <span className="tabular-nums font-semibold text-foreground">
                          {formatVnd(item.quantity * item.unitPriceVnd)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.cancelReason ? (
                    <div className="mb-4 rounded-[12px] border border-danger/30 bg-danger-bg p-3 text-base text-danger">
                      <span className="font-bold">Lý do đã hủy: </span>
                      {order.cancelReason}
                    </div>
                  ) : null}

                  {order.status !== "completed" && order.status !== "cancelled" ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        variant="farmer"
                        onClick={() => handleAdvanceOrder(order)}
                        className="flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        {order.status === "pending_confirm"
                          ? "Xác nhận nhận đơn này"
                          : order.status === "preparing"
                          ? order.deliveryMethod === "pickup"
                            ? "Báo khách ra vườn nhận"
                            : "Giao cho xe vận chuyển"
                          : "Xác nhận đã giao xong"}
                      </Button>

                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                          setCancelOrderId(order.id);
                          setCancelReason(QUICK_CANCEL_REASONS[0]);
                        }}
                      >
                        <XCircle className="h-5 w-5" aria-hidden="true" />
                        <span>Không nhận / Hủy đơn</span>
                      </Button>
                    </div>
                  ) : null}

                  {cancelOrderId === order.id ? (
                    <div className="mt-4 space-y-3 rounded-[14px] border border-danger/35 bg-danger-bg/60 p-4">
                      <p className="font-bold text-danger">
                        Chọn hoặc nhập lý do gửi khách hàng cho đơn {order.id}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_CANCEL_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setCancelReason(r)}
                            className={`min-h-[44px] rounded-full border px-3.5 text-sm font-medium cursor-pointer ${
                              cancelReason === r
                                ? "border-danger bg-danger text-white"
                                : "border-border bg-white text-foreground"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={2}
                        aria-label="Lý do hủy đơn"
                        className="w-full rounded-[12px] border border-border bg-white p-3 text-base text-foreground"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="destructive" size="lg" onClick={handleConfirmCancel}>
                          Xác nhận hủy đơn
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => setCancelOrderId(null)}>
                          Quay lại
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </section>
        ) : null}

        {/* TAB 2: SUPPORT & DELIVERABLE CONFIRMATION (S12, S14-farm) */}
        {activeTab === "support" ? (
          <section id="support" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-xl font-bold text-foreground">
                  Xác nhận kết quả Thanh niên hỗ trợ (Lớp 1)
                </h3>
              </div>
              <p className="mb-4 text-sm text-muted">
                Quy định 2 lớp minh bạch: Chủ vườn xác nhận đã nhận đủ ảnh/tem/bài đăng tại đây
                trước khi Điều phối viên (W04) được phép duyệt cộng giờ cống hiến.
              </p>

              <div className="space-y-4">
                {farmMissions.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[14px] border border-border bg-background p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="tabular-nums text-sm font-bold text-primary">{m.id}</span>
                      <Badge
                        tone={
                          m.status === "coordinator_approved"
                            ? "success"
                            : m.status === "farm_accepted"
                            ? "info"
                            : m.status === "submitted"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {m.status === "submitted"
                          ? "Chờ bác xác nhận đã nhận kết quả"
                          : m.status === "farm_accepted"
                          ? "Bác đã xác nhận · Chờ W04 duyệt giờ"
                          : m.status === "coordinator_approved"
                          ? "Hoàn tất · Đã cộng giờ Youth Pass"
                          : "Đang thực hiện"}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-foreground">{m.title}</h4>
                    <p className="text-sm text-muted">
                      Tình nguyện viên:{" "}
                      <span className="font-semibold text-foreground">
                        {m.assigneeName ?? "Chưa phân công"}
                      </span>{" "}
                      · Dự kiến {m.expectedHours} giờ
                    </p>
                    <p className="text-sm text-foreground">{m.deliverableSummary}</p>
                    {m.evidenceImage ? (
                      <Image
                        src={assetUrl(m.evidenceImage)}
                        alt={`Minh chứng bàn giao ${m.id}`}
                        className="h-40 w-full rounded-[10px] object-cover"
                        width={512}
                        height={279}
                      />
                    ) : null}
                    {m.evidenceNote ? (
                      <p className="rounded-[10px] bg-white px-3 py-2 text-sm text-muted">
                        Ghi chú bàn giao: {m.evidenceNote}
                      </p>
                    ) : null}

                    {m.status === "submitted" ? (
                      <Button
                        variant="farmer"
                        className="w-full"
                        onClick={() => handleConfirmDeliverable(m.id, m.title)}
                      >
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        <span>Xác nhận tôi đã nhận đủ kết quả này</span>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <HandHelping className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-xl font-bold text-foreground">Gửi yêu cầu Thanh niên hỗ trợ mới</h3>
              </div>

              <form onSubmit={handleSendSupport} className="space-y-4">
                <div>
                  <label htmlFor="need-type" className="mb-1.5 block font-semibold text-foreground">
                    Bác cần hỗ trợ việc gì?
                  </label>
                  <select
                    id="need-type"
                    value={reqNeedType}
                    onChange={(e) => setReqNeedType(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-3.5 text-base text-foreground"
                  >
                    <option>Chụp ảnh & đăng bán sản phẩm mới</option>
                    <option>Dán tem QR & hướng dẫn ghi nhật ký</option>
                    <option>Quay phiên Livestream cuối tuần tại vườn</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="req-time" className="mb-1.5 block font-semibold text-foreground">
                    Thời gian thuận tiện tại vườn
                  </label>
                  <input
                    id="req-time"
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-3.5 text-base text-foreground"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block font-semibold text-foreground">Hình thức gặp</span>
                  <div className="flex gap-3">
                    {(["Tại vườn", "Online"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setReqMode(mode)}
                        className={`min-h-[48px] flex-1 rounded-[12px] border text-base font-semibold cursor-pointer ${
                          reqMode === mode
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-foreground"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="req-note" className="mb-1.5 block font-semibold text-foreground">
                    Lời nhắn thêm cho đội Thanh niên
                  </label>
                  <textarea
                    id="req-note"
                    rows={3}
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                    className="w-full rounded-[12px] border border-border bg-white p-3.5 text-base text-foreground"
                  />
                </div>

                <Button type="submit" variant="farmer" className="w-full">
                  Gửi yêu cầu tới Điều phối viên (W04)
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="mb-2 text-base font-bold text-foreground">
                  Yêu cầu đã gửi gần đây ({supportRequests.length})
                </h4>
                <ul className="space-y-2">
                  {supportRequests.map((req) => (
                    <li
                      key={req.id}
                      className="rounded-[12px] border border-border bg-background p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-primary tabular-nums">{req.id}</span>
                        <Badge tone="info">{req.status}</Badge>
                      </div>
                      <p className="font-semibold text-foreground">{req.title}</p>
                      <p className="text-muted">
                        {req.preferredTime} · {req.locationMode}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>
        ) : null}

        {/* TAB 3: HARVEST DIARY (S30) */}
        {activeTab === "diary" ? (
          <section id="diary" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h3 className="mb-4 text-xl font-bold text-foreground">
                Ghi thêm mốc Nhật ký thu hoạch (tự đồng bộ tem QR)
              </h3>
              <form onSubmit={handleAddDiary} className="space-y-4">
                <div>
                  <label htmlFor="diary-batch" className="mb-1.5 block font-semibold text-foreground">
                    Chọn mã lô nông sản
                  </label>
                  <select
                    id="diary-batch"
                    value={effectiveDiaryBatchCode}
                    onChange={(e) => setDiaryBatchCode(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-3.5 text-base text-foreground"
                  >
                    {farmBatches.map((b) => (
                      <option key={b.batchCode} value={b.batchCode}>
                        {b.batchCode} — {b.productName} ({b.farmName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="diary-title" className="mb-1.5 block font-semibold text-foreground">
                    Tên công việc hôm nay
                  </label>
                  <input
                    id="diary-title"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-3.5 text-base text-foreground"
                  />
                </div>

                <div>
                  <label htmlFor="diary-detail" className="mb-1.5 block font-semibold text-foreground">
                    Mô tả ngắn thực tế tại vườn
                  </label>
                  <textarea
                    id="diary-detail"
                    rows={3}
                    value={diaryDetail}
                    onChange={(e) => setDiaryDetail(e.target.value)}
                    className="w-full rounded-[12px] border border-border bg-white p-3.5 text-base text-foreground"
                  />
                </div>

                <Button type="submit" variant="farmer" className="w-full">
                  Lưu mốc nhật ký vào lô {effectiveDiaryBatchCode}
                </Button>
              </form>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-foreground">Lịch sử lô {effectiveDiaryBatchCode}</h3>
                <Link
                  href={`/trace/${effectiveDiaryBatchCode}`}
                  className="text-sm font-bold text-primary underline"
                >
                  Mở trang QR công khai
                </Link>
              </div>

              {(() => {
                const currentBatch =
                  farmBatches.find((b) => b.batchCode === effectiveDiaryBatchCode) ?? farmBatches[0];
                if (!currentBatch) {
                  return (
                    <p className="text-sm text-muted">
                      Chưa có lô hàng nào cho mã {effectiveDiaryBatchCode}.
                    </p>
                  );
                }
                return (
                  <ol className="space-y-3">
                    {currentBatch.events.map((ev) => (
                      <li
                        key={ev.id}
                        className="rounded-[12px] border border-border bg-background p-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="tabular-nums text-xs font-bold text-primary">
                            {ev.dateLabel}
                          </span>
                          <Badge tone="neutral">{ev.sourceDeclaration}</Badge>
                        </div>
                        <p className="mt-1 font-bold text-foreground">{ev.title}</p>
                        <p className="text-sm text-muted">{ev.detail}</p>
                      </li>
                    ))}
                  </ol>
                );
              })()}
            </Card>
          </section>
        ) : null}

        {/* TAB 4: FARMER PASS & PRODUCTS (S25) */}
        {activeTab === "pass" ? (
          <section id="pass" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-foreground">Thẻ Nhà vườn Số (Farmer Pass)</h3>
                <Badge tone="info">QR Hồ sơ Nhà vườn</Badge>
              </div>
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="rounded-[14px] border border-border bg-white p-3.5">
                  <QRCodeSVG
                    value={`${siteOrigin}/farms/${activeFarm.slug}`}
                    size={132}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                    marginSize={3}
                    title={`QR Thẻ Nhà vườn ${activeFarm.name}`}
                  />
                </div>
                <div className="space-y-2 text-base">
                  <p className="text-xl font-bold text-foreground">{activeFarm.name}</p>
                  <p className="text-muted">
                    Chủ vườn: <span className="font-semibold text-foreground">{activeFarm.ownerName}</span>{" "}
                    ({activeFarm.ownerAgeLabel})
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    {activeFarm.ocopLabel}
                  </p>
                  <p className="text-xs text-muted">{activeFarm.ocopNote}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  Mặt hàng đang mở bán ({farmProducts.length})
                </h3>
                <Link
                  href="/farmer/publish"
                  className="text-sm font-bold text-primary underline"
                >
                  + Thêm sản phẩm mới
                </Link>
              </div>
              <ul className="space-y-2.5">
                {farmProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={assetUrl(p.image)}
                        alt={p.name}
                        className="h-12 w-12 rounded-[10px] object-cover"
                        width={512}
                        height={279}
                      />
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted">
                          Tồn {p.stockKg} {p.unitLabel} · Lô {p.batchCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums font-bold text-primary">
                        {formatVnd(p.priceVnd)}/{p.unitLabel}
                      </span>
                      <Link
                        href={`/products/${p.slug}`}
                        className="rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-semibold text-primary"
                      >
                        Xem
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ) : null}

        <DemoBanner
          title="Lưu ý minh bạch Không gian Nhà vườn (W02)"
          detail="Đơn hàng, xác nhận bàn giao Thanh niên và nhật ký mùa vụ được đồng bộ trên Supabase giữa W01 – W02 – W03 – W04."
        />
      </div>
    </WorkspaceShell>
  );
}
