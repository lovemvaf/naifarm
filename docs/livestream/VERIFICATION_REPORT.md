# Kết quả kiểm thử NaiFarm Live

## Cập nhật giao diện đăng nhập và demo

- Trang live và studio dùng phiên Supabase browser client chung với đăng nhập NaiFarm ở header; form đăng nhập pilot riêng đã được xóa. Tài khoản phải cùng Supabase project và vẫn cần quyền host theo ACL.
- Đường dẫn `/live/demo` và link “Xem minh họa” đã được gỡ; kịch bản Playwright kiểm tra 404 và luồng studio thật.
- Hướng dẫn thao tác mới: [DEMO_GUIDE.md](DEMO_GUIDE.md). Các kết quả cũ bên dưới là bằng chứng từ những lượt chạy trước; chúng chưa được chạy lại sau các thay đổi giao diện này.

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
| HTTP | Sau migration, `http://localhost:3000/api/live`, `/api/live/config` và `/live/studio` trả 200 với Supabase local. Cài đặt riêng trong `.env.local` chỉ đổi database của livestream. Hai cổng Supabase QA được giới hạn ở loopback. Trước đợt áp dụng hosted ngày 25/11/2026, Data API báo thiếu bảng livestream; trạng thái mới nhất ở phần xác minh bổ sung bên dưới. |

## Phạm vi đang chờ xác minh

Trước đợt áp dụng hosted ngày 25/11/2026, Supabase Data API báo `PGRST205` cho các bảng livestream. Bản ghi trạng thái cũ này đã được cập nhật ở phần xác minh bổ sung mới nhất phía dưới.

Các bước còn lại sau khi áp dụng schema hosted được liệt kê trong phần xác minh bổ sung mới nhất và [hướng dẫn NaiFarm Live](README.md).


## Kết quả bổ sung 25/11/2026

Migration `202611250004_live_camera_angle.sql` đã áp dụng lên Supabase QA loopback. SQL regression, camera angle API và local Playwright tích hợp với Supabase Auth/Postgres/Realtime và LiveKit Cloud đã qua, bao gồm hai viewer đổi góc đồng bộ, từ chối camera lạ, chuyển camera phía trước/sau giả lập và fallback. Tại thời điểm ghi nhận này chưa có bằng chứng build toàn app, webhook delivery từ provider hoặc camera vật lý. Browser camera permission denial shows localized guidance and is asserted by Playwright.

## Xác minh bổ sung 25/11/2026

- `/live` hiện render `LiveViewer`, còn `/live/demo` giữ trang phát lại minh họa. `/live/<UUID>` mở viewer theo session UUID; các ID replay cũ vẫn dùng `LiveRoomView`.
- `tsc --noEmit --incremental false` và `next build` trên worktree hiện tại đều thành công. ESLint cho hai route và `LiveViewer` thành công.
- `next start` trả HTTP 200 cho `/live`, `/live/demo`, `/live/studio` và `/live/<UUID>`. Sau khi khởi động Docker QA, `/api/live` và `/api/live/config` cùng trả 200; danh sách trống là kết quả hợp lệ.
- `tests/livestream-local.mjs` qua với Supabase Auth/PostgreSQL/Realtime local và LiveKit Cloud: studio và hai viewer phát media, camera QR/đổi góc đồng bộ, chat Realtime/ẩn tin, ghim sản phẩm, trạng thái offline/reconnect, CRUD lịch, end/reconcile, signed webhook và dedup. Lượt test cũng trỏ worker thứ hai tới LiveKit không phản hồi, xác nhận room được giữ và retry được lên lịch, rồi worker khỏe mạnh xóa room ở lượt sau.
- Test cũ chờ COD checkout mở thẳng nhưng app chuyển người chưa xác thực tới `/sign-in?redirect=/checkout`. Playwright đã được cập nhật để kiểm tra đúng redirect này; hướng dẫn nêu riêng pilot Live và đăng nhập NaiFarm mua hàng.
- Ảnh production người dùng gửi và trang production đã mở trong trình duyệt vẫn là trang phát lại minh họa. Chưa có deployment mới hoặc lời gọi `/api/live` ở production; source fix/build local chưa được phát hành.
- Nội dung thông báo lỗi khi thiếu schema đã được sửa để chỉ rõ cần đủ ba migration.
- MCP xác nhận đúng Supabase project URL với `SUPABASE_URL` trong `.env`. Migration history hiện có `202611250001_nai_documents`, `202611250002_livestream`, `202611250003_live_realtime`, `202611250004_live_camera_angle` và `202611250005_nai_documents_permissions`. Các bảng livestream tồn tại; `live_sessions`, `live_updates`, `live_host_permissions` và `live_webhook_events` đều rỗng sau hosted E2E cleanup.
- Không chạy lại `0001_init.sql`/`0002_seed.sql`: project đã có schema nền và dữ liệu. `202611250005_nai_documents_permissions` đã có trong hosted migration history và được xác nhận là quyền cho bảng/tìm kiếm tài liệu NaiAI, không phải migration livestream.
- GET production `https://naifarm.vercel.app/api/live` sau khi áp dụng vẫn trả 503 với thông báo livestream chưa bật. Thông báo production còn là bản cũ; cần đặt `NAIFARM_LIVE_ENABLED=1` ở đúng Vercel environment và deploy lại code hiện tại. Việc chạy SQL không thay đổi biến môi trường hay deployment.
- Không dùng Docker: `next start` local trên cổng 3110 với các biến `LIVE_SUPABASE_*` được ánh xạ tạm từ `.env`. Kiểm tra lại ngày 25/11/2026: `/api/live` trả 200 với `{"sessions":[]}`, `/api/live/config` trả 200 và `/live/studio` trả 200.
- Chrome trên máy hiện mở được `http://localhost:3110/live` trong secure context và nhận diện 1 camera cùng 1 microphone. Quyền camera/mic còn ở trạng thái `prompt`; chưa gọi capture hay xác nhận stream bằng thiết bị vật lý.
- LiveKit Room Service xác thực thành công bằng `LIVEKIT_*` trong `.env`. Hosted browser E2E chạy từ app local nhưng dùng Supabase hosted thật (Auth/PostgreSQL/Realtime) và LiveKit Cloud thật: camera/mic giả Chromium, hai viewer, QR/camera phụ, đồng bộ góc, chat/ẩn tin, ghim, offline/reconnect, CRUD lịch, end và COD redirect đều qua.
- Hosted worker test kết thúc phiên bỏ dở, xóa room thật qua LiveKit; webhook có chữ ký được nhận và khử trùng lặp. Sau cleanup, hosted `live_sessions`, `live_updates`, `live_host_permissions`, `live_webhook_events` đều 0 row và LiveKit có 0 room. Pilot QA tạm đã xóa.
- Các pilot đã xóa sau test; cần tạo pilot dùng cho demo thủ công. Chưa kiểm tra webhook được LiveKit Cloud gửi từ bên ngoài, cron hosted, Vercel Preview/production deployment hoặc camera/mic vật lý.
- `vercel whoami` hiện trả `The specified token is not valid`; repo cũng chưa có `.vercel/project.json`. Chưa có deployment nào được tạo; cần `vercel login` rồi `vercel link` trước khi cấu hình Preview.
- Đã mở Cloudflare Quick Tunnel tạm thời sau khi người dùng cho phép. Chrome truy cập `/live/studio` qua HTTPS xác nhận `isSecureContext=true`, `navigator.mediaDevices.getUserMedia` có sẵn, `/api/live` trả 200 với danh sách rỗng và `/api/live/config` chỉ trả Supabase URL/publishable key. Tunnel không tạo session hoặc bật camera/mic vật lý; đã dừng sau khoảng 20 phút không có request mới để tránh giữ URL công khai.
- Chrome mobile emulation `390x844` qua tunnel không tràn ngang; camera và microphone vẫn ở trạng thái `prompt`, thiết bị thật chưa được xác minh.
- Qua tunnel, request chưa đăng nhập tới `GET /api/live/reconcile` trả 401 và `POST /api/live` trả 401; hai request không tạo session.
- Read-only hosted Supabase check cho thấy chưa cài `pg_cron`/`pg_net`, schema `cron.job` chưa tồn tại và không có session scheduled/live/reconnecting. Vì chưa có URL deployment ổn định cùng `CRON_SECRET` tương ứng, chưa tạo job để tránh gửi request lặp tới route chưa bật.
- Chạy mới `tests/livestream-media.mjs` trên app local cổng 3110 và LiveKit Cloud thật bằng Playwright Python trong cache tạm: PASS video host, camera phụ từ trang mobile-shaped, hai viewer cùng đổi góc qua fixture Realtime, viewer count, audio host, fallback camera chính khi camera phụ rời, chat/hide/pin qua WebSocket fixture và cleanup room. Lượt đỏ đầu tiên phát hiện fixture thiếu handler `/camera-angle`; fixture đã được cập nhật và bài test chạy xanh. Video/mic dùng thiết bị ảo Chromium, không phải camera vật lý.
- Chạy mới TypeScript compiler cục bộ (`node node_modules/typescript/bin/tsc --noEmit --incremental false`) và `git diff --check`: đều thành công. Không chạy lại `next build` vì production server local đang dùng artifact `.next`; lượt này chỉ đổi fixture Python và tài liệu.

## Còn cần trước khi bật staging/production

QA local đã xác minh migrations, Realtime, retry, webhook nhận payload có chữ ký ở localhost và luồng trên camera/mic giả lập. Trước khi bật livestream trên production còn cần cấp tài khoản pilot, cấu hình webhook provider tới HTTPS và lịch chạy `/api/live/reconcile`, deploy bản có route mới, rồi chạy E2E và thử camera/mic vật lý trên laptop/điện thoại. Các bước này chưa được xác minh trên production hoặc thiết bị thật.

## Thay đổi sau lượt xác minh 25/11/2026

- Trang live/studio nay dùng chung phiên Supabase của đăng nhập NaiFarm ở header; form đăng nhập pilot riêng và route `/live/demo` đã được gỡ. Không dùng kết quả Playwright cũ ở trên để khẳng định giao diện mới đã qua E2E.
- Hướng dẫn demo mới nằm tại `DEMO_GUIDE.md`. Typegen, TypeScript và ESLint cho các file đã sửa được chạy lại; kết quả build/runtime hiện tại được ghi trong phản hồi công việc này.
- Lượt kiểm tra sau sửa: `npx next typegen` và `npm run typecheck -- --incremental false` thành công; ESLint có 0 lỗi và 1 cảnh báo `<img>` tồn tại ở header. `next build` compile thành công nhưng dừng ở bước TypeScript do `spawn EPERM`; chưa có build hoàn tất.
- Các server đang mở dùng cấu hình/artifact cũ: tại thời điểm kiểm tra cổng 3000 trả `/api/live` HTTP 500, cổng 3110 trả HTTP 200 nhưng cả hai vẫn phục vụ `/live/demo` HTTP 200. Cần dừng và khởi động lại Next với cùng Supabase URL/key trong hướng dẫn trước khi kiểm tra thay đổi trên browser.