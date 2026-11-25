# NAIFARM V4.0 — DETERMINISTIC DATA, GIS & RECONCILIATION VALIDATION

All validations ran cleanly after the final code edit inside `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`.

## 1. Administrative Boundaries & GIS Integrity (`npm run data:validate`)

- **Command:** `npm run data:validate` (`tsx scripts/validate-administrative-data.ts`)
- **Observed Output:** `VALIDATED_ADMIN_DATA PASS: 95 units (33 Phường, 62 Xã), 10 upgraded 2026, 0 fabricated GIS coords, Phước Sơn 386.56 vs 659.163 proposed verified.`
- **Verification Guarantees:**
  - Zero deprecated pre-merger district labels exposed as active units.
  - Zero fabricated polygon geometries (`trang_thai_gis = chua_xac_minh_toa_do_va_polygon` preserved where official polygons are not embedded).
  - Unverified orchard coordinates explicitly carry `"Vị trí gần đúng theo vùng"`.

## 2. Deterministic Entity Seed Inventory (`npm run test:data`)

- **Command:** `npm run test:data` (`tsx scripts/validate-mock-data.ts`)
- **Observed Counts:**

| Entity Collection | Validated Count | Notes |
|---|---:|---|
| `farms` | `40` | Anchored by `farm-ba-tu-demo` (`2.5 ha`, Phường Long Khánh `26080`) |
| `experiences` | `24` | Agritourism & educational orchard programs |
| `tours` (`INITIAL_TOUR_PACKAGES`) | `28` | Seasonal bilingual/domestic slots, age/guardian safety metadata |
| `bookings` (`INITIAL_V4_BOOKINGS`) | `24` | Local itinerary slots synced to `/account/bookings/[id]` |
| `products` | `168` | Distinct SKUs/variants (`P01–P05` preserved) + 17 read-only public refs separated |
| `categories` | `12` | Produce, processed specialties, OCOP gifts, youth bundles |
| `batches` | `171` | Lot genealogy (`NF-DEMO-001`, `NF-DN-099 -> NF-DN-100`) |
| `seasons` | `64` | Orchard production seasons |
| `diaryEntries` | `552` | Chronological harvest & farming logs |
| `certifications` | `40` | Farm-level credential records |
| `orders` | `608` | Multi-period transactions across channels & member households |
| `missions` | `64` | Youth missions & bilingual ambassador shifts (`NF-MIS-01` preserved) |
| `volunteerHourRecords` | `168` | Independent beneficiary + coordinator approval pipeline |
| `livestreams` | `24` | `NF-LIVE-01` preserved; replay/scheduled/ended statuses |
| `lessons` | `20` | `NaiAcademy` courses across A1, A2, B1 & Field Lab |
| `phrases` (`AMBASSADOR_PHRASES`) | `16` | Bilingual hospitality & produce phrases with pronunciation/allergy notes |
| `questionBank` (`ACADEMY_QUESTION_BANK`) | `120` | Seeded multi-choice, matching, roleplay & rubric quizzes |
| `partnerOrgs` | `24` | Coop, school, B2B, sponsor, logistics, mentor & authority fixtures |
| `campaigns` | `24` | Past `24/11` recap, active `25–30/11`, upcoming `01–05/12` & `12/12` |
| `calendarEvents` | `72` | `NaiCalendar` observances, harvests, live slots, tours & promos |
| `notifications` / `tickets` / `demoAccounts` | `68` / `28` / `6` | Plus `15` scoped role bundles accessed via `/sign-in` |

## 3. Financial, Stock & HTX Tân Triều Reconciliation (`npm run test:metrics`)

- **Command:** `npm run test:metrics` (`tsx scripts/test-metrics.ts`)
- **Observed Output:**
  - `novGmvVnd`: `196736000`
  - `novNetMerchandiseVnd`: `172603000`
  - `novPlatformRevenueVnd`: `130150`
  - `missingCostLinesCount`: `1` (explicit missing-COGS safeguard)
  - `confirmedVolunteerHours`: `106`
  - **HTX Tân Triều Cooperative Scenario (`org-tt-scenario`, period `01–24/11/2026`):**
    - `ttNovNetVnd`: `170000000` (`170.000.000 đ`, verified derived from member rows vs October benchmark `142.000.000 đ`)
    - `ttPomeloAvailableKg`: `1250` (`2.000 + 3.800 - 4.100 - 50 = 1.650` on-hand, `- 300` reserved, `- 100` quarantine)
    - `ttMemberHouseholds`: `19` completed-order member households across 20 registered members in scenario drilldown
  - Separate natural units preserved (`lọ 180g`, `hũ 400g`, `kg`, `túi 3 kg`, `hộp 180g`, etc.) — no cross-unit kg/jar summation.

## 4. Quality Registry, QR, i18n & Calendar/Promo Validation

- **`npm run test:quality`:** `credentialTypesCount: 26`, `credentialRecordsCount: 80`, `publicReferencesCount: 17`, `recallCascadeLots: ["NF-DN-099", "NF-DN-100"]`, `recallAffectedOrdersCount: 1`.
- **`npm run test:qr`:** `VERIFY_QR_DECODE PASS: PNG QR encode/decode & URL security validation verified for all batches.`
- **`npm run test:i18n`:** `i18nKeyCount: 234`, `enPomeloHits: 10`, `enCashewHits: 10`, `tourHits: 10`.
- **`npm run test:calendar`:** `defaultClockIso: "2026-11-25T12:00:00+07:00"`, `remindersComputed: 53`, `promoNovDiscountVnd: 15000`, `icsBytes: 1336`.
