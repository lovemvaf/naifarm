"use client";

import React from "react";
import { AlertCircle, CheckCircle2, LocateFixed, Navigation, X } from "lucide-react";
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
  const errorMessages: Partial<Record<GpsStatus, string>> = {
    denied:
      "Trình duyệt đang từ chối quyền định vị GPS. Vui lòng cấp quyền vị trí hoặc chọn trực tiếp Phường/Xã trong bộ lọc.",
    unavailable:
      "Thiết bị hiện không xác định được vị trí GPS. Bạn vẫn có thể chọn nhà vườn từ danh sách bên trái.",
    timeout: "Hết thời gian chờ tín hiệu GPS. Vui lòng thử bấm 'Vị trí của tôi' lại.",
    unsupported: "Trình duyệt hiện tại không hỗ trợ Geolocation API.",
    insecure: "Định vị GPS trình duyệt chỉ hoạt động trên kết nối HTTPS an toàn hoặc localhost.",
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#D6DED2] bg-white px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={gpsStatus === "requesting"}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-3.5 text-xs font-semibold text-white hover:bg-[#19472E] disabled:opacity-60"
          >
            <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{gpsStatus === "requesting" ? "Đang lấy vị trí..." : "Vị trí của tôi"}</span>
          </button>

          {userCoords ? (
            <>
              <button
                type="button"
                onClick={onToggleSortByDistance}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold transition ${
                  sortByDistance
                    ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                    : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#F5F3E9]"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{sortByDistance ? "Đang xếp theo gần nhất" : "Xếp theo khoảng cách"}</span>
              </button>

              <button
                type="button"
                onClick={onClearLocation}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#52645A] hover:bg-[#FDECEC] hover:text-[#A32D2D]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tắt GPS</span>
              </button>
            </>
          ) : null}
        </div>

        <p className="text-[11px] text-[#52645A]">
          Chỉ đọc GPS tạm thời khi bấm nút · Không lưu hoặc gửi tọa độ lên máy chủ
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
              ? `Đã xác định GPS (${userCoords.lat.toFixed(4)}°B, ${userCoords.lng.toFixed(4)}°Đ) — vị trí nằm ngoài Thành phố Đồng Nai; khoảng cách hiển thị tính theo đường chim bay tham khảo.`
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
