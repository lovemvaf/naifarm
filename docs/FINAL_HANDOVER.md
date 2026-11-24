# TÀI LIỆU BÀN GIAO NGUYÊN MẪU — NAIFARM (`FINAL_HANDOVER.md`)

**Đội thi:** Nhóm 8 — Hackathon Thành phố Đồng Nai 2026  
**Sản phẩm:** **NaiFarm** — *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị*  
**Dạng sản phẩm:** Frontend-Only High-Fidelity Prototype (Next.js App Router)

---

## 1. Tổng hợp Đối chiếu Google Stitch & Blueprint V3

- **Google Stitch Project**: `12256474506032242478` ([`.stitch/metadata.json`](../.stitch/metadata.json)).
  - Do phiên môi trường chưa kết nối trực tiếp tới tài khoản Google Stitch MCP (`0` tool MCP được cấu hình), hệ thống đã trích xuất đầy đủ **12/12 bản xuất cục bộ (`ST-01`–`ST-12`)** kèm **65 ảnh tài nguyên cục bộ** đã tải về và kiểm tra MIME `image/*` tại [`public/images/stitch/`](../public/images/stitch/).
  - Bảng ánh xạ chi tiết từng màn hình tới route Next.js và ảnh chụp thực tế xem tại [`SCREEN_ROUTE_MAPPING.md`](SCREEN_ROUTE_MAPPING.md).
- **Hợp nhất dữ liệu Blueprint V3 (Đề 3) & Stitch**:
  - Bao gồm cả **Nhà vườn Ba Tư** (2,5 ha Long Khánh, `P01`–`P05` `35.000 đ–120.000 đ/kg`, Minh Anh & Tuấn, `NF-DEMO-001`, `NF-ORD-DEMO-01`, `NF-MIS-01`, `REQ-DEMO-01`, `NF-LIVE-01`) lẫn **Vườn Bưởi Chú Ba Minh** (Cù lao Tân Triều, `NF-TT-2026-01`, `NF-MIS-02`) và **HTX Xuân Lộc** (`NF-XL-2026-03`, `NF-MIS-03`).

---

## 2. Kịch bản Thuyết trình 5 Phút cho Ban Giám khảo

Mở trang **`/demo`** (`Trung tâm Trình diễn BGK`) để bấm nhanh hoặc dùng nút **Khôi phục Dữ liệu Mẫu (Reset Demo)** trước mỗi lượt thuyết trình:

1. **Mở đầu & Niềm tin số (`/`, `/products/buoi-da-xanh-tan-trieu`, `/trace/NF-DEMO-001`)**:
   - Giới thiệu chợ nông sản 60/40 editorial, hộp tra cứu mã QR nhanh, hộ chiếu nông sản SVG thật tách biệt rõ trạng thái tự khai và đã đối chiếu.
   - Bấm **"Xem 3D Bưởi Tân Triều"** để trình diễn mô hình tương tác WebGL 3D (có fallback 2D an toàn cho thiết bị cấu hình thấp).
2. **Thân thiện U50+ & Nhà nông tự đăng bán (`/farmer`, `/farmer/publish`)**:
   - Chuyển sang W02 từ nút Header hoặc `/farmer`: chữ to, nút 56px, không biểu đồ rườm rà.
   - Đi qua 3 bước đăng bán bằng giọng nói mô phỏng (hệ thống tự ẩn chatbot nổi khi đang ghi âm) và đưa ngay sản phẩm mới ra ngoài `/marketplace`.
3. **Liên kết Đơn hàng Khách mua ↔ Nhà nông (`/checkout` ↔ `/farmer` ↔ `/account/orders`)**:
   - Đặt đơn COD Demo -> Nhà nông bấm **"Xác nhận nhận đơn này"** -> Trang đơn hàng của khách tự đồng bộ sang **"Đang đóng gói tại vườn"**.
4. **Thanh niên Tình nguyện & Kiểm chứng 2 lớp (`/coordinator` → `/farmer` → `/coordinator` → `/volunteer`)**:
   - Cho giám khảo thấy nút duyệt giờ ở W04 **bị khóa** khi chủ vườn chưa xác nhận bàn giao (`NF-MIS-01`).
   - Sau khi chủ vườn xác nhận ở `/farmer`, điều phối viên mở khóa duyệt `+2 giờ`, và **Youth Impact Pass** tại `/volunteer` tăng *Giờ đã duyệt chính thức* từ `3` lên `5 giờ` (luôn tách riêng với *Giờ chờ duyệt*).
5. **Hệ sinh thái Cộng đồng (`/explore`, `/live`, `/learn`, `/organization`, `/admin`)**:
   - Bản đồ Đồng Nai tương tác & đặt lịch trải nghiệm (`/explore`), phòng Replay Live 3 góc máy (`/live`), bài học Hạt điều + Quiz + 3D (`/learn`), shell hợp tác xã/B2B/trường học thống nhất (`/organization`), và ma trận phân quyền + nhật ký kiểm toán (`/admin`).

---

## 3. Hạn chế minh bạch của giai đoạn Prototype

- Không lưu dữ liệu giữa các trình duyệt hoặc thiết bị khác nhau (trạng thái sử dụng `localStorage` trên từng trình duyệt).
- Trợ lý **NaiAI**, **AI tạo bản nháp giọng nói**, **đối chiếu hồ sơ**, **COD Demo**, **Replay Live** và **RBAC W06** đều hoạt động theo kịch bản mô phỏng ở phía frontend, không gọi API AI hoặc cổng thanh toán thực tế.
- Tọa độ bản đồ Đồng Nai (`/explore`) là tọa độ minh họa vùng sinh thái mẫu, không thay thế bản đồ địa giới hành chính.
