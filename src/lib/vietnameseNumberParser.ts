/**
 * Module xử lý chuyển đổi chữ số tiếng Việt và trích xuất số lượng, đơn vị, giá bán.
 * Dùng chung an toàn cho cả Client Component và Server API Route.
 */

export const VI_DIGIT_MAP: Record<string, number> = {
  "không": 0,
  "một": 1,
  "mốt": 1,
  "hai": 2,
  "ba": 3,
  "bốn": 4,
  "tư": 4,
  "năm": 5,
  "lăm": 5,
  "nhăm": 5,
  "sáu": 6,
  "bảy": 7,
  "bẩy": 7,
  "tám": 8,
  "chín": 9,
};

export const NUMBER_WORDS_SET = new Set([
  "không", "một", "mốt", "hai", "ba", "bốn", "tư", "năm", "lăm", "nhăm",
  "sáu", "bảy", "bẩy", "tám", "chín", "mười", "chục", "mươi", "trăm",
  "nghìn", "ngàn", "triệu", "lẻ", "linh",
]);

/**
 * Chuyển đổi chuỗi chữ số tiếng Việt (ví dụ: "một trăm hai mươi", "ba mươi lăm") thành số nguyên.
 */
export function parseViWordsToNumber(phrase: string): number | null {
  if (!phrase) return null;
  const clean = phrase.trim().toLowerCase();
  if (!clean) return null;

  if (/^\d+$/.test(clean)) {
    return parseInt(clean, 10);
  }

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let grandTotal = 0;
  let sectionTotal = 0;
  let current = 0;
  let hasNumberWord = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t === "triệu") {
      hasNumberWord = true;
      grandTotal += (sectionTotal + current || 1) * 1000000;
      sectionTotal = 0;
      current = 0;
    } else if (t === "nghìn" || t === "ngàn") {
      hasNumberWord = true;
      grandTotal += (sectionTotal + current || 1) * 1000;
      sectionTotal = 0;
      current = 0;
    } else if (t === "trăm") {
      hasNumberWord = true;
      sectionTotal += (current || 1) * 100;
      current = 0;
    } else if (t === "mươi" || t === "chục") {
      hasNumberWord = true;
      current = (current || 1) * 10;
    } else if (t === "mười") {
      hasNumberWord = true;
      if (current === 0) {
        current = 10;
      } else {
        current = current * 10;
      }
    } else if (t === "lẻ" || t === "linh") {
      hasNumberWord = true;
    } else if (VI_DIGIT_MAP[t] !== undefined) {
      hasNumberWord = true;
      current += VI_DIGIT_MAP[t];
    }
  }

  const total = grandTotal + sectionTotal + current;
  return hasNumberWord && total > 0 ? total : null;
}

// Danh sách các đơn vị phổ biến trong nông sản Đồng Nai
export const COMMON_UNITS = [
  "hộp 500g", "hộp 500 gam", "hộp 500 gram",
  "túi", "gói", "bịch", "hộp", "thùng", "hũ", "lon", "chai", "bình", "can",
  "kg", "ký", "cân", "nải", "trái", "quả", "chùm", "bó", "tấn", "tạ", "yến",
];

export function normalizeUnit(raw: string, fullContext: string): string {
  const lowerRaw = raw.toLowerCase().trim();
  if (lowerRaw.includes("hộp")) {
    if (/500\s*(?:g|gam|gram)/i.test(fullContext)) return "hộp 500g";
    return "hộp";
  }
  if (["kg", "ký", "cân"].includes(lowerRaw)) return "kg";
  if (["trái", "quả"].includes(lowerRaw)) return "trái";
  return lowerRaw;
}

/**
 * Trích xuất số lượng và đơn vị từ văn bản tiếng Việt
 */
export function parseVietnameseQuantityAndUnit(text: string): { stock: number | null; unit: string | null } {
  if (!text) return { stock: null, unit: null };
  const lower = text.toLowerCase().trim();

  // 1. Kiểm tra số dạng chữ số đứng liền trước đơn vị: ví dụ "120 túi", "25 kg", "20 hộp"
  const digitMatch = lower.match(
    /(\d+[\d.,]*)\s*(hộp\s*500\s*(?:g|gam|gram)?|túi|gói|bịch|hộp|thùng|hũ|lon|chai|bình|can|kg|ký|cân|nải|trái|quả|chùm|bó|tấn|tạ|yến)\b/i
  );
  if (digitMatch) {
    const stockVal = parseInt(digitMatch[1].replace(/[.,]/g, ""), 10);
    const unitVal = normalizeUnit(digitMatch[2], lower);
    if (!Number.isNaN(stockVal) && stockVal > 0) {
      return { stock: stockVal, unit: unitVal };
    }
  }

  // 2. Kiểm tra số viết bằng chữ tiếng Việt đứng trước đơn vị: ví dụ "một trăm hai mươi túi hạt điều"
  for (const u of COMMON_UNITS) {
    const uRegex = new RegExp(`\\b${u.replace(/\s+/g, "\\s+")}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = uRegex.exec(lower)) !== null) {
      const matchIndex = match.index;
      const textBefore = lower.substring(0, matchIndex).trim();
      const wordsBefore = textBefore.split(/\s+/).filter(Boolean);

      const numberWords: string[] = [];
      for (let j = wordsBefore.length - 1; j >= 0; j--) {
        const cleanWord = wordsBefore[j].replace(/[^a-zà-ỹ0-9]/gi, "");
        if (NUMBER_WORDS_SET.has(cleanWord) || /^\d+$/.test(cleanWord)) {
          numberWords.unshift(cleanWord);
        } else {
          break;
        }
      }

      if (numberWords.length > 0) {
        const phrase = numberWords.join(" ");
        const parsed = parseViWordsToNumber(phrase);
        if (parsed !== null && parsed > 0) {
          const unit = normalizeUnit(u, lower);
          return { stock: parsed, unit };
        }
      }
    }
  }

  // 3. Nếu chỉ có số lượng nhưng không nói đơn vị (ví dụ: "tôi có 50", "thu hoạch 100")
  const generalDigitMatch = lower.match(/(?:có|khoảng|thu hoạch|được|tổng cộng)\s*(\d+)\b/i);
  if (generalDigitMatch) {
    const val = parseInt(generalDigitMatch[1], 10);
    if (!Number.isNaN(val) && val > 0) {
      return { stock: val, unit: "kg" };
    }
  }

  return { stock: null, unit: null };
}

/**
 * Trích xuất giá bán từ văn bản tiếng Việt
 */
export function parseVietnamesePrice(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Bắt số dạng: "35 nghìn", "120 ngàn", "55k", "145.000đ"
  const thousandPriceMatch = lower.match(/(\d+[\d.,]*)\s*(nghìn|ngàn|k(?![a-zà-ỹ]))/iu);
  if (thousandPriceMatch) {
    const rawVal = parseFloat(thousandPriceMatch[1].replace(",", "."));
    if (!Number.isNaN(rawVal)) return Math.round(rawVal * 1000);
  }

  const dotPriceMatch = lower.match(/(\d{1,3}(?:\.\d{3})+)\s*(đ|đồng|vnd)?/iu);
  if (dotPriceMatch) {
    const rawVal = parseInt(dotPriceMatch[1].replace(/\./g, ""), 10);
    if (!Number.isNaN(rawVal)) return rawVal;
  }

  const pricePrefixMatch = lower.match(/giá\s*(\d+)(?:\s*(nghìn|ngàn|k(?![a-zà-ỹ])))?/iu);
  if (pricePrefixMatch) {
    const rawVal = parseInt(pricePrefixMatch[1], 10);
    if (!Number.isNaN(rawVal)) {
      return pricePrefixMatch[2] ? rawVal * 1000 : rawVal < 1000 ? rawVal * 1000 : rawVal;
    }
  }

  // Bắt số viết bằng chữ trước "nghìn" hoặc "ngàn": ví dụ "ba mươi lăm nghìn", "một trăm hai mươi ngàn"
  const textThousandMatch = lower.match(
    /([a-zà-ỹ\s]+?)\s*(nghìn|ngàn)\b/i
  );
  if (textThousandMatch) {
    const phraseBefore = textThousandMatch[1].trim();
    const words = phraseBefore.split(/\s+/).filter(Boolean);
    const numWords: string[] = [];
    for (let i = words.length - 1; i >= 0; i--) {
      const w = words[i].replace(/[^a-zà-ỹ]/gi, "");
      if (NUMBER_WORDS_SET.has(w)) {
        numWords.unshift(w);
      } else {
        break;
      }
    }
    if (numWords.length > 0) {
      const parsedVal = parseViWordsToNumber(numWords.join(" "));
      if (parsedVal !== null && parsedVal > 0) {
        return parsedVal * 1000;
      }
    }
  }

  return null;
}
