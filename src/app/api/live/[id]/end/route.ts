import { activeStatuses, actor, assertDb, jsonError, LiveError, liveJson, ownedSession, requireDatabase } from "@/lib/live/server";
import { reconcileLive } from "@/lib/live/lifecycle";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    if (session.status !== "ended" && !assertDb(await requireDatabase().rpc("live_transition", {
      p_session_id: id, p_owner_id: host.id, p_from: activeStatuses, p_to: "ended",
    }))) throw new LiveError(409, "Phiên này chưa được phát.");
    await reconcileLive(session.room_name);
    const current = await ownedSession(id, host);
    return liveJson({ status: current.status, cleanupPending: current.cleanup_pending }, current.cleanup_pending ? 202 : 200);
  } catch (error) { return jsonError(error); }
}
