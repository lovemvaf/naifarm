"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Compass, Layers, LocateFixed, Minus, Plus } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { isWithinDongNaiApproxBounds, type LatLngPoint } from "@/lib/geography/distance";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";
import type { Farm } from "@/types/naifarm";

const LeafletFallbackMap = dynamic(() => import("./NaiFarmLeafletFallback"), {
  ssr: false,
});

export interface NaiFarmMapProps {
  farms: Farm[];
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  userCoords?: LatLngPoint | null;
  accuracyMeters?: number | null;
  heightClassName?: string;
  zoom?: number;
}

type BasemapMode = "liberty" | "bright" | "positron" | "osm_raster" | "local_vector";

// Post-merger Dong Nai 95-unit verified WGS84 bounds ([lng, lat]) from public/geo/dong-nai-outline.json
const DEFAULT_DONG_NAI_BOUNDS: [[number, number], [number, number]] = [
  [106.4116, 10.5791],
  [107.5777, 12.2984],
];

const DEFAULT_DONG_NAI_CENTER: [number, number] = [107.01, 11.38];

const OSM_RASTER_STYLE = {
  version: 8 as const,
  sources: {
    "osm-raster-source": {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-raster-base-layer",
      type: "raster" as const,
      source: "osm-raster-source",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const LOCAL_OFFLINE_VECTOR_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [
    {
      id: "offline-bg",
      type: "background" as const,
      paint: { "background-color": "#EFECE0" },
    },
  ],
};

const OPEN_FREE_MAP_STYLES: Record<
  BasemapMode,
  { vi: string; en: string; style: string | Record<string, unknown> }
> = {
  liberty: {
    vi: "Tiêu chuẩn",
    en: "Liberty",
    style: "https://tiles.openfreemap.org/styles/liberty",
  },
  bright: {
    vi: "Sắc nét",
    en: "Bright",
    style: "https://tiles.openfreemap.org/styles/bright",
  },
  positron: {
    vi: "Tối giản",
    en: "Positron",
    style: "https://tiles.openfreemap.org/styles/positron",
  },
  osm_raster: {
    vi: "OSM",
    en: "OSM",
    style: OSM_RASTER_STYLE,
  },
  local_vector: {
    vi: "Vector nội bộ",
    en: "Local Vector",
    style: LOCAL_OFFLINE_VECTOR_STYLE,
  },
};

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function computeLngLatBounds(
  outlineData: FeatureCollection | null,
): [[number, number], [number, number]] {
  if (!outlineData || outlineData.type !== "FeatureCollection") {
    return DEFAULT_DONG_NAI_BOUNDS;
  }
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  const visitRing = (ring: number[][]) => {
    for (const pt of ring) {
      if (pt.length < 2) continue;
      const [lng, lat] = pt;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };

  for (const feat of outlineData.features) {
    const geom = feat.geometry as Polygon | MultiPolygon | null;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach(visitRing);
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) => poly.forEach(visitRing));
    }
  }

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) {
    return DEFAULT_DONG_NAI_BOUNDS;
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function buildInverseWorldMask(outlineData: FeatureCollection | null): Feature<Polygon> | null {
  if (!outlineData || outlineData.type !== "FeatureCollection") return null;
  const holes: number[][][] = [];
  for (const feat of outlineData.features) {
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
  return {
    type: "Feature",
    properties: { id: "dong-nai-inverse-mask" },
    geometry: {
      type: "Polygon",
      coordinates: [worldRing, ...holes],
    },
  };
}

/**
 * CropNet-extracted MapLibre GL JS + OpenFreeMap Vector GIS Module,
 * adapted to NaiFarm V9 design tokens and post-merger 95-unit Dong Nai GeoJSON.
 * Falls back cleanly to local Leaflet 2D vector map when WebGL is unavailable.
 */
export default function NaiFarmMap(props: NaiFarmMapProps) {
  const {
    farms,
    selectedFarmId,
    onSelectFarm,
    userCoords,
    heightClassName = "h-[440px]",
  } = props;

  const { locale } = useLocale();
  const isEn = locale === "en";
  const isEnRef = useRef(isEn);
  useEffect(() => {
    isEnRef.current = isEn;
  }, [isEn]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);
  const userMarkerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const currentBasemapRef = useRef<BasemapMode>("liberty");
  const prevSelectedFarmRef = useRef<string | undefined>(undefined);

  const [webglReady, setWebglReady] = useState<boolean | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [basemap, setBasemap] = useState<BasemapMode>("liberty");
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const [outlineJson, setOutlineJson] = useState<FeatureCollection | null>(null);
  const [wardsJson, setWardsJson] = useState<FeatureCollection | null>(null);

  const outlineRef = useRef<FeatureCollection | null>(null);
  const wardsRef = useRef<FeatureCollection | null>(null);
  const showWardsRef = useRef(showWardBoundaries);

  useEffect(() => {
    showWardsRef.current = showWardBoundaries;
  }, [showWardBoundaries]);

  // Detect WebGL capability safely on client
  useEffect(() => {
    const ok = checkWebGLSupport();
    requestAnimationFrame(() => setWebglReady(ok));
  }, []);

  // Load NaiFarm's verified post-merger 95-unit Dong Nai GeoJSON (MIT community reference)
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch("/geo/dong-nai-outline.json").then((r) => (r.ok ? r.json() : null)),
      fetch("/geo/dong-nai-wards.json").then((r) => (r.ok ? r.json() : null)),
    ]).then(([outlineRes, wardsRes]) => {
      if (!active) return;
      if (outlineRes.status === "fulfilled" && outlineRes.value) {
        const data = outlineRes.value as FeatureCollection;
        outlineRef.current = data;
        setOutlineJson(data);
      }
      if (wardsRes.status === "fulfilled" && wardsRes.value) {
        const data = wardsRes.value as FeatureCollection;
        wardsRef.current = data;
        setWardsJson(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const provinceBounds = useMemo(() => computeLngLatBounds(outlineJson), [outlineJson]);
  const inverseMask = useMemo(() => buildInverseWorldMask(outlineJson), [outlineJson]);
  const inverseMaskRef = useRef<Feature<Polygon> | null>(null);
  useEffect(() => {
    inverseMaskRef.current = inverseMask;
  }, [inverseMask]);

  const applyDongNaiGeoLayers = useCallback((map: import("maplibre-gl").Map) => {
    try {
      const cleanupIds = [
        "dn-outline-line",
        "dn-wards-line",
        "dn-wards-fill",
        "dn-mask-fill",
      ];
      for (const layerId of cleanupIds) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      }
      for (const srcId of ["dn-outline", "dn-wards", "dn-mask"]) {
        if (map.getSource(srcId)) map.removeSource(srcId);
      }

      if (inverseMaskRef.current) {
        map.addSource("dn-mask", {
          type: "geojson",
          data: inverseMaskRef.current,
        });
        map.addLayer({
          id: "dn-mask-fill",
          type: "fill",
          source: "dn-mask",
          paint: {
            "fill-color": "#ECE9DF",
            "fill-opacity": currentBasemapRef.current === "local_vector" ? 0.65 : 0.34,
          },
        });
      }

      if (wardsRef.current) {
        map.addSource("dn-wards", {
          type: "geojson",
          data: wardsRef.current,
        });
        map.addLayer({
          id: "dn-wards-fill",
          type: "fill",
          source: "dn-wards",
          layout: {
            visibility: showWardsRef.current ? "visible" : "none",
          },
          paint: {
            "fill-color": "#6C9C5B",
            "fill-opacity": currentBasemapRef.current === "local_vector" ? 0.24 : 0.12,
          },
        });
        map.addLayer({
          id: "dn-wards-line",
          type: "line",
          source: "dn-wards",
          layout: {
            visibility: showWardsRef.current ? "visible" : "none",
          },
          paint: {
            "line-color": "#245B3D",
            "line-width": 1.05,
            "line-opacity": 0.62,
          },
        });

        map.on("mousemove", "dn-wards-fill", (e) => {
          const propsObj = e.features?.[0]?.properties as
            | { fullName?: string; code?: string }
            | undefined;
          if (propsObj?.fullName) {
            setHoveredWard(
              propsObj.code ? `${propsObj.fullName} (${propsObj.code})` : propsObj.fullName,
            );
          }
        });
        map.on("mouseleave", "dn-wards-fill", () => {
          setHoveredWard(null);
        });
      }

      if (outlineRef.current) {
        map.addSource("dn-outline", {
          type: "geojson",
          data: outlineRef.current,
        });
        map.addLayer({
          id: "dn-outline-line",
          type: "line",
          source: "dn-outline",
          paint: {
            "line-color": "#183D2A",
            "line-width": 2.6,
            "line-opacity": 0.94,
          },
        });
      }
    } catch {
      // Style may still be transitioning; style.load will re-apply cleanly
    }
  }, []);

  // Initialize MapLibre GL JS once when WebGL is supported (NEVER destroyed on VI/EN change!)
  useEffect(() => {
    if (webglReady !== true) return;
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeObs: ResizeObserver | null = null;

    async function initMap() {
      try {
        const mod = await import("maplibre-gl");
        if (!isMounted || !containerRef.current) return;

        // Serve version-matched MapLibre worker from Next.js /public (CropNet production fix)
        const workerUrl = `${window.location.origin}/maplibre-gl-worker.mjs`;
        if (typeof mod.setWorkerUrl === "function") {
          mod.setWorkerUrl(workerUrl);
        }

        const [[minLng, minLat], [maxLng, maxLat]] = DEFAULT_DONG_NAI_BOUNDS;
        const clampedMaxBounds: [[number, number], [number, number]] = [
          [minLng - 0.34, minLat - 0.25],
          [maxLng + 0.34, maxLat + 0.25],
        ];

        const initialMode: BasemapMode =
          typeof navigator !== "undefined" && navigator.onLine === false
            ? "local_vector"
            : "liberty";
        currentBasemapRef.current = initialMode;
        if (initialMode !== "liberty") setBasemap(initialMode);

        const map = new mod.Map({
          container: containerRef.current,
          style: OPEN_FREE_MAP_STYLES[initialMode].style as string | import("maplibre-gl").StyleSpecification,
          center: DEFAULT_DONG_NAI_CENTER,
          zoom: 8.6,
          minZoom: 7.8,
          maxZoom: 17.5,
          maxBounds: clampedMaxBounds,
          attributionControl: false,
        });

        mapRef.current = map;

        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          resizeObs = new ResizeObserver(() => {
            mapRef.current?.resize();
          });
          resizeObs.observe(containerRef.current);
        }

        // CropNet resilience pattern: auto-fallback to OSM raster if OpenFreeMap vector tiles stall
        fallbackTimer = setTimeout(() => {
          if (!isMounted || !mapRef.current) return;
          if (!map.isStyleLoaded() && currentBasemapRef.current === "liberty") {
            currentBasemapRef.current = "osm_raster";
            setBasemap("osm_raster");
            map.setStyle(OSM_RASTER_STYLE);
          }
        }, 6500);

        map.on("load", () => {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          if (!isMounted) return;
          setMapLoaded(true);
          map.resize();
          applyDongNaiGeoLayers(map);
          map.fitBounds(DEFAULT_DONG_NAI_BOUNDS, { padding: 20, duration: 0 });
        });

        map.on("error", (e) => {
          const msg = e?.error?.message || "";
          if (
            msg &&
            (msg.includes("Worker") || msg.includes("pbf") || msg.includes("openfreemap")) &&
            currentBasemapRef.current !== "osm_raster" &&
            currentBasemapRef.current !== "local_vector"
          ) {
            currentBasemapRef.current = "osm_raster";
            setBasemap("osm_raster");
            try {
              map.setStyle(OSM_RASTER_STYLE);
            } catch {
              // ignore
            }
          }
        });
      } catch {
        if (isMounted) setWebglReady(false);
      }
    }

    void initMap();

    return () => {
      isMounted = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (resizeObs) resizeObs.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [webglReady, applyDongNaiGeoLayers]);

  // Apply GeoJSON layers whenever outline/wards finish loading after map load
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (outlineJson || wardsJson) {
      applyDongNaiGeoLayers(mapRef.current);
    }
  }, [outlineJson, wardsJson, mapLoaded, applyDongNaiGeoLayers]);

  // Switch basemap style cleanly while re-attaching Dong Nai 95-unit GeoJSON
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (currentBasemapRef.current === basemap) return;
    currentBasemapRef.current = basemap;
    const map = mapRef.current;
    map.setStyle(
      OPEN_FREE_MAP_STYLES[basemap].style as string | import("maplibre-gl").StyleSpecification,
    );
    map.once("style.load", () => {
      applyDongNaiGeoLayers(map);
    });
  }, [basemap, mapLoaded, applyDongNaiGeoLayers]);

  // Toggle 95-unit ward polygons without reloading style
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const vis = showWardBoundaries ? "visible" : "none";
    try {
      if (map.getLayer("dn-wards-fill")) map.setLayoutProperty("dn-wards-fill", "visibility", vis);
      if (map.getLayer("dn-wards-line")) map.setLayoutProperty("dn-wards-line", "visibility", vis);
    } catch {
      // ignore
    }
  }, [showWardBoundaries, mapLoaded]);

  // Build XSS-safe Popup DOM node (CropNet security pattern — zero innerHTML with untrusted data)
  const createSafeFarmPopup = useCallback(
    (farm: Farm) => {
      const en = isEnRef.current;
      const box = document.createElement("div");
      box.style.fontFamily = "inherit";
      box.style.fontSize = "12px";
      box.style.lineHeight = "1.4";
      box.style.color = "#25352B";
      box.style.minWidth = "210px";
      box.style.maxWidth = "250px";
      box.style.padding = "2px";

      const title = document.createElement("strong");
      title.textContent = en && farm.enName ? farm.enName : farm.name;
      title.style.display = "block";
      title.style.fontSize = "13px";
      title.style.color = "#183D2A";
      box.appendChild(title);

      const unit = document.createElement("div");
      unit.textContent = `${farm.administrativeUnitName} (${farm.administrativeUnitCode}) · ${farm.areaHa} ha`;
      unit.style.fontSize = "11px";
      unit.style.color = "#52645A";
      unit.style.marginTop = "2px";
      box.appendChild(unit);

      const crops = document.createElement("div");
      crops.textContent = farm.mainCrops.slice(0, 3).join(" · ");
      crops.style.fontSize = "11px";
      crops.style.fontWeight = "600";
      crops.style.color = "#245B3D";
      crops.style.marginTop = "5px";
      box.appendChild(crops);

      const link = document.createElement("a");
      link.href = buildLocalizedHref(`/farms/${farm.slug}`, en ? "en" : "vi");
      link.textContent = en ? "View orchard profile →" : "Xem hồ sơ nhà vườn →";
      link.style.display = "inline-block";
      link.style.marginTop = "7px";
      link.style.padding = "5px 10px";
      link.style.borderRadius = "7px";
      link.style.backgroundColor = "#245B3D";
      link.style.color = "#FFFFFF";
      link.style.fontSize = "11px";
      link.style.fontWeight = "600";
      link.style.textDecoration = "none";
      box.appendChild(link);

      return box;
    },
    [],
  );

  // Synchronize CropNet-style Teardrop DOM Markers with filtered NaiFarm orchards
  useEffect(() => {
    let cancelled = false;
    async function syncMarkers() {
      if (!mapRef.current || !mapLoaded) return;
      const mod = await import("maplibre-gl");
      if (cancelled || !mapRef.current) return;

      const map = mapRef.current;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      for (const farm of farms) {
        if (!isWithinDongNaiApproxBounds(farm.coordinates)) continue;
        const isSelected = farm.id === selectedFarmId;
        const isVerified = farm.ocopStatus === "coop_checked_demo";
        const bgColor = isVerified ? "#245B3D" : "#8A530B";
        const badgeText = isVerified ? "OCOP" : "VƯỜN";
        const size = isSelected ? 36 : 30;

        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", farm.name);
        el.dataset.mapMarkerId = farm.id;
        el.style.width = `${size}px`;
        el.style.height = `${size + 8}px`;
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.background = "transparent";
        el.style.border = "none";
        el.style.padding = "0";
        el.style.cursor = "pointer";

        const pin = document.createElement("div");
        pin.style.width = `${size}px`;
        pin.style.height = `${size}px`;
        pin.style.backgroundColor = bgColor;
        pin.style.border = isSelected ? "2.5px solid #F4C465" : "2px solid #FFFFFF";
        pin.style.borderRadius = "50% 50% 50% 0";
        pin.style.transform = "rotate(-45deg)";
        pin.style.display = "flex";
        pin.style.alignItems = "center";
        pin.style.justifyContent = "center";
        pin.style.boxShadow = isSelected
          ? "0 6px 16px rgba(24,61,42,0.42)"
          : "0 3px 8px rgba(24,61,42,0.28)";

        const label = document.createElement("span");
        label.textContent = badgeText;
        label.style.transform = "rotate(45deg)";
        label.style.color = "#FFFFFF";
        label.style.fontSize = isSelected ? "9px" : "8px";
        label.style.fontWeight = "800";
        label.style.letterSpacing = "0.2px";
        pin.appendChild(label);
        el.appendChild(pin);

        const shadow = document.createElement("div");
        shadow.style.width = "6px";
        shadow.style.height = "4px";
        shadow.style.background = "#183D2A";
        shadow.style.opacity = "0.3";
        shadow.style.borderRadius = "50%";
        el.appendChild(shadow);

        const popup = new mod.Popup({
          offset: [0, -(size + 4)],
          closeButton: true,
          maxWidth: "260px",
        }).setDOMContent(createSafeFarmPopup(farm));

        const marker = new mod.Marker({ element: el, anchor: "bottom" })
          .setLngLat([farm.coordinates.lng, farm.coordinates.lat])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener("click", () => {
          onSelectFarm?.(farm.id);
        });

        markersRef.current.push(marker);
      }
    }

    void syncMarkers();
    return () => {
      cancelled = true;
    };
  }, [farms, selectedFarmId, mapLoaded, onSelectFarm, createSafeFarmPopup]);

  // Smooth flyTo when user picks a specific orchard from list
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (!selectedFarmId || prevSelectedFarmRef.current === selectedFarmId) return;
    const isInitialMount = prevSelectedFarmRef.current === undefined;
    prevSelectedFarmRef.current = selectedFarmId;
    if (isInitialMount) return;

    const target = farms.find((f) => f.id === selectedFarmId);
    if (target && isWithinDongNaiApproxBounds(target.coordinates)) {
      mapRef.current.flyTo({
        center: [target.coordinates.lng, target.coordinates.lat],
        zoom: 11.8,
        duration: 850,
        essential: true,
      });
    }
  }, [selectedFarmId, farms, mapLoaded]);

  // Optional user GPS marker (only inside Dong Nai bounds)
  useEffect(() => {
    let cancelled = false;
    async function syncUserGps() {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      if (!mapRef.current || !mapLoaded || !userCoords) return;
      if (!isWithinDongNaiApproxBounds(userCoords)) return;
      const mod = await import("maplibre-gl");
      if (cancelled || !mapRef.current) return;

      const dot = document.createElement("div");
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.backgroundColor = "#1D4ED8";
      dot.style.borderRadius = "50%";
      dot.style.border = "3px solid #FFFFFF";
      dot.style.boxShadow = "0 0 12px rgba(29, 78, 216, 0.7)";

      userMarkerRef.current = new mod.Marker({ element: dot })
        .setLngLat([userCoords.lng, userCoords.lat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({
        center: [userCoords.lng, userCoords.lat],
        zoom: 12.2,
        duration: 850,
      });
    }
    void syncUserGps();
    return () => {
      cancelled = true;
    };
  }, [userCoords, mapLoaded]);

  const handleResetOverview = () => {
    mapRef.current?.fitBounds(provinceBounds, { padding: 20, duration: 750 });
  };

  // Seamless fallback to local Leaflet 2D vector map when device/browser lacks WebGL
  if (webglReady === false) {
    return <LeafletFallbackMap {...props} />;
  }

  const isOutsideDongNai = Boolean(userCoords && !isWithinDongNaiApproxBounds(userCoords));

  return (
    <div className="space-y-2.5" data-gis-engine="maplibre-cropnet">
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

      <div className="overflow-hidden rounded-[18px] border border-[#D6DED2] bg-white shadow-[0_4px_18px_rgba(24,61,42,0.07)]">
        {/* Compact CropNet-Inspired Top Map Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E9DE] bg-[#FAF8F1] px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-[#183D2A]">
              <Compass className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "Dong Nai Vector GIS" : "Bản đồ Vector Đồng Nai"}</span>
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D6DED2] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#25352B]">
              <input
                type="checkbox"
                checked={showWardBoundaries}
                onChange={(e) => setShowWardBoundaries(e.target.checked)}
                className="h-3 w-3 accent-[#245B3D]"
              />
              <span>{isEn ? "95 Wards/Communes" : "95 Phường/Xã"}</span>
            </label>
          </div>

          {/* OpenFreeMap Vector & Raster Style Switcher */}
          <div
            role="group"
            aria-label={isEn ? "Basemap style" : "Chọn lớp bản đồ nền"}
            className="nf-scroll-x flex items-center gap-1 rounded-[9px] border border-[#D6DED2] bg-white p-0.5"
          >
            {(["liberty", "bright", "positron", "osm_raster", "local_vector"] as BasemapMode[]).map(
              (modeKey) => {
                const active = basemap === modeKey;
                return (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => setBasemap(modeKey)}
                    className={cn(
                      "cursor-pointer rounded-[7px] px-2 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors",
                      active
                        ? "bg-[#245B3D] text-white"
                        : "text-[#52645A] hover:bg-[#EAF0E5] hover:text-[#183D2A]",
                    )}
                  >
                    {isEn ? OPEN_FREE_MAP_STYLES[modeKey].en : OPEN_FREE_MAP_STYLES[modeKey].vi}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Main MapLibre Canvas */}
        <div className={`relative w-full bg-[#EFECE0] ${heightClassName}`}>
          <div ref={containerRef} className="h-full w-full" />

          {!mapLoaded ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#FAF8F1]/80 backdrop-blur-[1px]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#245B3D] border-t-transparent" />
              <span className="text-xs font-semibold text-[#245B3D]">
                {isEn
                  ? "Loading Dong Nai MapLibre Vector GIS..."
                  : "Đang tải bản đồ vector MapLibre Đồng Nai..."}
              </span>
            </div>
          ) : null}

          {/* Hovered Ward/Commune Live Chip */}
          {hoveredWard ? (
            <div className="pointer-events-none absolute top-3 left-3 z-20 rounded-full border border-[#245B3D]/35 bg-white/95 px-3 py-1 text-[11px] font-bold text-[#183D2A] shadow-sm">
              {hoveredWard}
            </div>
          ) : null}

          {/* Custom On-Map Controls (Top Right — Zoom + / - / Reset Full Dong Nai) */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn({ duration: 250 })}
              aria-label={isEn ? "Zoom in map" : "Phóng to bản đồ"}
              title={isEn ? "Zoom in" : "Phóng to"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white/95 text-[#183D2A] shadow-sm hover:bg-[#EAF0E5]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut({ duration: 250 })}
              aria-label={isEn ? "Zoom out map" : "Thu nhỏ bản đồ"}
              title={isEn ? "Zoom out" : "Thu nhỏ"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white/95 text-[#183D2A] shadow-sm hover:bg-[#EAF0E5]"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-map-reset="true"
              onClick={handleResetOverview}
              aria-label={isEn ? "Reset Dong Nai overview" : "Toàn cảnh Đồng Nai"}
              title={isEn ? "Reset Dong Nai overview" : "Toàn cảnh Đồng Nai"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#245B3D]/40 bg-white/95 text-[#245B3D] shadow-sm hover:bg-[#EAF0E5]"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Bottom-Left Honest GIS Source & Boundary Disclosure */}
          <div className="pointer-events-none absolute right-3 bottom-2.5 left-3 z-20 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D7A34D]/65 bg-[#FFF8E7]/95 px-2.5 py-1 text-[10.5px] font-semibold text-[#664108] shadow-xs">
              <Layers className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {isEn
                  ? "95/95 MIT community reference · 0/95 official legal GIS"
                  : "95/95 đa giác tham khảo cộng đồng (MIT) · 0/95 ranh giới pháp lý"}
              </span>
            </span>
            <span className="hidden rounded-full border border-[#D6DED2] bg-white/95 px-2 py-0.5 text-[10px] font-medium text-[#25352B] sm:inline-block">
              MapLibre GL · OpenFreeMap / © OSM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
