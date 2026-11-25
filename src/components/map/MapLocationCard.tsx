"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { formatStraightLineDistanceVi } from "@/lib/geography/distance";
import type { Farm } from "@/types/naifarm";

interface MapLocationCardProps {
  farm: Farm;
  distanceKm?: number | null;
}

export function MapLocationCard({ farm, distanceKm }: MapLocationCardProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
            {farm.administrativeUnitName} ({farm.administrativeUnitCode})
          </Badge>
          <span className="tabular-nums text-xs text-[#52645A]">
            Vị trí gần đúng theo vùng ({farm.coordinates.latLabel} · {farm.coordinates.lngLabel})
          </span>
        </div>

        {distanceKm !== undefined && distanceKm !== null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F2F8] px-2.5 py-0.5 text-xs font-bold text-[#245B78]">
            <Navigation className="h-3 w-3" aria-hidden="true" />
            <span>{formatStraightLineDistanceVi(distanceKm)}</span>
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#25352B]">{farm.name}</h3>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#52645A]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <span>{farm.addressLabel}</span>
          </p>
        </div>

        <Link
          href={`/farms/${farm.slug}`}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
        >
          <span>Xem hồ sơ nhà vườn</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
