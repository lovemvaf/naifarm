# DATA, QUALITY & GIS PROVENANCE — NAIFARM V3.0

Tài liệu phân tách rạch ròi nguồn dữ liệu thật công bố công khai với dữ liệu mẫu phục vụ không gian trải nghiệm trên trình duyệt.

## 1. Phân loại nguồn dữ liệu (`sourceKind`)

| Nhóm dữ liệu | `sourceKind` | Số lượng kiểm định | Chính sách hiển thị & ranh giới |
|---|---|---|---|
| **Danh mục tham khảo công khai** (`src/data/reference/ocop-public-reference.ts`) | `"public_reference"` | **17** bản ghi (`REF-OCOP-01..12`, `REF-VG-01..04`, `REF-GI-01`) | Chỉ đọc, gắn liên kết `"Xem nguồn công bố"`, giữ nguyên văn tên chủ thể và địa chỉ nguồn gốc (trích QĐ 125/QĐ-UBND 14/01/2026, QĐ 2361/QĐ-BNNMT, cổng VietGAP & Sở KH&CN). **Không** gắn giá bán, tồn kho, giỏ hàng hoặc đánh giá lên pháp nhân thật. |
| **Nhà vườn & Sản phẩm trải nghiệm** (`src/data/demo/`) | `"synthetic"` | **30** nhà vườn, **116** SKU (10 ngành), **119** lô, **168** đơn hàng (T10–T11/2026), **36** mùa vụ, **348** nhật ký, **30** hồ sơ chứng nhận | Gắn nhãn `"Không gian trải nghiệm"` / `"Hồ sơ mẫu"`. Tên thương hiệu và giá bán tách riêng khỏi các doanh nghiệp pháp lý thật. |
| **Tài nguyên hình ảnh cục bộ** (`src/data/reference/asset-manifest.ts`) | Nội bộ dự án | **65** ảnh (`stitch-01`..`stitch-65`: 62 `.jpg` + 3 `.png` là `23, 58, 64`) | Lưu cục bộ tại `public/images/stitch/`, được kiểm tra tồn tại 100% qua `npm run test:data`. Ảnh giao diện livestream cũ không phù hợp đã thay bằng ảnh nông sản thuần. |

## 2. Hệ thống 26 Chuẩn chất lượng (`Q01–Q26`) & Nguồn đối chiếu (`S01–S23`)

- Định nghĩa tại `src/lib/quality/credential-registry.ts`; danh sách mẫu 34 hồ sơ (`INITIAL_CREDENTIAL_RECORDS`) và bằng chứng tại `src/data/fixtures/quality-credentials.ts`.
- **Quy tắc hiển thị huy hiệu (`evaluateCredentialDisplay`):**
  - Tự động **ẩn** huy hiệu (`canShowBadge = false`) khi hồ sơ ở trạng thái: `expired`, `revoked`, `suspended`, `rejected`, `not_provided`, `self_declared`, `announced_pending_dossier`, `assessed_not_yet_certified`, `historical_check_required`, hoặc thiếu bằng chứng (`evidenceIds.length === 0`), hoặc hết hạn `validTo < refDate`.
  - **Ràng buộc phạm vi ngành hàng (`eligibleCategories`):** `Q25` (ASC) và `Q26` (BAP) thuộc nhóm thủy sản tham khảo, bị chặn hiển thị trên nông sản trồng trọt; `Q24` (4C) chỉ áp dụng cho cà phê.
  - **Không dùng logo tổ chức chứng nhận thương mại:** chỉ dùng chip chữ trung tính (`logoPolicy: "neutral_text_chip_only"`).
- **Truy xuất phả hệ & thu hồi lô (`src/lib/quality/recall-engine.ts`):**
  - Khi tạm giữ/thu hồi lô cha `NF-DN-099`, phân tích phả hệ lan truyền sang lô con `NF-DN-100` và khóa nút thêm vào giỏ trên các SKU gắn lô `quarantine` / `recalled` / `expired` (như `NF-DN-098`, `NF-DN-099`, `NF-DN-100`).

## 3. Địa giới hành chính & Trạng thái GIS (95 ĐVHC Đồng Nai)

- Nguồn kiểm định (`npm run data:validate`): **95 đơn vị** (`33 Phường`, `62 Xã`), **10 xã nâng cấp thành phường 2026**, toàn bộ mã ĐVHC của 30 nhà vườn, 17 bản ghi `OCOP_PUBLIC_REFERENCE_CATALOG`, đơn hàng và bài học khớp 100% danh mục chính thức.
- Trạng thái GIS: **`0/95` ranh giới polygon được xác minh (`chua_xac_minh_toa_do_va_polygon`)**. Bản đồ hiển thị nhãn trung thực `"Vị trí gần đúng theo vùng"`, không tự vẽ đường ranh giới pháp lý.
- Hồ sơ đối chiếu diện tích Xã Phước Sơn (`25420`): giữ nguyên cả hai mốc số liệu (`386.56 km²` hiện trạng và `659.163 km²` theo đề xuất tờ trình) kèm metadata trong **W06 → Hỗ trợ & Dữ liệu GIS**.
