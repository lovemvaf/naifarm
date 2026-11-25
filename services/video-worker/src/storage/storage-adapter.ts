import fs from "node:fs";
import path from "node:path";

export function assertSafeChildPath(baseDir: string, ...segments: string[]): string {
  const resolvedBase = path.resolve(baseDir);
  const cleanedSegments = segments.map((seg) => {
    if (!seg || seg.includes("..") || seg.includes("\0") || /^[a-zA-Z]:/.test(seg) || seg.startsWith("/")) {
      throw new Error(`Unsafe storage segment rejected: ${seg}`);
    }
    return seg;
  });
  const target = path.resolve(resolvedBase, ...cleanedSegments);
  if (!target.startsWith(resolvedBase + path.sep) && target !== resolvedBase) {
    throw new Error("Path traversal attempt detected in storage adapter");
  }
  return target;
}

export interface StoredArtifacts {
  mp4LocalPath: string;
  vttLocalPath: string;
  posterLocalPath: string;
  mp4Url: string;
  vttUrl: string;
  posterUrl: string;
}

export function publishJobArtifacts(
  localMediaRoot: string,
  jobId: string,
  rendered: { mp4Path: string; vttPath: string; posterPath: string },
): StoredArtifacts {
  const jobDir = assertSafeChildPath(localMediaRoot, "jobs", jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const mp4Dest = assertSafeChildPath(localMediaRoot, "jobs", jobId, "video.mp4");
  const vttDest = assertSafeChildPath(localMediaRoot, "jobs", jobId, "captions.vtt");
  const posterDest = assertSafeChildPath(localMediaRoot, "jobs", jobId, "poster.jpg");

  fs.copyFileSync(rendered.mp4Path, mp4Dest);
  fs.copyFileSync(rendered.vttPath, vttDest);
  fs.copyFileSync(rendered.posterPath, posterDest);

  return {
    mp4LocalPath: mp4Dest,
    vttLocalPath: vttDest,
    posterLocalPath: posterDest,
    mp4Url: `/api/video/jobs/${encodeURIComponent(jobId)}/result?asset=mp4`,
    vttUrl: `/api/video/jobs/${encodeURIComponent(jobId)}/result?asset=vtt`,
    posterUrl: `/api/video/jobs/${encodeURIComponent(jobId)}/result?asset=poster`,
  };
}
