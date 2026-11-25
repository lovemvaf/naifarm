import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wavPath = path.join(__dirname, "output_tts.wav");

async function main() {
  console.log("=== KIỂM THỬ ENDPOINT /api/ai/asr VỚI FILE test/output_tts.wav ===");

  if (!fs.existsSync(wavPath)) {
    console.error(`ERROR: File không tồn tại tại ${wavPath}`);
    process.exit(1);
  }

  const fileStats = fs.statSync(wavPath);
  console.log(`Đã tìm thấy file test: ${wavPath} (${fileStats.size} bytes)`);

  const fileBuffer = fs.readFileSync(wavPath);
  const blob = new Blob([fileBuffer], { type: "audio/wav" });

  const formData = new FormData();
  formData.append("file", blob, "output_tts.wav");

  const endpointUrl = "http://localhost:3000/api/ai/asr";
  console.log(`Đang gửi request POST tới: ${endpointUrl}`);

  try {
    const res = await fetch(endpointUrl, {
      method: "POST",
      body: formData,
    });

    console.log(`Response status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("Response JSON:", JSON.stringify(data, null, 2));

    if (res.ok && data.success) {
      console.log("\n[TEST RESULT: PASS] Nhận dạng thành công!");
      console.log(`Kết quả văn bản (text): "${data.text}"`);
      if (data.duration_ms) console.log(`Thời lượng: ${data.duration_ms}ms`);
      if (data.request_id) console.log(`Request ID: ${data.request_id}`);
    } else {
      console.warn("\n[TEST RESULT: API Return Status/Error]", data);
    }
  } catch (err) {
    console.error("Lỗi khi kết nối localhost:3000/api/ai/asr:", err);
  }
}

main();
