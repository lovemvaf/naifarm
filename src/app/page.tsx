"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Compass,
  MapPin,
  QrCode,
  Radio,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { useCms } from "@/context/CmsContext";
import { localizeCategory, localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { CulturalCampaignBanner } from "@/components/events/CulturalCampaignBanner";
import { EditorialCursorStage } from "@/components/motion/MotionSystem";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { NaiFarmHomeChat } from "@/components/chatbot/NaiFarmHomeChat";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import { cn } from "@/lib/format";
import type { ProductCategory } from "@/types/naifarm";

const CATEGORIES: ("Tất cả" | ProductCategory)[] = [
  "Tất cả",
  "Trái cây tươi",
  "Bưởi & Cây có múi",
  "Chôm chôm & Sầu riêng",
  "Hạt điều & Rang củi",
  "Cà phê & Ca cao",
  "Mật ong & Rượu trái cây",
  "Quà tặng OCOP & Combo",
];

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { getBlock } = useCms();
  const heroCms = getBlock("hero.main");
  const { products, farms, livestreams, lessons } = useDemoStore();

  const resolvedHeroTitle =
    (isEn ? heroCms?.publishedEnTitle : heroCms?.publishedViTitle) || t.home.heroTitle;
  const resolvedHeroSubtitle =
    (isEn ? heroCms?.publishedEnBody : heroCms?.publishedViBody) || t.home.heroSubtitle;
  const resolvedHeroImg = heroCms?.imageUrl || "/images/stitch/stitch-02.jpg";
  const resolvedHeroPos = heroCms?.focalPoint || "50% 45%";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"Tất cả" | ProductCategory>("Tất cả");
  const [onlyInSeason, setOnlyInSeason] = useState(false);
  const [qrInput, setQrInput] = useState("");

  const filteredProducts = useMemo(() => {
    const q = normalizeSearchText(search);
    return products.filter((p) => {
      if (category !== "Tất cả" && p.category !== category) return false;
      if (onlyInSeason && (p.seasonStatus !== "in_season" || p.stockKg <= 0)) return false;
      if (!q) return true;
      return normalizeSearchText(
        `${p.name} ${p.enName ?? ""} ${p.farmName} ${p.administrativeUnitName} ${p.batchCode} ${p.category}`,
      ).includes(q);
    });
  }, [products, category, onlyInSeason, search]);

  return (
    <div className="mx-auto max-w-[1360px] space-y-12 px-4 py-6 lg:px-8 lg:py-10">
      {/* 60/40 Agricultural Editorial Hero — visible above fold at 1280x800 */}
      <section aria-labelledby="hero-heading" className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D6DED2] bg-[#EAF0E5] px-3.5 py-1.5 text-xs font-semibold text-[#245B3D]">
            <Sprout className="h-4 w-4" aria-hidden="true" />
            <span>{t.home.heroBadge}</span>
          </div>

          <h1
            id="hero-heading"
            className="font-editorial text-[30px] font-semibold leading-[1.15] text-[#25352B] sm:text-4xl lg:text-[50px]"
          >
            {resolvedHeroTitle}
          </h1>

          <p className="max-w-xl text-base text-[#25352B]/85 sm:text-lg">
            {resolvedHeroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#cho-nong-san"
              className="inline-flex min-h-[50px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-6 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              <span>{t.home.exploreProduceCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href={buildLocalizedHref("/farmer/publish", locale)}
              className="inline-flex min-h-[50px] items-center gap-2 rounded-[12px] border-[1.5px] border-[#245B3D] bg-white px-5 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              <span>{t.home.farmerPublishCta}</span>
            </Link>
          </div>

          {/* Quick QR Traceability Lookup */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = qrInput.trim();
              if (!code) {
                router.push(buildLocalizedHref("/trace/scan", locale));
                return;
              }
              router.push(buildLocalizedHref(`/trace/${encodeURIComponent(code)}`, locale));
            }}
            className="flex flex-wrap items-center gap-2 rounded-[14px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_2px_8px_rgba(37,53,43,0.05)] max-w-2xl"
          >
            <QrCode className="ml-1.5 h-5 w-5 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <label htmlFor="hero-qr-input" className="sr-only">
              {t.home.qrPlaceholder}
            </label>
            <input
              id="hero-qr-input"
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder={t.home.qrPlaceholder}
              className="min-h-[44px] flex-1 rounded-[10px] border border-[#788A7B] bg-[#F5F3E9] px-3 text-sm text-[#25352B]"
            />
            <Button type="submit" size="md" variant="gold">
              {t.home.qrLookupCta}
            </Button>
            <Link
              href={buildLocalizedHref("/trace/scan", locale)}
              className="inline-flex min-h-[42px] items-center gap-1 rounded-[10px] border border-[#245B3D]/30 bg-[#EAF0E5] px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#DDE8D6]"
            >
              {t.home.qrScanCta}
            </Link>
          </form>
        </div>

        <div className="lg:col-span-5">
          <EditorialCursorStage
            label={t.explore.viewMapTab}
            className="relative overflow-hidden rounded-[24px] border border-[#D6DED2] bg-[#EAF0E5] shadow-[0_8px_24px_rgba(37,53,43,0.12)]"
          >
            <Link href={buildLocalizedHref("/explore", locale)} className="block">
              <img
                src={resolvedHeroImg}
                alt={t.home.heroCaptionTitle}
                style={{ objectPosition: resolvedHeroPos }}
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
              <div className="border-t border-[#D6DED2] bg-white/95 px-4 py-3">
                <p className="text-xs font-semibold text-[#245B3D]">
                  {t.home.heroCaptionTitle}
                </p>
                <p className="text-xs text-[#52645A]">
                  {t.home.heroCaptionSub}
                </p>
              </div>
            </Link>
          </EditorialCursorStage>
        </div>
      </section>

      {/* Clock-Aware Cultural Campaign Carousel (Nov 25-30 active, Nov 24 honest recap, Dec 5 upcoming) */}
      <CulturalCampaignBanner />

      {/* Search, Category Filter & Responsive 4-col Product Grid */}
      <section id="cho-nong-san" aria-labelledby="catalog-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="catalog-heading" className="text-2xl font-bold text-[#25352B] md:text-[30px]">
              {t.home.catalogHeading}
            </h2>
            <p className="mt-1 text-sm text-[#52645A]">
              {t.home.catalogSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={buildLocalizedHref("/quality", locale)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
            >
              <span>{t.nav.quality}</span>
            </Link>
            <Link
              href={buildLocalizedHref("/marketplace", locale)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
            >
              <span>{t.home.viewAllSeasonCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[16px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.04)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "min-h-[40px] rounded-full px-4 text-xs font-semibold cursor-pointer",
                  category === cat
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]"
                )}
              >
                {cat === "Tất cả" ? t.home.allCategories : localizeCategory(cat, locale)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyInSeason((v) => !v)}
              className={cn(
                "min-h-[40px] rounded-full px-4 text-xs font-semibold cursor-pointer",
                onlyInSeason
                  ? "bg-[#D7A34D] text-[#25352B]"
                  : "border border-[#D6DED2] bg-white text-[#52645A] hover:bg-[#FFF2D8]"
              )}
            >
              {t.home.onlyInSeason}
            </button>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52645A]" aria-hidden="true" />
            <label htmlFor="home-search" className="sr-only">
              {t.home.searchFilterPlaceholder}
            </label>
            <input
              id="home-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.home.searchFilterPlaceholder}
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pl-9 pr-3 text-sm text-[#25352B]"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid-safe grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title={t.home.emptyCatalogTitle}
            description={t.home.emptyCatalogBody}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCategory("Tất cả");
                  setOnlyInSeason(false);
                }}
              >
                {t.home.clearFilters}
              </Button>
            }
          />
        )}
      </section>

      {/* Documentary Farm Stories + Youth Digital Bridge */}
      <section aria-labelledby="farms-story-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="farms-story-heading" className="text-2xl font-bold text-[#25352B]">
              {isEn
                ? "Farm stories and young people making a difference"
                : "Câu chuyện nhà vườn và thanh niên đồng hành"}
            </h2>
            <p className="mt-1 text-sm text-[#52645A]">
              {isEn
                ? "Information provided by the farm is clearly distinguished from records checked against supporting documents."
                : "Thông tin do nhà vườn cung cấp được phân biệt với hồ sơ đã đối chiếu."}
            </p>
          </div>
          <Link
            href={buildLocalizedHref("/farms", locale)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
          >
            <span>
              {isEn ? `Browse all ${farms.length} orchards` : `Xem tất cả ${farms.length} nhà vườn`}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {farms.slice(0, 2).map((farm) => (
            <Card key={farm.id} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
                <img
                  src={farm.ownerPortrait}
                  alt={`${farm.ownerName} - ${isEn && farm.enName ? farm.enName : farm.name}`}
                  className="h-56 w-full object-cover sm:h-full"
                />
                <div className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                        {isEn
                          ? farm.ocopStatus === "coop_checked_demo"
                            ? "Co-op Checked (Sample)"
                            : "Self-declared by Farm"
                          : farm.ocopLabel}
                      </Badge>
                      <span className="tabular-nums text-xs font-semibold text-[#52645A]">
                        {farm.areaHa} ha · {localizeAdminUnitName(farm.administrativeUnitName, undefined, locale)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
                      {isEn && farm.enName ? farm.enName : farm.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#52645A]">
                      {isEn && farm.enStorySummary ? farm.enStorySummary : farm.storySummary}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#245B3D]">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {isEn ? "Youth partners:" : "Hỗ trợ số:"} {farm.youthSupporters.join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                    >
                      <span>{isEn ? "View farm profile" : "Xem hồ sơ nhà vườn"}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href={buildLocalizedHref("/explore", locale)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-[#F5F3E9] px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                      <span>{isEn ? "Orchard map" : "Vị trí vườn"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* OCOP Live Schedule & Explore + 2D Learning Banner */}
      <section aria-labelledby="live-strip-heading" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="live-strip-heading" className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
              <Radio className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "OCOP Live Schedule from Orchards" : "Lịch OCOP Live từ Nhà vườn"}</span>
            </h2>
            <Link
              href={buildLocalizedHref("/live", locale)}
              className="text-sm font-semibold text-[#245B3D] hover:underline"
            >
              {isEn ? "Open OCOP Live hub →" : "Mở phòng OCOP Live →"}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {livestreams.slice(0, 2).map((session) => (
              <Link
                key={session.id}
                href={buildLocalizedHref(`/live/${session.id}?returnTo=%2F`, locale)}
                className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-3 hover:bg-[#EAF0E5]"
              >
                <img
                  src={session.angles[0]?.image || "/images/stitch/stitch-44.jpg"}
                  alt={session.title}
                  className="h-20 w-24 shrink-0 rounded-[8px] object-cover"
                />
                <div className="min-w-0">
                  <Badge tone={session.status === "replay_demo" ? "info" : "gold"}>
                    {session.status === "replay_demo"
                      ? isEn
                        ? "Watch replay"
                        : "Xem phát lại"
                      : isEn
                      ? "Scheduled"
                      : "Lịch dự kiến"}
                  </Badge>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#25352B]">
                    {session.title}
                  </p>
                  <p className="mt-1 text-xs text-[#52645A]">{session.scheduleLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-[#EAF0E5] p-5">
          <div>
            <Badge tone="success">
              {isEn ? "Explore & 2D Learning" : "Khám phá & Học tập 2D"}
            </Badge>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
              {isEn
                ? "Dong Nai Orchard Map & 2D Produce Anatomy"
                : "Bản đồ nhà vườn Đồng Nai & Giải phẫu nông sản 2D"}
            </h2>
            <p className="mt-2 text-sm text-[#52645A]">
              {isEn
                ? `Locate ${farms.length} Dong Nai orchards, reserve bilingual orchard tours, and learn across ${lessons.length} interactive VI/EN & 2D anatomy lessons.`
                : `Định vị hệ sinh thái ${farms.length} nhà vườn tại Đồng Nai, đặt tour trải nghiệm miệt vườn và học tập qua ${lessons.length} chuyên đề song ngữ & giải phẫu 2D.`}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={buildLocalizedHref("/explore?view=tours", locale)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>{t.explore.viewToursTab}</span>
            </Link>
            <Link
              href={buildLocalizedHref("/learn", locale)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#F5F3E9]"
            >
              <span>{t.nav.learn}</span>
            </Link>
          </div>
        </Card>
      </section>
      <NaiFarmHomeChat />
    </div>
  );
}
