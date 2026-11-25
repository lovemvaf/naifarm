"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface MapErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function MapErrorState({
  message = "Không tải được lớp bản đồ OpenStreetMap (có thể do mạng ngoại tuyến hoặc giới hạn tile). Bạn vẫn có thể dùng danh sách 24 nhà vườn & 95 Phường/Xã đầy đủ ở bên cạnh.",
  onRetry,
}: MapErrorStateProps) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D7A34D] bg-[#FFF2D8] px-4 py-3 text-xs text-[#25352B]"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#80520C]" aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#80520C]/30 bg-white px-3 font-semibold text-[#80520C] hover:bg-[#FAF8F1]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Thử tải lại lớp bản đồ</span>
        </button>
      ) : null}
    </div>
  );
}
