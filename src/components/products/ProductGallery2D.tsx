"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/format";

interface ProductGallery2DProps {
  images: string[];
  productName: string;
}

export function ProductGallery2D({ images, productName }: ProductGallery2DProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const safeImages = images.length > 0 ? images : ["/images/stitch/stitch-01.jpg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const activeSrc = safeImages[selectedIndex] ?? safeImages[0];

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-[18px] border border-[#D6DED2] bg-[#EFECE0]">
        <img
          src={activeSrc}
          alt={isEn ? `${productName} - photo ${selectedIndex + 1}` : `${productName} - ảnh ${selectedIndex + 1}`}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute right-3 bottom-3 inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-[#25352B]/85 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#245B3D]"
          aria-label={isEn ? `Zoom photo of ${productName}` : `Phóng to ảnh ${productName}`}
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isEn ? "2D Zoom" : "Phóng to 2D"}</span>
        </button>
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {safeImages.slice(0, 4).map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "overflow-hidden rounded-[12px] border-2 bg-[#EFECE0] transition",
                idx === selectedIndex
                  ? "border-[#245B3D]"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
              aria-label={`Xem ảnh ${idx + 1} của ${productName}`}
            >
              <img
                src={src}
                alt={`${productName} thu nhỏ ${idx + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh phóng to ${productName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18241D]/90 p-4"
        >
          <div className="relative w-full max-w-4xl rounded-[18px] bg-white p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-bold text-[#25352B]">
                {productName} ({selectedIndex + 1}/{safeImages.length})
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]"
                aria-label="Đóng ảnh phóng to"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[14px] bg-[#EFECE0]">
              <img
                src={activeSrc}
                alt={`${productName} phóng to`}
                className="max-h-[75vh] w-full object-contain"
              />
              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
                    }
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#25352B] shadow hover:bg-white"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex((prev) => (prev + 1) % safeImages.length)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#25352B] shadow hover:bg-white"
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
