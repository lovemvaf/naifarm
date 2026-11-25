import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

process.env.TYPESAFE_API_KEY = "offline-test-key";
process.env.TYPESAFE_BASE_URL = "https://typesafe.test";

const fixtures = JSON.parse(await readFile("docs/naiai/jev-fixtures.json", "utf8"));
let requests = 0;
let report;
let finishReport;
const reportReady = new Promise(resolve => { finishReport = resolve; });
const originalLog = console.log;
console.log = value => {
  try { report = JSON.parse(value); finishReport(); }
  catch { originalLog(value); }
};

globalThis.fetch = async (input, init) => {
  const url = new URL(String(input));
  assert.equal(url.href, "https://typesafe.test/v1/systemone");
  assert.equal(new Headers(init?.headers).get("authorization"), "Bearer offline-test-key");
  const body = JSON.parse(String(init?.body));
  assert.equal(body.model, "jev-1.14.0");
  assert.equal(body.questions.intent.type, "choice");
  requests++;
  const question = body.state.split("Câu hỏi: ").at(-1).toLocaleLowerCase("vi");
  const choice = /nf-[a-z0-9-]+|\b(qr|nguồn gốc|hộ chiếu)/i.test(question) ? "traceability"
    : /thời tiết|phun thuốc|bệnh trên lá/.test(question) ? "other"
    : /livestream/.test(question) ? "live_search"
    : /thanh niên|tình nguyện|minh chứng/.test(question) ? "volunteer_guide"
    : /đăng bán|nhật ký|đơn|shipper|nhà vườn/.test(question) ? "farmer_guide"
    : "marketplace";
  return Response.json({ answers: { intent: { choice, confidence: 0.99 } } });
};

let timeout;
try {
  await import(new URL("./naiai-jev-eval.ts", import.meta.url).href);
  await Promise.race([reportReady, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Jev eval harness timed out.")), 5000); })]);
} finally {
  clearTimeout(timeout);
  console.log = originalLog;
}

assert.equal(requests, fixtures.length);
assert.equal(report.model, "jev-1.14.0");
assert.equal(report.fixtures, fixtures.length);
assert.equal(report.accuracy, 1);
assert.equal(report.results.every(result => result.pass && result.confidence === 0.99), true);
assert.equal(process.exitCode, undefined);
console.log(`Jev eval harness contract check passed for ${fixtures.length} fixtures using mocked responses; no network access occurred.`);
