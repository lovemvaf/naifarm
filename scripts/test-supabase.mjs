import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const text = line.trim();
    const eq = text.indexOf("=");
    if (!text || text.startsWith("#") || eq < 0) continue;
    const key = text.slice(0, eq).trim();
    if (!process.env[key]) {
      process.env[key] = text.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const TABLES = [
  "admin_units",
  "farms",
  "experiences",
  "products",
  "batches",
   "batch_events",
   "profiles",
   "cart_items",
  "favorites",
   "season_follows",
   "orders",
   "order_items",
   "missions",
   "support_requests",
   "rfq_requests",
  "experience_bookings",
   "document_review_cases",
   "admin_grants",
  "audit_logs",
  "calendar_events",
  "official_observances",
  "campaigns",
  "promotions",
  "lessons",
  "school_classes",
  "student_submissions",
  "seasons",
  "diary_entries",
  "credentials",
  "credential_evidence",
  "notifications",
  "tickets",
  "address_book",
  "partner_orgs",
  "sponsor_campaigns",
  "warehouses",
  "warehouse_stocks",
  "inventory_movements",
  "suppliers",
  "purchase_orders",
  "coop_pools",
  "member_deliveries",
  "expenses",
  "receivables_payables",
  "logistics_trips",
  "product_reviews",
  "mentor_cases",
  "international_inquiries",
  "volunteer_hours",
  "refund_requests",
  "tour_packages",
  "farm_certifications",
];

const ACCOUNTS = [
  ["customer@naifarm.vn", "customer"],
  ["farmer.batu@naifarm.vn", "farmer"],
  ["volunteer@naifarm.vn", "volunteer"],
  ["coordinator@naifarm.vn", "coordinator"],
  ["org@naifarm.vn", "organization"],
  ["admin@naifarm.vn", "admin"],
];

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(path, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await fetch(url + path, {
        signal: AbortSignal.timeout(25000),
        ...options,
      });
    } catch (error) {
      if (attempt === 5) throw error;
    }
  }
  throw new Error("unreachable");
}

async function json(path, headers) {
  const response = await request(path, { headers });
  const text = await response.text();
  return { status: response.status, data: JSON.parse(text) };
}

function tokenUserId(token) {
  const payload = Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(payload).sub;
}

async function main() {
  console.log(`Supabase: ${url}`);

  const health = await request("/auth/v1/health", { headers: { apikey: anon } });
  check("Auth GoTrue hoạt động", health.status === 200, `HTTP ${health.status}`);

  let tableOk = 0;
  for (const table of TABLES) {
    const response = await request(`/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (response.status === 200) tableOk += 1;
    else console.log(`  ${table}: HTTP ${response.status} ${(await response.text()).slice(0, 100)}`);
  }
  check(`${TABLES.length} bảng tồn tại & select được`, tableOk === TABLES.length, `${tableOk}/${TABLES.length}`);

  const farms = await json("/rest/v1/farms?select=id,region,lat,lng&limit=5", {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  });
  check(
    "Dữ liệu farms có toạ độ thật",
    farms.status === 200 && farms.data.length > 0 && farms.data.every((f) => f.lat && f.lng),
    `${farms.data.length} farms`
  );

  const missions = await json("/rest/v1/missions?select=id&limit=3", {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  });
  check("Dữ liệu missions có sẵn", missions.status === 200 && missions.data.length > 0, `${missions.data.length} missions`);

  const anonProfiles = await json("/rest/v1/profiles?select=id", {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  });
  check("RLS: anon không thấy profiles", anonProfiles.status === 200 && anonProfiles.data.length === 0);

  let customerToken = null;
  for (const [email, expectedRole] of ACCOUNTS) {
    const response = await request("/auth/v1/token?grant_type=password", {
      method: "POST",

      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "naifarm123" }),
    });
    const text = await response.text();
    const ok = response.status === 200 && JSON.parse(text).access_token;
    check(`Đăng nhập ${expectedRole}`, Boolean(ok), email);
    if (!ok) continue;

    const token = JSON.parse(text).access_token;
    if (expectedRole === "customer") customerToken = token;
    const profile = await json("/rest/v1/profiles?select=id,role,farm_id", {
      apikey: anon,
      Authorization: `Bearer ${token}`,
    });
    const rows = profile.data ?? [];
    const own = rows.find((row) => row.id === tokenUserId(token)) ?? rows[0];
    check(
      `RLS: ${expectedRole} đọc đúng profile`,
      profile.status === 200 && own?.role === expectedRole,
      `${own?.role ?? "?"} (${rows.length} dòng thấy được)`
    );
  }

  if (customerToken) {
    const uid = tokenUserId(customerToken);
    const upsert = await request("/rest/v1/lesson_progress", {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${customerToken}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: uid, practice_points: 7 }),
    });
    const ownProgress = await json("/rest/v1/lesson_progress?select=user_id,practice_points&limit=1", {
      apikey: anon,
      Authorization: `Bearer ${customerToken}`,
    });
    const row = ownProgress.data?.[0];
    check(
      "RLS: lesson_progress đọc đúng bản ghi của user",
      ownProgress.status === 200 && row?.user_id === uid && row?.practice_points === 7,
      row?.user_id === uid ? `1 dòng của user (${row?.practice_points} điểm)` : "không đúng user"
    );
  }

  if (service) {
    const buckets = await json("/storage/v1/bucket", {
      apikey: service,
      Authorization: `Bearer ${service}`,
    });
    const ids = new Set((buckets.data ?? []).map((b) => b.id));
    check(
      "3 bucket Storage tồn tại",
      ["stitch", "product-images", "evidence"].every((b) => ids.has(b)),
      [...ids].join(", ")
    );

    const list = await request("/storage/v1/object/list/stitch", {
      method: "POST",
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: "", limit: 200 }),
    });
    const listData = await list.json();
    check("Ảnh WebP đã lên stitch", list.status === 200 && listData.length === 65, `${listData.length}/65 ảnh`);

    const image = await request("/storage/v1/object/public/stitch/stitch-01.webp", {
      headers: { apikey: anon },
    });
    check(
      "Public read ảnh stitch",
      image.status === 200 && image.headers.get("content-type") === "image/webp",
      `HTTP ${image.status}`
    );
  } else {
    console.log("SKIP  Kiểm tra Storage (chưa có SUPABASE_SERVICE_ROLE_KEY)");
  }

  console.log(`\nKết quả: ${passed} PASS / ${failed} FAIL`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Lỗi chạy test:", error.message);
  process.exit(1);
});
