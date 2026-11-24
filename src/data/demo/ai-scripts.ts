import type { WorkspaceId } from "@/types/naifarm";

export interface AiScriptItem {
  prompt: string;
  reply: string;
  linkLabel?: string;
  linkHref?: string;
  productSlug?: string;
}

export const AI_WORKSPACE_CONFIG: Record<
  WorkspaceId,
  {
    greeting: string;
    chips: AiScriptItem[];
  }
> = {
  W01: {
    greeting:
      "Chào Ngọc Linh! Mình là NaiAI (chế độ minh họa theo dữ liệu demo). Bạn muốn tìm nông sản Đồng Nai nào hôm nay?",
    chips: [
      {
        prompt: "Chôm chôm giá bao nhiêu?",
        reply:
          "Theo dữ liệu demo hiện tại: Chôm chôm Java Long Khánh tại Nhà vườn Ba Tư đang có giá 35.000 đ/kg (lô NF-DEMO-001, tồn 30 kg). Bạn có thể xem chi tiết và quét QR nguồn gốc ngay bên dưới.",
        linkLabel: "Xem Chôm chôm Java Ba Tư",
        linkHref: "/products/chom-chom-java-long-khanh",
        productSlug: "chom-chom-java-long-khanh",
      },
      {
        prompt: "Giải thích tem QR trên trái bưởi",
        reply:
          "Tem QR mở trang Hộ chiếu Nông sản công khai: hiển thị mã lô (ví dụ NF-TT-2026-01), 3 mốc nhật ký canh tác – thu hoạch – đóng gói và phân biệt rõ phần nhà vườn tự khai với hồ sơ đã đối chiếu (Demo).",
        linkLabel: "Mở Hộ chiếu QR mẫu",
        linkHref: "/trace/NF-TT-2026-01",
      },
      {
        prompt: "Cách nhận hàng & phí giao thế nào?",
        reply:
          "Bạn có thể chọn 'Giao tận nơi' (+20.000 đ phí demo tại Đồng Nai/TP.HCM) hoặc 'Nhận tại vườn' (0 đ). Thanh toán ở prototype là COD Demo, không thu tiền thật.",
        linkLabel: "Kiểm tra Giỏ hàng",
        linkHref: "/cart",
      },
    ],
  },
  W02: {
    greeting:
      "Chào Chú Ba! Cháu là NaiAI hỗ trợ đọc hướng dẫn dễ hiểu. Chú bấm vào một câu bên dưới để xem chỉ dẫn từng bước nhé.",
    chips: [
      {
        prompt: "Hướng dẫn đăng bán 3 bước",
        reply:
          "Chú chỉ cần 3 bước đơn giản: (1) Chọn ảnh nông sản chụp ở vườn; (2) Bấm nút nói thông tin hoặc gõ tay; (3) Kiểm tra lại tên, giá, số kg rồi bấm 'Xác nhận đăng bán'.",
        linkLabel: "Mở trang Chụp ảnh để bán",
        linkHref: "/farmer/publish",
      },
      {
        prompt: "Cách ghi nhật ký mùa vụ",
        reply:
          "Trong Không gian Nhà nông, chú chọn thẻ 'Nhật ký mùa vụ', chọn tên vườn/lô hàng và thêm ghi chú ngày chăm sóc hoặc ngày hái để khách quét mã QR thấy rõ.",
        linkLabel: "Mở Nhật ký mùa vụ",
        linkHref: "/farmer?tab=diary",
      },
      {
        prompt: "Xem đơn hàng & việc cần làm",
        reply:
          "Chú hiện có đơn hàng demo NF-ORD-DEMO-01 (2 kg chôm chôm Java · 90.000 đ) đang chờ xác nhận, và minh chứng nhiệm vụ NF-MIS-01 của bạn Minh Anh chờ chú xác nhận đã bàn giao.",
        linkLabel: "Xem Đơn & Việc nhà nông",
        linkHref: "/farmer",
      },
    ],
  },
  W03: {
    greeting:
      "Chào Minh Anh & các bạn TNV! NaiAI tổng hợp nhanh nhiệm vụ số hóa và quy tắc ghi nhận giờ tình nguyện.",
    chips: [
      {
        prompt: "Tìm nhiệm vụ phù hợp",
        reply:
          "Hiện có nhiệm vụ NF-MIS-03 'Biên tập mô tả & lịch livestream HTX Xuân Lộc' (hỗ trợ Online, dự kiến 2 giờ) đang mở nhận tại bảng nhiệm vụ.",
        linkLabel: "Xem Bảng nhiệm vụ W03",
        linkHref: "/volunteer",
      },
      {
        prompt: "Cách nộp minh chứng & tính giờ duyệt",
        reply:
          "Sau khi hoàn thành đầu ra và gửi minh chứng, giờ sẽ nằm ở mục 'Chờ duyệt'. Chỉ khi Chủ vườn xác nhận nhận bàn giao VÀ Điều phối viên (W04) bấm duyệt thì giờ mới cộng vào OCOP Youth Pass.",
        linkLabel: "Xem Youth Impact Pass",
        linkHref: "/volunteer",
      },
      {
        prompt: "Chuẩn bị phiên Livestream bán nông sản",
        reply:
          "Bạn có thể kiểm tra lịch NF-LIVE-01 ('Ghé vườn Ba Tư', 28/11/2026 09:00) hoặc tạo lịch phát sóng gắn sản phẩm từ khu vực OCOP Live.",
        linkLabel: "Mở khu vực OCOP Live",
        linkHref: "/live",
      },
    ],
  },
  W04: {
    greeting:
      "Chào Thu Hà (Điều phối W04). NaiAI chỉ hỗ trợ tra cứu quy trình nội bộ — không tự động duyệt giờ hay xác minh hồ sơ thay bạn.",
    chips: [
      {
        prompt: "Quy trình duyệt giờ hai lớp",
        reply:
          "Nguyên tắc bắt buộc của NF-MIS-01: (1) TNV nộp minh chứng; (2) Nhà vườn Ba Tư xác nhận đã nhận bàn giao tại W02; (3) Điều phối W04 mới được bấm Duyệt giờ (hoặc Yêu cầu bổ sung kèm lý do).",
        linkLabel: "Mở Hàng chờ duyệt giờ",
        linkHref: "/coordinator",
      },
      {
        prompt: "Giải thích trạng thái đối chiếu hồ sơ",
        reply:
          "Nút 'Hồ sơ đã đối chiếu (Demo)' ghi nhận bạn đã kiểm tra bản scan nhà vườn gửi lên. Điều phối viên không cấp sao OCOP chính thức thay cơ quan thẩm quyền.",
        linkLabel: "Mở Đối chiếu chứng từ",
        linkHref: "/coordinator?tab=docs",
      },
    ],
  },
  W05: {
    greeting:
      "Chào đơn vị đối tác / HTX (W05). Đây là chế độ xem theo phạm vi tổ chức được cấp quyền trong prototype.",
    chips: [
      {
        prompt: "Xem phạm vi Hợp tác xã & Doanh nghiệp",
        reply:
          "W05 gộp chung một khung giao diện với bộ chọn tổ chức: HTX Tân Triều (gom lô & xe mát), Doanh nghiệp B2B (RFQ lộ trình mở rộng) và Trường học (lớp thực hành).",
        linkLabel: "Mở Không gian Tổ chức",
        linkHref: "/organization",
      },
    ],
  },
  W06: {
    greeting:
      "Trợ lý hướng dẫn W06 (Chỉ đọc tài liệu vận hành). Không thực hiện thay đổi phân quyền tự động qua hội thoại.",
    chips: [
      {
        prompt: "Nguyên tắc cấp quyền theo scope",
        reply:
          "Mọi grant trong W06 gắn rõ Tài khoản + Tổ chức + Capability + Phạm vi đơn vị + Ngày hết hạn, và yêu cầu lý do khi thu hồi.",
        linkLabel: "Xem Ma trận phân quyền",
        linkHref: "/admin",
      },
    ],
  },
};
