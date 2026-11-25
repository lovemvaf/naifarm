import { NextRequest, NextResponse } from "next/server";
import type { VideoJobRecord } from "@/lib/video-studio/contracts";
import { fetchWorkerJson, readStudioSamplesManifest, sampleToPreviewJob } from "@/lib/video-studio/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
    return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
  }

  const samples = readStudioSamplesManifest();
  const sample = samples.find((s) => s.sampleId === id);
  if (sample) {
    return NextResponse.json({ ok: true, job: sampleToPreviewJob(sample) });
  }

  const workerRes = await fetchWorkerJson<{ ok: boolean; job?: VideoJobRecord; error?: string }>(
    `/jobs/${encodeURIComponent(id)}`,
  );

  if (!workerRes.online) {
    return NextResponse.json(
      { ok: false, error: "Local FFmpeg worker is offline" },
      { status: 503 },
    );
  }

  return NextResponse.json(workerRes.data ?? { ok: false, error: "Job not found" }, {
    status: workerRes.status,
  });
}
