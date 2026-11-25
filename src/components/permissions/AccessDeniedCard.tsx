"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Primitives";

export function AccessDeniedCard({
  title = "Tác vụ giới hạn phạm vi quyền",
  reason,
}: {
  title?: string;
  reason: string;
}) {
  return (
    <Card className="border-[#D7A34D] bg-[#FFF8E7] p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#80520C]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-[#80520C]">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#5C3D0A]">{reason}</p>
        </div>
      </div>
    </Card>
  );
}
