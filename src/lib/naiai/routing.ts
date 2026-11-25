export type Intent = "traceability" | "marketplace" | "farmer_guide" | "volunteer_guide" | "live_search" | "other";

export function inferIntent(question: string): Intent {
  const text = question.toLocaleLowerCase("vi");
  if (/bệnh|sâu hại|thuốc|phun|trị bệnh|chẩn đoán/i.test(text)) return "other";
  if (/nf-[a-z0-9-]{4,}|\b(qr|truy xuất|nguồn gốc|hộ chiếu|nhật ký mùa)/i.test(text)) return "traceability";
  if (/livestream|phát trực tiếp|lên sóng/i.test(text)) return "live_search";
  if (/thanh niên|tình nguyện|minh chứng|nhiệm vụ hỗ trợ/i.test(text)) return "volunteer_guide";
  if (/đăng bán|nhà vườn|đơn hàng|nhật ký|mùa vụ|shipper/i.test(text)) return "farmer_guide";
  if (/nông sản|sản phẩm|giá|mua|quả|trái cây|fruit|pomelo|rambutan|bưởi|chôm chôm|hạt điều|cà phê|nhà vườn|đặc sản/i.test(text)) return "marketplace";
  return "other";
}
