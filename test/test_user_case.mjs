import { parseVietnameseQuantityAndUnit, parseVietnamesePrice, parseViWordsToNumber } from '../src/lib/vietnameseNumberParser.ts';

console.log("=== 1. TEST UNIT FUNCTION (vietnameseNumberParser) ===");

const testText = "tôi có một trăm hai mươi túi hạt điều. mọi người có thể mua ăn để bổ sung sức khỏe.";

console.log("Input:", testText);

// Test parseViWordsToNumber
const parsedWords = parseViWordsToNumber("một trăm hai mươi");
console.log("parseViWordsToNumber('một trăm hai mươi'):", parsedWords);
if (parsedWords === 120) {
  console.log("-> PASS: parseViWordsToNumber == 120");
} else {
  console.error("-> FAIL: parseViWordsToNumber !=", 120);
}

// Test quantity & unit
const qtyRes = parseVietnameseQuantityAndUnit(testText);
console.log("parseVietnameseQuantityAndUnit result:", qtyRes);
if (qtyRes.stock === 120 && qtyRes.unit === "túi") {
  console.log("-> PASS: stock == 120, unit == 'túi'");
} else {
  console.error("-> FAIL: Expected stock: 120, unit: 'túi', got:", qtyRes);
}

// Test price
const priceRes = parseVietnamesePrice(testText);
console.log("parseVietnamesePrice result:", priceRes);
if (priceRes === null) {
  console.log("-> PASS: price is null (no hallucinated price)");
} else {
  console.error("-> FAIL: Expected price: null, got:", priceRes);
}

console.log("\n=== 2. TEST ENDPOINT /api/ai/publish-draft ===");

async function testEndpoint() {
  const res = await fetch("http://localhost:3000/api/ai/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: testText,
      sampleId: "cashew" // Even if sampleId is provided or omitted
    })
  });

  const json = await res.json();
  console.log("HTTP Status:", res.status);
  console.log("Response:", JSON.stringify(json, null, 2));

  const data = json.data;
  let allPass = true;

  if (data?.stock === 120) {
    console.log("-> PASS: data.stock === 120");
  } else {
    console.error("-> FAIL: data.stock is", data?.stock, "expected 120");
    allPass = false;
  }

  if (data?.unit === "túi") {
    console.log("-> PASS: data.unit === 'túi'");
  } else {
    console.error("-> FAIL: data.unit is", data?.unit, "expected 'túi'");
    allPass = false;
  }

  if (data?.price === null) {
    console.log("-> PASS: data.price === null (không bịa số)");
  } else {
    console.error("-> FAIL: data.price is", data?.price, "expected null");
    allPass = false;
  }

  if (data?.name && data.name.toLowerCase().includes("hạt điều")) {
    console.log("-> PASS: data.name contains 'hạt điều':", data.name);
  } else {
    console.error("-> FAIL: data.name does not contain 'hạt điều':", data?.name);
    allPass = false;
  }

  if (data?.category === "Hạt & Cà phê") {
    console.log("-> PASS: data.category === 'Hạt & Cà phê'");
  } else {
    console.error("-> FAIL: data.category is", data?.category, "expected 'Hạt & Cà phê'");
    allPass = false;
  }

  // Also test when user selects a different sampleId like 'durian', text priority must win
  console.log("\n--- TEST TEXT PRIORITY OVER SAMPLE IMAGE ---");
  const resPriority = await fetch("http://localhost:3000/api/ai/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: testText,
      sampleId: "durian" // Farmer talks about cashew, but selected durian sample photo
    })
  });
  const jsonPriority = await resPriority.json();
  console.log("Priority Response Data:", JSON.stringify(jsonPriority.data, null, 2));
  if (jsonPriority.data?.category === "Hạt & Cà phê" && jsonPriority.data?.stock === 120 && jsonPriority.data?.unit === "túi") {
    console.log("-> PASS: Text priority wins over sample photo (Hạt điều / Hạt & Cà phê / 120 túi)!");
  } else {
    console.error("-> FAIL: Priority test failed");
  }

  console.log("\nFINAL VERDICT:", allPass ? "ALL ASSERTIONS PASSED!" : "FAILURES DETECTED!");
}

testEndpoint();
