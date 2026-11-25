import { WebhookReceiver } from "livekit-server-sdk";
import { reconcileLive } from "@/lib/live/lifecycle";
import { assertDb, jsonError, LiveError, liveJson, requireDatabase } from "@/lib/live/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    if (!key || !secret) throw new LiveError(503, "Webhook chưa được cấu hình.");
    const raw = await request.text();
    const auth = request.headers.get("authorization");
    if (!auth || raw.length > 262_144) throw new LiveError(401, "Webhook không hợp lệ.");
    const event = await new WebhookReceiver(key, secret).receive(raw, auth).catch(() => {
      throw new LiveError(401, "Chữ ký webhook không hợp lệ.");
    });
    const db = requireDatabase();
    if (event.id && assertDb(await db.from("live_webhook_events").select("event_id").eq("event_id", event.id).maybeSingle())) return liveJson({ ok: true });
    if (event.room?.name && ["participant_joined", "participant_left", "track_published", "track_unpublished", "room_finished"].includes(event.event)) await reconcileLive(event.room.name);
    if (event.id) assertDb(await db.from("live_webhook_events").upsert({ event_id: event.id }, { ignoreDuplicates: true }));
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
