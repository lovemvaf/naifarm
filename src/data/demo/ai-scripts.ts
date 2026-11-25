import type { WorkspaceId } from "@/types/naifarm";

export interface AiScriptItem {
  prompt: string;
  promptEn: string;
  reply: string;
  replyEn: string;
  linkLabel?: string;
  linkLabelEn?: string;
  linkHref?: string;
  productSlug?: string;
}

export const AI_WORKSPACE_CONFIG: Record<
  WorkspaceId,
  {
    greeting: string;
    greetingEn: string;
    chips: AiScriptItem[];
  }
> = {
  W01: {
    greeting:
      "Chào bạn! Mình là NaiAI — trợ lý tra cứu dữ liệu thật trên NaiFarm (không gọi API ngoài). Bạn muốn tìm nông sản, tour vườn, hay mã QR nào hôm nay?",
    greetingEn:
      "Hello! I'm NaiAI — a local scripted search helper inside NaiFarm (no external LLM calls). Ask about produce, orchard tours, or QR batch codes!",
    chips: [
      {
        prompt: "Chôm chôm giá bao nhiêu?",
        promptEn: "How much is Ba Tu rambutan?",
        reply:
          "Theo dữ liệu hiện có: Chôm chôm Java Long Khánh tại Nhà vườn Ba Tư có giá tham khảo 35.000 đ/kg (lô NF-DEMO-001). Bạn có thể xem chi tiết và quét QR nguồn gốc ngay bên dưới.",
        replyEn:
          "Current sample catalog shows Long Khanh Java Rambutan from Ba Tu Family Orchard at 35,000 VND/kg (lot NF-DEMO-001). Tap below to inspect the lot and QR passport.",
        linkLabel: "Xem Chôm chôm Java Ba Tư",
        linkLabelEn: "Open Ba Tu Java Rambutan",
        linkHref: "/products/chom-chom-java-long-khanh",
        productSlug: "chom-chom-java-long-khanh",
      },
      {
        prompt: "Giải thích tem QR trên trái bưởi",
        promptEn: "How does the pomelo QR passport work?",
        reply:
          "Tem QR mở trang Hộ chiếu Nông sản công khai: hiển thị mã lô (ví dụ NF-TT-2026-01), 3 mốc nhật ký canh tác – thu hoạch – đóng gói và phân biệt rõ phần nhà vườn tự khai với hồ sơ đã đối chiếu.",
        replyEn:
          "Scanning a QR opens the public Produce Passport displaying batch ID (e.g. NF-TT-2026-01), cultivation-to-packing diary steps, and clear separation between farmer declarations and checked records.",
        linkLabel: "Mở Hộ chiếu QR mẫu",
        linkLabelEn: "View Sample QR Passport",
        linkHref: "/trace/NF-TT-2026-01",
      },
      {
        prompt: "Đặt tour vườn cuối tuần ở đâu?",
        promptEn: "Where can I book weekend orchard tours?",
        reply:
          "Bạn có thể xem 28 gói trải nghiệm miệt vườn & bản đồ 95 phường/xã Đồng Nai tại mục Khám phá & Tour, lọc theo ngôn ngữ VI/EN và khung giờ còn chỗ.",
        replyEn:
          "Browse 28 bilingual agritourism experiences and the 95-ward Dong Nai interactive map under Explore & Tours.",
        linkLabel: "Mở Bản đồ & Tour Đồng Nai",
        linkLabelEn: "Open Map & Tours",
        linkHref: "/explore?view=tours",
      },
    ],
  },
  W02: {
    greeting:
      "Chào Nhà vườn! Mình hỗ trợ đọc hướng dẫn từng bước đăng bán nông sản, ghi nhật ký mùa vụ và kiểm tra đơn hàng.",
    greetingEn:
      "Welcome, Orchard Host! Ask for step-by-step guidance on 3-step product listing, harvest diaries, or incoming orders.",
    chips: [
      {
        prompt: "Hướng dẫn đăng bán 3 bước",
        promptEn: "How does 3-step listing work?",
        reply:
          "Chỉ cần 3 bước đơn giản: (1) Chọn ảnh nông sản chụp ở vườn; (2) Bấm nút ghi âm giọng nói hoặc nhập tay; (3) Kiểm tra lại tên, giá, số lượng rồi bấm 'Xác nhận đăng bán'.",
        replyEn:
          "Just 3 accessible steps: (1) Pick an orchard photo; (2) Record voice or enter title/notes; (3) Review price & stock, then publish directly.",
        linkLabel: "Mở Đăng bán nhanh 3 bước",
        linkLabelEn: "Open 3-Step Quick List",
        linkHref: "/farmer/publish",
      },
      {
        prompt: "Cách ghi nhật ký mùa vụ",
        promptEn: "How to update a harvest diary?",
        reply:
          "Trong Không gian Nhà vườn, chọn thẻ 'Nhật ký mùa vụ', chọn lô hàng và thêm mốc chăm sóc/thu hoạch để người mua quét QR thấy thông tin mới ngay.",
        replyEn:
          "Open Orchard Workspace → Harvest Diary, pick your batch code, and append a timestamped care or harvest log synced to the public QR page.",
        linkLabel: "Mở Nhật ký mùa vụ",
        linkLabelEn: "Open Orchard Workspace",
        linkHref: "/farmer?tab=diary",
      },
      {
        prompt: "Xem đơn hàng & việc cần làm",
        promptEn: "Check orders and volunteer handovers",
        reply:
          "Bạn có thể xem đơn hàng mẫu NF-ORD-DEMO-01 và xác nhận bàn giao nhiệm vụ tình nguyện của Minh Anh ngay tại bảng điều khiển Nhà vườn.",
        replyEn:
          "Review incoming orders such as NF-ORD-DEMO-01 and confirm youth volunteer handover tasks from your main Orchard Workspace.",
        linkLabel: "Về Bảng điều khiển Nhà vườn",
        linkLabelEn: "Back to Orchard Dashboard",
        linkHref: "/farmer",
      },
    ],
  },
  W03: {
    greeting:
      "Chào Thanh niên Tình nguyện! NaiAI tổng hợp nhanh nhiệm vụ mở, bài học 6 bước 2D và chứng nhận giờ cống hiến NaiPass.",
    greetingEn:
      "Hi Youth Volunteer! Explore open digitization missions, 6-step 2D NaiAcademy courses, or preview your PDF Achievement Certificate.",
    chips: [
      {
        prompt: "Tìm nhiệm vụ phù hợp",
        promptEn: "Find available youth missions",
        reply:
          "Bạn có thể chuyển sang tab 'Khám phá' để xem nhiệm vụ mở như NF-MIS-03 'Biên tập mô tả & lịch livestream HTX Xuân Lộc' (hỗ trợ Online, dự kiến 2 giờ).",
        replyEn:
          "Check the Explore tab to browse open missions like NF-MIS-03 (Xuan Loc Cashew Live Copy, Remote, ~2h) and click Join Mission.",
        linkLabel: "Mở Bảng nhiệm vụ",
        linkLabelEn: "Open Volunteer Hub",
        linkHref: "/volunteer",
      },
      {
        prompt: "Cách nhận Chứng nhận PDF & tính giờ duyệt",
        promptEn: "How do PDF certificates & 2-tier hours work?",
        reply:
          "Sau khi bạn nộp minh chứng, giờ sẽ được xác nhận 2 lớp độc lập bởi Nhà vườn và Điều phối viên rồi cộng vào Hộ chiếu NaiPass kèm chức năng tải PDF có QR.",
        replyEn:
          "Submitted deliverables require independent Orchard Host confirmation and Coordinator hour approval before counting toward your NaiPass & QR-verified PDF certificate.",
        linkLabel: "Xem Chứng nhận mẫu NF-CERT-2026-001",
        linkLabelEn: "View Sample Certificate",
        linkHref: "/credentials/NF-CERT-2026-001",
      },
      {
        prompt: "Học tập 6 bước & Giải phẫu 2D",
        promptEn: "Open 6-step 2D Produce Academy",
        reply:
          "NaiAcademy có 20 bài học song ngữ đi kèm 9 sơ đồ mặt cắt nông sản 2D (Bưởi, Chôm chôm, Sầu riêng, Điều, Cà phê, Tiêu, Ca cao, Bơ, Mật ong).",
        replyEn:
          "NaiAcademy features 20 bilingual lessons paired with 9 interactive 2D produce cross-section diagrams.",
        linkLabel: "Vào góc Học tập 2D",
        linkLabelEn: "Open 2D Learning Hub",
        linkHref: "/learn",
      },
    ],
  },
  W04: {
    greeting:
      "Chào Điều phối Cộng đồng! NaiAI hỗ trợ tra cứu quy tắc duyệt giờ 2 lớp và danh sách chứng từ đối chiếu.",
    greetingEn:
      "Hello Community Coordinator! Look up 2-tier hour verification rules or open document audit queues.",
    chips: [
      {
        prompt: "Quy trình duyệt giờ hai lớp",
        promptEn: "Explain 2-tier volunteer hour approval",
        reply:
          "Nguyên tắc tách quyền: (1) TNV nộp minh chứng; (2) Nhà vườn xác nhận đã nhận bàn giao thực tế; (3) Điều phối mới bấm Duyệt giờ (hoặc yêu cầu bổ sung kèm lý do).",
        replyEn:
          "Maker-Checker separation: (1) Volunteer submits proof; (2) Orchard confirms delivery; (3) Coordinator reviews and approves hours or requests revision.",
        linkLabel: "Mở Hàng chờ duyệt giờ",
        linkLabelEn: "Open Approval Queue",
        linkHref: "/coordinator",
      },
      {
        prompt: "Giải thích trạng thái đối chiếu hồ sơ",
        promptEn: "What does dossier checking mean?",
        reply:
          "Trạng thái 'Hồ sơ đã đối chiếu' ghi nhận cán bộ đã kiểm tra bản scan từ nhà vườn; hệ thống không tự cấp sao OCOP thay cơ quan nhà nước.",
        replyEn:
          "'Checked against records' reflects document verification only — NaiFarm does not issue state OCOP stars on behalf of authorities.",
        linkLabel: "Mở Đối chiếu chứng từ",
        linkLabelEn: "Open Document Audit",
        linkHref: "/coordinator?tab=docs",
      },
    ],
  },
  W05: {
    greeting:
      "Chào đơn vị Tổ chức & Hợp tác xã! Tra cứu nhanh báo cáo điều hành, kho FEFO và lịch chiến dịch.",
    greetingEn:
      "Welcome, Partner Organization! Check cooperative operations, B2B sourcing RFQs, and local campaign calendars.",
    chips: [
      {
        prompt: "Xem phạm vi Hợp tác xã & Doanh nghiệp",
        promptEn: "Browse Cooperative & Enterprise views",
        reply:
          "Không gian Tổ chức tổng hợp gom lô HTX Tân Triều, công nợ/tồn kho FEFO, đơn hàng doanh nghiệp B2B và lịch phối hợp trường học.",
        replyEn:
          "The Organization portal covers Cooperative batch pooling, FEFO inventory, B2B RFQs, and supervised school field schedules.",
        linkLabel: "Mở Không gian Tổ chức",
        linkLabelEn: "Open Organization Hub",
        linkHref: "/organization",
      },
    ],
  },
  W06: {
    greeting:
      "Trợ lý hướng dẫn Quản trị (Chỉ tra cứu tài liệu — không thay đổi phân quyền hay CMS tự động qua chat).",
    greetingEn:
      "Governance Reference Assistant (read-only lookup — permission grants & CMS publishing require direct UI confirmation).",
    chips: [
      {
        prompt: "Nguyên tắc cấp quyền theo phạm vi & CMS",
        promptEn: "Review scoped grants & local CMS rules",
        reply:
          "Mọi phân quyền gắn rõ Tài khoản + Tổ chức + Phạm vi xã/phường + Ngày hết hạn, tách biệt Maker-Checker; nội dung CMS có lưu lịch sử & rollback cục bộ.",
        replyEn:
          "Every grant specifies holder, org scope, ward range, and expiration with audit logs; Local CMS edits keep version history & rollback.",
        linkLabel: "Mở Trung tâm Quản trị",
        linkLabelEn: "Open Governance Center",
        linkHref: "/admin",
      },
    ],
  },
};
