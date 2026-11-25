import { actor, assertDb, body, jsonError, LiveError, liveJson, ownedSession, requireDatabase, uuid } from "@/lib/live/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!uuid(id)) throw new LiveError(404, "Không tìm thấy phiên.");
    const db = requireDatabase();
    const rawLimit = new URL(request.url).searchParams.get("limit");
    const count = rawLimit && /^\d{1,3}$/.test(rawLimit) ? Math.max(30, Math.min(150, Number(rawLimit))) : 30;
    const messages = assertDb(await db.from("live_messages").select("id,sender_name,body,created_at,sender_id,live_sessions!inner(owner_id)").eq("session_id", id)
      .gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString())
      .is("hidden_at", null).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(count + 1)
      .overrideTypes<Array<{ id: string; sender_name: string; body: string; created_at: string; sender_id: string; live_sessions: { owner_id: string } }>, { merge: false }>()) ?? [];
    const display = messages.slice(0, count).reverse().map(({ sender_id, live_sessions, ...message }) => ({
      ...message, is_host: sender_id === live_sessions.owner_id,
    }));
    return liveJson({ messages: display, more: messages.length > count && count < 150 });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const user = await actor(request);
    if (!user?.canChat) throw new LiveError(403, "Tài khoản chưa được cấp quyền trò chuyện.");
    const { id } = await params;
    const input = await body(request);
    const message = typeof input.body === "string" ? input.body.trim() : "";
    if (!uuid(id) || !message || message.length > 500 || !uuid(input.clientMessageId)) throw new LiveError(400, "Tin nhắn không hợp lệ.");
    const sent = assertDb(await requireDatabase().rpc("live_send_message", {
      p_session_id: id, p_sender_id: user.id, p_sender_name: user.name, p_body: message, p_client_id: input.clientMessageId,
    }));
    if (sent === null) throw new LiveError(429, "Bạn gửi tin quá nhanh.");
    if (!sent) throw new LiveError(409, "Phiên chưa phát sóng hoặc đã đóng.");
    return liveJson({ ok: true }, 201);
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    await ownedSession(id, host);
    const { messageId } = await body(request);
    if (!uuid(messageId)) throw new LiveError(400, "Tin nhắn không hợp lệ.");
    if (!assertDb(await requireDatabase().rpc("live_hide_message", { p_session_id: id, p_message_id: messageId, p_owner_id: host.id }))) {
      throw new LiveError(404, "Không tìm thấy tin nhắn đang hiển thị.");
    }
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
