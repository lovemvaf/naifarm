"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import type { LatLngBoundsExpression } from "leaflet";
import { Layers, LocateFixed } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { isWithinDongNaiApproxBounds, type LatLngPoint } from "@/lib/geography/distance";
import { MapStatusStore, type MapStatusSnapshot } from "@/lib/geography/map-status";
import { MapErrorState } from "./MapErrorState";
import { MapMarkers } from "./MapMarkers";
import type { Farm } from "@/types/naifarm";

export interface NaiFarmMapProps {
  farms: Farm[];
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  userCoords?: LatLngPoint | null;
  accuracyMeters?: number | null;
  heightClassName?: string;
  zoom?: number;
}

const DONG_NAI_FIT_BOUNDS: [[number, number], [number, number]] = [
  [10.57, 106.4],
  [12.31, 107.59],
];

const DONG_NAI_MAX_BOUNDS: LatLngBoundsExpression = [
  [10.42, 106.25],
  [12.46, 107.76],
];

function computeGeoBounds(
  outlineData: GeoJsonObject | null,
): [[number, number], [number, number]] | null {
  if (!outlineData || outlineData.type !== "FeatureCollection") return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const visitRing = (ring: number[][]) => {
    for (const pt of ring) {
      if (pt.length < 2) continue;
      const [lng, lat] = pt;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  };

  for (const feat of (outlineData as GeoJSON.FeatureCollection).features) {
    const geom = feat.geometry as Polygon | MultiPolygon | null;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach(visitRing);
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) => poly.forEach(visitRing));
    }
  }

  if (!Number.isFinite(minLat) || !Number.isFinite(minLng)) return null;
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

function buildInverseWorldMask(outlineData: GeoJsonObject | null): GeoJsonObject | null {
  if (!outlineData || outlineData.type !== "FeatureCollection") return null;
  const fc = outlineData as GeoJSON.FeatureCollection;
  const holes: number[][][] = [];
  for (const feat of fc.features) {
    const geom = feat.geometry as Polygon | MultiPolygon | null;
    if (!geom) continue;
    if (geom.type === "Polygon" && geom.coordinates[0]) {
      holes.push(geom.coordinates[0]);
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        if (poly[0]) holes.push(poly[0]);
      }
    }
  }
  if (holes.length === 0) return null;
  const worldRing: number[][] = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];
  const maskFeature: Feature<Polygon> = {
    type: "Feature",
    properties: { id: "dong-nai-inverse-mask" },
    geometry: {
      type: "Polygon",
      coordinates: [worldRing, ...holes],
    },
  };
  return maskFeature;
}

function MapViewportSync({
  centerLat,
  centerLng,
  zoom,
  focusKey,
  provinceBounds,
  shouldFitProvinceOnInit,
  wrapperRef,
  resetTrigger,
}: {
  centerLat: number;
  centerLng: number;
  zoom: number;
  focusKey: string;
  provinceBounds: [[number, number], [number, number]];
  shouldFitProvinceOnInit: boolean;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  resetTrigger: number;
}) {
  const map = useMap();
  const prevFocusKeyRef = useRef<string | null>(null);
  const prevResetRef = useRef<number>(0);

  useEffect(() => {
    if (prevFocusKeyRef.current === focusKey) return;
    prevFocusKeyRef.current = focusKey;
    if (shouldFitProvinceOnInit) {
      map.fitBounds(provinceBounds, { padding: [10, 10], animate: false });
      return;
    }
    map.setView([centerLat, centerLng], zoom, { animate: true });
  }, [map, focusKey, centerLat, centerLng, zoom, provinceBounds, shouldFitProvinceOnInit]);

  useEffect(() => {
    if (resetTrigger > prevResetRef.current) {
      prevResetRef.current = resetTrigger;
      map.fitBounds(provinceBounds, { padding: [10, 10], animate: true });
    }
  }, [map, resetTrigger, provinceBounds]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(() => {
      map.invalidateSize();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [map, wrapperRef]);

  return null;
}

export default function NaiFarmMap({
  farms,
  selectedFarmId,
  onSelectFarm,
  userCoords,
  accuracyMeters,
  heightClassName = "h-[460px]",
  zoom = 10,
}: NaiFarmMapProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showOsmTiles, setShowOsmTiles] = useState(false);
  const [statusStore] = useState(
    () => new MapStatusStore(typeof navigator !== "undefined" && navigator.onLine === false),
  );
  const [mapStatus, setMapStatus] = useState<MapStatusSnapshot>(() =>
    statusStore.getSnapshot(),
  );
  const [tileGeneration, setTileGeneration] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [outlineJson, setOutlineJson] = useState<GeoJsonObject | null>(null);
  const [wardsJson, setWardsJson] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    const unsub = statusStore.subscribe(setMapStatus);
    const onOffline = () => {
      if (showOsmTiles) statusStore.recordTileError();
    };
    const onOnline = () => statusStore.reset();
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      unsub();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [statusStore, showOsmTiles]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch("/geo/dong-nai-province.json").then((r) => (r.ok ? r.json() : null)),
      fetch("/geo/dong-nai-wards.json").then((r) => (r.ok ? r.json() : null)),
    ]).then(([outlineRes, wardsRes]) => {
      if (!active) return;
      if (outlineRes.status === "fulfilled" && outlineRes.value) {
        setOutlineJson(outlineRes.value as GeoJsonObject);
      }
      if (wardsRes.status === "fulfilled" && wardsRes.value) {
        setWardsJson(wardsRes.value as GeoJsonObject);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const inverseMask = useMemo(() => buildInverseWorldMask(outlineJson), [outlineJson]);
  const provinceBounds = useMemo(
    () => computeGeoBounds(outlineJson) ?? DONG_NAI_FIT_BOUNDS,
    [outlineJson],
  );
  const maxBounds = useMemo<LatLngBoundsExpression>(() => {
    const [[minLat, minLng], [maxLat, maxLng]] = provinceBounds;
    return [
      [minLat - 0.14, minLng - 0.14],
      [maxLat + 0.14, maxLng + 0.14],
    ];
  }, [provinceBounds]);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  // Never pan outside Dong Nai bounds if visitor GPS is outside Dong Nai
  const isOutsideDongNai = Boolean(userCoords && !isWithinDongNaiApproxBounds(userCoords));
  const safeUserCenter =
    userCoords && isWithinDongNaiApproxBounds(userCoords) ? userCoords : null;

  const centerLat = safeUserCenter
    ? safeUserCenter.lat
    : selectedFarm && isWithinDongNaiApproxBounds(selectedFarm.coordinates)
    ? selectedFarm.coordinates.lat
    : 10.955;
  const centerLng = safeUserCenter
    ? safeUserCenter.lng
    : selectedFarm && isWithinDongNaiApproxBounds(selectedFarm.coordinates)
    ? selectedFarm.coordinates.lng
    : 107.125;

  const focusKey = safeUserCenter
    ? `gps:${safeUserCenter.lat.toFixed(4)}:${safeUserCenter.lng.toFixed(4)}:${zoom}`
    : selectedFarmId && selectedFarm
    ? `farm:${selectedFarm.id}:${zoom}`
    : `province:${zoom}:${outlineJson ? "loaded" : "init"}`;

  const shouldFitProvinceOnInit = !safeUserCenter && !selectedFarmId;
  const showOsmNotice =
    showOsmTiles && mapStatus.state !== "healthy" && !mapStatus.dismissedNotice;

  return (
    <div className="space-y-2.5">
      {isOutsideDongNai ? (
        <div
          role="status"
          data-testid="map-outside-bounds-notice"
          className="rounded-[12px] border border-[#D7A34D]/70 bg-[#FFF8E7] px-3.5 py-2 text-xs text-[#664108]"
        >
          {isEn
            ? "Your GPS coordinates sit outside Dong Nai — the map stays anchored to Dong Nai's 95 administrative units."
            : "Tọa độ GPS hiện tại nằm ngoài ranh giới Đồng Nai — bản đồ vẫn giữ nguyên phạm vi 95 đơn vị hành chính Đồng Nai."}
        </div>
      ) : null}

      {showOsmNotice ? (
        <MapErrorState
          onRetry={() => {
            statusStore.reset();
            setTileGeneration((g) => g + 1);
          }}
          onDismiss={() => {
            statusStore.dismiss();
            setShowOsmTiles(false);
          }}
        />
      ) : null}

      <div
        ref={wrapperRef}
        className={`relative w-full overflow-hidden rounded-[16px] border border-[#D6DED2] bg-[#F2F4EC] ${heightClassName}`}
      >
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          minZoom={8}
          maxZoom={17}
          maxBounds={maxBounds || DONG_NAI_MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          className="z-10 h-full w-full"
        >
          {showOsmTiles ? (
            <TileLayer
              key={`osm-${tileGeneration}`}
              noWrap
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                tileerror: () => statusStore.recordTileError(),
                load: () => statusStore.recordTileLoad(),
              }}
            />
          ) : null}

          {/* Local Dong Nai 2D GeoJSON Vector Layers (default offline-first rendering) */}
          {inverseMask ? (
            <GeoJSON
              key="dn-mask"
              data={inverseMask}
              style={{
                color: "transparent",
                weight: 0,
                fillColor: "#ECEAE0",
                fillOpacity: 0.72,
                interactive: false,
              }}
            />
          ) : null}

          {wardsJson ? (
            <GeoJSON
              key="dn-wards"
              data={wardsJson}
              style={{
                color: "#245B3D",
                weight: 1,
                opacity: 0.48,
                fillColor: "#E4ECE0",
                fillOpacity: showOsmTiles && mapStatus.state === "healthy" ? 0.14 : 0.48,
              }}
              onEachFeature={(feature, layer) => {
                const props = feature.properties as { fullName?: string; code?: string } | undefined;
                if (props?.fullName) {
                  layer.bindTooltip(
                    props.code ? `${props.fullName} (${props.code})` : props.fullName,
                    { sticky: true },
                  );
                }
              }}
            />
          ) : null}

          {outlineJson ? (
            <GeoJSON
              key="dn-outline"
              data={outlineJson}
              style={{
                color: "#19472E",
                weight: 2.5,
                opacity: 0.92,
                fill: false,
                interactive: false,
              }}
            />
          ) : null}

          <MapViewportSync
            centerLat={centerLat}
            centerLng={centerLng}
            zoom={zoom}
            focusKey={focusKey}
            provinceBounds={provinceBounds}
            shouldFitProvinceOnInit={shouldFitProvinceOnInit}
            wrapperRef={wrapperRef}
            resetTrigger={resetTrigger}
          />
          <MapMarkers
            farms={farms}
            selectedFarmId={selectedFarm?.id}
            onSelectFarm={onSelectFarm}
            userCoords={userCoords}
            accuracyMeters={accuracyMeters}
          />
        </MapContainer>

        <div className="absolute top-3 right-3 z-20 flex max-w-[calc(100%-3.75rem)] flex-wrap items-center justify-end gap-1.5">
          <span className="pointer-events-none hidden rounded-full border border-[#D6DED2] bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#25352B] shadow-sm sm:inline-flex">
            {isEn ? "Dong Nai 2D Vector (95 units)" : "Bản đồ vector Đồng Nai (95 ĐVHC)"}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !showOsmTiles;
              setShowOsmTiles(next);
              if (next) statusStore.reset();
            }}
            aria-pressed={showOsmTiles}
            className={`inline-flex min-h-[28px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm cursor-pointer ${
              showOsmTiles
                ? "border-[#245B3D] bg-[#245B3D] text-white"
                : "border-[#D6DED2] bg-white/95 text-[#25352B] hover:bg-[#EAF0E5]"
            }`}
          >
            <Layers className="h-3 w-3" aria-hidden="true" />
            <span>
              {showOsmTiles
                ? isEn
                  ? "Hide OSM layer"
                  : "Ẩn nền OSM"
                : isEn
                  ? "OSM Street Layer"
                  : "Nền đường OSM"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setResetTrigger((n) => n + 1)}
            className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-[#245B3D]/40 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#245B3D] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            <LocateFixed className="h-3 w-3" aria-hidden="true" />
            <span>{isEn ? "Reset Dong Nai" : "Toàn cảnh Đồng Nai"}</span>
          </button>
        </div>

        {/* Honest GIS boundary transparency pill */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-20 max-w-[calc(100%-5rem)] rounded-full border border-[#D7A34D]/60 bg-[#FFF8E7]/95 px-2.5 py-1 text-[10.5px] font-semibold text-[#664108] shadow-xs">
          {isEn
            ? "95/95 MIT community reference · 0/95 official legal GIS"
            : "95/95 đa giác tham khảo cộng đồng (MIT) · 0/95 ranh giới pháp lý"}
        </div>
      </div>
    </div>
  );
}
