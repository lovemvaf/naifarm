# NAIFARM V4.0 — VERIFICATION & TEST REPORT

All checks below ran cleanly after the final source code edits in `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`. Temporary screenshot folder `qa-out/` was cleaned before the final script verification run.

## 1. Automated CLI & Build Verification Gate

| Command | Scope | Result | Key Observed Output |
|---|---|---|---|
| `npm run data:validate` | 95 Dong Nai official units CSV (`25/11/2026`) | `PASS` (exit 0) | `95 units (33 Phường, 62 Xã), 10 upgraded 2026, 0 fabricated GIS coords, Phước Sơn 386.56 vs 659.163 proposed verified.` |
| `npm run test:data` | Seed datasets, schemas, FK links, zero API/3D/secrets | `PASS` (exit 0) | `farms: 40`, `products: 168`, `batches: 171`, `orders: 608`, `tours: 28`, `lessons: 20`, `questionBank: 120`, `campaigns: 24`, `calendarEvents: 72` |
| `npm run test:metrics` | GMV vs Net Sales, HTX Tân Triều BI, stock ledger, AR/AP, CSV safety | `PASS` (exit 0) | `novGmvVnd: 196736000`, `novNetMerchandiseVnd: 172603000`, `ttNovNetVnd: 170000000`, `ttPomeloAvailableKg: 1250`, `ttMemberHouseholds: 19` |
| `npm run test:quality` | 26 credential standards, lifecycle/scope filters, lot recall cascade | `PASS` (exit 0) | `credentialTypesCount: 26`, `credentialRecordsCount: 80`, `publicReferencesCount: 17`, `recallCascadeLots: ["NF-DN-099", "NF-DN-100"]`, `recallAffectedOrdersCount: 1` |
| `npm run test:qr` | QR PNG encode/decode & URL allowlist | `PASS` (exit 0) | `VERIFY_QR_DECODE PASS: PNG QR encode/decode & URL security validation verified for all batches.` |
| `npm run test:i18n` | VI/EN key parity & English/unaccented search index | `PASS` (exit 0) | `i18nKeyCount: 234`, `enPomeloHits: 10`, `enCashewHits: 10`, `tourHits: 10` |
| `npm run test:calendar` | VN clock adapter, D-30..D-1 deduped reminders, promo rules, `.ics` | `PASS` (exit 0) | `defaultClockIso: "2026-11-25T12:00:00+07:00"`, `remindersComputed: 53`, `promoNovDiscountVnd: 15000`, `icsBytes: 1336` |
| `npm run typecheck` | TypeScript strict mode (`tsc --noEmit`) | `PASS` (exit 0) | `0` errors |
| `npm run lint` | Next.js / React 19 ESLint | `PASS` (exit 0) | `0` errors (`39` `@next/next/no-img-element` warnings) |
| `npm run build` | Production Turbopack Next.js build | `PASS` (exit 0) | `32` static prerendered pages + dynamic routes |

## 2. Real-Browser Playwright & Axe WCAG 2.0 AA Verification (`tests/e2e-v4-verify.py`)

Executed against rebuilt production Next.js server at `http://127.0.0.1:3000`:

- **Exit Status:** `PASS` (exit 0)
- **Routes Swept (`routesChecked: 35`):** HTTP `< 400`, zero broken `<img>` elements, zero forbidden public copy strings (`check_copy_hygiene`), zero uncaught JS exceptions (`pageerror: 0`), zero local HTTP errors (`>=400`: `0`), and zero app console errors (Note: offline sandbox Chromium DNS lookups strictly to external `*.tile.openstreetmap.org` PNG tile hosts were excluded from the console failure counter, while `/explore` renders Leaflet's retry state cleanly).
- **Functional End-to-End Scenarios Verified:**
  1. `marketRedirect`: `/market?q=buoi` -> cleanly redirects to `/marketplace?q=buoi`.
  2. `liveNoStretchAndState`: `/live` renders public shell (`aside[aria-label='Menu W03']` count `0`), auto-height card (`leftH > 200`), clicking `Nhà vườn & Tour` updates `?tab=farm_tour` and persists across browser reload.
  3. `learnPublicAndFlashcards`: `/learn` public shell (`0` W03 hijack); `/learn/dong-nai-greetings-and-agricultural-origins-a1` flashcard tab & flip interaction work.
  4. `tourBookingFlow`: `/explore?view=tours` (`28` packages) -> `/experiences/...` guest booking `"David Chen (Singapore)"` -> routes to `/account/bookings/[id]`.
  5. `eventsClockAndRecap`: `/events` shows post-`24/11` recap notice (`Sự kiện đã kết thúc — hiển thị tư liệu tóm tắt (không chạy đếm ngược).`) + active `25–30/11` campaign (`Đang diễn ra`).
  6. `viEnSwitch`: clicking header `EN` updates page UI (`Dong Nai Produce`) + URL `?lang=en`, clicking `VI` restores Vietnamese.
  7. `signOutToastTiming`: `/sign-in` 1-click sign-in -> verifies logged-in `header` bounds at `1280px` -> clicking `Mở menu tài khoản` -> `Đăng xuất` displays `"Đã đăng xuất"` and auto-dismisses within `<= 2.2s` (`duration: 1300ms`).
  8. `farmerErpReconciledBi`: `/farmer?mode=erp&tab=overview` renders HTX Tân Triều reconciled net merchandise revenue `170.000.000`.
- **Responsive Breakpoint & Header Bounds Matrix (`9` sizes in VI & EN):**
  - Verified zero horizontal document overflow across `320x720`, `360x780`, `390x844`, `414x896`, `768x1024`, `1024x768`, `1280x800`, `1440x900`, `1920x1080` across `/`, `/live`, `/learn`, `/explore?view=tours`, `/events`, and `/?lang=en`.
  - Verified `check_header_bounds` (`left >= 0`, `right <= window.innerWidth - 1`) for `/` and `/?lang=en` at `1024x768`, `1280x800`, and `1440x900`, plus logged-in state at `1280x800`.
- **Visual Inspection Confirmed:** Reviewed desktop `home-vi.png`, `home-en.png`, `farmer-erp-bi.png`, and mobile `home-mobile-390.png` confirming balanced editorial spacing and crisp header controls.
- **Axe Accessibility Audits (`wcag2a`, `wcag2aa`):** `0` critical or serious violations across all 7 audited routes (`/`, `/marketplace`, `/live`, `/learn`, `/explore`, `/events`, `/farmer?mode=erp&tab=overview`).
