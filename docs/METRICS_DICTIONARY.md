# METRICS DICTIONARY — NAIFARM V3.0

Nguồn tính toán thống nhất: `src/lib/metrics/business-metrics.ts` (`computeBusinessMetrics`, kiểm định qua `npm run test:metrics`). Múi giờ đối chiếu: `Asia/Ho_Chi_Minh`.

## 1. Chỉ số Doanh thu & Biên lợi nhuận (Tách bạch nghiêm ngặt)

| Chỉ tiêu | Công thức chính xác | Kỳ T11/2026 (`01/11–25/11/2026`, toàn sàn) | Ghi chú trung thực |
|---|---|---|---|
| **GMV (Tổng giá trị đơn xác nhận)** | Tổng `subtotalVnd` của đơn không hủy đã qua bước xác nhận (hoặc đang giao/hoàn thành), **trước** giảm giá & hoàn tiền | **15.879.000 đ** | Không đại diện cho tiền thực thu hay doanh thu nền tảng |
| **Doanh số hàng hóa ròng (`netMerchandiseSalesVnd`)** | Tổng `max(0, subtotalVnd - discountVnd - refundedMerchandiseVnd)` của đơn `completed` | **2.444.000 đ** | Đo lường doanh số hàng nông sản thực giao |
| **Tổng tiền thu từ khách (`totalCustomerCollectedVnd`)** | `netMerchandiseSalesVnd + max(0, shippingFeeVnd - refundedShippingVnd) + taxVnd` | Bao gồm phí giao ròng | Không gộp phí vận chuyển vào giá trị hàng hóa |
| **Doanh thu nền tảng (`platformRevenueVnd`)** | Phí vận hành sàn ròng trên đơn `completed` (sau trừ phần hoàn theo tỷ lệ) | **122.200 đ** | Tách biệt hoàn toàn khỏi doanh số của nhà vườn |
| **Giá vốn hàng bán (`cogsVnd`)** | Tổng `costSnapshotVnd × max(0, quantity - restockedQty)` cho các dòng có `costSnapshotVnd != null` | Tính trên dòng đủ giá vốn | Phát hiện **`missingCostLinesCount = 1`** (`NF-ORD-DEMO-168`), **không tự bịa giá vốn bằng 0** và hiển thị cảnh báo rõ |
| **Kết quả vận hành nội bộ** | `Lợi nhuận gộp - Chi phí vận hành nội bộ - Phí nền tảng` | Số liệu nội bộ | Gắn cảnh báo *"Sổ quản trị nội bộ — không thay thế báo cáo tài chính/thuế pháp lý"* |

## 2. Chỉ số Kho, Vận hành & Cộng đồng

- **Tồn khả dụng (`available`):** `max(0, onHandQty - reservedQty - blockedQty)`. Tồn cách ly (`quarantineQty`) không cộng vào tồn mở bán.
- **Tỷ lệ tiêu thụ (`sellThroughByUnit`):** Tính tách riêng cho từng đơn vị tính (12 đơn vị riêng biệt gồm `kg`, `túi 3 kg`, `hũ 400g`, `hộp 300g`, ...), **loại trừ hoàn toàn** các phiếu chuyển kho nội bộ (`isInternalTransfer === true`).
- **Biến động kỳ (`calcDeltaPct`):** Đối chiếu đồng độ dài (`01/11–25/11/2026` vs `01/10–25/10/2026`). Trả về `null` và hiển thị `"Không đủ kỳ so sánh"` khi mẫu số `<= 0` hoặc thiếu dữ liệu.
- **Giờ tình nguyện xác nhận (`confirmedVolunteerHours`):** Chỉ cộng các nhiệm vụ `coordinator_approved` và bản ghi `approved` (khử trùng lặp theo `missionId`), đạt **45 giờ** trong kỳ ghi nhận; giờ chờ duyệt tách riêng trên NaiPass.
- **Xuất CSV (`src/lib/export/csv-export.ts`):** Đóng gói UTF-8 BOM (`\uFEFF`), kèm metadata phạm vi/kỳ dữ liệu và vô hiệu hóa formula injection CWE-1236 (`=`, `+`, `-`, `@`, tab, CR).
