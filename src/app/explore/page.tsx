"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ExperienceBookingForm } from "@/components/farms/ExperienceBookingForm";
import { NaiFarmMapHost, useBrowserGeolocation } from "@/components/map/NaiFarmMapHost";
import { MapControls } from "@/components/map/MapControls";
import { MapFilter } from "@/components/map/MapFilter";
import { MapLegend } from "@/components/map/MapLegend";
import { MapLocationCard } from "@/components/map/MapLocationCard";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import {
  calculateStraightLineDistanceKm,
  formatStraightLineDistanceVi,
} from "@/lib/geography/distance";
import { searchAdministrativeUnits } from "@/lib/geography/administrative-lookup";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import { cn } from "@/lib/format";
import type { DongNaiZone } from "@/types/naifarm";

function ExploreMapInner() {
  const searchParams = useSearchParams();
  const unitParam = searchParams.get("unit") ?? "";
  const { farms } = useDemoStore();

  const [zone, setZone] = useState<"Tất cả" | DongNaiZone>("Tất cả");
  const [ocopOnly, setOcopOnly] = useState(false);
  const [unitQuery, setUnitQuery] = useState(unitParam);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id ?? "");
  const [sortByDistance, setSortByDistance] = useState(true);

  const {
    gpsStatus,
    userCoords,
    accuracyMeters,
    outsideDongNai,
    requestLocation,
    clearLocation,
  } = useBrowserGeolocation();

  const { filteredFarms, aliasNote } = useMemo(() => {
    const cleanQ = normalizeSearchText(unitQuery);
    const unitSearch = cleanQ ? searchAdministrativeUnits(unitQuery) : { matches: [], matchedAlias: null };
    const matchedCodes = new Set(unitSearch.matches.map((u) => u.maDvhc));

    let list = farms.filter((f) => {
      if (zone !== "Tất cả" && f.zoneLabel !== zone) return false;
      if (ocopOnly && f.ocopStatus !== "coop_checked_demo") return false;
      if (!cleanQ) return true;
      const textMatch = normalizeSearchText(
        `${f.name} ${f.administrativeUnitName} ${f.administrativeUnitCode} ${f.mainCrops.join(" ")}`,
      ).includes(cleanQ);
      return textMatch || matchedCodes.has(f.administrativeUnitCode);
    });

    if (userCoords && sortByDistance) {
      list = [...list].sort(
        (a, b) =>
          calculateStraightLineDistanceKm(userCoords, {
            lat: a.coordinates.lat,
            lng: a.coordinates.lng,
          }) -
          calculateStraightLineDistanceKm(userCoords, {
            lat: b.coordinates.lat,
            lng: b.coordinates.lng,
          }),
      );
    }

    return {
      filteredFarms: list,
      aliasNote: unitSearch.matchedAlias
        ? `${unitSearch.matchedAlias.alias}: ${unitSearch.matchedAlias.note}`
        : null,
    };
  }, [farms, zone, ocopOnly, unitQuery, userCoords, sortByDistance]);

  const selectedFarm =
    filteredFarms.find((f) => f.id === selectedFarmId) ?? filteredFarms[0] ?? null;

  const selectedDistanceKm =
    selectedFarm && userCoords
      ? calculateStraightLineDistanceKm(userCoords, {
          lat: selectedFarm.coordinates.lat,
          lng: selectedFarm.coordinates.lng,
        })
      : null;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">95 Phường/Xã Thành phố Đồng Nai</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Bản đồ Nông sản &amp; Trải nghiệm Miệt vườn Đồng Nai
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Khám phá 30 nhà vườn từ Tân Triều, Long Khánh, Xuân Lộc, Cẩm Mỹ đến Bình Phước, Đak Nhau,
          Phước Sơn — kết nối định vị đo khoảng cách đường chim bay và đặt lịch tham quan.
        </p>
      </div>

      <DemoBanner
        title="Vị trí gần đúng theo vùng sinh thái"
        detail="Các điểm ghim trên bản đồ thể hiện vị trí gần đúng theo cụm xã/phường Đồng Nai vì dữ liệu ranh giới hành chính hiện tại chưa gắn polygon hoặc tọa độ pháp lý chính thức."
      />

      <MapFilter
        zone={zone}
        onZoneChange={setZone}
        ocopOnly={ocopOnly}
        onToggleOcopOnly={() => setOcopOnly((v) => !v)}
        unitQuery={unitQuery}
        onUnitQueryChange={setUnitQuery}
        aliasNote={aliasNote}
      />

      <MapControls
        gpsStatus={gpsStatus}
        userCoords={userCoords}
        accuracyMeters={accuracyMeters}
        outsideDongNai={outsideDongNai}
        onRequestLocation={requestLocation}
        onClearLocation={clearLocation}
        sortByDistance={sortByDistance}
        onToggleSortByDistance={() => setSortByDistance((v) => !v)}
      />

      {filteredFarms.length === 0 ? (
        <MapEmptyState
          onResetFilters={() => {
            setZone("Tất cả");
            setOcopOnly(false);
            setUnitQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 40%: Scrollable Farm List */}
          <div className="max-h-[540px] space-y-2.5 overflow-y-auto pr-1 lg:col-span-5">
            {filteredFarms.map((farm) => {
              const active = farm.id === selectedFarm?.id;
              const distKm = userCoords
                ? calculateStraightLineDistanceKm(userCoords, {
                    lat: farm.coordinates.lat,
                    lng: farm.coordinates.lng,
                  })
                : null;
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => setSelectedFarmId(farm.id)}
                  className={cn(
                    "flex w-full gap-3 rounded-[16px] border p-3 text-left transition cursor-pointer",
                    active
                      ? "border-[#245B3D] bg-[#EAF0E5]/85 shadow-[0_4px_12px_rgba(37,53,43,0.08)]"
                      : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                  )}
                >
                  <img
                    src={farm.bannerImage}
                    alt={farm.name}
                    className="h-20 w-20 shrink-0 rounded-[12px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-[#245B3D]">
                        {farm.administrativeUnitName} ({farm.administrativeUnitCode})
                      </span>
                      <span className="tabular-nums text-[11px] text-[#52645A]">
                        {distKm !== null ? formatStraightLineDistanceVi(distKm) : `${farm.areaHa} ha`}
                      </span>
                    </div>
                    <h2 className="mt-0.5 truncate text-sm font-bold text-[#25352B]">{farm.name}</h2>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#52645A]">
                      {farm.mainCrops.join(" · ")}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#80520C]">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{farm.ocopLabel}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 60%: Real Leaflet Map + Selected Farm Card */}
          <div className="space-y-4 lg:col-span-7">
            <NaiFarmMapHost
              farms={filteredFarms}
              selectedFarmId={selectedFarm?.id}
              onSelectFarm={setSelectedFarmId}
              userCoords={userCoords}
              accuracyMeters={accuracyMeters}
              heightClassName="h-[440px]"
              zoom={filteredFarms.length === 1 ? 12 : 10}
            />

            <MapLegend />

            {selectedFarm ? (
              <MapLocationCard farm={selectedFarm} distanceKm={selectedDistanceKm} />
            ) : null}
          </div>
        </div>
      )}

      {/* Ecological Booking Experience Section */}
      {selectedFarm ? (
        <Card className="p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Đặt lịch trải nghiệm sinh thái · {selectedFarm.name}</span>
          </h2>
          {selectedFarm.experiences.length > 0 ? (
            <div className="mt-4">
              <ExperienceBookingForm farm={selectedFarm} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#52645A]">
              Vườn này hiện ưu tiên bán nông sản qua Chợ OCOP và hỗ trợ truy xuất mã QR; bạn có thể
              chọn các vườn sinh thái có biểu tượng trải nghiệm ở danh sách bên trên.
            </p>
          )}
        </Card>
      ) : null}
    </div>
  );
}

export default function ExploreMapPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang khởi tạo bản đồ nông sản Đồng Nai...
        </div>
      }
    >
      <ExploreMapInner />
    </Suspense>
  );
}
