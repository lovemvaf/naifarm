# Hướng dẫn chạy và demo NaiFarm Live

Tài liệu này chạy luồng livestream realtime ở `/live` và `/live/studio`. Route xem minh họa riêng đã được gỡ. Livestream dùng Supabase Auth/Postgres/Realtime và LiveKit Cloud; không cần Docker nếu bạn đã có Supabase project và LiveKit Cloud.

## 1. Kiểm tra điều kiện trước khi chạy

1. Trong `F:\naifarm`, kiểm tra `.env` và `.env.local`. Không chia sẻ hoặc chụp các giá trị secret.
2. Tài khoản đăng nhập ở header và livestream phải thuộc **cùng một Supabase project**. Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` (hoặc URL đang dùng bởi client NaiFarm) trùng project với `LIVE_SUPABASE_URL`; nếu không đặt `LIVE_SUPABASE_URL`, API livestream dùng `SUPABASE_URL`.
3. Project Supabase đó cần các migration livestream `202611250002_livestream.sql`, `202611250003_live_realtime.sql`, `202611250004_live_camera_angle.sql`. Không chạy lại migration nếu lịch sử đã ghi nhận chúng.
4. Các biến server phải có giá trị hợp lệ:

   - `NAIFARM_LIVE_ENABLED=1`
   - `LIVE_SUPABASE_URL`, `LIVE_SUPABASE_PUBLISHABLE_KEY`, `LIVE_SUPABASE_SECRET_KEY` (hoặc bộ `SUPABASE_*` tương ứng)
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

   Supabase secret/service key và LiveKit API secret chỉ nằm phía server; không đưa vào biến `NEXT_PUBLIC_*`.

5. Trong Supabase **Authentication → Users**, tạo hoặc dùng email đăng nhập NaiFarm thật cho host. Tạo thêm một tài khoản thật nếu cần thử chat từ viewer khác. Nút chọn nhanh tài khoản trải nghiệm ở trang đăng nhập không tạo phiên Supabase và không dùng để livestream.
6. Lấy UUID của host trong Supabase Auth → Users. Cấp quyền đúng nhà vườn trong SQL Editor, thay UUID nếu cần:

   ```sql
   insert into public.live_host_permissions (user_id, farm_id, display_name, can_chat)
   values ('UUID_HOST', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', true)
   on conflict (user_id, farm_id) do update
   set display_name = excluded.display_name, can_chat = excluded.can_chat, enabled = true;
   ```

   Quyền máy chủ kiểm tra UUID và `farm_id`; đăng nhập thành công tự nó không cấp quyền host.

## 2. Chạy ứng dụng không dùng Docker

Mở PowerShell tại `F:\naifarm`. Nếu ứng dụng đang chạy bằng cấu hình cũ, dừng tiến trình đó trước. Nạp các giá trị Supabase và LiveKit từ file môi trường vào process hiện tại mà không in secret:

Nếu `LIVE_SUPABASE_URL` trong file môi trường là localhost nhưng Supabase QA local không chạy, dùng **một Supabase QA/staging hosted** thay cho đoạn tự đọc file bên dưới. Thay placeholder bằng giá trị staging trong dashboard; đặt cùng URL/key cho API live và browser login:

```powershell
$env:LIVE_SUPABASE_URL = 'https://<staging-project>.supabase.co'
$env:LIVE_SUPABASE_PUBLISHABLE_KEY = '<staging-publishable-key>'
$env:LIVE_SUPABASE_SECRET_KEY = '<staging-secret-key>'
$env:NEXT_PUBLIC_SUPABASE_URL = $env:LIVE_SUPABASE_URL
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $env:LIVE_SUPABASE_PUBLISHABLE_KEY
$env:NAIFARM_LIVE_ENABLED = '1'
npm.cmd run dev -- --hostname 0.0.0.0 --port 3000
```

Chỉ dùng project staging, không lấy URL/secret production cho demo. Giữ PowerShell này mở trong toàn bộ phiên test.

```powershell
Set-Location F:\naifarm
$envMap = @{}
foreach ($file in @('.env', '.env.local')) {
    if (Test-Path -LiteralPath $file) {
        foreach ($line in Get-Content -LiteralPath $file) {
            if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
                $envMap[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
            }
        }
    }
}
$liveUrl = $envMap['LIVE_SUPABASE_URL']
$liveKey = $envMap['LIVE_SUPABASE_PUBLISHABLE_KEY']
$liveSecret = $envMap['LIVE_SUPABASE_SECRET_KEY']
if (-not $liveUrl) { $liveUrl = $envMap['SUPABASE_URL'] }
if (-not $liveKey) { $liveKey = $envMap['SUPABASE_PUBLISHABLE_KEY'] }
if (-not $liveSecret) { $liveSecret = $envMap['SUPABASE_SECRET_KEY'] }
$env:LIVE_SUPABASE_URL = $liveUrl
$env:LIVE_SUPABASE_PUBLISHABLE_KEY = $liveKey
$env:LIVE_SUPABASE_SECRET_KEY = $liveSecret
$env:NEXT_PUBLIC_SUPABASE_URL = $liveUrl
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $liveKey
$env:NAIFARM_LIVE_ENABLED = '1'
npm.cmd run dev -- --hostname 0.0.0.0 --port 3000
```

Lệnh ưu tiên endpoint livestream hiện có trong `.env.local` để header login và API live dùng cùng project; nếu không có thì dùng bộ Supabase chung từ `.env`. Tài khoản host phải tồn tại trong chính project đó. LiveKit variables vẫn được Next.js nạp từ file môi trường. Nếu `npm.cmd` không chạy được, dùng `npm run dev -- --hostname 0.0.0.0 --port 3000`.

`.env.local` không được trỏ livestream tới `127.0.0.1:56321` trừ khi Supabase local đang chạy. Khi không có Docker, bỏ các biến `LIVE_SUPABASE_*` local để API dùng chung `SUPABASE_*` với header đăng nhập, hoặc đặt cả `LIVE_SUPABASE_*` và `NEXT_PUBLIC_SUPABASE_*` sang cùng một Supabase QA/staging hosted đã có migrations. Không đổi sang Supabase production chỉ để vượt qua lỗi kết nối.

Mở terminal PowerShell thứ hai để xác nhận API:

```powershell
Invoke-RestMethod http://localhost:3000/api/live
Invoke-RestMethod http://localhost:3000/api/live/config
```

Hai request phải trả HTTP 200. Danh sách `sessions` rỗng là hợp lệ nếu chưa có lịch. Nếu có 503, không demo camera tiếp: kiểm tra `NAIFARM_LIVE_ENABLED`, biến Supabase/LiveKit và migration trong đúng project.

## 3. Đăng nhập bằng tài khoản NaiFarm chung

1. Mở `http://localhost:3000/live/studio` trên Chrome hoặc Edge.
2. Nhấn **Đăng nhập** ở header NaiFarm.
3. Nhập email và mật khẩu Supabase Auth của host ở mục **Đăng nhập bằng Email & Mật khẩu**. Hồ sơ “Không gian trải nghiệm” trên menu góc phải chỉ đổi vai trò demo, không tạo phiên Auth để phát livestream.
4. Sau khi đăng nhập, mở lại **OCOP Live → Studio phát sóng**.
5. Nếu trang báo không có quyền hoặc trả 403, kiểm tra UUID tài khoản đang đăng nhập và hàng `live_host_permissions` có `enabled=true`, `farm_id` đúng nhà vườn. Nếu Supabase trả lỗi xác thực, kiểm tra URL/project của browser client và API livestream có trùng nhau không.

Tài khoản viewer có thể xem phiên công khai. Muốn gửi chat, tài khoản cần quyền chat theo chính sách hiện có; tài khoản chat không mặc nhiên có quyền điều khiển studio.

## 4. Demo phát và xem trên cùng laptop

1. Trong Studio, chọn nhà vườn có quyền, nhập tiêu đề (ít nhất 3 ký tự), mô tả nếu cần và sản phẩm giới thiệu. Để trống giờ phát nếu phát ngay; chọn giờ Việt Nam nếu muốn kiểm thử lịch.
2. Nhấn **Tạo lịch**. Phiên mới sẽ mở trang điều khiển của chính phiên.
3. Nhấn **Xem trước camera**, chọn đúng webcam nếu máy có nhiều camera. Nhấn **Kiểm tra mic**, nói thử và xác nhận mức tín hiệu thay đổi.
4. Nhấn **Bắt đầu phát**. Khi trình duyệt hỏi quyền, cho phép camera và mic. Chờ trạng thái **Đang phát**.
5. Nhấn **Mở trang xem**, hoặc mở URL phiên `/live/<id>` trong cửa sổ ẩn danh. URL này không chứa quyền host.
6. Ở viewer, bật âm thanh theo nhu cầu. Nếu cùng laptop vừa phát vừa xem, dùng tai nghe để tránh vọng âm. Số người xem thay đổi theo participant viewer thật đang nối LiveKit.

## 5. Demo camera điện thoại và đổi góc

Điện thoại cần HTTPS; `localhost` trên điện thoại trỏ vào điện thoại đó, không phải laptop.

1. Dùng URL HTTPS Preview/staging đã cấu hình Supabase và LiveKit **staging**, hoặc tunnel tạm đã được người vận hành cho phép. Mở cùng URL HTTPS trên laptop và điện thoại.
2. Bắt đầu phiên từ laptop như bước trên.
3. Trong Studio nhấn **Tạo QR ghép camera**. Dùng camera điện thoại quét QR và mở trang bằng Safari (iPhone) hoặc Chrome (Android).
4. Nhấn **Cho phép và xem trước**, cho phép camera. Chọn camera trước/sau nếu cần rồi nhấn **Phát camera phụ**.
5. Trở lại viewer trên laptop, nhấn **Camera điện thoại**. Viewer thứ hai đang mở cùng phiên phải tự đổi sang góc này; nhấn **Camera chính** để đồng bộ về webcam host.
6. Khi hoàn thành, ở camera điện thoại nhấn **Ngắt camera**, hoặc trong Studio nhấn **Ngắt camera phụ**. QR ghép camera dùng một lần và có hạn; tạo mã mới cho lần ghép sau.

## 6. Demo chat realtime và kết thúc phiên

1. Mở URL phiên trong trình duyệt thứ hai, đăng nhập bằng tài khoản Supabase khác qua nút **Đăng nhập** của header.
2. Gửi tin nhắn trong khung **Trò chuyện**. Tin phải xuất hiện ở các tab viewer/host đang mở mà không tải lại trang.
3. Trong Studio nhấn **Ẩn tin nhắn** trên tin cần ẩn. Xác nhận tin biến mất ở các viewer đang kết nối.
4. Trong Studio nhấn **Kết thúc phiên**, xác nhận. Viewer phải chuyển sang trạng thái phiên đã kết thúc.
5. Kiểm tra LiveKit Dashboard không còn room sau khi cleanup hoàn tất. Reconciliation chạy định kỳ cần được cấu hình riêng trên server; mở tab studio không thay thế worker production.

## 7. Chạy Playwright kiểm tra media tự động

Bài này dùng webcam/mic ảo của Chromium và tạo một room tạm trên **LiveKit QA**. API livestream và Supabase Realtime được fixture của test giả lập; bài này kiểm tra UI, WebRTC, ghép camera và đồng bộ góc ở browser, không thay cho E2E với database thật hoặc camera điện thoại.

1. Khởi động app theo mục 2 và xác nhận trang studio trả HTTP 200.
2. Mở PowerShell mới ở `F:\naifarm`. Đảm bảo `.env` đang chứa thông tin **LiveKit QA**, không production.
3. Chạy:

   ```powershell
   $env:NEXT_PUBLIC_SUPABASE_URL = '<cùng URL Supabase đã dùng khi chạy app ở mục 2>'
   $env:NAIFARM_E2E_URL = 'http://localhost:3000'
   node --env-file=.env tests/livestream-media.mjs
   ```

4. Chờ kết quả `PASS` cho video host, camera phụ, hai viewer, viewer count, đồng bộ góc, audio, chat fixture và dọn room. Script cũng tự kiểm tra room QA tạm đã được xóa.

Nếu cần xác minh Supabase Auth/Postgres/Realtime thật cùng LiveKit, dùng [LOCAL_QA.md](LOCAL_QA.md); bài đó cần một Supabase QA endpoint đang chạy. Không chạy Playwright integration vào production.

## 8. Lỗi thường gặp

| Quan sát | Kiểm tra |
| --- | --- |
| `GET /api/live` trả 500 hoặc 503 | `NAIFARM_LIVE_ENABLED=1`, đủ biến server Supabase/LiveKit, đúng project có migration. Nếu log ghi `fetch failed` hoặc Realtime kết nối `127.0.0.1:56321`, bỏ các `LIVE_SUPABASE_*` local đã dừng hoặc thay bằng bộ staging cùng project với browser auth, rồi khởi động lại Next.js. |
| Header báo đã đăng nhập nhưng studio không xác thực | Browser Supabase URL và `LIVE_SUPABASE_URL` phải là cùng project; đăng nhập lại sau khi đổi biến môi trường. |
| Studio trả 403 hoặc không có nhà vườn | Đối chiếu Auth UUID với `live_host_permissions`, `farm_id` và `enabled`. |
| Không thấy camera/mic | Dùng Chrome/Edge trên laptop hoặc HTTPS trên điện thoại; đóng ứng dụng khác đang giữ camera và cấp quyền trình duyệt. |
| Điện thoại quét QR nhưng không vào được | Mở HTTPS của cùng host mà studio đang dùng; không dùng URL localhost/127.0.0.1 trên điện thoại. |
| Viewer không nhận chat/góc quay mới | Kiểm tra WebSocket Supabase Realtime, publication `supabase_realtime` có `live_updates`, và URL/publishable key đúng project. |

## 9. Giới hạn xác minh

Hướng dẫn và test giả lập trình duyệt không chứng minh được camera điện thoại thật, webhook LiveKit từ Internet, lịch cron hosted, hoặc quyền trên project production. Chỉ bật production sau khi kiểm tra migration, webhook, reconciliation, tài khoản được cấp quyền, và một phiên thử trên thiết bị thật trong staging.
