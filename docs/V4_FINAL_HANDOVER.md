# NAIFARM V4.0 — FINAL HANDOVER SUMMARY

- **Product:** NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai
- **Brand Message:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*
- **Source Directory:** `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`
- **GitHub Repository:** `https://github.com/lovemvaf/naifarm.git` (`branch: main`)
- **Production Deployment:** `https://naifarm.vercel.app/` (`visionary19/naifarm`)
- **Technical Architecture:** Frontend-Only Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript, Tailwind CSS v4, Leaflet + Turf.js 2D GIS, Recharts BI, Fuse.js search, real QR (`qrcode` + `jsqr`), localized `VI | EN` (`useSyncExternalStore`), deterministic VN clock (`2026-11-25T12:00:00+07:00`), and browser `localStorage` experience state. Zero backend API routes, zero live payments, zero 3D/WebGL dependencies.

## 1. Key V4.0 Capabilities Delivered

1. **Responsive Shell, Header & Navigation Decoupling (`AppHeader.tsx`, `LiveRoomView.tsx`, `safe-nav.ts`):**
   - Eliminated desktop `1280px` header overflow across VI and EN; preserved clean `VI | EN` text toggle and combobox search from `1024px–1920px` plus accessible mobile drawer & 5-tab mobile bottom nav.
   - Decoupled public `/live` and `/learn` from `W03` sidebar hijacking; fixed `/live` card vertical stretch using `items-start` + `self-start`; preserved active tab (`?tab=farm_tour` etc.) across reload/navigation; added `/market` query-preserving redirect -> `/marketplace`.
2. **Complete VI/EN Internationalization & International Commerce (`LocaleContext.tsx`, `messages-vi.ts`, `messages-en.ts`, `domain-en.ts`):**
   - Unified 234-key `VI | EN` interface, URL `?lang=en` synchronization, VND / USD-estimate indicator, English & unaccented produce search synonyms, international tour itineraries, local B2B/RFQ inquiries (`submitInternationalInquiry`), and localized non-repeating `1300ms` sign-out toast (`notifySignOut`).
3. **Agritourism, Orchard Map & Global Youth Ambassador (`agritourism-experiences.ts`, `youth-ambassador-academy.ts`, `MapMarkers.tsx`):**
   - `28` agritourism tours paired with `40` Đồng Nai orchard markers (verified `95` Phường/Xã dataset, explicit `title`/`alt`/`aria-label`, `0` critical/serious Axe issues), slot capacity booking -> `/account/bookings/[id]`, and `20` lessons + `16` hospitality phrases + `120` seeded questions + `16` roleplays with button-flipping flashcards, keyboard matching, and minor 18+ safeguards.
4. **VN Clock, NaiCalendar, Cultural Banners & Promotion Engine (`vn-clock.ts`, `calendar-campaigns.ts`, `NaiCalendarBoard.tsx`, `CulturalCampaignBanner.tsx`, `promotion-engine.ts`):**
   - Anchor timestamp `2026-11-25T12:00:00+07:00`: read-only official observances (`23/11`, `24/11` recap with ZERO countdown, upcoming `05/12` self-organized festival), active `25–30/11` cultural campaign banner featuring respectful 3:2 SVG Vietnam flag, `.ics` calendar export, D-30..D-1 deduped in-app reminders, and 6 cart/checkout promo rules.
5. **Management ERP/BI & Scoped 6-Workspace Governance (`business-metrics.ts`, `FarmerOverviewAnalytics.tsx`, `sign-in/page.tsx`, `admin/page.tsx`):**
   - Reconciled HTX Tân Triều Nov vs Oct BI (`170.000.000 đ` net sales vs `142.000.000 đ`, `30%` gross margin, `708.333 đ` AOV, `19` completed-order member households, `1.650 / 1.250 kg` pomelo stock ledger, 5-bucket AR/AP aging), Campaign Wizard with Maker ≠ Checker guard, Admin Clock simulator, and 15 role bundles cleanly accessible from `/sign-in`.

## 2. Explicit Scope Boundaries & Operational Disclosures

- **Experience Space Only:** Checkout orders, promo redemptions, tour reservations, international RFQ inquiries, credential lifecycles, and management financials run deterministically in the browser without external payment gateways, shipping carriers, or legal certification issuance.
- **Map & Sandbox Note:** OpenStreetMap requires network access for external raster tiles; offline/blocked environments automatically display Leaflet's built-in retry state without blocking orchard lists or distance calculations.

## 3. V4.0 Reference Documents

- [`docs/V4_TODO.md`](V4_TODO.md) | [`docs/V4_GAP_MATRIX.md`](V4_GAP_MATRIX.md)
- [`docs/V4_REQUIREMENTS_TRACEABILITY.md`](V4_REQUIREMENTS_TRACEABILITY.md)
- [`docs/V4_NAVIGATION_MATRIX.md`](V4_NAVIGATION_MATRIX.md)
- [`docs/V4_REPO_SKILL_LOG.md`](V4_REPO_SKILL_LOG.md)
- [`docs/V4_DATA_VALIDATION.md`](V4_DATA_VALIDATION.md)
- [`docs/V4_TEST_REPORT.md`](V4_TEST_REPORT.md)
