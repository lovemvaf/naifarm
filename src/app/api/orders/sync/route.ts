import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getSupabaseServerClient() {
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
 * Sync orders created from checkout to Supabase orders & order_items tables
 * POST /api/orders/sync
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orders = Array.isArray(body.orders) ? body.orders : body.order ? [body.order] : [];

    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: "No orders provided" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: "Supabase not configured, skipped DB persistence" });
    }

    const insertedIds: string[] = [];
    const errors: string[] = [];

    for (const ord of orders) {
      try {
        const orderRow = {
          id: ord.id,
          customer_name: ord.customerName || "Khách hàng",
          customer_phone_demo: ord.customerPhoneDemo || "",
          farm_id: ord.farmId,
          farm_name: ord.farmName || "",
          delivery_method: ord.deliveryMethod || "delivery",
          delivery_address: ord.deliveryAddress || "",
          subtotal_vnd: ord.subtotalVnd || 0,
          shipping_fee_vnd: ord.shippingFeeVnd || 0,
          total_vnd: ord.totalVnd || 0,
          payment_label: ord.paymentLabel || "Chờ thanh toán",
          status: ord.status || "pending_confirm",
          timeline: ord.timeline || [],
          created_at_label: ord.createdAtLabel || "Vừa đặt",
          is_demo: true,
        };

        const { error: ordErr } = await supabase.from("orders").upsert(orderRow, { onConflict: "id" });
        if (ordErr) {
          console.warn("[Order Sync] Order upsert notice:", ordErr.message);
          errors.push(`${ord.id}: ${ordErr.message}`);
        } else {
          insertedIds.push(ord.id);
        }

        // Also sync order_items if present
        if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
          const itemRows = ord.items.map((item: any) => ({
            order_id: ord.id,
            product_id: item.productId,
            product_name: item.productName || "",
            unit_label: item.unitLabel || "",
            quantity: item.quantity || 1,
            unit_price_vnd: item.unitPriceVnd || 0,
            image: item.image || "",
          }));

          await supabase.from("order_items").delete().eq("order_id", ord.id);
          await supabase.from("order_items").insert(itemRows);
        }
      } catch (err) {
        console.warn(`[Order Sync] Error syncing order ${ord.id}:`, err);
      }
    }

    return NextResponse.json({
      success: insertedIds.length > 0,
      syncedCount: insertedIds.length,
      syncedIds: insertedIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Order Sync API Error]", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
