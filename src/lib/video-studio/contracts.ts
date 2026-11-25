import { z } from "zod";

export type VideoRenderMode = "FAST" | "HYBRID" | "CINEMATIC";
export type VideoAspectRatio = "9:16" | "16:9" | "1:1";
export type VideoTemplateId = "commercial_30s" | "producer_story" | "agritourism_promo";

export type VideoJobStatus =
  | "queued"
  | "preparing"
  | "generating_ai"
  | "rendering"
  | "validating"
  | "uploading"
  | "completed"
  | "failed"
  | "canceled"
  | "needs_reconciliation"
  | "pending_upload";

export function isSafeLocalImagePath(p: string): boolean {
  if (!p || p.length > 260) return false;
  if (p.includes("..") || p.includes("\\") || p.startsWith("//") || /^[a-z]+:/i.test(p)) {
    return false;
  }
  return (
    (p.startsWith("/images/") || p.startsWith("/media/")) &&
    /\.(jpe?g|png|webp)$/i.test(p)
  );
}

export const CreateVideoJobInputSchema = z.object({
  idempotencyKey: z.string().min(6).max(120),
  ownerId: z.string().min(2).max(80).default("demo-w02-chu-ba-tu"),
  organizationId: z.string().max(80).default("org-tt-scenario"),
  targetType: z.enum(["product", "tour"]).default("product"),
  targetId: z.string().min(1).max(60),
  title: z.string().min(3).max(140),
  subtitle: z.string().min(2).max(220),
  scriptLines: z.array(z.string().min(2).max(160)).min(2).max(6),
  priceLabel: z.string().min(1).max(60),
  areaLabel: z.string().min(2).max(100),
  ctaLabel: z.string().min(2).max(90),
  batchCode: z.string().min(2).max(50),
  qrTargetUrl: z
    .string()
    .url()
    .refine(
      (u) => u.startsWith("https://") || u.startsWith("http://localhost") || u.startsWith("http://127.0.0.1"),
      "Only safe HTTPS or local HTTP QR URLs allowed",
    )
    .default("https://naifarm.vercel.app/trace/NF-TT-2026-01"),
  imagePaths: z
    .array(z.string().refine(isSafeLocalImagePath, "Image path must be safe /images/... or /media/... asset"))
    .min(1)
    .max(5),
  modeRequested: z.enum(["FAST", "HYBRID", "CINEMATIC"]).default("FAST"),
  templateId: z.enum(["commercial_30s", "producer_story", "agritourism_promo"]).default("commercial_30s"),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  locale: z.enum(["vi", "en"]).default("vi"),
  durationSec: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(15),
});

export type CreateVideoJobInput = z.infer<typeof CreateVideoJobInputSchema>;

export const FfprobeQcReportSchema = z.object({
  ok: z.boolean(),
  videoCodec: z.string(),
  pixelFormat: z.string(),
  audioCodec: z.string(),
  width: z.number(),
  height: z.number(),
  durationSec: z.number(),
  sizeBytes: z.number(),
  sha256: z.string(),
  warnings: z.array(z.string()),
});

export type FfprobeQcReport = z.infer<typeof FfprobeQcReportSchema>;

export interface VideoJobRecord {
  jobId: string;
  idempotencyKey: string;
  ownerId: string;
  organizationId: string;
  targetType: "product" | "tour";
  targetId: string;
  title: string;
  modeRequested: VideoRenderMode;
  modeUsed: VideoRenderMode;
  status: VideoJobStatus;
  provenanceNote: string;
  aspectRatio: VideoAspectRatio;
  locale: "vi" | "en";
  durationSec: number;
  mp4Url?: string;
  vttUrl?: string;
  posterUrl?: string;
  qcReport?: FfprobeQcReport;
  errorCode?: string;
  errorMessage?: string;
  createdAtIso: string;
  updatedAtIso: string;
  completedAtIso?: string;
}

export interface StudioSampleManifestEntry {
  sampleId: string;
  targetId: string;
  targetType: "product" | "tour";
  titleVi: string;
  titleEn: string;
  locale: "vi" | "en";
  aspectRatio: VideoAspectRatio;
  modeUsed: VideoRenderMode;
  provenanceLabelVi: string;
  provenanceLabelEn: string;
  mp4Path: string;
  vttPath: string;
  posterPath: string;
  durationSec: number;
  width: number;
  height: number;
  sizeBytes: number;
  sha256: string;
  videoCodec: string;
  pixelFormat: string;
  audioCodec: string;
}

export interface VideoHealthResponse {
  ok: boolean;
  workerOnline: boolean;
  workerMode: "local_ffmpeg_worker" | "serverless_sample_preview";
  renderer: "ffmpeg";
  aiProvider: {
    name: "muse2api";
    enabled: boolean;
    status: "disabled_manual_login_required" | "ready" | "error";
    note: string;
  };
  samplesCount: number;
  checkedAtIso: string;
}
