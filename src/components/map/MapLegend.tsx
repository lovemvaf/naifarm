"use client";

import React from "react";

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] px-4 py-2.5 text-xs text-[#52645A]">
      <span className="font-bold text-[#25352B]">Chú giải điểm bản đồ:</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#245B3D] ring-2 ring-[#245B3D]/25" />
        <span>Vườn đối chiếu HTX (Demo)</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#D7A34D] ring-2 ring-[#D7A34D]/25" />
        <span>Vườn tự khai / chờ đối chiếu</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#1D4ED8] ring-2 ring-[#1D4ED8]/25" />
        <span>Vị trí GPS trình duyệt của bạn</span>
      </span>
      <span className="text-[11px] font-medium text-[#80520C]">
        * Tọa độ minh họa vùng sinh thái (0 ranh giới polygon pháp lý bịa đặt)
      </span>
    </div>
  );
}
