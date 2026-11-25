"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Button, DemoBanner, EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

const CATEGORIES = ["Tất cả", "Trái cây tươi", "Hạt & Cà phê", "Mật ong & Đặc sản"] as const;
const REGIONS = [
  "Tất cả vùng",
  "Phường Tân Triều",
  "Phường Long Khánh",
  "Phường Xuân Lộc",
  "Cẩm Mỹ & Định Quán",
] as const;

export default function MarketplacePage() {
  const { products } = useDemoStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tất cả");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Tất cả vùng");
  const [seasonFilter, setSeasonFilter] = useState<"all" | "in_season" | "pre_order">("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "Tất cả" && p.category !== category) return false;
      if (region !== "Tất cả vùng" && p.region !== region) return false;
      if (seasonFilter === "in_season" && (p.seasonStatus !== "in_season" || p.stockKg <= 0)) return false;
      if (seasonFilter === "pre_order" && p.seasonStatus === "in_season" && p.stockKg > 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.farmName.toLowerCase().includes(q) ||
        p.batchCode.toLowerCase().includes(q)
      );
    });
    if (sortBy === "price_asc") return [...list].sort((a, b) => a.priceVnd - b.priceVnd);
    if (sortBy === "price_desc") return [...list].sort((a, b) => b.priceVnd - a.priceVnd);
    return list;
  }, [products, category, region, seasonFilter, sortBy, search]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">Chợ OCOP Thanh niên · S01 & S26</Badge>
          <h1 className="mt-2 font-editorial text-3xl font-semibold text-foreground">
            Danh mục Nông sản & Lịch Mùa vụ Đồng Nai
          </h1>
          <p className="mt-1 text-sm text-muted">
            Lọc theo vùng trồng, danh mục, trạng thái mùa vụ (tách bạch hàng có sẵn và hàng hẹn mùa).
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-3.5 py-2 text-xs text-muted">
          <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Hiển thị {filtered.length}/{products.length} sản phẩm</span>
        </div>
      </div>

      <DemoBanner
        title="Lưu ý minh bạch mùa vụ"
        detail="Sản phẩm 'Hẹn mùa vụ tới' (như Chôm chôm nhãn, Chôm chôm tuyển chọn) tắt nút đặt mua để tránh nhận đơn khi chưa có tồn kho sẵn."
      />

      <div className="space-y-4 rounded-[16px] border border-border bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.04)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="mkt-search" className="sr-only">Tìm kiếm sản phẩm</label>
            <input
              id="mkt-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm, nhà vườn, mã lô..."
              className="min-h-[44px] w-full rounded-[10px] border border-input bg-white pl-9 pr-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="mkt-region" className="sr-only">Lọc theo vùng</label>
            <select
              id="mkt-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as (typeof REGIONS)[number])}
              className="min-h-[44px] w-full rounded-[10px] border border-input bg-white px-3 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mkt-sort" className="sr-only">Sắp xếp giá</label>
            <select
              id="mkt-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="min-h-[44px] w-full rounded-[10px] border border-input bg-white px-3 text-sm"
            >
              <option value="default">Mặc định (Ưu tiên nổi bật)</option>
              <option value="price_asc">Giá từ thấp đến cao</option>
              <option value="price_desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-[38px] rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                  category === c ? "bg-primary text-white" : "border border-border bg-background text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Tất cả mùa vụ" },
              { id: "in_season", label: "Đang vào mùa (có hàng)" },
              { id: "pre_order", label: "Lịch hẹn mùa (S26)" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSeasonFilter(st.id as typeof seasonFilter)}
                className={cn(
                  "min-h-[38px] rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                  seasonFilter === st.id
                    ? "bg-accent text-foreground"
                    : "border border-border bg-white text-muted"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Không có sản phẩm khớp điều kiện lọc"
          description="Nhấn đặt lại để hiển thị toàn bộ danh mục nông sản mẫu Đồng Nai."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("Tất cả");
                setRegion("Tất cả vùng");
                setSeasonFilter("all");
                setSortBy("default");
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
