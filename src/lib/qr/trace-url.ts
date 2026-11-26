export const CANONICAL_NAIFARM_ORIGIN = "https://naifarm.vercel.app";

const ALLOWED_TRACE_HOSTS = new Set([
  "naifarm.vercel.app",
  "naifarm-demo.local",
  "localhost",
  "127.0.0.1",
]);

const VALID_BATCH_CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{2,31}$/;
const VALID_PRODUCT_SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,95}$/;

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
  kind?: "batch" | "product";
  batchCode?: string;
  productSlug?: string;
  safePath?: string;
  reason?: string;
  reasonEn?: string;
}

function getAllowedHosts(runtimeHostname?: string): Set<string> {
  const hosts = new Set(ALLOWED_TRACE_HOSTS);
  if (runtimeHostname) {
    hosts.add(runtimeHostname.toLowerCase());
  }
  return hosts;
}

/**
 * Strictly parses scanned QR text or manual trace input using URL parser validation.
 * Rejects javascript:/data:/vbscript:/file:, protocol-relative URLs, embedded credentials,
 * XSS characters, subdomain spoofing, and untrusted third-party domains.
 */
export function extractBatchCodeFromScan(
  rawInput: string,
  runtimeHostname?: string,
): ScanValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      reason: "Chưa có dữ liệu mã QR hoặc mã lô để tra cứu.",
      reasonEn: "Please enter a batch code or scan a QR code first.",
    };
  }

  // Strip zero-width / control characters checks & block dangerous schemes or HTML/script payloads
  if (/[\u0000-\u001F\u007F]/.test(trimmed) || trimmed.includes("<") || trimmed.includes(">")) {
    return {
      ok: false,
      reason: "Nội dung QR chứa ký tự điều khiển hoặc mã không an toàn — đã từ chối mở.",
      reasonEn: "QR payload contains unsafe characters — blocked for your security.",
    };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("blob:") ||
    trimmed.startsWith("//")
  ) {
    return {
      ok: false,
      reason: "Nội dung QR chứa giao thức không được phép — hệ thống đã chặn tự động.",
      reasonEn: "Blocked disallowed URI scheme in QR payload.",
    };
  }

  // 1. Direct batch code without slashes (e.g. NF-DEMO-001)
  if (!trimmed.includes("/") && !trimmed.includes(":") && VALID_BATCH_CODE_REGEX.test(trimmed.toUpperCase())) {
    const code = trimmed.toUpperCase();
    return {
      ok: true,
      kind: "batch",
      batchCode: code,
      safePath: `/trace/${encodeURIComponent(code)}`,
    };
  }

  // 2. Parse as URL (both relative `/trace/...`, `/products/...` and absolute `https://...`)
  const isRelativeAllowedPath = trimmed.startsWith("/trace/") || trimmed.startsWith("/products/");
  let parsedUrl: URL;
  try {
    if (isRelativeAllowedPath) {
      parsedUrl = new URL(trimmed, CANONICAL_NAIFARM_ORIGIN);
    } else if (lower.startsWith("http://") || lower.startsWith("https://")) {
      parsedUrl = new URL(trimmed);
    } else {
      return {
        ok: false,
        reason: "Không nhận diện được mã lô NaiFarm (ví dụ: NF-DEMO-001 hoặc /trace/NF-DEMO-001).",
        reasonEn: "Unrecognized NaiFarm batch code (expected e.g. NF-DEMO-001 or /trace/NF-DEMO-001).",
      };
    }
  } catch {
    return {
      ok: false,
      reason: "Định dạng URL trong mã QR không hợp lệ.",
      reasonEn: "Malformed URL inside scanned QR code.",
    };
  }

  // Strictly block embedded credentials or non-http(s) protocols
  if ((parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") || parsedUrl.username || parsedUrl.password) {
    return {
      ok: false,
      reason: "URL QR chứa giao thức hoặc thông tin xác thực không hợp lệ — đã chặn.",
      reasonEn: "Blocked QR URL with disallowed protocol or embedded credentials.",
    };
  }

  // Strict hostname allowlist via URL.hostname (prevents `naifarm.vercel.app.evil.com` spoofing!)
  const allowedHosts = getAllowedHosts(runtimeHostname);
  if (!isRelativeAllowedPath && !allowedHosts.has(parsedUrl.hostname.toLowerCase())) {
    return {
      ok: false,
      reason: `Mã QR trỏ tới tên miền ngoài (${parsedUrl.hostname}), không phải tem truy xuất NaiFarm.`,
      reasonEn: `Blocked external domain (${parsedUrl.hostname}) — only allowlisted NaiFarm trace links are accepted.`,
    };
  }

  // Match `/trace/<batchCode>`
  const traceMatch = /^\/trace\/([^/?#]+)\/?$/i.exec(parsedUrl.pathname);
  if (traceMatch) {
    let code: string;
    try {
      code = decodeURIComponent(traceMatch[1]).trim().toUpperCase();
    } catch {
      return {
        ok: false,
        reason: "Mã lô trong URL QR bị lỗi mã hóa ký tự.",
        reasonEn: "Malformed percent-encoding in QR trace path.",
      };
    }
    if (!VALID_BATCH_CODE_REGEX.test(code)) {
      return {
        ok: false,
        reason: "Mã lô trong URL QR không đúng định dạng chuẩn.",
        reasonEn: "Batch code format in QR URL is invalid.",
      };
    }
    return {
      ok: true,
      kind: "batch",
      batchCode: code,
      safePath: `/trace/${encodeURIComponent(code)}`,
    };
  }

  // Match `/products/<slug>`
  const productMatch = /^\/products\/([^/?#]+)\/?$/i.exec(parsedUrl.pathname);
  if (productMatch) {
    let slug: string;
    try {
      slug = decodeURIComponent(productMatch[1]).trim().toLowerCase();
    } catch {
      return {
        ok: false,
        reason: "Đường dẫn sản phẩm trong mã QR không hợp lệ.",
        reasonEn: "Malformed product path in QR code.",
      };
    }
    if (!VALID_PRODUCT_SLUG_REGEX.test(slug)) {
      return {
        ok: false,
        reason: "Định danh sản phẩm trong mã QR không hợp lệ.",
        reasonEn: "Invalid product identifier in QR code.",
      };
    }
    return {
      ok: true,
      kind: "product",
      productSlug: slug,
      safePath: `/products/${encodeURIComponent(slug)}`,
    };
  }

  return {
    ok: false,
    reason: "URL thuộc NaiFarm nhưng không trỏ tới lộ trình /trace/<mã-lô> hoặc /products/<sản-phẩm>.",
    reasonEn: "URL does not point to an allowed /trace/<batch> or /products/<slug> route.",
  };
}
