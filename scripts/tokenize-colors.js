#!/usr/bin/env node
/**
 * Tokenize hard-coded hex arbitrary values in className strings.
 * Replaces `[#HEX]` (optionally followed by `/opacity`) with the matching
 * design token utility suffix. Inline SVG/Three.js/QR props use `="#HEX"`
 * (no brackets) and are therefore left untouched.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const MAP = {
  "245B3D": "primary",
  "19472E": "primary-hover",
  "2F6E4B": "primary-soft",
  F5F3E9: "background",
  EAF0E5: "surface-soft",
  EFECE0: "surface-warm",
  DDE7D6: "leaf-soft",
  DDE8D5: "leaf-mist",
  EFE8D5: "sand",
  "6C9C5B": "leaf",
  "25352B": "foreground",
  "52645A": "muted",
  D6DED2: "border",
  "788A7B": "input",
  D7A34D: "accent",
  C6923D: "accent-hover",
  "24603B": "success",
  E6F3E9: "success-bg",
  "80520C": "warning",
  FFF2D8: "warning-bg",
  A32D2D: "danger",
  FDECEC: "danger-bg",
  FAD6D6: "danger-bg-hover",
  "245B78": "info",
  E8F2F8: "info-bg",
  FFFFFF: "surface",
};

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

let files = 0;
let total = 0;
const unknown = new Set();
for (const file of walk(SRC)) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  src = src.replace(/\[#([0-9A-Fa-f]{6})\]/g, (m, hex) => {
    const token = MAP[hex.toUpperCase()];
    if (!token) {
      unknown.add(hex.toUpperCase());
      return m;
    }
    total++;
    return token;
  });
  if (src !== before) {
    fs.writeFileSync(file, src);
    files++;
  }
}
console.log(`Replaced ${total} hex occurrences across ${files} files`);
if (unknown.size) console.log("UNMAPPED:", [...unknown].join(", "));
