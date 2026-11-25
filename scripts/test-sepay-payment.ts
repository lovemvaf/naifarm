import assert from "node:assert";
import {
  parseOrderIdFromContent,
  getSepayQrUrl,
  getVietQrFallbackUrl,
  SEPAY_CONFIG,
  type SepayWebhookPayload,
} from "../src/lib/payment/sepay";
import {
  recordSepayTransaction,
  getPaymentStatusByOrderId,
  simulatePaymentForOrder,
} from "../src/lib/payment/store";

async function main() {
  console.log("=== BẮT ĐẦU KIỂM TRA TÍCH HỢP SEPAY PAYMENT ===");

  // 1. Kiểm tra cấu hình tài khoản MBBank
  console.log("[1/5] Kiểm tra cấu hình ngân hàng:");
  assert.strictEqual(SEPAY_CONFIG.accountNumber, "0369966231", "Số tài khoản phải là 0369966231");
  assert.strictEqual(SEPAY_CONFIG.bankCode, "MBBank", "Mã ngân hàng phải là MBBank");
  console.log("  ✓ MBBank Số TK:", SEPAY_CONFIG.accountNumber);
  console.log("  ✓ Tên ngân hàng:", SEPAY_CONFIG.bankDisplayName);

  // 2. Kiểm tra bộ bóc tách mã đơn (Regex Parser)
  console.log("\n[2/5] Kiểm tra bóc tách mã đơn từ nội dung chuyển khoản:");
  const testCases = [
    { text: "NF-ORD-DEMO-10", expected: "NF-ORD-DEMO-10" },
    { text: "MB123456 chuyen tien cho don NF-ORD-DEMO-12 xin cam on", expected: "NF-ORD-DEMO-12" },
    { text: "NFORDDEMO15 thanh toan", expected: "NF-ORD-DEMO-15" },
    { text: "PAR-2026-987654 thanh toan gop", expected: "PAR-2026-987654" },
  ];

  for (const tc of testCases) {
    const parsed = parseOrderIdFromContent(tc.text);
    assert.strictEqual(parsed, tc.expected, `Nội dung "${tc.text}" phải bóc ra "${tc.expected}"`);
    console.log(`  ✓ "${tc.text}" => "${parsed}"`);
  }

  // 3. Kiểm tra sinh đường dẫn mã QR VietQR / SePay
  console.log("\n[3/5] Kiểm tra sinh URL VietQR / SePay QR:");
  const testOrderId = "NF-ORD-DEMO-99";
  const testAmount = 250000;
  const qrUrl = getSepayQrUrl({ orderId: testOrderId, amount: testAmount });
  const fallbackUrl = getVietQrFallbackUrl({ orderId: testOrderId, amount: testAmount });

  assert(qrUrl.includes("0369966231"), "QR URL phải chứa số tài khoản 0369966231");
  assert(qrUrl.includes("MBBank"), "QR URL phải chứa mã MBBank");
  assert(qrUrl.includes("250000"), "QR URL phải chứa số tiền 250000");
  assert(fallbackUrl.includes("vietqr.io"), "Fallback URL phải chứa vietqr.io");
  console.log("  ✓ SePay QR URL:", qrUrl);
  console.log("  ✓ Fallback VietQR URL:", fallbackUrl);

  // 4. Kiểm tra xử lý Webhook SePay (Ghi nhận & lưu vết giao dịch)
  console.log("\n[4/5] Kiểm tra xử lý Webhook SePay:");
  const mockWebhookPayload: SepayWebhookPayload = {
    id: 99887766,
    gateway: "MBBank",
    transactionDate: "2026-11-25 16:00:00",
    accountNumber: "0369966231",
    code: null,
    content: "NF-ORD-DEMO-99 chuyen tien buoi chieu",
    transferType: "in",
    transferAmount: testAmount,
    accumulated: 10000000,
    referenceCode: "FT2611259988",
    description: "Khach chuyen khoan mua nong san",
  };

  const recordResult = await recordSepayTransaction(mockWebhookPayload);
  assert(recordResult.success, "Ghi nhận giao dịch phải thành công");
  assert.strictEqual(recordResult.orderId, testOrderId, "Mã đơn bóc tách phải khớp");
  console.log("  ✓ Đã ghi nhận webhook giao dịch:", recordResult.transaction.id);

  // Kiểm tra đối soát trạng thái đơn
  const statusCheck = await getPaymentStatusByOrderId(testOrderId);
  assert.strictEqual(statusCheck.paid, true, "Đơn hàng phải ở trạng thái đã thanh toán");
  assert.strictEqual(statusCheck.transaction?.amountVnd, testAmount, "Số tiền phải khớp 250000");
  console.log("  ✓ Kiểm tra trạng thái thanh toán đơn", testOrderId, "=> ĐÃ THANH TOÁN (PAID)");

  // 5. Kiểm tra hàm mô phỏng (Simulate) phục vụ kiểm thử sơ bộ
  console.log("\n[5/6] Kiểm tra chức năng mô phỏng thanh toán (Test Simulation):");
  const simOrderId = "NF-ORD-DEMO-88";
  const simResult = await simulatePaymentForOrder(simOrderId, 120000);
  assert(simResult.success, "Mô phỏng phải thành công");
  const simStatus = await getPaymentStatusByOrderId(simOrderId);
  assert.strictEqual(simStatus.paid, true, "Đơn mô phỏng phải thành paid");
  console.log("  ✓ Mô phỏng thanh toán thành công cho đơn:", simOrderId);

  // 6. Kiểm tra trực tiếp Next.js API Route Handlers
  console.log("\n[6/6] Kiểm tra API Routes (Webhook POST/GET, Status GET):");
  const { POST: sepayPost, GET: sepayGet } = await import("../src/app/api/webhooks/sepay/route");
  const { GET: statusGet } = await import("../src/app/api/payment/status/route");

  // Test SePay GET ping
  const pingRes = await sepayGet();
  const pingData = await pingRes.json();
  assert.strictEqual(pingData.status, "ok", "SePay GET ping phải trả về ok");
  console.log("  ✓ GET /api/webhooks/sepay ping:", pingData.message);

  // Test SePay POST webhook (key is empty as requested)
  const webhookReq = new Request("http://localhost:3000/api/webhooks/sepay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: 55443322,
      gateway: "MBBank",
      transactionDate: "2026-11-25 16:15:00",
      accountNumber: "0369966231",
      content: "NF-ORD-DEMO-77 thanh toan",
      transferType: "in",
      transferAmount: 320000,
    }),
  });
  const webhookRes = await sepayPost(webhookReq);
  const webhookJson = await webhookRes.json();
  assert.strictEqual(webhookRes.status, 200, "Webhook response status phải là 200");
  assert.strictEqual(webhookJson.success, true, "Webhook success phải là true");
  assert.strictEqual(webhookJson.orderId, "NF-ORD-DEMO-77", "Order ID phải là NF-ORD-DEMO-77");
  console.log("  ✓ POST /api/webhooks/sepay phản hồi 200 OK với orderId:", webhookJson.orderId);

  // Test Payment Status API for this order
  const statusReq = new Request("http://localhost:3000/api/payment/status?orderId=NF-ORD-DEMO-77");
  const statusRes = await statusGet(statusReq);
  const statusJson = await statusRes.json();
  assert.strictEqual(statusJson.paid, true, "Trạng thái thanh toán phải là paid: true");
  console.log("  ✓ GET /api/payment/status?orderId=NF-ORD-DEMO-77 => paid: true");

  console.log("\n========================================================");
  console.log(" TẤT CẢ CÁC BƯỚC KIỂM TRA SEPAY PAYMENT ĐÃ THÀNH CÔNG 100%!");
  console.log("========================================================");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
