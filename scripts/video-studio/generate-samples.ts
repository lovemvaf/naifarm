import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CreateVideoJobInput, StudioSampleManifestEntry } from "../../src/lib/video-studio/contracts";
import { renderOcopVideo } from "../../services/video-worker/src/renderers/ffmpeg-renderer";
import { runFfprobeQc } from "../../services/video-worker/src/renderers/ffprobe-qc";

const REPO_ROOT = path.resolve(process.cwd());
const SAMPLES_DIR = path.join(REPO_ROOT, "public", "media", "studio-samples");

interface SampleJobSpec {
  sampleId: string;
  fileStem: string;
  titleVi: string;
  titleEn: string;
  input: CreateVideoJobInput;
}

const SAMPLE_SPECS: SampleJobSpec[] = [
  {
    sampleId: "SAMPLE-P06-VI",
    fileStem: "p06-buoi-tan-trieu-vi",
    titleVi: "Bưởi da xanh Tân Triều — Thu hoạch liếp phù sa",
    titleEn: "Tan Trieu Green-Skin Pomelo — Alluvial Orchard Harvest",
    input: {
      idempotencyKey: "seed-sample-p06-tan-trieu-vi",
      ownerId: "demo-w02-chu-ba-minh",
      organizationId: "org-tt-scenario",
      targetType: "product",
      targetId: "P06",
      title: "Bưởi da xanh Tân Triều",
      subtitle: "Vỏ mỏng tép hồng ráo ngọt 11.8° Brix · Cù lao Tân Triều",
      scriptLines: [
        "Cắt chín tự nhiên tại liếp phù sa ven sông Đồng Nai.",
        "Đo mẫu Brix 11.8°, bảo quản ráo cuống không chất bảo quản.",
        "Hộ chiếu QR NF-TT-2026-01 truy xuất minh bạch 3 chặng.",
      ],
      priceLabel: "45.000 đ/kg",
      areaLabel: "Phường Tân Triều, Đồng Nai",
      ctaLabel: "Quét QR xem nhật ký mùa vụ & đặt giỏ bưởi tại NaiFarm",
      batchCode: "NF-TT-2026-01",
      qrTargetUrl: "https://naifarm.vercel.app/trace/NF-TT-2026-01",
      imagePaths: [
        "/images/stitch/stitch-03.jpg",
        "/images/stitch/stitch-24.jpg",
        "/images/stitch/stitch-25.jpg",
      ],
      modeRequested: "FAST",
      templateId: "commercial_30s",
      aspectRatio: "9:16",
      locale: "vi",
      durationSec: 15,
    },
  },
  {
    sampleId: "SAMPLE-P08-VI",
    fileStem: "p08-hat-dieu-xuan-loc-vi",
    titleVi: "Hạt điều rang muối vỏ lụa Xuân Lộc",
    titleEn: "Xuan Loc Roasted Wood-Fire Cashews",
    input: {
      idempotencyKey: "seed-sample-p08-xuan-loc-vi",
      ownerId: "demo-w02-htx-xuan-loc",
      organizationId: "org-xl-scenario",
      targetType: "product",
      targetId: "P08",
      title: "Hạt điều rang muối Xuân Lộc",
      subtitle: "Nhân A+ rang củi truyền thống giữ vỏ lụa giòn thơm",
      scriptLines: [
        "Tuyển hạt điều vườn đồi Xuân Lộc chín rụng tự nhiên.",
        "Rang củi chậm vừa lửa giữ trọn vị béo bùi & hút chân không.",
        "Kiểm soát an toàn tách vỏ loại sạch nhựa CNSL.",
      ],
      priceLabel: "145.000 đ/hộp 500g",
      areaLabel: "Xã Xuân Lộc, Đồng Nai",
      ctaLabel: "Đặt đặc sản hạt điều OCOP & kiểm tra lô NF-XL-2026-03",
      batchCode: "NF-XL-2026-03",
      qrTargetUrl: "https://naifarm.vercel.app/trace/NF-XL-2026-03",
      imagePaths: [
        "/images/stitch/stitch-05.jpg",
        "/images/stitch/stitch-34.jpg",
        "/images/stitch/stitch-39.jpg",
      ],
      modeRequested: "FAST",
      templateId: "producer_story",
      aspectRatio: "9:16",
      locale: "vi",
      durationSec: 15,
    },
  },
  {
    sampleId: "SAMPLE-TOUR01-EN",
    fileStem: "tour-01-ba-tu-orchard-en",
    titleVi: "Trải nghiệm Vườn Ba Tư & Du lịch nông nghiệp Long Khánh",
    titleEn: "Ba Tu Orchard Harvest & Agritourism Experience",
    input: {
      idempotencyKey: "seed-sample-tour01-ba-tu-en",
      ownerId: "demo-w02-chu-ba-tu",
      organizationId: "org-lk-scenario",
      targetType: "tour",
      targetId: "TOUR-01",
      title: "Ba Tu Orchard Harvest Tour",
      subtitle: "2.5 ha basalt orchard in Long Khanh · Bilingual youth hosts",
      scriptLines: [
        "Pick dawn-fresh Java rambutan & Ri6 durian with Uncle Ba Tu.",
        "Join Dong Nai Youth Volunteers digitizing QR lot logs on-site.",
        "Taste seasonal garden platters and craft your traceable hamper.",
      ],
      priceLabel: "180.000 VND / guest",
      areaLabel: "Long Khanh Ward, Dong Nai",
      ctaLabel: "Book weekend orchard slots & scan NF-DEMO-001 at NaiFarm",
      batchCode: "NF-DEMO-001",
      qrTargetUrl: "https://naifarm.vercel.app/trace/NF-DEMO-001",
      imagePaths: [
        "/images/stitch/stitch-07.jpg",
        "/images/stitch/stitch-40.jpg",
        "/images/stitch/stitch-04.jpg",
      ],
      modeRequested: "FAST",
      templateId: "agritourism_promo",
      aspectRatio: "16:9",
      locale: "en",
      durationSec: 15,
    },
  },
];

async function main() {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
  const manifest: StudioSampleManifestEntry[] = [];

  for (const spec of SAMPLE_SPECS) {
    const workDir = path.join(os.tmpdir(), "naifarm-samples-build", spec.fileStem);
    const mp4Path = path.join(SAMPLES_DIR, `${spec.fileStem}.mp4`);
    const vttPath = path.join(SAMPLES_DIR, `${spec.fileStem}.vtt`);
    const posterPath = path.join(SAMPLES_DIR, `${spec.fileStem}.jpg`);

    const rendered = await renderOcopVideo({
      input: spec.input,
      repoRoot: REPO_ROOT,
      workDir,
      outputMp4Path: mp4Path,
      outputVttPath: vttPath,
      outputPosterPath: posterPath,
    });

    const qc = runFfprobeQc(rendered.mp4Path, rendered.width, rendered.height);
    if (!qc.ok) {
      throw new Error(`Sample ${spec.sampleId} failed FFprobe QC: ${qc.warnings.join("; ")}`);
    }

    manifest.push({
      sampleId: spec.sampleId,
      targetId: spec.input.targetId,
      targetType: spec.input.targetType,
      titleVi: spec.titleVi,
      titleEn: spec.titleEn,
      locale: spec.input.locale,
      aspectRatio: spec.input.aspectRatio,
      modeUsed: "FAST",
      provenanceLabelVi: "Video kết xuất thực tế bằng FFmpeg từ ảnh & hộ chiếu QR của vườn",
      provenanceLabelEn: "Real FFmpeg render built from verified orchard photography & QR trace",
      mp4Path: `/media/studio-samples/${spec.fileStem}.mp4`,
      vttPath: `/media/studio-samples/${spec.fileStem}.vtt`,
      posterPath: `/media/studio-samples/${spec.fileStem}.jpg`,
      durationSec: qc.durationSec,
      width: qc.width,
      height: qc.height,
      sizeBytes: qc.sizeBytes,
      sha256: qc.sha256,
      videoCodec: qc.videoCodec,
      pixelFormat: qc.pixelFormat,
      audioCodec: qc.audioCodec,
    });

    console.log(
      `[OK] ${spec.fileStem}.mp4 (${qc.width}x${qc.height}, ${qc.durationSec}s, ${Math.round(qc.sizeBytes / 1024)} KB, sha256=${qc.sha256.slice(0, 12)})`,
    );
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  const manifestPath = path.join(SAMPLES_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Manifest written: ${manifestPath} (${manifest.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
