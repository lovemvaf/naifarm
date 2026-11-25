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

const COLLECTIONS: { id: CollectionTab; label: string; badge?: string }[] = [
  { id: "all", label: "Tất cả nông sản" },
  { id: "in_season", label: "Mua theo mùa" },
  { id: "pre_order", label: "Đặt trước mùa vụ" },
  { id: "naibox", label: "NaiBox 95", badge: "Hộp quà" },
  { id: "rescue", label: "NaiRescue", badge: "Giải cứu" },
  { id: "public_ref", label: "Danh mục OCOP tham khảo", badge: "Nguồn công bố" },
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
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [compareModalOpen, setCompareModalOpen] = useState(false);

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
      if (!q) return true;
      return normalizeSearchText(
        `${p.name} ${p.enName ?? ""} ${p.farmName} ${p.administrativeUnitName} ${p.batchCode} ${p.category} ${p.tags?.join(" ") ?? ""}`,
      ).includes(q);
    });

    if (sortBy === "price_asc") return [...list].sort((a, b) => a.priceVnd - b.priceVnd);
    if (sortBy === "price_desc") return [...list].sort((a, b) => b.priceVnd - a.priceVnd);
    if (sortBy === "name_asc") return [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return list;
  }, [products, collection, selectedCategory, selectedZone, searchText, sortBy, farmZoneById]);

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

  const switchCollection = (next: CollectionTab) => {
    setCollection(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("collection");
    else params.set("collection", next);
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : "/marketplace", { scroll: false });
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-6">
      <div className="flex flex-col gap-4 rounded-[20px] border border-[#D6DED2] bg-white p-5 shadow-[0_2px_10px_rgba(37,53,43,0.05)] md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-semibold text-[#245B3D]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {isEn
                ? `Dong Nai OCOP Market · ${products.length} listings · ${farms.length} orchards`
                : `Chợ nông sản OCOP Đồng Nai · ${products.length} mặt hàng · ${farms.length} nhà vườn`}
            </span>
          </div>
          <h1 className="mt-2 font-editorial text-2xl font-bold text-[#25352B] md:text-3xl">
            {isEn ? "Dong Nai Produce & OCOP Market" : "Chợ nông sản & Đặc sản Đồng Nai"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#52645A]">
            {isEn
              ? `${products.length} listings from ${farms.length} Dong Nai orchards with QR batch passports, strictly separated from ${OCOP_PUBLIC_REFERENCE_CATALOG.length} public reference records.`
              : `${products.length} mặt hàng từ ${farms.length} nhà vườn tại Đồng Nai gắn mã QR truy xuất từng lô, tách bạch với ${OCOP_PUBLIC_REFERENCE_CATALOG.length} hồ sơ công bố chính thức trong danh mục tham khảo.`}
          </p>
          {currencyMode === "vnd_usd_est" ? (
            <p className="mt-1.5 text-[11px] font-medium text-[#80520C]">
              {t.commerce.usdEstimateNote}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrencyMode(currencyMode === "vnd" ? "vnd_usd_est" : "vnd")
            }
            aria-pressed={currencyMode === "vnd_usd_est"}
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-[12px] border px-3.5 text-xs font-semibold cursor-pointer",
              currencyMode === "vnd_usd_est"
                ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                : "border-[#D6DED2] bg-white text-[#25352B]",
            )}
          >
            {t.commerce.showUsdEstimateToggle}
          </button>
          <Link
            href={buildLocalizedHref("/quality", locale)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-[#245B3D] bg-white px-4 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>{t.nav.quality}</span>
          </Link>
        </div>
      </div>

      {/* Collection Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Bộ sưu tập chợ nông sản">
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
                "inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                active
                  ? "border-[#245B3D] bg-[#245B3D] text-white"
                  : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              <span>{col.label}</span>
              {col.badge ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-[#FFF2D8] text-[#80520C]",
                  )}
                >
                  {col.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={
                collection === "public_ref"
                  ? "Tìm sản phẩm, doanh nghiệp, QĐ 125 trong danh mục công bố..."
                  : "Tìm bưởi, sầu riêng, mã lô NF-..., tên nhà vườn, xã/phường..."
              }
              aria-label="Tìm kiếm nông sản"
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
            />
          </div>

          {collection !== "public_ref" ? (
            <>
              <div className="md:col-span-3">
                <div className="relative flex items-center">
                  <MapPin
                    className="pointer-events-none absolute left-3 h-4 w-4 text-[#52645A]"
                    aria-hidden="true"
                  />
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    aria-label="Lọc theo vùng Đồng Nai"
                    className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
                  >
                    <option value="all">Tất cả vùng Đồng Nai</option>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="relative flex items-center">
                  <ArrowUpDown
                    className="pointer-events-none absolute left-3 h-4 w-4 text-[#52645A]"
                    aria-hidden="true"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sắp xếp sản phẩm"
                    className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
                  >
                    <option value="featured">Sắp xếp: Nổi bật theo mùa</option>
                    <option value="price_asc">Giá: Thấp đến cao</option>
                    <option value="price_desc">Giá: Cao đến thấp</option>
                    <option value="name_asc">Tên nông sản: A–Z</option>
                  </select>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {collection !== "public_ref" ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#EAEFE6] pt-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#52645A]">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ngành hàng:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "min-h-[32px] cursor-pointer rounded-full px-3 text-xs font-semibold transition",
                selectedCategory === "all"
                  ? "bg-[#245B3D] text-white"
                  : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              Tất cả ({products.length})
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
                    "min-h-[32px] cursor-pointer rounded-full px-3 text-xs font-semibold transition",
                    active
                      ? "bg-[#245B3D] text-white"
                      : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                  )}
                >
                  {localizeCategory(cat, locale)} ({count})
                </button>
              );
            })}
          </div>
        ) : null}
      </Card>

      {/* Public Reference Catalog Tab */}
      {collection === "public_ref" ? (
        <section aria-label="Danh mục OCOP VietGAP GI công bố chính thức" className="space-y-4">
          <div className="flex items-start gap-3 rounded-[14px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-4 text-sm text-[#5C3D0A]">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#80520C]" aria-hidden="true" />
            <div>
              <p className="font-bold">
                Danh mục tham khảo công khai — Chỉ hiển thị dữ liệu từ nguồn công bố chính thức
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                Các bản ghi bên dưới trích xuất nguyên văn tên sản phẩm, chủ thể và địa bàn từ QĐ 125/QĐ-UBND,
                cổng VietGAP và hồ sơ Chỉ dẫn địa lý Đồng Nai. Không gắn giá bán, giỏ hàng hoặc đánh giá khách hàng
                lên chủ thể pháp lý thật khi chưa ký kết mở gian hàng.
              </p>
            </div>
          </div>

          {filteredReferenceItems.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" aria-hidden="true" />}
              title="Không tìm thấy hồ sơ công bố phù hợp"
              description="Thử xóa từ khóa lọc để xem toàn bộ 17 mục OCOP, VietGAP và Chỉ dẫn địa lý công bố."
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
                        <Badge tone="info">Nguồn công bố · Chỉ đọc</Badge>
                        <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-[#25352B]">{item.name}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#245B3D]">{item.subjectName}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-[12px] bg-[#FAF8F1] p-3 text-xs text-[#52645A]">
                      <p>
                        <strong className="text-[#25352B]">Địa chỉ nguồn gốc:</strong> {item.sourceAddressOriginal}
                      </p>
                      <p>
                        <strong className="text-[#25352B]">Văn bản / chứng nhận:</strong> {item.decisionOrSourceLabel}
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
                    <span className="text-[#52645A]">Đối chiếu: {item.checkedAt}</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#245B3D] hover:underline"
                    >
                      <span>Xem nguồn công bố</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#52645A]">
            <p>
              Hiển thị <strong className="text-[#25352B]">{filteredProducts.length}</strong> nông sản phù hợp
              {selectedCategory !== "all" ? ` · Ngành: ${selectedCategory}` : ""}
              {selectedZone !== "all" ? ` · Vùng: ${selectedZone}` : ""}
            </p>
            {(selectedCategory !== "all" || selectedZone !== "all" || searchText.trim() !== "") ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedZone("all");
                  setSearchText("");
                }}
                className="cursor-pointer text-xs font-semibold text-[#245B3D] hover:underline"
              >
                Xóa bộ lọc
              </button>
            ) : null}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" aria-hidden="true" />}
              title="Chưa tìm thấy nông sản khớp bộ lọc"
              description="Thử chuyển sang tất cả ngành hàng hoặc tìm theo tên xã/phường Đồng Nai."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedZone("all");
                    setSearchText("");
                    switchCollection("all");
                  }}
                >
                  Xem toàn bộ nông sản
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showCompareToggle />
              ))}
            </div>
          )}

          {recentlyViewedProducts.length > 0 ? (
            <section aria-label="Nông sản vừa xem" className="space-y-4 pt-4">
              <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]">
                <Clock className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                <span>Vừa xem gần đây</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentlyViewedProducts.map((p) => (
                  <ProductCard key={`recent-${p.id}`} product={p} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {compareProducts.length > 0 ? (
        <div
          role="region"
          aria-label="Thanh so sánh nông sản"
          className="sticky bottom-16 z-30 mx-auto max-w-4xl rounded-[16px] border border-[#245B3D] bg-white p-3.5 shadow-[0_10px_28px_rgba(37,53,43,0.18)] lg:bottom-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245B3D]">
                <GitCompare className="h-4 w-4" aria-hidden="true" />
                <span>So sánh ({compareProducts.length}/3):</span>
              </span>
              {compareProducts.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D6DED2] bg-[#EAF0E5] px-3 py-1 text-xs font-semibold text-[#25352B]"
                >
                  <span className="max-w-[140px] truncate">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompareProduct(item.id)}
                    aria-label={`Bỏ ${item.name} khỏi so sánh`}
                    className="cursor-pointer rounded-full p-0.5 hover:bg-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompareProducts}>
                Xóa hết
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCompareModalOpen(true)}
                disabled={compareProducts.length < 2}
              >
                Đối chiếu bảng ({compareProducts.length})
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {compareModalOpen && compareProducts.length >= 2 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bảng đối chiếu nông sản cùng ngành hàng"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18241D]/75 p-4"
        >
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D6DED2] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#25352B]">
                  Đối chiếu nông sản ({compareProducts[0]?.category})
                </h2>
                <p className="text-xs text-[#52645A]">
                  Chỉ hiển thị các chứng nhận còn hiệu lực và đủ hồ sơ đối chiếu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                aria-label="Đóng bảng so sánh"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D6DED2] hover:bg-[#EAF0E5]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D6DED2]">
                    <th className="py-2 pr-3 text-xs font-semibold text-[#52645A]">Tiêu chí</th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="px-3 py-2 font-bold text-[#25352B]">
                        <Link href={`/products/${p.slug}`} className="hover:text-[#245B3D] hover:underline">
                          {p.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE6] text-xs">
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">Đơn giá</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 font-bold text-[#245B3D] tabular-nums">
                        {formatVnd(p.priceVnd)} / {p.unitLabel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">Nhà vườn &amp; Địa bàn</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 text-[#25352B]">
                        {p.farmName} ({p.administrativeUnitName})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">Tồn khả dụng</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 tabular-nums text-[#25352B]">
                        {p.stockKg} {p.unitLabel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">Đặc tính / Bảo quản</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="px-3 py-2.5 text-[#52645A]">
                        {p.brixNote || p.storageNote || "Bảo quản thoáng mát theo hướng dẫn vườn"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold text-[#52645A]">Chứng nhận hợp lệ</td>
                    {compareProducts.map((p) => {
                      const validCreds = credentialRecords
                        .filter((r) => r.productIds.includes(p.id) || (r.productIds.length === 0 && r.holderId === p.farmId))
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
                            <span className="text-[#52645A]">Chưa gắn nhãn hợp lệ</span>
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
