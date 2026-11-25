import { createHash, randomBytes } from "node:crypto";
import { actor, assertDb, jsonError, LiveError, liveJson, ownedSession, rateLimit, requireDatabase } from "@/lib/live/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const { id } = await params;
    await ownedSession(id, host);
    await rateLimit(`pair:${host.id}`, 10, 60);
    const code = randomBytes(32).toString("base64url");
    const expiresAt = assertDb(await requireDatabase().rpc("live_new_pairing", { p_session_id: id, p_code_hash: createHash("sha256").update(code).digest("hex") }));
    if (!expiresAt) throw new LiveError(409, "Phòng chưa mở hoặc đã có camera phụ. Hãy ngắt camera cũ trước.");
    return liveJson({ code, expiresAt });
  } catch (error) { return jsonError(error); }
}
