"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildIcsDocument, triggerIcsDownload } from "@/lib/clock/vn-clock";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { formatVnd } from "@/lib/format";
import { notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import type { CalendarEvent } from "@/types/naifarm";

export default function BookingConfirmationDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = decodeURIComponent(params.id);
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    hydrated,
    experienceBookings,
    updateExperienceBookingStatus,
  } = useDemoStore();

  const booking = useMemo(
    () => experienceBookings.find((b) => b.id === bookingId),
    [experienceBookings, bookingId],
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading booking record..." : "Đang tải hồ sơ đặt lịch..."}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-[960px] space-y-4 px-4 py-12">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-[#25352B]">
            {isEn ? "Booking record not found" : "Không tìm thấy mã đặt lịch"}
          </h1>
          <Link
            href={buildLocalizedHref("/account", locale)}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white"
          >
            {isEn ? "Back to Account" : "Về Tài khoản"}
          </Link>
        </Card>
      </div>
    );
  }

  const handleExportIcs = () => {
    const startIso = `${booking.dateLabel.slice(0, 10)}T08:30:00+07:00`;
    const endIso = `${booking.dateLabel.slice(0, 10)}T11:30:00+07:00`;
    const ev: CalendarEvent = {
      id: `BOOK-${booking.id}`,
      title: `${booking.packageTitle} (${booking.farmName})`,
      titleEn: `${booking.packageTitleEn ?? booking.packageTitle} (${booking.farmName})`,
      description: booking.note,
      descriptionEn: booking.note,
      eventKind: "tour",
      classification: "platform_initiative",
      organizer: booking.farmName,
      status: booking.status === "Đã hủy" ? "cancelled" : "scheduled",
      startIso,
      endIso,
      allDay: false,
      timezone: "Asia/Ho_Chi_Minh",
      priority: "high",
      visibility: "public",
      locationLabel: booking.farmName,
      linkedRoute: `/account/bookings/${booking.id}`,
    };
    const ics = buildIcsDocument([ev], locale, `NaiFarm Booking ${booking.id}`);
    triggerIcsDownload(`naifarm-tour-${booking.id}.ics`, ics);
    notifySuccess(t.toasts.icsDownloaded);
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={buildLocalizedHref("/account", locale)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isEn ? "Back to Account" : "Về Không gian Cá nhân"}</span>
        </Link>
        <Button variant="secondary" size="sm" onClick={handleExportIcs}>
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          <span>{t.events.exportIcsBtn}</span>
        </Button>
      </div>

      <DemoBanner title={t.brand.experienceSpaceBadge} detail={t.explore.bookingExperienceNotice} />

      <Card className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D6DED2] pb-4">
          <div>
            <p className="text-xs font-bold text-[#245B3D] tabular-nums">{booking.id}</p>
            <h1 className="mt-1 font-editorial text-2xl font-bold text-[#25352B]">
              {isEn && booking.packageTitleEn ? booking.packageTitleEn : booking.packageTitle}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#52645A]">
              <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              {booking.farmName}
            </p>
          </div>
          <Badge tone={booking.status === "Đã hủy" ? "danger" : booking.status === "Đã check-in" ? "success" : "gold"}>
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[12px] bg-[#FAF8F1] p-3">
            <p className="text-xs text-[#52645A]">{isEn ? "Lead guest" : "Người đại diện"}</p>
            <p className="mt-1 font-bold text-[#25352B]">{booking.guestName}</p>
          </div>
          <div className="rounded-[12px] bg-[#FAF8F1] p-3">
            <p className="text-xs text-[#52645A]">{isEn ? "Guests" : "Số lượng khách"}</p>
            <p className="mt-1 inline-flex items-center gap-1 font-bold text-[#25352B]">
              <Users className="h-4 w-4 text-[#245B3D]" />
              {booking.guestCount} ({booking.adultCount ?? booking.guestCount} NL / {booking.childCount ?? 0} TE)
            </p>
          </div>
          <div className="rounded-[12px] bg-[#FAF8F1] p-3">
            <p className="text-xs text-[#52645A]">{isEn ? "Schedule date" : "Lịch dự kiến"}</p>
            <p className="mt-1 font-bold text-[#25352B]">{booking.dateLabel}</p>
          </div>
          <div className="rounded-[12px] bg-[#FAF8F1] p-3">
            <p className="text-xs text-[#52645A]">{isEn ? "Estimate" : "Tạm tính tham khảo"}</p>
            <p className="mt-1 font-bold tabular-nums text-[#245B3D]">
              {booking.totalEstimateVnd ? formatVnd(booking.totalEstimateVnd, locale, showUsd) : isEn ? "By host confirmation" : "Theo xác nhận vườn"}
            </p>
          </div>
        </div>

        {booking.allergenNote || booking.schoolGroup ? (
          <div className="rounded-[12px] border border-[#D6DED2] bg-[#EAF0E5]/50 p-3.5 text-xs text-[#25352B]">
            {booking.allergenNote ? (
              <p>
                <strong>{t.commerce.allergenPrefix}</strong> {booking.allergenNote}
              </p>
            ) : null}
            {booking.schoolGroup ? (
              <p className="mt-1 inline-flex items-center gap-1 font-semibold text-[#245B3D]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {isEn
                  ? `School supervised group · Guardian consent: ${booking.schoolConsentVerified ? "Verified" : "Pending"}`
                  : `Đoàn trường học · Đồng thuận phụ huynh: ${booking.schoolConsentVerified ? "Đã xác nhận" : "Chưa xác nhận"}`}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2.5 border-t border-[#D6DED2] pt-4">
          {booking.status === "Chờ nhà vườn xác nhận" || booking.status === "Đã xác nhận" ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateExperienceBookingStatus(booking.id, "Đã check-in");
                  notifySuccess(isEn ? "Checked in at orchard gate." : "Đã check-in thành công tại cổng vườn.");
                }}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>{isEn ? "Mark check-in" : "Check-in tại vườn"}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  updateExperienceBookingStatus(booking.id, "Đề nghị đổi ca");
                  notifySuccess(isEn ? "Reschedule request recorded." : "Đã gửi đề nghị đổi ca cho chủ vườn.");
                }}
              >
                {isEn ? "Request reschedule" : "Đề nghị đổi ca"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  updateExperienceBookingStatus(booking.id, "Đã hủy");
                  notifySuccess(isEn ? "Booking cancelled." : "Đã hủy lịch tham quan.");
                }}
              >
                {isEn ? "Cancel booking" : "Hủy lịch"}
              </Button>
            </>
          ) : null}
          {booking.tourSlug ? (
            <Link
              href={buildLocalizedHref(`/experiences/${booking.tourSlug}`, locale)}
              className="inline-flex min-h-[40px] items-center rounded-[12px] border border-[#D6DED2] bg-white px-3.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              {isEn ? "View tour itinerary" : "Xem lại lịch trình tour"}
            </Link>
          ) : null}
        </div>

        {/* Review post-check-in */}
        {booking.status === "Đã check-in" ? (
          <form
            className="space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateExperienceBookingStatus(booking.id, "Đã check-in", {
                rating: reviewRating,
                comment: reviewComment.trim() || (isEn ? "Great orchard hospitality!" : "Chủ vườn nhiệt tình, nông sản tươi ngon."),
              });
              notifySuccess(isEn ? "Thank you for your tour feedback!" : "Cảm ơn đánh giá sau chuyến thăm vườn!");
            }}
          >
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
              <Star className="h-4 w-4 text-[#D7A34D]" aria-hidden="true" />
              <span>{isEn ? "Share orchard tour feedback" : "Gửi nhận xét sau check-in"}</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              <select
                aria-label="Rating"
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={isEn ? "Your impression of the guide and orchard..." : "Cảm nhận về hướng dẫn viên và vườn..."}
                className="min-h-[40px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
              />
              <Button type="submit" size="sm" variant="primary">
                {isEn ? "Save feedback" : "Lưu đánh giá"}
              </Button>
            </div>
            {booking.reviewComment ? (
              <p className="text-xs font-semibold text-[#24603B]">
                ★ {booking.reviewRating}/5 — {booking.reviewComment}
              </p>
            ) : null}
          </form>
        ) : null}
      </Card>
    </div>
  );
}
