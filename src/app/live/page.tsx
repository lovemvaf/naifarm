"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, PlayCircle, Plus, QrCode, Radio, ShoppingBasket, Video } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

export default function LiveStoryRoomPage() {
  const { livestreams, products, farms, addToCart, createLivestreamSession } = useDemoStore();
  const [activeSessionId, setActiveSessionId] = useState(livestreams[0]?.id ?? "");
  const [angleIndex, setAngleIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newFarmId, setNewFarmId] = useState(farms[1]?.id ?? "farm-ba-tu-demo");
  const [newSchedule, setNewSchedule] = useState("29/11/2026 · 09:30 (Demo)");
  const [newYouth, setNewYouth] = useState("Minh Anh & Tuấn");
  const [newProductId, setNewProductId] = useState("P01");

  const activeSession = livestreams.find((l) => l.id === activeSessionId) ?? livestreams[0];
  const activeAngle = activeSession?.angles[angleIndex] ?? activeSession?.angles[0];
  const pinnedProducts = products.filter((p) => activeSession?.pinnedProductIds.includes(p.id));

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="info">R6 · S15 & S16 · Phòng OCOP Live Story & Lịch Thanh niên phát sóng</Badge>
          <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
            Phòng Livestream Nông sản Tại vườn & Lịch Phát sóng (Demo)
          </h1>
          <p className="mt-1 text-sm text-[#52645A]">
            Gắn sản phẩm truy xuất mã lô QR ngay trong phiên giới thiệu vườn; không giả lập số người
            xem trực tuyến hay bình luận ảo.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm((v) => !v)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{showCreateForm ? "Đóng mẫu tạo lịch" : "Tạo lịch Live mới (TNV W03)"}</span>
        </Button>
      </div>

      <DemoBanner
        title="Trạng thái phát sóng trung thực"
        detail="Phiên hiện tại được gắn nhãn Phát lại minh họa (Replay Demo); lịch sắp tới hiển thị rõ 'Lịch dự kiến Demo' và không phát video trực tiếp thật."
      />

      {showCreateForm ? (
        <Card className="p-5">
          <h2 className="text-lg font-bold text-[#25352B]">Lên lịch phiên OCOP Live mới (TNV hỗ trợ W03)</h2>
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
                hostYouth: newYouth,
                pinnedProductId: newProductId,
                summary: "Phiên live do thanh niên hỗ trợ đặt lịch giới thiệu nông sản tại vườn (Demo).",
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
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
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
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
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
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} · {p.name}</option>
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
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="live-youth" className="block text-xs font-semibold text-[#25352B]">
                Thanh niên phụ trách
              </label>
              <input
                id="live-youth"
                type="text"
                value={newYouth}
                onChange={(e) => setNewYouth(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="flex items-end sm:col-span-2">
              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                Lưu lịch Livestream (Demo)
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Main Live Story Room Stage + Pinned Products */}
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
                <h2 className="text-xl font-bold text-[#25352B]">{activeSession.title}</h2>
                <p className="mt-1 text-xs font-medium text-[#52645A]">
                  {activeSession.farmName} · Chủ vườn: {activeSession.farmerName} · Hỗ trợ:{" "}
                  {activeSession.hostYouth}
                </p>
                <p className="mt-2 text-sm text-[#25352B]">{activeAngle?.caption || activeSession.summary}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4 lg:col-span-4">
            <Card className="p-4">
              <h2 className="text-base font-bold text-[#25352B]">
                Sản phẩm ghim trong phiên ({pinnedProducts.length})
              </h2>
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
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
          <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
          <span>Danh sách Lịch phát sóng OCOP Live ({livestreams.length})</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {livestreams.map((s) => (
            <Card
              key={s.id}
              className={cn(
                "p-4 transition-colors",
                s.id === activeSession?.id ? "border-[#245B3D] bg-[#EAF0E5]/40" : ""
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone={s.status === "replay_demo" ? "info" : "gold"}>
                  <Radio className="h-3 w-3" aria-hidden="true" />
                  <span>{s.status === "replay_demo" ? "Replay Demo" : "Lịch dự kiến"}</span>
                </Badge>
                <span className="text-xs font-semibold text-[#52645A]">{s.id}</span>
              </div>
              <h3 className="mt-2 font-bold text-[#25352B]">{s.title}</h3>
              <p className="mt-1 text-xs text-[#52645A]">
                {s.farmName} · {s.scheduleLabel}
              </p>
              <p className="mt-1 text-xs text-[#245B3D] font-medium">Phụ trách: {s.hostYouth}</p>
              <Button
                variant={s.id === activeSession?.id ? "primary" : "secondary"}
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  setActiveSessionId(s.id);
                  setAngleIndex(0);
                }}
              >
                {s.id === activeSession?.id ? "Đang xem phiên này" : "Mở trong phòng Live"}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
