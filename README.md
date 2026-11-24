# NaiFarm — Chợ OCOP Thanh niên · Thành phố Đồng Nai (Frontend Prototype)

**Thông điệp thương hiệu:** *Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.*

Dự án **NaiFarm** thuộc bài thi **Nhóm 8 (Group 8)** tại **Hackathon Thành phố Đồng Nai năm 2026** — nguyên mẫu giao diện độ trung thực cao (**Frontend-Only High-Fidelity Prototype**) kết hợp toàn bộ **12 màn hình xuất từ Google Stitch (`12256474506032242478`)** và hệ thống **6 không gian vai trò (`W01`–`W06`)** theo tài liệu *NaiFarm Master Blueprint V3* & *Stitch Playbook Đề 3*.

---

## 1. Giới hạn phạm vi & Tính trung thực

- **100% Frontend-Only**: Không sử dụng cơ sở dữ liệu thật, không máy chủ backend, không thư mục `src/app/api/*`, không Server Actions nghiệp vụ, không cổng thanh toán thật và không yêu cầu API key runtime để khởi chạy.
- **Trạng thái dùng chung trên trình duyệt (`DemoStoreContext` + `localStorage`)**: Thao tác đặt hàng tại `W01` đồng bộ sang `W02`, đăng bán nông sản ở `W02` xuất hiện ngay ngoài Chợ công khai, và quy trình kiểm chứng 2 lớp giờ công thanh niên (`W03` → `W02` xác nhận bàn giao → `W04` duyệt giờ) vận hành liên hoàn.
- **Minh bạch nhãn dữ liệu**: Mọi dữ liệu bán hàng, truy xuất mã lô (`NF-DEMO-001`, `NF-TT-2026-01`, `NF-XL-2026-03`), AI gợi ý và thanh toán (`COD Demo`) đều hiển thị rõ trạng thái demo/tự khai, tách bạch giữa *Nhà vườn tự khai* và *Hồ sơ đã đối chiếu (Demo)* — không giả mạo chứng nhận pháp lý OCOP.

---

## 2. Cấu trúc Không gian & Đường dẫn chính

| Nhóm / Vai trò | Đường dẫn (Routes) | Chức năng trọng tâm |
|---|---|---|
| **Public & Mua sắm (`W01`)** | `/`, `/marketplace`, `/farms`, `/farms/[slug]`, `/products/[slug]`, `/trace`, `/trace/[batchCode]`, `/cart`, `/checkout`, `/account`, `/account/orders` | Chợ OCOP 60/40 editorial, lọc theo danh mục & mùa vụ, hồ sơ nhà vườn, hộ chiếu mã QR SVG thật, đặt hàng COD Demo, theo dõi đơn |
| **Bản đồ & OCOP Live** | `/explore`, `/live` | Bản đồ vùng trồng Đồng Nai tương tác + đặt lịch trải nghiệm tại vườn; Phòng phát lại minh họa (Replay Demo) 3 góc quay & ghim hàng mua nhanh |
| **Nhà nông U50+ (`W02`)** | `/farmer`, `/farmer/publish` | Giao diện chữ lớn, nút bấm tối thiểu 56px: xử lý đơn hàng, ghi nhật ký mùa vụ, xác nhận bàn giao từ TNV, trình hướng dẫn đăng bán 3 bước (ảnh + giọng nói mô phỏng + fallback nhập tay) |
| **Thanh niên & Học mở (`W03`)** | `/volunteer`, `/learn` | Bảng nhiệm vụ số hóa, nộp minh chứng, OCOP Youth Impact Pass tách riêng *Giờ đã duyệt* và *Giờ chờ duyệt*; Bài học Hạt điều Đồng Nai, Quiz 3 câu & mô hình **3D Bưởi Tân Triều** |
| **Điều phối cơ sở (`W04`)** | `/coordinator` | Điều phối hỗ trợ & chuyến xe mát, đối chiếu chứng từ tự khai (không cấp chứng nhận OCOP), khóa duyệt giờ 2 lớp (`farm_accepted`), biểu đồ Recharts + bảng dữ liệu trực tiếp |
| **Tổ chức & Đối tác (`W05`)** | `/organization` | Shell thống nhất 3 chế độ: HTX Nông nghiệp (Active MVP), Doanh nghiệp B2B RFQ (Roadmap), Nhà trường *Farm as a Classroom* (Roadmap) |
| **Quản trị Demo (`W06`)** | `/admin` | Ma trận phân quyền có thời hạn & phạm vi đơn vị (Simulation Frontend) + Nhật ký kiểm toán chỉ đọc (`AuditLogTable`) |
| **Giám khảo & Trình diễn** | `/demo` | Hub điều hướng nhanh Flows A–H, bảng đối chiếu 12 màn hình Stitch + Blueprint V3, nút *Khôi phục dữ liệu mẫu (Reset Demo)* |

---

## 3. Công nghệ sử dụng

- **Framework**: Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, TypeScript `^5`
- **Styling & Typography**: Tailwind CSS `4.3.3`, Google Fonts (`Be Vietnam Pro` + `Lora`), token màu chuẩn `DESIGN.md` (`#245B3D`, `#F5F3E9`, `#6C9C5B`, `#D7A34D`, `#25352B`)
- **UI, Motion & Visualization**: `lucide-react`, `motion`, `sonner`, `qrcode.react`, `recharts`, `three` + `@react-three/fiber` + `@react-three/drei` (tải động client-side kèm fallback 2D)

---

## 4. Hướng dẫn cài đặt, chạy thử & kiểm tra

Thực hiện trong thư mục `E:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm`:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Khởi chạy bản phát triển hoặc bản production tại `http://127.0.0.1:3000`:

```bash
# Chế độ dev
npm run dev

# Hoặc chạy bản dựng production
npm run start -- -H 127.0.0.1 -p 3000
```

Chạy bộ kiểm thử tự động Playwright (khi server đang chạy tại cổng `3000`):

```bash
python tests/e2e-verify.py
```

---

## 5. Tài liệu tham chiếu nội bộ

- [Báo cáo kiểm thử (`docs/TEST_REPORT.md`)](docs/TEST_REPORT.md)
- [Tài liệu bàn giao Giám khảo (`docs/FINAL_HANDOVER.md`)](docs/FINAL_HANDOVER.md)
- [Ánh xạ Stitch & Route (`docs/SCREEN_ROUTE_MAPPING.md`)](docs/SCREEN_ROUTE_MAPPING.md)
- [Nhật ký thực thi Skill (`docs/SKILL_EXECUTION_LOG.md`)](docs/SKILL_EXECUTION_LOG.md)
- [Design System (`DESIGN.md`)](DESIGN.md)
