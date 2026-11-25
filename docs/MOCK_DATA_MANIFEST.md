# NaiFarm V2.0 — Relational Mock Data Manifest

Kiểm định tự động bằng `npm run test:data` (`scripts/validate-mock-data.ts`) — **PASS** 100% ràng buộc khóa ngoại, mã ĐVHC `95` đơn vị (`25/11/2026`), không chứa cấp huyện cũ trong địa chỉ hoạt động và 100% ảnh Stitch tồn tại dưới `public/images/stitch/`.

| Nhóm thực thể | Số lượng | Ràng buộc & Bảo toàn Golden Dataset |
| :--- | :---: | :--- |
| `Farm` (Nhà vườn & HTX) | `24` | Bảo toàn `farm-ba-tu-demo` (`26080` Phường Long Khánh, `2,5 ha`), `farm-ba-minh-tan-trieu` (`26188` Phường Tân Triều, `2,2 ha`); phủ 24 ĐVHC từ Nam đến Bắc TP. Đồng Nai kèm `coordsDemo` minh họa |
| `ExperiencePackage` | `14` | Gắn trên `14` nhà vườn sinh thái |
| `Product` | `103` | Phủ đủ `10` danh mục nông sản; bảo toàn `P01`–`P05` (Nhà vườn Ba Tư `35.000–120.000 đ/kg`) và `P06`–`P12` |
| `TraceBatch` | `106` | Bảo toàn `NF-DEMO-001`, `NF-TT-2026-01`, `NF-XL-2026-03` + `NF-DN-001`..`NF-DN-103` (mỗi lô >= 3 mốc nhật ký) |
| `ProductionSeason` | `30` | Liên kết `farmId`, `administrativeUnitCode`, `growingZoneCode` và `batchCodes` |
| `DiaryEntry` | `312` | Nhật ký từng chặng phân biệt `Nhà vườn tự khai`, `Thanh niên hỗ trợ ghi nhận`, `HTX đối chiếu (Demo)` |
| `FarmCertification` | `24` | Phủ đủ `7` trạng thái chứng nhận, mã `DEMO-OCOP-*` / `DEMO-VG-*` / `DEMO-MSVT-*` / `DEMO-ATTP-*` kèm tuyên bố không có giá trị pháp lý |
| `DemoOrder` | `82` | Bảo toàn `NF-ORD-DEMO-01`, `NF-ORD-DEMO-02`; phủ đủ `6` trạng thái đơn và địa chỉ Đồng Nai 2 cấp |
| `VolunteerMission` | `40` | Bảo toàn `NF-MIS-01`..`NF-MIS-03`; 2 lớp xác nhận giờ W02 + W04 |
| `VolunteerHourRecord` | `120` | Phục vụ OCOP Youth Impact Pass |
| `SupportRequest` | `10` | Bảo toàn `REQ-DEMO-01` |
| `LivestreamSession` | `12` | Bảo toàn `NF-LIVE-REPLAY-TT`, `NF-LIVE-01`, `NF-LIVE-02` |
| `ExperienceBooking` | `24` | Lịch đặt tham quan vườn |
| `LearningLesson` | `12` | Kết hợp Thẻ giải phẫu 2D (`ProduceAnatomy2D`) & quiz 100% không 3D |
| `PartnerOrganization` | `10` | HTX, Đoàn trường, Hội Nông dân, Doanh nghiệp kết nối (W05) |
| `UserNotification` | `30` | Thông báo đơn, mùa vụ, nhiệm vụ và cập nhật ĐVHC 25/11/2026 |
| `SupportTicket` | `12` | Phiếu hỗ trợ nghiệp vụ (W06) |
| `DemoAuthAccount` | `6` | 6 tài khoản Demo `W01`–`W06`; chặn đăng ký công khai cho `W04`/`W05`/`W06` |
| `AddressBookEntry` | `4` | Sổ địa chỉ Đồng Nai chuẩn `[chi tiết], [Phường/Xã], Thành phố Đồng Nai, Việt Nam` |
| `DocumentReviewCase` | `12` | Hàng chờ đối chiếu chứng từ W04 |
| `AdminGrant` | `6` | Ma trận phân quyền theo phạm vi ĐVHC (W06) |
| `AuditLogEntry` | `16` | Nhật ký kiểm toán chỉ đọc |
