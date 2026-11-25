import { INITIAL_FARMS } from "./farms";
import { INITIAL_PRODUCTS } from "./products";
import type { LivestreamSession } from "@/types/naifarm";

const CORE_LIVESTREAMS: LivestreamSession[] = [
  {
    id: "NF-LIVE-REPLAY-TT",
    title: "Thu hoạch Bưởi đường lá cam đầu mùa & Thử độ ngọt Brix tại liếp cùng Chú Ba Minh",
    titleEn: "Early Season Tan Trieu Sweet Pomelo Harvest & Brix Check with Uncle Ba Minh",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    hostYouth: "Nguyễn Văn An (ĐH Đồng Nai)",
    farmerName: "Chú Ba Minh",
    scheduleLabel: "23/11/2026 · 09:00 (Phiên phát lại minh họa)",
    startIso: "2026-11-23T09:00:00+07:00",
    status: "replay_demo",
    pinnedProductIds: ["P07", "P06", "P10", "P11"],
    linkedTourSlug: "mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh",
    linkedCampaignId: "CMP-2026-CULTURE-RECAP",
    linkedLessonSlug: "cau-tao-buoi-da-xanh-tan-trieu",
    angles: [
      {
        id: "angle-1",
        label: "Góc 1: Cắt trái tại liếp",
        labelEn: "Angle 1: Orchard Harvest",
        image: "/images/stitch/stitch-44.jpg",
        caption: "Chú Ba Minh chọn cắt bưởi đường lá cam đúng độ chín da láng bóng.",
        captionEn: "Uncle Ba Minh selects ripe sweet pomelos directly along the alluvial garden beds.",
      },
      {
        id: "angle-2",
        label: "Góc 2: Bàn thẩm định Brix",
        labelEn: "Angle 2: Brix Tasting Table",
        image: "/images/stitch/stitch-25.jpg",
        caption: "Tép bưởi Tân Triều mọng nước, đo độ ngọt tham khảo 11.8–12.2° Brix.",
        captionEn: "Sample refractometer tasting check showing 11.8–12.2° Brix sweetness.",
      },
      {
        id: "angle-3",
        label: "Góc 3: Toàn cảnh cù lao",
        labelEn: "Angle 3: Islet Panorama",
        image: "/images/stitch/stitch-19.jpg",
        caption: "Khung cảnh liếp vườn phù sa sông Đồng Nai và đội TNV hỗ trợ đóng thùng.",
        captionEn: "Dong Nai river alluvial orchard scenery with youth volunteers packing crates.",
      },
    ],
    summary:
      "Phiên phát lại minh họa mô hình kết hợp kể chuyện nông dân và gắn thẻ sản phẩm truy xuất nguồn gốc trực tiếp (không giả lập người xem trực tuyến).",
    summaryEn:
      "Illustrated replay combining farmer storytelling with live-pinned QR traceable products (no simulated viewer count or chat).",
    isDemo: true,
  },
  {
    id: "NF-LIVE-01",
    title: "Ghé vườn Ba Tư: Hái chôm chôm Java đầu mùa & Quét mã lô NF-DEMO-001",
    titleEn: "Visit Ba Tu Orchard: Early Dawn Java Rambutan Harvest & NF-DEMO-001 QR Trace",
    farmId: "farm-ba-tu-demo",
    farmName: "Nhà vườn Ba Tư",
    hostYouth: "Minh Anh & Tuấn (TNV Long Khánh)",
    farmerName: "Chú Ba Tư",
    scheduleLabel: "28/11/2026 · 09:00 (Lịch dự kiến)",
    startIso: "2026-11-28T09:00:00+07:00",
    status: "scheduled",
    pinnedProductIds: ["P01", "P04"],
    linkedTourSlug: "tham-quan-vuon-ba-tu-long-khanh",
    linkedCampaignId: "CMP-2026-NOV-CONNECT",
    linkedLessonSlug: "ky-thuat-thu-hoach-chom-chom-long-khanh",
    angles: [
      {
        id: "angle-ba-tu-1",
        label: "Điểm quay vườn chôm chôm",
        labelEn: "Rambutan Orchard Spot",
        image: "/images/stitch/stitch-40.jpg",
        caption: "Dự kiến quay tại khu 2,5 ha ở Phường Long Khánh, gắn sẵn tem lô NF-DEMO-001.",
        captionEn: "Scheduled on-farm showcase across Ba Tu's 2.5 ha orchard in Long Khanh Ward.",
      },
      {
        id: "angle-ba-tu-2",
        label: "Bàn đóng giỏ rơm & dán tem QR",
        labelEn: "Bamboo Basket & QR Table",
        image: "/images/stitch/stitch-32.jpg",
        caption: "Đoàn viên Minh Anh hướng dẫn kiểm tra độ chín và dán tem QR lô hàng.",
        captionEn: "Youth volunteer Minh Anh demonstrates fresh sorting and QR batch tagging.",
      },
    ],
    summary:
      "Minh Anh hỗ trợ chú Ba Tư giới thiệu quy trình cắt chôm chôm sáng sớm và hướng dẫn người mua quét QR.",
    summaryEn:
      "Youth volunteers Minh Anh & Tuan assist Uncle Ba Tu showcase morning harvest sorting and QR inspection.",
    isDemo: true,
  },
  {
    id: "NF-LIVE-02",
    title: "Rang hạt điều củi thủ công & Kiểm tra tem truy xuất tại HTX Xuân Lộc",
    titleEn: "Traditional Wood-Fire Cashew Roasting & Batch Traceability at Xuan Loc Coop",
    farmId: "farm-htx-xuan-loc",
    farmName: "HTX Nông nghiệp Xuân Lộc",
    hostYouth: "Nhóm TNV Số hóa Xuân Lộc",
    farmerName: "Tổ hợp tác Xuân Lộc",
    scheduleLabel: "30/11/2026 · 14:30 (Lịch dự kiến)",
    startIso: "2026-11-30T14:30:00+07:00",
    status: "scheduled",
    pinnedProductIds: ["P08", "P12"],
    linkedTourSlug: "trai-nghiem-xuong-rang-hat-dieu-xuan-loc",
    linkedCampaignId: "CMP-2026-NOV-CONNECT",
    linkedLessonSlug: "hanh-trinh-hat-dieu-dong-nai",
    angles: [
      {
        id: "angle-xl-1",
        label: "Chảo rang củi truyền thống",
        labelEn: "Wood-Fire Cast Iron Pan",
        image: "/images/stitch/stitch-50.jpg",
        caption: "Giới thiệu công đoạn rang giữ vỏ lụa giòn thơm.",
        captionEn: "Traditional wood-fired roasting preserving crispy cashew skin aroma.",
      },
    ],
    summary: "Phiên kết nối HTX Xuân Lộc chia sẻ quy trình sơ chế nông sản khô đặc trưng Đồng Nai.",
    summaryEn: "Xuan Loc Cooperative showcase covering specialty dry produce roasting and airtight packaging.",
    isDemo: true,
  },
];

const EXTRA_LIVESTREAMS: LivestreamSession[] = Array.from({ length: 21 }, (_, idx) => {
  const num = idx + 3;
  const farm = INITIAL_FARMS[(idx + 4) % INITIAL_FARMS.length];
  const farmProducts = INITIAL_PRODUCTS.filter((p) => p.farmId === farm.id && p.seasonStatus === "in_season" && !p.adultOnly);
  const pinnedIds = farmProducts.length > 0 ? farmProducts.slice(0, 3).map((p) => p.id) : ["P01", "P06"];
  const statuses: LivestreamSession["status"][] = ["scheduled", "replay_demo", "ended"];
  const status = statuses[idx % statuses.length];
  const day = status === "replay_demo" || status === "ended" ? String(15 + (idx % 9)).padStart(2, "0") : String(1 + (idx % 12)).padStart(2, "0");
  const month = status === "replay_demo" || status === "ended" ? "11" : "12";

  return {
    id: `NF-LIVE-${String(num).padStart(2, "0")}`,
    title: `Kết nối ${farm.name}: ${farm.mainCrops[0]} (${farm.administrativeUnitName})`,
    titleEn: `Orchard Feature: ${farm.enName || farm.name} (${farm.administrativeUnitName})`,
    farmId: farm.id,
    farmName: farm.name,
    hostYouth: farm.youthSupporters[0] ?? "Đoàn viên Thanh niên Đồng Nai",
    farmerName: farm.ownerName,
    scheduleLabel: `${day}/${month}/2026 · ${idx % 2 === 0 ? "09:30" : "15:00"}`,
    startIso: `2026-${month}-${day}T${idx % 2 === 0 ? "09:30" : "15:00"}:00+07:00`,
    status,
    pinnedProductIds: pinnedIds,
    linkedCampaignId: month === "12" ? "CMP-2026-DEC-YOUTH-SOIL" : "CMP-2026-NOV-CONNECT",
    linkedLessonSlug: idx % 2 === 0 ? "cau-tao-buoi-da-xanh-tan-trieu" : "hanh-trinh-hat-dieu-dong-nai",
    angles: [
      {
        id: `angle-extra-${num}`,
        label: `Toàn cảnh ${farm.administrativeUnitName}`,
        labelEn: `${farm.administrativeUnitName} Field View`,
        image: farm.bannerImage,
        caption: `Ghi hình giới thiệu quy trình chăm sóc & thu hoạch tại ${farm.name}.`,
        captionEn: `On-site orchard harvest showcase at ${farm.name}.`,
      },
    ],
    summary: `Phiên giới thiệu đặc sản ${farm.mainCrops.join(", ")} gắn với nhật ký mùa vụ minh họa.`,
    summaryEn: `Showcase featuring ${farm.mainCrops.slice(0, 2).join(", ")} paired with harvest diary logs.`,
    isDemo: true,
  };
});

export const INITIAL_LIVESTREAMS: LivestreamSession[] = [...CORE_LIVESTREAMS, ...EXTRA_LIVESTREAMS];
