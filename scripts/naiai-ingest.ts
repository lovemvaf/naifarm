import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenAI, type ContentEmbedding } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const [fileArg, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
const allowed = new Set([".txt", ".md", ".docx", ".pdf"]);
const chunkTarget = 2400;
const overlap = 300;

async function extractText(file: string, bytes: Buffer) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".docx") return (await mammoth.extractRawText({ buffer: bytes })).value;
  if (ext === ".pdf") {
    const standardFontDataUrl = `${path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../node_modules/pdfjs-dist/standard_fonts").replaceAll(path.sep, "/")}/`;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), standardFontDataUrl }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const text = await page.getTextContent();
      pages.push(`Trang ${pageNumber}\n${text.items.map((item: { str?: string }) => "str" in item ? item.str : "").join(" ")}`);
    }
    return pages.join("\n\n");
  }
  return bytes.toString("utf8").replace(/^\uFEFF/, "");
}

function splitChunks(text: string) {
  const sections = text.split(/(?=^#{1,4}\s|^Trang\s+\d+\s*$)/m).map(section => section.trim()).filter(Boolean);
  const result: string[] = [];
  for (const section of sections) {
    const paragraphs = section.split(/\n\s*\n/);
    let chunk = "";
    for (const paragraph of paragraphs) {
      if (chunk.length + paragraph.length > chunkTarget && chunk) {
        result.push(chunk);
        chunk = `${chunk.slice(-overlap)}\n${paragraph}`;
      } else chunk = chunk ? `${chunk}\n\n${paragraph}` : paragraph;
      while (chunk.length > chunkTarget * 1.5) {
        result.push(chunk.slice(0, chunkTarget));
        chunk = chunk.slice(chunkTarget - overlap);
      }
    }
    if (chunk) result.push(chunk);
  }
  return result;
}

async function main() {
  if (!fileArg || fileArg.startsWith("--")) throw new Error("Dùng: npm run nai:ingest -- <tệp .txt|.md|.docx|.pdf> [--dry-run]");
  const ext = path.extname(fileArg).toLowerCase();
  if (!allowed.has(ext)) throw new Error("Chỉ nhận tệp TXT, Markdown, DOCX và PDF.");
  const bytes = await readFile(fileArg);
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Tệp tối đa 10 MiB.");
  const content = (await extractText(fileArg, bytes)).trim();
  if (content.length < 40) throw new Error("Tệp chưa có đủ văn bản. PDF scan cần OCR trước khi nhập.");
  const chunks = splitChunks(content);
  const sourceId = path.basename(fileArg);
  const sourceHash = createHash("sha256").update(bytes).digest("hex");
  const href = "";
  console.log(JSON.stringify({ sourceId, sourceHash, characters: content.length, chunks: chunks.length, dryRun }, null, 2));
  if (dryRun) return;
  const apiKey = process.env.GEMINI_API_KEY;
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!apiKey || !url || !secret) throw new Error("Cần GEMINI_API_KEY, SUPABASE_URL và SUPABASE_SECRET_KEY.");
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
  const dimensions = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);
  if (dimensions !== 768) throw new Error("Migration Supabase hiện dùng vector(768); GEMINI_EMBEDDING_DIMENSIONS phải là 768.");
  const embeddings: number[][] = [];
  for (let start = 0; start < chunks.length; start += 16) {
    const batch = chunks.slice(start, start + 16);
    const response: { embeddings?: ContentEmbedding[] } = await ai.models.embedContent({ model, contents: batch.map(chunk => `title: ${sourceId} | text: ${chunk}`), config: { outputDimensionality: dimensions } });
    for (const item of response.embeddings ?? []) {
      if (item.values?.length !== dimensions) throw new Error(`Sai kích thước embedding. Mong đợi ${dimensions}.`);
      embeddings.push(item.values!);
    }
  }
  if (embeddings.length !== chunks.length) throw new Error("Gemini trả thiếu embedding. Chưa thay thế dữ liệu đã nhập.");
  const supabase = createClient(url, secret);
  const rows = chunks.map((chunk, index) => ({ source_id: sourceId, source_hash: sourceHash, chunk_index: index + 1, title: sourceId, href, content: chunk, metadata: { kind: "document", format: ext.slice(1), chunk: index + 1, total: chunks.length }, embedding: embeddings[index] }));
  const inserted = await supabase.from("nai_documents").upsert(rows, { onConflict: "source_id,source_hash,chunk_index" });
  if (inserted.error) throw inserted.error;
  const retired = await supabase.from("nai_documents").delete().eq("source_id", sourceId).neq("source_hash", sourceHash);
  if (retired.error) throw retired.error;
  console.log(`Đã nhập ${chunks.length} đoạn của ${sourceId}.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Nhập tài liệu thất bại."); process.exitCode = 1; });
