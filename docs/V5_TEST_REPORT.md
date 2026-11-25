# NAIFARM V5 VERIFICATION & TEST REPORT

Báo cáo tổng hợp toàn bộ kết quả kiểm thử đã chạy thực tế trên workspace `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm` (cập nhật ngày 25/11/2026).

## 1. Kết quả chuỗi kiểm thử tĩnh, bảo mật, dữ liệu & production build

| Lệnh kiểm tra | Kết quả | Chỉ số / Bằng chứng quan sát trực tiếp |
|---|---|---|
| `npm run typecheck` | **PASS** (exit `0`) | `tsc --noEmit` — 0 lỗi TypeScript trên cả `src/`, `scripts/`, `services/video-worker/` |
| `npm run lint` | **PASS** (exit `0`) | `eslint` — 0 lỗi (`48` cảnh báo `@next/next/no-img-element` & unused var có sẵn trước đó) |
| `npm run data:validate` | **PASS** (exit `0`) | **95 units** (33 Phường, 62 Xã), 10 nâng cấp 2026, `0 fabricated GIS coords`, Phước Sơn `386.56` vs `659.163` đã đối chiếu |
| `npm run test:data` | **PASS** (exit `0`) | **40 farms**, **24 experiences**, **168 products**, 12 categories, 171 batches, 64 seasons, 552 diaryEntries, 40 certifications, 608 orders, 64 missions, 168 volunteerHourRecords, 24 livestreams, 20 lessons, 24 campaigns, 72 calendarEvents |
| `npm run test:metrics` | **PASS** (exit `0`) | `novGmvVnd`: `196,736,000`, `novNetMerchandiseVnd`: `172,603,000`, `confirmedVolunteerHours`: `106`, `ttNovNetVnd`: `170,000,000`, `ttPomeloAvailableKg`: `1,250`, `ttMemberHouseholds`: `19` |
| `npm run test:quality` | **PASS** (exit `0`) | **26** `credentialTypesCount`, **80** `credentialRecordsCount`, **17** `publicReferencesCount`, recall cascade `["NF-DN-099", "NF-DN-100"]` |
| `npm run test:qr` | **PASS** (exit `0`) | `VERIFY_QR_DECODE PASS`: PNG QR encode/decode & URL security validation trên toàn bộ mã lô |
| `npm run test:i18n` | **PASS** (exit `0`) | **234** `i18nKeyCount`, 0 khóa thiếu giữa `messages-vi.ts` & `messages-en.ts`, Fuse search `enPomeloHits=10`, `enCashewHits=10`, `tourHits=10` |
| `npm run test:calendar` | **PASS** (exit `0`) | `defaultClockIso`: `2026-11-25T12:00:00+07:00`, `remindersComputed`: `53`, `promoNovDiscountVnd`: `15000`, `icsBytes`: `1336` |
| `npm run test:video-studio` | **PASS** (exit `0`) | **16/16 checks (`T01–T16`) PASSED**: dựng 2 MP4 FAST kiểm thử riêng biệt (`720x1280` `ee5516b9bb`, `1280x720` `e3a6e00d2b`), xác thực 3 sample MP4 + `.vtt` + `.jpg` trong `manifest.json`, SQLite idempotency + atomic claim + cancel + lease expiry, Muse disabled audit, SSRF/path traversal, `.gitignore` + 0 secret, 8 `.ps1` syntax valid, SQL migration `0003` |
| `npm run build` | **PASS** (exit `0`) | Next.js `16.4.6` (Turbopack) biên dịch thành công 35 static routes + dynamic routes + 5 route `/api/video/*` |

## 2. Bộ 3 Sample MP4 kiểm định trong `public/media/studio-samples/manifest.json`

| Sample ID | Đường dẫn MP4 | Phân giải / Thời lượng | Dung lượng | Codec / PixFmt | SHA-256 (12 ký tự đầu) |
|---|---|---|---|---|---|
| `SAMPLE-P06-VI` | `/media/studio-samples/p06-buoi-tan-trieu-vi.mp4` | `720x1280` (9:16) · `15s` | `468 KB` (`479,406 B`) | `h264` / `yuv420p` / `aac` | `a7ef8ef909d5` |
| `SAMPLE-P08-VI` | `/media/studio-samples/p08-hat-dieu-xuan-loc-vi.mp4` | `720x1280` (9:16) · `15s` | `502 KB` (`515,048 B`) | `h264` / `yuv420p` / `aac` | `92fdd673ecd9` |
| `SAMPLE-TOUR01-EN` | `/media/studio-samples/tour-01-ba-tu-orchard-en.mp4` | `1280x720` (16:9) · `15s` | `518 KB` (`530,440 B`) | `h264` / `yuv420p` / `aac` | `db15a5528f59` |

## 3. Kiểm thử Playwright Chromium trên Production Build cục bộ (`http://127.0.0.1:3105`)

- **Lệnh:** `node scripts/v5-playwright-qa.mjs http://127.0.0.1:3105` → **Command exited with code 0** (`ALL PLAYWRIGHT CHECKS PASSED`)
- **Responsive (VI & EN):** Không phát sinh tràn ngang (`scrollWidth <= innerWidth + 1`) qua tất cả 8 độ rộng (`320, 375, 390, 768, 1024, 1280, 1440, 1920` px) trên 8 route cốt lõi (`/`, `/marketplace`, `/sign-in`, `/explore`, `/farms/vuon-buoi-chu-ba-minh`, `/volunteer`, `/learn`, `/farmer?mode=erp&tab=studio`).
- **Ổn định Header VI ↔ EN:** Độ lệch chiều cao `<header>` = **`0.00px`** tại `1280px` và **`0.00px`** tại `1440px`.
- **Bản đồ ngoại tuyến (`/explore`, chặn `openstreetmap.org`):** Hiển thị **`97` đường vector GeoJSON cục bộ** (95 xã/phường + đường bao Đồng Nai + inverse mask).
- **Video Studio (`/farmer?mode=erp&tab=studio`):** Video `/media/studio-samples/p06-buoi-tan-trieu-vi.mp4` trả HTTP `200` (`video/mp4`) và phát được với poster JPEG tiếng Việt sắc nét.
- **Tương tác chuyên sâu:** Mở lộ trình học 6 bước + `Mở xem tự do` + tab giải phẫu 2D 9 loại nông sản; kiểm tra thẻ `/volunteer` sạch `W02/W04`; kiểm tra mở & xóa hội thoại NaiAI.
- **Visual Inspection:** Đã đọc và kiểm tra trực tiếp bằng mắt 9 ảnh chụp Chromium (Home hero, Footer, Marketplace, Sign-in, Farm detail + Batches/Livestream, Volunteer, Explore offline map, Video Studio) + 3 poster video.

## 4. Kiểm thử Production Live (`https://naifarm.vercel.app/`)

- Đang chờ chạy sau khi đẩy commit mới lên nhánh `main` (M11–M12).
