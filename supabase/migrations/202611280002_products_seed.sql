insert into public.products (
  id, slug, name, category, farm_id, farm_name, region, unit_label, price_vnd, stock_kg,
  season_status, batch_code, brix_note, short_description, story_note, image, gallery,
  weight_options, has_3d_viewer, is_demo
) values
  (
    'P01', 'chom-chom-java-long-khanh', 'Chôm chôm Java Long Khánh', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 35000, 30, 'in_season',
    'NF-DEMO-001', 'Độ ngọt tự nhiên ~16–18° Brix',
    'Chôm chôm Java hái tại vườn Ba Tư (2,5 ha đất đỏ bazan Long Khánh), trái giòn, ráo nước, đóng giỏ rơm sạch giao trong ngày.',
    'Lô NF-DEMO-001 do chú Ba Tư và đoàn viên Minh Anh chụp ảnh, cân đo và ghi nhật ký mùa vụ.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg,/images/stitch/stitch-40.jpg,/images/stitch/stitch-32.jpg}', '[{"label":"2 kg (Giỏ gia đình)","kgMultiplier":2,"priceVnd":70000},{"label":"5 kg (Thùng rơm)","kgMultiplier":5,"priceVnd":175000}]'::jsonb, false, true
  ),
  (
    'P06', 'buoi-da-xanh-tan-trieu', 'Bưởi da xanh Tân Triều', 'Bưởi & Cây có múi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'kg', 45000, 42, 'in_season',
    'NF-TT-2026-01', 'Tép hồng mọng nước, 11.8° Brix (đo mẫu tại vườn)',
    'Bưởi da xanh ruột hồng cù lao Tân Triều, vỏ mỏng, tép ráo giòn ngọt thanh, có hộ chiếu QR truy xuất 3 chặng.',
    'Được cắt tại liếp vườn phù sa của Chú Ba Minh và dán tem QR cùng bạn Nguyễn Văn An (TNV ĐH Đồng Nai).',
    '/images/stitch/stitch-03.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-25.jpg,/images/stitch/stitch-26.jpg,/images/stitch/stitch-27.jpg}', '[{"label":"2 kg (Khoảng 1–2 trái)","kgMultiplier":2,"priceVnd":90000},{"label":"5 kg (Thùng gia đình)","kgMultiplier":5,"priceVnd":225000},{"label":"10 kg (Thùng quà biếu)","kgMultiplier":10,"priceVnd":450000}]'::jsonb, false, true
  ),
  (
    'P07', 'buoi-duong-la-cam-tan-trieu', 'Bưởi đường lá cam Tân Triều', 'Bưởi & Cây có múi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'kg', 42000, 28, 'in_season',
    'NF-DEMO-P07', 'Ngọt thanh truyền thống, 12.2° Brix',
    'Đặc sản truyền thống Phường Tân Triều, trái tròn vừa tay, mùi lá cam thơm dịu, thích hợp biếu tặng hoặc thưởng thức tại vườn.',
    'Sản phẩm trọng tâm trong phiên OCOP Live Story Room cùng Chú Ba Minh.',
    '/images/stitch/stitch-53.jpg', '{/images/stitch/stitch-44.jpg,/images/stitch/stitch-45.jpg,/images/stitch/stitch-53.jpg}', '[{"label":"2 kg","kgMultiplier":2,"priceVnd":84000},{"label":"5 kg","kgMultiplier":5,"priceVnd":210000}]'::jsonb, false, true
  ),
  (
    'P04', 'sau-rieng-ri6-long-khanh', 'Sầu riêng Ri6 Long Khánh', 'Chôm chôm & Sầu riêng',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 85000, 18, 'in_season',
    'NF-DEMO-P04', 'Cơm vàng hạt lép, thu hoạch chín cây tự nhiên',
    'Sầu riêng Ri6 trồng tại vườn Ba Tư, cắt già tự nhiên theo nhật ký vườn, không nhúng hóa chất ép chín.',
    'Thuộc danh mục 5 sản phẩm chủ lực của Nhà vườn Ba Tư theo mã lô.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg,/images/stitch/stitch-38.jpg,/images/stitch/stitch-49.jpg}', '[{"label":"2 kg (1 trái nhỏ)","kgMultiplier":2,"priceVnd":170000},{"label":"4 kg (1 trái lớn)","kgMultiplier":4,"priceVnd":340000}]'::jsonb, false, true
  ),
  (
    'P05', 'sau-rieng-tuyen-chon-dong-nai', 'Sầu riêng tuyển chọn Ba Tư', 'Chôm chôm & Sầu riêng',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 120000, 12, 'in_season',
    'NF-DEMO-P05', NULL,
    'Trái tuyển chọn tỉ lệ hộc đều, cơm dày dẻo béo, thu hoạch từ cây lâu năm tại Nhà vườn Ba Tư.',
    'Phân loại kỹ bởi chủ vườn, giao kèm tem mã lô NF-DEMO-P05.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg,/images/stitch/stitch-49.jpg,/images/stitch/stitch-38.jpg}', NULL, false, true
  ),
  (
    'P02', 'chom-chom-nhan-hen-mua', 'Chôm chôm nhãn Long Khánh', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 45000, 0, 'pre_order',
    'NF-DEMO-P02', NULL,
    'Giống chôm chôm nhãn trái nhỏ, hạt tróc ráo nước. Đợt trái hiện tại đang chờ vào độ chín rộ — mở đăng ký theo dõi vụ mùa.',
    'Minh họa trạng thái hết tồn sẵn / Hẹn mùa để khách theo dõi đợt cắt kế tiếp.',
    '/images/stitch/stitch-40.jpg', '{/images/stitch/stitch-40.jpg,/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P03', 'chom-chom-tuyen-chon-hen-mua', 'Chôm chôm tuyển chọn đóng hộp', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 60000, 0, 'pre_order',
    'NF-DEMO-P03', NULL,
    'Chùm chôm chôm cắt lựa trái đồng đều dành cho giỏ quà. Hiện tạm hết tồn sẵn tại vườn — bấm Theo dõi vụ mùa.',
    'Trạng thái hẹn mùa minh họa giúp khách theo dõi đợt thu hoạch kế tiếp.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P08', 'hat-dieu-rang-muoi-vo-lua-xuan-loc', 'Hạt điều rang muối vỏ lụa Xuân Lộc', 'Hạt điều & Rang củi',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'hộp 500g', 145000, 35, 'in_season',
    'NF-XL-2026-03', NULL,
    'Hạt điều nhân A+ rang củi truyền thống giữ nguyên vỏ lụa giòn thơm tại HTX Xuân Lộc, đóng hộp hút chân không.',
    'Sản phẩm minh họa trong bài học ''Hành trình hạt điều Đồng Nai''.',
    '/images/stitch/stitch-05.jpg', '{/images/stitch/stitch-34.jpg,/images/stitch/stitch-39.jpg,/images/stitch/stitch-50.jpg}', NULL, false, true
  ),
  (
    'P09', 'mat-ong-hoa-nhan-cam-my', 'Mật ong hoa nhãn Xuân Đường', 'Mật ong & Rượu trái cây',
    'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái', 'Xã Xuân Đường', 'chai 500ml', 180000, 19, 'in_season',
    'NF-DEMO-P09', NULL,
    'Mật ong khai thác từ các thùng ong đặt dưới tán vườn nhãn và sầu riêng Xã Xuân Đường, màu vàng hổ phách tự nhiên.',
    'Đóng chai thủy tinh sạch, có nhãn ghi rõ ngày quay mật tại vườn Cô Tư.',
    '/images/stitch/stitch-06.jpg', '{/images/stitch/stitch-06.jpg}', NULL, false, true
  ),
  (
    'P10', 'ruou-buoi-tan-trieu-chum-sanh', 'Rượu bưởi Tân Triều chum sành', 'Mật ong & Rượu trái cây',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'chum 750ml', 165000, 14, 'in_season',
    'NF-DEMO-P10', NULL,
    'Đặc sản lên men từ nước ép bưởi đường lá cam Tân Triều đựng trong chum sành mộc thủ công (dành cho người từ 18 tuổi trở lên).',
    'Sản phẩm truyền thống làng bưởi Tân Triều, minh họa trong hồ sơ vườn Chú Ba Minh.',
    '/images/products/pomelo-oil.jpg', '{/images/products/pomelo-oil.jpg,/images/stitch/stitch-25.jpg}', NULL, false, true
  ),
  (
    'P11', 'mut-vo-buoi-say-deo-mat-ong', 'Mứt vỏ bưởi sấy dẻo mật ong rừng', 'Nông sản chế biến & Mứt',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'hũ 200g', 90000, 26, 'in_season',
    'NF-DEMO-P11', NULL,
    'Vỏ bưởi Tân Triều sơ chế giảm đắng, sấy dẻo cùng mật ong hoa nhãn, giữ tinh dầu thơm dịu nhẹ.',
    'Tận dụng giá trị phụ phẩm vỏ bưởi sạch giúp tăng thêm thu nhập cho hộ vườn.',
    '/images/stitch/stitch-48.jpg', '{/images/stitch/stitch-48.jpg}', NULL, false, true
  ),
  (
    'P12', 'ca-phe-rang-moc-dong-nai', 'Cà phê Robusta rang mộc Xuân Lộc', 'Cà phê & Ca cao',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'túi 500g', 120000, 24, 'in_season',
    'NF-DEMO-P12', NULL,
    'Hạt cà phê Robusta vùng đất bazan Đồng Nai thu hái trái chín, rang mộc không tẩm bơ hương liệu.',
    'Phù hợp pha phin truyền thống, đóng túi van một chiều có mã QR lô rang.',
    '/images/stitch/stitch-08.jpg', '{/images/stitch/stitch-08.jpg}', NULL, false, true
  ),
  (
    'P13', 'mang-cut-binh-loc', 'Măng cụt già cỗi Bình Lộc', 'Trái cây tươi',
    'farm-binh-loc-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Phường Bình Lộc', 'kg', 78000, 22, 'in_season',
    'NF-DN-013', NULL,
    'Măng cụt thu hái đúng độ tím sậm tại Phường Bình Lộc, ruột trắng ngọt thanh.',
    'Sản phẩm thuộc lô NF-DN-013 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mangosteen.jpg', '{/images/products/mangosteen.jpg}', NULL, false, true
  ),
  (
    'P14', 'chom-chom-thai-binh-loc', 'Chôm chôm Thái Bình Lộc', 'Chôm chôm & Sầu riêng',
    'farm-binh-loc-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Phường Bình Lộc', 'kg', 44000, 36, 'in_season',
    'NF-DN-014', NULL,
    'Chùm quả lớn vỏ đỏ vàng, cùi giòn tróc hạt đặc trưng vườn Sáu Sáng.',
    'Sản phẩm thuộc lô NF-DN-014 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P15', 'chom-chom-java-binh-loc', 'Chôm chôm Java vườn Bình Lộc', 'Trái cây tươi',
    'farm-binh-loc-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Phường Bình Lộc', 'kg', 34000, 40, 'in_season',
    'NF-DN-015', NULL,
    'Thu hái sáng sớm tại Tổ 7 Bình Lộc, giữ cuống tươi giao nhanh.',
    'Sản phẩm thuộc lô NF-DN-015 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-40.jpg', '{/images/stitch/stitch-40.jpg}', NULL, false, true
  ),
  (
    'P16', 'bot-ca-cao-bao-vinh', 'Bột ca cao nguyên chất Bảo Vinh', 'Cà phê & Ca cao',
    'farm-bao-vinh-mit', 'Trang trại Mít & Ca cao Bảo Vinh', 'Phường Bảo Vinh', 'hộp 300g', 135000, 20, 'in_season',
    'NF-DN-016', NULL,
    'Ủ lên men 6 ngày và rang tách bơ vừa phải, thơm vị sô-cô-la tự nhiên.',
    'Sản phẩm thuộc lô NF-DN-016 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P17', 'mit-to-nu-say-gion', 'Mít tố nữ sấy giòn Bảo Vinh', 'Nông sản chế biến & Mứt',
    'farm-bao-vinh-mit', 'Trang trại Mít & Ca cao Bảo Vinh', 'Phường Bảo Vinh', 'túi 250g', 68000, 35, 'in_season',
    'NF-DN-017', NULL,
    'Sấy chân không không đường phụ gia, giữ màu vàng và hương mít đặc trưng.',
    'Sản phẩm thuộc lô NF-DN-017 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/jackfruit-chips.jpg', '{/images/products/jackfruit-chips.jpg}', NULL, false, true
  ),
  (
    'P18', 'bo-034-hang-gon', 'Bơ 034 dẻo sáp Hàng Gòn', 'Trái cây tươi',
    'farm-hang-gon-sau-rieng', 'Vườn Sầu riêng Cổ Hàng Gòn', 'Phường Hàng Gòn', 'kg', 58000, 28, 'in_season',
    'NF-DN-018', NULL,
    'Trái thuôn dài thịt vàng ươm, dẻo béo ít xơ từ vùng đồi bazan Hàng Gòn.',
    'Sản phẩm thuộc lô NF-DN-018 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/avocado-booth7.jpg', '{/images/products/avocado-booth7.jpg}', NULL, false, true
  ),
  (
    'P19', 'sau-rieng-musang-hang-gon', 'Sầu riêng Musang King Hàng Gòn', 'Chôm chôm & Sầu riêng',
    'farm-hang-gon-sau-rieng', 'Vườn Sầu riêng Cổ Hàng Gòn', 'Phường Hàng Gòn', 'kg', 195000, 10, 'in_season',
    'NF-DN-019', NULL,
    'Vườn cây ghép trưởng thành tại Phường Hàng Gòn, múi dẻo đậm vị.',
    'Sản phẩm thuộc lô NF-DN-019 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-38.jpg', '{/images/stitch/stitch-38.jpg}', NULL, false, true
  ),
  (
    'P20', 'xoai-cat-hoa-loc-tri-an', 'Xoài cát Hòa Lộc ven hồ Trị An', 'Trái cây tươi',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'kg', 64000, 45, 'in_season',
    'NF-DN-020', NULL,
    'Bao trái sinh học tại Phường Trị An, chín vàng thơm ngọt tự nhiên.',
    'Sản phẩm thuộc lô NF-DN-020 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-09.jpg', '{/images/stitch/stitch-09.jpg}', NULL, false, true
  ),
  (
    'P21', 'xoai-say-deo-tri-an', 'Xoài chín cây sấy dẻo ít đường', 'Nông sản chế biến & Mứt',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'túi 300g', 82000, 50, 'in_season',
    'NF-DN-021', NULL,
    'Lát xoài cắt dày sấy nhiệt thấp giữ vị chua ngọt cân bằng.',
    'Sản phẩm thuộc lô NF-DN-021 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P22', 'buoi-thanh-tra-tri-an', 'Bưởi thanh trà ven hồ Trị An', 'Bưởi & Cây có múi',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'kg', 48000, 25, 'in_season',
    'NF-DN-022', NULL,
    'Tép bưởi giòn thanh dịu nhẹ, phù hợp làm gỏi bưởi hoặc ăn tráng miệng.',
    'Sản phẩm thuộc lô NF-DN-022 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-53.jpg', '{/images/stitch/stitch-53.jpg}', NULL, false, true
  ),
  (
    'P23', 'nam-moi-den-phu-ly', 'Nấm mối đen hữu cơ Phú Lý', 'Rau củ & Nấm sạch',
    'farm-phu-ly-nam-rau', 'Vườn Nấm & Rau Rừng Phú Lý', 'Xã Phú Lý', 'hộp 500g', 160000, 14, 'in_season',
    'NF-DN-023', NULL,
    'Nuôi trồng trong nhà lưới khép kín tại Xã Phú Lý, thu hái lúc búp vừa nở.',
    'Sản phẩm thuộc lô NF-DN-023 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mushroom-oyster.jpg', '{/images/products/mushroom-oyster.jpg}', NULL, false, true
  ),
  (
    'P24', 'rau-bep-phu-ly', 'Rau bép rừng non Phú Lý', 'Rau củ & Nấm sạch',
    'farm-phu-ly-nam-rau', 'Vườn Nấm & Rau Rừng Phú Lý', 'Xã Phú Lý', 'bó 400g', 32000, 24, 'in_season',
    'NF-DN-024', NULL,
    'Ngọn rau non giòn ngọt vị đặc sản vùng đệm rừng Đồng Nai.',
    'Sản phẩm thuộc lô NF-DN-024 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P25', 'mang-le-kho-phu-ly', 'Măng le phơi nắng Phú Lý', 'Nông sản chế biến & Mứt',
    'farm-phu-ly-nam-rau', 'Vườn Nấm & Rau Rừng Phú Lý', 'Xã Phú Lý', 'túi 500g', 140000, 18, 'in_season',
    'NF-DN-025', NULL,
    'Măng non luộc kỹ và phơi nắng tự nhiên không tẩm chất bảo quản.',
    'Sản phẩm thuộc lô NF-DN-025 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/taro-bamboo.jpg', '{/images/products/taro-bamboo.jpg}', NULL, false, true
  ),
  (
    'P26', 'buoi-da-xanh-tan-an', 'Bưởi da xanh hữu cơ Tân An', 'Bưởi & Cây có múi',
    'farm-tan-an-buoi', 'Trang trại Bưởi Hữu cơ Tân An', 'Xã Tân An', 'kg', 52000, 36, 'in_season',
    'NF-DN-026', NULL,
    'Bón phân trùn quế tại Xã Tân An, độ Brix ổn định và tép mọng ráo.',
    'Sản phẩm thuộc lô NF-DN-026 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P27', 'cam-xoan-tan-an', 'Cam xoàn ngọt Tân An', 'Bưởi & Cây có múi',
    'farm-tan-an-buoi', 'Trang trại Bưởi Hữu cơ Tân An', 'Xã Tân An', 'kg', 46000, 32, 'in_season',
    'NF-DN-027', NULL,
    'Cam vỏ mỏng múi vàng thơm thanh, hái trực tiếp theo đơn hàng ngày.',
    'Sản phẩm thuộc lô NF-DN-027 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/passionfruit-citrus.jpg', '{/images/products/passionfruit-citrus.jpg}', NULL, false, true
  ),
  (
    'P28', 'chanh-khong-hat-tan-an', 'Chanh không hạt Tân An', 'Bưởi & Cây có múi',
    'farm-tan-an-buoi', 'Trang trại Bưởi Hữu cơ Tân An', 'Xã Tân An', 'kg', 28000, 55, 'in_season',
    'NF-DN-028', NULL,
    'Nhiều nước, hương tinh dầu dễ chịu, phù hợp pha chế và gia đình.',
    'Sản phẩm thuộc lô NF-DN-028 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/passionfruit-citrus.jpg', '{/images/products/passionfruit-citrus.jpg}', NULL, false, true
  ),
  (
    'P29', 'chuoi-laba-say-thanh-son', 'Chuối Laba sấy dẻo năng lượng mặt trời', 'Nông sản chế biến & Mứt',
    'farm-thanh-son-chuoi', 'Tổ hợp Chuối & Bưởi Thanh Sơn', 'Xã Thanh Sơn', 'hộp 400g', 74000, 42, 'in_season',
    'NF-DN-029', NULL,
    'Sấy nhà kính tại Xã Thanh Sơn giúp chuối dẻo thơm mật không đường.',
    'Sản phẩm thuộc lô NF-DN-029 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/banana-dried.jpg', '{/images/products/banana-dried.jpg}', NULL, false, true
  ),
  (
    'P30', 'oi-ruot-do-thanh-son', 'Ổi ruột đỏ không hạt Thanh Sơn', 'Trái cây tươi',
    'farm-thanh-son-chuoi', 'Tổ hợp Chuối & Bưởi Thanh Sơn', 'Xã Thanh Sơn', 'kg', 32000, 48, 'in_season',
    'NF-DN-030', NULL,
    'Giòn ngọt thơm nhẹ, bao xốp chống sâu bệnh từ lúc trái nhỏ.',
    'Sản phẩm thuộc lô NF-DN-030 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/guava-fresh.jpg', '{/images/products/guava-fresh.jpg}', NULL, false, true
  ),
  (
    'P31', 'xoai-tuong-da-xanh-la-nga', 'Xoài tượng da xanh La Ngà', 'Trái cây tươi',
    'farm-la-nga-xoai', 'Tổ Hợp tác Xoài Bưởi La Ngà', 'Xã La Ngà', 'kg', 38000, 50, 'in_season',
    'NF-DN-031', NULL,
    'Trái lớn cơm giòn ráo, ăn sống chấm muối ớt hoặc làm gỏi.',
    'Sản phẩm thuộc lô NF-DN-031 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-09.jpg', '{/images/stitch/stitch-09.jpg}', NULL, false, true
  ),
  (
    'P32', 'mut-xoai-la-nga', 'Mứt xoài cuộn bánh tráng La Ngà', 'Nông sản chế biến & Mứt',
    'farm-la-nga-xoai', 'Tổ Hợp tác Xoài Bưởi La Ngà', 'Xã La Ngà', 'hũ 350g', 79000, 30, 'in_season',
    'NF-DN-032', NULL,
    'Chế biến thủ công bởi tổ phụ nữ Xã La Ngà, vị chua ngọt dịu.',
    'Sản phẩm thuộc lô NF-DN-032 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P33', 'hat-cacao-nam-cat-tien', 'Hạt ca cao lên men phơi giàn Nam Cát Tiên', 'Cà phê & Ca cao',
    'farm-nam-cat-tien-cacao', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Xã Nam Cát Tiên', 'túi 500g', 155000, 26, 'in_season',
    'NF-DN-033', NULL,
    'Canh tác dưới tán rừng Cát Tiên, thích hợp rang xay hoặc làm sô-cô-la.',
    'Sản phẩm thuộc lô NF-DN-033 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-41.jpg', '{/images/stitch/stitch-41.jpg}', NULL, false, true
  ),
  (
    'P34', 'chocolate-den-70-nam-cat-tien', 'Sô-cô-la đen 70% Nam Cát Tiên', 'Cà phê & Ca cao',
    'farm-nam-cat-tien-cacao', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Xã Nam Cát Tiên', 'thanh 100g', 89000, 40, 'in_season',
    'NF-DN-034', NULL,
    'Vị đắng dịu hậu trái cây nhiệt đới, không chất nhũ hóa công nghiệp.',
    'Sản phẩm thuộc lô NF-DN-034 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P35', 'tra-vo-cacao-nam-cat-tien', 'Trà vỏ hạt ca cao rang thơm', 'Cà phê & Ca cao',
    'farm-nam-cat-tien-cacao', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Xã Nam Cát Tiên', 'hộp 200g', 65000, 34, 'in_season',
    'NF-DN-035', NULL,
    'Thức uống thảo mộc không caffein, hương sô-cô-la ấm nhẹ.',
    'Sản phẩm thuộc lô NF-DN-035 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-10.jpg', '{/images/stitch/stitch-10.jpg}', NULL, false, true
  ),
  (
    'P36', 'gao-st25-dak-lua', 'Gạo thơm ST25 lúa mùa Đak Lua', 'Nông sản chế biến & Mứt',
    'farm-dak-lua-lua-sen', 'Cánh đồng Lúa Thơm & Sen Đak Lua', 'Xã Đak Lua', 'túi 5 kg', 185000, 60, 'in_season',
    'NF-DN-036', NULL,
    'Canh tác vùng phù sa ven sông Đồng Nai tại Xã Đak Lua, cơm dẻo thơm lá dứa.',
    'Sản phẩm thuộc lô NF-DN-036 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/st25-rice-lotus.jpg', '{/images/products/st25-rice-lotus.jpg}', NULL, false, true
  ),
  (
    'P37', 'hat-sen-say-dak-lua', 'Hạt sen đồng Bàu Sen sấy giòn', 'Hạt điều & Rang củi',
    'farm-dak-lua-lua-sen', 'Cánh đồng Lúa Thơm & Sen Đak Lua', 'Xã Đak Lua', 'hũ 250g', 92000, 28, 'in_season',
    'NF-DN-037', NULL,
    'Sen thu hái tại cánh đồng Đak Lua, tách tim đắng và sấy giòn bùi.',
    'Sản phẩm thuộc lô NF-DN-037 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/st25-rice-lotus.jpg', '{/images/products/st25-rice-lotus.jpg}', NULL, false, true
  ),
  (
    'P38', 'tra-tim-sen-dak-lua', 'Trà tim sen sao mộc Đak Lua', 'Mật ong & Rượu trái cây',
    'farm-dak-lua-lua-sen', 'Cánh đồng Lúa Thơm & Sen Đak Lua', 'Xã Đak Lua', 'hũ 150g', 75000, 25, 'in_season',
    'NF-DN-038', NULL,
    'Sao khô nhiệt thấp giữ màu xanh tự nhiên, giúp thư giãn giấc ngủ.',
    'Sản phẩm thuộc lô NF-DN-038 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-10.jpg', '{/images/stitch/stitch-10.jpg}', NULL, false, true
  ),
  (
    'P39', 'nam-bao-ngu-xam-dau-giay', 'Nấm bào ngư xám Dầu Giây', 'Rau củ & Nấm sạch',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hộp 500g', 45000, 40, 'in_season',
    'NF-DN-039', NULL,
    'Thu hoạch mỗi sáng tại Phường Dầu Giây, thịt nấm dai ngọt tự nhiên.',
    'Sản phẩm thuộc lô NF-DN-039 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mushroom-oyster.jpg', '{/images/products/mushroom-oyster.jpg}', NULL, false, true
  ),
  (
    'P40', 'nam-linh-chi-dau-giay', 'Nấm linh chi đỏ thái lát Dầu Giây', 'Rau củ & Nấm sạch',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hộp 250g', 220000, 16, 'in_season',
    'NF-DN-040', NULL,
    'Còn nguyên lớp bào tử nâu đỏ trên mặt nấm, phơi sấy sạch đạt chuẩn.',
    'Sản phẩm thuộc lô NF-DN-040 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mushroom-reishi.jpg', '{/images/products/mushroom-reishi.jpg}', NULL, false, true
  ),
  (
    'P41', 'nam-dui-ga-dau-giay', 'Nấm đùi gà mini Dầu Giây', 'Rau củ & Nấm sạch',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'khay 400g', 52000, 30, 'in_season',
    'NF-DN-041', NULL,
    'Thân nấm trắng chắc, phù hợp áp chảo hoặc nấu lẩu chay.',
    'Sản phẩm thuộc lô NF-DN-041 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mushroom-oyster.jpg', '{/images/products/mushroom-oyster.jpg}', NULL, false, true
  ),
  (
    'P42', 'tieu-den-bau-ham', 'Tiêu đen sọ đỏ Bàu Hàm', 'Tiêu & Gia vị vùng đồi',
    'farm-bau-ham-tieu', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Xã Bàu Hàm', 'hũ 250g', 95000, 45, 'in_season',
    'NF-DN-042', NULL,
    'Hạt tiêu già chín đỏ chọn lọc từ Xã Bàu Hàm, cay thơm bền vị.',
    'Sản phẩm thuộc lô NF-DN-042 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/black-pepper.jpg', '{/images/products/black-pepper.jpg}', NULL, false, true
  ),
  (
    'P43', 'tieu-xanh-ngam-giam', 'Tiêu xanh tươi ngâm giấm gạo', 'Tiêu & Gia vị vùng đồi',
    'farm-bau-ham-tieu', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Xã Bàu Hàm', 'lọ 300g', 78000, 26, 'in_season',
    'NF-DN-043', NULL,
    'Giữ độ giòn thơm của hạt tiêu non, tiện ăn kèm các món kho và nướng.',
    'Sản phẩm thuộc lô NF-DN-043 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/white-pepper.jpg', '{/images/products/white-pepper.jpg}', NULL, false, true
  ),
  (
    'P44', 'chuoi-say-me-gung-bau-ham', 'Chuối sứ sấy mè gừng Bàu Hàm', 'Nông sản chế biến & Mứt',
    'farm-bau-ham-tieu', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Xã Bàu Hàm', 'túi 300g', 58000, 38, 'in_season',
    'NF-DN-044', NULL,
    'Vị gừng ấm kết hợp mè rang vàng giòn và chuối chín mật.',
    'Sản phẩm thuộc lô NF-DN-044 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/banana-dried.jpg', '{/images/products/banana-dried.jpg}', NULL, false, true
  ),
  (
    'P45', 'long-nhan-say-xuan-bac', 'Long nhãn sấy dẻo Xuân Bắc', 'Nông sản chế biến & Mứt',
    'farm-xuan-bac-nhan', 'Trang trại Nhãn & Bưởi Xuân Bắc', 'Xã Xuân Bắc', 'hũ 300g', 115000, 32, 'in_season',
    'NF-DN-045', NULL,
    'Cơm nhãn dày tách thủ công tại Xã Xuân Bắc, không tẩm đường.',
    'Sản phẩm thuộc lô NF-DN-045 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/longan-dried.jpg', '{/images/products/longan-dried.jpg}', NULL, false, true
  ),
  (
    'P46', 'nhan-tieu-da-bo-xuan-bac', 'Nhãn tiêu da bò Xuân Bắc', 'Trái cây tươi',
    'farm-xuan-bac-nhan', 'Trang trại Nhãn & Bưởi Xuân Bắc', 'Xã Xuân Bắc', 'kg', 39000, 0, 'pre_order',
    'NF-DN-046', NULL,
    'Trái chín mọng cùi giòn ngọt, mở theo dõi vụ thu hoạch cuối tháng.',
    'Sản phẩm thuộc lô NF-DN-046 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/longan-dried.jpg', '{/images/products/longan-dried.jpg}', NULL, false, true
  ),
  (
    'P47', 'sau-rieng-dona-cam-my', 'Sầu riêng Dona cơm vàng Cẩm Mỹ', 'Chôm chôm & Sầu riêng',
    'farm-cam-my-sau-rieng', 'Vườn Sầu riêng Dona Cẩm Mỹ', 'Xã Cẩm Mỹ', 'kg', 92000, 25, 'in_season',
    'NF-DN-047', NULL,
    'Vườn Xã Cẩm Mỹ thu cắt đủ tuổi trái, cơm dày dẻo ráo không sượng.',
    'Sản phẩm thuộc lô NF-DN-047 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-49.jpg', '{/images/stitch/stitch-49.jpg}', NULL, false, true
  ),
  (
    'P48', 'sau-rieng-cap-dong-cam-my', 'Sầu riêng Dona tách múi cấp đông', 'Chôm chôm & Sầu riêng',
    'farm-cam-my-sau-rieng', 'Vườn Sầu riêng Dona Cẩm Mỹ', 'Xã Cẩm Mỹ', 'hộp 500g', 150000, 20, 'in_season',
    'NF-DN-048', NULL,
    'Tách múi từ trái chín cây ngay trong ngày và cấp đông sâu -18°C.',
    'Sản phẩm thuộc lô NF-DN-048 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P49', 'mit-thai-cam-my', 'Mít Thái siêu sớm Cẩm Mỹ', 'Trái cây tươi',
    'farm-cam-my-sau-rieng', 'Vườn Sầu riêng Dona Cẩm Mỹ', 'Xã Cẩm Mỹ', 'kg', 30000, 42, 'in_season',
    'NF-DN-049', NULL,
    'Múi dày giòn ngọt, đóng khay tách sẵn hoặc nguyên trái theo yêu cầu.',
    'Sản phẩm thuộc lô NF-DN-049 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/jackfruit-chips.jpg', '{/images/products/jackfruit-chips.jpg}', NULL, false, true
  ),
  (
    'P50', 'cai-bo-xoi-tran-bien', 'Cải bó xôi thủy canh Trấn Biên', 'Rau củ & Nấm sạch',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'túi 300g', 26000, 50, 'in_season',
    'NF-DN-050', NULL,
    'Trồng nhà màng khép kín tại Phường Trấn Biên, lá xanh non an toàn.',
    'Sản phẩm thuộc lô NF-DN-050 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P51', 'xa-lach-thuy-canh-tran-bien', 'Xà lách giòn thủy canh Trấn Biên', 'Rau củ & Nấm sạch',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'hộp 350g', 29000, 44, 'in_season',
    'NF-DN-051', NULL,
    'Còn nguyên rễ giữ tươi, không dư lượng thuốc bảo vệ thực vật.',
    'Sản phẩm thuộc lô NF-DN-051 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P52', 'combo-qua-ocop-dong-nai', 'Combo Quà OCOP Thanh niên Đồng Nai', 'Quà tặng OCOP & Combo',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'hộp quà', 360000, 18, 'in_season',
    'NF-DN-052', NULL,
    'Hộp quà phối hợp: Điều rang củi Xuân Lộc + Mứt vỏ bưởi Tân Triều + Cà phê rang mộc.',
    'Sản phẩm thuộc lô NF-DN-052 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P53', 'combo-trai-cay-cuoi-tuan', 'Giỏ trái cây Miệt vườn cuối tuần', 'Quà tặng OCOP & Combo',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'giỏ 4 kg', 245000, 15, 'in_season',
    'NF-DN-053', NULL,
    'Gồm Bưởi Tân Triều, Chôm chôm Long Khánh và Xoài Trị An kèm thiệp QR nguồn gốc.',
    'Sản phẩm thuộc lô NF-DN-053 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-02.jpg', '{/images/stitch/stitch-02.jpg}', NULL, false, true
  ),
  (
    'P54', 'hat-dieu-w240-binh-phuoc', 'Hạt điều rang muối W240 Bình Phước', 'Hạt điều & Rang củi',
    'farm-binh-phuoc-dieu', 'HTX Hạt Điều Bazan Bình Phước', 'Phường Bình Phước', 'hũ 500g', 165000, 48, 'in_season',
    'NF-DN-054', NULL,
    'Nhân lớn đồng đều size W240 từ Phường Bình Phước, giòn bùi ít muối.',
    'Sản phẩm thuộc lô NF-DN-054 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P55', 'bo-hat-dieu-nguyen-chat', 'Bơ hạt điều mịn không đường', 'Hạt điều & Rang củi',
    'farm-binh-phuoc-dieu', 'HTX Hạt Điều Bazan Bình Phước', 'Phường Bình Phước', 'lọ 250g', 125000, 30, 'in_season',
    'NF-DN-055', NULL,
    'Xay mịn 100% nhân điều rang chậm, phù hợp phết bánh mì và thực đơn ăn lành mạnh.',
    'Sản phẩm thuộc lô NF-DN-055 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/cashew-butter.jpg', '{/images/products/cashew-butter.jpg}', NULL, false, true
  ),
  (
    'P56', 'hat-dieu-toi-ot-binh-phuoc', 'Hạt điều rang tỏi ớt lá chanh', 'Hạt điều & Rang củi',
    'farm-binh-phuoc-dieu', 'HTX Hạt Điều Bazan Bình Phước', 'Phường Bình Phước', 'hũ 350g', 138000, 36, 'in_season',
    'NF-DN-056', NULL,
    'Áo lớp tỏi phi giòn rụm và lá chanh thơm dịu không phẩm màu.',
    'Sản phẩm thuộc lô NF-DN-056 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-05.jpg', '{/images/stitch/stitch-05.jpg}', NULL, false, true
  ),
  (
    'P57', 'tieu-den-dong-xoai', 'Tiêu đen hạt chắc Đồng Xoài', 'Tiêu & Gia vị vùng đồi',
    'farm-dong-xoai-tieu', 'Vườn Tiêu Đen & Mật Rừng Đồng Xoài', 'Phường Đồng Xoài', 'túi 500g', 145000, 34, 'in_season',
    'NF-DN-057', NULL,
    'Hạt mẩy nặng cân vùng đất đỏ Phường Đồng Xoài, sàn lọc sạch bụi.',
    'Sản phẩm thuộc lô NF-DN-057 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/black-pepper.jpg', '{/images/products/black-pepper.jpg}', NULL, false, true
  ),
  (
    'P58', 'tieu-trang-dong-xoai', 'Tiêu trắng (tiêu sọ) ngâm nước sạch', 'Tiêu & Gia vị vùng đồi',
    'farm-dong-xoai-tieu', 'Vườn Tiêu Đen & Mật Rừng Đồng Xoài', 'Phường Đồng Xoài', 'lọ 200g', 112000, 28, 'in_season',
    'NF-DN-058', NULL,
    'Loại bỏ vỏ ngoài bằng quy trình ngâm chảy nước sạch, hương thơm dịu.',
    'Sản phẩm thuộc lô NF-DN-058 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/white-pepper.jpg', '{/images/products/white-pepper.jpg}', NULL, false, true
  ),
  (
    'P59', 'mat-ong-rung-dong-xoai', 'Mật ong hoa rừng tự nhiên Đồng Xoài', 'Mật ong & Rượu trái cây',
    'farm-dong-xoai-tieu', 'Vườn Tiêu Đen & Mật Rừng Đồng Xoài', 'Phường Đồng Xoài', 'chai 500ml', 210000, 16, 'in_season',
    'NF-DN-059', NULL,
    'Mật thu theo vụ hoa rừng cuối xuân, sánh mịn thơm mùi thảo mộc.',
    'Sản phẩm thuộc lô NF-DN-059 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-06.jpg', '{/images/stitch/stitch-06.jpg}', NULL, false, true
  ),
  (
    'P60', 'bo-sap-booth7-phuoc-long', 'Bơ sáp Booth 7 đồi Bà Rá', 'Trái cây tươi',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'kg', 62000, 26, 'in_season',
    'NF-DN-060', NULL,
    'Trái tròn vỏ xanh nhám từ Phường Phước Long, thịt bơ dẻo vàng và ít đen đầu.',
    'Sản phẩm thuộc lô NF-DN-060 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/avocado-booth7.jpg', '{/images/products/avocado-booth7.jpg}', NULL, false, true
  ),
  (
    'P61', 'ca-phe-phoi-tron-phuoc-long', 'Cà phê Arabica – Robusta Phước Long', 'Cà phê & Ca cao',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'túi 500g', 155000, 32, 'in_season',
    'NF-DN-061', NULL,
    'Phối trộn tỉ lệ 7:3 cho hương thơm thanh và hậu vị đậm đà.',
    'Sản phẩm thuộc lô NF-DN-061 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-08.jpg', '{/images/stitch/stitch-08.jpg}', NULL, false, true
  ),
  (
    'P62', 'chanh-day-tim-phuoc-long', 'Chanh dây tím sườn đồi Phước Long', 'Trái cây tươi',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'kg', 38000, 40, 'in_season',
    'NF-DN-062', NULL,
    'Vỏ tím căng mọng nước thơm nồng, thích hợp pha nước giải khát.',
    'Sản phẩm thuộc lô NF-DN-062 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/passionfruit-citrus.jpg', '{/images/products/passionfruit-citrus.jpg}', NULL, false, true
  ),
  (
    'P63', 'hat-dieu-huu-co-dak-nhau', 'Hạt điều hữu cơ rang mộc Đak Nhau', 'Hạt điều & Rang củi',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hũ 500g', 172000, 30, 'in_season',
    'NF-DN-063', NULL,
    'Không tẩm muối, giữ trọn vị béo ngậy của hạt điều bazan Xã Đak Nhau.',
    'Sản phẩm thuộc lô NF-DN-063 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-57.jpg', '{/images/stitch/stitch-57.jpg}', NULL, false, true
  ),
  (
    'P64', 'mac-ca-nut-vo-dak-nhau', 'Hạt Mắc ca sấy nứt vỏ Đak Nhau', 'Hạt điều & Rang củi',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hộp 500g', 185000, 24, 'in_season',
    'NF-DN-064', NULL,
    'Hạt tròn cỡ đại nứt vỏ tự nhiên kèm dụng cụ tách vỏ tiện lợi.',
    'Sản phẩm thuộc lô NF-DN-064 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/macadamia-nuts.jpg', '{/images/products/macadamia-nuts.jpg}', NULL, false, true
  ),
  (
    'P65', 'hat-dieu-vo-lua-phuoc-son', 'Hạt điều rang vỏ lụa Xã Phước Sơn', 'Hạt điều & Rang củi',
    'farm-phuoc-son-mat-ong', 'Tổ Hợp tác Điều & Mật Rừng Phước Sơn', 'Xã Phước Sơn', 'hộp 500g', 150000, 34, 'in_season',
    'NF-DN-065', NULL,
    'Thu hái tại Xã Phước Sơn (kèm hồ sơ minh bạch diện tích hiện hành 386,56 km²).',
    'Sản phẩm thuộc lô NF-DN-065 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-05.jpg', '{/images/stitch/stitch-05.jpg}', NULL, false, true
  ),
  (
    'P66', 'mat-ong-hoa-ca-phe-phuoc-son', 'Mật ong hoa cà phê – điều Phước Sơn', 'Mật ong & Rượu trái cây',
    'farm-phuoc-son-mat-ong', 'Tổ Hợp tác Điều & Mật Rừng Phước Sơn', 'Xã Phước Sơn', 'chai 500ml', 175000, 20, 'in_season',
    'NF-DN-066', NULL,
    'Màu vàng sáng mùi dịu nhẹ, quay ly tâm vệ sinh tại tổ hợp tác.',
    'Sản phẩm thuộc lô NF-DN-066 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-06.jpg', '{/images/stitch/stitch-06.jpg}', NULL, false, true
  ),
  (
    'P67', 'khoai-mon-sap-phuoc-son', 'Khoai môn sáp bở Phước Sơn', 'Rau củ & Nấm sạch',
    'farm-phuoc-son-mat-ong', 'Tổ Hợp tác Điều & Mật Rừng Phước Sơn', 'Xã Phước Sơn', 'kg', 42000, 0, 'out_of_season',
    'NF-DN-067', NULL,
    'Củ lớn bột mịn thơm dẻo. Đợt thu hoạch hiện tại đã kết thúc vụ.',
    'Sản phẩm thuộc lô NF-DN-067 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/taro-bamboo.jpg', '{/images/products/taro-bamboo.jpg}', NULL, false, true
  ),
  (
    'P68', 'buoi-duong-hong-tan-trieu', 'Bưởi đường hồng tuyển chọn Tân Triều', 'Bưởi & Cây có múi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'trái 1,4 kg', 68000, 30, 'in_season',
    'NF-DN-068', NULL,
    'Trái chọn đều tay làm quà biếu lễ Tết kèm tem QR lô Tân Triều.',
    'Sản phẩm thuộc lô NF-DN-068 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-16.jpg', '{/images/stitch/stitch-16.jpg}', NULL, false, true
  ),
  (
    'P69', 'tinh-dau-vo-buoi-tan-trieu', 'Tinh dầu vỏ bưởi xông phòng Tân Triều', 'Nông sản chế biến & Mứt',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'lọ 30ml', 135000, 22, 'in_season',
    'NF-DN-069', NULL,
    'Chưng cất lôi cuốn hơi nước từ vỏ bưởi sạch thu hoạch tại cù lao.',
    'Sản phẩm thuộc lô NF-DN-069 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/pomelo-oil.jpg', '{/images/products/pomelo-oil.jpg}', NULL, false, true
  ),
  (
    'P70', 'oi-le-suoi-cat-xuan-loc', 'Ổi lê Suối Cát giòn ngọt Xuân Lộc', 'Trái cây tươi',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'kg', 34000, 45, 'in_season',
    'NF-DN-070', NULL,
    'Ổi bọc túi sinh học thu hoạch hàng ngày tại Phường Xuân Lộc.',
    'Sản phẩm thuộc lô NF-DN-070 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/guava-fresh.jpg', '{/images/products/guava-fresh.jpg}', NULL, false, true
  ),
  (
    'P71', 'combo-van-phong-bac-dong-nai', 'Combo Snack Văn phòng Bắc Đồng Nai', 'Quà tặng OCOP & Combo',
    'farm-binh-phuoc-dieu', 'HTX Hạt Điều Bazan Bình Phước', 'Phường Bình Phước', 'hộp 3 món', 285000, 22, 'in_season',
    'NF-DN-071', NULL,
    'Gồm Hạt điều W240 + Bơ hạt điều + Hạt mắc ca sấy giòn đóng hộp gọn.',
    'Sản phẩm thuộc lô NF-DN-071 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P72', 'combo-bua-sang-lanh-manh', 'Combo Cà phê & Sô-cô-la Đồi Bazan', 'Quà tặng OCOP & Combo',
    'farm-nam-cat-tien-cacao', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Xã Nam Cát Tiên', 'bộ quà', 240000, 18, 'in_season',
    'NF-DN-072', NULL,
    'Kết hợp Cà phê rang mộc + Sô-cô-la 70% Cát Tiên + Trà vỏ ca cao.',
    'Sản phẩm thuộc lô NF-DN-072 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P73', 'combo-gia-vi-vuon-doi', 'Bộ Gia vị Vườn đồi Đồng Nai', 'Tiêu & Gia vị vùng đồi',
    'farm-bau-ham-tieu', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Xã Bàu Hàm', 'bộ 3 hũ', 235000, 20, 'in_season',
    'NF-DN-073', NULL,
    'Tiêu đen sọ đỏ + Tiêu trắng + Tiêu xanh ngâm giấm gạo tiện dụng.',
    'Sản phẩm thuộc lô NF-DN-073 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/pepper-spice-set.jpg', '{/images/products/pepper-spice-set.jpg}', NULL, false, true
  ),
  (
    'P74', 'combo-trai-cay-long-khanh-5kg', 'Thùng Đặc sản Long Khánh 5kg', 'Quà tặng OCOP & Combo',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'thùng 5 kg', 215000, 16, 'in_season',
    'NF-DN-074', NULL,
    'Phối hợp Chôm chôm Java Ba Tư và Sầu riêng Ri6 cắt chọn trong ngày.',
    'Sản phẩm thuộc lô NF-DN-074 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P75', 'mat-ong-chanh-day-tri-an', 'Siro Chanh dây mật ong Trị An', 'Mật ong & Rượu trái cây',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'chai 500ml', 125000, 24, 'in_season',
    'NF-DN-075', NULL,
    'Cô đặc nhẹ ở nhiệt độ 55°C giữ vitamin C tự nhiên và mật ong.',
    'Sản phẩm thuộc lô NF-DN-075 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/passionfruit-citrus.jpg', '{/images/products/passionfruit-citrus.jpg}', NULL, false, true
  ),
  (
    'P76', 'bot-nghe-den-xuan-duong', 'Tinh bột nghệ vàng Xã Xuân Đường', 'Tiêu & Gia vị vùng đồi',
    'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái', 'Xã Xuân Đường', 'hũ 300g', 140000, 20, 'in_season',
    'NF-DN-076', NULL,
    'Trồng xen canh dưới tán vườn sầu riêng, lắng lọc sạch tinh dầu hăng.',
    'Sản phẩm thuộc lô NF-DN-076 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/turmeric-ginger.jpg', '{/images/products/turmeric-ginger.jpg}', NULL, false, true
  ),
  (
    'P77', 'gung-se-say-gion-xuan-duong', 'Gừng sẻ mật ong Xuân Đường', 'Tiêu & Gia vị vùng đồi',
    'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái', 'Xã Xuân Đường', 'hũ 250g', 88000, 28, 'in_season',
    'NF-DN-077', NULL,
    'Gừng củ nhỏ cay ấm, thái lát mỏng tẩm mật ong hoa nhãn.',
    'Sản phẩm thuộc lô NF-DN-077 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/turmeric-ginger.jpg', '{/images/products/turmeric-ginger.jpg}', NULL, false, true
  ),
  (
    'P78', 'mit-nghe-bo-mui-bao-vinh', 'Mít nghệ bỏ hạt đóng khay Bảo Vinh', 'Trái cây tươi',
    'farm-bao-vinh-mit', 'Trang trại Mít & Ca cao Bảo Vinh', 'Phường Bảo Vinh', 'khay 600g', 48000, 35, 'in_season',
    'NF-DN-078', NULL,
    'Tách múi bỏ hạt sạch sẽ, đóng hộp mát giao trong ngày.',
    'Sản phẩm thuộc lô NF-DN-078 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/jackfruit-chips.jpg', '{/images/products/jackfruit-chips.jpg}', NULL, false, true
  ),
  (
    'P79', 'dau-ca-cao-tuoi-nam-cat-tien', 'Trái ca cao tươi chín cây Nam Cát Tiên', 'Trái cây tươi',
    'farm-nam-cat-tien-cacao', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Xã Nam Cát Tiên', 'kg', 36000, 25, 'in_season',
    'NF-DN-079', NULL,
    'Cơm thịt trắng chua ngọt dịu giàu chất chống oxy hóa, thu hái cuối tuần.',
    'Sản phẩm thuộc lô NF-DN-079 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-41.jpg', '{/images/stitch/stitch-41.jpg}', NULL, false, true
  ),
  (
    'P80', 'tra-la-oi-xuan-loc', 'Trà búp ổi non rang thơm Xuân Lộc', 'Nông sản chế biến & Mứt',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'hộp 200g', 62000, 30, 'in_season',
    'NF-DN-080', NULL,
    'Búp ổi non hái sáng sớm, sao mộc không hương liệu.',
    'Sản phẩm thuộc lô NF-DN-080 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-10.jpg', '{/images/stitch/stitch-10.jpg}', NULL, false, true
  ),
  (
    'P81', 'nuoc-ep-buoi-len-men-tan-an', 'Nước bưởi lên men nhẹ Tân An (18+)', 'Mật ong & Rượu trái cây',
    'farm-tan-an-buoi', 'Trang trại Bưởi Hữu cơ Tân An', 'Xã Tân An', 'chai 500ml', 95000, 20, 'in_season',
    'NF-DN-081', NULL,
    'Thức uống lên men tự nhiên nồng độ thấp vị thanh mát (chỉ dành cho người lớn từ 18 tuổi).',
    'Sản phẩm thuộc lô NF-DN-081 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/pomelo-oil.jpg', '{/images/products/pomelo-oil.jpg}', NULL, false, true
  ),
  (
    'P82', 'chuoi-su-tuoi-thanh-son', 'Chuối sứ già cây Thanh Sơn', 'Trái cây tươi',
    'farm-thanh-son-chuoi', 'Tổ hợp Chuối & Bưởi Thanh Sơn', 'Xã Thanh Sơn', 'nải ~2 kg', 44000, 40, 'in_season',
    'NF-DN-082', NULL,
    'Già cây chín tự nhiên không ngâm ủ hóa chất, ngọt dẻo thơm.',
    'Sản phẩm thuộc lô NF-DN-082 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/banana-dried.jpg', '{/images/products/banana-dried.jpg}', NULL, false, true
  ),
  (
    'P83', 'xoai-ba-mau-la-nga', 'Xoài Ba Màu giòn ngọt La Ngà', 'Trái cây tươi',
    'farm-la-nga-xoai', 'Tổ Hợp tác Xoài Bưởi La Ngà', 'Xã La Ngà', 'kg', 42000, 45, 'in_season',
    'NF-DN-083', NULL,
    'Vỏ ửng hồng tím nắng đẹp mắt, thịt vàng thơm giòn.',
    'Sản phẩm thuộc lô NF-DN-083 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-09.jpg', '{/images/stitch/stitch-09.jpg}', NULL, false, true
  ),
  (
    'P84', 'banh-phong-sen-dak-lua', 'Bánh phồng gạo ST25 hạt sen Đak Lua', 'Nông sản chế biến & Mứt',
    'farm-dak-lua-lua-sen', 'Cánh đồng Lúa Thơm & Sen Đak Lua', 'Xã Đak Lua', 'gói 300g', 54000, 36, 'in_season',
    'NF-DN-084', NULL,
    'Tráng mỏng phơi nắng gió đồng, giòn tan khi chiên hoặc nướng.',
    'Sản phẩm thuộc lô NF-DN-084 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/st25-rice-lotus.jpg', '{/images/products/st25-rice-lotus.jpg}', NULL, false, true
  ),
  (
    'P85', 'bot-nam-bao-ngu-dau-giay', 'Hạt nêm nấm bào ngư Dầu Giây', 'Tiêu & Gia vị vùng đồi',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hũ 250g', 86000, 32, 'in_season',
    'NF-DN-085', NULL,
    'Từ nấm bào ngư xám sấy nghiền mịn kết hợp muối biển và cà rốt.',
    'Sản phẩm thuộc lô NF-DN-085 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/mushroom-oyster.jpg', '{/images/products/mushroom-oyster.jpg}', NULL, false, true
  ),
  (
    'P86', 'rau-cang-cua-thuy-canh-tran-bien', 'Rau càng cua giòn sạch Trấn Biên', 'Rau củ & Nấm sạch',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'hộp 250g', 24000, 40, 'in_season',
    'NF-DN-086', NULL,
    'Nhặt sạch đóng khay tiện trộn gỏi thịt bò hoặc dầu giấm.',
    'Sản phẩm thuộc lô NF-DN-086 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P87', 'sot-muoi-tieu-chanh-bau-ham', 'Muối tiêu chanh Đồng Nai hũ nhỏ', 'Tiêu & Gia vị vùng đồi',
    'farm-bau-ham-tieu', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Xã Bàu Hàm', 'lọ 180g', 49000, 48, 'in_season',
    'NF-DN-087', NULL,
    'Rang từ muối hạt tinh, tiêu đen Bàu Hàm và lá chanh vườn.',
    'Sản phẩm thuộc lô NF-DN-087 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/pepper-spice-set.jpg', '{/images/products/pepper-spice-set.jpg}', NULL, false, true
  ),
  (
    'P88', 'nhan-say-tui-zip-xuan-bac', 'Long nhãn ăn liền túi zip Xuân Bắc', 'Nông sản chế biến & Mứt',
    'farm-xuan-bac-nhan', 'Trang trại Nhãn & Bưởi Xuân Bắc', 'Xã Xuân Bắc', 'túi 200g', 76000, 29, 'in_season',
    'NF-DN-088', NULL,
    'Tiện bỏ túi hoặc pha trà thảo mộc táo đỏ.',
    'Sản phẩm thuộc lô NF-DN-088 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/longan-dried.jpg', '{/images/products/longan-dried.jpg}', NULL, false, true
  ),
  (
    'P89', 'combo-gia-dinh-tan-trieu', 'Combo Quà Bưởi & Mứt Tân Triều', 'Quà tặng OCOP & Combo',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'hộp 3 món', 265000, 20, 'in_season',
    'NF-DN-089', NULL,
    'Gồm 2 kg bưởi da xanh + mứt vỏ bưởi mật ong + tinh dầu vỏ bưởi mini.',
    'Sản phẩm thuộc lô NF-DN-089 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-25.jpg', '{/images/stitch/stitch-25.jpg}', NULL, false, true
  ),
  (
    'P90', 'combo-an-vat-thanh-nien', 'Combo Ăn vặt Nông sản Thanh niên', 'Quà tặng OCOP & Combo',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'bộ 4 gói', 210000, 26, 'in_season',
    'NF-DN-090', NULL,
    'Mít sấy giòn + Chuối Laba sấy + Xoài sấy dẻo + Hạt sen giòn.',
    'Sản phẩm thuộc lô NF-DN-090 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P91', 'ca-phe-hat-arabica-phuoc-long', 'Cà phê hạt nguyên chất rang vừa Phước Long', 'Cà phê & Ca cao',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'túi 500g', 168000, 22, 'in_season',
    'NF-DN-091', NULL,
    'Hạt nguyên cho máy pha espresso hoặc xay tay tại nhà.',
    'Sản phẩm thuộc lô NF-DN-091 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-08.jpg', '{/images/stitch/stitch-08.jpg}', NULL, false, true
  ),
  (
    'P92', 'hat-dieu-khong-vo-lua-dak-nhau', 'Hạt điều trắng W320 tách vỏ lụa Đak Nhau', 'Hạt điều & Rang củi',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hộp 500g', 162000, 35, 'in_season',
    'NF-DN-092', NULL,
    'Nhân nguyên tách vỏ lụa sạch, phù hợp nấu sữa hạt hoặc làm bánh.',
    'Sản phẩm thuộc lô NF-DN-092 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-57.jpg', '{/images/stitch/stitch-57.jpg}', NULL, false, true
  ),
  (
    'P93', 'sua-hat-dieu-rang-binh-phuoc', 'Bột sữa hạt điều yến mạch Bình Phước', 'Hạt điều & Rang củi',
    'farm-binh-phuoc-dieu', 'HTX Hạt Điều Bazan Bình Phước', 'Phường Bình Phước', 'hũ 400g', 148000, 28, 'in_season',
    'NF-DN-093', NULL,
    'Xay mịn tiện pha nước ấm buổi sáng, vị béo tự nhiên không đường tinh luyện.',
    'Sản phẩm thuộc lô NF-DN-093 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/cashew-butter.jpg', '{/images/products/cashew-butter.jpg}', NULL, false, true
  ),
  (
    'P94', 'mat-ong-chanh-giam-ngo-cam-my', 'Mật ong gừng nghệ viên Cẩm Mỹ', 'Mật ong & Rượu trái cây',
    'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái', 'Xã Xuân Đường', 'hũ 250g', 135000, 24, 'in_season',
    'NF-DN-094', NULL,
    'Tinh bột nghệ kết hợp mật ong hoa nhãn vo viên nhỏ dễ dùng.',
    'Sản phẩm thuộc lô NF-DN-094 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/turmeric-ginger.jpg', '{/images/products/turmeric-ginger.jpg}', NULL, false, true
  ),
  (
    'P95', 'muoi-ot-tieu-den-xuan-loc', 'Muối chấm hoa quả tiêu đen Xuân Lộc', 'Tiêu & Gia vị vùng đồi',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'hũ 220g', 52000, 40, 'in_season',
    'NF-DN-095', NULL,
    'Hợp chấm ổi lê, xoài xanh và chôm chôm giòn.',
    'Sản phẩm thuộc lô NF-DN-095 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/pepper-spice-set.jpg', '{/images/products/pepper-spice-set.jpg}', NULL, false, true
  ),
  (
    'P96', 'sau-rieng-ri6-binh-loc-cat-giot', 'Sầu riêng Ri6 cơm ráo Bình Lộc', 'Chôm chôm & Sầu riêng',
    'farm-binh-loc-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Phường Bình Lộc', 'kg', 88000, 20, 'in_season',
    'NF-DN-096', NULL,
    'Thu hái tại Phường Bình Lộc, gắn tem QR ngày cắt trái.',
    'Sản phẩm thuộc lô NF-DN-096 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-49.jpg', '{/images/stitch/stitch-49.jpg}', NULL, false, true
  ),
  (
    'P97', 'combo-bua-trua-rau-nam-dong-nai', 'Combo Rau sạch & Nấm tươi Đồng Nai', 'Quà tặng OCOP & Combo',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'túi 1,5 kg', 118000, 30, 'in_season',
    'NF-DN-097', NULL,
    'Gồm Cải bó xôi Trấn Biên + Nấm bào ngư Dầu Giây + Nấm đùi gà mini.',
    'Sản phẩm thuộc lô NF-DN-097 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P98', 'buoi-nam-roi-binh-an-thuy-dien', 'Bưởi Năm Roi ít hạt Tân An', 'Bưởi & Cây có múi',
    'farm-tan-an-buoi', 'Trang trại Bưởi Hữu cơ Tân An', 'Xã Tân An', 'kg', 39000, 34, 'in_season',
    'NF-DN-098', NULL,
    'Vị chua ngọt cân bằng, dễ bóc múi làm nước ép thanh nhiệt.',
    'Sản phẩm thuộc lô NF-DN-098 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-53.jpg', '{/images/stitch/stitch-53.jpg}', NULL, false, true
  ),
  (
    'P99', 'chom-chom-nhan-binh-loc', 'Chôm chôm nhãn chín cây Bình Lộc', 'Chôm chôm & Sầu riêng',
    'farm-binh-loc-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Phường Bình Lộc', 'kg', 46000, 24, 'in_season',
    'NF-DN-099', NULL,
    'Hạt nhỏ ráo cùi, hái theo đơn đặt trước cuối tuần.',
    'Sản phẩm thuộc lô NF-DN-099 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-40.jpg', '{/images/stitch/stitch-40.jpg}', NULL, false, true
  ),
  (
    'P100', 'ca-phe-cold-brew-phuoc-long', 'Cà phê xay sẵn Cold Brew Phước Long', 'Cà phê & Ca cao',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'túi 350g', 132000, 28, 'in_season',
    'NF-DN-100', NULL,
    'Xay thô chuẩn ủ lạnh hương cam chanh dịu nhẹ.',
    'Sản phẩm thuộc lô NF-DN-100 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-08.jpg', '{/images/stitch/stitch-08.jpg}', NULL, false, true
  ),
  (
    'P101', 'hat-dieu-mat-ong-phuoc-son', 'Hạt điều rang mật ong rừng Phước Sơn', 'Hạt điều & Rang củi',
    'farm-phuoc-son-mat-ong', 'Tổ Hợp tác Điều & Mật Rừng Phước Sơn', 'Xã Phước Sơn', 'hũ 350g', 142000, 26, 'in_season',
    'NF-DN-101', NULL,
    'Áo lớp mật ong rừng Phước Sơn mỏng giòn bùi.',
    'Sản phẩm thuộc lô NF-DN-101 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-05.jpg', '{/images/stitch/stitch-05.jpg}', NULL, false, true
  ),
  (
    'P102', 'mut-chom-chom-gion-long-khanh', 'Chôm chôm sấy giòn Long Khánh', 'Nông sản chế biến & Mứt',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'túi 150g', 65000, 22, 'in_season',
    'NF-DN-102', NULL,
    'Chế biến từ chôm chôm Java Nhà vườn Ba Tư bảo quản giòn tự nhiên.',
    'Sản phẩm thuộc lô NF-DN-102 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P103', 'combo-cuoi-tuan-cam-my-xuan-loc', 'Combo Nông sản Vùng Đông Nam', 'Quà tặng OCOP & Combo',
    'farm-cam-my-sau-rieng', 'Vườn Sầu riêng Dona Cẩm Mỹ', 'Xã Cẩm Mỹ', 'hộp quà', 295000, 14, 'in_season',
    'NF-DN-103', NULL,
    'Kết hợp Mật ong Xuân Đường + Tiêu Bàu Hàm + Sầu riêng cấp đông Cẩm Mỹ.',
    'Sản phẩm thuộc lô NF-DN-103 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P104', 'naibox-95-dac-san-dong-nai', 'NaiBox 95 · Hộp tuyển chọn đặc sản Đồng Nai', 'Quà tặng OCOP & Combo',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'hộp 6 món', 395000, 24, 'in_season',
    'NF-DN-104', NULL,
    'Bộ sưu tập 6 nông sản tiêu biểu kết nối nhiều vùng Đồng Nai, đóng hộp kèm mã QR từng nguồn cung.',
    'Sản phẩm thuộc lô NF-DN-104 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P105', 'nairescue-buoi-tan-trieu-giai-cuu', 'NaiRescue · Bưởi chín rộ da rám đẹp ruột Tân Triều', 'Bưởi & Cây có múi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'túi 3 kg', 95000, 35, 'in_season',
    'NF-DN-105', NULL,
    'Trái chín ngọt đồng đều nhưng vỏ có vết rám nắng nhẹ, đủ chuẩn an toàn, giúp nhà vườn tiêu thụ kịp vụ.',
    'Sản phẩm thuộc lô NF-DN-105 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-35.jpg', '{/images/stitch/stitch-35.jpg}', NULL, false, true
  ),
  (
    'P106', 'nairescue-chom-chom-chin-nhanh-ba-tu', 'NaiRescue · Chôm chôm chín đỏ thu hái cuối tuần', 'Chôm chôm & Sầu riêng',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'sọt 3 kg', 84000, 28, 'in_season',
    'NF-DN-106', NULL,
    'Trái chín đỏ ngọt đậm cần giao nhanh trong ngày quanh Long Khánh và trung tâm Đồng Nai.',
    'Sản phẩm thuộc lô NF-DN-106 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-07.jpg', '{/images/stitch/stitch-07.jpg}', NULL, false, true
  ),
  (
    'P107', 'xoai-say-deo-thong-nhat', 'Xoài keo sấy dẻo Suối Tre Thống Nhất', 'Nông sản chế biến & Mứt',
    'farm-thong-nhat-xoai', 'Vườn Xoài Suối Tre Thống Nhất', 'Xã Thống Nhất', 'túi 300g', 86000, 34, 'in_season',
    'NF-DN-107', NULL,
    'Lát xoài cắt dày sấy nhiệt thấp giữ vị chua ngọt tự nhiên tại Xã Thống Nhất.',
    'Sản phẩm thuộc lô NF-DN-107 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P108', 'xoai-cat-hoa-loc-dat-truoc-thong-nhat', 'Xoài cát Hòa Lộc hái đợt Giáng Sinh (Đặt trước)', 'Trái cây tươi',
    'farm-thong-nhat-xoai', 'Vườn Xoài Suối Tre Thống Nhất', 'Xã Thống Nhất', 'kg', 68000, 0, 'pre_order',
    'NF-DN-108', NULL,
    'Đặt trước theo lứa bao trái sinh học — thông báo lịch hái trước 48 giờ.',
    'Sản phẩm thuộc lô NF-DN-108 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-09.jpg', '{/images/stitch/stitch-09.jpg}', NULL, false, true
  ),
  (
    'P109', 'tra-thao-moc-nhon-trach', 'Trà lá thảo mộc sao thủ công Nhơn Trạch', 'Nông sản chế biến & Mứt',
    'farm-nhon-trach-tra', 'Vườn Trà Thanh Yên Nhơn Trạch', 'Phường Nhơn Trạch', 'hộp 200g', 92000, 32, 'in_season',
    'NF-DN-109', NULL,
    'Thu hái sáng sớm và sao chảo gang truyền thống tại Phường Nhơn Trạch.',
    'Sản phẩm thuộc lô NF-DN-109 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-10.jpg', '{/images/stitch/stitch-10.jpg}', NULL, false, true
  ),
  (
    'P110', 'dua-mat-nhon-trach', 'Dứa mật chín ngọt Nhơn Trạch', 'Trái cây tươi',
    'farm-nhon-trach-tra', 'Vườn Trà Thanh Yên Nhơn Trạch', 'Phường Nhơn Trạch', 'trái ~1,2 kg', 28000, 44, 'in_season',
    'NF-DN-110', NULL,
    'Mắt dứa nở đều thơm mật, thích hợp ăn tươi hoặc ép nước thanh mát.',
    'Sản phẩm thuộc lô NF-DN-110 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dragonfruit-pineapple.jpg', '{/images/products/dragonfruit-pineapple.jpg}', NULL, false, true
  ),
  (
    'P111', 'mit-say-gion-long-thanh', 'Mít chín cây sấy giòn không đường Long Thành', 'Nông sản chế biến & Mứt',
    'farm-long-thanh-mit', 'Nông trại Mít & Sầu riêng Long Thành', 'Phường Long Thành', 'túi 250g', 74000, 40, 'in_season',
    'NF-DN-111', NULL,
    'Múi mít chín cây sấy giòn rụm giữ màu vàng tự nhiên.',
    'Sản phẩm thuộc lô NF-DN-111 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/jackfruit-chips.jpg', '{/images/products/jackfruit-chips.jpg}', NULL, false, true
  ),
  (
    'P112', 'thanh-long-ruot-do-phu-lam', 'Thanh long ruột đỏ hữu cơ Phú Lâm', 'Trái cây tươi',
    'farm-phu-lam-ong', 'Trại Ong Hoa Nhãn Phú Lâm', 'Xã Phú Lâm', 'kg', 34000, 38, 'in_season',
    'NF-DN-112', NULL,
    'Ruột đỏ sẫm ngọt dịu từ Xã Phú Lâm, đóng thùng lót xốp sạch.',
    'Sản phẩm thuộc lô NF-DN-112 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dragonfruit-pineapple.jpg', '{/images/products/dragonfruit-pineapple.jpg}', NULL, false, true
  ),
  (
    'P113', 'mat-ong-hoa-nhan-phu-lam-500ml', 'Mật ong hoa nhãn khai thác vụ xuân Phú Lâm', 'Mật ong & Rượu trái cây',
    'farm-phu-lam-ong', 'Trại Ong Hoa Nhãn Phú Lâm', 'Xã Phú Lâm', 'chai 500ml', 185000, 24, 'in_season',
    'NF-DN-113', NULL,
    'Mật sánh mịn vị thanh thơm hoa nhãn từ đàn ong Xã Phú Lâm.',
    'Sản phẩm thuộc lô NF-DN-113 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-06.jpg', '{/images/stitch/stitch-06.jpg}', NULL, false, true
  ),
  (
    'P114', 'sau-rieng-monthong-dak-o', 'Sầu riêng Monthong đồi Bù Gia Đắk Ơ', 'Chôm chôm & Sầu riêng',
    'farm-dak-o-bu-gia', 'Vườn Sầu riêng Đồi Bù Gia Đắk Ơ', 'Xã Đắk Ơ', 'kg', 98000, 26, 'in_season',
    'NF-DN-114', NULL,
    'Thịt quả dày khô ráo, thu cắt đúng độ tuổi trái tại Xã Đắk Ơ.',
    'Sản phẩm thuộc lô NF-DN-114 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-38.jpg', '{/images/stitch/stitch-38.jpg}', NULL, false, true
  ),
  (
    'P115', 'tieu-den-dak-o', 'Tiêu đen phơi giàn Đắk Ơ', 'Tiêu & Gia vị vùng đồi',
    'farm-dak-o-bu-gia', 'Vườn Sầu riêng Đồi Bù Gia Đắk Ơ', 'Xã Đắk Ơ', 'hũ 400g', 132000, 30, 'in_season',
    'NF-DN-115', NULL,
    'Hạt tiêu đều chắc cay nồng, sàng lọc sạch tạp chất tại vùng đồi phía Bắc.',
    'Sản phẩm thuộc lô NF-DN-115 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/black-pepper.jpg', '{/images/products/black-pepper.jpg}', NULL, false, true
  ),
  (
    'P116', 'rau-rung-tho-son-theo-mua', 'Rau rừng tổng hợp theo mùa Thọ Sơn', 'Rau củ & Nấm sạch',
    'farm-tho-son-non', 'Nông trại Điều & Rau Rừng Thọ Sơn', 'Xã Thọ Sơn', 'túi 400g', 35000, 22, 'in_season',
    'NF-DN-116', NULL,
    'Rau lá non bản địa thu hái sáng sớm và gói lá chuối giữ ẩm.',
    'Sản phẩm thuộc lô NF-DN-116 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P117', 'sa-chanh-huu-co-trang-bom', 'Sả chanh & Lá dứa tươi hữu cơ Trảng Bom', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-09', 'Tổ Hộ Trái cây Có múi Trảng Bom', 'Phường Trảng Bom', 'bó 500g', 26000, 42, 'in_season',
    'NF-DN-117', NULL,
    'Hái buổi sáng theo lịch vườn không phun thuốc hóa học tổng hợp.',
    'Sản phẩm thuộc lô NF-DN-117 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P118', 'tra-hoa-cuc-mat-ong-tan-trieu', 'Trà hoa cúc sấy lạnh & Mật nhãn Tân Triều', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-05', 'Tổ Sơ chế Vỏ bưởi Cô Sáu', 'Phường Tân Triều', 'hộp 180g', 112000, 28, 'in_season',
    'NF-DN-118', NULL,
    'Thảo mộc dịu nhẹ dùng ấm hoặc lạnh, không phẩm màu.',
    'Sản phẩm thuộc lô NF-DN-118 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-10.jpg', '{/images/stitch/stitch-10.jpg}', NULL, false, true
  ),
  (
    'P119', 'tia-to-hung-que-nha-mang', 'Rau gia vị tía tô & Húng quế nhà màng', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tran-bien-rau', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Phường Trấn Biên', 'hộp 250g', 28000, 35, 'in_season',
    'NF-DN-119', NULL,
    'Cắt gốc giữ ẩm giao nhanh nội tỉnh Đồng Nai trong ngày.',
    'Sản phẩm thuộc lô NF-DN-119 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P120', 'bo-qua-du-lich-vuon-ba-tu', 'Hộp quà Du lịch Vườn Ba Tư (Chôm chôm + Mứt)', 'Đặc sản du lịch & Hộp quà',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'hộp 2 kg', 145000, 24, 'in_season',
    'NF-DN-120', NULL,
    'Thiết kế gọn có quai xách cho khách tham quan cuối tuần và gia đình.',
    'Sản phẩm thuộc lô NF-DN-120 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P121', 'tui-luu-niem-buoi-tan-trieu', 'Bộ quà Du lịch Làng bưởi Tân Triều (3 món)', 'Đặc sản du lịch & Hộp quà',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'túi quà', 198000, 30, 'in_season',
    'NF-DN-121', NULL,
    'Gồm Bưởi tươi 1,5 kg, Mứt vỏ bưởi hũ nhỏ và Sổ tay câu chuyện cù lao song ngữ.',
    'Sản phẩm thuộc lô NF-DN-121 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-25.jpg', '{/images/stitch/stitch-25.jpg}', NULL, false, true
  ),
  (
    'P122', 'hop-qua-cuoi-nam-xuan-loc', 'Hộp Quà Cuối năm Hạt điều – Cà phê – Ca cao', 'Đặc sản du lịch & Hộp quà',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'hộp 3 món', 325000, 26, 'in_season',
    'NF-DN-122', NULL,
    'Thích hợp làm quà lưu niệm cho khách du lịch và đoàn trường học, gắn mã QR từng xưởng.',
    'Sản phẩm thuộc lô NF-DN-122 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P123', 'dac-san-dong-nai-v4-01', 'Bưởi da xanh tuyển lứa 01 Tân Triều', 'Bưởi & Cây có múi',
    'farm-tt-ho-01', 'Hộ Bưởi Chú Năm Tân Triều', 'Phường Tân Triều', 'kg', 45000, 0, 'pre_order',
    'NF-DN-123', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-123 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P124', 'dac-san-dong-nai-v4-02', 'Sầu riêng cơm vàng lứa #02', 'Chôm chôm & Sầu riêng',
    'farm-tt-ho-02', 'Hộ Bưởi Cô Bảy Cù Lao', 'Phường Tân Triều', 'hộp 400g', 63000, 23, 'in_season',
    'NF-DN-124', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-124 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P125', 'dac-san-dong-nai-v4-03', 'Hạt điều rang mộc lô 03 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-tt-ho-03', 'Hộ Canh tác Sinh học Anh Tư Tân Triều', 'Phường Tân Triều', 'hộp 400g', 81000, 24, 'in_season',
    'NF-DN-125', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-125 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P126', 'dac-san-dong-nai-v4-04', 'Sô-cô-la & Ca cao Đồng Nai #04', 'Cà phê & Ca cao',
    'farm-tt-ho-04', 'Hộ Bưởi Chú Mười Phù Sa', 'Phường Tân Triều', 'hộp 400g', 99000, 25, 'in_season',
    'NF-DN-126', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-126 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P127', 'dac-san-dong-nai-v4-05', 'Nông sản chế biến Đồng Nai #05', 'Nông sản chế biến & Mứt',
    'farm-tt-ho-05', 'Tổ Sơ chế Vỏ bưởi Cô Sáu', 'Phường Tân Triều', 'hộp 400g', 117000, 26, 'in_season',
    'NF-DN-127', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-127 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P128', 'dac-san-dong-nai-v4-06', 'Thảo mộc & Gia vị vườn đồi #06', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-06', 'Hộ Bưởi Da xanh Anh Hùng Tân An', 'Xã Tân An', 'hộp 400g', 135000, 27, 'in_season',
    'NF-DN-128', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-128 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P129', 'dac-san-dong-nai-v4-07', 'Túi quà trải nghiệm Đồng Nai #07', 'Đặc sản du lịch & Hộp quà',
    'farm-tt-ho-07', 'Hộ Bưởi Đường Chị Lan Trị An', 'Phường Trị An', 'hộp quà', 153000, 28, 'in_season',
    'NF-DN-129', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-129 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P130', 'dac-san-dong-nai-v4-08', 'Nông sản chế biến Đồng Nai #08', 'Quà tặng OCOP & Combo',
    'farm-tt-ho-08', 'Hộ Bưởi Vườn Phố Ông Bảy Biên Hòa', 'Phường Biên Hòa', 'hộp 400g', 171000, 29, 'in_season',
    'NF-DN-130', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-130 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P131', 'dac-san-dong-nai-v4-09', 'Bưởi da xanh tuyển lứa 09 Tân Triều', 'Bưởi & Cây có múi',
    'farm-tt-ho-09', 'Tổ Hộ Trái cây Có múi Trảng Bom', 'Phường Trảng Bom', 'kg', 45000, 30, 'in_season',
    'NF-DN-131', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-131 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P132', 'dac-san-dong-nai-v4-10', 'Sầu riêng cơm vàng lứa #10', 'Chôm chôm & Sầu riêng',
    'farm-tt-ho-10', 'Hộ Liên kết Bưởi Đông Bắc Tân Triều', 'Phường Tân Triều', 'hộp 400g', 63000, 0, 'pre_order',
    'NF-DN-132', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-132 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P133', 'dac-san-dong-nai-v4-11', 'Hạt điều rang mộc lô 11 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'hộp 400g', 81000, 32, 'in_season',
    'NF-DN-133', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-133 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P134', 'dac-san-dong-nai-v4-12', 'Sô-cô-la & Ca cao Đồng Nai #12', 'Cà phê & Ca cao',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hộp 400g', 99000, 33, 'in_season',
    'NF-DN-134', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-134 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P135', 'dac-san-dong-nai-v4-13', 'Nông sản chế biến Đồng Nai #13', 'Nông sản chế biến & Mứt',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'hộp 400g', 117000, 34, 'in_season',
    'NF-DN-135', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-135 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P136', 'dac-san-dong-nai-v4-14', 'Thảo mộc & Gia vị vườn đồi #14', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hộp 400g', 135000, 35, 'in_season',
    'NF-DN-136', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-136 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P137', 'dac-san-dong-nai-v4-15', 'Túi quà trải nghiệm Đồng Nai #15', 'Đặc sản du lịch & Hộp quà',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'hộp quà', 153000, 36, 'in_season',
    'NF-DN-137', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-137 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P138', 'dac-san-dong-nai-v4-16', 'Nông sản chế biến Đồng Nai #16', 'Quà tặng OCOP & Combo',
    'farm-tt-ho-01', 'Hộ Bưởi Chú Năm Tân Triều', 'Phường Tân Triều', 'hộp 400g', 171000, 37, 'in_season',
    'NF-DN-138', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-138 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P139', 'dac-san-dong-nai-v4-17', 'Bưởi da xanh tuyển lứa 17 Tân Triều', 'Bưởi & Cây có múi',
    'farm-tt-ho-02', 'Hộ Bưởi Cô Bảy Cù Lao', 'Phường Tân Triều', 'kg', 45000, 38, 'in_season',
    'NF-DN-139', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-139 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P140', 'dac-san-dong-nai-v4-18', 'Sầu riêng cơm vàng lứa #18', 'Chôm chôm & Sầu riêng',
    'farm-tt-ho-03', 'Hộ Canh tác Sinh học Anh Tư Tân Triều', 'Phường Tân Triều', 'hộp 400g', 63000, 39, 'in_season',
    'NF-DN-140', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-140 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P141', 'dac-san-dong-nai-v4-19', 'Hạt điều rang mộc lô 19 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-tt-ho-04', 'Hộ Bưởi Chú Mười Phù Sa', 'Phường Tân Triều', 'hộp 400g', 81000, 0, 'pre_order',
    'NF-DN-141', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-141 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P142', 'dac-san-dong-nai-v4-20', 'Sô-cô-la & Ca cao Đồng Nai #20', 'Cà phê & Ca cao',
    'farm-tt-ho-05', 'Tổ Sơ chế Vỏ bưởi Cô Sáu', 'Phường Tân Triều', 'hộp 400g', 99000, 41, 'in_season',
    'NF-DN-142', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-142 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P143', 'dac-san-dong-nai-v4-21', 'Nông sản chế biến Đồng Nai #21', 'Nông sản chế biến & Mứt',
    'farm-tt-ho-06', 'Hộ Bưởi Da xanh Anh Hùng Tân An', 'Xã Tân An', 'hộp 400g', 117000, 42, 'in_season',
    'NF-DN-143', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-143 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P144', 'dac-san-dong-nai-v4-22', 'Thảo mộc & Gia vị vườn đồi #22', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-07', 'Hộ Bưởi Đường Chị Lan Trị An', 'Phường Trị An', 'hộp 400g', 135000, 43, 'in_season',
    'NF-DN-144', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-144 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P145', 'dac-san-dong-nai-v4-23', 'Túi quà trải nghiệm Đồng Nai #23', 'Đặc sản du lịch & Hộp quà',
    'farm-tt-ho-08', 'Hộ Bưởi Vườn Phố Ông Bảy Biên Hòa', 'Phường Biên Hòa', 'hộp quà', 153000, 44, 'in_season',
    'NF-DN-145', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-145 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P146', 'dac-san-dong-nai-v4-24', 'Nông sản chế biến Đồng Nai #24', 'Quà tặng OCOP & Combo',
    'farm-tt-ho-09', 'Tổ Hộ Trái cây Có múi Trảng Bom', 'Phường Trảng Bom', 'hộp 400g', 171000, 45, 'in_season',
    'NF-DN-146', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-146 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P147', 'dac-san-dong-nai-v4-25', 'Bưởi da xanh tuyển lứa 25 Tân Triều', 'Bưởi & Cây có múi',
    'farm-tt-ho-10', 'Hộ Liên kết Bưởi Đông Bắc Tân Triều', 'Phường Tân Triều', 'kg', 45000, 46, 'in_season',
    'NF-DN-147', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-147 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P148', 'dac-san-dong-nai-v4-26', 'Sầu riêng cơm vàng lứa #26', 'Chôm chôm & Sầu riêng',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'hộp 400g', 63000, 22, 'in_season',
    'NF-DN-148', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-148 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P149', 'dac-san-dong-nai-v4-27', 'Hạt điều rang mộc lô 27 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hộp 400g', 81000, 23, 'in_season',
    'NF-DN-149', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-149 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P150', 'dac-san-dong-nai-v4-28', 'Sô-cô-la & Ca cao Đồng Nai #28', 'Cà phê & Ca cao',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'hộp 400g', 99000, 0, 'pre_order',
    'NF-DN-150', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-150 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P151', 'dac-san-dong-nai-v4-29', 'Nông sản chế biến Đồng Nai #29', 'Nông sản chế biến & Mứt',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hộp 400g', 117000, 25, 'in_season',
    'NF-DN-151', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-151 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P152', 'dac-san-dong-nai-v4-30', 'Thảo mộc & Gia vị vườn đồi #30', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'hộp 400g', 135000, 26, 'in_season',
    'NF-DN-152', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-152 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P153', 'dac-san-dong-nai-v4-31', 'Túi quà trải nghiệm Đồng Nai #31', 'Đặc sản du lịch & Hộp quà',
    'farm-tt-ho-01', 'Hộ Bưởi Chú Năm Tân Triều', 'Phường Tân Triều', 'hộp quà', 153000, 27, 'in_season',
    'NF-DN-153', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-153 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P154', 'dac-san-dong-nai-v4-32', 'Nông sản chế biến Đồng Nai #32', 'Quà tặng OCOP & Combo',
    'farm-tt-ho-02', 'Hộ Bưởi Cô Bảy Cù Lao', 'Phường Tân Triều', 'hộp 400g', 171000, 28, 'in_season',
    'NF-DN-154', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-154 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P155', 'dac-san-dong-nai-v4-33', 'Bưởi da xanh tuyển lứa 33 Tân Triều', 'Bưởi & Cây có múi',
    'farm-tt-ho-03', 'Hộ Canh tác Sinh học Anh Tư Tân Triều', 'Phường Tân Triều', 'kg', 45000, 29, 'in_season',
    'NF-DN-155', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-155 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P156', 'dac-san-dong-nai-v4-34', 'Sầu riêng cơm vàng lứa #34', 'Chôm chôm & Sầu riêng',
    'farm-tt-ho-04', 'Hộ Bưởi Chú Mười Phù Sa', 'Phường Tân Triều', 'hộp 400g', 63000, 30, 'in_season',
    'NF-DN-156', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-156 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P157', 'dac-san-dong-nai-v4-35', 'Hạt điều rang mộc lô 35 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-tt-ho-05', 'Tổ Sơ chế Vỏ bưởi Cô Sáu', 'Phường Tân Triều', 'hộp 400g', 81000, 31, 'in_season',
    'NF-DN-157', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-157 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P158', 'dac-san-dong-nai-v4-36', 'Sô-cô-la & Ca cao Đồng Nai #36', 'Cà phê & Ca cao',
    'farm-tt-ho-06', 'Hộ Bưởi Da xanh Anh Hùng Tân An', 'Xã Tân An', 'hộp 400g', 99000, 32, 'in_season',
    'NF-DN-158', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-158 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P159', 'dac-san-dong-nai-v4-37', 'Nông sản chế biến Đồng Nai #37', 'Nông sản chế biến & Mứt',
    'farm-tt-ho-07', 'Hộ Bưởi Đường Chị Lan Trị An', 'Phường Trị An', 'hộp 400g', 117000, 0, 'pre_order',
    'NF-DN-159', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-159 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P160', 'dac-san-dong-nai-v4-38', 'Thảo mộc & Gia vị vườn đồi #38', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-08', 'Hộ Bưởi Vườn Phố Ông Bảy Biên Hòa', 'Phường Biên Hòa', 'hộp 400g', 135000, 34, 'in_season',
    'NF-DN-160', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-160 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  ),
  (
    'P161', 'dac-san-dong-nai-v4-39', 'Túi quà trải nghiệm Đồng Nai #39', 'Đặc sản du lịch & Hộp quà',
    'farm-tt-ho-09', 'Tổ Hộ Trái cây Có múi Trảng Bom', 'Phường Trảng Bom', 'hộp quà', 153000, 35, 'in_season',
    'NF-DN-161', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-161 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P162', 'dac-san-dong-nai-v4-40', 'Nông sản chế biến Đồng Nai #40', 'Quà tặng OCOP & Combo',
    'farm-tt-ho-10', 'Hộ Liên kết Bưởi Đông Bắc Tân Triều', 'Phường Tân Triều', 'hộp 400g', 171000, 36, 'in_season',
    'NF-DN-162', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-162 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/ocop-gift-basket.jpg', '{/images/products/ocop-gift-basket.jpg}', NULL, false, true
  ),
  (
    'P163', 'dac-san-dong-nai-v4-41', 'Bưởi da xanh tuyển lứa 41 Tân Triều', 'Bưởi & Cây có múi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 45000, 37, 'in_season',
    'NF-DN-163', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-163 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-24.jpg', '{/images/stitch/stitch-24.jpg}', NULL, false, true
  ),
  (
    'P164', 'dac-san-dong-nai-v4-42', 'Sầu riêng cơm vàng lứa #42', 'Chôm chôm & Sầu riêng',
    'farm-dak-nhau-dieu', 'Vườn Điều Hữu cơ Đak Nhau', 'Xã Đak Nhau', 'hộp 400g', 63000, 38, 'in_season',
    'NF-DN-164', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-164 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-04.jpg', '{/images/stitch/stitch-04.jpg}', NULL, false, true
  ),
  (
    'P165', 'dac-san-dong-nai-v4-43', 'Hạt điều rang mộc lô 43 Đồng Nai', 'Hạt điều & Rang củi',
    'farm-phuoc-long-bo', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Phường Phước Long', 'hộp 400g', 81000, 39, 'in_season',
    'NF-DN-165', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-165 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/stitch/stitch-34.jpg', '{/images/stitch/stitch-34.jpg}', NULL, false, true
  ),
  (
    'P166', 'dac-san-dong-nai-v4-44', 'Sô-cô-la & Ca cao Đồng Nai #44', 'Cà phê & Ca cao',
    'farm-dau-giay-nam', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Phường Dầu Giây', 'hộp 400g', 99000, 40, 'in_season',
    'NF-DN-166', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-166 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/chocolate-cacao.jpg', '{/images/products/chocolate-cacao.jpg}', NULL, false, true
  ),
  (
    'P167', 'dac-san-dong-nai-v4-45', 'Nông sản chế biến Đồng Nai #45', 'Nông sản chế biến & Mứt',
    'farm-tri-an-xoai', 'Hợp tác xã Xoài & Bưởi Trị An', 'Phường Trị An', 'hộp 400g', 117000, 41, 'in_season',
    'NF-DN-167', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-167 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/dried-mango.jpg', '{/images/products/dried-mango.jpg}', NULL, false, true
  ),
  (
    'P168', 'dac-san-dong-nai-v4-46', 'Thảo mộc & Gia vị vườn đồi #46', 'Thảo mộc & Gia vị hữu cơ mẫu',
    'farm-tt-ho-01', 'Hộ Bưởi Chú Năm Tân Triều', 'Phường Tân Triều', 'hộp 400g', 135000, 0, 'pre_order',
    'NF-DN-168', NULL,
    'Sản phẩm nằm trong danh mục mở rộng mùa lễ hội & du lịch nông nghiệp Đồng Nai, có tem QR nhật ký theo lô.',
    'Sản phẩm thuộc lô NF-DN-168 đồng bộ nhật ký mùa vụ và mã QR truy xuất nguồn gốc.',
    '/images/products/hydroponic-greens.jpg', '{/images/products/hydroponic-greens.jpg}', NULL, false, true
  )
on conflict (id) do nothing;
