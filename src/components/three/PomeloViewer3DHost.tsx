"use client";

import Image from "next/image";

import React, { Component, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Eye } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { assetUrl } from "@/lib/storage/assets";

const LazyPomeloViewer3D = dynamic(() => import("./PomeloViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] items-center justify-center rounded-[16px] border border-border bg-surface-soft text-sm font-medium text-primary">
      Đang tải mô hình 3D tương tác...
    </div>
  ),
});

class WebGLErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function PomeloViewer3DHost({ autoOpen = false }: { autoOpen?: boolean }) {
  const [opened, setOpened] = useState(autoOpen);

  const fallback2D = (
    <div className="rounded-[16px] border border-border bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Image
          src={assetUrl("stitch/stitch-16.webp")}
          alt="Ảnh cắt đôi Bưởi da xanh Tân Triều (phương án 2D)"
          className="h-56 w-full rounded-[12px] object-cover"
          width={512}
          height={279}
        />
        <div className="flex flex-col justify-center space-y-2">
          <p className="text-sm font-bold text-primary">Chế độ xem 2D dự phòng</p>
          <p className="text-sm text-muted">
            Thiết bị hiện tại chưa bật WebGL hoặc trình duyệt đang giới hạn tăng tốc phần cứng. Ảnh
            chụp thực tế cho thấy lớp vỏ mỏng, cùi trắng bảo vệ và tép bưởi Tân Triều mọng nước.
          </p>
        </div>
      </div>
    </div>
  );

  if (!opened) {
    return (
      <div className="rounded-[16px] border border-border bg-white p-5">
        <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <Image
            src={assetUrl("stitch/stitch-16.webp")}
            alt="Ảnh xem trước Bưởi Tân Triều trước khi bật 3D"
            className="h-44 w-full rounded-[12px] border border-border object-cover"
            width={512}
            height={279}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-primary">
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Trải nghiệm 3D trực quan (Tải theo yêu cầu)</span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground">
              Khám phá cấu tạo quả Bưởi Tân Triều 3D
            </h3>
            <p className="mt-1 text-sm text-muted">
              Xoay, thu phóng và bấm vào 4 điểm chú thích (vỏ tinh dầu, cùi xốp, tép mọng, cuống lá
              cam). Tự động chuyển sang ảnh 2D nếu thiết bị yếu.
            </p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => setOpened(true)}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Xem 3D Bưởi Tân Triều</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WebGLErrorBoundary fallback={fallback2D}>
      <LazyPomeloViewer3D />
    </WebGLErrorBoundary>
  );
}
