# NAIFARM V3.0 — PRODUCTION HANDOVER SUMMARY

**Sản phẩm:** NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai  
**Thông điệp:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*  
**Kiến trúc:** Frontend-Only Web App (Next.js `16.4.6` App Router, React `19.3.0`, TypeScript, Tailwind CSS v4, Leaflet, Recharts, Fuse.js, `qrcode` + `jsqr`, lưu trạng thái tại trình duyệt `naifarm_demo_state_v3`).

## 1. Các hạng mục trọng tâm đã bàn giao ở V3.0

1. **Tách bạch Nguồn công bố thật & Không gian trải nghiệm (`OCOP_PUBLIC_REFERENCE_CATALOG`):**
   - 17 bản ghi công bố chính thức từ QĐ 125/QĐ-UBND, OCOP 5 sao Quốc gia, VietGAP & GI 0066 hiển thị ở chế độ chỉ đọc kèm `"Xem nguồn công bố"`, tuyệt đối không gắn giá bán hay giỏ hàng giả lập.
2. **Trung tâm Chất lượng 26 Tiêu chuẩn (`Q01–Q26`) & Phả hệ Thu hồi lô (`/quality`, `/trace/[batchCode]`):**
   - Quy tắc lọc vòng đời và phạm vi ngành hàng (`evaluateCredentialDisplay`): tự động ẩn huy hiệu hết hạn, thu hồi, tạm đình chỉ, công bố thiếu hồ sơ hoặc sai ngành (`Q25`/`Q26` thủy sản không gắn lên trái cây).
   - Phân tích lan truyền thu hồi lô cha-con (`NF-DN-099 → NF-DN-100`) và tự động khóa đặt mua đối với lô `quarantine` / `recalled` / `expired`.
3. **Thương mại đa nhà bán & Đặt hàng linh hoạt (`/marketplace`, `/products/[slug]`, `/cart`, `/checkout`, `/account/orders`):**
   - 6 bộ sưu tập (Mùa vụ, Đặt trước, NaiBox 95, NaiRescue, Danh mục OCOP tham khảo), đối chiếu 3 sản phẩm cùng ngành, tự tách đơn theo từng nhà vườn, chọn địa chỉ trong Đồng Nai (95 ĐVHC) hoặc ngoài tỉnh, yêu cầu hoàn tiền & đánh giá gắn đơn hoàn thành.
4. **Cụm Quản trị Nhà vườn & Hợp tác xã ERP (`/farmer`) + Toàn bộ 6 Không gian (`W01–W06`):**
   - Giữ chế độ mặc định *Nhà vườn gọn (Chữ to)* cho nông dân U50+ và chuyển 1 chạm sang *Quản trị HTX & Kinh doanh* (phân tích 19 KPI, tồn kho theo lô & FEFO, nhập/xuất có lý do bắt buộc, gom lô pooling & đối soát Maker ≠ Checker, xuất CSV UTF-8 BOM).
   - `W03` tách nhiệm vụ mở / đã tham gia; `W04` duyệt giờ 2 lớp chống tự duyệt + Recharts + CSV; `W05` hỗ trợ đủ 6+ loại tổ chức (`coop`, `school`, `b2b`, `sponsor`, `logistics`, `mentor`, `authority`); `W06` Admin Command Center 8 phân hệ + Kiểm toán Trước/Sau + Trung tâm dữ liệu GIS 95 ĐVHC.
5. **Quét sạch Copy & Trải nghiệm Toast/Header/Footer:**
   - Thông báo đăng xuất rút gọn thành 1 toast duy nhất `"Đã đăng xuất"` trong `1300ms` (`<= 1.8s`), xóa câu ngày dataset khỏi footer công khai và chuyển thông tin đối chiếu GIS vào W06.

## 2. Tài liệu tham chiếu kỹ thuật

- [Kiểm định dữ liệu & nguồn gốc (`docs/DATA_QUALITY_PROVENANCE.md`)](DATA_QUALITY_PROVENANCE.md)
- [Ma trận phân quyền (`docs/ROLE_CAPABILITY_MATRIX.md`)](ROLE_CAPABILITY_MATRIX.md)
- [Từ điển chỉ số kinh doanh (`docs/METRICS_DICTIONARY.md`)](METRICS_DICTIONARY.md)
- [Báo cáo kiểm thử V3.0 (`docs/V3_TEST_REPORT.md`)](V3_TEST_REPORT.md)
- [Lộ trình & Gap Matrix V3 (`docs/V3_TODO.md`)](V3_TODO.md) | [Gap Matrix](GAP_MATRIX.md)
- [Nhật ký thực thi kỹ năng (`docs/SKILL_EXECUTION_LOG.md`)](SKILL_EXECUTION_LOG.md)
