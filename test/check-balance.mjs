import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Đọc file .env nếu chưa có trong process.env
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');

if (!API_KEY) {
  console.error('❌ Không tìm thấy DEEPSEEK_API_KEY trong file .env');
  process.exit(1);
}

async function checkBalance() {
  const maskedKey = API_KEY.length > 8 ? `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}` : '******';
  console.log('='.repeat(60));
  console.log('💰 KIỂM TRA SỐ DƯ TÀI KHOẢN DEEPSEEK API');
  console.log('='.repeat(60));
  console.log(`🔑 API Key : ${maskedKey}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);

  try {
    const res = await fetch(`${BASE_URL}/user/balance`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log('='.repeat(60));
    console.log(`🟢 Trạng thái hoạt động : ${data.is_available ? 'Khả dụng (Active)' : 'Hết hạn hoặc Bị khóa'}`);
    
    if (data.balance_infos && data.balance_infos.length > 0) {
      for (const info of data.balance_infos) {
        console.log(`💵 Loại tiền tệ         : ${info.currency}`);
        console.log(`💳 Số dư nạp (Topped-up): ${info.topped_up_balance} ${info.currency}`);
        console.log(`🎁 Số dư tặng (Granted) : ${info.granted_balance} ${info.currency}`);
        console.log(`🔥 TỔNG SỐ DƯ CÒN LẠI   : ${info.total_balance} ${info.currency}`);
      }
    } else {
      console.log('Chưa có thông tin số dư chi tiết.');
    }
    console.log('='.repeat(60));
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra số dư:', err.message);
  }
}

checkBalance();
