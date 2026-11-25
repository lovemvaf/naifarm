# NAIFARM V5 REQUIREMENTS & ROUTE MATRIX

Tài liệu đối chiếu yêu cầu V5 (tích hợp V1–V4 + V5 + `OCOP_AI_VIDEO_STUDIO_FREE_PLAN_MASTER.md`) theo từng tuyến đường (route) và không gian vai trò (`W01–W06`).

## 1. Routes & Verification Status

| Route | Vai trò / Mục tiêu | Điểm nâng cấp chính tại V5 | Trạng thái |
|---|---|---|---|
| `/` | Editorial Landing & Catalog | Empty `qrInput` default, bỏ mid-page banner thừa, `CulturalCampaignBanner` 3-slide + `.vn-flag-wave` 2D SVG, VI/EN farm-story copy, `hero.main` CMS override | `VERIFIED` |
| `/marketplace` | Chợ OCOP Thanh niên | `ProductCard` grid ổn định hàng, nhãn mùa vụ chuẩn xác, 88 ảnh đồng bộ (65 Stitch + 23 ảnh 4:3 mới), 168 SKUs + 17 OCOP refs tách biệt | `VERIFIED` |
| `/farms/[slug]` | Hồ sơ Nhà vườn | Grid `items-start` bỏ khoảng trắng kéo dài, livestream thích ứng 0/1/2+, 4-batch preview toggle, `MediaPlayer` chuẩn hóa | `VERIFIED` |
| `/live/[id]` | Phòng OCOP Live | Khay sản phẩm giới hạn `max-h-[460px]`, link sản phẩm giữ `?returnTo=`, bỏ nhãn `W01..W06`, `MediaPlayer` dừng phát khi unmount | `VERIFIED` |
| `/products/[slug]` | Chi tiết nông sản | Back button an toàn qua `sanitizeReturnTo(returnTo)`, 2D `ProduceAnatomy2D` SVG (9 loại nông sản), `MediaPlayer` | `VERIFIED` |
| `/explore` | Bản đồ 95 Phường/Xã Đồng Nai | Local `dong-nai-outline.json` + `dong-nai-wards.json` (95/95 đơn vị), inverse mask, `maxBounds`, `MapStatusStore` chống trùng alert, toggle Map/List mobile | `VERIFIED` |
| `/volunteer` | Không gian Thanh niên (`W03`) | Bộ lọc pill (`Khám phá` / `Của tôi` / `Đã hoàn thành` / `Tất cả`), bỏ `W02/W04` khỏi thẻ đang mở, mở `CertificatePreviewModal` xuất PDF tiếng Việt có QR | `VERIFIED` |
| `/learn` & `/learn/[slug]` | Học viện Song ngữ & Giải phẫu 2D | Lộ trình 6 bước tuần tự (`Bước X / 6`), công tắc giáo viên `Mở xem tự do`, `MediaPlayer` bước 1, 9 loại nông sản SVG tương tác, chứng nhận QR/PDF bước 6 | `VERIFIED` |
| `/credentials/[id]` | Tra cứu & In Chứng nhận | Trang tra cứu chứng nhận thành tích, Canvas độ phân giải cao (`Be Vietnam Pro` / `Lora`) + `qrcode` đóng gói `%PDF-1.4` | `VERIFIED` |
| `/sign-in`, `/sign-up`, `/demo` | Truy cập nhanh 6 vai trò | Bỏ mã `(26041)`/`W01 ·` gây tràn, wrap badge gọn, chia cột cân đối trên `320px–1920px`, song ngữ VI/EN | `VERIFIED` |
| `/farmer` (`W02`), `/organization` (`W05`), `/admin` (`W06`) | Không gian vận hành, CMS & Video Studio | Bỏ badge code `W02`/`W05`/`W06`, `CmsManagerPanel` (IndexedDB + Export/Import JSON), `CreativeStudioPanel` (`mode="creator"` / `mode="monitor"`) | `VERIFIED` |
| `/api/video/*` (`health`, `jobs`, `[id]`, `cancel`, `result`) | Video Studio Gateway | Proxy tới local FFmpeg worker (`127.0.0.1:4090`) khi chạy nội địa; tự động chuyển về `serverless_sample_preview` (không tạo tiến trình giả) trên Vercel | `VERIFIED` |
