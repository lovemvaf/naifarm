"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Compass } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ExperienceBookingForm } from "@/components/farms/ExperienceBookingForm";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import type { RegionName } from "@/types/naifarm";
import { cn } from "@/lib/format";
import { assetUrl } from "@/lib/storage/assets";

const DongNaiMap = dynamic(
  () => import("@/components/map/DongNaiMap").then((mod) => mod.DongNaiMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface-soft text-sm font-medium text-primary">
        Đang tải bản đồ GeoJSON Thành phố Đồng Nai...
      </div>
    ),
  }
);

const ZONES: ("Tất cả" | RegionName)[] = [
  "Tất cả",
  "Phường Tân Triều",
  "Phường Long Khánh",
  "Phường Xuân Lộc",
  "Cẩm Mỹ & Định Quán",
];

export default function ExploreMapPage() {
  const { farms, adminUnits } = useDemoStore();
  const [zone, setZone] = useState<(typeof ZONES)[number]>("Tất cả");
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");

  const visibleFarms = useMemo(() => {
    if (zone === "Tất cả") return farms;
    if (zone === "Cẩm Mỹ & Định Quán") {
      return farms.filter((farm) => farm.region === "Cẩm Mỹ & Định Quán");
    }
    return farms.filter((farm) => farm.region === zone);
  }, [farms, zone]);

  const selectedFarm =
    visibleFarms.find((farm) => farm.id === selectedFarmId) ??
    visibleFarms[0] ??
    farms[0];

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">B2 · S17 &amp; S23 · Bản đồ số Nông sản &amp; Du lịch sinh thái</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-foreground">
          Bản đồ Nông sản &amp; Trải nghiệm Miệt vườn Đồng Nai
        </h1>
        <p className="mt-1 text-sm text-muted">
          Khám phá các vùng trồng trọng điểm (Tân Triều, Long Khánh, Xuân Lộc, Cẩm Mỹ &amp; Định
          Quán), xem mùa vụ và gửi yêu cầu trải nghiệm tại vườn.
        </p>
      </div>

      <DemoBanner
        title="Ranh giới hành chính Thành phố Đồng Nai"
        detail="Bản đồ dùng dữ liệu GeoJSON nguồn mở theo Nghị quyết 1662/NQ-UBTVQH15 (2025) và Nghị quyết 237/NQ-UBTVQH16 (2026): cấp thành phố trực thuộc trung ương, không còn cấp huyện. Ranh giới hiển thị mang tính tham chiếu."
      />

      <div className="flex flex-wrap gap-2">
        {ZONES.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZone(z)}
            className={cn(
              "min-h-[40px] rounded-full px-4 text-xs font-semibold cursor-pointer",
              zone === z
                ? "bg-primary text-white"
                : "border border-border bg-white text-foreground hover:bg-surface-soft"
            )}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          {visibleFarms.map((farm) => {
            const active = farm.id === selectedFarm?.id;
            return (
              <button
                key={farm.id}
                type="button"
                onClick={() => setSelectedFarmId(farm.id)}
                className={cn(
                  "flex w-full gap-3.5 rounded-[16px] border p-3.5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-surface-soft/80 shadow-[0_4px_14px_rgba(37,53,43,0.08)]"
                    : "border-border bg-white hover:bg-background"
                )}
              >
                <Image
                  src={assetUrl(farm.bannerImage)}
                  alt={farm.name}
                  className="h-24 w-24 shrink-0 rounded-[12px] object-cover"
                  width={512}
                  height={279}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-bold text-primary">{farm.region}</span>
                    <span className="tabular-nums text-xs text-muted">{farm.areaHa} ha</span>
                  </div>
                  <h2 className="mt-0.5 text-base font-bold text-foreground">{farm.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {farm.mainCrops.join(" · ")}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-warning">{farm.ocopLabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        <Card className="flex flex-col overflow-hidden lg:col-span-7">
          <div className="relative h-[340px] w-full overflow-hidden sm:h-[400px]">
            <DongNaiMap
              farms={visibleFarms}
              units={adminUnits}
              selectedFarmId={selectedFarm?.id ?? ""}
              onSelectFarm={setSelectedFarmId}
            />
            <div className="pointer-events-none absolute top-3 left-3 z-[500] rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Compass className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              Bản đồ GeoJSON · Không dùng tile OpenStreetMap
            </div>
          </div>

          {selectedFarm ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-white p-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">{selectedFarm.region}</Badge>
                  <span className="tabular-nums text-xs text-muted">
                    {selectedFarm.lat.toFixed(6)} · {selectedFarm.lng.toFixed(6)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{selectedFarm.name}</h3>
                <p className="text-xs text-muted">{selectedFarm.addressLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/farms/${selectedFarm.slug}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  <span>Xem hồ sơ nhà vườn</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {selectedFarm ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Đặt lịch trải nghiệm sinh thái tại {selectedFarm.name}</span>
          </h2>
          <ExperienceBookingForm farm={selectedFarm} />
        </section>
      ) : null}
    </div>
  );
}