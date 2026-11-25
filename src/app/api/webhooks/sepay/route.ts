import { NextResponse } from "next/server";
import { recordSepayTransaction } from "@/lib/payment/store";
import type { SepayWebhookPayload } from "@/lib/payment/sepay";

export const runtime = "nodejs";

/**
 * SePay Webhook Endpoint
 * Receives bank transfer notifications from SePay for MBBank account 0369966231
 */
export async function POST(request: Request) {
  try {
    // 1. Verify API Key if configured
    const configuredKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim();
    if (configuredKey) {
      const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key") || "";
      const incomingKey = authHeader.replace(/^(Apikey|Bearer)\s+/i, "").trim();

      if (incomingKey !== configuredKey) {
        console.warn("[SePay Webhook] Unauthorized attempt - key mismatch");
        return NextResponse.json(
          { success: false, message: "Unauthorized: Invalid API Key" },
          { status: 401 }
        );
      }
    } else {
      // Key is left blank as requested for future config: allow preliminary testing
      console.log("[SePay Webhook] SEPAY_WEBHOOK_API_KEY is empty - accepting request in open mode");
    }

    // 2. Parse request body
    const body = await request.json();
    const payload: SepayWebhookPayload = body;

    // Validate payload structure
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload format" },
        { status: 400 }
      );
    }

    // 3. Process incoming transfer
    if (payload.transferType && payload.transferType !== "in") {
      return NextResponse.json(
        { success: true, message: "Ignored outgoing transfer" },
        { status: 200 }
      );
    }

    const { success, transaction, orderId } = await recordSepayTransaction(payload);

    return NextResponse.json(
      {
        success,
        message: "SePay transaction processed successfully",
        orderId,
        transactionId: transaction.id,
        amountVnd: transaction.amountVnd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SePay Webhook Error]", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Health check / verification endpoint for SePay test ping
 */
export async function GET() {
  const configured = Boolean(process.env.SEPAY_WEBHOOK_API_KEY?.trim());
  return NextResponse.json({
    status: "ok",
    gateway: "SePay",
    bank: "MBBank",
    accountNumber: "0369966231",
    apiKeyConfigured: configured,
    message: "SePay webhook endpoint is ready",
  });
}
