# NAIFARM V2.0 — BÁO CÁO KIỂM THỬ & XÁC MINH HỆ THỐNG

- **Ngày kiểm thử:** 25/11/2026
- **Phiên bản:** NaiFarm V2.0 (Frontend-Only Prototype · Next.js 16.4.6 Turbopack)
- **Workspace:** `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`

---

## 1. Tổng hợp cổng kiểm chứng tự động (Post-Final-Edit)

Tất cả lệnh kiểm chứng dưới đây đã được chạy lại **sau lần chỉnh sửa code cuối cùng** ([src/app/page.tsx](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/src/app/page.tsx)):

| Kiểm tra | Lệnh thực thi | Kết quả | Chi tiết ghi nhận |
| :--- | :--- | :--- | :--- |
| Dữ liệu hành chính 25/11/2026 | `npm run data:validate` | **PASS** (exit `0`) | `95` đơn vị (`33` Phường, `62` Xã, mã tỉnh `75`), `10` đơn vị nâng cấp năm 2026, `0` tọa độ GIS bịa đặt, trạng thái `Xã Phước Sơn (25420)` (`386.56 km²` hiện hữu vs `659.163 km²` đề xuất). |
| Toàn vẹn dữ liệu Demo | `npm run test:data` | **PASS** (exit `0`) | `24` nhà vườn, `14` trải nghiệm, `103` sản phẩm, `10` danh mục, `106` lô hàng, `30` mùa vụ, `312` nhật ký, `24` chứng nhận (`7` trạng thái), `82` đơn hàng (`6` trạng thái), `40` nhiệm vụ, `120` bản ghi giờ TNV, `12` livestream, `24` booking, `12` bài học, `10` tổ chức đối tác, `30` thông báo, `12` phiếu hỗ trợ, `6` tài khoản demo. |
| Sinh & Giải mã QR thực tế | `npm run test:qr` | **PASS** (exit `0`) | Kiểm thử roundtrip PNG QR (`qrcode` + `pngjs` + `jsqr`) và kiểm tra bảo mật URL điều hướng `/trace/[batchCode]` cho toàn bộ `106` lô hàng. |
| TypeScript Check | `npm run typecheck` | **PASS** (exit `0`) | `tsc --noEmit` — `0` lỗi kiểu dữ liệu. |
| ESLint | `npm run lint` | **PASS** (exit `0`) | `0` error; `31` cảnh báo `@next/next/no-img-element` trên ảnh tĩnh local/Stitch (`<img>`). |
| Production Build | `npm run build` | **PASS** (exit `0`) | Next.js `16.4.6` (Turbopack) biên dịch thành công toàn bộ `27` App Router routes (Static + Dynamic). |

---

## 2. Kiểm thử End-to-End bằng Playwright (`tests/e2e-v2-verify.py`)

Chạy trên Production Server cục bộ (`http://127.0.0.1:3000`):

- **Kết quả chung:** `ALL_E2E_PASS` (exit code `0`)
- **Luồng kiểm thử đạt PASS (`10/10` nhóm kịch bản tương ứng Flow 1–13):**
  1. `flow1_guest_header_footer`: **PASS** — Mặc định mở app ở trạng thái Khách (`Guest`), header hiển thị nút `Đăng nhập` / `Đăng ký` và `5` liên kết điều hướng cốt lõi (`Chợ OCOP`, `Bản đồ`, `OCOP Live`, `Học tập`, `Quét QR`), không còn `Học & 3D`.
  2. `flow2_global_search`: **PASS** — Tìm kiếm toàn cục `Fuse.js` hoạt động trực tiếp trên `/search`, lọc và khớp chính xác địa bàn `Phước Sơn`.
  3. `flow3_auth_avatar_security`: **PASS** — Đăng nhập 1 chạm các vai trò Demo (`W01`–`W06`), cập nhật menu avatar/tài khoản, từ chối đăng ký công khai vào vai trò nội bộ (`W04`–`W06`), ẩn dữ liệu vận hành W06 khỏi tìm kiếm công khai.
  4. `flow4_marketplace_and_2d`: **PASS** — Chợ OCOP, bộ lọc mùa vụ/danh mục, trang chi tiết sản phẩm dùng `ProductGallery2D` và `ProduceAnatomy2D` (không còn 3D/WebGL).
  5. `flow5_cart_checkout`: **PASS** — Thêm giỏ hàng, cập nhật số lượng, chọn địa chỉ từ sổ địa chỉ Đồng Nai 95 đơn vị và đặt hàng mô phỏng.
  6. `flow6_farmer_diary_qr_sync`: **PASS** — Nhà nông (`W02`) thêm nhật ký mùa vụ mới và đồng bộ trực tiếp sang trang Hộ chiếu QR `/trace/[batchCode]`.
  7. `flow7_qr_scanner_security`: **PASS** — Trang `/trace/scan` kiểm tra hợp lệ URL nội bộ/truy xuất mã lô và chặn URL/payload không an toàn.
  8. `flow8_leaflet_osm_gps`: **PASS** — Bản đồ `Leaflet` (`.leaflet-container`) khởi tạo thành công trên `/explore`, bộ lọc địa bàn & tính khoảng cách `"đường chim bay"` (`@turf/distance`) hoạt động bình thường.
  9. `flow9_to_12_workspaces`: **PASS** — Các không gian Thanh niên tình nguyện (`W03`), Điều phối (`W04`), Tổ chức đối tác (`W05`), Quản trị (`W06`) và Học tập hiển thị đầy đủ chức năng.
  10. `flow13_responsive_and_screenshots`: **PASS** — Kiểm tra responsive không tràn ngang (`horizontalOverflow = 0`) và xuất đầy đủ `18` ảnh chụp `after/` (`10` desktop `1440px`, `8` mobile `390px`).

> **Ghi chú trung thực về môi trường offline khi test Playwright:**  
> Trong sandbox kiểm thử không có DNS ra ngoài, yêu cầu tải tile bản đồ từ `a.tile.openstreetmap.org`, `b.tile.openstreetmap.org`, `c.tile.openstreetmap.org` ghi nhận lỗi mạng (`ERR_NAME_NOT_RESOLVED`) và được component `MapErrorState` xử lý fallback lịch sự ngay trên bản đồ, không làm sập UI hoặc gián đoạn danh sách vườn / bộ lọc. Các prefetch `_rsc=` bị hủy khi chuyển trang cũng được trình xử lý `requestfailed` ghi nhận dưới host `127.0.0.1:3000` mà không ảnh hưởng luồng tương tác.

---

## 3. Kiểm tra Visual & Design Taste (`design-taste-frontend/scripts/inspect.mjs`)

- **Phạm vi chạy sau chỉnh sửa cuối:** Trang chủ `http://127.0.0.1:3000` tại viewport `1440px` và `390px`.
- **Chỉ số kỹ thuật đạt chuẩn:**
  - `[late-title]` đã được xử lý triệt để (`0` lỗi ẩn tiêu đề `<h1>` lúc tải trang).
  - `brokenImages: []`, `horizontalOverflow: 0`, `lowContrast: []`.
  - Độ tương phản chữ nội dung `5.4:1`, tải đủ 2 font `Be Vietnam Pro` (`96%`) và `Lora` (`4%`).
- **Cảnh báo/Lỗi thẩm mỹ theo heuristic tạp chí của `inspect.mjs` (được giữ có chủ đích theo `AGENTS.md`):**
  - `7 FAIL` (`shadow`, `hairline`, `outlined-box`, `body-size` 14px, `small-text`, `focal-point`, `still-page`) và `6 WARN` (`palette-cream` `#F5F3E9`, `size-count`, `grey-body`, `no-footage`, `ragged-edges`, `glass`). Đây là lựa chọn thiết kế chủ đích cho ứng dụng Chợ OCOP nhiều thẻ thông tin theo bảng màu Stitch chính thức (`#F5F3E9`, viền `#D6DED2`), ưu tiên độ rõ ràng, đọc dễ và hiển thị ngay khung hình đầu thay vì hiệu ứng chuyển động nặng.

---

## 4. Thư viện ảnh chụp xác minh

- Trước nâng cấp V2.0 (`14` ảnh): [docs/screenshots/before/](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/before)
- Sau nâng cấp V2.0 (`18` ảnh):
  - Desktop (`1440×900`): [home.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/home.png), [explore.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/explore.png), [product_detail.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/product_detail.png), [trace_scan.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/trace_scan.png), [learn.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/learn.png), [farmer.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/farmer.png), [volunteer.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/volunteer.png), [sign_in.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/sign_in.png), [search_phuoc_son.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/search_phuoc_son.png), [demo.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/desktop/demo.png).
  - Mobile (`390×844`): [home.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/home.png), [explore.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/explore.png), [product_detail.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/product_detail.png), [trace_scan.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/trace_scan.png), [learn.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/learn.png), [farmer.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/farmer.png), [volunteer.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/volunteer.png), [demo.png](file:///e:/04_Projects/Group%208%20-%20Hackathon%20Dong%20Nai/naifarm/docs/screenshots/after/mobile/demo.png).
