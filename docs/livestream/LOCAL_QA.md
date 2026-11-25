# Thử NaiFarm Live với Supabase trên laptop

Cách này chạy Supabase Auth, PostgreSQL, PostgREST và Realtime bằng Docker trên máy. Next.js vẫn dùng LiveKit Cloud qua ba biến `LIVEKIT_*` trong `F:\naifarm\.env`. Supabase cục bộ chỉ dùng cho laptop và kiểm thử tự động. Để thử điện thoại vật lý từ thiết bị khác, dùng URL HTTPS staging với Supabase staging trong [hướng dẫn chính](README.md).

## Dùng stack đã cấu hình trên máy này

Từ PowerShell tại `F:\naifarm`, chạy `Invoke-RestMethod http://localhost:3000/api/live`. Nếu trả về danh sách phiên hoặc danh sách rỗng, chuyển trực tiếp tới mục [tạo tài khoản phát](#tạo-một-tài-khoản-phát-để-thử-bằng-tay). Sau đó mở `http://localhost:3000/live/studio`. Nếu Next.js chưa chạy, dùng `npm run dev`. File `.env.local` của workspace đã trỏ riêng livestream tới Supabase QA local.

Nếu Docker Desktop vừa khởi động lại, khởi động **các container QA đã tồn tại** rồi gọi lại API. Cấu hình cổng được giữ khi dùng `docker start`.

```powershell
docker start supabase_db_naifarm-live-qa
docker start supabase_kong_naifarm-live-qa supabase_auth_naifarm-live-qa supabase_rest_naifarm-live-qa supabase_realtime_naifarm-live-qa
docker port supabase_kong_naifarm-live-qa
```

Chờ các container ổn định rồi thử lại. Gateway của stack này dùng `127.0.0.1:56321` và PostgreSQL dùng `127.0.0.1:56322`.

## Dựng database thử nghiệm

Mở Docker Desktop và chờ `docker version` hiện phần Server. Từ PowerShell tại `F:\naifarm`, chạy các lệnh sau. Docker tải các image Supabase trong lần đầu tiên. Stack này dùng cổng 56321 cho API và 56322 cho PostgreSQL.

```powershell
Set-Location F:\naifarm
$qa = Join-Path (Get-Location) '.hallmark/naifarm-live-local'
New-Item -Force -ItemType Directory -Path $qa | Out-Null
$config = Join-Path $qa 'supabase/config.jsonc'
if (-not (Test-Path -LiteralPath $config)) {
    npx --yes supabase@3.4.0 init --workdir $qa
    if ($LASTEXITCODE -ne 0) { throw 'Supabase init thất bại' }
    $source = [IO.File]::ReadAllText($config)
    for ($port = 54320; $port -le 54329; $port++) {
        $source = $source.Replace([string]$port, [string]($port + 2000))
    }
    [IO.File]::WriteAllText($config, $source)
}
$migrations = Join-Path $qa 'supabase/migrations'
New-Item -Force -ItemType Directory -Path $migrations | Out-Null
Copy-Item -LiteralPath 'supabase/migrations/202611250002_livestream.sql','supabase/migrations/202611250003_live_realtime.sql','supabase/migrations/202611250004_live_camera_angle.sql' -Destination $migrations
$network = 'naifarm-live-local-loopback'
docker network inspect $network --format '{{.Name}}' 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    docker network create --driver bridge --opt com.docker.network.bridge.host_binding_ipv4=127.0.0.1 $network | Out-Null
}
if ($LASTEXITCODE -ne 0) { throw 'Không tạo được mạng Docker QA.' }
$stackOutput = npx --yes supabase@3.4.0 start --workdir $qa --network-id $network -x storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor 2>&1
if ($LASTEXITCODE -ne 0) { throw 'Supabase start thất bại. Kiểm tra Docker và các cổng 56321/56322.' }
Remove-Variable stackOutput
```

Chạy `docker port supabase_kong_naifarm-live-local` và `docker port supabase_db_naifarm-live-local` để xác minh cổng được giới hạn ở `127.0.0.1`. Trên Docker Desktop Windows, kiểm tra kết quả thực tế vì tùy chọn của bridge có thể không đủ để giới hạn listener của máy chủ. Stack được cấu hình trên máy này đã được kiểm tra lại sau khi đặt mapping rõ ràng. [Supabase local development](https://supabase.com/docs/guides/local-development) · [Docker port publishing](https://docs.docker.com/engine/network/port-publishing/)

Nạp cấu hình vào PowerShell đang mở. Các biến `LIVE_SUPABASE_*` dành riêng cho livestream. NaiAI tiếp tục dùng Supabase trong `.env`. Có thể dùng cổng 3000 nếu ứng dụng local đã được cấu hình để chạy ở cổng đó.

```powershell
$qa = Join-Path (Get-Location) '.hallmark/naifarm-live-local'
$config = (npx --yes supabase@3.4.0 status --workdir $qa -o json 2>$null | Out-String) | ConvertFrom-Json
$env:LIVE_SUPABASE_URL = $config.API_URL
$env:LIVE_SUPABASE_SECRET_KEY = $config.SERVICE_ROLE_KEY
$env:LIVE_SUPABASE_PUBLISHABLE_KEY = $config.ANON_KEY
$env:NAIFARM_LIVE_ENABLED = '1'
$env:NAIFARM_TEST_SUPABASE_URL = $env:LIVE_SUPABASE_URL
$env:NAIFARM_TEST_SUPABASE_ADMIN_KEY = $env:LIVE_SUPABASE_SECRET_KEY
$env:NAIFARM_E2E_URL = 'http://127.0.0.1:3107'
if (-not $env:CRON_SECRET) { $env:CRON_SECRET = [Guid]::NewGuid().ToString('N') }
```

## Tạo một tài khoản phát để thử bằng tay

Đặt email thử và nhập mật khẩu theo prompt, rồi chạy khối sau. Tài khoản được xác nhận trong Supabase local và có quyền với Nhà vườn Ba Tư. Lệnh tự đọc `.env.local` nếu terminal chưa có cấu hình Supabase riêng cho livestream.

```powershell
$env:NAIFARM_LOCAL_PILOT_EMAIL = 'host-local@example.com'
$secure = Read-Host 'Mật khẩu thử cho host' -AsSecureString
$env:NAIFARM_LOCAL_PILOT_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
$dotenvArgs = @()
if (-not $env:LIVE_SUPABASE_URL -and (Test-Path '.env.local')) { $dotenvArgs = @('--env-file=.env.local') }
@'
import { createClient } from "@supabase/supabase-js";
const env = process.env;
const url = new URL(env.LIVE_SUPABASE_URL);
if (!["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Use the local Supabase stack.");
const db = createClient(url.href, env.LIVE_SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data, error } = await db.auth.admin.createUser({
  email: env.NAIFARM_LOCAL_PILOT_EMAIL, password: env.NAIFARM_LOCAL_PILOT_PASSWORD, email_confirm: true,
});
if (error) throw new Error("Host creation failed. If the email already exists, use it or choose a new test email.");
const grant = await db.from("live_host_permissions").insert({
  user_id: data.user.id, farm_id: "farm-ba-tu-demo", display_name: "Host laptop QA", can_chat: true,
});
if (grant.error) throw new Error("Could not grant the farm permission.");
console.log("Đã tạo tài khoản host local.");
'@ | node @dotenvArgs --input-type=module -
Remove-Item Env:NAIFARM_LOCAL_PILOT_PASSWORD
```

Mở trang studio trên cổng Next.js đang chạy và đăng nhập bằng tài khoản vừa tạo. Nếu đã chạy stack mới với cổng 3107, mở `http://127.0.0.1:3107/live/studio`. Chỉ chạy `npm run dev -- -H 127.0.0.1 -p 3107` khi chưa có Next dev cho repo. Tiếp tục theo [các bước thử laptop](README.md#3-thử-với-laptop-và-điện-thoại).

## Kiểm thử tích hợp đã viết sẵn

Khi dùng stack đã cấu hình trên máy này và đã cài Python Playwright cùng Chromium, mở PowerShell thứ hai tại `F:\naifarm` rồi chạy:

```powershell
$env:NAIFARM_E2E_URL = 'http://localhost:3000'
node --env-file=.env --env-file=.env.local tests/livestream-local.mjs
```

Nếu đã tạo stack mới bằng cách đặt biến chỉ trong PowerShell, nạp lại khối cấu hình ở trên trong terminal thứ hai. Dùng **cùng giá trị** `CRON_SECRET` như tiến trình Next.js rồi chạy:

```powershell
node --env-file=.env tests/livestream-local.mjs
```

Script tự cấp tài khoản pilot tạm, gọi các route ứng dụng bằng browser, kiểm tra media qua LiveKit Cloud, xử lý phiên bỏ dở, kiểm tra chữ ký webhook tại localhost rồi xóa dữ liệu fixture. Chỉ chạy trên stack QA local. Kiểm thử webhook này kiểm tra ứng dụng nhận payload có chữ ký, còn việc LiveKit Cloud gửi vào URL staging được kiểm tra riêng.

Khi thử xong, đóng phiên trong studio và dừng Next.js. Với stack đã cấu hình trên máy này, dùng `docker stop supabase_kong_naifarm-live-qa supabase_auth_naifarm-live-qa supabase_rest_naifarm-live-qa supabase_realtime_naifarm-live-qa supabase_db_naifarm-live-qa` nếu cần tạm dừng. Với stack bạn tự tạo ở thư mục `$qa`, có thể dùng `npx --yes supabase@3.4.0 stop --workdir $qa`.
