"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, MapPin, QrCode, Radio, ShieldCheck, Sprout, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { resolveCategoryMedia } from "@/data/reference/media-library";
import { MediaPlayer } from "@/components/media/MediaPlayer";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ExperienceBookingForm } from "@/components/farms/ExperienceBookingForm";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { ProductionDiaryTimeline } from "@/components/traceability/ProductionDiaryTimeline";
import { NaiFarmMapHost } from "@/components/map/NaiFarmMapHost";
import { Badge, Card, EmptyState } from "@/components/ui/Primitives";

export default function FarmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { farms, products, batches, livestreams, certifications, diaryEntries } = useDemoStore();
  const [showAllBatches, setShowAllBatches] = useState(false);
  const farm = farms.find((f) => f.slug === slug);

  if (!farm) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-12">
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title={isEn ? "Orchard profile not found" : "Không tìm thấy hồ sơ nhà vườn"}
          description={isEn ? "This orchard route does not exist in the current directory." : "Đường dẫn nhà vườn không tồn tại trong danh sách vườn hiện tại."}
          action={
            <Link
              href={buildLocalizedHref("/farms", locale)}
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              {isEn ? "Back to orchard directory" : "Về danh sách nhà vườn"}
            </Link>
          }
        />
      </div>
    );
  }

  const farmProducts = products.filter((p) => p.farmId === farm.id);
  const farmBatches = batches.filter((b) => b.farmId === farm.id);
  const visibleBatches = showAllBatches ? farmBatches : farmBatches.slice(0, 4);
  const farmLives = livestreams.filter((l) => l.farmId === farm.id);
  const farmCerts = certifications.filter((c) => c.farmId === farm.id);
  const farmDiaries = diaryEntries.filter((d) => d.farmId === farm.id);
  const farmReturnTo = buildLocalizedHref(`/farms/${farm.slug}`, locale);
  const regionMedia = resolveCategoryMedia(farm.mainCrops.join(" "), farm.storyHeadline);

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 px-4 py-6 lg:px-8">
      <Link
        href={buildLocalizedHref("/farms", locale)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{isEn ? "Dong Nai Orchard Directory" : "Danh sách Nhà vườn Đồng Nai"}</span>
      </Link>

      {/* Farm Hero Banner */}
      <section className="overflow-hidden rounded-[24px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.06)]">
        <div className="relative h-64 w-full sm:h-80">
          <img
            src={farm.bannerImage}
            alt={isEn && farm.enName ? farm.enName : farm.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[120px_minmax(0,1fr)]">
          <img
            src={farm.ownerPortrait}
            alt={farm.ownerName}
            className="h-28 w-28 rounded-[16px] border-2 border-[#D6DED2] object-cover"
          />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                {farm.ocopStatus === "coop_checked_demo" ? (
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {isEn
                    ? farm.ocopStatus === "coop_checked_demo"
                      ? "Co-op Checked (Sample)"
                      : "Self-declared by Orchard"
                    : farm.ocopLabel}
                </span>
              </Badge>
              <Badge tone="neutral">
                {farm.areaHa} ha {isEn ? "cultivated" : "canh tác"}
              </Badge>
              <Badge tone="neutral">{farm.ownerAgeLabel}</Badge>
            </div>

            <h1 className="font-editorial text-3xl font-semibold text-[#25352B]">
              {isEn && farm.enName ? farm.enName : farm.name}
            </h1>
            <p className="inline-flex items-center gap-1.5 text-sm text-[#52645A]">
              <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{localizeAdminUnitName(farm.addressLabel, undefined, locale)}</span>
            </p>
            <p className="font-editorial text-lg font-medium text-[#245B3D]">
              {isEn && farm.enStoryHeadline ? farm.enStoryHeadline : farm.storyHeadline}
            </p>
            <p className="text-base text-[#25352B]">
              {isEn && farm.enStorySummary ? farm.enStorySummary : farm.storySummary}
            </p>

            <div className="rounded-[12px] border border-[#D6DED2] bg-[#FFF2D8]/60 p-3.5 text-sm text-[#25352B]">
              <strong>{isEn ? "Certification disclosure: " : "Tình trạng chứng nhận (minh bạch): "}</strong>
              {farm.ocopNote}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-[#52645A]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#245B3D]">
                <Users className="h-4 w-4" aria-hidden="true" />
                {isEn ? "Youth partners:" : "Đội thanh niên đồng hành:"} {farm.youthSupporters.join(" · ")}
              </span>
              <Link href={buildLocalizedHref("/explore", locale)} className="font-semibold text-[#245B3D] underline">
                {isEn ? "View on Dong Nai Map →" : "Mở trên Bản đồ số Đồng Nai →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Products */}
      <section aria-labelledby="farm-products-heading" className="space-y-4">
        <h2 id="farm-products-heading" className="text-2xl font-bold text-[#25352B]">
          {isEn ? `Produce from ${farm.enName ?? farm.name}` : `Nông sản từ ${farm.name}`} ({farmProducts.length})
        </h2>
        <div className="grid-safe grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {farmProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Traceability Batches & Adaptive Live Schedule (items-start prevents tall empty white box!) */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Card className="self-start p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <QrCode className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "Harvest Batches & QR Passports" : "Nhật ký lô & Hộ chiếu nông sản"}</span>
            </h2>
            <span className="text-xs font-semibold text-[#52645A]">
              {farmBatches.length} {isEn ? "lots" : "lô"}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {visibleBatches.map((b) => (
              <Link
                key={b.batchCode}
                href={buildLocalizedHref(`/trace/${b.batchCode}?returnTo=${encodeURIComponent(farmReturnTo)}`, locale)}
                className="block rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 p-4 hover:bg-[#EAF0E5]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular-nums font-bold text-[#245B3D]">{b.batchCode}</span>
                  <span className="text-xs text-[#52645A]">
                    {b.events.length} {isEn ? "log entries" : "mốc nhật ký"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#25352B]">{b.productName}</p>
                <p className="mt-1 text-xs text-[#52645A]">{b.declarationLevel}</p>
              </Link>
            ))}
          </div>
          {farmBatches.length > 4 ? (
            <button
              type="button"
              onClick={() => setShowAllBatches((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#245B3D] hover:underline cursor-pointer"
            >
              <span>
                {showAllBatches
                  ? isEn
                    ? "Show fewer batches"
                    : "Thu gọn danh sách lô"
                  : isEn
                  ? `Show all ${farmBatches.length} batches`
                  : `Xem thêm (${farmBatches.length} lô)`}
              </span>
            </button>
          ) : null}
        </Card>

        <div className="self-start space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                <Radio className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                <span>{isEn ? "Orchard OCOP Live Sessions" : "Lịch Livestream hỗ trợ tại vườn"}</span>
              </h2>
              <Link href={buildLocalizedHref("/live", locale)} className="text-xs font-semibold text-[#245B3D] hover:underline">
                {t.nav.live} →
              </Link>
            </div>

            {farmLives.length === 0 ? (
              <div className="mt-3 space-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-sm text-[#52645A]">
                <p>{isEn ? "No upcoming live broadcast scheduled for this orchard." : "Chưa có lịch phát sóng sắp tới tại vườn."}</p>
                <Link
                  href={buildLocalizedHref("/live", locale)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#245B3D] underline"
                >
                  <span>{isEn ? "Browse regional OCOP Live calendar" : "Xem lịch OCOP Live toàn hệ thống"}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ) : farmLives.length === 1 ? (
              (() => {
                const live = farmLives[0];
                return (
                  <div className="mt-4 space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={live.status === "replay_demo" ? "info" : "gold"}>
                        {live.status === "replay_demo"
                          ? isEn
                            ? "Replay available"
                            : "Có bản phát lại"
                          : isEn
                          ? "Upcoming"
                          : "Lịch dự kiến"}
                      </Badge>
                      <span className="text-xs font-medium text-[#52645A]">{live.scheduleLabel}</span>
                    </div>
                    <p className="text-sm font-bold text-[#25352B]">
                      {isEn && live.titleEn ? live.titleEn : live.title}
                    </p>
                    <p className="text-xs text-[#52645A]">
                      {isEn ? "Host / Youth partner:" : "Phụ trách:"} {live.hostYouth}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href={buildLocalizedHref(`/live/${live.id}?returnTo=${encodeURIComponent(farmReturnTo)}`, locale)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#19472E]"
                      >
                        <span>{isEn ? "Open OCOP Live room" : "Mở phòng OCOP Live"}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={buildLocalizedHref("/live", locale)}
                        className="inline-flex min-h-[38px] items-center rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                      >
                        {isEn ? "All schedules" : "Xem tất cả lịch"}
                      </Link>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="mt-4 space-y-3">
                {farmLives.map((live) => (
                  <Link
                    key={live.id}
                    href={buildLocalizedHref(`/live/${live.id}?returnTo=${encodeURIComponent(farmReturnTo)}`, locale)}
                    className="block rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 p-4 hover:bg-[#EAF0E5]"
                  >
                    <p className="font-semibold text-[#25352B]">
                      {isEn && live.titleEn ? live.titleEn : live.title}
                    </p>
                    <p className="mt-1 text-xs text-[#52645A]">
                      {live.scheduleLabel} · {isEn ? "Host:" : "Phụ trách:"} {live.hostYouth}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <MediaPlayer asset={regionMedia} compact />
        </div>
      </section>

      {/* Eco-Experience Booking Request */}
      <ExperienceBookingForm farm={farm} />

      {/* Certifications & Seasons Diary & Map */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-5">
            <ProductionDiaryTimeline
              entries={farmDiaries}
              title={`${isEn ? "Harvest & Field Diary" : "Nhật ký mùa vụ"} · ${isEn && farm.enName ? farm.enName : farm.name}`}
              limit={6}
            />
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {farmCerts.map((cert) => (
            <CertificationCard key={cert.id} cert={cert} />
          ))}
          <Card className="space-y-3 p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
              <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn ? "Orchard Location Map" : "Bản đồ vùng vườn"} ·{" "}
                {localizeAdminUnitName(farm.administrativeUnitName, undefined, locale)}
              </span>
            </h2>
            <NaiFarmMapHost
              farms={[farm]}
              selectedFarmId={farm.id}
              heightClassName="h-[260px]"
              zoom={12}
            />
          </Card>
        </div>
      </section>

      {/* Field Photos Gallery */}
      <section aria-labelledby="farm-gallery-heading" className="space-y-4">
        <h2 id="farm-gallery-heading" className="text-xl font-bold text-[#25352B]">
          {isEn ? "Field & Harvest Photos (Illustrative)" : "Góc ảnh thực địa tại vườn (Ảnh minh họa)"}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {farm.galleryImages.map((img, i) => (
            <img
              key={img + i}
              src={img}
              alt={`${farm.name} - ${i + 1}`}
              className="aspect-[4/3] w-full rounded-[14px] border border-[#D6DED2] object-cover"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
