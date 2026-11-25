import { createHash } from "node:crypto";
import { assertDb, body, issueToken, jsonError, LiveError, liveJson, rateLimit, requireDatabase } from "@/lib/live/server";

export async function POST(request: Request) {
  try {
    const { code } = await body(request);
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(code)) throw new LiveError(400, "QR không hợp lệ.");
    const source = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
    await rateLimit(`redeem:${source}`, 30, 60);
    const [camera] = assertDb(await requireDatabase().rpc("live_redeem_pairing", { p_code_hash: createHash("sha256").update(code).digest("hex") }));
    if (!camera) throw new LiveError(410, "QR đã hết hạn, đã được dùng hoặc phiên đã đóng. Hãy xin QR mới.");
    const token = await issueToken(camera.room_name, camera.identity, "Camera điện thoại", true, true);
    return liveJson({ url: process.env.LIVEKIT_URL, token });
  } catch (error) { return jsonError(error); }
}
