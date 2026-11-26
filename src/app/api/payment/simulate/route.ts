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
    const orderId = String(body.orderId || "NF-ORD-DEMO-10").trim();
    const amountVnd = Number(body.amountVnd) || 50000;

    // Guardrail: in production, restrict payment simulation strictly to isolated demo/experience orders
    const isDemoOrderId = /^NF-(ORD-)?DEMO-/i.test(orderId);
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_PAYMENT_SIMULATION_ALL !== "true" &&
      !isDemoOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Simulated payment endpoint is restricted to isolated demo orders (NF-ORD-DEMO-*) in production.",
        },
        { status: 403 }
      );
    }

    if (!Number.isFinite(amountVnd) || amountVnd <= 0 || amountVnd > 500_000_000) {
      return NextResponse.json(
        { success: false, message: "Invalid payment simulation amount." },
        { status: 400 }
      );
    }

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
