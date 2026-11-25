import type { CredentialLifecycleStatus, CredentialRecord, CredentialType } from "@/types/naifarm";

export const QUALITY_SOURCE_REGISTRY: Record<string, { label: string; url: string; note: string }> = {
  S01: {
    label: "UBND Đồng Nai · Công bố QĐ 125/QĐ-UBND (14/01/2026)",
    url: "https://dongnai.gov.vn/vi/wcag/Tin-chi-dao-dieu-hanh/quyet-dinh-ve-viec-phe-duyet-ket-qua-danh-gia-cham-diem-phan-hang-va-cap-giay-chung-nhan-san-pham-tham-gia-chuong-trinh-moi-xa-mot-san-pham-tinh-dong-nai-dot-2-nam-2025-11444.html",
    note: "Thời hạn công nhận 36 tháng theo quyết định.",
  },
  S02: {
    label: "Phụ lục gốc QĐ 125/QĐ-UBND (PDF 2 trang)",
    url: "https://dongnai.gov.vn/uploads/binhphuoc/news/2026_01/09pl-kemtheo-125qd-ubnd.pdf",
    note: "Đối chiếu trực quan phụ lục 28 dòng, 11 chủ thể.",
  },
  S03: {
    label: "Chính phủ · Danh sách sản phẩm OCOP 5 sao (đến 31/12/2025)",
    url: "https://xaydungchinhsach.chinhphu.vn/danh-sach-san-pham-ocop-5-sao-119260408171050959.htm",
    note: "Danh mục công bố đến mốc 31/12/2025.",
  },
  S04: {
    label: "Bộ KH&CN · Vùng sầu riêng Đắk Ơ (09/2026)",
    url: "https://mst.gov.vn/dong-nai-chuan-hoa-vung-sau-rieng-dak-o-bang-khoa-hoc-va-cong-nghe-197260909120908635.htm",
    note: "Thông tin hỗ trợ & chứng nhận VietGAP cho 180 ha Đắk Ơ.",
  },
  S05: {
    label: "Cổng TTĐT Cẩm Mỹ · THT Sầu riêng Tân Hòa (22/09/2026)",
    url: "https://cammy.dongnai.gov.vn/vi/news/nong-thon-moi-nong-nghiep/to-hop-tac-trong-trot-cay-sau-rieng-tan-hoa-xa-cam-my-duoc-danh-gia-dat-chuan-vietgap-658.html",
    note: "Thông tin đánh giá đạt chuẩn, cần đối chiếu giấy chính thức.",
  },
  S06: {
    label: "Nông lâm Bình Phước · Hồ sơ Sầu riêng Thuận Phát",
    url: "https://nonglambinhphuoc.com/2025/03/31/nguon-goc-sp-sau-rieng-thuan-phat/",
    note: "Trang công bố truy xuất cần kiểm tra hạn hiệu lực.",
  },
  S07: {
    label: "Viện Nghiên cứu & Tổ chức chứng nhận NRI (gồm hủy QĐ)",
    url: "https://nri.gov.vn/cac-co-so-duoc-cap-chung-nhan.html",
    note: "Danh sách cơ sở cấp/hủy VietGAP (case THT Suối Gấm).",
  },
  S08: {
    label: "Chỉ đạo Chính phủ về Mã số vùng trồng & đóng gói (31/07/2026)",
    url: "https://cms.baochinhphu.vn/chi-dao-dieu-hanh-cua-chinh-phu-thu-tuong-chinh-phu-ngay-31-7-2026-102260731210129716.htm",
    note: "Bản tin chỉ đạo; tra cổng Bộ NN&MT khi phát hành.",
  },
  S09: {
    label: "Cục Sở hữu trí tuệ · Bảo hộ Chỉ dẫn địa lý",
    url: "https://ipvietnam.gov.vn/",
    note: "QĐ 673/QĐ-SHTT ngày 13/03/2018 · ĐK 0066 Hạt điều Bình Phước.",
  },
  S10: {
    label: "Khung truy xuất GS1 EPCIS & Cổng truy xuất nguồn gốc",
    url: "https://www.gs1.org/standards/epcis",
    note: "Tham khảo mô hình sự kiện truy xuất; không tuyên bố kết nối GS1 quốc gia.",
  },
  S11: {
    label: "GLOBALG.A.P. Supply Chain Portal",
    url: "https://globalgap.org/supply-chain-portal/",
    note: "Tra cứu chính thức theo Unique ID.",
  },
  S12: {
    label: "Quyết định 26/2026/QĐ-TTg · Quy trình phân hạng OCOP mới",
    url: "https://xaydungchinhsach.chinhphu.vn/quyet-dinh-so-26-2026-qd-ttg-bo-tieu-chi-va-quy-trinh-danh-gia-phan-hang-san-pham-ocop-119260529164111182.htm",
    note: "Cập nhật quy trình đánh giá năm 2026.",
  },
  S13: {
    label: "JGAP / ASIAGAP Certified Farms",
    url: "https://jgap.jp/en/farm/",
    note: "Cơ sở dữ liệu trang trại được chứng nhận.",
  },
  S14: {
    label: "FSSC 22000 Public Register",
    url: "https://www.fssc.com/public-register/",
    note: "Tra cứu công khai nhà máy chế biến thực phẩm.",
  },
  S15: {
    label: "IAF CertSearch Global Database",
    url: "https://www.iafcertsearch.org/",
    note: "Kiểm tra chứng nhận hệ thống ISO 22000 / ISO 9001.",
  },
  S16: {
    label: "USDA Organic Integrity Database",
    url: "https://www.ams.usda.gov/services/organic-certification/farms-operations",
    note: "Tra cứu nhà sản xuất đạt chứng nhận USDA Organic.",
  },
  S17: {
    label: "EU TRACES NT Modules",
    url: "https://food.ec.europa.eu/horizontal-topics/traces/modules_en",
    note: "Tra cứu hồ sơ chứng nhận hữu cơ châu Âu.",
  },
  S18: {
    label: "MAFF JAS Organic Japan",
    url: "https://www.maff.go.jp/e/policies/standard/specific/organic_JAS.html",
    note: "Thông tin tiêu chuẩn nông nghiệp hữu cơ Nhật Bản.",
  },
  S19: {
    label: "Rainforest Alliance Certificate Holders",
    url: "https://knowledge.rainforest-alliance.org/docs/list-of-certificate-holders",
    note: "Danh sách chủ thể được chứng nhận bền vững.",
  },
  S20: {
    label: "Fairtrade International Finder",
    url: "https://www.fairtrade.net/",
    note: "Tra cứu đơn vị chứng nhận thương mại công bằng.",
  },
  S21: {
    label: "4C Services Active Certificates",
    url: "https://portal.4c-services.org/cert/certificates",
    note: "Danh sách chứng nhận chuỗi cung ứng cà phê bền vững.",
  },
  S22: {
    label: "ASC Find a Farm (Aquaculture)",
    url: "https://asc-aqua.org/find-a-farm/",
    note: "Chỉ áp dụng cho ngành thủy sản nuôi trồng.",
  },
  S23: {
    label: "Best Aquaculture Practices (BAP) Directory",
    url: "https://www.bapcertification.org/",
    note: "Chỉ áp dụng cho chuỗi nuôi trồng và chế biến thủy sản.",
  },
};

export const CREDENTIAL_TYPES: CredentialType[] = [
  {
    id: "Q01",
    displayName: "OCOP 3 sao",
    kind: "rating",
    eligibleCategories: ["*"],
    scopeTypes: ["product"],
    requiredEvidence: ["Số quyết định UBND", "Phụ lục tên sản phẩm và chủ thể", "Ngày công bố & thời hạn 36 tháng"],
    verificationSources: ["S01", "S02", "S12"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S01.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Xếp hạng đánh giá sản phẩm theo Chương trình Mỗi xã một sản phẩm cấp tỉnh/thành phố (3 sao).",
  },
  {
    id: "Q02",
    displayName: "OCOP 4 sao",
    kind: "rating",
    eligibleCategories: ["*"],
    scopeTypes: ["product"],
    requiredEvidence: ["Quyết định phê duyệt kết quả chấm điểm", "Phụ lục định danh từng SKU"],
    verificationSources: ["S01", "S02", "S12"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S02.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Xếp hạng OCOP 4 sao gắn với từng sản phẩm cụ thể, hiệu lực 36 tháng theo quyết định.",
  },
  {
    id: "Q03",
    displayName: "OCOP 5 sao",
    kind: "rating",
    eligibleCategories: ["*"],
    scopeTypes: ["product"],
    requiredEvidence: ["Quyết định cấp Quốc gia (Bộ NN&MT / Chính phủ)", "Đối chiếu tình trạng công nhận lại"],
    verificationSources: ["S03", "S12"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S03.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Xếp hạng sản phẩm OCOP 5 sao cấp Quốc gia theo từng quyết định công bố.",
  },
  {
    id: "Q04",
    displayName: "Mã số vùng trồng",
    kind: "identifier",
    eligibleCategories: ["Trái cây tươi", "Bưởi & Cây có múi", "Chôm chôm & Sầu riêng", "Rau củ & Nấm sạch", "Hạt điều & Rang củi", "Cà phê & Ca cao"],
    scopeTypes: ["site"],
    requiredEvidence: ["Mã vùng trồng chính thức", "Loại cây trồng & diện tích", "Xác nhận cơ quan chuyên môn"],
    verificationSources: ["S08"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S08.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Mã định danh vùng sản xuất nông nghiệp theo địa bàn và nhóm cây trồng (không phải giấy chứng nhận).",
  },
  {
    id: "Q05",
    displayName: "Mã số cơ sở đóng gói",
    kind: "identifier",
    eligibleCategories: ["*"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Mã cơ sở đóng gói", "Địa điểm xưởng đóng gói", "Phạm vi loại trái cây/nông sản"],
    verificationSources: ["S08"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S08.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Mã định danh cơ sở sơ chế và đóng gói phục vụ truy xuất nguồn gốc lô hàng.",
  },
  {
    id: "Q06",
    displayName: "Chỉ dẫn địa lý (GI)",
    kind: "gi",
    eligibleCategories: ["Hạt điều & Rang củi", "Bưởi & Cây có múi", "Trái cây tươi", "Tiêu & Gia vị vùng đồi"],
    scopeTypes: ["territory", "product"],
    requiredEvidence: ["Văn bằng / QĐ bảo hộ SHTT", "Bản đồ vùng chỉ dẫn", "Văn bản trao quyền sử dụng hợp lệ cho chủ thể"],
    verificationSources: ["S09"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S09.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Bảo hộ tên địa lý sản phẩm đặc thù; chỉ chủ thể được cấp quyền sử dụng riêng mới được gắn nhãn.",
  },
  {
    id: "Q07",
    displayName: "QR truy xuất nguồn gốc",
    kind: "trace_mechanism",
    eligibleCategories: ["*"],
    scopeTypes: ["lot"],
    requiredEvidence: ["Mã lô duy nhất", "Liên kết nhật ký mùa vụ / thu hoạch", "URL hộ chiếu hợp lệ"],
    verificationSources: ["S10"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S10.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Cơ chế mã định danh dẫn tới nhật ký lô hàng (lưu ý: QR chỉ là công cụ truy xuất, không tự chứng minh chất lượng).",
  },
  {
    id: "Q08",
    displayName: "Giấy chứng nhận cơ sở đủ điều kiện ATTP",
    kind: "legal_facility",
    eligibleCategories: ["Nông sản chế biến & Mứt", "Hạt điều & Rang củi", "Cà phê & Ca cao", "Mật ong & Rượu trái cây", "Quà tặng OCOP & Combo"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Số giấy chứng nhận ATTP", "Cơ quan cấp theo ngành", "Thời hạn hiệu lực hoặc căn cứ diện miễn"],
    verificationSources: ["S01"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S01.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận điều kiện an toàn thực phẩm theo cơ sở chế biến; cần kiểm tra trường hợp hộ sản xuất nhỏ được miễn hoặc cấp cam kết.",
  },
  {
    id: "Q09",
    displayName: "HACCP",
    kind: "food_safety_system",
    eligibleCategories: ["Nông sản chế biến & Mứt", "Hạt điều & Rang củi", "Cà phê & Ca cao", "Mật ong & Rượu trái cây", "Quà tặng OCOP & Combo"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Số chứng chỉ HACCP", "Phạm vi dây chuyền chế biến", "Tổ chức chứng nhận & ngày hết hạn"],
    verificationSources: ["S15"],
    sourceUrlPrimary: "https://www.fao.org/fao-who-codexalimentarius/",
    logoPolicy: "neutral_text_chip_only",
    summary: "Hệ thống phân tích mối nguy và kiểm soát điểm tới hạn tại cơ sở sơ chế, sấy và đóng gói.",
  },
  {
    id: "Q10",
    displayName: "ISO 22000",
    kind: "food_safety_system",
    eligibleCategories: ["Nông sản chế biến & Mứt", "Hạt điều & Rang củi", "Cà phê & Ca cao", "Mật ong & Rượu trái cây"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Mã chứng nhận trên IAF CertSearch hoặc tổ chức cấp", "Phạm vi ngành hàng", "Ngày hết hạn"],
    verificationSources: ["S15"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S15.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Tiêu chuẩn quốc tế về hệ thống quản lý an toàn thực phẩm cho cơ sở chế biến.",
  },
  {
    id: "Q11",
    displayName: "ISO 9001",
    kind: "qms",
    eligibleCategories: ["*"],
    scopeTypes: ["facility", "operator"],
    requiredEvidence: ["Chứng chỉ ISO 9001 còn hạn", "Phạm vi hoạt động quản lý"],
    verificationSources: ["S15"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S15.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Hệ thống quản lý chất lượng quy trình vận hành (lưu ý: không thay thế chứng nhận an toàn thực phẩm hay hữu cơ).",
  },
  {
    id: "Q12",
    displayName: "FSSC 22000",
    kind: "food_safety_system",
    eligibleCategories: ["Hạt điều & Rang củi", "Nông sản chế biến & Mứt", "Cà phê & Ca cao"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Bản ghi công khai trên FSSC Public Register", "Địa chỉ nhà máy & phạm vi chế biến"],
    verificationSources: ["S14"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S14.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chương trình chứng nhận hệ thống an toàn thực phẩm FSSC 22000 cấp nhà máy.",
  },
  {
    id: "Q13",
    displayName: "GMP",
    kind: "food_safety_system",
    eligibleCategories: ["Nông sản chế biến & Mứt", "Mật ong & Rượu trái cây", "Tiêu & Gia vị vùng đồi", "Hạt điều & Rang củi"],
    scopeTypes: ["facility"],
    requiredEvidence: ["Chứng nhận Thực hành sản xuất tốt (GMP)", "Phạm vi phân xưởng", "Tổ chức cấp & thời hạn"],
    verificationSources: ["S15"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S15.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Thực hành sản xuất tốt áp dụng cho cơ sở chế biến nông sản, mật ong, gia vị.",
  },
  {
    id: "Q14",
    displayName: "ASIAGAP",
    kind: "gap",
    eligibleCategories: ["Trái cây tươi", "Bưởi & Cây có múi", "Chôm chôm & Sầu riêng", "Rau củ & Nấm sạch"],
    scopeTypes: ["site"],
    requiredEvidence: ["Số đăng ký JGAP/ASIAGAP", "Diện tích vùng trồng & loại nông sản"],
    verificationSources: ["S13"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S13.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Thực hành nông nghiệp tốt châu Á cho vùng trồng rau và trái cây.",
  },
  {
    id: "Q15",
    displayName: "VietGAP",
    kind: "gap",
    eligibleCategories: ["Trái cây tươi", "Bưởi & Cây có múi", "Chôm chôm & Sầu riêng", "Rau củ & Nấm sạch", "Tiêu & Gia vị vùng đồi"],
    scopeTypes: ["site", "product"],
    requiredEvidence: ["Số giấy chứng nhận VietGAP", "Tổ chức chứng nhận hợp pháp (kiểm tra danh sách NRI/thu hồi)", "Diện tích, sản lượng & ngày hết hạn"],
    verificationSources: ["S04", "S05", "S06", "S07"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S07.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Thực hành sản xuất nông nghiệp tốt tại Việt Nam, gắn chặt phạm vi thửa đất, cây trồng và thời hạn hiệu lực.",
  },
  {
    id: "Q16",
    displayName: "GLOBALG.A.P.",
    kind: "gap",
    eligibleCategories: ["Trái cây tươi", "Bưởi & Cây có múi", "Chôm chôm & Sầu riêng", "Rau củ & Nấm sạch"],
    scopeTypes: ["site"],
    requiredEvidence: ["GGN / Unique ID trên GLOBALG.A.P. Supply Chain Portal", "Phạm vi trái cây & ngày hết hạn"],
    verificationSources: ["S11"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S11.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Tiêu chuẩn thực hành nông nghiệp tốt toàn cầu dùng cho trái cây tươi xuất khẩu.",
  },
  {
    id: "Q17",
    displayName: "ASEAN GAP",
    kind: "gap",
    eligibleCategories: ["Trái cây tươi", "Bưởi & Cây có múi", "Chôm chôm & Sầu riêng", "Rau củ & Nấm sạch"],
    scopeTypes: ["site"],
    requiredEvidence: ["Hồ sơ chương trình GAP quốc gia phù hợp khung ASEAN", "Phạm vi vườn trồng & thời hạn"],
    verificationSources: ["S07"],
    sourceUrlPrimary: "https://asean.org/",
    logoPolicy: "neutral_text_chip_only",
    summary: "Khung hài hòa thực hành nông nghiệp tốt ASEAN (đối chiếu qua cơ quan cấp quốc gia vì không có một sổ cái chung duy nhất).",
  },
  {
    id: "Q18",
    displayName: "Vietnam Organic",
    kind: "organic",
    eligibleCategories: ["Rau củ & Nấm sạch", "Hạt điều & Rang củi", "Trái cây tươi", "Tiêu & Gia vị vùng đồi", "Cà phê & Ca cao"],
    scopeTypes: ["site", "product"],
    requiredEvidence: ["Chứng nhận phù hợp TCVN về nông nghiệp hữu cơ", "Tổ chức chứng nhận được chỉ định", "Thời hạn hiệu lực"],
    verificationSources: ["S07"],
    sourceUrlPrimary: "https://www.tcvn.gov.vn/",
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận nông nghiệp hữu cơ theo tiêu chuẩn Việt Nam (không suy ra từ chữ 'hữu cơ' trong tên thương hiệu).",
  },
  {
    id: "Q19",
    displayName: "USDA Organic",
    kind: "organic",
    eligibleCategories: ["Hạt điều & Rang củi", "Cà phê & Ca cao", "Tiêu & Gia vị vùng đồi", "Nông sản chế biến & Mứt"],
    scopeTypes: ["operator", "product"],
    requiredEvidence: ["Bản ghi trên USDA Organic Integrity Database", "Operation ID, phạm vi sản phẩm & ngày hiệu lực"],
    verificationSources: ["S16"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S16.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận hữu cơ theo tiêu chuẩn Bộ Nông nghiệp Hoa Kỳ (NOP).",
  },
  {
    id: "Q20",
    displayName: "EU Organic",
    kind: "organic",
    eligibleCategories: ["Cà phê & Ca cao", "Hạt điều & Rang củi", "Tiêu & Gia vị vùng đồi", "Nông sản chế biến & Mứt"],
    scopeTypes: ["operator", "product"],
    requiredEvidence: ["Mã đơn vị kiểm soát & bản ghi trên EU TRACES", "Phạm vi sản phẩm hữu cơ"],
    verificationSources: ["S17"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S17.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận nông nghiệp hữu cơ theo quy định Liên minh Châu Âu.",
  },
  {
    id: "Q21",
    displayName: "JAS Organic",
    kind: "organic",
    eligibleCategories: ["Cà phê & Ca cao", "Nông sản chế biến & Mứt", "Rau củ & Nấm sạch"],
    scopeTypes: ["operator", "product"],
    requiredEvidence: ["Tổ chức chứng nhận JAS hợp lệ (MAFF)", "Phạm vi sản phẩm trà/cà phê/nông sản"],
    verificationSources: ["S18"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S18.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận nông nghiệp hữu cơ tiêu chuẩn Nhật Bản (JAS).",
  },
  {
    id: "Q22",
    displayName: "Rainforest Alliance",
    kind: "sustainability",
    eligibleCategories: ["Cà phê & Ca cao", "Hạt điều & Rang củi", "Tiêu & Gia vị vùng đồi"],
    scopeTypes: ["operator", "product"],
    requiredEvidence: ["Certificate ID trên danh sách Certificate Holders", "Phạm vi cà phê/ca cao & ngày hết hạn"],
    verificationSources: ["S19"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S19.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận canh tác bền vững bảo vệ đa dạng sinh học và rừng cho cà phê, ca cao.",
  },
  {
    id: "Q23",
    displayName: "Fairtrade",
    kind: "sustainability",
    eligibleCategories: ["Cà phê & Ca cao", "Hạt điều & Rang củi", "Tiêu & Gia vị vùng đồi"],
    scopeTypes: ["operator", "product"],
    requiredEvidence: ["FLO ID hợp lệ trên Fairtrade Finder", "Phạm vi hợp tác xã / chuỗi cung ứng"],
    verificationSources: ["S20"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S20.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận thương mại công bằng bảo đảm giá sàn và quyền lợi nông hộ sản xuất.",
  },
  {
    id: "Q24",
    displayName: "4C (Common Code for the Coffee Community)",
    kind: "sustainability",
    eligibleCategories: ["Cà phê & Ca cao"],
    scopeTypes: ["operator"],
    requiredEvidence: ["4C License Number còn hiệu lực", "Phạm vi chuỗi cung ứng cà phê"],
    verificationSources: ["S21"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S21.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận bền vững dành riêng cho ngành hàng cà phê (không áp dụng cho trái cây hay hạt điều).",
  },
  {
    id: "Q25",
    displayName: "ASC (Aquaculture Stewardship Council)",
    kind: "aquaculture",
    eligibleCategories: ["Thủy sản tham khảo"],
    scopeTypes: ["aquaculture_reference"],
    requiredEvidence: ["ASC Farm Certificate Code trên asc-aqua.org", "Loài thủy sản nuôi & ngày hết hạn"],
    verificationSources: ["S22"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S22.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Chứng nhận nuôi trồng thủy sản có trách nhiệm (chỉ mở trong danh mục tham khảo ngành thủy sản, không gắn vào nông sản cây trái).",
  },
  {
    id: "Q26",
    displayName: "BAP (Best Aquaculture Practices)",
    kind: "aquaculture",
    eligibleCategories: ["Thủy sản tham khảo"],
    scopeTypes: ["aquaculture_reference"],
    requiredEvidence: ["BAP Facility / Farm Certification ID", "Chuỗi nuôi trồng/chế biến thủy sản"],
    verificationSources: ["S23"],
    sourceUrlPrimary: QUALITY_SOURCE_REGISTRY.S23.url,
    logoPolicy: "neutral_text_chip_only",
    summary: "Tiêu chuẩn Thực hành Nuôi trồng Thủy sản Tốt nhất (chỉ đưa vào danh mục tham khảo chuyên ngành).",
  },
];

export const CREDENTIAL_TYPE_MAP = new Map(CREDENTIAL_TYPES.map((t) => [t.id, t]));

const BLOCKED_BADGE_STATUSES = new Set<CredentialLifecycleStatus>([
  "not_provided",
  "self_declared",
  "pending_verification",
  "announced_pending_dossier",
  "assessed_not_yet_certified",
  "historical_check_required",
  "expired",
  "suspended",
  "revoked",
  "rejected",
  "not_applicable",
]);

export const LIFECYCLE_STATUS_LABELS: Record<CredentialLifecycleStatus, string> = {
  not_provided: "Chưa cung cấp hồ sơ",
  self_declared: "Nhà vườn tự khai (chưa đối chiếu)",
  pending_verification: "Chờ đối chiếu hồ sơ",
  document_matched: "Đã đối chiếu tài liệu nội bộ (Hồ sơ mẫu)",
  source_verified: "Có nguồn công bố đối chiếu được",
  announced_pending_dossier: "Có công bố, đang đối chiếu số/hạn",
  assessed_not_yet_certified: "Đã đánh giá, chưa có bản sao chứng nhận",
  historical_check_required: "Hồ sơ lịch sử — cần kiểm tra gia hạn",
  expiring_soon: "Sắp hết hạn hiệu lực",
  expired: "Đã hết hạn hiệu lực",
  suspended: "Đang tạm đình chỉ",
  revoked: "Đã thu hồi / hủy quyết định",
  rejected: "Từ chối hồ sơ",
  not_applicable: "Không áp dụng cho ngành hàng này",
};

export interface EvaluatedCredentialResult {
  canShowBadge: boolean;
  reason: string;
  daysToExpiry: number | null;
  expiryAlertBand: "90d" | "60d" | "30d" | "7d" | "expired" | null;
  effectiveStatus: CredentialLifecycleStatus;
}

export function evaluateCredentialDisplay(
  record: CredentialRecord,
  targetCategory?: string,
  targetScopeId?: string,
  refDateIso = "2026-11-25",
): EvaluatedCredentialResult {
  const typeDef = CREDENTIAL_TYPE_MAP.get(record.typeId);
  if (!typeDef) {
    return {
      canShowBadge: false,
      reason: "Loại tiêu chuẩn không tồn tại trong sổ đăng ký.",
      daysToExpiry: null,
      expiryAlertBand: null,
      effectiveStatus: "not_applicable",
    };
  }

  // Category scope check
  if (
    targetCategory &&
    !typeDef.eligibleCategories.includes("*") &&
    !typeDef.eligibleCategories.includes(targetCategory)
  ) {
    return {
      canShowBadge: false,
      reason: `Tiêu chuẩn ${typeDef.displayName} không áp dụng cho nhóm hàng "${targetCategory}".`,
      daysToExpiry: null,
      expiryAlertBand: null,
      effectiveStatus: "not_applicable",
    };
  }

  // Holder / Product / Lot scope check
  if (targetScopeId) {
    const allScopes = new Set([
      record.holderId,
      ...record.productIds,
      ...record.siteIds,
      ...record.facilityIds,
      ...(record.lotIds ?? []),
    ]);
    if (!allScopes.has(targetScopeId)) {
      return {
        canShowBadge: false,
        reason: "Hồ sơ không gắn phạm vi cho đối tượng đang xem.",
        daysToExpiry: null,
        expiryAlertBand: null,
        effectiveStatus: "not_applicable",
      };
    }
  }

  // Evidence check: missing evidence cannot be active verified badge
  if (record.evidenceIds.length === 0 && record.typeId !== "Q07") {
    return {
      canShowBadge: false,
      reason: "Thiếu bằng chứng đính kèm để hiển thị nhãn hiệu lực.",
      daysToExpiry: null,
      expiryAlertBand: null,
      effectiveStatus: record.lifecycleStatus,
    };
  }

  // Expiry calculation
  let daysToExpiry: number | null = null;
  let expiryAlertBand: EvaluatedCredentialResult["expiryAlertBand"] = null;
  if (record.validTo) {
    const refMs = Date.parse(`${refDateIso}T00:00:00Z`);
    const validMs = Date.parse(`${record.validTo}T00:00:00Z`);
    if (!Number.isNaN(refMs) && !Number.isNaN(validMs)) {
      daysToExpiry = Math.round((validMs - refMs) / (1000 * 60 * 60 * 24));
      if (daysToExpiry < 0) expiryAlertBand = "expired";
      else if (daysToExpiry <= 7) expiryAlertBand = "7d";
      else if (daysToExpiry <= 30) expiryAlertBand = "30d";
      else if (daysToExpiry <= 60) expiryAlertBand = "60d";
      else if (daysToExpiry <= 90) expiryAlertBand = "90d";
    }
  }

  // Rule: unknown expiry != active (except trace mechanism Q07 or permanent GI without expiry)
  if (!record.validTo && typeDef.kind !== "trace_mechanism" && typeDef.kind !== "gi") {
    return {
      canShowBadge: false,
      reason: "Chưa xác định ngày hết hạn hiệu lực — không tự hiển thị nhãn đang còn hạn.",
      daysToExpiry: null,
      expiryAlertBand: null,
      effectiveStatus:
        record.lifecycleStatus === "source_verified" || record.lifecycleStatus === "document_matched"
          ? "historical_check_required"
          : record.lifecycleStatus,
    };
  }

  if (daysToExpiry !== null && daysToExpiry < 0) {
    return {
      canShowBadge: false,
      reason: `Hồ sơ đã quá hạn ${Math.abs(daysToExpiry)} ngày (${record.validTo}).`,
      daysToExpiry,
      expiryAlertBand: "expired",
      effectiveStatus: "expired",
    };
  }

  if (BLOCKED_BADGE_STATUSES.has(record.lifecycleStatus)) {
    return {
      canShowBadge: false,
      reason: LIFECYCLE_STATUS_LABELS[record.lifecycleStatus],
      daysToExpiry,
      expiryAlertBand,
      effectiveStatus: record.lifecycleStatus,
    };
  }

  if (record.lifecycleStatus === "expiring_soon" || expiryAlertBand === "30d" || expiryAlertBand === "7d") {
    return {
      canShowBadge: record.permissionToPublish,
      reason: `Cảnh báo sắp hết hạn (${daysToExpiry ?? "?"} ngày nữa).`,
      daysToExpiry,
      expiryAlertBand,
      effectiveStatus: "expiring_soon",
    };
  }

  return {
    canShowBadge: record.permissionToPublish,
    reason:
      record.origin === "public_reference"
        ? "Có căn cứ công bố từ nguồn chính thức (chỉ dùng đối chiếu thông tin)."
        : "Hồ sơ mẫu đã đối chiếu trong phạm vi không gian trải nghiệm.",
    daysToExpiry,
    expiryAlertBand,
    effectiveStatus: record.lifecycleStatus,
  };
}
