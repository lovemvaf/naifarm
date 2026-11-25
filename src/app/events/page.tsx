"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Gift,
  Lock,
  Sparkles,
  Tag,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { OFFICIAL_OBSERVANCES } from "@/data/fixtures/calendar-campaigns";
import { formatCountdownRemaining, formatVnDate } from "@/lib/clock/vn-clock";
import {
  getPromotionTimeRemainingLabel,
  resolveCampaignRuntimeState,
} from "@/lib/commerce/promotion-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn, formatVnd } from "@/lib/format";
import { notifySuccess } from "@/lib/toast";
import { NaiCalendarBoard } from "@/components/calendar/NaiCalendarBoard";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

type EventsTab = "campaigns" | "deals" | "calendar" | "holidays";
const VALID_TABS: EventsTab[] = ["campaigns", "deals", "calendar", "holidays"];

function EventsHubInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  const {
    hydrated,
    activeClockIso,
    campaigns,
    promotions,
    appliedPromoCodes,
    toggleAppliedPromoCode,
  } = useDemoStore();

  const tabParam = searchParams.get("tab") as EventsTab | null;
  const [activeTab, setActiveTab] = useState<EventsTab>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "campaigns",
  );

  const switchTab = (next: EventsTab) => {
    setActiveTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const categorizedCampaigns = useMemo(() => {
    return campaigns
      .map((c) => ({
        campaign: c,
        runtime: resolveCampaignRuntimeState(c, activeClockIso),
      }))
      .filter((x) => x.runtime !== "paused_or_draft");
  }, [campaigns, activeClockIso]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading events & calendar..." : "Đang tải sự kiện & lịch mùa vụ..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">Asia/Ho_Chi_Minh · {formatVnDate(activeClockIso, locale)}</Badge>
        <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
          {t.events.pageTitle}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#52645A]">{t.events.pageSubtitle}</p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={t.events.pageTitle}
        className="flex flex-wrap gap-2 border-b border-[#D6DED2] pb-3"
      >
        {(
          [
            { id: "campaigns", label: t.events.tabCampaigns, icon: Sparkles },
            { id: "deals", label: t.events.tabDeals, icon: Tag },
            { id: "calendar", label: t.events.tabCalendar, icon: CalendarDays },
            { id: "holidays", label: t.events.tabHolidays, icon: Gift },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(item.id)}
              className={cn(
                "inline-flex min-h-[42px] items-center gap-2 rounded-[12px] px-4 text-xs font-bold transition-colors cursor-pointer",
                active
                  ? "bg-[#245B3D] text-white"
                  : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "campaigns" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categorizedCampaigns.map(({ campaign: c, runtime }) => (
            <Card key={c.id} className="flex flex-col justify-between overflow-hidden">
              <div>
                <img
                  src={c.bannerImage}
                  alt={isEn ? c.bannerAltEn : c.bannerAltVi}
                  className="h-44 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      tone={
                        runtime === "active"
                          ? "success"
                          : runtime === "recap"
                          ? "neutral"
                          : "info"
                      }
                    >
                      {runtime === "active"
                        ? t.events.activeBadge
                        : runtime === "recap"
                        ? t.events.recapBadge
                        : t.events.upcomingBadge}
                    </Badge>
                    <span className="text-[11px] font-semibold text-[#52645A]">
                      {formatVnDate(c.startIso, locale)} – {formatVnDate(c.endIso, locale)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#25352B]">
                    {isEn ? c.titleEn : c.titleVi}
                  </h2>
                  <p className="line-clamp-2 text-xs text-[#52645A]">
                    {isEn ? c.subtitleEn : c.subtitleVi}
                  </p>

                  {runtime === "recap" ? (
                    <p className="rounded-[8px] bg-[#FAF8F1] px-2.5 py-1.5 text-[11px] font-medium text-[#52645A]">
                      {t.events.endedNoCountdownNote}
                    </p>
                  ) : runtime === "active" ? (
                    <p className="text-xs font-bold text-[#245B3D]">
                      {formatCountdownRemaining(activeClockIso, c.endIso, locale)}
                    </p>
                  ) : (
                    <p className="text-[11px] font-medium text-[#80520C]">{c.organizer}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-[#D6DED2] bg-[#FAF8F1] px-4 py-3">
                <Link
                  href={buildLocalizedHref(`/events/${c.slug}`, locale)}
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>{isEn ? c.primaryCtaLabelEn : c.primaryCtaLabelVi}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {activeTab === "deals" ? (
        <div className="space-y-4">
          <DemoBanner
            title={t.events.promoRulesHeading}
            detail={
              isEn
                ? "Promotions enforce exact minimum cart totals, budget caps, stock allocations, and Asia/Ho_Chi_Minh time windows. Commercial promos exclude minor accounts."
                : "Ưu đãi chỉ áp dụng khi đạt giá trị đơn tối thiểu, còn ngân sách và đúng khung giờ GMT+7; không áp dụng cho tài khoản học sinh dưới 18 tuổi."
            }
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => {
              const applied = appliedPromoCodes.includes(promo.code.toUpperCase());
              const timeText = getPromotionTimeRemainingLabel(promo, activeClockIso, locale);
              return (
                <Card key={promo.id} className="flex flex-col justify-between p-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[8px] border border-dashed border-[#245B3D] bg-[#EAF0E5] px-2.5 py-1 font-mono text-xs font-bold text-[#245B3D]">
                        {promo.code}
                      </span>
                      <Badge tone={timeText.includes("Còn") || timeText.includes("left") ? "success" : "neutral"}>
                        {timeText}
                      </Badge>
                    </div>
                    <h2 className="text-base font-bold text-[#25352B]">
                      {isEn ? promo.titleEn : promo.titleVi}
                    </h2>
                    <p className="text-xs text-[#52645A]">
                      {isEn ? "Min spend:" : "Đơn tối thiểu:"}{" "}
                      <strong>{formatVnd(promo.minSpendVnd, locale)}</strong> ·{" "}
                      {isEn ? "Cap:" : "Giảm tối đa:"}{" "}
                      <strong>{formatVnd(promo.maxDiscountVnd, locale)}</strong>
                    </p>
                    <p className="text-[11px] text-[#52645A]">
                      {isEn ? "Redemptions:" : "Lượt dùng:"} {promo.redeemedCount}/
                      {promo.maxRedemptionsTotal} ·{" "}
                      {promo.stackable
                        ? isEn
                          ? "Stackable"
                          : "Cộng dồn được"
                        : isEn
                        ? "Non-stackable"
                        : "Không cộng dồn"}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={applied ? "secondary" : "primary"}
                      className="flex-1"
                      onClick={() => {
                        toggleAppliedPromoCode(promo.code);
                        notifySuccess(
                          applied
                            ? isEn
                              ? `Removed promo code ${promo.code}.`
                              : `Đã bỏ chọn mã ${promo.code}.`
                            : isEn
                            ? `Added ${promo.code} to cart checklist.`
                            : `Đã gắn mã ${promo.code} để kiểm tra trong giỏ hàng.`,
                        );
                      }}
                    >
                      {applied ? <CheckCircle2 className="h-4 w-4 text-[#24603B]" /> : null}
                      <span>
                        {applied
                          ? isEn
                            ? "Selected in Cart"
                            : "Đã chọn (Giỏ hàng)"
                          : t.events.applyDealToCart}
                      </span>
                    </Button>
                    <Link
                      href={buildLocalizedHref("/cart", locale)}
                      className="inline-flex min-h-[40px] items-center rounded-[12px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#245B3D]"
                    >
                      {t.nav.cartShort} →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === "calendar" ? <NaiCalendarBoard scope="public" /> : null}

      {activeTab === "holidays" ? (
        <div className="space-y-4">
          <DemoBanner
            title={t.events.officialReadOnlyTag}
            detail={
              isEn
                ? "Verified legal holidays, national heritage/culture observances, and UN/FAO agricultural days are kept read-only and strictly separated from commercial deals."
                : "Danh mục ngày lễ chính thức và ngày quốc tế nông nghiệp có nguồn đối chiếu công khai, luôn ở chế độ chỉ đọc và tách biệt khỏi lịch khuyến mãi thương mại."
            }
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {OFFICIAL_OBSERVANCES.map((obs) => (
              <Card key={obs.id} className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="gold">{obs.dateLabelVi}</Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#80520C]">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {t.events.officialReadOnlyTag}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#25352B]">
                  {isEn ? obs.titleEn : obs.titleVi}
                </h2>
                <p className="text-xs leading-relaxed text-[#52645A]">
                  {isEn ? obs.noteEn : obs.noteVi}
                </p>
                <p className="text-[11px] text-[#687A70]">
                  {isEn ? "Source:" : "Nguồn đối chiếu:"} {obs.legalOrOfficialSource}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải Sự kiện &amp; Lịch NaiFarm...
        </div>
      }
    >
      <EventsHubInner />
    </Suspense>
  );
}
