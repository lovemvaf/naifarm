"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  Camera,
  CheckCircle2,
  FilePlus2,
  HandHelping,
  MapPin,
  PackageCheck,
  Plus,
  QrCode,
  Radio,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { ProductionDiaryTimeline } from "@/components/traceability/ProductionDiaryTimeline";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import type {
  CertificationStatus,
  DemoOrder,
  DiaryEntry,
  FarmCertification,
  OrderStatus,
} from "@/types/naifarm";

type FarmerTab = "orders" | "diary" | "certs" | "support" | "pass";

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "warning" | "info" | "success" | "danger" | "neutral" }
> = {
  pending_confirm: { label: "Chờ nhà vườn xác nhận", tone: "warning" },
  preparing: { label: "Đang đóng gói tại vườn", tone: "info" },
  shipping: { label: "Đang giao hàng (Demo)", tone: "info" },
  ready_pickup: { label: "Sẵn sàng nhận tại vườn", tone: "success" },
  completed: { label: "Đã hoàn thành (Demo)", tone: "success" },
  cancelled: { label: "Đã hủy đơn", tone: "danger" },
};

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
    seasons,
    diaryEntries,
    certifications,
    orders,
    missions,
    supportRequests,
    setActiveWorkspace,
    updateOrderStatus,
    addSeasonDiaryEntry,
    createProductionSeason,
    addOrUpdateCertification,
    submitSupportRequest,
    confirmMissionByFarmer,
  } = useDemoStore();

  const [selectedFarmId, setSelectedFarmId] = useState("farm-ba-tu-demo");
  const [activeTab, setActiveTab] = useState<FarmerTab>("orders");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState(QUICK_CANCEL_REASONS[0]);

  // Harvest Seasons & Diary form
  const [diaryStage, setDiaryStage] = useState<DiaryEntry["stage"]>("Thu hoạch & Đóng gói");
  const [diaryBatchCode, setDiaryBatchCode] = useState("NF-DEMO-001");
  const [diaryTitle, setDiaryTitle] = useState("Kiểm tra độ chín & hái lứa mới sáng nay");
  const [diaryDetail, setDiaryDetail] = useState(
    "Nhà vườn tự khai: thu hái thủ công vào sáng sớm, xếp sọt thoáng và đóng gói theo đơn đặt.",
  );
  const [newSeasonCrop, setNewSeasonCrop] = useState("");
  const [newSeasonName, setNewSeasonName] = useState("");

  // Certification Demo Form
  const [certStd, setCertStd] = useState<FarmCertification["standardType"]>("VietGAP");
  const [certStatus, setCertStatus] = useState<CertificationStatus>("vietgap_declared_demo");
  const [certScope, setCertScope] = useState(
    "Hồ sơ tự khai quy trình chăm sóc an toàn cho lứa thu hoạch cuối năm (Demo).",
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

  const activeFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const farmProducts = products.filter((p) => p.farmId === activeFarm.id);
  const farmSeasons = seasons.filter((s) => s.farmId === activeFarm.id);
  const farmDiaries = diaryEntries.filter((d) => d.farmId === activeFarm.id);
  const farmCerts = certifications.filter((c) => c.farmId === activeFarm.id);
  const primaryBatch =
    batches.find((b) => b.batchCode === diaryBatchCode && b.farmId === activeFarm.id) ??
    batches.find((b) => b.farmId === activeFarm.id) ??
    batches[0];
  const visibleOrders = showAllOrders
    ? orders
    : orders.filter((o) => o.farmId === activeFarm.id || o.id === "NF-ORD-DEMO-01");
  const farmMissions = missions.filter((m) => m.farmId === activeFarm.id || m.status === "submitted");
  const pendingConfirmMissions = farmMissions.filter((m) => m.status === "submitted");

  const handleConfirmDeliverable = (missionId: string, title: string) => {
    confirmMissionByFarmer(missionId);
    toast.success(`Đã xác nhận kết quả "${title}". Điều phối viên W04 có thể duyệt giờ công.`);
  };

  const handleAdvanceOrder = (order: DemoOrder) => {
    if (order.status === "pending_confirm") {
      updateOrderStatus(order.id, "preparing");
      toast.success(`Đơn ${order.id} đã chuyển sang "Đang đóng gói tại vườn".`);
    } else if (order.status === "preparing") {
      const nextStatus: OrderStatus = order.deliveryMethod === "pickup" ? "ready_pickup" : "shipping";
      updateOrderStatus(order.id, nextStatus);
      toast.success(
        nextStatus === "ready_pickup"
          ? `Đơn ${order.id} đã sẵn sàng để khách nhận tại vườn.`
          : `Đơn ${order.id} đã bàn giao vận chuyển (Demo).`
      );
    } else if (order.status === "shipping" || order.status === "ready_pickup") {
      updateOrderStatus(order.id, "completed");
      toast.success(`Đơn ${order.id} đã hoàn thành!`);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelOrderId) return;
    if (!cancelReason.trim()) {
      toast.error("Bác vui lòng chọn hoặc nhập lý do hủy đơn.");
      return;
    }
    updateOrderStatus(cancelOrderId, "cancelled", cancelReason.trim());
    toast.success(`Đã cập nhật hủy đơn ${cancelOrderId} kèm lý do cho khách hàng.`);
    setCancelOrderId(null);
  };

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() || !diaryDetail.trim()) {
      toast.error("Bác vui lòng nhập tiêu đề và nội dung mốc nhật ký.");
      return;
    }
    const targetSeason = farmSeasons[0] ?? seasons[0];
    const targetBatchCode = primaryBatch?.batchCode ?? diaryBatchCode;
    addSeasonDiaryEntry({
      seasonId: targetSeason.id,
      batchCode: targetBatchCode,
      stage: diaryStage,
      title: diaryTitle.trim(),
      detail: diaryDetail.trim(),
      actorName: `${activeFarm.ownerName} (Chủ vườn W02)`,
      sourceDeclaration: "Nhà vườn tự khai",
      photo: "/images/stitch/stitch-53.jpg",
    });
    toast.success(`Đã ghi nhật ký hôm nay vào mùa vụ & đồng bộ tem QR lô ${targetBatchCode}.`);
  };

  const handleCreateSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeasonCrop.trim() || !newSeasonName.trim()) {
      toast.error("Bác vui lòng nhập tên cây trồng và tên mùa vụ mới.");
      return;
    }
    const created = createProductionSeason({
      farmId: activeFarm.id,
      cropName: newSeasonCrop.trim(),
      variety: activeFarm.mainCrops[0] ?? "Giống địa phương",
      seasonName: newSeasonName.trim(),
      expectedHarvestDate: "30/01/2027",
      areaHa: activeFarm.areaHa,
      summary: `Mùa vụ mới do ${activeFarm.ownerName} tạo trên Không gian Nhà vườn.`,
    });
    setNewSeasonCrop("");
    setNewSeasonName("");
    toast.success(`Đã tạo mùa vụ ${created.seasonName}.`);
  };

  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addOrUpdateCertification({
      farmId: activeFarm.id,
      standardType: certStd,
      status: certStatus,
      scopeSummary: certScope.trim() || `Hồ sơ minh họa cho ${activeFarm.name}`,
    });
    toast.success(`Đã ghi nhận hồ sơ mẫu ${created.certificateCode} (${created.statusLabel}).`);
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const created = submitSupportRequest({
      farmId: activeFarm.id,
      farmName: activeFarm.name,
      title: `${reqNeedType} — ${activeFarm.name}`,
      needType: reqNeedType,
      preferredTime: reqTime,
      locationMode: reqMode,
      note: reqNote.trim() || "Cần thanh niên hỗ trợ thao tác số hóa sản phẩm.",
    });
    toast.success(`Đã gửi yêu cầu ${created.id} tới Điều phối viên W04.`);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-lg text-[#52645A]">
        Đang mở Không gian Nhà vườn...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W02"
      title="Không gian Nhà vườn"
      subtitle="Chữ to, nút bấm rõ — tự đăng nông sản, xác nhận đơn và ghi nhật ký mùa vụ"
      scopeBadge="Dữ liệu mô phỏng — Tự quản nhà vườn"
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
          label: `Mùa vụ & Nhật ký (${farmDiaries.length})`,
          href: "#diary",
          active: activeTab === "diary",
          onClick: () => setActiveTab("diary"),
          icon: <FilePlus2 className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: `Chứng nhận (Demo · ${farmCerts.length})`,
          href: "#certs",
          active: activeTab === "certs",
          onClick: () => setActiveTab("certs"),
          icon: <Award className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: `Thanh niên hỗ trợ (${pendingConfirmMissions.length})`,
          href: "#support",
          active: activeTab === "support",
          onClick: () => setActiveTab("support"),
          icon: <HandHelping className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Thẻ Nhà vườn & In QR",
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
        <Card className="border-2 border-[#245B3D]/25 bg-gradient-to-br from-white to-[#F5F3E9] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Giao diện U50+ Dễ đọc</Badge>
                <Badge tone={activeFarm.ocopStatus === "coop_checked_demo" ? "info" : "warning"}>
                  {activeFarm.ocopLabel}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-[#25352B]">
                Xin chào, {activeFarm.ownerName} · {activeFarm.name}
              </h2>
              <p className="inline-flex items-center gap-1.5 text-base text-[#52645A]">
                <MapPin className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                {activeFarm.addressLabel} · Diện tích {activeFarm.areaHa} ha
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-sm font-semibold text-[#52645A]">Đổi vườn đang xem (Demo):</span>
                {farms.slice(0, 2).map((farm) => (
                  <button
                    key={farm.id}
                    type="button"
                    onClick={() => {
                      setSelectedFarmId(farm.id);
                      const firstBatch = batches.find((b) => b.farmId === farm.id);
                      if (firstBatch) setDiaryBatchCode(firstBatch.batchCode);
                    }}
                    className={`min-h-[44px] rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer ${
                      selectedFarmId === farm.id
                        ? "bg-[#245B3D] text-white"
                        : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                    }`}
                  >
                    {farm.ownerName}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/farmer/publish"
                className="inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-[14px] bg-[#245B3D] px-7 py-3.5 text-[18px] font-bold text-white shadow-[0_6px_16px_rgba(36,91,61,0.22)] hover:bg-[#19472E]"
              >
                <Camera className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span>Chụp ảnh & Nói để bán</span>
              </Link>
              <Link
                href="/live"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-[#245B3D] bg-white px-5 text-base font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
              >
                <Radio className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Mở Livestream tại vườn</span>
              </Link>
              <Link
                href={`/farms/${activeFarm.slug}`}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-[#D6DED2] bg-white px-5 text-base font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
              >
                <span>Xem trang vườn ngoài Chợ</span>
              </Link>
            </div>
          </div>
        </Card>

        {/* Highlight Banner if Youth Deliverable is awaiting Farm confirmation */}
        {pendingConfirmMissions.length > 0 && activeTab !== "support" ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-[16px] border-2 border-[#D7A34D] bg-[#FFF2D8] p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="text-base font-bold text-[#25352B]">
                Có {pendingConfirmMissions.length} việc hỗ trợ từ Thanh niên đang chờ bác xác nhận
              </p>
              <p className="text-sm text-[#52645A]">
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
              <h3 className="text-xl font-bold text-[#25352B]">
                Đơn đặt mua cần xử lý ({visibleOrders.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAllOrders((prev) => !prev)}
                className="min-h-[44px] rounded-[10px] border border-[#D6DED2] bg-white px-4 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5] cursor-pointer"
              >
                {showAllOrders ? "Chỉ xem đơn của vườn đang chọn" : "Xem tất cả đơn Demo trên hệ thống"}
              </button>
            </div>

            {visibleOrders.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              return (
                <Card key={order.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAF0E5] pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums text-lg font-bold text-[#245B3D]">
                          {order.id}
                        </span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                      <p className="mt-1 text-base text-[#25352B]">
                        Khách hàng: <span className="font-semibold">{order.customerName}</span> ·{" "}
                        {order.createdAtLabel}
                      </p>
                      <p className="text-sm text-[#52645A]">
                        Hình thức:{" "}
                        <span className="font-semibold text-[#25352B]">
                          {order.deliveryMethod === "pickup"
                            ? "Khách tới nhận tại vườn (0 đ)"
                            : `Giao tận nơi (${order.deliveryAddress})`}
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-[#52645A]">Tổng tiền thu dự kiến (COD Demo)</p>
                      <p className="tabular-nums text-2xl font-bold text-[#245B3D]">
                        {formatVnd(order.totalVnd)}
                      </p>
                    </div>
                  </div>

                  <ul className="my-4 space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[#F5F3E9] px-4 py-2.5 text-base"
                      >
                        <span className="font-medium text-[#25352B]">
                          {item.productName} × {item.quantity} ({item.unitLabel})
                        </span>
                        <span className="tabular-nums font-semibold text-[#25352B]">
                          {formatVnd(item.quantity * item.unitPriceVnd)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.cancelReason ? (
                    <div className="mb-4 rounded-[12px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-base text-[#A32D2D]">
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
                    <div className="mt-4 space-y-3 rounded-[14px] border border-[#A32D2D]/35 bg-[#FDECEC]/60 p-4">
                      <p className="font-bold text-[#A32D2D]">
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
                                ? "border-[#A32D2D] bg-[#A32D2D] text-white"
                                : "border-[#D6DED2] bg-white text-[#25352B]"
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
                        className="w-full rounded-[12px] border border-[#D6DED2] bg-white p-3 text-base text-[#25352B]"
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
                <UserCheck className="h-6 w-6 text-[#245B3D]" aria-hidden="true" />
                <h3 className="text-xl font-bold text-[#25352B]">
                  Xác nhận kết quả Thanh niên hỗ trợ (Lớp 1)
                </h3>
              </div>
              <p className="mb-4 text-sm text-[#52645A]">
                Quy định 2 lớp minh bạch: Chủ vườn xác nhận đã nhận đủ ảnh/tem/bài đăng tại đây
                trước khi Điều phối viên (W04) được phép duyệt cộng giờ cống hiến.
              </p>

              <div className="space-y-4">
                {farmMissions.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="tabular-nums text-sm font-bold text-[#245B3D]">{m.id}</span>
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
                    <h4 className="text-lg font-bold text-[#25352B]">{m.title}</h4>
                    <p className="text-sm text-[#52645A]">
                      Tình nguyện viên:{" "}
                      <span className="font-semibold text-[#25352B]">
                        {m.assigneeName ?? "Chưa phân công"}
                      </span>{" "}
                      · Dự kiến {m.expectedHours} giờ
                    </p>
                    <p className="text-sm text-[#25352B]">{m.deliverableSummary}</p>
                    {m.evidenceImage ? (
                      <img
                        src={m.evidenceImage}
                        alt={`Minh chứng bàn giao ${m.id}`}
                        className="h-40 w-full rounded-[10px] object-cover"
                      />
                    ) : null}
                    {m.evidenceNote ? (
                      <p className="rounded-[10px] bg-white px-3 py-2 text-sm text-[#52645A]">
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
                <HandHelping className="h-6 w-6 text-[#245B3D]" aria-hidden="true" />
                <h3 className="text-xl font-bold text-[#25352B]">Gửi yêu cầu Thanh niên hỗ trợ mới</h3>
              </div>

              <form onSubmit={handleSendSupport} className="space-y-4">
                <div>
                  <label htmlFor="need-type" className="mb-1.5 block font-semibold text-[#25352B]">
                    Bác cần hỗ trợ việc gì?
                  </label>
                  <select
                    id="need-type"
                    value={reqNeedType}
                    onChange={(e) => setReqNeedType(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-base text-[#25352B]"
                  >
                    <option>Chụp ảnh & đăng bán sản phẩm mới</option>
                    <option>Dán tem QR & hướng dẫn ghi nhật ký</option>
                    <option>Quay phiên Livestream cuối tuần tại vườn</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="req-time" className="mb-1.5 block font-semibold text-[#25352B]">
                    Thời gian thuận tiện tại vườn
                  </label>
                  <input
                    id="req-time"
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-base text-[#25352B]"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block font-semibold text-[#25352B]">Hình thức gặp</span>
                  <div className="flex gap-3">
                    {(["Tại vườn", "Online"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setReqMode(mode)}
                        className={`min-h-[48px] flex-1 rounded-[12px] border text-base font-semibold cursor-pointer ${
                          reqMode === mode
                            ? "border-[#245B3D] bg-[#245B3D] text-white"
                            : "border-[#D6DED2] bg-white text-[#25352B]"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="req-note" className="mb-1.5 block font-semibold text-[#25352B]">
                    Lời nhắn thêm cho đội Thanh niên
                  </label>
                  <textarea
                    id="req-note"
                    rows={3}
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                    className="w-full rounded-[12px] border border-[#D6DED2] bg-white p-3.5 text-base text-[#25352B]"
                  />
                </div>

                <Button type="submit" variant="farmer" className="w-full">
                  Gửi yêu cầu tới Điều phối viên (W04)
                </Button>
              </form>

              <div className="mt-6 border-t border-[#D6DED2] pt-4">
                <h4 className="mb-2 text-base font-bold text-[#25352B]">
                  Yêu cầu đã gửi gần đây ({supportRequests.length})
                </h4>
                <ul className="space-y-2">
                  {supportRequests.map((req) => (
                    <li
                      key={req.id}
                      className="rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#245B3D] tabular-nums">{req.id}</span>
                        <Badge tone="info">{req.status}</Badge>
                      </div>
                      <p className="font-semibold text-[#25352B]">{req.title}</p>
                      <p className="text-[#52645A]">
                        {req.preferredTime} · {req.locationMode}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>
        ) : null}

        {/* TAB 3: PRODUCTION SEASONS & DIARY */}
        {activeTab === "diary" ? (
          <section id="diary" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-5 sm:p-6">
                <h3 className="mb-4 text-xl font-bold text-[#25352B]">
                  Ghi nhật ký hôm nay (Đồng bộ thẳng ra Hộ chiếu QR)
                </h3>
                <form onSubmit={handleAddDiary} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="diary-batch" className="mb-1.5 block font-semibold text-[#25352B]">
                        Chọn mã lô sản phẩm
                      </label>
                      <select
                        id="diary-batch"
                        value={primaryBatch?.batchCode ?? diaryBatchCode}
                        onChange={(e) => setDiaryBatchCode(e.target.value)}
                        className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-base text-[#25352B]"
                      >
                        {batches
                          .filter((b) => b.farmId === activeFarm.id)
                          .map((b) => (
                            <option key={b.batchCode} value={b.batchCode}>
                              {b.batchCode} — {b.productName}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="diary-stage" className="mb-1.5 block font-semibold text-[#25352B]">
                        Công đoạn canh tác
                      </label>
                      <select
                        id="diary-stage"
                        value={diaryStage}
                        onChange={(e) => setDiaryStage(e.target.value as DiaryEntry["stage"])}
                        className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-base text-[#25352B]"
                      >
                        <option value="Làm đất & Tỉa cành">Làm đất &amp; Tỉa cành</option>
                        <option value="Bón phân hữu cơ">Bón phân hữu cơ</option>
                        <option value="Kiểm soát sinh học">Kiểm soát sinh học</option>
                        <option value="Tưới & Chăm sóc">Tưới &amp; Chăm sóc</option>
                        <option value="Đo độ Brix & Khảo sát">Đo độ Brix &amp; Khảo sát</option>
                        <option value="Thu hoạch & Đóng gói">Thu hoạch &amp; Đóng gói</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="diary-title" className="mb-1.5 block font-semibold text-[#25352B]">
                      Tên công việc hôm nay
                    </label>
                    <input
                      id="diary-title"
                      value={diaryTitle}
                      onChange={(e) => setDiaryTitle(e.target.value)}
                      className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-base text-[#25352B]"
                    />
                  </div>

                  <div>
                    <label htmlFor="diary-detail" className="mb-1.5 block font-semibold text-[#25352B]">
                      Mô tả ngắn thực tế tại vườn
                    </label>
                    <textarea
                      id="diary-detail"
                      rows={3}
                      value={diaryDetail}
                      onChange={(e) => setDiaryDetail(e.target.value)}
                      className="w-full rounded-[12px] border border-[#D6DED2] bg-white p-3.5 text-base text-[#25352B]"
                    />
                  </div>

                  <Button type="submit" variant="farmer" className="w-full">
                    Lưu nhật ký hôm nay &amp; đồng bộ QR ({primaryBatch?.batchCode ?? diaryBatchCode})
                  </Button>
                </form>

                <form onSubmit={handleCreateSeason} className="mt-6 space-y-3 border-t border-[#D6DED2] pt-5">
                  <p className="flex items-center gap-1.5 text-base font-bold text-[#25352B]">
                    <Plus className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                    <span>Mở nhanh Mùa vụ mới ({farmSeasons.length} mùa đang theo dõi)</span>
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={newSeasonCrop}
                      onChange={(e) => setNewSeasonCrop(e.target.value)}
                      placeholder="Cây trồng (vd: Sầu riêng Ri6)"
                      className="min-h-[44px] rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                    />
                    <input
                      type="text"
                      value={newSeasonName}
                      onChange={(e) => setNewSeasonName(e.target.value)}
                      placeholder="Tên vụ (vd: Vụ Hè Thu 2027)"
                      className="min-h-[44px] rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                    Tạo mùa vụ theo dõi mới
                  </Button>
                </form>
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-[#25352B]">
                    Nhật ký mùa vụ · {activeFarm.name}
                  </h3>
                  <Link
                    href={`/trace/${primaryBatch?.batchCode ?? diaryBatchCode}`}
                    className="text-sm font-bold text-[#245B3D] underline"
                  >
                    Mở Hộ chiếu QR công khai →
                  </Link>
                </div>
                <ProductionDiaryTimeline entries={farmDiaries} limit={8} />
              </Card>
            </div>
          </section>
        ) : null}

        {/* TAB 4: VIETGAP & OCOP CERTIFICATIONS (DEMO) */}
        {activeTab === "certs" ? (
          <section id="certs" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className="h-fit space-y-4 p-5 sm:p-6 lg:col-span-5">
              <h3 className="text-xl font-bold text-[#25352B]">
                Khai báo / Cập nhật hồ sơ VietGAP &amp; OCOP (Demo)
              </h3>
              <p className="text-xs leading-relaxed text-[#52645A]">
                Hệ thống tách bạch rõ: Nhãn tự khai, Đối chiếu nội bộ HTX và Mã số vùng trồng — tất
                cả mã tạo mới đều mang tiền tố <code>DEMO-*</code> và không thay thế văn bản pháp lý.
              </p>
              <form onSubmit={handleAddCertification} className="space-y-3">
                <div>
                  <label htmlFor="cert-std" className="block text-sm font-semibold text-[#25352B]">
                    Loại tiêu chuẩn / Hồ sơ
                  </label>
                  <select
                    id="cert-std"
                    value={certStd}
                    onChange={(e) => setCertStd(e.target.value as FarmCertification["standardType"])}
                    className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                  >
                    <option value="VietGAP">VietGAP (Tham khảo thực hành tốt)</option>
                    <option value="OCOP">OCOP Thanh niên (Mẫu tham khảo)</option>
                    <option value="Mã số vùng trồng">Mã số vùng trồng</option>
                    <option value="ATTP cơ sở">ATTP cơ sở</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cert-st" className="block text-sm font-semibold text-[#25352B]">
                    Trạng thái xác minh hiện tại
                  </label>
                  <select
                    id="cert-st"
                    value={certStatus}
                    onChange={(e) => setCertStatus(e.target.value as CertificationStatus)}
                    className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#D6DED2] bg-white px-3 text-sm"
                  >
                    <option value="vietgap_declared_demo">Tự khai VietGAP (Demo)</option>
                    <option value="ocop_declared_demo">Tự khai OCOP (Demo)</option>
                    <option value="coop_checked_demo">HTX đã đối chiếu nội bộ (Demo)</option>
                    <option value="pending_review">Đang chờ đối chiếu hồ sơ (Demo)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cert-scope" className="block text-sm font-semibold text-[#25352B]">
                    Phạm vi áp dụng trên vườn
                  </label>
                  <textarea
                    id="cert-scope"
                    rows={3}
                    value={certScope}
                    onChange={(e) => setCertScope(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-[#D6DED2] bg-white p-3 text-sm"
                  />
                </div>
                <Button type="submit" variant="farmer" className="w-full">
                  Lưu hồ sơ chứng nhận minh họa
                </Button>
              </form>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-7">
              {farmCerts.map((cert) => (
                <CertificationCard key={cert.id} cert={cert} />
              ))}
            </div>
          </section>
        ) : null}

        {/* TAB 5: FARMER PASS, REAL QR & PRODUCTS (S25) */}
        {activeTab === "pass" ? (
          <section id="pass" className="space-y-6">
            {primaryBatch ? <QrPassportCard batch={primaryBatch} /> : null}

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-[#25352B]">
                  Mặt hàng đang mở bán ({farmProducts.length})
                </h3>
                <Link
                  href="/farmer/publish"
                  className="text-sm font-bold text-[#245B3D] underline"
                >
                  + Thêm sản phẩm mới
                </Link>
              </div>
              <ul className="space-y-2.5">
                {farmProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-[10px] object-cover"
                      />
                      <div>
                        <p className="font-bold text-[#25352B]">{p.name}</p>
                        <p className="text-xs text-[#52645A]">
                          Tồn {p.stockKg} {p.unitLabel} · Lô {p.batchCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums font-bold text-[#245B3D]">
                        {formatVnd(p.priceVnd)}/{p.unitLabel}
                      </span>
                      <Link
                        href={`/products/${p.slug}`}
                        className="rounded-lg border border-[#245B3D] bg-white px-3 py-1.5 text-xs font-semibold text-[#245B3D]"
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
          detail="Đơn hàng, xác nhận bàn giao Thanh niên và nhật ký mùa vụ lưu trong bộ nhớ trình duyệt (localStorage) để phục vụ trình diễn liên hoàn giữa W01 – W02 – W03 – W04."
        />
      </div>
    </WorkspaceShell>
  );
}
