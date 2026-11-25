#!/usr/bin/env python3
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "public", "images", "stitch")
MAX_WIDTH = 1600
QUALITY = 80


def convert(path):
    name = os.path.splitext(os.path.basename(path))[0]
    dest = os.path.join(SRC_DIR, f"{name}.webp")
    with Image.open(path) as img:
        img = img.convert("RGB")
        width, height = img.size
        if width > MAX_WIDTH:
            ratio = MAX_WIDTH / float(width)
            img = img.resize((MAX_WIDTH, int(round(height * ratio))), Image.LANCZOS)
        img.save(dest, "WEBP", quality=QUALITY, method=6)
    return os.path.getsize(path), os.path.getsize(dest)


def main():
    if not os.path.isdir(SRC_DIR):
        print(f"Không tìm thấy {SRC_DIR}")
        return 1
    total_before = 0
    total_after = 0
    count = 0
    for entry in sorted(os.listdir(SRC_DIR)):
        ext = os.path.splitext(entry)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png"):
            continue
        before, after = convert(os.path.join(SRC_DIR, entry))
        total_before += before
        total_after += after
        count += 1
        print(f"{entry}: {before // 1024} KB -> {after // 1024} KB")
    print(f"Tổng: {count} ảnh, {total_before // 1024} KB -> {total_after // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
