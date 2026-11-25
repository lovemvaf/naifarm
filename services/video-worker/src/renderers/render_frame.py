#!/usr/bin/env python3
"""
Render 4 crisp high-DPI storyboard PNG slides + poster JPEG for NaiFarm OCOP Video Studio.
Uses Windows/Linux system fonts supporting full Vietnamese diacritics cleanly without
FFmpeg drawtext escaping hazards on paths with spaces.
"""
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

CREAM = (246, 242, 234)
CARD_BG = (251, 249, 245)
GREEN = (36, 91, 61)
GREEN_DARK = (24, 59, 40)
GOLD = (212, 168, 79)
TEXT_DARK = (31, 41, 35)
TEXT_MUTED = (82, 100, 90)
WHITE = (255, 255, 255)


def pick_font(size: int, bold: bool = False, serif: bool = False):
    candidates = []
    if serif:
        candidates += [
            r"C:\Windows\Fonts\palab.ttf" if bold else r"C:\Windows\Fonts\pala.ttf",
            r"C:\Windows\Fonts\timesbd.ttf" if bold else r"C:\Windows\Fonts\times.ttf",
            r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        ]
    if bold:
        candidates += [
            r"C:\Windows\Fonts\segoeuib.ttf",
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\tahomabd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    else:
        candidates += [
            r"C:\Windows\Fonts\segoeui.ttf",
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\tahoma.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    for fp in candidates:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, font, max_width: int, max_lines: int = 4):
    words = (text or "").strip().split()
    if not words or max_lines <= 0:
        return []
    lines = []
    current = ""
    idx = 0
    while idx < len(words):
        word = words[idx]
        candidate = f"{current} {word}".strip() if current else word
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current = candidate
            idx += 1
        else:
            if len(lines) == max_lines - 1:
                break
            lines.append(current)
            current = ""
    if current:
        if idx < len(words):
            remainder = f"{current} {' '.join(words[idx:])}".strip()
            while draw.textbbox((0, 0), remainder + "...", font=font)[2] > max_width and len(remainder) > 3:
                remainder = remainder[:-1].rstrip()
            lines.append(remainder + "...")
        else:
            lines.append(current)
    return lines[:max_lines]


def load_photo(path_str: str | None, width: int, height: int) -> Image.Image:
    if path_str and os.path.exists(path_str):
        try:
            with Image.open(path_str) as im:
                rgb = im.convert("RGB")
                return ImageOps.fit(rgb, (width, height), method=Image.Resampling.LANCZOS)
        except Exception:
            pass
    fallback = Image.new("RGB", (width, height), GREEN_DARK)
    return fallback


def rounded_box(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def apply_gradient_overlay(img: Image.Image, top_alpha: int = 120, bottom_alpha: int = 225) -> Image.Image:
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(h):
        if y < h * 0.25:
            a = int(top_alpha * (1.0 - y / (h * 0.25)))
            od.line([(0, y), (w, y)], fill=(18, 42, 29, a))
        elif y > h * 0.45:
            t = (y - h * 0.45) / (h * 0.55)
            a = int(bottom_alpha * (t ** 1.15))
            od.line([(0, y), (w, y)], fill=(14, 34, 23, a))
    merged = Image.alpha_composite(img.convert("RGBA"), overlay)
    return merged.convert("RGB")


def render_slides(spec: dict):
    w = int(spec["width"])
    h = int(spec["height"])
    out_dir = Path(spec["outDir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    photos = spec.get("photoPaths", [])
    photo0 = photos[0] if len(photos) > 0 else None
    photo1 = photos[1] if len(photos) > 1 else photo0
    photo2 = photos[2] if len(photos) > 2 else photo0

    is_landscape = w > h
    pad = max(36, int(w * 0.065))

    font_tag = pick_font(max(18, int(min(w, h) * 0.028)), bold=True)
    font_title = pick_font(max(34, int(min(w, h) * (0.056 if not is_landscape else 0.062))), bold=True, serif=True)
    font_sub = pick_font(max(22, int(min(w, h) * 0.032)), bold=False)
    font_body = pick_font(max(22, int(min(w, h) * 0.034)), bold=False)
    font_body_b = pick_font(max(24, int(min(w, h) * 0.036)), bold=True)
    font_small = pick_font(max(17, int(min(w, h) * 0.024)), bold=False)

    brand_badge = "NaiFarm · Chợ OCOP Thanh niên" if spec.get("locale") == "vi" else "NaiFarm · Youth OCOP Market"
    demo_note = "Video studio nội địa FFmpeg · Hồ sơ minh họa" if spec.get("locale") == "vi" else "FFmpeg Local Studio Render · Demo Trace"

    # ---- SLIDE 0: HOOK ----
    s0 = apply_gradient_overlay(load_photo(photo0, w, h), top_alpha=145, bottom_alpha=235)
    d0 = ImageDraw.Draw(s0)
    # Top pill
    tag_bbox = d0.textbbox((0, 0), brand_badge, font=font_tag)
    pill_w = min(w - 2 * pad, (tag_bbox[2] - tag_bbox[0]) + 40)
    rounded_box(d0, [pad, pad, pad + pill_w, pad + 48], radius=24, fill=GREEN, outline=GOLD, width=2)
    d0.text((pad + 20, pad + 10), brand_badge, font=font_tag, fill=WHITE)

    # Bottom typography stack
    title_lines = wrap_lines(d0, spec["title"], font_title, w - 2 * pad, max_lines=3)
    price_text = f'{spec["priceLabel"]}  |  {spec["areaLabel"]}'
    sub_lines = wrap_lines(d0, spec["subtitle"], font_sub, w - 2 * pad, max_lines=2)

    y_cur = h - pad - 48
    # Price pill at bottom
    p_bbox = d0.textbbox((0, 0), price_text, font=font_body_b)
    pw = min(w - 2 * pad, (p_bbox[2] - p_bbox[0]) + 36)
    rounded_box(d0, [pad, y_cur - 4, pad + pw, y_cur + 46], radius=14, fill=GOLD)
    d0.text((pad + 18, y_cur + 6), price_text, font=font_body_b, fill=GREEN_DARK)

    y_cur -= 20
    for line in reversed(sub_lines):
        y_cur -= 38
        d0.text((pad, y_cur), line, font=font_sub, fill=(235, 242, 236))

    y_cur -= 16
    for line in reversed(title_lines):
        y_cur -= int(font_title.size * 1.18)
        d0.text((pad, y_cur), line, font=font_title, fill=WHITE)

    slide0_path = out_dir / "slide_0.png"
    s0.save(slide0_path, "PNG")
    poster_path = out_dir / "poster.jpg"
    s0.save(poster_path, "JPEG", quality=88)

    # ---- SLIDE 1: STORY / ORIGIN ----
    bg1 = load_photo(photo1, w, h).filter(ImageFilter.GaussianBlur(radius=14))
    bg1 = apply_gradient_overlay(bg1, top_alpha=170, bottom_alpha=200)
    s1 = bg1.copy()
    d1 = ImageDraw.Draw(s1)

    card_top = int(h * 0.14) if not is_landscape else int(h * 0.12)
    card_bot = int(h * 0.86) if not is_landscape else int(h * 0.88)
    rounded_box(d1, [pad, card_top, w - pad, card_bot], radius=28, fill=CARD_BG, outline=GOLD, width=2)

    # Embedded crisp photo thumbnail inside card
    if is_landscape:
        thumb_w = int((w - 2 * pad) * 0.42)
        thumb_h = card_bot - card_top - 48
        thumb = load_photo(photo1, thumb_w, thumb_h)
        s1.paste(thumb, (pad + 24, card_top + 24))
        text_x = pad + 48 + thumb_w
        text_w = w - pad - 24 - text_x
        ty = card_top + 36
    else:
        thumb_w = w - 2 * pad - 48
        thumb_h = int((card_bot - card_top) * 0.44)
        thumb = load_photo(photo1, thumb_w, thumb_h)
        s1.paste(thumb, (pad + 24, card_top + 24))
        text_x = pad + 32
        text_w = w - 2 * pad - 64
        ty = card_top + 48 + thumb_h

    step_label = "01 · NGUỒN GỐC & MÙA VỤ" if spec.get("locale") == "vi" else "01 · ORIGIN & HARVEST"
    d1.text((text_x, ty), step_label, font=font_tag, fill=GREEN)
    ty += 42
    lines_s1 = spec.get("scriptLines", [])[:2]
    for idx, sl in enumerate(lines_s1):
        wrapped = wrap_lines(d1, f"• {sl}", font_body_b if idx == 0 else font_body, text_w, max_lines=3)
        for wl in wrapped:
            d1.text((text_x, ty), wl, font=font_body_b if idx == 0 else font_body, fill=TEXT_DARK)
            ty += int(font_body.size * 1.28)
        ty += 18
    d1.text((text_x, card_bot - 44), f'{spec["areaLabel"]} · {spec["batchCode"]}', font=font_small, fill=TEXT_MUTED)
    s1.save(out_dir / "slide_1.png", "PNG")

    # ---- SLIDE 2: VALUE & PROCESS ----
    s2 = Image.new("RGB", (w, h), GREEN_DARK)
    d2 = ImageDraw.Draw(s2)
    rounded_box(d2, [pad, int(h * 0.1), w - pad, int(h * 0.9)], radius=28, fill=GREEN, outline=GOLD, width=2)
    step2_label = "02 · QUY TRÌNH MINH BẠCH" if spec.get("locale") == "vi" else "02 · VERIFIED PROCESS"
    if is_landscape:
        tw2 = int((w - 2 * pad) * 0.44)
        th2 = int(h * 0.8) - 48
        s2.paste(load_photo(photo2, tw2, th2), (w - pad - 24 - tw2, int(h * 0.1) + 24))
        tx2 = pad + 36
        tw_txt2 = w - 2 * pad - 84 - tw2
        ty2 = int(h * 0.1) + 40
    else:
        tw2 = w - 2 * pad - 48
        th2 = int(h * 0.34)
        s2.paste(load_photo(photo2, tw2, th2), (pad + 24, int(h * 0.1) + 24))
        tx2 = pad + 32
        tw_txt2 = w - 2 * pad - 64
        ty2 = int(h * 0.1) + 48 + th2

    d2.text((tx2, ty2), step2_label, font=font_tag, fill=GOLD)
    ty2 += 46
    lines_s2 = spec.get("scriptLines", [])[2:] or [spec["subtitle"], spec["ctaLabel"]]
    for sl in lines_s2[:3]:
        for wl in wrap_lines(d2, f"✓ {sl}", font_body, tw_txt2, max_lines=3):
            d2.text((tx2, ty2), wl, font=font_body, fill=WHITE)
            ty2 += int(font_body.size * 1.28)
        ty2 += 16

    rounded_box(d2, [tx2, int(h * 0.9) - 72, tx2 + min(tw_txt2, 420), int(h * 0.9) - 24], radius=12, fill=CREAM)
    d2.text((tx2 + 16, int(h * 0.9) - 62), f'{spec["priceLabel"]} · {demo_note[:34]}', font=font_small, fill=GREEN_DARK)
    s2.save(out_dir / "slide_2.png", "PNG")

    # ---- SLIDE 3: QR PASSPORT & CTA ----
    s3 = Image.new("RGB", (w, h), CREAM)
    d3 = ImageDraw.Draw(s3)
    rounded_box(d3, [pad, int(h * 0.1), w - pad, int(h * 0.9)], radius=28, fill=WHITE, outline=GREEN, width=3)

    qr_path = spec.get("qrPath")
    qr_size = min(300, int(min(w, h) * 0.36))
    qr_img = None
    if qr_path and os.path.exists(qr_path):
        with Image.open(qr_path) as qim:
            qr_img = qim.convert("RGB").resize((qr_size, qr_size), Image.Resampling.NEAREST)

    if is_landscape:
        qx = pad + 44
        qy = (h - qr_size) // 2
        if qr_img:
            s3.paste(qr_img, (qx, qy))
        cx = qx + qr_size + 44
        cw = w - pad - 36 - cx
        cy = int(h * 0.22)
    else:
        qx = (w - qr_size) // 2
        qy = int(h * 0.16)
        if qr_img:
            s3.paste(qr_img, (qx, qy))
        cx = pad + 36
        cw = w - 2 * pad - 72
        cy = qy + qr_size + 36

    scan_head = "QUÉT MÃ QR TRUY XUẤT" if spec.get("locale") == "vi" else "SCAN TRACEABILITY QR"
    d3.text((cx, cy), scan_head, font=font_tag, fill=GREEN)
    cy += 44
    for wl in wrap_lines(d3, spec["title"], font_title, cw, max_lines=2):
        d3.text((cx, cy), wl, font=font_title, fill=TEXT_DARK)
        cy += int(font_title.size * 1.15)
    cy += 16
    rounded_box(d3, [cx, cy, cx + min(cw, 360), cy + 44], radius=12, fill=GREEN_DARK)
    d3.text((cx + 16, cy + 8), f'Batch: {spec["batchCode"]}', font=font_tag, fill=WHITE)
    cy += 64
    for wl in wrap_lines(d3, spec["ctaLabel"], font_body_b, cw, max_lines=2):
        d3.text((cx, cy), wl, font=font_body_b, fill=GREEN)
        cy += int(font_body_b.size * 1.25)

    d3.text((pad + 36, int(h * 0.9) - 44), "Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị", font=font_small, fill=TEXT_MUTED)
    s3.save(out_dir / "slide_3.png", "PNG")

    print(json.dumps({"ok": True, "slides": 4, "poster": str(poster_path)}))


if __name__ == "__main__":
    spec_file = Path(sys.argv[1])
    payload = json.loads(spec_file.read_text(encoding="utf-8"))
    render_slides(payload)
