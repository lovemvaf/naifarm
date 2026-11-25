"use client";

import React, { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Award, CheckCircle2, Download, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { resolveAchievementCredential } from "@/lib/credentials/achievement-registry";
import { downloadCertificatePdf } from "@/lib/export/certificate-pdf";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, EmptyState } from "@/components/ui/Primitives";

function CredentialDetailContent({ id }: { id: string }) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const credential = resolveAchievementCredential(decodeURIComponent(id));
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!credential) return;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://naifarm.vercel.app";
    const verifyUrl = `${origin}/credentials/${credential.id}`;
    QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      color: { dark: "#19472E", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [credential]);

  if (!credential) {
    return (
      <div className="mx-auto max-w-[840px] px-4 py-12">
        <EmptyState
          icon={<XCircle className="h-6 w-6" />}
          title={isEn ? "Achievement record not found" : "Không tìm thấy mã chứng nhận"}
          description={
            isEn
              ? "Please verify the certificate code (e.g. NF-CERT-2026-001) or return to Volunteer Hub."
              : "Vui lòng kiểm tra lại mã chứng nhận (ví dụ NF-CERT-2026-001) hoặc quay về mục Thanh niên Tình nguyện."
          }
          action={
            <Link
              href={buildLocalizedHref("/volunteer", locale)}
              className="inline-flex min-h-[42px] items-center rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white"
            >
              {isEn ? "Open Volunteer Hub" : "Về mục Thanh niên Tình nguyện"}
            </Link>
          }
        />
      </div>
    );
  }

  const isRevoked = credential.status === "revoked_sample";
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/credentials/${credential.id}`
      : `https://naifarm.vercel.app/credentials/${credential.id}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificatePdf(credential, locale, verifyUrl);
      notifySuccess(
        isEn
          ? `Downloaded ${credential.id}.pdf`
          : `Đã tải tệp ${credential.id.toLowerCase()}.pdf`,
      );
    } catch {
      notifyError(isEn ? "PDF export failed." : "Xuất PDF thất bại.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-4 py-8 lg:px-8">
      <Link
        href={buildLocalizedHref("/volunteer", locale)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{isEn ? "Back to Volunteer & Certificates" : "Quay lại Thanh niên Tình nguyện"}</span>
      </Link>

      <div className="flex items-start gap-2.5 rounded-[14px] border border-[#D7A34D]/60 bg-[#FFF8E7] p-4 text-xs text-[#80520C]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{isEn ? credential.disclosureEn : credential.disclosureVi}</span>
      </div>

      <Card className="border-2 border-[#245B3D] bg-[#FAF8F1] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isRevoked ? "danger" : "success"}>
                {isRevoked ? (
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {isRevoked
                    ? isEn
                      ? "Revoked sample record"
                      : "Đã thu hồi (mẫu)"
                    : isEn
                    ? "Verified Experience Record"
                    : "Bản ghi trải nghiệm hợp lệ"}
                </span>
              </Badge>
              <Badge tone="neutral">{credential.id}</Badge>
            </div>

            <h1 className="font-editorial text-2xl font-bold text-[#25352B] sm:text-3xl">
              {isEn ? credential.titleEn : credential.titleVi}
            </h1>

            <p className="text-sm text-[#52645A]">
              {isEn ? "Awarded to:" : "Cấp cho thành viên:"}{" "}
              <strong className="text-base text-[#245B3D]">{credential.recipientName}</strong>
            </p>

            <div className="space-y-1.5 rounded-[14px] border border-[#D6DED2] bg-white p-4 text-xs text-[#25352B]">
              <p>
                <strong>{isEn ? "Program / Scope:" : "Chương trình / Phạm vi:"}</strong>{" "}
                {isEn ? credential.programEn : credential.programVi}
              </p>
              <p>
                <strong>{isEn ? "Completed hours:" : "Giờ thực hành ghi nhận:"}</strong>{" "}
                {credential.hoursCompleted}h · {credential.scoreText}
              </p>
              <p>
                <strong>{isEn ? "Issued by:" : "Đơn vị ghi nhận:"}</strong>{" "}
                {isEn ? credential.organizerEn : credential.organizerVi}
              </p>
              <p>
                <strong>{isEn ? "Administrative area:" : "Địa bàn:"}</strong> {credential.wardName} ·{" "}
                {isEn ? "Date:" : "Ngày cấp:"} {credential.issuedAt}
              </p>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" onClick={() => void handleDownload()} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isEn ? "Download Certificate PDF (.pdf)" : "Tải PDF tiếng Việt (.pdf)"}</span>
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center rounded-[16px] border border-[#D6DED2] bg-white p-4 text-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR ${credential.id}`} className="h-40 w-40 rounded-lg" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-[#F5F3E9]">
                <Award className="h-10 w-10 text-[#245B3D]" aria-hidden="true" />
              </div>
            )}
            <p className="mt-2 font-mono text-[11px] font-bold text-[#245B3D]">{credential.id}</p>
            <p className="text-[11px] text-[#52645A]">
              {isEn ? "Scan to verify record" : "Quét để kiểm tra mã"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CredentialVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[960px] px-4 py-12 text-sm text-[#52645A]">
          Loading certificate verification...
        </div>
      }
    >
      <CredentialDetailContent id={id} />
    </Suspense>
  );
}
