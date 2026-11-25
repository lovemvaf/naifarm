import { actor, assertDb, body, describeLiveHosts, jsonError, LiveError, liveJson, ownedSession, publicFields, requireDatabase, uuid, validateProducts } from "@/lib/live/server";
import { reconcileLive } from "@/lib/live/lifecycle";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!uuid(id)) throw new LiveError(404, "Không tìm thấy phiên.");
    const db = requireDatabase();
    await reconcileLive();
    const row = assertDb(await db.from("live_sessions").select(`${publicFields},owner_id`).eq("id", id).maybeSingle());
    if (!row) throw new LiveError(404, "Không tìm thấy phiên.");
    const host = await actor(request, false);
    const owned = !!host && host.id === row.owner_id && host.farms.includes(row.farm_id);
    const [session] = await describeLiveHosts([row]);
    return liveJson({ session, host: owned });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    if (session.status !== "scheduled") throw new LiveError(409, "Chỉ có thể chỉnh sửa lịch chưa bắt đầu.");
    const input = await body(request);
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    const scheduledAt = input.scheduledAt;
    if (title.length < 3 || title.length > 140 || description.length > 2000
      || (scheduledAt != null && (typeof scheduledAt !== "string" || !Number.isFinite(Date.parse(scheduledAt))))) throw new LiveError(400, "Thông tin phiên chưa hợp lệ.");
    const products = await validateProducts(input.productIds ?? session.product_ids, session.farm_id);
    const updated = assertDb(await requireDatabase().from("live_sessions").update({
      title, description, scheduled_at: scheduledAt ?? null, product_ids: products, revision: session.revision + 1,
      pinned_product_id: products.includes(session.pinned_product_id) ? session.pinned_product_id : null,
    }).eq("id", id).eq("status", "scheduled").eq("revision", session.revision).select(publicFields).maybeSingle());
    if (!updated) throw new LiveError(409, "Phiên vừa thay đổi. Hãy thử lại.");
    return liveJson({ session: updated });
  } catch (error) { return jsonError(error); }
}
