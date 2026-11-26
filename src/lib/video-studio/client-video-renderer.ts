import QRCode from "qrcode";
import type { VideoAspectRatio, VideoTemplateId } from "./contracts";

export interface ClientVideoRenderRequest {
  title: string;
  subtitle: string;
  scriptLines: [string, string, string];
  priceLabel: string;
  areaLabel: string;
  ctaLabel: string;
  batchCode: string;
  qrTargetUrl: string;
  imagePaths: string[];
  aspectRatio: VideoAspectRatio;
  templateId: VideoTemplateId;
  locale: "vi" | "en";
  durationSec?: number;
}

export interface ClientVideoRenderResult {
  blob: Blob;
  objectUrl: string;
  vttBlob: Blob;
  vttUrl: string;
  posterUrl: string;
  mimeType: string;
  fileExt: "mp4" | "webm";
  videoCodec: string;
  width: number;
  height: number;
  durationSec: number;
  sizeBytes: number;
  sha256: string;
  fileName: string;
}

function resolveCanvasDims(ratio: VideoAspectRatio): { width: number; height: number } {
  if (ratio === "16:9") return { width: 960, height: 540 };
  if (ratio === "1:1") return { width: 720, height: 720 };
  return { width: 540, height: 960 };
}

function pickSupportedRecorderMime(): { mimeType: string; fileExt: "mp4" | "webm"; codec: string } | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  const candidates: Array<{ mimeType: string; fileExt: "mp4" | "webm"; codec: string }> = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", fileExt: "mp4", codec: "h264" },
    { mimeType: "video/mp4", fileExt: "mp4", codec: "h264" },
    { mimeType: "video/webm;codecs=vp9", fileExt: "webm", codec: "vp9" },
    { mimeType: "video/webm;codecs=vp8", fileExt: "webm", codec: "vp8" },
    { mimeType: "video/webm", fileExt: "webm", codec: "webm" },
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
    } catch {
      // keep scanning
    }
  }
  return { mimeType: "", fileExt: "webm", codec: "browser-default" };
}

async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  zoomFactor = 1.0,
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxRatio = w / Math.max(1, h);
  let drawW = w * zoomFactor;
  let drawH = h * zoomFactor;
  if (imgRatio > boxRatio) {
    drawH = h * zoomFactor;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * zoomFactor;
    drawH = drawW / imgRatio;
  }
  const dx = (w - drawW) / 2;
  const dy = (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = `${current} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) break;
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function formatVttTimestamp(sec: number): string {
  const s = Math.max(0, sec);
  const mins = Math.floor(s / 60);
  const rem = s - mins * 60;
  const whole = Math.floor(rem);
  const ms = Math.round((rem - whole) * 1000);
  return `00:${String(mins).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function buildWebVtt(lines: [string, string, string], durationSec: number): string {
  const seg = durationSec / 3;
  return [
    "WEBVTT",
    "",
    `00:00:00.200 --> ${formatVttTimestamp(seg - 0.15)}`,
    lines[0],
    "",
    `${formatVttTimestamp(seg)} --> ${formatVttTimestamp(seg * 2 - 0.15)}`,
    lines[1],
    "",
    `${formatVttTimestamp(seg * 2)} --> ${formatVttTimestamp(durationSec - 0.1)}`,
    lines[2],
    "",
  ].join("\n");
}

async function computeSha256Hex(blob: Blob): Promise<string> {
  try {
    const buf = await blob.arrayBuffer();
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // fallback below
  }
  return `len-${blob.size.toString(16)}`;
}

export function isClientVideoRenderSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof MediaRecorder === "undefined") return false;
  const testCanvas = document.createElement("canvas");
  return typeof testCanvas.captureStream === "function";
}

/**
 * Real client-side Canvas + MediaRecorder video exporter (Vercel-safe, 100% free, zero external keys).
 * Renders actual selected product photography, NaiFarm V9 brand header, crimson price tag,
 * live subtitles, and an authentic QR traceability code into a playable downloadable video Blob.
 */
export async function renderClientProductVideo(
  req: ClientVideoRenderRequest,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<ClientVideoRenderResult> {
  const codecChoice = pickSupportedRecorderMime();
  if (!codecChoice || !isClientVideoRenderSupported()) {
    throw new Error("BROWSER_MEDIARECORDER_UNSUPPORTED");
  }

  const { width, height } = resolveCanvasDims(req.aspectRatio);
  // Real-time capture duration (6s concise export keeps client render fast & lightweight on phones)
  const effectiveDurationSec = Math.min(Math.max(req.durationSec ?? 6, 4.5), 9);
  const fps = 24;

  const uniqueSources = req.imagePaths.length > 0 ? req.imagePaths : ["/images/stitch/stitch-03.jpg"];
  const [logoImg, qrDataUrl, ...loadedPhotos] = await Promise.all([
    loadImageSafe("/images/stitch/stitch-01.jpg"),
    QRCode.toDataURL(req.qrTargetUrl, {
      width: 220,
      margin: 1,
      color: { dark: "#183D2A", light: "#FFFFFF" },
    }).catch(() => null),
    ...uniqueSources.slice(0, 3).map((src) => loadImageSafe(src)),
  ]);

  if (signal?.aborted) throw new Error("RENDER_CANCELED");

  const qrImg = qrDataUrl ? await loadImageSafe(qrDataUrl) : null;
  const validPhotos = loadedPhotos.filter((img): img is HTMLImageElement => Boolean(img));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_2D_UNAVAILABLE");

  const stream = canvas.captureStream(fps);
  const recorderOptions: MediaRecorderOptions = codecChoice.mimeType
    ? { mimeType: codecChoice.mimeType, videoBitsPerSecond: 2_200_000 }
    : { videoBitsPerSecond: 2_200_000 };
  const recorder = new MediaRecorder(stream, recorderOptions);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  const stopPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const actualMime = recorder.mimeType || codecChoice.mimeType || "video/webm";
      resolve(new Blob(chunks, { type: actualMime }));
    };
    recorder.onerror = () => reject(new Error("MEDIARECORDER_ERROR"));
  });

  const drawFrame = (elapsedSec: number) => {
    const progress = Math.min(1, elapsedSec / effectiveDurationSec);
    const sceneIdx = Math.min(2, Math.floor(progress * 3));
    const sceneLocalT = (progress * 3) - sceneIdx;

    // Warm V9 editorial backdrop
    ctx.fillStyle = "#183D2A";
    ctx.fillRect(0, 0, width, height);

    const activePhoto = validPhotos[sceneIdx % Math.max(1, validPhotos.length)] ?? validPhotos[0];
    if (activePhoto) {
      const zoom = 1.0 + sceneLocalT * 0.06;
      drawCoverImage(ctx, activePhoto, width, height, zoom);
    }

    // Top & bottom crisp legibility gradients (never milky washout)
    const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.34);
    topGrad.addColorStop(0, "rgba(24, 61, 42, 0.88)");
    topGrad.addColorStop(1, "rgba(24, 61, 42, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, height * 0.34);

    const botGrad = ctx.createLinearGradient(0, height * 0.56, 0, height);
    botGrad.addColorStop(0, "rgba(24, 61, 42, 0)");
    botGrad.addColorStop(0.45, "rgba(24, 61, 42, 0.84)");
    botGrad.addColorStop(1, "rgba(24, 61, 42, 0.96)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, height * 0.56, width, height * 0.44);

    // Top-left NaiFarm V9 brand pill
    const pad = Math.round(width * 0.045);
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.beginPath();
    ctx.roundRect(pad, pad, Math.min(240, width * 0.46), 44, 22);
    ctx.fill();

    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad + 6, pad + 6, 32, 32, 8);
      ctx.clip();
      ctx.drawImage(logoImg, pad + 6, pad + 6, 32, 32);
      ctx.restore();
    }
    ctx.fillStyle = "#183D2A";
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("NaiFarm · OCOP", pad + 46, pad + 27);

    // Top-right batch badge
    const badgeW = 148;
    ctx.fillStyle = "#F4C465";
    ctx.beginPath();
    ctx.roundRect(width - pad - badgeW, pad + 4, badgeW, 34, 17);
    ctx.fill();
    ctx.fillStyle = "#3B270C";
    ctx.font = "700 12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`QR: ${req.batchCode}`, width - pad - badgeW / 2, pad + 25);
    ctx.textAlign = "left";

    // Bottom editorial block
    const qrBoxSize = sceneIdx === 2 && qrImg ? Math.round(Math.min(width, height) * 0.22) : 0;
    const textMaxW = width - pad * 2 - (qrBoxSize > 0 ? qrBoxSize + 18 : 0);

    // Crimson price pill
    const priceFont = width >= 720 ? "700 22px system-ui, sans-serif" : "700 18px system-ui, sans-serif";
    ctx.font = priceFont;
    const priceText = req.priceLabel;
    const priceW = Math.min(textMaxW, ctx.measureText(priceText).width + 28);
    const titleBaseY = height - pad - (width >= 720 ? 116 : 138);

    ctx.fillStyle = "#A52C22";
    ctx.beginPath();
    ctx.roundRect(pad, titleBaseY - 46, priceW, 34, 17);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(priceText, pad + 14, titleBaseY - 22);

    // Product Title (Use Vietnamese-complete sans stack so diacritics like 'ề' render without fallback gaps)
    ctx.fillStyle = "#FFFFFF";
    ctx.font =
      width >= 720
        ? '700 31px "Segoe UI", "Be Vietnam Pro", system-ui, sans-serif'
        : '700 23px "Segoe UI", "Be Vietnam Pro", system-ui, sans-serif';
    const titleLines = wrapTextLines(ctx, req.title, textMaxW, 2);
    titleLines.forEach((ln, idx) => {
      ctx.fillText(ln, pad, titleBaseY + idx * (width >= 720 ? 38 : 30));
    });

    // Active subtitle line for current scene
    const captionText = req.scriptLines[sceneIdx] || req.subtitle;
    const captionY = titleBaseY + titleLines.length * (width >= 720 ? 38 : 30) + 12;
    ctx.fillStyle = "#EAF0E5";
    ctx.font = width >= 720 ? "500 17px system-ui, sans-serif" : "500 14px system-ui, sans-serif";
    const capLines = wrapTextLines(ctx, captionText, textMaxW, 2);
    capLines.forEach((ln, idx) => {
      ctx.fillText(ln, pad, captionY + idx * 22);
    });

    // Origin / CTA footer line
    ctx.fillStyle = "#F4C465";
    ctx.font = "600 13px system-ui, sans-serif";
    const footText = sceneIdx === 2 ? req.ctaLabel : `${req.areaLabel} · ${req.subtitle}`;
    ctx.fillText(wrapTextLines(ctx, footText, textMaxW, 1)[0] ?? "", pad, height - pad - 12);

    // Real QR code stamp on Scene 3 (Outro)
    if (sceneIdx === 2 && qrImg && qrBoxSize > 0) {
      const qx = width - pad - qrBoxSize;
      const qy = height - pad - qrBoxSize - 8;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(qx - 6, qy - 6, qrBoxSize + 12, qrBoxSize + 12, 12);
      ctx.fill();
      ctx.drawImage(qrImg, qx, qy, qrBoxSize, qrBoxSize);
    }

    // Subtle real render progress bar along bottom edge
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(0, height - 5, width, 5);
    ctx.fillStyle = "#F4C465";
    ctx.fillRect(0, height - 5, Math.round(width * progress), 5);
  };

  // Draw poster frame (frame 0) and capture authentic JPEG poster
  drawFrame(0);
  const posterUrl = canvas.toDataURL("image/jpeg", 0.86);

  recorder.start(250);
  const startMs = performance.now();

  await new Promise<void>((resolve, reject) => {
    const step = () => {
      if (signal?.aborted) {
        try {
          if (recorder.state !== "inactive") recorder.stop();
        } catch {
          // ignore
        }
        stream.getTracks().forEach((t) => t.stop());
        reject(new Error("RENDER_CANCELED"));
        return;
      }
      const elapsedSec = (performance.now() - startMs) / 1000;
      drawFrame(elapsedSec);
      onProgress?.(Math.min(99, Math.round((elapsedSec / effectiveDurationSec) * 100)));
      if (elapsedSec >= effectiveDurationSec) {
        try {
          if (recorder.state !== "inactive") recorder.stop();
        } catch {
          // ignore
        }
        stream.getTracks().forEach((t) => t.stop());
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const blob = await stopPromise;
  if (blob.size <= 0) {
    throw new Error("EMPTY_VIDEO_BLOB");
  }
  onProgress?.(100);

  const actualMime = blob.type || codecChoice.mimeType || "video/webm";
  const actualExt: "mp4" | "webm" = actualMime.includes("mp4") ? "mp4" : "webm";
  const safeSlug = req.batchCode.toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "naifarm-video";
  const fileName = `naifarm-${safeSlug}-${req.aspectRatio.replace(":", "x")}.${actualExt}`;

  const vttContent = buildWebVtt(req.scriptLines, effectiveDurationSec);
  const vttBlob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
  const sha256 = await computeSha256Hex(blob);

  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    vttBlob,
    vttUrl: URL.createObjectURL(vttBlob),
    posterUrl,
    mimeType: actualMime,
    fileExt: actualExt,
    videoCodec: codecChoice.codec,
    width,
    height,
    durationSec: Number(effectiveDurationSec.toFixed(1)),
    sizeBytes: blob.size,
    sha256,
    fileName,
  };
}
