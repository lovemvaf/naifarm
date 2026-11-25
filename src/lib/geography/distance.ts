import distance from "@turf/distance";
import { point } from "@turf/helpers";

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Calculates straight-line ("đường chim bay") distance in kilometers using Turf.js
 * over WGS84 geographic coordinates. Never claims road-routing distance.
 */
export function calculateStraightLineDistanceKm(from: LatLngPoint, to: LatLngPoint): number {
  const km = distance(point([from.lng, from.lat]), point([to.lng, to.lat]), {
    units: "kilometers",
  });
  return Math.round(km * 10) / 10;
}

export function formatStraightLineDistanceVi(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "Chưa xác định";
  if (km < 1) {
    return `${Math.round(km * 1000)} m (đường chim bay)`;
  }
  return `${km.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km (đường chim bay)`;
}

/**
 * Approximate bounding box covering Thành phố Đồng Nai (merged northern & southern extent)
 * for showing an honest UI banner when user GPS is outside Dong Nai.
 */
export const DONG_NAI_APPROX_BOUNDS = {
  minLat: 10.52,
  maxLat: 12.35,
  minLng: 106.42,
  maxLng: 107.62,
} as const;

export function isWithinDongNaiApproxBounds(coords: LatLngPoint): boolean {
  return (
    coords.lat >= DONG_NAI_APPROX_BOUNDS.minLat &&
    coords.lat <= DONG_NAI_APPROX_BOUNDS.maxLat &&
    coords.lng >= DONG_NAI_APPROX_BOUNDS.minLng &&
    coords.lng <= DONG_NAI_APPROX_BOUNDS.maxLng
  );
}
