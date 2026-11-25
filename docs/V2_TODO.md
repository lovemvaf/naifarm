# NaiFarm V2.0 — Task Checklist (`V2_TODO.md`)

- [x] Phase 0: Capture V1 baseline screenshots (`docs/screenshots/before/desktop/` & `mobile/`)
- [x] Phase 0–1: Uninstall 3D libraries (`three`, `@react-three/*`) & install GIS/Search/CSV/QR/Validation dependencies (`leaflet@1.9.4`, `react-leaflet@5.0.0`, `@turf/distance`, `fuse.js`, `papaparse`, `zod`, `qrcode`, `qr-scanner`, `jsqr`, `pngjs`, `tsx`)
- [x] Phase 1: Write `REPOSITORY_USAGE_MATRIX.md`, `V2_CURRENT_STATE_AUDIT.md`, `V2_IMPLEMENTATION_PLAN.md`, `V2_TODO.md`
- [x] Phase 2: Import & validate 95-unit Dong Nai CSV (`25/11/2026`), resolve duplicate raw slug `xa-loc-thanh` (`25280` vs `25294`), preserve Phước Sơn (`386.56 km²` current vs `659.163 km²` proposed), build `src/lib/geography/*` & `ADMINISTRATIVE_DATA_VALIDATION.md`
- [x] Phase 3: Delete `src/components/three/`, eliminate all 3D/WebGL references, implement 2D `ProduceAnatomy2D` & `ProductGallery2D`
- [x] Phase 4: Build deterministic relational mock data (`24` farms, `14` experiences, `103` products across `10` categories, `106` batches, `30` seasons, `312` diaries, `24` certs across `7` statuses, `82` orders, `40` missions, `120` hours, `12` livestreams, `24` bookings, `12` lessons, `10` orgs, `30` notifications, `12` tickets, `6` demo accounts) + `npm run test:data` + `MOCK_DATA_MANIFEST.md`
- [x] Phase 5: Redesign `AppHeader` & `AppFooter`, build `Fuse.js` Global Search (`/search`), Auth pages (`/sign-in`, `/sign-up`, `/forgot-password`), `/account`, `/account/settings` & Signed-in Demo Avatar dropdown
- [x] Phase 6: Implement real OpenStreetMap + Leaflet (`NaiFarmMap`, `MapMarkers`, `AdministrativeBoundaryLayer`, `MapControls`, `MapLegend`, `MapFilter`, `MapLocationCard`, states) + real browser GPS + Turf straight-line distance + `GIS_DATA_PROVENANCE.md`
- [x] Phase 7: Upgrade `qrcode` real SVG/PNG & `QrPassportCard`, build `/trace/scan` (`qr-scanner` + `jsqr`), VietGAP/OCOP (`CertificationCard`) & Seasons/Diary (`ProductionDiaryTimeline`) + W02 farmer workflow + `npm run test:qr` PASS
- [x] Phase 8: Upgrade W01–W06 workspaces, `/demo`, `MobileBottomNav`, above-the-fold Hero LCP (`src/app/page.tsx`)
- [x] Phase 9: Run full static/data/QR/build checks, Playwright 13-flow E2E + `after/` screenshots, Taste Inspect QA, update handover docs, push `main`, verify live Vercel auto-deploy
