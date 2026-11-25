# NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai (V3.0)

**Thông điệp thương hiệu:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*

Ứng dụng web thuộc bài thi **Nhóm 8 — Hackathon Thành phố Đồng Nai năm 2026**, nâng cấp lên phiên bản **NaiFarm V3.0** kết nối thương mại nông sản OCOP, chuẩn hóa địa giới hành chính **95 Phường/Xã Thành phố Đồng Nai**, trung tâm đối chiếu **26 chuẩn chất lượng (`Q01–Q26`)**, truy xuất phả hệ mã lô QR thực, quản trị nhà vườn U50+ kiêm bộ công cụ Hợp tác xã (tồn kho FEFO, gom lô, tài chính nội bộ) và phân quyền Maker ≠ Checker across 6 không gian (`W01–W06`)..

---

## 1. Cấu trúc Không gian & Đường dẫn chính

| Nhóm / Vai trò | Đường dẫn (Routes) | Chức năng trọng tâm V3.0 |
|---|---|---|
| **Chợ công khai & Tham khảo (`W01`)** | `/`, `/marketplace`, `/search`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[orderId]`, `/account/settings` | **116** mặt hàng từ **30** nhà vườn/HTX + **17** bản ghi tham khảo công bố chính thức (`OCOP_PUBLIC_REFERENCE_CATALOG`, chỉ đọc, không giá/giỏ ảo); 6 tab bộ sưu tập (`Mùa vụ`, `Đặt trước`, `NaiBox 95`, `NaiRescue`, `Danh mục OCOP tham khảo`), so sánh 3 SP, khóa lô tạm giữ/thu hồi, đặt hàng tách nhà vườn (95 ĐVHC Đồng Nai hoặc ngoài tỉnh), hoàn tiền & đánh giá gắn đơn hoàn thành |
| **Trung tâm Chất lượng & Chính sách** | `/quality`, `/policies` | Đủ **26** loại tiêu chuẩn (`Q01–Q26`), **34** hồ sơ với kiểm soát vòng đời & phạm vi (`evaluateCredentialDisplay`), Drawer xem bằng chứng/nguồn S01–S23, công bố quy ước vận hành minh bạch |
| **Truy xuất QR & Phả hệ lô** | `/trace`, `/trace/[batchCode]`, `/trace/scan` | Sinh QR chuẩn (`qrcode` SVG/PNG), quét trực tiếp từ camera hoặc ảnh tải lên (`qr-scanner` + `jsqr`), xem phả hệ lô cha-con (`NF-DN-099 → NF-DN-100`), lọc bỏ sự kiện nội bộ khỏi màn công khai |
| **Bản đồ & Phát sóng vườn** | `/explore`, `/live` | Leaflet OSM + GPS đường chim bay (`@turf/distance`), nhãn `Vị trí gần đúng theo vùng`, lịch livestream phát lại minh họa & ghim nông sản |
| **Nhà vườn U50+ & Quản trị HTX (`W02`)** | `/farmer`, `/farmer/publish` | 2 chế độ chuyển 1 chạm: **Nhà vườn gọn (Chữ to)** giữ trải nghiệm U50+ & đăng bán 3 bước; **Quản trị HTX & Kinh doanh** gồm 7 phân hệ (19 chỉ số tách GMV/Net Sales, tồn kho lô FEFO, thu mua PO, gom lô pooling & đối soát Maker ≠ Checker, xuất CSV UTF-8 BOM) |
| **Thanh niên & Học mở (`W03`)** | `/volunteer`, `/learn` | Tách *Nhiệm vụ đang mở* vs *Nhiệm vụ đã tham gia*, lọc xã/phường & thời lượng, bảo vệ đồng thuận dưới 18 tuổi, NaiPass in/CSV, 12 bài học 2D & `ProduceAnatomy2D` |
| **Điều phối (`W04`), Tổ chức (`W05`), Quản trị (`W06`)** | `/coordinator`, `/organization`, `/admin`, `/demo` | Duyệt giờ 2 lớp chống tự duyệt, `ScopeSelector` 95 ĐVHC, 6+ loại hình tổ chức W05 (`coop`, `school`, `b2b`, `sponsor`, `logistics`, `mentor`, `authority`), Admin Command Center 8 phân hệ + GIS Data Center (`0/95` polygon, Phước Sơn `386.56` vs `659.163 km²`), `/demo` (`Truy cập nhanh`, `noindex`) |

---

## 2. Công nghệ sử dụng

- **Framework:** Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript `^5`
- **Styling & UI:** Tailwind CSS `4.3.3`, Google Fonts (`Be Vietnam Pro` + `Lora`), Lucide React, Recharts `3.11.1`, Sonner
- **GIS, Search & QR:** `leaflet@1.9.4`, `react-leaflet@5.0.0`, `@turf/distance@7.4.0`, `papaparse@5.7.1`, `zod@4.6.7`, `fuse.js@7.5.0`, `qrcode@1.5.4`, `qr-scanner@1.4.2`, `jsqr@1.4.0` (không sử dụng 3D/WebGL, không dùng backend/API routes)

---

## 3. Lệnh kiểm định & chạy thử

Thực hiện trong thư mục `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`:

```bash
npm install
npm run data:validate   # Kiểm định 95 Phường/Xã TP. Đồng Nai
npm run test:data       # Kiểm định 30 vườn, 116 SKU, 119 lô, 168 đơn, 65 ảnh, 0 API/3D/secrets
npm run test:metrics    # Kiểm định 19 chỉ số kinh doanh, Missing COGS, Internal Transfer, CSV CWE-1236
npm run test:quality    # Kiểm định 26 chuẩn Q01–Q26, 17 tham chiếu công bố, phả hệ thu hồi NF-DN-099->100
npm run test:qr         # Sinh & giải mã ngược QR PNG qua jsQR
npm run typecheck
npm run lint
npm run build
```

Khởi chạy bản production cục bộ tại `http://127.0.0.1:3000`:

```bash
node ".\node_modules\next\dist\bin\next" start -H 127.0.0.1 -p 3000
```

---

## 4. Tài liệu V3.0

- [Báo cáo bàn giao V3.0 (`docs/V3_HANDOVER.md`)](docs/V3_HANDOVER.md)
- [Báo cáo kiểm thử V3.0 (`docs/V3_TEST_REPORT.md`)](docs/V3_TEST_REPORT.md)
- [Nguồn gốc dữ liệu, Chất lượng & GIS (`docs/DATA_QUALITY_PROVENANCE.md`)](docs/DATA_QUALITY_PROVENANCE.md)
- [Ma trận phân quyền (`docs/ROLE_CAPABILITY_MATRIX.md`)](docs/ROLE_CAPABILITY_MATRIX.md)
- [Từ điển chỉ số kinh doanh (`docs/METRICS_DICTIONARY.md`)](docs/METRICS_DICTIONARY.md)
- [Lộ trình & Gap Matrix V3 (`docs/V3_TODO.md`)](docs/V3_TODO.md) | [`docs/GAP_MATRIX.md`](docs/GAP_MATRIX.md)
- [Nhật ký thực thi kỹ năng (`docs/SKILL_EXECUTION_LOG.md`)](docs/SKILL_EXECUTION_LOG.md)

## 5. Cấu hình Supabase & Triển khai

### 5.1. Biến môi trường

Sao chép `.env.example` thành `.env.local` (hoặc khai báo trực tiếp trên hosting):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng cho script upload ảnh, không được đưa vào mã chạy trên trình duyệt.

### 5.2. Khởi tạo cơ sở dữ liệu

Chạy lần lượt trong SQL Editor của Supabase:

1. `supabase/migrations/0001_init.sql` — enums, bảng, trigger, RLS, bucket Storage.
2. `supabase/migrations/0002_seed.sql` — 8 đơn vị hành chính, 4 nhà vườn, 12 sản phẩm, lô QR, nhiệm vụ, hồ sơ, RFQ và 10 tài khoản demo.

### 5.3. Tài khoản demo

Mật khẩu chung: `naifarm123`

| Email | Vai trò |
|---|---|
| `customer@naifarm.vn` | Khách mua (W01) |
| `farmer.batu@naifarm.vn` | Nhà nông (W02) |
| `farmer.baminh@naifarm.vn` | Nhà nông (W02) |
| `farmer.cotu@naifarm.vn` | Nhà nông (W02) |
| `farmer.htx@naifarm.vn` | Nhà nông / HTX (W02) |
| `volunteer@naifarm.vn` | Tình nguyện viên (W03) |
| `volunteer.an@naifarm.vn` | Tình nguyện viên (W03) |
| `coordinator@naifarm.vn` | Điều phối viên (W04) |
| `org@naifarm.vn` | Tổ chức / HTX (W05) |
| `admin@naifarm.vn` | Quản trị viên (W06) |

### 5.4. Bật xác nhận email

Trong Supabase Dashboard → **Authentication → Providers → Email**: bật _Confirm email_. Thêm URL triển khai vào **Site URL** và **Redirect URLs**:

```text
https://<ten-mien-trien-khai>/auth/callback
```

### 5.5. Upload ảnh

```bash
npm run images:upload
```

Script đọc `public/images/stitch/*.webp` và upload vào bucket công khai `stitch` bằng service role key.

### 5.6. Kiểm tra mã nguồn

```bash
npm install
npm run typecheck
npm run lint
npm run build
```
