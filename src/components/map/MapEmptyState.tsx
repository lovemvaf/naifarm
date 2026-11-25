"use client";

import React from "react";
import { Compass, RotateCcw } from "lucide-react";

interface MapEmptyStateProps {
  onResetFilters: () => void;
}

export function MapEmptyState({ onResetFilters }: MapEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D6DED2] bg-white px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-[#25352B]">Không tìm thấy nhà vườn khớp bộ lọc</h3>
      <p className="mt-1 max-w-md text-xs text-[#52645A]">
        Hãy thử đổi khu vực hoặc xóa bộ lọc tên Phường/Xã để xem đầy đủ 24 điểm vườn minh họa trên
        Thành phố Đồng Nai.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Đặt lại bộ lọc</span>
      </button>
    </div>
  );
}
