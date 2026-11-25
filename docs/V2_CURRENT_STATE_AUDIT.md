# NaiFarm V2.0 — Current State & Baseline Visual Audit

Kiểm toán thực tế từ source code V1 (`be073fb`) và bộ ảnh chụp baseline tại `docs/screenshots/before/` (desktop `1440×900` và mobile `390×844` ở 7 route cốt lõi).

## 1. Các lỗi P0 (Nghiêm trọng — Phải xử lý triệt để)

1. **Tồn tại 3D nặng & trái phạm vi V2.0:**
   - Thư viện `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` còn trong `package.json`.
   - Route `/products/[slug]` (`product_detail.png`), `/learn` (`learn.png`), `/volunteer` (`volunteer.png`), `AppHeader` (`Học & 3D`), `AppFooter` vẫn chứa component/label 3D (`PomeloViewer3D*`, `has3DViewer`, `"Mô hình 3D Bưởi Tân Triều"`).
2. **Bản đồ & Địa giới hành chính chưa đạt chuẩn dữ liệu 25/11/2026:**
   - `/explore` (`before/desktop/explore.png`) dùng bản đồ SVG/CSS giả lập thay cho bản đồ OpenStreetMap/Leaflet thực và không có nút GPS trình duyệt thực hay đo khoảng cách Turf.
   - Dữ liệu V1 còn nhãn cấp huyện cũ (`H. Vĩnh Cửu`, `Vĩnh Cửu / Tân Triều`, `Cẩm Mỹ & Định Quán`), chưa gắn với bảng chuẩn 95 ĐVHC Thành phố Đồng Nai ngày 25/11/2026 (`33` phường, `62` xã, mã cha `75`) và chưa thể hiện đúng trạng thái hồ sơ đề xuất điều chỉnh của Xã Phước Sơn (`386,56 km²` hiện trạng vs `659,163 km²` đề xuất chờ quyết định).
3. **Global Search & Điều hướng Header chưa chuẩn sàn TMĐT:**
   - `AppHeader.tsx` không có thanh tìm kiếm toàn cục (`/search`), mục điều hướng bị xuống 2 dòng trên desktop (`Chợ / OCOP`, `Bản đồ & Nhà / vườn`), lộ bộ chuyển Role `W01..W06` ngay trên header khách vãng lai, chưa có nút `Đăng nhập` / `Đăng ký` và menu Avatar chuẩn.
4. **Thiếu luồng quét QR thực tế & bộ chứng từ VietGAP/OCOP – Nhật ký mùa vụ liên kết:**
   - Chưa có trang `/trace/scan` hỗ trợ camera/tải ảnh/nhập tay với kiểm tra URL chặt chẽ; chưa có chứng nhận `DEMO-VG-*` / `DEMO-OCOP-*` và Nhật ký mùa vụ liên kết chặt từ W02 sang ProductBatch & QR Passport.

## 2. Các lỗi P1 (Quan trọng về UX & Tính đầy đủ)

1. **Dữ liệu mô phỏng quá mỏng cho trình diễn toàn diện:** V1 mới có 4 nhà vườn, ít sản phẩm/mùa vụ/lô hàng; chưa phủ các khu vực từ Bắc đến Nam Thành phố Đồng Nai (Long Khánh, Trấn Biên, Tân Triều, Định Quán, Xuân Lộc, Cẩm Mỹ, Bình Phước, Đồng Xoài, Phước Long, Đắk Ơ, Đak Lua, Phước Sơn...).
2. **Thiếu hệ thống Auth UI Demo chuẩn (`/sign-in`, `/sign-up`, `/forgot-password`, `/account`, `/account/settings`)** với 6 tài khoản Demo 1-click và khóa không cho đăng ký công khai vai trò Admin/Kiểm duyệt.
3. **Footer (`AppFooter.tsx`)** chỉ có 3 cột, chưa đủ 4 nhóm cấu trúc chuẩn (Thương hiệu, Mua sắm, Cộng đồng, Hỗ trợ) và chưa ghi rõ nguồn dataset địa giới 25/11/2026.

## 3. Các điểm tốt V1 cần giữ & phát huy

- Golden Dataset **Nhà vườn Ba Tư** (`farm-ba-tu-demo`, `26080` Phường Long Khánh, `2.5 ha`), 5 sản phẩm cốt lõi (`P01`–`P05`), luồng `W01–W02–W03–W04` liên hoàn (`NF-DEMO-001`, `NF-ORD-DEMO-01`, `NF-MIS-01`), bảng màu Warm Rice (`#F5F3E9`) + Forest Green (`#245B3D`) và `DemoStoreContext` dùng `useSyncExternalStore` không gây lỗi hydration.
- Bộ 66 ảnh Stitch thực tế trong `public/images/stitch/` cần được chọn lọc kỹ để tránh dùng ảnh có chữ AI lỗi trên sản phẩm hero mới.
