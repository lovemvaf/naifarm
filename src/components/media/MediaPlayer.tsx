"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText, Play, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { isAllowlistedEmbedUrl, type MediaAsset } from "@/data/reference/media-library";
import { cn } from "@/lib/format";
import { Badge } from "@/components/ui/Primitives";

interface MediaPlayerProps {
  asset: MediaAsset;
  className?: string;
  compact?: boolean;
}

/**
 * Shared 2D Accessible MediaPlayer (V5.08 §8.4):
 * - Native HTML5 <video controls playsInline preload="metadata"> with WebVTT captions when owned MP4
 * - Privacy-friendly click-to-load YouTube facade (loads embed ONLY after user clicks Play)
 * - Clean publisher link card when external site does not grant embed permission
 * - Automatically pauses local video playback on unmount / route switch
 */
export function MediaPlayer({ asset, className, compact = false }: MediaPlayerProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [embedActive, setEmbedActive] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [localMp4Failed, setLocalMp4Failed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const vid = videoRef.current;
    return () => {
      if (vid && !vid.paused) {
        vid.pause();
      }
    };
  }, []);

  const title = isEn ? asset.titleEn : asset.titleVi;
  const summary = isEn ? asset.summaryEn : asset.summaryVi;
  const rightsLabel = isEn ? asset.rightsLabelEn : asset.rightsLabelVi;
  const transcript = isEn ? asset.transcriptEn ?? asset.summaryEn : asset.transcriptVi ?? asset.summaryVi;

  const allowYoutubeEmbed =
    asset.kind === "external_embed_click_to_load" &&
    Boolean(asset.youtubeId) &&
    isAllowlistedEmbedUrl(asset.externalUrl);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border border-[#D6DED2] bg-white shadow-[0_2px_8px_rgba(37,53,43,0.04)]",
        className,
      )}
    >
      {/* Visual / Video Viewport */}
      {asset.kind === "owned_local_mp4" && asset.localMp4Path && !localMp4Failed ? (
        <div className="relative aspect-video bg-[#18241D]">
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster={asset.posterImage}
            onError={() => setLocalMp4Failed(true)}
            className="h-full w-full object-contain"
          >
            <source src={asset.localMp4Path} type="video/mp4" />
            {asset.localVttVi ? (
              <track
                kind="captions"
                src={asset.localVttVi}
                srcLang="vi"
                label="Tiếng Việt"
                default={locale === "vi"}
              />
            ) : null}
            {asset.localVttEn ? (
              <track
                kind="captions"
                src={asset.localVttEn}
                srcLang="en"
                label="English"
                default={locale === "en"}
              />
            ) : null}
          </video>
        </div>
      ) : allowYoutubeEmbed && embedActive && asset.youtubeId ? (
        <div className="relative aspect-video bg-[#18241D]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${asset.youtubeId}?rel=0`}
            title={title}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <div className={cn("relative bg-[#25352B]", compact ? "aspect-[16/9]" : "aspect-video")}>
          <img
            src={asset.posterImage}
            alt={title}
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-[#18241D]/85 via-[#18241D]/20 to-transparent p-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-[#25352B]">
                <ShieldCheck className="h-3 w-3 text-[#245B3D]" aria-hidden="true" />
                <span>{asset.publisher}</span>
              </span>
              <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white">
                {asset.publishedAt}
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              {allowYoutubeEmbed ? (
                <button
                  type="button"
                  onClick={() => setEmbedActive(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#D7A34D] px-4 text-xs font-bold text-[#25352B] shadow-md transition hover:bg-[#C6923D] cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-[#25352B]" aria-hidden="true" />
                  <span>{isEn ? "Load & Play Reference Clip" : "Phát tư liệu tham khảo"}</span>
                </button>
              ) : (
                <a
                  href={asset.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-white px-4 text-xs font-bold text-[#245B3D] shadow-md hover:bg-[#EAF0E5]"
                >
                  <span>{isEn ? "Open Official Source" : "Mở bài viết / Video tại nguồn"}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provenance, Rights & Transcript Footer */}
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={asset.kind === "owned_local_mp4" ? "success" : "info"}>
            {rightsLabel}
          </Badge>
          <a
            href={asset.externalUrl}
            target={asset.kind === "owned_local_mp4" ? undefined : "_blank"}
            rel={asset.kind === "owned_local_mp4" ? undefined : "noopener noreferrer"}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#245B3D] hover:underline"
          >
            <span>{isEn ? "Source link" : "Liên kết gốc"}</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <h3 className="text-sm font-bold text-[#25352B]">{title}</h3>
        <p className="text-xs leading-relaxed text-[#52645A]">{summary}</p>

        {transcript ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              aria-expanded={showTranscript}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#245B3D] hover:underline cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? "Transcript & notes" : "Tóm tắt nội dung (Transcript)"}</span>
              {showTranscript ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            {showTranscript ? (
              <p className="mt-2 rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs leading-relaxed text-[#52645A]">
                {transcript}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
