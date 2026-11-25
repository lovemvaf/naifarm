import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load .env if not loaded via --env-file
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');

if (!API_KEY) {
  console.error('❌ LỖI: Chưa cấu hình DEEPSEEK_API_KEY trong môi trường hoặc file .env');
  process.exit(1);
}

const maskedKey = API_KEY.length > 8 ? `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}` : '******';
console.log('='.repeat(65));
console.log('🌾 NAI FARM - TEST TOÀN DIỆN DEEPSEEK API: LLM + VISION + TTS + STT');
console.log('='.repeat(65));
console.log(`🔑 API Key  : ${maskedKey}`);
console.log(`🌐 Base URL : ${BASE_URL}`);

const jsonHeaders = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Đơn giá tham khảo DeepSeek V3/Flash ($/1M tokens)
// Input Miss: $0.27/1M | Input Hit: $0.07/1M | Output: $1.10/1M
function estimateCost(usage) {
  if (!usage) return 0;
  const missTokens = usage.prompt_cache_miss_tokens ?? usage.prompt_tokens ?? 0;
  const hitTokens = usage.prompt_cache_hit_tokens ?? 0;
  const outTokens = usage.completion_tokens ?? 0;

  const cost = (missTokens * 0.27 + hitTokens * 0.07 + outTokens * 1.10) / 1000000;
  return cost;
}

// Lấy số dư tài khoản từ API DeepSeek (/user/balance)
async function getAccountBalance() {
  try {
    const res = await fetch(`${BASE_URL}/user/balance`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.balance_infos?.[0] || null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// TEST 1: HỎI LLM (CHAT COMPLETIONS)
// --------------------------------------------------------------------------
async function testLLMChat() {
  console.log('\n[1/4] 💬 TEST HỎI ĐÁP LLM (Chat Completion)...');
  const url = `${BASE_URL}/chat/completions`;
  const payload = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý AI thông minh cho nông trại NAI Farm. Hãy trả lời súc tích và thân thiện.',
      },
      {
        role: 'user',
        content: 'Xin chào! Hãy giới thiệu ngắn gọn trong 2 câu về vai trò của bạn trong việc giám sát cây trồng.',
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  };

  const startTime = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const duration = Date.now() - startTime;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content;
  const usage = result.usage;
  const cost = estimateCost(usage);

  console.log(`   ✅ Thành công! (${duration}ms) - Model: ${result.model}`);
  console.log(`   📊 LƯỢNG TOKEN TIÊU THỤ:`);
  console.log(`      • Input (Prompt)   : ${usage?.prompt_tokens} tokens (Hit cache: ${usage?.prompt_cache_hit_tokens || 0}, Miss: ${usage?.prompt_cache_miss_tokens || usage?.prompt_tokens || 0})`);
  console.log(`      • Output (Reply)   : ${usage?.completion_tokens} tokens`);
  console.log(`      • Tổng cộng        : ${usage?.total_tokens} tokens`);
  console.log(`      • Chi phí ước tính : ~$${cost.toFixed(6)} USD`);
  console.log(`   📝 Nội dung trả về:`);
  console.log(`      "${reply?.trim()}"`);

  return { usage, cost };
}

// --------------------------------------------------------------------------
// TEST 2: GỬI HÌNH ẢNH + INSTRUCT HỎI AI + TRẢ LỜI PATTERN (JSON STRUCTURED)
// --------------------------------------------------------------------------
async function testVisionWithPattern() {
  console.log('\n[2/4] 🖼️  TEST GỬI HÌNH ẢNH + INSTRUCT + TRẢ LỜI PATTERN (JSON)...');
  
  const imagePath = path.join(__dirname, 'sample.jpg');
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Không tìm thấy file ảnh mẫu tại: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Image}`;

  console.log(`   📸 Ảnh đầu vào: ${path.basename(imagePath)} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);

  const patternSchema = {
    image_summary: 'Mô tả tổng quan bức ảnh nông nghiệp',
    detected_elements: ['phần tử 1', 'phần tử 2'],
    plant_health_assessment: 'healthy | warning | critical | unknown',
    recommendations: ['khuyến nghị 1', 'khuyến nghị 2'],
    confidence_score: 0.95,
  };

  const url = `${BASE_URL}/chat/completions`;
  const payload = {
    model: 'deepseek-flash',
    messages: [
      {
        role: 'system',
        content: `Bạn là chuyên gia thị giác máy tính cho nông trại thông minh NAI Farm.
Nhiệm vụ của bạn là phân tích hình ảnh và bắt buộc trả về kết quả theo ĐÚNG định dạng JSON sau:
${JSON.stringify(patternSchema, null, 2)}
Lưu ý: Chỉ trả về JSON thuần túy, không có văn bản thừa.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Hãy quan sát hình ảnh nông trại này và phân tích theo đúng cấu trúc pattern JSON đã yêu cầu.',
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1000,
  };

  const startTime = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const duration = Date.now() - startTime;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  const usage = result.usage;
  const cost = estimateCost(usage);

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch (err) {
    throw new Error(`Nội dung trả về không phải JSON hợp lệ: ${content}`);
  }

  console.log(`   ✅ Thành công! (${duration}ms) - Model: ${result.model}`);
  console.log(`   📊 LƯỢNG TOKEN TIÊU THỤ (Bao gồm Image + Prompt):`);
  console.log(`      • Input (Image+Prompt): ${usage?.prompt_tokens} tokens`);
  console.log(`      • Output (JSON Pattern): ${usage?.completion_tokens} tokens`);
  console.log(`      • Tổng cộng           : ${usage?.total_tokens} tokens`);
  console.log(`      • Chi phí ước tính    : ~$${cost.toFixed(6)} USD`);
  console.log('   📋 Kết quả JSON Pattern nhận được:');
  console.log(JSON.stringify(parsedJson, null, 2).split('\n').map(l => '      ' + l).join('\n'));

  return { usage, cost };
}

// --------------------------------------------------------------------------
// TEST 3: TEXT-TO-SPEECH (TTS API)
// --------------------------------------------------------------------------
async function testTTS() {
  console.log('\n[3/4] 🔊 TEST TEXT-TO-SPEECH (TTS API)...');
  const url = `${BASE_URL}/v1/tools/tts`;
  const textPrompt = 'Xin chào, tôi là trợ lý ảo NAI Farm. Cảm biến cho thấy độ ẩm đất đang ở mức tối ưu tám mươi phần trăm.';
  
  const payload = {
    text: textPrompt,
    voice_id: 'stella',
    output_format: 'wav',
  };

  console.log(`   🗣️  Văn bản đọc: "${textPrompt}" (${textPrompt.length} ký tự)`);
  console.log(`   🎤 Giọng đọc   : ${payload.voice_id}`);

  const startTime = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const duration = Date.now() - startTime;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const outputPath = path.join(__dirname, 'output_tts.wav');
  fs.writeFileSync(outputPath, buffer);

  console.log(`   ✅ Thành công! (${duration}ms)`);
  console.log(`   📊 THỐNG KÊ TIÊU THỤ TTS:`);
  console.log(`      • Ký tự văn bản đọc : ${textPrompt.length} ký tự`);
  console.log(`      • Kích thước file   : ${(buffer.length / 1024).toFixed(1)} KB (WAV)`);
  console.log(`      • File đã lưu tại   : ${outputPath}`);

  return { charCount: textPrompt.length, bytes: buffer.length, outputPath, originalText: textPrompt };
}

// --------------------------------------------------------------------------
// TEST 4: SPEECH-TO-TEXT (STT / ASR API)
// --------------------------------------------------------------------------
async function testSpeechToText(audioFilePath) {
  console.log('\n[4/4] 🎙️  TEST SPEECH-TO-TEXT (STT / ASR API)...');
  const url = `${BASE_URL}/v1/tools/asr`;

  const targetFile = audioFilePath || path.join(__dirname, 'output_tts.wav');
  if (!fs.existsSync(targetFile)) {
    throw new Error(`Không tìm thấy file âm thanh để nhận dạng tại: ${targetFile}`);
  }

  const fileBuffer = fs.readFileSync(targetFile);
  console.log(`   🎧 File âm thanh đầu vào: ${path.basename(targetFile)} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);

  const blob = new Blob([fileBuffer], { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('file', blob, path.basename(targetFile));

  const startTime = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      // FormData tự động set Content-Type multipart/form-data kèm boundary
    },
    body: formData,
  });

  const duration = Date.now() - startTime;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  const transcribedText = result.text;
  const audioDurationMs = result.duration_ms;

  console.log(`   ✅ Nhận dạng giọng nói STT thành công! (${duration}ms)`);
  console.log(`   📊 THỐNG KÊ TIÊU THỤ STT (ASR):`);
  console.log(`      • Thời lượng âm thanh : ${(audioDurationMs / 1000).toFixed(2)} giây (${audioDurationMs} ms)`);
  console.log(`      • Request ID          : ${result.request_id}`);
  console.log(`   📝 KẾT QUẢ VĂN BẢN ĐÃ CHUYỂN ĐỔI:`);
  console.log(`      "${transcribedText?.trim()}"`);

  return { transcribedText, audioDurationMs };
}

// --------------------------------------------------------------------------
// MAIN RUNNER
// --------------------------------------------------------------------------
async function runAll() {
  const initialBalance = await getAccountBalance();
  if (initialBalance) {
    console.log(`💰 SỐ DƯ TÀI KHOẢN HIỆN TẠI : ${initialBalance.total_balance} ${initialBalance.currency}`);
  }
  console.log('='.repeat(65));

  let totalTokens = 0;
  let totalCostUSD = 0;
  let lastAudioPath = null;
  const summary = [];

  // Run Test 1: LLM
  try {
    const res1 = await testLLMChat();
    totalTokens += res1.usage?.total_tokens || 0;
    totalCostUSD += res1.cost;
    summary.push({ name: '1. Hỏi đáp LLM (Chat Completion)', status: 'PASS', detail: `${res1.usage?.total_tokens} tokens` });
  } catch (err) {
    summary.push({ name: '1. Hỏi đáp LLM (Chat Completion)', status: 'FAIL', error: err.message });
  }

  // Run Test 2: Vision
  try {
    const res2 = await testVisionWithPattern();
    totalTokens += res2.usage?.total_tokens || 0;
    totalCostUSD += res2.cost;
    summary.push({ name: '2. Vision + Instruct + JSON Pattern', status: 'PASS', detail: `${res2.usage?.total_tokens} tokens` });
  } catch (err) {
    summary.push({ name: '2. Vision + Instruct + JSON Pattern', status: 'FAIL', error: err.message });
  }

  // Run Test 3: TTS
  try {
    const res3 = await testTTS();
    lastAudioPath = res3.outputPath;
    summary.push({ name: '3. Text-to-Speech (TTS Audio)', status: 'PASS', detail: `${res3.charCount} chars (${(res3.bytes / 1024).toFixed(1)} KB)` });
  } catch (err) {
    summary.push({ name: '3. Text-to-Speech (TTS Audio)', status: 'FAIL', error: err.message });
  }

  // Run Test 4: STT / ASR
  try {
    const res4 = await testSpeechToText(lastAudioPath);
    summary.push({ name: '4. Speech-to-Text (STT / ASR)', status: 'PASS', detail: `${(res4.audioDurationMs / 1000).toFixed(2)}s audio` });
  } catch (err) {
    summary.push({ name: '4. Speech-to-Text (STT / ASR)', status: 'FAIL', error: err.message });
  }

  // Lấy số dư sau khi chạy
  const finalBalance = await getAccountBalance();

  console.log('\n' + '='.repeat(65));
  console.log('📊 TỔNG HỢP KIỂM TRA & LƯỢNG TIÊU THỤ SAU TẤT CẢ TÁC VỤ:');
  console.log('='.repeat(65));
  for (const item of summary) {
    const icon = item.status === 'PASS' ? '✅' : '❌';
    const detail = item.detail ? `[Tiêu thụ: ${item.detail}]` : '';
    console.log(`${icon} ${item.name.padEnd(38)} -> ${item.status} ${detail}`);
  }
  console.log('-'.repeat(65));
  console.log(`🔢 Tổng Token LLM & Vision đã dùng : ${totalTokens} tokens`);
  console.log(`💲 Ước tính chi phí bài test này  : ~$${totalCostUSD.toFixed(6)} USD`);
  if (finalBalance) {
    console.log(`💳 SỐ DƯ TÀI KHOẢN CÒN LẠI       : ${finalBalance.total_balance} ${finalBalance.currency}`);
  }
  console.log('='.repeat(65) + '\n');
}

runAll();
