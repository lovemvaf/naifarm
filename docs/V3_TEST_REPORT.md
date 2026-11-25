# NAIFARM V3.0 — VERIFICATION & TEST REPORT

Thời điểm chạy kiểm định cuối cùng (sau chỉnh sửa cuối trên `src/`): **25/11/2026**.

## 1. Kết quả Bộ kiểm định CLI & Unit Tests

| Lệnh kiểm tra | Phạm vi | Kết quả quan sát thực tế | Status |
|---|---|---|---|
| `npm run data:validate` | 95 ĐVHC Đồng Nai, 10 xã lên phường 2026, Phước Sơn `25420`, GIS | `95 units (33 Phường, 62 Xã), 10 upgraded 2026, 0 fabricated GIS coords, Phước Sơn 386.56 vs 659.163 proposed verified` | `PASS` |
| `npm run test:data` | Khóa ngoại toàn hệ, tài sản ảnh, kiến trúc Frontend-only | `30 farms, 14 experiences, 116 products, 10 categories, 119 batches, 36 seasons, 348 diaries, 30 certs, 168 orders, 40 missions, 120 hour records, 65 verified assets, 0 API routes, 0 3D imports, 0 secret leaks` | `PASS` |
| `npm run test:metrics` | 19 chỉ số kinh doanh, Missing COGS, Internal Transfer, CSV CWE-1236 | `novGmvVnd=15879000, novNetMerchandiseVnd=2444000, novPlatformRevenueVnd=122200, missingCostLinesCount=1, confirmedVolunteerHours=45`, `12` đơn vị tiêu thụ tách rời, sanitized `= + - @` CSV | `PASS` |
| `npm run test:quality` | 26 chuẩn chất lượng, 17 tham chiếu công bố, phả hệ thu hồi | `26 credentialTypes (Q01–Q26), 34 credentialRecords, 17 publicReferences, recallCascadeLots=["NF-DN-099","NF-DN-100"], affectedOrders=1`, chặn badge hết hạn/thu hồi/sai ngành (`Q24`, `Q25`, `Q26`) | `PASS` |
| `npm run test:qr` | Sinh & giải mã ngược QR PNG (`qrcode` + `jsqr`) | `PNG QR encode/decode & URL security validation verified for all batches` | `PASS` |
| `npm run typecheck` | `tsc --noEmit` | `0 errors` | `PASS` |
| `npm run lint` | `eslint` | `0 errors`, `32 warnings` (`@next/next/no-img-element` và 2 cảnh báo unused var nhỏ) | `PASS` |
| `npm run build` | `next build` (Turbopack) | Compile & tạo thành công toàn bộ **29 routes** trong Next App Router (`●`/`ƒ`) | `PASS` |

## 2. Kết quả Kiểm thử Playwright E2E (`tests/e2e-v3-verify.py`)

Chạy trên server production cục bộ (`node ./node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000`):

- **Toàn bộ 31 đường dẫn kiểm thử (bao gồm các trang động mẫu):** HTTP `200`, `0` ảnh vỡ (`naturalWidth > 0`), `0` lỗi JS (`pageErrors: []`), `0` lỗi local request/console (`failedLocalRequests: []`, `badLocalResponses: []`, `consoleErrors: []`).
- **Kiểm tra DOM Copy Lint:** `0` chuỗi vi phạm (`(Demo)`, `(demo)`, `mock data`, `prototype`, `Frontend-Only`, `Simulation`, `Roadmap`, `Active MVP`, `Trung tâm Trình diễn`, `role demo`, `GPS API`, `Bản đồ OpenStreetMap`, `Đã đăng xuất về chế độ Khách`, `Dữ liệu mô phỏng`) trên mọi route render.
- **Ma trận Responsive (0 overflow ngang ở mọi độ rộng):** `320px (5 routes)`, `375px (5 routes)`, `390px (5 routes)`, `768px (5 routes)`, `1024px (5 routes)`, `1280px (5 routes)`, `1440px (5 routes)` -> đều đạt `overflow: 0`.
- **Luồng nghiệp vụ đã xác nhận thực tế:**
  - `F01_public_reference_readonly`: Tab *Danh mục OCOP tham khảo* hiển thị đúng nguồn công bố (`Xem nguồn công bố`), không có nút mua/giá ảo.
  - `F02_marketplace_compare_collections`: Bộ sưu tập *NaiBox 95* và bảng đối chiếu sản phẩm cùng nhóm ngành mở/đóng sạch sẽ.
  - `F02b_quarantined_lot_cart_lock`: Sản phẩm gắn lô tạm giữ `NF-DN-098` hiển thị banner khóa đặt mua.
  - `F03_checkout_outside_province_and_coupon`: Chọn địa chỉ ngoài tỉnh (`TP.HCM`) + mã `NAIFARM10` tạo đơn thành công kèm thông báo gọn không gian trải nghiệm.
  - `F04_single_logout_toast_and_escape_menu`: Escape đóng menu tài khoản; đăng xuất hiển thị **1 toast duy nhất** `"Đã đăng xuất"` và biến mất sau `<= 1.8s`.
  - `F05_quality_recall_qr_upload`: `/quality` hiển thị 26 loại tiêu chuẩn, `/trace/NF-DN-099` hiện phả hệ `NF-DN-100`, `/trace/scan` giải mã file QR PNG chuyển hướng sang `/trace/NF-DEMO-001`.
  - `F06_farmer_erp_analytics_inventory_coop`: `/farmer?mode=erp` hiển thị Doanh số ròng, Tồn kho theo lô FEFO, Sổ tài chính nội bộ có khuyến cáo không thay thế chứng từ pháp lý.
  - `F07_volunteer_coordinator_governance`: `/volunteer` tách *Nhiệm vụ đang mở* vs *Nhiệm vụ đã tham gia*; `/coordinator` hiện quy tắc duyệt 2 lớp & chống tự duyệt.
  - `F08_w05_orgs_w06_admin_gis`: `/organization?org=school` chặn học sinh thiếu đồng thuận (`SUB-03`), `org=logistics` hiển thị `TRIP-DN-01`; `/admin` tách rõ *Doanh thu nền tảng (Platform Revenue)*, thu hồi dây chuyền lô và trung tâm dữ liệu GIS (`chua_xac_minh_toa_do_va_polygon`).

## 3. Lưu ý kiểm thử trực quan & Môi trường Sandbox

- Ảnh chụp kiểm thử được lưu tại `docs/screenshots/v3/{desktop,mobile}/` và đã kiểm tra trực quan qua `read_file`: phát hiện và đã khắc phục ngay trong mã nguồn việc cắt chữ ô tìm kiếm header/home và thay thế các ảnh cũ chứa khung UI livestream/camera bằng ảnh nông sản sạch trước khi build lại.
- **Lưu ý trung thực môi trường Sandbox offline:** Trong sandbox kiểm thử không có kết nối ra Internet, trình duyệt chặn tải tile ảnh từ `*.tile.openstreetmap.org` (`ERR_CONNECTION_REFUSED`), kích hoạt cơ chế fallback trạng thái lỗi bản đồ rõ ràng trong `MapErrorState` thay vì giả lập tile thành công.
