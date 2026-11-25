"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Clock, Compass, Globe2, MapPin, Star, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
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
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn, formatVnd } from "@/lib/format";
import type { DongNaiZone, TourPackage } from "@/types/naifarm";

type ExploreView = "map" | "tours";

function ExploreMapInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const unitParam = searchParams.get("unit") ?? "";
  const viewParam = searchParams.get("view");
  const { farms, tourPackages } = useDemoStore();

  const [viewMode, setViewMode] = useState<ExploreView>(
    viewParam === "tours" ? "tours" : "map",
  );
  const [zone, setZone] = useState<"Tất cả" | DongNaiZone>("Tất cả");
  const [ocopOnly, setOcopOnly] = useState(false);
  const [unitQuery, setUnitQuery] = useState(unitParam);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id ?? "");
  const [sortByDistance, setSortByDistance] = useState(true);
  const [mobileMapPane, setMobileMapPane] = useState<"map" | "list">("map");

  const [tourLangFilter, setTourLangFilter] = useState<"all" | "vi" | "en">("all");
  const [tourKindFilter, setTourKindFilter] = useState<"all" | TourPackage["experienceKind"]>("all");
  const [tourMaxPrice, setTourMaxPrice] = useState<"all" | "150000" | "250000">("all");

  const {
    gpsStatus,
    userCoords,
    accuracyMeters,
    outsideDongNai,
    requestLocation,
    clearLocation,
  } = useBrowserGeolocation();

  const switchView = (nextView: ExploreView) => {
    setViewMode(nextView);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { filteredFarms, aliasNote } = useMemo(() => {
    const cleanQ = normalizeSearchText(unitQuery);
    const unitSearch = cleanQ
      ? searchAdministrativeUnits(unitQuery)
      : { matches: [], matchedAlias: null };
    const matchedCodes = new Set(unitSearch.matches.map((u) => u.maDvhc));

    let list = farms.filter((f) => {
      if (zone !== "Tất cả" && f.zoneLabel !== zone) return false;
      if (ocopOnly && f.ocopStatus !== "coop_checked_demo") return false;
      if (!cleanQ) return true;
      const textMatch = normalizeSearchText(
        `${f.name} ${f.enName ?? ""} ${f.administrativeUnitName} ${f.administrativeUnitCode} ${f.mainCrops.join(" ")}`,
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

  const filteredTours = useMemo(() => {
    const cleanQ = normalizeSearchText(unitQuery);
    return tourPackages.filter((pkg) => {
      if (zone !== "Tất cả" && pkg.zoneLabel !== zone) return false;
      if (tourLangFilter !== "all" && !pkg.languages.includes(tourLangFilter)) return false;
      if (tourKindFilter !== "all" && pkg.experienceKind !== tourKindFilter) return false;
      if (tourMaxPrice !== "all" && pkg.adultPriceVnd > Number(tourMaxPrice)) return false;
      if (cleanQ) {
        const hay = normalizeSearchText(
          `${pkg.titleVi} ${pkg.titleEn} ${pkg.farmName} ${pkg.administrativeUnitName} ${pkg.administrativeUnitCode}`,
        );
        if (!hay.includes(cleanQ)) return false;
      }
      return true;
    });
  }, [tourPackages, zone, tourLangFilter, tourKindFilter, tourMaxPrice, unitQuery]);

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
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">
            {isEn ? "95 Dong Nai Wards & Communes" : "95 Phường/Xã Thành phố Đồng Nai"}
          </Badge>
          <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
            {t.explore.heroTitle}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[#52645A]">{t.explore.heroSubtitle}</p>
        </div>

        {/* View Mode Tabs: Map vs Agritourism Tours */}
        <div
          role="tablist"
          aria-label={isEn ? "Explore views" : "Chế độ Khám phá"}
          className="inline-flex rounded-[12px] border border-[#D6DED2] bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "map"}
            onClick={() => switchView("map")}
            className={cn(
              "inline-flex min-h-[40px] items-center gap-1.5 rounded-[9px] px-4 text-xs font-bold transition-colors cursor-pointer",
              viewMode === "map"
                ? "bg-[#245B3D] text-white"
                : "text-[#25352B] hover:bg-[#EAF0E5]",
            )}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>{t.explore.viewMapTab}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "tours"}
            onClick={() => switchView("tours")}
            className={cn(
              "inline-flex min-h-[40px] items-center gap-1.5 rounded-[9px] px-4 text-xs font-bold transition-colors cursor-pointer",
              viewMode === "tours"
                ? "bg-[#245B3D] text-white"
                : "text-[#25352B] hover:bg-[#EAF0E5]",
            )}
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>
              {t.explore.viewToursTab} ({tourPackages.length})
            </span>
          </button>
        </div>
      </div>

      <DemoBanner title={t.explore.approxNoticeTitle} detail={t.explore.approxNoticeBody} />

      <MapFilter
        zone={zone}
        onZoneChange={setZone}
        ocopOnly={ocopOnly}
        onToggleOcopOnly={() => setOcopOnly((v) => !v)}
        unitQuery={unitQuery}
        onUnitQueryChange={setUnitQuery}
        aliasNote={aliasNote}
      />

      {viewMode === "tours" ? (
        <div className="space-y-5">
          {/* Agritourism Tour Filters */}
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex items-center gap-2 text-xs">
              <Globe2 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <select
                aria-label={t.explore.guideLanguageLabel}
                value={tourLangFilter}
                onChange={(e) => setTourLangFilter(e.target.value as "all" | "vi" | "en")}
                className="min-h-[38px] rounded-[10px] border border-[#C7D2C2] bg-white px-3 text-xs font-semibold"
              >
                <option value="all">{isEn ? "All languages" : "Mọi ngôn ngữ"}</option>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English Bilingual</option>
              </select>
            </div>

            <select
              aria-label={isEn ? "Tour type" : "Loại trải nghiệm"}
              value={tourKindFilter}
              onChange={(e) =>
                setTourKindFilter(e.target.value as "all" | TourPackage["experienceKind"])
              }
              className="min-h-[38px] rounded-[10px] border border-[#C7D2C2] bg-white px-3 text-xs font-semibold"
            >
              <option value="all">{isEn ? "All tour kinds" : "Mọi hình thức tour"}</option>
              <option value="bilingual_tour">{isEn ? "Bilingual Ambassador Tour" : "Tour Song ngữ"}</option>
              <option value="harvest">{isEn ? "Orchard Harvest" : "Thu hoạch tại vườn"}</option>
              <option value="qr_workshop">{isEn ? "QR Packaging Workshop" : "Workshop đóng gói QR"}</option>
              <option value="school_trip">{isEn ? "School Field Study" : "Học sinh trải nghiệm"}</option>
              <option value="family">{isEn ? "Family Weekend" : "Gia đình cuối tuần"}</option>
              <option value="festival">{isEn ? "Cultural Festival Tour" : "Lễ hội & Văn hóa"}</option>
            </select>

            <select
              aria-label={isEn ? "Max budget" : "Mức giá tối đa"}
              value={tourMaxPrice}
              onChange={(e) => setTourMaxPrice(e.target.value as "all" | "150000" | "250000")}
              className="min-h-[38px] rounded-[10px] border border-[#C7D2C2] bg-white px-3 text-xs font-semibold"
            >
              <option value="all">{isEn ? "Any price" : "Mọi mức giá"}</option>
              <option value="150000">{isEn ? "Up to 150,000 VND" : "Từ 150.000 đ trở xuống"}</option>
              <option value="250000">{isEn ? "Up to 250,000 VND" : "Từ 250.000 đ trở xuống"}</option>
            </select>

            <span className="ml-auto text-xs font-semibold text-[#52645A]">
              {filteredTours.length} {isEn ? "packages" : "gói trải nghiệm"}
            </span>
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((pkg) => {
              const nextOpenSlot = pkg.slots.find((s) => s.capacity - s.bookedCount > 0);
              const detailHref = buildLocalizedHref(
                `/experiences/${pkg.slug}?returnTo=${encodeURIComponent(
                  buildLocalizedHref("/explore?view=tours", locale),
                )}`,
                locale,
              );
              return (
                <Card key={pkg.id} className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <img
                      src={pkg.image}
                      alt={isEn ? pkg.titleEn : pkg.titleVi}
                      className="h-44 w-full object-cover"
                    />
                    <div className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge tone="gold">{pkg.languages.join(" / ").toUpperCase()}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#80520C]">
                          <Star className="h-3.5 w-3.5 fill-[#D7A34D] text-[#D7A34D]" />
                          {pkg.ratingFixture} ({pkg.reviewCountFixture})
                        </span>
                      </div>
                      <h2 className="line-clamp-2 text-base font-bold text-[#25352B]">
                        {isEn ? pkg.titleEn : pkg.titleVi}
                      </h2>
                      <p className="line-clamp-2 text-xs text-[#52645A]">
                        {isEn ? pkg.summaryEn : pkg.summaryVi}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#52645A]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#245B3D]" />
                          {pkg.administrativeUnitName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#245B3D]" />
                          {pkg.durationHours}h
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-[#245B3D]" />
                          {pkg.maxGuests} max
                        </span>
                      </div>
                      {nextOpenSlot ? (
                        <p className="text-[11px] font-semibold text-[#245B3D]">
                          {isEn ? "Next slot:" : "Ca mở tiếp theo:"} {nextOpenSlot.dateIso} ·{" "}
                          {nextOpenSlot.startTime} ({nextOpenSlot.capacity - nextOpenSlot.bookedCount}{" "}
                          {isEn ? "seats" : "chỗ"})
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#D6DED2] bg-[#FAF8F1] px-4 py-3">
                    <div>
                      <p className="tabular-nums text-base font-bold text-[#245B3D]">
                        {formatVnd(pkg.adultPriceVnd, locale, showUsd)}
                      </p>
                      <p className="text-[11px] text-[#52645A]">
                        {isEn ? "Child:" : "Trẻ em:"} {formatVnd(pkg.childPriceVnd, locale)}
                      </p>
                    </div>
                    <Link
                      href={detailHref}
                      className="inline-flex min-h-[40px] items-center rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#19472E]"
                    >
                      {t.explore.viewTourDetails}
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <>
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
            <div className="space-y-3">
              {/* Mobile Segmented Map / List Toggle so mobile scrolling stays smooth */}
              <div
                className="flex items-center justify-between rounded-[12px] border border-[#D6DED2] bg-white p-1 lg:hidden"
                role="group"
                aria-label={isEn ? "Mobile map or orchard list" : "Chế độ bản đồ hoặc danh sách trên di động"}
              >
                <button
                  type="button"
                  onClick={() => setMobileMapPane("map")}
                  className={cn(
                    "min-h-[38px] flex-1 rounded-[9px] text-xs font-bold transition cursor-pointer",
                    mobileMapPane === "map"
                      ? "bg-[#245B3D] text-white"
                      : "text-[#52645A]",
                  )}
                >
                  {isEn ? "Dong Nai 2D Map" : "Bản đồ 2D Đồng Nai"}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMapPane("list")}
                  className={cn(
                    "min-h-[38px] flex-1 rounded-[9px] text-xs font-bold transition cursor-pointer",
                    mobileMapPane === "list"
                      ? "bg-[#245B3D] text-white"
                      : "text-[#52645A]",
                  )}
                >
                  {isEn ? `Orchard list (${filteredFarms.length})` : `Danh sách vườn (${filteredFarms.length})`}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div
                  className={cn(
                    "max-h-[540px] space-y-2.5 overflow-y-auto pr-1 lg:col-span-5 lg:block",
                    mobileMapPane === "list" ? "block" : "hidden",
                  )}
                >
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
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setMobileMapPane("map");
                        }}
                        className={cn(
                          "flex w-full gap-3 rounded-[16px] border p-3 text-left transition cursor-pointer",
                          active
                            ? "border-[#245B3D] bg-[#EAF0E5]/85 shadow-[0_4px_12px_rgba(37,53,43,0.08)]"
                            : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                        )}
                      >
                        <img
                          src={farm.bannerImage}
                          alt={isEn && farm.enName ? farm.enName : farm.name}
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
                          <h2 className="mt-0.5 truncate text-sm font-bold text-[#25352B]">
                            {isEn && farm.enName ? farm.enName : farm.name}
                          </h2>
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

                <div
                  className={cn(
                    "space-y-4 lg:col-span-7 lg:block",
                    mobileMapPane === "map" ? "block" : "hidden",
                  )}
                >
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
            </div>
          )}

          {selectedFarm ? (
            <Card className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                  <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>
                    {isEn ? "Orchard Visit Booking" : "Đặt lịch trải nghiệm sinh thái"} ·{" "}
                    {isEn && selectedFarm.enName ? selectedFarm.enName : selectedFarm.name}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => switchView("tours")}
                  className="text-xs font-bold text-[#245B3D] underline cursor-pointer"
                >
                  {isEn ? `Browse all ${tourPackages.length} tours →` : `Xem toàn bộ ${tourPackages.length} gói tour →`}
                </button>
              </div>
              {selectedFarm.experiences.length > 0 ? (
                <div className="mt-4">
                  <ExperienceBookingForm farm={selectedFarm} />
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#52645A]">
                  {isEn
                    ? "This orchard prioritizes direct OCOP produce and QR traceability; switch to Tours above to reserve guided orchard visits."
                    : "Vườn này hiện ưu tiên bán nông sản qua Chợ OCOP và hỗ trợ truy xuất mã QR; xem thêm các gói tour mở ở tab Gói du lịch trải nghiệm."}
                </p>
              )}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function ExploreMapPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang khởi tạo bản đồ &amp; tour trải nghiệm Đồng Nai...
        </div>
      }
    >
      <ExploreMapInner />
    </Suspense>
  );
}
