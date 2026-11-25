import fs from "node:fs";
import path from "node:path";
import type {
  StudioSampleManifestEntry,
  VideoHealthResponse,
  VideoJobRecord,
} from "./contracts";

export function getWorkerBaseUrl(): string | null {
  const configured = process.env.VIDEO_WORKER_URL?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        if (parsed.hostname === "169.254.169.254") return null;
        return configured.replace(/\/+$/, "");
      }
    } catch {
      return null;
    }
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    // Only connect to a local worker if explicitly configured via VIDEO_WORKER_URL or local non-Vercel startup
    if (process.env.VERCEL === "1") return null;
  }

  const port = Number(process.env.VIDEO_WORKER_PORT || 4090);
  if (!Number.isFinite(port) || port < 1024 || port > 65535) return null;
  return `http://127.0.0.1:${port}`;
}

export function readStudioSamplesManifest(): StudioSampleManifestEntry[] {
  try {
    const manifestPath = path.join(process.cwd(), "public", "media", "studio-samples", "manifest.json");
    if (!fs.existsSync(manifestPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    return Array.isArray(parsed) ? (parsed as StudioSampleManifestEntry[]) : [];
  } catch {
    return [];
  }
}

export function defaultOfflineHealth(samplesCount: number): VideoHealthResponse {
  const aiEnabled = process.env.VIDEO_AI_ENABLED === "true";
  return {
    ok: true,
    workerOnline: false,
    workerMode: "serverless_sample_preview",
    renderer: "ffmpeg",
    aiProvider: {
      name: "muse2api",
      enabled: aiEnabled,
      status: aiEnabled ? "error" : "disabled_manual_login_required",
      note: aiEnabled
        ? "Worker FFmpeg cục bộ chưa chạy; chế độ tạo mới tạm chuyển về xem video mẫu đã kết xuất."
        : "Muse2API đang tắt (chờ chủ dự án đăng nhập thủ công trên máy cục bộ). Đang dùng bộ video FFmpeg mẫu đã kiểm chứng.",
    },
    samplesCount,
    checkedAtIso: new Date().toISOString(),
  };
}

export async function probeWorkerHealth(): Promise<VideoHealthResponse> {
  const samples = readStudioSamplesManifest();
  const baseUrl = getWorkerBaseUrl();
  if (!baseUrl) {
    return defaultOfflineHealth(samples.length);
  }

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!res.ok) {
      return defaultOfflineHealth(samples.length);
    }
    const json = (await res.json()) as VideoHealthResponse;
    return {
      ...json,
      samplesCount: samples.length,
    };
  } catch {
    return defaultOfflineHealth(samples.length);
  }
}

export async function fetchWorkerJson<T>(
  subPath: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<{ online: boolean; status: number; data: T | null }> {
  const baseUrl = getWorkerBaseUrl();
  if (!baseUrl) {
    return { online: false, status: 503, data: null };
  }

  try {
    const res = await fetch(`${baseUrl}${subPath}`, {
      ...init,
      signal: AbortSignal.timeout(init?.timeoutMs ?? 4000),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { online: true, status: res.status, data };
  } catch {
    return { online: false, status: 503, data: null };
  }
}

export function findMatchingSample(targetId?: string, locale?: "vi" | "en"): StudioSampleManifestEntry | null {
  const samples = readStudioSamplesManifest();
  if (!samples.length) return null;
  if (targetId) {
    const exact = samples.find(
      (s) => s.targetId.toLowerCase() === targetId.toLowerCase() || s.sampleId.toLowerCase() === targetId.toLowerCase(),
    );
    if (exact) return exact;
  }
  if (locale) {
    const byLoc = samples.find((s) => s.locale === locale);
    if (byLoc) return byLoc;
  }
  return samples[0] ?? null;
}

export function sampleToPreviewJob(sample: StudioSampleManifestEntry): VideoJobRecord {
  const now = new Date().toISOString();
  return {
    jobId: sample.sampleId,
    idempotencyKey: `sample-${sample.sampleId}`,
    ownerId: "verified-sample-manifest",
    organizationId: "naifarm-samples",
    targetType: sample.targetType,
    targetId: sample.targetId,
    title: sample.locale === "en" ? sample.titleEn : sample.titleVi,
    modeRequested: "FAST",
    modeUsed: sample.modeUsed,
    status: "completed",
    provenanceNote: sample.provenanceLabelVi,
    aspectRatio: sample.aspectRatio,
    locale: sample.locale,
    durationSec: sample.durationSec,
    mp4Url: sample.mp4Path,
    vttUrl: sample.vttPath,
    posterUrl: sample.posterPath,
    qcReport: {
      ok: true,
      videoCodec: sample.videoCodec,
      pixelFormat: sample.pixelFormat,
      audioCodec: sample.audioCodec,
      width: sample.width,
      height: sample.height,
      durationSec: sample.durationSec,
      sizeBytes: sample.sizeBytes,
      sha256: sample.sha256,
      warnings: [],
    },
    createdAtIso: now,
    updatedAtIso: now,
    completedAtIso: now,
  };
}
