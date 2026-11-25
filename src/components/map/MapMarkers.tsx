"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { Circle, Marker, Popup } from "react-leaflet";
import {
  calculateStraightLineDistanceKm,
  formatStraightLineDistanceVi,
  type LatLngPoint,
} from "@/lib/geography/distance";
import type { Farm } from "@/types/naifarm";

interface MapMarkersProps {
  farms: Farm[];
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  userCoords?: LatLngPoint | null;
  accuracyMeters?: number | null;
}

function buildPinIcon(colorHex: string, selected: boolean) {
  const size = selected ? 34 : 26;
  const ring = selected ? `<circle cx="17" cy="17" r="15" fill="none" stroke="#25352B" stroke-width="2.5" stroke-dasharray="3 2"/>` : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 34">
      ${ring}
      <circle cx="17" cy="17" r="11" fill="${colorHex}" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="17" cy="17" r="4" fill="#FFFFFF"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "naifarm-leaflet-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

function buildUserGpsIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="rgba(29, 78, 216, 0.22)" />
      <circle cx="14" cy="14" r="7" fill="#1D4ED8" stroke="#FFFFFF" stroke-width="2.5" />
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "naifarm-gps-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function MapMarkers({
  farms,
  selectedFarmId,
  onSelectFarm,
  userCoords,
  accuracyMeters,
}: MapMarkersProps) {
  const icons = useMemo(
    () => ({
      verified: buildPinIcon("#245B3D", false),
      verifiedSelected: buildPinIcon("#19472E", true),
      demo: buildPinIcon("#D7A34D", false),
      demoSelected: buildPinIcon("#B67D1E", true),
      gps: buildUserGpsIcon(),
    }),
    [],
  );

  return (
    <>
      {farms.map((farm) => {
        const selected = farm.id === selectedFarmId;
        const verified = farm.ocopStatus === "coop_checked_demo";
        const icon = verified
          ? selected
            ? icons.verifiedSelected
            : icons.verified
          : selected
          ? icons.demoSelected
          : icons.demo;
        const distKm = userCoords
          ? calculateStraightLineDistanceKm(userCoords, {
              lat: farm.coordinates.lat,
              lng: farm.coordinates.lng,
            })
          : null;

        return (
          <Marker
            key={farm.id}
            position={[farm.coordinates.lat, farm.coordinates.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectFarm?.(farm.id),
            }}
          >
            <Popup>
              <div className="min-w-[210px] space-y-1.5 text-xs text-[#25352B]">
                <p className="font-bold text-[#245B3D]">{farm.name}</p>
                <p className="text-[11px] text-[#52645A]">
                  {farm.administrativeUnitName} ({farm.administrativeUnitCode}) · {farm.areaHa} ha
                </p>
                <p className="text-[11px] font-medium text-[#80520C]">
                  {farm.coordinates.note}
                </p>
                {distKm !== null ? (
                  <p className="font-semibold text-[#245B78]">
                    Cách bạn: {formatStraightLineDistanceVi(distKm)}
                  </p>
                ) : null}
                <div className="pt-1">
                  <Link
                    href={`/farms/${farm.slug}`}
                    className="inline-block rounded-md bg-[#245B3D] px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    Xem hồ sơ nhà vườn →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {userCoords ? (
        <>
          <Circle
            center={[userCoords.lat, userCoords.lng]}
            radius={Math.min(accuracyMeters ?? 250, 2000)}
            pathOptions={{ color: "#1D4ED8", fillColor: "#3B82F6", fillOpacity: 0.12, weight: 1.5 }}
          />
          <Marker position={[userCoords.lat, userCoords.lng]} icon={icons.gps}>
            <Popup>
              <div className="text-xs text-[#25352B]">
                <p className="font-bold text-[#1D4ED8]">Vị trí hiện tại của bạn</p>
                <p className="mt-0.5 tabular-nums text-[11px] text-[#52645A]">
                  {userCoords.lat.toFixed(5)}°B, {userCoords.lng.toFixed(5)}°Đ
                </p>
              </div>
            </Popup>
          </Marker>
        </>
      ) : null}
    </>
  );
}
