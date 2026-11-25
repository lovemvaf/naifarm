"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeAdminUnitName } from "@/lib/i18n/domain-en";

export function ScopeSelector({
  label,
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { activeScopeUnitCode, setActiveScopeUnitCode } = useDemoStore();
  const resolvedLabel =
    label ?? (isEn ? "Dong Nai working area" : "Phạm vi địa bàn làm việc");

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-wrap items-center justify-between gap-3"}>
      <label
        htmlFor="scope-unit-select"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52645A]"
      >
        <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
        <span>{resolvedLabel}:</span>
      </label>
      <select
        id="scope-unit-select"
        value={activeScopeUnitCode}
        onChange={(e) => setActiveScopeUnitCode(e.target.value)}
        className="min-h-[38px] max-w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs font-semibold text-[#25352B]"
      >
        <option value="ALL">
          {isEn
            ? "All of Dong Nai City (95 wards & communes)"
            : "Toàn Thành phố Đồng Nai (95 xã/phường)"}
        </option>
        {ADMINISTRATIVE_UNITS.map((u) => (
          <option key={u.maDvhc} value={u.maDvhc}>
            {localizeAdminUnitName(u.tenDayDu, u.maDvhc, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
