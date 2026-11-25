import { POST } from "../src/app/api/ai/publish-draft/route";
import { NextRequest } from "next/server";

async function runTestSuite() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG ENDPOINT API: /api/ai/publish-draft ===\n");

  const results: { test: string; status: "PASS" | "FAIL"; details: string }[] = [];

  // TEST 1: ĐẦY ĐỦ THÔNG TIN (Tên, Giá, Số lượng)
  try {
    console.log("[Test 1] Kiểm tra trường hợp ĐẦY ĐỦ THÔNG TIN...");
    const req1 = new NextRequest("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.",
        sampleId: "rambutan",
      }),
    });

    const res1 = await POST(req1);
    const data1 = await res1.json();
    console.log("Response Test 1:", JSON.stringify(data1, null, 2));

    if (
      data1.success &&
      data1.data.price === 35000 &&
      data1.data.stock === 30 &&
      data1.data.unit?.includes("kg") &&
      data1.data.name
    ) {
      results.push({
        test: "Test 1: Trích xuất đầy đủ thông tin (Giá 35k, 30 kg)",
        status: "PASS",
        details: `Trích xuất chính xác: Tên="${data1.data.name}", Giá=${data1.data.price}, Số lượng=${data1.data.stock}, Đơn vị=${data1.data.unit}`,
      });
    } else {
      results.push({
        test: "Test 1: Trích xuất đầy đủ thông tin",
        status: "FAIL",
        details: `Kết quả không mong đợi: ${JSON.stringify(data1.data)}`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      test: "Test 1: Trích xuất đầy đủ thông tin",
      status: "FAIL",
      details: errorMsg,
    });
  }

  // TEST 2: THIẾU GIÁ VÀ SỐ LƯỢNG (Chỉ nói tên/chất lượng sản phẩm) -> BẮT BUỘC price & stock là null!
  try {
    console.log("\n[Test 2] Kiểm tra trường hợp THIẾU GIÁ VÀ SỐ LƯỢNG (Không được bịa số)...");
    const req2 = new NextRequest("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Vườn Ba Tư hôm nay thu hoạch sầu riêng Ri6 chín cây thơm nức mũi đạt chuẩn OCOP.",
        sampleId: "durian",
      }),
    });

    const res2 = await POST(req2);
    const data2 = await res2.json();
    console.log("Response Test 2:", JSON.stringify(data2, null, 2));

    const isPriceNull = data2.data.price === null || data2.data.price === undefined;
    const isStockNull = data2.data.stock === null || data2.data.stock === undefined;

    if (data2.success && isPriceNull && isStockNull && data2.data.name) {
      results.push({
        test: "Test 2: Thiếu giá và số lượng -> Để trống (null), không tự bịa số liệu",
        status: "PASS",
        details: `Chính xác: price=${data2.data.price}, stock=${data2.data.stock}, name="${data2.data.name}"`,
      });
    } else {
      results.push({
        test: "Test 2: Thiếu giá và số lượng",
        status: "FAIL",
        details: `Vi phạm quy tắc: price=${data2.data.price}, stock=${data2.data.stock} (Mong đợi null)`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      test: "Test 2: Thiếu giá và số lượng",
      status: "FAIL",
      details: errorMsg,
    });
  }

  // TEST 3: CÓ SỐ LƯỢNG NHƯNG THIẾU GIÁ BÁN
  try {
    console.log("\n[Test 3] Kiểm tra trường hợp CÓ SỐ LƯỢNG NHƯNG THIẾU GIÁ...");
    const req3 = new NextRequest("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Tôi vừa hái được 50 ký bưởi da xanh Tân Triều múi hồng.",
        sampleId: "pomelo",
      }),
    });

    const res3 = await POST(req3);
    const data3 = await res3.json();
    console.log("Response Test 3:", JSON.stringify(data3, null, 2));

    const isPriceNull = data3.data.price === null || data3.data.price === undefined;
    const hasCorrectStock = data3.data.stock === 50;

    if (data3.success && isPriceNull && hasCorrectStock) {
      results.push({
        test: "Test 3: Có số lượng (50 ký), thiếu giá -> Price=null, Stock=50",
        status: "PASS",
        details: `Chính xác: price=${data3.data.price}, stock=${data3.data.stock}`,
      });
    } else {
      results.push({
        test: "Test 3: Có số lượng nhưng thiếu giá",
        status: "FAIL",
        details: `Kết quả: price=${data3.data.price}, stock=${data3.data.stock}`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      test: "Test 3: Có số lượng nhưng thiếu giá",
      status: "FAIL",
      details: errorMsg,
    });
  }

  // TEST 4: DỮ LIỆU KÈM ẢNH ĐẶC TẢ SẢN PHẨM (Multimodal)
  try {
    console.log("\n[Test 4] Kiểm tra trường hợp GỬI KÈM ẢNH (Image input)...");
    const req4 = new NextRequest("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Hạt điều rang củi Long Khánh thơm bùi, đóng hộp 500g, giá 145 ngàn một hộp, có 20 hộp.",
        image: "/images/stitch/stitch-39.jpg",
        sampleId: "cashew",
      }),
    });

    const res4 = await POST(req4);
    const data4 = await res4.json();
    console.log("Response Test 4:", JSON.stringify(data4, null, 2));

    if (
      data4.success &&
      data4.data.price === 145000 &&
      data4.data.stock === 20 &&
      data4.data.category === "Hạt & Cà phê"
    ) {
      results.push({
        test: "Test 4: Gửi kèm ảnh và thông tin hạt điều",
        status: "PASS",
        details: `Trích xuất đúng nhóm "${data4.data.category}", giá=${data4.data.price}, số lượng=${data4.data.stock}`,
      });
    } else {
      results.push({
        test: "Test 4: Gửi kèm ảnh",
        status: "FAIL",
        details: `Kết quả: ${JSON.stringify(data4.data)}`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      test: "Test 4: Gửi kèm ảnh",
      status: "FAIL",
      details: errorMsg,
    });
  }

  // TEST 5: XỬ LÝ LỖI KHI REQUEST JSON KHÔNG HỢP LỆ
  try {
    console.log("\n[Test 5] Kiểm tra xử lý lỗi khi body rỗng/lỗi...");
    const req5 = new NextRequest("http://localhost:3000/api/ai/publish-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "INVALID_JSON",
    });

    const res5 = await POST(req5);
    const data5 = await res5.json();
    console.log("Response Test 5:", JSON.stringify(data5, null, 2));

    if (res5.status === 400 && data5.success === false) {
      results.push({
        test: "Test 5: Xử lý lỗi body không hợp lệ (HTTP 400)",
        status: "PASS",
        details: `Nhận HTTP 400 và báo lỗi "${data5.error}" chuẩn API`,
      });
    } else {
      results.push({
        test: "Test 5: Xử lý lỗi body không hợp lệ",
        status: "FAIL",
        details: `Status ${res5.status}`,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      test: "Test 5: Xử lý lỗi body không hợp lệ",
      status: "FAIL",
      details: errorMsg,
    });
  }

  console.log("\n=================== TỔNG KẾT KẾT QUẢ KIỂM THỬ ===================");
  let allPass = true;
  for (const r of results) {
    console.log(`[${r.status}] ${r.test}`);
    console.log(`       -> ${r.details}`);
    if (r.status !== "PASS") allPass = false;
  }
  console.log("=================================================================\n");

  if (!allPass) {
    process.exit(1);
  }
}

runTestSuite();
