import { INITIAL_FARMS } from "./farms";
import { INITIAL_PRODUCTS } from "./products";
import type { LivestreamSession } from "@/types/naifarm";

const CORE_LIVESTREAMS: LivestreamSession[] = [
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
        image: "/images/stitch/stitch-44.jpg",
        caption: "Chú Ba Minh chọn cắt bưởi đường lá cam đúng độ chín da láng bóng.",
      },
      {
        id: "angle-2",
        label: "Góc 2: Bàn thẩm định Brix",
        image: "/images/stitch/stitch-46.jpg",
        caption: "Tép bưởi Tân Triều mọng nước, đo độ ngọt tham khảo 11.8–12.2° Brix.",
      },
      {
        id: "angle-3",
        label: "Góc 3: Toàn cảnh cù lao",
        image: "/images/stitch/stitch-19.jpg",
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
        image: "/images/stitch/stitch-40.jpg",
        caption: "Dự kiến quay trực tiếp khu 2,5 ha tại Phường Long Khánh.",
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
        image: "/images/stitch/stitch-50.jpg",
        caption: "Giới thiệu công đoạn rang giữ vỏ lụa giòn thơm.",
      },
    ],
    summary: "Phiên kết nối HTX Xuân Lộc chia sẻ quy trình sơ chế nông sản khô đặc trưng Đồng Nai.",
    isDemo: true,
  },
];

const EXTRA_LIVESTREAMS: LivestreamSession[] = Array.from({ length: 9 }, (_, idx) => {
  const num = idx + 3;
  const farm = INITIAL_FARMS[(idx + 4) % INITIAL_FARMS.length];
  const farmProducts = INITIAL_PRODUCTS.filter((p) => p.farmId === farm.id && p.seasonStatus === "in_season");
  const pinnedIds = farmProducts.length > 0 ? farmProducts.slice(0, 2).map((p) => p.id) : ["P01"];
  const statuses: LivestreamSession["status"][] = ["scheduled", "replay_demo", "ended"];
  const status = statuses[idx % statuses.length];

  return {
    id: `NF-LIVE-${String(num).padStart(2, "0")}`,
    title: `Kết nối ${farm.name}: ${farm.mainCrops[0]} (${farm.administrativeUnitName})`,
    farmId: farm.id,
    farmName: farm.name,
    hostYouth: farm.youthSupporters[0] ?? "Đoàn viên Thanh niên Đồng Nai",
    farmerName: farm.ownerName,
    scheduleLabel: `${String(1 + (idx % 6)).padStart(2, "0")}/12/2026 · ${idx % 2 === 0 ? "09:30" : "15:00"} (Demo)`,
    status,
    pinnedProductIds: pinnedIds,
    angles: [
      {
        id: `angle-extra-${num}`,
        label: `Toàn cảnh ${farm.administrativeUnitName}`,
        image: farm.bannerImage,
        caption: `Ghi hình giới thiệu quy trình chăm sóc & thu hoạch tại ${farm.name}.`,
      },
    ],
    summary: `Phiên giới thiệu đặc sản ${farm.mainCrops.join(", ")} gắn với nhật ký mùa vụ minh họa.`,
    isDemo: true,
  };
});

export const INITIAL_LIVESTREAMS: LivestreamSession[] = [...CORE_LIVESTREAMS, ...EXTRA_LIVESTREAMS];
