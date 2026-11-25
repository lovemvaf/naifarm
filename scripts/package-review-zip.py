#!/usr/bin/env python3
"""
Builds Offline Interactive HTML Gallery (REVIEW_INDEX.html / review.html),
Before|After comparison composites, metadata CSVs, and validates clean ZIP packaging
with strict hygiene checks (zero secrets, zero node_modules, zero .env, zero broken paths).
"""
import argparse
import csv
import html
import json
import os
import subprocess
import sys
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FORBIDDEN_PATTERNS = (
    ".env",
    "node_modules",
    ".next",
    "auth-storage",
    "cookies",
    "browser-profile",
    ".git/",
    "vercel_oidc_token",
    "secret",
)

try:
    FONT_BOLD = ImageFont.truetype("arialbd.ttf", 20)
    FONT_SM = ImageFont.truetype("arial.ttf", 14)
except Exception:
    FONT_BOLD = ImageFont.load_default()
    FONT_SM = FONT_BOLD


def build_before_after_pairs(before_dir: Path, after_dir: Path, out_dir: Path):
    if not before_dir.exists():
        return []
    out_dir.mkdir(parents=True, exist_ok=True)
    pairs = []
    # Match screenshots & section crops by filename prefix
    before_files = {}
    for p in before_dir.rglob("*.png"):
        before_files[p.name] = p

    targets = []
    for p in after_dir.rglob("*.png"):
        if p.name in before_files and p.parent.name in ("vi", "en", "homepage", "header", "footer", "products"):
            targets.append((before_files[p.name], p))
        else:
            # Handle SCN-HOME -> R01-HOME mapping
            alt_name = p.name.replace("R01-HOME", "SCN-HOME").replace("R02-MARKET", "SCN-MARKET").replace("R35-SIGNIN", "SCN-SIGNIN").replace("R12-EXPLORE-MAP", "SCN-EXPLORE-MAP").replace("R17-EVENTS-CAL", "SCN-EVENTS-CALENDAR").replace("R52-W03-VOLUNTEER", "SCN-W03-VOLUNTEER").replace("R54-W05-ORG", "SCN-W05-ORG")
            if alt_name != p.name and alt_name in before_files:
                targets.append((before_files[alt_name], p))

    seen = set()
    for b_path, a_path in targets[:24]:
        if a_path.name in seen:
            continue
        seen.add(a_path.name)
        try:
            with Image.open(b_path) as ib, Image.open(a_path) as ia:
                rb = ib.convert("RGB")
                ra = ia.convert("RGB")
                # Normalize width side-by-side (crop vertical height to max 1400px so pair stays sharp and fast to view)
                tw = 700
                rb.thumbnail((tw, 1600))
                ra.thumbnail((tw, 1600))
                hdr = 44
                gap = 16
                W = tw * 2 + gap * 3
                H = hdr + max(rb.height, ra.height) + gap
                comp = Image.new("RGB", (W, H), (245, 243, 233))
                draw = ImageDraw.Draw(comp)
                draw.rectangle([0, 0, W, hdr], fill=(37, 53, 43))
                draw.text((gap, 11), f"BEFORE: {b_path.name}", fill=(255, 200, 180), font=FONT_BOLD)
                draw.text((tw + gap * 2, 11), f"AFTER: {a_path.name}", fill=(180, 245, 200), font=FONT_BOLD)
                comp.paste(rb, (gap, hdr))
                comp.paste(ra, (tw + gap * 2, hdr))
                out_name = f"compare-{a_path.stem}.png"
                comp.save(out_dir / out_name)
                pairs.append(out_name)
        except Exception as e:
            print("Pair skipped", a_path.name, e)
    print(f"Generated {len(pairs)} before/after comparison PNGs -> {out_dir}")
    return pairs


def generate_offline_html(root_dir: Path, html_name: str, manifest: dict, issues_rows: list):
    captures = manifest.get("captures", [])
    rows_json = json.dumps(captures, ensure_ascii=False)
    issues_json = json.dumps(issues_rows, ensure_ascii=False)

    extra_links = []
    for doc_name in [
        "README.md",
        "IMPLEMENTATION_SUMMARY.md",
        "KNOWN_ISSUES.md",
        "MANUAL_ACTIONS.md",
        "ROUTE_INVENTORY.csv",
        "SCREENSHOT_COVERAGE.csv",
        "REQUIREMENTS_STATUS.csv",
        "MANIFEST.json",
        "source-info/source-fingerprint.txt",
        "source-info/git-diff-summary.txt",
        "source-info/changed-files.txt",
    ]:
        if (root_dir / doc_name).exists():
            extra_links.append(f'<a class="badge" href="{html.escape(doc_name)}" target="_blank">{html.escape(doc_name)}</a>')

    visual_extras = []
    for folder_name, label in [("before-after", "Before/After"), ("design-targets", "Target"), ("contact-sheets", "Sheet"), ("motion", "Motion GIF")]:
        fp = root_dir / folder_name
        if fp.exists():
            exts = (".png", ".jpg", ".gif", ".html") if folder_name != "motion" else (".gif",)
            for item in sorted(fp.rglob("*")):
                if item.is_file() and item.suffix.lower() in exts:
                    rel = item.relative_to(root_dir).as_posix()
                    visual_extras.append(f'<a class="badge" href="{html.escape(rel)}" target="_blank">{html.escape(label)}: {html.escape(item.name)}</a>')

    docs_panel = ""
    if extra_links or visual_extras:
        docs_panel = (
            '<div class="issues" style="margin-bottom:8px;">'
            '<strong>Offline Documentation, Source Fingerprint & Visual Composites:</strong>'
            f'<div class="badges" style="margin-top:8px;">{"".join(extra_links)}{"".join(visual_extras[:60])}</div>'
            '</div>'
        )

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>NaiFarm Offline UI Review Gallery ({html.escape(str(manifest.get('stage', 'review')))})</title>
<style>
  :root {{ --bg: #F5F3E9; --card: #FFFFFF; --ink: #25352B; --muted: #52645A; --green: #245B3D; --border: #D6DED2; }}
  * {{ box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }}
  body {{ margin: 0; background: var(--bg); color: var(--ink); }}
  header {{ background: var(--green); color: #fff; padding: 18px 24px; }}
  header h1 {{ margin: 0 0 6px; font-size: 20px; }}
  header p {{ margin: 0; font-size: 13px; opacity: 0.9; }}
  .bar {{ display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 24px; background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }}
  .bar input, .bar select {{ padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: #FAF8F1; }}
  .stats {{ margin-left: auto; font-size: 13px; font-weight: 700; color: var(--green); align-self: center; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px; padding: 20px 24px; }}
  .card {{ background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }}
  .thumb {{ height: 220px; background: #EAF0E5; overflow: hidden; display: flex; align-items: flex-start; justify-content: center; border-bottom: 1px solid var(--border); }}
  .thumb img {{ width: 100%; height: auto; object-fit: cover; }}
  .meta {{ padding: 12px 14px; font-size: 12px; display: flex; flex-direction: column; gap: 5px; }}
  .title {{ font-weight: 700; font-size: 14px; color: var(--green); word-break: break-all; }}
  .badges {{ display: flex; flex-wrap: wrap; gap: 6px; }}
  .badge {{ background: #EAF0E5; color: var(--ink); border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 600; }}
  .issues {{ max-width: 1400px; margin: 16px 24px; background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 16px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 12px; }}
  th, td {{ text-align: left; padding: 7px 8px; border-bottom: 1px solid var(--border); }}
</style>
</head>
<body>
<header>
  <h1>NaiFarm Offline UI Review Archive &mdash; Stage: {html.escape(str(manifest.get('stage', '')))}</h1>
  <p>Generated: {html.escape(str(manifest.get('generatedAt', '')))} | Captures: {len(captures)} | Zero external scripts (100% offline)</p>
</header>
<div class="bar">
  <input id="q" placeholder="Filter route, screen ID, component..." />
  <select id="loc"><option value="">All locales</option><option value="vi">VI</option><option value="en">EN</option></select>
  <select id="role"><option value="">All roles</option><option value="guest">guest</option><option value="W01">W01</option><option value="W02">W02</option><option value="W03">W03</option><option value="W04">W04</option><option value="W05">W05</option><option value="W06">W06</option></select>
  <select id="ctype"><option value="">All capture types</option><option value="full">Full Pages</option><option value="ui-state">UI States</option><option value="section">Hero / Sections</option><option value="crop">Header / Footer / Grid Crops</option><option value="motion">Motion Filmstrip</option></select>
  <select id="vp"><option value="">All viewports</option><option value="1440">1440 Desktop</option><option value="768">768 Tablet</option><option value="390">390 Mobile</option></select>
  <span class="stats" id="cnt"></span>
</div>
{docs_panel}
<div class="grid" id="grid"></div>
<div class="issues">
  <h2>Issue Ledger Snapshot ({len(issues_rows)} items)</h2>
  <table><thead><tr><th>ID</th><th>Severity</th><th>Route</th><th>Status</th><th>Actual Summary</th></tr></thead><tbody>
  {"".join(f"<tr><td><b>{html.escape(r.get('id',''))}</b></td><td>{html.escape(r.get('severity',''))}</td><td>{html.escape(r.get('route',''))}</td><td>{html.escape(r.get('status',''))}</td><td>{html.escape(r.get('actual','')[:120])}</td></tr>" for r in issues_rows)}
  </tbody></table>
</div>
<script>
const CAPTURES = {rows_json};
const qEl = document.getElementById('q'), locEl = document.getElementById('loc'), roleEl = document.getElementById('role'), ctypeEl = document.getElementById('ctype'), vpEl = document.getElementById('vp'), grid = document.getElementById('grid'), cnt = document.getElementById('cnt');
function render() {{
  const q = qEl.value.toLowerCase().trim(), loc = locEl.value, role = roleEl.value, ct = ctypeEl.value, vp = vpEl.value;
  const rows = CAPTURES.filter(c =>
    (!q || (c.screenId + ' ' + c.route + ' ' + (c.component||'') + ' ' + (c.uiState||'')).toLowerCase().includes(q)) &&
    (!loc || c.locale === loc) &&
    (!role || c.role === role || c.workspace === role) &&
    (!ct || c.captureType === ct) &&
    (!vp || String(c.viewport||'').includes(vp))
  );
  cnt.textContent = rows.length + ' / ' + CAPTURES.length + ' visible';
  grid.innerHTML = rows.map(c => `
    <div class="card">
      <a class="thumb" href="${{c.relativePath}}" target="_blank"><img loading="lazy" src="${{c.relativePath}}" alt="${{c.screenId}}" /></a>
      <div class="meta">
        <div class="title">${{c.screenId}}</div>
        <div><code>${{c.route}}</code></div>
        <div class="badges">
          <span class="badge">${{String(c.locale||'').toUpperCase()}}</span>
          <span class="badge">${{c.viewport}}</span>
          <span class="badge">${{c.role}}</span>
          <span class="badge">${{c.captureType}}</span>
        </div>
        <div>${{c.component||''}} &middot; ${{c.uiState||''}}</div>
      </div>
    </div>`).join('');
}}
[qEl, locEl, roleEl, ctypeEl, vpEl].forEach(el => el.addEventListener('input', render));
render();
</script>
</body>
</html>"""
    (root_dir / html_name).write_text(html_content, encoding="utf-8")


def write_zip_and_verify(folder: Path, zip_path: Path, manifest_path: Path):
    if zip_path.exists():
        zip_path.unlink()
    file_count = 0
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for fp in sorted(folder.rglob("*")):
            if not fp.is_file():
                continue
            rel = fp.relative_to(folder.parent).as_posix()
            low = rel.lower()
            if any(bad in low for bad in FORBIDDEN_PATTERNS):
                raise RuntimeError(f"SECURITY HYGIENE VIOLATION: forbidden path {rel}")
            zf.write(fp, rel)
            file_count += 1

    # Verify ZIP integrity & relative manifest paths
    with zipfile.ZipFile(zip_path, "r") as zf:
        corrupted = zf.testzip()
        if corrupted is not None:
            raise RuntimeError(f"ZIP CRC error in {corrupted}")
        names = set(zf.namelist())
        prefix = folder.name + "/"
        if manifest_path.exists():
            m = json.loads(manifest_path.read_text(encoding="utf-8"))
            missing = []
            for cap in m.get("captures", []):
                rp = cap.get("relativePath")
                if rp and (prefix + rp) not in names:
                    missing.append(rp)
            if missing:
                raise RuntimeError(f"Missing {len(missing)} manifest files inside ZIP: {missing[:5]}")
    mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"ZIP VERIFIED OK: {zip_path} ({file_count} files, {mb:.2f} MB)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder", required=True)
    parser.add_argument("--zip", required=True)
    parser.add_argument("--html-name", default="REVIEW_INDEX.html")
    parser.add_argument("--manifest-name", default="MANIFEST.json")
    parser.add_argument("--issues-csv", required=True)
    parser.add_argument("--before-dir", required=False)
    args = parser.parse_args()

    folder = Path(args.folder).resolve()
    zip_path = Path(args.zip).resolve()
    manifest_path = folder / args.manifest_name
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"captures": []}

    issues_rows = []
    ic = Path(args.issues_csv)
    if ic.exists():
        with ic.open("r", encoding="utf-8-sig") as f:
            issues_rows = list(csv.DictReader(f))

    if args.before_dir:
        build_before_after_pairs(Path(args.before_dir).resolve(), folder, folder / "before-after")

    generate_offline_html(folder, args.html_name, manifest, issues_rows)
    write_zip_and_verify(folder, zip_path, manifest_path)


if __name__ == "__main__":
    main()
