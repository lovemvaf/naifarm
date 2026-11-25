"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import type { LatLngBoundsExpression } from "leaflet";
import { LocateFixed } from "lucide-react";
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

const DONG_NAI_FIT_BOUNDS: LatLngBoundsExpression = [
  [10.57, 106.40],
  [12.31, 107.59],
];

const DONG_NAI_MAX_BOUNDS: LatLngBoundsExpression = [
  [10.42, 106.25],
  [12.46, 107.76],
];

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
  center,
  zoom,
  wrapperRef,
  resetTrigger,
}: {
  center: [number, number];
  zoom: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  resetTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.fitBounds(DONG_NAI_FIT_BOUNDS, { padding: [16, 16], animate: true });
    }
  }, [map, resetTrigger]);

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
    const onOffline = () => statusStore.recordTileError();
    const onOnline = () => statusStore.reset();
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      unsub();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [statusStore]);

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

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  // Never pan outside Dong Nai bounds if visitor GPS is outside Dong Nai
  const safeUserCenter =
    userCoords && isWithinDongNaiApproxBounds(userCoords) ? userCoords : null;

  const center: [number, number] = safeUserCenter
    ? [safeUserCenter.lat, safeUserCenter.lng]
    : selectedFarm && isWithinDongNaiApproxBounds(selectedFarm.coordinates)
    ? [selectedFarm.coordinates.lat, selectedFarm.coordinates.lng]
    : [10.955, 107.125];

  const showNotice = mapStatus.state !== "healthy" && !mapStatus.dismissedNotice;

  return (
    <div className="space-y-2.5">
      {showNotice ? (
        <MapErrorState
          onRetry={() => {
            statusStore.reset();
            setTileGeneration((g) => g + 1);
          }}
          onDismiss={() => statusStore.dismiss()}
        />
      ) : null}

      <div
        ref={wrapperRef}
        className={`relative w-full overflow-hidden rounded-[16px] border border-[#D6DED2] bg-[#EAF0E5] ${heightClassName}`}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          minZoom={8}
          maxZoom={17}
          maxBounds={DONG_NAI_MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          className="z-10 h-full w-full"
        >
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

          {/* Local Dong Nai 2D GeoJSON Vector Layers (work even when OSM tiles are offline/blocked) */}
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
                opacity: 0.45,
                fillColor: "#EAF0E5",
                fillOpacity: mapStatus.state === "healthy" ? 0.14 : 0.42,
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
                opacity: 0.9,
                fill: false,
                interactive: false,
              }}
            />
          ) : null}

          <MapViewportSync
            center={center}
            zoom={zoom}
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

        <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-2">
          <span className="pointer-events-none rounded-full border border-[#D6DED2] bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#25352B] shadow-sm">
            {isEn ? "Dong Nai 2D Vector + Cluster Pins" : "Ranh giới 2D Đồng Nai · Vị trí gần đúng"}
          </span>
          <button
            type="button"
            onClick={() => setResetTrigger((n) => n + 1)}
            className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-[#245B3D]/40 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#245B3D] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            <LocateFixed className="h-3 w-3" aria-hidden="true" />
            <span>{isEn ? "Reset to Dong Nai" : "Về toàn cảnh Đồng Nai"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
