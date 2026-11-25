# NAIFARM V3.0 — GAP MATRIX & ROUTE/BENCHMARK RESOLUTION

Ngày cập nhật: 25/11/2026 | Đối chiếu Baseline V2 (`f7bd4a6`) với phiên bản hoàn thiện V3.0 sau kiểm thử.

## 1. Bảng ánh xạ Route & Trạng thái hoàn thành V3

| Route | Bối cảnh V3 | Nâng cấp đã triển khai | Verification Status |
|---|---|---|---|
| `/` | Trang chủ công khai | Clean copy, ô tìm kiếm nhanh QR (`NF-DEMO-001`), 10 danh mục lọc, live strip | `VERIFIED PASS` |
| `/marketplace` | Chợ OCOP & Tham khảo | 6 tab bộ sưu tập (Mùa vụ, Đặt trước, NaiBox 95, NaiRescue, Danh mục OCOP tham khảo read-only), lọc vùng/ngành, so sánh 3 SP, Vừa xem | `VERIFIED PASS` |
| `/products/[slug]` | Chi tiết nông sản | Biến thể quy cách, khóa giỏ khi lô `quarantine`/`recalled`/`expired`, chứng nhận lọc `evaluateCredentialDisplay` mở drawer, đánh giá từ đơn hoàn thành, `getRelatedProducts`, 2D gallery + anatomy | `VERIFIED PASS` |
| `/cart` & `/checkout` | Giỏ & Đặt hàng | Nhóm giỏ theo từng nhà vườn, mã ưu đãi `NAIFARM10`/`MUAVU20`, chọn Trong tỉnh (95 ĐVHC) hoặc Ngoài tỉnh, thông báo gọn không gian trải nghiệm | `VERIFIED PASS` |
| `/account/orders`, `[orderId]` | Đơn hàng & Hoàn tiền | Lọc trạng thái, Mua lại, Hủy đơn, Đề xuất hoàn tiền một phần/toàn phần qua Maker-Checker, Gửi đánh giá khi hoàn thành | `VERIFIED PASS` |
| `/explore`, `/farms`, `[slug]` | Bản đồ & Nhà vườn | 30 nhà vườn thuộc 95 ĐVHC, nhãn `Vị trí gần đúng theo vùng`, giữ attribution `© OpenStreetMap contributors`, lịch tham quan | `VERIFIED PASS` |
| `/trace`, `[batchCode]`, `/trace/scan` | Truy xuất QR thực | Phả hệ lô cha-con (`NF-DN-099 -> NF-DN-100`), cảnh báo thu hồi/tạm giữ/hết hạn, lọc sự kiện công khai, giải mã ảnh QR & camera cleanup | `VERIFIED PASS` |
| `/quality` | Trung tâm Chất lượng | Đủ 26 loại Q01–Q26 (nhóm OCOP, GAP, Hữu cơ, HACCP/ISO/FSSC/GMP, GI, Bền vững, Thủy sản tham khảo), 34 hồ sơ & Drawer bằng chứng | `VERIFIED PASS` |
| `/policies` | Chính sách minh bạch | Quy ước đặt hàng, hoàn tiền, bảo vệ dữ liệu & giới hạn không gian trải nghiệm | `VERIFIED PASS` |
| `/farmer`, `/farmer/publish` | W02 Nhà vườn & HTX | Chế độ mặc định Nhà vườn gọn (U50+ chữ to) + chế độ Quản trị HTX & Kinh doanh 7 tab (`FarmerOverviewAnalytics`, `FarmerCommercePanel`, `FarmerInventoryProcurementPanel`, `FarmerCoopFinancePanel`) | `VERIFIED PASS` |
| `/volunteer`, `/learn` | W03 Thanh niên & Học mở | Tách "Nhiệm vụ đang mở" và "Nhiệm vụ đã tham gia", lọc xã/phường/thời lượng, Field Lab, kiểm soát đồng thuận người dưới 18 tuổi, in & xuất CSV NaiPass | `VERIFIED PASS` |
| `/coordinator` | W04 Điều phối | `ScopeSelector` 95 ĐVHC, duyệt giờ 2 lớp chống tự duyệt, cảnh báo SLA, đối chiếu hồ sơ, `QualityCenterPanel`, Recharts + bảng HTML & CSV | `VERIFIED PASS` |
| `/organization` | W05 Tổ chức & Đối tác | Giao diện 5 tab thống nhất thích ứng 6+ loại hình (`coop`, `school`, `b2b`, `sponsor`, `logistics`, `mentor`, `authority`) + chặn chấm bài thiếu đồng thuận phụ huynh | `VERIFIED PASS` |
| `/admin` | W06 Trung tâm Điều hành | 8 phân hệ (GMV vs Net Sales vs Platform Revenue, Nhà vườn, Danh mục, Hoàn tiền, Chất lượng + Thu hồi dây chuyền, Tài chính CSV, `PermissionMatrix` Trước/Sau, GIS 95 ĐVHC) | `VERIFIED PASS` |
| `/live`, `/search`, `/sign-in`, `/sign-up`, `/demo` | Hỗ trợ & Xác thực | Toast đăng xuất 1 thông báo `<= 1.8s`, Escape đóng menu, Fuse.js không dấu, `/demo` `noindex` | `VERIFIED PASS` |
