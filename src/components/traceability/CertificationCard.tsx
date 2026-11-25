"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, FileWarning, ShieldCheck, ShieldOff } from "lucide-react";
import { Badge, Card } from "@/components/ui/Primitives";
import type { CertificationStatus, FarmCertification } from "@/types/naifarm";

const STATUS_BADGE_MAP: Record<
  CertificationStatus,
  { tone: "success" | "warning" | "danger" | "info" | "neutral"; icon: typeof ShieldCheck }
> = {
  coop_checked_demo: { tone: "success", icon: ShieldCheck },
  vietgap_declared_demo: { tone: "info", icon: CheckCircle2 },
  ocop_declared_demo: { tone: "info", icon: CheckCircle2 },
  pending_review: { tone: "warning", icon: Clock },
  needs_revision: { tone: "danger", icon: FileWarning },
  expired_demo: { tone: "danger", icon: AlertCircle },
  unverified: { tone: "neutral", icon: ShieldOff },
};

export function CertificationCard({ cert }: { cert: FarmCertification }) {
  const cfg = STATUS_BADGE_MAP[cert.status];
  const Icon = cfg.icon;

  return (
    <Card className="flex flex-col justify-between p-4">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md bg-[#EAF0E5] px-2.5 py-1 text-xs font-bold text-[#245B3D]">
            {cert.standardType}
          </span>
          <Badge tone={cfg.tone}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{cert.statusLabel}</span>
          </Badge>
        </div>

        <div>
          <p className="text-xs text-[#52645A]">
            {cert.farmName} · {cert.administrativeUnitName} ({cert.administrativeUnitCode})
          </p>
          <p className="mt-0.5 tabular-nums text-sm font-bold text-[#25352B]">
            Mã hồ sơ mẫu: {cert.certificateCode}
          </p>
          {cert.starLevelLabel ? (
            <p className="mt-1 text-xs font-semibold text-[#80520C]">{cert.starLevelLabel}</p>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-[#52645A]">{cert.scopeSummary}</p>

        <div className="grid grid-cols-2 gap-2 rounded-[10px] bg-[#FAF8F1] p-2.5 text-[11px] text-[#52645A]">
          <div>
            <span className="block text-[10px] uppercase">Ngày ghi nhận</span>
            <strong className="text-[#25352B] tabular-nums">{cert.issuedDateDemo}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Hiệu lực tham khảo</span>
            <strong className="text-[#25352B] tabular-nums">{cert.validUntilDemo}</strong>
          </div>
          <div className="col-span-2 border-t border-[#E6EAE1] pt-1.5">
            <span>Nguồn ghi nhận: </span>
            <strong className="text-[#25352B]">{cert.issuerLabel}</strong>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-[#EAEFE6] pt-2.5">
        <p className="rounded-lg bg-[#FFF2D8]/65 px-2.5 py-1.5 text-[11px] font-medium text-[#80520C]">
          {cert.disclaimer}
        </p>
        {cert.qrBatchCode ? (
          <Link
            href={`/trace/${encodeURIComponent(cert.qrBatchCode)}`}
            className="inline-block text-xs font-semibold text-[#245B3D] hover:underline"
          >
            Xem hộ chiếu QR lô {cert.qrBatchCode} →
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
