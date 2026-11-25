import { NextRequest, NextResponse } from "next/server";
import { CreateVideoJobInputSchema, type VideoJobRecord } from "@/lib/video-studio/contracts";
import {
  fetchWorkerJson,
  findMatchingSample,
  probeWorkerHealth,
  readStudioSamplesManifest,
  sampleToPreviewJob,
} from "@/lib/video-studio/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await probeWorkerHealth();
  const samples = readStudioSamplesManifest();
  let workerJobs: VideoJobRecord[] = [];

  if (health.workerOnline) {
    const res = await fetchWorkerJson<{ ok: boolean; jobs: VideoJobRecord[] }>("/jobs");
    if (res.online && res.data?.jobs) {
      workerJobs = res.data.jobs;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      workerOnline: health.workerOnline,
      workerMode: health.workerMode,
      aiProvider: health.aiProvider,
      jobs: workerJobs,
      samples,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateVideoJobInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const workerRes = await fetchWorkerJson<{ ok: boolean; created?: boolean; job?: VideoJobRecord; error?: string }>(
    "/jobs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      timeoutMs: 5000,
    },
  );

  if (workerRes.online && workerRes.data?.ok && workerRes.data.job) {
    return NextResponse.json(
      {
        ok: true,
        workerOnline: true,
        workerMode: "local_ffmpeg_worker",
        created: workerRes.data.created ?? true,
        job: workerRes.data.job,
      },
      { status: workerRes.status },
    );
  }

  // Honest fallback on serverless / when Windows FFmpeg worker is not running:
  const sample = findMatchingSample(parsed.data.targetId, parsed.data.locale);
  return NextResponse.json(
    {
      ok: true,
      workerOnline: false,
      workerMode: "serverless_sample_preview",
      note:
        parsed.data.locale === "en"
          ? "Local Windows FFmpeg worker is offline in this environment. Loaded the verified FFmpeg studio sample below (no fake render job queued)."
          : "Worker FFmpeg cục bộ chưa chạy trên môi trường hiện tại. Hệ thống hiển thị video FFmpeg mẫu đã kiểm chứng tương ứng (không tạo tiến trình giả).",
      fallbackSample: sample,
      job: sample ? sampleToPreviewJob(sample) : null,
    },
    { status: 200 },
  );
}
