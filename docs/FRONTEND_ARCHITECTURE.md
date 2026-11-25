# FRONTEND ARCHITECTURE — NAIFARM

## 1. Architectural Pattern
- **Single Unified Next.js 16 App Router Application:** One shared design system, one state container (`DemoStoreContext`), and scoped workspace shells (`W01`–`W06`) rather than 6 disconnected portals.
- **Supabase-backed Data Layer:** Postgres + Row Level Security + Supabase Auth + Storage. The browser client (`src/lib/supabase/client.ts`) and server client (`src/lib/supabase/server.ts`) share session cookies; `src/proxy.ts` refreshes the session and enforces role routes. `DemoStoreContext` keeps its public hook/API but reads and writes Supabase tables.

## 2. Directory Layout (`naifarm/src/`)
- `app/`: App Router pages grouped cleanly by route (`/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[orderId]`, `/explore`, `/live`, `/farmer`, `/farmer/publish`, `/volunteer`, `/learn`, `/coordinator`, `/organization`, `/admin`, `/demo`, `/login`, `/register`, `/auth/callback`).
- `components/ui/`: Accessible primitives (`Button`, `Badge`, `Card`, `Input`, `Dialog`, `Drawer`, `Tabs`, `EmptyState`, `DemoBanner`) built with `cva` + `tailwind-merge` + `clsx` and explicit focus-visible styling.
- `components/navigation/`: `AppHeader` (desktop nav, cart badge, role-scoped Workspace Switcher, sign-out), `MobileBottomNav`, `WorkspaceShell` (`240px` desktop sidebar + mobile bottom bar). `components/chatbot/`: `NaiAIFloatingChat` (client demo).
- `components/marketplace/`, `components/farms/`, `components/traceability/` & `components/map/`: `ProductCard`, `ExperienceBookingForm`, `QrPassportCard`, `HarvestTimeline`, `DongNaiMap` (Leaflet + GeoJSON).
- `components/three/`: `PomeloViewer3DHost.tsx` (`"use client"` lazy `next/dynamic({ ssr: false })` wrapper + WebGL fallback) & `PomeloViewer3D.tsx` (React Three Fiber + Drei interactive 3D Bưởi Tân Triều with 4 anatomical hotspots).
- `components/motion/`: `MotionProvider` (`<MotionConfig reducedMotion="user">`), `EditorialReveal`, `EditorialCursor` (confined to homepage hero showcase on desktop pointers only).
- `context/DemoStoreContext.tsx`: Reactive store backed by Supabase; keeps the `useDemoStore` hook name for existing pages and connects all 6 workspaces (`W02` publish → `/` Marketplace, `W01` checkout → `W02` order queue, `W03` evidence → `W02` accept → `W04` hours approval → `W03` Youth Pass).
- `lib/supabase/`: `client.ts`, `server.ts`, `mappers.ts` (DB row ↔ domain type), `lib/storage/assets.ts` (public Storage URL resolver), `lib/storage/upload.ts` (WebP compression + upload).
- `data/demo/`: Client-only modules for chatbot (`ai-scripts.ts`), OCOP Live (`livestreams.ts`), open lesson (`community.ts`) and Stitch coverage (`stitch-registry.ts`). Business seed data lives in `supabase/migrations/0002_seed.sql`.
- `types/naifarm.ts`: Strict TypeScript interfaces for every business entity and workspace grant.
- `proxy.ts`: Next.js 16 Proxy (formerly middleware) for session refresh and role-based redirects.
- `app/login`, `app/register`, `app/auth/callback`: Supabase Auth flows with email confirmation.
- `public/geo/`: `dong-nai-province.json` và `dong-nai-wards.json` — GeoJSON 8 đơn vị hành chính cấp xã/phường theo NQ 1662/NQ-UBTVQH15 (2025) và NQ 237/NQ-UBTVQH16 (2026).
- `supabase/migrations/`: `0001_init.sql` (enums, bảng, trigger, RLS, Storage) và `0002_seed.sql` (dữ liệu mẫu + 10 tài khoản demo).
- `scripts/`: `build-geojson.py`, `compress-images.py`, `upload-seed-images.mjs`.
- `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
