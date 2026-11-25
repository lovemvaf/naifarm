insert into public.product_reviews (
  id, product_id, order_id, author_name, rating, comment, created_date_label, verified_order_purchase
) values
  ('REV-01', 'P01', 'NF-ORD-DEMO-08', 'Ngọc Linh', 5, 'Chôm chôm giòn ngọt, ráo nước và còn cuống lá tươi, quét mã NF-DEMO-001 xem rõ ngày hái.', '22/11/2026', true),
  ('REV-02', 'P06', 'NF-ORD-DEMO-12', 'Minh Khang', 5, 'Bưởi da xanh Tân Triều tép hồng ngọt thanh, lót rơm cẩn thận khi giao.', '21/11/2026', true),
  ('REV-03', 'P08', 'NF-ORD-DEMO-19', 'Thảo Vy', 4, 'Hạt điều rang củi thơm béo, ít muối rất hợp biếu người lớn tuổi.', '20/11/2026', true),
  ('REV-04', 'P01', 'NF-ORD-DEMO-20', 'Ngọc Linh', 5, 'Chôm chôm giòn ngọt, cuống lá tươi, giao trong ngày hái.', '16/11/2026', true),
  ('REV-05', 'P06', 'NF-ORD-DEMO-21', 'Minh Khang', 4, 'Bưởi da xanh tép hồng ngọt thanh, lót rơm cẩn thận khi giao.', '17/11/2026', true),
  ('REV-06', 'P07', 'NF-ORD-DEMO-22', 'Thảo Vy', 5, 'Bưởi đường lá cam mùi thơm dịu, phù hợp biếu tặng.', '18/11/2026', true),
  ('REV-07', 'P04', 'NF-ORD-DEMO-23', 'Tuấn Anh', 4, 'Vị ngọt tự nhiên, treo tem QR truy xuất rõ ngày cắt.', '19/11/2026', true),
  ('REV-08', 'P05', 'NF-ORD-DEMO-24', 'Hồng Nhung', 5, 'Chất lượng ổn cho giá bán, sẽ giới thiệu cho bạn bè.', '20/11/2026', true),
  ('REV-09', 'P02', 'NF-ORD-DEMO-25', 'Đức Minh', 4, 'Trái cân đong đều, vỏ không xơ, mua lại lần thứ hai.', '21/11/2026', true),
  ('REV-10', 'P03', 'NF-ORD-DEMO-26', 'Mai Anh', 5, 'Hương thơm đậm, đóng gói cẩn thận tránh bị dập trong vận chuyển.', '22/11/2026', true)
on conflict (id) do nothing;

insert into public.mentor_cases (
  id, student_name, mentor_name, topic, status, sessions, created_at_label
) values
  ('MNT-01', 'Nhà vườn Ba Tư', 'KS. Phạm Quốc Khánh', 'Bảo quản sau thu hoạch', 'active', 0, '26/11/2026'),
  ('MNT-02', 'Vườn Bưởi Chú Ba Minh', 'TS. Lê Thị Hồng Hạnh', 'Tiêu chuẩn canh tác & VietGAP', 'completed', 0, '22/11/2026'),
  ('MNT-03', 'Vườn Cô Tư Sinh Thái', 'KS. Trần Đức Hòa', 'Nuôi ong hoa nhãn & bảo quản mật ong', 'active', 2, '27/11/2026'),
  ('MNT-04', 'HTX Nông nghiệp Xuân Lộc', 'TS. Võ Minh Châu', 'Tiêu chuẩn rang củi & phân loại hạt điều', 'active', 5, '28/11/2026'),
  ('MNT-05', 'Nhà vườn Ba Tư', 'ThS. Lê Minh Quyền', 'Bao bì chống dập & vận chuyển đường dài', 'completed', 8, '19/11/2026')
on conflict (id) do nothing;

insert into public.international_inquiries (
  id, product_id, farm_id, buyer_name, country, preferred_language, quantity_note, packaging_note,
  sample_requested, message, created_at_iso, status, response_note
) values
  ('INQ-2026-01', 'P08', 'farm-htx-xuan-loc', 'Elena Lim (Singapore Importer)', 'Singapore', 'en', '120 jars (500g wood-roasted sample lot)', 'Vacuum sealed glass/PET jar with English nutrition & allergen label', true, 'Requesting MOQ and shelf-life verification sheet for specialty food showcase.', '2026-11-24T10:15:00+07:00', 'submitted_local', NULL),
  ('INQ-2026-02', 'P06', 'farm-ba-minh-tan-trieu', 'Kenji Sato (Osaka Gourmet)', 'Japan', 'en', 'Weekend hospitality tasting & cooperative orchard sourcing inquiry', 'Requires Phytosanitary / MSVT record review prior to formal export quote', false, 'Inquiring whether Tan Trieu pomelo lots hold export growing-area codes for Osaka retail.', '2026-11-25T09:00:00+07:00', 'seller_responded', 'HTX Tân Triều replied: Current lot serves domestic/orchard tasting; formal phytosanitary export quote reviewed per shipment.')
on conflict (id) do nothing;
