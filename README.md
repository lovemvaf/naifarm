# NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai

**Thông điệp thương hiệu:** _Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị._

NaiFarm là nền tảng Chợ OCOP Thanh niên cho Thành phố Đồng Nai: nhà vườn tự đăng bán nông sản, thanh niên tình nguyện hỗ trợ số hóa, điều phối viên đối chiếu hồ sơ, tổ chức/HTX gom lô và khách hàng đặt nông sản COD. Dữ liệu vận hành được lưu trên **Supabase** (Postgres + Auth + Storage); chatbot NaiAI và phòng OCOP Live là phần trình diễn phía client.

---

## 1. Cấu trúc Không gian & Đường dẫn chính

| Nhóm / Vai trò | Đường dẫn (Routes) | Chức năng trọng tâm |
|---|---|---|
| **Public & Mua sắm (`W01`)** | `/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/cart`, `/checkout`, `/account`, `/account/orders` | Chợ OCOP 60/40 editorial, lọc theo danh mục & mùa vụ, hồ sơ nhà vườn, hộ chiếu mã QR, đặt hàng COD, theo dõi đơn |
| **Bản đồ & OCOP Live** | `/explore`, `/live` | Bản đồ Leaflet + GeoJSON ranh giới Thành phố Đồng Nai (không dùng tile OpenStreetMap) và đặt lịch trải nghiệm; phòng phát lại minh họa 3 góc quay |
| **Nhà nông (`W02`)** | `/farmer`, `/farmer/publish` | Xử lý đơn hàng, ghi nhật ký mùa vụ, xác nhận bàn giao từ TNV, đăng bán 3 bước (ảnh + giọng nói mô phỏng + nhập tay) |
| **Thanh niên & Học mở (`W03`)** | `/volunteer`, `/learn` | Bảng nhiệm vụ số hóa, nộp minh chứng, OCOP Youth Impact Pass tách *Giờ đã duyệt* / *Giờ chờ duyệt*; bài học Hạt điều, Quiz và mô hình 3D Bưởi Tân Triều |
| **Điều phối cơ sở (`W04`)** | `/coordinator` | Điều phối hỗ trợ, đối chiếu chứng từ tự khai (không cấp chứng nhận OCOP), khóa duyệt giờ 2 lớp `farm_accepted`, biểu đồ Recharts |
| **Tổ chức & Đối tác (`W05`)** | `/organization` | HTX gom lô, Doanh nghiệp B2B gửi RFQ, Nhà trường *Farm as a Classroom* |
| **Quản trị (`W06`)** | `/admin` | Ma trận phân quyền có thời hạn & phạm vi đơn vị, Nhật ký kiểm toán append-only |
| **Giám khảo & Trình diễn** | `/demo` | Hub điều hướng Flows A–H, bảng đối chiếu 12 màn hình Stitch + Blueprint V3 |
| **Xác thực** | `/login`, `/register`, `/auth/callback` | Đăng nhập / đăng ký Supabase Auth, xác nhận email, khóa route theo vai trò |

---

## 2. Công nghệ sử dụng

- **Framework**: Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript `^5`
- **Backend**: Supabase Postgres + Row Level Security, Supabase Auth (email confirmation), Supabase Storage (`stitch`, `product-images`, `evidence`)
- **Bản đồ**: `leaflet` + `react-leaflet` + GeoJSON nội bộ (`public/geo/`), không tải tile từ OpenStreetMap
- **Styling & Typography**: Tailwind CSS `4.3.3`, Google Fonts (`Be Vietnam Pro` + `Lora`), token màu `#245B3D`, `#F5F3E9`, `#6C9C5B`, `#D7A34D`, `#25352B`
- **UI, Motion & Visualization**: `lucide-react`, `motion`, `sonner`, `qrcode.react`, `recharts`, `three` + `@react-three/fiber` + `@react-three/drei`
- **Ảnh**: toàn bộ ảnh Stitch được nén sang WebP (`public/images/stitch/*.webp`) và đồng bộ lên Supabase Storage

---

## 3. Cấu hình Supabase & Triển khai

### 3.1. Biến môi trường

Sao chép `.env.example` thành `.env.local` (hoặc khai báo trực tiếp trên hosting):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng cho script upload ảnh, không được đưa vào mã chạy trên trình duyệt.

### 3.2. Khởi tạo cơ sở dữ liệu

Chạy lần lượt trong SQL Editor của Supabase:

1. `supabase/migrations/0001_init.sql` — enums, bảng, trigger, RLS, bucket Storage.
2. `supabase/migrations/0002_seed.sql` — 8 đơn vị hành chính, 4 nhà vườn, 12 sản phẩm, lô QR, nhiệm vụ, hồ sơ, RFQ và 10 tài khoản demo.

### 3.3. Tài khoản demo

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

### 3.4. Bật xác nhận email

Trong Supabase Dashboard → **Authentication → Providers → Email**: bật _Confirm email_. Thêm URL triển khai vào **Site URL** và **Redirect URLs**:

```text
https://<ten-mien-trien-khai>/auth/callback
```

### 3.5. Upload ảnh

```bash
npm run images:upload
```

Script đọc `public/images/stitch/*.webp` và upload vào bucket công khai `stitch` bằng service role key.

### 3.6. Kiểm tra mã nguồn

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

---

## 4. Dữ liệu & Phân quyền

- `profiles.role` gồm `customer`, `farmer`, `volunteer`, `coordinator`, `organization`, `admin`.
- Đăng ký công khai chỉ được chọn `customer`, `farmer`, `volunteer`, `organization`; `coordinator` và `admin` do quản trị cấp.
- `src/proxy.ts` chặn `/account`, `/cart`, `/checkout` khi chưa đăng nhập và khóa `/farmer`, `/volunteer`, `/coordinator`, `/organization`, `/admin` theo vai trò.
- RLS giới hạn đơn hàng, giỏ hàng, nhiệm vụ, hồ sơ và quyền quản trị theo `auth.uid()` và chủ vườn.
- Chatbot NaiAI (`NaiAIFloatingChat`, `ai-scripts.ts`) và OCOP Live (`/live`, `livestreams.ts`) là demo phía client, không ghi cơ sở dữ liệu.

---

## 5. Tài liệu tham chiếu nội bộ

- [Báo cáo kiểm thử (`docs/TEST_REPORT.md`)](docs/TEST_REPORT.md)
- [Tài liệu bàn giao (`docs/FINAL_HANDOVER.md`)](docs/FINAL_HANDOVER.md)
- [Ánh xạ Stitch & Route (`docs/SCREEN_ROUTE_MAPPING.md`)](docs/SCREEN_ROUTE_MAPPING.md)
- [Hướng dẫn giao diện & screenshots (`docs/NAIFARM_GIAO_DIEN_UI.pdf`)](docs/NAIFARM_GIAO_DIEN_UI.pdf)
- [Design System (`DESIGN.md`)](DESIGN.md)