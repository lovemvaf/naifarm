import { NextResponse } from "next/server";
import { getPaymentStatusByOrderId } from "@/lib/payment/store";

export const runtime = "nodejs";

/**
 * Checks payment status for a given orderId
 * GET /api/payment/status?orderId=NF-ORD-DEMO-10
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    const result = await getPaymentStatusByOrderId(orderId);
    return NextResponse.json({
      success: true,
      paid: result.paid,
      orderId: result.orderId,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("[Payment Status API Error]", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
