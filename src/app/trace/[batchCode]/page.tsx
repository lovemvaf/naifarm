"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  GitBranch,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { traceLotGenealogy } from "@/lib/quality/recall-engine";
import {
  CREDENTIAL_TYPE_MAP,
  LIFECYCLE_STATUS_LABELS,
  evaluateCredentialDisplay,
} from "@/lib/quality/credential-registry";
import { QrPassportCard } from "@/components/traceability/QrPassportCard";
import { CertificationCard } from "@/components/traceability/CertificationCard";
import { ProductionDiaryTimeline } from "@/components/traceability/ProductionDiaryTimeline";
import { CredentialDetailDrawer } from "@/components/quality/CredentialDetailDrawer";
import { NaiFarmMapHost } from "@/components/map/NaiFarmMapHost";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { CredentialRecord } from "@/types/naifarm";

export default function TraceBatchDetailPage({
  params,
}: {
  params: Promise<{ batchCode: string }>;
}) {
  const { batchCode } = use(params);
  const router = useRouter();
  const { batches, products, farms, certifications, diaryEntries, credentialRecords } = useDemoStore();
  const [manualCode, setManualCode] = useState("");
  const [selectedCred, setSelectedCred] = useState<CredentialRecord | null>(null);

  const normalized = decodeURIComponent(batchCode).trim().toUpperCase();
  const rawBatch = batches.find((b) => b.batchCode.toUpperCase() === normalized);

  if (!rawBatch) {
    return (
      <div className="mx-auto max-w-[780px] space-y-6 px-4 py-10">
        <Link
          href="/trace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Danh sách mã lô truy xuất</span>
        </Link>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-[#A32D2D]" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-[#25352B]">
                Mã QR hoặc mã lô &ldquo;{normalized}&rdquo; chưa tồn tại trên hệ thống
              </h1>
              <p className="mt-1 text-sm text-[#52645A]">
                Kiểm tra lại tem nhãn hoặc nhập một trong các mã lô hợp lệ như:
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

  // Strictly strip internal events on public passport route
  const publicBatch = {
    ...rawBatch,
    events: rawBatch.events.filter((e) => e.visibility !== "internal"),
  };

  const product = products.find((p) => p.id === rawBatch.productId);
  const farm = farms.find((f) => f.id === rawBatch.farmId);
  const farmCerts = certifications.filter((c) => c.farmId === rawBatch.farmId);
  const seasonDiaries = diaryEntries.filter(
    (d) =>
      (d.batchCode === rawBatch.batchCode ||
        (rawBatch.seasonId && d.seasonId === rawBatch.seasonId)) &&
      d.visibility !== "internal",
  );
  const genealogy = traceLotGenealogy(rawBatch.batchCode, batches);
  const scopedCreds = credentialRecords.filter(
    (cr) =>
      cr.origin === "synthetic" &&
      (cr.holderId === rawBatch.farmId ||
        (product && cr.productIds.includes(product.id)) ||
        (cr.lotIds ?? []).includes(rawBatch.batchCode)),
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
          <Link href="/quality" className="font-semibold text-[#245B3D] hover:underline">
            Trung tâm chất lượng
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

      {/* Recall / Quarantine / Expired Status Alert Banner */}
      {rawBatch.lotStatus && rawBatch.lotStatus !== "active" ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[16px] border-2 border-[#A32D2D] bg-[#FDECEC] p-4 text-sm text-[#A32D2D]"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">
              {rawBatch.lotStatus === "recalled"
                ? "CẢNH BÁO THU HỒI LÔ HÀNG"
                : rawBatch.lotStatus === "quarantine"
                ? "LÔ ĐANG TẠM GIỮ KIỂM TRA CHẤT LƯỢNG"
                : "LÔ ĐÃ QUA HẠN SỬ DỤNG KHUYẾN NGHỊ"}
            </p>
            <p className="mt-0.5 text-xs">
              Lô {rawBatch.batchCode} hiện không mở đặt mua trên Chợ OCOP. Toàn bộ chuỗi truy xuất
              nguồn gốc được giữ nguyên để kiểm tra và đối chiếu xử lý.
            </p>
          </div>
        </div>
      ) : null}

      <QrPassportCard batch={publicBatch} />

      {/* Batch Genealogy Tree */}
      {genealogy ? (
        <Card className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <GitBranch className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Phả hệ lô &amp; Bảo toàn khối lượng</span>
            </h2>
            <Badge tone="neutral">
              {rawBatch.quantityKg ?? 0} kg ban đầu · Còn {rawBatch.remainingKg ?? 0} kg
            </Badge>
          </div>
          <p className="text-xs text-[#52645A]">{genealogy.quantityConservationNote}</p>
          {rawBatch.storageCondition || rawBatch.expiryDate ? (
            <p className="text-xs text-[#25352B]">
              {rawBatch.storageCondition ? `Bảo quản: ${rawBatch.storageCondition}` : ""}
              {rawBatch.expiryDate ? ` · Hạn sử dụng khuyến nghị: ${rawBatch.expiryDate}` : ""}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {genealogy.parents.length > 0 ? (
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs">
                <p className="font-bold text-[#245B3D]">Lô nguồn đầu vào ({genealogy.parents.length})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {genealogy.parents.map((p) => (
                    <Link
                      key={p.batchCode}
                      href={`/trace/${encodeURIComponent(p.batchCode)}`}
                      className="rounded-lg border border-[#D6DED2] bg-white px-2.5 py-1.5 font-mono font-bold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      {p.batchCode} ({p.farmName})
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {genealogy.children.length > 0 ? (
              <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs">
                <p className="font-bold text-[#245B3D]">Lô chia / gom đầu ra ({genealogy.children.length})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {genealogy.children.map((c) => (
                    <Link
                      key={c.batchCode}
                      href={`/trace/${encodeURIComponent(c.batchCode)}`}
                      className="rounded-lg border border-[#D6DED2] bg-white px-2.5 py-1.5 font-mono font-bold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      {c.batchCode} ({c.lotStatus === "recalled" ? "Thu hồi" : "Hợp lệ"})
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-5">
            <ProductionDiaryTimeline
              entries={seasonDiaries}
              title={`Nhật ký mùa vụ công khai · Lô ${rawBatch.batchCode}`}
              limit={8}
            />
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {scopedCreds.length > 0 ? (
            <Card className="space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
                <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Tiêu chuẩn gắn phạm vi lô ({scopedCreds.length})</span>
              </h3>
              <div className="space-y-2">
                {scopedCreds.map((cr) => {
                  const typeDef = CREDENTIAL_TYPE_MAP.get(cr.typeId);
                  const res = evaluateCredentialDisplay(cr, product?.category, product?.id);
                  return (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => setSelectedCred(cr)}
                      className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 py-2 text-left text-xs hover:bg-[#EAF0E5] cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-[#25352B]">
                          {cr.typeId} · {typeDef?.displayName}
                        </p>
                        <p className="text-[11px] text-[#52645A]">
                          {LIFECYCLE_STATUS_LABELS[res.effectiveStatus]}
                        </p>
                      </div>
                      <Badge tone={res.canShowBadge ? "success" : "warning"}>
                        {res.canShowBadge ? "Hồ sơ mẫu" : "Ẩn nhãn"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {farmCerts.length > 0 ? (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Hồ sơ tham khảo của nhà vườn</span>
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
                <span>Vị trí gần đúng theo vùng · {farm.administrativeUnitName}</span>
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

      <CredentialDetailDrawer
        record={selectedCred}
        allRecords={credentialRecords}
        onClose={() => setSelectedCred(null)}
      />
    </div>
  );
}
