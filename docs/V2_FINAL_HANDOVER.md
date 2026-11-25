# NAIFARM V2.0 — TÀI LIỆU BÀN GIAO (FINAL HANDOVER)

- **Sản phẩm:** NaiFarm — Chợ OCOP Thanh niên (*Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị*)
- **Đội thi:** Group 8 — Hackathon Thành phố Đồng Nai 2026
- **Kiến trúc:** Frontend-Only Prototype (`Next.js 16.4.6` App Router, React, TypeScript, Tailwind CSS, `localStorage` DemoStore — không backend, không database, không lộ API key)
- **Repository:** `https://github.com/lovemvaf/naifarm` (branch `main`)
- **Production URL:** `https://naifarm.vercel.app/`

---

## 1. Những nâng cấp cốt lõi trong V2.0

1. **Loại bỏ 100% 3D / WebGL & Chuyển sang 2D chuẩn xác:**
   - Gỡ bỏ `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` và xóa `PomeloViewer3D` / `has3DViewer`.
   - Thay thế bằng [ProductGallery2D.tsx](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/src/components/products/ProductGallery2D.tsx) và [ProduceAnatomy2D.tsx](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/src/components/products/ProduceAnatomy2D.tsx), đồng bộ điều hướng `Học tập` (`/learn`).
2. **Dữ liệu Địa giới hành chính Đồng Nai chính thức (25/11/2026):**
   - Tích hợp từ CSV gốc [Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/data/raw/Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv) qua script import & Zod validator: `95` đơn vị (`33` Phường, `62` Xã, mã tỉnh `75`), `10` xã nâng cấp phường năm 2026, chuẩn hóa thông tin `Xã Phước Sơn (25420)` (`386.56 km²` hiện hữu / `659.163 km²` đề xuất chờ quyết định).
   - Không bịa đặt tọa độ hay ranh giới GIS (`trang_thai_gis = chua_xac_minh_toa_do_va_polygon` — chi tiết tại [GIS_DATA_PROVENANCE.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/GIS_DATA_PROVENANCE.md) và [ADMINISTRATIVE_DATA_VALIDATION.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/ADMINISTRATIVE_DATA_VALIDATION.md)).
3. **Bản đồ OpenStreetMap + Leaflet + GPS & Tính khoảng cách:**
   - Xây dựng cụm bản đồ [src/components/map/](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/src/components/map/NaiFarmMapHost.tsx) với Leaflet `1.9.4` + React Leaflet `5.0.0`, GPS trình duyệt hoặc chọn vị trí thủ công, và tính khoảng cách đường chim bay bằng `@turf/distance` trên `/explore`, `/farms/[slug]`, `/trace/[batchCode]`, `/volunteer`.
4. **Hộ chiếu QR thật & Đồng bộ Nhật ký mùa vụ — VietGAP/OCOP:**
   - Dùng `qrcode`, `qr-scanner` và `jsqr` sinh mã QR thực tế cho từng lô hàng ([trace-url.ts](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/src/lib/qr/trace-url.ts)) và trang quét cam/ảnh `/trace/scan` có kiểm soát URL an toàn.
   - Nhật ký mùa vụ Nhà nông (`W02`) trong `DemoStoreContext` cập nhật trực tiếp lên timeline của `/trace/[batchCode]` cùng 24 chứng nhận VietGAP/OCOP qua 7 trạng thái.
5. **Khách mặc định (Guest-first), Đăng nhập / Đăng ký, Tìm kiếm toàn cục & Bộ dữ liệu quan hệ phong phú:**
   - Mặc định mở trang ở vai trò Khách (`authUser: null`), cung cấp `/sign-in`, `/sign-up` (chỉ mở đăng ký công khai cho `W01–W03`, chặn `W04–W06`), `/forgot-password`, `/account`, `/account/settings`, và 1-click Demo Role Switcher tại `/demo`.
   - Tìm kiếm toàn cục `Fuse.js` tại `/search` loại trừ dữ liệu nội bộ W06.
   - Toàn bộ chi tiết dữ liệu xem tại [MOCK_DATA_MANIFEST.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/MOCK_DATA_MANIFEST.md).

---

## 2. Tài liệu kỹ thuật liên quan

- [V2_CURRENT_STATE_AUDIT.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/V2_CURRENT_STATE_AUDIT.md) — Kiểm kê hiện trạng V1 trước nâng cấp.
- [V2_IMPLEMENTATION_PLAN.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/V2_IMPLEMENTATION_PLAN.md) & [V2_TODO.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/V2_TODO.md) — Kế hoạch và tiến độ V2.0 (`100%` hoàn tất).
- [REPOSITORY_USAGE_MATRIX.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/REPOSITORY_USAGE_MATRIX.md) — Ma trận phân loại công cụ/thư viện được sử dụng.
- [V2_TEST_REPORT.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/V2_TEST_REPORT.md) — Báo cáo kiểm thử đầy đủ sau build cuối.
- [SKILL_EXECUTION_LOG.md](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/SKILL_EXECUTION_LOG.md) — Nhật ký thực thi quy trình & kỹ năng.

---

## 3. Hướng dẫn chạy kiểm tra nhanh

```bash
npm install
npm run data:validate
npm run test:data
npm run test:qr
npm run typecheck
npm run lint
npm run build
```

Để chạy bản xem trước sản phẩm:

```bash
npm run start
```
