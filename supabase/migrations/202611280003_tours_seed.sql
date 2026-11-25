insert into public.experiences (
  id, farm_id, title, duration, price_per_guest, max_guests, schedule_summary, safety_note, image
) values
  ('TOUR-01', 'farm-ba-minh-tan-trieu', 'Một ngày làm nông dân cù lao Tân Triều & Workshop đóng gói QR (Song ngữ VI/EN)', '3 giờ', 120000, 16, '08:30 – 11:30 · 2026-11-28  |  08:30 – 11:30 · 2026-11-29  |  08:30 – 11:30 · 2026-12-05', 'Đi cùng hướng dẫn viên theo hàng bưởi, mang giày bít mũi hoặc sandal bám tốt.', 'stitch/stitch-21.jpg'),
  ('TOUR-02', 'farm-ba-tu-demo', 'Kể chuyện Chôm chôm & Sầu riêng 2,5 ha cùng Chú Ba Tư Long Khánh', '2,5 giờ', 90000, 14, '08:30 – 11:00 · 2026-11-28  |  08:30 – 11:00 · 2026-12-06', 'Không đứng trực tiếp dưới tán sầu riêng khi gió lớn; luôn đi cùng chủ vườn hoặc TNV.', 'stitch/stitch-40.jpg'),
  ('TOUR-03', 'farm-htx-xuan-loc', 'Từ hạt điều thô đến hũ điều rang củi Xuân Lộc (Kèm cảnh báo dị ứng hạt)', '2 giờ', 95000, 18, '09:00 – 11:00 · 2026-11-30', 'Không tự ý chạm vỏ điều thô chưa xử lý nhiệt; trẻ nhỏ đi cùng người lớn hoặc giáo viên giám sát.', 'stitch/stitch-50.jpg'),
  ('TOUR-04', 'farm-co-tu-cam-my', 'Tìm hiểu nuôi ong hoa nhãn & Quy trình tỉa trái sầu riêng — Vườn Cô Tư Sinh Thái', '2,5 giờ', 70000, 15, '08:30 – 11:00 · 2026-11-27  |  14:30 – 16:30 · 2026-11-27', 'Tuân thủ lối đi đánh dấu, giữ trẻ em trong tầm quan sát và kiểm tra đồng thuận trường học khi đi theo lớp.', 'stitch/stitch-38.jpg'),
  ('TOUR-05', 'farm-htx-xuan-loc', 'Trải nghiệm xưởng rang hạt điều củi & Đóng gói nông sản — HTX Nông nghiệp Xuân Lộc', '2,5 giờ', 90000, 15, '08:30 – 11:00 · 2026-12-02  |  14:30 – 16:30 · 2026-12-02', 'Tuân thủ lối đi đánh dấu, giữ trẻ em trong tầm quan sát và kiểm tra đồng thuận trường học khi đi theo lớp.', 'stitch/stitch-39.jpg')
on conflict (id) do nothing;
