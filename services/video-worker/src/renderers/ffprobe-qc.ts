import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import type { FfprobeQcReport } from "../../../../src/lib/video-studio/contracts";

interface RawFfprobeStream {
  codec_type?: string;
  codec_name?: string;
  pix_fmt?: string;
  width?: number;
  height?: number;
}

interface RawFfprobeFormat {
  duration?: string;
  size?: string;
}

interface RawFfprobeJson {
  streams?: RawFfprobeStream[];
  format?: RawFfprobeFormat;
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export function runFfprobeQc(
  mp4Path: string,
  expectedWidth?: number,
  expectedHeight?: number,
): FfprobeQcReport {
  if (!fs.existsSync(mp4Path)) {
    throw new Error(`Rendered MP4 not found for QC: ${mp4Path}`);
  }

  const raw = execFileSync(
    "ffprobe",
    ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", mp4Path],
    { encoding: "utf-8", windowsHide: true },
  );

  const parsed = JSON.parse(raw) as RawFfprobeJson;
  const streams = parsed.streams ?? [];
  const videoStream = streams.find((s) => s.codec_type === "video");
  const audioStream = streams.find((s) => s.codec_type === "audio");

  const videoCodec = videoStream?.codec_name ?? "missing";
  const pixelFormat = videoStream?.pix_fmt ?? "missing";
  const audioCodec = audioStream?.codec_name ?? "missing";
  const width = Number(videoStream?.width ?? 0);
  const height = Number(videoStream?.height ?? 0);
  const durationSec = Number(Number(parsed.format?.duration ?? 0).toFixed(2));
  const stat = fs.statSync(mp4Path);
  const sizeBytes = stat.size;

  const sha256 = crypto.createHash("sha256").update(fs.readFileSync(mp4Path)).digest("hex");

  const warnings: string[] = [];
  if (videoCodec !== "h264") warnings.push(`Expected video codec h264, got ${videoCodec}`);
  if (pixelFormat !== "yuv420p") warnings.push(`Expected pixel format yuv420p, got ${pixelFormat}`);
  if (audioCodec !== "aac") warnings.push(`Expected audio codec aac, got ${audioCodec}`);
  if (durationSec <= 1) warnings.push(`Duration too short: ${durationSec}s`);
  if (sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
    warnings.push(`Size out of range (1B..25MB): ${sizeBytes}`);
  }
  if (expectedWidth && width !== expectedWidth) {
    warnings.push(`Expected width ${expectedWidth}, got ${width}`);
  }
  if (expectedHeight && height !== expectedHeight) {
    warnings.push(`Expected height ${expectedHeight}, got ${height}`);
  }

  return {
    ok: warnings.length === 0,
    videoCodec,
    pixelFormat,
    audioCodec,
    width,
    height,
    durationSec,
    sizeBytes,
    sha256,
    warnings,
  };
}
