import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tập tin âm thanh trong yêu cầu." },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const rawBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    if (!apiKey) {
      console.warn("[ASR] DEEPSEEK_API_KEY is not configured.");
      return NextResponse.json(
        {
          success: false,
          error: "Hệ thống chưa cấu hình dịch vụ nhận dạng giọng nói.",
        },
        { status: 500 }
      );
    }

    // Build outbound multipart/form-data for DeepSeek ASR endpoint
    const outboundFormData = new FormData();
    const fileName = (file as { name?: string }).name || "recording.wav";
    outboundFormData.append("file", file, fileName);

    const asrUrl = `${baseUrl}/v1/tools/asr`;

    const response = await fetch(asrUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: outboundFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ASR] Upstream error status: ${response.status}`,
        errorText
      );

      let parsedMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.error?.message) {
          parsedMessage = errorJson.error.message;
        }
      } catch {
        // use raw errorText
      }

      return NextResponse.json(
        {
          success: false,
          error: `Hệ thống nhận dạng (${response.status}): ${parsedMessage}`,
        },
        { status: response.status >= 500 ? 502 : 400 }
      );
    }

    const data = await response.json();
    const rawText = typeof data.text === "string" ? data.text.trim() : "";

    // Regex for Chinese / Han characters (often hallucinated when noisy or low audio volume)
    const chineseRegex = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
    const hasChinese = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(rawText);

    let isLowVolumeOrNoisy = false;
    let finalText = rawText;

    if (hasChinese) {
      // Filter out all Chinese characters and CJK punctuation
      finalText = rawText
        .replace(chineseRegex, "")
        .replace(/[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      finalText = finalText.replace(/^[,\s.?!:;]+|[,\s.?!:;]+$/g, "").trim();

      if (!finalText) {
        isLowVolumeOrNoisy = true;
      }
    } else if (!finalText) {
      isLowVolumeOrNoisy = true;
    }

    return NextResponse.json({
      success: true,
      text: finalText,
      isLowVolumeOrNoisy,
      duration_ms: data.duration_ms ?? null,
      request_id: data.request_id ?? null,
    });
  } catch (error: unknown) {
    console.error("[ASR] Internal error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định khi kết nối dịch vụ giọng nói.";

    return NextResponse.json(
      {
        success: false,
        error: `Không thể xử lý âm thanh: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
