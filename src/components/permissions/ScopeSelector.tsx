"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { useDemoStore } from "@/context/DemoStoreContext";

export function ScopeSelector({
  label = "Phạm vi địa bàn làm việc",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const { activeScopeUnitCode, setActiveScopeUnitCode } = useDemoStore();

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-wrap items-center justify-between gap-3"}>
      <label
        htmlFor="scope-unit-select"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52645A]"
      >
        <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
        <span>{label}:</span>
      </label>
      <select
        id="scope-unit-select"
        value={activeScopeUnitCode}
        onChange={(e) => setActiveScopeUnitCode(e.target.value)}
        className="min-h-[38px] max-w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs font-semibold text-[#25352B]"
      >
        <option value="ALL">Toàn tỉnh Đồng Nai (95 xã/phường)</option>
        {ADMINISTRATIVE_UNITS.map((u) => (
          <option key={u.maDvhc} value={u.maDvhc}>
            {u.tenDayDu} ({u.maDvhc})
          </option>
        ))}
      </select>
    </div>
  );
}
