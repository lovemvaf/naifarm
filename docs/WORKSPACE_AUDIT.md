# WORKSPACE AUDIT — NAIFARM PROTOTYPE

- **Audit Time:** 2026-11-24 13:10 (GMT+7)
- **Workspace Root:** `E:\04_Projects\Group 8 - Hackathon Dong Nai`
- **NaiFarm Project Path:** `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`
- **Toolkit & Reference Preservation:** Existing `.agents/`, `.toolbox/`, `reference/`, `reports/`, `stitch_naifarm_ocop_marketplace/`, `AGENTS.md`, `SKILL_ROUTER.md` preserved untouched.

## 1. Environment & Toolchain Inventory

| Component | Detected Version / Status | Source / Path |
|---|---|---|
| Node.js | `v24.13.0` | `C:\Program Files\nodejs\node.exe` |
| npm / npx | `11.6.2` | `C:\Program Files\nodejs\npm.ps1` |
| pnpm | `11.5.2` | `C:\Users\asus\AppData\Roaming\npm\pnpm.ps1` |
| Bun | `1.4.5` | `C:\Users\asus\AppData\Local\Microsoft\WinGet\Links\bun.exe` |
| Python | `3.14.2` | `C:\Users\asus\AppData\Local\Programs\Python\Python314\python.exe` |
| Git | `2.56.1.windows.1` | `C:\Program Files\Git\cmd\git.exe` |
| Next.js | `16.4.6` (App Router, Turbopack, TypeScript, Tailwind CSS v4.3.3, ESLint 9) | `./naifarm/package.json` |
| React / React DOM | `19.3.0` | `./naifarm/package.json` |
| Chrome / Edge / Playwright | Chrome + Edge + Chromium `156.0.8078.4` (`python -m playwright`) | System + `%LOCALAPPDATA%\ms-playwright` |
| Stitch MCP | `0` tools loaded (`not-authenticated-0-tools`) | `~/.gemini/antigravity/mcp_config.json` |
| Local Stitch Export | **12 complete screens** (`code.html` + `screen.png`) + `design.md` + `naifarm_design_system/DESIGN.md` | `../stitch_naifarm_ocop_marketplace/stitch_naifarm_ocop_marketplace/` |

## 2. Six Mandatory Skills & Supporting Tools

| # | Skill | Location | Runtime Status | Role in NaiFarm |
|---|---|---|---|---|
| 1 | Everything Claude Code (ECC) | `../.agents/skills/ecc-*` & `../.toolbox/repos/ECC` | `EXEC_READY` (10 skills) + `REFERENCE_ONLY` (`ecc-plan-canvas`) | Architecture, React/a11y/E2E patterns, verification loop |
| 2 | UI UX Pro Max | `../.agents/skills/ui-ux-pro-max` & `../.toolbox/repos/ui-ux-pro-max-skill` | `EXEC_READY` (`search.py`, `validate_data.py`) | Agricultural editorial design system, typography, UX guidelines |
| 3 | Taste Skill | `../.agents/skills/design-taste-frontend` & `../.toolbox/repos/taste-skill` | `EXEC_READY` (`inspect.mjs` CDP Chrome) | Art direction, editorial composition, no-slop house style, browser audit |
| 4 | Astryx | `../.toolbox/repos/astryx` | Reference library (`MIT`) | Open-internals component architecture, consistent semantic primitives & focus rules |
| 5 | Hallmark | `../.agents/skills/hallmark` & `../.toolbox/repos/hallmark` | `EXEC_READY` (`sloplint.mjs --render`, `capture.mjs` via `../.toolbox/qa-runtime`) | Visual floor gates, anti-AI-slop lint & desktop/mobile capture |
| 6 | Unslop | `../.agents/skills/unslop` & `../.toolbox/repos/unslop` | `EXEC_READY` (`snapshot.mjs` via `../.toolbox/qa-runtime`) | 9-pass anti-slop polish, copy discipline, typography & spacing refinement |

## 3. Scope Boundaries & Constraints
- **Supabase-backed application:** Postgres + Row Level Security, Supabase Auth (xác nhận email) và Storage cho ảnh WebP; `src/proxy.ts` giữ phiên và khóa route theo vai trò.
- **Data Integrity:** Nhà vườn, sản phẩm, lô QR, đơn hàng COD, nhiệm vụ, hồ sơ đối chiếu, RFQ và nhật ký kiểm toán lưu trên Supabase; chatbot NaiAI và Replay Live là phần trình diễn phía client được ghi nhãn rõ.
- **Specification Alignment:** Harmonizes the 12 verified Stitch exports (Project ID `12256474506032242478`, primary Tân Triều pomelo + Cooperative flow) with the mandatory Dong Nai Hackathon De 3 seed (`Nhà vườn Ba Tư`, 2,5 ha Long Khánh, `P01` Chôm chôm Java `35.000 đ/kg` .. `P05` Sầu riêng tuyển chọn `120.000 đ/kg`, Minh Anh & Tuấn, `NF-DEMO-001`, `NF-ORD-DEMO-01`, `NF-MIS-01`, `NF-LIVE-01`).
