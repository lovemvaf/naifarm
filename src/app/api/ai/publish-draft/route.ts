import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import {
  parseVietnamesePrice,
  parseVietnameseQuantityAndUnit,
} from "@/lib/vietnameseNumberParser";
import type { ProductCategory } from "@/types/naifarm";

const VALID_CATEGORIES: ProductCategory[] = [
  "Trái cây tươi",
  "Bưởi & Cây có múi",
  "Chôm chôm & Sầu riêng",
  "Hạt điều & Rang củi",
  "Cà phê & Ca cao",
  "Mật ong & Rượu trái cây",
  "Nông sản chế biến & Mứt",
  "Rau củ & Nấm sạch",
  "Tiêu & Gia vị vùng đồi",
  "Quà tặng OCOP & Combo",
];

interface DraftResult {
  name: string | null;
  category: ProductCategory | null;
  price: number | null;
  unit: string | null;
  stock: number | null;
  batchCode: string | null;
  description: string | null;
}

// Convert relative image path or data uri to usable data uri
function resolveImageUri(imageStr?: string | null): string | null {
  if (!imageStr) return null;
  if (imageStr.startsWith("data:image/")) return imageStr;

  try {
    const clean = imageStr.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), "public", clean);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      let mime = "image/jpeg";
      if (ext === ".png") mime = "image/png";
      else if (ext === ".webp") mime = "image/webp";
      else if (ext === ".gif") mime = "image/gif";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn("[publish-draft] Could not read local image file:", err);
  }
  return null;
}

// Smart heuristic fallback if DeepSeek is unreachable or encounters an error
function fallbackExtract(text: string, sampleId?: string): DraftResult {
  const lower = (text || "").toLowerCase().trim();

  // Trích xuất giá và số lượng bằng bộ phân tích tiếng Việt mạnh mẽ
  const price = parseVietnamesePrice(lower);
  const { stock, unit } = parseVietnameseQuantityAndUnit(lower);

  // Nhận diện loại nông sản: Ưu tiên TUYỆT ĐỐI nội dung văn bản / lời nói của nông dân
  let name: string | null = null;
  let category: ProductCategory | null = null;
  let batchCode: string | null = null;
  let description: string | null = text ? `Nông sản thu hoạch tươi mới tại vườn Đồng Nai: "${text}".` : null;

  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10 + Math.random() * 90);

  // 1. Kiểm tra từ khóa trong văn bản trước
  if (lower.includes("điều") || lower.includes("hạt điều")) {
    name = "Hạt điều rang củi vỏ lụa Long Khánh";
    category = "Hạt điều & Rang củi";
    batchCode = `NF-HD-${currentYear}-${randomSuffix}`;
    description = text
      ? `Hạt điều rang củi nguyên vỏ lụa thơm bùi: "${text}". Chế biến thủ công truyền thống tại Đồng Nai.`
      : "Hạt điều rang củi vỏ lụa Long Khánh giòn rụm béo bùi, chế biến mộc không phụ gia bảo quản.";
  } else if (lower.includes("sầu riêng")) {
    name = "Sầu riêng Ri6 chín cây vườn Ba Tư Long Khánh";
    category = "Chôm chôm & Sầu riêng";
    batchCode = `NF-SR-${currentYear}-${randomSuffix}`;
    description = text
      ? `Sầu riêng Ri6 thu hoạch trực tiếp tại vườn Long Khánh: "${text}". Cơm vàng hạt lép, chín cây tự nhiên.`
      : "Sầu riêng Ri6 thu hoạch trực tiếp tại vườn Long Khánh, cơm vàng hạt lép, bảo đảm chất lượng OCOP.";
  } else if (lower.includes("chôm chôm")) {
    name = "Chôm chôm Java Long Khánh mới hái";
    category = "Chôm chôm & Sầu riêng";
    batchCode = `NF-CC-${currentYear}-${randomSuffix}`;
    description = text
      ? `Chôm chôm Java hái sáng nay tại vườn Ba Tư (Long Khánh): "${text}". Trái giòn ngọt, tróc hạt tự nhiên.`
      : "Chôm chôm Java hái sáng nay tại vườn Ba Tư (Long Khánh), cùi dày, tróc hạt, vị ngọt thanh mát.";
  } else if (lower.includes("bưởi")) {
    name = "Bưởi da xanh Cù lao Tân Triều lứa mới";
    category = "Bưởi & Cây có múi";
    batchCode = `NF-BX-${currentYear}-${randomSuffix}`;
    description = text
      ? `Bưởi da xanh múi hồng mọng nước từ Cù lao Tân Triều: "${text}". Vỏ mỏng, tép giòn không hạt.`
      : "Bưởi da xanh Cù lao Tân Triều lứa mới, múi hồng mọng nước, vị ngọt thanh mát đậm đà phù hợp biếu tặng.";
  } else if (lower.includes("cà phê") || lower.includes("cafe") || lower.includes("ca cao")) {
    name = "Cà phê Robusta Đất đỏ Đồng Nai";
    category = "Cà phê & Ca cao";
    batchCode = `NF-CF-${currentYear}-${randomSuffix}`;
  } else if (lower.includes("mật ong") || lower.includes("rượu")) {
    name = "Mật ong hoa rừng Trị An nguyên chất";
    category = "Mật ong & Rượu trái cây";
    batchCode = `NF-MO-${currentYear}-${randomSuffix}`;
  } else if (lower.includes("chuối")) {
    name = "Chuối cấy mô Trảng Bom đạt chuẩn xuất khẩu";
    category = "Trái cây tươi";
    batchCode = `NF-CH-${currentYear}-${randomSuffix}`;
  } else if (lower.includes("tiêu") || lower.includes("ớt")) {
    name = "Tiêu đen Cẩm Mỹ hạt chắc cay nồng";
    category = "Tiêu & Gia vị vùng đồi";
    batchCode = `NF-TG-${currentYear}-${randomSuffix}`;
  } else if (lower.includes("nấm") || lower.includes("rau")) {
    name = "Nấm mèo đen Đồng Nai sơ chế";
    category = "Rau củ & Nấm sạch";
    batchCode = `NF-RN-${currentYear}-${randomSuffix}`;
  } else if (sampleId === "durian") {
    name = "Sầu riêng Ri6 chín cây vườn Ba Tư Long Khánh";
    category = "Chôm chôm & Sầu riêng";
    batchCode = `NF-SR-${currentYear}-${randomSuffix}`;
  } else if (sampleId === "rambutan") {
    name = "Chôm chôm Java Long Khánh mới hái";
    category = "Chôm chôm & Sầu riêng";
    batchCode = `NF-CC-${currentYear}-${randomSuffix}`;
  } else if (sampleId === "pomelo") {
    name = "Bưởi da xanh Cù lao Tân Triều lứa mới";
    category = "Bưởi & Cây có múi";
    batchCode = `NF-BX-${currentYear}-${randomSuffix}`;
  } else if (sampleId === "cashew") {
    name = "Hạt điều rang củi vỏ lụa Long Khánh";
    category = "Hạt điều & Rang củi";
    batchCode = `NF-HD-${currentYear}-${randomSuffix}`;
  } else if (text.trim().length > 0) {
    name = text.length > 40 ? `${text.slice(0, 40).trim()}...` : text.trim();
    category = "Trái cây tươi";
    batchCode = `NF-DN-${currentYear}-${randomSuffix}`;
  }

  return {
    name,
    category,
    price,
    unit: unit ?? (stock ? "kg" : null),
    stock,
    batchCode,
    description,
  };
}

export async function POST(req: NextRequest) {
  let text = "";
  let rawImage: string | undefined;
  let sampleId: string | undefined;

  try {
    const body = await req.json();
    text = (body.text || "").trim();
    rawImage = body.image;
    sampleId = body.sampleId;
  } catch {
    return NextResponse.json(
      { success: false, error: "Dữ liệu yêu cầu không hợp lệ (JSON)" },
      { status: 400 }
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");

  // If no API key configured, use intelligent fallback directly
  if (!apiKey) {
    console.warn("[publish-draft] DEEPSEEK_API_KEY not configured, using fallback parser.");
    const fallbackData = fallbackExtract(text, sampleId);
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: "fallback-heuristic",
      note: "Hệ thống sử dụng bộ trích xuất thông minh cục bộ.",
    });
  }

  const imageUri = resolveImageUri(rawImage);

  // System Prompt strictly adhering to rules: Leave missing fields null / empty, DO NOT hallucinate numbers!
  const systemPrompt = `Bạn là trợ lý AI chuyên nghiệp của nền tảng nông nghiệp NAI Farm Đồng Nai.
Nhiệm vụ của bạn: Dựa vào lời nói/văn bản mô tả của bác nông dân và hình ảnh nông sản (nếu có), hãy trích xuất thông tin để tạo bản nháp tin đăng bán sản phẩm OCOP Đồng Nai.

Bắt buộc trả về duy nhất định dạng JSON thuần túy (json_object) với các trường sau:
{
  "name": string hoặc null (Tên sản phẩm nông sản ngắn gọn, thu hút, nêu rõ nguồn gốc Đồng Nai như Long Khánh, Định Quán, Cù lao Tân Triều, Xuân Lộc... Ví dụ: "Hạt điều rang củi vỏ lụa Long Khánh", "Chôm chôm Java Long Khánh hái mới", "Sầu riêng Ri6 vườn Ba Tư". Nếu không xác định được loại nông sản thì để null),
  "category": "Trái cây tươi" | "Bưởi & Cây có múi" | "Chôm chôm & Sầu riêng" | "Hạt điều & Rang củi" | "Cà phê & Ca cao" | "Mật ong & Rượu trái cây" | "Nông sản chế biến & Mứt" | "Rau củ & Nấm sạch" | "Tiêu & Gia vị vùng đồi" | "Quà tặng OCOP & Combo" hoặc null,
  "price": number hoặc null (Số nguyên giá bán VNĐ, ví dụ 35000, 120000. ĐẶC BIỆT: NẾU BÁC NÔNG DÂN KHÔNG NÓI GIÁ HOẶC KHÔNG CÓ THÔNG TIN GIÁ THÌ BẮT BUỘC ĐỂ null. TUYỆT ĐỐI KHÔNG TỰ BỊA GIÁ TIỀN),
  "unit": string hoặc null (Đơn vị tính như "túi", "gói", "bịch", "hộp", "thùng", "hũ", "lon", "kg", "nải", "trái", "bó". Nếu lời nói có đơn vị thì điền chính xác đơn vị đó. Nếu nông dân không nói đơn vị và không có số lượng thì để null),
  "stock": number hoặc null (Số lượng mở bán dạng số nguyên, ví dụ 120, 50, 30. ĐẶC BIỆT: NẾU BÁC NÔNG DÂN KHÔNG NÓI SỐ LƯỢNG THÌ BẮT BUỘC ĐỂ null. TUYỆT ĐỐI KHÔNG TỰ BỊA SỐ LƯỢNG),
  "batchCode": string hoặc null (Gợi ý mã lô truy xuất OCOP có định dạng NF-[MÃ VÙNG]-2026-..., ví dụ: "NF-HD-2026-12", "NF-LK-2026-09", hoặc null),
  "description": string hoặc null (Đoạn mô tả ngắn gọn 2-3 câu, giọng điệu chân chất, mộc mạc, tôn vinh nông sản tươi mới thu hoạch từ nhà vườn Đồng Nai)
}

QUY TẮC BẮT BUỘC (TUÂN THỦ 100%):
1. ƯU TIÊN TUYỆT ĐỐI NỘI DUNG LỜI NÓI CỦA NÔNG DÂN: Nếu nông dân nói về loại nông sản nào (ví dụ: hạt điều, bưởi...), tên sản phẩm và nhóm hàng phải theo lời nói đó, không bị ràng buộc bởi ảnh mẫu.
2. CHUYỂN ĐỔI CHỮ SỐ TIẾNG VIỆT THÀNH SỐ NGUYÊN: Nông dân thường nói số lượng hoặc giá bằng chữ tiếng Việt:
   - "một trăm hai mươi túi" -> stock: 120, unit: "túi"
   - "năm mươi gói" -> stock: 50, unit: "gói"
   - "hai mươi lăm ký" -> stock: 25, unit: "kg"
   - "mười lăm hộp" -> stock: 15, unit: "hộp"
   - "ba mươi lăm nghìn" -> price: 35000
   - "một trăm hai mươi ngàn" -> price: 120000
3. ĐƠN VỊ TÍNH: Nhận diện trọn vẹn các đơn vị: túi, gói, bịch, hộp, thùng, hũ, lon, kg, ký, cân, nải, trái, quả, chùm, bó...
4. TRƯỜNG NÀO THIẾU HOẶC KHÔNG XÁC ĐỊNH ĐƯỢC THÔNG TIN THÌ ĐỂ null HOẶC RỖNG "".
5. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT GIÁ BÁN ("price") VÀ SỐ LƯỢNG ("stock") KHI NGƯỜI DÙNG KHÔNG ĐỀ CẬP. Ví dụ: nói "tôi có một trăm hai mươi túi hạt điều" mà không nói giá thì "price" bắt buộc là null.
6. Chỉ xuất JSON, không bọc markdown \`\`\`json.`;

  // Try multimodal with deepseek-flash if image available, or deepseek-chat
  const hasImage = Boolean(imageUri);
  const primaryModel = hasImage ? "deepseek-flash" : "deepseek-chat";

  let userContent: unknown;
  if (hasImage && imageUri) {
    userContent = [
      {
        type: "text",
        text: text
          ? `Lời nói/mô tả của bác nông dân: "${text}". Hãy phân tích lời nói này (ưu tiên cao nhất) cùng hình ảnh đính kèm để trích xuất ra bản nháp.`
          : "Bác nông dân gửi kèm hình ảnh nông sản này. Hãy nhận diện loại nông sản và tạo bản nháp đăng bán (để trống giá và số lượng nếu chưa có lời nói).",
      },
      {
        type: "image_url",
        image_url: {
          url: imageUri,
        },
      },
    ];
  } else {
    userContent = `Lời nói / mô tả của bác nông dân: "${text}". Hãy phân tích trích xuất thông tin theo cấu trúc JSON quy định. Nhận diện chính xác số bằng chữ tiếng Việt và đơn vị tính (túi, gói, hộp...).`;
  }

  const makeApiCall = async (modelName: string, contentPayload: unknown) => {
    return await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contentPayload },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 800,
      }),
    });
  };

  try {
    let response = await makeApiCall(primaryModel, userContent);

    // If multimodal failed with 400 or other errors, fallback to deepseek-chat with text only
    if (!response.ok && hasImage) {
      console.warn(
        `[publish-draft] Multimodal ${primaryModel} returned ${response.status}. Retrying with deepseek-chat (text only)...`
      );
      const textOnlyContent = `Lời nói / mô tả của bác nông dân: "${text}". Hãy trích xuất thông tin đăng bán theo đúng quy tắc (nhận diện chữ số tiếng Việt, đơn vị tính túi/gói/hộp/kg...).`;
      response = await makeApiCall("deepseek-chat", textOnlyContent);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[publish-draft] DeepSeek API error (${response.status}):`, errText);
      const fallbackData = fallbackExtract(text, sampleId);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: "fallback-heuristic",
        warning: `DeepSeek API trả về mã lỗi ${response.status}. Đã chuyển sang trích xuất thông minh.`,
      });
    }

    const jsonRes = await response.json();
    const rawReply = jsonRes.choices?.[0]?.message?.content?.trim();

    if (!rawReply) {
      throw new Error("Không nhận được nội dung trả về từ DeepSeek");
    }

    // Clean possible markdown code fences if model returned them
    const cleaned = rawReply.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed: Partial<DraftResult> = JSON.parse(cleaned);

    // Merge với fallback heuristic nếu deepseek bỏ lỡ số lượng hoặc đơn vị tiếng Việt
    const heuristic = fallbackExtract(text, sampleId);

    const safeStock = typeof parsed.stock === "number" && parsed.stock > 0
      ? Math.round(parsed.stock)
      : heuristic.stock;

    const safeUnit = parsed.unit?.trim() ? parsed.unit.trim() : (heuristic.unit ?? (safeStock ? "kg" : null));

    const safePrice = typeof parsed.price === "number" && parsed.price > 0
      ? Math.round(parsed.price)
      : heuristic.price;

    const safeCategory = (parsed.category && VALID_CATEGORIES.includes(parsed.category as ProductCategory))
      ? (parsed.category as ProductCategory)
      : (heuristic.category ?? "Trái cây tươi");
    const safeName = parsed.name || heuristic.name || null;

    const safeData: DraftResult = {
      name: safeName,
      category: safeCategory,
      price: safePrice,
      unit: safeUnit,
      stock: safeStock,
      batchCode: parsed.batchCode ?? heuristic.batchCode ?? `NF-DN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      description: parsed.description ?? heuristic.description ?? (text ? `Nông sản tươi sạch Đồng Nai: "${text}"` : null),
    };

    return NextResponse.json({
      success: true,
      data: safeData,
      source: hasImage ? "deepseek-vision" : "deepseek-chat",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[publish-draft] Unexpected error:", errorMsg);
    const fallbackData = fallbackExtract(text, sampleId);
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: "fallback-heuristic",
      warning: `Lỗi kết nối AI: ${errorMsg}. Đã chuyển sang trích xuất thông minh.`,
    });
  }
}
