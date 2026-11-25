"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileCheck2, ShieldAlert } from "lucide-react";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "@/data/reference/ocop-public-reference";
import { QualityCenterPanel } from "@/components/quality/QualityCenterPanel";
import { useDemoStore } from "@/context/DemoStoreContext";
import { Badge, Card } from "@/components/ui/Primitives";

export default function QualityHubPage() {
  const { products, batches } = useDemoStore();

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <Badge tone="success">Trung tâm Chất lượng &amp; Minh bạch nguồn gốc</Badge>
          <h1 className="font-editorial text-3xl font-semibold text-[#25352B] sm:text-4xl">
            26 Tiêu chuẩn chất lượng &amp; Danh mục OCOP Đồng Nai công bố
          </h1>
          <p className="text-sm text-[#52645A]">
            Phân tách rạch ròi giữa hồ sơ đối chiếu từ nguồn công bố công khai (không mở bán thay chủ thể)
            với hồ sơ mẫu kiểm thử trong không gian trải nghiệm.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/trace/scan"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
          >
            <span>Quét tem truy xuất QR</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
          >
            <span>Về Chợ nông sản ({products.length} SP · {batches.length} lô)</span>
          </Link>
        </div>
      </div>

      {/* Public OCOP & VietGAP Reference Catalog */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-[#25352B]">
            <FileCheck2 className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Danh mục OCOP / VietGAP / GI tham khảo từ nguồn công bố ({OCOP_PUBLIC_REFERENCE_CATALOG.length})</span>
          </h2>
          <span className="text-xs font-semibold text-[#80520C]">
            Chỉ đọc đối chiếu nguồn — không gắn giá hoặc giỏ hàng thay doanh nghiệp
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {OCOP_PUBLIC_REFERENCE_CATALOG.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden">
              <div className="aspect-[16/9] bg-[#EAF0E5]">
                <img
                  src={item.image}
                  alt={`Ảnh minh họa nhóm sản phẩm ${item.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={item.lifecycleStatus === "revoked" ? "danger" : item.lifecycleStatus === "source_verified" ? "success" : "warning"}>
                    {item.category}
                  </Badge>
                  {item.credentialTypeIds.map((tId) => (
                    <Badge key={tId} tone="neutral">{tId}</Badge>
                  ))}
                </div>

                <h3 className="mt-2 text-base font-bold text-[#25352B]">{item.name}</h3>
                <p className="text-xs font-semibold text-[#245B3D]">{item.subjectName}</p>
                <p className="mt-1 text-xs text-[#52645A]">{item.credentialSummary}</p>
                <p className="mt-1 text-[11px] text-[#52645A]">
                  Địa chỉ nguồn: {item.sourceAddressOriginal}
                </p>

                {item.scopeWarning ? (
                  <p className="mt-2 flex items-start gap-1.5 rounded-[10px] bg-[#FFF2D8] p-2.5 text-[11px] text-[#80520C]">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.scopeWarning}</span>
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between border-t border-[#EAF0E5] pt-3 text-xs">
                  <span className="text-[#52645A]">{item.decisionOrSourceLabel}</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#245B3D] hover:underline"
                  >
                    <span>Xem nguồn công bố</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive 26-Type Registry & Credentials Panel */}
      <QualityCenterPanel />
    </div>
  );
}
