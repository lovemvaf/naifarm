import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { AccessToken, RoomServiceClient, TrackSource } from "livekit-server-sdk";

const useLiveDatabase = Boolean(process.env.LIVE_SUPABASE_URL || process.env.LIVE_SUPABASE_SECRET_KEY || process.env.LIVE_SUPABASE_PUBLISHABLE_KEY);
const url = useLiveDatabase ? process.env.LIVE_SUPABASE_URL : process.env.SUPABASE_URL;
const secret = useLiveDatabase ? process.env.LIVE_SUPABASE_SECRET_KEY : process.env.SUPABASE_SECRET_KEY;
const publicKey = useLiveDatabase
  ? process.env.LIVE_SUPABASE_PUBLISHABLE_KEY
  : process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const livekitUrl = process.env.LIVEKIT_URL;
const livekitKey = process.env.LIVEKIT_API_KEY;
const livekitSecret = process.env.LIVEKIT_API_SECRET;

export const database = url && secret ? createClient(url, secret, { auth: { persistSession: false } }) : null;
export const livekit = livekitUrl && livekitKey && livekitSecret ? new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), livekitKey, livekitSecret, { requestTimeout: 5 }) : null;
export const activeStatuses = ["starting", "live", "reconnecting"];
export const publicFields = "id,farm_id,title,description,scheduled_at,status,pinned_product_id,selected_camera_identity,product_ids,revision,started_at,ended_at,created_at,room_ready";

export async function describeLiveHosts<T extends { owner_id: string; farm_id: string }>(sessions: T[]) {
  if (!sessions.length) return [];
  const ownerIds = [...new Set(sessions.map((session) => session.owner_id))];
  const farms = [...new Set(sessions.map((session) => session.farm_id))];
  const hosts = assertDb(await requireDatabase().from("live_host_permissions").select("user_id,farm_id,display_name")
    .in("user_id", ownerIds).in("farm_id", farms).eq("enabled", true));
  const names = new Map(hosts?.map((host) => [`${host.user_id}:${host.farm_id}`, host.display_name]));
  return sessions.map(({ owner_id, ...session }) => ({ ...session, host_name: names.get(`${owner_id}:${session.farm_id}`) ?? null }));
}

export class LiveError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export function requireDatabase() {
  if ((process.env.NAIFARM_LIVE_ENABLED ?? process.env.LIVE_ENABLED) !== "1") throw new LiveError(503, "Livestream chưa bật. Đặt NAIFARM_LIVE_ENABLED=1 sau khi áp dụng ba migration livestream.");
  if (!database || !process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) throw new LiveError(503, "Livestream chưa được cấu hình.");
  return database;
}

export function publicLiveSupabaseConfig() {
  requireDatabase();
  if (!url || !publicKey || publicKey === secret || publicKey.startsWith("sb_secret_")) {
    throw new LiveError(503, "Cần khóa Supabase publishable hoặc anon cho đăng nhập và chat.");
  }
  if (!publicKey.startsWith("sb_publishable_")) {
    let role: unknown;
    try {
      role = JSON.parse(Buffer.from(publicKey.split(".")[1], "base64url").toString("utf8")).role;
    } catch {
      throw new LiveError(503, "Khóa Supabase công khai không hợp lệ.");
    }
    if (role !== "anon") throw new LiveError(503, "Cần khóa Supabase publishable hoặc anon.");
  }
  return { url, key: publicKey };
}

export async function actor(request: Request, required = true) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) {
    if (!required) return null;
    throw new LiveError(401, "Vui lòng đăng nhập để tiếp tục.");
  }
  const db = requireDatabase();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new LiveError(401, "Phiên đăng nhập không hợp lệ.");
  const { data: pilot, error: pilotError } = await db.from("live_host_permissions").select("farm_id, display_name, can_chat").eq("user_id", data.user.id).eq("enabled", true);
  if (pilotError) throw new LiveError(503, "Không thể xác minh quyền tài khoản.");
  const allowed = pilot?.length ? {
    id: data.user.id, name: pilot[0].display_name,
    farms: pilot.map((row) => row.farm_id).filter(Boolean), canChat: pilot.some((row) => row.can_chat),
  } : null;
  if (!allowed && required) throw new LiveError(403, "Tài khoản chưa được cấp quyền livestream.");
  return allowed;
}

export function jsonError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  const missingSchema = ["PGRST205", "PGRST202", "42703", "42P01", "PGRST204"].includes(String(code));
  const status = error instanceof LiveError ? error.status : missingSchema ? 503 : 500;
  const message = error instanceof LiveError ? error.message : missingSchema
    ? "Supabase chưa có schema livestream. Áp dụng đủ ba migration livestream rồi thử lại."
    : "Đã xảy ra lỗi. Vui lòng thử lại.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function assertDb<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}

export function liveJson(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function body(request: Request) {
  try {
    const value = await request.json();
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error();
    return value as Record<string, unknown>;
  }
  catch { throw new LiveError(400, "Dữ liệu gửi lên không hợp lệ."); }
}

export async function issueToken(room: string, identity: string, name: string, publish: boolean, cameraOnly = false) {
  if (!livekit || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) throw new LiveError(503, "Livestream chưa được cấu hình.");
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity, name, ttl: "2m" });
  token.addGrant({ roomJoin: true, room, canSubscribe: !cameraOnly, canPublish: publish, canPublishData: false,
    canUpdateOwnMetadata: false, ...(publish ? { canPublishSources: cameraOnly ? [TrackSource.CAMERA] : [TrackSource.CAMERA, TrackSource.MICROPHONE] } : {}) });
  return token.toJwt();
}

export function newIdentity(prefix: string) { return `${prefix}-${randomUUID()}`; }

export async function ownedSession(id: string, host: NonNullable<Awaited<ReturnType<typeof actor>>>) {
  if (!uuid(id)) throw new LiveError(404, "Không tìm thấy phiên livestream.");
  const db = requireDatabase();
  const data = assertDb(await db.from("live_sessions").select("*").eq("id", id).eq("owner_id", host.id).maybeSingle());
  if (!data || !host.farms.includes(data.farm_id)) throw new LiveError(404, "Không tìm thấy phiên livestream.");
  return data;
}

export const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);

export async function rateLimit(bucket: string, limit: number, seconds: number) {
  const allowed = assertDb(await requireDatabase().rpc("live_rate_limit", { p_bucket: bucket, p_limit: limit, p_window_seconds: seconds }));
  if (!allowed) throw new LiveError(429, "Quá nhiều yêu cầu. Vui lòng thử lại sau.");
}

export async function validateProducts(ids: unknown, farmId: string) {
  if (!Array.isArray(ids) || ids.length > 12 || ids.some((id) => typeof id !== "string")) throw new LiveError(400, "Danh sách sản phẩm không hợp lệ.");
  const products = await import("@/data/demo/products").then((module) => module.INITIAL_PRODUCTS);
  if (ids.some((id) => !products.some((product) => product.id === id && product.farmId === farmId))) throw new LiveError(400, "Sản phẩm không thuộc nhà vườn đã chọn.");
  return ids as string[];
}
