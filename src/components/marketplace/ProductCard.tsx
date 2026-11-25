"use client";

import React from "react";
import Link from "next/link";
import { Bell, GitCompare, Heart, MapPin, QrCode, ShieldAlert, ShoppingBasket } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { evaluateMinorSafeguarding } from "@/lib/permissions/access-control";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { cn, formatVnd } from "@/lib/format";
import type { Locale, Product } from "@/types/naifarm";
import { Badge, Button } from "@/components/ui/Primitives";

function splitContainerAndPack(
  unitLabel: string,
  locale: Locale,
): { container: string; packNote: string } {
  const localized = localizeUnit(unitLabel, locale).trim();
  const isEn = locale === "en";
  const m = localized.match(/^([^\d~]+?)\s+(~?\d[\d.,]*\s*(?:kg|g|ml|l|pcs|món|items?|mon).*)$/i);
  if (m) {
    const container = m[1].trim();
    const spec = m[2].trim();
    return {
      container,
      packNote: isEn ? `Pack: ${spec}` : `Quy cách: ${spec}`,
    };
  }
  return {
    container: localized,
    packNote:
      localized.toLowerCase() === "kg"
        ? isEn
          ? "Sold by weight (kg)"
          : "Bán theo cân chuẩn (kg)"
        : "\u00A0",
  };
}

function pluralizeStock(qty: number, container: string, locale: Locale): string {
  if (locale === "vi") return `Còn ${qty} ${container}`;
  if (container.toLowerCase() === "kg") return `${qty} kg left`;
  const lower = container.toLowerCase();
  if (qty === 1) return `1 ${lower} left`;
  if (lower.endsWith("x") || lower.endsWith("ch") || lower.endsWith("sh")) {
    return `${qty} ${lower}es left`;
  }
  return `${qty} ${lower}s left`;
}

export function ProductCard({
  product,
  showCompareToggle = false,
}: {
  product: Product;
  showCompareToggle?: boolean;
}) {
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    authUser,
    activeWorkspace,
    addToCart,
    toggleFollowSeason,
    followedProductIds,
    toggleFavorite,
    favoriteProductIds,
    toggleCompareProduct,
    compareProductIds,
  } = useDemoStore();

  const minorGuard = evaluateMinorSafeguarding(authUser?.isMinor, authUser?.hasGuardianConsent);
  const blockedForMinor = !minorGuard.allowAlcoholCatalog && Boolean(product.adultOnly);
  const isReadOnlyAdmin = Boolean(authUser && activeWorkspace === "W06");

  const isAvailable =
    (product.seasonStatus === "in_season" || product.seasonStatus === "pre_order") &&
    product.stockKg > 0 &&
    !blockedForMinor;
  const isFollowed = followedProductIds.includes(product.id);
  const isFav = favoriteProductIds.includes(product.id);
  const isCompared = compareProductIds.includes(product.id);

  const displayName = localizeProductName(product, locale);
  const { container, packNote } = splitContainerAndPack(product.unitLabel, locale);
  const productHref = buildLocalizedHref(`/products/${product.slug}`, locale);

  return (
    <article
      data-product-card="true"
      className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#245B3D]/40 hover:shadow-[0_8px_22px_rgba(37,53,43,0.11)]"
    >
      {/* Media frame: action buttons sit OUTSIDE <Link> as siblings for valid interactive HTML */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EAF0E5]">
        <Link href={productHref} className="block h-full w-full">
          <img
            src={product.image}
            alt={displayName}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="pointer-events-none absolute top-2 left-2 flex max-w-[calc(100%-84px)] flex-wrap gap-1">
          {product.seasonStatus === "in_season" && product.stockKg > 0 ? (
            <Badge tone="success">{t.commerce.inSeason}</Badge>
          ) : product.seasonStatus === "pre_order" ? (
            <Badge tone="info">{t.commerce.preOrder}</Badge>
          ) : (
            <Badge tone="warning">{t.commerce.outOfSeason}</Badge>
          )}
          {product.isNaiBox ? (
            <Badge tone="gold">{isEn ? "Gift Box" : "Hộp quà OCOP"}</Badge>
          ) : null}
          {product.isRescue ? (
            <Badge tone="warning">{isEn ? "Harvest Support" : "Hỗ trợ mùa vụ"}</Badge>
          ) : null}
          {product.adultOnly ? <Badge tone="danger">18+</Badge> : null}
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {showCompareToggle ? (
            <button
              type="button"
              onClick={() => {
                const res = toggleCompareProduct(product.id);
                if (!res.ok && res.message) {
                  notifyError(res.message);
                } else {
                  notifyInfo(
                    isCompared
                      ? isEn
                        ? `Removed ${displayName} from compare`
                        : `Đã bỏ so sánh ${displayName}`
                      : isEn
                      ? `Added ${displayName} to compare`
                      : `Đã thêm ${displayName} vào đối chiếu`,
                  );
                }
              }}
              aria-label={
                isCompared
                  ? isEn
                    ? `Remove compare ${displayName}`
                    : `Bỏ so sánh ${displayName}`
                  : isEn
                  ? `Compare ${displayName}`
                  : `So sánh ${displayName}`
              }
              title={isEn ? "Compare" : "So sánh cùng nhóm"}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm transition-colors sm:h-9 sm:w-9",
                isCompared
                  ? "bg-[#245B3D] text-white"
                  : "bg-white/95 text-[#25352B] hover:bg-white hover:text-[#245B3D]",
              )}
            >
              <GitCompare className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-label={
              isFav
                ? isEn
                  ? `Unfavorite ${displayName}`
                  : `Bỏ yêu thích ${displayName}`
                : isEn
                ? `Favorite ${displayName}`
                : `Yêu thích ${displayName}`
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#25352B] shadow-sm hover:bg-white sm:h-9 sm:w-9"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4",
                isFav ? "fill-[#A52C22] text-[#A52C22]" : "text-[#44564C]",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Card Body: Uniform Aligned Vertical Slots */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex min-h-[18px] items-center justify-between gap-1.5 text-[11px] text-[#44564C] sm:text-xs">
          <span className="inline-flex min-w-0 items-center gap-1 truncate" title={product.farmName}>
            <MapPin className="h-3 w-3 shrink-0 text-[#245B3D] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="truncate">{product.farmName}</span>
          </span>
          <Link
            href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
            className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#245B3D] hover:underline"
          >
            <QrCode className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="tabular-nums">{product.batchCode}</span>
          </Link>
        </div>

        <Link href={productHref} className="mt-1.5 block">
          <h3 className="line-clamp-2 min-h-[40px] text-[14px] leading-[20px] font-semibold text-[#25352B] group-hover:text-[#245B3D] sm:min-h-[44px] sm:text-[15px] sm:leading-[22px]">
            {displayName}
          </h3>
        </Link>

        {/* Price (V9 Harvest Crimson #A52C22 — WCAG 6.86:1 on white) + Pack & Stock */}
        <div className="mt-2 space-y-1 border-t border-[#F0F3ED] pt-2">
          <div className="flex items-baseline justify-between gap-1.5">
            <p className="tabular-nums text-[15px] leading-tight font-bold text-[#A52C22] whitespace-nowrap sm:text-[17px]">
              {formatVnd(product.priceVnd, locale, showUsd)}
              <span className="ml-0.5 text-[11px] font-medium text-[#44564C] sm:text-xs">
                /{container}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px] text-[#44564C] sm:text-xs">
            <span className="truncate">{packNote}</span>
            <span className="shrink-0 font-semibold text-[#25352B] tabular-nums">
              {isAvailable
                ? pluralizeStock(product.stockKg, container, locale)
                : blockedForMinor
                ? "18+"
                : isEn
                ? "Seasonal wait"
                : "Chờ vụ mới"}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3">
          {blockedForMinor ? (
            <div className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-[10px] border border-[#D7A34D] bg-[#FFF2D8] px-2.5 py-1.5 text-[11px] font-semibold text-[#664108] sm:min-h-[42px] sm:text-xs">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{isEn ? "18+ restricted" : "Hạn chế 18+"}</span>
            </div>
          ) : isReadOnlyAdmin ? (
            <Link
              href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5] sm:min-h-[42px]"
            >
              <QrCode className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
              <span className="truncate">{t.commerce.viewQrPassport}</span>
            </Link>
          ) : isAvailable ? (
            <Button
              variant="primary"
              size="sm"
              className="min-h-[40px] w-full whitespace-nowrap px-2.5 text-[12px] sm:min-h-[42px] sm:px-4 sm:text-[13px]"
              onClick={() => {
                const res = addToCart(product.id, 1);
                if (res.ok) notifySuccess(res.message);
                else notifyError(res.message);
              }}
            >
              <ShoppingBasket className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="truncate">{t.commerce.addToCart}</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[40px] w-full whitespace-nowrap px-2.5 text-[12px] sm:min-h-[42px] sm:px-4 sm:text-[13px]"
              onClick={() => {
                toggleFollowSeason(product.id);
                notifyInfo(
                  isFollowed
                    ? isEn
                      ? `Unfollowed harvest alert for ${displayName}.`
                      : `Đã tắt nhắc vụ mùa cho ${displayName}.`
                    : isEn
                    ? `Subscribed to harvest alert for ${displayName}.`
                    : `Đã đăng ký theo dõi vụ mùa ${displayName}.`,
                );
              }}
            >
              <Bell className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="truncate">
                {isFollowed
                  ? isEn
                    ? "Following"
                    : "Đang theo dõi"
                  : isEn
                  ? "Follow season"
                  : "Theo dõi vụ mùa"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
