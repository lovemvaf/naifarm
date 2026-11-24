# NAIFARM PROTOTYPE — TASK TRACKER (`TODO.md`)

| Task ID | Goal | Screens | Components / Files | Priority | Status |
|---|---|---|---|---|---|
| `T-01` | Scaffold Next.js 16 + install UI/Motion/3D/QR/Chart deps + extract 12 Stitch screens & 65 images | All | `package.json`, `.stitch/`, `public/images/stitch/` | P0 | Done |
| `T-02` | Write M0–M1 audit, inventory, architecture & decision docs | All | `docs/*.md` | P0 | Done |
| `T-03` | Configure `next.config.ts`, `DESIGN.md` tokens in `globals.css`, `Be Vietnam Pro` + `Lora` fonts | All | `next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx` | P0 | Done |
| `T-04` | Build strict TypeScript types, unified harmonized seed data & `DemoStoreContext` | All | `src/types/naifarm.ts`, `src/data/demo/*`, `src/context/DemoStoreContext.tsx` | P0 | Done |
| `T-05` | Build shared UI primitives, `AppHeader`, `WorkspaceShell`, `MobileBottomNav`, `NaiAIFloatingChat` | `ST-12` (`AI01`–`AI04`) | `src/components/ui/*`, `src/components/navigation/*`, `src/components/chatbot/*` | P0 | Done |
| `T-06` | Implement Public Marketplace (`/`, `/marketplace`), Farms (`/farms`, `/farms/[slug]`), Products (`/products/[slug]`) & QR Trace (`/trace`, `/trace/[batchCode]`) | `ST-01`, `ST-02`, `ST-03`, `BP-01`–`BP-04` | `src/app/page.tsx`, `marketplace/`, `farms/`, `products/`, `trace/` | P0 | Done |
| `T-07` | Implement Cart, Checkout & Customer Orders (`/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[orderId]`) | `ST-04`, `ST-05`, `BP-05` | `src/app/cart/*`, `src/app/checkout/*`, `src/app/account/*` | P0 | Done |
| `T-08` | Implement Dong Nai Map & Eco-Tours (`/explore`) + OCOP Live Room & Schedule (`/live`) | `ST-06`, `ST-07` | `src/app/explore/*`, `src/app/live/*`, `src/components/farms/*` | P0 | Done |
| `T-09` | Implement Farmer U50+ Dashboard (`/farmer`) & 3-Step Publish Wizard (`/farmer/publish`) | `ST-08`, `BP-06` | `src/app/farmer/*` | P0 | Done |
| `T-10` | Implement Youth Missions & Impact Pass (`/volunteer`), NaiAcademy (`/learn`) + Three.js 3D Bưởi Viewer | `ST-09`, `BP-07` | `src/app/volunteer/*`, `src/app/learn/*`, `src/components/three/*` | P0/P1 | Done |
| `T-11` | Implement Coordinator (`W04 /coordinator`), Organization (`W05 /organization`), Admin (`W06 /admin`) & Judge Hub (`/demo`) + 404 | `ST-10`, `ST-11`, `BP-08`, `PR-01` | `src/app/coordinator/*`, `src/app/organization/*`, `src/app/admin/*`, `src/app/demo/*`, `src/app/not-found.tsx` | P0/P1 | Done |
| `T-12` | Run `typecheck`, `lint`, `build`, Hallmark `sloplint --render`, Taste `inspect.mjs`, Unslop `snapshot.mjs`, Playwright E2E + screenshots & finalize docs | All | `tests/e2e-verify.py`, `docs/TEST_REPORT.md`, `docs/FINAL_HANDOVER.md`, `README.md` | P0 | Done |
