# ROLE & CAPABILITY MATRIX — NAIFARM V3.0

Nguồn cài đặt chuẩn tại `src/lib/permissions/access-control.ts` và giao diện quản trị `src/components/permissions/PermissionMatrix.tsx`.

## 1. Bảng phân quyền 6 Không gian (`W01–W06`)

| Mã tác vụ | Mô tả | W01 | W02 | W03 | W04 | W05 | W06 | Ràng buộc bổ sung |
|---|---|---|---|---|---|---|---|---|
| `catalog.browse` | Xem nông sản, bộ sưu tập, danh mục OCOP tham khảo & truy xuất QR | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ẩn sự kiện `visibility === "internal"` khỏi trang truy xuất công khai |
| `commerce.checkout` | Giỏ hàng tách nhà vườn, chọn ĐVHC Đồng Nai / ngoài tỉnh, hoàn tất đơn | ✓ | — | — | — | ✓ (`b2b`) | — | Chặn đặt hàng khi lô `quarantine`/`recalled`/`expired` |
| `farm.publish_sku` | Đăng nông sản 3 bước, bật/tắt trạng thái mùa, ghi nhật ký | — | ✓ | — | — | ✓ (`coop`) | ✓ | Đồng bộ tức thì với hộ chiếu QR lô tương ứng |
| `inventory.adjust` | Ghi phiếu nhập/xuất/chuyển/điều chỉnh/hao hụt theo kho & lô | — | ✓ | — | — | ✓ (`coop`, `logistics`) | ✓ | Bắt buộc nhập lý do; chặn tồn âm; chuyển nội bộ không tính vào tiêu thụ |
| `refund.approve` | Phê duyệt hoàn tiền & đối soát chi trả xã viên HTX | — | ✓ | — | — | ✓ (`coop`) | ✓ | **Maker ≠ Checker**: người lập đề xuất bị chặn nếu tự duyệt |
| `volunteer.approve_hours` | Duyệt giờ công tình nguyện vào NaiPass | — | Bước 1 (Xác nhận vườn) | — | Bước 2 (Duyệt giờ) | — | ✓ | Chủ vườn W02 xác nhận trước; Điều phối W04 không được tự duyệt bài của mình |
| `quality.verify_or_recall` | Cập nhật vòng đời hồ sơ Q01–Q26 & tạm giữ/thu hồi lô | — | Gia hạn | — | ✓ | ✓ (`authority`, `coop`, `mentor`) | ✓ | Tự động lan truyền thu hồi qua lô con trong `recall-engine.ts` |
| `school.grade_minor` | Chấm điểm & xác nhận tham gia thực tế cho học sinh | — | — | ✓ (Check consent) | — | ✓ (`school`) | ✓ | Chặn nếu học sinh `< 18` tuổi chưa có `hasGuardianConsent === true` (`SUB-03`) |
| `admin.grants_and_gis` | Cấp/thu hồi quyền phạm vi & quản trị dữ liệu GIS | — | — | — | — | — | ✓ | Bắt buộc nhập lý do thay đổi; ghi ảnh chụp `beforeSummary → afterSummary` vào Audit Log |

## 2. Chuyên biệt 6+ loại hình Tổ chức trong `W05` (`/organization?org=...`)

- **`coop`** (`Hợp tác xã / Hội Nông dân`): Quản lý lô gom `coopPools` (ví dụ `NF-DN-050`), đối soát thanh toán `memberDeliveries` có kiểm tra Maker ≠ Checker.
- **`school`** (`Trường học & CLB Sinh viên`): Quản lý lớp thực hành (`schoolClasses`), chấm bài (`studentSubmissions`) có bảo vệ trẻ vị thành niên thiếu đồng thuận phụ huynh.
- **`b2b`** (`Doanh nghiệp thu mua B2B`): Tra cứu nguồn cung sẵn có theo xã/phường và liên kết lô truy xuất QR.
- **`sponsor`** (`Nhà tài trợ & Dự án`): Tách riêng ngân sách dự kiến (`plannedBudgetVnd`), ngân sách đã duyệt (`approvedBudgetVnd`) và đầu ra đã nghiệm thu.
- **`logistics`** (`Đối tác Vận chuyển`): Điều phối chuyến gom `logisticsTrips`, cập nhật `delivered_pod` / `failed_reschedule`.
- **`mentor`** (`Chuyên gia / Giảng viên`): Xử lý phiếu tư vấn bảo quản, bao bì và kỹ thuật canh tác (`mentorCases`).
- **`authority`** (`Cơ quan chuyên môn`): Đánh giá & đối chiếu hồ sơ chất lượng qua `QualityCenterPanel`.
