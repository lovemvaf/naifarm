import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import type { CreateVideoJobInput, VideoAspectRatio } from "../../../../src/lib/video-studio/contracts";
import { assertSafeChildPath } from "../storage/storage-adapter";

export function getDimensionsForAspectRatio(aspectRatio: VideoAspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9":
      return { width: 1280, height: 720 };
    case "1:1":
      return { width: 720, height: 720 };
    case "9:16":
    default:
      return { width: 720, height: 1280 };
  }
}

function formatVttTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  const ms = Math.round((clamped - Math.floor(clamped)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

export function buildVttCaptions(input: CreateVideoJobInput): string {
  const cues: string[] = [
    `${input.title} — ${input.areaLabel}`,
    input.scriptLines[0] ?? input.subtitle,
    input.scriptLines[1] ?? input.priceLabel,
    `${input.ctaLabel} (${input.batchCode})`,
  ];
  const step = input.durationSec / cues.length;
  const blocks = cues.map((text, idx) => {
    const start = formatVttTime(idx * step);
    const end = formatVttTime(Math.min(input.durationSec, (idx + 1) * step - 0.1));
    return `${idx + 1}\n${start} --> ${end}\n${text}`;
  });
  return `WEBVTT\n\n${blocks.join("\n\n")}\n`;
}

export interface RenderedVideoOutput {
  mp4Path: string;
  vttPath: string;
  posterPath: string;
  width: number;
  height: number;
}

let cachedPythonBin: string | null = null;

function resolvePythonWithPillow(): string {
  if (cachedPythonBin) return cachedPythonBin;
  const candidates: string[] = [];
  if (process.env.PYTHON_BIN) candidates.push(process.env.PYTHON_BIN);
  if (process.platform === "win32") {
    candidates.push(
      "python",
      "py",
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python314", "python.exe"),
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python313", "python.exe"),
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python312", "python.exe"),
    );
  } else {
    candidates.push("python3", "python");
  }

  for (const bin of candidates) {
    if (!bin) continue;
    try {
      execFileSync(bin, ["-c", "import PIL"], { stdio: "ignore", windowsHide: true, timeout: 5000 });
      cachedPythonBin = bin;
      return bin;
    } catch {
      // try next candidate
    }
  }
  return process.platform === "win32" ? "python" : "python3";
}

export async function renderOcopVideo(options: {
  input: CreateVideoJobInput;
  repoRoot: string;
  workDir: string;
  outputMp4Path?: string;
  outputVttPath?: string;
  outputPosterPath?: string;
}): Promise<RenderedVideoOutput> {
  const { input, repoRoot, workDir } = options;
  fs.mkdirSync(workDir, { recursive: true });

  const { width, height } = getDimensionsForAspectRatio(input.aspectRatio);
  const publicRoot = path.join(repoRoot, "public");

  const resolvedPhotos = input.imagePaths.map((imgPath) => {
    const cleanRel = imgPath.replace(/^\/+/, "");
    const abs = assertSafeChildPath(publicRoot, ...cleanRel.split("/"));
    if (!fs.existsSync(abs)) {
      throw new Error(`Input image not found in public/: ${imgPath}`);
    }
    return abs;
  });

  const qrPath = path.join(workDir, "qr.png");
  await QRCode.toFile(qrPath, input.qrTargetUrl, {
    width: 360,
    margin: 2,
    color: { dark: "#183B28", light: "#FFFFFF" },
  });

  const slidesDir = path.join(workDir, "slides");
  fs.mkdirSync(slidesDir, { recursive: true });

  const specPath = path.join(workDir, "frames-spec.json");
  fs.writeFileSync(
    specPath,
    JSON.stringify(
      {
        width,
        height,
        outDir: slidesDir,
        photoPaths: resolvedPhotos,
        qrPath,
        title: input.title,
        subtitle: input.subtitle,
        scriptLines: input.scriptLines,
        priceLabel: input.priceLabel,
        areaLabel: input.areaLabel,
        ctaLabel: input.ctaLabel,
        batchCode: input.batchCode,
        locale: input.locale,
      },
      null,
      2,
    ),
    "utf-8",
  );

  const pythonScript = path.join(
    repoRoot,
    "services",
    "video-worker",
    "src",
    "renderers",
    "render_frame.py",
  );
  const pythonBin = resolvePythonWithPillow();
  execFileSync(pythonBin, [pythonScript, specPath], {
    stdio: "pipe",
    windowsHide: true,
    timeout: 60_000,
  });

  const mp4Path = options.outputMp4Path ?? path.join(workDir, "output.mp4");
  const vttPath = options.outputVttPath ?? path.join(workDir, "subtitles.vtt");
  const posterPath = options.outputPosterPath ?? path.join(workDir, "poster.jpg");

  fs.mkdirSync(path.dirname(mp4Path), { recursive: true });
  fs.mkdirSync(path.dirname(vttPath), { recursive: true });
  fs.mkdirSync(path.dirname(posterPath), { recursive: true });

  fs.writeFileSync(vttPath, buildVttCaptions(input), "utf-8");
  const generatedPoster = path.join(slidesDir, "poster.jpg");
  if (fs.existsSync(generatedPoster) && path.resolve(generatedPoster) !== path.resolve(posterPath)) {
    fs.copyFileSync(generatedPoster, posterPath);
  }

  const fadeDur = 0.45;
  const slideInDur = Number(((input.durationSec + 3 * fadeDur) / 4).toFixed(3));
  const off1 = Number((slideInDur - fadeDur).toFixed(3));
  const off2 = Number((2 * slideInDur - 2 * fadeDur).toFixed(3));
  const off3 = Number((3 * slideInDur - 3 * fadeDur).toFixed(3));

  const filterComplex = [
    `[0:v]fps=24,setsar=1,format=yuv420p[v0]`,
    `[1:v]fps=24,setsar=1,format=yuv420p[v1]`,
    `[2:v]fps=24,setsar=1,format=yuv420p[v2]`,
    `[3:v]fps=24,setsar=1,format=yuv420p[v3]`,
    `[v0][v1]xfade=transition=fade:duration=${fadeDur}:offset=${off1}[x01]`,
    `[x01][v2]xfade=transition=smoothleft:duration=${fadeDur}:offset=${off2}[x12]`,
    `[x12][v3]xfade=transition=fade:duration=${fadeDur}:offset=${off3},format=yuv420p[vout]`,
    `[4:a]aformat=channel_layouts=stereo:sample_rates=44100[aout]`,
  ].join(";");

  const audioExpr =
    "0.045*sin(2*PI*261.63*t)*exp(-1.8*mod(t\\,3.75))+0.03*sin(2*PI*329.63*t)*exp(-1.8*mod(t\\,3.75))+0.025*sin(2*PI*392.00*t)*exp(-2.1*mod(t\\,3.75))";

  const ffmpegArgs = [
    "-y",
    "-loop",
    "1",
    "-t",
    String(slideInDur),
    "-i",
    path.join(slidesDir, "slide_0.png"),
    "-loop",
    "1",
    "-t",
    String(slideInDur),
    "-i",
    path.join(slidesDir, "slide_1.png"),
    "-loop",
    "1",
    "-t",
    String(slideInDur),
    "-i",
    path.join(slidesDir, "slide_2.png"),
    "-loop",
    "1",
    "-t",
    String(slideInDur),
    "-i",
    path.join(slidesDir, "slide_3.png"),
    "-f",
    "lavfi",
    "-t",
    String(input.durationSec),
    "-i",
    `aevalsrc=${audioExpr}:s=44100`,
    "-filter_complex",
    filterComplex,
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "25",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-t",
    String(input.durationSec),
    mp4Path,
  ];

  execFileSync("ffmpeg", ffmpegArgs, {
    stdio: "pipe",
    windowsHide: true,
    timeout: 120_000,
  });

  return {
    mp4Path,
    vttPath,
    posterPath,
    width,
    height,
  };
}
