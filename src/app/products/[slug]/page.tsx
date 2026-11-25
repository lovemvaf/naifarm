"use client";

import React, { Suspense, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  GitCompare,
  Globe2,
  Heart,
  HelpCircle,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Star,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import {
  localizeAdminUnitName,
  localizeCategory,
  localizeProductName,
  localizeUnit,
} from "@/lib/i18n/domain-en";
import { buildLocalizedHref, sanitizeReturnTo } from "@/lib/navigation/safe-nav";
import { evaluateMinorSafeguarding } from "@/lib/permissions/access-control";
import { resolveCategoryMedia } from "@/data/reference/media-library";
import { MediaPlayer } from "@/components/media/MediaPlayer";
import { ProductGallery2D } from "@/components/products/ProductGallery2D";
import { ProduceAnatomy2D } from "@/components/products/ProduceAnatomy2D";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { CredentialDetailDrawer } from "@/components/quality/CredentialDetailDrawer";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getRelatedProducts } from "@/lib/commerce/related-products";
import {
  CREDENTIAL_TYPE_MAP,
  evaluateCredentialDisplay,
} from "@/lib/quality/credential-registry";
import { cn, formatVnd } from "@/lib/format";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { CredentialRecord } from "@/types/naifarm";

type PdpTabId = "overview" | "origin" | "story" | "reviews";

function ProductDetailInner({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");
  const safeReturnTo = sanitizeReturnTo(rawReturnTo, "/marketplace");
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";
  const {
    hydrated,
    authUser,
    products,
    farms,
    batches,
    orders,
    credentialRecords,
    productReviews,
    addToCart,
    toggleFavorite,
    favoriteProductIds,
    toggleFollowSeason,
    followedProductIds,
    toggleCompareProduct,
    compareProductIds,
    markRecentlyViewed,
    submitProductReview,
    submitInternationalInquiry,
  } = useDemoStore();

  const product = products.find((p) => p.slug === decodeURIComponent(slug));
  const [activeTab, setActiveTab] = useState<PdpTabId>("overview");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const [selectedCred, setSelectedCred] = useState<CredentialRecord | null>(null);
  const [reviewRating, setReviewRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [rfqOpen, setRfqOpen] = useState(false);
  const [rfqBuyerName, setRfqBuyerName] = useState(authUser?.name ?? "");
  const [rfqCountry, setRfqCountry] = useState("Singapore");
  const [rfqQuantityNote, setRfqQuantityNote] = useState("50 boxes sample lot");
  const [rfqPackagingNote, setRfqPackagingNote] = useState("English allergen & traceability sheet");
  const [rfqMessage, setRfqMessage] = useState("");
  const [rfqSentId, setRfqSentId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && product?.id) {
      markRecentlyViewed(product.id);
    }
  }, [hydrated, product?.id, markRecentlyViewed]);

  const farm = useMemo(
    () => (product ? farms.find((f) => f.id === product.farmId) : undefined),
    [farms, product],
  );
  const batch = useMemo(
    () => (product ? batches.find((b) => b.batchCode === product.batchCode) : undefined),
    [batches, product],
  );

  const evaluatedCreds = useMemo(() => {
    if (!product) return [];
    const matching = credentialRecords.filter(
      (r) =>
        r.productIds.includes(product.id) ||
        (r.productIds.length === 0 && r.holderId === product.farmId) ||
        (product.credentialIds?.includes(r.id) ?? false),
    );
    return matching.map((record) => ({
      record,
      typeDef: CREDENTIAL_TYPE_MAP.get(record.typeId),
      evalRes: evaluateCredentialDisplay(record, product.category, product.id),
    }));
  }, [credentialRecords, product]);

  const validCreds = evaluatedCreds.filter((c) => c.evalRes.canShowBadge);
  const suppressedCount = evaluatedCreds.length - validCreds.length;

  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(product, products, 4) : []),
    [product, products],
  );

  const reviews = useMemo(
    () => (product ? productReviews.filter((rv) => rv.productId === product.id) : []),
    [productReviews, product],
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, rv) => acc + rv.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const completedQualifyingOrders = useMemo(() => {
    if (!product) return [];
    return orders.filter(
      (o) => o.status === "completed" && o.items.some((it) => it.productId === product.id),
    );
  }, [orders, product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
          title={isEn ? "Requested produce not found" : "Không tìm thấy nông sản yêu cầu"}
          description={
            isEn
              ? "This listing may have moved or is no longer in the current seasonal catalog."
              : "Mặt hàng có thể đã thay đổi tên hoặc không còn trong danh mục hiện hành."
          }
          action={
            <Link
              href={buildLocalizedHref("/marketplace", locale)}
              className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              {isEn ? "Back to OCOP Market" : "Về Chợ nông sản"}
            </Link>
          }
        />
      </div>
    );
  }

  const displayName = localizeProductName(product, locale);
  const options = product.weightOptions ?? [];
  const activeOption = options[selectedOptionIdx];
  const activePriceVnd = activeOption?.priceVnd ?? product.priceVnd;
  const activeUnitLabel = activeOption?.label ?? product.unitLabel;

  const isLotBlocked =
    batch?.lotStatus === "quarantine" ||
    batch?.lotStatus === "recalled" ||
    batch?.lotStatus === "expired";
  const isAvailable =
    !isLotBlocked &&
    (product.seasonStatus === "in_season" || product.seasonStatus === "pre_order") &&
    product.stockKg > 0;
  const isFav = favoriteProductIds.includes(product.id);
  const isFollowed = followedProductIds.includes(product.id);
  const isCompared = compareProductIds.includes(product.id);

  const handleAddToCart = () => {
    const res = addToCart(product.id, quantity, activeOption?.label);
    if (res.ok) notifySuccess(res.message);
    else notifyError(res.message);
    return res.ok;
  };

  const handleBuyNow = () => {
    const ok = handleAddToCart();
    if (ok) {
      router.push(buildLocalizedHref("/checkout", locale));
    }
  };

  const pdpTabs: { id: PdpTabId; labelVi: string; labelEn: string }[] = [
    { id: "overview", labelVi: "Giới thiệu", labelEn: "Overview" },
    { id: "origin", labelVi: "Nguồn gốc", labelEn: "Origin & Trace" },
    { id: "story", labelVi: "Câu chuyện", labelEn: "Story" },
    {
      id: "reviews",
      labelVi: `Đánh giá (${reviews.length})`,
      labelEn: `Reviews (${reviews.length})`,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] space-y-7 px-3 pt-5 pb-28 sm:px-4 md:pb-10 lg:px-6 lg:pt-7">
      {/* Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link
          href={buildLocalizedHref(safeReturnTo, locale)}
          className="inline-flex items-center gap-1.5 font-semibold text-[#245B3D] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            {rawReturnTo
              ? t.nav.backButton
              : isEn
              ? "Back to OCOP Market"
              : "Quay lại Chợ nông sản"}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#52645A]">
          <span>{localizeCategory(product.category, locale)}</span>
          <span>/</span>
          <span className="font-semibold text-[#25352B]">{displayName}</span>
        </div>
      </div>

      {/* Quarantine / Recall Lock Alert */}
      {isLotBlocked && batch ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[16px] border-2 border-[#A32D2D] bg-[#FDECEC] p-4 text-sm text-[#7A1E1E]"
        >
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-[#A32D2D]" aria-hidden="true" />
          <div>
            <p className="font-bold">
              {isEn
                ? `Orders paused — Lot ${batch.batchCode} is currently ${
                    batch.lotStatus === "recalled"
                      ? "under urgent recall"
                      : batch.lotStatus === "quarantine"
                      ? "under inspection hold"
                      : "past circulation date"
                  }`
                : `Tạm khóa đặt mua — Lô ${batch.batchCode} đang ${
                    batch.lotStatus === "recalled"
                      ? "trong diện thu hồi khẩn cấp"
                      : batch.lotStatus === "quarantine"
                      ? "tạm giữ kiểm tra"
                      : "hết hạn lưu hành"
                  }`}
            </p>
            <p className="mt-1 text-xs">
              {isEn
                ? "Cart checkout is automatically locked for quarantined or recalled lots."
                : "Hệ thống tự động vô hiệu hóa giỏ hàng đối với sản phẩm thuộc lô đang phong tỏa."}{" "}
              <Link
                href={buildLocalizedHref(`/trace/${batch.batchCode}`, locale)}
                className="font-bold underline"
              >
                {isEn
                  ? "View lot notice & genealogy →"
                  : "Xem thông báo lô & truy xuất phả hệ →"}
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      {/* Top Grid: 2D Gallery + Commercial Purchase Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <ProductGallery2D
            images={product.gallery?.length ? product.gallery : [product.image]}
            productName={displayName}
          />
        </div>

        <div className="space-y-4 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.seasonStatus === "in_season" && product.stockKg > 0 ? (
              <Badge tone="success">{t.commerce.inSeason}</Badge>
            ) : product.seasonStatus === "pre_order" ? (
              <Badge tone="info">{t.commerce.preOrder}</Badge>
            ) : (
              <Badge tone="warning">{t.commerce.outOfSeason}</Badge>
            )}
            {product.isNaiBox ? (
              <Badge tone="gold">{isEn ? "OCOP Gift Box" : "Hộp quà OCOP"}</Badge>
            ) : null}
            {product.isRescue ? (
              <Badge tone="warning">{isEn ? "Harvest Support" : "Hỗ trợ mùa vụ"}</Badge>
            ) : null}
            {validCreds.slice(0, 2).map(({ record, typeDef }) => (
              <button
                key={record.id}
                type="button"
                onClick={() => setSelectedCred(record)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#245B3D]/30 bg-[#E6F3E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#1E4D33] hover:bg-[#D5ECDA]"
              >
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                <span>{typeDef?.displayName ?? record.typeId}</span>
              </button>
            ))}
          </div>

          <div>
            <h1 className="font-editorial text-2xl font-bold text-[#25352B] md:text-[32px] md:leading-[1.18]">
              {displayName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#52645A] sm:text-sm">
              {farm ? (
                <Link
                  href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                  className="inline-flex items-center gap-1 font-semibold text-[#245B3D] hover:underline"
                >
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {product.farmName} ·{" "}
                    {localizeAdminUnitName(product.administrativeUnitName, undefined, locale)}
                  </span>
                </Link>
              ) : (
                <span>
                  {product.farmName} · {product.administrativeUnitName}
                </span>
              )}
              <Link
                href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
                className="inline-flex items-center gap-1 rounded-full bg-[#EAF0E5] px-2.5 py-0.5 text-xs font-bold text-[#245B3D] hover:underline"
              >
                <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {isEn ? "Batch" : "Lô"} {product.batchCode}
                </span>
              </Link>
              {averageRating ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#25352B] hover:text-[#245B3D]"
                >
                  <Star className="h-3.5 w-3.5 fill-[#D7A34D] text-[#D7A34D]" aria-hidden="true" />
                  <span className="tabular-nums">{averageRating}</span>
                  <span className="text-[#52645A]">({reviews.length})</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* V9 Harvest Crimson Price Box */}
          <div className="rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
            <p className="tabular-nums text-2xl font-bold text-[#A52C22] md:text-[30px]">
              {formatVnd(activePriceVnd, locale, showUsd)}
              <span className="ml-1.5 text-sm font-medium text-[#52645A]">
                / {localizeUnit(activeUnitLabel, locale)}
              </span>
            </p>
            <p className="mt-1 text-xs text-[#52645A]">
              {isLotBlocked
                ? isEn
                  ? "Sales paused due to active lot hold/recall alert."
                  : "Tạm dừng xuất bán theo cảnh báo lô."
                : product.stockKg > 0
                ? `${t.commerce.remainingStock}: ${product.stockKg} ${localizeUnit(product.unitLabel, locale)}`
                : isEn
                ? "Current harvest lot sold out — follow for next seasonal release."
                : "Đã hết đợt thu hái hiện tại — bật theo dõi để nhận thông báo vụ mới."}
              {product.preOrderEtaLabel ? ` · ${product.preOrderEtaLabel}` : ""}
            </p>
            {product.allergens && product.allergens.length > 0 ? (
              <p className="mt-1.5 text-xs font-medium text-[#80520C]">
                {t.commerce.allergenPrefix} {product.allergens.join(", ")}
              </p>
            ) : null}
            {product.adultOnly ? (
              <p className="mt-1.5 text-xs font-semibold text-[#A32D2D]">
                {t.commerce.adultOnlyWarning}
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-[#25352B]">
            {isEn && product.enShortDescription
              ? product.enShortDescription
              : product.shortDescription}
          </p>

          {/* Weight / Pack Variants */}
          {options.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-bold tracking-wide text-[#25352B] uppercase">
                {isEn ? "Pack options" : "Quy cách đóng gói"}
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedOptionIdx(idx)}
                    className={cn(
                      "min-h-[38px] cursor-pointer rounded-[10px] border px-3 text-xs font-semibold transition",
                      idx === selectedOptionIdx
                        ? "border-[#245B3D] bg-[#245B3D] text-white"
                        : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
                    )}
                  >
                    {localizeUnit(opt.label, locale)} · {formatVnd(opt.priceVnd, locale)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity & Primary Purchase Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {isAvailable ? (
              <>
                <div className="inline-flex items-center rounded-[12px] border border-[#788A7B] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label={isEn ? "Decrease quantity" : "Giảm số lượng"}
                    className="flex h-11 w-10 cursor-pointer items-center justify-center hover:bg-[#EAF0E5]"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-[36px] text-center text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockKg, q + 1))}
                    aria-label={isEn ? "Increase quantity" : "Tăng số lượng"}
                    className="flex h-11 w-10 cursor-pointer items-center justify-center hover:bg-[#EAF0E5]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="min-h-[44px] flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingBasket className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t.commerce.addToCart}</span>
                </Button>

                <Button
                  variant="gold"
                  size="lg"
                  className="min-h-[44px]"
                  onClick={handleBuyNow}
                >
                  <span>{isEn ? "Buy now" : "Mua ngay"}</span>
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                disabled={isLotBlocked}
                onClick={() => {
                  toggleFollowSeason(product.id);
                  notifyInfo(
                    isFollowed
                      ? isEn
                        ? `Disabled harvest alert for ${displayName}`
                        : `Đã tắt nhắc vụ mùa ${product.name}`
                      : isEn
                      ? `Subscribed to harvest alert for ${displayName}`
                      : `Đã theo dõi vụ mùa ${product.name}`,
                  );
                }}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isFollowed
                    ? isEn
                      ? "Following harvest alerts"
                      : "Đang theo dõi vụ mùa"
                    : isEn
                    ? "Notify me in season"
                    : "Nhắc tôi khi vào mùa"}
                </span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label={
                isFav
                  ? isEn
                    ? "Remove from favorites"
                    : "Bỏ yêu thích"
                  : isEn
                  ? "Add to favorites"
                  : "Thêm vào yêu thích"
              }
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[12px] border border-[#D6DED2] bg-white hover:bg-[#EAF0E5]"
            >
              <Heart
                className={cn("h-5 w-5", isFav ? "fill-[#A52C22] text-[#A52C22]" : "text-[#52645A]")}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                const res = toggleCompareProduct(product.id);
                if (!res.ok && res.message) notifyError(res.message);
                else
                  notifyInfo(
                    isCompared
                      ? isEn
                        ? "Removed from comparison."
                        : "Đã bỏ khỏi danh sách so sánh."
                      : isEn
                      ? "Added to comparison."
                      : "Đã thêm vào danh sách so sánh.",
                  );
              }}
              aria-label={isEn ? "Compare product" : "So sánh sản phẩm"}
              className={cn(
                "flex h-11 cursor-pointer items-center gap-1.5 rounded-[12px] border px-3 text-xs font-semibold",
                isCompared
                  ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                  : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
              )}
            >
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              <span>
                {isCompared
                  ? isEn
                    ? "Comparing"
                    : "Đang đối chiếu"
                  : isEn
                  ? "Compare"
                  : "So sánh"}
              </span>
            </button>
          </div>

          {/* 3 Compact Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 rounded-[12px] border border-[#EAEFE6] bg-white p-2.5 text-center text-[11px] font-semibold text-[#25352B]">
            <div className="flex flex-col items-center gap-1">
              <QrCode className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "QR Batch Passport" : "Truy xuất QR lô"}</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-[#EAEFE6] px-1">
              <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "Dossier Checked" : "Hồ sơ minh bạch"}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sprout className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "Direct Orchard" : "Trực tiếp tại vườn"}</span>
            </div>
          </div>

          {/* International Buyer / Wholesale Inquiry (Honest Local RFQ) */}
          <div className="rounded-[14px] border border-[#D6DED2] bg-white p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs">
                <p className="flex items-center gap-1.5 font-bold text-[#25352B]">
                  <Globe2 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  <span>{t.commerce.askAvailability}</span>
                </p>
                <p className="text-[#52645A]">
                  {product.exportShippingNote ??
                    (isEn
                      ? "Domestic delivery via cart; submit local RFQ inquiry for overseas/wholesale quotes."
                      : "Giao nội địa qua giỏ hàng; gửi yêu cầu nếu cần hỏi nguồn hàng xuất khẩu/B2B.")}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={
                  !evaluateMinorSafeguarding(authUser?.isMinor, authUser?.hasGuardianConsent)
                    .allowPublicCommerce
                }
                onClick={() => setRfqOpen((v) => !v)}
              >
                {rfqOpen ? t.nav.closeButton : t.commerce.askAvailability}
              </Button>
            </div>

            {rfqOpen ? (
              <form
                className="mt-3 space-y-2.5 border-t border-[#EAEFE6] pt-3 text-xs"
                onSubmit={(e) => {
                  e.preventDefault();
                  const created = submitInternationalInquiry({
                    productId: product.id,
                    productName: product.name,
                    farmId: product.farmId,
                    farmName: product.farmName,
                    buyerName: rfqBuyerName.trim() || "International Visitor",
                    country: rfqCountry.trim() || "Singapore",
                    preferredLanguage: locale,
                    quantityNote: rfqQuantityNote.trim() || "Sample batch",
                    packagingNote: rfqPackagingNote.trim() || "Standard export carton",
                    sampleRequested: true,
                    message:
                      rfqMessage.trim() ||
                      "Requesting batch inspection certificate & wholesale MOQ details.",
                  });
                  setRfqSentId(created.id);
                  setRfqOpen(false);
                  notifySuccess(`${t.toasts.inquirySent} (${created.id})`);
                }}
              >
                <p className="text-[11px] font-medium text-[#80520C]">
                  {t.commerce.internationalInquiryNote}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={rfqBuyerName}
                    onChange={(e) => setRfqBuyerName(e.target.value)}
                    placeholder={isEn ? "Your name / Organization" : "Tên người liên hệ / Công ty"}
                    className="min-h-[38px] rounded-[8px] border border-[#788A7B] px-2.5"
                  />
                  <input
                    type="text"
                    required
                    value={rfqCountry}
                    onChange={(e) => setRfqCountry(e.target.value)}
                    placeholder={isEn ? "Destination country" : "Quốc gia / Thị trường"}
                    className="min-h-[38px] rounded-[8px] border border-[#788A7B] px-2.5"
                  />
                  <input
                    type="text"
                    value={rfqQuantityNote}
                    onChange={(e) => setRfqQuantityNote(e.target.value)}
                    placeholder={isEn ? "Estimated quantity / MOQ" : "Sản lượng dự kiến"}
                    className="min-h-[38px] rounded-[8px] border border-[#788A7B] px-2.5"
                  />
                  <input
                    type="text"
                    value={rfqPackagingNote}
                    onChange={(e) => setRfqPackagingNote(e.target.value)}
                    placeholder={isEn ? "Packaging / Language spec" : "Quy cách & ngôn ngữ nhãn"}
                    className="min-h-[38px] rounded-[8px] border border-[#788A7B] px-2.5"
                  />
                </div>
                <input
                  type="text"
                  value={rfqMessage}
                  onChange={(e) => setRfqMessage(e.target.value)}
                  placeholder={
                    isEn ? "Questions for orchard/cooperative..." : "Nội dung trao đổi với cơ sở..."
                  }
                  className="min-h-[38px] w-full rounded-[8px] border border-[#788A7B] px-2.5"
                />
                <Button type="submit" size="sm" variant="primary">
                  {t.commerce.internationalInquiryTitle}
                </Button>
              </form>
            ) : rfqSentId ? (
              <p className="mt-2 text-[11px] font-semibold text-[#24603B]">
                {isEn
                  ? `Recorded local RFQ ${rfqSentId} for ${product.farmName} review.`
                  : `Đã lưu yêu cầu ${rfqSentId} cho ${product.farmName} phản hồi trong không gian Nhà nông & HTX.`}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* V9 EXACT 4 INLINE TABS: Giới thiệu | Nguồn gốc | Câu chuyện | Đánh giá */}
      <section
        aria-label={isEn ? "Product details sections" : "Thông tin chi tiết nông sản"}
        data-pdp-tabs="true"
        className="overflow-hidden rounded-[20px] border border-[#D6DED2] bg-white shadow-[0_2px_10px_rgba(37,53,43,0.04)]"
      >
        <div
          role="tablist"
          aria-label={isEn ? "Product information tabs" : "Thẻ thông tin sản phẩm"}
          className="nf-scroll-x flex border-b border-[#D6DED2] bg-[#FAF8F1] px-2 pt-2 sm:px-4"
        >
          {pdpTabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`pdp-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`pdp-panel-${tab.id}`}
                data-pdp-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative shrink-0 cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors sm:px-5",
                  selected
                    ? "border-[#245B3D] bg-white text-[#245B3D] rounded-t-[10px]"
                    : "border-transparent text-[#52645A] hover:text-[#245B3D]",
                )}
              >
                {isEn ? tab.labelEn : tab.labelVi}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {/* TAB 1: Giới thiệu / Overview */}
          {activeTab === "overview" ? (
            <div
              role="tabpanel"
              id="pdp-panel-overview"
              aria-labelledby="pdp-tab-overview"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                  <div className="rounded-[14px] border border-[#EAEFE6] bg-[#FAF8F1] p-4">
                    <h2 className="text-base font-bold text-[#25352B]">
                      {isEn
                        ? "Harvest Characteristics & Storage Guide"
                        : "Thông số đặc trưng & Hướng dẫn bảo quản"}
                    </h2>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs text-[#52645A] sm:grid-cols-2">
                      <p>
                        <strong className="text-[#25352B]">
                          {isEn ? "Quality highlight:" : "Chỉ tiêu đặc trưng:"}
                        </strong>{" "}
                        {product.brixNote ||
                          (isEn
                            ? "Harvested at natural peak ripeness"
                            : "Thu hái đúng độ chín tự nhiên")}
                      </p>
                      <p>
                        <strong className="text-[#25352B]">
                          {isEn ? "Recommended shelf life:" : "Hạn dùng khuyến nghị:"}
                        </strong>{" "}
                        {product.expiryDays
                          ? isEn
                            ? `${product.expiryDays} days`
                            : `${product.expiryDays} ngày`
                          : isEn
                          ? "See lot label on packaging"
                          : "Theo nhãn bao bì lô"}
                      </p>
                      <p className="sm:col-span-2">
                        <strong className="text-[#25352B]">
                          {isEn ? "Storage guidance:" : "Bảo quản:"}
                        </strong>{" "}
                        {product.storageNote ||
                          (isEn
                            ? "Keep in a cool, dry place away from direct sunlight."
                            : "Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp.")}
                      </p>
                      <p className="sm:col-span-2">
                        <strong className="text-[#25352B]">
                          {isEn ? "Growing origin:" : "Nguồn gốc vùng:"}
                        </strong>{" "}
                        {product.originNote ||
                          `${product.farmName}, ${localizeAdminUnitName(product.administrativeUnitName, undefined, locale)}`}
                      </p>
                    </div>
                  </div>

                  {/* Inline 2D Produce Anatomy if applicable */}
                  {product.anatomyType ? (
                    <ProduceAnatomy2D initialProduce={product.anatomyType} />
                  ) : null}
                </div>

                <div className="space-y-4 lg:col-span-5">
                  {/* Inline Category Media Video */}
                  <MediaPlayer
                    asset={resolveCategoryMedia(product.category, product.anatomyType)}
                    compact
                  />

                  {/* Quick Buyer Q&A */}
                  <div className="space-y-2.5 rounded-[14px] border border-[#EAEFE6] bg-[#FAF8F1] p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
                      <HelpCircle className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{isEn ? "Buyer Quick Q&A" : "Hỏi đáp nhanh cho người mua"}</span>
                    </h3>
                    <div className="space-y-2 text-xs text-[#52645A]">
                      <div className="rounded-[10px] bg-white p-3">
                        <p className="font-bold text-[#25352B]">
                          {isEn
                            ? "How do I verify the harvest lot upon delivery?"
                            : "Làm sao kiểm tra đúng lô hàng khi nhận?"}
                        </p>
                        <p className="mt-1">
                          {isEn ? (
                            <>
                              Scan the QR label on the box or enter code{" "}
                              <strong className="text-[#245B3D]">{product.batchCode}</strong> in
                              Traceability to inspect the harvest date and public diary.
                            </>
                          ) : (
                            <>
                              Quét tem QR trên thùng/túi hoặc nhập mã{" "}
                              <strong className="text-[#245B3D]">{product.batchCode}</strong> tại
                              mục Truy xuất để đối chiếu ngày thu hái và nhật ký công khai.
                            </>
                          )}
                        </p>
                      </div>
                      <div className="rounded-[10px] bg-white p-3">
                        <p className="font-bold text-[#25352B]">
                          {isEn
                            ? "What if produce arrives damaged or mismatched?"
                            : "Khi giao hàng bị dập hoặc sai quy cách xử lý thế nào?"}
                        </p>
                        <p className="mt-1">
                          {isEn
                            ? "Open Order Details to submit a partial or full refund request for independent review by the farm and operations team."
                            : "Người mua vào Chi tiết đơn hàng gửi đề xuất hoàn tiền một phần/toàn phần; yêu cầu sẽ qua kiểm tra độc lập của nhà vườn và vận hành."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 2: Nguồn gốc / Origin & Trace */}
          {activeTab === "origin" ? (
            <div
              role="tabpanel"
              id="pdp-panel-origin"
              aria-labelledby="pdp-tab-origin"
              className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
            >
              <div className="lg:col-span-6">
                {batch ? (
                  <QrPassportCard batch={batch} compact />
                ) : (
                  <Card className="p-4 text-sm text-[#52645A]">
                    {isEn
                      ? `Traceability batch ${product.batchCode} is managed by ${product.farmName}.`
                      : `Mã lô truy xuất ${product.batchCode} do ${product.farmName} quản lý.`}
                  </Card>
                )}
              </div>

              <div className="space-y-4 lg:col-span-6">
                <div className="rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                  <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                    <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                    <span>
                      {isEn
                        ? "Verified Quality Credentials (26-Standard Engine)"
                        : "Hồ sơ chứng nhận chất lượng hợp lệ"}
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {isEn
                      ? "Tap any verified credential badge to inspect issuing body, validity dates, and scope."
                      : "Bấm vào từng huy hiệu hợp lệ để xem cơ quan cấp, thời hạn và phạm vi áp dụng."}
                  </p>

                  {validCreds.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {validCreds.map(({ record, typeDef }) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => setSelectedCred(record)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#245B3D]/35 bg-[#E6F3E9] px-3 py-1.5 text-xs font-semibold text-[#1E4D33] hover:bg-[#D5ECDA]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {record.typeId} · {typeDef?.displayName}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[#52645A]">
                      {isEn
                        ? "No active SKU-level credential badge attached yet."
                        : "Chưa có chứng nhận hợp lệ gắn trực tiếp cho SKU này."}{" "}
                      <Link
                        href={buildLocalizedHref("/quality", locale)}
                        className="font-semibold text-[#245B3D] underline"
                      >
                        {t.nav.quality}
                      </Link>
                    </p>
                  )}

                  {suppressedCount > 0 ? (
                    <p className="mt-3 rounded-[10px] bg-[#FFF8E7] px-3 py-2 text-[11px] font-medium text-[#80520C]">
                      {isEn
                        ? `Transparency notice: ${suppressedCount} record(s) automatically hidden because they are expired, incomplete, or outside this SKU's scope.`
                        : `Lưu ý minh bạch: có ${suppressedCount} hồ sơ đã tự động ẩn huy hiệu do hết hạn, thiếu bằng chứng hoặc không thuộc phạm vi SKU này.`}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildLocalizedHref(`/trace/${product.batchCode}`, locale)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#183D2A]"
                  >
                    <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEn ? "Open Full QR Passport" : "Mở Hộ chiếu QR đầy đủ"}</span>
                  </Link>
                  <Link
                    href={buildLocalizedHref("/quality", locale)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                  >
                    <span>{t.nav.quality}</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 3: Câu chuyện / Story */}
          {activeTab === "story" ? (
            <div
              role="tabpanel"
              id="pdp-panel-story"
              aria-labelledby="pdp-tab-story"
              className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
            >
              <div className="space-y-3 lg:col-span-7">
                <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]">
                  <BookOpen className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>
                    {isEn ? "Orchard Harvest & Heritage Story" : "Câu chuyện mùa vụ tại vườn"}
                  </span>
                </h2>
                <p className="text-sm leading-relaxed text-[#25352B]">{product.storyNote}</p>
                {farm ? (
                  <p className="text-sm leading-relaxed text-[#52645A]">
                    {isEn && farm.enStorySummary ? farm.enStorySummary : farm.storySummary}
                  </p>
                ) : null}
              </div>

              {farm ? (
                <div className="overflow-hidden rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] lg:col-span-5">
                  <img
                    src={farm.ownerPortrait}
                    alt={`${farm.ownerName} - ${isEn && farm.enName ? farm.enName : farm.name}`}
                    className="h-48 w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                        {isEn
                          ? farm.ocopStatus === "coop_checked_demo"
                            ? "Co-op Checked"
                            : "Farm Self-declared"
                          : farm.ocopLabel}
                      </Badge>
                      <span className="text-xs font-semibold text-[#52645A] tabular-nums">
                        {farm.areaHa} ha
                      </span>
                    </div>
                    <h3 className="font-editorial text-lg font-bold text-[#25352B]">
                      {isEn && farm.enName ? farm.enName : farm.name}
                    </h3>
                    <p className="text-xs text-[#52645A]">
                      {farm.ownerName} ·{" "}
                      {localizeAdminUnitName(farm.administrativeUnitName, undefined, locale)}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#245B3D]">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {isEn ? "Youth digital support:" : "Thanh niên đồng hành:"}{" "}
                        {farm.youthSupporters.join(", ")}
                      </span>
                    </p>
                    <div className="pt-2">
                      <Link
                        href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#183D2A]"
                      >
                        <span>{isEn ? "Visit orchard profile" : "Xem hồ sơ nhà vườn"}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* TAB 4: Đánh giá / Reviews */}
          {activeTab === "reviews" ? (
            <div
              role="tabpanel"
              id="pdp-panel-reviews"
              aria-labelledby="pdp-tab-reviews"
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]">
                  <Star className="h-5 w-5 fill-[#D7A34D] text-[#D7A34D]" aria-hidden="true" />
                  <span>
                    {isEn
                      ? `Verified-Order Reviews (${reviews.length})`
                      : `Đánh giá từ đơn hàng đã hoàn thành (${reviews.length})`}
                  </span>
                </h2>
                {averageRating ? (
                  <span className="rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-bold text-[#1E4D33] tabular-nums">
                    {averageRating} / 5.0 ★
                  </span>
                ) : null}
              </div>

              {completedQualifyingOrders.length > 0 ? (
                <form
                  className="space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = submitProductReview(
                      product.id,
                      completedQualifyingOrders[0].id,
                      reviewRating,
                      reviewComment ||
                        (isEn
                          ? "Fresh seasonal produce with transparent QR batch tracking."
                          : "Nông sản tươi đúng mùa vụ, thông tin truy xuất rõ ràng."),
                    );
                    if (res.ok) {
                      notifySuccess(res.message);
                      setReviewComment("");
                    } else {
                      notifyError(res.message);
                    }
                  }}
                >
                  <p className="text-xs font-semibold text-[#245B3D]">
                    {isEn
                      ? `You have completed order ${completedQualifyingOrders[0].id} containing this item — share your review:`
                      : `Bạn có đơn ${completedQualifyingOrders[0].id} đã hoàn thành chứa sản phẩm này — hãy để lại nhận xét:`}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <select
                      value={reviewRating}
                      onChange={(e) =>
                        setReviewRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
                      }
                      aria-label={isEn ? "Select star rating" : "Chọn số sao đánh giá"}
                      className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                    >
                      <option value={5}>
                        {isEn ? "5 stars — Excellent" : "5 sao — Rất hài lòng"}
                      </option>
                      <option value={4}>{isEn ? "4 stars — Good" : "4 sao — Tốt"}</option>
                      <option value={3}>
                        {isEn ? "3 stars — Average" : "3 sao — Bình thường"}
                      </option>
                      <option value={2}>
                        {isEn ? "2 stars — Needs improvement" : "2 sao — Cần cải thiện"}
                      </option>
                      <option value={1}>
                        {isEn ? "1 star — Unsatisfactory" : "1 sao — Chưa đạt"}
                      </option>
                    </select>
                    <input
                      type="text"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={
                        isEn
                          ? "Share feedback on flavor, freshness, packaging..."
                          : "Chia sẻ trải nghiệm hương vị, đóng gói..."
                      }
                      className="min-h-[40px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                    />
                    <Button type="submit" variant="primary" size="sm">
                      {isEn ? "Submit Review" : "Gửi đánh giá"}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="rounded-[12px] bg-[#FAF8F1] px-4 py-3 text-xs text-[#52645A]">
                  {isEn
                    ? "Reviews unlock after an order containing this produce reaches Completed status."
                    : "Đánh giá chỉ mở sau khi đơn hàng chứa sản phẩm này chuyển sang trạng thái hoàn thành."}
                </p>
              )}

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {reviews.map((rv) => (
                    <div
                      key={rv.id}
                      className="rounded-[12px] border border-[#EAEFE6] bg-white p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#25352B]">{rv.authorName}</span>
                        <Badge tone="success">
                          {rv.rating} ★ · {isEn ? "Order" : "Đơn"} {rv.orderId}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-[#52645A]">{rv.comment}</p>
                      <p className="mt-1 text-[11px] text-[#52645A]">{rv.createdDateLabel}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#52645A]">
                  {isEn
                    ? "No verified reviews recorded yet for this product."
                    : "Chưa có đánh giá nào được ghi nhận cho mặt hàng này."}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <section
          aria-label={isEn ? "Related seasonal produce" : "Nông sản gợi ý cùng mùa"}
          className="space-y-4"
        >
          <h2 className="font-editorial text-xl font-bold text-[#25352B]">
            {isEn ? "Similar & Nearby Seasonal Produce" : "Nông sản cùng nhóm & lân cận"}
          </h2>
          <div className="grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} showCompareToggle />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile Sticky Purchase Bar (Positioned Cleanly Above MobileBottomNav) */}
      {isAvailable ? (
        <div
          data-mobile-sticky-purchase="true"
          className="fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-30 border-t border-[#D6DED2] bg-white/97 px-3 py-2 shadow-[0_-4px_16px_rgba(24,61,42,0.1)] backdrop-blur-sm md:hidden"
        >
          <div className="mx-auto flex max-w-[640px] items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-[#52645A]">{displayName}</p>
              <p className="tabular-nums text-base leading-tight font-bold text-[#A52C22]">
                {formatVnd(activePriceVnd, locale, showUsd)}
                <span className="ml-0.5 text-[11px] font-normal text-[#52645A]">
                  /{localizeUnit(activeUnitLabel, locale)}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="primary" size="sm" className="min-h-[40px]" onClick={handleAddToCart}>
                <ShoppingBasket className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{isEn ? "Add" : "Thêm giỏ"}</span>
              </Button>
              <Button variant="gold" size="sm" className="min-h-[40px]" onClick={handleBuyNow}>
                <span>{isEn ? "Buy" : "Mua ngay"}</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CredentialDetailDrawer
        record={selectedCred}
        allRecords={credentialRecords}
        onClose={() => setSelectedCred(null)}
      />
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Loading produce detail...
        </div>
      }
    >
      <ProductDetailInner slug={slug} />
    </Suspense>
  );
}
