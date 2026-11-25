"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  HeartHandshake,
  MapPin,
  QrCode,
  Radio,
  Search,
  ShoppingBag,
  Sprout,
  Trees,
  Users,
  Video,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeCategory, localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { resolveCampaignRuntimeState } from "@/lib/commerce/promotion-engine";
import { UnifiedHero } from "@/components/home/UnifiedHero";
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

function formatShortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso.slice(0, 10);
}

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { products, farms, livestreams, lessons, campaigns, activeClockIso } = useDemoStore();
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

  const highlightedCampaign = useMemo(() => {
    const list = campaigns
      .map((c) => ({ campaign: c, runtime: resolveCampaignRuntimeState(c, activeClockIso) }))
      .filter((x) => x.runtime !== "paused_or_draft");
    const order: Record<string, number> = { active: 0, upcoming: 1, recap: 2 };
    list.sort((a, b) => (order[a.runtime] ?? 9) - (order[b.runtime] ?? 9));
    return list[0] ?? null;
  }, [campaigns, activeClockIso]);

  const quickAccessTiles = useMemo(
    () => [
      {
        id: "market",
        href: "/marketplace",
        title: isEn ? "Shop OCOP" : "Mua sắm OCOP",
        subtitle: isEn ? `${products.length} items` : `${products.length} đặc sản`,
        icon: ShoppingBag,
      },
      {
        id: "map",
        href: "/explore",
        title: isEn ? "Orchard Map" : "Bản đồ số",
        subtitle: isEn ? "95 Wards" : "95 Phường/Xã",
        icon: MapPin,
      },
      {
        id: "learn",
        href: "/learn",
        title: isEn ? "Agri Learning" : "Học tập số",
        subtitle: isEn ? `${lessons.length} lessons` : `${lessons.length} chuyên đề`,
        icon: BookOpen,
      },
      {
        id: "volunteer",
        href: "/volunteer",
        title: isEn ? "Volunteering" : "Tình nguyện",
        subtitle: isEn ? "Youth & farms" : "Thanh niên số",
        icon: HeartHandshake,
      },
      {
        id: "live",
        href: "/live",
        title: isEn ? "Video & Live" : "Video & Live",
        subtitle: isEn ? "Orchard rooms" : "Phát tại vườn",
        icon: Video,
      },
      {
        id: "tours",
        href: "/explore?view=tours",
        title: isEn ? "Agritourism" : "Du lịch vườn",
        subtitle: isEn ? "Orchard tours" : "Tour miệt vườn",
        icon: Trees,
      },
    ],
    [isEn, products.length, lessons.length],
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-3 py-4 sm:px-4 lg:space-y-8 lg:px-6 lg:py-6">
      {/* V9 Full-Image Unified Festival Hero Carousel */}
      <UnifiedHero />

      {/* V9 6 Quick-Access Ecosystem Tiles */}
      <section
        aria-label={isEn ? "Quick access pathways" : "Lối tắt hệ sinh thái NaiFarm"}
        data-v9-quick-tiles="true"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3"
      >
        {quickAccessTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.id}
              href={buildLocalizedHref(tile.href, locale)}
              className="group flex min-h-[72px] items-center gap-2.5 rounded-[14px] border border-[#D6DED2] bg-white px-3 py-2.5 shadow-[0_2px_6px_rgba(24,61,42,0.04)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#245B3D]/55 hover:shadow-[0_6px_16px_rgba(24,61,42,0.09)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#EAF0E5] text-[#245B3D] transition-colors group-hover:bg-[#245B3D] group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-snug font-bold text-[#25352B] group-hover:text-[#245B3D]">
                  {tile.title}
                </span>
                <span className="block truncate text-[11px] leading-snug text-[#52645A]">
                  {tile.subtitle}
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      {/* Compact Utility Bar: QR Passport Lookup + Accessible Farmer Quick-List Entry */}
      <section
        aria-label={
          isEn
            ? "Quick traceability and farmer tools"
            : "Tiện ích tra cứu QR và đăng bán nhà vườn"
        }
        className="flex flex-col gap-3 rounded-[16px] border border-[#D6DED2] bg-white p-3.5 shadow-[0_2px_8px_rgba(37,53,43,0.04)] lg:flex-row lg:items-center lg:justify-between"
      >
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
          className="flex flex-wrap items-center gap-2 lg:max-w-2xl lg:flex-1"
        >
          <QrCode className="ml-1 h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
          <label htmlFor="hero-qr-input" className="sr-only">
            {t.home.qrPlaceholder}
          </label>
          <input
            id="hero-qr-input"
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder={t.home.qrPlaceholder}
            className="min-h-[40px] min-w-[150px] flex-1 rounded-[10px] border border-[#788A7B] bg-[#F5F3E9] px-3 text-xs text-[#25352B] sm:text-sm"
          />
          <Button type="submit" size="sm" variant="gold">
            {t.home.qrLookupCta}
          </Button>
          <Link
            href={buildLocalizedHref("/trace/scan", locale)}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-[10px] border border-[#245B3D]/30 bg-[#EAF0E5] px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#DDE8D6]"
          >
            {t.home.qrScanCta}
          </Link>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D6DED2] pt-2.5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52645A]">
            <Sprout className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <span>{isEn ? "Growing in Dong Nai?" : "Bạn là nhà vườn Đồng Nai?"}</span>
          </span>
          <Link
            href={buildLocalizedHref("/farmer/publish", locale)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-[#FAF8F1] px-3.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
          >
            <span>{t.home.farmerPublishCta}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Featured Dong Nai Produce Section */}
      <section id="cho-nong-san" aria-labelledby="catalog-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="catalog-heading"
              className="font-editorial text-2xl font-bold text-[#25352B] md:text-[28px]"
            >
              {t.home.catalogHeading}
            </h2>
            <p className="mt-0.5 text-sm text-[#52645A]">{t.home.catalogSubtitle}</p>
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

        <div className="flex flex-col gap-3 rounded-[16px] border border-[#D6DED2] bg-white p-3.5 shadow-[0_2px_8px_rgba(37,53,43,0.04)] md:flex-row md:items-center md:justify-between">
          <div className="nf-scroll-x flex items-center gap-1.5 md:flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "min-h-[36px] shrink-0 cursor-pointer rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors",
                  category === cat
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                )}
              >
                {cat === "Tất cả" ? t.home.allCategories : localizeCategory(cat, locale)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyInSeason((v) => !v)}
              className={cn(
                "min-h-[36px] shrink-0 cursor-pointer rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors",
                onlyInSeason
                  ? "bg-[#D7A34D] text-[#25352B]"
                  : "border border-[#D6DED2] bg-white text-[#52645A] hover:bg-[#FFF2D8]",
              )}
            >
              {t.home.onlyInSeason}
            </button>
          </div>

          <div className="relative w-full shrink-0 md:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <label htmlFor="home-search" className="sr-only">
              {t.home.searchFilterPlaceholder}
            </label>
            <input
              id="home-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.home.searchFilterPlaceholder}
              className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm text-[#25352B]"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid-safe grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-4">
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

      {/* V9 Split Highlight Row: 95-Unit Orchard Map Preview + Upcoming Events & Festival */}
      <section
        aria-label={isEn ? "Orchard map and upcoming events" : "Bản đồ vùng trồng và sự kiện nổi bật"}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <Card className="flex flex-col justify-between p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#25352B]">
                {isEn ? "Dong Nai Growing Regions Map" : "Bản đồ vùng trồng Đồng Nai"}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-[#52645A]">
                {isEn
                  ? "95 Administrative Units (33 Wards · 62 Communes) · Interactive Leaflet GIS"
                  : "95 Phường/Xã (33 Phường · 62 Xã) · Bản đồ GIS tương tác"}
              </p>
            </div>
            <Link
              href={buildLocalizedHref("/explore", locale)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#245B3D] hover:underline"
            >
              <span>{isEn ? "Open full map" : "Mở bản đồ"}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative overflow-hidden rounded-[14px] border border-[#D6DED2] bg-gradient-to-br from-[#EAF0E5] via-[#F4F7EF] to-[#E1ECD9] p-4">
              {/* Clean stylistic Dong Nai region silhouette badge */}
              <svg
                viewBox="0 0 280 150"
                className="h-[132px] w-full"
                role="img"
                aria-label={
                  isEn
                    ? "Preview diagram of Dong Nai 95 wards and communes"
                    : "Minh họa khu vực 95 phường xã Đồng Nai"
                }
              >
                <path
                  d="M78 18 L148 12 L196 34 L224 72 L205 118 L156 138 L92 128 L58 96 L62 48 Z"
                  fill="#6C9C5B"
                  fillOpacity="0.28"
                  stroke="#245B3D"
                  strokeWidth="2.5"
                />
                <path
                  d="M112 22 L148 64 L198 68 M90 92 L148 64 L164 132 M64 60 L148 64"
                  stroke="#245B3D"
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  fill="none"
                />
                {[
                  { x: 102, y: 76, label: "Tân Triều" },
                  { x: 162, y: 88, label: "Long Khánh" },
                  { x: 194, y: 104, label: "Xuân Lộc" },
                  { x: 152, y: 40, label: "Định Quán" },
                ].map((pt) => (
                  <g key={pt.label}>
                    <circle cx={pt.x} cy={pt.y} r="6.5" fill="#245B3D" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={pt.x}
                      y={pt.y - 11}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#183D2A"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="text-lg font-bold text-[#245B3D] tabular-nums">95 {isEn ? "Units" : "Phường/Xã"}</p>
                <p className="text-xs text-[#52645A]">
                  {isEn
                    ? `${farms.length} orchards & co-ops mapped with route distance & QR batches`
                    : `${farms.length} nhà vườn & HTX kèm chỉ đường và mã lô QR`}
                </p>
              </div>
              <p className="rounded-[10px] border border-[#D7A34D]/45 bg-[#FFF8E7] px-2.5 py-1.5 text-[11px] leading-snug text-[#664108]">
                {isEn
                  ? "GIS note: 95/95 MIT community reference polygons; 0/95 official legal boundary polygons."
                  : "Minh bạch GIS: 95/95 đa giác tham khảo cộng đồng (MIT); 0/95 ranh giới pháp lý chính thức."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildLocalizedHref("/explore", locale)}
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white hover:bg-[#183D2A]"
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? "Open Map" : "Xem bản đồ"}</span>
                </Link>
                <Link
                  href={buildLocalizedHref("/explore?view=tours", locale)}
                  className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-[#245B3D] bg-white px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                >
                  <span>{isEn ? "Tours" : "Đặt tour"}</span>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-editorial text-xl font-bold text-[#25352B]">
              {isEn ? "Events & Festivals" : "Sự kiện & Hoạt động"}
            </h2>
            <Link
              href={buildLocalizedHref("/events", locale)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#245B3D] hover:underline"
            >
              <span>{isEn ? "View all" : "Xem tất cả"}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {highlightedCampaign ? (
            <div className="mt-3 flex flex-1 flex-col justify-between gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5">
              <div className="flex gap-3">
                <img
                  src="/images/hero/v9-festival-orchard-mobile.webp"
                  alt={
                    isEn
                      ? highlightedCampaign.campaign.titleEn
                      : highlightedCampaign.campaign.titleVi
                  }
                  className="h-24 w-24 shrink-0 rounded-[10px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Badge
                    tone={
                      highlightedCampaign.runtime === "active"
                        ? "success"
                        : highlightedCampaign.runtime === "upcoming"
                        ? "gold"
                        : "neutral"
                    }
                  >
                    {highlightedCampaign.runtime === "active"
                      ? isEn
                        ? "Live Now"
                        : "Đang diễn ra"
                      : highlightedCampaign.runtime === "upcoming"
                      ? isEn
                        ? "Upcoming"
                        : "Sắp diễn ra"
                      : isEn
                      ? "Event Recap"
                      : "Xem lại"}
                  </Badge>
                  <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-bold text-[#25352B]">
                    {isEn
                      ? highlightedCampaign.campaign.titleEn
                      : highlightedCampaign.campaign.titleVi}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#52645A]">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
                    <span className="tabular-nums">
                      {formatShortDate(highlightedCampaign.campaign.startIso)}
                    </span>
                  </p>
                </div>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-[#52645A]">
                {isEn
                  ? highlightedCampaign.campaign.subtitleEn
                  : highlightedCampaign.campaign.subtitleVi}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildLocalizedHref(`/events/${highlightedCampaign.campaign.slug}`, locale)}
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#183D2A]"
                >
                  <span>{isEn ? "Event details" : "Xem chi tiết sự kiện"}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href={buildLocalizedHref("/events", locale)}
                  className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                >
                  <span>{isEn ? "Schedule" : "Lịch sự kiện"}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[14px] bg-[#FAF8F1] p-4 text-xs text-[#52645A]">
              {isEn
                ? "Browse seasonal harvest festivals, volunteer campaigns, and weekend orchard markets."
                : "Khám phá ngày hội nông sản theo mùa, chiến dịch tình nguyện và phiên chợ miệt vườn."}
            </div>
          )}
        </Card>
      </section>

      {/* Documentary Farm Stories + Youth Digital Bridge */}
      <section aria-labelledby="farms-story-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="farms-story-heading" className="font-editorial text-2xl font-bold text-[#25352B]">
              {isEn
                ? "Farm stories and young people making a difference"
                : "Câu chuyện nhà vườn và thanh niên đồng hành"}
            </h2>
            <p className="mt-0.5 text-sm text-[#52645A]">
              {isEn
                ? "Information provided by the farm is clearly distinguished from records checked against supporting documents."
                : "Thông tin do nhà vườn cung cấp được phân biệt rõ với hồ sơ đã đối chiếu chứng từ."}
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {farms.slice(0, 2).map((farm) => (
            <Card key={farm.id} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)]">
                <img
                  src={farm.ownerPortrait}
                  alt={`${farm.ownerName} - ${isEn && farm.enName ? farm.enName : farm.name}`}
                  loading="lazy"
                  className="h-52 w-full object-cover sm:h-full"
                />
                <div className="flex flex-col justify-between p-4 sm:p-5">
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
                        {farm.areaHa} ha ·{" "}
                        {localizeAdminUnitName(farm.administrativeUnitName, undefined, locale)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
                      {isEn && farm.enName ? farm.enName : farm.name}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm text-[#52645A]">
                      {isEn && farm.enStorySummary ? farm.enStorySummary : farm.storySummary}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#245B3D]">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {isEn ? "Youth partners:" : "Hỗ trợ số:"} {farm.youthSupporters.join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#183D2A]"
                    >
                      <span>{isEn ? "View farm profile" : "Xem hồ sơ nhà vườn"}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href={buildLocalizedHref("/explore", locale)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-[#F5F3E9] px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
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

      {/* OCOP Live Schedule & 2D Learning Banner */}
      <section aria-labelledby="live-strip-heading" className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="live-strip-heading"
              className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]"
            >
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
                className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-3 transition-colors hover:bg-[#EAF0E5]"
              >
                <img
                  src={session.angles[0]?.image || "/images/stitch/stitch-44.jpg"}
                  alt={session.title}
                  loading="lazy"
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
                  <p className="mt-1 truncate text-xs text-[#52645A]">{session.scheduleLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-[#EAF0E5] p-5">
          <div>
            <Badge tone="success">
              {isEn ? "Explore & 9-Track Learning" : "Khám phá & Học tập 9 nhóm"}
            </Badge>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
              {isEn
                ? "Bilingual Agriculture & 2D Produce Anatomy"
                : "Học tập Nông nghiệp Số & Giải phẫu 2D"}
            </h2>
            <p className="mt-2 text-sm text-[#52645A]">
              {isEn
                ? `Learn across ${lessons.length} interactive VI/EN lessons tailored for 9 learner groups — from students and families to growers and international guests.`
                : `Khám phá ${lessons.length} chuyên đề song ngữ & giải phẫu 2D dành riêng cho 9 nhóm đối tượng từ học sinh, nhà nông đến khách quốc tế.`}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={buildLocalizedHref("/learn", locale)}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#183D2A]"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{t.nav.learn}</span>
            </Link>
            <Link
              href={buildLocalizedHref("/explore?view=tours", locale)}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#F5F3E9]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>{t.explore.viewToursTab}</span>
            </Link>
          </div>
        </Card>
      </section>

      <NaiFarmHomeChat />
    </div>
  );
}
