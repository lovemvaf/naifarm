"use client";

import React from "react";
import { AlertCircle, CheckCircle2, LocateFixed, Navigation, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import type { LatLngPoint } from "@/lib/geography/distance";

export type GpsStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "insecure";

interface MapControlsProps {
  gpsStatus: GpsStatus;
  userCoords: LatLngPoint | null;
  accuracyMeters: number | null;
  outsideDongNai: boolean;
  onRequestLocation: () => void;
  onClearLocation: () => void;
  sortByDistance: boolean;
  onToggleSortByDistance: () => void;
}

export function MapControls({
  gpsStatus,
  userCoords,
  accuracyMeters,
  outsideDongNai,
  onRequestLocation,
  onClearLocation,
  sortByDistance,
  onToggleSortByDistance,
}: MapControlsProps) {
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  const errorMessages: Partial<Record<GpsStatus, string>> = isEn
    ? {
        denied: "Location permission was denied. You can grant location access or pick a ward/commune in the filter above.",
        unavailable: "Location is currently unavailable on this device. You can still browse every orchard in the directory.",
        timeout: "Location lookup timed out. Please try 'Use my location' again.",
        unsupported: "Browser geolocation is not supported on this device.",
        insecure: "Browser geolocation requires a secure HTTPS connection or localhost.",
      }
    : {
        denied:
          "Trình duyệt đang từ chối quyền truy cập vị trí. Hãy cấp quyền vị trí hoặc chọn trực tiếp Phường/Xã trong bộ lọc.",
        unavailable:
          "Thiết bị hiện không xác định được vị trí hiện tại. Bạn vẫn có thể chọn nhà vườn từ danh sách bên trái.",
        timeout: "Hết thời gian chờ tín hiệu vị trí. Hãy thử bấm 'Vị trí của tôi' lại.",
        unsupported: "Trình duyệt hiện tại không hỗ trợ tính năng định vị vị trí.",
        insecure: "Tính năng định vị trên trình duyệt chỉ hoạt động trên kết nối HTTPS an toàn hoặc localhost.",
      };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#D6DED2] bg-white px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={gpsStatus === "requesting"}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#19472E] disabled:opacity-60 cursor-pointer"
          >
            <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {gpsStatus === "requesting"
                ? isEn
                  ? "Locating..."
                  : "Đang lấy vị trí..."
                : t.explore.myLocationBtn}
            </span>
          </button>

          {userCoords ? (
            <>
              <button
                type="button"
                onClick={onToggleSortByDistance}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold transition cursor-pointer ${
                  sortByDistance
                    ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#F5F3E9]"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {sortByDistance
                    ? isEn
                      ? "Sorted by nearest"
                      : "Đang xếp theo gần nhất"
                    : isEn
                    ? "Sort by distance"
                    : "Xếp theo khoảng cách"}
                </span>
              </button>

              <button
                type="button"
                onClick={onClearLocation}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#52645A] hover:bg-[#FDECEC] hover:text-[#A32D2D] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.explore.clearLocationBtn}</span>
              </button>
            </>
          ) : null}
        </div>

        <p className="text-[11px] text-[#52645A]">
          {isEn
            ? "Session-only GPS on click · Never saved or uploaded"
            : "Chỉ đọc GPS tạm thời khi bấm nút · Không lưu hoặc gửi tọa độ lên máy chủ"}
        </p>
      </div>

      {gpsStatus === "granted" && userCoords ? (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-2 rounded-[12px] border px-3.5 py-2 text-xs ${
            outsideDongNai
              ? "border-[#D7A34D] bg-[#FFF2D8] text-[#80520C]"
              : "border-[#245B3D]/30 bg-[#E6F3E9] text-[#24603B]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {outsideDongNai
              ? isEn
                ? `GPS located (${userCoords.lat.toFixed(4)}°N, ${userCoords.lng.toFixed(4)}°E) — ${t.explore.outsideDongNaiNote}`
                : `Đã xác định GPS (${userCoords.lat.toFixed(4)}°B, ${userCoords.lng.toFixed(4)}°Đ) — vị trí nằm ngoài Thành phố Đồng Nai; bản đồ vẫn giữ khung ranh giới Đồng Nai & hiển thị khoảng cách tham khảo.`
              : isEn
              ? `GPS located (${userCoords.lat.toFixed(4)}°N, ${userCoords.lng.toFixed(4)}°E${accuracyMeters ? ` · ±${Math.round(accuracyMeters)}m` : ""}) — showing straight-line estimates.`
              : `Đã xác định vị trí của bạn (${userCoords.lat.toFixed(4)}°B, ${userCoords.lng.toFixed(4)}°Đ${accuracyMeters ? ` · sai số ~${Math.round(accuracyMeters)}m` : ""}) — hiển thị khoảng cách đường chim bay tới các vườn.`}
          </span>
        </div>
      ) : null}

      {errorMessages[gpsStatus] ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[12px] border border-[#A32D2D]/30 bg-[#FDECEC] px-3.5 py-2.5 text-xs text-[#A32D2D]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessages[gpsStatus]}</span>
        </div>
      ) : null}
    </div>
  );
}
