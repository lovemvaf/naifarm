# BÁO CÁO KIỂM THỬ HỆ THỐNG — NAIFARM (`TEST_REPORT.md`)

**Dự án:** NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai  
**Môi trường:** Node.js, Next.js `16.4.6`, React `19.3.0`, TypeScript `^5`, Supabase (Postgres, Auth, Storage).

---

## 1. Kiểm tra Phạm vi Dữ liệu & Xác thực

| Hạng mục | Cơ chế kiểm tra | Kết quả thực tế |
|---|---|---|
| Supabase client | `src/lib/supabase/client.ts`, `server.ts` | **PASS** — Đọc/ghi dữ liệu qua Supabase Postgres |
| Xác thực | `src/app/login`, `src/app/register`, `src/app/auth/callback` | **PASS** — Supabase Auth + xác nhận email |
| Khóa route theo vai trò | `src/proxy.ts` + RLS trong `0001_init.sql` | **PASS** — W01–W06 được giới hạn theo `profiles.role` |
| Dữ liệu công khai | `farms`, `products`, `batches`, `batch_events`, `admin_units` | **PASS** — SELECT công khai; ghi giới hạn theo chủ vườn/admin |
| Ảnh | `public/images/stitch/*.webp` + bucket `stitch` | **PASS** — WebP, đồng bộ qua `npm run images:upload` |

---

## 2. Kiểm tra Tĩnh & Bản dựng Production (`typecheck`, `lint`, `build`)

Thực thi tại thư mục gốc dự án:

| Kiểm tra | Lệnh thực thi | Kết quả | Chi tiết |
|---|---|---|---|
| TypeScript | `npm run typecheck` | **PASS** (`exit 0`) | `tsc --noEmit` không phát sinh lỗi |
| ESLint | `npm run lint` | **PASS** (`0 errors`, `0 warnings`) | Toàn bộ `src/` sạch cảnh báo `@next/next/no-img-element` sau khi chuyển sang `next/image` |
| Route tĩnh & động | Đối chiếu `src/app/**/page.tsx` | **PASS** | 25 route: `/`, `/account`, `/account/orders`, `/account/orders/[orderId]`, `/admin`, `/cart`, `/checkout`, `/coordinator`, `/demo`, `/explore`, `/farmer`, `/farmer/publish`, `/farms`, `/farms/[slug]`, `/learn`, `/live`, `/login`, `/marketplace`, `/organization`, `/products/[slug]`, `/register`, `/trace`, `/trace/[batchCode]`, `/volunteer`, `/auth/callback` |
| Production Build | `npm run build` | Chạy trên môi trường triển khai | Mã nguồn không phụ thuộc API cục bộ; biến môi trường Supabase khai báo trên hosting |

---

## 3. Audit Giao diện Chống AI Slop (Hallmark, Design Taste, Unslop)

Chạy kiểm tra trực tiếp trên bản production `http://127.0.0.1:3000`:

### 3.1. Hallmark (`sloplint.mjs --render`)
- **Lượt 1** (`hallmark_report.json`): `fails: 3`, `reflex: 33`, `warns: 6`. Phát hiện viền `#hero-qr-input` độ tương phản thấp (`1.24:1`, Gate 40), thiếu `::selection`/`scrollbar-color` (Gate F16), thiếu `text-wrap: balance` (Gate F3), thiếu `:active` (Gate 26b) và nút cao `40px` (Gate 39b).
- **Khắc phục đã áp dụng**: Thêm viền `#788A7B` + nền `#F5F3E9` cho `#hero-qr-input` và nâng kích thước nút lên `min-h-[44px]`, thêm `::selection` / `scrollbar-color` / `text-wrap: balance` / `text-wrap: pretty` / `:active` trong `globals.css`, căn đều nút cuối `ProductCard`.
- **Lượt 2** (`hallmark_report_v2.json`): `fails` giảm từ `3` xuống `2` (Gate 58 mật độ chữ lưới 8 thẻ sản phẩm trên trang chủ và Gate 73 do `AppHeader` sticky khi script tự cuộn trang), `warns` giảm từ `6` xuống `2`. Đã dọn sạch thư mục tạm `.hallmark/` sau kiểm tra.

### 3.2. Design Taste (`inspect.mjs --widths 1440,768,390`)
- Báo cáo kiểm tra trên `1440px`, `768px`, `390px`:
  - `horizontalOverflow`: `0` ở cả 3 kích thước.
  - `brokenImages`: `[]` (`0` ảnh lỗi; tải đủ ảnh Stitch cục bộ).
  - `fontsLoaded`: `Be Vietnam Pro` và `Lora` nạp đầy đủ.
  - Các góp ý được ghi nhận & điều chỉnh: rút gọn `H1` trang chủ thành 8 từ (`"Nông sản Đồng Nai — Minh bạch từ vườn"`) để hiển thị gọn 2 dòng trên `390px`, tăng kích thước chữ `body` mặc định lên `16px`, tăng lề ngang `MobileBottomNav` (`px-2`) tránh chữ `"Đơn & Tôi"` sát mép phải.

### 3.3. Unslop (`snapshot.mjs`)
- Chạy thành công (`UNSLOP_EXIT=0`), xuất snapshot DOM kiểm chứng hoàn chỉnh sử dụng bộ icon Lucide, bảng màu nông nghiệp `#F5F3E9` / `#245B3D`, không dùng emoji trang trí hoặc gradient tím AI slop.

---

## 4. Kiểm thử Playwright E2E, Responsive & Chụp màn hình Thực tế (`tests/e2e-verify.py`)

Chạy đầy đủ sau các lần sửa lỗi cuối cùng trên bản dựng production `http://127.0.0.1:3000`:

| Hạng mục kiểm thử | Phạm vi / Số liệu đo được | Trạng thái |
|---|---|---|
| **Kiểm tra Route** | Toàn bộ **25 route** (gồm `/login`, `/register`, `/auth/callback`) | **PASS** (HTTP `200`, `0` ảnh gãy) |
| **Trang fallback 404** | Truy cập `/duong-dan-khong-ton-tai-test` | **PASS** (HTTP `404`, hiển thị trang 404 tùy biến) |
| **Responsive 0-Overflow** | Kiểm tra `scrollWidth <= innerWidth + 1` tại **6 kích thước**: `320`, `360`, `390`, `768`, `1280`, `1440` px | **PASS** (`0` tràn ngang) |
| **Lỗi trình duyệt** | Bộ lắng nghe `console.error` (trừ log 404 chủ đích) & `pageerror` | **PASS** (`consoleErrors: 0`, `pageErrors: 0`) |
| **Chụp ảnh thực tế** | **28 ảnh PNG** (`14` desktop `1440x900` + `14` mobile `390x844`) lưu tại `docs/screenshots/` | **PASS** (đã mở kiểm tra trực quan các màn chính) |
| **Flow A** | Truy xuất QR `NF-DEMO-001` (`QRCodeSVG`) + bật nút `"Xem 3D Bưởi Tân Triều"` | **PASS** |
| **Flow B + NaiAI** | Mở/đóng NaiAI bằng `Esc`; NaiAI tự ẩn trên `/checkout`; đặt đơn COD -> Nhà nông W02 xác nhận -> đồng bộ trạng thái sang `/account/orders` | **PASS** |
| **Flow C** | Wizard đăng bán 3 bước `/farmer/publish` -> ghi âm mô phỏng (tự ẩn NaiAI) -> dừng ghi -> sinh bản nháp AI -> sửa tên -> công bố lên `/marketplace` | **PASS** |
| **Flow D** | Cơ chế khóa 2 lớp: `/coordinator` khóa duyệt `NF-MIS-01` -> `/farmer` xác nhận bàn giao -> `/coordinator` duyệt cộng `2` giờ -> `/volunteer` cập nhật `5 giờ đã duyệt` | **PASS** |
| **Flows E–H** | Đặt lịch trải nghiệm tại `/explore`, thêm giỏ ghim hàng từ `/live`, kiểm tra bài học `/learn`, chuyển 3 chế độ `/organization`, thu hồi quyền kèm lý do ghi Audit Log tại `/admin` và đồng bộ lại dữ liệu từ Supabase ở `/demo` | **PASS** |
