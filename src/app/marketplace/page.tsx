"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Button, DemoBanner, EmptyState } from "@/components/ui/Primitives";
import { normalizeSearchText } from "@/lib/geography/normalize-address";
import { cn } from "@/lib/format";
import type { DongNaiZone, ProductCategory } from "@/types/naifarm";

const CATEGORIES: ("Tất cả" | ProductCategory)[] = [
  "Tất cả",
  "Trái cây tươi",
  "Bưởi & Cây có múi",
  "Chôm chôm & Sầu riêng",
  "Hạt điều & Rang củi",
  "Cà phê & Ca cao",
  "Mật ong & Rượu trái cây",
  "Nông sản chế biến & Mứt",
  "Rau củ & Nấm sạch",
  "Tiêu & Gia vị vùng đồi",
  "Quà tặng OCOP & Combo",
];

const ZONES: ("Tất cả khu vực" | DongNaiZone)[] = [
  "Tất cả khu vực",
  "Tân Triều & Trung tâm",
  "Long Khánh & Lân cận",
  "Xuân Lộc & Đông Nam",
  "Cẩm Mỹ & Định Quán",
  "Bắc Đồng Nai",
];

export default function MarketplacePage() {
  const { products, farms } = useDemoStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"Tất cả" | ProductCategory>("Tất cả");
  const [zone, setZone] = useState<"Tất cả khu vực" | DongNaiZone>("Tất cả khu vực");
  const [seasonFilter, setSeasonFilter] = useState<"all" | "in_season" | "pre_order">("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [visibleLimit, setVisibleLimit] = useState(24);

  const farmZoneById = useMemo(
    () => new Map(farms.map((f) => [f.id, f.zoneLabel])),
    [farms],
  );

  const filtered = useMemo(() => {
    const q = normalizeSearchText(search);
    const list = products.filter((p) => {
      if (category !== "Tất cả" && p.category !== category) return false;
      if (zone !== "Tất cả khu vực" && farmZoneById.get(p.farmId) !== zone) return false;
      if (seasonFilter === "in_season" && (p.seasonStatus !== "in_season" || p.stockKg <= 0)) {
        return false;
      }
      if (seasonFilter === "pre_order" && p.seasonStatus === "in_season" && p.stockKg > 0) {
        return false;
      }
      if (!q) return true;
      return normalizeSearchText(
        `${p.name} ${p.farmName} ${p.administrativeUnitName} ${p.batchCode} ${p.category}`,
      ).includes(q);
    });
    if (sortBy === "price_asc") return [...list].sort((a, b) => a.priceVnd - b.priceVnd);
    if (sortBy === "price_desc") return [...list].sort((a, b) => b.priceVnd - a.priceVnd);
    return list;
  }, [products, category, zone, farmZoneById, seasonFilter, sortBy, search]);

  const displayed = filtered.slice(0, visibleLimit);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">Chợ OCOP Thanh niên · 10 Danh mục · 24 Nhà vườn</Badge>
          <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
            Danh mục Nông sản &amp; Lịch Mùa vụ Đồng Nai
          </h1>
          <p className="mt-1 text-sm text-[#52645A]">
            Lọc theo khu vực Thành phố Đồng Nai, 10 nhóm đặc sản và trạng thái mùa vụ (tách bạch
            hàng đang có sẵn và hàng hẹn mùa).
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-white px-3.5 py-2 text-xs text-[#52645A]">
          <Calendar className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
          <span className="tabular-nums">
            Hiển thị {displayed.length}/{filtered.length} sản phẩm
          </span>
        </div>
      </div>

      <DemoBanner
        title="Lưu ý minh bạch mùa vụ"
        detail="Sản phẩm 'Hẹn mùa vụ tới' (như Chôm chôm nhãn, Nhãn tiêu da bò, Khoai môn Phước Sơn) tắt nút đặt mua để tránh nhận đơn khi chưa có tồn kho sẵn."
      />

      <div className="space-y-4 rounded-[16px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.04)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <label htmlFor="mkt-search" className="sr-only">
              Tìm kiếm sản phẩm
            </label>
            <input
              id="mkt-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nông sản, phường/xã, mã lô..."
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-sm"
            />
          </div>

          <div>
            <label htmlFor="mkt-region" className="sr-only">
              Lọc theo khu vực Đồng Nai
            </label>
            <select
              id="mkt-region"
              value={zone}
              onChange={(e) => setZone(e.target.value as (typeof ZONES)[number])}
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mkt-sort" className="sr-only">
              Sắp xếp giá
            </label>
            <select
              id="mkt-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
            >
              <option value="default">Mặc định (Ưu tiên nổi bật)</option>
              <option value="price_asc">Giá từ thấp đến cao</option>
              <option value="price_desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-[36px] rounded-full px-3 text-xs font-semibold cursor-pointer",
                  category === c
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: "Tất cả mùa" },
                { id: "in_season", label: "Đang vào mùa" },
                { id: "pre_order", label: "Hẹn mùa / Hết vụ" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSeasonFilter(opt.id)}
                className={cn(
                  "min-h-[36px] rounded-full px-3 text-xs font-semibold cursor-pointer",
                  seasonFilter === opt.id
                    ? "bg-[#D7A34D] text-[#25352B]"
                    : "border border-[#D6DED2] bg-white text-[#52645A]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {displayed.length > 0 ? (
        <>
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {displayed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length > displayed.length ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                onClick={() => setVisibleLimit((n) => n + 24)}
              >
                Xem thêm nông sản ({filtered.length - displayed.length} mặt hàng còn lại)
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Không tìm thấy mặt hàng phù hợp"
          description="Hãy xóa bớt bộ lọc danh mục hoặc khu vực để xem toàn bộ đặc sản Đồng Nai."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("Tất cả");
                setZone("Tất cả khu vực");
                setSeasonFilter("all");
              }}
            >
              Đặt lại bộ lọc
            </Button>
          }
        />
      )}
    </div>
  );
}
