# IMPLEMENTATION PLAN — NAIFARM PROTOTYPE

| Milestone | Scope | Key Deliverables | Status |
|---|---|---|---|
| **M0** | Workspace Discovery & Stitch Extraction | `WORKSPACE_AUDIT.md`, `.stitch/` (12 screens), `public/images/stitch/` (65/65 images), `DESIGN.md` | Done |
| **M1** | Screen Audit, Inventory & Route Mapping | `STITCH_SCREEN_AUDIT.md`, `SCREEN_INVENTORY.md`, `SCREEN_ROUTE_MAPPING.md`, `UX_IMPROVEMENT_PLAN.md`, `DESIGN_DECISIONS.md` | Done |
| **M2** | Design System & Frontend Architecture | `globals.css` (`DESIGN.md` tokens), `layout.tsx` (`Be Vietnam Pro` + `Lora`), `DemoStoreContext`, UI primitives, `AppHeader`, `WorkspaceShell`, `MobileBottomNav` | In Progress |
| **M3** | Public Marketplace & Customer W01 | `/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[orderId]` | Pending |
| **M4** | Farmer Workspace W02 | `/farmer` (U50+ 18px/56px), `/farmer/publish` (3-step photo + voice/manual + editable AI draft), live order & diary sync | Pending |
| **M5** | Youth & Learning W03 | `/volunteer` (missions, evidence, Youth Impact Pass separating approved vs pending hours), `/learn` (Cashew lesson + quiz + 3D hub), `/explore`, `/live` | Pending |
| **M6** | Coordinator W04 | `/coordinator` (`S24a`–`S24d`: queues, doc review, 2-layer hours approval, Recharts KPI) | Pending |
| **M7** | Organization W05, Admin W06 & Judge Hub | `/organization` (HTX / B2B / School scope switcher), `/admin` (grant matrix + audit log), `/demo` | Pending |
| **M8** | Shared Components & NaiAI Chatbot | `NaiAIFloatingChat` (`AI01`–`AI04`), workspace quick chips, scripted FAQ fallback, auto-hide on checkout/recording | Pending |
| **M9** | Motion Design, Editorial Cursor & 3D | `MotionConfig reducedMotion="user"`, `EditorialReveal`, `EditorialCursor` (homepage hero only), `PomeloViewer3D` (lazy R3F + hotspots + 2D fallback) | Pending |
| **M10** | Responsive, Accessibility & Anti-Slop QA | Viewports `320..1920`, keyboard/focus, WCAG AA contrast, Hallmark `sloplint --render`, Taste `inspect.mjs`, Unslop polish | Pending |
| **M11** | Production Build, Playwright E2E & Handover | `typecheck`, `lint`, `build`, Playwright E2E across all routes & Flows A–H, screenshots, `TEST_REPORT.md`, `FINAL_HANDOVER.md`, `README.md` | Pending |
