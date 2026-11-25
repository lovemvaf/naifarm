import { INITIAL_FARMS } from "./farms";
import { INITIAL_CERTIFICATIONS } from "./certifications";
import type { AnatomyKind, Product, ProductCategory, ProductSeasonStatus } from "@/types/naifarm";

const farmById = new Map(INITIAL_FARMS.map((f) => [f.id, f]));
const certByFarmId = new Map(INITIAL_CERTIFICATIONS.map((c) => [c.farmId, c.id]));

function farmMeta(farmId: string) {
  const f = farmById.get(farmId) ?? INITIAL_FARMS[0];
  const certId = certByFarmId.get(f.id);
  return {
    farmId: f.id,
    farmName: f.name,
    organizationId: f.organizationId,
    administrativeUnitCode: f.administrativeUnitCode,
    administrativeUnitName: f.administrativeUnitName,
    region: f.administrativeUnitName,
    certificationIds: certId ? [certId] : [],
  };
}

const GOLDEN_AND_CORE_PRODUCTS: Product[] = [
  {
    id: "P01",
    slug: "chom-chom-java-long-khanh",
    name: "Chôm chôm Java Long Khánh",
    enName: "Long Khanh Java Rambutan",
    category: "Trái cây tươi",
    ...farmMeta("farm-ba-tu-demo"),
    unitLabel: "kg",
    priceVnd: 35000,
    stockKg: 30,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-001",
    seasonId: "SEASON-02",
    anatomyType: "rambutan",
    brixNote: "Độ ngọt tự nhiên ~16–18° Brix",
    shortDescription:
      "Chôm chôm Java hái tại vườn Ba Tư (2,5 ha đất đỏ bazan Long Khánh), trái giòn, ráo nước, đóng giỏ rơm sạch giao trong ngày.",
    enShortDescription:
      "Crisp red-skin Java rambutan harvested at dawn from Uncle Ba Tu's 2.5 ha basalt orchard in Long Khanh Ward.",
    storyNote:
      "Lô NF-DEMO-001 do chú Ba Tư và đoàn viên Minh Anh chụp ảnh, cân đo và ghi nhật ký mùa vụ.",
    image: "/images/stitch/stitch-07.jpg",
    gallery: ["/images/stitch/stitch-07.jpg", "/images/stitch/stitch-40.jpg", "/images/stitch/stitch-32.jpg"],
    weightOptions: [
      { label: "2 kg (Giỏ gia đình)", kgMultiplier: 2, priceVnd: 70000 },
      { label: "5 kg (Thùng rơm)", kgMultiplier: 5, priceVnd: 175000 },
    ],
    tags: ["chôm chôm", "ba tư", "long khánh", "trái cây tươi", "nf-demo-001"],
    isDemo: true,
  },
  {
    id: "P06",
    slug: "buoi-da-xanh-tan-trieu",
    name: "Bưởi da xanh Tân Triều",
    category: "Bưởi & Cây có múi",
    ...farmMeta("farm-ba-minh-tan-trieu"),
    unitLabel: "kg",
    priceVnd: 45000,
    stockKg: 42,
    seasonStatus: "in_season",
    batchCode: "NF-TT-2026-01",
    seasonId: "SEASON-01",
    anatomyType: "pomelo",
    brixNote: "Tép hồng mọng nước, 11.8° Brix (đo mẫu tại vườn)",
    shortDescription:
      "Bưởi da xanh ruột hồng cù lao Tân Triều, vỏ mỏng, tép ráo giòn ngọt thanh, có hộ chiếu QR truy xuất 3 chặng.",
    storyNote:
      "Được cắt tại liếp vườn phù sa của Chú Ba Minh và dán tem QR cùng bạn Nguyễn Văn An (TNV ĐH Đồng Nai).",
    image: "/images/stitch/stitch-03.jpg",
    gallery: [
      "/images/stitch/stitch-24.jpg",
      "/images/stitch/stitch-25.jpg",
      "/images/stitch/stitch-26.jpg",
      "/images/stitch/stitch-27.jpg",
    ],
    weightOptions: [
      { label: "2 kg (Khoảng 1–2 trái)", kgMultiplier: 2, priceVnd: 90000 },
      { label: "5 kg (Thùng gia đình)", kgMultiplier: 5, priceVnd: 225000 },
      { label: "10 kg (Thùng quà biếu)", kgMultiplier: 10, priceVnd: 450000 },
    ],
    tags: ["bưởi", "bưởi da xanh", "tân triều", "chú ba minh", "nf-tt-2026-01"],
    isDemo: true,
  },
  {
    id: "P07",
    slug: "buoi-duong-la-cam-tan-trieu",
    name: "Bưởi đường lá cam Tân Triều",
    category: "Bưởi & Cây có múi",
    ...farmMeta("farm-ba-minh-tan-trieu"),
    unitLabel: "kg",
    priceVnd: 42000,
    stockKg: 28,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P07",
    seasonId: "SEASON-01",
    anatomyType: "pomelo",
    brixNote: "Ngọt thanh truyền thống, 12.2° Brix",
    shortDescription:
      "Đặc sản truyền thống Phường Tân Triều, trái tròn vừa tay, mùi lá cam thơm dịu, thích hợp biếu tặng hoặc thưởng thức tại vườn.",
    storyNote: "Sản phẩm trọng tâm trong phiên OCOP Live Story Room cùng Chú Ba Minh.",
    image: "/images/stitch/stitch-53.jpg",
    gallery: ["/images/stitch/stitch-44.jpg", "/images/stitch/stitch-45.jpg", "/images/stitch/stitch-53.jpg"],
    weightOptions: [
      { label: "2 kg", kgMultiplier: 2, priceVnd: 84000 },
      { label: "5 kg", kgMultiplier: 5, priceVnd: 210000 },
    ],
    tags: ["bưởi đường lá cam", "tân triều", "chú ba minh"],
    isDemo: true,
  },
  {
    id: "P04",
    slug: "sau-rieng-ri6-long-khanh",
    name: "Sầu riêng Ri6 Long Khánh",
    category: "Chôm chôm & Sầu riêng",
    ...farmMeta("farm-ba-tu-demo"),
    unitLabel: "kg",
    priceVnd: 85000,
    stockKg: 18,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P04",
    seasonId: "SEASON-02",
    anatomyType: "durian",
    brixNote: "Cơm vàng hạt lép, thu hoạch chín cây tự nhiên",
    shortDescription:
      "Sầu riêng Ri6 trồng tại vườn Ba Tư, cắt già tự nhiên theo nhật ký vườn, không nhúng hóa chất ép chín.",
    storyNote: "Thuộc danh mục 5 sản phẩm chủ lực của Nhà vườn Ba Tư theo mã lô.",
    image: "/images/stitch/stitch-04.jpg",
    gallery: ["/images/stitch/stitch-04.jpg", "/images/stitch/stitch-38.jpg", "/images/stitch/stitch-49.jpg"],
    weightOptions: [
      { label: "2 kg (1 trái nhỏ)", kgMultiplier: 2, priceVnd: 170000 },
      { label: "4 kg (1 trái lớn)", kgMultiplier: 4, priceVnd: 340000 },
    ],
    tags: ["sầu riêng", "ri6", "ba tư", "long khánh"],
    isDemo: true,
  },
  {
    id: "P05",
    slug: "sau-rieng-tuyen-chon-dong-nai",
    name: "Sầu riêng tuyển chọn Ba Tư",
    category: "Chôm chôm & Sầu riêng",
    ...farmMeta("farm-ba-tu-demo"),
    unitLabel: "kg",
    priceVnd: 120000,
    stockKg: 12,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P05",
    seasonId: "SEASON-02",
    anatomyType: "durian",
    shortDescription:
      "Trái tuyển chọn tỉ lệ hộc đều, cơm dày dẻo béo, thu hoạch từ cây lâu năm tại Nhà vườn Ba Tư.",
    storyNote: "Phân loại kỹ bởi chủ vườn, giao kèm tem mã lô NF-DEMO-P05.",
    image: "/images/stitch/stitch-04.jpg",
    gallery: ["/images/stitch/stitch-04.jpg", "/images/stitch/stitch-49.jpg", "/images/stitch/stitch-38.jpg"],
    tags: ["sầu riêng", "tuyển chọn", "ba tư"],
    isDemo: true,
  },
  {
    id: "P02",
    slug: "chom-chom-nhan-hen-mua",
    name: "Chôm chôm nhãn Long Khánh",
    category: "Trái cây tươi",
    ...farmMeta("farm-ba-tu-demo"),
    unitLabel: "kg",
    priceVnd: 45000,
    stockKg: 0,
    seasonStatus: "pre_order",
    batchCode: "NF-DEMO-P02",
    seasonId: "SEASON-02",
    anatomyType: "rambutan",
    shortDescription:
      "Giống chôm chôm nhãn trái nhỏ, hạt tróc ráo nước. Đợt trái hiện tại đang chờ vào độ chín rộ — mở đăng ký theo dõi vụ mùa.",
    storyNote: "Minh họa trạng thái hết tồn sẵn / Hẹn mùa để khách theo dõi đợt cắt kế tiếp.",
    image: "/images/stitch/stitch-40.jpg",
    gallery: ["/images/stitch/stitch-40.jpg", "/images/stitch/stitch-07.jpg"],
    tags: ["chôm chôm nhãn", "hẹn mùa", "ba tư"],
    isDemo: true,
  },
  {
    id: "P03",
    slug: "chom-chom-tuyen-chon-hen-mua",
    name: "Chôm chôm tuyển chọn đóng hộp",
    category: "Trái cây tươi",
    ...farmMeta("farm-ba-tu-demo"),
    unitLabel: "kg",
    priceVnd: 60000,
    stockKg: 0,
    seasonStatus: "pre_order",
    batchCode: "NF-DEMO-P03",
    seasonId: "SEASON-02",
    anatomyType: "rambutan",
    shortDescription:
      "Chùm chôm chôm cắt lựa trái đồng đều dành cho giỏ quà. Hiện tạm hết tồn sẵn tại vườn — bấm Theo dõi vụ mùa.",
    storyNote: "Trạng thái hẹn mùa minh họa giúp khách theo dõi đợt thu hoạch kế tiếp.",
    image: "/images/stitch/stitch-07.jpg",
    gallery: ["/images/stitch/stitch-07.jpg"],
    tags: ["chôm chôm đóng hộp", "hẹn mùa", "ba tư"],
    isDemo: true,
  },
  {
    id: "P08",
    slug: "hat-dieu-rang-muoi-vo-lua-xuan-loc",
    name: "Hạt điều rang muối vỏ lụa Xuân Lộc",
    category: "Hạt điều & Rang củi",
    ...farmMeta("farm-htx-xuan-loc"),
    unitLabel: "hộp 500g",
    priceVnd: 145000,
    stockKg: 35,
    seasonStatus: "in_season",
    batchCode: "NF-XL-2026-03",
    seasonId: "SEASON-04",
    anatomyType: "cashew",
    shortDescription:
      "Hạt điều nhân A+ rang củi truyền thống giữ nguyên vỏ lụa giòn thơm tại HTX Xuân Lộc, đóng hộp hút chân không.",
    storyNote: "Sản phẩm minh họa trong bài học 'Hành trình hạt điều Đồng Nai'.",
    image: "/images/stitch/stitch-05.jpg",
    gallery: ["/images/stitch/stitch-34.jpg", "/images/stitch/stitch-39.jpg", "/images/stitch/stitch-50.jpg"],
    tags: ["hạt điều", "xuân lộc", "rang củi"],
    isDemo: true,
  },
  {
    id: "P09",
    slug: "mat-ong-hoa-nhan-cam-my",
    name: "Mật ong hoa nhãn Xuân Đường",
    category: "Mật ong & Rượu trái cây",
    ...farmMeta("farm-co-tu-cam-my"),
    unitLabel: "chai 500ml",
    priceVnd: 180000,
    stockKg: 19,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P09",
    seasonId: "SEASON-03",
    shortDescription:
      "Mật ong khai thác từ các thùng ong đặt dưới tán vườn nhãn và sầu riêng Xã Xuân Đường, màu vàng hổ phách tự nhiên.",
    storyNote: "Đóng chai thủy tinh sạch, có nhãn ghi rõ ngày quay mật tại vườn Cô Tư.",
    image: "/images/stitch/stitch-06.jpg",
    gallery: ["/images/stitch/stitch-06.jpg"],
    tags: ["mật ong", "hoa nhãn", "cô tư", "xuân đường"],
    isDemo: true,
  },
  {
    id: "P10",
    slug: "ruou-buoi-tan-trieu-chum-sanh",
    name: "Rượu bưởi Tân Triều chum sành",
    enName: "Tan Trieu Craft Pomelo Wine Jar (18+)",
    category: "Mật ong & Rượu trái cây",
    ...farmMeta("farm-ba-minh-tan-trieu"),
    unitLabel: "chum 750ml",
    priceVnd: 165000,
    stockKg: 14,
    adultOnly: true,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P10",
    seasonId: "SEASON-01",
    shortDescription:
      "Đặc sản lên men từ nước ép bưởi đường lá cam Tân Triều đựng trong chum sành mộc thủ công (dành cho người từ 18 tuổi trở lên).",
    enShortDescription:
      "Traditional fermented sweet pomelo craft wine in ceramic jar (18+ only; domestic pickup/verified adult delivery only).",
    storyNote: "Sản phẩm truyền thống làng bưởi Tân Triều, minh họa trong hồ sơ vườn Chú Ba Minh.",
    image: "/images/stitch/stitch-25.jpg",
    gallery: ["/images/stitch/stitch-25.jpg", "/images/stitch/stitch-45.jpg"],
    tags: ["rượu bưởi", "tân triều", "đặc sản"],
    isDemo: true,
  },
  {
    id: "P11",
    slug: "mut-vo-buoi-say-deo-mat-ong",
    name: "Mứt vỏ bưởi sấy dẻo mật ong rừng",
    category: "Nông sản chế biến & Mứt",
    ...farmMeta("farm-ba-minh-tan-trieu"),
    unitLabel: "hũ 200g",
    priceVnd: 90000,
    stockKg: 26,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P11",
    seasonId: "SEASON-01",
    anatomyType: "pomelo",
    shortDescription:
      "Vỏ bưởi Tân Triều sơ chế giảm đắng, sấy dẻo cùng mật ong hoa nhãn, giữ tinh dầu thơm dịu nhẹ.",
    storyNote: "Tận dụng giá trị phụ phẩm vỏ bưởi sạch giúp tăng thêm thu nhập cho hộ vườn.",
    image: "/images/stitch/stitch-48.jpg",
    gallery: ["/images/stitch/stitch-48.jpg"],
    tags: ["mứt vỏ bưởi", "sấy dẻo", "tân triều"],
    isDemo: true,
  },
  {
    id: "P12",
    slug: "ca-phe-rang-moc-dong-nai",
    name: "Cà phê Robusta rang mộc Xuân Lộc",
    category: "Cà phê & Ca cao",
    ...farmMeta("farm-htx-xuan-loc"),
    unitLabel: "túi 500g",
    priceVnd: 120000,
    stockKg: 24,
    seasonStatus: "in_season",
    batchCode: "NF-DEMO-P12",
    seasonId: "SEASON-04",
    shortDescription:
      "Hạt cà phê Robusta vùng đất bazan Đồng Nai thu hái trái chín, rang mộc không tẩm bơ hương liệu.",
    storyNote: "Phù hợp pha phin truyền thống, đóng túi van một chiều có mã QR lô rang.",
    image: "/images/stitch/stitch-08.jpg",
    gallery: ["/images/stitch/stitch-08.jpg"],
    tags: ["cà phê", "robusta", "xuân lộc"],
    isDemo: true,
  },
];

interface ExtraProductSeed {
  slugBase: string;
  name: string;
  enName?: string;
  category: ProductCategory;
  farmId: string;
  unitLabel: string;
  priceVnd: number;
  stockKg: number;
  seasonStatus?: ProductSeasonStatus;
  image: string;
  gallery?: string[];
  anatomyType?: AnatomyKind;
  isRescue?: boolean;
  isNaiBox?: boolean;
  adultOnly?: boolean;
  allergens?: string[];
  preOrderEtaLabel?: string;
  shortDescription: string;
}

const EXTRA_SEEDS: ExtraProductSeed[] = [
  { slugBase: "mang-cut-binh-loc", name: "Măng cụt già cỗi Bình Lộc", category: "Trái cây tươi", farmId: "farm-binh-loc-sau-sang", unitLabel: "kg", priceVnd: 78000, stockKg: 22, image: "/images/stitch/stitch-30.jpg", shortDescription: "Măng cụt thu hái đúng độ tím sậm tại Phường Bình Lộc, ruột trắng ngọt thanh." },
  { slugBase: "chom-chom-thai-binh-loc", name: "Chôm chôm Thái Bình Lộc", category: "Chôm chôm & Sầu riêng", farmId: "farm-binh-loc-sau-sang", unitLabel: "kg", priceVnd: 44000, stockKg: 36, anatomyType: "rambutan", image: "/images/stitch/stitch-07.jpg", shortDescription: "Chùm quả lớn vỏ đỏ vàng, cùi giòn tróc hạt đặc trưng vườn Sáu Sáng." },
  { slugBase: "chom-chom-java-binh-loc", name: "Chôm chôm Java vườn Bình Lộc", category: "Trái cây tươi", farmId: "farm-binh-loc-sau-sang", unitLabel: "kg", priceVnd: 34000, stockKg: 40, anatomyType: "rambutan", image: "/images/stitch/stitch-40.jpg", shortDescription: "Thu hái sáng sớm tại Tổ 7 Bình Lộc, giữ cuống tươi giao nhanh." },
  { slugBase: "bot-ca-cao-bao-vinh", name: "Bột ca cao nguyên chất Bảo Vinh", category: "Cà phê & Ca cao", farmId: "farm-bao-vinh-mit", unitLabel: "hộp 300g", priceVnd: 135000, stockKg: 20, image: "/images/stitch/stitch-08.jpg", shortDescription: "Ủ lên men 6 ngày và rang tách bơ vừa phải, thơm vị sô-cô-la tự nhiên." },
  { slugBase: "mit-to-nu-say-gion", name: "Mít tố nữ sấy giòn Bảo Vinh", category: "Nông sản chế biến & Mứt", farmId: "farm-bao-vinh-mit", unitLabel: "túi 250g", priceVnd: 68000, stockKg: 35, image: "/images/stitch/stitch-14.jpg", shortDescription: "Sấy chân không không đường phụ gia, giữ màu vàng và hương mít đặc trưng." },
  { slugBase: "bo-034-hang-gon", name: "Bơ 034 dẻo sáp Hàng Gòn", category: "Trái cây tươi", farmId: "farm-hang-gon-sau-rieng", unitLabel: "kg", priceVnd: 58000, stockKg: 28, image: "/images/stitch/stitch-16.jpg", shortDescription: "Trái thuôn dài thịt vàng ươm, dẻo béo ít xơ từ vùng đồi bazan Hàng Gòn." },
  { slugBase: "sau-rieng-musang-hang-gon", name: "Sầu riêng Musang King Hàng Gòn", category: "Chôm chôm & Sầu riêng", farmId: "farm-hang-gon-sau-rieng", unitLabel: "kg", priceVnd: 195000, stockKg: 10, anatomyType: "durian", image: "/images/stitch/stitch-38.jpg", shortDescription: "Vườn cây ghép trưởng thành tại Phường Hàng Gòn, múi dẻo đậm vị." },
  { slugBase: "xoai-cat-hoa-loc-tri-an", name: "Xoài cát Hòa Lộc ven hồ Trị An", category: "Trái cây tươi", farmId: "farm-tri-an-xoai", unitLabel: "kg", priceVnd: 64000, stockKg: 45, image: "/images/stitch/stitch-35.jpg", shortDescription: "Bao trái sinh học tại Phường Trị An, chín vàng thơm ngọt tự nhiên." },
  { slugBase: "xoai-say-deo-tri-an", name: "Xoài chín cây sấy dẻo ít đường", category: "Nông sản chế biến & Mứt", farmId: "farm-tri-an-xoai", unitLabel: "túi 300g", priceVnd: 82000, stockKg: 50, image: "/images/stitch/stitch-09.jpg", shortDescription: "Lát xoài cắt dày sấy nhiệt thấp giữ vị chua ngọt cân bằng." },
  { slugBase: "buoi-thanh-tra-tri-an", name: "Bưởi thanh trà ven hồ Trị An", category: "Bưởi & Cây có múi", farmId: "farm-tri-an-xoai", unitLabel: "kg", priceVnd: 48000, stockKg: 25, anatomyType: "pomelo", image: "/images/stitch/stitch-53.jpg", shortDescription: "Tép bưởi giòn thanh dịu nhẹ, phù hợp làm gỏi bưởi hoặc ăn tráng miệng." },
  { slugBase: "nam-moi-den-phu-ly", name: "Nấm mối đen hữu cơ Phú Lý", category: "Rau củ & Nấm sạch", farmId: "farm-phu-ly-nam-rau", unitLabel: "hộp 500g", priceVnd: 160000, stockKg: 14, image: "/images/stitch/stitch-56.jpg", shortDescription: "Nuôi trồng trong nhà lưới khép kín tại Xã Phú Lý, thu hái lúc búp vừa nở." },
  { slugBase: "rau-bep-phu-ly", name: "Rau bép rừng non Phú Lý", category: "Rau củ & Nấm sạch", farmId: "farm-phu-ly-nam-rau", unitLabel: "bó 400g", priceVnd: 32000, stockKg: 24, image: "/images/stitch/stitch-20.jpg", shortDescription: "Ngọn rau non giòn ngọt vị đặc sản vùng đệm rừng Đồng Nai." },
  { slugBase: "mang-le-kho-phu-ly", name: "Măng le phơi nắng Phú Lý", category: "Nông sản chế biến & Mứt", farmId: "farm-phu-ly-nam-rau", unitLabel: "túi 500g", priceVnd: 140000, stockKg: 18, image: "/images/stitch/stitch-36.jpg", shortDescription: "Măng non luộc kỹ và phơi nắng tự nhiên không tẩm chất bảo quản." },
  { slugBase: "buoi-da-xanh-tan-an", name: "Bưởi da xanh hữu cơ Tân An", category: "Bưởi & Cây có múi", farmId: "farm-tan-an-buoi", unitLabel: "kg", priceVnd: 52000, stockKg: 36, anatomyType: "pomelo", image: "/images/stitch/stitch-24.jpg", shortDescription: "Bón phân trùn quế tại Xã Tân An, độ Brix ổn định và tép mọng ráo." },
  { slugBase: "cam-xoan-tan-an", name: "Cam xoàn ngọt Tân An", category: "Bưởi & Cây có múi", farmId: "farm-tan-an-buoi", unitLabel: "kg", priceVnd: 46000, stockKg: 32, image: "/images/stitch/stitch-26.jpg", shortDescription: "Cam vỏ mỏng múi vàng thơm thanh, hái trực tiếp theo đơn hàng ngày." },
  { slugBase: "chanh-khong-hat-tan-an", name: "Chanh không hạt Tân An", category: "Bưởi & Cây có múi", farmId: "farm-tan-an-buoi", unitLabel: "kg", priceVnd: 28000, stockKg: 55, image: "/images/stitch/stitch-28.jpg", shortDescription: "Nhiều nước, hương tinh dầu dễ chịu, phù hợp pha chế và gia đình." },
  { slugBase: "chuoi-laba-say-thanh-son", name: "Chuối Laba sấy dẻo năng lượng mặt trời", category: "Nông sản chế biến & Mứt", farmId: "farm-thanh-son-chuoi", unitLabel: "hộp 400g", priceVnd: 74000, stockKg: 42, image: "/images/stitch/stitch-41.jpg", shortDescription: "Sấy nhà kính tại Xã Thanh Sơn giúp chuối dẻo thơm mật không đường." },
  { slugBase: "oi-ruot-do-thanh-son", name: "Ổi ruột đỏ không hạt Thanh Sơn", category: "Trái cây tươi", farmId: "farm-thanh-son-chuoi", unitLabel: "kg", priceVnd: 32000, stockKg: 48, image: "/images/stitch/stitch-42.jpg", shortDescription: "Giòn ngọt thơm nhẹ, bao xốp chống sâu bệnh từ lúc trái nhỏ." },
  { slugBase: "xoai-tuong-da-xanh-la-nga", name: "Xoài tượng da xanh La Ngà", category: "Trái cây tươi", farmId: "farm-la-nga-xoai", unitLabel: "kg", priceVnd: 38000, stockKg: 50, image: "/images/stitch/stitch-35.jpg", shortDescription: "Trái lớn cơm giòn ráo, ăn sống chấm muối ớt hoặc làm gỏi." },
  { slugBase: "mut-xoai-la-nga", name: "Mứt xoài cuộn bánh tráng La Ngà", category: "Nông sản chế biến & Mứt", farmId: "farm-la-nga-xoai", unitLabel: "hũ 350g", priceVnd: 79000, stockKg: 30, image: "/images/stitch/stitch-52.jpg", shortDescription: "Chế biến thủ công bởi tổ phụ nữ Xã La Ngà, vị chua ngọt dịu." },
  { slugBase: "hat-cacao-nam-cat-tien", name: "Hạt ca cao lên men phơi giàn Nam Cát Tiên", category: "Cà phê & Ca cao", farmId: "farm-nam-cat-tien-cacao", unitLabel: "túi 500g", priceVnd: 155000, stockKg: 26, image: "/images/stitch/stitch-50.jpg", shortDescription: "Canh tác dưới tán rừng Cát Tiên, thích hợp rang xay hoặc làm sô-cô-la." },
  { slugBase: "chocolate-den-70-nam-cat-tien", name: "Sô-cô-la đen 70% Nam Cát Tiên", category: "Cà phê & Ca cao", farmId: "farm-nam-cat-tien-cacao", unitLabel: "thanh 100g", priceVnd: 89000, stockKg: 40, image: "/images/stitch/stitch-08.jpg", shortDescription: "Vị đắng dịu hậu trái cây nhiệt đới, không chất nhũ hóa công nghiệp." },
  { slugBase: "tra-vo-cacao-nam-cat-tien", name: "Trà vỏ hạt ca cao rang thơm", category: "Cà phê & Ca cao", farmId: "farm-nam-cat-tien-cacao", unitLabel: "hộp 200g", priceVnd: 65000, stockKg: 34, image: "/images/stitch/stitch-14.jpg", shortDescription: "Thức uống thảo mộc không caffein, hương sô-cô-la ấm nhẹ." },
  { slugBase: "gao-st25-dak-lua", name: "Gạo thơm ST25 lúa mùa Đak Lua", category: "Nông sản chế biến & Mứt", farmId: "farm-dak-lua-lua-sen", unitLabel: "túi 5 kg", priceVnd: 185000, stockKg: 60, image: "/images/stitch/stitch-22.jpg", shortDescription: "Canh tác vùng phù sa ven sông Đồng Nai tại Xã Đak Lua, cơm dẻo thơm lá dứa." },
  { slugBase: "hat-sen-say-dak-lua", name: "Hạt sen đồng Bàu Sen sấy giòn", category: "Hạt điều & Rang củi", farmId: "farm-dak-lua-lua-sen", unitLabel: "hũ 250g", priceVnd: 92000, stockKg: 28, image: "/images/stitch/stitch-33.jpg", shortDescription: "Sen thu hái tại cánh đồng Đak Lua, tách tim đắng và sấy giòn bùi." },
  { slugBase: "tra-tim-sen-dak-lua", name: "Trà tim sen sao mộc Đak Lua", category: "Mật ong & Rượu trái cây", farmId: "farm-dak-lua-lua-sen", unitLabel: "hũ 150g", priceVnd: 75000, stockKg: 25, image: "/images/stitch/stitch-55.jpg", shortDescription: "Sao khô nhiệt thấp giữ màu xanh tự nhiên, giúp thư giãn giấc ngủ." },
  { slugBase: "nam-bao-ngu-xam-dau-giay", name: "Nấm bào ngư xám Dầu Giây", category: "Rau củ & Nấm sạch", farmId: "farm-dau-giay-nam", unitLabel: "hộp 500g", priceVnd: 45000, stockKg: 40, image: "/images/stitch/stitch-57.jpg", shortDescription: "Thu hoạch mỗi sáng tại Phường Dầu Giây, thịt nấm dai ngọt tự nhiên." },
  { slugBase: "nam-linh-chi-dau-giay", name: "Nấm linh chi đỏ thái lát Dầu Giây", category: "Rau củ & Nấm sạch", farmId: "farm-dau-giay-nam", unitLabel: "hộp 250g", priceVnd: 220000, stockKg: 16, image: "/images/stitch/stitch-59.jpg", shortDescription: "Còn nguyên lớp bào tử nâu đỏ trên mặt nấm, phơi sấy sạch đạt chuẩn." },
  { slugBase: "nam-dui-ga-dau-giay", name: "Nấm đùi gà mini Dầu Giây", category: "Rau củ & Nấm sạch", farmId: "farm-dau-giay-nam", unitLabel: "khay 400g", priceVnd: 52000, stockKg: 30, image: "/images/stitch/stitch-56.jpg", shortDescription: "Thân nấm trắng chắc, phù hợp áp chảo hoặc nấu lẩu chay." },
  { slugBase: "tieu-den-bau-ham", name: "Tiêu đen sọ đỏ Bàu Hàm", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-bau-ham-tieu", unitLabel: "hũ 250g", priceVnd: 95000, stockKg: 45, image: "/images/stitch/stitch-60.jpg", shortDescription: "Hạt tiêu già chín đỏ chọn lọc từ Xã Bàu Hàm, cay thơm bền vị." },
  { slugBase: "tieu-xanh-ngam-giam", name: "Tiêu xanh tươi ngâm giấm gạo", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-bau-ham-tieu", unitLabel: "lọ 300g", priceVnd: 78000, stockKg: 26, image: "/images/stitch/stitch-61.jpg", shortDescription: "Giữ độ giòn thơm của hạt tiêu non, tiện ăn kèm các món kho và nướng." },
  { slugBase: "chuoi-say-me-gung-bau-ham", name: "Chuối sứ sấy mè gừng Bàu Hàm", category: "Nông sản chế biến & Mứt", farmId: "farm-bau-ham-tieu", unitLabel: "túi 300g", priceVnd: 58000, stockKg: 38, image: "/images/stitch/stitch-51.jpg", shortDescription: "Vị gừng ấm kết hợp mè rang vàng giòn và chuối chín mật." },
  { slugBase: "long-nhan-say-xuan-bac", name: "Long nhãn sấy dẻo Xuân Bắc", category: "Nông sản chế biến & Mứt", farmId: "farm-xuan-bac-nhan", unitLabel: "hũ 300g", priceVnd: 115000, stockKg: 32, image: "/images/stitch/stitch-18.jpg", shortDescription: "Cơm nhãn dày tách thủ công tại Xã Xuân Bắc, không tẩm đường." },
  { slugBase: "nhan-tieu-da-bo-xuan-bac", name: "Nhãn tiêu da bò Xuân Bắc", category: "Trái cây tươi", farmId: "farm-xuan-bac-nhan", unitLabel: "kg", priceVnd: 39000, stockKg: 0, seasonStatus: "pre_order", image: "/images/stitch/stitch-48.jpg", shortDescription: "Trái chín mọng cùi giòn ngọt, mở theo dõi vụ thu hoạch cuối tháng." },
  { slugBase: "sau-rieng-dona-cam-my", name: "Sầu riêng Dona cơm vàng Cẩm Mỹ", category: "Chôm chôm & Sầu riêng", farmId: "farm-cam-my-sau-rieng", unitLabel: "kg", priceVnd: 92000, stockKg: 25, anatomyType: "durian", image: "/images/stitch/stitch-49.jpg", shortDescription: "Vườn Xã Cẩm Mỹ thu cắt đủ tuổi trái, cơm dày dẻo ráo không sượng." },
  { slugBase: "sau-rieng-cap-dong-cam-my", name: "Sầu riêng Dona tách múi cấp đông", category: "Chôm chôm & Sầu riêng", farmId: "farm-cam-my-sau-rieng", unitLabel: "hộp 500g", priceVnd: 150000, stockKg: 20, anatomyType: "durian", image: "/images/stitch/stitch-04.jpg", shortDescription: "Tách múi từ trái chín cây ngay trong ngày và cấp đông sâu -18°C." },
  { slugBase: "mit-thai-cam-my", name: "Mít Thái siêu sớm Cẩm Mỹ", category: "Trái cây tươi", farmId: "farm-cam-my-sau-rieng", unitLabel: "kg", priceVnd: 30000, stockKg: 42, image: "/images/stitch/stitch-14.jpg", shortDescription: "Múi dày giòn ngọt, đóng khay tách sẵn hoặc nguyên trái theo yêu cầu." },
  { slugBase: "cai-bo-xoi-tran-bien", name: "Cải bó xôi thủy canh Trấn Biên", category: "Rau củ & Nấm sạch", farmId: "farm-tran-bien-rau", unitLabel: "túi 300g", priceVnd: 26000, stockKg: 50, image: "/images/stitch/stitch-29.jpg", shortDescription: "Trồng nhà màng khép kín tại Phường Trấn Biên, lá xanh non an toàn." },
  { slugBase: "xa-lach-thuy-canh-tran-bien", name: "Xà lách giòn thủy canh Trấn Biên", category: "Rau củ & Nấm sạch", farmId: "farm-tran-bien-rau", unitLabel: "hộp 350g", priceVnd: 29000, stockKg: 44, image: "/images/stitch/stitch-37.jpg", shortDescription: "Còn nguyên rễ giữ tươi, không dư lượng thuốc bảo vệ thực vật." },
  { slugBase: "combo-qua-ocop-dong-nai", name: "Combo Quà OCOP Thanh niên Đồng Nai", category: "Quà tặng OCOP & Combo", farmId: "farm-tran-bien-rau", unitLabel: "hộp quà", priceVnd: 360000, stockKg: 18, image: "/images/stitch/stitch-31.jpg", shortDescription: "Hộp quà phối hợp: Điều rang củi Xuân Lộc + Mứt vỏ bưởi Tân Triều + Cà phê rang mộc." },
  { slugBase: "combo-trai-cay-cuoi-tuan", name: "Giỏ trái cây Miệt vườn cuối tuần", category: "Quà tặng OCOP & Combo", farmId: "farm-tran-bien-rau", unitLabel: "giỏ 4 kg", priceVnd: 245000, stockKg: 15, image: "/images/stitch/stitch-21.jpg", shortDescription: "Gồm Bưởi Tân Triều, Chôm chôm Long Khánh và Xoài Trị An kèm thiệp QR nguồn gốc." },
  { slugBase: "hat-dieu-w240-binh-phuoc", name: "Hạt điều rang muối W240 Bình Phước", category: "Hạt điều & Rang củi", farmId: "farm-binh-phuoc-dieu", unitLabel: "hũ 500g", priceVnd: 165000, stockKg: 48, anatomyType: "cashew", image: "/images/stitch/stitch-34.jpg", shortDescription: "Nhân lớn đồng đều size W240 từ Phường Bình Phước, giòn bùi ít muối." },
  { slugBase: "bo-hat-dieu-nguyen-chat", name: "Bơ hạt điều mịn không đường", category: "Hạt điều & Rang củi", farmId: "farm-binh-phuoc-dieu", unitLabel: "lọ 250g", priceVnd: 125000, stockKg: 30, anatomyType: "cashew", image: "/images/stitch/stitch-39.jpg", shortDescription: "Xay mịn 100% nhân điều rang chậm, phù hợp phết bánh mì và thực đơn ăn lành mạnh." },
  { slugBase: "hat-dieu-toi-ot-binh-phuoc", name: "Hạt điều rang tỏi ớt lá chanh", category: "Hạt điều & Rang củi", farmId: "farm-binh-phuoc-dieu", unitLabel: "hũ 350g", priceVnd: 138000, stockKg: 36, anatomyType: "cashew", image: "/images/stitch/stitch-05.jpg", shortDescription: "Áo lớp tỏi phi giòn rụm và lá chanh thơm dịu không phẩm màu." },
  { slugBase: "tieu-den-dong-xoai", name: "Tiêu đen hạt chắc Đồng Xoài", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-dong-xoai-tieu", unitLabel: "túi 500g", priceVnd: 145000, stockKg: 34, image: "/images/stitch/stitch-62.jpg", shortDescription: "Hạt mẩy nặng cân vùng đất đỏ Phường Đồng Xoài, sàn lọc sạch bụi." },
  { slugBase: "tieu-trang-dong-xoai", name: "Tiêu trắng (tiêu sọ) ngâm nước sạch", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-dong-xoai-tieu", unitLabel: "lọ 200g", priceVnd: 112000, stockKg: 28, image: "/images/stitch/stitch-60.jpg", shortDescription: "Loại bỏ vỏ ngoài bằng quy trình ngâm chảy nước sạch, hương thơm dịu." },
  { slugBase: "mat-ong-rung-dong-xoai", name: "Mật ong hoa rừng tự nhiên Đồng Xoài", category: "Mật ong & Rượu trái cây", farmId: "farm-dong-xoai-tieu", unitLabel: "chai 500ml", priceVnd: 210000, stockKg: 16, image: "/images/stitch/stitch-06.jpg", shortDescription: "Mật thu theo vụ hoa rừng cuối xuân, sánh mịn thơm mùi thảo mộc." },
  { slugBase: "bo-sap-booth7-phuoc-long", name: "Bơ sáp Booth 7 đồi Bà Rá", category: "Trái cây tươi", farmId: "farm-phuoc-long-bo", unitLabel: "kg", priceVnd: 62000, stockKg: 26, image: "/images/stitch/stitch-16.jpg", shortDescription: "Trái tròn vỏ xanh nhám từ Phường Phước Long, thịt bơ dẻo vàng và ít đen đầu." },
  { slugBase: "ca-phe-phoi-tron-phuoc-long", name: "Cà phê Arabica – Robusta Phước Long", category: "Cà phê & Ca cao", farmId: "farm-phuoc-long-bo", unitLabel: "túi 500g", priceVnd: 155000, stockKg: 32, image: "/images/stitch/stitch-63.jpg", shortDescription: "Phối trộn tỉ lệ 7:3 cho hương thơm thanh và hậu vị đậm đà." },
  { slugBase: "chanh-day-tim-phuoc-long", name: "Chanh dây tím sườn đồi Phước Long", category: "Trái cây tươi", farmId: "farm-phuoc-long-bo", unitLabel: "kg", priceVnd: 38000, stockKg: 40, image: "/images/stitch/stitch-10.jpg", shortDescription: "Vỏ tím căng mọng nước thơm nồng, thích hợp pha nước giải khát." },
  { slugBase: "hat-dieu-huu-co-dak-nhau", name: "Hạt điều hữu cơ rang mộc Đak Nhau", category: "Hạt điều & Rang củi", farmId: "farm-dak-nhau-dieu", unitLabel: "hũ 500g", priceVnd: 172000, stockKg: 30, anatomyType: "cashew", image: "/images/stitch/stitch-39.jpg", shortDescription: "Không tẩm muối, giữ trọn vị béo ngậy của hạt điều bazan Xã Đak Nhau." },
  { slugBase: "mac-ca-nut-vo-dak-nhau", name: "Hạt Mắc ca sấy nứt vỏ Đak Nhau", category: "Hạt điều & Rang củi", farmId: "farm-dak-nhau-dieu", unitLabel: "hộp 500g", priceVnd: 185000, stockKg: 24, image: "/images/stitch/stitch-34.jpg", shortDescription: "Hạt tròn cỡ đại nứt vỏ tự nhiên kèm dụng cụ tách vỏ tiện lợi." },
  { slugBase: "hat-dieu-vo-lua-phuoc-son", name: "Hạt điều rang vỏ lụa Xã Phước Sơn", category: "Hạt điều & Rang củi", farmId: "farm-phuoc-son-mat-ong", unitLabel: "hộp 500g", priceVnd: 150000, stockKg: 34, anatomyType: "cashew", image: "/images/stitch/stitch-05.jpg", shortDescription: "Thu hái tại Xã Phước Sơn (kèm hồ sơ minh bạch diện tích hiện hành 386,56 km²)." },
  { slugBase: "mat-ong-hoa-ca-phe-phuoc-son", name: "Mật ong hoa cà phê – điều Phước Sơn", category: "Mật ong & Rượu trái cây", farmId: "farm-phuoc-son-mat-ong", unitLabel: "chai 500ml", priceVnd: 175000, stockKg: 20, image: "/images/stitch/stitch-06.jpg", shortDescription: "Màu vàng sáng mùi dịu nhẹ, quay ly tâm vệ sinh tại tổ hợp tác." },
  { slugBase: "khoai-mon-sap-phuoc-son", name: "Khoai môn sáp bở Phước Sơn", category: "Rau củ & Nấm sạch", farmId: "farm-phuoc-son-mat-ong", unitLabel: "kg", priceVnd: 42000, stockKg: 0, seasonStatus: "out_of_season", image: "/images/stitch/stitch-65.jpg", shortDescription: "Củ lớn bột mịn thơm dẻo. Đợt thu hoạch hiện tại đã kết thúc vụ." },
  { slugBase: "buoi-duong-hong-tan-trieu", name: "Bưởi đường hồng tuyển chọn Tân Triều", category: "Bưởi & Cây có múi", farmId: "farm-ba-minh-tan-trieu", unitLabel: "trái 1,4 kg", priceVnd: 68000, stockKg: 30, anatomyType: "pomelo", image: "/images/stitch/stitch-44.jpg", shortDescription: "Trái chọn đều tay làm quà biếu lễ Tết kèm tem QR lô Tân Triều." },
  { slugBase: "tinh-dau-vo-buoi-tan-trieu", name: "Tinh dầu vỏ bưởi xông phòng Tân Triều", category: "Nông sản chế biến & Mứt", farmId: "farm-ba-minh-tan-trieu", unitLabel: "lọ 30ml", priceVnd: 135000, stockKg: 22, anatomyType: "pomelo", image: "/images/stitch/stitch-45.jpg", shortDescription: "Chưng cất lôi cuốn hơi nước từ vỏ bưởi sạch thu hoạch tại cù lao." },
  { slugBase: "oi-le-suoi-cat-xuan-loc", name: "Ổi lê Suối Cát giòn ngọt Xuân Lộc", category: "Trái cây tươi", farmId: "farm-htx-xuan-loc", unitLabel: "kg", priceVnd: 34000, stockKg: 45, image: "/images/stitch/stitch-42.jpg", shortDescription: "Ổi bọc túi sinh học thu hoạch hàng ngày tại Phường Xuân Lộc." },
  { slugBase: "combo-van-phong-bac-dong-nai", name: "Combo Snack Văn phòng Bắc Đồng Nai", category: "Quà tặng OCOP & Combo", farmId: "farm-binh-phuoc-dieu", unitLabel: "hộp 3 món", priceVnd: 285000, stockKg: 22, anatomyType: "cashew", image: "/images/stitch/stitch-50.jpg", shortDescription: "Gồm Hạt điều W240 + Bơ hạt điều + Hạt mắc ca sấy giòn đóng hộp gọn." },
  { slugBase: "combo-bua-sang-lanh-manh", name: "Combo Cà phê & Sô-cô-la Đồi Bazan", category: "Quà tặng OCOP & Combo", farmId: "farm-nam-cat-tien-cacao", unitLabel: "bộ quà", priceVnd: 240000, stockKg: 18, image: "/images/stitch/stitch-63.jpg", shortDescription: "Kết hợp Cà phê rang mộc + Sô-cô-la 70% Cát Tiên + Trà vỏ ca cao." },
  { slugBase: "combo-gia-vi-vuon-doi", name: "Bộ Gia vị Vườn đồi Đồng Nai", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-bau-ham-tieu", unitLabel: "bộ 3 hũ", priceVnd: 235000, stockKg: 20, image: "/images/stitch/stitch-61.jpg", shortDescription: "Tiêu đen sọ đỏ + Tiêu trắng + Tiêu xanh ngâm giấm gạo tiện dụng." },
  { slugBase: "combo-trai-cay-long-khanh-5kg", name: "Thùng Đặc sản Long Khánh 5kg", category: "Quà tặng OCOP & Combo", farmId: "farm-ba-tu-demo", unitLabel: "thùng 5 kg", priceVnd: 215000, stockKg: 16, anatomyType: "rambutan", image: "/images/stitch/stitch-32.jpg", shortDescription: "Phối hợp Chôm chôm Java Ba Tư và Sầu riêng Ri6 cắt chọn trong ngày." },
  { slugBase: "mat-ong-chanh-day-tri-an", name: "Siro Chanh dây mật ong Trị An", category: "Mật ong & Rượu trái cây", farmId: "farm-tri-an-xoai", unitLabel: "chai 500ml", priceVnd: 125000, stockKg: 24, image: "/images/stitch/stitch-10.jpg", shortDescription: "Cô đặc nhẹ ở nhiệt độ 55°C giữ vitamin C tự nhiên và mật ong." },
  { slugBase: "bot-nghe-den-xuan-duong", name: "Tinh bột nghệ vàng Xã Xuân Đường", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-co-tu-cam-my", unitLabel: "hũ 300g", priceVnd: 140000, stockKg: 20, image: "/images/stitch/stitch-09.jpg", shortDescription: "Trồng xen canh dưới tán vườn sầu riêng, lắng lọc sạch tinh dầu hăng." },
  { slugBase: "gung-se-say-gion-xuan-duong", name: "Gừng sẻ mật ong Xuân Đường", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-co-tu-cam-my", unitLabel: "hũ 250g", priceVnd: 88000, stockKg: 28, image: "/images/stitch/stitch-48.jpg", shortDescription: "Gừng củ nhỏ cay ấm, thái lát mỏng tẩm mật ong hoa nhãn." },
  { slugBase: "mit-nghe-bo-mui-bao-vinh", name: "Mít nghệ bỏ hạt đóng khay Bảo Vinh", category: "Trái cây tươi", farmId: "farm-bao-vinh-mit", unitLabel: "khay 600g", priceVnd: 48000, stockKg: 35, image: "/images/stitch/stitch-14.jpg", shortDescription: "Tách múi bỏ hạt sạch sẽ, đóng hộp mát giao trong ngày." },
  { slugBase: "dau-ca-cao-tuoi-nam-cat-tien", name: "Trái ca cao tươi chín cây Nam Cát Tiên", category: "Trái cây tươi", farmId: "farm-nam-cat-tien-cacao", unitLabel: "kg", priceVnd: 36000, stockKg: 25, image: "/images/stitch/stitch-08.jpg", shortDescription: "Cơm thịt trắng chua ngọt dịu giàu chất chống oxy hóa, thu hái cuối tuần." },
  { slugBase: "tra-la-oi-xuan-loc", name: "Trà búp ổi non rang thơm Xuân Lộc", category: "Nông sản chế biến & Mứt", farmId: "farm-htx-xuan-loc", unitLabel: "hộp 200g", priceVnd: 62000, stockKg: 30, image: "/images/stitch/stitch-55.jpg", shortDescription: "Búp ổi non hái sáng sớm, sao mộc không hương liệu." },
  { slugBase: "nuoc-ep-buoi-len-men-tan-an", name: "Nước bưởi lên men nhẹ Tân An (18+)", category: "Mật ong & Rượu trái cây", farmId: "farm-tan-an-buoi", unitLabel: "chai 500ml", priceVnd: 95000, stockKg: 20, anatomyType: "pomelo", adultOnly: true, image: "/images/stitch/stitch-16.jpg", shortDescription: "Thức uống lên men tự nhiên nồng độ thấp vị thanh mát (chỉ dành cho người lớn từ 18 tuổi)." },
  { slugBase: "chuoi-su-tuoi-thanh-son", name: "Chuối sứ già cây Thanh Sơn", category: "Trái cây tươi", farmId: "farm-thanh-son-chuoi", unitLabel: "nải ~2 kg", priceVnd: 44000, stockKg: 40, image: "/images/stitch/stitch-41.jpg", shortDescription: "Già cây chín tự nhiên không ngâm ủ hóa chất, ngọt dẻo thơm." },
  { slugBase: "xoai-ba-mau-la-nga", name: "Xoài Ba Màu giòn ngọt La Ngà", category: "Trái cây tươi", farmId: "farm-la-nga-xoai", unitLabel: "kg", priceVnd: 42000, stockKg: 45, image: "/images/stitch/stitch-09.jpg", shortDescription: "Vỏ ửng hồng tím nắng đẹp mắt, thịt vàng thơm giòn." },
  { slugBase: "banh-phong-sen-dak-lua", name: "Bánh phồng gạo ST25 hạt sen Đak Lua", category: "Nông sản chế biến & Mứt", farmId: "farm-dak-lua-lua-sen", unitLabel: "gói 300g", priceVnd: 54000, stockKg: 36, image: "/images/stitch/stitch-33.jpg", shortDescription: "Tráng mỏng phơi nắng gió đồng, giòn tan khi chiên hoặc nướng." },
  { slugBase: "bot-nam-bao-ngu-dau-giay", name: "Hạt nêm nấm bào ngư Dầu Giây", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-dau-giay-nam", unitLabel: "hũ 250g", priceVnd: 86000, stockKg: 32, image: "/images/stitch/stitch-57.jpg", shortDescription: "Từ nấm bào ngư xám sấy nghiền mịn kết hợp muối biển và cà rốt." },
  { slugBase: "rau-cang-cua-thuy-canh-tran-bien", name: "Rau càng cua giòn sạch Trấn Biên", category: "Rau củ & Nấm sạch", farmId: "farm-tran-bien-rau", unitLabel: "hộp 250g", priceVnd: 24000, stockKg: 40, image: "/images/stitch/stitch-36.jpg", shortDescription: "Nhặt sạch đóng khay tiện trộn gỏi thịt bò hoặc dầu giấm." },
  { slugBase: "sot-muoi-tieu-chanh-bau-ham", name: "Muối tiêu chanh Đồng Nai hũ nhỏ", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-bau-ham-tieu", unitLabel: "lọ 180g", priceVnd: 49000, stockKg: 48, image: "/images/stitch/stitch-61.jpg", shortDescription: "Rang từ muối hạt tinh, tiêu đen Bàu Hàm và lá chanh vườn." },
  { slugBase: "nhan-say-tui-zip-xuan-bac", name: "Long nhãn ăn liền túi zip Xuân Bắc", category: "Nông sản chế biến & Mứt", farmId: "farm-xuan-bac-nhan", unitLabel: "túi 200g", priceVnd: 76000, stockKg: 29, image: "/images/stitch/stitch-18.jpg", shortDescription: "Tiện bỏ túi hoặc pha trà thảo mộc táo đỏ." },
  { slugBase: "combo-gia-dinh-tan-trieu", name: "Combo Quà Bưởi & Mứt Tân Triều", category: "Quà tặng OCOP & Combo", farmId: "farm-ba-minh-tan-trieu", unitLabel: "hộp 3 món", priceVnd: 265000, stockKg: 20, anatomyType: "pomelo", image: "/images/stitch/stitch-25.jpg", shortDescription: "Gồm 2 kg bưởi da xanh + mứt vỏ bưởi mật ong + tinh dầu vỏ bưởi mini." },
  { slugBase: "combo-an-vat-thanh-nien", name: "Combo Ăn vặt Nông sản Thanh niên", category: "Quà tặng OCOP & Combo", farmId: "farm-tran-bien-rau", unitLabel: "bộ 4 gói", priceVnd: 210000, stockKg: 26, image: "/images/stitch/stitch-52.jpg", shortDescription: "Mít sấy giòn + Chuối Laba sấy + Xoài sấy dẻo + Hạt sen giòn." },
  { slugBase: "ca-phe-hat-arabica-phuoc-long", name: "Cà phê hạt nguyên chất rang vừa Phước Long", category: "Cà phê & Ca cao", farmId: "farm-phuoc-long-bo", unitLabel: "túi 500g", priceVnd: 168000, stockKg: 22, image: "/images/stitch/stitch-63.jpg", shortDescription: "Hạt nguyên cho máy pha espresso hoặc xay tay tại nhà." },
  { slugBase: "hat-dieu-khong-vo-lua-dak-nhau", name: "Hạt điều trắng W320 tách vỏ lụa Đak Nhau", category: "Hạt điều & Rang củi", farmId: "farm-dak-nhau-dieu", unitLabel: "hộp 500g", priceVnd: 162000, stockKg: 35, anatomyType: "cashew", image: "/images/stitch/stitch-34.jpg", shortDescription: "Nhân nguyên tách vỏ lụa sạch, phù hợp nấu sữa hạt hoặc làm bánh." },
  { slugBase: "sua-hat-dieu-rang-binh-phuoc", name: "Bột sữa hạt điều yến mạch Bình Phước", category: "Hạt điều & Rang củi", farmId: "farm-binh-phuoc-dieu", unitLabel: "hũ 400g", priceVnd: 148000, stockKg: 28, anatomyType: "cashew", image: "/images/stitch/stitch-39.jpg", shortDescription: "Xay mịn tiện pha nước ấm buổi sáng, vị béo tự nhiên không đường tinh luyện." },
  { slugBase: "mat-ong-chanh-giam-ngo-cam-my", name: "Mật ong gừng nghệ viên Cẩm Mỹ", category: "Mật ong & Rượu trái cây", farmId: "farm-co-tu-cam-my", unitLabel: "hũ 250g", priceVnd: 135000, stockKg: 24, image: "/images/stitch/stitch-06.jpg", shortDescription: "Tinh bột nghệ kết hợp mật ong hoa nhãn vo viên nhỏ dễ dùng." },
  { slugBase: "muoi-ot-tieu-den-xuan-loc", name: "Muối chấm hoa quả tiêu đen Xuân Lộc", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-htx-xuan-loc", unitLabel: "hũ 220g", priceVnd: 52000, stockKg: 40, image: "/images/stitch/stitch-61.jpg", shortDescription: "Hợp chấm ổi lê, xoài xanh và chôm chôm giòn." },
  { slugBase: "sau-rieng-ri6-binh-loc-cat-giot", name: "Sầu riêng Ri6 cơm ráo Bình Lộc", category: "Chôm chôm & Sầu riêng", farmId: "farm-binh-loc-sau-sang", unitLabel: "kg", priceVnd: 88000, stockKg: 20, anatomyType: "durian", image: "/images/stitch/stitch-49.jpg", shortDescription: "Thu hái tại Phường Bình Lộc, gắn tem QR ngày cắt trái." },
  { slugBase: "combo-bua-trua-rau-nam-dong-nai", name: "Combo Rau sạch & Nấm tươi Đồng Nai", category: "Quà tặng OCOP & Combo", farmId: "farm-dau-giay-nam", unitLabel: "túi 1,5 kg", priceVnd: 118000, stockKg: 30, image: "/images/stitch/stitch-57.jpg", shortDescription: "Gồm Cải bó xôi Trấn Biên + Nấm bào ngư Dầu Giây + Nấm đùi gà mini." },
  { slugBase: "buoi-nam-roi-binh-an-thuy-dien", name: "Bưởi Năm Roi ít hạt Tân An", category: "Bưởi & Cây có múi", farmId: "farm-tan-an-buoi", unitLabel: "kg", priceVnd: 39000, stockKg: 34, anatomyType: "pomelo", image: "/images/stitch/stitch-53.jpg", shortDescription: "Vị chua ngọt cân bằng, dễ bóc múi làm nước ép thanh nhiệt." },
  { slugBase: "chom-chom-nhan-binh-loc", name: "Chôm chôm nhãn chín cây Bình Lộc", category: "Chôm chôm & Sầu riêng", farmId: "farm-binh-loc-sau-sang", unitLabel: "kg", priceVnd: 46000, stockKg: 24, anatomyType: "rambutan", image: "/images/stitch/stitch-40.jpg", shortDescription: "Hạt nhỏ ráo cùi, hái theo đơn đặt trước cuối tuần." },
  { slugBase: "ca-phe-cold-brew-phuoc-long", name: "Cà phê xay sẵn Cold Brew Phước Long", category: "Cà phê & Ca cao", farmId: "farm-phuoc-long-bo", unitLabel: "túi 350g", priceVnd: 132000, stockKg: 28, image: "/images/stitch/stitch-63.jpg", shortDescription: "Xay thô chuẩn ủ lạnh hương cam chanh dịu nhẹ." },
  { slugBase: "hat-dieu-mat-ong-phuoc-son", name: "Hạt điều rang mật ong rừng Phước Sơn", category: "Hạt điều & Rang củi", farmId: "farm-phuoc-son-mat-ong", unitLabel: "hũ 350g", priceVnd: 142000, stockKg: 26, anatomyType: "cashew", image: "/images/stitch/stitch-05.jpg", shortDescription: "Áo lớp mật ong rừng Phước Sơn mỏng giòn bùi." },
  { slugBase: "mut-chom-chom-gion-long-khanh", name: "Chôm chôm sấy giòn Long Khánh", category: "Nông sản chế biến & Mứt", farmId: "farm-ba-tu-demo", unitLabel: "túi 150g", priceVnd: 65000, stockKg: 22, anatomyType: "rambutan", image: "/images/stitch/stitch-32.jpg", shortDescription: "Chế biến từ chôm chôm Java Nhà vườn Ba Tư bảo quản giòn tự nhiên." },
  { slugBase: "combo-cuoi-tuan-cam-my-xuan-loc", name: "Combo Nông sản Vùng Đông Nam", category: "Quà tặng OCOP & Combo", farmId: "farm-cam-my-sau-rieng", unitLabel: "hộp quà", priceVnd: 295000, stockKg: 14, anatomyType: "durian", image: "/images/stitch/stitch-49.jpg", shortDescription: "Kết hợp Mật ong Xuân Đường + Tiêu Bàu Hàm + Sầu riêng cấp đông Cẩm Mỹ." },
  { slugBase: "naibox-95-dac-san-dong-nai", name: "NaiBox 95 · Hộp tuyển chọn đặc sản Đồng Nai", category: "Quà tặng OCOP & Combo", farmId: "farm-ba-minh-tan-trieu", unitLabel: "hộp 6 món", priceVnd: 395000, stockKg: 24, anatomyType: "pomelo", isNaiBox: true, image: "/images/stitch/stitch-31.jpg", shortDescription: "Bộ sưu tập 6 nông sản tiêu biểu kết nối nhiều vùng Đồng Nai, đóng hộp kèm mã QR từng nguồn cung." },
  { slugBase: "nairescue-buoi-tan-trieu-giai-cuu", name: "NaiRescue · Bưởi chín rộ da rám đẹp ruột Tân Triều", category: "Bưởi & Cây có múi", farmId: "farm-ba-minh-tan-trieu", unitLabel: "túi 3 kg", priceVnd: 95000, stockKg: 35, anatomyType: "pomelo", isRescue: true, image: "/images/stitch/stitch-46.jpg", shortDescription: "Trái chín ngọt đồng đều nhưng vỏ có vết rám nắng nhẹ, đủ chuẩn an toàn, giúp nhà vườn tiêu thụ kịp vụ." },
  { slugBase: "nairescue-chom-chom-chin-nhanh-ba-tu", name: "NaiRescue · Chôm chôm chín đỏ thu hái cuối tuần", category: "Chôm chôm & Sầu riêng", farmId: "farm-ba-tu-demo", unitLabel: "sọt 3 kg", priceVnd: 84000, stockKg: 28, anatomyType: "rambutan", isRescue: true, image: "/images/stitch/stitch-32.jpg", shortDescription: "Trái chín đỏ ngọt đậm cần giao nhanh trong ngày quanh Long Khánh và trung tâm Đồng Nai." },
  { slugBase: "xoai-say-deo-thong-nhat", name: "Xoài keo sấy dẻo Suối Tre Thống Nhất", category: "Nông sản chế biến & Mứt", farmId: "farm-thong-nhat-xoai", unitLabel: "túi 300g", priceVnd: 86000, stockKg: 34, image: "/images/stitch/stitch-18.jpg", shortDescription: "Lát xoài cắt dày sấy nhiệt thấp giữ vị chua ngọt tự nhiên tại Xã Thống Nhất." },
  { slugBase: "xoai-cat-hoa-loc-dat-truoc-thong-nhat", name: "Xoài cát Hòa Lộc hái đợt Giáng Sinh (Đặt trước)", category: "Trái cây tươi", farmId: "farm-thong-nhat-xoai", unitLabel: "kg", priceVnd: 68000, stockKg: 0, seasonStatus: "pre_order", preOrderEtaLabel: "Dự kiến thu hoạch 18/12/2026", image: "/images/stitch/stitch-09.jpg", shortDescription: "Đặt trước theo lứa bao trái sinh học — thông báo lịch hái trước 48 giờ." },
  { slugBase: "tra-thao-moc-nhon-trach", name: "Trà lá thảo mộc sao thủ công Nhơn Trạch", category: "Nông sản chế biến & Mứt", farmId: "farm-nhon-trach-tra", unitLabel: "hộp 200g", priceVnd: 92000, stockKg: 32, image: "/images/stitch/stitch-55.jpg", shortDescription: "Thu hái sáng sớm và sao chảo gang truyền thống tại Phường Nhơn Trạch." },
  { slugBase: "dua-mat-nhon-trach", name: "Dứa mật chín ngọt Nhơn Trạch", category: "Trái cây tươi", farmId: "farm-nhon-trach-tra", unitLabel: "trái ~1,2 kg", priceVnd: 28000, stockKg: 44, image: "/images/stitch/stitch-10.jpg", shortDescription: "Mắt dứa nở đều thơm mật, thích hợp ăn tươi hoặc ép nước thanh mát." },
  { slugBase: "mit-say-gion-long-thanh", name: "Mít chín cây sấy giòn không đường Long Thành", category: "Nông sản chế biến & Mứt", farmId: "farm-long-thanh-mit", unitLabel: "túi 250g", priceVnd: 74000, stockKg: 40, image: "/images/stitch/stitch-14.jpg", shortDescription: "Múi mít chín cây sấy giòn rụm giữ màu vàng tự nhiên." },
  { slugBase: "thanh-long-ruot-do-phu-lam", name: "Thanh long ruột đỏ hữu cơ Phú Lâm", category: "Trái cây tươi", farmId: "farm-phu-lam-ong", unitLabel: "kg", priceVnd: 34000, stockKg: 38, image: "/images/stitch/stitch-09.jpg", shortDescription: "Ruột đỏ sẫm ngọt dịu từ Xã Phú Lâm, đóng thùng lót xốp sạch." },
  { slugBase: "mat-ong-hoa-nhan-phu-lam-500ml", name: "Mật ong hoa nhãn khai thác vụ xuân Phú Lâm", category: "Mật ong & Rượu trái cây", farmId: "farm-phu-lam-ong", unitLabel: "chai 500ml", priceVnd: 185000, stockKg: 24, image: "/images/stitch/stitch-06.jpg", shortDescription: "Mật sánh mịn vị thanh thơm hoa nhãn từ đàn ong Xã Phú Lâm." },
  { slugBase: "sau-rieng-monthong-dak-o", name: "Sầu riêng Monthong đồi Bù Gia Đắk Ơ", category: "Chôm chôm & Sầu riêng", farmId: "farm-dak-o-bu-gia", unitLabel: "kg", priceVnd: 98000, stockKg: 26, anatomyType: "durian", image: "/images/stitch/stitch-38.jpg", shortDescription: "Thịt quả dày khô ráo, thu cắt đúng độ tuổi trái tại Xã Đắk Ơ." },
  { slugBase: "tieu-den-dak-o", name: "Tiêu đen phơi giàn Đắk Ơ", category: "Tiêu & Gia vị vùng đồi", farmId: "farm-dak-o-bu-gia", unitLabel: "hũ 400g", priceVnd: 132000, stockKg: 30, image: "/images/stitch/stitch-62.jpg", shortDescription: "Hạt tiêu đều chắc cay nồng, sàng lọc sạch tạp chất tại vùng đồi phía Bắc." },
  { slugBase: "rau-rung-tho-son-theo-mua", name: "Rau rừng tổng hợp theo mùa Thọ Sơn", category: "Rau củ & Nấm sạch", farmId: "farm-tho-son-non", unitLabel: "túi 400g", priceVnd: 35000, stockKg: 22, image: "/images/stitch/stitch-35.jpg", shortDescription: "Rau lá non bản địa thu hái sáng sớm và gói lá chuối giữ ẩm." },
  // --- V4 EXPANSION (+52 SKUs -> 168 total SKUs across 12 categories) ---
  { slugBase: "sa-chanh-huu-co-trang-bom", name: "Sả chanh & Lá dứa tươi hữu cơ Trảng Bom", enName: "Lemongrass & Pandan Leaf Bundle", category: "Thảo mộc & Gia vị hữu cơ mẫu", farmId: "farm-tt-ho-09", unitLabel: "bó 500g", priceVnd: 26000, stockKg: 42, image: "/images/stitch/stitch-29.jpg", shortDescription: "Hái buổi sáng theo lịch vườn không phun thuốc hóa học tổng hợp." },
  { slugBase: "tra-hoa-cuc-mat-ong-tan-trieu", name: "Trà hoa cúc sấy lạnh & Mật nhãn Tân Triều", enName: "Chrysanthemum & Longan Honey Herbal Tea", category: "Thảo mộc & Gia vị hữu cơ mẫu", farmId: "farm-tt-ho-05", unitLabel: "hộp 180g", priceVnd: 112000, stockKg: 28, image: "/images/stitch/stitch-55.jpg", shortDescription: "Thảo mộc dịu nhẹ dùng ấm hoặc lạnh, không phẩm màu." },
  { slugBase: "tia-to-hung-que-nha-mang", name: "Rau gia vị tía tô & Húng quế nhà màng", enName: "Fresh Perilla & Thai Basil Trio", category: "Thảo mộc & Gia vị hữu cơ mẫu", farmId: "farm-tran-bien-rau", unitLabel: "hộp 250g", priceVnd: 28000, stockKg: 35, image: "/images/stitch/stitch-37.jpg", shortDescription: "Cắt gốc giữ ẩm giao nhanh nội tỉnh Đồng Nai trong ngày." },
  { slugBase: "bo-qua-du-lich-vuon-ba-tu", name: "Hộp quà Du lịch Vườn Ba Tư (Chôm chôm + Mứt)", enName: "Ba Tu Orchard Tour Gift Set", category: "Đặc sản du lịch & Hộp quà", farmId: "farm-ba-tu-demo", unitLabel: "hộp 2 kg", priceVnd: 145000, stockKg: 24, anatomyType: "rambutan", image: "/images/stitch/stitch-31.jpg", shortDescription: "Thiết kế gọn có quai xách cho khách tham quan cuối tuần và gia đình." },
  { slugBase: "tui-luu-niem-buoi-tan-trieu", name: "Bộ quà Du lịch Làng bưởi Tân Triều (3 món)", enName: "Tan Trieu Village Tour Souvenir Pack", category: "Đặc sản du lịch & Hộp quà", farmId: "farm-ba-minh-tan-trieu", unitLabel: "túi quà", priceVnd: 198000, stockKg: 30, anatomyType: "pomelo", image: "/images/stitch/stitch-25.jpg", shortDescription: "Gồm Bưởi tươi 1,5 kg, Mứt vỏ bưởi hũ nhỏ và Sổ tay câu chuyện cù lao song ngữ." },
  { slugBase: "hop-qua-cuoi-nam-xuan-loc", name: "Hộp Quà Cuối năm Hạt điều – Cà phê – Ca cao", enName: "Year-End Dong Nai Cashew & Coffee Keepsake Box", category: "Đặc sản du lịch & Hộp quà", farmId: "farm-htx-xuan-loc", unitLabel: "hộp 3 món", priceVnd: 325000, stockKg: 26, anatomyType: "cashew", allergens: ["Hạt điều (Tree nuts)"], image: "/images/stitch/stitch-50.jpg", shortDescription: "Thích hợp làm quà lưu niệm cho khách du lịch và đoàn trường học, gắn mã QR từng xưởng." },
  ...Array.from({ length: 46 }, (_, vIdx) => {
    const htxFarms = [
      "farm-tt-ho-01",
      "farm-tt-ho-02",
      "farm-tt-ho-03",
      "farm-tt-ho-04",
      "farm-tt-ho-05",
      "farm-tt-ho-06",
      "farm-tt-ho-07",
      "farm-tt-ho-08",
      "farm-tt-ho-09",
      "farm-tt-ho-10",
      "farm-ba-tu-demo",
      "farm-dak-nhau-dieu",
      "farm-phuoc-long-bo",
      "farm-dau-giay-nam",
      "farm-tri-an-xoai",
    ];
    const cats: ProductCategory[] = [
      "Bưởi & Cây có múi",
      "Chôm chôm & Sầu riêng",
      "Hạt điều & Rang củi",
      "Cà phê & Ca cao",
      "Nông sản chế biến & Mứt",
      "Thảo mộc & Gia vị hữu cơ mẫu",
      "Đặc sản du lịch & Hộp quà",
      "Quà tặng OCOP & Combo",
    ];
    const imgs = [
      "/images/stitch/stitch-24.jpg",
      "/images/stitch/stitch-07.jpg",
      "/images/stitch/stitch-34.jpg",
      "/images/stitch/stitch-08.jpg",
      "/images/stitch/stitch-18.jpg",
      "/images/stitch/stitch-29.jpg",
      "/images/stitch/stitch-25.jpg",
      "/images/stitch/stitch-31.jpg",
    ];
    const fId = htxFarms[vIdx % htxFarms.length];
    const cat = cats[vIdx % cats.length];
    const numLabel = String(vIdx + 1).padStart(2, "0");
    const isPreorder = vIdx % 9 === 0;
    const isRescue = !isPreorder && vIdx % 11 === 0;
    const isNaiBox = !isPreorder && vIdx % 13 === 0;
    const hasNuts = cat === "Hạt điều & Rang củi";
    return {
      slugBase: `dac-san-dong-nai-v4-${numLabel}`,
      name:
        cat === "Bưởi & Cây có múi"
          ? `Bưởi da xanh tuyển lứa ${numLabel} Tân Triều`
          : cat === "Hạt điều & Rang củi"
          ? `Hạt điều rang mộc lô ${numLabel} Đồng Nai`
          : cat === "Đặc sản du lịch & Hộp quà"
          ? `Túi quà trải nghiệm Đồng Nai #${numLabel}`
          : cat === "Thảo mộc & Gia vị hữu cơ mẫu"
          ? `Thảo mộc & Gia vị vườn đồi #${numLabel}`
          : `Nông sản mùa vụ Đồng Nai #${numLabel}`,
      enName:
        cat === "Bưởi & Cây có múi"
          ? `Tan Trieu Green-Skin Pomelo Lot #${numLabel}`
          : cat === "Hạt điều & Rang củi"
          ? `Dong Nai Wood-Roasted Cashews #${numLabel}`
          : cat === "Đặc sản du lịch & Hộp quà"
          ? `Dong Nai Orchard Tour Keepsake #${numLabel}`
          : `Dong Nai Seasonal Produce Lot #${numLabel}`,
      category: cat,
      farmId: fId,
      unitLabel: cat === "Bưởi & Cây có múi" ? "kg" : cat === "Đặc sản du lịch & Hộp quà" ? "hộp quà" : "hộp 400g",
      priceVnd: 45000 + (vIdx % 8) * 18000,
      stockKg: isPreorder ? 0 : 22 + (vIdx % 25),
      seasonStatus: isPreorder ? ("pre_order" as const) : ("in_season" as const),
      isRescue,
      isNaiBox,
      allergens: hasNuts ? ["Hạt điều (Tree nuts)"] : undefined,
      preOrderEtaLabel: isPreorder ? "Dự kiến thu hoạch 12/12/2026" : undefined,
      image: imgs[vIdx % imgs.length],
      anatomyType:
        cat === "Bưởi & Cây có múi"
          ? ("pomelo" as const)
          : cat === "Hạt điều & Rang củi"
          ? ("cashew" as const)
          : cat === "Chôm chôm & Sầu riêng"
          ? ("durian" as const)
          : undefined,
      shortDescription:
        "Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.",
    };
  }),
];

const EXTRA_PRODUCTS: Product[] = EXTRA_SEEDS.map((seed, idx) => {
  const numeric = idx + 13;
  const codeNumber = String(numeric).padStart(3, "0");
  const batchCode = `NF-DN-${codeNumber}`;
  const farmIndex = INITIAL_FARMS.findIndex((f) => f.id === seed.farmId);
  const seasonNum = farmIndex >= 0 ? String((farmIndex % 30) + 1).padStart(2, "0") : "01";

  return {
    id: `P${numeric}`,
    skuCode: `NF-SKU-${codeNumber}`,
    slug: seed.slugBase,
    name: seed.name,
    enName: seed.enName,
    category: seed.category,
    ...farmMeta(seed.farmId),
    unitLabel: seed.unitLabel,
    priceVnd: seed.priceVnd,
    costVnd: Math.round((seed.priceVnd * 0.66) / 500) * 500,
    stockKg: seed.stockKg,
    seasonStatus: seed.seasonStatus ?? "in_season",
    batchCode,
    seasonId: `SEASON-${seasonNum}`,
    anatomyType: seed.anatomyType,
    isNaiBox: seed.isNaiBox,
    isRescue: seed.isRescue,
    adultOnly: seed.adultOnly,
    allergens: seed.allergens,
    preOrderEtaLabel: seed.preOrderEtaLabel,
    expiryDays: seed.category === "Trái cây tươi" || seed.category === "Rau củ & Nấm sạch" ? 5 : 180,
    storageNote:
      seed.category === "Trái cây tươi" || seed.category === "Rau củ & Nấm sạch"
        ? "Bảo quản ngăn mát 8–14°C, dùng ngon nhất trong 3–5 ngày."
        : "Đậy kín nắp sau khi mở, để nơi khô ráo thoáng mát.",
    shortDescription: seed.shortDescription,
    storyNote: `Sản phẩm thuộc lô ${batchCode} đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.`,
    image: seed.image,
    gallery: seed.gallery ?? [seed.image],
    tags: [
      seed.name.toLowerCase(),
      seed.category.toLowerCase(),
      farmMeta(seed.farmId).administrativeUnitName.toLowerCase(),
      batchCode.toLowerCase(),
      ...(seed.isNaiBox ? ["naibox", "naibox 95"] : []),
      ...(seed.isRescue ? ["nairescue", "giai cuu nong san"] : []),
    ],
    sourceKind: "synthetic",
    isDemo: true,
  };
});

export const INITIAL_PRODUCTS: Product[] = [
  ...GOLDEN_AND_CORE_PRODUCTS.map((p, idx) => ({
    ...p,
    skuCode: p.skuCode ?? `NF-SKU-${String(idx + 1).padStart(3, "0")}`,
    costVnd: p.costVnd ?? Math.round((p.priceVnd * 0.65) / 500) * 500,
    expiryDays: p.category === "Trái cây tươi" ? 5 : 90,
    storageNote:
      p.category === "Trái cây tươi" || p.category === "Chôm chôm & Sầu riêng"
        ? "Bảo quản thoáng mát, dùng trong 3–5 ngày sau thu hoạch."
        : "Bảo quản nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp.",
    sourceKind: "synthetic" as const,
  })),
  ...EXTRA_PRODUCTS,
];
