# NAIFARM V3.0 — EXECUTION TODO & MILESTONE TRACKER

- **Repository:** `https://github.com/lovemvaf/naifarm.git` (`branch: main`)
- **Kiến trúc:** Frontend-Only Next.js `16.4.6` App Router + React `19.3.0` + Tailwind v4 + `localStorage` (`STORAGE_KEY = "naifarm_demo_state_v3"`, zero `src/app/api`, zero database, zero 3D/WebGL).

| ID | Milestone | Hạng mục thực thi | Dependencies | Acceptance Gate | Status |
|---|---|---|---|---|---|
| `T01` | M0–M1 | Kiểm kê source, route inventory, benchmark gap matrix & cập nhật `REPOSITORY_USAGE_MATRIX.md` | — | `V3_TODO.md`, `GAP_MATRIX.md`, `REPOSITORY_USAGE_MATRIX.md` | `DONE` |
| `T02` | M2 | Tạo `src/lib/toast.ts` + sửa toast đăng xuất (`"Đã đăng xuất"`, `duration: 1300ms <= 1.8s`, không lặp) | `T01` | Playwright `F04_single_logout_toast_and_escape_menu` PASS | `DONE` |
| `T03` | M2 | Quét & làm sạch Copy toàn site (bỏ chữ Demo/Prototype/Frontend-Only/Simulation/API thừa; giữ `"Không gian trải nghiệm"` & `"Hồ sơ mẫu"`) | `T02` | DOM Copy Lint `0` vi phạm trên 31 route | `DONE` |
| `T04` | M2 | Hoàn thiện `AppHeader`, `AppFooter` (accordion mobile), `WorkspaceShell`, `/demo` (`Truy cập nhanh` + `noindex`), `/policies` | `T03` | `next build` (29 routes) + visual QA | `DONE` |
| `T05` | M3 | Mở rộng `src/types/naifarm.ts` + tạo `src/data/reference/ocop-public-reference.ts` (17 bản ghi công bố QĐ 125, OCOP 5 sao, VietGAP, GI 0066) | `T01` | Read-only reference tách biệt SKU bán + 0 giá/giỏ ảo | `DONE` |
| `T06` | M3 | Tạo `src/data/reference/asset-manifest.ts` (65 ảnh verified) + mở rộng `30` farms, `116` SKUs, `119` batches, `168` orders 2 kỳ, `erp-operations.ts` | `T05` | `npm run test:data` PASS | `DONE` |
| `T07` | M4 | Xây `src/lib/quality/credential-registry.ts` (26 loại Q01–Q26 + nguồn S01–S23), `quality-credentials.ts` (34 records), `recall-engine.ts` | `T05` | `npm run test:quality` PASS | `DONE` |
| `T08` | M4 | Tạo `QualityCenterPanel`, `CredentialDetailDrawer`, `/quality`, nâng cấp `/trace/[batchCode]` (genealogy/recall) & `/trace/scan` | `T07` | Playwright `F05_quality_recall_qr_upload` PASS | `DONE` |
| `T09` | M5 | Xây `src/lib/metrics/business-metrics.ts` + `src/lib/export/csv-export.ts` (UTF-8 BOM + chống CWE-1236) | `T06` | `npm run test:metrics` PASS | `DONE` |
| `T10` | M5 | Nâng cấp `/marketplace`, `/products/[slug]`, `/cart`, `/checkout`, `/account/orders` (compare, reference catalog, quarantine lock, refund, outside-province) | `T08`, `T09` | Playwright `F01`, `F02`, `F02b`, `F03` PASS | `DONE` |
| `T11` | M6 | Xây cụm ERP Nhà nông & HTX `src/components/farmer/*` (Overview, Commerce, Inventory FEFO/PO, Coop Pooling & Finance CSV) + `/farmer` dual mode | `T09`, `T10` | Playwright `F06_farmer_erp_analytics_inventory_coop` PASS | `DONE` |
| `T12` | M7 | Xây `src/lib/permissions/access-control.ts` & `src/components/permissions/*` (`PermissionMatrix`, `ScopeSelector`, `AccessDeniedCard`) | `T06` | Maker ≠ Checker + minor consent + mandatory reason | `DONE` |
| `T13` | M7 | Nâng cấp W03 `/volunteer`, W04 `/coordinator`, W05 `/organization` (6+ loại tổ chức) & W06 `/admin` (8 phân hệ + GIS Data Center) | `T08`, `T09`, `T12` | Playwright `F07`, `F08` PASS | `DONE` |
| `T14` | M8 | Polish `/explore`, `NaiAIFloatingChat`, `/live`, `/learn`, `/farms/[slug]`, `/search`, `/`, `ExperienceBookingForm`, `QrPassportCard` | `T04`, `T08` | `Select-String` + DOM Copy Lint 0 vi phạm | `DONE` |
| `T15` | M9 | Chạy `data:validate`, `test:data`, `test:metrics`, `test:quality`, `test:qr`, `typecheck`, `lint`, `build`, `tests/e2e-v3-verify.py` (31 routes, 320–1440px) & visual QA | `T01`–`T14` | All gates exit `0` + 0 broken images + 0 overflow | `DONE` |
| `T16` | M10 | Hoàn tất tài liệu Section 21 (`DATA_QUALITY_PROVENANCE`, `ROLE_CAPABILITY_MATRIX`, `METRICS_DICTIONARY`, `V3_TEST_REPORT`, `V3_HANDOVER`, `README.md`), push `main` & verify Vercel | `T15` | `● Ready` & HTTP 200 live routes | `DONE` |
