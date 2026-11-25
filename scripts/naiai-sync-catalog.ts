import "dotenv/config";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_BATCHES } from "../src/data/demo/batches";
import { INITIAL_FARMS } from "../src/data/demo/farms";
import { INITIAL_LIVESTREAMS } from "../src/data/demo/livestreams";
import { INITIAL_PRODUCTS } from "../src/data/demo/products";
import { AI_WORKSPACE_CONFIG } from "../src/data/demo/ai-scripts";

type CatalogRecord = { id: string; title: string; href: string; content: string; hash: string };
type DocumentRow = { source_id: string; source_hash: string; chunk_index: number; title: string; href: string; content: string; metadata: { kind: string; demo: boolean }; embedding: number[] };

function documentText(lines: Array<string | number | undefined>) {
  return lines.filter(value => value !== undefined && value !== "").join("\n");
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function embedBatch(records: CatalogRecord[], apiKey: string, model: string, dimensions: number, attempt = 0): Promise<number[][]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:batchEmbedContents`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ requests: records.map(record => ({
      model: `models/${model}`,
      content: { parts: [{ text: `title: ${record.title} | text: ${record.content}` }] },
      outputDimensionality: dimensions,
    })) }),
  });
  if (response.status === 429 && attempt < 8) {
    const body = await response.text();
    const retrySeconds = Number(response.headers.get("retry-after")) || Number(body.match(/retry in ([\d.]+)s/i)?.[1]) || 60;
    console.log(`Gemini đang giới hạn tốc độ; thử lại sau ${Math.min(90, Math.ceil(retrySeconds) + 1)} giây.`);
    await delay(Math.min(90, Math.ceil(retrySeconds) + 1) * 1000);
    return embedBatch(records, apiKey, model, dimensions, attempt + 1);
  }
  if (!response.ok) throw new Error(`Gemini batch embedding thất bại (HTTP ${response.status}); chưa ghi dữ liệu.`);
  const payload = await response.json() as { embeddings?: Array<{ values?: number[] }> };
  const vectors = payload.embeddings?.map(item => item.values ?? []) ?? [];
  if (vectors.length !== records.length || vectors.some(vector => vector.length !== dimensions)) {
    throw new Error("Gemini trả số lượng hoặc chiều embedding không khớp. Chưa ghi catalog.");
  }
  return vectors;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL = "gemini-embedding-2", GEMINI_EMBEDDING_DIMENSIONS = "768", SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  const records = [
    ...INITIAL_PRODUCTS.map(item => ({ id: `product:${item.id}`, title: item.name, href: `/products/${item.slug}`, content: documentText([
      `Sản phẩm: ${item.name}`, `Mã sản phẩm: ${item.id}`, `SKU: ${item.skuCode}`, `Danh mục: ${item.category}`,
      `Nhà vườn: ${item.farmName}`, `Khu vực: ${item.region}`, `Mã lô: ${item.batchCode}`,
      `Giá demo: ${item.priceVnd} đồng/${item.unitLabel}`, `Tồn kho demo: ${item.stockKg} kg`, `Mùa vụ: ${item.seasonStatus}`,
      `Độ Brix tham khảo: ${item.brixNote}`, `Bảo quản: ${item.storageNote}`, `Mô tả: ${item.shortDescription}`, `Câu chuyện: ${item.storyNote}`,
    ]) })),
    ...INITIAL_FARMS.map(item => ({ id: `farm:${item.id}`, title: item.name, href: `/farms/${item.slug}`, content: documentText([
      `Nhà vườn: ${item.name}`, `Chủ vườn: ${item.ownerName} (${item.ownerAgeLabel})`, `Khu vực: ${item.region}`,
      `Địa chỉ mô tả: ${item.addressLabel}`, `Diện tích demo: ${item.areaHa} ha`, `Nông sản: ${item.mainCrops.join(", ")}`,
      `Trạng thái hồ sơ OCOP: ${item.ocopLabel}`, `Ghi chú OCOP: ${item.ocopNote}`, `Câu chuyện: ${item.storyHeadline}. ${item.storySummary}`,
    ]) })),
    ...INITIAL_BATCHES.map(item => ({ id: `batch:${item.batchCode}`, title: `Hộ chiếu truy xuất ${item.batchCode}`, href: `/trace/${item.batchCode}`, content: documentText([
      `Mã lô: ${item.batchCode}`, `Sản phẩm: ${item.productName} (${item.productId})`, `Nhà vườn: ${item.farmName}`,
      `Khu vực: ${item.region}`, `Ngày thu hoạch demo: ${item.harvestDate}`, `Ngày đóng gói demo: ${item.packDate}`,
      `Sản lượng demo: ${item.quantityKg} kg; còn lại: ${item.remainingKg} kg`, `Mức khai báo: ${item.declarationLevel}`,
      `Trạng thái hồ sơ: ${item.docStatus}`, `Tóm tắt: ${item.summary}`,
      ...item.events.filter(event => event.visibility === "public").map(event => `Nhật ký công khai ${event.dateLabel}: ${event.title}. ${event.detail}`),
    ]) })),
    ...INITIAL_LIVESTREAMS.map(item => ({ id: `livestream:${item.id}`, title: item.title, href: "/live", content: documentText([
      `OCOP Live: ${item.title}`, `Nhà vườn: ${item.farmName}`, `Người dẫn: ${item.hostYouth}; ${item.farmerName}`,
      `Thời gian demo: ${item.scheduleLabel}`, `Trạng thái: ${item.status}`, `Tóm tắt: ${item.summary}`,
    ]) })),
    ...Object.values(AI_WORKSPACE_CONFIG).flatMap(config => config.chips.map((item, index) => ({ id: `guide:${config === AI_WORKSPACE_CONFIG.W01 ? "W01" : "workspace"}:${index}:${item.prompt}`, title: item.prompt, href: item.linkHref ?? "/", content: item.reply }))),
  ].map(record => ({ ...record, hash: createHash("sha256").update(`${record.title}\n${record.href}\n${record.content}`).digest("hex") }));
  const dimensions = Number(GEMINI_EMBEDDING_DIMENSIONS);
  if (dimensions !== 768) throw new Error("Migration Supabase hiện dùng vector(768); GEMINI_EMBEDDING_DIMENSIONS phải là 768.");
  if (new Set(records.map(record => record.id)).size !== records.length) throw new Error("Catalog chứa source_id trùng; chưa ghi dữ liệu.");
  if (dryRun) {
    const chars = records.reduce((total, record) => total + record.content.length, 0);
    const byKind = new Map<string, { count: number; chars: number }>();
    for (const record of records) {
      const kind = record.id.slice(0, record.id.indexOf(":"));
      const current = byKind.get(kind) ?? { count: 0, chars: 0 };
      byKind.set(kind, { count: current.count + 1, chars: current.chars + record.content.length });
    }
    const summary = [...byKind].map(([kind, value]) => `${kind}=${value.count}/${value.chars} ký tự`).join(", ");
    console.log(`Dry run: ${records.length} tài liệu catalog, ${chars} ký tự (${summary}); không gọi Gemini hoặc ghi Supabase.`);
    return;
  }
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Cần Gemini API key và Supabase URL/secret key.");

  const db = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  const existingResult = await db.from("nai_documents").select("source_id,source_hash").eq("metadata->>kind", "catalog");
  if (existingResult.error) throw existingResult.error;
  const existing = existingResult.data ?? [];
  const currentById = new Map(records.map(record => [record.id, record]));
  const existingById = new Map(existing.map(row => [row.source_id, row.source_hash]));
  const changed = records.filter(record => existingById.get(record.id) !== record.hash);
  const rows: DocumentRow[] = [];
  for (let index = 0; index < changed.length; index += 8) {
    const batch = changed.slice(index, index + 8);
    const vectors = await embedBatch(batch, GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL, dimensions);
    rows.push(...batch.map((record, offset) => ({
      source_id: record.id, source_hash: record.hash, chunk_index: 1, title: record.title, href: record.href, content: record.content,
      metadata: { kind: "catalog", demo: true }, embedding: vectors[offset],
    })));
    console.log(`Đã tạo embedding ${Math.min(index + batch.length, changed.length)}/${changed.length}.`);
  }
  for (let index = 0; index < rows.length; index += 50) {
    const result = await db.from("nai_documents").upsert(rows.slice(index, index + 50), { onConflict: "source_id,source_hash,chunk_index" });
    if (result.error) throw result.error;
  }
  const staleIds = existing.filter(row => currentById.get(row.source_id)?.hash !== row.source_hash).map(row => row.source_id);
  for (let index = 0; index < staleIds.length; index += 100) {
    const result = await db.from("nai_documents").delete().eq("metadata->>kind", "catalog").in("source_id", staleIds.slice(index, index + 100));
    if (result.error) throw result.error;
  }
  console.log(`Đã đồng bộ ${records.length} tài liệu catalog; embedding mới/cập nhật: ${changed.length}; bỏ bản cũ: ${staleIds.length}.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Đồng bộ catalog thất bại.");
  process.exitCode = 1;
});
