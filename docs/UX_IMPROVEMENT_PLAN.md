# UX IMPROVEMENT PLAN — NAIFARM

1. **Closing Stitch Export Gaps into Live Cross-Workspace Flows:** Connect isolated Stitch HTML exports into true end-to-end client flows (Flows A–H) sharing one `DemoStoreContext`.
2. **Empowering 50-Year-Old Farmers (`W02`):** Add a dedicated U50+ `/farmer` overview (missing as a separate screen in the 12 exports) featuring a `56px` primary `"Chụp ảnh để bán"` action, 4 clear shortcuts, and a resilient 3-step publish wizard with mic-denied fallback and manual input.
3. **Two-Layer Volunteer Hours Integrity (`W03` ↔ `W02` ↔ `W04`):** Prevent self-approval or counting pending hours by separating `Giờ chờ duyệt` vs `Giờ đã duyệt` on Youth Impact Pass (`S18`) and gating Coordinator approval (`S24c`) behind Farm Owner deliverable confirmation.
4. **Checkout Focus & NaiAI Safety:** Ensure NaiAI floating bubble is closed by default, supports Escape-to-close and `<=85dvh` mobile sheet, cites internal catalog routes, and automatically hides during `/checkout` and `/farmer/publish` voice recording so primary CTAs are never obscured.
5. **Resilient Empty, Error & Offline States:** Implement helpful recovery states for empty search, empty cart, invalid QR codes (manual entry fallback), out-of-stock seasonal items (*"Theo dõi vụ mùa"*), WebGL disabled (2D orchard fallback), and ungranted permissions.
