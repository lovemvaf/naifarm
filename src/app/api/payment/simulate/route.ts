import { NextResponse } from "next/server";
import { simulatePaymentForOrder } from "@/lib/payment/store";

export const runtime = "nodejs";

/**
 * Endpoint to simulate payment webhook for testing
 * POST /api/payment/simulate
 * Body: { orderId: "NF-ORD-DEMO-10", amountVnd: 150000 }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = body.orderId || "NF-ORD-DEMO-10";
    const amountVnd = Number(body.amountVnd) || 50000;

    const result = await simulatePaymentForOrder(orderId, amountVnd);

    return NextResponse.json({
      success: true,
      message: `Simulated SePay payment successfully for order ${orderId}`,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("[Payment Simulate API Error]", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
