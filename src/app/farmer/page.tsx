"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Camera,
  CheckCircle2,
  FilePlus2,
  HandHelping,
  LayoutGrid,
  PackageCheck,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { FarmerOverviewAnalytics } from "@/components/farmer/FarmerOverviewAnalytics";
import { FarmerCommercePanel } from "@/components/farmer/FarmerCommercePanel";
import { FarmerInventoryProcurementPanel } from "@/components/farmer/FarmerInventoryProcurementPanel";
import { FarmerCoopFinancePanel } from "@/components/farmer/FarmerCoopFinancePanel";
import { QualityCenterPanel } from "@/components/quality/QualityCenterPanel";
import { ProductionDiaryTimeline } from "@/components/traceability/ProductionDiaryTimeline";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import type { CertificationStatus, DiaryEntry, FarmCertification, OrderStatus } from "@/types/naifarm";

type SimpleTab = "orders" | "diary" | "quality" | "support";
type ErpTab = "overview" | "commerce" | "inventory" | "coop" | "quality" | "seasons" | "support";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirm: "Chờ xác nhận",
  preparing: "Đang đóng gói",
  shipping: "Đang giao",
  ready_pickup: "Chờ nhận tại vườn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

function FarmerWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    hydrated,
    setActiveWorkspace,
    authUser,
    farms,
    products,
    batches,
    orders,
    seasons,
    diaryEntries,
    certifications,
    credentialRecords,
    missions,
    supportRequests,
    updateOrderStatus,
    addSeasonDiaryEntry,
    createProductionSeason,
    addOrUpdateCertification,
    submitSupportRequest,
    confirmMissionByFarmer,
    updateCredentialLifecycle,
    renewCredentialRecord,
  } = useDemoStore();

  const urlMode = searchParams.get("mode") === "erp" ? "erp" : "simple";
  const urlTab = searchParams.get("tab") ?? "overview";

  const [mode, setMode] = useState<"simple" | "erp">(urlMode);
  const [simpleTab, setSimpleTab] = useState<SimpleTab>("orders");
  const [erpTab, setErpTab] = useState<ErpTab>(
    (["overview", "commerce", "inventory", "coop", "quality", "seasons", "support"] as ErpTab[]).includes(
      urlTab as ErpTab,
    )
      ? (urlTab as ErpTab)
      : "overview",
  );
  const [selectedFarmId, setSelectedFarmId] = useState<string>("farm-ba-tu-demo");

  // Forms (Simple & Season Diary)
  const [diaryStage, setDiaryStage] = useState<DiaryEntry["stage"]>("Thu hoạch & Đóng gói");
  const [diaryTitle, setDiaryTitle] = useState("Cắt bưởi & kiểm tra độ ngọt sáng nay");
  const [diaryDetail, setDiaryDetail] = useState(
    "Thu hoạch lứa chín đủ 11,5° Brix, đóng sọt thoáng và dán tem truy xuất QR tại vườn.",
  );
  const [newSeasonCrop, setNewSeasonCrop] = useState("");
  const [newSeasonName, setNewSeasonName] = useState("");
  const [certStd, setCertStd] = useState<FarmCertification["standardType"]>("VietGAP");
  const [certStatus, setCertStatus] = useState<CertificationStatus>("pending_review");
  const [certScope, setCertScope] = useState("");
  const [reqNeedType, setReqNeedType] = useState("Chụp ảnh & AI đăng bán");
  const [reqTime, setReqTime] = useState("Cuối tuần 08:00 – 11:00");
  const [reqMode, setReqMode] = useState<"Tại vườn" | "Online">("Tại vườn");
  const [reqNote, setReqNote] = useState("");

  useEffect(() => {
    setActiveWorkspace("W02");
  }, [setActiveWorkspace]);

  const activeFarm = useMemo(
    () => farms.find((f) => f.id === selectedFarmId) ?? farms.find((f) => f.id === "farm-ba-tu-demo") ?? farms[0],
    [farms, selectedFarmId],
  );

  const visibleOrders = useMemo(
    () => orders.filter((o) => o.farmId === activeFarm.id),
    [orders, activeFarm.id],
  );
  const farmProducts = useMemo(
    () => products.filter((p) => p.farmId === activeFarm.id),
    [products, activeFarm.id],
  );
  const farmSeasons = useMemo(
    () => seasons.filter((s) => s.farmId === activeFarm.id),
    [seasons, activeFarm.id],
  );
  const farmDiaries = useMemo(
    () => diaryEntries.filter((d) => d.farmId === activeFarm.id),
    [diaryEntries, activeFarm.id],
  );
  const farmCerts = useMemo(
    () => certifications.filter((c) => c.farmId === activeFarm.id),
    [certifications, activeFarm.id],
  );
  const primaryBatch = useMemo(() => {
    const preferred = farmProducts[0]?.batchCode ?? "NF-DEMO-001";
    return batches.find((b) => b.batchCode === preferred) ?? batches[0];
  }, [batches, farmProducts]);

  const farmMissions = useMemo(
    () => missions.filter((m) => m.farmId === activeFarm.id),
    [missions, activeFarm.id],
  );
  const farmSupportReqs = useMemo(
    () => supportRequests.filter((r) => r.farmId === activeFarm.id),
    [supportRequests, activeFarm.id],
  );

  const syncModeUrl = (nextMode: "simple" | "erp", nextTab?: string) => {
    setMode(nextMode);
    const params = new URLSearchParams();
    params.set("mode", nextMode);
    if (nextMode === "erp" && nextTab) params.set("tab", nextTab);
    router.replace(`/farmer?${params.toString()}`, { scroll: false });
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-lg text-[#52645A]">
        Đang mở Không gian Nhà vườn...
      </div>
    );
  }

  const navItems =
    mode === "simple"
      ? [
          {
            label: "Đăng bán nhanh (3 bước)",
            href: "/farmer/publish",
            icon: <Camera className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: `Đơn hàng (${visibleOrders.length})`,
            href: "#orders",
            active: simpleTab === "orders",
            onClick: () => setSimpleTab("orders"),
            icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: `Nhật ký & Mùa vụ (${farmDiaries.length})`,
            href: "#diary",
            active: simpleTab === "diary",
            onClick: () => setSimpleTab("diary"),
            icon: <FilePlus2 className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: `Chất lượng & QR (${farmCerts.length})`,
            href: "#quality",
            active: simpleTab === "quality",
            onClick: () => setSimpleTab("quality"),
            icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: "Gọi Thanh niên hỗ trợ",
            href: "#support",
            active: simpleTab === "support",
            onClick: () => setSimpleTab("support"),
            icon: <HandHelping className="h-5 w-5" aria-hidden="true" />,
          },
        ]
      : [
          {
            label: "Tổng quan & KPI",
            href: "#overview",
            active: erpTab === "overview",
            onClick: () => {
              setErpTab("overview");
              syncModeUrl("erp", "overview");
            },
            icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Bán hàng, Đơn & Hoàn tiền",
            href: "#commerce",
            active: erpTab === "commerce",
            onClick: () => {
              setErpTab("commerce");
              syncModeUrl("erp", "commerce");
            },
            icon: <ShoppingBag className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Kho lô & Mua vật tư",
            href: "#inventory",
            active: erpTab === "inventory",
            onClick: () => {
              setErpTab("inventory");
              syncModeUrl("erp", "inventory");
            },
            icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "HTX, Gom lô & Sổ tài chính",
            href: "#coop",
            active: erpTab === "coop",
            onClick: () => {
              setErpTab("coop");
              syncModeUrl("erp", "coop");
            },
            icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Chất lượng (26 chuẩn)",
            href: "#quality",
            active: erpTab === "quality",
            onClick: () => {
              setErpTab("quality");
              syncModeUrl("erp", "quality");
            },
            icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Mùa vụ & Nhật ký",
            href: "#seasons",
            active: erpTab === "seasons",
            onClick: () => {
              setErpTab("seasons");
              syncModeUrl("erp", "seasons");
            },
            icon: <FilePlus2 className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Thanh niên hỗ trợ",
            href: "#support",
            active: erpTab === "support",
            onClick: () => {
              setErpTab("support");
              syncModeUrl("erp", "support");
            },
            icon: <HandHelping className="h-4 w-4" aria-hidden="true" />,
          },
        ];

  return (
    <WorkspaceShell
      workspaceId="W02"
      title="Không gian Nhà vườn"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Top Control Bar: Farm selector + Simple / ERP Mode Toggle */}
        <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs font-semibold text-[#52645A]">Hồ sơ nhà vườn đang quản lý</p>
              <select
                value={activeFarm.id}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                aria-label="Chọn nhà vườn đang quản lý"
                className="mt-1 min-h-[42px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm font-bold text-[#25352B]"
              >
                {farms.slice(0, 12).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.ownerName} · {f.administrativeUnitName})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-[#52645A]">
              <p>
                Diện tích: <strong className="text-[#25352B]">{activeFarm.areaHa} ha</strong> ·{" "}
                {farmProducts.length} mặt hàng
              </p>
              <p>Không gian trải nghiệm · {authUser?.name ?? activeFarm.ownerName}</p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Chọn chế độ giao diện nhà vườn"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => syncModeUrl("simple")}
              className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[12px] border px-4 text-sm font-bold transition ${
                mode === "simple"
                  ? "border-[#245B3D] bg-[#245B3D] text-white"
                  : "border-[#D6DED2] bg-[#FAF8F1] text-[#25352B] hover:bg-[#EAF0E5]"
              }`}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Nhà vườn gọn (Chữ to)</span>
            </button>
            <button
              type="button"
              onClick={() => syncModeUrl("erp", erpTab)}
              className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[12px] border px-4 text-sm font-bold transition ${
                mode === "erp"
                  ? "border-[#245B3D] bg-[#245B3D] text-white"
                  : "border-[#D6DED2] bg-[#FAF8F1] text-[#25352B] hover:bg-[#EAF0E5]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span>Quản trị HTX &amp; Kinh doanh</span>
            </button>
          </div>
        </Card>

        {mode === "simple" ? (
          <>
            {/* U50+ Large Primary Action Tiles (4 main blocks) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setSimpleTab("orders")}
                className={`flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[16px] border-2 p-4 text-left transition ${
                  simpleTab === "orders"
                    ? "border-[#245B3D] bg-[#245B3D] text-white shadow-[0_4px_12px_rgba(36,91,61,0.2)]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <PackageCheck className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      simpleTab === "orders" ? "bg-white/20 text-white" : "bg-[#EAF0E5] text-[#245B3D]"
                    }`}
                  >
                    {visibleOrders.length} đơn
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-[18px] font-bold leading-snug">Đơn hàng của vườn</p>
                  <p className={`text-sm ${simpleTab === "orders" ? "text-white/85" : "text-[#52645A]"}`}>
                    Xác nhận &amp; hẹn giao
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSimpleTab("diary")}
                className={`flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[16px] border-2 p-4 text-left transition ${
                  simpleTab === "diary"
                    ? "border-[#245B3D] bg-[#245B3D] text-white shadow-[0_4px_12px_rgba(36,91,61,0.2)]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <FilePlus2 className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      simpleTab === "diary" ? "bg-white/20 text-white" : "bg-[#EAF0E5] text-[#245B3D]"
                    }`}
                  >
                    {farmDiaries.length} mốc
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-[18px] font-bold leading-snug">Ghi nhật ký &amp; Mùa vụ</p>
                  <p className={`text-sm ${simpleTab === "diary" ? "text-white/85" : "text-[#52645A]"}`}>
                    Cập nhật QR 1 chạm
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSimpleTab("quality")}
                className={`flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[16px] border-2 p-4 text-left transition ${
                  simpleTab === "quality"
                    ? "border-[#245B3D] bg-[#245B3D] text-white shadow-[0_4px_12px_rgba(36,91,61,0.2)]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <QrCode className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      simpleTab === "quality" ? "bg-white/20 text-white" : "bg-[#EAF0E5] text-[#245B3D]"
                    }`}
                  >
                    {primaryBatch?.batchCode ?? "NF-DEMO-001"}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-[18px] font-bold leading-snug">Tem QR &amp; Hồ sơ vườn</p>
                  <p className={`text-sm ${simpleTab === "quality" ? "text-white/85" : "text-[#52645A]"}`}>
                    In tem &amp; đối chiếu
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSimpleTab("support")}
                className={`flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[16px] border-2 p-4 text-left transition ${
                  simpleTab === "support"
                    ? "border-[#245B3D] bg-[#245B3D] text-white shadow-[0_4px_12px_rgba(36,91,61,0.2)]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <HandHelping className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      simpleTab === "support" ? "bg-white/20 text-white" : "bg-[#EAF0E5] text-[#245B3D]"
                    }`}
                  >
                    {farmMissions.length} việc
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-[18px] font-bold leading-snug">Gọi Thanh niên hỗ trợ</p>
                  <p className={`text-sm ${simpleTab === "support" ? "text-white/85" : "text-[#52645A]"}`}>
                    Chụp ảnh &amp; xác nhận giờ
                  </p>
                </div>
              </button>
            </div>

            {/* Quick CTA to 3-step AI publish */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#245B3D]/30 bg-[#EAF0E5] p-5">
              <div>
                <h2 className="text-xl font-bold text-[#25352B]">Cần đăng bán lứa trái mới hái sáng nay?</h2>
                <p className="mt-1 text-base text-[#52645A]">
                  Chỉ 3 bước chữ to: chọn ảnh, nói hoặc gõ giá bán, xem lại và bấm Đăng.
                </p>
              </div>
              <Link
                href="/farmer/publish"
                className="inline-flex min-h-[56px] items-center gap-2 rounded-[14px] bg-[#245B3D] px-6 text-[18px] font-bold text-white hover:bg-[#19472E]"
              >
                <Camera className="h-6 w-6" aria-hidden="true" />
                <span>Đăng bán nông sản (3 bước)</span>
              </Link>
            </div>

            {simpleTab === "orders" ? (
              <Card className="space-y-4 p-5">
                <h2 className="text-xl font-bold text-[#25352B]">
                  Đơn khách đặt tại {activeFarm.name} ({visibleOrders.length})
                </h2>
                <div className="space-y-3">
                  {visibleOrders.slice(0, 12).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex flex-col gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-[#245B3D]">{ord.id}</span>
                          <Badge tone={ord.status === "completed" ? "success" : "warning"}>
                            {STATUS_LABELS[ord.status]}
                          </Badge>
                        </div>
                        <p className="text-base font-semibold text-[#25352B]">
                          {ord.customerName} · {ord.items.map((i) => `${i.productName} (${i.quantity} ${i.unitLabel})`).join(", ")}
                        </p>
                        <p className="text-sm text-[#52645A]">
                          Tổng: <strong className="tabular-nums text-[#245B3D]">{formatVnd(ord.totalVnd)}</strong> ·{" "}
                          {ord.deliveryAddress}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ord.status === "pending_confirm" ? (
                          <Button
                            variant="farmer"
                            onClick={() => {
                              updateOrderStatus(ord.id, "preparing");
                              notifySuccess(`Bác đã nhận đơn ${ord.id}.`);
                            }}
                          >
                            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                            <span>Xác nhận soạn hàng</span>
                          </Button>
                        ) : ord.status === "preparing" ? (
                          <Button
                            variant="farmer"
                            onClick={() => {
                              updateOrderStatus(ord.id, ord.deliveryMethod === "pickup" ? "ready_pickup" : "shipping");
                              notifySuccess(`Đã báo giao hàng cho đơn ${ord.id}.`);
                            }}
                          >
                            {ord.deliveryMethod === "pickup" ? "Báo sẵn tại vườn" : "Bắt đầu giao"}
                          </Button>
                        ) : (
                          <Link
                            href={`/account/orders/${ord.id}`}
                            className="inline-flex min-h-[48px] items-center rounded-[12px] border border-[#245B3D] px-4 text-sm font-bold text-[#245B3D]"
                          >
                            Xem chi tiết đơn
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {simpleTab === "diary" ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <Card className="space-y-4 p-5 lg:col-span-6">
                  <h2 className="text-xl font-bold text-[#25352B]">Ghi nhanh nhật ký hôm nay</h2>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!diaryTitle.trim() || !diaryDetail.trim()) {
                        notifyError("Bác vui lòng nhập tiêu đề và mô tả nhật ký.");
                        return;
                      }
                      const targetSeason = farmSeasons[0] ?? seasons[0];
                      const targetBatch = primaryBatch?.batchCode ?? "NF-DEMO-001";
                      addSeasonDiaryEntry({
                        seasonId: targetSeason.id,
                        batchCode: targetBatch,
                        stage: diaryStage,
                        title: diaryTitle.trim(),
                        detail: diaryDetail.trim(),
                        actorName: `${activeFarm.ownerName} (Chủ vườn W02)`,
                        sourceDeclaration: "Nhà vườn tự khai",
                        photo: "/images/stitch/stitch-53.jpg",
                        visibility: "public",
                      });
                      notifySuccess(`Đã ghi nhật ký vào mùa vụ & đồng bộ tem QR ${targetBatch}.`);
                    }}
                  >
                    <div>
                      <label htmlFor="f-stage" className="block text-sm font-bold text-[#25352B]">
                        Công đoạn canh tác
                      </label>
                      <select
                        id="f-stage"
                        value={diaryStage}
                        onChange={(e) => setDiaryStage(e.target.value as DiaryEntry["stage"])}
                        className="mt-1 min-h-[50px] w-full rounded-[12px] border border-[#788A7B] bg-white px-3 text-base"
                      >
                        <option value="Làm đất & Tỉa cành">Làm đất &amp; Tỉa cành</option>
                        <option value="Bón phân hữu cơ">Bón phân hữu cơ</option>
                        <option value="Kiểm soát sinh học">Kiểm soát sinh học</option>
                        <option value="Tưới & Chăm sóc">Tưới &amp; Chăm sóc</option>
                        <option value="Đo độ Brix & Khảo sát">Đo độ Brix &amp; Khảo sát</option>
                        <option value="Thu hoạch & Đóng gói">Thu hoạch &amp; Đóng gói</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="f-title" className="block text-sm font-bold text-[#25352B]">
                        Việc đã làm hôm nay
                      </label>
                      <input
                        id="f-title"
                        type="text"
                        value={diaryTitle}
                        onChange={(e) => setDiaryTitle(e.target.value)}
                        className="mt-1 min-h-[50px] w-full rounded-[12px] border border-[#788A7B] bg-white px-3 text-base"
                      />
                    </div>
                    <div>
                      <label htmlFor="f-detail" className="block text-sm font-bold text-[#25352B]">
                        Ghi chú chi tiết cho người mua xem qua QR
                      </label>
                      <textarea
                        id="f-detail"
                        rows={3}
                        value={diaryDetail}
                        onChange={(e) => setDiaryDetail(e.target.value)}
                        className="mt-1 w-full rounded-[12px] border border-[#788A7B] bg-white p-3 text-base"
                      />
                    </div>
                    <Button type="submit" variant="farmer" className="w-full">
                      Lưu mốc nhật ký vào tem QR
                    </Button>
                  </form>
                </Card>

                <Card className="p-5 lg:col-span-6">
                  <ProductionDiaryTimeline
                    entries={farmDiaries}
                    title={`Nhật ký mùa vụ gần nhất (${farmDiaries.length})`}
                    limit={6}
                  />
                </Card>
              </div>
            ) : null}

            {simpleTab === "quality" ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  {primaryBatch ? <QrPassportCard batch={primaryBatch} /> : null}
                </div>
                <div className="space-y-4 lg:col-span-7">
                  <Card className="space-y-3 p-5">
                    <h2 className="text-xl font-bold text-[#25352B]">Bổ sung hồ sơ chất lượng vườn</h2>
                    <form
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const created = addOrUpdateCertification({
                          farmId: activeFarm.id,
                          standardType: certStd,
                          status: certStatus,
                          scopeSummary: certScope.trim() || `Hồ sơ mẫu bổ sung tại ${activeFarm.name}`,
                        });
                        setCertScope("");
                        notifySuccess(`Đã ghi nhận hồ sơ ${created.certificateCode}.`);
                      }}
                    >
                      <select
                        value={certStd}
                        onChange={(e) => setCertStd(e.target.value as FarmCertification["standardType"])}
                        aria-label="Chọn loại tiêu chuẩn"
                        className="min-h-[46px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      >
                        <option value="VietGAP">VietGAP</option>
                        <option value="OCOP">OCOP</option>
                        <option value="Mã số vùng trồng">Mã số vùng trồng</option>
                        <option value="ATTP cơ sở">ATTP cơ sở</option>
                      </select>
                      <select
                        value={certStatus}
                        onChange={(e) => setCertStatus(e.target.value as CertificationStatus)}
                        aria-label="Trạng thái hồ sơ"
                        className="min-h-[46px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      >
                        <option value="pending_review">Chờ đối chiếu hồ sơ</option>
                        <option value="ocop_declared_demo">Tự công bố (chờ đối chiếu)</option>
                      </select>
                      <input
                        type="text"
                        value={certScope}
                        onChange={(e) => setCertScope(e.target.value)}
                        placeholder="Ghi chú phạm vi thửa đất / sản lượng..."
                        className="min-h-[46px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm sm:col-span-2"
                      />
                      <Button type="submit" variant="farmer" className="sm:col-span-2">
                        Lưu hồ sơ chất lượng
                      </Button>
                    </form>
                  </Card>

                  <div className="space-y-3">
                    {farmCerts.map((cert) => (
                      <CertificationCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {simpleTab === "support" ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <Card className="space-y-4 p-5 lg:col-span-6">
                  <h2 className="text-xl font-bold text-[#25352B]">Gửi yêu cầu thanh niên hỗ trợ số hóa</h2>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const created = submitSupportRequest({
                        farmId: activeFarm.id,
                        farmName: activeFarm.name,
                        title: `${reqNeedType} — ${activeFarm.name}`,
                        needType: reqNeedType,
                        preferredTime: reqTime,
                        locationMode: reqMode,
                        note: reqNote.trim() || "Cần thanh niên hỗ trợ chụp ảnh và gắn mã QR mùa vụ mới.",
                      });
                      setReqNote("");
                      notifySuccess(`Đã gửi yêu cầu ${created.id} tới Điều phối viên.`);
                    }}
                  >
                    <select
                      value={reqNeedType}
                      onChange={(e) => setReqNeedType(e.target.value)}
                      aria-label="Loại hỗ trợ"
                      className="min-h-[48px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-base"
                    >
                      <option value="Chụp ảnh & AI đăng bán">Chụp ảnh &amp; AI đăng bán</option>
                      <option value="Thiết lập QR & Nhật ký">Thiết lập QR &amp; Nhật ký</option>
                      <option value="Livestream bán hàng">Livestream bán hàng tại vườn</option>
                    </select>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={reqTime}
                        onChange={(e) => setReqTime(e.target.value)}
                        aria-label="Thời gian mong muốn"
                        className="min-h-[48px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      />
                      <select
                        value={reqMode}
                        onChange={(e) => setReqMode(e.target.value as "Tại vườn" | "Online")}
                        aria-label="Hình thức"
                        className="min-h-[48px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                      >
                        <option value="Tại vườn">Tại vườn</option>
                        <option value="Online">Online (Gọi video)</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="Bác ghi ngắn việc cần thanh niên phụ giúp..."
                      className="w-full rounded-[10px] border border-[#788A7B] bg-white p-3 text-base"
                    />
                    <Button type="submit" variant="farmer" className="w-full">
                      Gửi yêu cầu hỗ trợ
                    </Button>
                  </form>
                </Card>

                <Card className="space-y-4 p-5 lg:col-span-6">
                  <h2 className="text-xl font-bold text-[#25352B]">
                    Nhiệm vụ thanh niên &amp; xác nhận hoàn thành ({farmMissions.length})
                  </h2>
                  <div className="space-y-3">
                    {farmMissions.map((m) => (
                      <div key={m.id} className="rounded-[12px] border border-[#EAEFE6] bg-[#FAF8F1] p-3.5 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-[#25352B]">{m.title}</span>
                          <Badge tone={m.status === "coordinator_approved" ? "success" : "info"}>
                            {m.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-[#52645A]">
                          Phụ trách: {m.assigneeName ?? "Chờ nhận"} · {m.submittedHours}/{m.expectedHours} giờ
                        </p>
                        {m.status === "submitted" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            className="mt-2"
                            onClick={() => {
                              confirmMissionByFarmer(m.id);
                              notifySuccess(`Bác đã xác nhận hoàn thành thực tế cho nhiệm vụ ${m.id}.`);
                            }}
                          >
                            Chủ vườn xác nhận đã hỗ trợ
                          </Button>
                        ) : null}
                      </div>
                    ))}

                    {farmSupportReqs.map((r) => (
                      <div key={r.id} className="rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs">
                        <p className="font-bold text-[#245B3D]">
                          {r.id} · {r.needType} ({r.locationMode})
                        </p>
                        <p className="text-[#52645A]">{r.preferredTime} — {r.status}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}
          </>
        ) : (
          /* ERP / HTX FULL MANAGEMENT MODE */
          <>
            {erpTab === "overview" ? (
              <FarmerOverviewAnalytics farmIdFilter={activeFarm.id} farmName={activeFarm.name} />
            ) : null}

            {erpTab === "commerce" ? (
              <FarmerCommercePanel
                farmId={activeFarm.id}
                farmName={activeFarm.name}
                ownerName={activeFarm.ownerName}
              />
            ) : null}

            {erpTab === "inventory" ? (
              <FarmerInventoryProcurementPanel
                farmId={activeFarm.id}
                actorName={authUser?.name ?? activeFarm.ownerName}
              />
            ) : null}

            {erpTab === "coop" ? (
              <FarmerCoopFinancePanel farmId={activeFarm.id} farmName={activeFarm.name} />
            ) : null}

            {erpTab === "quality" ? (
              <QualityCenterPanel
                records={credentialRecords}
                roleMode="farmer"
                onChangeStatus={(id, nextStatus, note) => {
                  updateCredentialLifecycle(id, nextStatus, note, activeFarm.ownerName);
                  notifySuccess(`Đã cập nhật trạng thái hồ sơ ${id}.`);
                }}
                onRenew={(id) => {
                  const created = renewCredentialRecord(id, activeFarm.ownerName);
                  if (created) notifySuccess(`Đã tạo bản ghi gia hạn ${created.id}.`);
                }}
              />
            ) : null}

            {erpTab === "seasons" ? (
              <div className="space-y-6">
                <Card className="space-y-4 p-5">
                  <h2 className="text-lg font-bold text-[#25352B]">
                    Quản lý mùa vụ của {activeFarm.name} ({farmSeasons.length})
                  </h2>
                  <form
                    className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSeasonCrop.trim() || !newSeasonName.trim()) {
                        notifyError("Vui lòng nhập tên cây trồng và tên mùa vụ.");
                        return;
                      }
                      const created = createProductionSeason({
                        farmId: activeFarm.id,
                        cropName: newSeasonCrop.trim(),
                        variety: activeFarm.mainCrops[0] ?? "Giống đặc sản",
                        seasonName: newSeasonName.trim(),
                        expectedHarvestDate: "30/01/2027",
                        areaHa: activeFarm.areaHa,
                        summary: `Mùa vụ mới tạo từ chế độ quản trị HTX (${activeFarm.name}).`,
                      });
                      setNewSeasonCrop("");
                      setNewSeasonName("");
                      notifySuccess(`Đã khởi tạo mùa vụ ${created.seasonName}.`);
                    }}
                  >
                    <input
                      type="text"
                      value={newSeasonCrop}
                      onChange={(e) => setNewSeasonCrop(e.target.value)}
                      placeholder="Cây trồng (VD: Bưởi da xanh)..."
                      className="min-h-[42px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                    />
                    <input
                      type="text"
                      value={newSeasonName}
                      onChange={(e) => setNewSeasonName(e.target.value)}
                      placeholder="Tên mùa vụ (VD: Vụ Xuân 2027)..."
                      className="min-h-[42px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
                    />
                    <Button type="submit" variant="primary" size="md">
                      Tạo mùa vụ mới
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {farmSeasons.map((s) => (
                      <div key={s.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#25352B]">{s.seasonName}</span>
                          <Badge tone="info">{s.status}</Badge>
                        </div>
                        <p className="mt-1 text-[#52645A]">
                          {s.cropName} ({s.variety}) · {s.areaHa} ha · Thu hoạch dự kiến: {s.expectedHarvestDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <ProductionDiaryTimeline
                    entries={farmDiaries}
                    title={`Nhật ký canh tác & truy xuất (${farmDiaries.length})`}
                    limit={10}
                  />
                </Card>
              </div>
            ) : null}

            {erpTab === "support" ? (
              <Card className="space-y-4 p-5">
                <h2 className="text-lg font-bold text-[#25352B]">
                  Nhiệm vụ thanh niên &amp; Yêu cầu hỗ trợ ({farmMissions.length} nhiệm vụ)
                </h2>
                <div className="space-y-2.5 text-sm">
                  {farmMissions.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#EAEFE6] bg-[#FAF8F1] p-3.5"
                    >
                      <div>
                        <p className="font-bold text-[#25352B]">{m.title}</p>
                        <p className="text-xs text-[#52645A]">
                          {m.assigneeName ?? "Chờ phân công"} · {m.submittedHours}h · {m.location}
                        </p>
                      </div>
                      {m.status === "submitted" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            confirmMissionByFarmer(m.id);
                            notifySuccess(`Đã xác nhận hoàn thành nhiệm vụ ${m.id}.`);
                          }}
                        >
                          Xác nhận hoàn thành
                        </Button>
                      ) : (
                        <Badge tone={m.status === "coordinator_approved" ? "success" : "info"}>
                          {m.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

export default function FarmerWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang mở Không gian Nhà vườn...
        </div>
      }
    >
      <FarmerWorkspaceContent />
    </Suspense>
  );
}
