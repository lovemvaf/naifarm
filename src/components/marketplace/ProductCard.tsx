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
import type { Product } from "@/types/naifarm";
import { Badge, Button } from "@/components/ui/Primitives";

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
  const displayUnit = localizeUnit(product.unitLabel, locale);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[16px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,53,43,0.12)]">
      <Link
        href={buildLocalizedHref(`/products/${product.slug}`, locale)}
        className="relative block aspect-[4/3] overflow-hidden bg-[#EAF0E5]"
      >
        <img
          src={product.image}
          alt={displayName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.seasonStatus === "in_season" && product.stockKg > 0 ? (
            <Badge tone="success">{t.commerce.inSeason}</Badge>
          ) : product.seasonStatus === "pre_order" ? (
            <Badge tone="info">{t.commerce.preOrder}</Badge>
          ) : (
            <Badge tone="warning">{t.commerce.outOfSeason}</Badge>
          )}
          {product.isNaiBox ? <Badge tone="gold">NaiBox 95</Badge> : null}
          {product.isRescue ? <Badge tone="warning">NaiRescue</Badge> : null}
          {product.adultOnly ? <Badge tone="danger">18+</Badge> : null}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {showCompareToggle ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
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
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-sm transition",
                isCompared
                  ? "bg-[#245B3D] text-white"
                  : "bg-white/95 text-[#52645A] hover:bg-white hover:text-[#245B3D]",
              )}
            >
              <GitCompare className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product.id);
            }}
            aria-label={
              isFav
                ? isEn
                  ? `Unfavorite ${displayName}`
                  : `Bỏ yêu thích ${displayName}`
                : isEn
                ? `Favorite ${displayName}`
                : `Yêu thích ${displayName}`
            }
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#25352B] shadow-sm hover:bg-white"
          >
            <Heart
              className={cn("h-4 w-4", isFav ? "fill-[#A32D2D] text-[#A32D2D]" : "text-[#52645A]")}
              aria-hidden="true"
            />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-[#52645A]">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <span className="truncate">{product.farmName}</span>
          </span>
          <Link
            href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#245B3D] hover:underline"
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{product.batchCode}</span>
          </Link>
        </div>

        <Link href={buildLocalizedHref(`/products/${product.slug}`, locale)} className="mt-2 block">
          <h3 className="line-clamp-2 min-h-[44px] text-base font-semibold leading-snug text-[#25352B] group-hover:text-[#245B3D]">
            {displayName}
          </h3>
        </Link>

        <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="tabular-nums text-base font-bold text-[#245B3D] sm:text-lg">
            {formatVnd(product.priceVnd, locale, showUsd)}
            <span className="text-[13px] font-medium text-[#52645A]">/{displayUnit}</span>
          </p>
          <span className="tabular-nums text-[13px] text-[#52645A]">
            {isAvailable
              ? `${isEn ? "Stock" : "Còn"} ${product.stockKg} ${displayUnit}`
              : blockedForMinor
              ? "18+"
              : isEn
              ? "Seasonal wait"
              : "Chờ đợt hái mới"}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {blockedForMinor ? (
            <div className="flex items-center justify-center gap-1.5 rounded-[12px] border border-[#D7A34D] bg-[#FFF2D8] px-3 py-2 text-xs font-semibold text-[#80520C]">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isEn ? "18+ restricted" : "Hạn chế dưới 18 tuổi"}</span>
            </div>
          ) : isReadOnlyAdmin ? (
            <Link
              href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] px-4 text-xs font-semibold text-[#25352B]"
            >
              <QrCode className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{t.commerce.viewQrPassport}</span>
            </Link>
          ) : isAvailable ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                const res = addToCart(product.id, 1);
                if (res.ok) notifySuccess(res.message);
                else notifyError(res.message);
              }}
            >
              <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
              <span>{t.commerce.addToCart}</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
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
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span>
                {isFollowed
                  ? isEn
                    ? "Following season"
                    : "Đang theo dõi vụ mùa"
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
