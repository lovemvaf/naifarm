"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { isWithinDongNaiApproxBounds, type LatLngPoint } from "@/lib/geography/distance";
import type { GpsStatus } from "./MapControls";
import type { NaiFarmMapProps } from "./NaiFarmMap";

const DynamicLeafletMap = dynamic(() => import("./NaiFarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] w-full items-center justify-center rounded-[16px] border border-[#D6DED2] bg-[#EAF0E5]/70 text-xs font-medium text-[#52645A]">
      Đang tải bản đồ OpenStreetMap Thành phố Đồng Nai...
    </div>
  ),
});

export function NaiFarmMapHost(props: NaiFarmMapProps) {
  return <DynamicLeafletMap {...props} />;
}

/**
 * React hook for explicit, privacy-respecting browser Geolocation API calls.
 * Never auto-runs on page mount and never writes GPS coordinates to localStorage.
 */
export function useBrowserGeolocation() {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [userCoords, setUserCoords] = useState<LatLngPoint | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [outsideDongNai, setOutsideDongNai] = useState(false);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    const isLocalHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalHost) {
      setGpsStatus("insecure");
      return;
    }
    if (!("geolocation" in navigator)) {
      setGpsStatus("unsupported");
      return;
    }

    setGpsStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLngPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setAccuracyMeters(pos.coords.accuracy);
        setOutsideDongNai(!isWithinDongNaiApproxBounds(coords));
        setGpsStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus("denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsStatus("unavailable");
        } else if (err.code === err.TIMEOUT) {
          setGpsStatus("timeout");
        } else {
          setGpsStatus("unavailable");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const clearLocation = useCallback(() => {
    setUserCoords(null);
    setAccuracyMeters(null);
    setOutsideDongNai(false);
    setGpsStatus("idle");
  }, []);

  return {
    gpsStatus,
    userCoords,
    accuracyMeters,
    outsideDongNai,
    requestLocation,
    clearLocation,
  };
}
