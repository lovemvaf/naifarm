import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getWorkerBaseUrl, readStudioSamplesManifest } from "@/lib/video-studio/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
    return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
  }

  const assetParam = req.nextUrl.searchParams.get("asset") || "mp4";
  if (assetParam !== "mp4" && assetParam !== "vtt" && assetParam !== "poster") {
    return NextResponse.json({ ok: false, error: "Invalid asset query" }, { status: 400 });
  }

  const sample = readStudioSamplesManifest().find((s) => s.sampleId === id);
  if (sample) {
    const rel =
      assetParam === "mp4"
        ? sample.mp4Path
        : assetParam === "vtt"
          ? sample.vttPath
          : sample.posterPath;
    const abs = path.join(process.cwd(), "public", rel.replace(/^\/+/, ""));
    if (!fs.existsSync(abs)) {
      return NextResponse.json({ ok: false, error: "Sample asset missing" }, { status: 404 });
    }
    const buf = fs.readFileSync(abs);
    const mime =
      assetParam === "mp4"
        ? "video/mp4"
        : assetParam === "vtt"
          ? "text/vtt; charset=utf-8"
          : "image/jpeg";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const workerUrl = getWorkerBaseUrl();
  if (!workerUrl) {
    return NextResponse.json(
      { ok: false, error: "Local FFmpeg worker is offline" },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(
      `${workerUrl}/jobs/${encodeURIComponent(id)}/result?asset=${assetParam}`,
      { signal: AbortSignal.timeout(10_000), cache: "no-store" },
    );
    if (!upstream.ok) {
      return NextResponse.json({ ok: false, error: "Artifact not ready" }, { status: upstream.status });
    }
    const arrayBuffer = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") ||
      (assetParam === "mp4"
        ? "video/mp4"
        : assetParam === "vtt"
          ? "text/vtt; charset=utf-8"
          : "image/jpeg");
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Worker unreachable" }, { status: 503 });
  }
}
