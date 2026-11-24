# ASSET MANIFEST — NAIFARM PROTOTYPE

- **Storage Location:** `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm\public\images\stitch\`
- **Total Downloaded Stitch Assets:** **65 image files** (`stitch-01.jpg` .. `stitch-65.jpg`, including `.png` where returned by server), verified `HTTP 200 OK` and `image/*` MIME types (`0` failures).
- **Source Provenance:** Embedded public `lh3.googleusercontent.com/aida-public/...` assets inside the 12 Google Stitch exports (`Project ID: 12256474506032242478`). Downloaded locally so the prototype runs 100% offline with zero broken links.
- **Usage & Labeling Rule:** Per `DESIGN.md` and `STITCH_PLAYBOOK.md`, all orchard/produce/user photographs are illustrative demo assets and never claimed to be verified photographs of real individuals or unverified OCOP certificates.
- **Icons:** Consistent inline SVG stroke icons via `lucide-react` (`strokeWidth={1.75}`), replacing Google Fonts `Material Symbols Outlined` to avoid icon-font loading flash or missing glyphs offline.
- **3D Visual:** Procedural interactive Three.js / React Three Fiber 3D Bưởi Tân Triều model (`src/components/three/PomeloViewer3D.tsx`) with no external unlicensed `.glb` dependency and automatic 2D photographic fallback.
- **Detailed Per-File Index:** Stored in `public/images/stitch/manifest.json` (`392` lines, mapping each local path, byte size, MIME type, and original source URL).
