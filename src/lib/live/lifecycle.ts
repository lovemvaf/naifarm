import "server-only";
import { ParticipantInfo_State, TrackSource, TwirpError, type ParticipantInfo, type Room, type TrackInfo } from "livekit-server-sdk";
import { activeStatuses, assertDb, livekit, requireDatabase } from "./server";

const missingRoom = (error: unknown) => error instanceof TwirpError && (error.status === 404 || error.code === "not_found");
const iso = (time: number) => new Date(time).toISOString();

export async function reconcileLive(roomName?: string) {
  const db = requireDatabase();
  if (!livekit) return;
  const provider = livekit;
  const now = Date.now();
  let query = db.from("live_sessions").select("*")
    .or(`status.in.(${activeStatuses.join(",")}),cleanup_pending.eq.true`)
    .lte("work_lease_until", iso(now)).order("work_after").limit(1);
  if (roomName) query = query.eq("room_name", roomName);
  else query = query.lte("work_after", iso(now));
  const session = assertDb(await query.maybeSingle());
  if (!session || (session.cleanup_pending && Date.parse(session.work_after) > now)) return;

  const lease = iso(now + 20_000);
  const claimed = assertDb(await db.from("live_sessions").update({ work_lease_until: lease })
    .eq("id", session.id).eq("status", session.status).eq("work_lease_until", session.work_lease_until)
    .select("id").maybeSingle());
  if (!claimed) return;

  // Status and revision protect concurrent end, pin and schedule operations.
  const save = async (fields: Record<string, unknown>) => assertDb(await db.from("live_sessions")
    .update({ ...fields, work_lease_until: iso(0) }).eq("id", session.id)
    .eq("status", session.status).eq("revision", session.revision).eq("work_lease_until", lease)
    .select("id").maybeSingle());

  try {
    if (session.cleanup_pending) {
      const rooms = await provider.listRooms([session.room_name]);
      if (rooms.some((room: Room) => room.name === session.room_name)) {
        const cameras = assertDb(await db.from("live_cameras").select("identity").eq("session_id", session.id));
        const cutoff = BigInt(Math.floor(Date.now() / 1000) + 5);
        await Promise.all([`host-${session.id}`, ...(cameras ?? []).map((camera) => camera.identity)].map((identity) =>
          provider.removeParticipant(session.room_name, identity, { revokeTokenTs: cutoff }).catch((error: unknown) => {
            if (!missingRoom(error)) throw error;
          })));
        await provider.deleteRoom(session.room_name).catch((error: unknown) => { if (!missingRoom(error)) throw error; });
      }
      await save({ cleanup_pending: false, room_ready: false, work_after: iso(0) });
      return;
    }

    const deadline = session.status === "starting" ? session.start_deadline : session.reconnect_deadline;
    if (deadline && Date.parse(deadline) <= now) {
      await save({ status: "ended", ended_at: iso(now), cleanup_pending: true, work_after: iso(now), revision: session.revision + 1 });
      return;
    }

    if (!session.room_ready) {
      await provider.createRoom({ name: session.room_name, maxParticipants: 30, emptyTimeout: 120, departureTimeout: 75 }).catch(async (error: unknown) => {
        if (!(await provider.listRooms([session.room_name])).some((room: Room) => room.name === session.room_name)) throw error;
      });
      await save({ room_ready: true, work_after: iso(now + 3_000), revision: session.revision + 1 });
      return;
    }

    const participants = await provider.listParticipants(session.room_name).catch((error: unknown) => {
      if (missingRoom(error)) return null;
      throw error;
    });
    const host = participants?.find((item: ParticipantInfo) => item.identity === `host-${session.id}`);
    const cameras = assertDb(await db.from("live_cameras").select("identity").eq("session_id", session.id).is("revoked_at", null));
    const hasCamera = participants?.some((item: ParticipantInfo) => item.state === ParticipantInfo_State.ACTIVE
      && (item === host || cameras?.some((camera) => camera.identity === item.identity))
      && item.tracks.some((track: TrackInfo) => track.source === TrackSource.CAMERA && !track.muted));
    const broadcasting = host?.state === ParticipantInfo_State.ACTIVE && hasCamera;
    const status = broadcasting ? "live" : session.status === "live" ? "reconnecting" : session.status;
    await save(status === session.status && participants !== null ? { work_after: iso(now + 8_000) } : {
      status, work_after: iso(now + 8_000), revision: session.revision + 1,
      room_ready: participants !== null,
      started_at: broadcasting ? session.started_at ?? iso(now) : session.started_at,
      reconnect_deadline: broadcasting ? null : session.reconnect_deadline ?? (status === "reconnecting" ? iso(now + 60_000) : null),
    });
  } catch {
    const attempts = session.cleanup_attempts + 1;
    await save(session.cleanup_pending
      ? { cleanup_attempts: attempts, work_after: iso(now + Math.min(120_000, 2_000 * 2 ** Math.min(attempts, 6))) }
      : { work_after: iso(now + 5_000) });
    console.warn("NaiFarm Live provider retry queued", { sessionId: session.id, cleanup: session.cleanup_pending });
  } finally {
    await db.from("live_sessions").update({ work_lease_until: iso(0) }).eq("id", session.id).eq("work_lease_until", lease);
  }
}
