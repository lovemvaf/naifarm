import {
  parseOrderIdFromContent,
  type PaymentTransactionRecord,
  type SepayWebhookPayload,
  SEPAY_CONFIG,
} from "./sepay";

declare global {
  // eslint-disable-next-line no-var
  var __sepayTransactions: PaymentTransactionRecord[] | undefined;
}

if (!globalThis.__sepayTransactions) {
  globalThis.__sepayTransactions = [];
}

function getMemoryStore(): PaymentTransactionRecord[] {
  return globalThis.__sepayTransactions!;
}

async function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

/**
 * Record incoming SePay transaction into memory and database
 */
export async function recordSepayTransaction(
  payload: SepayWebhookPayload
): Promise<{ success: boolean; transaction: PaymentTransactionRecord; orderId: string | null }> {
  const orderId = parseOrderIdFromContent(payload.content, payload.description || "");
  const transactionId = `TX-${payload.id || Date.now()}`;

  const record: PaymentTransactionRecord = {
    id: transactionId,
    orderId: orderId || "UNKNOWN",
    gateway: payload.gateway || SEPAY_CONFIG.bankCode,
    accountNumber: payload.accountNumber || SEPAY_CONFIG.accountNumber,
    transferType: payload.transferType,
    amountVnd: Number(payload.transferAmount) || 0,
    content: payload.content || "",
    referenceCode: payload.referenceCode || undefined,
    sepayTransactionId: String(payload.id || ""),
    status: payload.transferType === "in" ? "success" : "failed",
    createdAtIso: new Date().toISOString(),
  };

  // 1. Save to in-memory store
  const mem = getMemoryStore();
  const existingIdx = mem.findIndex(
    (t) => t.id === transactionId || (payload.id && t.sepayTransactionId === String(payload.id))
  );
  if (existingIdx >= 0) {
    mem[existingIdx] = record;
  } else {
    mem.unshift(record);
  }

  // 2. Persist to Supabase if connected
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { error: txError } = await supabase.from("payment_transactions").upsert(
        {
          id: record.id,
          order_id: record.orderId,
          gateway: record.gateway,
          account_number: record.accountNumber,
          transfer_type: record.transferType,
          amount_vnd: record.amountVnd,
          content: record.content,
          reference_code: record.referenceCode || null,
          sepay_transaction_id: record.sepayTransactionId || null,
          raw_payload: payload,
          status: record.status,
        },
        { onConflict: "id" }
      );

      if (txError) {
        console.error("[SePay Store] Supabase payment_transactions upsert error:", txError);
      } else {
        console.log("[SePay Store] Successfully stored payment transaction in Supabase:", record.id);
      }

      // If order ID exists in database orders table, update it
      if (orderId && record.status === "success") {
        const updatePayload: Record<string, unknown> = {
          payment_label: "Đã thanh toán qua MBBank (SePay)",
        };
        // Also update payment_status if column exists
        updatePayload.payment_status = "paid_bank";

        const { error: orderError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderId);

        if (orderError) {
          console.warn("[SePay Store] Supabase order update notice:", orderError.message);
          // If payment_status column didn't exist, try updating only payment_label
          if (orderError.message?.includes("payment_status")) {
            await supabase
              .from("orders")
              .update({ payment_label: "Đã thanh toán qua MBBank (SePay)" })
              .eq("id", orderId);
          }
        } else {
          console.log("[SePay Store] Updated order payment status in Supabase:", orderId);
        }
      }
    } catch (err) {
      console.warn("[SePay Store] Supabase sync warning (ignorable in demo):", err);
    }
  }

  return { success: true, transaction: record, orderId };
}

/**
 * Check if an order has been paid
 */
export async function getPaymentStatusByOrderId(orderId: string): Promise<{
  paid: boolean;
  orderId: string;
  transaction: PaymentTransactionRecord | null;
}> {
  const normId = orderId.trim().toUpperCase();

  // 1. Check memory store first
  const mem = getMemoryStore();
  const foundMem = mem.find(
    (t) => t.orderId.toUpperCase() === normId && t.status === "success" && t.transferType === "in"
  );
  if (foundMem) {
    return { paid: true, orderId: normId, transaction: foundMem };
  }

  // 2. Check Supabase
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("order_id", normId)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const record: PaymentTransactionRecord = {
          id: data.id,
          orderId: data.order_id,
          gateway: data.gateway,
          accountNumber: data.account_number,
          transferType: data.transfer_type,
          amountVnd: data.amount_vnd,
          content: data.content,
          referenceCode: data.reference_code || undefined,
          sepayTransactionId: data.sepay_transaction_id || undefined,
          status: data.status,
          createdAtIso: data.created_at,
        };
        return { paid: true, orderId: normId, transaction: record };
      }
    } catch {
      // ignore
    }
  }

  return { paid: false, orderId: normId, transaction: null };
}

/**
 * Simulate payment for testing without waiting for live SePay
 */
export async function simulatePaymentForOrder(
  orderId: string,
  amountVnd: number = 50000
): Promise<{ success: boolean; transaction: PaymentTransactionRecord }> {
  const payload: SepayWebhookPayload = {
    id: Date.now(),
    gateway: SEPAY_CONFIG.bankCode,
    transactionDate: new Date().toISOString(),
    accountNumber: SEPAY_CONFIG.accountNumber,
    code: null,
    content: `${orderId} thanh toan thu nghiem`,
    transferType: "in",
    transferAmount: amountVnd,
    referenceCode: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Mô phỏng thanh toán đơn hàng ${orderId}`,
  };

  const res = await recordSepayTransaction(payload);
  return { success: res.success, transaction: res.transaction };
}
