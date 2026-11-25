"use client";

import React, { Suspense, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
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
  Star,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeCategory, localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
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
import { formatVnd } from "@/lib/format";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";
import type { CredentialRecord } from "@/types/naifarm";

function ProductDetailInner({ slug }: { slug: string }) {
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
          title="Không tìm thấy nông sản yêu cầu"
          description="Mặt hàng có thể đã thay đổi tên hoặc không còn trong danh mục hiện hành."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Về Chợ nông sản
            </Link>
          }
        />
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-6">
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
          <span>{localizeCategory(product.category, locale)}</span>
          <span>/</span>
          <span className="font-semibold text-[#25352B]">{localizeProductName(product, locale)}</span>
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
              Tạm khóa đặt mua — Lô {batch.batchCode} đang{" "}
              {batch.lotStatus === "recalled"
                ? "trong diện thu hồi khẩn cấp"
                : batch.lotStatus === "quarantine"
                ? "tạm giữ kiểm tra"
                : "hết hạn lưu hành"}
            </p>
            <p className="mt-1 text-xs">
              Hệ thống tự động vô hiệu hóa giỏ hàng đối với sản phẩm thuộc lô đang phong tỏa.{" "}
              <Link href={`/trace/${batch.batchCode}`} className="font-bold underline">
                Xem thông báo lô &amp; truy xuất phả hệ →
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      {/* Top Grid: 2D Gallery + Commercial Panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ProductGallery2D
            images={product.gallery?.length ? product.gallery : [product.image]}
            productName={product.name}
          />
        </div>

        <div className="space-y-5 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.seasonStatus === "in_season" && product.stockKg > 0 ? (
              <Badge tone="success">Đang vào mùa</Badge>
            ) : product.seasonStatus === "pre_order" ? (
              <Badge tone="info">Đặt trước mùa vụ</Badge>
            ) : (
              <Badge tone="warning">Hẹn mùa vụ tới</Badge>
            )}
            {product.isNaiBox ? <Badge tone="gold">NaiBox 95</Badge> : null}
            {product.isRescue ? <Badge tone="warning">NaiRescue</Badge> : null}
            <Badge tone="neutral">Hồ sơ trải nghiệm</Badge>
          </div>

          <div>
            <h1 className="font-editorial text-2xl font-bold text-[#25352B] md:text-3xl">
              {localizeProductName(product, locale)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#52645A]">
              {farm ? (
                <Link
                  href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                  className="inline-flex items-center gap-1 font-semibold text-[#245B3D] hover:underline"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {product.farmName} · {product.administrativeUnitName}
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
            </div>
          </div>

          <div className="rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
            <p className="tabular-nums text-2xl font-bold text-[#245B3D] md:text-3xl">
              {formatVnd(activePriceVnd, locale, showUsd)}
              <span className="ml-1 text-sm font-medium text-[#52645A]">
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
            {isEn && product.enShortDescription ? product.enShortDescription : product.shortDescription}
          </p>

          {/* International Buyer / Wholesale Availability Inquiry (Honest RFQ) */}
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
                      ? "Domestic Vietnam delivery via cart; submit local RFQ inquiry for overseas/wholesale quotes."
                      : "Giao nội địa qua giỏ hàng; gửi yêu cầu nếu cần hỏi nguồn hàng xuất khẩu/B2B.")}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={!evaluateMinorSafeguarding(authUser?.isMinor, authUser?.hasGuardianConsent).allowPublicCommerce}
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
                  placeholder={isEn ? "Questions for orchard/cooperative..." : "Nội dung trao đổi với cơ sở..."}
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
                  : `Đã lưu yêu cầu ${rfqSentId} cho ${product.farmName} phản hồi trong không gian W02/W05.`}
              </p>
            ) : null}
          </div>

          {/* Weight / Pack Variants */}
          {options.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#25352B] uppercase">Quy cách đóng gói</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedOptionIdx(idx)}
                    className={`min-h-[40px] cursor-pointer rounded-[10px] border px-3.5 text-xs font-semibold transition ${
                      idx === selectedOptionIdx
                        ? "border-[#245B3D] bg-[#245B3D] text-white"
                        : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                    }`}
                  >
                    {opt.label} · {formatVnd(opt.priceVnd)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isAvailable ? (
              <>
                <div className="inline-flex items-center rounded-[12px] border border-[#788A7B] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="flex h-12 w-11 cursor-pointer items-center justify-center hover:bg-[#EAF0E5]"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-[40px] text-center text-sm font-bold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockKg, q + 1))}
                    aria-label="Tăng số lượng"
                    className="flex h-12 w-11 cursor-pointer items-center justify-center hover:bg-[#EAF0E5]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    const res = addToCart(product.id, quantity, activeOption?.label);
                    if (res.ok) notifySuccess(res.message);
                    else notifyError(res.message);
                  }}
                >
                  <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                  <span>Thêm vào giỏ hàng</span>
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
                      ? `Đã tắt nhắc vụ mùa ${product.name}`
                      : `Đã theo dõi vụ mùa ${product.name}`,
                  );
                }}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>{isFollowed ? "Đang theo dõi vụ mùa" : "Nhắc tôi khi vào mùa"}</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[12px] border border-[#D6DED2] bg-white hover:bg-[#EAF0E5]"
            >
              <Heart
                className={`h-5 w-5 ${isFav ? "fill-[#A32D2D] text-[#A32D2D]" : "text-[#52645A]"}`}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                const res = toggleCompareProduct(product.id);
                if (!res.ok && res.message) notifyError(res.message);
                else notifyInfo(isCompared ? "Đã bỏ khỏi danh sách so sánh." : "Đã thêm vào danh sách so sánh.");
              }}
              aria-label="So sánh sản phẩm"
              className={`flex h-12 cursor-pointer items-center gap-1.5 rounded-[12px] border px-3.5 text-xs font-semibold ${
                isCompared
                  ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                  : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
              }`}
            >
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              <span>{isCompared ? "Đang đối chiếu" : "So sánh"}</span>
            </button>
          </div>

          {/* Storage / Origin / Valid-Only Credentials */}
          <Card className="space-y-3 p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
              <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Thông số bảo quản &amp; hồ sơ chất lượng hợp lệ</span>
            </h2>
            <div className="grid grid-cols-1 gap-2 text-xs text-[#52645A] sm:grid-cols-2">
              <p>
                <strong className="text-[#25352B]">Chỉ tiêu đặc trưng:</strong>{" "}
                {product.brixNote || "Thu hái đúng độ chín tự nhiên"}
              </p>
              <p>
                <strong className="text-[#25352B]">Hạn dùng khuyến nghị:</strong>{" "}
                {product.expiryDays ? `${product.expiryDays} ngày` : "Theo nhãn bao bì lô"}
              </p>
              <p className="sm:col-span-2">
                <strong className="text-[#25352B]">Bảo quản:</strong>{" "}
                {product.storageNote || "Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp."}
              </p>
              <p className="sm:col-span-2">
                <strong className="text-[#25352B]">Nguồn gốc vùng:</strong>{" "}
                {product.originNote || `${product.farmName}, ${product.administrativeUnitName}`}
              </p>
            </div>

            {validCreds.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-[#EAEFE6] pt-3">
                {validCreds.map(({ record, typeDef }) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setSelectedCred(record)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#245B3D]/30 bg-[#E6F3E9] px-3 py-1 text-xs font-semibold text-[#24603B] hover:bg-[#D5ECDA]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {record.typeId} · {typeDef?.displayName}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="border-t border-[#EAEFE6] pt-3 text-xs text-[#52645A]">
                Chưa có chứng nhận hợp lệ gắn trực tiếp cho SKU này. Tham khảo chi tiết tại{" "}
                <Link href="/quality" className="font-semibold text-[#245B3D] underline">
                  Trung tâm Chất lượng
                </Link>
                .
              </p>
            )}

            {suppressedCount > 0 ? (
              <p className="text-[11px] text-[#80520C]">
                Lưu ý minh bạch: có {suppressedCount} hồ sơ đã tự động ẩn huy hiệu do hết hạn, thiếu bằng chứng
                hoặc không thuộc phạm vi SKU này.
              </p>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Story + Media + QR Passport + 2D Anatomy */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className="p-5">
            <h2 className="font-editorial text-xl font-bold text-[#25352B]">
              {isEn ? "Orchard Harvest & Heritage Story" : "Câu chuyện mùa vụ tại vườn"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#52645A]">{product.storyNote}</p>
          </Card>

          {product.anatomyType ? <ProduceAnatomy2D initialProduce={product.anatomyType} /> : null}

          <MediaPlayer asset={resolveCategoryMedia(product.category, product.anatomyType)} compact />
        </div>

        <div className="space-y-5 lg:col-span-5">
          {batch ? <QrPassportCard batch={batch} compact /> : null}

          {/* Q&A */}
          <Card className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <HelpCircle className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Hỏi đáp nhanh cho người mua</span>
            </h2>
            <div className="space-y-2.5 text-xs text-[#52645A]">
              <div className="rounded-[10px] bg-[#FAF8F1] p-3">
                <p className="font-bold text-[#25352B]">Làm sao kiểm tra đúng lô hàng khi nhận?</p>
                <p className="mt-1">
                  Quét tem QR trên thùng/túi hoặc nhập mã <strong className="text-[#245B3D]">{product.batchCode}</strong> tại mục Truy xuất để đối chiếu ngày thu hái và nhật ký công khai.
                </p>
              </div>
              <div className="rounded-[10px] bg-[#FAF8F1] p-3">
                <p className="font-bold text-[#25352B]">Khi giao hàng bị dập hoặc sai quy cách xử lý thế nào?</p>
                <p className="mt-1">
                  Người mua vào Chi tiết đơn hàng gửi đề xuất hoàn tiền một phần/toàn phần; yêu cầu sẽ qua quy trình kiểm tra độc lập của nhà vườn và kế toán.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Verified Order Reviews */}
      <Card className="space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-[#25352B]">
            <Star className="h-5 w-5 text-[#D7A34D]" aria-hidden="true" />
            <span>Đánh giá từ đơn hàng đã hoàn thành ({reviews.length})</span>
          </h2>
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
                reviewComment || "Nông sản tươi đúng mùa vụ, thông tin truy xuất rõ ràng.",
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
              Bạn có đơn {completedQualifyingOrders[0].id} đã hoàn thành chứa sản phẩm này — hãy để lại nhận xét:
            </p>
            <div className="flex flex-wrap gap-3">
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                aria-label="Chọn số sao đánh giá"
                className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
              >
                <option value={5}>5 sao — Rất hài lòng</option>
                <option value={4}>4 sao — Tốt</option>
                <option value={3}>3 sao — Bình thường</option>
                <option value={2}>2 sao — Cần cải thiện</option>
                <option value={1}>1 sao — Chưa đạt</option>
              </select>
              <input
                type="text"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm hương vị, đóng gói..."
                className="min-h-[40px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
              />
              <Button type="submit" variant="primary" size="sm">
                Gửi đánh giá
              </Button>
            </div>
          </form>
        ) : (
          <p className="rounded-[12px] bg-[#FAF8F1] px-4 py-3 text-xs text-[#52645A]">
            Đánh giá chỉ mở sau khi đơn hàng chứa sản phẩm này chuyển sang trạng thái hoàn thành.
          </p>
        )}

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((rv) => (
              <div key={rv.id} className="rounded-[12px] border border-[#EAEFE6] bg-white p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#25352B]">{rv.authorName}</span>
                  <Badge tone="success">{rv.rating} ★ · Đơn {rv.orderId}</Badge>
                </div>
                <p className="mt-1.5 text-[#52645A]">{rv.comment}</p>
                <p className="mt-1 text-[11px] text-[#788A7B]">{rv.createdDateLabel}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#52645A]">Chưa có đánh giá nào được ghi nhận cho mặt hàng này.</p>
        )}
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <section aria-label="Nông sản gợi ý cùng mùa" className="space-y-4">
          <h2 className="font-editorial text-xl font-bold text-[#25352B]">
            Nông sản cùng nhóm &amp; lân cận
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} showCompareToggle />
            ))}
          </div>
        </section>
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
