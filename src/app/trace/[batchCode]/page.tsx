"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Camera, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { ProductionDiaryTimeline } from "@/components/traceability/ProductionDiaryTimeline";
import { NaiFarmMapHost } from "@/components/map/NaiFarmMapHost";
import { Button, Card } from "@/components/ui/Primitives";

export default function TraceBatchDetailPage({
  params,
}: {
  params: Promise<{ batchCode: string }>;
}) {
  const { batchCode } = use(params);
  const router = useRouter();
  const { batches, products, farms, certifications, diaryEntries } = useDemoStore();
  const [manualCode, setManualCode] = useState("");

  const normalized = decodeURIComponent(batchCode).trim().toUpperCase();
  const batch = batches.find((b) => b.batchCode.toUpperCase() === normalized);

  if (!batch) {
    return (
      <div className="mx-auto max-w-[780px] space-y-6 px-4 py-10">
        <Link
          href="/trace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Danh sách mã lô mẫu</span>
        </Link>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-[#A32D2D]" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-[#25352B]">
                Mã QR hoặc mã lô &ldquo;{normalized}&rdquo; chưa tồn tại trong hệ thống demo
              </h1>
              <p className="mt-1 text-sm text-[#52645A]">
                Vui lòng kiểm tra lại tem hoặc nhập trực tiếp một trong các mã lô demo hợp lệ:
                <strong className="mx-1 text-[#245B3D]">NF-DEMO-001</strong>,
                <strong className="mx-1 text-[#245B3D]">NF-TT-2026-01</strong>,
                <strong className="mx-1 text-[#245B3D]">NF-XL-2026-03</strong>.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) router.push(`/trace/${encodeURIComponent(manualCode.trim())}`);
            }}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="fallback-qr-code" className="sr-only">
              Nhập lại mã lô
            </label>
            <input
              id="fallback-qr-code"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Nhập mã lô thủ công (ví dụ NF-DEMO-001)"
              className="min-h-[46px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            />
            <Button type="submit" variant="primary">
              <QrCode className="h-4 w-4" aria-hidden="true" />
              <span>Tra cứu lại</span>
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const product = products.find((p) => p.id === batch.productId);
  const farm = farms.find((f) => f.id === batch.farmId);
  const farmCerts = certifications.filter((c) => c.farmId === batch.farmId);
  const seasonDiaries = diaryEntries.filter(
    (d) => d.batchCode === batch.batchCode || (batch.seasonId && d.seasonId === batch.seasonId),
  );

  return (
    <div className="mx-auto max-w-[1060px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/trace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Tất cả mã lô truy xuất</span>
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/trace/scan"
            className="inline-flex items-center gap-1 font-semibold text-[#245B3D] hover:underline"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span>Quét QR khác</span>
          </Link>
          {product ? (
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold text-[#245B3D] hover:underline"
            >
              Xem sản phẩm →
            </Link>
          ) : null}
          {farm ? (
            <Link
              href={`/farms/${farm.slug}`}
              className="font-semibold text-[#245B3D] hover:underline"
            >
              Hồ sơ nhà vườn →
            </Link>
          ) : null}
        </div>
      </div>

      <QrPassportCard batch={batch} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-5">
            <ProductionDiaryTimeline
              entries={seasonDiaries}
              title={`Nhật ký mùa vụ liên kết lô ${batch.batchCode}`}
              limit={8}
            />
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {farmCerts.length > 0 ? (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Chứng nhận &amp; Vùng trồng tham khảo (Demo)</span>
              </h3>
              {farmCerts.map((cert) => (
                <CertificationCard key={cert.id} cert={cert} />
              ))}
            </div>
          ) : null}

          {farm ? (
            <Card className="space-y-3 p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#25352B]">
                <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Vị trí vùng trồng minh họa · {farm.administrativeUnitName}</span>
              </p>
              <NaiFarmMapHost
                farms={[farm]}
                selectedFarmId={farm.id}
                heightClassName="h-[260px]"
                zoom={12}
              />
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
