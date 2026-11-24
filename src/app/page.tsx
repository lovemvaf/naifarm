"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Compass,
  MapPin,
  QrCode,
  Radio,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { EditorialCursorStage, EditorialReveal } from "@/components/motion/MotionSystem";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge, Button, Card, DemoBanner, EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

const CATEGORIES = ["Tất cả", "Trái cây tươi", "Hạt & Cà phê", "Mật ong & Đặc sản"] as const;

export default function HomePage() {
  const router = useRouter();
  const { products, farms, livestreams } = useDemoStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tất cả");
  const [onlyInSeason, setOnlyInSeason] = useState(false);
  const [qrInput, setQrInput] = useState("NF-DEMO-001");

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "Tất cả" && p.category !== category) return false;
      if (onlyInSeason && (p.seasonStatus !== "in_season" || p.stockKg <= 0)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.farmName.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.batchCode.toLowerCase().includes(q)
      );
    });
  }, [products, category, onlyInSeason, search]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-14 px-4 py-6 lg:px-8 lg:py-10">
      {/* 60/40 Agricultural Editorial Hero — visible above fold at 1280x800 */}
      <section aria-labelledby="hero-heading" className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <EditorialReveal className="space-y-5 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D6DED2] bg-[#EAF0E5] px-3.5 py-1.5 text-xs font-semibold text-[#245B3D]">
            <Sprout className="h-4 w-4" aria-hidden="true" />
            <span>Chợ OCOP Thanh niên · Thành phố Đồng Nai (Nguyên mẫu Demo)</span>
          </div>

          <h1
            id="hero-heading"
            className="font-editorial text-[28px] font-semibold leading-[1.15] text-[#25352B] sm:text-4xl lg:text-[48px]"
          >
            Nông sản Đồng Nai — Minh bạch từ vườn
          </h1>

          <p className="max-w-xl text-base text-[#25352B]/85 sm:text-lg">
            Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị. Đồng hành cùng nhà vườn U50+ số hóa
            sản phẩm, truy xuất mã lô QR đến bàn ăn và kết nối thanh niên tình nguyện địa phương.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#cho-nong-san"
              className="inline-flex min-h-[50px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-6 text-sm font-semibold text-white hover:bg-[#19472E]"
            >
              <span>Khám phá nông sản</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/farmer/publish"
              className="inline-flex min-h-[50px] items-center gap-2 rounded-[12px] border-[1.5px] border-[#245B3D] bg-white px-5 text-sm font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              <span>Thử đăng bán Nhà nông (3 bước)</span>
            </Link>
          </div>

          {/* Quick QR Traceability Lookup */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = qrInput.trim() || "NF-DEMO-001";
              router.push(`/trace/${encodeURIComponent(code)}`);
            }}
            className="flex flex-wrap items-center gap-2 rounded-[14px] border border-[#D6DED2] bg-white p-2.5 shadow-[0_2px_8px_rgba(37,53,43,0.05)] max-w-lg"
          >
            <QrCode className="ml-1.5 h-5 w-5 shrink-0 text-[#245B3D]" aria-hidden="true" />
            <label htmlFor="hero-qr-input" className="sr-only">
              Nhập mã lô nông sản để tra cứu QR
            </label>
            <input
              id="hero-qr-input"
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Nhập mã lô (ví dụ NF-DEMO-001, NF-TT-2026-01)"
              className="min-h-[44px] flex-1 rounded-[10px] border border-[#788A7B] bg-[#F5F3E9] px-3 text-sm text-[#25352B]"
            />
            <Button type="submit" size="md" variant="gold">
              Tra cứu Hộ chiếu QR
            </Button>
          </form>
        </EditorialReveal>

        <EditorialReveal delay={0.08} className="lg:col-span-5">
          <EditorialCursorStage
            label="Xem bản đồ vườn Đồng Nai"
            className="relative overflow-hidden rounded-[24px] border border-[#D6DED2] bg-[#EAF0E5] shadow-[0_8px_24px_rgba(37,53,43,0.12)]"
          >
            <Link href="/explore" className="block">
              <img
                src="/images/stitch/stitch-02.jpg"
                alt="Vườn bưởi và chôm chôm Đồng Nai trong nắng sớm (ảnh minh họa)"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
              <div className="border-t border-[#D6DED2] bg-white/95 px-4 py-3">
                <p className="text-xs font-semibold text-[#245B3D]">
                  Ảnh minh họa hệ sinh thái vườn Đồng Nai · Tân Triều & Long Khánh
                </p>
                <p className="text-xs text-[#52645A]">
                  Kết hợp thương mại OCOP minh bạch, du lịch miệt vườn và tình nguyện số.
                </p>
              </div>
            </Link>
          </EditorialCursorStage>
        </EditorialReveal>
      </section>

      <DemoBanner
        title="Môi trường trình diễn Prototype Frontend-Only"
        detail="Toàn bộ giá bán, tồn kho, mã lô QR, lịch phát sóng và trạng thái OCOP là dữ liệu mẫu phục vụ kiểm thử UX/UI — không kết nối cơ sở dữ liệu hay giao dịch tiền thật."
      />

      {/* Search, Category Filter & 4-col Product Grid */}
      <section id="cho-nong-san" aria-labelledby="catalog-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="catalog-heading" className="text-2xl font-bold text-[#25352B] md:text-[30px]">
              Gian hàng Nông sản & Đặc sản Đồng Nai
            </h2>
            <p className="mt-1 text-sm text-[#52645A]">
              Đồng bộ trực tiếp với Không gian Nhà nông (W02) và Hộ chiếu QR truy xuất lô hàng.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
          >
            <span>Xem tất cả & Lịch mùa vụ</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-col gap-3 rounded-[16px] border border-[#D6DED2] bg-white p-4 shadow-[0_2px_8px_rgba(37,53,43,0.04)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "min-h-[40px] rounded-full px-4 text-xs font-semibold cursor-pointer",
                  category === cat
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]"
                )}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyInSeason((v) => !v)}
              className={cn(
                "min-h-[40px] rounded-full px-4 text-xs font-semibold cursor-pointer",
                onlyInSeason
                  ? "bg-[#D7A34D] text-[#25352B]"
                  : "border border-[#D6DED2] bg-white text-[#52645A] hover:bg-[#FFF2D8]"
              )}
            >
              Chỉ hiện hàng đang vào mùa
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52645A]" aria-hidden="true" />
            <label htmlFor="home-search" className="sr-only">
              Tìm sản phẩm, nhà vườn hoặc mã lô
            </label>
            <input
              id="home-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bưởi, chôm chôm, Ba Tư..."
              className="min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white pl-9 pr-3 text-sm text-[#25352B]"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid-safe grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="Không tìm thấy nông sản phù hợp"
            description="Thử xóa bộ lọc mùa vụ hoặc đổi từ khóa khác (ví dụ: Chôm chôm, Bưởi, Hạt điều)."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCategory("Tất cả");
                  setOnlyInSeason(false);
                }}
              >
                Xóa toàn bộ bộ lọc
              </Button>
            }
          />
        )}
      </section>

      {/* Documentary Farm Stories + Youth Digital Bridge */}
      <section aria-labelledby="farms-story-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="farms-story-heading" className="text-2xl font-bold text-[#25352B]">
              Câu chuyện Nhà vườn & Thanh niên Đồng hành
            </h2>
            <p className="mt-1 text-sm text-[#52645A]">
              Hồ sơ sản xuất tách biệt minh bạch trạng thái tự khai với văn bản đã đối chiếu.
            </p>
          </div>
          <Link href="/farms" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline">
            <span>Xem tất cả {farms.length} nhà vườn</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {farms.slice(0, 2).map((farm) => (
            <Card key={farm.id} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
                <img
                  src={farm.ownerPortrait}
                  alt={`${farm.ownerName} - ${farm.name}`}
                  className="h-56 w-full object-cover sm:h-full"
                />
                <div className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                        {farm.ocopLabel}
                      </Badge>
                      <span className="tabular-nums text-xs font-semibold text-[#52645A]">
                        {farm.areaHa} ha · {farm.region}
                      </span>
                    </div>
                    <h3 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
                      {farm.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#52645A]">{farm.storySummary}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#245B3D]">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hỗ trợ số: {farm.youthSupporters.join(", ")}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/farms/${farm.slug}`}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                    >
                      <span>Xem hồ sơ nhà vườn</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/explore"
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-[#F5F3E9] px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                      <span>Vị trí vườn</span>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* OCOP Live Schedule & Explore + 3D Learning Banner */}
      <section aria-labelledby="live-strip-heading" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="live-strip-heading" className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
              <Radio className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>Lịch OCOP Live từ Nhà vườn (Demo)</span>
            </h2>
            <Link href="/live" className="text-sm font-semibold text-[#245B3D] hover:underline">
              Mở phòng OCOP Live →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {livestreams.slice(0, 2).map((session) => (
              <Link
                key={session.id}
                href="/live"
                className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-3 hover:bg-[#EAF0E5]"
              >
                <img
                  src={session.angles[0]?.image || "/images/stitch/stitch-44.jpg"}
                  alt={session.title}
                  className="h-20 w-24 shrink-0 rounded-[8px] object-cover"
                />
                <div className="min-w-0">
                  <Badge tone={session.status === "replay_demo" ? "info" : "gold"}>
                    {session.status === "replay_demo" ? "Phát lại minh họa" : "Lịch dự kiến"}
                  </Badge>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#25352B]">{session.title}</p>
                  <p className="mt-1 text-xs text-[#52645A]">{session.scheduleLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-[#EAF0E5] p-5">
          <div>
            <Badge tone="success">Trải nghiệm & Học tập mở</Badge>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
              Khám phá Bản đồ Đồng Nai & Bưởi Tân Triều 3D
            </h2>
            <p className="mt-2 text-sm text-[#52645A]">
              Định vị các vùng trồng đặc sản Đồng Nai, đặt lịch trải nghiệm tại vườn và tương tác mô
              hình 3D quả bưởi ngay trên trình duyệt.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/explore"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Bản đồ sinh thái</span>
            </Link>
            <Link
              href="/learn"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#F5F3E9]"
            >
              <span>Học & Mô hình 3D</span>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
