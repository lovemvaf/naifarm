"use client";

import React from "react";
import Link from "next/link";
import { Bell, GitCompare, Heart, MapPin, QrCode, ShoppingBasket } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
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
  const {
    addToCart,
    toggleFollowSeason,
    followedProductIds,
    toggleFavorite,
    favoriteProductIds,
    toggleCompareProduct,
    compareProductIds,
  } = useDemoStore();
  const isAvailable = (product.seasonStatus === "in_season" || product.seasonStatus === "pre_order") && product.stockKg > 0;
  const isFollowed = followedProductIds.includes(product.id);
  const isFav = favoriteProductIds.includes(product.id);
  const isCompared = compareProductIds.includes(product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[16px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,53,43,0.12)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#EAF0E5]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.seasonStatus === "in_season" && product.stockKg > 0 ? (
            <Badge tone="success">Đang vào mùa</Badge>
          ) : product.seasonStatus === "pre_order" ? (
            <Badge tone="info">Đặt trước mùa vụ</Badge>
          ) : (
            <Badge tone="warning">Hẹn mùa vụ tới</Badge>
          )}
          {product.isNaiBox ? <Badge tone="gold">NaiBox 95</Badge> : null}
          {product.isRescue ? <Badge tone="warning">NaiRescue</Badge> : null}
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
                  notifyInfo(isCompared ? `Đã bỏ so sánh ${product.name}` : `Đã thêm ${product.name} vào đối chiếu`);
                }
              }}
              aria-label={isCompared ? `Bỏ so sánh ${product.name}` : `So sánh ${product.name}`}
              title={isCompared ? "Đang đối chiếu" : "So sánh cùng nhóm"}
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
            aria-label={isFav ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`}
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
            href={`/trace/${product.batchCode}`}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#245B3D] hover:underline"
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{product.batchCode}</span>
          </Link>
        </div>

        <Link href={`/products/${product.slug}`} className="mt-2 block">
          <h3 className="line-clamp-2 min-h-[44px] text-base font-semibold leading-snug text-[#25352B] group-hover:text-[#245B3D]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="tabular-nums text-base font-bold text-[#245B3D] sm:text-lg">
            {formatVnd(product.priceVnd)}
            <span className="text-[13px] font-medium text-[#52645A]">/{product.unitLabel}</span>
          </p>
          <span className="tabular-nums text-[13px] text-[#52645A]">
            {isAvailable ? `Còn ${product.stockKg} ${product.unitLabel}` : "Chờ đợt hái mới"}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {isAvailable ? (
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
              <span>Thêm vào giỏ hàng</span>
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
                    ? `Đã tắt nhắc vụ mùa cho ${product.name}.`
                    : `Đã đăng ký theo dõi vụ mùa ${product.name}.`,
                );
              }}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span>{isFollowed ? "Đang theo dõi vụ mùa" : "Theo dõi vụ mùa"}</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
