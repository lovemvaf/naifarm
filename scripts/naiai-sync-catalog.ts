import "dotenv/config";
import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_BATCHES } from "../src/data/demo/batches";
import { INITIAL_FARMS } from "../src/data/demo/farms";
import { INITIAL_LIVESTREAMS } from "../src/data/demo/livestreams";
import { INITIAL_PRODUCTS } from "../src/data/demo/products";
import { AI_WORKSPACE_CONFIG } from "../src/data/demo/ai-scripts";

async function main() {
  const { GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL = "gemini-embedding-2", GEMINI_EMBEDDING_DIMENSIONS = "768", SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Cần Gemini API key và Supabase URL/secret key.");
  const records = [
    ...INITIAL_PRODUCTS.map(item => ({ id: `product:${item.id}`, title: item.name, href: `/products/${item.slug}`, content: JSON.stringify({ ...item, image: item.image, demo: true }) })),
    ...INITIAL_FARMS.map(item => ({ id: `farm:${item.id}`, title: item.name, href: `/farms/${item.slug}`, content: JSON.stringify({ ...item, demo: true }) })),
    ...INITIAL_BATCHES.map(item => ({ id: `batch:${item.batchCode}`, title: `Hộ chiếu truy xuất ${item.batchCode}`, href: `/trace/${item.batchCode}`, content: JSON.stringify({ ...item, demo: true }) })),
    ...INITIAL_LIVESTREAMS.map(item => ({ id: `livestream:${item.id}`, title: item.title, href: "/live", content: JSON.stringify({ ...item, demo: true }) })),
    ...Object.values(AI_WORKSPACE_CONFIG).flatMap(config => config.chips.map((item,index) => ({ id:`guide:${config===AI_WORKSPACE_CONFIG.W01?"W01":"workspace"}:${index}:${item.prompt}`,title:item.prompt,href:item.linkHref??"/",content:item.reply }))),
  ];
  const ai=new GoogleGenAI({apiKey:GEMINI_API_KEY});
  const dimensions=Number(GEMINI_EMBEDDING_DIMENSIONS);
  if(dimensions!==768)throw new Error("Migration Supabase hiện dùng vector(768); GEMINI_EMBEDDING_DIMENSIONS phải là 768.");
  const rows=[];
  for(let index=0;index<records.length;index+=16){
    const batch=records.slice(index,index+16);
    const response=await ai.models.embedContent({model:GEMINI_EMBEDDING_MODEL,contents:batch.map(record=>`title: ${record.title} | text: ${record.content}`),config:{outputDimensionality:dimensions}});
    if(response.embeddings?.length!==batch.length||response.embeddings.some(item=>item.values?.length!==dimensions))throw new Error("Gemini trả số lượng hoặc chiều embedding không khớp. Chưa ghi catalog.");
    rows.push(...batch.map((record,offset)=>{const hash=createHash("sha256").update(record.content).digest("hex");return{source_id:record.id,source_hash:hash,chunk_index:1,title:record.title,href:record.href,content:record.content,metadata:{kind:"catalog",demo:true},embedding:response.embeddings![offset].values};}));
  }
  const db=createClient(SUPABASE_URL,SUPABASE_SECRET_KEY);
  const result=await db.from("nai_documents").upsert(rows,{onConflict:"source_id,source_hash,chunk_index"});
  if(result.error)throw result.error;
  for(const record of records){const current=rows.find(row=>row.source_id===record.id)!;const removed=await db.from("nai_documents").delete().eq("source_id",record.id).neq("source_hash",current.source_hash);if(removed.error)throw removed.error;}
  console.log(`Đã đồng bộ ${records.length} sản phẩm, nhà vườn, lô hàng, livestream và hướng dẫn demo.`);
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Đồng bộ catalog thất bại.");process.exitCode=1;});
