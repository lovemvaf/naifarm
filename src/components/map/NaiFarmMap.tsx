"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { MapErrorState } from "./MapErrorState";
import { MapMarkers } from "./MapMarkers";
import type { LatLngPoint } from "@/lib/geography/distance";
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

function MapViewportSync({
  center,
  zoom,
  wrapperRef,
}: {
  center: [number, number];
  zoom: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tileError, setTileError] = useState(false);
  const [tileGeneration, setTileGeneration] = useState(0);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const center: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lng]
    : selectedFarm
    ? [selectedFarm.coordinates.lat, selectedFarm.coordinates.lng]
    : [10.955, 107.125];

  return (
    <div className="space-y-2.5">
      {tileError ? (
        <MapErrorState
          onRetry={() => {
            setTileError(false);
            setTileGeneration((g) => g + 1);
          }}
        />
      ) : null}

      <div
        ref={wrapperRef}
        className={`relative w-full overflow-hidden rounded-[16px] border border-[#D6DED2] bg-[#EAF0E5] ${heightClassName}`}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="h-full w-full z-10"
        >
          <TileLayer
            key={`osm-${tileGeneration}`}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTileError(true),
            }}
          />
          <MapViewportSync center={center} zoom={zoom} wrapperRef={wrapperRef} />
          <MapMarkers
            farms={farms}
            selectedFarmId={selectedFarm?.id}
            onSelectFarm={onSelectFarm}
            userCoords={userCoords}
            accuracyMeters={accuracyMeters}
          />
        </MapContainer>

        <div className="pointer-events-none absolute top-3 right-3 z-20 rounded-full border border-[#D6DED2] bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#25352B] shadow-sm">
          Vị trí gần đúng theo vùng
        </div>
      </div>
    </div>
  );
}
