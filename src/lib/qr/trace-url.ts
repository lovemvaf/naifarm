export const CANONICAL_NAIFARM_ORIGIN = "https://naifarm.vercel.app";

const ALLOWED_TRACE_HOSTS = new Set([
  "naifarm.vercel.app",
  "naifarm-demo.local",
  "localhost",
  "127.0.0.1",
]);

const VALID_BATCH_CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function buildTraceUrl(batchCode: string, origin?: string): string {
  const cleanCode = encodeURIComponent(batchCode.trim().toUpperCase());
  const baseOrigin = (origin && origin.startsWith("http") ? origin : CANONICAL_NAIFARM_ORIGIN).replace(
    /\/+$/,
    "",
  );
  return `${baseOrigin}/trace/${cleanCode}`;
}

export interface ScanValidationResult {
  ok: boolean;
  batchCode?: string;
  reason?: string;
}

/**
 * Strictly parses scanned QR text or manual batch code input.
 * Rejects javascript:/data: schemes, XSS strings, and untrusted third-party URLs.
 */
export function extractBatchCodeFromScan(rawInput: string): ScanValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, reason: "Chưa có dữ liệu mã QR hoặc mã lô để tra cứu." };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    trimmed.includes("<") ||
    trimmed.includes(">")
  ) {
    return {
      ok: false,
      reason: "Nội dung QR chứa giao thức hoặc ký tự không an toàn — đã từ chối mở.",
    };
  }

  // Direct batch code without URL (e.g. NF-DEMO-001)
  if (VALID_BATCH_CODE_REGEX.test(trimmed.toUpperCase()) && !trimmed.includes("/")) {
    return { ok: true, batchCode: trimmed.toUpperCase() };
  }

  // Relative /trace/... path
  if (trimmed.startsWith("/trace/")) {
    const code = decodeURIComponent(trimmed.slice("/trace/".length).split(/[?#]/)[0] ?? "").toUpperCase();
    if (VALID_BATCH_CODE_REGEX.test(code)) {
      return { ok: true, batchCode: code };
    }
    return { ok: false, reason: "Đường dẫn /trace/ không chứa mã lô hợp lệ." };
  }

  // Full URL validation
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (!ALLOWED_TRACE_HOSTS.has(parsed.hostname.toLowerCase())) {
        return {
          ok: false,
          reason: `Mã QR trỏ tới tên miền ngoài (${parsed.hostname}), không phải tem truy xuất NaiFarm.`,
        };
      }
      const match = /^\/trace\/([^/?#]+)/i.exec(parsed.pathname);
      if (!match) {
        return { ok: false, reason: "URL NaiFarm này không trỏ tới lộ trình /trace/<mã-lô>." };
      }
      const code = decodeURIComponent(match[1]).toUpperCase();
      if (!VALID_BATCH_CODE_REGEX.test(code)) {
        return { ok: false, reason: "Mã lô trong URL QR không đúng định dạng chuẩn." };
      }
      return { ok: true, batchCode: code };
    } catch {
      return { ok: false, reason: "Định dạng URL trong mã QR không hợp lệ." };
    }
  }

  return {
    ok: false,
    reason: "Không nhận diện được mã lô NaiFarm (ví dụ chuẩn: NF-DEMO-001 hoặc URL /trace/NF-DEMO-001).",
  };
}
