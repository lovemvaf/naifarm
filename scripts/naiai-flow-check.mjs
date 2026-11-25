import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const root = process.cwd();
for (const name of ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL", "DEEPSEEK_MODEL", "GEMINI_API_KEY", "GEMINI_MODEL", "GEMINI_EMBEDDING_MODEL", "GEMINI_EMBEDDING_DIMENSIONS", "TAVILY_API_KEY", "TYPESAFE_API_KEY", "TYPESAFE_BASE_URL", "LANGSMITH_API_KEY", "LANGSMITH_ENDPOINT", "LANGSMITH_PROJECT", "LANGSMITH_AGENT_ID", "LANGSMITH_AGENT_ENVIRONMENT", "LANGSMITH_TRACING_V2", "LANGCHAIN_API_KEY", "LANGCHAIN_ENDPOINT", "LANGCHAIN_PROJECT", "LANGCHAIN_TRACING", "LANGCHAIN_TRACING_V2", "SUPABASE_URL", "SUPABASE_SECRET_KEY"]) process.env[name] = "";
process.env.LANGSMITH_API_KEY = "offline-test-key";
process.env.LANGSMITH_ENDPOINT = "https://smith.test";
process.env.LANGSMITH_TRACING = "true";
process.env.LANGSMITH_AGENT_ID = "naifarm";
process.env.LANGSMITH_AGENT_ENVIRONMENT = "local";

const src = `${path.resolve(root, "src")}${path.sep}`;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const alias = specifier.startsWith("@/");
    const relative = specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(src).href);
    if (!alias && !relative) return nextResolve(specifier, context);
    const base = alias
      ? path.resolve(root, "src", specifier.slice(2))
      : path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    for (const candidate of [base, ...[".ts", ".tsx", ".js", ".mjs", ".json"].map(ext => base + ext), ...["index.ts", "index.tsx", "index.js"].map(name => path.join(base, name))]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return nextResolve(pathToFileURL(candidate).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { answerQuestion } = await import(pathToFileURL(path.resolve(root, "src/lib/naiai/knowledge.ts")).href);
const { POST } = await import(pathToFileURL(path.resolve(root, "src/app/api/nai-ai/chat/route.ts")).href);
let externalCalls = 0;
let langsmithCalls = 0;
let jevRequest;
let jevChoice = "marketplace";
let tavilyRequest;
let geminiEmbedRequest;
let geminiVisionRequest;
let deepseekRequest;
let failDeepseek = false;
let deepseekCalls = 0;
let returnSupabaseEvidence = true;
let supabaseRetryArmed = false;
const supabaseRequests = [];
const geminiEmbeddingBodies = [];
const seenProviders = [];
const smithBodies = [];
const smithBodyTypes = [];
globalThis.fetch = async (input, init) => {
  const url = new URL(String(input));
  seenProviders.push(`${url.hostname}${url.pathname}`);
  if (url.hostname === "smith.test") {
    langsmithCalls++;
    smithBodyTypes.push({ method: init?.method, type: Object.prototype.toString.call(init?.body), constructor: init?.body?.constructor?.name, present: Boolean(init?.body) });
    if (init?.body instanceof FormData) {
      const fields = {};
      for (const [key, value] of init.body.entries()) fields[key] = typeof value === "string" ? value : "[binary attachment]";
      smithBodies.push(fields);
    } else if (init?.body instanceof ReadableStream) {
      smithBodies.push(await new Response(init.body).text());
    } else if (init?.body) smithBodies.push(JSON.parse(String(init.body)));
    return Response.json({ ok: true });
  }
  externalCalls++;
  if (url.pathname === "/v1/systemone") {
    jevRequest = { url: url.href, headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) };
    return Response.json({ answers: { intent: { choice: jevChoice, confidence: 0.98 } } });
  }
  if (url.hostname === "api.tavily.com") {
    tavilyRequest = { headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) };
    return Response.json({
      results: [{ title: "Bưởi Tân Triều Đồng Nai", url: "https://example.com/buoi-tan-trieu", content: "Bưởi Tân Triều tại Đồng Nai, thông tin tham khảo." }],
      images: [{ url: "https://example.com/buoi-tan-trieu.jpg", description: "Ảnh bưởi Tân Triều tại vườn Đồng Nai" }],
    });
  }
  if (url.hostname === "generativelanguage.googleapis.com" && (url.pathname.includes(":embedContent") || url.pathname.includes(":batchEmbedContents"))) {
    geminiEmbedRequest = { url: url.href, body: JSON.parse(String(init?.body)) };
    geminiEmbeddingBodies.push(geminiEmbedRequest.body);
    return Response.json({ embeddings: [{ values: Array(768).fill(0.01) }] });
  }
  if (url.hostname === "generativelanguage.googleapis.com" && url.pathname.includes(":generateContent")) {
    geminiVisionRequest = { url: url.href, body: JSON.parse(String(init?.body)) };
    return Response.json({ candidates: [{ content: { role: "model", parts: [{ text: "Nhìn thấy quả sầu riêng; đây chỉ là mô tả ảnh." }] }, finishReason: "STOP" }] });
  }
  if (url.hostname === "supabase.test") {
    supabaseRequests.push({ url: url.href, headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) });
    if (url.pathname.endsWith("/match_nai_documents")) return Response.json(returnSupabaseEvidence || supabaseRetryArmed ? [{ id: 91, content: "Hồ sơ demo về bưởi Tân Triều tại Đồng Nai.", title: "Hồ sơ bưởi Tân Triều", href: "/farms/buoi-tan-trieu", similarity: 0.82, metadata: { kind: "document" } }] : []);
    if (url.pathname.endsWith("/search_nai_documents_fts")) return Response.json(returnSupabaseEvidence || supabaseRetryArmed ? [{ id: 91, content: "Hồ sơ demo về bưởi Tân Triều tại Đồng Nai.", title: "Hồ sơ bưởi Tân Triều", href: "/farms/buoi-tan-trieu", rank: 0.7 }] : []);
  }
  if (url.hostname === "api.deepseek.com") {
    deepseekRequest = { url: url.href, headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) };
    deepseekCalls++;
    if (failDeepseek) return Response.json({ error: { message: "TEST_ERROR_PRIVATE_MARKER" } }, { status: 400 });
    if (JSON.stringify(deepseekRequest.body.messages).includes("QUERY_REWRITE")) {
      supabaseRetryArmed = true;
      return Response.json({ id: "offline-query-rewrite", object: "chat.completion", created: 0, model: "deepseek-chat", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "bưởi Tân Triều Đồng Nai" } }] });
    }
    return Response.json({ id: "offline-chat-completion", object: "chat.completion", created: 0, model: "deepseek-chat", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "TEST_OUTPUT_PRIVATE_MARKER" } }] });
  }
  throw new Error(`Unexpected provider request in offline smoke check: ${url.origin}`);
};

for (const question of ["Bạn là ai?", "Bạn tên gì?", "Naifarm là gì?", "hello bạn là ai", "Hi, bạn là ai vậy?", "Xin chào, bạn là ai?"]) {
  const identity = await answerQuestion(question, "");
  assert.match(identity.answer, /NaiAI, trợ lý ảo của NaiFarm/);
  assert.equal(identity.sources.length, 0);
  assert.equal(identity.cards.length, 0);
  assert.ok(!identity.answer.includes("**"));
}
const greetedProductQuestion = await answerQuestion("Hello, mình muốn tìm bưởi Tân Triều", "");
assert.equal(greetedProductQuestion.intent, "marketplace", "A greeting before a product question must not trigger the identity shortcut.");
assert.equal(externalCalls, 0, "Danh tính trợ lý phải được trả lời trực tiếp, không gọi provider.");

const trace = await answerQuestion("Tra lô NF-DEMO-001", "");
assert.equal(trace.intent, "traceability");
assert.ok(trace.sources.some(item => item.href === "/trace/NF-DEMO-001"));
assert.equal(trace.cards[0]?.image, "/images/stitch/stitch-07.jpg");

const textForm = new FormData();
textForm.set("question", "Tra lô NF-DEMO-001");
const textResponse = await POST(new Request("http://local.test/api/nai-ai/chat", { method: "POST", body: textForm }));
const textResult = await textResponse.json();
assert.equal(textResponse.status, 200);
assert.equal(textResult.intent, "traceability");
assert.equal(textResult.mode, "demo");

const imageForm = new FormData();
imageForm.set("question", "Mua sầu riêng Ri6");
imageForm.set("image", new File([fs.readFileSync(path.resolve(root, "public/images/stitch/stitch-04.jpg"))], "durian.jpg", { type: "image/jpeg" }));
const imageResponse = await POST(new Request("http://local.test/api/nai-ai/chat", { method: "POST", body: imageForm }));
const imageResult = await imageResponse.json();
assert.equal(imageResponse.status, 200);
assert.equal(imageResult.intent, "marketplace");
assert.ok(imageResult.cards.some(card => card.href === "/products/sau-rieng-ri6-long-khanh"));

const invalidForm = new FormData();
invalidForm.set("question", "test");
invalidForm.set("image", new File(["<svg/>"], "test.svg", { type: "image/svg+xml" }));
const invalidResponse = await POST(new Request("http://local.test/api/nai-ai/chat", { method: "POST", body: invalidForm }));
assert.equal(invalidResponse.status, 415);

process.env.TYPESAFE_API_KEY = "offline-test-key";
process.env.TYPESAFE_BASE_URL = "http://127.0.0.1:9";
const jevFallback = await answerQuestion("Mua nông sản Đồng Nai", "");
assert.equal(jevFallback.intent, "marketplace");
assert.equal(externalCalls, 0);

process.env.TYPESAFE_BASE_URL = "https://api.typesafe.ai";
const jevRouted = await answerQuestion("Tìm bưởi Tân Triều", "");
assert.equal(jevRouted.intent, "marketplace");
assert.equal(jevRequest.url, "https://api.typesafe.ai/v1/systemone");
assert.equal(jevRequest.body.model, "jev-1.14.0");
assert.equal(jevRequest.body.questions.intent.type, "choice");
assert.equal(jevRequest.headers.get("authorization"), "Bearer offline-test-key");

process.env.TAVILY_API_KEY = "offline-test-key";
const tavilyAnswer = await answerQuestion("Tìm bưởi Tân Triều", "");
assert.ok(tavilyAnswer.cards.some(card => card.label === "Ảnh tham khảo tìm trên web"));
assert.equal(tavilyRequest.headers.get("authorization"), "Bearer offline-test-key");
assert.equal(tavilyRequest.body.include_images, true);
assert.equal(externalCalls, 3);

process.env.DEEPSEEK_API_KEY = "offline-test-key";
jevChoice = "marketplace";
const buyerFaqAnswer = await answerQuestion("Cách nhận hàng & phí giao thế nào?", "");
assert.equal(buyerFaqAnswer.cards.length, 0, "A delivery-fee question must not return unrelated product cards.");
assert.ok(buyerFaqAnswer.sources.some(source => source.href === "/cart"));
assert.match(JSON.stringify(deepseekRequest.body.messages), /20\.000 đ phí vận chuyển dự kiến/);
const broadCatalogAnswer = await answerQuestion("Tìm nông sản Đồng Nai", "");
assert.ok(broadCatalogAnswer.cards.length > 0, "Broad marketplace discovery should still offer demo catalog cards.");
jevChoice = "volunteer_guide";
const volunteerGuidance = await answerQuestion("Thanh niên hỗ trợ nhà vườn ra sao?", "");
assert.ok(volunteerGuidance.sources.some(source => source.href === "/volunteer"));
assert.match(JSON.stringify(deepseekRequest.body.messages), /nhiệm vụ NF-MIS-03/);
jevChoice = "marketplace";

process.env.GEMINI_API_KEY = "offline-test-key";
process.env.GEMINI_EMBEDDING_MODEL = "gemini-embedding-2";
process.env.GEMINI_EMBEDDING_DIMENSIONS = "768";
process.env.SUPABASE_URL = "https://supabase.test";
process.env.SUPABASE_SECRET_KEY = "offline-test-secret";
process.env.DEEPSEEK_API_KEY = "offline-test-key";
process.env.DEEPSEEK_BASE_URL = "https://api.deepseek.com";
process.env.DEEPSEEK_MODEL = "deepseek-chat";
const ragAnswer = await answerQuestion("Tìm bưởi Tân Triều", "");
assert.equal(ragAnswer.mode, "live");
assert.match(ragAnswer.answer, /TEST_OUTPUT_PRIVATE_MARKER/);
assert.ok(geminiEmbedRequest, `Gemini embedding request missing. Seen: ${seenProviders.join(", ")}`);
assert.equal(geminiEmbedRequest.body.requests[0].outputDimensionality, 768);
assert.match(geminiEmbedRequest.body.requests[0].content.parts[0].text, /^task: search result \| query:/);
assert.equal(supabaseRequests.length, 2);
assert.ok(supabaseRequests.every(request => request.headers.get("apikey") === "offline-test-secret"));
assert.equal(deepseekRequest.body.model, "deepseek-chat");
assert.match(deepseekRequest.url, /^https:\/\/api\.deepseek\.com\//);
assert.ok(ragAnswer.sources.some(source => source.href === "/farms/buoi-tan-trieu"));

jevChoice = "traceability";
const deepseekBeforeUnknownBatch = deepseekCalls;
const unknownBatch = await answerQuestion("Tra lô NF-UNKNOWN-999", "");
assert.match(unknownBatch.answer, /chưa tìm thấy mã lô chính xác/i);
assert.equal(deepseekCalls, deepseekBeforeUnknownBatch, "Không gọi LLM để suy đoán nội dung cho mã lô không có bằng chứng chính xác.");

jevChoice = "farmer_guide";
returnSupabaseEvidence = false;
const embeddingCountBeforeRetry = geminiEmbeddingBodies.length;
const retryStart = supabaseRequests.length;
const refinedAnswer = await answerQuestion("QZXV policy 8492", "");
assert.match(refinedAnswer.answer, /TEST_OUTPUT_PRIVATE_MARKER/);
assert.equal(supabaseRequests.length - retryStart, 4, "Evidence critic should permit one bounded second hybrid retrieval.");
assert.equal(geminiEmbeddingBodies.length - embeddingCountBeforeRetry, 2, "The refined query must be embedded and searched once more.");
assert.match(JSON.stringify(geminiEmbeddingBodies.at(-1)), /bưởi Tân Triều Đồng Nai/);
assert.ok(supabaseRetryArmed);
assert.ok(refinedAnswer.sources.some(source => source.href === "/farms/buoi-tan-trieu"));
returnSupabaseEvidence = true;
jevChoice = "marketplace";

process.env.TAVILY_API_KEY = "";
process.env.SUPABASE_URL = "";
process.env.SUPABASE_SECRET_KEY = "";
process.env.DEEPSEEK_API_KEY = "";
const visionForm = new FormData();
visionForm.set("question", "Nhận diện loại nông sản trong ảnh");
visionForm.set("image", new File([fs.readFileSync(path.resolve(root, "public/images/stitch/stitch-04.jpg"))], "durian.jpg", { type: "image/jpeg" }));
jevChoice = "other";
const externalCallsBeforeVision = externalCalls;
const visionResponse = await POST(new Request("http://local.test/api/nai-ai/chat", { method: "POST", body: visionForm }));
const visionResult = await visionResponse.json();
assert.equal(visionResponse.status, 200);
assert.equal(visionResult.intent, "marketplace", "Generic image requests should not be refused when Jev labels them out of scope.");
assert.ok(geminiVisionRequest.url.includes(":generateContent"));
assert.match(JSON.stringify(geminiVisionRequest.body), /inlineData/);
assert.equal(externalCalls - externalCallsBeforeVision, 2);
jevChoice = "marketplace";

jevChoice = "other";
const genericImage = await answerQuestion("Nhận diện loại nông sản trong ảnh", "", "Ảnh cho thấy một giỏ quả màu đỏ; chưa xác định được tên.");
assert.equal(genericImage.intent, "marketplace", "Generic image questions should reach product evidence when Jev/image keywords are inconclusive.");
const plantDisease = await answerQuestion("Ảnh này bị bệnh gì?", "", "Ảnh một cây trồng.");
assert.equal(plantDisease.intent, "other", "Plant disease advice must remain out of scope even with an image.");
jevChoice = "marketplace";

await answerQuestion("Tra lô NF-DEMO-001 câu hỏi riêng tư", "lịch sử không được gửi");
await new Promise(resolve => setTimeout(resolve, 100));
const tracePayload = () => smithBodies.map(body => typeof body === "string" ? body : JSON.stringify(body)).join("\n");
assert.ok(langsmithCalls > 0, `LangSmith was not called. Seen: ${seenProviders.join(", ")}`);
assert.ok(smithBodies.length > 0, `LangSmith did not receive a run batch: ${JSON.stringify(smithBodyTypes)}. Seen: ${seenProviders.join(", ")}`);
assert.ok(tracePayload().includes("lrn:agents/naifarm/environments/local"), "LangSmith runs must target the configured agent environment.");
assert.ok(!tracePayload().includes("naifarm-nai-ai"), "Agent tracing must not be overridden by a legacy project name.");
assert.ok(!tracePayload().includes("Tra lô NF-DEMO-001 câu hỏi riêng tư"));
assert.ok(!tracePayload().includes("lịch sử không được gửi"));
assert.ok(!tracePayload().includes("TEST_OUTPUT_PRIVATE_MARKER"));
process.env.DEEPSEEK_API_KEY = "offline-test-key";
failDeepseek = true;
await assert.rejects(answerQuestion("TEST_INPUT_PRIVATE_MARKER", "TEST_HISTORY_PRIVATE_MARKER"));
await new Promise(resolve => setTimeout(resolve, 100));
assert.ok(!tracePayload().includes("TEST_INPUT_PRIVATE_MARKER"));
assert.ok(!tracePayload().includes("TEST_HISTORY_PRIVATE_MARKER"));
assert.ok(!tracePayload().includes("TEST_ERROR_PRIVATE_MARKER"));
console.log("NaiAI API, Jev, Gemini vision/embedding, Supabase hybrid retrieval, Tavily images, DeepSeek and payload-redacted LangSmith tracing passed against offline provider mocks; no network access occurred.");
