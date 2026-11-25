# Kế hoạch kiểm thử và ma trận nghiệm thu

## Thứ tự triển khai và cổng kiểm tra

| Giai đoạn | Phụ thuộc và thay đổi | Điều kiện qua |
| --- | --- | --- |
| 1. Dữ liệu và quyền | Hai migration, Supabase Auth, `src/lib/live/server.ts` | Chạy được SQL test trên PostgreSQL thử nghiệm. Anonymous chỉ có quyền đọc projection. API không cấp token host cho tài khoản chat. |
| 2. Phiên và media | Route lịch và token, studio, player LiveKit | Tạo/sửa/hủy lịch, phát camera và mic. Room mới tạo chưa được đánh dấu live. Khách xem và nghe được trên browser khác. |
| 3. Nghiệp vụ realtime | Chat, pin, Realtime projection | Hai viewer nhận cập nhật, tin ẩn biến mất, viewer mới nhận ghim hiện hành. Kiểm tra restore khi offline. |
| 4. Camera phụ | QR, route redeem, mobile capture | Redeem một lần, đúng room, không có grant mic. Hai viewer đồng bộ lựa chọn góc qua Realtime, giữ mic và cùng quay về camera chính khi camera phụ ngắt. |
| 5. Vận hành | Webhook, scheduler, lifecycle | Payload sai chữ ký bị chặn. Sự kiện lặp không thay đổi dữ liệu lần nữa. Lỗi tạm giữ cleanup pending rồi dọn ở lần sau. |
| 6. Staging và thiết bị | Supabase hosted thử nghiệm, Vercel HTTPS, LiveKit Cloud | Chạy lại toàn bộ smoke test. Nhận webhook thật, đối chiếu lịch sử worker và thử trên thiết bị vật lý trước khi bật production. |

## Các bài kiểm thử

- Dùng `npm run typecheck -- --incremental false`, `npm run lint` và `npm run build`. Playwright tổng tại [e2e-verify.py](../../tests/e2e-verify.py) kiểm tra điều hướng và các route hiện có.
- [SQL](../../tests/livestream.sql) kiểm tra quyền, giới hạn một phiên active, xung đột khi cleanup chờ, giao dịch redeem QR, moderation, gửi lại tin và Realtime revision. Test chạy trong transaction rollback trên Supabase QA.
- [Playwright với fixture HTTP](../../tests/livestream_media.py) kiểm tra UI và media thật với một room LiveKit thử nghiệm do runner quản lý. [Playwright tích hợp](../../tests/livestream_local.py) dùng API, Auth, PostgreSQL, Realtime thật qua Supabase local và LiveKit Cloud. Test fault runner có thể dùng tiến trình Next thứ hai trỏ tới LiveKit lỗi để kiểm tra lịch retry. [Cách chạy local](LOCAL_QA.md)
- Kiểm tra bảo mật trên staging với ba vai trò guest, pilot chat và hai chủ phiên thuộc hai vườn. Kiểm tra route quản trị bằng quyền người khác, JWT hết hạn, mã đã redeem, rate limit, đầu vào chat dài và nội dung giống HTML. Xác minh webhook sai chữ ký trả 401 và webhook hợp lệ xuất hiện ở log delivery của LiveKit.

## Đối chiếu yêu cầu

Mã FR tham chiếu yêu cầu gốc và [đặc tả hành vi](SPEC.md). Kết quả đã chạy nằm ở [báo cáo kiểm thử](VERIFICATION_REPORT.md).

| ID | Mã và bài kiểm thử | Tình trạng |
| --- | --- | --- |
| FR-01 | `LiveViewer.tsx`, GET /api/live, Playwright lịch | Đã thử danh sách công khai, ảnh nhà vườn có nhãn minh họa, tên chủ phiên, liên kết viewer và quyền riêng tư khi đọc phiên. |
| FR-02 | Route phiên, SQL lifecycle, Playwright lịch | Đã thử tạo, sửa, hủy, bắt đầu, kết thúc, tái kết nối và dọn. Còn xác minh webhook hosted. |
| FR-03 | `LiveStudio.tsx`, `LiveKitStage.tsx`, browser E2E | Đã thử chọn webcam trước khi phát, đồng nhất ID thiết bị trong preview và track phát, tín hiệu mic, chất lượng kết nối hiển thị, đồng hồ, trạng thái camera phụ và viewer count. Còn cần thử chuyển thiết bị thật giữa các lần phát. |
| FR-04 | `LiveKitStage.tsx`, browser E2E | Đã phát và nghe/xem qua LiveKit Cloud với thiết bị giả lập. Chờ webcam và mic laptop thật. |
| FR-05 | `/live/camera`, browser E2E, WebKit UI | Đã thử media bằng Chromium giả lập và bố cục WebKit. Chờ Safari iPhone và Chrome Android thật, đổi hướng và background/foreground. |
| FR-06, FR-07 | `LiveKitStage.tsx`, route camera, SQL và browser E2E | Đã thử hai nguồn, mic chính, góc độc lập, fallback, QR một lần. Chờ hai thiết bị trên hai mạng. |
| FR-08 | `LiveKitStage.tsx`, Playwright viewer | Đã thử media, góc, bộ đếm, bật/tắt tiếng, toàn màn hình trên Chromium và kết thúc phiên. |
| FR-09 | `LiveChat.tsx`, route messages, SQL và browser E2E | Đã thử gửi, ẩn, chống lặp và đọc Realtime. Browser E2E xác minh thẻ thời điểm cùng nhãn vai trò của chủ phiên và viewer. |
| FR-10 | Route pin, projection, browser E2E | Đã thử ghim, bỏ ghim và đồng bộ lại sau offline. |
| FR-11 | `LiveViewer.tsx`, thẻ sản phẩm và checkout | Tên sản phẩm mở trang chi tiết, có giá, tồn kho demo và QR. E2E xác minh nút **Đặt nhanh (COD Demo)** đưa đúng sản phẩm ghim vào checkout hiện có. |
| FR-12 | `LiveKitStage.tsx`, browser E2E với hai viewer | Đã đếm đúng kết nối viewer. Unique viewer và peak concurrent chưa thu thập. |
| FR-13 | Backlog trong đặc tả | Chỉ triển khai khi có xác nhận. |

## Thiết bị và hiệu năng cần nghiệm thu

| Thiết bị thử | Tình huống và bằng chứng cần lưu |
| --- | --- |
| Laptop Windows Chrome/Edge | Quyền webcam/mic, xem trước/phát, kết thúc và xác nhận đèn camera tắt. Mở viewer từ máy khác, thử mất mạng và kết nối lại trong hạn. |
| iPhone 14 Pro Safari | Quét QR HTTPS, camera trước/sau, quay dọc/ngang, chuyển ứng dụng rồi trở lại, xử lý quyền bị từ chối và phát lại hoặc ghép QR mới. |
| Android Chrome | Lặp luồng QR, chọn góc và nghe trên mạng khác host. Kiểm tra thao tác mất Wi-Fi và chuyển dữ liệu di động. |
| Viewer tham gia muộn | Mở sau khi đã ghim, kiểm tra số người xem, sản phẩm đúng và chat gần nhất. |

Để đo độ trễ glass-to-glass, đặt đồng hồ mili giây trong khung hình host rồi quay cùng lúc đồng hồ gốc và màn hình viewer. Đo chat/ghim từ thao tác gửi đến thay đổi UI ở viewer khác. Thu ít nhất 30 mẫu/mạng, ghi browser, thiết bị, loại mạng, P50 và P95. Đối chiếu với LiveKit Analytics và WebRTC stats để xem jitter, packet loss, RTT, bitrate và FPS. Mục tiêu thử là P95 dưới 1 giây cho video và dưới 500 ms cho chat/ghim. Chưa có số đo staging để kết luận đạt.
