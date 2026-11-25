# NaiFarm — FE Rulebook (`rule.md`)

> Tài liệu quy ước FE của dự án NaiFarm, tổng hợp từ toàn bộ code FE hiện có (bản Supabase ở nhánh `ngoctan` + bản V2 UI ở nhánh `main`). Dùng lại khi phát triển, review, onboarding người/agent mới, hoặc rebuild. Cập nhật: 25/11/2026.

---

## 1. Stack & phiên bản

| Thành phần | Giá trị | Ghi chú |
|---|---|---|
| Framework | Next.js **16.4.6** (App Router) | File guard là `src/proxy.ts` (Next 16 đổi tên middleware → proxy), export `proxy(request)` + `config.matcher` |
| UI | React 19.3, TypeScript strict | `"use client"` ở mọi component dùng state/store |
| Styling | Tailwind CSS **v4** | Token CSS trong `src/app/globals.css`, KHÔNG có `tailwind.config` |
| Backend | Supabase (`@supabase/supabase-js` + `@supabase/ssr`) | Auth email/password + Postgres RLS + Storage |
| Map | Leaflet + `react-leaflet`, dữ liệu GeoJSON | Không dùng Mapbox; tile OSM mặc định của Leaflet |
| Motion | `motion` (framer-motion) | Bọc trong `MotionProvider` |
| Icon | `lucide-react` | Kích thước chuẩn `h-4 w-4` / `h-5 w-5` |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | `PomeloViewer3D`, chỉ host mới load |
| Tiện ích V2 | `fuse.js` (search), `papaparse` (CSV), `qrcode` + `qr-scanner` (QR), `@turf/*` (geo) | Giữ nguyên khi merge |
| Toaster | `sonner` | `<Toaster position="top-right" richColors />` trong layout |

## 2. Cấu trúc thư mục (bắt buộc theo đúng vị trí)

```
src/
  app/                     # Route (App Router). 1 thư mục = 1 route
    layout.tsx             # Root layout: fonts + MotionProvider + DemoStoreProvider + AppHeader/Footer/BottomNav/NaiAI/Toaster
    globals.css            # Toàn bộ design token (@theme inline) — không token hoá ngoài đây
    proxy.ts  →  thực tế nằm ở src/proxy.ts
    <route>/page.tsx       # Server Component mặc định; phần tương tác tách thành <X>Client.tsx / *Form.tsx
    auth/callback/route.ts # Exchange code Supabase (email confirm)
  components/
    navigation/            # AppHeader, AppFooter, MobileBottomNav, WorkspaceShell
    ui/Primitives.tsx      # Card, Badge, Button, SectionTitle, DemoBanner… — KHÔNG viết lại component tương đương
    marketplace/ farms/ traceability/ map/ three/ motion/ chatbot/
  context/
    DemoStoreContext.tsx   # STORE DUY NHẤT của app (useDemoStore + useAuth). Không tạo Context trùng chức năng
  lib/
    supabase/              # client.ts (browser), server.ts (RSC), mappers.ts (row → type), hydrate.ts (fetchCoreData)
    storage/               # assets.ts (assetUrl), upload.ts (nén WebP rồi upload)
    format.ts toast.ts     # format VND/ngày, toast helper (notifySuccess, notifyAccountSwitch…)
    search/ quality/ geography/ permissions/ qr/ commerce/ metrics/ export/   # lib thuần V2
  data/
    demo/                  # dữ liệu demo client-side (community, livestreams, ai-scripts, stitch-registry…)
    fixtures/ geography/ reference/   # dữ liệu tham chiếu V2 (95 đơn vị hành chính, credentials…)
  types/
    naifarm.ts             # TOÀN BỘ type domain. Không định nghĩa type domain lẻ le trong component
supabase/
  migrations/0001_init.sql # schema + trigger + RLS + bucket
  migrations/0002_seed.sql # seed dữ liệu + 10 user demo
scripts/                   # compress-images.py, upload-seed-images.mjs, test-supabase.mjs, build-geojson.py
public/
  images/stitch/*.webp     # ảnh màn hình (WebP)
  geo/*.json               # GeoJSON Đồng Nai cho Leaflet
```

## 3. Routing — 30 route và mức truy cập

| Nhóm | Route | Truy cập |
|---|---|---|
| Public | `/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/trace/scan`, `/explore`, `/learn`, `/live`, `/policies`, `/quality`, `/search`, `/demo` | Ai cũng xem được |
| Cần đăng nhập | `/account`, `/account/orders`, `/account/orders/[orderId]`, `/account/settings`, `/cart`, `/checkout` | Bất kỳ role nào |
| Theo role | `/farmer`, `/farmer/publish` (farmer), `/volunteer` (volunteer), `/coordinator` (coordinator), `/organization` (organization), `/admin` (admin) | Sai role → redirect về home của role đó. `admin` vào được mọi workspace |
| Auth | `/sign-in`, `/sign-up`, `/forgot-password`, `/auth/callback` | Khách |

Quy tắc guard (`src/proxy.ts`):
- Refresh session + set cookie ở **mọi request** khớp matcher (matcher loại trừ `_next/static`, `_next/image`, `images`, `geo`, favicon, file tĩnh).
- Thiếu `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **bypass guard** (chạy chế độ demo, không crash).
- Redirect đăng nhập: `/sign-in?redirect=<path>` — chỉ nhận `redirect` bắt đầu bằng `/` và không phải `//` (chống open redirect).
- Đổi route auth thì phải đổi đồng bộ: `proxy.ts` (đích redirect), `AppHeader`, `MobileBottomNav`, footer, `auth/callback`.

## 4. Auth & vai trò

- Đăng nhập Supabase email + mật khẩu; bật **Confirm email**; đường xác minh: `/auth/callback?next=...`.
- Vai trò (`AppRole`): `customer | farmer | volunteer | coordinator | organization | admin`.
- Đăng ký công khai chỉ cho chọn 4 role: `customer`, `farmer`, `volunteer`, `organization`. `coordinator`/`admin` chỉ được cấp trực tiếp trong DB (trigger `protect_profile_role` chặn tự nâng quyền).
- User demo (seed): 10 tài khoản, mật khẩu chung `naifarm123`; trang `/sign-in` có danh mục đăng nhập nhanh theo vai trò.
- Profile nằm trong bảng `profiles` (1-1 với `auth.users`), đọc qua `useAuth()` → `{ session, profile }`.
- Sau đăng nhập/đăng ký: điều hướng về home theo role (`/account`, `/farmer`, `/volunteer`, `/coordinator`, `/organization`, `/admin`).

## 5. Data layer — quy ước bắt buộc

- **Một store duy nhất**: `src/context/DemoStoreContext.tsx`. Component KHÔNG tự gọi Supabase rải rác — mọi đọc/ghi đi qua store (`useDemoStore()`), trừ auth (`useAuth()`).
- **Hai lớp dữ liệu**:
  1. **Lớp Supabase (core) — ĐÃ WIRE qua `src/lib/supabase/hydrate.ts`** (`fetchCoreData()` → merge vào `DemoStoreContext` khi có session): profiles, farms, products, batches + batch_events, orders + order_items, cart_items, favorites, season_follows, missions, support_requests, rfq_requests (chỉ fetch, chưa có UI write), experience_bookings, document_review_cases, admin_grants, audit_logs, calendar_events, official_observances, campaigns, promotions, lessons, school_classes, student_submissions, seasons, diary_entries, credentials, notifications, tickets, address_book, partner_orgs, sponsor_campaigns, warehouses, warehouse_stocks, inventory_movements, suppliers, purchase_orders, coop_pools, member_deliveries, expenses, receivables_payables, logistics_trips. Có env → load thật; mất env → fallback demo data, không crash.
  2. **Lớp demo (localStorage)**: credentials, seasons/diary, warehouses/inventory/suppliers/purchase orders, notifications, tickets, address book… — chỉ mang tính trình diễn, KHÔNG tạo bảng cho tới khi có chỉ đạo.
- **Mapper bắt buộc**: row Supabase → type domain phải qua `src/lib/supabase/mappers.ts` (`mapProduct`, `mapFarm`, `mapProfile`…). Cột DB snake_case, field TS camelCase. Không dùng raw row ngoài mapper.
- **CRUD pattern chuẩn**: hàm async trong provider → try/catch → lỗi hiển thị toast (`notifySuccess`/toast.error), xong gọi reload helper tương ứng (`reloadProducts`, `reloadOrders`…). Không bao giờ mutate state cục bộ rồi mong DB tự đổi.
- **Viết phải qua RLS**: FE không tự kiểm tra quyền ngoài UI; RLS ở DB là lớp chốt. FE chỉ ẩn/hiện nút theo role cho đẹp UX.
- Trigger DB đã có: `guard_mission_update` (luồng duyệt giờ TNV 2 lớp: `submitted` → `farm_accepted` → `coordinator_approved`), `protect_profile_role`, `handle_new_user`.

## 6. Storage & ảnh

- Buckets: `stitch` (ảnh màn hình, public), `product-images` (sản phẩm farmer đăng), `evidence` (minh chứng TNV) — đều public read.
- Luôn gọi `assetUrl(key)` từ `src/lib/storage/assets.ts` để ra URL cuối (ưu tiên Supabase Storage, fallback `/images/...` local). Cấm hardcode URL storage trong component.
- Ảnh sản phẩm mới: nén WebP qua `src/lib/storage/upload.ts` trước khi upload; DB chỉ lưu key (vd `stitch/stitch-07.webp`).
- Ảnh seed mặc định giữ bản local `public/images/stitch/*.webp` để chạy offline.

## 7. Styling & UI conventions

- **Màu**: dùng token, không hardcode hex mới. Chủ đạo: `--primary #245B3D` (xanh lá), `--primary-hover #19472E`, nền `#F5F3E9`, mực `#25352B`, phụ `#52645A`, viền `#D6DED2`, lá `#9DBE8E`, vàng OCOP `#C6923D`, đỏ `#B3492F`.
- **Font**: tiêu đề `Lora` (serif, `font-[family-name:var(--font-lora)]`), nội dung `Be Vietnam Pro`.
- **Bo góc**: thẻ 12–16px (`rounded-[12px]`/`rounded-[16px]`), nút/input 10–12px.
- **Kích thước chạm**: nút tối thiểu `min-h-[38px]` (header) / `min-h-[46px]` (CTA chính).
- **Component có sẵn**: dùng `Primitives.tsx` (Card, Badge, Button, SectionTitle, DemoBanner, StatTile…) — cấm viết lại card/badge riêng lẻ.
- **Icon**: lucide-react, `aria-hidden="true"`, kích thước `h-4 w-4` nội dòng, `h-5 w-5` nav.
- **A11y**: skip-link "Chuyển đến nội dung chính", `aria-label` cho nút icon, contrast AA, mobile bottom nav 5 mục.
- **Responsive**: mobile-first, kiểm tra 390px → 1280px; bảng dữ liệu co giãn bằng `overflow-x-auto`.

## 8. Ngôn ngữ & dữ liệu Việt Nam

- Toàn bộ UI copy = **tiếng Việt**; thuật ngữ giữ nguyên Anh khi là tên riêng (COD, OCOP, VietGAP, QR).
- Đơn vị hành chính: **Thành phố Đồng Nai trực thuộc Trung ương — không còn cấp huyện**; dùng đúng 95 phường/xã và `adminUnitCode` từ `src/data/geography/`. Cấm dùng tên quận/huyện cũ.
- Tiền: VND, nhóm nghìn bằng dấu chấm (`120.000 đ`) qua `lib/format`; ngày `vi-VN`.
- Trung thực với người dùng: KHÔNG dán nhãn "(Demo)" lung tung; COD ghi rõ "thanh toán khi nhận hàng, chưa tích hợp cổng thanh toán trực tuyến". Dữ liệu trình diễn phải có `DemoBanner`/`isDemo` flag rõ ràng.
- Chatbot (`NaiAIFloatingChat` + `ai-scripts.ts`) và livestream (`/live`) là **demo thuần client** — không tạo bảng/CRUD cho chúng.

## 9. Chất lượng — gate bắt buộc trước khi hoàn thành task

1. `npx tsc --noEmit` → 0 lỗi.
2. `npx eslint` → 0 lỗi, 0 warning.
3. **Không viết comment trong code**; tên hàm/biến phải tự giải thích.
4. Không để `console.log` thừa; lỗi async phải toast cho người dùng.
5. Không đặt `useState` khởi tạo từ giá trị server rồi đổi trong `useEffect` (tránh hydration mismatch) — dùng pattern `mounted`/`ready` hoặc derive trong render.
6. Mọi trang mới phải chạy được ở 390px và có trong `MobileBottomNav`/menu khi thuộc nhóm chính.
7. Đổi schema DB → chạy kèm migration SQL mới (không sửa file migration cũ đã commit).

## 10. Git & deploy

- Nhánh: `main` = bản UI V2 (Vercel tự deploy); `ngoctan` = nhánh tích hợp Supabase; nhánh thành viên khác (`ant_speech`…).
- **Merge policy đã áp dụng (V2 UI + Supabase)**: UI/page/component lấy bản `main`; hạ tầng Supabase (`lib/supabase`, `lib/storage`, `proxy.ts`, `auth/*`, `supabase/migrations`, `scripts`) lấy bản local; `types/naifarm.ts` + `DemoStoreContext.tsx` = hợp nhất (union) có chọn lọc.
- Env bắt buộc (Vercel + `.env.local`, KHÔNG commit): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Cấm đưa `service_role` key vào FE.
- Sau deploy: cấu hình Supabase Auth → URL Configuration (Site URL + redirect Vercel) và bật Confirm email.
- Smoke test sau khi thay đổi data layer: `npm run test:supabase` (20 check, read-only).

## 11. Việc đang treo / chờ chỉ đạo

- ~~Wire các slice core sang Supabase~~ — **XONG** (25/11): đọc qua `src/lib/supabase/hydrate.ts`, ghi qua store theo pattern mục 5 (orders + order_items, cart_items, favorites, season_follows, missions, products, experience_bookings, support_requests, document_review_cases, admin_grants).
- ~~Wire calendar/events (NaiCalendar + campaigns + promotions + observances)~~ — **XONG** (25/11): bảng mới `calendar_events`, `official_observances`, `campaigns`, `promotions` (+ RPC `increment_promo_redemption`); mapper/hydrate/store/actions đã wire; `/events` lấy dữ liệu từ store.
- ~~Wire calendar/events~~ XONG; ~~academy~~ **XONG** (25/11): lessons, school_classes, student_submissions; ~~seasons/diary~~ **XONG**: seasons, diary_entries, batch_events; ~~credentials~~ **XONG**: credentials (+2 action lifecycle/renewal); ~~community~~ **XONG**: notifications, tickets, address_book, partner_orgs, sponsor_campaigns; ~~ERP~~ **XONG**: 10 bảng (warehouses→logistics_trips).
- Còn wire tiên theo yêu cầu: learningProgress (jsonb per-user), lesson_progress table, credential_evidence UI slice.
- ~~Map `/explore` dùng `public/geo`~~ — **XONG** (25/11): fetch `/geo/dong-nai-wards.json` + `/geo/dong-nai-province.json`, UI giữ nguyên V2.
- Tích hợp cổng thanh toán thật, SMTP email thật — chưa làm, chỉ ghi nhận.
