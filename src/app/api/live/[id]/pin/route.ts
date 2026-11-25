import { activeStatuses, actor, assertDb, body, jsonError, LiveError, liveJson, ownedSession, requireDatabase } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    const { productId, revision } = await body(request);
    if (!activeStatuses.includes(session.status) && session.status !== "scheduled") throw new LiveError(409, "Phiên đã đóng.");
    if (productId !== null && (typeof productId !== "string" || !session.product_ids.includes(productId))) throw new LiveError(400, "Sản phẩm chưa được thêm vào phiên.");
    if (revision !== session.revision) throw new LiveError(409, "Phiên vừa thay đổi. Hãy chọn lại sản phẩm.");
    const updated = assertDb(await requireDatabase().from("live_sessions").update({ pinned_product_id: productId, revision: session.revision + 1 })
      .eq("id", id).eq("revision", revision).select("id").maybeSingle());
    if (!updated) throw new LiveError(409, "Phiên vừa thay đổi. Hãy chọn lại sản phẩm.");
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
