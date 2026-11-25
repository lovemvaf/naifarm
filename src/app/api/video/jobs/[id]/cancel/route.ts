import { NextRequest, NextResponse } from "next/server";
import type { VideoJobRecord } from "@/lib/video-studio/contracts";
import { fetchWorkerJson } from "@/lib/video-studio/server";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
    return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
  }

  const workerRes = await fetchWorkerJson<{ ok: boolean; job?: VideoJobRecord; error?: string }>(
    `/jobs/${encodeURIComponent(id)}/cancel`,
    { method: "POST" },
  );

  if (!workerRes.online) {
    return NextResponse.json(
      { ok: false, error: "Local FFmpeg worker is offline" },
      { status: 503 },
    );
  }

  return NextResponse.json(workerRes.data ?? { ok: false, error: "Cancel failed" }, {
    status: workerRes.status,
  });
}
