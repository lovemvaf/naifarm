"use client";

import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface MapErrorStateProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function MapErrorState({
  message,
  onRetry,
  onDismiss,
}: MapErrorStateProps) {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const resolvedMessage =
    message ??
    (isEn
      ? "Basemap tiles temporarily unavailable. Displaying local 2D Dong Nai vector boundaries (95 wards & communes) — all orchard markers and filters remain active."
      : "Bản đồ nền OSM đang ngoại tuyến hoặc giới hạn tải tạm thời. Hệ thống đã chuyển sang lớp ranh giới 2D Đồng Nai cục bộ (95 phường/xã) — toàn bộ điểm vườn và bộ lọc vẫn hoạt động đầy đủ.");

  return (
    <div
      role="status"
      data-testid="map-basemap-fallback-banner"
      className="flex flex-wrap items-center justify-between gap-2.5 rounded-[12px] border border-[#D7A34D] bg-[#FFF8E7] px-3.5 py-2.5 text-xs text-[#25352B]"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#80520C]" aria-hidden="true" />
        <span>{resolvedMessage}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#80520C]/30 bg-white px-2.5 font-semibold text-[#80520C] hover:bg-[#FAF8F1] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEn ? "Retry tiles" : "Thử tải lại nền"}</span>
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t.nav.closeButton}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D6DED2] bg-white text-[#52645A] hover:bg-[#FAF8F1] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
