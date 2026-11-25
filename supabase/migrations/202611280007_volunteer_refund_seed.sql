insert into public.volunteer_hours (
  id, mission_id, volunteer_name, farm_id, farm_name, hours, status, recorded_date, note
) values
  (
    'HR-001', 'NF-MIS-01', 'Minh Anh', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 2, 'approved',
    '24/11/2026',
    'Ghi nhận 2 giờ bàn giao hồ sơ sản phẩm NF-DEMO-001 cùng hướng dẫn chú Ba Tư đăng bán 3 bước.'
  ),
  (
    'HR-002', 'NF-MIS-02', 'Nguyễn Văn An', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 3, 'approved',
    '23/11/2026',
    'Ghi nhận 3 giờ dán tem QR 20 thùng bưởi lô NF-TT-2026-01 và cập nhật 3 mốc nhật ký tại liếp.'
  ),
  (
    'HR-003', 'NF-MIS-02', 'Nguyễn Văn An', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 1, 'approved',
    '24/11/2026',
    'Giờ bổ sung kiểm tra quét QR mở đúng hộ chiếu lô sau khi dán tem.'
  ),
  (
    'HR-004', 'NF-MIS-01', 'Tuấn', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 2, 'pending_coordinator',
    '24/11/2026',
    'Chờ điều phối duyệt giờ chụp ảnh 5 sản phẩm chôm chôm – sầu riêng.'
  ),
  (
    'HR-005', 'NF-MIS-01', 'Minh Anh', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 1, 'revision',
    '25/11/2026',
    'Yêu cầu bổ sung ảnh minh chứng đăng bán thực tế trên 3 bước.'
  ),
  (
    'HR-006', 'NF-MIS-03', 'Hương Giang', 'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 2, 'pending_farmer',
    '25/11/2026',
    'Chờ chủ vườn xác nhận giờ soạn kịch bản livestream hạt điều rang củi.'
  ),
  (
    'HR-007', 'NF-MIS-02', 'Nguyễn Văn An', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 2, 'approved',
    '22/11/2026',
    'Ghi nhận 2 giờ kiểm tra cân và in nhãn lô bưởi NF-TT-2026-01.'
  ),
  (
    'HR-008', 'NF-MIS-03', 'Khánh Linh', 'farm-htx-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 1, 'revision',
    '26/11/2026',
    'Chỉnh sửa kịch bản livestream theo phản hồi chủ vườn trước khi phát sóng.'
  ),
  (
    'HR-009', 'NF-MIS-01', 'Tuấn', 'farm-ba-tu-demo', 'Nhà vườn Ba Tư', 1, 'approved',
    '20/11/2026',
    'Giờ hỗ trợ chụp ảnh sầu riêng Ri6 tại liếp trước khi đăng bán.'
  ),
  (
    'HR-010', 'NF-MIS-02', 'Nguyễn Văn An', 'farm-ba-minh-tan-trieu', 'Vườn Bưởi Chú Ba Minh', 1, 'pending_coordinator',
    '25/11/2026',
    'Chờ điều phối duyệt giờ ghi hình nhật ký bưởi NF-TT-2026-01.'
  )
on conflict (id) do nothing;

insert into public.refund_requests (
  id, order_id, farm_id, requester_name, reason, amount_vnd, restock_qty, status,
  maker_name, checker_name, requested_date_iso
) values
  (
    'RF-01', 'NF-ORD-DEMO-01', 'farm-ba-tu-demo', 'Ngọc Linh',
    '1 kg trái có vết dập nhẹ trong quá trình vận chuyển', 35000, 1, 'pending_maker',
    'CSKH NaiFarm', null, '2026-11-24'
  ),
  (
    'RF-02', 'NF-ORD-DEMO-02', 'farm-ba-minh-tan-trieu', 'Minh Khang',
    'Khách yêu cầu đổi sang loại hộp quà biếu trước khi giao', 145000, 1, 'approved_by_finance',
    'CSKH NaiFarm', 'Quản lý Tài chính HTX', '2026-11-21'
  ),
  (
    'RF-03', 'NF-ORD-DEMO-01', 'farm-ba-tu-demo', 'Thảo Vy',
    'Trái chín quá mức, đổi sang lô sau cùng cùng ngày', 45000, 1, 'rejected',
    'CSKH NaiFarm', 'Quản lý Tài chính HTX', '2026-11-23'
  ),
  (
    'RF-04', 'NF-ORD-DEMO-02', 'farm-ba-minh-tan-trieu', 'Ngọc Linh',
    'Giao lộn lô NF-TT-2026-01, trả lại để chuẩn bị giao đúng', 90000, 2, 'pending_maker',
    'CSKH NaiFarm', null, '2026-11-25'
  )
on conflict (id) do nothing;
