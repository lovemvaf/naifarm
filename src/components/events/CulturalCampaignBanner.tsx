"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, Sparkles } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { formatCountdownRemaining, formatVnDate } from "@/lib/clock/vn-clock";
import { resolveCampaignRuntimeState } from "@/lib/commerce/promotion-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
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
      className="shrink-0 rounded-[3px] border border-[#D6DED2] shadow-xs"
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

  const evaluated = campaigns
    .map((c) => ({
      campaign: c,
      runtime: resolveCampaignRuntimeState(c, activeClockIso),
    }))
    .filter((item) => item.runtime !== "paused_or_draft");

  const activeCampaign = evaluated.find((e) => e.runtime === "active")?.campaign ?? campaigns[1];
  const recapCampaign = evaluated.find((e) => e.runtime === "recap")?.campaign ?? campaigns[0];
  const upcomingCampaign = evaluated.find((e) => e.runtime === "upcoming")?.campaign ?? campaigns[2];

  if (!activeCampaign) return null;

  return (
    <section aria-label={t.events.tabCampaigns} className="space-y-3">
      <Card className="overflow-hidden border-[#D6DED2] bg-gradient-to-r from-[#245B3D] via-[#2A6846] to-[#347852] text-white">
        <div className="grid grid-cols-1 items-center gap-4 p-5 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              {activeCampaign.showNationalFlagAccent ? <VietnamFlagBadgeSvg /> : null}
              <Badge tone="gold">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.events.activeBadge}</span>
              </Badge>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {formatVnDate(activeCampaign.startIso, locale)} –{" "}
                {formatVnDate(activeCampaign.endIso, locale)} ·{" "}
                {formatCountdownRemaining(activeClockIso, activeCampaign.endIso, locale)}
              </span>
            </div>

            <h2 className="font-editorial text-xl font-bold leading-snug sm:text-2xl">
              {isEn ? activeCampaign.titleEn : activeCampaign.titleVi}
            </h2>
            <p className="max-w-2xl text-xs text-white/90 sm:text-sm">
              {isEn ? activeCampaign.subtitleEn : activeCampaign.subtitleVi}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2.5 lg:col-span-4 lg:justify-end">
            <Link
              href={buildLocalizedHref(`/events/${activeCampaign.slug}`, locale)}
              className="inline-flex min-h-[42px] items-center rounded-[12px] bg-[#D7A34D] px-4 text-xs font-bold text-[#25352B] hover:bg-[#C6923D]"
            >
              {isEn ? activeCampaign.primaryCtaLabelEn : activeCampaign.primaryCtaLabelVi}
            </Link>
            <Link
              href={buildLocalizedHref("/events?tab=calendar", locale)}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] border border-white/40 bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>{t.events.tabCalendar}</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* Compact Secondary Recap (No Fake Countdown!) + Upcoming Youth Event Strip */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {recapCampaign ? (
          <Link
            href={buildLocalizedHref(`/events/${recapCampaign.slug}`, locale)}
            className="flex items-center justify-between gap-3 rounded-[14px] border border-[#D6DED2] bg-white px-4 py-3 text-xs hover:bg-[#FAF8F1]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {recapCampaign.showNationalFlagAccent ? <VietnamFlagBadgeSvg /> : null}
                <Badge tone="neutral">{t.events.recapBadge}</Badge>
              </div>
              <p className="mt-1 truncate font-bold text-[#25352B]">
                {isEn ? recapCampaign.titleEn : recapCampaign.titleVi}
              </p>
              <p className="truncate text-[11px] text-[#52645A]">
                {t.events.endedNoCountdownNote}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-[#245B3D]">
              {isEn ? "Recap →" : "Xem tư liệu →"}
            </span>
          </Link>
        ) : null}

        {upcomingCampaign ? (
          <Link
            href={buildLocalizedHref(`/events/${upcomingCampaign.slug}`, locale)}
            className="flex items-center justify-between gap-3 rounded-[14px] border border-[#D6DED2] bg-white px-4 py-3 text-xs hover:bg-[#FAF8F1]"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone="info">{t.events.upcomingBadge}</Badge>
                <span className="text-[11px] font-semibold text-[#52645A]">
                  {formatVnDate(upcomingCampaign.startIso, locale)} –{" "}
                  {formatVnDate(upcomingCampaign.endIso, locale)}
                </span>
              </div>
              <p className="mt-1 truncate font-bold text-[#25352B]">
                {isEn ? upcomingCampaign.titleEn : upcomingCampaign.titleVi}
              </p>
              <p className="truncate text-[11px] text-[#52645A]">
                {upcomingCampaign.organizer}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-[#245B3D]">
              {isEn ? "Details →" : "Chi tiết →"}
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
