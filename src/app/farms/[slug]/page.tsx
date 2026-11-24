"use client";

import React, { use } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, MapPin, QrCode, Radio, ShieldCheck, Sprout, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ExperienceBookingForm } from "@/components/farms/ExperienceBookingForm";
import { Badge, Card, EmptyState } from "@/components/ui/Primitives";

export default function FarmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { farms, products, batches, livestreams } = useDemoStore();
  const farm = farms.find((f) => f.slug === slug);

  if (!farm) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-12">
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title="Không tìm thấy hồ sơ nhà vườn"
          description="Đường dẫn nhà vườn không tồn tại trong danh sách dữ liệu demo hiện tại."
          action={
            <Link
              href="/farms"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white"
            >
              Về danh sách nhà vườn
            </Link>
          }
        />
      </div>
    );
  }

  const farmProducts = products.filter((p) => p.farmId === farm.id);
  const farmBatches = batches.filter((b) => b.farmId === farm.id);
  const farmLives = livestreams.filter((l) => l.farmId === farm.id);

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 px-4 py-6 lg:px-8">
      <Link
        href="/farms"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Danh sách Nhà vườn Đồng Nai</span>
      </Link>

      {/* Farm Hero Banner */}
      <section className="overflow-hidden rounded-[24px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.06)]">
        <div className="relative h-64 w-full sm:h-80">
          <img
            src={farm.bannerImage}
            alt={`Vườn ${farm.name}`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[120px_minmax(0,1fr)]">
          <img
            src={farm.ownerPortrait}
            alt={farm.ownerName}
            className="h-28 w-28 rounded-[16px] border-2 border-[#D6DED2] object-cover"
          />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                {farm.ocopStatus === "coop_checked_demo" ? (
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{farm.ocopLabel}</span>
              </Badge>
              <Badge tone="neutral">{farm.areaHa} ha canh tác</Badge>
              <Badge tone="neutral">{farm.ownerAgeLabel}</Badge>
            </div>

            <h1 className="font-editorial text-3xl font-semibold text-[#25352B]">{farm.name}</h1>
            <p className="inline-flex items-center gap-1.5 text-sm text-[#52645A]">
              <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{farm.addressLabel}</span>
            </p>
            <p className="font-editorial text-lg font-medium text-[#245B3D]">{farm.storyHeadline}</p>
            <p className="text-base text-[#25352B]">{farm.storySummary}</p>

            <div className="rounded-[12px] border border-[#D6DED2] bg-[#FFF2D8]/60 p-3.5 text-sm text-[#25352B]">
              <strong>Tình trạng chứng nhận (minh bạch): </strong>
              {farm.ocopNote}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-[#52645A]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#245B3D]">
                <Users className="h-4 w-4" aria-hidden="true" />
                Đội thanh niên đồng hành: {farm.youthSupporters.join(" · ")}
              </span>
              <Link href="/explore" className="font-semibold text-[#245B3D] underline">
                Mở trên Bản đồ số Đồng Nai →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Products */}
      <section aria-labelledby="farm-products-heading" className="space-y-4">
        <h2 id="farm-products-heading" className="text-2xl font-bold text-[#25352B]">
          Nông sản từ {farm.name} ({farmProducts.length})
        </h2>
        <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {farmProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Traceability Batches & Live Schedule */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <QrCode className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Nhật ký lô & Hộ chiếu nông sản</span>
          </h2>
          <div className="mt-4 space-y-3">
            {farmBatches.map((b) => (
              <Link
                key={b.batchCode}
                href={`/trace/${b.batchCode}`}
                className="block rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 p-4 hover:bg-[#EAF0E5]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular-nums font-bold text-[#245B3D]">{b.batchCode}</span>
                  <span className="text-xs text-[#52645A]">{b.events.length} mốc nhật ký</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#25352B]">{b.productName}</p>
                <p className="mt-1 text-xs text-[#52645A]">{b.declarationLevel}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Radio className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Lịch Livestream hỗ trợ tại vườn</span>
          </h2>
          {farmLives.length > 0 ? (
            <div className="mt-4 space-y-3">
              {farmLives.map((live) => (
                <Link
                  key={live.id}
                  href="/live"
                  className="block rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 p-4 hover:bg-[#EAF0E5]"
                >
                  <p className="font-semibold text-[#25352B]">{live.title}</p>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {live.scheduleLabel} · Phụ trách: {live.hostYouth}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#52645A]">Chưa có lịch phát sóng sắp tới.</p>
          )}
        </Card>
      </section>

      {/* Eco-Experience Booking Request */}
      <ExperienceBookingForm farm={farm} />

      {/* Field Photos Gallery */}
      <section aria-labelledby="farm-gallery-heading" className="space-y-4">
        <h2 id="farm-gallery-heading" className="text-xl font-bold text-[#25352B]">
          Góc ảnh thực địa tại vườn (Ảnh minh họa)
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {farm.galleryImages.map((img, i) => (
            <img
              key={img + i}
              src={img}
              alt={`${farm.name} - ảnh ${i + 1}`}
              className="aspect-[4/3] w-full rounded-[14px] border border-[#D6DED2] object-cover"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
