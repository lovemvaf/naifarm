"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Download, ExternalLink, Loader2, ShieldAlert, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import type { AchievementCredential } from "@/lib/credentials/achievement-registry";
import { downloadCertificatePdf, renderCertificateCanvas } from "@/lib/export/certificate-pdf";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button } from "@/components/ui/Primitives";

interface CertificatePreviewModalProps {
  credential: AchievementCredential | null;
  onClose: () => void;
}

export function CertificatePreviewModal({
  credential,
  onClose,
}: CertificatePreviewModalProps) {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const [previewState, setPreviewState] = useState<{ key: string; url: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const currentKey = credential ? `${credential.id}:${locale}` : "";
  const previewDataUrl = previewState && previewState.key === currentKey ? previewState.url : null;

  useEffect(() => {
    if (!credential) {
      return;
    }
    let cancelled = false;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://naifarm.vercel.app";
    const verifyUrl = `${origin}/credentials/${credential.id}`;
    renderCertificateCanvas(credential, locale, verifyUrl)
      .then((canvas) => {
        if (!cancelled) {
          setPreviewState({ key: `${credential.id}:${locale}`, url: canvas.toDataURL("image/png") });
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [credential, locale]);

  if (!credential) return null;

  const verifyPath = buildLocalizedHref(`/credentials/${credential.id}`, locale);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://naifarm.vercel.app";
  const verifyUrl = `${origin}/credentials/${credential.id}`;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadCertificatePdf(credential, locale, verifyUrl);
      notifySuccess(
        isEn
          ? `Downloaded ${credential.id}.pdf with Vietnamese diacritics and QR code.`
          : `Đã tải tệp ${credential.id.toLowerCase()}.pdf kèm mã QR đối chiếu.`,
      );
    } catch {
      notifyError(
        isEn ? "Could not generate PDF in this browser." : "Không thể tạo PDF trên trình duyệt này.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? "Achievement Certificate Preview" : "Xem trước Giấy chứng nhận"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18241D]/75 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-[#D6DED2] bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6DED2] pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold text-[#25352B]">
                {isEn ? credential.titleEn : credential.titleVi}
              </h2>
              <p className="text-xs text-[#52645A]">
                {credential.id} · {credential.recipientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.nav.closeButton}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6DED2] hover:bg-[#EAF0E5] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-3 text-xs text-[#80520C]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{isEn ? credential.disclosureEn : credential.disclosureVi}</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-2">
          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt={`${credential.id} preview`}
              className="mx-auto aspect-[1684/1190] w-full max-w-3xl rounded-[10px] object-contain shadow-sm"
            />
          ) : (
            <div className="flex aspect-[1684/1190] w-full items-center justify-center text-xs text-[#52645A]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{isEn ? "Rendering certificate canvas..." : "Đang dựng bản xem trước chứng nhận..."}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">QR · {credential.id}</Badge>
            <Link
              href={verifyPath}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#245B3D] underline"
            >
              <span>{isEn ? "Open public verification page" : "Mở trang xác minh công khai"}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t.nav.closeButton}
            </Button>
            <Button variant="primary" size="sm" onClick={() => void handleDownloadPdf()} disabled={downloading}>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isEn ? "Download PDF (.pdf)" : "Tải PDF tiếng Việt (.pdf)"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
