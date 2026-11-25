async function testPublishDraft() {
  console.log("=== KIỂM THỬ ENDPOINT /api/ai/publish-draft ===");

  const cases = [
    {
      title: "Test Case 1: Đủ thông tin sản phẩm, số lượng, giá bán",
      payload: {
        text: "Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.",
        sampleId: "rambutan",
      },
    },
    {
      title: "Test Case 2: THIẾU GIÁ VÀ SỐ LƯỢNG (Bắt buộc trường price & stock phải là null)",
      payload: {
        text: "Vườn Ba Tư hôm nay thu hoạch sầu riêng Ri6 chín cây thơm nức mũi đạt chuẩn OCOP.",
        sampleId: "durian",
      },
    },
    {
      title: "Test Case 3: Nhận dạng từ ASR audio transcript",
      payload: {
        text: "Hệ thống AI Farm đã kết nối thành công. Xin kính chào quý khách.",
      },
    },
  ];

  for (const c of cases) {
    console.log(`\n--- ${c.title} ---`);
    const res = await fetch("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c.payload),
    });

    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log("Result:", JSON.stringify(json, null, 2));

    if (c.title.includes("THIẾU GIÁ VÀ SỐ LƯỢNG")) {
      const p = json.data?.price;
      const s = json.data?.stock;
      if (p === null && s === null) {
        console.log("-> [CHECK PASS]: price và stock ĐỀU LÀ NULL (không bịa số) đúng quy định!");
      } else {
        console.error(`-> [CHECK FAIL]: AI trả về price=${p}, stock=${s} thay vì null!`);
      }
    }
  }
}

testPublishDraft();
