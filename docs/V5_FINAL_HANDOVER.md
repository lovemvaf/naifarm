# NAIFARM V5 FINAL HANDOVER

Tài liệu bàn giao hoàn chỉnh phiên bản **NaiFarm V5 — Chợ OCOP Thanh niên Đồng Nai** (tổng hợp V1–V5 + OCOP AI Video Studio Free Plan).

## 1. Tổng quan sản phẩm đã hoàn thiện
- **Repo GitHub:** `https://github.com/lovemvaf/naifarm.git` (nhánh `main`, hợp nhất V5 + PR #3 NaiAI & LiveKit tại commit `22ff5f2`)
- **Production Web:** `https://naifarm.vercel.app/` (đã kiểm chứng Playwright & HTTP 200 trực tiếp trên live domain, `44` route tĩnh + API `/api/video/*`, `/api/live/*`, `/api/nai-ai/chat`)
- **Quy mô dữ liệu kiểm chứng:** `95` phường/xã Đồng Nai 2026 (`dong-nai-wards.json` cục bộ), `40` nhà vườn, `168` nông sản OCOP & đặc sản kèm `88` ảnh đã băm SHA-256 (`V5_MEDIA_PROVENANCE.csv`), `26` chuẩn chất lượng / `80` hồ sơ kiểm định, `17` hồ sơ tham khảo công bố UBND độc lập.
- **Khả năng cốt lõi V5:**
  1. Header & Footer song ngữ VI/EN cố định lưới (`0.00px` lệch chiều cao khi chuyển ngôn ngữ), hỗ trợ từ `320px` đến `1920px`.
  2. Bản đồ GeoJSON Đồng Nai hoạt động đầy đủ ngay cả khi mạng hoặc OpenStreetMap bị gián đoạn, bảo vệ tọa độ bằng ngưỡng vùng & chỉ đọc GPS khi người dùng bấm nút.
  3. Lộ trình học 6 bước tuần tự (kèm công tắc `Mở xem tự do`), đồ họa giải phẫu 2D tương tác cho 9 nông sản Đồng Nai, và xuất chứng nhận thành tích sang PDF tiếng Việt kèm mã QR quét thật.
  4. Quản trị nội dung Website cục bộ (IndexedDB, preview 3 màn hình, Export/Import JSON, rollback phiên bản) tại W02, W05, W06.
  5. **OCOP AI Video Studio (Free Plan):** Local Windows Worker (`services/video-worker/`) kết hợp Node `node:sqlite`, Python `Pillow` (`palab.ttf` + `segoeui.ttf`) và `FFmpeg 9.0.2` dựng MP4 H.264/AAC kèm QR truy xuất và phụ đề WebVTT, cùng 3 video mẫu đã kết xuất sẵn phục vụ trên Vercel Cloud khi chưa bật worker nội địa.

## 2. Hướng dẫn vận hành & các bước thủ công tiếp theo cho Chủ dự án

| Hạng mục | Trạng thái | Hành động thủ công (nếu muốn kích hoạt) |
|---|---|---|
| **Chạy Local FFmpeg Video Worker trên Windows** | Sẵn sàng dùng ngay | Mở PowerShell tại `naifarm/`: chạy `powershell -ExecutionPolicy Bypass -File scripts/video-studio/demo-local.ps1` (khởi động worker tại `127.0.0.1:4090`), rồi chạy `npm run dev` ở cửa sổ khác và mở `/farmer?mode=erp&tab=studio`. Dừng worker bằng `scripts/video-studio/stop-video-studio.ps1`. |
| **Chế độ AI Generative (`Muse2API`)** | Tạm tắt (`disabled_manual_login_required`) | Theo nguyên tắc bảo mật, repo không lưu cookie/mật khẩu/anti-bot bypass. Để kích hoạt Hybrid/Cinematic trên máy cá nhân, tự đăng nhập tài khoản hợp lệ tại phiên làm việc nội bộ và thiết lập biến `VIDEO_AI_ENABLED=true` + `MUSE_BASE_URL=...` trong `.env` cục bộ (không commit lên Git). Khi chưa bật, Studio tự động chuyển mượt về FFmpeg Fast Render. |
| **Áp dụng bảng CMS & Video Studio lên Supabase Remote** | Đã sẵn file SQL | Nếu cần đồng bộ đám mây với Supabase project, chạy file `supabase/migrations/0003_cms_and_video_studio.sql` trong Supabase SQL Editor hoặc `supabase db push`. |

## 3. Rà soát an toàn trước bàn giao
- Không commit file `.env` / `.env.local` chứa khóa bí mật, không commit SQLite queue, `local-media/`, hay cache GIS.
- Không sử dụng thư viện 3D/WebGL nặng; toàn bộ giải phẫu nông sản và bản đồ chạy 2D nhẹ và tương thích đa thiết bị.
