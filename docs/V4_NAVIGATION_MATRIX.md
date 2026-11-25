# NAIFARM V4.0 — NAVIGATION, ROUTING & STATE PRESERVATION MATRIX

All routes built under Next.js `16.4.6` App Router (`32` prerendered static entries + `6` dynamic routes, plus `/market` server redirect). Query locale `?lang=en` and safe local `returnTo` normalization (`src/lib/navigation/safe-nav.ts`) prevent workspace hijacking and external open redirects.

## 1. Public & Experience Routes (`W01` / Shared Shell)

| Route / Alias | Trigger Source | Render Mode | State & Query Preservation | Access / Guardrail | Verified Test |
|---|---|---|---|---|---|
| `/` | Header Brand / Hero / Home CTAs | Static | Preserves `?lang=en\|vi`, cart count, active cultural campaign banner for clock `2026-11-25T12:00:00+07:00` | Public (`NO` workspace sidebar; `authUser` optional) | Playwright sweep + `viEnSwitch` + Axe |
| `/market` | Legacy / V4 canonical alias | Dynamic Redirect | Server `redirect()` to `/marketplace` preserving all search query params (`q`, `lang`, etc.) | Public | Playwright `marketRedirect` (`/market?q=buoi` -> `/marketplace`) |
| `/marketplace` | Header `Chợ OCOP`, Hero CTA | Static | URL query filters (`category`, `collection`, `q`, `season`, `unit`) + `VI\|EN` + cart sync | Public; read-only ref catalog separated from cart | Playwright sweep + Axe |
| `/products/[slug]` | `ProductCard`, `LiveRoomView`, Search | Dynamic | Preserves `?lang=en\|vi`, variant/qty selection, compare bar, local B2B/International RFQ form (`submitInternationalInquiry`) | Blocks cart if batch quarantined/recalled; 18+ guard | Playwright sweep (`buoi-da-xanh-tan-trieu`) |
| `/explore` (`?view=map\|tours`) | Header `Khám phá & Tour`, Mobile Nav | Static | Syncs `view=map\|tours`, `unit`, `zone`, `lang` via `router.replace` without losing scroll context | Public; manual GPS permission only (not auto-requested) | Playwright sweep + Axe (`/explore` `0` violations) |
| `/experiences/[slug]` | Tour card on `/explore?view=tours` | Dynamic | Accepts safe local `returnTo`, date/slot, guest counts, language selector -> routes to `/account/bookings/[id]` | Enforces teacher/guardian consent check for school groups | Playwright `tourBookingFlow` |
| `/farms` & `/farms/[slug]` | Nav `Khám phá thêm` -> `Nhà vườn`, Map popup | Static / Dynamic | Preserves `?lang=en\|vi`, farm products & verified quality credentials | Public (`Vị trí gần đúng theo vùng` where unverified) | Playwright sweep |
| `/live` & `/live/[id]` | Header `OCOP Live`, Footer, Campaign | Static / Dynamic | Persisted URL `?tab=overview\|schedule\|farm_tour\|faq` + `sessionStorage` camera/angle & tab state via `safe-nav.ts` | Public (`NO` W03 sidebar hijack); honest replay/scheduled/ended badges | Playwright `liveNoStretchAndState` + Axe |
| `/learn` & `/learn/[slug]` | Header `Học tập`, Footer, Events | Static / Dynamic | Preserves `?lang=en\|vi`, flashcard flip index, matching & quiz retry progress locally | Public (`NO` W03 sidebar hijack); minor 18+ safe | Playwright `learnPublicAndFlashcards` + Axe |
| `/events` & `/events/[slug]` | Header `Sự kiện & Lịch`, Campaign Banner CTA | Static / Dynamic | Syncs calendar mode, category filter, clock state, `.ics` calendar download & campaign deep links | Official observances read-only; 24/11 recap has ZERO countdown | Playwright `eventsClockAndRecap` + Axe |
| `/trace`, `/trace/[batchCode]`, `/trace/scan` | Hero QR input, Product passport link, Mobile `Quét QR` | Static / Dynamic | Decodes PNG/Camera via `qr-scanner`/`jsqr`, extracts safe path via `src/lib/qr/trace-url.ts` | Public read-only batch passport; filters internal ops events | `test:qr` + Playwright sweep |
| `/quality`, `/search`, `/policies` | Nav `Khám phá thêm`, Header Search Combobox, Footer | Static | Combobox keyboard selection -> `/search?q=...` (VI with/without accents + EN synonyms), credential drawer + `Escape` focus return | Public (`policies` transparent operational disclosures) | Playwright sweep (`?q=pomelo`) |
| `/cart` & `/checkout` | Header Cart, `Buy now` | Static | Syncs `applyPromotionsToCart`, VND/USD-estimate toggle, delivery vs garden pickup, single `EX` notice | Minor 18+ & promo expiry validation | Playwright sweep |

## 2. Account & Scoped Workspaces (`W01–W06`)

| Workspace | Route(s) | Entry / Auth Behavior | Navigation & Scope Rules | Verified Test |
|---|---|---|---|---|
| `W01` Buyer & Visitor | `/account`, `/account/orders`, `/account/orders/[orderId]`, `/account/bookings/[id]`, `/account/favorites`, `/account/settings` | Header Avatar dropdown, Mobile `Tôi`, Tour booking completion | Preserves multi-farm orders, tour itineraries (`NF-BKG-*`), wishlist/compare items, notification snooze & `#notifications` | Playwright `/account`, `/account/favorites`, `tourBookingFlow` |
| Auth & Quick Access | `/sign-in`, `/sign-up`, `/forgot-password`, `/demo` | Header `Đăng nhập`/`Đăng ký`, Avatar `Truy cập nhanh` | 6 primary profiles + 15 role bundles drawer on `/sign-in`; public `/sign-up` limited to `W01–W03`; logout shows single `Đã đăng xuất` / `Signed out` toast (`1300ms`) | Playwright `signOutToastTiming` PASS |
| `W02` Farmer & HTX ERP | `/farmer` (`?mode=simple\|erp&tab=overview\|commerce\|inventory\|coop\|marketing\|calendar\|quality\|seasons\|support`), `/farmer/publish` | Avatar -> `Không gian làm việc`, Hero `Đăng bán Nhà vườn` | Collapsible left sidebar (`WorkspaceShell`); preserves active tab in URL; HTX Tân Triều Nov vs Oct BI & 3-step U50+ publish | Playwright `farmerErpReconciledBi` + Axe (`0` violations) |
| `W03` Youth Ambassador | `/volunteer` | Avatar -> `W03`, `/sign-in` profile/bundle | Toggles `Nhiệm vụ đang mở` / `Nhiệm vụ đã tham gia`, bilingual guide shifts, learning/NaiPass portfolio & minor safeguards | Playwright `/volunteer` sweep |
| `W04` Coordinator | `/coordinator` | Avatar -> `W04`, `/sign-in` profile/bundle | Dual-layer hour approval (`Maker != Checker`), scope selector (95 admin units), Recharts impact & CSV export | Playwright `/coordinator` sweep |
| `W05` Organization & Partner | `/organization` | Avatar -> `W05`, `/sign-in` bundle (`school`, `coop`, `b2b`, `sponsor`, `logistics`, `mentor`, `authority`) | Scoped tabs by organization grant: school guardian consent, B2B RFQ, logistics delivery slots, shared calendar | Playwright `/organization` sweep |
| `W06` Platform Admin | `/admin` | Avatar -> `W06`, `/sign-in` admin/auditor bundle | Clock simulator (`ClockProvider`), Campaign governance (`draft -> submitted -> approved -> scheduled -> active`), `AccessDeniedCard` guard against self-grant, GIS center | Playwright `/admin` sweep |
