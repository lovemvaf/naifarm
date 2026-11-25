import { activeStatuses, actor, assertDb, body, describeLiveHosts, jsonError, LiveError, liveJson, publicFields, requireDatabase, uuid, validateProducts } from "@/lib/live/server";
import { reconcileLive } from "@/lib/live/lifecycle";

export async function GET(request: Request) {
  try {
    const db = requireDatabase();
    await reconcileLive();
    const studio = new URL(request.url).searchParams.has("studio");
    const host = studio ? await actor(request) : null;
    let query = db.from("live_sessions").select(`${publicFields},owner_id`).order("scheduled_at", { nullsFirst: false }).limit(100);
    if (studio && !host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    if (host && host.farms.length === 0) return liveJson({ sessions: [], farms: [] });
    query = host ? query.eq("owner_id", host.id).in("farm_id", host.farms) : query.in("status", ["scheduled", ...activeStatuses]);
    return liveJson({ sessions: await describeLiveHosts(assertDb(await query) ?? []), farms: host?.farms });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const host = await actor(request);
    if (!host) throw new LiveError(403, "Tài khoản chưa được cấp quyền.");
    const input = await body(request);
    const { farmId, scheduledAt, requestId } = input;
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    if (typeof farmId !== "string" || !host.farms.includes(farmId)) throw new LiveError(403, "Bạn không có quyền phát từ nhà vườn này.");
    if (title.length < 3 || title.length > 140 || description.length > 2000 || !uuid(requestId)
      || (scheduledAt != null && (typeof scheduledAt !== "string" || !Number.isFinite(Date.parse(scheduledAt))))) throw new LiveError(400, "Thông tin phiên chưa hợp lệ.");
    const productIds = await validateProducts(input.productIds ?? [], farmId);
    const db = requireDatabase();
    const result = await db.from("live_sessions").insert({
      owner_id: host.id, farm_id: farmId, title, description, product_ids: productIds,
      request_id: requestId, scheduled_at: scheduledAt ?? null,
    }).select(publicFields).single();
    if (result.error?.code === "23505") {
      return liveJson({ session: assertDb(await db.from("live_sessions").select(publicFields)
        .eq("owner_id", host.id).eq("request_id", requestId).single()) });
    }
    return liveJson({ session: assertDb(result) }, 201);
  } catch (error) { return jsonError(error); }
}
