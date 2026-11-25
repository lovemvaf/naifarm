"use client";

import Image from "next/image";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, CheckCircle2, FileText, MapPin, ShieldCheck, UserCheck } from "lucide-react";
import type { TraceBatch } from "@/types/naifarm";
import { Badge, Card } from "@/components/ui/Primitives";
import { assetUrl } from "@/lib/storage/assets";

export function QrPassportCard({
  batch,
  compact = false,
}: {
  batch: TraceBatch;
  compact?: boolean;
}) {
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const qrValue = `${origin}/trace/${batch.batchCode}`;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-surface-soft px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-primary">Hộ chiếu Nông sản Số</p>
            <h2 className="text-lg font-bold text-foreground">
              Mã lô: <span className="tabular-nums text-primary">{batch.batchCode}</span>
            </h2>
          </div>
          <Badge tone={batch.docStatus.includes("đã đối chiếu") ? "success" : "warning"}>
            {batch.docStatus.includes("đã đối chiếu") ? (
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{batch.docStatus}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[180px_minmax(0,1fr)]">
        {/* High-contrast pure black-on-white QR with 4-module quiet zone per DESIGN.md */}
        <div className="flex flex-col items-center">
          <div className="rounded-[12px] border border-border bg-white p-4">
            <QRCodeSVG
              value={qrValue}
              size={140}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="M"
              marginSize={4}
              title={`Mã QR truy xuất lô ${batch.batchCode}`}
            />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-foreground tabular-nums">
            {batch.batchCode}
          </p>
          <p className="text-center text-[11px] text-muted">QR không chứa PII</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] bg-background p-3">
              <p className="text-xs text-muted">Sản phẩm & Nhà vườn</p>
              <p className="font-semibold text-foreground">{batch.productName}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {batch.farmName} · {batch.region}
              </p>
            </div>
            <div className="rounded-[12px] bg-background p-3">
              <p className="text-xs text-muted">Mốc thời gian lô</p>
              <p className="tabular-nums text-sm font-semibold text-foreground">
                Thu hoạch: {batch.harvestDate}
              </p>
              <p className="tabular-nums text-xs text-muted">Đóng gói: {batch.packDate}</p>
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-warning-bg/55 px-3.5 py-2.5 text-xs text-foreground">
            <span className="font-semibold">Mức độ xác minh: </span>
            {batch.declarationLevel}. Dữ liệu tự khai được tách biệt rõ khỏi chứng nhận pháp lý OCOP.
          </div>

          {!compact ? (
            <div className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Nhật ký mùa vụ theo chặng ({batch.events.length} mốc)</span>
              </h3>
              <ol className="relative space-y-4 border-l-2 border-border pl-5">
                {batch.events.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary"
                    />
                    <div className="rounded-[12px] border border-border bg-white p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="tabular-nums text-xs font-bold text-primary">
                          {ev.dateLabel}
                        </span>
                        <Badge tone="neutral">
                          <UserCheck className="h-3 w-3" aria-hidden="true" />
                          <span>{ev.sourceDeclaration}</span>
                        </Badge>
                      </div>
                      <p className="mt-1 font-semibold text-foreground">{ev.title}</p>
                      <p className="mt-1 text-sm text-muted">{ev.detail}</p>
                      <p className="mt-1.5 text-xs font-medium text-muted">
                        Chủ thể ghi nhận: {ev.actorCategory}
                      </p>
                      {ev.photo ? (
                        <Image
                          src={assetUrl(ev.photo)}
                          alt={ev.title}
                          className="mt-2.5 h-32 w-full max-w-[240px] rounded-[10px] border border-border object-cover"
                          width={512}
                          height={279}
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <Link
              href={`/trace/${batch.batchCode}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Mở đầy đủ Hộ chiếu Nông sản & Nhật ký {batch.batchCode}</span>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
