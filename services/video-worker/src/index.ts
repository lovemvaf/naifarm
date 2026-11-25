import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CreateVideoJobInputSchema } from "../../../src/lib/video-studio/contracts";
import { getMuseProviderStatus, tryGenerateMuseClips } from "./providers/muse-adapter";
import { SqliteVideoQueue } from "./queue/sqlite-queue";
import { renderOcopVideo, getDimensionsForAspectRatio } from "./renderers/ffmpeg-renderer";
import { runFfprobeQc } from "./renderers/ffprobe-qc";
import { assertSafeChildPath, publishJobArtifacts } from "./storage/storage-adapter";

const REPO_ROOT = path.resolve(process.cwd());
const WORKER_ROOT = path.join(REPO_ROOT, "services", "video-worker");
const DB_PATH = path.join(WORKER_ROOT, "data", "video-studio.sqlite");
const LOCAL_MEDIA_ROOT = path.join(REPO_ROOT, "local-media");
const TEMP_ROOT = path.join(os.tmpdir(), "naifarm-video-worker");
const WORKER_HOST = "127.0.0.1";
const WORKER_PORT = Number(process.env.VIDEO_WORKER_PORT || 4090);
const WORKER_INSTANCE_ID = `win-worker-${process.pid}`;

const queue = new SqliteVideoQueue(DB_PATH);
queue.reconcileExpiredLeases();

let isProcessing = false;

async function processNextJob() {
  if (isProcessing) return;
  const claimed = queue.claimNextQueuedJob(WORKER_INSTANCE_ID, 180);
  if (!claimed) return;

  isProcessing = true;
  const { record, input } = claimed;
  const jobWorkDir = path.join(TEMP_ROOT, record.jobId);

  try {
    let modeUsed = input.modeRequested;
    let provenanceNote = "FFmpeg Fast Render (ảnh & dữ liệu thật trong vườn)";

    if (input.modeRequested !== "FAST") {
      queue.updateStatus(record.jobId, { status: "generating_ai" });
      const museRes = await tryGenerateMuseClips({
        jobId: record.jobId,
        prompt: `${input.title}. ${input.scriptLines.join(" ")}`,
        aspectRatio: input.aspectRatio,
      });
      if (!museRes.usedAi) {
        modeUsed = "FAST";
        provenanceNote = `Yêu cầu ${input.modeRequested} → Fallback FFmpeg Fast Render (${museRes.note})`;
        queue.appendEvent(record.jobId, "mode_fallback", museRes.note);
      }
    }

    const latestBeforeRender = queue.getJob(record.jobId);
    if (latestBeforeRender?.status === "canceled") return;

    queue.updateStatus(record.jobId, {
      status: "rendering",
      modeUsed,
      provenanceNote,
    });

    const rendered = await renderOcopVideo({
      input,
      repoRoot: REPO_ROOT,
      workDir: jobWorkDir,
    });

    const latestAfterRender = queue.getJob(record.jobId);
    if (latestAfterRender?.status === "canceled") return;

    queue.updateStatus(record.jobId, { status: "validating" });
    const expectedDims = getDimensionsForAspectRatio(input.aspectRatio);
    const qc = runFfprobeQc(rendered.mp4Path, expectedDims.width, expectedDims.height);
    if (!qc.ok) {
      throw new Error(`FFprobe QC failed: ${qc.warnings.join("; ")}`);
    }

    queue.updateStatus(record.jobId, { status: "uploading" });
    const stored = publishJobArtifacts(LOCAL_MEDIA_ROOT, record.jobId, rendered);

    queue.updateStatus(record.jobId, {
      status: "completed",
      modeUsed,
      provenanceNote,
      mp4Url: stored.mp4Url,
      vttUrl: stored.vttUrl,
      posterUrl: stored.posterUrl,
      qcReport: qc,
      completedAtIso: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown render error";
    queue.updateStatus(record.jobId, {
      status: "failed",
      errorCode: "RENDER_PIPELINE_ERROR",
      errorMessage: msg,
    });
  } finally {
    try {
      fs.rmSync(jobWorkDir, { recursive: true, force: true });
    } catch {
      // ignore temp cleanup errors
    }
    isProcessing = false;
  }
}

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (c: Buffer) => {
      total += c.length;
      if (total > 256 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf-8").trim();
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function getSamplesCount(): number {
  try {
    const manifestPath = path.join(REPO_ROOT, "public", "media", "studio-samples", "manifest.json");
    if (!fs.existsSync(manifestPath)) return 0;
    const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${WORKER_HOST}:${WORKER_PORT}`);
  const pathname = reqUrl.pathname;

  try {
    if (req.method === "GET" && pathname === "/health") {
      return sendJson(res, 200, {
        ok: true,
        workerOnline: true,
        workerMode: "local_ffmpeg_worker",
        renderer: "ffmpeg",
        aiProvider: getMuseProviderStatus(),
        samplesCount: getSamplesCount(),
        checkedAtIso: new Date().toISOString(),
      });
    }

    if (req.method === "GET" && pathname === "/jobs") {
      return sendJson(res, 200, { ok: true, jobs: queue.listJobs(30) });
    }

    if (req.method === "POST" && pathname === "/jobs") {
      const raw = await readJsonBody(req);
      const parsed = CreateVideoJobInputSchema.safeParse(raw);
      if (!parsed.success) {
        return sendJson(res, 400, {
          ok: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }
      const { created, record } = queue.createOrReuseJob(parsed.data);
      void processNextJob();
      return sendJson(res, created ? 201 : 200, { ok: true, created, job: record });
    }

    const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobMatch) {
      const job = queue.getJob(decodeURIComponent(jobMatch[1]));
      if (!job) return sendJson(res, 404, { ok: false, error: "Job not found" });
      return sendJson(res, 200, { ok: true, job });
    }

    const cancelMatch = pathname.match(/^\/jobs\/([^/]+)\/cancel$/);
    if (req.method === "POST" && cancelMatch) {
      const job = queue.cancelJob(decodeURIComponent(cancelMatch[1]));
      if (!job) return sendJson(res, 404, { ok: false, error: "Job not found" });
      return sendJson(res, 200, { ok: true, job });
    }

    const resultMatch = pathname.match(/^\/jobs\/([^/]+)\/result$/);
    if (req.method === "GET" && resultMatch) {
      const jobId = decodeURIComponent(resultMatch[1]);
      const asset = reqUrl.searchParams.get("asset") || "mp4";
      const fileMap: Record<string, { file: string; mime: string }> = {
        mp4: { file: "video.mp4", mime: "video/mp4" },
        vtt: { file: "captions.vtt", mime: "text/vtt; charset=utf-8" },
        poster: { file: "poster.jpg", mime: "image/jpeg" },
      };
      const meta = fileMap[asset];
      if (!meta) return sendJson(res, 400, { ok: false, error: "Invalid asset type" });

      const absPath = assertSafeChildPath(LOCAL_MEDIA_ROOT, "jobs", jobId, meta.file);
      if (!fs.existsSync(absPath)) {
        return sendJson(res, 404, { ok: false, error: "Artifact not ready or missing" });
      }
      const stat = fs.statSync(absPath);
      res.writeHead(200, {
        "Content-Type": meta.mime,
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=3600",
      });
      fs.createReadStream(absPath).pipe(res);
      return;
    }

    return sendJson(res, 404, { ok: false, error: "Route not found" });
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: err instanceof Error ? err.message : "Worker error",
    });
  }
});

const timer = setInterval(() => {
  void processNextJob();
}, 1500);

server.listen(WORKER_PORT, WORKER_HOST, () => {
  console.log(`[naifarm-video-worker] listening at http://${WORKER_HOST}:${WORKER_PORT}`);
});

function shutdown() {
  clearInterval(timer);
  server.close(() => {
    queue.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
