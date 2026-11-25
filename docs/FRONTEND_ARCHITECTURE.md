# FRONTEND ARCHITECTURE — NAIFARM

## 1. Architectural Pattern
- **Single Unified Next.js 16 App Router Application:** One shared design system, one state container (`DemoStoreContext`), and scoped workspace shells (`W01`–`W06`) rather than 6 disconnected portals.
- **100% Client-Side Prototype Boundary:** Zero `src/app/api/*`, zero database adapters, zero Server Actions. Static/dynamic App Router pages render initial HTML cleanly while interactive state hydrates safely inside `useEffect` from `localStorage` (`naifarm_demo_state_v1`).

## 2. Directory Layout (`naifarm/src/`)
- `app/`: App Router pages grouped cleanly by route (`/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[orderId]`, `/explore`, `/live`, `/farmer`, `/farmer/publish`, `/volunteer`, `/learn`, `/coordinator`, `/organization`, `/admin`, `/demo`).
- `components/ui/`: Accessible primitives (`Button`, `Badge`, `Card`, `Input`, `Dialog`, `Drawer`, `Tabs`, `EmptyState`, `DemoBanner`) built with `cva` + `tailwind-merge` + `clsx` and explicit focus-visible styling.
- `components/navigation/`: `AppHeader` (desktop nav, global search, cart badge, Workspace Switcher), `MobileBottomNav`, `WorkspaceShell` (`240px` desktop sidebar + scoped tenant selector + mobile bottom bar). NaiFarmHomeChat được mount toàn cục từ root layout.
- `components/marketplace/` & `components/traceability/`: `ProductCard`, `FarmCard`, `QrPassportCard`, `HarvestTimeline`, `ExperienceBookingForm`, `DongNaiMapSplit`.
- `components/three/`: `PomeloViewer3DHost.tsx` (`"use client"` lazy `next/dynamic({ ssr: false })` wrapper + WebGL fallback) & `PomeloViewer3D.tsx` (React Three Fiber + Drei interactive 3D Bưởi Tân Triều with 4 anatomical hotspots).
- `components/motion/`: `MotionProvider` (`<MotionConfig reducedMotion="user">`), `EditorialReveal`, `EditorialCursor` (confined to homepage hero showcase on desktop pointers only).
- `context/DemoStoreContext.tsx`: Single source of reactive state connecting all 6 workspaces (`W02` publish → `/` Marketplace, `W01` checkout → `W02` order queue, `W03` evidence → `W02` accept → `W04` hours approval → `W03` Youth Pass).
- `data/demo/`: Typed seed modules (`farms.ts`, `products.ts`, `batches.ts`, `orders.ts`, `missions.ts`, `livestreams.ts`, `community.ts`, `ai-scripts.ts`, `stitch-registry.ts`).
- `types/naifarm.ts`: Strict TypeScript interfaces for every business entity and workspace grant.
