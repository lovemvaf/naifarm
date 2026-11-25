"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, QrCode, Search } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

export default function TraceIndexPage() {
  const router = useRouter();
  const { batches } = useDemoStore();
  const [code, setCode] = useState("NF-DEMO-001");
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "quarantine" | "recalled" | "expired">("all");

  const visibleBatches = useMemo(() => {
    const q = normalizeSearchText(filterQuery);
    return batches
      .filter((b) => {
        if (statusFilter !== "all" && (b.lotStatus ?? "active") !== statusFilter) return false;
        if (!q) return true;
        return normalizeSearchText(
          `${b.batchCode} ${b.productName} ${b.farmName} ${b.administrativeUnitName}`,
        ).includes(q);
      })
      .slice(0, 30);
  }, [batches, filterQuery, statusFilter]);

  return (
    <div className="mx-auto max-w-[1160px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">Truy xuất nguồn gốc · Mở tra cứu công khai</Badge>
          <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
            Tra cứu Hộ chiếu Nông sản &amp; Nhật ký Mùa vụ ({batches.length} mã lô)
          </h1>
          <p className="mt-1 text-sm text-[#52645A]">
            Nhập mã lô in trên tem QR hoặc quét trực tiếp từ camera / ảnh PNG để xem nguồn gốc lô
            hàng và phả hệ chia tách.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/quality"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
          >
            Trung tâm chất lượng
          </Link>
          <Link
            href="/trace/scan"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-5 text-xs font-semibold text-white hover:bg-[#19472E]"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span>Mở trình quét QR (Camera / Ảnh)</span>
          </Link>
        </div>
      </div>

      <DemoBanner
        title="Quy tắc hiển thị minh bạch"
        detail="Hộ chiếu công khai ẩn thông tin nội bộ và dữ liệu liên hệ cá nhân; đồng thời tách biệt nhật ký tự khai với chứng nhận chính thức."
      />

      <Card className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/trace/${encodeURIComponent(code.trim() || "NF-DEMO-001")}`);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <label htmlFor="trace-manual-input" className="sr-only">
              Nhập mã lô nông sản
            </label>
            <input
              id="trace-manual-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: NF-DEMO-001, NF-TT-2026-01, NF-XL-2026-03"
              className="min-h-[48px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            <span>Mở Hộ chiếu QR</span>
          </Button>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#25352B]">
          Danh bạ lô hàng ({visibleBatches.length}/{batches.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Lọc trạng thái lô"
            className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
          >
            <option value="all">Tất cả trạng thái lô</option>
            <option value="active">Đang lưu hành</option>
            <option value="quarantine">Tạm giữ QC</option>
            <option value="recalled">Đã thu hồi</option>
            <option value="expired">Hết hạn khuyến nghị</option>
          </select>
          <input
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Lọc theo sản phẩm, phường/xã, mã lô..."
            aria-label="Lọc danh sách mã lô"
            className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs sm:w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleBatches.map((b) => (
          <Link
            key={b.batchCode}
            href={`/trace/${encodeURIComponent(b.batchCode)}`}
            className="rounded-[16px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.05)] hover:border-[#245B3D]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="tabular-nums text-sm font-bold text-[#245B3D]">{b.batchCode}</p>
              {b.lotStatus && b.lotStatus !== "active" ? (
                <Badge tone="danger">
                  {b.lotStatus === "recalled" ? "Thu hồi" : b.lotStatus === "quarantine" ? "Tạm giữ" : "Hết hạn"}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 font-semibold text-[#25352B]">{b.productName}</p>
            <p className="mt-1 text-xs text-[#52645A]">
              {b.farmName} · {b.administrativeUnitName}
            </p>
            <p className="mt-2 text-xs font-medium text-[#80520C]">{b.docStatus}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
