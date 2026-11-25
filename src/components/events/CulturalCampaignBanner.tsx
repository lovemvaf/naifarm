"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { formatCountdownRemaining, formatVnDate } from "@/lib/clock/vn-clock";
import { resolveCampaignRuntimeState } from "@/lib/commerce/promotion-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";
import { Badge, Card } from "@/components/ui/Primitives";

/**
 * Respectful 3:2 small SVG Vietnam flag accent reserved strictly for appropriate cultural campaigns
 * (never used on language selectors or commercial product cards).
 */
function VietnamFlagBadgeSvg() {
  return (
    <svg
      viewBox="0 0 30 20"
      width={27}
      height={18}
      role="img"
      aria-label="Cờ Tổ quốc Việt Nam"
      className="vn-flag-wave shrink-0 rounded-[3px] border border-[#D6DED2] shadow-xs"
    >
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFCD00"
        points="15,3.5 16.75,8.9 22.4,8.9 17.85,12.2 19.6,17.6 15,14.3 10.4,17.6 12.15,12.2 7.6,8.9 13.25,8.9"
      />
    </svg>
  );
}

export function CulturalCampaignBanner() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { campaigns, activeClockIso } = useDemoStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const evaluated = campaigns
    .map((c) => ({
      campaign: c,
      runtime: resolveCampaignRuntimeState(c, activeClockIso),
    }))
    .filter((item) => item.runtime !== "paused_or_draft");

  const activeItem = evaluated.find((e) => e.runtime === "active") ?? evaluated[1] ?? evaluated[0];
  const upcomingItem = evaluated.find((e) => e.runtime === "upcoming");
  const recapItem = evaluated.find((e) => e.runtime === "recap");

  const slides = [activeItem, upcomingItem, recapItem].filter(
    (s): s is NonNullable<typeof activeItem> => Boolean(s),
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const safeIdx = slideIdx % slides.length;
  const current = slides[safeIdx];
  const { campaign, runtime } = current;

  const statusTone = runtime === "active" ? "gold" : runtime === "upcoming" ? "info" : "neutral";
  const statusLabel =
    runtime === "active"
      ? t.events.activeBadge
      : runtime === "upcoming"
      ? t.events.upcomingBadge
      : t.events.recapBadge;

  const isRecap = runtime === "recap";

  return (
    <section
      aria-label={t.events.tabCampaigns}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="space-y-3"
    >
      <Card
        className={cn(
          "min-h-[168px] overflow-hidden border-[#D6DED2] transition-colors",
          isRecap
            ? "bg-gradient-to-r from-[#2D4739] via-[#355444] to-[#416552] text-white"
            : "bg-gradient-to-r from-[#245B3D] via-[#2A6846] to-[#347852] text-white",
        )}
      >
        <div className="grid min-h-[168px] grid-cols-1 items-center gap-4 p-5 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              {campaign.showNationalFlagAccent ? <VietnamFlagBadgeSvg /> : null}
              <Badge tone={statusTone}>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{statusLabel}</span>
              </Badge>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                {formatVnDate(campaign.startIso, locale)} – {formatVnDate(campaign.endIso, locale)}
                {runtime === "active"
                  ? ` · ${formatCountdownRemaining(activeClockIso, campaign.endIso, locale)}`
                  : ""}
              </span>
            </div>

            <h2 className="font-editorial text-xl font-bold leading-snug sm:text-2xl">
              {isEn ? campaign.titleEn : campaign.titleVi}
            </h2>
            <p className="max-w-2xl text-xs text-white/90 sm:text-sm">
              {isRecap ? `${t.events.endedNoCountdownNote} ` : ""}
              {isEn ? campaign.subtitleEn : campaign.subtitleVi}
            </p>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 lg:col-span-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildLocalizedHref(`/events/${campaign.slug}`, locale)}
                className="inline-flex min-h-[42px] items-center rounded-[12px] bg-[#D7A34D] px-4 text-xs font-bold text-[#25352B] hover:bg-[#C6923D]"
              >
                {isEn ? campaign.primaryCtaLabelEn : campaign.primaryCtaLabelVi}
              </Link>
              <Link
                href={buildLocalizedHref("/events?tab=calendar", locale)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] border border-white/40 bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <span>{t.events.tabCalendar}</span>
              </Link>
            </div>

            {slides.length > 1 ? (
              <div className="flex items-center gap-1.5" role="group" aria-label={isEn ? "Campaign slide controls" : "Điều khiển chuyển chiến dịch"}>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)}
                  aria-label={isEn ? "Previous campaign" : "Chiến dịch trước"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/25 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1 px-1">
                  {slides.map((s, i) => (
                    <button
                      key={s.campaign.id}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      aria-label={
                        isEn
                          ? `Slide ${i + 1}: ${s.campaign.titleEn}`
                          : `Trang ${i + 1}: ${s.campaign.titleVi}`
                      }
                      aria-current={i === safeIdx ? "true" : undefined}
                      className={cn(
                        "h-2.5 rounded-full transition-all cursor-pointer",
                        i === safeIdx ? "w-6 bg-[#D7A34D]" : "w-2.5 bg-white/45 hover:bg-white/75",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % slides.length)}
                  aria-label={isEn ? "Next campaign" : "Chiến dịch tiếp theo"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/25 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? (isEn ? "Resume autoplay" : "Tiếp tục chuyển") : isEn ? "Pause carousel" : "Tạm dừng chuyển"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/25 cursor-pointer"
                >
                  {paused ? (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  );
}
