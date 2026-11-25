insert into public.admin_units (code, full_name, level, lat, lng) values
  ('26188', 'Phường Tân Triều', 'Phường', 11.007288, 106.816938),
  ('26080', 'Phường Long Khánh', 'Phường', 10.920043, 107.270034),
  ('26347', 'Xã Xuân Đường', 'Xã', 10.778493, 107.140041),
  ('26341', 'Xã Cẩm Mỹ', 'Xã', 10.813651, 107.272652),
  ('26206', 'Xã Định Quán', 'Xã', 11.150745, 107.369172),
  ('26425', 'Phường Xuân Lộc', 'Phường', 10.928186, 107.378463),
  ('26041', 'Phường Trấn Biên', 'Phường', 10.940865, 106.836626),
  ('26068', 'Phường Biên Hoà', 'Phường', 10.935851, 106.792613)
on conflict (code) do nothing;

insert into public.farms (
  id, slug, name, owner_name, owner_age_label, region, address_label, admin_unit_code,
  lat, lng, area_ha, main_crops, ocop_status, ocop_label, ocop_note, story_headline,
  story_summary, banner_image, owner_portrait, gallery_images, youth_supporters, is_demo
) values
  (
    'farm-ba-minh-tan-trieu', 'vuon-buoi-chu-ba-minh', 'Vườn Bưởi Chú Ba Minh', 'Chú Ba Minh',
    'Nông hộ 58 tuổi', 'Phường Tân Triều', 'Cù lao Tân Triều, Phường Tân Triều, TP. Đồng Nai',
    '26188', 11.007288, 106.816938, 2.2,
    array['Bưởi da xanh Tân Triều', 'Bưởi đường lá cam', 'Rượu bưởi', 'Mứt vỏ bưởi'],
    'coop_checked_demo', 'Hồ sơ đã đối chiếu',
    'Nhà vườn tự khai nhật ký canh tác; HTX Tân Triều đối chiếu chứng từ định kỳ (chưa thay thế giấy chứng nhận pháp lý OCOP).',
    'Ký ức phù sa & Cái tâm người làm vườn cù lao',
    'Hơn ba thập kỷ bám đất phù sa sông Đồng Nai, Chú Ba Minh giữ lối canh tác hữu cơ truyền thống và đồng hành cùng sinh viên Đại học Đồng Nai để đưa trái bưởi đường lá cam lên chợ số.',
    'stitch/stitch-12.webp', 'stitch/stitch-13.webp',
    array['stitch/stitch-19.webp', 'stitch/stitch-20.webp', 'stitch/stitch-21.webp', 'stitch/stitch-22.webp'],
    array['Nguyễn Văn An (ĐH Đồng Nai)', 'Minh Anh (Đoàn viên hỗ trợ)'], true
  ),
  (
    'farm-ba-tu-demo', 'nha-vuon-ba-tu-long-khanh', 'Nhà vườn Ba Tư', 'Chú Ba Tư',
    'Nông hộ 50 tuổi', 'Phường Long Khánh', 'Phường Long Khánh, TP. Đồng Nai',
    '26080', 10.920043, 107.270034, 2.5,
    array['Chôm chôm Java', 'Chôm chôm nhãn', 'Sầu riêng Ri6'],
    'self_declared_unverified', 'Chưa xác minh OCOP chính thức',
    'Thông tin vườn và nhật ký mùa vụ do chú Ba Tư tự khai cùng 2 đoàn viên Minh Anh & Tuấn ghi nhận; chưa gắn sao OCOP chính thức.',
    '2,5 ha đất đỏ bazan Long Khánh bước lên chợ số cùng thanh niên',
    'Canh tác 2,5 ha chôm chôm và sầu riêng theo hướng an toàn tại Long Khánh, chú Ba Tư bắt đầu bán hàng trực tuyến qua 3 bước chụp ảnh và ghi âm giọng nói cùng hai đoàn viên tình nguyện.',
    'stitch/stitch-40.webp', 'stitch/stitch-11.webp',
    array['stitch/stitch-07.webp', 'stitch/stitch-04.webp', 'stitch/stitch-30.webp', 'stitch/stitch-32.webp'],
    array['Minh Anh (Đoàn viên)', 'Tuấn (Đoàn viên)'], true
  ),
  (
    'farm-co-tu-cam-my', 'vuon-co-tu-sinh-thai-cam-my', 'Vườn Cô Tư Sinh Thái', 'Cô Tư',
    'Nông hộ 52 tuổi', 'Cẩm Mỹ & Định Quán', 'Xã Xuân Đường, TP. Đồng Nai',
    '26347', 10.778493, 107.140041, 3.1,
    array['Sầu riêng hạt lép', 'Mật ong hoa nhãn'],
    'pending_review', 'Đang chờ đối chiếu hồ sơ',
    'Hồ sơ đang trong hàng chờ đối chiếu của Điều phối viên khu vực Cẩm Mỹ.',
    'Vườn cây ăn trái kết hợp nuôi ong hoa nhãn tự nhiên',
    'Vườn Cô Tư trồng xen canh sầu riêng Ri6 với đàn ong lấy mật mùa hoa nhãn, giữ thảm cỏ sinh học bảo vệ đất đỏ.',
    'stitch/stitch-38.webp', 'stitch/stitch-54.webp',
    array['stitch/stitch-49.webp', 'stitch/stitch-06.webp'],
    array['Đội TNV Cẩm Mỹ'], true
  ),
  (
    'farm-htx-xuan-loc', 'htx-nong-nghiep-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Tổ hợp tác Xuân Lộc',
    'Hợp tác xã địa phương', 'Phường Xuân Lộc', 'Phường Xuân Lộc, TP. Đồng Nai',
    '26425', 10.928186, 107.378463, 12.0,
    array['Hạt điều rang muối vỏ lụa', 'Cà phê rang mộc', 'Ổi lê Suối Cát'],
    'coop_checked_demo', 'Hồ sơ đã đối chiếu',
    'Tập hợp 42 hộ xã viên chế biến hạt điều rang củi truyền thống và cây ăn trái Suối Cát.',
    'Giữ lửa chảo rang điều củi & chuẩn hóa tem truy xuất HTX',
    'Các xã viên Xuân Lộc kết hợp quy trình rang củi thủ công cùng sự hỗ trợ đóng gói, dán mã QR lô hàng từ đội trí thức trẻ.',
    'stitch/stitch-39.webp', 'stitch/stitch-50.webp',
    array['stitch/stitch-05.webp', 'stitch/stitch-08.webp', 'stitch/stitch-51.webp'],
    array['Nhóm TNV Số hóa Xuân Lộc'], true
  )
on conflict (id) do nothing;

insert into public.experiences (
  id, farm_id, title, duration, price_per_guest, max_guests, schedule_summary, safety_note, image
) values
  (
    'exp-tan-trieu-01', 'farm-ba-minh-tan-trieu', 'Một ngày làm nông dân cù lao cùng Chú Ba Minh',
    'Nửa ngày (08:30 – 11:30)', 90000, 15,
    'Thứ Bảy & Chủ Nhật hàng tuần (Đặt yêu cầu chờ chủ vườn xác nhận)',
    'Trang bị nón lá, ủng đi vườn và hướng dẫn cắt trái an toàn tại liếp.', 'stitch/stitch-21.webp'
  ),
  (
    'exp-ba-tu-01', 'farm-ba-tu-demo', 'Tham quan vườn chôm chôm – sầu riêng Ba Tư & Hái trái theo mùa',
    '3 giờ (08:00 – 11:00)', 60000, 12,
    'Theo lịch mùa vụ tháng 5–8 & cuối tuần (Yêu cầu chờ xác nhận)',
    'Không tự ý tách trái khi chưa có hướng dẫn; ưu tiên nhóm gia đình & sinh viên.', 'stitch/stitch-40.webp'
  ),
  (
    'exp-co-tu-01', 'farm-co-tu-cam-my', 'Tìm hiểu nuôi ong hoa nhãn & Quy trình tỉa trái sầu riêng',
    '2,5 giờ', 75000, 10, 'Sáng Thứ Bảy cách tuần (Chờ xác nhận)',
    'Cung cấp mũ lưới bảo hộ khu vực thùng ong.', 'stitch/stitch-49.webp'
  ),
  (
    'exp-xuan-loc-01', 'farm-htx-xuan-loc', 'Trải nghiệm xưởng rang hạt điều củi & Đóng gói nông sản',
    '2 giờ', 85000, 20, 'Thứ Năm & Chủ Nhật (Chờ xác nhận)',
    'Giữ khoảng cách an toàn khu vực bếp rang củi.', 'stitch/stitch-50.webp'
  )
on conflict (id) do nothing;

insert into public.products (
  id, slug, name, category, farm_id, farm_name, region, unit_label, price_vnd, stock_kg,
  season_status, batch_code, brix_note, short_description, story_note, image, gallery,
  weight_options, has_3d_viewer, is_demo
) values
  (
    'P01', 'chom-chom-java-long-khanh', 'Chôm chôm Java Long Khánh', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 35000, 30, 'in_season',
    'NF-DEMO-001', 'Độ ngọt tự nhiên ~16–18° Brix (mẫu demo)',
    'Chôm chôm Java hái tại vườn Ba Tư (2,5 ha đất đỏ bazan Long Khánh), trái giòn, ráo nước, đóng giỏ rơm sạch giao trong ngày.',
    'Lô NF-DEMO-001 do chú Ba Tư và đoàn viên Minh Anh chụp ảnh, cân đo và ghi nhật ký mùa vụ minh họa.',
    'stitch/stitch-07.webp',
    array['stitch/stitch-07.webp', 'stitch/stitch-40.webp', 'stitch/stitch-32.webp'],
    '[{"label":"2 kg (Giỏ gia đình)","kgMultiplier":2,"priceVnd":70000},{"label":"5 kg (Thùng rơm)","kgMultiplier":5,"priceVnd":175000}]'::jsonb,
    false, true
  ),
  (
    'P06', 'buoi-da-xanh-tan-trieu', 'Bưởi da xanh Tân Triều', 'Trái cây tươi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'kg', 45000, 42, 'in_season',
    'NF-TT-2026-01', 'Tép hồng mọng nước, 11.8° Brix (đo mẫu tại vườn)',
    'Bưởi da xanh ruột hồng cù lao Tân Triều, vỏ mỏng, tép ráo giòn ngọt thanh, có hộ chiếu QR truy xuất 3 chặng.',
    'Được cắt tại liếp vườn phù sa của Chú Ba Minh và dán tem QR cùng bạn Nguyễn Văn An (TNV ĐH Đồng Nai).',
    'stitch/stitch-03.webp',
    array['stitch/stitch-24.webp', 'stitch/stitch-25.webp', 'stitch/stitch-26.webp', 'stitch/stitch-27.webp'],
    '[{"label":"2 kg (Khoảng 1–2 trái)","kgMultiplier":2,"priceVnd":90000},{"label":"5 kg (Thùng gia đình)","kgMultiplier":5,"priceVnd":225000},{"label":"10 kg (Thùng quà biếu)","kgMultiplier":10,"priceVnd":450000}]'::jsonb,
    true, true
  ),
  (
    'P07', 'buoi-duong-la-cam-tan-trieu', 'Bưởi đường lá cam Tân Triều', 'Trái cây tươi',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'kg', 42000, 28, 'in_season',
    'NF-TT-2026-01', 'Ngọt thanh truyền thống, 12.2° Brix',
    'Đặc sản truyền thống đất Tân Triều, trái tròn vừa tay, mùi lá cam thơm dịu, thích hợp biếu tặng hoặc thưởng thức tại vườn.',
    'Sản phẩm trọng tâm trong phiên OCOP Live Story Room cùng Chú Ba Minh.',
    'stitch/stitch-15.webp',
    array['stitch/stitch-44.webp', 'stitch/stitch-45.webp', 'stitch/stitch-53.webp'],
    '[{"label":"2 kg","kgMultiplier":2,"priceVnd":84000},{"label":"5 kg","kgMultiplier":5,"priceVnd":210000}]'::jsonb,
    true, true
  ),
  (
    'P04', 'sau-rieng-ri6-long-khanh', 'Sầu riêng Ri6 Long Khánh', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 85000, 18, 'in_season',
    'NF-DEMO-001', 'Cơm vàng hạt lép, thu hoạch chín cây tự nhiên (demo)',
    'Sầu riêng Ri6 trồng tại vườn Ba Tư, cắt già tự nhiên theo nhật ký vườn, không nhúng hóa chất ép chín.',
    'Thuộc danh mục 5 sản phẩm chủ lực của Nhà vườn Ba Tư theo lô demo.',
    'stitch/stitch-04.webp',
    array['stitch/stitch-04.webp', 'stitch/stitch-38.webp', 'stitch/stitch-49.webp'],
    '[{"label":"2 kg (1 trái nhỏ)","kgMultiplier":2,"priceVnd":170000},{"label":"4 kg (1 trái lớn)","kgMultiplier":4,"priceVnd":340000}]'::jsonb,
    false, true
  ),
  (
    'P05', 'sau-rieng-tuyen-chon-dong-nai', 'Sầu riêng tuyển chọn Ba Tư', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 120000, 12, 'in_season',
    'NF-DEMO-001', null,
    'Trái tuyển chọn tỉ lệ hộc đều, cơm dày dẻo béo, thu hoạch từ cây lâu năm tại vườn Ba Tư.',
    'Phân loại kỹ bởi chủ vườn, giao kèm tem mã lô NF-DEMO-001.',
    'stitch/stitch-38.webp',
    array['stitch/stitch-38.webp', 'stitch/stitch-04.webp'],
    null, false, true
  ),
  (
    'P02', 'chom-chom-nhan-hen-mua', 'Chôm chôm nhãn Long Khánh', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 45000, 0, 'pre_order',
    'NF-DEMO-001', null,
    'Giống chôm chôm nhãn trái nhỏ, hạt tróc ráo nước. Đợt trái hiện tại đang chờ vào độ chín rộ — mở đăng ký theo dõi vụ mùa.',
    'Minh họa trạng thái hết tồn sẵn / Hẹn mùa theo quy tắc STITCH_PLAYBOOK.',
    'stitch/stitch-40.webp',
    array['stitch/stitch-40.webp', 'stitch/stitch-07.webp'],
    null, false, true
  ),
  (
    'P03', 'chom-chom-tuyen-chon-hen-mua', 'Chôm chôm tuyển chọn đóng hộp', 'Trái cây tươi',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'Phường Long Khánh', 'kg', 60000, 0, 'pre_order',
    'NF-DEMO-001', null,
    'Chùm chôm chôm cắt lựa trái đồng đều dành cho giỏ quà. Hiện tạm hết tồn sẵn trong kho demo — bấm Theo dõi vụ mùa.',
    'Trạng thái hẹn mùa minh họa giúp khách theo dõi đợt thu hoạch kế tiếp.',
    'stitch/stitch-07.webp',
    array['stitch/stitch-07.webp'],
    null, false, true
  ),
  (
    'P08', 'hat-dieu-rang-muoi-vo-lua-xuan-loc', 'Hạt điều rang muối vỏ lụa Xuân Lộc', 'Hạt & Cà phê',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'hộp 500g', 145000, 35, 'in_season',
    'NF-XL-2026-03', null,
    'Hạt điều nhân A+ rang củi truyền thống giữ nguyên vỏ lụa giòn thơm tại HTX Xuân Lộc, đóng hộp hút chân không.',
    'Cũng là sản phẩm minh họa trong bài học "Hành trình hạt điều Đồng Nai" tại NaiAcademy.',
    'stitch/stitch-05.webp',
    array['stitch/stitch-34.webp', 'stitch/stitch-39.webp', 'stitch/stitch-50.webp'],
    null, false, true
  ),
  (
    'P09', 'mat-ong-hoa-nhan-cam-my', 'Mật ong hoa nhãn Cẩm Mỹ', 'Mật ong & Đặc sản',
    'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái', 'Cẩm Mỹ & Định Quán', 'chai 500ml', 180000, 19, 'in_season',
    'NF-XL-2026-03', null,
    'Mật ong khai thác từ các thùng ong đặt dưới tán vườn nhãn và sầu riêng Cẩm Mỹ, màu vàng hổ phách tự nhiên.',
    'Đóng chai thủy tinh sạch, có nhãn ghi rõ ngày quay mật tại vườn Cô Tư.',
    'stitch/stitch-06.webp',
    array['stitch/stitch-06.webp'],
    null, false, true
  ),
  (
    'P10', 'ruou-buoi-tan-trieu-chum-sanh', 'Rượu bưởi Tân Triều chum sành', 'Mật ong & Đặc sản',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'chum 750ml', 165000, 14, 'in_season',
    'NF-TT-2026-01', null,
    'Đặc sản lên men từ nước ép bưởi đường lá cam Tân Triều đựng trong chum sành mộc thủ công (dành cho người đủ tuổi hợp pháp).',
    'Sản phẩm truyền thống làng bưởi Tân Triều, minh họa trong hồ sơ vườn Chú Ba Minh.',
    'stitch/stitch-17.webp',
    array['stitch/stitch-17.webp', 'stitch/stitch-47.webp'],
    null, false, true
  ),
  (
    'P11', 'mut-vo-buoi-say-deo-mat-ong', 'Mứt vỏ bưởi sấy dẻo mật ong rừng', 'Mật ong & Đặc sản',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'Phường Tân Triều', 'hũ 200g', 90000, 26, 'in_season',
    'NF-TT-2026-01', null,
    'Vỏ bưởi Tân Triều sơ chế giảm đắng, sấy dẻo cùng mật ong hoa nhãn, giữ tinh dầu thơm dịu nhẹ.',
    'Tận dụng giá trị phụ phẩm vỏ bưởi sạch giúp tăng thêm thu nhập cho hộ vườn.',
    'stitch/stitch-18.webp',
    array['stitch/stitch-18.webp', 'stitch/stitch-48.webp'],
    null, false, true
  ),
  (
    'P12', 'ca-phe-rang-moc-dong-nai', 'Cà phê Robusta rang mộc Đồng Nai', 'Hạt & Cà phê',
    'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Phường Xuân Lộc', 'túi 500g', 120000, 24, 'in_season',
    'NF-XL-2026-03', null,
    'Hạt cà phê Robusta vùng đất bazan Đồng Nai thu hái trái chín, rang mộc không tẩm bơ hương liệu.',
    'Phù hợp pha phin truyền thống, đóng túi van một chiều có mã QR lô rang.',
    'stitch/stitch-08.webp',
    array['stitch/stitch-08.webp'],
    null, false, true
  )
on conflict (id) do nothing;

insert into public.batches (
  batch_code, product_id, product_name, farm_id, farm_name, region, harvest_date, pack_date,
  declaration_level, doc_status, summary, is_demo
) values
  (
    'NF-DEMO-001', 'P01', 'Chôm chôm Java Long Khánh', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư',
    'Phường Long Khánh, TP. Đồng Nai', '23/11/2026', '24/11/2026',
    'Nhà vườn tự khai · Thanh niên hỗ trợ ghi nhận (Chưa xác minh OCOP chính thức)',
    'Đang hoàn thiện hồ sơ tự khai',
    'Lô NF-DEMO-001 gồm 30 kg chôm chôm Java thu hoạch tại vườn Ba Tư (2,5 ha). Dữ liệu nhật ký hiển thị trung thực theo nguồn khai báo nội bộ để minh họa quy trình truy xuất.',
    true
  ),
  (
    'NF-TT-2026-01', 'P06', 'Bưởi da xanh Tân Triều', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh',
    'Cù lao Tân Triều, Phường Tân Triều, TP. Đồng Nai', '22/11/2026', '23/11/2026',
    'Nhà vườn tự khai · HTX Tân Triều đã đối chiếu chứng từ',
    'Hồ sơ đã đối chiếu',
    'Lô bưởi cù lao Tân Triều được cắt tại liếp, đo độ ngọt Brix tham khảo và đóng thùng rơm bảo vệ cuống tươi.',
    true
  ),
  (
    'NF-XL-2026-03', 'P08', 'Hạt điều rang muối vỏ lụa Xuân Lộc', 'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc',
    'Phường Xuân Lộc, TP. Đồng Nai', '15/11/2026', '20/11/2026',
    'Xã viên HTX khai báo · HTX đối chiếu lô chế biến',
    'Hồ sơ đã đối chiếu',
    'Lô hạt điều thô Đồng Nai rang bằng củi nhãn truyền thống, sàng phân loại nhân nguyên và đóng hộp kín.',
    true
  )
on conflict (batch_code) do nothing;

insert into public.batch_events (
  batch_code, date_label, title, detail, actor_category, source_declaration, photo
) values
  (
    'NF-DEMO-001', '10/11/2026 · 07:30', 'Chăm sóc & dọn cỏ hữu cơ trước thu hoạch',
    'Chú Ba Tư ghi nhận lần bón phân hữu cơ cuối vụ và làm sạch gốc liếp chôm chôm khu B (tự khai).',
    'Chủ vườn Ba Tư', 'Nhà vườn tự khai', 'stitch/stitch-40.webp'
  ),
  (
    'NF-DEMO-001', '23/11/2026 · 06:15', 'Thu hoạch 30 kg đợt đầu sáng sớm',
    'Cắt chùm khi trái chuyển đỏ đều, tránh nắng gắt để giữ độ giòn và màu vỏ tươi.',
    'Chủ vườn Ba Tư & Đoàn viên Minh Anh', 'Thanh niên hỗ trợ ghi nhận', 'stitch/stitch-07.webp'
  ),
  (
    'NF-DEMO-001', '24/11/2026 · 08:00', 'Phân loại, đóng giỏ rơm & gắn mã QR lô NF-DEMO-001',
    'Đoàn viên Tuấn hỗ trợ kiểm tra trọng lượng, chụp ảnh thực tế và dán nhãn truy xuất lên từng giỏ.',
    'Đoàn viên Tuấn & Minh Anh', 'Thanh niên hỗ trợ ghi nhận', 'stitch/stitch-32.webp'
  ),
  (
    'NF-TT-2026-01', '05/11/2026 · 08:00', 'Bọc trái sinh học chống ruồi đục quả',
    'Chú Ba Minh thực hiện bao trái bằng túi lưới thoáng khí tại liếp A3.',
    'Chủ vườn Ba Minh', 'Nhà vườn tự khai', 'stitch/stitch-28.webp'
  ),
  (
    'NF-TT-2026-01', '22/11/2026 · 06:30', 'Thu hoạch tại liếp & kiểm tra độ ngọt Brix',
    'Cắt trái đạt độ tuổi thu hoạch, độ ngọt mẫu đo tham khảo đạt 11.8° Brix.',
    'Chú Ba Minh & TNV Nguyễn Văn An', 'Thanh niên hỗ trợ ghi nhận', 'stitch/stitch-26.webp'
  ),
  (
    'NF-TT-2026-01', '23/11/2026 · 09:00', 'Cân trọng lượng, lót rơm & dán tem QR tại vườn',
    'HTX Tân Triều đối chiếu chứng từ lô và bàn giao đơn vị vận chuyển mát.',
    'HTX Tân Triều & TNV Nguyễn Văn An', 'HTX đối chiếu', 'stitch/stitch-27.webp'
  ),
  (
    'NF-XL-2026-03', '15/11/2026', 'Phân loại hạt điều thô vùng Xuân Lộc',
    'Chọn hạt đạt kích cỡ nhân A+, phơi nắng tự nhiên trước khi rang.',
    'Tổ hợp tác Xuân Lộc', 'Nhà vườn tự khai', 'stitch/stitch-39.webp'
  ),
  (
    'NF-XL-2026-03', '20/11/2026', 'Rang chảo gang bằng củi & Đóng hộp hút chân không',
    'Hoàn thiện mẻ rang giữ vỏ lụa giòn bùi, gắn tem lô NF-XL-2026-03.',
    'HTX Xuân Lộc', 'HTX đối chiếu', 'stitch/stitch-50.webp'
  );

do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('11111111-1111-4111-8111-111111111111'::uuid, 'customer@naifarm.vn', 'Ngọc Linh', 'customer', null::text),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'farmer.batu@naifarm.vn', 'Chú Ba Tư', 'farmer', 'farm-ba-tu-demo'),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'farmer.baminh@naifarm.vn', 'Chú Ba Minh', 'farmer', 'farm-ba-minh-tan-trieu'),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'farmer.cotu@naifarm.vn', 'Cô Tư', 'farmer', 'farm-co-tu-cam-my'),
      ('55555555-5555-4555-8555-555555555555'::uuid, 'farmer.htx@naifarm.vn', 'Tổ hợp tác Xuân Lộc', 'farmer', 'farm-htx-xuan-loc'),
      ('66666666-6666-4666-8666-666666666666'::uuid, 'volunteer@naifarm.vn', 'Minh Anh', 'volunteer', null::text),
      ('77777777-7777-4777-8777-777777777777'::uuid, 'volunteer.an@naifarm.vn', 'Nguyễn Văn An', 'volunteer', null::text),
      ('88888888-8888-4888-8888-888888888888'::uuid, 'coordinator@naifarm.vn', 'Thu Hà', 'coordinator', null::text),
      ('99999999-9999-4999-8999-999999999999'::uuid, 'org@naifarm.vn', 'HTX Tân Triều', 'organization', null::text),
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'admin@naifarm.vn', 'Quản trị NaiFarm', 'admin', null::text)
    ) as t(id, email, full_name, role_name, farm_id)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
      u.email, crypt('naifarm123', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', u.full_name, 'role', 'customer'),
      '', '', '', ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), u.id, u.email,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email', now(), now(), now()
    )
    on conflict do nothing;

    update public.profiles
    set full_name = u.full_name, role = u.role_name::public.app_role, farm_id = u.farm_id
    where id = u.id;
  end loop;
end;
$$;

insert into public.orders (
  id, customer_id, customer_name, customer_phone_demo, farm_id, farm_name, delivery_method,
  delivery_address, subtotal_vnd, shipping_fee_vnd, total_vnd, payment_label, status, timeline,
  created_at_label, is_demo
) values
  (
    'NF-ORD-DEMO-01', '11111111-1111-4111-8111-111111111111', 'Ngọc Linh', '090x xxx 128',
    'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 'delivery', 'Phường Bình Thạnh, TP. Hồ Chí Minh',
    70000, 20000, 90000, 'COD (Thanh toán khi nhận hàng)', 'pending_confirm',
    '[{"step":"Khách đặt đơn COD","time":"09:15 24/11","done":true},{"step":"Nhà vườn Ba Tư xác nhận đơn","time":"Đang chờ","done":false},{"step":"Hái tại vườn & đóng giỏ rơm","time":"Chưa thực hiện","done":false},{"step":"Chuyến xe mát giao TP.HCM","time":"Chưa thực hiện","done":false}]'::jsonb,
    '24/11/2026 · 09:15', true
  ),
  (
    'NF-ORD-DEMO-02', '11111111-1111-4111-8111-111111111111', 'Ngọc Linh', '090x xxx 128',
    'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 'delivery',
    'Số 45/2 Nguyễn Ái Quốc, Phường Trấn Biên, TP. Đồng Nai',
    225000, 20000, 245000, 'COD (Thanh toán khi nhận hàng)', 'shipping',
    '[{"step":"Khách đặt đơn COD","time":"16:40 23/11","done":true},{"step":"Chú Ba Minh xác nhận đơn","time":"17:05 23/11","done":true},{"step":"Đóng thùng rơm & dán QR NF-TT-2026-01","time":"07:30 24/11","done":true},{"step":"Đang trên chuyến xe mát HTX (Dự kiến giao chiều nay)","time":"09:45 24/11","done":false}]'::jsonb,
    '23/11/2026 · 16:40', true
  )
on conflict (id) do nothing;

insert into public.order_items (
  order_id, product_id, product_name, unit_label, quantity, unit_price_vnd, image
) values
  ('NF-ORD-DEMO-01', 'P01', 'Chôm chôm Java Long Khánh', 'kg', 2, 35000, 'stitch/stitch-07.webp'),
  ('NF-ORD-DEMO-02', 'P06', 'Bưởi da xanh Tân Triều', 'kg', 5, 45000, 'stitch/stitch-03.webp');

insert into public.missions (
  id, title, farm_id, farm_name, location, mode, skill_tag, assignee_id, assignee_name,
  expected_hours, submitted_hours, approved_hours, due_date, deliverable_summary, evidence_note,
  evidence_image, status, is_demo
) values
  (
    'NF-MIS-01', 'Số hóa 5 sản phẩm vườn Ba Tư & hướng dẫn đăng bán 3 bước', 'farm-ba-tu-demo',
    'Nhà vườn Ba Tư', 'Phường Long Khánh, TP. Đồng Nai', 'Trực tiếp tại vườn', 'Chụp ảnh & AI đăng bán',
    '66666666-6666-4666-8666-666666666666', 'Minh Anh', 2, 2, 0, '24/11/2026',
    '5 hồ sơ sản phẩm (35.000–120.000 đ/kg), ảnh thực tế, mã lô NF-DEMO-001 và hướng dẫn chú Ba Tư tự thao tác.',
    'Đã cùng Tuấn đến vườn Ba Tư chụp ảnh 5 sản phẩm chôm chôm – sầu riêng, tạo mã lô NF-DEMO-001 và hướng dẫn chú thử bước ghi âm đăng bán.',
    'stitch/stitch-32.webp', 'submitted', true
  ),
  (
    'NF-MIS-02', 'Cân kiểm tra, dán tem QR & ghi hình nhật ký bưởi Tân Triều', 'farm-ba-minh-tan-trieu',
    'Vườn Bưởi Chú Ba Minh', 'Cù lao Tân Triều, Phường Tân Triều', 'Trực tiếp tại vườn', 'Thiết lập QR & Nhật ký',
    '77777777-7777-4777-8777-777777777777', 'Nguyễn Văn An', 3, 3, 3, '23/11/2026',
    'Dán tem QR cho 20 thùng bưởi lô NF-TT-2026-01 và cập nhật 3 mốc nhật ký tại liếp.',
    'Đã hoàn thành dán tem và kiểm tra quét QR mở đúng hộ chiếu lô.',
    'stitch/stitch-31.webp', 'coordinator_approved', true
  ),
  (
    'NF-MIS-03', 'Biên tập mô tả sản phẩm & lịch livestream cho HTX Xuân Lộc', 'farm-htx-xuan-loc',
    'HTX Nông nghiệp Xuân Lộc', 'Hỗ trợ từ xa (Online)', 'Hỗ trợ từ xa (Online)', 'Livestream bán hàng',
    null, null, 2, 0, 0, '28/11/2026',
    'Soạn kịch bản phiên live giới thiệu hạt điều rang củi & gắn thẻ sản phẩm vào phòng Live.',
    null, null, 'open', true
  )
on conflict (id) do nothing;

insert into public.support_requests (
  id, farm_id, farm_name, title, need_type, preferred_time, location_mode, note, status, created_at_label
) values
  (
    'REQ-DEMO-01', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư',
    'Cần hỗ trợ chụp ảnh & chạy thử phiên Live cuối tuần',
    'Chụp ảnh sản phẩm & Livestream tại vườn', 'Sáng Thứ Bảy 28/11/2026 (08:30)', 'Tại vườn',
    'Chú Ba Tư muốn hai bạn Minh Anh và Tuấn qua vườn hỗ trợ quay đoạn cắt chôm chôm đầu buổi sáng.',
    'Chờ điều phối phân công', '24/11/2026 · 08:45'
  )
on conflict (id) do nothing;

insert into public.rfq_requests (id, company, note, status, created_at_label, created_by) values
  (
    'RFQ-DN-01', 'Hệ thống Siêu thị Xanh Biên Hòa',
    'Cần 450 kg/tuần gồm Bưởi da xanh Tân Triều và Chôm chôm Java, yêu cầu gắn tem QR theo từng xã viên giao.',
    'Mới gửi', '24/11/2026 · 10:20', '99999999-9999-4999-8999-999999999999'
  ),
  (
    'RFQ-DN-02', 'Bếp ăn Khu công nghiệp Amata',
    'Cần 600 kg/đợt trái cây theo mùa đóng sọt tiêu chuẩn, đặt trước 5 ngày để chủ vườn cắt đồng loạt.',
    'Mới gửi', '24/11/2026 · 14:05', '99999999-9999-4999-8999-999999999999'
  )
on conflict (id) do nothing;

insert into public.experience_bookings (
  id, farm_id, farm_name, package_title, guest_name, guest_count, date_label, note, status, guest_id
) values
  (
    'EXP-BOOK-01', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh',
    'Một ngày làm nông dân cù lao cùng Chú Ba Minh', 'Ngọc Linh & gia đình', 4,
    '06/12/2026 · 08:30', 'Muốn trải nghiệm cắt bưởi và tìm hiểu cách dán tem QR.',
    'Chờ nhà vườn xác nhận', '11111111-1111-4111-8111-111111111111'
  )
on conflict (id) do nothing;

insert into public.document_review_cases (
  id, farm_id, farm_name, document_title, submitted_at, scope_note, status, reviewer_note
) values
  (
    'DOC-01', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư',
    'Hồ sơ tự khai vùng trồng chôm chôm – sầu riêng (2,5 ha Long Khánh)', '24/11/2026 · 08:30',
    'Điều phối viên chỉ đối chiếu hình ảnh giấy tờ tự khai; không cấp chứng nhận OCOP chính thức.',
    'Chờ đối chiếu', null
  ),
  (
    'DOC-02', 'farm-co-tu-cam-my', 'Vườn Cô Tư Sinh Thái',
    'Nhật ký đàn ong hoa nhãn & cam kết an toàn thu hoạch', '23/11/2026 · 15:10',
    'Cần đối chiếu ảnh chụp thực tế khu vực đặt thùng ong.', 'Chờ đối chiếu', null
  ),
  (
    'DOC-03', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh',
    'Bộ hồ sơ vùng bưởi Tân Triều & Nhật ký lô NF-TT-2026-01', '21/11/2026 · 10:00',
    'Đã đối chiếu đầy đủ bản scan minh họa từ chủ vườn và TNV Nguyễn Văn An.',
    'Hồ sơ đã đối chiếu', 'Hồ sơ rõ ràng, tách biệt dữ liệu tự khai và văn bản đối chiếu.'
  )
on conflict (id) do nothing;

insert into public.admin_grants (
  id, account_name, organization_name, workspace_scope, capability, unit_scope, expires_at, active, last_reason
) values
  (
    'GR-01', 'Thu Hà (Điều phối cơ sở)', 'Đoàn Phường Long Khánh', 'W04',
    'hours.approve + doc.compare', 'Phường Long Khánh (Giới hạn đơn vị)', '31/12/2026', true,
    'Phân công điều phối chiến dịch hỗ trợ nhà vườn quý IV.'
  ),
  (
    'GR-02', 'Minh Anh (Tình nguyện viên)', 'Đội Trí thức trẻ Số hóa Đồng Nai', 'W03',
    'product.draft_for_farm (ủy quyền W02 hạn định)', 'Nhà vườn Ba Tư (farm-ba-tu-demo)', '15/12/2026', true,
    'Chú Ba Tư ủy quyền soạn bản nháp sản phẩm, chủ vườn tự duyệt công bố.'
  ),
  (
    'GR-03', 'Ban chủ nhiệm HTX Tân Triều', 'HTX Nông nghiệp Tân Triều', 'W05',
    'coop.batch_aggregate + coldchain.schedule', 'Cụm xã viên Cù lao Tân Triều', '30/06/2027', true,
    'Quản lý lịch gom hàng và điều phối chuyến xe mát liên khu vực.'
  ),
  (
    'GR-04', 'Đại diện Trường THPT / ĐH Đồng Nai', 'CLB Học tập Thực hành Nông nghiệp', 'W05',
    'academy.class_manage (chế độ Roadmap)', 'Khối lớp thực hành Nông học Đồng Nai', '30/05/2027', false,
    'Tạm tắt quyền thử nghiệm lớp học mở rộng trong phạm vi MVP P0.'
  )
on conflict (id) do nothing;

insert into public.audit_logs (time, actor, action, target, note) values
  ('24/11/2026 09:05', 'Chú Ba Minh (W02)', 'CONFIRM_DELIVERABLE', 'NF-MIS-02', 'Xác nhận nhận bàn giao 20 bộ tem QR từ TNV Nguyễn Văn An.'),
  ('24/11/2026 09:12', 'Thu Hà (W04)', 'APPROVE_HOURS_LEDGER', 'NF-MIS-02 (+3 giờ)', 'Duyệt độc lập sau khi chủ vườn xác nhận bàn giao.'),
  ('24/11/2026 09:20', 'Quản trị NaiFarm (W06)', 'SYSTEM_AUDIT_INIT', 'W01–W06', 'Khởi tạo sổ nhật ký kiểm toán hệ thống NaiFarm trên Supabase.');
