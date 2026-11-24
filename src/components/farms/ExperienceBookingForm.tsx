"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import type { Farm } from "@/types/naifarm";
import { Badge, Button, Card } from "@/components/ui/Primitives";

export function ExperienceBookingForm({ farm }: { farm: Farm }) {
  const { submitExperienceBooking, experienceBookings } = useDemoStore();
  const pkg = farm.experiences[0];
  const [guestName, setGuestName] = useState("Ngọc Linh (Demo)");
  const [guestCount, setGuestCount] = useState(2);
  const [dateLabel, setDateLabel] = useState("2026-12-06");
  const [note, setNote] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!pkg) return null;

  const farmBookings = experienceBookings.filter((b) => b.farmId === farm.id);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="gold">Trải nghiệm sinh thái (Demo)</Badge>
          <h3 className="mt-2 text-lg font-bold text-[#25352B]">{pkg.title}</h3>
          <p className="mt-1 text-sm text-[#52645A]">
            {pkg.duration} · Tối đa {pkg.maxGuests} khách ·{" "}
            <span className="tabular-nums font-bold text-[#245B3D]">
              {formatVnd(pkg.pricePerGuest)}/khách
            </span>
          </p>
        </div>
      </div>

      <p className="mt-3 rounded-[10px] bg-[#F5F3E9] px-3 py-2 text-xs text-[#52645A]">
        Lưu ý an toàn: {pkg.safetyNote} Mọi yêu cầu đặt lịch ở trạng thái chờ chủ vườn xác nhận,
        không tự xác nhận tức thì.
      </p>

      <form
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const created = submitExperienceBooking({
            farmId: farm.id,
            farmName: farm.name,
            packageTitle: pkg.title,
            guestName: guestName.trim() || "Khách tham quan (Demo)",
            guestCount,
            dateLabel,
            note: note.trim() || "Đăng ký tham quan vườn mẫu",
          });
          setSubmittedId(created.id);
          setNote("");
          toast.success(`Đã gửi yêu cầu ${created.id} — đang chờ ${farm.ownerName} xác nhận.`);
        }}
      >
        <div>
          <label htmlFor={`guest-${farm.id}`} className="block text-xs font-semibold text-[#25352B]">
            Tên người đại diện (Demo)
          </label>
          <input
            id={`guest-${farm.id}`}
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor={`count-${farm.id}`} className="block text-xs font-semibold text-[#25352B]">
            Số khách (1–{pkg.maxGuests})
          </label>
          <div className="relative mt-1 flex items-center">
            <Users className="pointer-events-none absolute left-3 h-4 w-4 text-[#52645A]" aria-hidden="true" />
            <input
              id={`count-${farm.id}`}
              type="number"
              min={1}
              max={pkg.maxGuests}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.min(pkg.maxGuests, Math.max(1, Number(e.target.value) || 1)))
              }
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pl-9 pr-3 text-sm tabular-nums"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`date-${farm.id}`} className="block text-xs font-semibold text-[#25352B]">
            Ngày dự kiến
          </label>
          <div className="relative mt-1 flex items-center">
            <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-[#52645A]" aria-hidden="true" />
            <input
              id={`date-${farm.id}`}
              type="date"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`note-${farm.id}`} className="block text-xs font-semibold text-[#25352B]">
            Ghi chú nhóm tham quan
          </label>
          <input
            id={`note-${farm.id}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Đi gia đình 4 người, muốn trải nghiệm cắt bưởi..."
            className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
          />
        </div>

        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Gửi yêu cầu đặt lịch
          </Button>
        </div>
      </form>

      {submittedId ? (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#E6F3E9] px-3 py-2.5 text-sm font-medium text-[#24603B]">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Đã ghi nhận yêu cầu {submittedId} — Chờ nhà vườn xác nhận.</span>
        </div>
      ) : null}

      {farmBookings.length > 0 ? (
        <div className="mt-4 border-t border-[#D6DED2] pt-3">
          <p className="text-xs font-semibold text-[#52645A]">
            Lịch hẹn gần đây tại {farm.name} ({farmBookings.length})
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-[#25352B]">
            {farmBookings.slice(0, 3).map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F5F3E9] px-3 py-2"
              >
                <span>
                  <strong className="tabular-nums">{b.id}</strong> · {b.guestName} ({b.guestCount} người ·{" "}
                  {b.dateLabel})
                </span>
                <Badge tone="warning">{b.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
