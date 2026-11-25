"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Film,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/data/demo/products";
import { useLocale } from "@/context/LocaleContext";
import { formatVnd } from "@/lib/format";
import type {
  StudioSampleManifestEntry,
  VideoAspectRatio,
  VideoHealthResponse,
  VideoJobRecord,
  VideoRenderMode,
  VideoTemplateId,
} from "@/lib/video-studio/contracts";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";

interface JobsApiListResponse {
  ok: boolean;
  workerOnline: boolean;
  workerMode: "local_ffmpeg_worker" | "serverless_sample_preview";
  aiProvider?: VideoHealthResponse["aiProvider"];
  jobs: VideoJobRecord[];
  samples: StudioSampleManifestEntry[];
}

interface TargetPreset {
  targetType: "product" | "tour";
  targetId: string;
  labelVi: string;
  labelEn: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  scriptVi: [string, string, string];
  scriptEn: [string, string, string];
  priceLabel: string;
  areaLabel: string;
  batchCode: string;
  imagePaths: string[];
  ctaVi: string;
  ctaEn: string;
}

const TOUR_PRESET: TargetPreset = {
  targetType: "tour",
  targetId: "TOUR-01",
  labelVi: "Tour trải nghiệm Vườn Ba Tư (Long Khánh)",
  labelEn: "Ba Tu Orchard Harvest Tour (Long Khanh)",
  titleVi: "Tour Vườn Ba Tư & Mùa Chôm chôm",
  titleEn: "Ba Tu Orchard Harvest Tour",
  subtitleVi: "2,5 ha đất đỏ bazan Long Khánh · Hái trái & gắn tem QR tại vườn",
  subtitleEn: "2.5 ha basalt orchard in Long Khanh · Bilingual youth hosts",
  scriptVi: [
    "Hái chôm chôm Java & sầu riêng Ri6 chín cây lúc sáng sớm cùng chú Ba Tư.",
    "Đồng hành cùng Thanh niên Tình nguyện số hóa nhật ký lô NF-DEMO-001.",
    "Thưởng thức mâm trái cây tại vườn và đặt giỏ quà OCOP truy xuất nguồn gốc.",
  ],
  scriptEn: [
    "Pick dawn-fresh Java rambutan & Ri6 durian with Uncle Ba Tu.",
    "Join Dong Nai Youth Volunteers digitizing QR lot logs on-site.",
    "Taste seasonal garden platters and craft your traceable hamper.",
  ],
  priceLabel: "180.000 đ / khách",
  areaLabel: "Phường Long Khánh, Đồng Nai",
  batchCode: "NF-DEMO-001",
  imagePaths: ["/images/stitch/stitch-07.jpg", "/images/stitch/stitch-40.jpg", "/images/stitch/stitch-04.jpg"],
  ctaVi: "Đặt lịch tham quan vườn cuối tuần & quét QR NF-DEMO-001",
  ctaEn: "Book weekend orchard slots & scan NF-DEMO-001 at NaiFarm",
};

const PRODUCT_PRESETS: TargetPreset[] = [
  ...INITIAL_PRODUCTS.filter((p) => ["P06", "P08", "P01", "P04", "P09"].includes(p.id)).map((p) => {
    const imgs = [p.image, ...(p.gallery ?? [])].filter((src, i, arr) => Boolean(src) && arr.indexOf(src) === i).slice(0, 3);
    return {
      targetType: "product" as const,
      targetId: p.id,
      labelVi: `${p.id} · ${p.name}`,
      labelEn: `${p.id} · ${p.enName ?? p.name}`,
      titleVi: p.name,
      titleEn: p.enName ?? p.name,
      subtitleVi: `${p.farmName} · ${p.administrativeUnitName}`,
      subtitleEn: `${p.farmName} · ${p.administrativeUnitName}`,
      scriptVi: [
        p.shortDescription.slice(0, 110),
        p.storyNote?.slice(0, 110) ?? `Ghi nhật ký mùa vụ minh bạch tại ${p.administrativeUnitName}.`,
        `Hộ chiếu QR ${p.batchCode} theo dõi hành trình từ vườn đến bàn ăn.`,
      ] as [string, string, string],
      scriptEn: [
        (p.enShortDescription ?? p.shortDescription).slice(0, 110),
        `Traceable seasonal harvest recorded at ${p.administrativeUnitName}, Dong Nai.`,
        `Scan QR lot ${p.batchCode} on NaiFarm for orchard diary provenance.`,
      ] as [string, string, string],
      priceLabel: `${formatVnd(p.priceVnd)}/${p.unitLabel}`,
      areaLabel: p.administrativeUnitName,
      batchCode: p.batchCode,
      imagePaths: imgs.length ? imgs : ["/images/stitch/stitch-03.jpg"],
      ctaVi: `Đặt mua & quét mã lô ${p.batchCode} tại NaiFarm`,
      ctaEn: `Order & verify QR lot ${p.batchCode} on NaiFarm`,
    };
  }),
  TOUR_PRESET,
];

export function CreativeStudioPanel({
  mode = "creator",
  actorName = "Nhà vườn OCOP",
}: {
  mode?: "creator" | "monitor";
  actorName?: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const [health, setHealth] = useState<VideoHealthResponse | null>(null);
  const [jobs, setJobs] = useState<VideoJobRecord[]>([]);
  const [samples, setSamples] = useState<StudioSampleManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("P06");
  const [templateId, setTemplateId] = useState<VideoTemplateId>("commercial_30s");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("9:16");
  const [durationSec, setDurationSec] = useState<15 | 30 | 60>(15);
  const [videoLocale, setVideoLocale] = useState<"vi" | "en">(isEn ? "en" : "vi");
  const [renderMode, setRenderMode] = useState<VideoRenderMode>("FAST");

  const activePreset = useMemo(
    () => PRODUCT_PRESETS.find((p) => p.targetId === selectedPresetId) ?? PRODUCT_PRESETS[0],
    [selectedPresetId],
  );

  const [customTitle, setCustomTitle] = useState<string>(activePreset.titleVi);
  const [line1, setLine1] = useState<string>(activePreset.scriptVi[0]);
  const [line2, setLine2] = useState<string>(activePreset.scriptVi[1]);
  const [line3, setLine3] = useState<string>(activePreset.scriptVi[2]);

  const [activePlayer, setActivePlayer] = useState<{
    title: string;
    mp4Url: string;
    vttUrl?: string;
    posterUrl?: string;
    provenance: string;
    width: number;
    height: number;
    durationSec: number;
    sizeBytes: number;
    videoCodec: string;
    pixelFormat: string;
    audioCodec: string;
    sha256: string;
  } | null>(null);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const applyPreset = useCallback((presetId: string, nextLocale: "vi" | "en") => {
    const preset = PRODUCT_PRESETS.find((p) => p.targetId === presetId) ?? PRODUCT_PRESETS[0];
    setSelectedPresetId(preset.targetId);
    setVideoLocale(nextLocale);
    setCustomTitle(nextLocale === "en" ? preset.titleEn : preset.titleVi);
    const lines = nextLocale === "en" ? preset.scriptEn : preset.scriptVi;
    setLine1(lines[0]);
    setLine2(lines[1]);
    setLine3(lines[2]);
    if (preset.targetType === "tour") {
      setTemplateId("agritourism_promo");
    }
  }, []);

  const activateSample = useCallback(
    (s: StudioSampleManifestEntry) => {
      setActivePlayer({
        title: isEn ? s.titleEn : s.titleVi,
        mp4Url: s.mp4Path,
        vttUrl: s.vttPath,
        posterUrl: s.posterPath,
        provenance: isEn ? s.provenanceLabelEn : s.provenanceLabelVi,
        width: s.width,
        height: s.height,
        durationSec: s.durationSec,
        sizeBytes: s.sizeBytes,
        videoCodec: s.videoCodec,
        pixelFormat: s.pixelFormat,
        audioCodec: s.audioCodec,
        sha256: s.sha256,
      });
    },
    [isEn],
  );

  const refreshStudioState = useCallback(async () => {
    try {
      const [hRes, jRes] = await Promise.all([
        fetch("/api/video/health", { cache: "no-store" }),
        fetch("/api/video/jobs", { cache: "no-store" }),
      ]);
      if (hRes.ok) {
        const hJson = (await hRes.json()) as VideoHealthResponse;
        setHealth(hJson);
      }
      if (jRes.ok) {
        const jJson = (await jRes.json()) as JobsApiListResponse;
        setJobs(jJson.jobs ?? []);
        setSamples(jJson.samples ?? []);
        setActivePlayer((prev) => {
          if (prev) return prev;
          const first = jJson.samples?.[0];
          if (!first) return null;
          return {
            title: isEn ? first.titleEn : first.titleVi,
            mp4Url: first.mp4Path,
            vttUrl: first.vttPath,
            posterUrl: first.posterPath,
            provenance: isEn ? first.provenanceLabelEn : first.provenanceLabelVi,
            width: first.width,
            height: first.height,
            durationSec: first.durationSec,
            sizeBytes: first.sizeBytes,
            videoCodec: first.videoCodec,
            pixelFormat: first.pixelFormat,
            audioCodec: first.audioCodec,
            sha256: first.sha256,
          };
        });
      }
    } catch {
      // swallow temporary fetch failure on offline demo
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [hRes, jRes] = await Promise.all([
          fetch("/api/video/health", { cache: "no-store" }),
          fetch("/api/video/jobs", { cache: "no-store" }),
        ]);
        if (!active) return;
        if (hRes.ok) {
          const hJson = (await hRes.json()) as VideoHealthResponse;
          if (active) setHealth(hJson);
        }
        if (jRes.ok) {
          const jJson = (await jRes.json()) as JobsApiListResponse;
          if (!active) return;
          setJobs(jJson.jobs ?? []);
          setSamples(jJson.samples ?? []);
          setActivePlayer((prev) => {
            if (prev) return prev;
            const first = jJson.samples?.[0];
            if (!first) return null;
            return {
              title: isEn ? first.titleEn : first.titleVi,
              mp4Url: first.mp4Path,
              vttUrl: first.vttPath,
              posterUrl: first.posterPath,
              provenance: isEn ? first.provenanceLabelEn : first.provenanceLabelVi,
              width: first.width,
              height: first.height,
              durationSec: first.durationSec,
              sizeBytes: first.sizeBytes,
              videoCodec: first.videoCodec,
              pixelFormat: first.pixelFormat,
              audioCodec: first.audioCodec,
              sha256: first.sha256,
            };
          });
        }
      } catch {
        // swallow temporary fetch failure on offline demo
      } finally {
        if (active) setLoading(false);
      }
    })();

    const el = videoRef.current;
    return () => {
      active = false;
      if (el) el.pause();
    };
  }, [isEn]);

  // Poll active local worker job when queued/rendering
  useEffect(() => {
    if (!activeJobId) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/jobs/${encodeURIComponent(activeJobId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; job?: VideoJobRecord };
        if (!json.job) return;
        const job = json.job;
        setJobs((prev) => [job, ...prev.filter((x) => x.jobId !== job.jobId)]);

        if (job.status === "completed" && job.mp4Url && job.qcReport) {
          setActiveJobId(null);
          setActivePlayer({
            title: job.title,
            mp4Url: job.mp4Url,
            vttUrl: job.vttUrl,
            posterUrl: job.posterUrl,
            provenance: job.provenanceNote,
            width: job.qcReport.width,
            height: job.qcReport.height,
            durationSec: job.qcReport.durationSec,
            sizeBytes: job.qcReport.sizeBytes,
            videoCodec: job.qcReport.videoCodec,
            pixelFormat: job.qcReport.pixelFormat,
            audioCodec: job.qcReport.audioCodec,
            sha256: job.qcReport.sha256,
          });
          notifySuccess(
            isEn
              ? `FFmpeg finished rendering ${job.jobId} (${job.qcReport.width}x${job.qcReport.height}).`
              : `FFmpeg đã kết xuất xong ${job.jobId} (${job.qcReport.width}x${job.qcReport.height}).`,
          );
        } else if (job.status === "failed" || job.status === "canceled") {
          setActiveJobId(null);
          notifyError(job.errorMessage || `Job ${job.status}`);
        }
      } catch {
        // retry on next tick
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [activeJobId, isEn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        idempotencyKey: `${activePreset.targetId}-${videoLocale}-${aspectRatio}-${durationSec}-${Date.now()}`,
        ownerId: actorName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "farmer-demo",
        organizationId: "org-tt-scenario",
        targetType: activePreset.targetType,
        targetId: activePreset.targetId,
        title: customTitle.trim() || (videoLocale === "en" ? activePreset.titleEn : activePreset.titleVi),
        subtitle: videoLocale === "en" ? activePreset.subtitleEn : activePreset.subtitleVi,
        scriptLines: [line1.trim(), line2.trim(), line3.trim()].filter((l) => l.length >= 2),
        priceLabel: activePreset.priceLabel,
        areaLabel: activePreset.areaLabel,
        ctaLabel: videoLocale === "en" ? activePreset.ctaEn : activePreset.ctaVi,
        batchCode: activePreset.batchCode,
        qrTargetUrl: `https://naifarm.vercel.app/trace/${activePreset.batchCode}`,
        imagePaths: activePreset.imagePaths,
        modeRequested: renderMode,
        templateId,
        aspectRatio,
        locale: videoLocale,
        durationSec,
      };

      const res = await fetch("/api/video/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        notifyError(json.error || "Không thể gửi yêu cầu kết xuất video");
        return;
      }

      if (json.workerOnline && json.job) {
        setJobs((prev) => [json.job, ...prev.filter((x) => x.jobId !== json.job.jobId)]);
        setActiveJobId(json.job.jobId);
        notifyInfo(
          isEn
            ? `Queued real FFmpeg render job ${json.job.jobId}.`
            : `Đã xếp hàng kết xuất FFmpeg thực tế: ${json.job.jobId}.`,
        );
      } else {
        if (json.fallbackSample) {
          activateSample(json.fallbackSample);
        }
        notifyInfo(
          json.note ||
            (isEn
              ? "Local worker offline — displaying verified FFmpeg studio sample."
              : "Worker cục bộ chưa bật — đang phát video FFmpeg mẫu đã kiểm chứng."),
        );
      }
    } catch {
      notifyError(isEn ? "Network error submitting video job" : "Lỗi kết nối khi gửi tác vụ video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/video/jobs/${encodeURIComponent(jobId)}/cancel`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.job) {
          setJobs((prev) => [json.job, ...prev.filter((x) => x.jobId !== json.job.jobId)]);
        }
        if (activeJobId === jobId) setActiveJobId(null);
        notifyInfo(isEn ? `Canceled job ${jobId}` : `Đã hủy tác vụ ${jobId}`);
      }
    } catch {
      notifyError("Cancel failed");
    }
  };

  return (
    <div className="space-y-6" data-testid="ocop-video-studio-panel">
      {/* Honest Worker + AI Readiness Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Film className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#25352B]">
                {mode === "monitor"
                  ? isEn
                    ? "OCOP AI Video Studio — Operations & Readiness Monitor"
                    : "OCOP AI Video Studio — Giám sát Vận hành & Sẵn sàng"
                  : isEn
                    ? "OCOP AI Video Studio (FFmpeg Local + Cloud Samples)"
                    : "OCOP AI Video Studio (FFmpeg Nội địa + Mẫu kiểm chứng)"}
              </h2>
            </div>
            <p className="text-xs text-[#52645A]">
              {isEn
                ? "Generates real 720p H.264/AAC orchard promo videos with embedded traceability QR and WebVTT captions."
                : "Kết xuất MP4 chuẩn 720p H.264/AAC kèm mã QR truy xuất lô hàng và phụ đề WebVTT VI/EN."}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => void refreshStudioState()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{isEn ? "Refresh Status" : "Làm mới"}</span>
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#E2DFD7] bg-[#F8F6F0] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#52645A]">
              {isEn ? "FFmpeg Render Worker" : "Worker FFmpeg cục bộ"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {health?.workerOnline ? (
                <CheckCircle2 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-[#A96A12]" aria-hidden="true" />
              )}
              <span className="text-xs font-bold text-[#25352B]">
                {health?.workerOnline
                  ? isEn
                    ? "Online (127.0.0.1:4090)"
                    : "Đang hoạt động (127.0.0.1:4090)"
                  : isEn
                    ? "Cloud Sample Preview Mode"
                    : "Chế độ Xem mẫu kiểm chứng"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2DFD7] bg-[#F8F6F0] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#52645A]">
              {isEn ? "Muse AI Generative Provider" : "Bộ tạo cảnh AI (Muse2API)"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8C6A2E]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#25352B]">
                {health?.aiProvider?.enabled
                  ? isEn
                    ? "Enabled"
                    : "Đã bật"
                  : isEn
                    ? "Disabled (Manual Login Required)"
                    : "Tạm tắt (Chờ đăng nhập thủ công)"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2DFD7] bg-[#F8F6F0] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#52645A]">
              {isEn ? "Verified Pre-Rendered Samples" : "Kho Video FFmpeg đã kiểm chứng"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span className="text-xs font-bold text-[#25352B]">
                {samples.length} {isEn ? "QC-passed MP4 clips" : "video MP4 đạt chuẩn FFprobe"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Split: Generator Form + Active Real Player */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* Form Card */}
        <Card className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#25352B]">
              {isEn ? "1. Compose OCOP / Orchard Video Brief" : "1. Soạn Kịch bản Video Nông sản / Tour Vườn"}
            </h3>
            <Badge tone="success">FAST = Deterministic FFmpeg</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span>{isEn ? "Produce or Orchard Tour" : "Nông sản hoặc Tour Vườn"}</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => applyPreset(e.target.value, videoLocale)}
                  className="min-h-[40px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-sm font-medium text-[#25352B]"
                >
                  {PRODUCT_PRESETS.map((p) => (
                    <option key={p.targetId} value={p.targetId}>
                      {isEn ? p.labelEn : p.labelVi}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span>{isEn ? "Render Mode" : "Chế độ kết xuất"}</span>
                <select
                  value={renderMode}
                  onChange={(e) => setRenderMode(e.target.value as VideoRenderMode)}
                  className="min-h-[40px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-sm font-medium text-[#25352B]"
                >
                  <option value="FAST">FAST · FFmpeg Free ({isEn ? "Default" : "Mặc định"})</option>
                  <option value="HYBRID">HYBRID · Muse Fallback to FAST</option>
                  <option value="CINEMATIC">CINEMATIC · Muse Fallback to FAST</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span>{isEn ? "Template" : "Mẫu bố cục"}</span>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value as VideoTemplateId)}
                  className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#25352B]"
                >
                  <option value="commercial_30s">{isEn ? "OCOP Promo" : "Quảng bá OCOP"}</option>
                  <option value="producer_story">{isEn ? "Farmer Story" : "Câu chuyện vườn"}</option>
                  <option value="agritourism_promo">{isEn ? "Orchard Tour" : "Tour sinh thái"}</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span>{isEn ? "Aspect Ratio" : "Khung hình"}</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                  className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#25352B]"
                >
                  <option value="9:16">9:16 (Reels/Shorts)</option>
                  <option value="16:9">16:9 (YouTube/Web)</option>
                  <option value="1:1">1:1 (Feed)</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span>{isEn ? "Duration" : "Thời lượng"}</span>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value) as 15 | 30 | 60)}
                  className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#25352B]"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
                <span className="block truncate">{isEn ? "Captions" : "Phụ đề"}</span>
                <select
                  value={videoLocale}
                  onChange={(e) => applyPreset(selectedPresetId, e.target.value as "vi" | "en")}
                  className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-2.5 text-xs font-medium text-[#25352B]"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1 text-xs font-semibold text-[#25352B]">
              <span>{isEn ? "Headline Overlay" : "Tiêu đề mở đầu video"}</span>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                className="min-h-[40px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-sm text-[#25352B]"
              />
            </label>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "3 Storyboard Beats & Subtitles" : "3 Ý chính (Kịch bản & Phụ đề WebVTT)"}
              </span>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-xs text-[#25352B]"
              />
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-xs text-[#25352B]"
              />
              <input
                type="text"
                value={line3}
                onChange={(e) => setLine3(e.target.value)}
                className="min-h-[38px] w-full rounded-xl border border-[#D6DED2] bg-white px-3 text-xs text-[#25352B]"
              />
            </div>

            {renderMode !== "FAST" ? (
              <div className="rounded-xl border border-[#E6C98C] bg-[#FDF7E8] px-3 py-2 text-xs text-[#704A10]">
                {isEn
                  ? "Muse2API is disabled pending manual owner login. Requests cleanly fall back to deterministic FFmpeg FAST render."
                  : "Muse2API đang tắt chờ đăng nhập thủ công. Hệ thống sẽ ghi nhận yêu cầu và chuyển dự phòng mượt sang FFmpeg FAST Render."}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {health?.workerOnline
                    ? isEn
                      ? "Render Real MP4 via FFmpeg"
                      : "Kết xuất Video MP4 (FFmpeg)"
                    : isEn
                      ? "Load Verified Sample Preview"
                      : "Xem Video FFmpeg Mẫu Tương Ứng"}
                </span>
              </Button>
              <span className="text-[11px] text-[#52645A]">
                QR: <code className="rounded bg-[#F0ECE2] px-1.5 py-0.5">{activePreset.batchCode}</code>
              </span>
            </div>
          </form>
        </Card>

        {/* Active Video Player + FFprobe QC */}
        <Card className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#25352B]">
              {isEn ? "2. Verified MP4 Player & FFprobe QC" : "2. Trình phát MP4 & Kiểm định FFprobe"}
            </h3>
            {activePlayer ? (
              <a
                href={activePlayer.mp4Url}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6DED2] bg-white px-3 py-1.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? "Download MP4" : "Tải MP4"}</span>
              </a>
            ) : null}
          </div>

          {activePlayer ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[#D6DED2] bg-[#14221A]">
                <video
                  ref={videoRef}
                  key={activePlayer.mp4Url}
                  controls
                  playsInline
                  preload="metadata"
                  poster={activePlayer.posterUrl}
                  src={activePlayer.mp4Url}
                  className="mx-auto max-h-[360px] w-full object-contain"
                >
                  {activePlayer.vttUrl ? (
                    <track
                      kind="subtitles"
                      src={activePlayer.vttUrl}
                      label="Captions"
                      default
                    />
                  ) : null}
                </video>
              </div>

              <div className="rounded-xl border border-[#D6DED2] bg-[#F8F6F0] p-3 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#25352B]">{activePlayer.title}</span>
                  <Badge tone="success">
                    {activePlayer.videoCodec.toUpperCase()} / {activePlayer.audioCodec.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[#52645A]">{activePlayer.provenance}</p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#25352B] sm:grid-cols-4">
                  <span>{activePlayer.width}x{activePlayer.height}</span>
                  <span>{activePlayer.durationSec}s · {activePlayer.pixelFormat}</span>
                  <span>{Math.round(activePlayer.sizeBytes / 1024)} KB</span>
                  <span className="truncate font-mono">sha:{activePlayer.sha256.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D6DED2] p-8 text-center text-xs text-[#52645A]">
              {isEn ? "Select a sample below to inspect playback." : "Chọn một video mẫu bên dưới để phát thử."}
            </div>
          )}
        </Card>
      </div>

      {/* Verified Pre-Rendered Samples Gallery */}
      <Card className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#25352B]">
            {isEn
              ? "Pre-Rendered Verified FFmpeg Samples (Always Playable Offline & on Vercel)"
              : "Bộ Video FFmpeg Đã Kết Xuất Sẵn (Luôn phát được trên Vercel & khi offline)"}
          </h3>
          <span className="text-xs text-[#52645A]">{samples.length} MP4</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {samples.map((s) => {
            const selected = activePlayer?.mp4Url === s.mp4Path;
            return (
              <button
                key={s.sampleId}
                type="button"
                onClick={() => activateSample(s)}
                className={`flex flex-col justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                  selected
                    ? "border-[#245B3D] bg-[#EAF0E5]/70 shadow-sm"
                    : "border-[#E2DFD7] bg-white hover:border-[#245B3D]/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase text-[#245B3D]">
                      {s.targetId} · {s.aspectRatio}
                    </span>
                    <span className="rounded bg-[#F0ECE2] px-1.5 py-0.5 text-[10px] font-semibold text-[#52645A]">
                      {s.locale.toUpperCase()} · {Math.round(s.sizeBytes / 1024)} KB
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs font-bold text-[#25352B]">
                    {isEn ? s.titleEn : s.titleVi}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#52645A]">
                  <span>
                    {s.width}×{s.height} · {s.durationSec}s
                  </span>
                  <span className="font-semibold text-[#245B3D]">{isEn ? "Play Sample →" : "Phát mẫu →"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Local Worker Queue Table (shown when local jobs exist) */}
      {jobs.length > 0 ? (
        <Card className="space-y-3 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-[#25352B]">
            {isEn ? "Local Worker Render Queue" : "Hàng đợi Kết xuất FFmpeg Cục bộ"}
          </h3>
          <div className="space-y-2">
            {jobs.slice(0, 8).map((job) => (
              <div
                key={job.jobId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2DFD7] bg-[#FBF9F5] p-3 text-xs"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-[#25352B]">{job.jobId}</span>
                    <Badge tone={job.status === "completed" ? "success" : job.status === "failed" ? "danger" : "warning"}>
                      {job.status}
                    </Badge>
                    <span className="text-[#52645A]">
                      {job.aspectRatio} · {job.durationSec}s · {job.modeUsed}
                    </span>
                  </div>
                  <p className="truncate font-semibold text-[#25352B]">{job.title}</p>
                  <p className="truncate text-[11px] text-[#52645A]">{job.provenanceNote}</p>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === "completed" && job.mp4Url && job.qcReport ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setActivePlayer({
                          title: job.title,
                          mp4Url: job.mp4Url!,
                          vttUrl: job.vttUrl,
                          posterUrl: job.posterUrl,
                          provenance: job.provenanceNote,
                          width: job.qcReport!.width,
                          height: job.qcReport!.height,
                          durationSec: job.qcReport!.durationSec,
                          sizeBytes: job.qcReport!.sizeBytes,
                          videoCodec: job.qcReport!.videoCodec,
                          pixelFormat: job.qcReport!.pixelFormat,
                          audioCodec: job.qcReport!.audioCodec,
                          sha256: job.qcReport!.sha256,
                        })
                      }
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isEn ? "Play" : "Phát"}</span>
                    </Button>
                  ) : null}
                  {job.status !== "completed" && job.status !== "failed" && job.status !== "canceled" ? (
                    <Button size="sm" variant="secondary" onClick={() => void handleCancelJob(job.jobId)}>
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isEn ? "Cancel" : "Hủy"}</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
