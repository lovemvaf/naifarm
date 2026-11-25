"use client";

import "leaflet/dist/leaflet.css";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Tooltip, useMap } from "react-leaflet";
import type { AdminUnit, Farm } from "@/types/naifarm";

type GeoData = { type: string; features: unknown[] };

const PROVINCE_STYLE = {
  color: "#19472E",
  weight: 2.5,
  fillColor: "#EAF0E5",
  fillOpacity: 0.25,
};

const WARD_STYLE = {
  color: "#245B3D",
  weight: 1.2,
  fillColor: "#9DBE8E",
  fillOpacity: 0.22,
};

function FitProvince({ data }: { data: GeoData | null }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    const layer = L.geoJSON(data as never);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [16, 16] });
    }
  }, [data, map]);

  return null;
}

function FocusFarm({ farm }: { farm?: Farm }) {
  const map = useMap();

  useEffect(() => {
    if (!farm) return;
    map.flyTo([farm.lat, farm.lng], 11, { duration: 0.8 });
  }, [farm, map]);

  return null;
}

export function DongNaiMap({
  farms,
  units,
  selectedFarmId,
  onSelectFarm,
}: {
  farms: Farm[];
  units: AdminUnit[];
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
}) {
  const [province, setProvince] = useState<GeoData | null>(null);
  const [wards, setWards] = useState<GeoData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/geo/dong-nai-province.json").then((res) => res.json()),
      fetch("/geo/dong-nai-wards.json").then((res) => res.json()),
    ])
      .then(([provinceData, wardData]) => {
        if (!alive) return;
        setProvince(provinceData as GeoData);
        setWards(wardData as GeoData);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId);

  return (
    <div className="relative h-full w-full bg-[#F5F3E9]">
      <MapContainer
        center={[10.95, 107.1]}
        zoom={10}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        preferCanvas
      >
        {province ? (
          <GeoJSON data={province as never} style={PROVINCE_STYLE as never} />
        ) : null}
        {wards ? <GeoJSON data={wards as never} style={WARD_STYLE as never} /> : null}

        {units.map((unit) => (
          <CircleMarker
            key={unit.code}
            center={[unit.lat, unit.lng]}
            radius={4}
            pathOptions={{ color: "#245B3D", fillColor: "#245B3D", fillOpacity: 0.85, weight: 1 }}
          >
            <Tooltip direction="center" permanent opacity={0.9} className="naifarm-unit-label">
              {unit.fullName}
            </Tooltip>
          </CircleMarker>
        ))}

        {farms.map((farm) => {
          const active = farm.id === selectedFarmId;
          return (
            <CircleMarker
              key={farm.id}
              center={[farm.lat, farm.lng]}
              radius={active ? 11 : 8}
              pathOptions={{
                color: active ? "#9A6B1F" : "#245B3D",
                fillColor: active ? "#E9B44C" : "#3E7B57",
                fillOpacity: 0.95,
                weight: active ? 3 : 2,
              }}
              eventHandlers={{ click: () => onSelectFarm(farm.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <span className="font-semibold">{farm.name}</span>
                <br />
                <span>{farm.region}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}

        <FitProvince data={province} />
        <FocusFarm farm={selectedFarm} />
      </MapContainer>

      {loadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-soft/90 px-6 text-center text-sm text-muted">
          Không tải được dữ liệu bản đồ GeoJSON. Vui lòng tải lại trang.
        </div>
      ) : null}
    </div>
  );
}