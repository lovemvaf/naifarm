# NAIFARM V5 REPO & SKILL EXECUTION LOG

Ghi nhận trung thực các Agent Skill, công cụ hệ thống và thư viện nội bộ được sử dụng trong giai đoạn V5 (theo quy định Workspace Hackathon Nhóm 8).

## 1. Agent Skills & Workflow áp dụng
1. `ui-ux-pro-max` + `design-system` + `ui-styling`:
   - Chuẩn hóa CSS Grid header (`AppHeader.tsx`), hệ thống spacing/typography (`Be Vietnam Pro`, `Lora`), trạng thái focus và card grid (`ProductCard`, `CulturalCampaignBanner`, `CreativeStudioPanel`).
2. `impeccable` + `unslop` + `frontend-a11y`:
   - Kiểm tra độ tương phản, nhãn `aria-label` / `aria-pressed` / `role="tab"`, loại bỏ code workspace nội bộ (`W01–W06`) khỏi giao diện phổ thông và hộp thoại AI.
3. `group8-hackathon-ux`:
   - Bảo đảm ranh giới dữ liệu minh họa (Demo) tách biệt với 17 hồ sơ tham khảo OCOP công bố (`OCOP_PUBLIC_REFERENCE_CATALOG`), giữ nguyên quy tắc an toàn pháp lý và trung thực kết quả.
4. `frontend-patterns` + `systematic-debugging`:
   - Chẩn đoán và sửa 5 lỗi ESLint React Compiler (`react-hooks/set-state-in-effect`, `react-hooks/refs`), xử lý font Unicode tiếng Việt `palab.ttf` trong Pillow cho tiêu đề video MP4, xử lý `net::ERR_ABORTED` khi điều hướng RSC trong Playwright.
5. `verification-before-completion`:
   - Chỉ ghi nhận trạng thái hoàn thành sau khi chạy đủ 11 CLI gate (`typecheck`, `lint`, `data:validate`, `test:*`, `build`) và Playwright QA thực tế trên Chromium.

## 2. Công cụ, Runtime & Thư viện kiểm chứng trong V5
- **Next.js `16.4.6` (Turbopack) + React `19.3.0` + Tailwind CSS `4.3.3` + TypeScript `5.x`**
- **GeoJSON & GIS:** Python `scripts/build-geojson.py` + `@turf/distance` + `leaflet` `1.9.4` (95/95 đơn vị hành chính Đồng Nai 2026)
- **QR & PDF Export:** `qrcode` (`1.5.4`), `jsqr` (`1.4.0`), `pngjs`, HTML5 Canvas + `%PDF-1.4` Blob builder nội bộ
- **Local Video Studio Pipeline:**
  - Node.js `v24.13.0` (`node:sqlite` `DatabaseSync` tại `services/video-worker/`)
  - Python `3.14` + `Pillow` (`PIL`) kết xuất frame đa phân giải bằng `Palatino Linotype Bold` (`palab.ttf`) và `Segoe UI` (`segoeui.ttf`) hỗ trợ đầy đủ dấu tiếng Việt
  - `FFmpeg 9.0.2` (`libx264`, `yuv420p`, `+faststart`, `aac` 128k) + `FFprobe 9.0.2`
- **Browser QA:** `.toolbox/qa-runtime/node_modules/playwright-core` + Google Chrome cục bộ (không đưa dependency Playwright QA vào runtime nộp bài `src/`)
