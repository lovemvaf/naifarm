"use client";

import Image from "next/image";

import React from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { formatVnd } from "@/lib/format";
import { assetUrl } from "@/lib/storage/assets";
import { Badge, Card, DemoBanner, EmptyState } from "@/components/ui/Primitives";

export default function CartPage() {
  const { hydrated, cart, products, updateCartQty, removeFromCart } = useDemoStore();

  const detailed = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = detailed.reduce((sum, i) => sum + i.product.priceVnd * i.quantity, 0);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-12 text-sm text-muted">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Badge tone="success">W01 · R4 · S05 Giỏ hàng</Badge>
          <h1 className="mt-2 font-editorial text-3xl font-semibold text-foreground">
            Giỏ hàng Nông sản Đồng Nai
          </h1>
        </div>
        <Link href="/marketplace" className="text-sm font-semibold text-primary hover:underline">
          Tiếp tục chọn nông sản →
        </Link>
      </div>

      <DemoBanner
        title="Quy tắc giỏ hàng minh bạch"
        detail="Mỗi đơn gồm nông sản của một nhà vườn để chủ vườn xác nhận và gắn tem QR chính xác. Phí giao hàng chỉ được tính sau khi bạn chọn 'Giao tận nơi' hoặc 'Nhận tại vườn' ở bước thanh toán (COD)."
      />

      {detailed.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket className="h-6 w-6" />}
          title="Giỏ hàng đang trống"
          description="Hãy chọn nông sản tươi Đồng Nai từ Chợ OCOP (ví dụ Chôm chôm Java 35.000 đ/kg hoặc Bưởi Tân Triều 45.000 đ/kg)."
          action={
            <Link
              href="/marketplace"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[12px] bg-primary px-5 text-sm font-semibold text-white"
            >
              <span>Khám phá Chợ OCOP</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {detailed.map(({ product, quantity }) => (
              <Card key={product.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Image
                    src={assetUrl(product.image)}
                    alt={product.name}
                    className="h-24 w-28 shrink-0 rounded-[12px] border border-border object-cover"
                    width={512}
                    height={279}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">{product.farmName}</p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-0.5 block text-base font-bold text-foreground hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 tabular-nums text-sm font-semibold text-muted">
                      {formatVnd(product.priceVnd)}/{product.unitLabel} · Tồn tối đa {product.stockKg}{" "}
                      {product.unitLabel}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="inline-flex items-center gap-1.5 rounded-[10px] border border-input bg-background p-1">
                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${product.name}`}
                        onClick={() => void updateCartQty(product.id, quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-foreground hover:bg-surface-soft cursor-pointer"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="tabular-nums min-w-[32px] text-center text-sm font-bold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${product.name}`}
                        onClick={() => void updateCartQty(product.id, quantity + 1)}
                        disabled={quantity >= product.stockKg}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-foreground hover:bg-surface-soft disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="tabular-nums min-w-[96px] text-right text-base font-bold text-primary">
                      {formatVnd(product.priceVnd * quantity)}
                    </p>

                    <button
                      type="button"
                      aria-label={`Xóa ${product.name} khỏi giỏ`}
                      onClick={() => void removeFromCart(product.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger-bg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit space-y-4 p-5 lg:col-span-4">
            <h2 className="text-lg font-bold text-foreground">Tóm tắt tạm tính</h2>
            <div className="space-y-2 border-b border-border pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tiền nông sản</span>
                <span className="tabular-nums font-bold text-foreground">{formatVnd(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hình thức nhận hàng</span>
                <span className="text-xs font-medium text-muted">Chọn ở bước tiếp theo</span>
              </div>
            </div>
            <p className="text-xs text-muted">
              Ví dụ chuẩn: 2 kg Chôm chôm Java = 70.000 đ; chọn Giao tận nơi (+20.000 đ) thành
              90.000 đ, hoặc Nhận tại vườn = 70.000 đ.
            </p>
            <Link
              href="/checkout"
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <span>Tiến hành đặt hàng</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
