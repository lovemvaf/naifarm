"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarPlus,
  Compass,
  Radio,
  Sparkles,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildIcsDocument, formatVnDate, triggerIcsDownload } from "@/lib/clock/vn-clock";
import { resolveCampaignRuntimeState } from "@/lib/commerce/promotion-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifySuccess } from "@/lib/toast";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { CalendarEvent } from "@/types/naifarm";

export default function CampaignDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  const {
    hydrated,
    campaigns,
    products,
    tourPackages,
    livestreams,
    lessons,
    activeClockIso,
  } = useDemoStore();

  const campaign = useMemo(
    () => campaigns.find((c) => c.slug === slug || c.id === slug) ?? campaigns[0],
    [campaigns, slug],
  );

  const linkedProducts = useMemo(
    () => products.filter((p) => campaign?.productIds.includes(p.id)).slice(0, 8),
    [products, campaign],
  );
  const linkedTours = useMemo(
    () => tourPackages.filter((tp) => campaign?.experienceSlugs.includes(tp.slug)).slice(0, 4),
    [tourPackages, campaign],
  );
  const linkedLives = useMemo(
    () => livestreams.filter((l) => campaign?.liveIds.includes(l.id)).slice(0, 4),
    [livestreams, campaign],
  );
  const linkedLessons = useMemo(
    () => lessons.filter((ls) => campaign?.lessonSlugs.includes(ls.slug)).slice(0, 4),
    [lessons, campaign],
  );

  if (!hydrated || !campaign) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading campaign..." : "Đang mở chi tiết sự kiện..."}
      </div>
    );
  }

  const runtime = resolveCampaignRuntimeState(campaign, activeClockIso);

  const handleExportCampaignIcs = () => {
    const ev: CalendarEvent = {
      id: campaign.id,
      title: campaign.titleVi,
      titleEn: campaign.titleEn,
      description: campaign.subtitleVi,
      descriptionEn: campaign.subtitleEn,
      eventKind: "promotion",
      classification: "platform_initiative",
      organizer: campaign.organizer,
      status: runtime === "recap" ? "completed" : "scheduled",
      startIso: campaign.startIso,
      endIso: campaign.endIso,
      allDay: false,
      timezone: "Asia/Ho_Chi_Minh",
      priority: "high",
      visibility: "public",
      linkedRoute: `/events/${campaign.slug}`,
    };
    const ics = buildIcsDocument([ev], locale, campaign.titleEn);
    triggerIcsDownload(`naifarm-event-${campaign.id}.ics`, ics);
    notifySuccess(t.toasts.icsDownloaded);
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={buildLocalizedHref("/events", locale)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.events.tabCampaigns}</span>
        </Link>
        <Button size="sm" variant="secondary" onClick={handleExportCampaignIcs}>
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          <span>{t.events.exportIcsBtn}</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <img
              src={campaign.bannerImage}
              alt={isEn ? campaign.bannerAltEn : campaign.bannerAltVi}
              className="h-full min-h-[220px] w-full object-cover"
            />
          </div>
          <div className="space-y-3 p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone={runtime === "active" ? "success" : runtime === "recap" ? "neutral" : "info"}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {runtime === "active"
                    ? t.events.activeBadge
                    : runtime === "recap"
                    ? t.events.recapBadge
                    : t.events.upcomingBadge}
                </span>
              </Badge>
              <span className="text-xs font-semibold text-[#52645A]">
                {formatVnDate(campaign.startIso, locale)} – {formatVnDate(campaign.endIso, locale)}
              </span>
            </div>
            <h1 className="font-editorial text-2xl font-bold text-[#25352B] sm:text-3xl">
              {isEn ? campaign.titleEn : campaign.titleVi}
            </h1>
            <p className="text-sm text-[#52645A]">
              {isEn ? campaign.subtitleEn : campaign.subtitleVi}
            </p>
            <p className="rounded-[12px] bg-[#FAF8F1] p-3 text-xs text-[#25352B]">
              <strong>{isEn ? "Organizer & Objective:" : "Đơn vị & Mục tiêu:"}</strong>{" "}
              {campaign.organizer} · {isEn ? campaign.objectiveEn : campaign.objectiveVi}
            </p>
            {runtime === "recap" && campaign.recapStoryVi ? (
              <p className="rounded-[12px] border border-[#D6DED2] bg-[#EAF0E5]/50 p-3 text-xs text-[#245B3D]">
                {isEn ? campaign.recapStoryEn : campaign.recapStoryVi}
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Agenda */}
      {campaign.agendaItems.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-lg font-bold text-[#25352B]">
            {isEn ? "Program Agenda & Links" : "Lịch trình & Hoạt động Kết nối"}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {campaign.agendaItems.map((ag) => (
              <Link
                key={ag.time + ag.titleVi}
                href={buildLocalizedHref(ag.route, locale)}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs hover:bg-[#EAF0E5]"
              >
                <div>
                  <span className="font-bold text-[#245B3D]">{ag.time}</span>
                  <p className="mt-0.5 font-semibold text-[#25352B]">
                    {isEn ? ag.titleEn : ag.titleVi}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-[#245B3D]">→</span>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Linked Tours, Lives, Lessons */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="space-y-2 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
            <Compass className="h-4 w-4 text-[#245B3D]" />
            <span>{t.nav.explore}</span>
          </h2>
          {linkedTours.map((tp) => (
            <Link
              key={tp.id}
              href={buildLocalizedHref(`/experiences/${tp.slug}`, locale)}
              className="block rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-2.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {isEn ? tp.titleEn : tp.titleVi}
            </Link>
          ))}
        </Card>

        <Card className="space-y-2 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
            <Radio className="h-4 w-4 text-[#245B3D]" />
            <span>{t.nav.live}</span>
          </h2>
          {linkedLives.map((lv) => (
            <Link
              key={lv.id}
              href={buildLocalizedHref(`/live/${lv.id}`, locale)}
              className="block rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-2.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {isEn && lv.titleEn ? lv.titleEn : lv.title}
            </Link>
          ))}
        </Card>

        <Card className="space-y-2 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
            <BookOpen className="h-4 w-4 text-[#245B3D]" />
            <span>{t.nav.learn}</span>
          </h2>
          {linkedLessons.map((ls) => (
            <Link
              key={ls.id}
              href={buildLocalizedHref(`/learn/${ls.slug}`, locale)}
              className="block rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-2.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
            >
              {isEn && ls.titleEn ? ls.titleEn : ls.title}
            </Link>
          ))}
        </Card>
      </div>

      {/* Linked Featured Products */}
      {linkedProducts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#25352B]">
            {isEn ? "Featured Produce in This Event" : "Nông sản đặc trưng trong Tuần lễ"}
          </h2>
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {linkedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
