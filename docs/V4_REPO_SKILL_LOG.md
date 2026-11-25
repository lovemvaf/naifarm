# NAIFARM V4.0 — REPOSITORY, PACKAGE & SKILL EXECUTION LOG

## 1. Installed Production & Dev Dependencies (`package.json`)

Zero 3D/WebGL dependencies (`three`, `@react-three/*` are completely absent from `package.json`).

| Package | Version (`package.json`) | Usage in NaiFarm V4 |
|---|---|---|
| `next` / `react` / `react-dom` | `16.4.6` / `19.3.0` / `19.3.0` | App Router, Turbopack static/dynamic build (`32` static + dynamic routes), `useSyncExternalStore` locale synchronization |
| `tailwindcss` / `@tailwindcss/turbopack` | `4.3.3` / `4.3.3` | Design tokens, responsive grids (`items-start`, `minmax(0,1fr)`), mobile-first adaptive drawers & bottom nav |
| `leaflet` / `react-leaflet` / `@turf/distance` / `@turf/helpers` | `1.9.4` / `5.0.0` / `^7.4.0` / `^7.3.4` | Interactive OSM map, `MapMarkers.tsx` (accessible `title` + `alt` + `aria-label` on 40+ pins), straight-line `"đường chim bay"` computation |
| `recharts` | `^3.11.1` | HTX Tân Triều BI bar charts & financial dashboards across `/farmer`, `/coordinator`, `/admin` |
| `fuse.js` | `^7.5.0` | Global search combobox & `/search` supporting VI accented, unaccented, and EN agriculture synonyms |
| `qrcode` / `qrcode.react` / `qr-scanner` / `jsqr` / `pngjs` | `^1.5.4` / `^4.2.0` / `^1.4.2` / `^1.4.0` / `^7.0.0` | Live QR SVG/PNG generation, camera/file QR decoding, roundtrip automated verification (`test:qr`) |
| `papaparse` / `zod` | `^5.7.1` / `^4.6.7` | Official Đồng Nai `25/11/2026` 95-unit CSV ingestion & schema validation (`data:validate`) |
| `lucide-react` / `motion` / `sonner` | `^1.78.0` / `^14.14.0` / `^2.0.8` | UI iconography (stroke 1.75), accessible reduced-motion transitions, bounded `1300ms` sign-out & feedback toasts |
| `axe-core` / `tsx` / `eslint` / `typescript` | `^4.14.1` / `^4.23.15` / `^9` / `^5` | Automated WCAG 2.0 A/AA DOM audit in Chromium, strict TS checking, React 19 ESLint verification |

## 2. Activated Agent Skills & Verification Applied

| Skill / Tool | Artifact / Script Used | Concrete V4 Improvements Applied |
|---|---|---|
| `ecc-frontend-patterns`, `ecc-verification-loop` | Root layout (`LocaleProvider` -> `DemoStoreProvider`), modular `FarmerMarketingToursPanel.tsx`, post-edit verification gate | Fixed React 19 strict `react-hooks/set-state-in-effect` rules via `useSyncExternalStore` in `LocaleContext.tsx` & `NaiCalendarBoard.tsx`; eliminated Next server lock conflicts and verified clean `tsc`, `eslint`, and `next build`. |
| `ecc-accessibility`, `axe-core` | `tests/e2e-v4-verify.py` (`axe.min.js` v4.14.1 across 7 core routes) | Caught and resolved 40 serious `aria-command-name` violations on `/explore` Leaflet markers (`title`, `alt`, `aria-label` on `MapMarkers.tsx`), achieving `criticalOrSerious: 0` across all 7 audited routes. |
| `ui-ux-pro-max`, `design-taste-frontend`, `hallmark`, `unslop` | `AppHeader.tsx`, `LiveRoomView.tsx`, `CulturalCampaignBanner.tsx`, `NaiCalendarBoard.tsx` | Audited rendered Chromium captures (`home-vi.png`, `home-en.png`, `farmer-erp-bi.png`, `home-mobile-390.png`, `live-desktop.png`, `learn-desktop.png`, `events-desktop.png`), fixed `1280px` header horizontal overflow, eliminated `/live` white column stretch, and enforced Forest `#245B3D` / Cream `#F5F3E9` palette + clean 3:2 Vietnam flag on cultural campaign banners. |
| `ws-vi-ux-writing` | `src/lib/i18n/messages-vi.ts`, `messages-en.ts`, `src/lib/toast.ts` | Standardized localized `Đã đăng xuất` / `Signed out` `1300ms` non-repeating toast across header and `/sign-in`; maintained zero prohibited internal jargon on public routes (`check_copy_hygiene`). |
| Reusable Code Reference Checks (`10_QuachKhoaDuc_TMĐT`, `Dong Nai Memory`, `EduMap`) | Patterns & local taxonomy alignment (`../.toolbox/repos/` & dataset CSV) | Preserved clean React + Tailwind App Router architecture without importing third-party server backends, secrets, or unverified license blobs. |
