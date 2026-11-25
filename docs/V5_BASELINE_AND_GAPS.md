# NAIFARM V5 BASELINE & GAPS MATRIX

So sánh hiện trạng trước V5 (bao gồm 6 ảnh lỗi thực tế do người dùng cung cấp) và kết quả sau khi hoàn tất V5-M01 đến V5-M10.

## 1. Xử lý triệt để 6 nhóm vấn đề từ ảnh chụp thực tế

| Nhóm lỗi | Hiện trạng trước V5 | Khắc phục trong V5 | Kiểm chứng |
|---|---|---|---|
| **1. Header nhảy vị trí & chữ thiếu dấu** | Flex co giãn làm menu dịch chuyển khi đổi `VI`/`EN`, cụm `VI\|EN` ẩn dưới 480px, `Chợ OCOP Thanh niên · Thành phố` tràn chữ | `AppHeader.tsx` dùng CSS Grid track cố định (`lg:grid-cols-[128px_minmax(0,1fr)_136px_auto]`), nút `VI\|EN` rộng `w-[66px]` luôn hiện từ `320px+`, bỏ prefix `W01–W06` | `delta=0.00px` tại `1280px` & `1440px` khi chuyển `VI ↔ EN` |
| **2. `/sign-in` cắt chữ phải** | Khối form đăng nhập bị đẩy/cắt rìa phải, nhãn mã xã `(26041)` và `W01 ·` làm thẻ dài | `min-w-0`, bỏ prefix `(26041)`/`W01 ·`, wrap badge gọn, song ngữ VI/EN đầy đủ | `scrollWidth <= innerWidth` tại `320px–1920px` + inspect `04-sign-in-desktop.png` |
| **3. Ảnh sản phẩm lệch & ProductCard xộc xệch** | Nhiều SKU dùng nhầm ảnh hoặc dính overlay chữ `stitch-17` | Tạo mới 23 ảnh 4:3 sạch (`88` asset kiểm định SHA-256 trong `V5_MEDIA_PROVENANCE.csv`), sửa `REF-OCOP-01..10`, sửa lưới thẻ `ProductCard` | `test:data` PASS (168 SKUs, 88 manifest entries) + inspect `03-marketplace-grid.png` |
| **4. Khoảng trắng kéo dài trên Farm/Live & back ngữ cảnh** | Grid `items-stretch` kéo dài cột trống bên dưới lịch live 1 thẻ; vào sản phẩm từ Live mất `returnTo` | `farms/[slug]` dùng `items-start`, panel live thích ứng `0/1/2+`, khay Live `max-h-[460px]`, hỗ trợ `?returnTo=` đã sanitize | Inspect `05-farm-detail-ba-minh.png` & `05b-farm-batches-live.png` |
| **5. Trang `/volunteer` cắt chữ & lộ mã `W02`/`W04`** | `<select>` dài cắt mất chữ; thẻ nhiệm vụ đang mở hiển thị `3. W02 Xác nhận / 4. W04 Duyệt giờ` | Thay bằng pill tabs (`Khám phá` / `Của tôi` / `Đã hoàn thành` / `Tất cả`), ẩn workflow bar 4 bước ở thẻ chưa nhận, bỏ mã `W02`/`W04` | Playwright assert không còn `W02/W04` + inspect `06-volunteer-clean-cards.png` |
| **6. Footer & NaiAI đè chữ / thiếu Clear / bản đồ phụ thuộc OSM** | Bản đồ trắng khi OSM lỗi mạng; chatbot hiện `(W01)` và thiếu Clear; disclaimer footer góc phải sát nút NaiAI | `dong-nai-wards.json` (95/95 đơn vị) + `dong-nai-outline.json` + inverse mask + `MapStatusStore`; NaiAI thêm nút `Xóa hội thoại`, bỏ `(W01)`; footer thêm `md:pr-16 pb-12` | `97` SVG vector paths khi block `openstreetmap.org` + inspect `02-home-footer.png`, `07-explore-offline-map.png` |

## 2. Tính năng V5 bổ sung mới & phần bảo lưu trung thực

- **Đã hoàn tất & chạy thật:**
  - `ProduceAnatomy2D` mở rộng đủ **9 nông sản Đồng Nai** bằng SVG 2D (`pomelo`, `rambutan`, `durian`, `cashew` + cảnh báo nhựa CNSL, `coffee`, `pepper`, `cacao`, `avocado`, `honey`).
  - `InteractiveLessonPlayer` 6 bước tuần tự có chế độ giáo viên `Mở xem tự do`.
  - Xuất chứng nhận PDF tiếng Việt (`%PDF-1.4` Blob) gắn QR xác thực thật qua Canvas + `qrcode`.
  - Hệ thống CMS cục bộ (`CmsContext` + IndexedDB + Export/Import JSON + khôi phục phiên bản) tại `W02`, `W05`, `W06`.
  - OCOP AI Video Studio (`services/video-worker/`, 3 sample MP4 dựng thật bởi FFmpeg 9.0.2 + Pillow `palab.ttf`, `/api/video/*`, `CreativeStudioPanel`, 8 scripts `.ps1`, bộ test `T01–T16`).
- **Bảo lưu trung thực (chưa bật):**
  - `Muse2API` AI generative clip: giữ `VIDEO_AI_ENABLED=false` (`disabled_manual_login_required`) do yêu cầu chủ dự án đăng nhập thủ công trên máy cục bộ và không lưu thông tin đăng nhập/anti-bot bypass trong repo.
  - Database Supabase `0003_cms_and_video_studio.sql`: đã viết sẵn schema + `claim_next_video_job` + RLS; mặc định ứng dụng dùng IndexedDB / SQLite cục bộ và pre-rendered sample MP4 khi không cấu hình biến môi trường Supabase Live.
