# NAIFARM V3.0 — REPOSITORY & RUNTIME DEPENDENCY MATRIX

Tài liệu xác minh toàn bộ thư viện runtime, công cụ kiểm thử và kỹ năng cục bộ đang dùng trong NaiFarm V3.0 (cập nhật 25/11/2026).

| Nhóm | Package / Nguồn / Skill | Phiên bản / Đường dẫn | Giấy phép | Loại | Bằng chứng sử dụng & Mục đích |
|---|---|---|---|---|---|
| Core Web Stack | `next`, `react`, `react-dom`, `tailwindcss` | `16.4.6`, `19.3.0`, `4.3.3` | MIT | `existing` | App Router Frontend-Only `src/app/`, Tailwind v4 Turbopack build |
| UI & Charts | `lucide-react`, `recharts`, `motion`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority` | Xem `package.json` | ISC / MIT | `existing` | Hệ thống icon thống nhất Lucide, biểu đồ có fallback bảng, thông báo toast tập trung ở `src/lib/toast.ts` |
| Bản đồ & GIS | `leaflet`, `react-leaflet`, `@turf/distance`, `@turf/helpers` | `1.9.4`, `5.0.0`, `7.4.0` | BSD-2 / MIT | `existing` | Bản đồ `OpenStreetMap` (`src/components/map/*`), GPS trình duyệt có xin phép, khoảng cách đường chim bay |
| Tìm kiếm & Schema | `fuse.js`, `papaparse`, `zod` | `7.5.0`, `5.7.1`, `4.6.7` | Apache-2 / MIT | `existing` | Tìm kiếm mờ hỗ trợ `đ→d` tại `/search`, parse CSV `25/11/2026` 95 ĐVHC Đồng Nai |
| QR Code & Scanner | `qrcode`, `qrcode.react`, `qr-scanner`, `jsqr`, `pngjs` | `1.5.4`, `4.2.0`, `1.4.2`, `1.4.0` | MIT / Apache-2 | `existing` | Sinh QR tuyệt đối (`https://naifarm.vercel.app/trace/<batch>`), giải mã cam/ảnh & kiểm chứng roundtrip `test:qr` |
| E2E & Test Runner | `tsx`, `python` Playwright (`chromium`) | `tsx 4.23.15` | MIT / Apache-2 | `existing` | Chạy `data:validate`, `test:data`, `test:metrics`, `test:quality`, `test:qr` và `tests/e2e-v3-verify.py` |
| Nghiệp vụ Local Reference | `Dong Nai Memory`, `EduMap`, `FLOODTWIN-AI` | `E:\04_Projects\...`, `C:\Users\asus\Documents\EduMap` | Local Workspace | `reference` | Tham chiếu cấu trúc bản đồ Leaflet + tile fallback + phân tầng địa giới hành chính |
| UX & Copy Skills | `ws-vi-ux-writing`, `ui-ux-pro-max`, `ecc-frontend-patterns`, `design-taste-frontend`, `hallmark`, `unslop`, `ecc-verification-loop` | `.agents/skills/*`, `~/.gemini/config/skills/ws-vi-ux-writing` | Local Skills | `skill` | Quét copy tiếng Việt chuẩn, tổ chức React App Router, visual QA và verification gate trước commit |
| Thư viện 3D cũ | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` | Gỡ bỏ từ V2 | — | `skipped` | Đã xóa vĩnh viễn theo yêu cầu; thay bằng 2D tương tác (`ProduceAnatomy2D`, `ProductGallery2D`) |
| Backend / DB / Auth | Supabase, Prisma, PostgreSQL, Payment SDK | Không cài đặt | — | `skipped` | Tuân thủ phạm vi Frontend-Only, mọi dữ liệu và state chạy hoàn toàn cục bộ trên trình duyệt |
