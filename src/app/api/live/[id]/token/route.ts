import { activeStatuses, actor, issueToken, jsonError, LiveError, liveJson, ownedSession, rateLimit } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const session = await ownedSession((await params).id, host);
    if (!activeStatuses.includes(session.status) || !session.room_ready) throw new LiveError(409, "Phòng phát chưa mở hoặc đã đóng.");
    await rateLimit(`host-token:${host.id}`, 20, 60);
    const token = await issueToken(session.room_name, `host-${session.id}`, host.name, true);
    return liveJson({ url: process.env.LIVEKIT_URL, token, expiresAt: Date.now() + 120_000 });
  } catch (error) { return jsonError(error); }
}
