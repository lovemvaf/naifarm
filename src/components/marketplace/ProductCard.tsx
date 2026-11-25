"use client";

import Image from "next/image";

import React from "react";
import Link from "next/link";
import { Bell, Heart, MapPin, QrCode, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { cn, formatVnd } from "@/lib/format";
import { assetUrl } from "@/lib/storage/assets";
import type { Product } from "@/types/naifarm";
import { Badge, Button } from "@/components/ui/Primitives";

export function ProductCard({ product }: { product: Product }) {
  const {
    addToCart,
    toggleFollowSeason,
    followedProductIds,
    toggleFavorite,
    favoriteProductIds,
    session,
  } = useDemoStore();
  const isAvailable = product.seasonStatus === "in_season" && product.stockKg > 0;
  const isFollowed = followedProductIds.includes(product.id);
  const isFav = favoriteProductIds.includes(product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_2px_8px_rgba(37,53,43,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,53,43,0.12)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-soft">
        <Image
          src={assetUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          width={512}
          height={279}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isAvailable ? (
            <Badge tone="success">Đang vào mùa</Badge>
          ) : (
            <Badge tone="warning">Hẹn mùa vụ tới</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!session) {
              toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích.");
              return;
            }
            void toggleFavorite(product.id);
          }}
          aria-label={isFav ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm hover:bg-white cursor-pointer"
        >
          <Heart
            className={cn("h-4 w-4", isFav ? "fill-danger text-danger" : "text-muted")}
            aria-hidden="true"
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{product.farmName}</span>
          </span>
          <Link
            href={`/trace/${product.batchCode}`}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline"
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{product.batchCode}</span>
          </Link>
        </div>

        <Link href={`/products/${product.slug}`} className="mt-2 block">
          <h3 className="line-clamp-2 min-h-[44px] text-base font-semibold leading-snug text-foreground group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="tabular-nums text-base sm:text-lg font-bold text-primary">
            {formatVnd(product.priceVnd)}
            <span className="text-[13px] font-medium text-muted">/{product.unitLabel}</span>
          </p>
          <span className="tabular-nums text-[13px] text-muted">
            {isAvailable ? `Còn ${product.stockKg} ${product.unitLabel}` : "Tạm hết sẵn"}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {isAvailable ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={async () => {
                const res = await addToCart(product.id, 1);
                if (res.ok) toast.success(res.message);
                else toast.error(res.message);
              }}
            >
              <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
              <span>Thêm vào giỏ</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={async () => {
                if (!session) {
                  toast.error("Vui lòng đăng nhập để theo dõi vụ mùa.");
                  return;
                }
                await toggleFollowSeason(product.id);
                toast.info(
                  isFollowed
                    ? `Đã tắt nhắc vụ mùa cho ${product.name}.`
                    : `Đã đăng ký theo dõi vụ mùa ${product.name}.`
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
