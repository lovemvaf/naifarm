"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Compass, FileText, GraduationCap, MapPin, QrCode, Search, Sparkles, Store, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { runGlobalSearch, type SearchResultKind } from "@/lib/search/search-engine";
import { Badge, Card, EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

const KIND_FILTERS: { id: "all" | SearchResultKind; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "product", label: "Nông sản" },
  { id: "farm", label: "Nhà vườn" },
  { id: "administrative_unit", label: "Phường / Xã Đồng Nai" },
  { id: "batch", label: "Mã lô QR" },
  { id: "lesson", label: "Học tập" },
  { id: "mission", label: "Nhiệm vụ TNV" },
];

function KindIcon({ kind }: { kind: SearchResultKind }) {
  switch (kind) {
    case "product":
      return <Store className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
    case "farm":
      return <Compass className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
    case "administrative_unit":
      return <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
    case "batch":
      return <QrCode className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
    case "lesson":
      return <GraduationCap className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
    case "mission":
      return <Users className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />;
  }
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [kindFilter, setKindFilter] = useState<"all" | SearchResultKind>("all");

  const { products, farms, batches, lessons, missions } = useDemoStore();
  const activeQuery = searchParams.get("q") ?? queryInput;

  const { results, matchedAliasNote } = useMemo(
    () => runGlobalSearch(activeQuery, { products, farms, batches, lessons, missions }, 60),
    [activeQuery, products, farms, batches, lessons, missions],
  );

  const visibleResults = useMemo(
    () => (kindFilter === "all" ? results : results.filter((r) => r.kind === kindFilter)),
    [results, kindFilter],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(queryInput.trim())}`);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div className="space-y-3">
        <Badge tone="success">Tìm kiếm toàn cục · Hỗ trợ tiếng Việt có dấu &amp; không dấu</Badge>
        <h1 className="font-editorial text-3xl font-semibold text-[#25352B]">
          Tìm nông sản, nhà vườn, mã lô QR &amp; 95 Phường/Xã Đồng Nai
        </h1>
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ví dụ: buoi tan trieu, Phuoc Son, NF-DEMO-001, Ba Tu, hat dieu..."
              aria-label="Từ khóa tìm kiếm trên NaiFarm"
              className="min-h-[48px] w-full rounded-[12px] border border-[#788A7B] bg-white pr-4 pl-11 text-sm text-[#25352B]"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] rounded-[12px] bg-[#245B3D] px-6 text-sm font-semibold text-white hover:bg-[#19472E]"
          >
            Tìm kiếm
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
          <span>Gợi ý nhanh:</span>
          {["buoi tan trieu", "Ba Tư", "NF-DEMO-001", "Phước Sơn", "hat dieu", "Long Khánh"].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setQueryInput(chip);
                router.push(`/search?q=${encodeURIComponent(chip)}`);
              }}
              className="rounded-full border border-[#D6DED2] bg-white px-3 py-1 font-medium text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {matchedAliasNote ? (
        <div className="rounded-[14px] border border-[#D7A34D] bg-[#FFF2D8] p-4 text-sm text-[#25352B]">
          <p className="flex items-center gap-2 font-bold text-[#80520C]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Ghi chú chuyển đổi địa giới lịch sử</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#52645A]">{matchedAliasNote}</p>
        </div>
      ) : null}

      {activeQuery.trim() ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {KIND_FILTERS.map((f) => {
              const count =
                f.id === "all" ? results.length : results.filter((r) => r.kind === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKindFilter(f.id)}
                  className={cn(
                    "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
                    kindFilter === f.id
                      ? "bg-[#245B3D] text-white"
                      : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
                  )}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          {visibleResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {visibleResults.map((item) => (
                <Link key={item.id} href={item.href}>
                  <Card className="flex h-full items-center gap-4 p-4 transition hover:border-[#245B3D] hover:bg-[#FAF8F1]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 shrink-0 rounded-[12px] border border-[#D6DED2] object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-[#EAF0E5]">
                        <KindIcon kind={item.kind} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F3E9] px-2 py-0.5 text-[11px] font-semibold text-[#245B3D]">
                          <KindIcon kind={item.kind} />
                          <span>{item.kindLabel}</span>
                        </span>
                        {item.badgeText ? (
                          <span className="text-[11px] font-medium text-[#52645A]">
                            {item.badgeText}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-1 truncate text-sm font-bold text-[#25352B]">
                        {item.title}
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#52645A]">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#52645A]" aria-hidden="true" />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="h-6 w-6" aria-hidden="true" />}
              title={`Chưa tìm thấy kết quả cho "${activeQuery}"`}
              description="Bạn hãy thử gõ không dấu (ví dụ: chom chom, tan trieu), tên Phường/Xã mới (Phước Sơn, Xuân Lộc, Trấn Biên) hoặc mã lô QR như NF-DEMO-001."
              action={
                <Link
                  href="/marketplace"
                  className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
                >
                  Về Chợ OCOP
                </Link>
              }
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" aria-hidden="true" />}
          title="Nhập từ khóa để tra cứu toàn hệ sinh thái NaiFarm"
          description="Tìm kiếm nông sản Đồng Nai, hồ sơ 30 nhà vườn, 95 Phường/Xã Đồng Nai, mã lô QR, bài học 2D và nhiệm vụ thanh niên."
          action={
            <Link
              href="/explore"
              className="inline-flex min-h-[44px] items-center rounded-[10px] bg-[#245B3D] px-5 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              Mở Bản đồ Đồng Nai
            </Link>
          }
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải bộ máy tìm kiếm...
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
