import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Exact functions from src/app/farmer/publish/page.tsx
function writeWavHeaderString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAVBuffer(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeWavHeaderString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeWavHeaderString(view, 8, "WAVE");

  // "fmt " subchunk
  writeWavHeaderString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, 1, true); // NumChannels = 1 (Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000)
  view.setUint32(28, sampleRate * 2, true); // ByteRate = SampleRate * 1 * 2
  view.setUint16(32, 2, true); // BlockAlign = 1 * 2
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // "data" subchunk
  writeWavHeaderString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function resampleLinear(fullPcm, inputSampleRate, targetSampleRate = 16000) {
  if (inputSampleRate === targetSampleRate) return fullPcm;
  const ratio = targetSampleRate / inputSampleRate;
  const newLen = Math.round(fullPcm.length * ratio);
  const resampled = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i / ratio;
    const low = Math.floor(srcIdx);
    const high = Math.min(low + 1, fullPcm.length - 1);
    const frac = srcIdx - low;
    resampled[i] = fullPcm[low] * (1 - frac) + fullPcm[high] * frac;
  }
  return resampled;
}

async function runTests() {
  console.log("================================================================================");
  console.log("KIỂM THỬ TÍCH HỢP TOÀN DIỆN: PCM ENCODE (16kHz WAV) & DEEPSEEK ASR & AI DRAFT");
  console.log("================================================================================\n");

  // TEST 1: Giả lập quy trình thu âm PCM trong Browser -> Resample tuyến tính -> encodeWAVBuffer
  console.log("--- TEST 1: THỬ NGHIỆM encodeWAVBuffer & resampleLinear TỚI /api/ai/asr ---");
  const rawWavPath = path.join(__dirname, "output_tts.wav");
  const origBuffer = fs.readFileSync(rawWavPath);

  // Đọc các mẫu PCM 16-bit từ output_tts.wav (vốn là 24000Hz) chuyển thành Float32Array [-1..1]
  const dataOffset = 44;
  const numSamples = (origBuffer.length - dataOffset) / 2;
  const rawFloat32 = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const int16 = origBuffer.readInt16LE(dataOffset + i * 2);
    rawFloat32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }

  console.log(`[Browser Audio Input] Đã trích xuất ${numSamples} mẫu PCM từ tần số gốc 24000 Hz.`);

  // Áp dụng resample tuyến tính về 16000 Hz chuẩn ASR
  const resampledFloat32 = resampleLinear(rawFloat32, 24000, 16000);
  console.log(`[Linear Resample] Chuyển đổi từ 24000 Hz -> 16000 Hz: còn ${resampledFloat32.length} mẫu.`);

  // Đóng gói bằng đúng thuật toán encodeWAVBuffer của trang Farmer Publish
  const wavArrayBuffer = encodeWAVBuffer(resampledFloat32, 16000);
  console.log(`[encodeWAVBuffer] Đã tạo ArrayBuffer WAV dung lượng ${wavArrayBuffer.byteLength} bytes.`);

  // Kiểm tra header WAV vừa tạo
  const wavView = new DataView(wavArrayBuffer);
  const riff = String.fromCharCode(wavView.getUint8(0), wavView.getUint8(1), wavView.getUint8(2), wavView.getUint8(3));
  const wave = String.fromCharCode(wavView.getUint8(8), wavView.getUint8(9), wavView.getUint8(10), wavView.getUint8(11));
  const sampleRate = wavView.getUint32(24, true);
  const channels = wavView.getUint16(22, true);
  const bitsPerSample = wavView.getUint16(34, true);

  console.log(`[WAV Header Check] ChunkID: ${riff}, Format: ${wave}, SampleRate: ${sampleRate}Hz, Channels: ${channels}, Bits: ${bitsPerSample}`);

  if (riff !== "RIFF" || wave !== "WAVE" || sampleRate !== 16000 || channels !== 1 || bitsPerSample !== 16) {
    throw new Error("LỖI: Định dạng WAV không đạt chuẩn 16kHz mono 16-bit PCM!");
  }
  console.log("=> Header WAV chuẩn xác 100% RIFF WAVE 16-bit mono 16000Hz.\n");

  // Gửi file WAV này lên endpoint /api/ai/asr
  console.log("Đang gửi file WAV mã hóa lên http://localhost:3000/api/ai/asr ...");
  const blob = new Blob([wavArrayBuffer], { type: "audio/wav" });
  const formData = new FormData();
  formData.append("file", blob, "encoded_from_pcm.wav");

  const asrRes = await fetch("http://localhost:3000/api/ai/asr", {
    method: "POST",
    body: formData,
  });

  console.log(`ASR Status: ${asrRes.status} ${asrRes.statusText}`);
  const asrJson = await asrRes.json();
  console.log("ASR Result:", JSON.stringify(asrJson, null, 2));

  if (!asrRes.ok || !asrJson.success || !asrJson.text) {
    throw new Error(`TEST 1 FAILED: ASR endpoint không trả về kết quả thành công: ${JSON.stringify(asrJson)}`);
  }
  console.log("=> [TEST 1 PASS] encodeWAVBuffer được DeepSeek ASR tiếp nhận hoàn hảo (200 OK)!\n");


  // TEST 2: Kiểm tra nghiệp vụ ĐỂ TRỐNG (null / "") khi thiếu giá / số lượng tại /api/ai/publish-draft
  console.log("--- TEST 2: KIỂM TRA ĐỂ TRỐNG DỮ LIỆU KHI THIẾU GIÁ / SỐ LƯỢNG (/api/ai/publish-draft) ---");

  // Trường hợp 2A: Chỉ nói loại nông sản OCOP, không nói giá, không nói số lượng
  const promptMissingAll = "Vườn Ba Tư hôm nay thu hoạch sầu riêng Ri6 chín cây thơm nức mũi đạt chuẩn OCOP.";
  console.log(`\n2A. Test mô tả thiếu cả giá lẫn số lượng: "${promptMissingAll}"`);
  const res2A = await fetch("http://localhost:3000/api/ai/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: promptMissingAll }),
  });
  const data2A = await res2A.json();
  console.log("2A Data:", JSON.stringify(data2A.data, null, 2));

  if (data2A.data.price !== null) {
    throw new Error(`2A FAILED: price phải là null nhưng lại là ${data2A.data.price}`);
  }
  if (data2A.data.stock !== null) {
    throw new Error(`2A FAILED: stock phải là null nhưng lại là ${data2A.data.stock}`);
  }
  console.log("=> [PASS 2A] price = null, stock = null (ĐÚNG YÊU CẦU ĐỂ TRỐNG)!");


  // Trường hợp 2B: Có số lượng và đơn vị ("một trăm hai mươi túi"), KHÔNG nói giá
  const promptMissingPrice = "Tôi có một trăm hai mươi túi hạt điều rang củi vỏ lụa.";
  console.log(`\n2B. Test mô tả có số lượng bằng chữ tiếng Việt nhưng thiếu giá: "${promptMissingPrice}"`);
  const res2B = await fetch("http://localhost:3000/api/ai/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: promptMissingPrice }),
  });
  const data2B = await res2B.json();
  console.log("2B Data:", JSON.stringify(data2B.data, null, 2));

  if (data2B.data.stock !== 120) {
    throw new Error(`2B FAILED: stock phải là 120 nhưng lại là ${data2B.data.stock}`);
  }
  if (data2B.data.unit !== "túi") {
    throw new Error(`2B FAILED: unit phải là 'túi' nhưng lại là ${data2B.data.unit}`);
  }
  if (data2B.data.price !== null) {
    throw new Error(`2B FAILED: price phải là null khi bác nông dân chưa nói giá, nhưng lại là ${data2B.data.price}`);
  }
  console.log("=> [PASS 2B] stock = 120, unit = 'túi', price = null (ĐÚNG YÊU CẦU ĐỂ TRỐNG GIÁ)!");


  // Trường hợp 2C: Có giá bằng chữ ("ba mươi lăm nghìn"), đơn vị "ký", KHÔNG nói số lượng
  const promptMissingStock = "Tôi bán ba mươi lăm nghìn một ký chôm chôm Java mới hái.";
  console.log(`\n2C. Test mô tả có giá nhưng thiếu số lượng: "${promptMissingStock}"`);
  const res2C = await fetch("http://localhost:3000/api/ai/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: promptMissingStock }),
  });
  const data2C = await res2C.json();
  console.log("2C Data:", JSON.stringify(data2C.data, null, 2));

  if (data2C.data.price !== 35000) {
    throw new Error(`2C FAILED: price phải là 35000 nhưng lại là ${data2C.data.price}`);
  }
  if (data2C.data.stock !== null) {
    throw new Error(`2C FAILED: stock phải là null khi chưa nói số lượng, nhưng lại là ${data2C.data.stock}`);
  }
  console.log("=> [PASS 2C] price = 35000, stock = null (ĐÚNG YÊU CẦU ĐỂ TRỐNG SỐ LƯỢNG)!");

  console.log("\n================================================================================");
  console.log("TẤT CẢ CÁC BÀI KIỂM THỬ ĐỀU ĐẠT CHUẨN XUẤT SẮC (ALL TESTS PASSED 100%)");
  console.log("================================================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
