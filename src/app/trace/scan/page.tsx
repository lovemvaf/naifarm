"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CameraOff,
  CheckCircle2,
  Pause,
  Play,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  SwitchCamera,
  Upload,
} from "lucide-react";
import { extractBatchCodeFromScan } from "@/lib/qr/trace-url";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";
import type { Product, TraceBatch } from "@/types/naifarm";

type CameraState =
  | "idle"
  | "requesting_permission"
  | "camera_active"
  | "scanning"
  | "decoded"
  | "invalid_qr"
  | "camera_stopped"
  | "permission_denied"
  | "camera_unavailable"
  | "device_busy"
  | "unsupported_browser"
  | "insecure_context"
  | "camera_disconnected";

type FacingMode = "environment" | "user";

interface BarcodeDetectorLike {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
}

const ALLOWED_IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SCAN_INTERVAL_MS = 180;

function createNativeBarcodeDetector(): BarcodeDetectorLike | null {
  if (typeof window === "undefined") return null;
  const ctor = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  if (!ctor) return null;
  try {
    return new ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

async function decodeQrFromImageFile(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
    throw new Error("UNSUPPORTED_MIME");
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("INVALID_IMAGE"));
      el.src = objectUrl;
    });

    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    if (natW <= 0 || natH <= 0) {
      throw new Error("INVALID_IMAGE");
    }

    // Try native BarcodeDetector first when supported
    const detector = createNativeBarcodeDetector();
    if (detector) {
      try {
        const hits = await detector.detect(img);
        const val = hits.find((h) => h.rawValue)?.rawValue;
        if (val) return val;
      } catch {
        // Fall through cleanly to jsQR canvas decoding
      }
    }

    // Multi-scale jsQR local decoding (handles full-res + high-DPI phone camera photos cleanly)
    const maxDims = [Math.min(natW, 1400), 900, 520];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("CANVAS_UNSUPPORTED");

    for (const targetMax of maxDims) {
      const scale = Math.min(1, targetMax / Math.max(natW, natH));
      const w = Math.max(1, Math.round(natW * scale));
      const h = Math.max(1, Math.round(natH * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const decoded = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
      if (decoded?.data) {
        return decoded.data;
      }
    }

    throw new Error("NO_QR_FOUND");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function TraceScanPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { batches, products, farms } = useDemoStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const sessionTokenRef = useRef(0);
  const lastScanTsRef = useRef(0);
  const lastRejectedRawRef = useRef<string | null>(null);
  const scanPausedRef = useRef(false);
  const isEnRef = useRef(isEn);
  const batchesRef = useRef(batches);
  const productsRef = useRef(products);

  useEffect(() => {
    isEnRef.current = isEn;
  }, [isEn]);
  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [scanPaused, setScanPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [lastRawResult, setLastRawResult] = useState<string | null>(null);
  const [matchedResult, setMatchedResult] = useState<{
    kind: "batch" | "product";
    batch?: TraceBatch;
    product?: Product;
    href: string;
    rawValue: string;
  } | null>(null);

  const stopCameraTracks = useCallback((nextState: CameraState = "camera_stopped") => {
    sessionTokenRef.current += 1;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore
      }
      videoRef.current.srcObject = null;
    }
    scanPausedRef.current = false;
    setScanPaused(false);
    setCameraState(nextState);
  }, []);

  // Cleanup camera & decoding loop on unmount / route change (handles in-flight getUserMedia race cleanly)
  useEffect(() => {
    return () => {
      sessionTokenRef.current += 1;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.onended = null;
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        streamRef.current = null;
      }
    };
  }, []);

  const processDecodedPayload = useCallback(
    (
      rawText: string,
      source: "camera" | "image" | "manual",
      autoNavigate: boolean,
    ): boolean => {
      const en = isEnRef.current;
      const runtimeHost = typeof window !== "undefined" ? window.location.hostname : undefined;
      setLastRawResult(rawText);

      const parsed = extractBatchCodeFromScan(rawText, runtimeHost);
      if (!parsed.ok || !parsed.safePath) {
        const msg = (en ? parsed.reasonEn : parsed.reason) ?? (en ? "Invalid QR payload." : "Mã QR không hợp lệ.");
        if (source === "camera") {
          if (lastRejectedRawRef.current !== rawText) {
            lastRejectedRawRef.current = rawText;
            setCameraState("invalid_qr");
            setCameraError(msg);
            notifyError(msg);
          }
        } else if (source === "image") {
          setUploadError(msg);
          notifyError(msg);
        } else {
          setManualError(msg);
          notifyError(msg);
        }
        return false;
      }

      if (parsed.kind === "batch" && parsed.batchCode) {
        const foundBatch = batchesRef.current.find(
          (b) => b.batchCode.toUpperCase() === parsed.batchCode,
        );
        if (!foundBatch) {
          const msg = en
            ? `Decoded batch "${parsed.batchCode}", but no matching harvest lot exists in the current registry.`
            : `Đã đọc mã lô "${parsed.batchCode}" nhưng không tìm thấy trong hồ sơ truy xuất hiện hành.`;
          if (source === "camera") {
            if (lastRejectedRawRef.current !== rawText) {
              lastRejectedRawRef.current = rawText;
              setCameraState("invalid_qr");
              setCameraError(msg);
            }
          } else if (source === "image") {
            setUploadError(msg);
          } else {
            setManualError(msg);
          }
          return false;
        }

        const linkedProduct = productsRef.current.find((p) => p.batchCode === foundBatch.batchCode);
        const href = buildLocalizedHref(`/trace/${encodeURIComponent(foundBatch.batchCode)}`, en ? "en" : "vi");
        lastRejectedRawRef.current = null;
        setCameraError(null);
        setUploadError(null);
        setManualError(null);
        setMatchedResult({
          kind: "batch",
          batch: foundBatch,
          product: linkedProduct,
          href,
          rawValue: rawText,
        });
        if (source === "camera") {
          stopCameraTracks("decoded");
        }
        notifySuccess(
          en
            ? `Verified batch lot ${foundBatch.batchCode}.`
            : `Đã nhận diện mã lô ${foundBatch.batchCode}.`,
        );
        if (autoNavigate) {
          router.push(href);
        }
        return true;
      }

      if (parsed.kind === "product" && parsed.productSlug) {
        const foundProduct = productsRef.current.find(
          (p) => p.slug.toLowerCase() === parsed.productSlug,
        );
        if (!foundProduct) {
          const msg = en
            ? `Product "${parsed.productSlug}" was not found in the active catalog.`
            : `Không tìm thấy sản phẩm "${parsed.productSlug}" trong danh mục hiện hành.`;
          if (source === "image") setUploadError(msg);
          else if (source === "manual") setManualError(msg);
          else setCameraError(msg);
          return false;
        }
        const href = buildLocalizedHref(`/products/${encodeURIComponent(foundProduct.slug)}`, en ? "en" : "vi");
        lastRejectedRawRef.current = null;
        setCameraError(null);
        setUploadError(null);
        setManualError(null);
        setMatchedResult({
          kind: "product",
          product: foundProduct,
          href,
          rawValue: rawText,
        });
        if (source === "camera") {
          stopCameraTracks("decoded");
        }
        notifySuccess(
          en ? `Matched product ${foundProduct.enName ?? foundProduct.name}.` : `Đã nhận diện ${foundProduct.name}.`,
        );
        if (autoNavigate) {
          router.push(href);
        }
        return true;
      }

      return false;
    },
    [router, stopCameraTracks],
  );

  const startDecodeLoop = useCallback(
    (token: number) => {
      if (!detectorRef.current) {
        detectorRef.current = createNativeBarcodeDetector();
      }
      if (!canvasRef.current && typeof document !== "undefined") {
        canvasRef.current = document.createElement("canvas");
      }

      const tick = async (ts: number) => {
        if (sessionTokenRef.current !== token) return;
        const video = videoRef.current;
        if (
          !scanPausedRef.current &&
          video &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth > 0 &&
          video.videoHeight > 0 &&
          ts - lastScanTsRef.current >= SCAN_INTERVAL_MS
        ) {
          lastScanTsRef.current = ts;
          try {
            let decodedText: string | null = null;
            if (detectorRef.current) {
              try {
                const hits = await detectorRef.current.detect(video);
                decodedText = hits.find((h) => h.rawValue)?.rawValue ?? null;
              } catch {
                // Fall back to jsQR below
              }
            }

            if (!decodedText && canvasRef.current) {
              const canvas = canvasRef.current;
              const maxW = Math.min(video.videoWidth, 640);
              const scale = maxW / video.videoWidth;
              const w = Math.max(1, Math.round(video.videoWidth * scale));
              const h = Math.max(1, Math.round(video.videoHeight * scale));
              if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
              }
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(video, 0, 0, w, h);
                const imgData = ctx.getImageData(0, 0, w, h);
                const qr = jsQR(imgData.data, w, h, { inversionAttempts: "dontInvert" });
                if (qr?.data) {
                  decodedText = qr.data;
                }
              }
            }

            if (sessionTokenRef.current !== token) return;
            if (decodedText) {
              const matched = processDecodedPayload(decodedText, "camera", false);
              if (matched) return; // Loop stops on valid decode
            }
          } catch {
            // Keep scanning safely on transient frame errors
          }
        }
        if (sessionTokenRef.current === token) {
          rafRef.current = requestAnimationFrame((nextTs) => {
            void tick(nextTs);
          });
        }
      };

      rafRef.current = requestAnimationFrame((nextTs) => {
        void tick(nextTs);
      });
    },
    [processDecodedPayload],
  );

  const startCamera = useCallback(
    async (requestedFacing: FacingMode) => {
      setCameraError(null);
      lastRejectedRawRef.current = null;

      if (typeof window === "undefined") return;
      const host = window.location.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      if (!window.isSecureContext && !isLocal) {
        setCameraState("insecure_context");
        setCameraError(
          isEnRef.current
            ? "Live camera requires HTTPS or localhost. Use QR image upload or manual batch lookup below."
            : "Quét camera trực tiếp yêu cầu kết nối HTTPS an toàn hoặc localhost. Bạn có thể tải ảnh QR hoặc nhập mã lô bên dưới.",
        );
        return;
      }

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
        setCameraState("unsupported_browser");
        setCameraError(
          isEnRef.current
            ? "This browser does not expose camera access (getUserMedia). Upload a QR image or enter a batch code instead."
            : "Trình duyệt hiện tại không hỗ trợ truy cập camera (getUserMedia). Hãy tải ảnh mã QR hoặc nhập mã lô.",
        );
        return;
      }

      // Stop any existing stream BEFORE requesting a new one
      stopCameraTracks("requesting_permission");
      const token = sessionTokenRef.current;

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: requestedFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (constraintErr) {
          const name = constraintErr instanceof DOMException ? constraintErr.name : "";
          if (name === "OverconstrainedError" || name === "NotFoundError") {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } else {
            throw constraintErr;
          }
        }

        // Guard against unmount or user clicking Stop while awaiting permission
        if (sessionTokenRef.current !== token) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          stream.getTracks().forEach((t) => t.stop());
          setCameraState("camera_unavailable");
          setCameraError(
            isEnRef.current
              ? "No video track available from the selected camera."
              : "Không nhận được luồng hình ảnh từ thiết bị camera.",
          );
          return;
        }

        videoTracks[0].onended = () => {
          if (sessionTokenRef.current === token) {
            stopCameraTracks("camera_disconnected");
            setCameraError(
              isEnRef.current
                ? "Camera disconnected unexpectedly. Tap Start Camera to reconnect."
                : "Camera bị ngắt kết nối đột ngột. Nhấn Bật lại camera để tiếp tục.",
            );
          }
        };

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stopCameraTracks("camera_stopped");
          return;
        }

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;
        await video.play();

        if (sessionTokenRef.current !== token) {
          stopCameraTracks("camera_stopped");
          return;
        }

        setFacingMode(requestedFacing);
        setCameraState("scanning");
        startDecodeLoop(token);
      } catch (err) {
        if (sessionTokenRef.current !== token) return;
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
          setCameraState("permission_denied");
          setCameraError(
            isEnRef.current
              ? "Camera permission was denied. Allow camera access in browser site settings or upload a QR photo."
              : "Bạn đã từ chối quyền camera. Hãy cấp quyền camera trong cài đặt trình duyệt hoặc dùng mục Tải ảnh QR.",
          );
        } else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
          setCameraState("device_busy");
          setCameraError(
            isEnRef.current
              ? "Camera is currently in use by another app or cannot start. Close other apps using the camera and retry."
              : "Camera đang được ứng dụng khác sử dụng hoặc chưa sẵn sàng. Hãy tắt ứng dụng khác rồi thử lại.",
          );
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setCameraState("camera_unavailable");
          setCameraError(
            isEnRef.current
              ? "No camera device detected on this device. Use QR image upload or manual code lookup."
              : "Không tìm thấy thiết bị camera trên máy này. Hãy tải ảnh QR hoặc nhập mã lô bên dưới.",
          );
        } else {
          setCameraState("camera_unavailable");
          setCameraError(
            isEnRef.current
              ? "Unable to start camera stream. Please use QR image upload or manual lookup."
              : "Không thể khởi động camera. Vui lòng thử Tải ảnh QR hoặc nhập mã lô thủ công.",
          );
        }
      }
    },
    [startDecodeLoop, stopCameraTracks],
  );

  const handleTogglePause = () => {
    const next = !scanPaused;
    scanPausedRef.current = next;
    setScanPaused(next);
    setCameraState(next ? "camera_active" : "scanning");
  };

  const handleSwitchCamera = () => {
    const nextFacing: FacingMode = facingMode === "environment" ? "user" : "environment";
    void startCamera(nextFacing);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadBusy(true);
    try {
      const decoded = await decodeQrFromImageFile(file);
      processDecodedPayload(decoded, "image", false);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      let msg: string;
      if (code === "UNSUPPORTED_MIME") {
        msg = isEn
          ? "Unsupported file type. Please choose a PNG, JPG, JPEG, or WebP image."
          : "Định dạng ảnh chưa hỗ trợ. Vui lòng chọn tệp PNG, JPG, JPEG hoặc WebP.";
      } else if (code === "FILE_TOO_LARGE") {
        msg = isEn
          ? "Image exceeds 10 MB limit. Please pick a smaller photo."
          : "Dung lượng ảnh vượt quá 10 MB. Vui lòng chọn ảnh nhỏ hơn.";
      } else if (code === "NO_QR_FOUND") {
        msg = isEn
          ? "No readable QR code detected in this image. Ensure sharp focus and good lighting."
          : "Không tìm thấy mã QR rõ nét trong ảnh này. Hãy chọn ảnh thẳng góc và đủ sáng hơn.";
      } else {
        msg = isEn
          ? "Could not read this image file. Please try another QR photo."
          : "Không đọc được tệp ảnh đã chọn. Vui lòng thử ảnh QR khác.";
      }
      setUploadError(msg);
      notifyError(msg);
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  };

  const isLiveStreamOn =
    cameraState === "scanning" || cameraState === "camera_active" || cameraState === "invalid_qr";

  const statusBadge = useMemo(() => {
    switch (cameraState) {
      case "requesting_permission":
        return { tone: "info" as const, text: isEn ? "Requesting camera..." : "Đang xin quyền..." };
      case "scanning":
        return { tone: "success" as const, text: isEn ? "Live Scanning" : "Đang quét trực tiếp" };
      case "camera_active":
        return { tone: "gold" as const, text: isEn ? "Camera Paused" : "Tạm dừng quét" };
      case "decoded":
        return { tone: "success" as const, text: isEn ? "QR Decoded" : "Đã giải mã QR" };
      case "invalid_qr":
        return { tone: "warning" as const, text: isEn ? "Unrecognized QR" : "QR chưa hợp lệ" };
      case "permission_denied":
        return { tone: "danger" as const, text: isEn ? "Permission Denied" : "Bị từ chối quyền" };
      case "device_busy":
        return { tone: "warning" as const, text: isEn ? "Camera Busy" : "Camera đang bận" };
      case "camera_unavailable":
      case "camera_disconnected":
      case "unsupported_browser":
      case "insecure_context":
        return { tone: "warning" as const, text: isEn ? "Camera Unavailable" : "Camera chưa khả dụng" };
      default:
        return { tone: "neutral" as const, text: isEn ? "Camera Off" : "Camera đang tắt" };
    }
  }, [cameraState, isEn]);

  const matchedFarm = useMemo(() => {
    if (!matchedResult) return null;
    const fId = matchedResult.batch?.farmId ?? matchedResult.product?.farmId;
    return fId ? farms.find((f) => f.id === fId) ?? null : null;
  }, [matchedResult, farms]);

  return (
    <div className="mx-auto max-w-[1040px] space-y-6 px-3 py-6 sm:px-4 lg:px-6 lg:py-8">
      <div>
        <Badge tone="success">
          {isEn
            ? "QR Traceability Scanner · Live Camera & Local Image Decode"
            : "Quét tem truy xuất nguồn gốc · Camera trực tiếp & Ảnh cục bộ"}
        </Badge>
        <h1 className="mt-2 font-editorial text-2xl font-bold text-[#25352B] sm:text-3xl">
          {isEn
            ? "Scan & Verify Produce QR Passport"
            : "Quét & Kiểm tra Hộ chiếu Nông sản QR"}
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          {isEn
            ? "Scan directly via your device camera, decode a saved QR photo locally in your browser, or enter a harvest batch code."
            : "Bật camera trực tiếp sau khi cấp quyền, giải mã tệp ảnh QR cục bộ ngay trên trình duyệt hoặc nhập mã lô truy xuất."}
        </p>
      </div>

      <DemoBanner
        title={isEn ? "Camera Privacy & Link Security" : "An toàn quét mã & Quyền riêng tư"}
        detail={
          isEn
            ? "Video frames and uploaded QR images are decoded 100% locally in your browser without uploading camera footage. Untrusted external URLs and unsafe protocols are automatically blocked."
            : "Khung hình camera và ảnh QR được giải mã hoàn toàn cục bộ trên trình duyệt, không gửi video lên máy chủ. Mọi liên kết ngoài tên miền NaiFarm hoặc giao thức bất thường đều bị chặn."
        }
      />

      {/* Verified Decode Result Card */}
      {matchedResult ? (
        <Card
          data-qr-matched="true"
          className="border-2 border-[#245B3D] bg-[#EAF0E5]/70 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                  {isEn ? "Valid NaiFarm Trace Record" : "Hồ sơ truy xuất NaiFarm hợp lệ"}
                </Badge>
                {matchedResult.batch ? (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#245B3D] tabular-nums">
                    {matchedResult.batch.batchCode}
                  </span>
                ) : null}
              </div>
              <h2 className="font-editorial text-xl font-bold text-[#25352B]">
                {matchedResult.product
                  ? isEn && matchedResult.product.enName
                    ? matchedResult.product.enName
                    : matchedResult.product.name
                  : matchedResult.batch?.productName}
              </h2>
              <p className="text-xs text-[#52645A]">
                {matchedFarm ? `${matchedFarm.name} · ${matchedFarm.administrativeUnitName}` : matchedResult.batch?.farmName}
                {matchedResult.batch?.harvestDate
                  ? ` · ${isEn ? "Harvest:" : "Thu hoạch:"} ${matchedResult.batch.harvestDate}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={matchedResult.href}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] bg-[#245B3D] px-5 text-xs font-semibold text-white hover:bg-[#183D2A]"
              >
                <span>{isEn ? "Open Full Passport" : "Mở Hộ chiếu đầy đủ"}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMatchedResult(null);
                  setLastRawResult(null);
                }}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border border-[#D6DED2] bg-white px-4 text-xs font-semibold text-[#25352B] hover:bg-[#FAF8F1]"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? "Scan Another" : "Quét mã khác"}</span>
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1: Real Live Camera Scanner */}
        <Card className="space-y-4 p-4 sm:p-5 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Camera className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>{isEn ? "1. Live Camera Scanner" : "1. Quét bằng Camera trực tiếp"}</span>
            </h2>
            <Badge tone={statusBadge.tone}>{statusBadge.text}</Badge>
          </div>

          <div
            data-camera-state={cameraState}
            className="relative flex aspect-[4/3] max-h-[360px] w-full items-center justify-center overflow-hidden rounded-[14px] border border-[#D6DED2] bg-[#18241D]"
          >
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={isLiveStreamOn ? "h-full w-full object-cover" : "hidden"}
            />

            {/* Crisp centered viewfinder frame when camera is live */}
            {isLiveStreamOn ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="h-44 w-44 rounded-[16px] border-2 border-[#F4C465] shadow-[0_0_0_9999px_rgba(24,36,29,0.32)] sm:h-48 sm:w-48" />
              </div>
            ) : (
              <div className="px-6 text-center text-xs text-white/85">
                <QrCode className="mx-auto mb-2.5 h-10 w-10 text-[#F4C465]" aria-hidden="true" />
                <p className="font-medium">
                  {cameraState === "requesting_permission"
                    ? isEn
                      ? "Waiting for camera permission in your browser..."
                      : "Đang chờ bạn xác nhận cấp quyền camera trên trình duyệt..."
                    : isEn
                    ? "Camera is off. Tap Start Camera below to scan a NaiFarm QR label."
                    : "Camera chưa bật. Nhấn Bật camera bên dưới để quét tem QR trên bao bì nông sản."}
                </p>
              </div>
            )}
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

          <div className="flex flex-wrap gap-2">
            {!isLiveStreamOn ? (
              <button
                type="button"
                data-qr-start-camera="true"
                disabled={cameraState === "requesting_permission"}
                onClick={() => void startCamera(facingMode)}
                className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#183D2A] disabled:opacity-60"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>
                  {cameraState === "requesting_permission"
                    ? isEn
                      ? "Starting camera..."
                      : "Đang mở camera..."
                    : isEn
                    ? "Start Camera Scanner"
                    : "Bật camera quét QR"}
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  data-qr-stop-camera="true"
                  onClick={() => stopCameraTracks("camera_stopped")}
                  className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#A52C22] px-3.5 text-xs font-semibold text-white hover:bg-[#82221A]"
                >
                  <CameraOff className="h-4 w-4" aria-hidden="true" />
                  <span>{isEn ? "Stop" : "Tắt camera"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                >
                  {scanPaused ? (
                    <Play className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  ) : (
                    <Pause className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  )}
                  <span>{scanPaused ? (isEn ? "Resume" : "Quét tiếp") : isEn ? "Pause" : "Tạm dừng"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  aria-label={isEn ? "Switch front/back camera" : "Đổi camera trước/sau"}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3.5 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                >
                  <SwitchCamera className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  <span className="hidden sm:inline">{isEn ? "Flip" : "Đổi cam"}</span>
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Column 2: Local QR Image Upload + Manual Batch Lookup */}
        <div className="space-y-4 lg:col-span-6">
          <Card className="space-y-3 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Upload className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn
                  ? "2. Upload QR Image (PNG / JPG / WebP)"
                  : "2. Tải ảnh mã QR từ thiết bị (PNG / JPG / WebP)"}
              </span>
            </h2>
            <p className="text-xs text-[#52645A]">
              {isEn
                ? "Decoded locally in your browser with jsQR & BarcodeDetector. Maximum 10 MB; never uploaded to external servers."
                : "Giải mã trực tiếp ngay trong trình duyệt (tối đa 10 MB, không gửi ảnh lên máy chủ)."}
            </p>
            <label
              htmlFor="qr-file-upload"
              className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#6C9C5B] bg-[#FAF8F1] px-4 py-4 text-center transition-colors hover:bg-[#EAF0E5]"
            >
              <Upload className="mb-1.5 h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span className="text-xs font-bold text-[#245B3D]">
                {uploadBusy
                  ? isEn
                    ? "Decoding QR image locally..."
                    : "Đang giải mã ảnh QR..."
                  : isEn
                  ? "Choose a QR image file..."
                  : "Chọn tệp ảnh chứa mã QR..."}
              </span>
              <span className="mt-0.5 text-[11px] text-[#52645A]">
                {isEn ? "PNG, JPG, JPEG, or WebP" : "Hỗ trợ PNG, JPG, JPEG, WebP"}
              </span>
              <input
                id="qr-file-upload"
                data-qr-file-input="true"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>

            {lastRawResult ? (
              <p className="flex items-center gap-1.5 rounded-lg bg-[#EAF0E5] px-3 py-2 text-xs text-[#245B3D]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {isEn ? "Last decoded payload:" : "Nội dung vừa giải mã:"} {lastRawResult}
                </span>
              </p>
            ) : null}

            {uploadError ? (
              <div
                role="alert"
                data-qr-upload-error="true"
                className="flex items-start gap-2 rounded-[10px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            ) : null}
          </Card>

          <Card className="space-y-3 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Search className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn
                  ? "3. Enter Harvest Batch Code or Trace Link"
                  : "3. Nhập mã lô hoặc đường dẫn truy xuất"}
              </span>
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setManualError(null);
                processDecodedPayload(manualInput, "manual", true);
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                data-qr-manual-input="true"
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value);
                  if (manualError) setManualError(null);
                }}
                placeholder={
                  isEn
                    ? "e.g. NF-DEMO-001 or /trace/NF-TT-2026-01"
                    : "Ví dụ: NF-DEMO-001 hoặc /trace/NF-TT-2026-01"
                }
                aria-label={isEn ? "Batch code or trace URL" : "Nhập mã lô hoặc URL QR"}
                className="min-h-[44px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B]"
              />
              <button
                type="submit"
                data-qr-manual-submit="true"
                className="min-h-[44px] cursor-pointer rounded-[10px] bg-[#245B3D] px-5 text-xs font-semibold text-white hover:bg-[#183D2A]"
              >
                {isEn ? "Verify & Open" : "Kiểm tra & Mở"}
              </button>
            </form>

            {manualError ? (
              <div
                role="alert"
                data-qr-manual-error="true"
                className="flex items-start gap-2 rounded-[10px] border border-[#A32D2D]/30 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{manualError}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#52645A]">
                {isEn ? "Sample codes:" : "Mã lô mẫu:"}
              </span>
              {["NF-DEMO-001", "NF-TT-2026-01", "NF-XL-2026-03", "NF-DN-099"].map((sample) => (
                <Link
                  key={sample}
                  href={buildLocalizedHref(`/trace/${sample}`, locale)}
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
