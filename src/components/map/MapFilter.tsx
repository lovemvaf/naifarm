"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/format";
import type { DongNaiZone } from "@/types/naifarm";

export const MAP_ZONES: ("Tất cả" | DongNaiZone)[] = [
  "Tất cả",
  "Tân Triều & Trung tâm",
  "Long Khánh & Lân cận",
  "Xuân Lộc & Đông Nam",
  "Cẩm Mỹ & Định Quán",
  "Bắc Đồng Nai",
];

interface MapFilterProps {
  zone: "Tất cả" | DongNaiZone;
  onZoneChange: (zone: "Tất cả" | DongNaiZone) => void;
  ocopOnly: boolean;
  onToggleOcopOnly: () => void;
  unitQuery: string;
  onUnitQueryChange: (val: string) => void;
  aliasNote?: string | null;
}

export function MapFilter({
  zone,
  onZoneChange,
  ocopOnly,
  onToggleOcopOnly,
  unitQuery,
  onUnitQueryChange,
  aliasNote,
}: MapFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={unitQuery}
            onChange={(e) => onUnitQueryChange(e.target.value)}
            placeholder="Tìm theo tên vườn, phường/xã (vd: Phước Sơn, 26080)..."
            aria-label="Lọc nhà vườn và Phường/Xã Đồng Nai"
            className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-xs text-[#25352B]"
          />
        </div>

        <button
          type="button"
          onClick={onToggleOcopOnly}
          className={cn(
            "min-h-[40px] rounded-full px-4 text-xs font-semibold transition",
            ocopOnly
              ? "bg-[#245B3D] text-white"
              : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
          )}
        >
          {ocopOnly ? "Đang lọc: Đã đối chiếu HTX" : "Chỉ hiện vườn đã đối chiếu HTX"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {MAP_ZONES.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => onZoneChange(z)}
            className={cn(
              "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
              zone === z
                ? "bg-[#245B3D] text-white"
                : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
            )}
          >
            {z}
          </button>
        ))}
      </div>

      {aliasNote ? (
        <p className="rounded-[10px] border border-[#D7A34D]/50 bg-[#FFF2D8] px-3 py-2 text-xs text-[#80520C]">
          <strong>Ánh xạ tên cũ:</strong> {aliasNote}
        </p>
      ) : null}
    </div>
  );
}
