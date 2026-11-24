"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, QrCode } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { Button, Card } from "@/components/ui/Primitives";

export default function TraceBatchDetailPage({
  params,
}: {
  params: Promise<{ batchCode: string }>;
}) {
  const { batchCode } = use(params);
  const router = useRouter();
  const { batches, products, farms } = useDemoStore();
  const [manualCode, setManualCode] = useState("");

  const normalized = decodeURIComponent(batchCode).trim().toUpperCase();
  const batch = batches.find((b) => b.batchCode.toUpperCase() === normalized);

  if (!batch) {
    return (
      <div className="mx-auto max-w-[780px] space-y-6 px-4 py-10">
        <Link href="/trace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Danh sách mã lô mẫu</span>
        </Link>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-[#A32D2D]" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-[#25352B]">
                Mã QR hoặc mã lô “{normalized}” chưa tồn tại trong hệ thống demo
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
            <label htmlFor="fallback-qr-code" className="sr-only">Nhập lại mã lô</label>
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

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/trace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Tất cả mã lô truy xuất</span>
        </Link>
        <div className="flex flex-wrap gap-3 text-sm">
          {product ? (
            <Link href={`/products/${product.slug}`} className="font-semibold text-[#245B3D] hover:underline">
              Xem sản phẩm →
            </Link>
          ) : null}
          {farm ? (
            <Link href={`/farms/${farm.slug}`} className="font-semibold text-[#245B3D] hover:underline">
              Hồ sơ nhà vườn →
            </Link>
          ) : null}
        </div>
      </div>

      <QrPassportCard batch={batch} />
    </div>
  );
}
