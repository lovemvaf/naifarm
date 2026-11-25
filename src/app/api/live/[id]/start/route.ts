import { activeStatuses, actor, assertDb, jsonError, LiveError, liveJson, ownedSession, requireDatabase } from "@/lib/live/server";
import { reconcileLive } from "@/lib/live/lifecycle";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    await reconcileLive();
    if (session.status === "scheduled") {
      const result = await requireDatabase().rpc("live_start_session", { p_session_id: id, p_owner_id: host.id });
      if (result.error?.code === "23505") throw new LiveError(409, "Một phiên khác đang phát hoặc đang đóng phòng.");
      if (!assertDb(result)) throw new LiveError(409, "Phiên vừa thay đổi. Hãy tải lại.");
    } else if (!activeStatuses.includes(session.status)) throw new LiveError(409, "Phiên đã đóng.");
    await reconcileLive(session.room_name);
    const current = await ownedSession(id, host);
    return liveJson({ status: current.status, ready: current.room_ready }, current.room_ready ? 200 : 202);
  } catch (error) { return jsonError(error); }
}
