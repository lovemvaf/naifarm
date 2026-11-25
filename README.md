# NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai (V4.0)

**Thông điệp thương hiệu:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*

Ứng dụng web thuộc bài thi **Nhóm 8 — Hackathon Thành phố Đồng Nai năm 2026**, nâng cấp lên phiên bản **NaiFarm V4.0**: thương mại điện tử nông sản OCOP song ngữ **Tiếng Việt / English (`?lang=en`)**, chuẩn hóa địa giới **95 Phường/Xã Thành phố Đồng Nai** (`25/11/2026`), trung tâm **26 chuẩn chất lượng (`Q01–Q26`)**, truy xuất phả hệ mã lô QR thực, bản đồ miệt vườn kết hợp **28 gói du lịch trải nghiệm**, học viện **Global Youth Ambassador (`20` bài học, `120` câu hỏi)**, lịch cộng đồng **NaiCalendar + xuất `.ics`**, động cơ ưu đãi/chiến dịch theo đồng hồ `Asia/Ho_Chi_Minh`, và bảng chỉ số quản trị **HTX Tân Triều ERP/CRM/BI** trên 6 không gian phân quyền (`W01–W06`).

---

## 1. Cấu trúc Không gian & Đường dẫn chính

| Nhóm / Vai trò | Đường dẫn (Routes) | Chức năng trọng tâm V4.0 |
|---|---|---|
| **Chợ công khai & Quốc tế (`W01`)** | `/`, `/marketplace`, `/market` (redirect), `/search`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/cart`, `/checkout`, `/account`, `/account/bookings/[id]`, `/account/favorites`, `/account/orders`, `/account/orders/[orderId]`, `/account/settings` | **168** mặt hàng từ **40** nhà vườn/HTX + **17** bản ghi tham khảo công bố chính thức (`OCOP_PUBLIC_REFERENCE_CATALOG`); chuyển ngữ **VI \| EN** giữ nguyên tuyến & ngữ cảnh, quy đổi ước tính USD tham khảo, hỏi nguồn hàng quốc tế/B2B (RFQ), so sánh sản phẩm, giỏ tách nhà vườn & 6 mã ưu đãi hợp lệ |
| **Truy xuất QR & Chất lượng** | `/quality`, `/policies`, `/trace`, `/trace/[batchCode]`, `/trace/scan` | Đủ **26** chuẩn (`Q01–Q26`), **80** hồ sơ chất lượng kiểm soát vòng đời & ngành hàng, sinh/quét QR PNG thực (`qrcode` + `qr-scanner` + `jsqr`), phả hệ thu hồi lô (`NF-DN-099 → NF-DN-100`) |
| **Bản đồ, Du lịch, Live & Học tập** | `/explore` (`?view=map\|tours`), `/experiences/[slug]`, `/live`, `/live/[id]`, `/learn`, `/learn/[slug]` | Leaflet OSM + GPS đường chim bay (`@turf/distance`), **28** tour + đặt ca/giám hộ trường học; `/live` công khai tách biệt `W03` (card `items-start`, chuyển góc vườn, xuất `.ics`, nhãn phát lại/dự kiến); `/learn` với flashcards lật nút, ghép đôi bàn phím, roleplay & `ProduceAnatomy2D` |
| **Lịch & Chiến dịch Văn hóa** | `/events`, `/events/[slug]` | Đồng hồ `2026-11-25T12:00:00+07:00`: tư liệu recap sau 24/11 (không đếm ngược), chiến dịch 25–30/11 kèm cờ Tổ quốc 3:2 trang trọng, sự kiện tự tổ chức 05/12, NaiCalendar xem Tháng/Tuần/Ngày/Agenda & xuất `.ics` |
| **Nhà vườn, HTX ERP & Hệ sinh thái (`W02–W06`)** | `/farmer`, `/farmer/publish`, `/volunteer`, `/coordinator`, `/organization`, `/admin`, `/sign-in`, `/sign-up`, `/demo` | Dual mode U50+ & ERP HTX Tân Triều (đối chiếu Nov vs Oct `170.000.000 đ`, sổ kho bưởi `1.650 / 1.250 kg`, AR/AP 5 kỳ, Campaign Wizard Maker ≠ Checker, tour roster, RFQ); `W03` Global Youth Ambassador; `W04` duyệt giờ 2 lớp; `W05` trường học/doanh nghiệp/logistics/đối tác; `W06` Admin + giả lập đồng hồ; `/sign-in` gồm 6 tài khoản nhanh & 15 role bundles |

---

## 2. Công nghệ sử dụng

- **Framework:** Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript `^5`
- **Styling & UI:** Tailwind CSS `4.3.3`, Google Fonts (`Be Vietnam Pro` + `Lora`), Lucide React `^1.78.0`, Motion `^14.14.0`, Recharts `^3.11.1`, Sonner `^2.0.8`
- **GIS, Search & QR:** `leaflet@1.9.4`, `react-leaflet@5.0.0`, `@turf/distance@^7.4.0`, `papaparse@^5.7.1`, `zod@^4.6.7`, `fuse.js@^7.5.0`, `qrcode@^1.5.4`, `qr-scanner@^1.4.2`, `jsqr@^1.4.0`
- **Ranh giới:** Các phân hệ lõi V4 (`W01–W06`, chợ, du lịch, học tập, NaiCalendar, BI) hoạt động hoàn toàn trên trình duyệt (không CSDL/thanh toán thật, đã loại bỏ hoàn toàn mọi thư viện 3D/WebGL); nhánh `main` đồng thời giữ lại nguyên vẹn module trợ lý giọng nói & soạn nháp từ PR #1 (`ant_speech`: `src/app/farmer/publish`, `src/lib/vietnameseNumberParser.ts`, `src/app/api/ai/asr`, `src/app/api/ai/publish-draft`).

---

## 3. Lệnh kiểm định & chạy thử

Thực hiện trong thư mục `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`:

```bash
npm install
npm run data:validate   # Kiểm định 95 Phường/Xã TP. Đồng Nai
npm run test:data       # Kiểm định 40 vườn, 168 SKU, 171 lô, 608 đơn, 28 tour, 20 bài học, 72 sự kiện lịch
npm run test:metrics    # Kiểm định BI HTX Tân Triều, sổ kho bưởi, AR/AP, Missing COGS, CSV CWE-1236
npm run test:quality    # Kiểm định 26 chuẩn Q01–Q26, 80 hồ sơ, 17 tham chiếu công bố, phả hệ thu hồi
npm run test:qr         # Sinh & giải mã ngược QR PNG qua jsQR
npm run test:i18n       # Kiểm định 234 khóa VI/EN & từ khóa tìm kiếm tiếng Anh/không dấu
npm run test:calendar   # Kiểm định đồng hồ VN, nhắc lịch D-30..D-1, promo cart & xuất .ics
npm run typecheck
npm run lint
npm run build
```

Kiểm thử trình duyệt thật Playwright + Axe (`wcag2a`/`wcag2aa`) qua `35` route và `9` kích thước (`320–1920px`) trong khi server production đang chạy ở `http://127.0.0.1:3000`:

```bash
node ".\node_modules\next\dist\bin\next" start -H 127.0.0.1 -p 3000
python tests/e2e-v4-verify.py http://127.0.0.1:3000
```

---

## 4. Tài liệu V4.0

- [Báo cáo bàn giao V4.0 (`docs/V4_FINAL_HANDOVER.md`)](docs/V4_FINAL_HANDOVER.md)
- [Báo cáo kiểm thử V4.0 (`docs/V4_TEST_REPORT.md`)](docs/V4_TEST_REPORT.md)
- [Kiểm định dữ liệu & đối chiếu HTX (`docs/V4_DATA_VALIDATION.md`)](docs/V4_DATA_VALIDATION.md)
- [Ma trận truy vết yêu cầu (`docs/V4_REQUIREMENTS_TRACEABILITY.md`)](docs/V4_REQUIREMENTS_TRACEABILITY.md)
- [Ma trận điều hướng & trạng thái (`docs/V4_NAVIGATION_MATRIX.md`)](docs/V4_NAVIGATION_MATRIX.md)
- [Lộ trình (`docs/V4_TODO.md`)](docs/V4_TODO.md) | [Gap Matrix (`docs/V4_GAP_MATRIX.md`)](docs/V4_GAP_MATRIX.md)
- [Nhật ký công cụ & kỹ năng (`docs/V4_REPO_SKILL_LOG.md`)](docs/V4_REPO_SKILL_LOG.md)
