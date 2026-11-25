import type { LivestreamSession } from "@/types/naifarm";

export const INITIAL_LIVESTREAMS: LivestreamSession[] = [
  {
    id: "NF-LIVE-REPLAY-TT",
    title: "Thu hoạch Bưởi đường lá cam đầu mùa & Thử độ ngọt Brix tại liếp cùng Chú Ba Minh",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    hostYouth: "Nguyễn Văn An (ĐH Đồng Nai)",
    farmerName: "Chú Ba Minh",
    scheduleLabel: "23/11/2026 · 09:00 (Phiên minh họa / Replay Demo)",
    status: "replay_demo",
    pinnedProductIds: ["P07", "P06", "P10", "P11"],
    angles: [
      {
        id: "angle-1",
        label: "Góc 1: Cắt trái tại liếp",
        image: "stitch/stitch-44.webp",
        caption: "Chú Ba Minh chọn cắt bưởi đường lá cam đúng độ chín da láng bóng.",
      },
      {
        id: "angle-2",
        label: "Góc 2: Bàn thẩm định Brix",
        image: "stitch/stitch-46.webp",
        caption: "Tép bưởi Tân Triều mọng nước, đo độ ngọt tham khảo 11.8–12.2° Brix.",
      },
      {
        id: "angle-3",
        label: "Góc 3: Toàn cảnh cù lao",
        image: "stitch/stitch-19.webp",
        caption: "Khung cảnh liếp vườn phù sa sông Đồng Nai và đội TNV hỗ trợ đóng thùng.",
      },
    ],
    summary:
      "Phiên phát lại minh họa mô hình kết hợp kể chuyện nông dân và gắn thẻ sản phẩm truy xuất nguồn gốc trực tiếp (không giả lập người xem trực tuyến).",
    isDemo: true,
  },
  {
    id: "NF-LIVE-01",
    title: "Ghé vườn Ba Tư: Hái chôm chôm Java đầu mùa & Quét mã lô NF-DEMO-001",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    hostYouth: "Minh Anh & Tuấn (TNV Long Khánh)",
    farmerName: "Chú Ba Tư",
    scheduleLabel: "28/11/2026 · 09:00 (Lịch dự kiến Demo)",
    status: "scheduled",
    pinnedProductIds: ["P01", "P04"],
    angles: [
      {
        id: "angle-ba-tu-1",
        label: "Điểm quay vườn chôm chôm",
        image: "stitch/stitch-40.webp",
        caption: "Dự kiến quay trực tiếp khu 2,5 ha tại Long Khánh.",
      },
    ],
    summary:
      "Minh Anh hỗ trợ chú Ba Tư giới thiệu quy trình cắt chôm chôm sáng sớm và hướng dẫn người mua quét QR.",
    isDemo: true,
  },
  {
    id: "NF-LIVE-02",
    title: "Rang hạt điều củi thủ công & Kiểm tra tem truy xuất tại HTX Xuân Lộc",
    farmId: "farm-htx-xuan-loc",
    farmName: "HTX Nông nghiệp Xuân Lộc",
    hostYouth: "Nhóm TNV Số hóa Xuân Lộc",
    farmerName: "Tổ hợp tác Xuân Lộc",
    scheduleLabel: "30/11/2026 · 14:30 (Lịch dự kiến Demo)",
    status: "scheduled",
    pinnedProductIds: ["P08", "P12"],
    angles: [
      {
        id: "angle-xl-1",
        label: "Chảo rang củi truyền thống",
        image: "stitch/stitch-50.webp",
        caption: "Giới thiệu công đoạn rang giữ vỏ lụa giòn thơm.",
      },
    ],
    summary: "Phiên kết nối HTX Xuân Lộc chia sẻ quy trình sơ chế nông sản khô đặc trưng Đồng Nai.",
    isDemo: true,
  },
];
