import { ParticipantInfo_State, TrackSource, type ParticipantInfo, type TrackInfo } from "livekit-server-sdk";
import { assertDb, body, jsonError, liveJson, livekit, LiveError, rateLimit, requireDatabase, uuid } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!uuid(id)) throw new LiveError(404, "KhÃ´ng tÃ¬m tháº¥y phiÃªn.");
    const db = requireDatabase();
    if (!livekit) throw new LiveError(503, "Livestream chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh.");
    const session = assertDb(await db.from("live_sessions").select("room_name,status,room_ready")
      .eq("id", id).maybeSingle());
    if (!session) throw new LiveError(404, "KhÃ´ng tÃ¬m tháº¥y phiÃªn.");
    if (!session.room_ready || !["live", "reconnecting"].includes(session.status)) throw new LiveError(409, "PhiÃªn chÆ°a phÃ¡t sÃ³ng hoáº·c Ä‘Ã£ káº¿t thÃºc.");

    const source = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
    await rateLimit(`angle:${id}:${source}`, 30, 60);
    const { identity } = await body(request);
    if (typeof identity !== "string" || identity.length > 100) throw new LiveError(400, "GÃ³c camera khÃ´ng há»£p lá»‡.");

    const hostIdentity = `host-${id}`;
    if (identity !== hostIdentity) {
      const camera = assertDb(await db.from("live_cameras").select("id").eq("session_id", id)
        .eq("identity", identity).is("revoked_at", null).maybeSingle());
      if (!camera) throw new LiveError(409, "Camera nÃ y khÃ´ng cÃ²n Ä‘Æ°á»£c ghÃ©p vá»›i phiÃªn.");
    }
    const participants = await livekit.listParticipants(session.room_name);
    const participant = participants.find((item: ParticipantInfo) => item.identity === identity && item.state === ParticipantInfo_State.ACTIVE);
    if (!participant?.tracks.some((track: TrackInfo) => track.source === TrackSource.CAMERA && !track.muted)) {
      throw new LiveError(409, "Camera Ä‘ang chá»n khÃ´ng phÃ¡t video.");
    }
    const changed = assertDb(await db.rpc("live_select_camera", { p_session_id: id, p_identity: identity }));
    if (!changed) throw new LiveError(409, "Camera hoáº·c phiÃªn vá»«a thay Ä‘á»•i. HÃ£y chá»n láº¡i.");
    return liveJson({ identity });
  } catch (error) { return jsonError(error); }
}
