"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  KeyRound,
  PackageCheck,
  PlayCircle,
  Plus,
  QrCode,
  Radio,
  ShoppingBasket,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { cn, formatVnd } from "@/lib/format";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";

export default function LiveStoryRoomPage() {
  const {
    hydrated,
    activeWorkspace,
    livestreams,
    products,
    farms,
    addToCart,
    createLivestreamSession,
  } = useDemoStore();

  const [activeSessionId, setActiveSessionId] = useState(livestreams[0]?.id ?? "");
  const [angleIndex, setAngleIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newFarmId, setNewFarmId] = useState(farms[1]?.id ?? "farm-ba-tu-demo");
  const [newSchedule, setNewSchedule] = useState("29/11/2026 · 09:30 (Demo)");
  const [newYouth, setNewYouth] = useState("Minh Anh & Tuấn");
  const [newProductId, setNewProductId] = useState("P01");

  const activeSession = livestreams.find((l) => l.id === activeSessionId) ?? livestreams[0];
  const activeAngle = activeSession?.angles[angleIndex] ?? activeSession?.angles[0];
  const pinnedProducts = products.filter((p) => activeSession?.pinnedProductIds.includes(p.id));

  const isBuyerRole = activeWorkspace === "W01";
  const isFarmerRole = activeWorkspace === "W02";
  const isYouthRole = activeWorkspace === "W03";
  const isCoordOrOrgRole = activeWorkspace === "W04" || activeWorkspace === "W05";
  const canScheduleLive = isFarmerRole || isYouthRole || isCoordOrOrgRole;

  const roleHeaderCopy = isFarmerRole
    ? {
        badge: "W02 · Nhà nông phát sóng tại vườn",
        title: "Livestream Giới thiệu Vườn & Ghim Nông sản",
        subtitle:
          "Chú tạo lịch phát trực tiếp từ vườn, chọn sản phẩm đang có hàng và mời thanh niên hỗ trợ kỹ thuật.",
        ctaLabel: "Tạo phiên Livestream tại vườn",
        formHeading: "Lên lịch phiên Livestream của Nhà vườn (W02)",
      }
    : isYouthRole
    ? {
        badge: "W03 · Thanh niên Tình nguyện đồng hành phát sóng",
        title: "Phòng OCOP Live Story — Hỗ trợ Nhà vườn lên sóng",
        subtitle:
          "Nhận lịch phát cùng bác nông dân, kiểm tra mã QR gắn trên giỏ hàng và đồng hành quay 3 góc vườn.",
        ctaLabel: "Tạo lịch hỗ trợ Live cho vườn (W03)",
        formHeading: "Lên lịch phiên đồng hành Livestream (TNV W03)",
      }
    : activeWorkspace === "W04"
    ? {
        badge: "W04 · Điều phối lịch phát sóng cụm vườn",
        title: "Giám sát & Điều phối Lịch OCOP Live Cơ sở",
        subtitle:
          "Theo dõi lịch phát sóng tại các nhà vườn trong đơn vị phụ trách và điều phối thanh niên đồng hành.",
        ctaLabel: "Tạo lịch Live cụm vườn (W04)",
        formHeading: "Tạo lịch Livestream điều phối cụm (W04)",
      }
    : activeWorkspace === "W05"
    ? {
        badge: "W05 · Hợp tác xã & Đối tác OCOP Live",
        title: "Phòng Giới thiệu Nông sản HTX & Phiên Live Chuyên đề",
        subtitle:
          "Lên lịch các buổi giới thiệu lô nông sản tập trung của xã viên HTX Tân Triều & Xuân Lộc.",
        ctaLabel: "Tạo lịch phiên HTX (W05)",
        formHeading: "Tạo lịch giới thiệu lô hàng HTX (W05)",
      }
    : activeWorkspace === "W06"
    ? {
        badge: "W06 · Giám sát minh bạch nội dung Live (Chỉ đọc)",
        title: "Giám sát Trạng thái Phát sóng & Nhãn minh bạch",
        subtitle:
          "Kiểm tra các phiên Replay Demo, lịch dự kiến và liên kết lô truy xuất QR (không tạo/mua hàng ở quyền quản trị).",
        ctaLabel: "",
        formHeading: "",
      }
    : {
        badge: "R6 · S15 & S16 · Khách hàng xem Livestream & Mua ngay",
        title: "Phòng Livestream Nông sản Tại vườn & Lịch Phát sóng (Demo)",
        subtitle:
          "Xem 3 góc quay tại vườn, kiểm tra mã lô QR minh bạch và thêm nhanh nông sản ghim vào giỏ hàng.",
        ctaLabel: "",
        formHeading: "",
      };

  const mainContent = (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="info">{roleHeaderCopy.badge}</Badge>
          <h2 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
            {roleHeaderCopy.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#52645A]">{roleHeaderCopy.subtitle}</p>
        </div>

        {canScheduleLive ? (
          <Button
            variant={isFarmerRole ? "farmer" : "primary"}
            onClick={() => setShowCreateForm((v) => !v)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>{showCreateForm ? "Đóng mẫu tạo lịch" : roleHeaderCopy.ctaLabel}</span>
          </Button>
        ) : null}
      </div>

      <DemoBanner
        title="Trạng thái phát sóng trung thực"
        detail="Phiên hiện tại được gắn nhãn Phát lại minh họa (Replay Demo); lịch sắp tới hiển thị rõ 'Lịch dự kiến Demo' và không giả lập lượng người xem hay bình luận ảo."
      />

      {canScheduleLive && showCreateForm ? (
        <Card className="border-2 border-[#245B3D]/25 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-[#25352B]">{roleHeaderCopy.formHeading}</h3>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) {
                toast.error("Vui lòng nhập tiêu đề phiên livestream.");
                return;
              }
              const created = createLivestreamSession({
                title: newTitle.trim(),
                farmId: newFarmId,
                scheduleLabel: newSchedule,
                hostYouth: isFarmerRole
                  ? newYouth.trim() || "Chủ vườn tự phát (có thể gọi TNV sau)"
                  : newYouth.trim() || "Minh Anh & Tuấn",
                pinnedProductId: newProductId,
                summary: isFarmerRole
                  ? "Phiên phát trực tiếp từ vườn do chủ vườn đăng ký, gắn sẵn tem QR lô hàng (Demo)."
                  : "Phiên live do thanh niên & điều phối viên đồng hành cùng nhà vườn giới thiệu đặc sản Đồng Nai (Demo).",
              });
              setActiveSessionId(created.id);
              setAngleIndex(0);
              setShowCreateForm(false);
              setNewTitle("");
              toast.success(`Đã tạo lịch ${created.id} liên kết sản phẩm ${newProductId}.`);
            }}
          >
            <div className="sm:col-span-2">
              <label htmlFor="live-title" className="block text-xs font-semibold text-[#25352B]">
                Tiêu đề phiên phát sóng
              </label>
              <input
                id="live-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Cắt chôm chôm sáng sớm tại vườn Ba Tư"
                className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="live-farm" className="block text-xs font-semibold text-[#25352B]">
                Nhà vườn
              </label>
              <select
                id="live-farm"
                value={newFarmId}
                onChange={(e) => setNewFarmId(e.target.value)}
                className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="live-prod" className="block text-xs font-semibold text-[#25352B]">
                Sản phẩm ghim
              </label>
              <select
                id="live-prod"
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="live-time" className="block text-xs font-semibold text-[#25352B]">
                Thời gian dự kiến
              </label>
              <input
                id="live-time"
                type="text"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="live-youth" className="block text-xs font-semibold text-[#25352B]">
                {isFarmerRole ? "Thanh niên hỗ trợ (nếu cần)" : "Người dẫn phiên / TNV phụ trách"}
              </label>
              <input
                id="live-youth"
                type="text"
                value={newYouth}
                onChange={(e) => setNewYouth(e.target.value)}
                className="mt-1 min-h-[46px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="flex items-end sm:col-span-2">
              <Button
                type="submit"
                variant={isFarmerRole ? "farmer" : "primary"}
                className="w-full sm:w-auto"
              >
                Lưu lịch Livestream (Demo)
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Main Live Story Room Stage + Role-Aware Pinned Products Sidebar */}
      {activeSession ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="overflow-hidden lg:col-span-8">
            <div className="relative aspect-[16/9] bg-[#25352B]">
              <img
                src={activeAngle?.image || "/images/stitch/stitch-44.jpg"}
                alt={activeSession.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <Badge tone={activeSession.status === "replay_demo" ? "info" : "gold"}>
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {activeSession.status === "replay_demo"
                      ? "Phát lại minh họa (Replay Demo)"
                      : "Lịch phát dự kiến (Chưa live)"}
                  </span>
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                {activeSession.angles.map((ang, idx) => (
                  <button
                    key={ang.id}
                    type="button"
                    onClick={() => setAngleIndex(idx)}
                    className={cn(
                      "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                      angleIndex === idx
                        ? "bg-[#245B3D] text-white"
                        : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B]"
                    )}
                  >
                    <Video className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{ang.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#25352B]">{activeSession.title}</h3>
                <p className="mt-1 text-xs font-medium text-[#52645A]">
                  {activeSession.farmName} · Chủ vườn: {activeSession.farmerName} · Phụ trách:{" "}
                  {activeSession.hostYouth}
                </p>
                <p className="mt-2 text-sm text-[#25352B]">
                  {activeAngle?.caption || activeSession.summary}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4 lg:col-span-4">
            <Card className="p-4">
              <h3 className="text-base font-bold text-[#25352B]">
                {isBuyerRole
                  ? `Sản phẩm ghim trong phiên (${pinnedProducts.length})`
                  : `Sản phẩm đang ghim & Tem QR (${pinnedProducts.length})`}
              </h3>
              <div className="mt-3 space-y-3">
                {pinnedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-20 w-20 shrink-0 rounded-[10px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="line-clamp-2 text-sm font-bold text-[#25352B] hover:text-[#245B3D]"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-0.5 tabular-nums text-sm font-bold text-[#245B3D]">
                        {formatVnd(p.priceVnd)}/{p.unitLabel}
                      </p>

                      {isBuyerRole ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              const r = addToCart(p.id, 1);
                              if (r.ok) toast.success(r.message);
                              else toast.error(r.message);
                            }}
                          >
                            <ShoppingBasket className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Mua</span>
                          </Button>
                          <Link
                            href={`/trace/${p.batchCode}`}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#245B3D]"
                          >
                            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>QR</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Link
                            href={`/trace/${p.batchCode}`}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-[10px] border border-[#245B3D] bg-white px-2.5 text-xs font-semibold text-[#245B3D]"
                          >
                            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Kiểm tra QR</span>
                          </Link>
                          <Link
                            href={`/products/${p.slug}`}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#25352B]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Trang bán</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Upcoming Schedule List */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
          <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <span>Danh sách Lịch phát sóng OCOP Live ({livestreams.length})</span>
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {livestreams.map((s) => {
            const reminded = remindedIds.includes(s.id);
            return (
              <Card
                key={s.id}
                className={cn(
                  "flex flex-col justify-between p-4 transition-colors",
                  s.id === activeSession?.id ? "border-[#245B3D] bg-[#EAF0E5]/40" : ""
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={s.status === "replay_demo" ? "info" : "gold"}>
                      <Radio className="h-3 w-3" aria-hidden="true" />
                      <span>{s.status === "replay_demo" ? "Replay Demo" : "Lịch dự kiến"}</span>
                    </Badge>
                    <span className="text-xs font-semibold text-[#52645A]">{s.id}</span>
                  </div>
                  <h4 className="mt-2 font-bold text-[#25352B]">{s.title}</h4>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {s.farmName} · {s.scheduleLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#245B3D]">Phụ trách: {s.hostYouth}</p>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant={s.id === activeSession?.id ? "primary" : "secondary"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setAngleIndex(0);
                    }}
                  >
                    {s.id === activeSession?.id ? "Đang xem phiên này" : "Mở trong phòng Live"}
                  </Button>
                  {isBuyerRole && s.status === "scheduled" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border border-[#D6DED2]"
                      onClick={() => {
                        setRemindedIds((prev) =>
                          prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                        );
                        toast.success(
                          reminded
                            ? `Đã tắt nhắc lịch phiên ${s.id}.`
                            : `Đã bật nhắc xem phiên ${s.id} (Demo).`
                        );
                      }}
                    >
                      {reminded ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#24603B]" aria-hidden="true" />
                      ) : (
                        <Bell className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                      )}
                      <span>{reminded ? "Đã đặt nhắc lịch" : "Nhắc tôi khi phát sóng"}</span>
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
        Đang tải Phòng Livestream OCOP...
      </div>
    );
  }

  if (isFarmerRole) {
    return (
      <WorkspaceShell
        workspaceId="W02"
        title="Livestream Nhà vườn"
        navItems={[
          {
            label: "Quay về Không gian Nhà vườn",
            href: "/farmer",
            icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: "Đăng bán nhanh (3 bước)",
            href: "/farmer/publish",
            icon: <Camera className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: "Livestream tại vườn",
            href: "/live",
            active: true,
            icon: <Radio className="h-5 w-5" aria-hidden="true" />,
          },
        ]}
      >
        {mainContent}
      </WorkspaceShell>
    );
  }

  if (isYouthRole) {
    return (
      <WorkspaceShell
        workspaceId="W03"
        title="Phòng Livestream Thanh niên"
        navItems={[
          {
            label: "Bảng nhiệm vụ Số hóa",
            href: "/volunteer",
            icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Youth Impact Pass",
            href: "/volunteer#impact-pass",
            icon: <Award className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Góc học mở & 2D",
            href: "/learn",
            icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Phòng Livestream Đồng hành",
            href: "/live",
            active: true,
            icon: <Radio className="h-4 w-4" aria-hidden="true" />,
          },
        ]}
      >
        {mainContent}
      </WorkspaceShell>
    );
  }

  if (activeWorkspace === "W04" || activeWorkspace === "W05" || activeWorkspace === "W06") {
    const backHref =
      activeWorkspace === "W04"
        ? "/coordinator"
        : activeWorkspace === "W05"
        ? "/organization"
        : "/admin";
    const backLabel =
      activeWorkspace === "W04"
        ? "Về Điều phối Cơ sở (W04)"
        : activeWorkspace === "W05"
        ? "Về Không gian Tổ chức (W05)"
        : "Về Quản trị Phân quyền (W06)";
    const BackIcon =
      activeWorkspace === "W04"
        ? ClipboardCheck
        : activeWorkspace === "W05"
        ? Building2
        : KeyRound;

    return (
      <WorkspaceShell
        workspaceId={activeWorkspace}
        title={roleHeaderCopy.title}
        navItems={[
          {
            label: backLabel,
            href: backHref,
            icon: <BackIcon className="h-4 w-4" aria-hidden="true" />,
          },
          {
            label: "Giám sát OCOP Live",
            href: "/live",
            active: true,
            icon: <Radio className="h-4 w-4" aria-hidden="true" />,
          },
        ]}
      >
        {mainContent}
      </WorkspaceShell>
    );
  }

  return <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-8">{mainContent}</div>;
}
