---
version: alpha
name: NaiFarm
description: Modern Agricultural Editorial — Chợ OCOP Thanh niên, Thành phố Đồng Nai
colors:
  primary: '#245B3D'
  on-primary: '#FFFFFF'
  primary-hover: '#19472E'
  leaf: '#6C9C5B'
  background: '#F5F3E9'
  surface: '#FFFFFF'
  surface-soft: '#EAF0E5'
  accent: '#D7A34D'
  on-accent: '#25352B'
  text: '#25352B'
  muted: '#52645A'
  border: '#D6DED2'
  input-border: '#788A7B'
  focus: '#245B3D'
  success: '#24603B'
  success-bg: '#E6F3E9'
  warning: '#80520C'
  warning-bg: '#FFF2D8'
  danger: '#A32D2D'
  danger-bg: '#FDECEC'
  info: '#245B78'
  info-bg: '#E8F2F8'
typography:
  display: {fontFamily: Lora, fontSize: 56px, fontWeight: 600, lineHeight: 1.15}
  headline-lg: {fontFamily: Be Vietnam Pro, fontSize: 32px, fontWeight: 700, lineHeight: 1.3}
  headline-md: {fontFamily: Be Vietnam Pro, fontSize: 24px, fontWeight: 650, lineHeight: 1.4}
  headline-sm: {fontFamily: Be Vietnam Pro, fontSize: 20px, fontWeight: 600, lineHeight: 1.4}
  body: {fontFamily: Be Vietnam Pro, fontSize: 16px, fontWeight: 400, lineHeight: 1.6}
  body-large: {fontFamily: Be Vietnam Pro, fontSize: 18px, fontWeight: 400, lineHeight: 1.6}
  label: {fontFamily: Be Vietnam Pro, fontSize: 14px, fontWeight: 600, lineHeight: 1.5}
  caption: {fontFamily: Be Vietnam Pro, fontSize: 13px, fontWeight: 400, lineHeight: 1.5}
  price: {fontFamily: Be Vietnam Pro, fontSize: 20px, fontWeight: 700, lineHeight: 1.4}
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 64px
motion:
  press: {duration: 120ms, timingFunction: ease-out}
  transition: {duration: 200ms, timingFunction: ease-out}
  panel: {duration: 280ms, timingFunction: ease-out}
  reveal: {duration: 400ms, timingFunction: ease-out}
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    height: 48px
    padding: 16px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.on-primary}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    rounded: '{rounded.md}'
    height: 48px
  button-farmer:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.body-large}'
    rounded: '{rounded.md}'
    height: 56px
  card-product:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    padding: 16px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    height: 48px
  chat-launcher:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.full}'
    size: 56px
  badge-warning:
    backgroundColor: '{colors.warning-bg}'
    textColor: '{colors.warning}'
    rounded: '{rounded.full}'
  badge-success:
    backgroundColor: '{colors.success-bg}'
    textColor: '{colors.success}'
    rounded: '{rounded.full}'
---

## Overview

NaiFarm — Chợ OCOP Thanh niên. Tagline: “Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.” Design a real Vietnamese marketplace and task-oriented community platform, not a generic SaaS dashboard. Visual direction: premium agricultural editorial, warm rice paper, forest green, honest documentary photography, restrained botanical motifs, generous whitespace and precise hierarchy. Commerce, verified traceability and youth-led digital support form the main narrative. One responsive web product/PWA, one account, six scoped workspaces, a public browsing area. Do not split into six separate apps or add a seventh workspace for AI, education or finance. All visible UI in natural Vietnamese with full diacritics. Internal names/IDs may be English. Use the supplied screen IDs in canvas names, never as consumer-facing labels. Source of business truth: NaiFarm Master Blueprint V3 (24/11/2026); this file defines visual decisions and adds a scoped NaiAI assistant. See companion STITCH_PLAYBOOK.md for screen prompts, seed, business rules, priority and acceptance. Design is a proposal, all persona/seed data is illustrative.

## Colors

Use primary forest for main actions, focus, selected navigation; white/cream for 85–90% of surfaces; leaf only as illustration or decorative fill, not small text on white. Harvest gold for seasonal labels and restrained editorial emphasis with dark text; not white text on gold. Semantic colors only for state, always accompanied by icon and text. Use border for decorative separation, input-border for meaningful field boundaries. Default light theme, no dark-mode duplication in MVP. No purple AI gradients, fluorescent lime, excessive tinted cards or full-screen gradients. Text contrast target WCAG AA 4.5:1 normal, 3:1 large and meaningful UI boundaries. Check focus rings on both white and dark surfaces.

## Typography

Be Vietnam Pro (400/500/600/700; fallback system sans) for all functional UI; Lora 600 for editorial hero and farm story only, fallback Georgia. Desktop hero 48–56px; mobile hero 30–34px; page title 28–32 desktop, 22–26 mobile; body 16, supporting 13–14 (not critical controls), line-height 1.5–1.6. W02 farmer body 18 and headings 24–30; controls minimum 17px. Use tabular numerals for stock, money and KPIs. Avoid all-caps paragraphs and excessive tracking. Test Vietnamese accents and long names, allow wrap. Money: 35.000 đ/kg, 90.000 đ; quantities: 2 kg; date DD/MM/YYYY, 24-hour time, GMT+7.

## Layout

Mobile first frames 390×844, validate 360 and 430. Desktop frames 1440×1000 (scrollable actual content); tablet 768–1023, desktop >=1024. Public web max content 1280, desktop 12 columns, 24px gap and 48–64px gutters as width permits; tablet 8 cols/20px; mobile 4 cols/16px. 16px page padding mobile, 24/32 desktop. Section spacing 40–64 desktop, 24–32 mobile. Use 4/8 spacing grid. Never force whole page into one viewport or clip Vietnamese copy.

Public desktop: logo, search, Chợ / Khám phá / Live, cart, account; hero 60/40 text/photo, product grid four columns, story and community blocks. Mobile: compact header, search, one short hero, two-column products (single if text wraps excessively), bottom tabs 4; quick actions above the fold. Workspace desktop: 240px sidebar, 64px header, breadcrumb, scoped organization selector, main pane; content detail with 320–400px context panel when useful. Mobile workspace: compact header, bottom 4–5 tabs, secondary tabs in content, tables convert to labeled cards, filters as bottom sheet; no horizontal overflow. Bottom tabs and sticky action bars reserve safe-area and keyboard space. P0 farmer has one large primary action and 4–6 shortcuts, not dense charts. Checkout/QR/recording use focused layout, back and explicit close. Guest can browse public pages; sign-in only when necessary, restore previous action. Switch workspace only from avatar if multiple authorized grants; no forced role selection on every launch.

## Elevation & Depth

Use subtle 1px borders and soft shadows: cards 0 2px 8px rgba(37,53,43,.06), raised panels 0 8px 24px rgba(37,53,43,.12); overlays 0 16px 48px rgba(37,53,43,.18) with dim backdrop. Avoid giant shadows and glassmorphism. Depth from photo layering and whitespace; optionally one cropped fruit object on hero, no content behind it. Use documentary orchard imagery, close-up produce on warm neutral surface, and licensed real images or clearly labeled illustrative images. No false real farm portraits or official emblems.

## Shapes

Cards 16px, hero editorial crop 24px, controls 12px, menus 12px, status chips pill, avatar circle. Prefer rectangular data surfaces to pill-everything; no irregular blob behind forms. Icons Lucide-like consistent 24px stroke 1.75–2, paired with text for key actions. Keep hit targets >=44×44 (farmer >=48×48, primary 56). QR black/white high contrast with four-module quiet zone, never stylize or overlay logo over code. Product photos 4:3 or 1:1 consistently; farm banners 16:9.

## Motion & Micro-interaction

Motion is a feedback tool, not decoration everywhere. Press 120ms opacity/scale .98; hover 160–200ms background and 2px elevation only on hover-capable devices; modal/drawer 200–280ms fade/translate <=16px; filter and tab 160–200ms; route fade 180ms; toast 200ms enter with dismiss, accessible announcement; reduced motion: none/instant. Loading skeleton matches real layout; no fake progress percentage. Add-to-cart: brief checkmark + count, no fly-to-cart animation required. AI processing: calm three dots and status text “Đang tạo bản nháp…”, cancel/retry; recording waveform only from actual audio when implemented, timer and stop, no fake recording. Trace timeline optional reveal 300ms, readable without animation. Map marker selection 180ms scale, list synced, no automatic pan if interacting. Live badge static except actual live status. Chat launcher no perpetual bounce; optional once-only soft entrance, panel slide/fade; do not auto-open or play sound. Respect prefers-reduced-motion, no scroll hijack, no autoplay audio, no flashing.

3D/360 (P1 after P0): one light GLB/glTF fruit (bưởi or durian) in viewer with orbit, zoom, reset, keyboard buttons and 3–4 annotated hotspots; poster and text alternatives. Lazy-load on explicit “Xem 3D”, cap device pixel ratio around 1.5, asset target <=2MB, no WebGL required for purchase. Panorama with 3 hotspots and static alternative if licensed asset available. Hero optional pre-rendered 3D fruit still (not fake live 3D). No mandatory parallax; optional desktop photo drift <=8px only on hover, disabled on mobile/reduced motion. Stitch frames illustrate states; implementation handles actual animation, camera, 3D, AI and backend separately.

## Voice & Content Strategy

Warm, concrete, respectful, no jargon, no fake urgency. Farmer: “Chụp ảnh để bán”, “Nói thông tin sản phẩm”, “Kiểm tra rồi đăng”, “Nhờ thanh niên giúp”. Buyer: “Xem nguồn gốc”, “Nhận tại vườn”, “Đặt hàng”. Volunteer: “Nhận nhiệm vụ”, “Nộp minh chứng”, “Chờ nhà vườn xác nhận”, “Chờ điều phối duyệt giờ”. Admin: scoped precise labels and reasons. Error copy explains what happened and next action, preserves data; e.g. “Chưa nhận được giọng nói. Bạn có thể thử lại hoặc nhập bằng tay.” AI draft label “AI gợi ý — vui lòng kiểm tra”. Never label self-declared data as verified or guarantee food safety. No fake OCOP stars, partners, testimonials, reviews, live audiences, impact figures or sales. Demo label visible on mock records, QR demo, COD/demo transactions and replay. Public information never includes private evidence/identity, phone, address of customer or youth. Empty states use a helpful CTA, not invented data.

## Components

- Public header/search: clear search input, cart quantity, 3 nav links, mobile tabs Chợ / Khám phá / Đơn & lịch / Cá nhân. Search can match product/farm/region; filters show applied count and clear all.
- Product tile: 4:3 image, title two lines max, farm/region, price per unit, season/stock badge, add or view. Out-of-stock switches to disabled purchase + follow season. No star rating without actual data. Product detail: gallery, price, available kg, stepper, prominent trace CTA, sticky add-to-cart, origin summary, farm link, delivery, QR and trust status.
- Farm profile: photo banner, story, 2.5 ha, crops, region, documents with status and scope, product grid, map link, youth support team and live schedule when permitted. No false certification badge.
- Trace passport: QR with text code, batch ID, source, harvest if recorded, vertical event timeline with date/source/actor category, provenance status separate from document validity, privacy-safe public projection. Invalid QR state offers manual entry.
- Cart/checkout: item and quantity rows, stock validation, cost breakdown, delivery vs pickup radio cards, address only when delivery, COD/demo label, submit once, success order code, timeline. Multi-seller orders split server-side or constrain MVP to one seller explicitly.
- Farmer quick publish wizard: photo/camera upload -> voice or type -> AI editable draft. Persistent step indicator, save draft, progress, cancel, manual fallback, clear recording permission failure. Fields name/category, price/đơn vị, stock, batch, description; review required before publishing; AI cannot create credential claims. Youth may edit only assigned draft; owner publishes.
- Orders workspace: status chips, filters, list/table responsive, detail summary, allowed state action, reason on cancellation. Buyer, seller, carrier use same order ID but role-specific projection.
- Mission cards: beneficiary, skill, online/on-site, time estimate, due date, expected deliverable, available slots. Detail/timeline: assigned -> in progress -> submitted -> beneficiary accepted -> coordinator approved -> recorded; revisions with reason. Evidence upload private. Separate farm acceptance and coordinator hour approval. No self-approval or counting pending hours.
- Queue/case view: scoped tabs, filter by status and deadline, row summary, detail with evidence, review reason and decision history. Coordinator can only compare documents and approve scoped hours; admin only platform identity/safety/grants; source validation belongs to authorized issuer. Do not share UI actions across roles by hiding buttons alone; backend enforces permission.
- Live schedule: date/list, scheduled/cancelled/ended statuses, farm + linked products, create/edit for authorized users, replay labeled. Product pin can link to same product/trace. P0 no streaming backend required.
- Map: desktop split list 40% / map 60%; mobile map + collapsible list and bottom sheet. Filters region/fruit/experience; marker popup photo, season, farm link; basemap attribution visible, no fabricated municipal polygon. If boundary dataset unavailable, show verified/public or demo points on neutral basemap with demo label; fallback list.
- Learning/3D: lesson cards, age-appropriate content, learning objective, estimated duration, image/model viewer, quiz feedback. Farm experience request shows date, capacity, price, safety and pending confirmation; no instant confirmed without host.
- Pass/impact: hours confirmed vs pending clearly distinct, skills and proof, issuer, credential status, QR verify; internal pass not legal certificate. KPI derived from data, scope/date, accessible table fallback; avoid fabricated metrics.
- Organization/admin shells: same navigation frame with scope selector; feature flags by type and grants; permission matrix with explicit scope/expiry, audit read-only, confirmation and reason for changes. No cross-tenant default access.
- NaiAI floating chat (NEW, cross-cutting feature, not a portal): 56px circular forest button with chat/sparkle icon and accessible label “Mở trợ lý NaiAI”; desktop bottom-right 24px; mobile right 16px above bottom nav + safe area, never overlays checkout sticky CTA (hide launcher on recording/checkout/payment/fullscreen viewer and modal). Closed by default, no auto-open. Desktop panel width 360–400px height <=560px, mobile bottom sheet max 85dvh, keyboard-safe, focus trap and Escape close, focus returns launcher. Header “NaiAI · Trợ lý NaiFarm”, clear AI notice, close, conversation, 3 contextual quick chips, multiline input and send, stop/retry, source links to internal records, no fake voice. Loading / empty / offline / insufficient data / unsafe request states. W01 prompts: “Gợi ý nông sản”, “Giải thích QR”, “Cách nhận hàng”; W02: “Hướng dẫn đăng bán”, “Cách ghi nhật ký”, “Xem việc cần làm”; W03: “Tìm nhiệm vụ phù hợp”, “Cách nộp minh chứng”; W04: “Quy trình duyệt giờ”, “Giải thích trạng thái hồ sơ”; W05/W06 optional help-only per grant; minor accounts disable open chat by default. Use retrieval over allowed published catalog, help pages and scoped user context only; answers mention uncertainty, cite in-app pages, no guessed prices/stock/credentials. No AI writes, approvals, payments, medical/pesticide recommendations or user data leakage. If model unavailable use explicitly labeled FAQ/keyword suggestions, not pretend AI. A link can open relevant screen; user confirms any transaction separately.
- Accessibility states: loading/skeleton, empty/CTA, validation inline, disabled explanation, no permission, expired session, offline/retry, success, error summary, no results. Visible keyboard focus, proper headings, semantic labels, aria-live for async results, text + icon statuses. Modal destructive actions require confirmation and reason as needed.

## Do's and Don'ts

Do keep exact same tokens and navigation across generated screens; design wireframes first, then high fidelity using same frame IDs and content. Do prioritize R1–R6 and B1–B3; design one full journey before adding P1. Do use realistic Vietnamese microcopy and consistent IDs, same seed data from playbook; mark demo. Do make mobile farmer UX accessible, preserve draft, and test 360px. Do use one component per business entity with role-specific permissions. Do provide empty/error variants and fallback assets. Do label future designs as roadmap, not implemented. Don't generate 76 independent screens in one prompt, clone portals, add fake government verification, pretend prototype is connected to backend, use decorative charts or heavy 3D everywhere, hide actions under icon-only menu, make AI an autonomous seller or approver, use dark gradients, fake stats or random price units. Don't sacrifice main task for animation. Do not put private data into public images or prompts. All photos, fonts and models require appropriate usage rights.
