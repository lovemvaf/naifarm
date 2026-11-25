import { TwirpError } from "livekit-server-sdk";
import { actor, assertDb, jsonError, LiveError, liveJson, livekit, ownedSession, requireDatabase } from "@/lib/live/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host || !livekit) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    const session = await ownedSession(id, host);
    const db = requireDatabase();
    const camera = assertDb(await db.from("live_cameras").select("id,identity").eq("session_id", id).is("revoked_at", null).maybeSingle());
    if (camera) {
      await livekit.removeParticipant(session.room_name, camera.identity, { revokeTokenTs: BigInt(Math.floor(Date.now() / 1000) + 5) }).catch((error) => {
        if (!(error instanceof TwirpError && error.status === 404)) throw error;
      });
      assertDb(await db.from("live_cameras").update({ revoked_at: new Date().toISOString() }).eq("id", camera.id));
    }
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
