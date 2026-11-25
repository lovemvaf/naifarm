import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { reciprocalRankFusion, rerankEvidence } from "../src/lib/naiai/ranking.ts";
import { inferIntent } from "../src/lib/naiai/routing.ts";

const results = reciprocalRankFusion(
  [{ id: "wrong", title: "Chôm chôm", content: "", href: "/wrong" }, { id: "shared", title: "Hồ sơ lô", content: "", href: "/trace", entityMatch: true }],
  [{ id: "shared", title: "Hồ sơ lô", content: "", href: "/trace" }, { id: "keyword", title: "Nhật ký mùa vụ", content: "", href: "/learn" }],
  2,
);
assert.deepEqual(results.map(result => result.id), ["shared", "wrong"]);
assert.equal(results[0].vectorRank, 2);
assert.equal(results[0].textRank, 1);
const reranked = rerankEvidence([
  { id: "other", title: "Sản phẩm Chôm chôm", content: "", href: "/other", score: 0.01 },
  { id: "batch", title: "Hộ chiếu lô NF-DEMO-001", content: "Nguồn gốc", href: "/trace", score: 0.001 },
], "Tra lô NF-DEMO-001");
assert.equal(reranked[0].id, "batch");
assert.equal(inferIntent("Đăng bán nông sản thế nào?"), "farmer_guide");
assert.equal(inferIntent("Tra lô NF-DEMO-001"), "traceability");
assert.equal(inferIntent("Thanh niên hỗ trợ nhà vườn ra sao?"), "volunteer_guide");
assert.equal(inferIntent("Lịch livestream OCOP gần nhất?"), "live_search");
assert.equal(inferIntent("Nhận diện hình ảnh: Chôm chôm Java Long Khánh"), "marketplace");
assert.equal(inferIntent("NF-DEMO-001"), "traceability");
assert.equal(inferIntent("Lá cây bị bệnh, nên phun thuốc gì?"), "other");
assert.equal(inferIntent("Mô tả ảnh: trái chôm chôm chín"), "marketplace");
assert.equal(inferIntent("Thời tiết ngày mai ở Long Khánh thế nào?"), "other");
const migration = readFileSync("supabase/migrations/202611250001_nai_documents.sql", "utf8");
assert.equal((migration.match(/OPERATOR\(extensions\.<=>\)/g) ?? []).length, 2, "Vector RPCs must schema-qualify pgvector operators when search_path is empty.");
assert.match(migration, /ts_rank_cd\([\s\S]+\)::real as rank/i, "FTS RPC must alias the returned rank for its ORDER BY clause.");
console.log("NaiAI routing, hybrid rank fusion and reranking checks passed.");
