"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Clock,
  ExternalLink,
  Filter,
  GitCompare,
  Layers,
  MapPin,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeCategory } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "@/data/reference/ocop-public-reference";
import { CREDENTIAL_TYPE_MAP, evaluateCredentialDisplay } from "@/lib/quality/credential-registry";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import { cn, formatVnd } from "@/lib/format";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { DongNaiZone, ProductCategory } from "@/types/naifarm";

type CollectionTab = "all" | "in_season" | "pre_order" | "naibox" | "rescue" | "public_ref";
type SortOption = "featured" | "price_asc" | "price_desc" | "name_asc";
type PriceRangeKey = "all" | "under_100k" | "100k_250k" | "over_250k";

const COLLECTIONS: {
  id: CollectionTab;
  label: string;
  enLabel: string;
  badge?: string;
  enBadge?: string;
}[] = [
  { id: "all", label: "Tất cả nông sản", enLabel: "All produce" },
  { id: "in_season", label: "Đang vào mùa", enLabel: "In season" },
  { id: "pre_order", label: "Đặt trước mùa vụ", enLabel: "Pre-order" },
  { id: "naibox", label: "Hộp quà OCOP", enLabel: "OCOP Gift Boxes", badge: "Quà tặng", enBadge: "Gifts" },
  { id: "rescue", label: "Hỗ trợ mùa vụ", enLabel: "Harvest Support", badge: "Đồng hành", enBadge: "Support" },
  {
    id: "public_ref",
    label: "Danh mục OCOP tham khảo",
    enLabel: "Public OCOP Reference",
    badge: "Công bố",
    enBadge: "Official",
  },
];

const CATEGORIES: ProductCategory[] = [
  "Bưởi & Cây có múi",
  "Trái cây tươi",
  "Chôm chôm & Sầu riêng",
  "Hạt điều & Rang củi",
  "Cà phê & Ca cao",
  "Mật ong & Rượu trái cây",
  "Nông sản chế biến & Mứt",
  "Rau củ & Nấm sạch",
  "Tiêu & Gia vị vùng đồi",
  "Quà tặng OCOP & Combo",
  "Thảo mộc & Gia vị hữu cơ mẫu",
  "Đặc sản du lịch & Hộp quà",
];

const ZONES: DongNaiZone[] = [
  "Tân Triều & Trung tâm",
  "Long Khánh & Lân cận",
  "Xuân Lộc & Đông Nam",
  "Cẩm Mỹ & Định Quán",
  "Bắc Đồng Nai",
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t, currencyMode, setCurrencyMode } = useLocale();
  const isEn = locale === "en";
  const {
    products,
    farms,
    recentlyViewedIds,
    compareProductIds,
    toggleCompareProduct,
    clearCompareProducts,
    credentialRecords,
  } = useDemoStore();

  const initialQ = searchParams.get("q") ?? "";
  const initialTab = (searchParams.get("collection") as CollectionTab) || "all";

  const [collection, setCollection] = useState<CollectionTab>(
    COLLECTIONS.some((c) => c.id === initialTab) ? initialTab : "all",
  );
  const [searchText, setSearchText] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<PriceRangeKey>("all");
  const [onlyVerifiedCred, setOnlyVerifiedCred] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const farmZoneById = useMemo(() => {
    const map = new Map<string, DongNaiZone>();
    for (const f of farms) map.set(f.id, f.zoneLabel);
    return map;
  }, [farms]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const productHasVerifiedCred = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const hasValid = credentialRecords
        .filter((r) => r.productIds.includes(p.id) || (r.productIds.length === 0 && r.holderId === p.farmId))
        .some((r) => evaluateCredentialDisplay(r, p.category, p.id).canShowBadge);
      if (hasValid) set.add(p.id);
    }
    return set;
  }, [products, credentialRecords]);

  const filteredProducts = useMemo(() => {
    if (collection === "public_ref") return [];
    const q = normalizeSearchText(searchText);

    const list = products.filter((p) => {
      if (collection === "in_season" && p.seasonStatus !== "in_season") return false;
      if (collection === "pre_order" && p.seasonStatus !== "pre_order") return false;
      if (collection === "naibox" && !p.isNaiBox && p.category !== "Quà tặng OCOP & Combo") return false;
      if (collection === "rescue" && !p.isRescue) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedZone !== "all" && farmZoneById.get(p.farmId) !== selectedZone) return false;
      if (priceRange === "under_100k" && p.priceVnd >= 100000) return false;
      if (priceRange === "100k_250k" && (p.priceVnd < 100000 || p.priceVnd > 250000)) return false;
      if (priceRange === "over_250k" && p.priceVnd <= 250000) return false;
      if (onlyVerifiedCred && !productHasVerifiedCred.has(p.id)) return false;
      if (!q) return true;
      return normalizeSearchText(
        `${p.name} ${p.enName ?? ""} ${p.farmName} ${p.administrativeUnitName} ${p.batchCode} ${p.category} ${p.tags?.join(" ") ?? ""}`,
      ).includes(q);
    });

    if (sortBy === "price_asc") return [...list].sort((a, b) => a.priceVnd - b.priceVnd);
    if (sortBy === "price_desc") return [...list].sort((a, b) => b.priceVnd - a.priceVnd);
    if (sortBy === "name_asc") return [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return list;
  }, [
    products,
    collection,
    selectedCategory,
    selectedZone,
    priceRange,
    onlyVerifiedCred,
    productHasVerifiedCred,
    searchText,
    sortBy,
    farmZoneById,
  ]);

  const filteredReferenceItems = useMemo(() => {
    const q = normalizeSearchText(searchText);
    return OCOP_PUBLIC_REFERENCE_CATALOG.filter((item) => {
      if (!q) return true;
      return normalizeSearchText(
        `${item.name} ${item.subjectName} ${item.administrativeUnitName} ${item.decisionOrSourceLabel}`,
      ).includes(q);
    });
  }, [searchText]);

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 4);
  }, [recentlyViewedIds, products]);

  const compareProducts = useMemo(() => {
    return compareProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [compareProductIds, products]);

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedZone !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (onlyVerifiedCred ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSelectedZone("all");
    setPriceRange("all");
    setOnlyVerifiedCred(false);
    setSearchText("");
  };

  const switchCollection = (next: CollectionTab) => {
    setCollection(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("collection");
    else params.set("collection", next);
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : "/marketplace", { scroll: false });
  };

  const filterControls = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
          <Filter className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
          <span>{isEn ? "Filter Produce" : "Bộ lọc tìm kiếm"}</span>
        </h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={resetAllFilters}
            className="cursor-pointer text-xs font-semibold text-[#A52C22] hover:underline"
          >
            {t.home.clearFilters}
          </button>
        ) : null}
      </div>

      {/* Category List */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold tracking-wider text-[#52645A] uppercase">
          {isEn ? "Category" : "Danh mục"}
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-[#245B3D] font-semibold text-white"
                : "text-[#25352B] hover:bg-[#EAF0E5]",
            )}
          >
            <span>{isEn ? "All categories" : "Tất cả danh mục"}</span>
            <span className="tabular-nums opacity-80">{products.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts.get(cat) ?? 0;
            if (count === 0) return null;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-[#245B3D] font-semibold text-white"
                    : "text-[#25352B] hover:bg-[#EAF0E5]",
                )}
              >
                <span className="truncate">{localizeCategory(cat, locale)}</span>
                <span className="shrink-0 tabular-nums opacity-80">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5 border-t border-[#EAEFE6] pt-3">
        <p className="text-[11px] font-bold tracking-wider text-[#52645A] uppercase">
          {isEn ? "Price Range" : "Khoảng giá"}
        </p>
        <div className="space-y-1">
          {(
            [
              { id: "all", vi: "Tất cả mức giá", en: "Any price" },
              { id: "under_100k", vi: "Dưới 100.000đ", en: "Under 100,000đ" },
              { id: "100k_250k", vi: "100.000đ – 250.000đ", en: "100,000đ – 250,000đ" },
              { id: "over_250k", vi: "Trên 250.000đ", en: "Over 250,000đ" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPriceRange(opt.id)}
              className={cn(
                "flex w-full cursor-pointer items-center rounded-[9px] px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                priceRange === opt.id
                  ? "bg-[#EAF0E5] font-bold text-[#183D2A]"
                  : "text-[#25352B] hover:bg-[#F5F3E9]",
              )}
            >
              {isEn ? opt.en : opt.vi}
            </button>
          ))}
        </div>
      </div>

      {/* Area / Zone */}
      <div className="space-y-1.5 border-t border-[#EAEFE6] pt-3">
        <label htmlFor="market-zone-select" className="block text-[11px] font-bold tracking-wider text-[#52645A] uppercase">
          {isEn ? "Dong Nai Region" : "Khu vực Đồng Nai"}
        </label>
        <div className="relative flex items-center">
          <MapPin className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#52645A]" aria-hidden="true" />
          <select
            id="market-zone-select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="min-h-[38px] w-full rounded-[9px] border border-[#C6D2C2] bg-[#FAF8F1] pr-2.5 pl-8 text-xs text-[#25352B]"
          >
            <option value="all">{isEn ? "All Dong Nai areas" : "Toàn tỉnh Đồng Nai"}</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Verified Credential Checkbox */}
      <div className="border-t border-[#EAEFE6] pt-3">
        <label className="flex cursor-pointer items-start gap-2 text-xs text-[#25352B]">
          <input
            type="checkbox"
            checked={onlyVerifiedCred}
            onChange={(e) => setOnlyVerifiedCred(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#245B3D]"
          />
          <span className="leading-snug font-medium">
            {isEn
              ? "Only items with active OCOP / VietGAP dossiers"
              : "Chỉ hiển thị mục có chứng nhận OCOP / VietGAP hợp lệ"}
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 px-3 py-5 sm:px-4 lg:px-6 lg:py-7">
      {/* Compact Market Header */}
      <div className="flex flex-col gap-3 rounded-[18px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_10px_rgba(37,53,43,0.04)] md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-3 py-0.5 text-xs font-semibold text-[#245B3D]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {isEn
                ? `Dong Nai OCOP Market · ${products.length} items · ${farms.length} orchards`
                : `Chợ OCOP Đồng Nai · ${products.length} nông sản · ${farms.length} nhà vườn`}
            </span>
          </div>
          <h1 className="mt-1.5 font-editorial text-2xl font-bold text-[#25352B] md:text-[30px]">
            {isEn ? "Dong Nai Produce & OCOP Market" : "Chợ nông sản OCOP Đồng Nai"}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#52645A] sm:text-sm">
            {isEn
              ? `${products.length} listings from ${farms.length} Dong Nai orchards with QR batch passports, strictly separated from ${OCOP_PUBLIC_REFERENCE_CATALOG.length} public reference records.`
              : `${products.length} mặt hàng từ ${farms.length} nhà vườn tại Đồng Nai gắn mã QR truy xuất từng lô, tách bạch với ${OCOP_PUBLIC_REFERENCE_CATALOG.length} hồ sơ công bố tham khảo.`}
          </p>
          {currencyMode === "vnd_usd_est" ? (
            <p className="mt-1 text-[11px] font-medium text-[#80520C]">
              {t.commerce.usdEstimateNote}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCurrencyMode(currencyMode === "vnd" ? "vnd_usd_est" : "vnd")}
            aria-pressed={currencyMode === "vnd_usd_est"}
            className={cn(
              "inline-flex min-h-[40px] cursor-pointer items-center rounded-[10px] border px-3 text-xs font-semibold",
              currencyMode === "vnd_usd_est"
                ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                : "border-[#D6DED2] bg-white text-[#25352B]",
            )}
          >
            {t.commerce.showUsdEstimateToggle}
          </button>
          <Link
            href={buildLocalizedHref("/quality", locale)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-3.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.nav.quality}</span>
          </Link>
        </div>
      </div>

      {/* Collection Tabs (Horizontal Scroll Safe on Narrow Phones) */}
      <div
        className="nf-scroll-x flex items-center gap-2 md:flex-wrap"
        role="tablist"
        aria-label={isEn ? "Market collections" : "Bộ sưu tập chợ nông sản"}
      >
        {COLLECTIONS.map((col) => {
          const active = collection === col.id;
          return (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchCollection(col.id)}
              className={cn(
                "inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition sm:text-[13px]",
                active
                  ? "border-[#245B3D] bg-[#245B3D] text-white"
                  : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              <span>{isEn ? col.enLabel : col.label}</span>
              {col.badge ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-[#FFF2D8] text-[#80520C]",
                  )}
                >
                  {isEn && col.enBadge ? col.enBadge : col.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Public Reference Catalog Tab */}
      {collection === "public_ref" ? (
        <section
          aria-label={
            isEn
              ? "Official Public OCOP & VietGAP Reference Catalog"
              : "Danh mục OCOP VietGAP GI công bố chính thức"
          }
          className="space-y-4"
        >
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={
                isEn
                  ? "Search published product, producer, or decision number..."
                  : "Tìm sản phẩm, doanh nghiệp, QĐ 125 trong danh mục công bố..."
              }
              aria-label={isEn ? "Search official OCOP reference" : "Tìm trong danh mục công bố"}
              className="min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
            />
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-4 text-sm text-[#5C3D0A]">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#80520C]" aria-hidden="true" />
            <div>
              <p className="font-bold">
                {isEn
                  ? "Public Reference Catalog — Strictly read-only records from published decisions"
                  : "Danh mục tham khảo công khai — Chỉ hiển thị dữ liệu từ nguồn công bố chính thức"}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {isEn
                  ? "Records below quote official names and locations from Dong Nai Decision 125/QD-UBND, VietGAP portals, and Geographical Indication registries. Prices, carts, and reviews are never attached to real legal producers without an active storefront."
                  : "Các bản ghi bên dưới trích xuất nguyên văn tên sản phẩm, chủ thể và địa bàn từ QĐ 125/QĐ-UBND, cổng VietGAP và hồ sơ Chỉ dẫn địa lý Đồng Nai. Không gắn giá bán, giỏ hàng hoặc đánh giá lên chủ thể pháp lý thật khi chưa ký kết mở gian hàng."}
              </p>
            </div>
          </div>

          {filteredReferenceItems.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" aria-hidden="true" />}
              title={isEn ? "No matching official records found" : "Không tìm thấy hồ sơ công bố phù hợp"}
              description={
                isEn
                  ? "Clear the search filter to browse all 17 published OCOP, VietGAP, and GI entries."
                  : "Thử xóa từ khóa lọc để xem toàn bộ 17 mục OCOP, VietGAP và Chỉ dẫn địa lý công bố."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReferenceItems.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-[12px] border border-[#D6DED2] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <Badge tone="info">{t.commerce.referenceCatalogOnly}</Badge>
                        <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-[#25352B]">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#245B3D]">
                          {item.subjectName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-[12px] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
                      <p>
                        <strong className="text-[#25352B]">
                          {isEn ? "Source address:" : "Địa chỉ nguồn gốc:"}
                        </strong>{" "}
                        {item.sourceAddressOriginal}
                      </p>
                      <p>
                        <strong className="text-[#25352B]">
                          {isEn ? "Reference decision:" : "Văn bản / chứng nhận:"}
                        </strong>{" "}
                        {item.decisionOrSourceLabel}
                      </p>
                      <p>{item.credentialSummary}</p>
                      {item.scopeWarning ? (
                        <p className="rounded-lg bg-[#FFF2D8] px-2.5 py-1.5 text-[11px] font-medium text-[#80520C]">
                          {item.scopeWarning}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#EAEFE6] pt-3 text-xs">
                    <span className="text-[#52645A]">
                      {isEn ? "Checked:" : "Đối chiếu:"} {item.checkedAt}
                    </span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#245B3D] hover:underline"
                    >
                      <span>{isEn ? "View official source" : "Xem nguồn công bố"}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* V9 Desktop Left Sidebar (248px) + Main Produce Grid / Mobile Filter Bottom Sheet */
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
          {/* Desktop Left Filter Sidebar */}
          <aside
            aria-label={isEn ? "Marketplace filters" : "Thanh lọc nông sản"}
            className="hidden rounded-[16px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.04)] lg:sticky lg:top-[84px] lg:block"
          >
            {filterControls}
          </aside>

          {/* Main Produce Column */}
          <div className="min-w-0 space-y-4">
            {/* Compact Top Search + Mobile Filter Trigger + Sort Bar */}
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#D6DED2] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={
                    isEn
                      ? "Search pomelo, durian, lot NF-..., orchard..."
                      : "Tìm bưởi, sầu riêng, mã lô NF-..., nhà vườn..."
                  }
                  aria-label={isEn ? "Search produce" : "Tìm kiếm nông sản"}
                  className="min-h-[40px] w-full rounded-[10px] border border-[#C6D2C2] bg-[#FAF8F1] pr-3 pl-9 text-sm text-[#25352B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-mobile-filter-trigger="true"
                  onClick={() => setMobileFilterOpen(true)}
                  className="inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#245B3D]/40 bg-[#EAF0E5] px-3 text-xs font-bold text-[#183D2A] lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? "Filters" : "Bộ lọc"}</span>
                  {activeFilterCount > 0 ? (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#245B3D] px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>

                <div className="relative flex flex-1 items-center sm:w-52 sm:flex-none">
                  <ArrowUpDown
                    className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#52645A]"
                    aria-hidden="true"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label={isEn ? "Sort products" : "Sắp xếp sản phẩm"}
                    className="min-h-[40px] w-full rounded-[10px] border border-[#C6D2C2] bg-white pr-2.5 pl-8 text-xs font-medium text-[#25352B]"
                  >
                    <option value="featured">
                      {isEn ? "Sort: Seasonal picks" : "Sắp xếp: Nổi bật theo mùa"}
                    </option>
                    <option value="price_asc">
                      {isEn ? "Price: Low to high" : "Giá: Thấp đến cao"}
                    </option>
                    <option value="price_desc">
                      {isEn ? "Price: High to low" : "Giá: Cao đến thấp"}
                    </option>
                    <option value="name_asc">{isEn ? "Name: A–Z" : "Tên nông sản: A–Z"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Result Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#52645A] sm:text-sm">
              <p>
                {isEn ? (
                  <>
                    Showing <strong className="text-[#25352B]">{filteredProducts.length}</strong>{" "}
                    products
                    {selectedCategory !== "all"
                      ? ` · ${localizeCategory(selectedCategory as ProductCategory, locale)}`
                      : ""}
                    {selectedZone !== "all" ? ` · ${selectedZone}` : ""}
                  </>
                ) : (
                  <>
                    Hiển thị <strong className="text-[#25352B]">{filteredProducts.length}</strong>{" "}
                    nông sản phù hợp
                    {selectedCategory !== "all" ? ` · ${selectedCategory}` : ""}
                    {selectedZone !== "all" ? ` · ${selectedZone}` : ""}
                  </>
                )}
              </p>
              {activeFilterCount > 0 || searchText.trim() !== "" ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="cursor-pointer text-xs font-semibold text-[#245B3D] hover:underline"
                >
                  {t.home.clearFilters}
                </button>
              ) : null}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6" aria-hidden="true" />}
                title={isEn ? "No matching produce found" : "Chưa tìm thấy nông sản khớp bộ lọc"}
                description={
                  isEn
                    ? "Try selecting All categories or searching by Dong Nai ward/commune name."
                    : "Thử chuyển sang tất cả ngành hàng hoặc tìm theo tên xã/phường Đồng Nai."
                }
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetAllFilters();
                      switchCollection("all");
                    }}
                  >
                    {isEn ? "View all produce" : "Xem toàn bộ nông sản"}
                  </Button>
                }
              />
            ) : (
              <div className="grid-safe grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 md:grid-cols-3 lg:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showCompareToggle />
                ))}
              </div>
            )}

            {/* Recently Viewed */}
            {recentlyViewedProducts.length > 0 ? (
              <section
                aria-label={isEn ? "Recently viewed produce" : "Nông sản vừa xem"}
                className="space-y-3 pt-4"
              >
                <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]">
                  <Clock className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>{isEn ? "Recently Viewed" : "Vừa xem gần đây"}</span>
                </h2>
                <div className="grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {recentlyViewedProducts.map((p) => (
                    <ProductCard key={`recent-${p.id}`} product={p} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet (<lg) */}
      {mobileFilterOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? "Filter produce" : "Bộ lọc nông sản"}
          className="fixed inset-0 z-50 flex items-end bg-[#18241D]/60 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileFilterOpen(false);
          }}
        >
          <div className="max-h-[82dvh] w-full overflow-y-auto rounded-t-[22px] bg-white p-5 pb-7 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#EAEFE6] pb-3">
              <span className="text-base font-bold text-[#25352B]">
                {isEn ? "Filter Produce" : "Bộ lọc nông sản"}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label={t.nav.closeButton}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D6DED2] hover:bg-[#EAF0E5]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {filterControls}
            <div className="mt-5 flex gap-2 border-t border-[#EAEFE6] pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
              >
                {t.home.clearFilters}
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setMobileFilterOpen(false)}>
                {isEn
                  ? `Apply (${filteredProducts.length})`
                  : `Xem ${filteredProducts.length} kết quả`}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sticky Compare Tray */}
      {compareProducts.length > 0 ? (
        <div
          role="region"
          aria-label={isEn ? "Product compare tray" : "Thanh so sánh nông sản"}
          className="sticky bottom-16 z-30 mx-auto max-w-4xl rounded-[16px] border border-[#245B3D] bg-white p-3.5 shadow-[0_10px_28px_rgba(37,53,43,0.18)] md:bottom-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245B3D]">
                <GitCompare className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isEn
                    ? `Compare (${compareProducts.length}/3):`
                    : `So sánh (${compareProducts.length}/3):`}
                </span>
              </span>
              {compareProducts.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D6DED2] bg-[#EAF0E5] px-3 py-1 text-xs font-semibold text-[#25352B]"
                >
                  <span className="max-w-[140px] truncate">
                    {isEn && item.enName ? item.enName : item.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompareProduct(item.id)}
                    aria-label={
                      isEn ? `Remove ${item.name} from comparison` : `Bỏ ${item.name} khỏi so sánh`
                    }
                    className="cursor-pointer rounded-full p-0.5 hover:bg-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompareProducts}>
                {isEn ? "Clear all" : "Xóa hết"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCompareModalOpen(true)}
                disabled={compareProducts.length < 2}
              >
                {isEn
                  ? `Compare side by side (${compareProducts.length})`
                  : `Đối chiếu bảng (${compareProducts.length})`}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Side-by-side Compare Modal */}
      {compareModalOpen && compareProducts.length >= 2 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            isEn ? "Side-by-side product comparison" : "Bảng đối chiếu nông sản cùng ngành hàng"
          }
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18241D]/75 p-4"
        >
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D6DED2] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">
                  {isEn
                    ? `Compare produce (${localizeCategory(compareProducts[0]?.category as ProductCategory, locale)})`
                    : `Đối chiếu nông sản (${compareProducts[0]?.category})`}
                </h2>
                <p className="text-xs text-[#52645A]">
                  {isEn
                    ? "Only active, dossier-verified quality credentials are shown."
                    : "Chỉ hiển thị các chứng nhận còn hiệu lực và đủ hồ sơ đối chiếu."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                aria-label={t.nav.closeButton}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D6DED2] hover:bg-[#EAF0E5]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D6DED2]">
                    <th className="py-2 pr-3 text-xs font-semibold text-[#52645A]">
                      {isEn ? "Criteria" : "Tiêu chí"}
                    </th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="px-3 py-2 font-bold text-[#25352B]">
                        <Link
                          href={buildLocalizedHref(`/products/${p.slug}`, locale)}
                          className="hover:text-[#245B3D] hover:underline"
                        >
                          {isEn && p.enName ? p.enName : p.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE6] text-xs">
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">
                      {isEn ? "Price" : "Đơn giá"}
                    </td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 font-bold text-[#A52C22] tabular-nums">
                        {formatVnd(p.priceVnd, locale)} / {p.unitLabel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">
                      {isEn ? "Orchard & Area" : "Nhà vườn & Địa bàn"}
                    </td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 text-[#25352B]">
                        {p.farmName} ({p.administrativeUnitName})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">
                      {isEn ? "Available Stock" : "Tồn khả dụng"}
                    </td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 tabular-nums text-[#25352B]">
                        {p.stockKg} {p.unitLabel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">
                      {isEn ? "Notes & Storage" : "Đặc tính / Bảo quản"}
                    </td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 text-[#52645A]">
                        {p.brixNote ||
                          p.storageNote ||
                          (isEn
                            ? "Store in cool dry place per orchard guidance"
                            : "Bảo quản thoáng mát theo hướng dẫn vườn")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">
                      {isEn ? "Valid Credentials" : "Chứng nhận hợp lệ"}
                    </td>
                    {compareProducts.map((p) => {
                      const validCreds = credentialRecords
                        .filter(
                          (r) =>
                            r.productIds.includes(p.id) ||
                            (r.productIds.length === 0 && r.holderId === p.farmId),
                        )
                        .filter((r) => evaluateCredentialDisplay(r, p.category, p.id).canShowBadge);
                      return (
                        <td key={p.id} className="px-3 py-2.5">
                          {validCreds.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {validCreds.map((c) => (
                                <Badge key={c.id} tone="success">
                                  {CREDENTIAL_TYPE_MAP.get(c.typeId)?.displayName ?? c.typeId}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#52645A]">
                              {isEn ? "None verified" : "Chưa gắn nhãn hợp lệ"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải danh mục nông sản Đồng Nai...
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
