import fs from 'node:fs';

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');

const sample = 'tôi có một trăm hai mươi túi hạt điều. mọi người có thể mua ăn để bổ sung sức khỏe.';

const payload = {
  model: 'deepseek-flash',
  messages: [
    {
      role: 'system',
      content: `Bạn là trợ lý AI NAI Farm Đồng Nai. Trích xuất thông tin đăng bán:
{
  "name": "string hoặc null",
  "category": "string hoặc null",
  "price": null,
  "unit": "string hoặc null",
  "stock": 0,
  "batchCode": null,
  "description": "string hoặc null"
}
Lưu ý quan trọng: Nhận diện cả số viết bằng chữ tiếng Việt (ví dụ: 'một trăm hai mươi túi hạt điều' -> stock: 120, unit: 'túi').
Nếu không nói giá thì price là null.
Chỉ trả về JSON thuần túy.`
    },
    { role: 'user', content: sample }
  ],
  response_format: { type: 'json_object' }
};

const res = await fetch(`${BASE_URL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

const data = await res.json();
console.log('Choices message:', data.choices?.[0]?.message?.content);
