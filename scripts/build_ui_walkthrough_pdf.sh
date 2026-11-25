#!/usr/bin/env bash
# Build NAIFARM_GIAO_DIEN_UI.pdf from the HTML walkthrough source.
# Requires Chromium headless (Playwright cache is present in this repo).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HTML_SRC="$ROOT_DIR/docs/ui-walkthrough/naifarm_ui_walkthrough.html"
PDF_OUT="$ROOT_DIR/docs/NAIFARM_GIAO_DIEN_UI.pdf"

CHROMIUM="$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"

if [ ! -f "$HTML_SRC" ]; then
  echo "Không tìm thấy nguồn HTML: $HTML_SRC" >&2
  exit 1
fi

if [ ! -x "$CHROMIUM" ]; then
  echo "Không tìm thấy Chromium tại: $CHROMIUM" >&2
  exit 1
fi

echo "Đang in PDF từ $HTML_SRC ..."
"$CHROMIUM" --headless=new \
  --disable-gpu \
  --no-sandbox \
  --no-pdf-header-footer \
  --print-to-pdf="$PDF_OUT" \
  "file://$HTML_SRC" >/dev/null 2>&1

if [ -f "$PDF_OUT" ]; then
  echo "Hoàn tất: $PDF_OUT"
  ls -la "$PDF_OUT"
else
  echo "In PDF thất bại." >&2
  exit 1
fi
