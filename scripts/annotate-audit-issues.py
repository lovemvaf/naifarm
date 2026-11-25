#!/usr/bin/env python3
"""
Offline Defect Annotator, Crop Generator, Before/After Stitcher & Offline Gallery Builder.
Never alters raw screenshots — operates strictly on PNG copies.
"""
import argparse
import csv
import html
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

try:
    FONT_BOLD = ImageFont.truetype("arialbd.ttf", 18)
    FONT_REG = ImageFont.truetype("arial.ttf", 14)
    FONT_SM = ImageFont.truetype("arial.ttf", 12)
except Exception:
    FONT_BOLD = ImageFont.load_default()
    FONT_REG = FONT_BOLD
    FONT_SM = FONT_BOLD


def parse_bbox(raw: str):
    if not raw or raw in ("pending", "none", ""):
        return None
    parts = [p.strip() for p in raw.replace(",", ";").split(";") if p.strip()]
    if len(parts) != 4:
        return None
    try:
        x, y, w, h = [int(float(v)) for v in parts]
        return (x, y, max(24, w), max(24, h))
    except Exception:
        return None


def annotate_issues(issues_csv: Path, raw_base: Path, out_annotated: Path, out_crops: Path):
    out_annotated.mkdir(parents=True, exist_ok=True)
    out_crops.mkdir(parents=True, exist_ok=True)
    if not issues_csv.exists():
        print("No issues CSV at", issues_csv)
        return []
    records = []
    with issues_csv.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)

    annotated_count = 0
    for row in records:
        iid = row.get("id", "").strip()
        raw_rel = row.get("raw_screenshot", "").strip()
        if not iid or not raw_rel or raw_rel == "pending":
            continue
        src_img = Path(raw_rel)
        if not src_img.is_absolute():
            src_img = raw_base / raw_rel
        if not src_img.exists():
            continue

        with Image.open(src_img) as im:
            canvas = im.convert("RGB")
            W, H = canvas.size
            bbox = parse_bbox(row.get("bbox_css", ""))
            # Auto clamp bbox inside image
            if bbox is None:
                bbox = (16, 16, min(W - 32, 600), min(H - 32, 260))
            x, y, w, h = bbox
            x = max(0, min(x, W - 20))
            y = max(0, min(y, H - 20))
            x2 = min(W - 2, x + w)
            y2 = min(H - 2, y + h)

            # Add top margin banner on copy so label stays readable without hiding subject
            banner_h = 56
            out_img = Image.new("RGB", (W, H + banner_h), (245, 243, 233))
            out_img.paste(canvas, (0, banner_h))
            draw = ImageDraw.Draw(out_img)

            # Top annotation legend
            sev = row.get("severity", "P2")
            actual = row.get("actual", "")[:115]
            draw.rectangle([0, 0, W, banner_h], fill=(37, 53, 43))
            draw.text((14, 8), f"[{iid}] ({sev}) · {row.get('route', '')} · {row.get('locale', '')} {row.get('viewport', '')}", fill=(255, 224, 130), font=FONT_BOLD)
            draw.text((14, 32), actual, fill=(245, 243, 233), font=FONT_SM)

            # Draw red callout box on copy
            bx1, by1, bx2, by2 = x, y + banner_h, x2, y2 + banner_h
            for off in range(4):
                draw.rectangle([bx1 - off, by1 - off, bx2 + off, by2 + off], outline=(200, 32, 32))
            tag_w = max(110, len(iid) * 11 + 16)
            tag_y = max(banner_h + 2, by1 - 24)
            draw.rectangle([bx1, tag_y, bx1 + tag_w, tag_y + 22], fill=(200, 32, 32))
            draw.text((bx1 + 6, tag_y + 3), iid, fill=(255, 255, 255), font=FONT_SM)

            out_img.save(out_annotated / f"{iid}.png")

            # Crop region with generous 40px padding
            pad = 40
            cx1 = max(0, x - pad)
            cy1 = max(0, y - pad)
            cx2 = min(W, x2 + pad)
            cy2 = min(H, y2 + pad)
            if cx2 - cx1 >= 40 and cy2 - cy1 >= 40:
                crop = canvas.crop((cx1, cy1, cx2, cy2))
                crop.save(out_crops / f"{iid}-crop.png")
            annotated_count += 1
    print(f"Annotated {annotated_count} issue copies -> {out_annotated}")
    return records


def build_contact_sheets(images_list, out_dir: Path, prefix: str, cols=3, thumb_w=420, thumb_h=280):
    out_dir.mkdir(parents=True, exist_ok=True)
    chunk_size = 12
    created = []
    for chunk_idx in range(0, len(images_list), chunk_size):
        chunk = images_list[chunk_idx : chunk_idx + chunk_size]
        rows = (len(chunk) + cols - 1) // cols
        pad = 16
        hdr = 44
        cell_h = thumb_h + 36
        W = cols * (thumb_w + pad) + pad
        H = hdr + rows * (cell_h + pad) + pad
        sheet = Image.new("RGB", (W, H), (245, 243, 233))
        draw = ImageDraw.Draw(sheet)
        page_num = (chunk_idx // chunk_size) + 1
        draw.text((pad, 12), f"{prefix} · Sheet {page_num} ({len(chunk)} captures)", fill=(36, 91, 61), font=FONT_BOLD)
        for i, item in enumerate(chunk):
            r, c = divmod(i, cols)
            x = pad + c * (thumb_w + pad)
            y = hdr + pad + r * (cell_h + pad)
            draw.rectangle([x, y, x + thumb_w, y + cell_h], fill=(255, 255, 255), outline=(214, 222, 210), width=1)
            fp = item["abs_path"]
            try:
                with Image.open(fp) as im:
                    im_rgb = im.convert("RGB")
                    # Crop top viewport aspect if extremely tall full-page screenshot so thumbnail stays readable
                    iw, ih = im_rgb.size
                    if ih > iw * 1.8:
                        im_rgb = im_rgb.crop((0, 0, iw, int(iw * 0.9)))
                    im_rgb.thumbnail((thumb_w - 8, thumb_h - 8))
                    tw, th = im_rgb.size
                    sheet.paste(im_rgb, (x + (thumb_w - tw) // 2, y + 4 + (thumb_h - th) // 2))
            except Exception:
                pass
            cap = f"{item.get('screenId', '')} | {item.get('locale', '').upper()} | {item.get('viewport', '')}"
            draw.text((x + 6, y + thumb_h + 10), cap[:55], fill=(37, 53, 43), font=FONT_SM)
        out_path = out_dir / f"{prefix}-sheet-{page_num:02d}.jpg"
        sheet.save(out_path, quality=86)
        created.append(out_path.name)
    return created


def make_motion_gif(frame_paths, out_gif: Path, duration_ms=650):
    frames = []
    for p in frame_paths:
        if p.exists():
            with Image.open(p) as im:
                rgb = im.convert("RGB")
                rgb.thumbnail((960, 600))
                frames.append(rgb)
    if len(frames) >= 2:
        frames[0].save(
            out_gif,
            save_all=True,
            append_images=frames[1:],
            duration=duration_ms,
            loop=0,
        )
        print("Saved motion GIF:", out_gif)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--issues", required=False)
    parser.add_argument("--raw-base", required=True)
    parser.add_argument("--annotated-dir", required=True)
    parser.add_argument("--crops-dir", required=True)
    parser.add_argument("--contact-sheets-dir", required=True)
    parser.add_argument("--manifest", required=False)
    parser.add_argument("--motion-dir", required=False)
    args = parser.parse_args()

    raw_base = Path(args.raw_base).resolve()
    if args.issues:
        annotate_issues(Path(args.issues), raw_base, Path(args.annotated_dir), Path(args.crops_dir))

    if args.manifest and Path(args.manifest).exists():
        manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        entries = manifest.get("captures", [])
        valid_imgs = []
        for e in entries:
            rel = e.get("relativePath") or e.get("file")
            if not rel:
                continue
            ap = raw_base / rel
            if ap.exists() and e.get("captureType", "full") != "crop":
                e_copy = dict(e)
                e_copy["abs_path"] = ap
                valid_imgs.append(e_copy)
        build_contact_sheets(valid_imgs, Path(args.contact_sheets_dir), manifest.get("stage", "audit"))

    if args.motion_dir and Path(args.motion_dir).exists():
        mdir = Path(args.motion_dir)
        for prefix in ["hero-desktop-vi", "hero-desktop-en", "hero-mobile-vi"]:
            frames = sorted(mdir.glob(f"{prefix}-t*.png"))
            if len(frames) >= 2:
                make_motion_gif(frames, mdir / f"{prefix}-filmstrip.gif")


if __name__ == "__main__":
    main()
