import { actor, assertDb, jsonError, LiveError, liveJson, ownedSession, requireDatabase } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    if (session.status !== "cancelled" && !assertDb(await requireDatabase().rpc("live_transition", {
      p_session_id: id, p_owner_id: host.id, p_from: ["scheduled"], p_to: "cancelled",
    }))) throw new LiveError(409, "Chỉ có thể hủy lịch chưa bắt đầu.");
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
