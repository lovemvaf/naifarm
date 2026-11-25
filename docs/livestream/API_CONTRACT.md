# Hợp đồng API và bảo mật NaiFarm Live

Các đường dẫn dưới đây có tiền tố `/api/live` trừ khi ghi đầy đủ. JSON dùng `Cache-Control: no-store`. Thao tác pilot gửi `Authorization: Bearer <Supabase access token>`. `id` là UUID phiên. Lỗi ứng dụng trả `{error}`; các lỗi provider nội bộ trả thông báo chung.

| Method và đường dẫn | Quyền và đầu vào | Thành công |
| --- | --- | --- |
| GET `/config` | Công khai | `{url, key}` chỉ gồm địa chỉ Supabase và khóa anon hoặc publishable. |
| GET `/` | Công khai. `?studio=1` cần pilot và lọc theo quyền sở hữu và vườn. | `{sessions, farms?}`, tối đa 100 lịch. Mỗi phiên có `host_name` từ quyền pilot đang hoạt động, hoặc `null` nếu không còn quyền. |
| POST `/` | Pilot có quyền vườn. `{farmId,title,description?,scheduledAt?,productIds?,requestId}`. | `{session}`, 201 khi tạo, 200 nếu lặp request ID. |
| GET `/{id}` | Công khai, token hợp lệ nếu gửi kèm. | `{session,host}`. Phiên có `host_name`. UID của chủ phiên chỉ dùng ở server. |
| PATCH `/{id}` | Chủ phiên, chỉ lịch chưa bắt đầu. `{title,description?,scheduledAt?,productIds?}`. | `{session}`. Đổi đồng thời trả 409. |
| POST `/{id}/start` | Chủ phiên. Tạo room cho lịch chưa bắt đầu hoặc dùng lại room của phiên active. | `{status,ready}`, 200 hoặc 202 đang chuẩn bị. |
| POST `/{id}/cancel` | Chủ phiên, lịch chưa bắt đầu hoặc đã hủy. | `{ok:true}`. |
| POST `/{id}/end` | Chủ phiên, phiên active hoặc đã kết thúc. | `{status,cleanupPending}`, 200 hoặc 202 còn chờ dọn. |
| POST `/{id}/token` | Chủ phiên active đã có room. | `{url,token,expiresAt}` cho host. |
| POST `/{id}/viewer-token` | Khách, phiên live hoặc reconnecting đã có room. | `{url,token,expiresAt}` chỉ xem. |
| POST `/{id}/camera-angle` | Viewer. `{identity}` must be an active, unmuted camera publisher in this room. | `{identity}`; persists and broadcasts the shared angle. 409 if the publisher is no longer active. |
| POST `/{id}/cameras/pair` | Chủ phiên, room sẵn sàng và chưa có camera phụ chưa thu hồi. | `{code,expiresAt}`. |
| POST `/cameras/redeem` | Bearer QR trong `{code}`. | `{url,token}` chỉ publish camera. Mã đã dùng hoặc hết hạn trả 410. |
| DELETE `/{id}/cameras` | Chủ phiên, có thể gọi lại. | `{ok:true}`. Thu hồi camera phụ hiện hành. |
| GET `/{id}/messages?limit=30` | Công khai, limit từ 30 đến 150. | `{messages,more}`, sắp xếp theo thời gian, bỏ tin ẩn. Mỗi tin có `id`, `sender_name`, `body`, `created_at`, `is_host`. UID nội bộ của sender và owner chỉ dùng ở server để xác định `is_host`. |
| POST `/{id}/messages` | Pilot có quyền chat. `{body,clientMessageId}`. | `{ok:true}`, 201 kể cả khi gửi lại đúng mã. |
| DELETE `/{id}/messages` | Chủ phiên. `{messageId}`. | `{ok:true}` sau khi ẩn tin. |
| POST `/{id}/pin` | Chủ phiên. `{productId,revision}`. `null` để bỏ ghim. | `{ok:true}`. Revision cũ trả 409. |
| GET `/reconcile` | Scheduler với bearer `CRON_SECRET`. | `{ok:true}` sau một lượt đối chiếu. |
| POST `/api/webhooks/livekit` | LiveKit JWT và nội dung payload được ký. | `{ok:true}`, kể cả khi event ID đã xử lý. |

Tiêu đề dài 3–140 ký tự, mô tả tối đa 2000 và tối đa 12 sản phẩm thuộc vườn. 401 khi thiếu hoặc sai xác thực, 403 khi thiếu quyền, 404 khi UUID/phiên không phù hợp, 409 khi xung đột trạng thái hoặc chưa có room, 429 khi vượt giới hạn và 503 khi tính năng, cấu hình hoặc schema chưa sẵn sàng.

## Biên quyền và nguy cơ

### Realtime camera angle

`POST /api/live/{id}/camera-angle` accepts `{ "identity": "host-{sessionId}" | "camera-{uuid}" }`. The API checks that the participant is active in the session's LiveKit room and currently publishes an unmuted camera track, then atomically stores the selection. Supabase Realtime increments the session projection so every viewer refreshes the shared selection. If that publisher disconnects, each player falls back to the active main camera.

- **Giả mạo host hoặc sender.** Next.js gọi Supabase Auth lấy UUID từ token, truy vấn quyền pilot và kiểm tra chủ phiên theo UUID cùng vườn. Sender name lấy từ bản ghi quyền. Tin nhắn render dưới dạng văn bản.
- **Dùng token sai room, phát từ trang viewer hoặc thu âm từ camera phụ.** JWT có scope một room, hết hạn sau hai phút để khởi tạo kết nối. Host có camera và mic. Viewer chỉ subscribe. Camera phụ chỉ publish camera. Tất cả tắt publish data và cập nhật metadata.
- **Lộ hoặc dùng lại QR.** Code 256 bit, lưu digest, hết hạn sau 5 phút và redeem nguyên tử. Rate limit redeem theo nguồn. Dùng QR fragment, tránh URL path/query trong request và log. Thu hồi quyền camera qua Room Service.
- **Spam hoặc đường gọi song song.** Rate limit theo bucket trong PostgreSQL. Chat giới hạn 5 tin/10 giây theo sender. API giới hạn token viewer 60/phút theo phiên và nguồn. Unique key và revision xử lý retry và cạnh tranh.
- **Webhook giả hoặc trùng.** Receiver kiểm tra JWT kèm hash raw body và giới hạn kích thước. Event ID được ghi sau khi reconcile. Lease và revision chống xử lý room đồng thời, scheduler bù khi webhook gián đoạn.
- **Lộ khóa.** Service key Supabase, LiveKit API secret và cron secret nằm phía server. Config browser kiểm tra khóa Supabase trước khi trả. Hướng dẫn triển khai chỉ chứa tên biến. Khi đặt LiveKit project thử riêng, tắt tự tạo phòng để token cũ không khởi tạo lại room đã dọn.
