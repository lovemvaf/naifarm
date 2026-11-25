# Chạy và nghiệm thu NaiFarm Live

`/live` là trang xem, `/live/studio` là phòng phát và `/live/demo` là phần minh họa. Khách mở phiên bằng đường dẫn `/live/<id>`. Tài khoản pilot được cấp quyền mới có thể chat hoặc mở studio. Catalog, truy xuất QR và giỏ hàng trong phòng phát dùng dữ liệu demo của NaiFarm.

Nếu project hosted chưa có migration, xem [cách chạy Supabase local và LiveKit Cloud trên laptop](LOCAL_QA.md). Khi có bộ biến `LIVE_SUPABASE_URL`, `LIVE_SUPABASE_PUBLISHABLE_KEY`, `LIVE_SUPABASE_SECRET_KEY`, livestream dùng bộ này và các module khác tiếp tục dùng `SUPABASE_*`. Chỉ đặt bộ dùng riêng ở môi trường cần tách database.

Xem [đặc tả và luồng sử dụng](SPEC.md), [kiến trúc và cơ sở dữ liệu](ARCHITECTURE.md), [API và quyền truy cập](API_CONTRACT.md), [ma trận nghiệm thu](TEST_PLAN.md) và [kết quả đã xác minh](VERIFICATION_REPORT.md).

## 1. Chuẩn bị project thử nghiệm

1. Mở đúng Supabase project thử nghiệm. Vào **SQL Editor → New query**, chạy [migration tạo bảng](../../supabase/migrations/202611250002_livestream.sql) rồi [migration Realtime và vòng đời phòng](../../supabase/migrations/202611250003_live_realtime.sql), cuối cùng [migration đồng bộ góc camera](../../supabase/migrations/202611250004_live_camera_angle.sql), theo thứ tự. Nếu migration đã được ghi nhận, chỉ chạy phần chưa áp dụng. Supabase CLI có thể chạy migration khi đã link đúng project và có quyền kết nối PostgreSQL.
2. Trong **Authentication → Users**, tạo một tài khoản email/mật khẩu cho host và một tài khoản cho người gửi chat. Xác nhận email test khi tạo tài khoản. Sao chép UUID từ trang Users, rồi chạy đoạn dưới trong SQL Editor sau khi thay hai UUID mẫu. `farm-ba-tu-demo` tương ứng Nhà vườn Ba Tư. Chuỗi rỗng ở hàng thứ hai cấp chat mà không cấp quyền điều khiển bất kỳ vườn nào.

   ```sql
   insert into public.live_host_permissions (user_id, farm_id, display_name, can_chat)
   values
     ('UUID_HOST', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', true),
     ('UUID_CHAT', '', 'Khách thử nghiệm', true)
   on conflict (user_id, farm_id) do update
   set display_name = excluded.display_name, can_chat = excluded.can_chat, enabled = true;
   ```

3. Xác minh publication `supabase_realtime` có bảng `public.live_updates`. Hai bảng chứa phiên và nội dung chat chỉ được truy vấn qua API NaiFarm. [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
4. Mở LiveKit Cloud project tương ứng với ba biến `LIVEKIT_*` trong `.env`. Ở project thử nghiệm dành riêng, kiểm tra tùy chọn tự tạo room đã tắt. Server NaiFarm gọi CreateRoom khi host bắt đầu phiên. Tắt tự tạo room giúp token cũ không mở lại phòng đã xóa. [LiveKit project configuration](https://docs.livekit.io/reference/api/projects/)
5. Nếu đã có URL HTTPS thử nghiệm, cấu hình webhook LiveKit tới `https://<staging-domain>/api/webhooks/livekit` và chọn API key khớp với `.env`. Dùng URL thực sự truy cập được từ LiveKit. Các sự kiện phòng, participant và track kích hoạt đối chiếu trạng thái qua Room Service. [LiveKit webhooks](https://docs.livekit.io/intro/basics/rooms-participants-tracks/webhooks-events/)

## 2. Chạy local trên Windows

1. Mở PowerShell trong `F:\naifarm`. Giữ các giá trị hiện có trong `.env`. Khi project thử nghiệm đã sẵn sàng, thêm `NAIFARM_LIVE_ENABLED=1` vào `.env.local`. Dùng `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, và `LIVEKIT_API_SECRET` của môi trường thử. Endpoint cấu hình trình duyệt chỉ trả URL và publishable/anon key. Code vẫn đọc `LIVE_ENABLED` nếu biến mới chưa được đặt.
2. Dừng và khởi động lại Next.js sau khi đổi môi trường. Nếu đã chạy cổng 3000, dùng terminal đang giữ tiến trình để dừng trước.

   ```powershell
   Set-Location F:\naifarm
   npm install
   npm run dev
   ```

3. Kiểm tra API. Danh sách rỗng với mã 200 là hợp lệ khi chưa có lịch.

   ```powershell
   Invoke-RestMethod http://localhost:3000/api/live
   ```

4. Mở `http://localhost:3000/live/studio` bằng Chrome hoặc Edge. Dùng localhost cho host trên chính laptop. Nếu điện thoại cần xem hoặc phát, mở ứng dụng qua URL HTTPS thử nghiệm trên cả hai thiết bị. QR ghép camera mang theo tên miền mà studio đang mở. QR tạo từ localhost sẽ trỏ về localhost của điện thoại. [MediaDevices.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## 3. Thử với laptop và điện thoại

Để có URL HTTPS thử trên điện thoại bằng Vercel, liên kết repo với project staging, vào **Settings → Environment Variables** và đặt các biến ở môi trường **Preview**. Tạo Preview Deployment cho branch livestream rồi mở URL trong mục Deployments. Cả laptop và điện thoại dùng cùng URL đó. Nếu Preview có Deployment Protection, đăng nhập quyền truy cập trên mỗi thiết bị. Kiểm tra LiveKit gọi được endpoint webhook từ bên ngoài trước khi nghiệm thu webhook, vì quyền truy cập của browser không cấp quyền cho LiveKit. [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) · [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)

1. **Laptop phát.** Vào studio, bấm **Đăng nhập pilot**, nhập email/mật khẩu host đã cấp. Chọn nhà vườn, nhập tiêu đề, mô tả, chọn sản phẩm có sẵn. Điền giờ Việt Nam hoặc để trống nếu sẽ phát ngay. Bấm **Tạo lịch**. Có thể sửa lịch bằng **Lưu lịch** hoặc hủy khi phiên chưa bắt đầu.
2. **Kiểm tra camera và âm thanh.** Bấm **Xem trước camera** và **Kiểm tra mic**, rồi cấp quyền trong trình duyệt. Nói vào mic và xem thanh tín hiệu. Khi có nhiều thiết bị, dùng **Thiết bị camera** hoặc **Thiết bị mic** ở bước chuẩn bị rồi mở lại phần xem trước tương ứng. Bấm **Bắt đầu phát**, chờ **Đang phát** và xem chất lượng kết nối cùng thời gian phát. Nếu mic hệ điều hành bị chặn, dùng **Bật mic** sau khi cấp lại quyền.
3. **Viewer độc lập.** Mở **Mở trang xem**, sao chép URL sang cửa sổ ẩn danh, laptop khác hoặc trình duyệt trên điện thoại. Bấm **Bật âm thanh** để nghe mic laptop, **Tắt âm thanh** để tắt tiếng và **Toàn màn hình** nếu trình duyệt hỗ trợ. Số người xem đếm kết nối viewer trong LiveKit, mỗi tab là một kết nối. Dùng tai nghe để tránh vọng nếu phát và xem cùng phòng.
4. **Camera điện thoại.** Mở studio từ chính URL HTTPS mà điện thoại truy cập được. Bấm **Tạo QR ghép camera**, quét trên iPhone bằng Camera rồi mở Safari, hoặc trên Android qua Chrome. Bấm **Cho phép và xem trước**, đổi camera trước/sau nếu cần và bấm **Phát camera phụ**. Điện thoại gửi video, mic vẫn lấy từ host. Khi QR hết hạn hoặc đã sử dụng, chủ phiên tạo QR mới. Nếu thiết bị cũ đã rời trang, chủ phiên bấm **Ngắt camera phụ** để ghép thiết bị khác.
5. **Đổi góc.** Trên một viewer bấm **Camera điện thoại**. Viewer còn lại phải nhận góc mới qua Realtime. Bấm **Camera chính** ở một viewer để đồng bộ ngược lại cho tất cả. Ngắt camera điện thoại để kiểm tra viewer đang xem góc phụ quay về góc chính. Kiểm tra mic laptop vẫn nghe được sau khi đổi góc.
6. **Chat và sản phẩm.** Đăng nhập tài khoản chat trên một viewer, gửi tin và kiểm tra trang ẩn danh thấy tin mà không tải lại. Trong studio, bấm **Ẩn tin nhắn** và kiểm tra tin biến mất ở cả hai viewer. Chọn một sản phẩm trong mục **Sản phẩm đang ghim**, kiểm tra hai viewer nhận thay đổi và viewer mới mở thấy đúng sản phẩm. Bấm **Đặt nhanh (COD Demo)** để kiểm tra sản phẩm đã vào checkout demo.
7. **Kết thúc và khôi phục.** Bấm **Kết thúc phiên** rồi xác nhận. Trang xem riêng phải hiện phiên đã kết thúc. Kiểm tra LiveKit Rooms không còn room của phiên. Thử một phiên khác, ngắt mạng host và kết nối lại trong khoảng 60 giây. Nếu quá hạn, worker sẽ đóng phiên và thử dọn room lại khi provider lỗi.

## 4. Retry phòng và kiểm tra lỗi

- Webhook và các lượt đọc trạng thái kích hoạt reconcile. Studio kiểm tra media định kỳ trong lúc host đang phát. Chat cập nhật theo thông báo Postgres Changes, không có bộ đếm thời gian tải chat.
- Để dọn phòng ngay cả khi không còn tab nào mở, đặt `CRON_SECRET` ở server và cấu hình scheduler của môi trường thử gọi `GET https://<staging-domain>/api/live/reconcile` với `Authorization: Bearer <CRON_SECRET>`, khoảng 15–30 giây nếu scheduler hỗ trợ. Lỗi provider giữ trạng thái chờ dọn và tăng khoảng cách giữa các lần thử đến tối đa hai phút. Chỗ phát toàn hệ thống được giữ tới lúc dọn xong.
- Với 503 báo chưa bật, kiểm tra biến enable và khởi động lại Next.js. Với 503 báo thiếu schema, kiểm tra cả ba migration livestream trên đúng Supabase project. Với 403 tại studio, kiểm tra UUID, quyền theo vườn và cột `enabled`. Với 409 khi xin token, kiểm tra phiên đang phát và room đã sẵn sàng.
`PGRST205` means the active Supabase project has no `live_sessions` table (or its schema cache cannot see it). Apply migrations `202611250002`, `202611250003`, and `202611250004` to that same project, refresh the schema cache if needed, then redeploy. A local HTTP 200 does not validate the hosted database.
- Khi camera hoặc mic bị chặn, kiểm tra quyền trong trình duyệt và hệ điều hành, đóng ứng dụng đang dùng camera rồi thử lại. Trên điện thoại, mở bằng Safari hoặc Chrome từ HTTPS. Nếu ghép bằng QR hết hạn hoặc đã dùng, ngắt camera phụ cũ trong studio rồi tạo QR mới.
- Nếu không nhận được media, thử lại bằng mạng khác để phân biệt lỗi cấu hình với ICE/TURN bị mạng đang dùng chặn. So sánh trạng thái participant và track trong LiveKit Cloud. Nếu host đã tải lại studio trong lúc phiên chưa hết hạn, chọn **Kết nối camera chính**. Viewer đã ngắt hẳn có thể bấm **Kết nối lại**.
- Nếu chat hoặc ghim không cập nhật, kiểm tra WebSocket Realtime, publication `supabase_realtime`, quyền SELECT của anon trên `live_updates`, URL và publishable key đúng project. Nếu webhook Delivery gặp 401, đối chiếu API key được chọn ở LiveKit, raw body và middleware bảo vệ URL staging.
- Khi dừng thử nghiệm, đóng phiên trong studio trước. Xác minh room đã xóa, rồi đặt `NAIFARM_LIVE_ENABLED=0` nếu cần tắt tính năng.

### Lập lịch worker bằng Supabase Cron trên staging

Supabase Cron hỗ trợ lịch 30 giây và có thể gửi HTTP qua `pg_net`. Dùng đường dẫn HTTPS staging ổn định để webhook và scheduler tiếp tục hoạt động sau mỗi Preview Deployment. [Supabase Cron](https://supabase.com/docs/guides/cron/quickstart) · [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net)

1. Trong Supabase staging, bật **Cron** và extension `pg_net`. Trong Vault tạo hai mục `naifarm_live_staging_url` chứa URL gốc của staging và `naifarm_live_cron_secret` khớp biến `CRON_SECRET` ở server. [Supabase Vault](https://supabase.com/docs/guides/database/vault)
2. Gửi một GET thử tới `/api/live/reconcile` với bearer worker từ terminal quản trị và xác nhận HTTP 200. Cấu hình bảo vệ staging phải cho scheduler tiếp cận endpoint. API tự xác thực bearer.
3. Tạo job trong SQL Editor của staging.

   ```sql
   select cron.schedule('naifarm-live-reconcile', '30 seconds', $job$
     select net.http_get(
       url := rtrim(endpoint.decrypted_secret, '/') || '/api/live/reconcile',
       headers := jsonb_build_object('Authorization', 'Bearer ' || worker.decrypted_secret),
       timeout_milliseconds := 15000
     )
     from vault.decrypted_secrets endpoint
     cross join vault.decrypted_secrets worker
     where endpoint.name = 'naifarm_live_staging_url'
       and worker.name = 'naifarm_live_cron_secret';
   $job$);
   ```

4. Kiểm tra job có lượt chạy trong Supabase Cron và Vercel nhận GET 200 ở đúng route. Thử kết thúc phiên, đóng tất cả tab rồi kiểm tra trạng thái room từ LiveKit Dashboard. Để dừng job staging, gọi `select cron.unschedule('naifarm-live-reconcile');`.

## 5. Kiểm thử tự động

```powershell
npm run typecheck -- --incremental false
npm run lint
npm run build
```

Chạy [kiểm thử SQL](../../tests/livestream.sql) trên database thử nghiệm đã áp dụng ba migration, ví dụ `psql "$env:NAIFARM_TEST_DB_URL" -f tests/livestream.sql`. Test xác nhận quyền, QR một lần, sửa đổi chat và giới hạn một phòng kể cả khi cleanup còn chờ. Mọi dữ liệu test trong file SQL nằm trong giao dịch rollback.

Với Python Playwright và Chromium đã cài, bật ứng dụng local và đặt `NAIFARM_E2E_URL` theo đúng cổng. Có thể đặt `NAIFARM_E2E_SCREENSHOTS` trỏ vào thư mục QA riêng khi chạy bộ E2E tổng.

```powershell
python -m pip install playwright
python -m playwright install chromium
$env:NAIFARM_E2E_URL = 'http://localhost:3000'
python tests/e2e-verify.py
node --env-file=.env tests/livestream-media.mjs
```

Kiểm thử media tạo một room LiveKit QA tạm và xóa khi xong. Chạy trong LiveKit project được phép kiểm thử. Các luồng camera, audio và chọn góc dùng LiveKit thật với thiết bị Chromium giả lập. API NaiFarm và sự kiện Supabase trong test media dùng fixture để không phụ thuộc vào dữ liệu của project đang triển khai. Khi nghiệm thu staging, thực hiện lại các bước ở mục 3 trên thiết bị vật lý với tài khoản thật đã cấp và WebSocket của project thử nghiệm.
