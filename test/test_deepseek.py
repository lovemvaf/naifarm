"""
Kiểm tra kết nối DeepSeek API toàn diện:
1. Hỏi LLM (Chat Completion)
2. Gửi hình ảnh + Instruct hỏi AI + trả lời theo pattern JSON
3. Text-to-Speech (TTS)
4. Speech-to-Text (STT / ASR)
"""

import os
import sys
import json
import base64
import uuid
import urllib.request
import urllib.error
from pathlib import Path

# Xác định đường dẫn thư mục gốc và file .env
current_dir = Path(__file__).parent.resolve()
root_dir = current_dir.parent
env_file = root_dir / ".env"

if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v

API_KEY = os.environ.get("DEEPSEEK_API_KEY", "").strip()
BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")

if not API_KEY:
    print("❌ LỖI: Không tìm thấy DEEPSEEK_API_KEY trong file .env hoặc biến môi trường.")
    sys.exit(1)

masked_key = f"{API_KEY[:6]}...{API_KEY[-4:]}" if len(API_KEY) > 8 else "******"
print("=" * 65)
print("🌾 NAI FARM - KIỂM TRA TOÀN DIỆN DEEPSEEK API (PYTHON)")
print("=" * 65)
print(f"🔑 API Key  : {masked_key}")
print(f"🌐 Base URL : {BASE_URL}")
print("=" * 65)

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def make_json_request(url: str, payload: dict) -> tuple[int, bytes]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {err_msg}")
    except Exception as e:
        raise RuntimeError(f"Lỗi mạng / kết nối: {str(e)}")

# 1. TEST LLM CHAT
def test_llm():
    print("\n[1/4] 💬 Đang kiểm tra: HỎI ĐÁP VỚI LLM...")
    url = f"{BASE_URL}/chat/completions"
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "Bạn là trợ lý NAI Farm. Trả lời súc tích trong 2 câu.",
            },
            {
                "role": "user",
                "content": "Chào bạn, hãy giới thiệu ngắn gọn vai trò của bạn tại nông trại NAI Farm.",
            },
        ],
        "temperature": 0.7,
        "max_tokens": 200,
    }
    status, raw = make_json_request(url, payload)
    data = json.loads(raw.decode("utf-8"))
    reply = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    print(f"   ✅ Thành công! Model: {data.get('model')} (Total tokens: {usage.get('total_tokens')})")
    print(f"   Nội dung phản hồi:\n   \"{reply.strip()}\"")
    return usage.get("total_tokens", 0)

# 2. TEST VISION + PATTERN JSON
def test_vision():
    print("\n[2/4] 🖼️  Đang kiểm tra: GỬI HÌNH ẢNH + INSTRUCT + TRẢ LỜI PATTERN JSON...")
    img_path = current_dir / "sample.jpg"
    if not img_path.exists():
        raise FileNotFoundError(f"Không tìm thấy file ảnh {img_path}")

    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    data_uri = f"data:image/jpeg;base64,{b64}"
    url = f"{BASE_URL}/chat/completions"
    pattern = {
        "summary": "Tóm tắt hình ảnh",
        "objects": ["vật thể 1", "vật thể 2"],
        "farm_status": "good | warning | alert",
        "advice": "Lời khuyên"
    }

    payload = {
        "model": "deepseek-flash",
        "messages": [
            {
                "role": "system",
                "content": f"Bạn là AI phân tích nông nghiệp. Bắt buộc trả về đúng cấu trúc JSON sau:\n{json.dumps(pattern, indent=2)}\nChỉ trả về JSON thuần túy.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Phân tích bức ảnh nông trại này và xuất ra JSON theo pattern đã định nghĩa."},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            },
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "max_tokens": 1000,
    }

    status, raw = make_json_request(url, payload)
    data = json.loads(raw.decode("utf-8"))
    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    usage = data.get("usage", {})
    print(f"   ✅ Thành công! (Total tokens: {usage.get('total_tokens')})")
    print("   Kết quả JSON:")
    print("   " + json.dumps(parsed, ensure_ascii=False, indent=2).replace("\n", "\n   "))
    return usage.get("total_tokens", 0)

# 3. TEST TTS
def test_tts():
    print("\n[3/4] 🔊 Đang kiểm tra: TEXT-TO-SPEECH (TTS)...")
    url = f"{BASE_URL}/v1/tools/tts"
    text_sample = "Hệ thống NAI Farm đã kết nối thành công. Xin kính chào quý khách."
    payload = {
        "text": text_sample,
        "voice_id": "stella",
        "output_format": "wav",
    }
    status, audio_bytes = make_json_request(url, payload)
    if not (len(audio_bytes) >= 12 and audio_bytes[:4] == b"RIFF" and audio_bytes[8:12] == b"WAVE"):
        raise ValueError(f"Dữ liệu trả về không phải định dạng WAV (size: {len(audio_bytes)})")

    out_file = current_dir / "output_tts.wav"
    with open(out_file, "wb") as f:
        f.write(audio_bytes)

    print(f"   ✅ Thành công! Kích thước âm thanh: {len(audio_bytes) / 1024:.1f} KB")
    print(f"   Đã lưu tại: {out_file}")
    return out_file

# 4. TEST STT / ASR
def test_stt(audio_path: Path):
    print("\n[4/4] 🎙️  Đang kiểm tra: SPEECH-TO-TEXT (STT / ASR)...")
    url = f"{BASE_URL}/v1/tools/asr"
    if not audio_path.exists():
        raise FileNotFoundError(f"Không tìm thấy file audio: {audio_path}")

    with open(audio_path, "rb") as f:
        file_bytes = f.read()

    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{audio_path.name}"\r\n'.encode("utf-8"))
    body.extend(b"Content-Type: audio/wav\r\n\r\n")
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        url,
        data=bytes(body),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data.get("text", "")
            duration_ms = data.get("duration_ms", 0)
            print(f"   ✅ Thành công! Thời lượng audio: {duration_ms / 1000:.2f} giây")
            print(f"   Văn bản nhận dạng được:\n   \"{text.strip()}\"")
            return text
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {err}")

def main():
    results = []
    tests = [
        ("1. LLM Chat Completion", test_llm),
        ("2. Vision + JSON Pattern", test_vision),
        ("3. TTS Audio WAV", test_tts),
    ]

    audio_file = current_dir / "output_tts.wav"

    for name, fn in tests:
        try:
            res = fn()
            if name == "3. TTS Audio WAV" and isinstance(res, Path):
                audio_file = res
            results.append((name, "PASS", None))
        except Exception as e:
            print(f"   ❌ Thất bại: {e}")
            results.append((name, "FAIL", str(e)))

    # Run STT
    try:
        test_stt(audio_file)
        results.append(("4. Speech-to-Text (STT / ASR)", "PASS", None))
    except Exception as e:
        print(f"   ❌ Thất bại: {e}")
        results.append(("4. Speech-to-Text (STT / ASR)", "FAIL", str(e)))

    print("\n" + "=" * 65)
    print("📊 BẢNG TỔNG KẾT KIỂM TRA DEEPSEEK API (PYTHON):")
    print("=" * 65)
    all_ok = True
    for name, st, err in results:
        icon = "✅" if st == "PASS" else "❌"
        print(f"{icon} {name.ljust(35)} -> {st}")
        if err:
            all_ok = False
            print(f"   Lỗi: {err}")
    print("=" * 65)

    if all_ok:
        print("🎉 TẤT CẢ 4 TÍNH NĂNG (LLM, VISION, TTS, STT) ĐỀU HOẠT ĐỘNG HOÀN HẢO!\n")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
