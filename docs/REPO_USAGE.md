# NaiFarm V9 — Verified Repository, Package & Skill Usage Inventory

> Updated: 2026-11-26  
> Scope: Honest audit of every open-source package, local workspace repository, geographic dataset, and design/QA skill actually inspected or used in `naifarm/`.

## 1. Local Workspace Reference Repositories (`.toolbox/repos/` & `.agents/skills/`)

| Local Repo / Skill | Path | License / Origin | Actual Usage in V9 | Files Influenced |
|---|---|---|---|---|
| `ui-ux-pro-max-skill` | `.toolbox/repos/ui-ux-pro-max-skill` & `.agents/skills/ui-ux-pro-max` | Open source (local skill reference) | Design system rhythm, WCAG contrast calibration, editorial warm-cream palette discipline | `src/app/globals.css`, `src/components/marketplace/ProductCard.tsx`, `src/app/page.tsx` |
| `taste-skill` (`design-taste-frontend`) | `.toolbox/repos/taste-skill` & `.agents/skills/design-taste-frontend` | Open source (local skill reference) | Art direction, editorial typography scale (`Lora` + `Be Vietnam Pro`), anti-slop craft principles | `src/components/home/UnifiedHero.tsx`, `src/components/navigation/WorkspaceShell.tsx` |
| `impeccable` | `.agents/skills/impeccable/reference/craft-floor.md` | Open source (local skill reference) | Visual hierarchy review, non-blocking UI polish, tabular numbers, mobile touch target craft floor | `src/components/navigation/AppHeader.tsx`, `src/app/products/[slug]/page.tsx`, `src/components/chatbot/*.tsx` |
| `hallmark` & `unslop` | `.toolbox/repos/hallmark`, `.toolbox/repos/unslop` | Open source (local QA tooling — NOT imported into app bundle) | Quality audit criteria (spacing consistency, avoiding AI visual clichés, real screenshot verification) | QA checklist & Playwright inspection (`scripts/qa-v9-full.mjs`) |
| `ECC` (Everything Claude Code) | `.toolbox/repos/ECC` & `.agents/skills/ecc-*` | MIT (local methodology reference) | Accessibility, frontend patterns, and verification loop discipline (hooks NOT installed globally) | `src/app/products/[slug]/page.tsx`, `src/components/navigation/AppHeader.tsx` |

## 2. Production Runtime Libraries (`naifarm/package.json`)

| Package | Version | License | Actual Usage in NaiFarm |
|---|---|---|---|
| `next` / `react` / `react-dom` | `16.4.6` / `19.3.0` | MIT | App Router, SSR/CSR hybrid pages, local API routes (`/api/ai/*`, `/api/live/*`, `/api/nai-ai/chat`, `/api/video/*`) |
| `tailwindcss` | `4.3.3` | MIT | Design tokens, responsive grids, utility-first layout without horizontal overflow hacks |
| `leaflet` / `react-leaflet` / `@turf/distance` | `1.9.4` / `5.0.0` / `7.3.4` | BSD-2 / Hippocratic / MIT | Interactive Dong Nai 95-unit GIS vector map, inverse world mask, orchard markers, straight-line distance |
| `sharp` | `0.34.5` | Apache-2.0 | Build-time responsive hero WebP generation (`scripts/build-v9-hero-assets.ts` -> 12 WebP assets in `public/images/hero/`) |
| `lucide-react` | `1.1.0` | ISC | Consistent crisp 2D vector UI icons across header, 6 quick tiles, filters, and workspaces |
| `fuse.js` | `7.1.0` | Apache-2.0 | Client-side fuzzy bilingual search across 168 products, 40 farms, 28 tours, 20 lessons, 180 batches |
| `recharts` | `3.8.1` | MIT | Analytics charts inside Farmer, Cooperative/Organization, and Admin workspaces |
| `qrcode` / `jsqr` | `1.5.4` / `1.4.0` | MIT / Apache-2.0 | Real QR code rendering and camera/image QR scanning for harvest batch passports |
| `react-markdown` / `remark-gfm` | `10.1.0` / `4.0.1` | MIT | Grounded markdown responses with source links inside non-modal `NaiFarmHomeChat` |
| `sonner` | `2.0.7` | MIT | Accessible toast notifications for cart, compare, CMS, and review feedback |
| `zod` | `4.3.6` | MIT | Runtime validation for API payloads and forms |
| `@supabase/supabase-js` | `2.100.1` | MIT | Optional Supabase integration when configured; local-first experience mode works 100% offline/without keys |

## 3. Geographic & Reference Datasets

| Dataset | Source | License | Honest Boundary / Coverage Disclosure |
|---|---|---|---|
| `public/geo/dong-nai-outline.json` & `public/geo/dong-nai-wards.json` | `thanglequoc/vietnamese-provinces-database` (`json/geojson/75_dong_nai`) | MIT (Community Open Data) | **95/95 community reference polygons** (`boundaryStatus: "community_reference_not_legal_boundary"`). **0/95 official legal GIS polygons** — explicitly disclosed on Homepage map preview, Explore GIS map overlay, and `public/geo/manifest.json`. |
| `src/data/reference/ocop-public-reference.ts` | Published Dong Nai Decision 125/QĐ-UBND, VietGAP & GI public records | Public government reference | Strictly isolated in the read-only Public OCOP Reference Catalog tab (17 records); never mixed with demo pricing, cart, or synthetic reviews. |

## 4. Verification & QA Tooling (Dev / Local QA Only — Never Bundled into App)

| Tool | Location | Usage |
|---|---|---|
| `playwright-core` | `.toolbox/qa-runtime/node_modules/playwright-core` | Headless Chromium verification (`scripts/qa-v9-full.mjs`) across 18 viewports + intermediate widths, real clicks, VI/EN round-trips, screenshots |
| `axe-core` | `naifarm/node_modules/axe-core` | Automated WCAG 2.1 AA accessibility checks injected into real rendered routes |
| `pngjs` | `naifarm/node_modules/pngjs` | Screenshot PNG verification |

## 5. Repositories Intentionally Excluded (and Why)

- **`astryx` (`.toolbox/repos/astryx`)**: Requires StyleX compiler pipeline incompatible with our Tailwind v4 + Next.js 16 Turbopack/PostCSS stack; excluded to avoid build conflicts and runtime overhead.
- **`stitch-skills` MCP generation tools**: Local Stitch MCP server is not authenticated in this session; V9 followed the approved V9 visual designs directly in real React/Tailwind components instead.
- **Heavy 3D / WebGL / Three.js / Spline / GSAP scroll-jacking stacks**: Intentionally NOT added so the app stays lightweight, fast on mobile, crisp in 2D editorial craft, and respectful of `prefers-reduced-motion`.
- **External paid APIs / Muse automatic login**: Not used; Muse video adapter stays safely disabled without manual user login (`T09`/`T10` verified).
