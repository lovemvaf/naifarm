"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, MapPin } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ExperienceBookingForm } from "@/components/farms/ExperienceBookingForm";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

const ZONES = [
  "Tất cả",
  "Vĩnh Cửu / Tân Triều",
  "Long Khánh",
  "Xuân Lộc",
  "Cẩm Mỹ & Định Quán",
] as const;

export default function ExploreMapPage() {
  const { farms } = useDemoStore();
  const [zone, setZone] = useState<(typeof ZONES)[number]>("Tất cả");
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id ?? "");

  const visibleFarms = useMemo(
    () => (zone === "Tất cả" ? farms : farms.filter((f) => f.region === zone)),
    [farms, zone]
  );

  const selectedFarm =
    visibleFarms.find((f) => f.id === selectedFarmId) ?? visibleFarms[0] ?? farms[0];

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">B2 · S17 & S23 · Bản đồ số Nông sản & Du lịch sinh thái</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Bản đồ Nông sản & Trải nghiệm Miệt vườn Đồng Nai
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Khám phá các vùng trồng trọng điểm (Tân Triều, Long Khánh, Xuân Lộc, Cẩm Mỹ), xem mùa vụ
          và gửi yêu cầu trải nghiệm tại vườn.
        </p>
      </div>

      <DemoBanner
        title="Bản đồ minh họa (Demo GIS)"
        detail="Các điểm ghim trên bản đồ là tọa độ minh họa theo vùng sinh thái Đồng Nai; không vẽ ranh giới hành chính pháp lý chính thức và có danh sách thay thế đầy đủ."
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
                ? "bg-[#245B3D] text-white"
                : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]"
            )}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Desktop 40/60 Split List + Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List (40% -> 5 cols) */}
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
                    ? "border-[#245B3D] bg-[#EAF0E5]/80 shadow-[0_4px_14px_rgba(37,53,43,0.08)]"
                    : "border-[#D6DED2] bg-white hover:bg-[#F5F3E9]"
                )}
              >
                <img
                  src={farm.bannerImage}
                  alt={farm.name}
                  className="h-24 w-24 shrink-0 rounded-[12px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#245B3D]">{farm.region}</span>
                    <span className="tabular-nums text-xs text-[#52645A]">{farm.areaHa} ha</span>
                  </div>
                  <h2 className="mt-0.5 text-base font-bold text-[#25352B]">{farm.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-[#52645A]">
                    {farm.mainCrops.join(" · ")}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#80520C]">{farm.ocopLabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Interactive Regional Canvas Map (60% -> 7 cols) */}
        <Card className="overflow-hidden lg:col-span-7 flex flex-col">
          <div className="relative h-[340px] w-full overflow-hidden bg-gradient-to-br from-[#DDE8D5] via-[#EAF0E5] to-[#EFE8D5] sm:h-[400px]">
            {/* Stylized river & elevation contour SVG background — clean agricultural map feel */}
            <svg
              aria-hidden="true"
              viewBox="0 0 800 450"
              className="absolute inset-0 h-full w-full opacity-75"
              preserveAspectRatio="none"
            >
              <path
                d="M 40 310 C 180 260, 210 170, 320 150 C 440 130, 520 210, 620 120"
                fill="none"
                stroke="#85B3C4"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 120 40 C 260 120, 420 70, 720 290"
                fill="none"
                stroke="#C5D4BE"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <circle cx="510" cy="145" r="46" fill="#C4DCE3" opacity="0.65" />
              <text x="485" y="150" fill="#245B78" fontSize="12" fontWeight="600">Hồ Trị An</text>
              <text x="140" y="295" fill="#245B78" fontSize="12" fontWeight="600">Sông Đồng Nai</text>
            </svg>

            <div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#245B3D] shadow-sm">
              <Compass className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              Bản đồ vùng trồng Đồng Nai (Minh họa tọa độ mẫu)
            </div>

            {visibleFarms.map((farm) => {
              const active = farm.id === selectedFarm?.id;
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => setSelectedFarmId(farm.id)}
                  style={{
                    left: `${farm.coordinates.xPercent}%`,
                    top: `${farm.coordinates.yPercent}%`,
                  }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-transform cursor-pointer",
                    active
                      ? "z-20 scale-105 bg-[#245B3D] text-white ring-2 ring-[#D7A34D]"
                      : "z-10 bg-white text-[#25352B] hover:bg-[#EAF0E5]"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{farm.name}</span>
                </button>
              );
            })}

            <div className="absolute bottom-2 right-3 rounded bg-white/90 px-2 py-0.5 text-[10px] text-[#52645A]">
              Nguồn điểm: Dữ liệu mẫu NaiFarm Demo (không phải bản đồ địa giới chính thức)
            </div>
          </div>

          {selectedFarm ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D6DED2] bg-white p-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">{selectedFarm.region}</Badge>
                  <span className="tabular-nums text-xs text-[#52645A]">
                    {selectedFarm.coordinates.latLabel} · {selectedFarm.coordinates.lngLabel}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#25352B]">{selectedFarm.name}</h3>
                <p className="text-xs text-[#52645A]">{selectedFarm.addressLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/farms/${selectedFarm.slug}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>Xem hồ sơ nhà vườn</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Selected Farm Experience Booking */}
      {selectedFarm ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
            <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Đặt lịch trải nghiệm sinh thái tại {selectedFarm.name}</span>
          </h2>
          <ExperienceBookingForm farm={selectedFarm} />
        </section>
      ) : null}
    </div>
  );
}
