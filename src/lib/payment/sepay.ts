export interface SepayWebhookPayload {
  id: number | string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code?: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  orderId: string;
  gateway: string;
  accountNumber: string;
  transferType: "in" | "out";
  amountVnd: number;
  content: string;
  referenceCode?: string;
  sepayTransactionId?: string;
  status: "pending" | "success" | "failed";
  createdAtIso: string;
}

export const SEPAY_CONFIG = {
  bankCode: process.env.NEXT_PUBLIC_SEPAY_BANK_NAME || "MBBank",
  bankDisplayName: "MBBank (Ngân hàng Quân Đội)",
  accountNumber: process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NO || "0369966231",
  accountName: process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME || "NGUYEN HOANG HAI",
};

/**
 * Builds standard SePay / VietQR quick payment image URL
 */
export function getSepayQrUrl(options: {
  amount: number;
  orderId: string;
  accountNumber?: string;
  bankCode?: string;
}): string {
  const acc = options.accountNumber || SEPAY_CONFIG.accountNumber;
  const bank = options.bankCode || SEPAY_CONFIG.bankCode;
  const des = encodeURIComponent(options.orderId);
  return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${Math.round(options.amount)}&des=${des}`;
}

/**
 * Alternative VietQR URL fallback
 */
export function getVietQrFallbackUrl(options: {
  amount: number;
  orderId: string;
  accountNumber?: string;
  bankCode?: string;
  accountName?: string;
}): string {
  const acc = options.accountNumber || SEPAY_CONFIG.accountNumber;
  const bank = options.bankCode || SEPAY_CONFIG.bankCode;
  const des = encodeURIComponent(options.orderId);
  const name = encodeURIComponent(options.accountName || SEPAY_CONFIG.accountName);
  return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${Math.round(options.amount)}&addInfo=${des}&accountName=${name}`;
}

/**
 * Extracts order ID from transfer content/description
 * Handles formats like:
 * - "NF-ORD-DEMO-10"
 * - "NFORDDEMO10"
 * - "PAR-2026-123456"
 * - "NF ORD DEMO 10"
 */
export function parseOrderIdFromContent(content: string = "", description: string = ""): string | null {
  const text = `${content} ${description}`.trim();
  if (!text) return null;

  // 1. Direct standard order regex (e.g. NF-ORD-DEMO-10 or NF-ORD-123)
  const standardMatch = text.match(/NF-ORD-(?:DEMO-)?\w+/i);
  if (standardMatch) {
    return standardMatch[0].toUpperCase();
  }

  // 2. Parent order regex (e.g. PAR-2026-123456)
  const parMatch = text.match(/PAR-\d{4}-\w+/i);
  if (parMatch) {
    return parMatch[0].toUpperCase();
  }

  // 3. Compacted or space-separated variations (e.g. "NFORDDEMO10" or "NF ORD DEMO 10")
  const normalized = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const compactMatch = normalized.match(/NFORD(?:DEMO)?(\d+)/);
  if (compactMatch) {
    const rawNum = compactMatch[1];
    return `NF-ORD-DEMO-${rawNum}`;
  }

  return null;
}
