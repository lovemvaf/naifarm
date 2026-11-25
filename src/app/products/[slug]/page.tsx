"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShoppingBasket,
  Sprout,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { ProduceAnatomy2D } from "@/components/products/ProduceAnatomy2D";
import { ProductGallery2D } from "@/components/products/ProductGallery2D";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { products, farms, batches, certifications, addToCart, toggleFollowSeason, followedProductIds } =
    useDemoStore();

  const product = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(2);

  if (!product) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-12">
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm này không có trong danh mục demo hoặc đã đổi đường dẫn."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Quay lại Chợ OCOP
            </Link>
          }
        />
      </div>
    );
  }

  const farm = farms.find((f) => f.id === product.farmId);
  const batch = batches.find((b) => b.batchCode === product.batchCode) ?? batches[0];
  const farmCerts = certifications.filter((c) => c.farmId === product.farmId);
  const isAvailable = product.seasonStatus === "in_season" && product.stockKg > 0;
  const isFollowed = followedProductIds.includes(product.id);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 font-semibold text-[#245B3D] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay lại Chợ OCOP</span>
        </Link>
        <span className="text-xs text-[#52645A]">Mã sản phẩm: {product.id} · Mã lô: {product.batchCode}</span>
      </div>

      {/* Main Product Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ProductGallery2D images={gallery} productName={product.name} />
        </div>

        <div className="space-y-5 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isAvailable ? "success" : "warning"}>
              {isAvailable ? "Đang vào mùa (Có hàng demo)" : "Tạm hết — Hẹn mùa vụ tới"}
            </Badge>
            <Badge tone="neutral">{product.category}</Badge>
            {product.brixNote ? <Badge tone="gold">{product.brixNote}</Badge> : null}
          </div>

          <div>
            <h1 className="font-editorial text-3xl font-semibold text-[#25352B]">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#52645A]">
              {farm ? (
                <Link
                  href={`/farms/${farm.slug}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#245B3D] hover:underline"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{farm.name} ({farm.region})</span>
                </Link>
              ) : null}
              <span className="tabular-nums">
                Tồn kho demo: <strong>{product.stockKg} {product.unitLabel}</strong>
              </span>
            </div>
          </div>

          <div className="rounded-[16px] border border-[#D6DED2] bg-white p-4">
            <p className="tabular-nums text-3xl font-bold text-[#245B3D]">
              {formatVnd(product.priceVnd)}
              <span className="text-base font-medium text-[#52645A]"> / {product.unitLabel}</span>
            </p>
            <p className="mt-2 text-sm text-[#25352B]">{product.shortDescription}</p>
            <p className="mt-2 text-xs text-[#52645A]">{product.storyNote}</p>
          </div>

          {/* Quantity & Actions */}
          {isAvailable ? (
            <div className="space-y-3 rounded-[16px] border border-[#D6DED2] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-[#25352B]">Số lượng ({product.unitLabel})</span>
                  <p className="tabular-nums text-xs text-[#52645A]">
                    Tạm tính: <strong className="text-[#245B3D]">{formatVnd(product.priceVnd * qty)}</strong>
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#788A7B] bg-[#F5F3E9] p-1">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#25352B] hover:bg-[#EAF0E5] cursor-pointer"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="tabular-nums min-w-[44px] text-center text-base font-bold text-[#25352B]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    onClick={() => setQty((q) => Math.min(product.stockKg, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#25352B] hover:bg-[#EAF0E5] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    const res = addToCart(product.id, qty);
                    if (res.ok) toast.success(res.message);
                    else toast.error(res.message);
                  }}
                >
                  <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
                  <span>Thêm vào giỏ hàng</span>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const res = addToCart(product.id, qty);
                    if (res.ok) router.push("/checkout");
                    else toast.error(res.message);
                  }}
                >
                  <span>Đặt nhanh (COD Demo)</span>
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-4 bg-[#FFF2D8]/50">
              <p className="text-sm font-medium text-[#80520C]">
                Sản phẩm hiện tạm hết tồn sẵn trong kỳ này. Nút mua đã tắt để tránh đặt nhầm.
              </p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  toggleFollowSeason(product.id);
                  toast.info(isFollowed ? "Đã bỏ theo dõi vụ mùa." : "Đã bật thông báo khi có mùa mới (Demo).");
                }}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>{isFollowed ? "Đang theo dõi vụ mùa" : "Theo dõi vụ mùa"}</span>
              </Button>
            </Card>
          )}

          {/* Provenance & Delivery Quick Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={`/trace/${product.batchCode}`}
              className="flex items-center gap-3 rounded-[14px] border border-[#D6DED2] bg-[#EAF0E5] p-3.5 hover:bg-[#DDE7D6]"
            >
              <QrCode className="h-8 w-8 shrink-0 text-[#245B3D]" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#245B3D]">Xem Hộ chiếu QR & Nhật ký</p>
                <p className="text-xs text-[#52645A]">Mã lô {product.batchCode} · 3 mốc minh bạch</p>
              </div>
            </Link>

            <div className="flex items-center gap-3 rounded-[14px] border border-[#D6DED2] bg-white p-3.5">
              <Truck className="h-7 w-7 shrink-0 text-[#245B3D]" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#25352B]">Giao tận nơi hoặc Tại vườn</p>
                <p className="text-xs text-[#52645A]">Phí giao dự kiến 20.000 đ · Nhận tại vườn 0 đ</p>
              </div>
            </div>
          </div>

          {farm ? (
            <div className="flex items-center justify-between rounded-[14px] border border-[#D6DED2] bg-white px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <img src={farm.ownerPortrait} alt={farm.ownerName} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-[#25352B]">{farm.name}</p>
                  <p className="text-xs text-[#52645A]">{farm.ocopLabel}</p>
                </div>
              </div>
              <Link href={`/farms/${farm.slug}`} className="font-semibold text-[#245B3D] hover:underline">
                Hồ sơ vườn →
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* 2D Interactive Produce Anatomy & Farm Certification Showcase */}
      {product.anatomyType ? (
        <ProduceAnatomy2D initialProduce={product.anatomyType} allowSwitch={false} />
      ) : null}

      {farmCerts.length > 0 ? (
        <section aria-labelledby="prod-certs-heading" className="space-y-3">
          <h2 id="prod-certs-heading" className="text-xl font-bold text-[#25352B]">
            Hồ sơ chứng nhận &amp; Vùng trồng tham khảo (Demo)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {farmCerts.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Full QR Traceability Section embedded directly on product page (Stitch ST-03) */}
      <section aria-labelledby="trace-embed-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="trace-embed-heading" className="text-2xl font-bold text-[#25352B]">
            Tem Truy xuất Điện tử & Nhật ký Lô {batch.batchCode}
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#24603B]">
            <Check className="h-4 w-4" aria-hidden="true" />
            Đồng bộ cùng nguồn dữ liệu với trang QR công khai
          </span>
        </div>
        <QrPassportCard batch={batch} />
      </section>
    </div>
  );
}
