---
name: NaiFarm Design System
colors:
  surface: '#ebfeef'
  surface-dim: '#ccdfd0'
  surface-bright: '#ebfeef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e5f8e9'
  surface-container: '#e0f3e4'
  surface-container-high: '#daedde'
  surface-container-highest: '#d4e7d8'
  on-surface: '#0f1f16'
  on-surface-variant: '#404942'
  inverse-surface: '#24342a'
  inverse-on-surface: '#e2f6e6'
  outline: '#717972'
  outline-variant: '#c0c9c0'
  surface-tint: '#32694a'
  primary: '#054327'
  on-primary: '#ffffff'
  primary-container: '#245b3d'
  on-primary-container: '#97d1ab'
  inverse-primary: '#9ad3ad'
  secondary: '#3c692e'
  on-secondary: '#ffffff'
  secondary-container: '#bcf1a7'
  on-secondary-container: '#426f34'
  tertiary: '#503500'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e4a00'
  on-tertiary-container: '#f2bb62'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b5f0c8'
  primary-fixed-dim: '#9ad3ad'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#185033'
  secondary-fixed: '#bcf1a7'
  secondary-fixed-dim: '#a1d48d'
  on-secondary-fixed: '#032100'
  on-secondary-fixed-variant: '#245019'
  tertiary-fixed: '#ffdeae'
  tertiary-fixed-dim: '#f4bd64'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#604100'
  background: '#ebfeef'
  on-background: '#0f1f16'
  surface-variant: '#d4e7d8'
  background-rice: '#F5F3E9'
  surface-soft: '#EAF0E5'
  surface-white: '#FFFFFF'
  primary-hover: '#19472E'
  text-muted: '#52645A'
  border-subtle: '#D6DED2'
  border-input: '#788A7B'
  success: '#24603B'
  success-bg: '#E6F3E9'
  warning: '#80520C'
  warning-bg: '#FFF2D8'
  danger: '#A32D2D'
  danger-bg: '#FDECEC'
  info: '#245B78'
  info-bg: '#E8F2F8'
typography:
  display:
    fontFamily: Lora
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
  display-mobile:
    fontFamily: Lora
    fontSize: 34px
    fontWeight: '600'
    lineHeight: 42px
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 42px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '650'
    lineHeight: 34px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-farmer:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  price:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The visual identity embodies **Modern Agricultural Editorial** tailored specifically for local agricultural commerce, youth volunteer coordination, and regional provenance tracking in Đồng Nai. It merges the warmth, authenticity, and tactility of agricultural heritage with structured, accessible, modern civic-tech UI.

### Personality & Values
- **Honest & Grounded:** Rooted in real orchards and real farmers, avoiding artificial glamor, neon tech gradients, and fabricated data.
- **Dignified & Accessible:** Designed with deep respect for older farmers (W02 workspace) through high-contrast typography, generous touch targets (≥48px/56px), and zero ambiguous jargon.
- **Civic & Youthful:** Vibrant yet restrained editorial accents that inspire youth volunteers to support regional farmers in digital onboarding and supply-chain transparency.
- **Transparent & Traceable:** Crisp credential chips, verified audit passports, and explicit separation between self-reported entries and authorized civic certifications.

### Core Visual Direction
A hybrid of **Warm Editorial** and **Clean Civic Utility**:
- **Backgrounds:** Warm rice-paper neutrals (`#F5F3E9`) provide an organic, non-fatiguing backdrop, contrasted against clean white surface cards (`#FFFFFF`) and leafy soft-tinted surfaces (`#EAF0E5`).
- **Accent Rhythm:** Forest deep green anchors foundational actions and stable navigation, while harvest gold highlights seasonal provenance and active missions without visual strain.
- **Anti-Patterns:** No glassmorphism, no neo-brutalist harsh drop-shadows, no purple/magenta AI gradients, no unverified government seal knockoffs, and no floating action buttons that obscure mobile primary workflows.

## Colors

The palette is tuned to evoke the fertile agricultural red-basalt and orchard landscapes of Đồng Nai while maintaining strict WCAG AA contrast (4.5:1 for body copy; 3:1 for large display elements and semantic borders).

### Application Rules
- **Primary (`#245B3D`):** Primary action buttons, primary navigation tabs, active state indicators, and focus rings. Never dilute with arbitrary low-opacity tints for text.
- **Secondary / Leaf (`#6C9C5B`):** Restrained botanical accents, illustration fills, secondary status pips, and non-text visual motifs. Never used for small body text over white or cream backgrounds.
- **Tertiary / Harvest Gold (`#D7A34D`):** Reserved for seasonal badges, harvest milestones, and OCOP highlight ribbons. Always paired with dark charcoal text (`#25352B`), never white text.
- **Neutral / Deep Forest Charcoal (`#25352B`):** Body typography, form label text, icons, and primary headings.
- **Muted Charcoal (`#52645A`):** Secondary metadata, farm acreages, batch timestamps, and inactive helper text.
- **Semantic Feedback:** Every alert state must pair its background tint (e.g., `#FFF2D8`) with the corresponding high-contrast foreground stroke and icon (`#80520C`). Colors alone never convey status.

## Typography

The typography hierarchy pairs the editorial dignity of **Lora** with the geometric legibility and native diacritical support of **Be Vietnam Pro**.

### Typesetting & Localization Guidelines
- **Vietnamese Diacritics:** All typographic styles must respect vertical accent clearance. Never restrict line-heights below 1.3 for headings or 1.5 for body copy to prevent diacritical marks (dấu mũ, dấu hỏi, dấu ngã, dấu nặng) from clipping.
- **Editorial vs. Functional:**
  - `display`: Reserved exclusively for public editorial hero banners and deep farm storytelling narratives.
  - `Be Vietnam Pro`: Enforces clarity across all transactional flows, tables, order queues, inputs, buttons, and system notices.
- **Farmer Workspace (W02) Sizing:**
  - Base body text scales up to `18px` (`body-farmer`).
  - Interactive inputs and button labels scale to minimum `17px`–`18px` with bold weights (`600` or `700`).
- **Formatting Standards:**
  - Currency: Tabular figures with non-breaking spaces and national standard abbreviation: `35.000 đ/kg`, `120.000 đ`.
  - Date & Time: 24-hour clock `DD/MM/YYYY`, GMT+7 (`14:30 24/11/2026`).

## Layout & Spacing

The layout philosophy uses a structured **Fluid Grid System** constrained to humanized max-widths for editorial legibility and comfortable thumb reach.

### Canvas & Grid Structure
- **Desktop (≥1024px):** 12-column fluid grid, max-content container width `1280px`, outer margin `32px` (`2rem`), column gutter `24px` (`1.5rem`).
- **Tablet (768px – 1023px):** 8-column grid, outer margin `24px` (`1.5rem`), column gutter `20px`.
- **Mobile (360px – 430px):** 4-column grid, outer margin `16px` (`1rem`), column gutter `16px` (`1rem`). Critical frames validated down to 360px width without horizontal viewport clipping.

### Layout Scaffolding
- **Public Storefront:** Top navbar with search and regional filter bar, 60/40 split editorial hero, 4-column product card grid (2-column on mobile), followed by documentary farm profile spotlights and seasonal community missions.
- **Scoped Management Workspaces:** Fixed `240px` contextual sidebar on desktop, `64px` system topbar with explicit tenant/scope selector, and scrollable content canvas. On mobile, workspaces convert to a 4–5 tab fixed bottom navigation bar reserving safe areas.
- **Sticky Actions:** Dedicated sticky checkout and verification bars must account for `env(safe-area-inset-bottom)` and must never conflict with floating assistants.

## Elevation & Depth

Elevation conveys tangible physical separation using warm, ambient shadows and subtle boundary lines, avoiding exaggerated synthetic blurs or artificial 3D layering.

### Surface Elevation Hierarchy
1. **Flat Base Surface (`0dp`):** The canvas background (`#F5F3E9`) holds flat content sections and structural layout dividers.
2. **Resting Cards & Tiles (`1dp`):** Surface white cards (`#FFFFFF`) use a 1px structural boundary (`#D6DED2`) accompanied by a warm ambient shadow:
   `box-shadow: 0 2px 8px rgba(37, 53, 43, 0.06);`
3. **Hover & Interactive Focus (`2dp`):** Cards on hover translate up 2px on desktop with elevated diffusion:
   `box-shadow: 0 8px 24px rgba(37, 53, 43, 0.12);`
4. **Floating Overlays & Drawers (`3dp`):** NaiAI panel, mobile bottom sheets, and modal dialogues:
   `box-shadow: 0 16px 48px rgba(37, 53, 43, 0.18);` with a dim backdrop scrim `rgba(37, 53, 43, 0.40)`.

### Depth Principles
- No glassmorphic multi-layered backdrops.
- Field boundaries must use `#788A7B` (`input-border`) to guarantee tactile affordance against white surfaces.
- Image cropping provides primary depth: produce photography shot against clean natural table surfaces or natural daylight orchards.

## Shapes

The shape system balances modern structural discipline with organic warmth. Elements rely on gentle, predictable rounding rather than irregular blobs or heavy pill capsules.

### Shape Geometry Tokens
- **Micro & Tags (`xs` / `4px`):** Precise status markers, table badges, and compact unit indicators.
- **Controls & Form Elements (`sm` to `md` / `8px`–`12px`): Text inputs, stepper selectors, and action buttons.
- **Cards & Surface Panels (`lg` / `16px`):** Product cards, batch traceability passports, mission briefing boxes, and contextual modals.
- **Hero Containers (`xl` / `24px`):** Editorial hero crop frames, farm story lead banners, and prominent learning modules.
- **Full Pill (`full` / `999px`):** Status indicator chips, category selection pills, avatar rings, and the circular NaiAI launcher button.

### Hit Target Affirmations
- Standard interactive elements maintain a minimum target of `44×44px`.
- Farmer mode (W02) inputs, steppers, and major submission triggers expand to `≥48px` height (primary action buttons at `56px` height).

## Components

### 1. Buttons
- **Primary Button:** Background `#245B3D`, foreground `#FFFFFF`, height `48px` (Farmer mode: `56px`), border-radius `12px`, padding `0 24px`. Hover state: `#19472E`. Active press: scale `0.98` with `120ms` ease-out.
- **Secondary Button:** Background `#FFFFFF`, stroke `1.5px solid #245B3D`, text `#245B3D`, height `48px`, border-radius `12px`.
- **Farmer Action Button:** Height `56px`, text `18px Be Vietnam Pro 600`, prominent icon (stroke `2px`), maximum contrast.
- **Destructive Button:** Background `#FDECEC`, border `1px solid #A32D2D`, text `#A32D2D`. Must prompt for explicit confirmation modal with mandatory reason input.

### 2. Product Marketplace Cards
- Container: Surface `#FFFFFF`, border `1px solid #D6DED2`, border-radius `16px`, padding `16px`.
- Media: Consistent `4:3` aspect ratio crop with subtle zoom on card hover.
- Metadata: Product title limited to 2 lines (`Be Vietnam Pro 16px 600`), farm origin line with location pin, unit price display (`20px 700 #245B3D`), and season availability chip.
- Out of Stock State: Purchase button disabled, replaced with "Theo dõi vụ mùa" (Follow season) outlined CTA.

### 3. Traceability Passports & Badges
- **Status Badges:** Pill-shaped (`rounded-full`), height `28px`, padding `4px 12px`, paired icon + text.
  - *OCOP Verified:* Background `#E6F3E9`, text `#24603B`.
  - *Seasonal Pending:* Background `#FFF2D8`, text `#80520C`.
  - *Self-Reported Farmer Diary:* Background `#EAF0E5`, text `#52645A` (Explicitly labeled as self-declared, not certified).
- **QR Provenance Block:** High-contrast pure black-on-white QR with 4-module quiet zone, accompanied by human-readable batch code, harvest timestamp, and inspection actor log.

### 4. Youth Volunteer Mission Cards
- Container: Border-radius `16px`, surface `#FFFFFF`, top decorative accent border indicating status.
- Meta Grid: Beneficiary farm, expected hours, task category (e.g., "Chụp ảnh sản phẩm", "Hỗ trợ QR"), submission deadline, and verified supervisor credit.
- Workflow Actions: "Nhận nhiệm vụ" -> "Nộp minh chứng" -> Pending farm confirmation -> Pending coordinator hour approval.

### 5. Input Fields & Selectors
- Standard text fields: Background `#FFFFFF`, height `48px` (Farmer mode: `56px`), border `1.5px solid #788A7B`, border-radius `12px`, text `16px` (Farmer mode: `18px`).
- Focus Ring: `2px solid #245B3D` with `2px` offset.
- Validation: Inline feedback with icon and descriptive text placed below input; `#A32D2D` for errors, never color alone.

### 6. Floating NaiAI Assistant
- **Launcher Button:** `56px` circle in `#245B3D` with contrasting white sparkle/chat glyph. Fixed bottom-right: desktop `24px`, mobile `16px` above the bottom navigation bar. Never overlaps primary sticky CTAs; systematically hidden on checkout and recording flows.
- **Chat Panel:** Desktop width `380px`, max-height `560px`; mobile bottom-sheet max `85dvh`.
- **Safety & Disclaimers:** Visible notice: *"AI gợi ý — vui lòng kiểm tra lại thông tin"*. Includes contextual query chips, citations referencing internal farm records, and no hallucinated pesticide, medical, or pricing commitments.