import { timingSafeEqual } from "node:crypto";
import { reconcileLive } from "@/lib/live/lifecycle";
import { jsonError, LiveError, liveJson } from "@/lib/live/server";

export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const received = Buffer.from(request.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    if (!secret || received.length !== expected.length || !timingSafeEqual(received, expected)) throw new LiveError(401, "Không có quyền chạy tác vụ.");
    await reconcileLive();
    return liveJson({ ok: true });
  } catch (error) { return jsonError(error); }
}
