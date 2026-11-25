"use client";

import QRCode from "qrcode";
import type { AchievementCredential } from "@/lib/credentials/achievement-registry";
import type { Locale } from "@/types/naifarm";

/**
 * Generates a crisp, Vietnamese-diacritic-accurate A4 Landscape Certificate as a valid %PDF-1.4 file
 * by rendering onto an HTML5 Canvas (using browser Web Fonts Be Vietnam Pro / Lora + QRCode library)
 * and packaging the rasterized JPEG stream into a standalone downloadable PDF binary — zero native binary risk.
 */
function buildSinglePagePdfFromJpeg(
  jpegBytes: Uint8Array,
  pixelWidth: number,
  pixelHeight: number,
): Blob {
  // A4 Landscape in PDF points (72 dpi): 842 x 595 pt
  const pageW = 842;
  const pageH = 595;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let bytePos = 0;

  const pushStr = (s: string) => {
    const b = encoder.encode(s);
    chunks.push(b);
    bytePos += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    bytePos += b.length;
  };
  const startObj = () => {
    offsets.push(bytePos);
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // 1: Catalog
  startObj();
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages
  startObj();
  pushStr("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page
  startObj();
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  );

  // 4: JPEG Image XObject
  startObj();
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  pushBytes(jpegBytes);
  pushStr("\nendstream\nendobj\n");

  // 5: Content stream placing Im0 across full A4 landscape page
  const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  startObj();
  pushStr(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`,
  );

  const xrefOffset = bytePos;
  pushStr(`xref\n0 ${offsets.length}\n`);
  pushStr("0000000000 65535 f \n");
  for (let i = 1; i < offsets.length; i++) {
    pushStr(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  const combined = new Uint8Array(bytePos);
  let cursor = 0;
  for (const part of chunks) {
    combined.set(part, cursor);
    cursor += part.length;
  }
  return new Blob([combined], { type: "application/pdf" });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderCertificateCanvas(
  cert: AchievementCredential,
  locale: Locale,
  verifyUrl: string,
): Promise<HTMLCanvasElement> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const width = 1684; // High-DPI A4 Landscape
  const height = 1190;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  // Cream editorial paper backdrop
  ctx.fillStyle = "#FAF8F1";
  ctx.fillRect(0, 0, width, height);

  // Outer botanical green frame + inner gold rule
  ctx.strokeStyle = "#245B3D";
  ctx.lineWidth = 18;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  ctx.strokeStyle = "#D7A34D";
  ctx.lineWidth = 4;
  ctx.strokeRect(66, 66, width - 132, height - 132);

  // Subtle corner accents
  ctx.fillStyle = "#EAF0E5";
  ctx.fillRect(92, 92, width - 184, 150);

  // Header
  ctx.fillStyle = "#245B3D";
  ctx.textAlign = "center";
  ctx.font = 'bold 28px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    locale === "en"
      ? "NAIFARM · DONG NAI YOUTH OCOP EXPERIENCE"
      : "NAIFARM · CHỢ OCOP THANH NIÊN ĐỒNG NAI",
    width / 2,
    150,
  );
  ctx.fillStyle = "#80520C";
  ctx.font = '600 20px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    locale === "en"
      ? "EXPERIENCE & COMMUNITY RECOGNITION CERTIFICATE (SAMPLE RECORD)"
      : "GIẤY CHỨNG NHẬN TRẢI NGHIỆM & CỐNG HIẾN CỘNG ĐỒNG (BẢN MẪU)",
    width / 2,
    194,
  );

  // Certificate main title
  ctx.fillStyle = "#25352B";
  ctx.font = 'bold 46px "Lora", Georgia, serif';
  const mainTitle = locale === "en" ? cert.titleEn : cert.titleVi;
  const titleLines = wrapLines(ctx, mainTitle, width - 300);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 325 + i * 56);
  });

  // Presented to
  const nameTopY = 335 + titleLines.length * 56;
  ctx.fillStyle = "#52645A";
  ctx.font = '600 22px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    locale === "en" ? "Proudly recognized for:" : "Trân trọng ghi nhận đóng góp của:",
    width / 2,
    nameTopY,
  );

  ctx.fillStyle = "#245B3D";
  ctx.font = 'bold 62px "Lora", Georgia, serif';
  ctx.fillText(cert.recipientName, width / 2, nameTopY + 76);

  // Gold divider rule under name
  ctx.strokeStyle = "#D7A34D";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 260, nameTopY + 102);
  ctx.lineTo(width / 2 + 260, nameTopY + 102);
  ctx.stroke();

  // Program details
  ctx.fillStyle = "#25352B";
  ctx.font = '500 26px "Be Vietnam Pro", system-ui, sans-serif';
  const programText = locale === "en" ? cert.programEn : cert.programVi;
  const progLines = wrapLines(ctx, programText, width - 360);
  progLines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, nameTopY + 158 + idx * 38);
  });

  // Metrics row
  const metricsY = nameTopY + 258;
  ctx.fillStyle = "#245B3D";
  ctx.font = 'bold 24px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    `${locale === "en" ? "Hours:" : "Giờ thực hành:"} ${cert.hoursCompleted}h  ·  ${cert.scoreText}  ·  ${cert.wardName}`,
    width / 2,
    metricsY,
  );

  // Footer left: Organizer & ID & Date
  ctx.textAlign = "left";
  ctx.fillStyle = "#25352B";
  ctx.font = 'bold 22px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(locale === "en" ? cert.organizerEn : cert.organizerVi, 120, height - 210);
  ctx.fillStyle = "#52645A";
  ctx.font = '500 18px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(
    `${locale === "en" ? "Issued:" : "Ngày ghi nhận:"} ${cert.issuedAt}  ·  ID: ${cert.id}`,
    120,
    height - 172,
  );

  // Honest disclosure line
  const discLines = wrapLines(
    ctx,
    locale === "en" ? cert.disclosureEn : cert.disclosureVi,
    width - 420,
  );
  ctx.font = '500 16px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillStyle = "#80520C";
  discLines.forEach((l, idx) => {
    ctx.fillText(l, 120, height - 125 + idx * 24);
  });

  // Footer right: Real scannable QR code linking to /credentials/[id]
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, verifyUrl, {
    width: 176,
    margin: 1,
    color: { dark: "#19472E", light: "#FFFFFF" },
  });
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(width - 296, height - 282, 188, 188);
  ctx.strokeStyle = "#D6DED2";
  ctx.lineWidth = 2;
  ctx.strokeRect(width - 296, height - 282, 188, 188);
  ctx.drawImage(qrCanvas, width - 290, height - 276, 176, 176);

  return canvas;
}

export async function downloadCertificatePdf(
  cert: AchievementCredential,
  locale: Locale,
  verifyUrl: string,
): Promise<void> {
  const canvas = await renderCertificateCanvas(cert, locale, verifyUrl);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const base64 = dataUrl.split(",")[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  const blob = buildSinglePagePdfFromJpeg(bytes, canvas.width, canvas.height);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cert.id.toLowerCase()}-${locale}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
