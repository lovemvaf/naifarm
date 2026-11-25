import { INITIAL_FARMS } from "./farms";
import type {
  AdminGrant,
  AuditLogEntry,
  DocumentReviewCase,
  ExperienceBooking,
} from "@/types/naifarm";

const EXTRA_BOOKING_FARMS = INITIAL_FARMS.filter((f) => f.experiences.length > 0);
const GUEST_NAMES = [
  "Ngọc Linh & gia đình",
  "Nhóm Sinh viên ĐH Đồng Nai",
  "Gia đình anh Minh Khang",
  "Đoàn Trường THPT Trấn Biên",
  "Nhóm khách Long Khánh",
  "CLB Khởi nghiệp Trẻ",
];

export const INITIAL_EXPERIENCE_BOOKINGS: ExperienceBooking[] = [
  {
    id: "EXP-BOOK-01",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    packageTitle: "Một ngày làm nông dân cù lao cùng Chú Ba Minh",
    guestName: "Ngọc Linh & gia đình",
    guestCount: 4,
    dateLabel: "06/12/2026 · 08:30",
    note: "Muốn trải nghiệm cắt bưởi và tìm hiểu cách dán tem QR.",
    status: "Chờ nhà vườn xác nhận",
  },
  ...Array.from({ length: 23 }, (_, idx) => {
    const farm = EXTRA_BOOKING_FARMS[(idx + 1) % EXTRA_BOOKING_FARMS.length];
    const pkg = farm.experiences[0];
    return {
      id: `EXP-BOOK-${String(idx + 2).padStart(2, "0")}`,
      farmId: farm.id,
      farmName: farm.name,
      packageTitle: pkg.title,
      guestName: GUEST_NAMES[(idx + 1) % GUEST_NAMES.length],
      guestCount: 2 + (idx % 6),
      dateLabel: `${String(5 + (idx % 20)).padStart(2, "0")}/12/2026 · 08:30`,
      note: `Đăng ký tham quan vườn tại ${farm.administrativeUnitName} .`,
      status: "Chờ nhà vườn xác nhận" as const,
    };
  }),
];

export const INITIAL_DOC_CASES: DocumentReviewCase[] = [
  {
    id: "DOC-01",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    documentTitle: "Hồ sơ tự khai vùng trồng chôm chôm – sầu riêng (2,5 ha Phường Long Khánh)",
    submittedAt: "24/11/2026 · 08:30",
    scopeNote: "Điều phối viên chỉ đối chiếu hình ảnh giấy tờ tự khai; không cấp chứng nhận OCOP chính thức.",
    status: "Chờ đối chiếu",
  },
  {
    id: "DOC-02",
    farmId: "farm-co-tu-cam-my",
    farmName: "Vườn Cô Tư Sinh Thái",
    documentTitle: "Nhật ký đàn ong hoa nhãn & cam kết an toàn thu hoạch (Xã Xuân Đường)",
    submittedAt: "23/11/2026 · 15:10",
    scopeNote: "Cần đối chiếu ảnh chụp thực tế khu vực đặt thùng ong.",
    status: "Chờ đối chiếu",
  },
  {
    id: "DOC-03",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    documentTitle: "Bộ hồ sơ vùng bưởi Phường Tân Triều & Nhật ký lô NF-TT-2026-01",
    submittedAt: "21/11/2026 · 10:00",
    scopeNote: "Đã đối chiếu đầy đủ bản scan minh họa từ chủ vườn và TNV Nguyễn Văn An.",
    status: "Hồ sơ đã đối chiếu",
    reviewerNote: "Hồ sơ rõ ràng, tách biệt dữ liệu tự khai và văn bản đối chiếu.",
  },
  ...INITIAL_FARMS.slice(3, 12).map((farm, idx) => ({
    id: `DOC-${String(idx + 4).padStart(2, "0")}`,
    farmId: farm.id,
    farmName: farm.name,
    documentTitle: `Hồ sơ minh họa vùng trồng ${farm.mainCrops[0]} (${farm.administrativeUnitName})`,
    submittedAt: `${String(18 + (idx % 6)).padStart(2, "0")}/11/2026 · 09:00`,
    scopeNote: `Kiểm tra khớp địa chỉ chuẩn ${farm.administrativeUnitName} và ảnh nhật ký mùa vụ.`,
    status: (
      idx % 3 === 0
        ? "Hồ sơ đã đối chiếu"
        : idx % 3 === 1
        ? "Chờ đối chiếu"
        : "Yêu cầu bổ sung"
    ) as DocumentReviewCase["status"],
    reviewerNote:
      idx % 3 === 0
        ? "Đã đối chiếu chứng từ tự khai nội bộ (không có giá trị pháp lý)."
        : idx % 3 === 2
        ? "Đề nghị bổ sung ảnh chụp nhãn QR mẫu trên thùng đóng gói."
        : undefined,
  })),
];

export const INITIAL_ADMIN_GRANTS: AdminGrant[] = [
  {
    id: "GR-01",
    accountName: "Thu Hà (Điều phối cơ sở)",
    organizationName: "Đoàn Phường Long Khánh",
    workspaceScope: "W04",
    capability: "hours.approve + doc.compare",
    unitScope: "Phường Long Khánh (Giới hạn đơn vị)",
    expiresAt: "31/12/2026",
    active: true,
    lastReason: "Phân công điều phối chiến dịch hỗ trợ nhà vườn quý IV.",
  },
  {
    id: "GR-02",
    accountName: "Minh Anh (Tình nguyện viên)",
    organizationName: "Đội Trí thức trẻ Số hóa Đồng Nai",
    workspaceScope: "W03",
    capability: "product.draft_for_farm (ủy quyền W02 hạn định)",
    unitScope: "Nhà vườn Ba Tư (farm-ba-tu-demo)",
    expiresAt: "15/12/2026",
    active: true,
    lastReason: "Chú Ba Tư ủy quyền soạn bản nháp sản phẩm, chủ vườn tự duyệt công bố.",
  },
  {
    id: "GR-03",
    accountName: "Ban chủ nhiệm HTX Tân Triều",
    organizationName: "HTX Nông nghiệp Tân Triều",
    workspaceScope: "W05",
    capability: "coop.batch_aggregate + coldchain.schedule",
    unitScope: "Cụm xã viên Phường Tân Triều",
    expiresAt: "30/06/2027",
    active: true,
    lastReason: "Quản lý lịch gom hàng và điều phối chuyến xe mát nội tỉnh.",
  },
  {
    id: "GR-04",
    accountName: "Đại diện Trường THPT / ĐH Đồng Nai",
    organizationName: "CLB Học tập Thực hành Nông nghiệp",
    workspaceScope: "W05",
    capability: "academy.class_manage (tính năng mở rộng)",
    unitScope: "Khối lớp thực hành Nông học Đồng Nai",
    expiresAt: "30/05/2027",
    active: false,
    lastReason: "Tạm tắt quyền thử nghiệm lớp học mở rộng trong phạm vi MVP P0.",
  },
  {
    id: "GR-05",
    accountName: "Điều phối khu vực Bắc Đồng Nai",
    organizationName: "Đoàn Phường Bình Phước",
    workspaceScope: "W04",
    capability: "hours.approve + doc.compare",
    unitScope: "Phường Bình Phước – Đồng Xoài – Phước Long",
    expiresAt: "31/03/2027",
    active: true,
    lastReason: "Phân quyền duyệt giờ hỗ trợ TNV cụm vùng điều bazan phía Bắc.",
  },
  {
    id: "GR-06",
    accountName: "Tổ Hỗ trợ Địa giới & GIS",
    organizationName: "Nhóm Dữ liệu Mở Group 8",
    workspaceScope: "W06",
    capability: "admin.dataset_audit + ticket.triage",
    unitScope: "95 Phường/Xã Thành phố Đồng Nai",
    expiresAt: "31/12/2026",
    active: true,
    lastReason: "Giám sát chuẩn hóa địa chỉ 2 cấp và tính trung thực dữ liệu GIS.",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-101",
    time: "24/11/2026 09:05",
    actor: "Chú Ba Minh (W02)",
    action: "CONFIRM_DELIVERABLE",
    target: "NF-MIS-02",
    note: "Xác nhận nhận bàn giao 20 bộ tem QR từ TNV Nguyễn Văn An.",
  },
  {
    id: "AUD-102",
    time: "24/11/2026 09:12",
    actor: "Thu Hà (W04)",
    action: "APPROVE_HOURS_LEDGER",
    target: "NF-MIS-02 (+3 giờ)",
    note: "Duyệt độc lập sau khi chủ vườn xác nhận bàn giao.",
  },
  {
    id: "AUD-103",
    time: "24/11/2026 09:20",
    actor: "Quản trị Hệ thống (W06)",
    action: "SYSTEM_AUDIT_INIT",
    target: "W01–W06",
    note: "Khởi tạo không gian trải nghiệm cục bộ — không kết nối cơ sở dữ liệu thật.",
  },
  ...Array.from({ length: 13 }, (_, idx) => ({
    id: `AUD-${104 + idx}`,
    time: `${String(11 + (idx % 13)).padStart(2, "0")}/11/2026 ${String(8 + (idx % 9)).padStart(2, "0")}:30`,
    actor: idx % 2 === 0 ? "Thu Hà (W04)" : "Quản trị Hệ thống (W06)",
    action: idx % 3 === 0 ? "ADMIN_DATASET_SYNC" : idx % 3 === 1 ? "CERT_DISCLAIMER_CHECK" : "GRANT_SCOPE_VERIFY",
    target: idx % 3 === 0 ? "95 ĐVHC Đồng Nai" : `CERT-0${(idx % 9) + 1}`,
    note: "Kiểm tra nhật ký đối chiếu trong không gian trải nghiệm.",
  })),
];

export interface LessonQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CASHEW_LESSON = {
  id: "lesson-hat-dieu-dong-nai",
  title: "Hành trình của hạt điều Đồng Nai — Từ vườn cây đến sản phẩm OCOP",
  duration: "15 phút",
  level: "Phổ thông & Sinh viên (Học mở)",
  objective:
    "Hiểu đặc điểm sinh trưởng của cây điều vùng đất đỏ Đồng Nai, quy trình thu hoạch an toàn, rang củi giữ vỏ lụa và vai trò của mã QR truy xuất.",
  sections: [
    {
      heading: "1. Vì sao đất đỏ bazan Đồng Nai hợp với cây điều?",
      body: "Điều thích nghi tốt với khí hậu nhiệt đới hai mùa mưa nắng rõ rệt tại Phường Xuân Lộc, Xã Định Quán, Xã Đak Nhau. Rễ cọc ăn sâu giúp cây chịu hạn tốt trong mùa khô khi hạt điều vào giai đoạn chắc nhân.",
      image: "/images/stitch/stitch-39.jpg",
    },
    {
      heading: "2. Hai phần đặc biệt: Quả giả (đào lộn hột) & Hạt thật",
      body: "Phần cuống phình to mọng nước gọi là quả giả, còn hạt điều thật nằm bên ngoài ở đầu quả. Khi thu hoạch, nông dân chờ hạt rụng tự nhiên trên nền vườn sạch để nhân đạt độ bùi cao nhất.",
      image: "/images/stitch/stitch-50.jpg",
    },
    {
      heading: "3. Rang củi giữ vỏ lụa & Minh bạch lô hàng bằng QR",
      body: "Vỏ hạt điều thô chứa nhựa vỏ điều cần xử lý đúng kỹ thuật. Khi rang chín bằng chảo gang, lớp vỏ lụa nâu giúp giữ hương thơm và hạn chế ẩm. Gắn mã QR lô sản xuất giúp người mua xem rõ ngày thu hoạch và cơ sở chế biến.",
      image: "/images/stitch/stitch-05.jpg",
    },
  ],
  quiz: [
    {
      id: "q1",
      question: "Thời điểm thu hoạch hạt điều cho chất lượng nhân bùi và chắc nhất là khi nào?",
      options: [
        "Hái khi trái còn xanh non trên cành",
        "Chờ hạt chín và rụng tự nhiên rồi thu gom trên vườn sạch",
        "Ngâm nước nhiều ngày trước khi phơi",
      ],
      correctIndex: 1,
      explanation: "Hạt điều rụng tự nhiên đảm bảo nhân đã tích đủ dưỡng chất và độ khô đồng đều.",
    },
    {
      id: "q2",
      question: "Vai trò của lớp vỏ lụa mỏng quanh nhân điều rang muối Xuân Lộc là gì?",
      options: [
        "Giúp giữ hương thơm tự nhiên, giảm gãy vỡ và tạo vị bùi đặc trưng",
        "Làm tăng trọng lượng nước trong hạt",
        "Thay thế hoàn toàn bao bì đóng gói",
      ],
      correctIndex: 0,
      explanation: "Vỏ lụa mỏng bảo vệ nhân điều khi rang củi và giữ vị giòn bùi truyền thống.",
    },
    {
      id: "q3",
      question: "Mã QR trên hộ chiếu nông sản NaiFarm giúp người tiêu dùng kiểm tra điều gì trung thực nhất?",
      options: [
        "Tự động chứng nhận an toàn thực phẩm tuyệt đối",
        "Xem mã lô, ngày thu hoạch/đóng gói, chủ thể khai báo và tình trạng đối chiếu chứng từ",
        "Thay đổi giá bán sản phẩm tự động",
      ],
      correctIndex: 1,
      explanation: "Mã QR công khai nguồn gốc khai báo, lịch sử mốc thời gian và tách bạch trạng thái đối chiếu chứng từ.",
    },
  ] satisfies LessonQuestion[],
};
