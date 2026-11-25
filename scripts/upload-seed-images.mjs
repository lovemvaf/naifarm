import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stitchDir = join(root, "public", "images", "stitch");

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    return;
  }
}

loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}
if (!serviceKey) {
  console.error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const BUCKET = "stitch";

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !`${error.message}`.includes("already exists")) {
    console.error(`Không tạo được bucket ${BUCKET}: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  await ensureBucket();
  const files = readdirSync(stitchDir).filter((name) => /\.webp$/i.test(name));
  let uploaded = 0;
  for (const name of files) {
    const body = readFileSync(join(stitchDir, name));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(name, body, { contentType: "image/webp", upsert: true });
    if (error) {
      console.error(`Lỗi upload ${name}: ${error.message}`);
      process.exit(1);
    }
    uploaded += 1;
  }
  console.log(`Đã upload ${uploaded} ảnh lên bucket ${BUCKET}.`);
}

main();
