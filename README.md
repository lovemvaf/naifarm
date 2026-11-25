# NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai (V2.0)

**Thông điệp thương hiệu:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*

Nguyên mẫu ứng dụng web Frontend-Only thuộc bài thi **Nhóm 8 — Hackathon Thành phố Đồng Nai năm 2026**, được nâng cấp lên **NaiFarm V2.0** với dữ liệu địa giới hành chính 95 Phường/Xã Thành phố Đồng Nai (mốc rà soát `25/11/2026`), bản đồ OpenStreetMap + Leaflet + GPS trình duyệt thực, mã QR tiêu chuẩn có trình quét Camera/Upload (`/trace/scan`), nhật ký mùa vụ liên kết W02–QR, hồ sơ VietGAP/OCOP minh họa trung thực và giao diện 2D nhẹ cho mọi thiết bị.

---

## 1. Cấu trúc Không gian & Đường dẫn chính

| Nhóm / Vai trò | Đường dẫn (Routes) | Chức năng trọng tâm V2.0 |
| :--- | :--- | :--- |
| **Chợ công khai & Tìm kiếm (`W01`)** | `/`, `/marketplace`, `/search`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/cart`, `/checkout`, `/account`, `/account/settings`, `/account/orders` | 103 sản phẩm (10 danh mục) từ 24 nhà vườn/HTX; Fuse.js tìm có dấu & không dấu; sổ địa chỉ 95 Phường/Xã Đồng Nai; gallery phóng to 2D & `ProduceAnatomy2D` (không còn 3D/WebGL) |
| **Truy xuất QR thực & Máy quét** | `/trace`, `/trace/scan`, `/trace/[batchCode]` | Sinh QR chuẩn (`qrcode` SVG + PNG tải xuống + in tem); quét trực tiếp từ Camera hoặc tải ảnh PNG/JPG (`qr-scanner` + `jsqr`), chặn URL ngoài/độc hại; đồng bộ Nhật ký mùa vụ & Chứng nhận VietGAP/OCOP mẫu |
| **Xác thực Trải nghiệm (Demo Auth)** | `/sign-in`, `/sign-up`, `/forgot-password` | Chế độ Khách mặc định; đăng nhập 1 chạm 6 vai trò (`W01`–`W06`) kèm menu Avatar; không lưu mật khẩu; khóa đăng ký công khai vai trò `W04`/`W05`/`W06` |
| **Bản đồ OpenStreetMap & Live** | `/explore`, `/live` | Bản đồ OpenStreetMap + Leaflet thực (`© OpenStreetMap contributors`), nút `"Vị trí của tôi"` đo khoảng cách *đường chim bay* qua `@turf/distance`, bộ lọc 95 ĐVHC & trạng thái hồ sơ Xã Phước Sơn |
| **Nhà nông U50+ (`W02`)** | `/farmer`, `/farmer/publish` | Giao diện chữ lớn, nút >=56px: xử lý 82 đơn COD Demo, mở mùa vụ & `Ghi nhật ký hôm nay` đồng bộ trực tiếp sang tem QR, khai báo VietGAP/OCOP mẫu (`DEMO-*`), xác nhận bàn giao TNV |
| **Thanh niên & Học mở (`W03`)** | `/volunteer`, `/learn` | 40 nhiệm vụ số hóa, 120 bản ghi giờ TNV, bản đồ điểm hỗ trợ; NaiAcademy với 12 bài học nông sản Đồng Nai + Quiz + Thẻ giải phẫu 2D |
| **Điều phối (`W04`), Tổ chức (`W05`), Quản trị (`W06`)** | `/coordinator`, `/organization`, `/admin`, `/demo` | Duyệt giờ 2 lớp, đối chiếu chứng từ tự khai, 10 tổ chức đối tác, 12 phiếu hỗ trợ + 16 audit logs + Hub trình diễn BGK |

---

## 2. Công nghệ sử dụng (V2.0)

- **Framework**: Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript `^5`
- **Styling & Typography**: Tailwind CSS `4.3.3`, Google Fonts (`Be Vietnam Pro` + `Lora`), token màu Warm Rice (`#F5F3E9`) + Forest Green (`#245B3D`) + Earth Ink (`#25352B`)
- **GIS & Địa giới**: `leaflet@1.9.4`, `react-leaflet@5.0.0`, `@turf/distance@7.4.0`, `papaparse@5.7.1`, `zod@4.6.7`
- **Search & QR**: `fuse.js@7.5.0`, `qrcode@1.5.4`, `qr-scanner@1.4.2`, `jsqr@1.4.0` (đã gỡ bỏ hoàn toàn `three`, `@react-three/fiber`, `@react-three/drei`)

---

## 3. Lệnh kiểm định & chạy thử

Thực hiện trong thư mục `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`:

```bash
npm install
npm run data:validate   # Kiểm định 95 Phường/Xã TP. Đồng Nai (25/11/2026)
npm run test:data       # Kiểm định khóa ngoại & ảnh cho toàn bộ mock data
npm run test:qr         # Sinh ảnh QR PNG và kiểm tra giải mã jsQR + bảo mật URL
npm run typecheck
npm run lint
npm run build
```

Khởi chạy server cục bộ tại `http://127.0.0.1:3000`:

```bash
npm run start -- -H 127.0.0.1 -p 3000
```

---

## 4. Tài liệu V2.0

- [Báo cáo kiểm thử V2.0 (`docs/V2_TEST_REPORT.md`)](docs/V2_TEST_REPORT.md)
- [Báo cáo bàn giao V2.0 (`docs/V2_FINAL_HANDOVER.md`)](docs/V2_FINAL_HANDOVER.md)
- [Kiểm định dữ liệu địa giới (`docs/ADMINISTRATIVE_DATA_VALIDATION.md`)](docs/ADMINISTRATIVE_DATA_VALIDATION.md)
- [Nguồn gốc dữ liệu bản đồ (`docs/GIS_DATA_PROVENANCE.md`)](docs/GIS_DATA_PROVENANCE.md)
- [Danh mục dữ liệu mô phỏng (`docs/MOCK_DATA_MANIFEST.md`)](docs/MOCK_DATA_MANIFEST.md)
