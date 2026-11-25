import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const env = process.env;
const appUrl = new URL(env.NAIFARM_E2E_URL ?? "http://127.0.0.1:3107");
const databaseUrl = new URL(env.NAIFARM_TEST_SUPABASE_URL ?? env.LIVE_SUPABASE_URL);
const adminKey = env.NAIFARM_TEST_SUPABASE_ADMIN_KEY ?? env.LIVE_SUPABASE_SECRET_KEY;
const loopback = (url) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
assert(loopback(appUrl) && loopback(databaseUrl), "This test requires local app and Supabase endpoints.");
assert(adminKey && env.CRON_SECRET, "Set the local admin key and worker secret.");

const fetchApp = (path, options) => fetch(new URL(path, appUrl), { ...options, signal: AbortSignal.timeout(15_000) });
const configResponse = await fetchApp("/api/live/config");
assert.equal(configResponse.status, 200, "Live feature must be enabled for the local test app.");
const config = await configResponse.json();
assert.equal(new URL(config.url).origin, databaseUrl.origin, "The app must target the same local database.");

const authOptions = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(databaseUrl.href, adminKey, authOptions);
const pilot = createClient(databaseUrl.href, config.key, authOptions);
const livekit = new RoomServiceClient(env.LIVEKIT_URL.replace(/^wss:/, "https:"), env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
const run = randomUUID().slice(0, 8);
const title = `NaiFarm QA ${run}`;
const farmId = "farm-ba-tu-demo";
const password = randomBytes(24).toString("base64url");
const users = [];

function checked(result, message) {
  assert(!result.error, `${message} (${result.error?.code ?? result.error?.status ?? "unknown"})`);
  return result.data;
}

async function createPilot(role) {
  const email = `${role}-${run}@example.com`;
  const { user } = checked(await admin.auth.admin.createUser({ email, password, email_confirm: true }), "Could not create local pilot");
  users.push(user.id);
  checked(await admin.from("live_host_permissions").insert({
    user_id: user.id, farm_id: role === "host" ? farmId : "", display_name: role, can_chat: true,
  }), "Could not grant local pilot access");
  return email;
}

const sessionQuery = () => admin.from("live_sessions").select("id,room_name,status,cleanup_pending,cleanup_attempts,work_after")
  .in("owner_id", users);
const worker = { headers: { Authorization: `Bearer ${env.CRON_SECRET}` } };

async function settledSession(id) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const sessions = checked(await sessionQuery(), "Could not read QA sessions");
    const session = id ? sessions.find((row) => row.id === id) : sessions.find((row) => row.status === "ended");
    if (session?.status === "ended" && !session.cleanup_pending) return session;
    assert.equal((await fetchApp("/api/live/reconcile", worker)).status, 200);
    await setTimeout(1000);
  }
  throw new Error("QA session did not settle after cleanup attempts.");
}

async function runBrowser(hostEmail, chatEmail) {
  const browserEnv = Object.fromEntries(Object.entries(env).filter(([key]) =>
    !/^(LIVEKIT_|(?:LIVE_|NAIFARM_TEST_)?SUPABASE_|CRON_SECRET$)/i.test(key)));
  const browser = spawn("python", ["tests/livestream_local.py"], { stdio: ["pipe", "inherit", "inherit"], env: browserEnv });
  browser.stdin.end(JSON.stringify({ origin: appUrl.origin, title, hostEmail, chatEmail, password }));
  const code = await new Promise((resolve, reject) => {
    browser.once("error", reject);
    browser.once("exit", resolve);
  });
  assert.equal(code, 0, "The unmocked browser flow did not complete.");
}

try {
  const hostEmail = await createPilot("host");
  const chatEmail = await createPilot("viewer");
  await runBrowser(hostEmail, chatEmail);
  const finished = await settledSession();
  assert.equal((await livekit.listRooms([finished.room_name])).length, 0);
  console.log("PASS session ended and application removed the LiveKit room");

  const { session } = checked(await pilot.auth.signInWithPassword({ email: hostEmail, password }), "Could not authenticate test host");
  const headers = { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  const schedule = await fetchApp("/api/live", { method: "POST", headers, body: JSON.stringify({
    requestId: randomUUID(), farmId, title: `${title} abandoned`,
  }) });
  assert.equal(schedule.status, 201);
  const { session: abandoned } = await schedule.json();
  const started = await fetchApp(`/api/live/${abandoned.id}/start`, { method: "POST", headers });
  assert.equal(started.status, 200);

  const old = new Date(Date.now() - 60_000).toISOString();
  checked(await admin.from("live_sessions").update({ start_deadline: old, work_after: old }).eq("id", abandoned.id), "Could not set QA clock");
  assert.equal((await fetchApp("/api/live/reconcile", worker)).status, 200);
  if (env.NAIFARM_E2E_FAULT_URL) {
    const faultUrl = new URL(env.NAIFARM_E2E_FAULT_URL);
    assert(loopback(faultUrl), "The provider fault test requires a local app.");
    const response = await fetch(new URL("/api/live/reconcile", faultUrl), { ...worker, signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200);
    const pending = checked(await sessionQuery(), "Could not read pending cleanup").find((entry) => entry.id === abandoned.id);
    assert.equal(pending.cleanup_pending, true);
    assert.equal(pending.cleanup_attempts, 1);
    assert(Date.parse(pending.work_after) > Date.now(), "A failed delete should schedule a future retry.");
    assert.equal((await livekit.listRooms([pending.room_name])).length, 1);
    checked(await admin.from("live_sessions").update({ work_after: old }).eq("id", abandoned.id), "Could not advance QA retry clock");
    console.log("PASS temporary LiveKit outage preserves the room and schedules a cleanup retry");
  }
  const expired = await settledSession(abandoned.id);
  assert.equal((await livekit.listRooms([expired.room_name])).length, 0);
  console.log("PASS worker closes an abandoned start and deletes its LiveKit room");

  const eventId = randomUUID();
  const body = JSON.stringify({ event: "room_finished", room: { name: expired.room_name }, id: eventId });
  const signature = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, { ttl: "30s" });
  signature.sha256 = createHash("sha256").update(body).digest("base64");
  const webhook = { method: "POST", headers: { Authorization: await signature.toJwt() }, body };
  assert.equal((await fetchApp("/api/webhooks/livekit", webhook)).status, 200);
  assert.equal((await fetchApp("/api/webhooks/livekit", webhook)).status, 200);
  const recorded = checked(await admin.from("live_webhook_events").select("event_id").eq("event_id", eventId), "Could not verify webhook receipt");
  assert.equal(recorded.length, 1);
  checked(await admin.from("live_webhook_events").delete().eq("event_id", eventId), "Could not remove QA webhook receipt");
  console.log("PASS locally delivered signed webhook is accepted and deduplicated");
} finally {
  if (users.length) {
    const sessions = checked(await sessionQuery(), "Could not list QA sessions");
    for (const session of sessions) {
      if ((await livekit.listRooms([session.room_name])).length) await livekit.deleteRoom(session.room_name);
    }
    checked(await admin.from("live_sessions").delete().in("owner_id", users), "Could not delete local QA sessions");
    for (const user of users) checked(await admin.auth.admin.deleteUser(user), "Could not delete local QA user");
  }
}
