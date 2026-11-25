"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode, Search } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

export default function TraceIndexPage() {
  const router = useRouter();
  const { batches } = useDemoStore();
  const [code, setCode] = useState("NF-DEMO-001");

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">R3 · NaiTrace — Truy xuất công khai không ép đăng nhập</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-foreground">
          Tra cứu Hộ chiếu Nông sản & Nhật ký Mùa vụ
        </h1>
        <p className="mt-1 text-sm text-muted">
          Nhập mã lô in trên tem QR để kiểm tra nguồn gốc tự khai, chủ thể ghi nhận và tình trạng
          đối chiếu chứng từ.
        </p>
      </div>

      <DemoBanner
        title="Quy tắc hiển thị trung thực"
        detail="Hộ chiếu không lộ số điện thoại cá nhân hoặc địa chỉ riêng; tách biệt phần nhà vườn tự khai với chứng nhận OCOP chính thức."
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
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="trace-manual-input" className="sr-only">Nhập mã lô nông sản</label>
            <input
              id="trace-manual-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: NF-DEMO-001, NF-TT-2026-01, NF-XL-2026-03"
              className="min-h-[48px] w-full rounded-[10px] border border-input bg-white pl-9 pr-3 text-sm"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            <span>Mở Hộ chiếu QR</span>
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {batches.map((b) => (
          <Link
            key={b.batchCode}
            href={`/trace/${b.batchCode}`}
            className="rounded-[16px] border border-border bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.05)] hover:border-primary"
          >
            <p className="tabular-nums text-sm font-bold text-primary">{b.batchCode}</p>
            <p className="mt-1 font-semibold text-foreground">{b.productName}</p>
            <p className="mt-1 text-xs text-muted">{b.farmName}</p>
            <p className="mt-2 text-xs font-medium text-warning">{b.docStatus}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
