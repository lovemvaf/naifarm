import { assertDb, issueToken, jsonError, LiveError, liveJson, newIdentity, rateLimit, requireDatabase, uuid } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!uuid(id)) throw new LiveError(404, "Không tìm thấy phiên.");
    const db = requireDatabase();
    const session = assertDb(await db.from("live_sessions").select("room_name,status,room_ready").eq("id", id).maybeSingle());
    if (!session) throw new LiveError(404, "Không tìm thấy phiên.");
    if (!session.room_ready || !["live", "reconnecting"].includes(session.status)) throw new LiveError(409, "Phiên chưa phát sóng hoặc đã kết thúc.");
    const source = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
    await rateLimit(`viewer:${id}:${source}`, 60, 60);
    const token = await issueToken(session.room_name, newIdentity("viewer"), "Khách xem", false);
    return liveJson({ url: process.env.LIVEKIT_URL, token, expiresAt: Date.now() + 120_000 });
  } catch (error) { return jsonError(error); }
}
