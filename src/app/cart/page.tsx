"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  QrCode,
  ShoppingBasket,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { applyPromotionsToCart } from "@/lib/commerce/promotion-engine";
import { localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn, formatVnd } from "@/lib/format";
import { notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";

export default function CartPage() {
  const { locale, t, currencyMode, setCurrencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    authUser,
    cart,
    products,
    batches,
    promotions,
    appliedPromoCodes,
    activeClockIso,
    toggleAppliedPromoCode,
    updateCartQty,
    removeFromCart,
  } = useDemoStore();
  const [promoInput, setPromoInput] = useState("");

  const resolvedGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        farmId: string;
        farmName: string;
        subtotalVnd: number;
        items: {
          product: (typeof products)[number];
          quantity: number;
          selectedOptionLabel?: string;
          unitPriceVnd: number;
          lotBlockedReason?: string;
        }[];
      }
    >();

    for (const c of cart) {
      const product = products.find((p) => p.id === c.productId);
      if (!product) continue;
      const option = product.weightOptions?.find((o) => o.label === c.selectedOptionLabel);
      const unitPriceVnd = option?.priceVnd ?? product.priceVnd;
      const batch = batches.find((b) => b.batchCode === product.batchCode);
      const lotBlockedReason =
        batch && (batch.lotStatus === "quarantine" || batch.lotStatus === "recalled" || batch.lotStatus === "expired")
          ? `Lô ${batch.batchCode} đang tạm giữ / thu hồi`
          : undefined;

      const existing = groups.get(product.farmId) ?? {
        farmId: product.farmId,
        farmName: product.farmName,
        subtotalVnd: 0,
        items: [],
      };

      existing.items.push({
        product,
        quantity: c.quantity,
        selectedOptionLabel: c.selectedOptionLabel,
        unitPriceVnd,
        lotBlockedReason,
      });
      existing.subtotalVnd += unitPriceVnd * c.quantity;
      groups.set(product.farmId, existing);
    }

    return Array.from(groups.values());
  }, [cart, products, batches]);

  const totalMerchandiseVnd = resolvedGroups.reduce((s, g) => s + g.subtotalVnd, 0);
  const estShippingVnd = resolvedGroups.length * 20000;
  const promoEval = applyPromotionsToCart(
    promotions,
    appliedPromoCodes,
    totalMerchandiseVnd,
    estShippingVnd,
    locale,
    activeClockIso,
    Boolean(authUser?.isMinor),
  );
  const hasBlockedLot = resolvedGroups.some((g) => g.items.some((i) => Boolean(i.lotBlockedReason)));

  return (
    <div className="mx-auto max-w-[1160px] space-y-6 px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Tiếp tục chọn nông sản</span>
          </Link>
          <h1 className="mt-2 font-editorial text-2xl font-bold text-[#25352B] md:text-3xl">
            Giỏ hàng của bạn ({cart.reduce((s, i) => s + i.quantity, 0)} phần)
          </h1>
        </div>
      </div>

      {resolvedGroups.length > 1 ? (
        <div className="rounded-[14px] border border-[#D6DED2] bg-[#EAF0E5] p-4 text-sm text-[#25352B]">
          <p className="font-semibold text-[#245B3D]">
            Giỏ hàng có nông sản từ {resolvedGroups.length} nhà vườn khác nhau
          </p>
          <p className="mt-1 text-xs text-[#52645A]">
            Khi xác nhận đặt, hệ thống sẽ tự tách thành {resolvedGroups.length} đơn theo từng nhà vườn để giữ đúng
            mã lô truy xuất và khung giờ đóng gói tại vườn.
          </p>
        </div>
      ) : null}

      {resolvedGroups.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket className="h-6 w-6" aria-hidden="true" />}
          title="Giỏ hàng đang trống"
          description="Khám phá trái cây, hạt điều rang củi và đặc sản OCOP Đồng Nai gắn mã QR truy xuất."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              <span>Đi tới Chợ nông sản</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {resolvedGroups.map((group) => (
              <Card key={group.farmId} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6DED2] bg-[#FAF8F1] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#25352B]">
                    <Store className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                    <span>{group.farmName}</span>
                  </span>
                  <span className="tabular-nums text-xs font-semibold text-[#52645A]">
                    Tạm tính vườn: {formatVnd(group.subtotalVnd)}
                  </span>
                </div>

                <div className="divide-y divide-[#EAEFE6]">
                  {group.items.map(({ product, quantity, selectedOptionLabel, unitPriceVnd, lotBlockedReason }) => (
                    <div key={`${product.id}-${selectedOptionLabel ?? ""}`} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <Link href={`/products/${product.slug}`} className="shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-24 w-24 rounded-[12px] border border-[#D6DED2] object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-base font-bold text-[#25352B] hover:text-[#245B3D]"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
                          <span>{selectedOptionLabel ?? product.unitLabel}</span>
                          <span>·</span>
                          <Link
                            href={`/trace/${product.batchCode}`}
                            className="inline-flex items-center gap-1 font-semibold text-[#245B3D] hover:underline"
                          >
                            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{product.batchCode}</span>
                          </Link>
                        </div>

                        {lotBlockedReason ? (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#A32D2D]">
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{lotBlockedReason} — vui lòng xóa khỏi giỏ trước khi đặt.</span>
                          </div>
                        ) : null}

                        <p className="mt-2 tabular-nums text-sm font-bold text-[#245B3D]">
                          {formatVnd(unitPriceVnd)} / {product.unitLabel}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <div className="inline-flex items-center rounded-[10px] border border-[#D6DED2] bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, quantity - 1)}
                            aria-label={`Giảm số lượng ${product.name}`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#25352B] hover:bg-[#EAF0E5]"
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <span className="min-w-[36px] text-center text-sm font-bold tabular-nums text-[#25352B]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, Math.min(product.stockKg, quantity + 1))}
                            aria-label={`Tăng số lượng ${product.name}`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#25352B] hover:bg-[#EAF0E5]"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="tabular-nums text-sm font-bold text-[#25352B]">
                            {formatVnd(unitPriceVnd * quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(product.id);
                              notifyInfo(`Đã xóa ${product.name} khỏi giỏ hàng.`);
                            }}
                            aria-label={`Xóa ${product.name}`}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#A32D2D] hover:bg-[#FDECEC]"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-24 space-y-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#25352B]">
                  {isEn ? "Cart Summary" : "Tóm tắt giỏ hàng"}
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrencyMode(showUsd ? "vnd" : "vnd_usd_est")}
                  className={cn(
                    "rounded-[8px] border px-2 py-1 text-[11px] font-semibold cursor-pointer",
                    showUsd ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]" : "border-[#D6DED2] bg-white",
                  )}
                >
                  USD est.
                </button>
              </div>

              {/* Promo Code Form */}
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const code = promoInput.trim().toUpperCase();
                  if (!code) return;
                  if (!appliedPromoCodes.includes(code)) {
                    toggleAppliedPromoCode(code);
                    notifySuccess(`${isEn ? "Checked promo code" : "Đã kiểm tra mã"} ${code}`);
                  }
                  setPromoInput("");
                }}
              >
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={t.commerce.promoCodePlaceholder}
                  className="min-h-[38px] flex-1 rounded-[10px] border border-[#788A7B] px-2.5 text-xs uppercase"
                />
                <Button type="submit" size="sm" variant="secondary">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.commerce.applyPromoBtn}</span>
                </Button>
              </form>

              {appliedPromoCodes.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {appliedPromoCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleAppliedPromoCode(code)}
                        className="rounded-full bg-[#EAF0E5] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#245B3D] cursor-pointer"
                      >
                        {code} ×
                      </button>
                    ))}
                  </div>
                  {promoEval.rejected.map((rej) => (
                    <p key={rej.code} className="text-[11px] text-[#A32D2D]">
                      {isEn ? rej.reasonEn : rej.reasonVi}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2 border-b border-[#EAEFE6] pb-3 text-sm">
                <div className="flex justify-between text-[#52645A]">
                  <span>{isEn ? "Orchard shipments" : "Số nhà vườn"}</span>
                  <Badge tone="neutral">{resolvedGroups.length}</Badge>
                </div>
                <div className="flex justify-between text-[#52645A]">
                  <span>{t.commerce.subtotalLabel}</span>
                  <span className="tabular-nums font-bold text-[#25352B]">
                    {formatVnd(totalMerchandiseVnd, locale, showUsd)}
                  </span>
                </div>
                {promoEval.totalMerchDiscountVnd > 0 ? (
                  <div className="flex justify-between text-[#24603B]">
                    <span>{t.commerce.discountLabel}</span>
                    <span className="tabular-nums font-bold">
                      -{formatVnd(promoEval.totalMerchDiscountVnd, locale)}
                    </span>
                  </div>
                ) : null}
                <p className="text-xs text-[#52645A]">
                  {isEn
                    ? "Exact domestic shipping / orchard pickup (0 VND) calculated at checkout."
                    : "Phí giao nội địa hoặc nhận tại vườn (0 đ) xác nhận ở bước Đặt hàng."}
                </p>
                {showUsd ? <p className="text-[11px] text-[#80520C]">{t.commerce.usdEstimateNote}</p> : null}
              </div>

              {hasBlockedLot ? (
                <Button variant="primary" size="lg" className="w-full" disabled>
                  {isEn ? "Lot currently quarantined/recalled" : "Có lô đang tạm giữ — không thể đặt"}
                </Button>
              ) : (
                <Link
                  href={buildLocalizedHref("/checkout", locale)}
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>{t.commerce.proceedCheckout}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <span className="sr-only">
                {resolvedGroups[0]?.items[0]?.product
                  ? localizeProductName(resolvedGroups[0].items[0].product, locale) +
                    localizeUnit(resolvedGroups[0].items[0].product.unitLabel, locale)
                  : ""}
              </span>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
