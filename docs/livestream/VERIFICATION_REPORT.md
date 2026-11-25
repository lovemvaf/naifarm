# Kết quả kiểm thử NaiFarm Live

## Ứng dụng và media

| Hạng mục | Bằng chứng |
| --- | --- |
| Kiểu dữ liệu và production build | ESLint qua cho các tệp livestream vừa sửa. `next build` compile thành công nhưng dừng ở typecheck do các lỗi TypeScript hiện có trong `src/lib/naiai/knowledge.ts` (`productSlug`, `reply`, `linkHref`); không thuộc livestream. Build toàn app chưa qua. |
| Các luồng hiện có | Playwright trên production server ở cổng 3099 kiểm tra 24 route, sáu chiều rộng, 28 ảnh và các luồng chức năng cũ, 0 lỗi console hoặc trang. Lượt trên dev báo cảnh báo unmount React tại trang sản phẩm. |
| LiveKit Cloud | Room Service xác thực với khóa sẵn có trong `.env`. Studio phát video và mic từ Chromium. Trang camera phụ phát video lên cùng room. Studio và hai viewer thấy cùng số người xem. Hai viewer đồng bộ góc chính/phụ theo lựa chọn qua Realtime, giữ mic host và cùng fallback camera chính khi camera phụ ngắt. |
| Chat và ghim | Playwright đăng nhập pilot qua Supabase Auth local. Không có GET chat trong 10 giây khi viewer không thao tác. Sau khi viewer kia gửi tin qua API thật, viewer nhận tin mới, thao tác ẩn tin và ghim sản phẩm qua Supabase Realtime mà không tải lại trang. |
| Camera selection | E2E hai viewer cùng nhận lựa chọn qua Realtime; API từ chối camera chưa ghép; publisher chuyển camera trước/sau; cả hai viewer fallback khi camera phụ ngắt. |
| Thiết bị và trạng thái trong studio | E2E xác nhận thanh tín hiệu mic có dữ liệu trước phát, giữ đúng ID của webcam màu ảo được chọn từ preview đến khi phát, phát hình tới hai viewer, hiển thị đồng hồ/chất lượng kết nối và cập nhật online/offline của camera phụ. Chromium còn cung cấp nguồn đo độ sâu Y16. Lần thử với nguồn này có preview nhưng `framesEncoded=0` nên bài thử chọn thiết bị dùng một webcam màu ảo khác. [Mã nguồn Chromium](https://chromium.googlesource.com/chromium/src/%2B/refs/tags/144.0.7553.0/media/capture/video/fake_video_capture_device_factory.cc) |
| Điều khiển viewer và thông tin chat | Chromium xác minh mặc định tắt tiếng, mở và tắt mic ở phía người xem, vào fullscreen bằng video. Sau khi tắt/bật tiếng và đổi camera, viewer giữ đúng track âm thanh của host. UI hiển thị thời điểm hai tin và chỉ gắn nhãn **Chủ phiên** cho tin của host. |
| Khôi phục trong browser | Playwright đưa viewer offline rồi bỏ ghim từ studio trên một context khác. Khi online, viewer nhận snapshot mới. Tải lại studio đưa phiên đến trạng thái reconnecting, sau đó **Kết nối camera chính** đưa cùng phiên về live và các viewer nhận lại video. |
| Bố cục điện thoại | WebKit trên Windows mở `/live`, `/live/studio` và `/live/camera` trong viewport iPhone 14 rộng 390 px. Ba trang trả 200, không tràn chiều ngang hay có lỗi JavaScript. Bản WebKit này thiếu API WebRTC và media capture. |
| Migration và quyền | Ba migration qua trên PostgreSQL 17.12 của Supabase local. SQL test kiểm tra quyền bắt đầu, giới hạn một phòng, QR một lần, gửi chat lặp, quyền ẩn chat, revision và dữ liệu private. |
| Tạo và sửa lịch | Playwright tạo, sửa và hủy lịch qua studio trên `http://localhost:3000`. Các hành động đi qua Next.js và PostgREST thật. |
| Danh sách công khai | E2E phát hiện trang `/live` dừng tải vì hook bỏ qua đường dẫn API gốc. Sau bản sửa, Playwright đi từ danh sách có tên chủ phiên và ảnh minh họa đến phòng xem. Response chi tiết loại bỏ owner ID. Viewer mở `/live` sau khi phiên đã bắt đầu nhận được hình và sản phẩm đang ghim. |
| Sản phẩm ghim | Lượt E2E local sau khi nối checkout xác minh trình duyệt mới có liên kết chi tiết sản phẩm, rồi bấm **Đặt nhanh (COD Demo)** và thấy đúng sản phẩm ở checkout. |
| Dọn phòng | Bấm kết thúc phiên trong studio và kiểm tra qua LiveKit Room Service thấy phòng đã xóa. Worker xử lý phiên bỏ dở. Với một tiến trình QA trỏ tới địa chỉ LiveKit không phản hồi, worker ghi lần thất bại, đặt lịch retry và giữ phòng. Worker có kết nối thật xóa phòng ở lần thử tiếp theo. |
| Webhook | Endpoint local nhận payload được ký bằng khóa LiveKit trong `.env`. Gửi cùng sự kiện hai lần tạo một bản ghi. Yêu cầu thiếu xác thực trả 401. |
| HTTP | Sau migration, `http://localhost:3000/api/live`, `/api/live/config` và `/live/studio` trả 200 với Supabase local. Cài đặt riêng trong `.env.local` chỉ đổi database của livestream. Hai cổng Supabase QA được giới hạn ở loopback. Supabase hosted hiện báo thiếu bảng livestream. |

## Phạm vi đang chờ xác minh

Supabase Data API của project hosted hiện tại báo `PGRST205` cho các bảng livestream. Dashboard yêu cầu đăng nhập và CLI chưa có phiên quản trị Supabase. Bài kiểm thử tích hợp dùng Supabase local thật và LiveKit Cloud thật với camera và mic giả lập. Webhook có chữ ký được gửi vào localhost từ test runner.

Nghiệm thu trên staging cần áp dụng ba migration, tạo tài khoản pilot, xác minh Realtime, cấu hình webhook và scheduler rồi chạy lại luồng trên laptop và điện thoại thật. Các bước thao tác và cách phân biệt lỗi biến môi trường với lỗi thiếu schema nằm trong [hướng dẫn NaiFarm Live](README.md).


## Kết quả bổ sung 25/11/2026

Migration `202611250004_live_camera_angle.sql` đã áp dụng lên Supabase QA loopback. SQL regression, camera angle API và local Playwright tích hợp với Supabase Auth/Postgres/Realtime và LiveKit Cloud đã qua, bao gồm hai viewer đổi góc đồng bộ, từ chối camera lạ, chuyển camera phía trước/sau giả lập và fallback. Hosted Supabase vẫn thiếu schema; không có bằng chứng build toàn app, staging, webhook delivery từ provider hoặc camera vật lý. Browser camera permission denial shows localized guidance and is asserted by Playwright.