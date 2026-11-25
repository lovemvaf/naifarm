# Bộ Kiểm Tra DeepSeek API - NAI Farm

Thư mục này chứa các file kiểm tra toàn diện API key DeepSeek, theo dõi số dư tài khoản và **4 chức năng AI cốt lõi** được tích hợp cho dự án **NAI Farm**:

1. **Kiểm tra số dư tài khoản (`/user/balance`)**: Xem số dư khả dụng, tiền nạp và tiền thưởng còn lại.
2. **Hỏi đáp LLM (Chat Completion)**: Gửi câu hỏi văn bản đến model DeepSeek (`deepseek-chat`), theo dõi token input/output và ước tính chi phí.
3. **Vision + Prompt + Trả lời JSON Pattern**: Gửi hình ảnh đính kèm câu lệnh (instruct) và ép kiểu phản hồi trả về đúng cấu trúc JSON (`response_format: { type: "json_object" }` với model multimodal `deepseek-flash`).
4. **Chuyển văn bản thành giọng nói (TTS - Text-to-Speech)**: Gửi văn bản tiếng Việt/Anh đến endpoint `/v1/tools/tts` và nhận về stream âm thanh định dạng `.wav` (lưu tại `test/output_tts.wav`).
5. **Chuyển giọng nói thành văn bản (STT / ASR - Speech-to-Text)**: Gửi file audio `.wav` lên endpoint `/v1/tools/asr` để nhận diện thành văn bản kèm thời lượng (duration).

---

## ⚙️ Cấu hình Biến Môi Trường (`.env`)

File `.env` nằm tại thư mục gốc `naifarm/.env`:

```env
DEEPSEEK_API_KEY=env.DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

---

## 🚀 Các Lệnh Kiểm Tra

### 1. Kiểm tra nhanh số dư tài khoản DeepSeek
```bash
npm run balance
```
*Hoặc:*
```bash
node --env-file=.env test/check-balance.mjs
```

### 2. Chạy toàn bộ 4 bài test (LLM + Vision + TTS + STT)
```bash
npm run test:deepseek
```
*Hoặc:*
```bash
node --env-file=.env test/test-deepseek.mjs
```

### 3. Chạy kiểm tra bằng Python
```bash
python test/test_deepseek.py
```

---

## 📊 Chi Tiết 4 Chức Năng Đã Tích Hợp

| STT | Chức năng | Endpoint / Model | Dữ liệu đầu vào | Kết quả đầu ra |
|---|---|---|---|---|
| 1 | **Hỏi đáp LLM** | `POST /chat/completions`<br>`deepseek-chat` / `deepseek-flash` | Câu hỏi văn bản | Câu trả lời + Thống kê Token & Chi phí |
| 2 | **Vision + Pattern** | `POST /chat/completions`<br>`deepseek-flash` (multimodal) | File ảnh Base64 + Instruct | Dữ liệu cấu trúc JSON chuẩn xác |
| 3 | **Text-to-Speech (TTS)** | `POST /v1/tools/tts`<br>Voice: `stella` / `tide` | Chuỗi văn bản tiếng Việt/Anh | File âm thanh `output_tts.wav` |
| 4 | **Speech-to-Text (STT)** | `POST /v1/tools/asr` | File âm thanh WAV (Multipart) | Đoạn text nhận dạng + `duration_ms` |

---

## 📁 Cấu Trúc Thư Mục `test/`

```
test/
├── check-balance.mjs   # Script kiểm tra số dư tài khoản DeepSeek
├── test-deepseek.mjs   # Script chạy 4 bài test + đo lường token và chi phí
├── test_deepseek.py    # Script test bằng Python
├── sample.jpg          # Ảnh mẫu dùng để test chức năng Vision
├── output_tts.wav      # File âm thanh xuất ra từ TTS và làm đầu vào cho STT
└── README.md           # Tài liệu hướng dẫn
```
