"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileText,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { buildTraceUrl } from "@/lib/qr/trace-url";
import { Badge, Card } from "@/components/ui/Primitives";
import type { TraceBatch } from "@/types/naifarm";

export function QrPassportCard({
  batch,
  compact = false,
}: {
  batch: TraceBatch;
  compact?: boolean;
}) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const traceUrl = buildTraceUrl(
    batch.batchCode,
    typeof window !== "undefined" ? window.location.origin : undefined,
  );

  useEffect(() => {
    let active = true;
    async function generateRealQr() {
      try {
        const [svg, png] = await Promise.all([
          QRCode.toString(traceUrl, {
            type: "svg",
            errorCorrectionLevel: "M",
            margin: 4,
            width: 168,
            color: { dark: "#000000", light: "#FFFFFF" },
          }),
          QRCode.toDataURL(traceUrl, {
            errorCorrectionLevel: "M",
            margin: 4,
            width: 480,
            color: { dark: "#000000", light: "#FFFFFF" },
          }),
        ]);
        if (active) {
          setSvgMarkup(svg);
          setPngDataUrl(png);
        }
      } catch {
        // Ignore transient QR render failure
      }
    }
    void generateRealQr();
    return () => {
      active = false;
    };
  }, [traceUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(traceUrl);
      setCopied(true);
      toast.success("Đã sao chép liên kết truy xuất QR.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(`Liên kết truy xuất: ${traceUrl}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#D6DED2] bg-[#EAF0E5] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#245B3D]">Hộ chiếu Nông sản Số (Demo)</p>
            <h2 className="text-lg font-bold text-[#25352B]">
              Mã lô: <span className="tabular-nums text-[#245B3D]">{batch.batchCode}</span>
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

      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex flex-col items-center">
          <div className="flex h-[176px] w-[176px] items-center justify-center rounded-[12px] border border-[#D6DED2] bg-white p-2">
            {svgMarkup ? (
              <div
                aria-label={`Mã QR thật truy xuất lô ${batch.batchCode}`}
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            ) : (
              <QrCode className="h-12 w-12 text-[#52645A]" aria-hidden="true" />
            )}
          </div>
          <p className="mt-2 text-center text-xs font-bold text-[#25352B] tabular-nums">
            {batch.batchCode}
          </p>
          <p className="text-center text-[11px] text-[#52645A]">
            QR chuẩn ISO/IEC 18004 · Không chứa PII
          </p>

          <div className="mt-3 flex w-full flex-col gap-1.5">
            {pngDataUrl ? (
              <a
                href={pngDataUrl}
                download={`QR-${batch.batchCode}.png`}
                className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border border-[#245B3D] bg-white px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tải QR PNG</span>
              </a>
            ) : null}

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg border border-[#D6DED2] bg-[#FAF8F1] px-2 text-[11px] font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
              >
                {copied ? <Check className="h-3 w-3 text-[#245B3D]" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg border border-[#D6DED2] bg-[#FAF8F1] px-2 text-[11px] font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
              >
                <Printer className="h-3 w-3" aria-hidden="true" />
                <span>In tem</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] bg-[#F5F3E9] p-3">
              <p className="text-xs text-[#52645A]">Sản phẩm &amp; Nhà vườn</p>
              <p className="font-semibold text-[#25352B]">{batch.productName}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#52645A]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
                <span>
                  {batch.farmName} · {batch.administrativeUnitName} ({batch.administrativeUnitCode})
                </span>
              </p>
            </div>
            <div className="rounded-[12px] bg-[#F5F3E9] p-3">
              <p className="text-xs text-[#52645A]">Mốc thời gian lô (Demo)</p>
              <p className="tabular-nums text-sm font-semibold text-[#25352B]">
                Thu hoạch: {batch.harvestDate}
              </p>
              <p className="tabular-nums text-xs text-[#52645A]">Đóng gói: {batch.packDate}</p>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#D6DED2] bg-[#FFF2D8]/55 px-3.5 py-2.5 text-xs text-[#25352B]">
            <span className="font-semibold">Mức độ xác minh: </span>
            {batch.declarationLevel}. Mã QR truy xuất công khai tách biệt hoàn toàn với giấy chứng
            nhận VietGAP/OCOP pháp lý.
          </div>

          {!compact ? (
            <div className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
                <FileText className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Nhật ký theo chặng trên tem lô ({batch.events.length} mốc)</span>
              </h3>
              <ol className="relative space-y-4 border-l-2 border-[#D6DED2] pl-5">
                {batch.events.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#245B3D]"
                    />
                    <div className="rounded-[12px] border border-[#D6DED2] bg-white p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="tabular-nums text-xs font-bold text-[#245B3D]">
                          {ev.dateLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F3E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#25352B]">
                          <UserCheck className="h-3 w-3 text-[#245B3D]" aria-hidden="true" />
                          {ev.sourceDeclaration}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-[#25352B]">{ev.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#52645A]">{ev.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={`/trace/${batch.batchCode}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] underline"
              >
                Mở trang Hộ chiếu QR đầy đủ ({batch.events.length} chặng) →
              </Link>
              <Link
                href="/trace/scan"
                className="text-xs font-semibold text-[#52645A] hover:text-[#245B3D] hover:underline"
              >
                Quét mã khác
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
