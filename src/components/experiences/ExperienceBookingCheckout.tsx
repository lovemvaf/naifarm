"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CloudRain,
  Compass,
  Globe2,
  MapPin,
  Radio,
  ShieldCheck,
  Sprout,
  Star,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import { buildLocalizedHref, sanitizeReturnTo } from "@/lib/navigation/safe-nav";
import { cn, formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import type { Locale } from "@/types/naifarm";

export function ExperienceBookingCheckout({ tourSlug }: { tourSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    hydrated,
    authUser,
    tourPackages,
    farms,
    products,
    livestreams,
    bookTourExperience,
  } = useDemoStore();

  const tour = useMemo(
    () => tourPackages.find((pkg) => pkg.slug === tourSlug) ?? tourPackages[0],
    [tourPackages, tourSlug],
  );

  const safeReturnTo = sanitizeReturnTo(
    searchParams.get("returnTo"),
    "/explore?view=tours",
  );

  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [guestName, setGuestName] = useState(authUser?.name ?? (isEn ? "Alex Nguyen" : "Ngọc Linh"));
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [guideLang, setGuideLang] = useState<Locale>(locale);
  const [allergenNote, setAllergenNote] = useState("");
  const [schoolGroup, setSchoolGroup] = useState(tour?.experienceKind === "school_trip");
  const [schoolConsentVerified, setSchoolConsentVerified] = useState(false);
  const [note, setNote] = useState("");

  const effectiveSlotId = useMemo(() => {
    if (!tour) return "";
    if (selectedSlotId && tour.slots.some((s) => s.id === selectedSlotId)) return selectedSlotId;
    const firstOpen = tour.slots.find((s) => s.status !== "full" && s.capacity - s.bookedCount > 0);
    return firstOpen?.id ?? tour.slots[0]?.id ?? "";
  }, [tour, selectedSlotId]);

  const linkedFarm = useMemo(
    () => farms.find((f) => f.id === tour?.farmId),
    [farms, tour],
  );
  const linkedProducts = useMemo(
    () => products.filter((p) => tour?.linkedProductIds.includes(p.id)).slice(0, 4),
    [products, tour],
  );
  const linkedLives = useMemo(
    () => livestreams.filter((l) => tour?.linkedLiveIds.includes(l.id)).slice(0, 2),
    [livestreams, tour],
  );

  if (!hydrated || !tour) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading agritourism tour..." : "Đang tải chi tiết tour trải nghiệm..."}
      </div>
    );
  }

  const totalEstimateVnd =
    adultCount * tour.adultPriceVnd + childCount * tour.childPriceVnd;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveSlotId) {
      notifyError(isEn ? "Please choose an available slot." : "Vui lòng chọn khung giờ còn chỗ.");
      return;
    }
    if (authUser?.isMinor && !authUser.hasGuardianConsent) {
      notifyError(
        isEn
          ? "Minor learner account requires verified guardian consent before field trip booking."
          : "Tài khoản học sinh dưới 18 tuổi chưa có đồng thuận phụ huynh, chưa thể đặt lịch thực địa.",
      );
      return;
    }
    if (schoolGroup && !schoolConsentVerified) {
      notifyError(
        isEn
          ? "Please confirm school guardian consent and supervision safety checklist."
          : "Nhóm trường học bắt buộc xác nhận đồng thuận phụ huynh & phương án an toàn.",
      );
      return;
    }

    const res = bookTourExperience({
      tourSlug: tour.slug,
      slotId: effectiveSlotId,
      guestName: guestName.trim() || (isEn ? "Visitor" : "Khách tham quan"),
      adultCount,
      childCount,
      language: guideLang,
      allergenNote: allergenNote.trim() || undefined,
      schoolGroup,
      schoolConsentVerified: schoolGroup ? schoolConsentVerified : undefined,
      note: note.trim() || (isEn ? "Orchard visit request" : "Đăng ký tham quan vườn"),
    });

    if (!res.ok || !res.booking) {
      notifyError(res.message);
      return;
    }

    notifySuccess(t.toasts.bookingCreated);
    router.push(buildLocalizedHref(`/account/bookings/${res.booking.id}`, locale));
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-6 lg:px-8">
      {/* Breadcrumb + Safe Return */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
          <Link href={buildLocalizedHref("/", locale)} className="hover:text-[#245B3D]">
            {isEn ? "Home" : "Trang chủ"}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={buildLocalizedHref("/explore?view=tours", locale)} className="hover:text-[#245B3D]">
            {t.nav.explore}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#25352B]">{tour.id}</span>
        </div>

        <Link
          href={buildLocalizedHref(safeReturnTo, locale)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.nav.backButton}</span>
        </Link>
      </nav>

      <DemoBanner title={t.brand.experienceSpaceBadge} detail={t.explore.bookingExperienceNotice} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Details Column */}
        <div className="self-start space-y-6 lg:col-span-7">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-[#25352B]">
              <img
                src={tour.image}
                alt={isEn ? tour.titleEn : tour.titleVi}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <Badge tone="gold">{tour.experienceKind.replace("_", " ")}</Badge>
                <Badge tone="info">
                  {tour.languages.map((l) => l.toUpperCase()).join(" / ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#52645A]">
                <span className="inline-flex items-center gap-1 font-semibold text-[#245B3D]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {tour.farmName} · {tour.administrativeUnitName} ({tour.administrativeUnitCode})
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  {tour.durationHours}h
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#80520C]">
                  <Star className="h-4 w-4 fill-[#D7A34D] text-[#D7A34D]" aria-hidden="true" />
                  {tour.ratingFixture} ({tour.reviewCountFixture})
                </span>
              </div>

              <h1 className="font-editorial text-2xl font-bold text-[#25352B] sm:text-3xl">
                {isEn ? tour.titleEn : tour.titleVi}
              </h1>
              <p className="text-sm leading-relaxed text-[#52645A]">
                {isEn ? tour.summaryEn : tour.summaryVi}
              </p>
              <p className="text-xs font-medium text-[#245B3D]">
                {isEn ? tour.seasonNoteEn : tour.seasonNoteVi}
              </p>

              {/* Includes */}
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                <h2 className="text-sm font-bold text-[#25352B]">
                  {isEn ? "What is included" : "Hoạt động bao gồm"}
                </h2>
                <ul className="mt-2 space-y-1.5 text-xs text-[#52645A]">
                  {(isEn ? tour.includesEn : tour.includesVi).map((inc) => (
                    <li key={inc} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#24603B]" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Hourly Itinerary */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>{t.explore.itineraryHeading}</span>
            </h2>
            <ol className="mt-4 space-y-3">
              {tour.itinerary.map((stop) => (
                <li
                  key={stop.timeLabel}
                  className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5"
                >
                  <span className="shrink-0 rounded-[8px] bg-[#245B3D] px-2.5 py-1 text-xs font-bold text-white tabular-nums h-fit">
                    {stop.timeLabel}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#25352B]">
                      {isEn ? stop.titleEn : stop.titleVi}
                    </p>
                    <p className="mt-1 text-xs text-[#52645A]">
                      {isEn ? stop.detailEn : stop.detailVi}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {/* Safety, Accessibility, Allergen, Weather */}
          <Card className="space-y-3 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <ShieldCheck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>{t.explore.safetyAndAccessibility}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="font-bold text-[#25352B]">
                  {isEn ? "Accessibility" : "Độ dễ tiếp cận"}
                </p>
                <p className="mt-1 text-[#52645A]">
                  {isEn ? tour.accessibilityNoteEn : tour.accessibilityNoteVi}
                </p>
              </div>
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="font-bold text-[#25352B]">{isEn ? "Allergen Note" : "Lưu ý dị ứng"}</p>
                <p className="mt-1 text-[#52645A]">
                  {isEn ? tour.allergenNoteEn : tour.allergenNoteVi}
                </p>
              </div>
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="flex items-center gap-1 font-bold text-[#25352B]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#80520C]" />
                  <span>{isEn ? "Orchard Safety" : "Quy tắc an toàn vườn"}</span>
                </p>
                <p className="mt-1 text-[#52645A]">
                  {isEn ? tour.safetyNoteEn : tour.safetyNoteVi}
                </p>
              </div>
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="flex items-center gap-1 font-bold text-[#25352B]">
                  <CloudRain className="h-3.5 w-3.5 text-[#245B3D]" />
                  <span>{isEn ? "Weather Plan" : "Phương án thời tiết"}</span>
                </p>
                <p className="mt-1 text-[#52645A]">
                  {isEn ? tour.weatherContingencyEn : tour.weatherContingencyVi}
                </p>
              </div>
            </div>
            <p className="rounded-[10px] border border-[#D6DED2] bg-[#EAF0E5]/60 px-3 py-2 text-xs text-[#25352B]">
              <strong>{isEn ? "Meeting point:" : "Điểm tập trung:"}</strong>{" "}
              {isEn ? tour.meetingPointEn : tour.meetingPointVi}
            </p>
          </Card>

          {/* Linked Farm, Produce & Live */}
          <Card className="space-y-3 p-6">
            <h2 className="text-base font-bold text-[#25352B]">
              {isEn ? "Connected Orchard Ecosystem" : "Liên kết Nhà vườn, Nông sản & Live"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {linkedFarm ? (
                <Link
                  href={buildLocalizedHref(`/farms/${linkedFarm.slug}`, locale)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                >
                  <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{linkedFarm.name}</span>
                </Link>
              ) : null}
              {linkedLives.map((lv) => (
                <Link
                  key={lv.id}
                  href={buildLocalizedHref(`/live/${lv.id}`, locale)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                >
                  <Radio className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  <span>{isEn && lv.titleEn ? lv.titleEn : lv.title}</span>
                </Link>
              ))}
            </div>
            {linkedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {linkedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={buildLocalizedHref(`/products/${p.slug}`, locale)}
                    className="flex items-center gap-2.5 rounded-[10px] border border-[#D6DED2] bg-white p-2.5 hover:bg-[#EAF0E5]"
                  >
                    <img
                      src={p.image}
                      alt={localizeProductName(p, locale)}
                      className="h-12 w-12 rounded-[8px] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#25352B]">
                        {localizeProductName(p, locale)}
                      </p>
                      <p className="text-[11px] font-semibold text-[#245B3D]">
                        {formatVnd(p.priceVnd, locale, showUsd)}/{localizeUnit(p.unitLabel, locale)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Right Sticky Booking Checkout Form */}
        <Card className="self-start p-6 lg:sticky lg:top-24 lg:col-span-5">
          <div className="border-b border-[#D6DED2] pb-4">
            <p className="text-xs font-semibold text-[#52645A]">
              {isEn ? "Per guest estimate" : "Mức phí trải nghiệm tham khảo"}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="tabular-nums text-2xl font-bold text-[#245B3D]">
                {formatVnd(tour.adultPriceVnd, locale, showUsd)}
              </span>
              <span className="text-xs text-[#52645A]">
                / {isEn ? "adult" : "người lớn"} ·{" "}
                {formatVnd(tour.childPriceVnd, locale)} / {isEn ? "child" : "trẻ em"}
              </span>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
            {/* Slot Picker */}
            <div>
              <p className="text-xs font-bold text-[#25352B]">{t.explore.slotsHeading}</p>
              <div className="mt-2 space-y-2">
                {tour.slots.map((slot) => {
                  const remaining = Math.max(0, slot.capacity - slot.bookedCount);
                  const full = remaining === 0 || slot.status === "full";
                  const selected = effectiveSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={full}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-[12px] border p-3 text-left text-xs transition cursor-pointer",
                        full
                          ? "border-[#D6DED2] bg-[#F5F3E9] opacity-55 cursor-not-allowed"
                          : selected
                          ? "border-[#245B3D] bg-[#EAF0E5] font-semibold"
                          : "border-[#D6DED2] bg-white hover:border-[#245B3D]",
                      )}
                    >
                      <div>
                        <p className="font-bold text-[#25352B]">
                          {slot.dateIso} · {slot.startTime}–{slot.endTime}
                        </p>
                        <p className="text-[11px] text-[#52645A]">
                          {slot.guideName} · {slot.language.toUpperCase()}
                        </p>
                      </div>
                      <Badge tone={remaining <= 3 ? "warning" : "success"}>
                        {remaining} {isEn ? "left" : "chỗ trống"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="tour-guest-name" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Lead guest / contact name" : "Họ tên người đại diện"}
              </label>
              <input
                id="tour-guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tour-adults" className="block text-xs font-semibold text-[#25352B]">
                  {t.explore.adultCountLabel}
                </label>
                <input
                  id="tour-adults"
                  type="number"
                  min={1}
                  max={tour.maxGuests}
                  value={adultCount}
                  onChange={(e) =>
                    setAdultCount(Math.min(tour.maxGuests, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="tour-children" className="block text-xs font-semibold text-[#25352B]">
                  {t.explore.childCountLabel}
                </label>
                <input
                  id="tour-children"
                  type="number"
                  min={0}
                  max={Math.max(0, tour.maxGuests - adultCount)}
                  value={childCount}
                  onChange={(e) =>
                    setChildCount(
                      Math.min(Math.max(0, tour.maxGuests - adultCount), Math.max(0, Number(e.target.value) || 0)),
                    )
                  }
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tour-lang" className="block text-xs font-semibold text-[#25352B]">
                {t.explore.guideLanguageLabel}
              </label>
              <select
                id="tour-lang"
                value={guideLang}
                onChange={(e) => setGuideLang(e.target.value as Locale)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English (Youth Ambassador Guide)</option>
              </select>
            </div>

            <div>
              <label htmlFor="tour-allergen" className="block text-xs font-semibold text-[#25352B]">
                {t.explore.allergenInputLabel}
              </label>
              <input
                id="tour-allergen"
                type="text"
                value={allergenNote}
                onChange={(e) => setAllergenNote(e.target.value)}
                placeholder={isEn ? "e.g. No peanuts/cashews, stroller access" : "Ví dụ: Dị ứng hạt điều, có xe đẩy em bé"}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs">
              <label className="flex items-center gap-2 font-semibold text-[#25352B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={schoolGroup}
                  onChange={(e) => setSchoolGroup(e.target.checked)}
                  className="h-4 w-4 accent-[#245B3D]"
                />
                <span>{isEn ? "School / supervised youth group visit" : "Đoàn trường học / học sinh"}</span>
              </label>
              {schoolGroup ? (
                <label className="flex items-start gap-2 text-[#52645A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schoolConsentVerified}
                    onChange={(e) => setSchoolConsentVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#245B3D]"
                  />
                  <span>{t.explore.schoolConsentLabel}</span>
                </label>
              ) : null}
            </div>

            <div>
              <label htmlFor="tour-note" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Additional note" : "Ghi chú thêm cho chủ vườn"}
              </label>
              <input
                id="tour-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="rounded-[12px] bg-[#EAF0E5] p-3.5">
              <div className="flex items-center justify-between text-xs text-[#52645A]">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#245B3D]" />
                  <span>
                    {adultCount + childCount} {isEn ? "guests" : "khách"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe2 className="h-3.5 w-3.5 text-[#245B3D]" />
                  <span>{guideLang.toUpperCase()}</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#25352B]">
                  {isEn ? "Estimated total:" : "Tạm tính tham khảo:"}
                </span>
                <span className="tabular-nums text-lg font-bold text-[#245B3D]">
                  {formatVnd(totalEstimateVnd, locale, showUsd)}
                </span>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              {t.explore.confirmBookingBtn}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
