"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Heart, History, Scale, Trash2 } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { localizeCategory, localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { formatVnd } from "@/lib/format";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";

export default function FavoritesAndComparePage() {
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    hydrated,
    products,
    favoriteProductIds,
    recentlyViewedIds,
    compareProductIds,
    toggleCompareProduct,
    clearCompareProducts,
  } = useDemoStore();

  const favProducts = products.filter((p) => favoriteProductIds.includes(p.id));
  const recentProducts = products.filter((p) => recentlyViewedIds.includes(p.id));
  const compareProducts = products.filter((p) => compareProductIds.includes(p.id));

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading saved items..." : "Đang tải danh sách yêu thích..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-8 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="neutral">{t.nav.favorites}</Badge>
          <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
            {isEn ? "Saved Produce, Recently Viewed & Comparison" : "Nông sản Yêu thích, Đã xem & So sánh"}
          </h1>
        </div>
        <Link
          href={buildLocalizedHref("/marketplace", locale)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.nav.market}</span>
        </Link>
      </div>

      {/* Comparison Matrix */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Scale className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `Side-by-side comparison (${compareProducts.length}/3)`
                : `Bảng so sánh nông sản (${compareProducts.length}/3)`}
            </span>
          </h2>
          {compareProducts.length > 0 ? (
            <Button size="sm" variant="secondary" onClick={clearCompareProducts}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? "Clear comparison" : "Xóa so sánh"}</span>
            </Button>
          ) : null}
        </div>

        {compareProducts.length === 0 ? (
          <p className="text-xs text-[#52645A]">
            {isEn
              ? "Click Compare on up to 3 produce items in the same category on the Marketplace to view price, ward origin, Brix/season status, and QR batch side-by-side."
              : "Chọn nút So sánh trên tối đa 3 nông sản cùng danh mục ngoài Chợ OCOP để đối chiếu giá, xã/phường trồng, trạng thái mùa vụ và mã lô QR."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#D6DED2] bg-[#FAF8F1]">
                  <th className="p-3 font-bold text-[#52645A]">{isEn ? "Field" : "Tiêu chí"}</th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-3 font-bold text-[#25352B]">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={buildLocalizedHref(`/products/${p.slug}`, locale)}
                          className="text-[#245B3D] underline"
                        >
                          {localizeProductName(p, locale)}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCompareProduct(p.id)}
                          className="text-[11px] text-[#A32D2D] underline cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFE6]">
                <tr>
                  <td className="p-3 font-semibold text-[#52645A]">{isEn ? "Price" : "Giá bán"}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 font-bold tabular-nums text-[#245B3D]">
                      {formatVnd(p.priceVnd, locale, showUsd)}/{localizeUnit(p.unitLabel, locale)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#52645A]">{isEn ? "Category" : "Nhóm hàng"}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3">{localizeCategory(p.category, locale)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#52645A]">{isEn ? "Origin" : "Vùng trồng"}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3">
                      {p.farmName} · {p.administrativeUnitName} ({p.administrativeUnitCode})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#52645A]">{isEn ? "QR Batch" : "Mã lô QR"}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3">
                      <Link
                        href={buildLocalizedHref(`/trace/${p.batchCode}`, locale)}
                        className="font-mono font-bold text-[#245B3D] underline"
                      >
                        {p.batchCode}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Favorites Grid */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
          <Heart className="h-5 w-5 text-[#A32D2D]" aria-hidden="true" />
          <span>
            {isEn ? `Saved Produce (${favProducts.length})` : `Đã lưu yêu thích (${favProducts.length})`}
          </span>
        </h2>
        {favProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-5 w-5" />}
            title={isEn ? "No saved items yet" : "Chưa có nông sản yêu thích"}
            description={isEn ? "Tap the heart button on any product card." : "Nhấn biểu tượng tim trên thẻ sản phẩm để lưu."}
          />
        ) : (
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {favProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recentProducts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <History className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn ? `Recently Viewed (${recentProducts.length})` : `Sản phẩm đã xem gần đây (${recentProducts.length})`}
            </span>
          </h2>
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
