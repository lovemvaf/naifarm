import assert from "node:assert/strict";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { buildTraceUrl, extractBatchCodeFromScan } from "../src/lib/qr/trace-url";

async function decodeQrBuffer(buffer: Buffer): Promise<string> {
  const png = PNG.sync.read(buffer);
  const clamped = new Uint8ClampedArray(png.data);
  const result = jsQR(clamped, png.width, png.height);
  assert(result && result.data, "jsQR failed to decode generated QR PNG buffer");
  return result.data;
}

async function main() {
  const codes = ["NF-DEMO-001", "NF-TT-2026-01", "NF-XL-2026-03"];

  for (const code of codes) {
    const url = buildTraceUrl(code);
    const pngBuffer = await QRCode.toBuffer(url, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 4,
      width: 360,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const decodedUrl = await decodeQrBuffer(pngBuffer);
    assert.equal(decodedUrl, url, `Decoded text mismatch for ${code}`);
    const parsed = extractBatchCodeFromScan(decodedUrl);
    assert.equal(parsed.ok, true, `Valid trace URL rejected for ${code}`);
    assert.equal(parsed.batchCode, code);
  }

  // Negative security checks for malicious or third-party QR payloads
  const maliciousPayloads = [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "https://evil-phishing.example/trace/NF-DEMO-001",
    "<script>window.x=1</script>",
    "",
  ];
  for (const bad of maliciousPayloads) {
    const res = extractBatchCodeFromScan(bad);
    assert.equal(res.ok, false, `Expected security validator to reject payload: ${bad}`);
  }

  console.log("VERIFY_QR_DECODE PASS: PNG QR encode/decode & URL security validation verified for all batches.");
}

main();
