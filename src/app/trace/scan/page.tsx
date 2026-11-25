"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import jsQR from "jsqr";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  QrCode,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { extractBatchCodeFromScan } from "@/lib/qr/trace-url";
import { useDemoStore } from "@/context/DemoStoreContext";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";

async function decodeImageFallbackWithJsQr(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Không đọc được tệp ảnh."));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Ảnh tải lên không hợp lệ."));
    el.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý canvas.");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = jsQR(imageData.data, imageData.width, imageData.height);
  if (!decoded?.data) {
    throw new Error("Không tìm thấy mã QR rõ nét trong ảnh.");
  }
  return decoded.data;
}

export default function TraceScanPage() {
  const router = useRouter();
  const { batches } = useDemoStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("NF-DEMO-001");
  const [lastRawResult, setLastRawResult] = useState<string | null>(null);

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  const handleDecodedPayload = (rawText: string) => {
    setLastRawResult(rawText);
    const parsed = extractBatchCodeFromScan(rawText);
    if (!parsed.ok || !parsed.batchCode) {
      setUploadError(parsed.reason ?? "Nội dung mã QR không hợp lệ.");
      toast.error(parsed.reason ?? "Không hợp lệ");
      return;
    }
    const found = batches.find((b) => b.batchCode.toUpperCase() === parsed.batchCode);
    if (!found) {
      setUploadError(
        `Đã đọc được mã lô "${parsed.batchCode}" nhưng mã này chưa có trong hệ thống demo. Hãy thử NF-DEMO-001 hoặc NF-TT-2026-01.`,
      );
      return;
    }
    setUploadError(null);
    stopCamera();
    toast.success(`Đã quét thành công lô ${found.batchCode}!`);
    router.push(`/trace/${encodeURIComponent(found.batchCode)}`);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    if (typeof window === "undefined") return;
    const isLocalHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalHost) {
      setCameraError("Quét camera trực tiếp yêu cầu kết nối HTTPS an toàn hoặc localhost.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Trình duyệt không hỗ trợ bật camera. Bạn có thể tải ảnh mã QR hoặc nhập mã lô bên dưới.",
      );
      return;
    }
    if (!videoRef.current) return;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleDecodedPayload(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setCameraActive(true);
    } catch {
      stopCamera();
      setCameraError(
        "Không truy cập được camera (có thể người dùng từ chối quyền hoặc thiết bị chưa có webcam). Hãy dùng tính năng Tải ảnh QR hoặc Nhập mã lô.",
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const res = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      handleDecodedPayload(res.data);
    } catch {
      try {
        const fallbackData = await decodeImageFallbackWithJsQr(file);
        handleDecodedPayload(fallbackData);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Không giải mã được QR từ ảnh đã chọn. Hãy chọn ảnh rõ nét hơn.";
        setUploadError(msg);
        toast.error(msg);
      }
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">Trình quét QR Thực tế · Camera &amp; Tải ảnh PNG/JPG</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Quét &amp; Kiểm tra Hộ chiếu Nông sản QR
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Hỗ trợ bật camera trực tiếp, tải lên tệp ảnh mã QR (PNG/JPG) hoặc nhập mã lô thủ công với
          bộ lọc bảo mật chống liên kết độc hại.
        </p>
      </div>

      <DemoBanner
        title="An toàn quét mã & Quyền riêng tư"
        detail="Camera chỉ bật khi bạn nhấn nút 'Bật camera quét QR' và xử lý trực tiếp trên trình duyệt. Mọi URL ngoài hệ thống hoặc giao thức javascript:/data: đều bị chặn tự động."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Camera Scanner */}
        <Card className="space-y-4 p-5 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Camera className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Quét bằng Camera trực tiếp</span>
            </h2>
            {cameraActive ? <Badge tone="success">Đang bật</Badge> : <Badge tone="neutral">Đang tắt</Badge>}
          </div>

          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[14px] border border-[#D6DED2] bg-[#1D2821]">
            <video
              ref={videoRef}
              muted
              playsInline
              className={cameraActive ? "h-full w-full object-cover" : "hidden"}
            />
            {!cameraActive ? (
              <div className="px-6 text-center text-xs text-white/85">
                <QrCode className="mx-auto mb-2 h-10 w-10 text-[#D7A34D]" aria-hidden="true" />
                <p>Camera chưa bật. Nhấn nút bên dưới để bắt đầu quét tem QR trên bao bì nông sản.</p>
              </div>
            ) : null}
          </div>

          {cameraError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[10px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{cameraError}</span>
            </div>
          ) : null}

          <div className="flex gap-2">
            {!cameraActive ? (
              <button
                type="button"
                onClick={handleStartCamera}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>Bật camera quét QR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#A32D2D] px-4 text-xs font-semibold text-white hover:bg-[#822222]"
              >
                <CameraOff className="h-4 w-4" aria-hidden="true" />
                <span>Tắt camera</span>
              </button>
            )}
          </div>
        </Card>

        {/* Image Upload & Manual Entry */}
        <div className="space-y-4 lg:col-span-6">
          <Card className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Upload className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Tải ảnh mã QR từ thiết bị (PNG / JPG)</span>
            </h2>
            <p className="text-xs text-[#52645A]">
              Phù hợp khi bạn tải xuống tem PNG từ Hộ chiếu sản phẩm hoặc test giải mã không cần
              camera.
            </p>
            <label
              htmlFor="qr-file-upload"
              className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#6C9C5B] bg-[#FAF8F1] px-4 py-4 text-center hover:bg-[#EAF0E5]"
            >
              <Upload className="mb-1.5 h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span className="text-xs font-bold text-[#245B3D]">
                Chọn tệp ảnh chứa mã QR...
              </span>
              <span className="mt-0.5 text-[11px] text-[#52645A]">
                Hỗ trợ PNG, JPG, WebP (xử lý trực tiếp trên trình duyệt)
              </span>
              <input
                id="qr-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>

            {lastRawResult ? (
              <p className="flex items-center gap-1.5 rounded-lg bg-[#EAF0E5] px-3 py-2 text-xs text-[#245B3D]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Nội dung vừa giải mã: {lastRawResult}</span>
              </p>
            ) : null}

            {uploadError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[10px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            ) : null}
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Search className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Nhập mã lô hoặc đường dẫn truy xuất</span>
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDecodedPayload(manualInput);
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ví dụ: NF-DEMO-001 hoặc URL /trace/NF-TT-2026-01"
                aria-label="Nhập mã lô hoặc URL QR"
                className="min-h-[44px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-[10px] bg-[#245B3D] px-5 text-xs font-semibold text-white hover:bg-[#19472E]"
              >
                Kiểm tra &amp; Mở
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#52645A]">Mã mẫu nhanh:</span>
              {["NF-DEMO-001", "NF-TT-2026-01", "NF-XL-2026-03"].map((sample) => (
                <Link
                  key={sample}
                  href={`/trace/${sample}`}
                  className="rounded-full border border-[#D6DED2] bg-[#FAF8F1] px-3 py-1 font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                >
                  {sample}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
