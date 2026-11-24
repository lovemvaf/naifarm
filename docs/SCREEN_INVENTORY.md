# SCREEN INVENTORY — NAIFARM PROTOTYPE

## 1. Summary Coverage

| Source Category | Count | Notes |
|---|---|---|
| Verified Google Stitch Local Export Screens (`ST-01`..`ST-12`) | **12** | Extracted to `.stitch/screens/` from `stitch_naifarm_ocop_marketplace` (Project ID `12256474506032242478`) |
| Reconstructed Blueprint V3 / Playbook Screens (`BP-01`..`BP-10`) | **10** | Specified in `NaiFarm_Master_Blueprint_Dong_Nai_2026_v3` & `STITCH_PLAYBOOK.md`, not in the 12-screen Stitch export |
| Newly Proposed Navigation / Prototype Helper (`PR-01`) | **1** | `/demo` Judge Presentation Hub (`Demo Switcher`, Stitch coverage map, Flows A–H launcher, Reset Demo) |
| Remote-only Unexported Screens | **0 known / unverified** | Stitch MCP not authenticated (`0` tools); no inaccessible remote screen data invented |

## 2. Full Inventory Table

| Inventory ID | Origin Type | Blueprint IDs | Title | Workspace | Target Route |
|---|---|---|---|---|---|
| `ST-01` | Verified Stitch screen | `S01`, `S26` | Trang chủ Chợ OCOP Thanh niên | Public | `/` |
| `ST-02` | Verified Stitch screen | `S02`, `S23`, `R1` | Hồ sơ Nhà vườn & Sinh thái Tân Triều | Public | `/farms/vuon-buoi-chu-ba-minh` |
| `ST-03` | Verified Stitch screen | `S03`, `S04`, `R3` | Chi tiết Sản phẩm & Truy xuất QR | Public | `/products/buoi-da-xanh-tan-trieu` |
| `ST-04` | Verified Stitch screen | `S05`, `S06`, `R4` | Giỏ hàng & Thanh toán NaiFarm | W01 | `/cart` & `/checkout` |
| `ST-05` | Verified Stitch screen | `S07` | Theo dõi Đơn & Chuỗi vận chuyển lạnh | W01 | `/account/orders` |
| `ST-06` | Verified Stitch screen | `S17`, `S23`, `B2` | Bản đồ số Nông sản & Nhà vườn Đồng Nai | Public | `/explore` |
| `ST-07` | Verified Stitch screen | `S15`, `S16`, `R6` | Phòng Livestream OCOP & Lịch phát sóng | Public / W03 | `/live` |
| `ST-08` | Verified Stitch screen | `S09`, `S10`, `R2`, `B1` | Đăng bán Nông sản 3 bước (Ảnh + Giọng + AI) | W02 | `/farmer/publish` |
| `ST-09` | Verified Stitch screen | `S13`, `S14`, `S18`, `B3` | Không gian Thanh niên Tình nguyện & Youth Pass | W03 | `/volunteer` |
| `ST-10` | Verified Stitch screen | `S24a`–`S24d`, `B3` | Không gian HTX & Điều phối Cộng đồng | W04 / W05 | `/coordinator` |
| `ST-11` | Verified Stitch screen | `S66`, `S67`, `S68` | Cổng Quản trị Nền tảng & Cấp quyền | W06 | `/admin` |
| `ST-12` | Verified Stitch screen | `AI01`–`AI04` | Trợ lý nổi NaiAI theo ngữ cảnh Workspace | Global | Global Floating Overlay |
| `BP-01` | Reconstructed from spec | `S01`, `S26` | Danh mục Chợ OCOP & Lọc mùa vụ | Public | `/marketplace` |
| `BP-02` | Reconstructed from spec | `S02`, `R1` | Danh sách Nhà vườn & Nhà vườn Ba Tư (2,5 ha Long Khánh) | Public | `/farms` & `/farms/nha-vuon-ba-tu-long-khanh` |
| `BP-03` | Reconstructed from spec | `S03`, `R3` | Chi tiết P01 Chôm chôm Java (`35.000 đ/kg`) & P04 Sầu riêng | Public | `/products/chom-chom-java-long-khanh` |
| `BP-04` | Reconstructed from spec | `S04`, `R3` | Hộ chiếu Nông sản QR công khai (`NF-DEMO-001`) | Public | `/trace` & `/trace/[batchCode]` |
| `BP-05` | Reconstructed from spec | `W01` (`S07`, `S54`, `S72`) | Tổng quan Tài khoản Cá nhân, Yêu thích & Lịch hẹn | W01 | `/account` & `/account/orders/[orderId]` |
| `BP-06` | Reconstructed from spec | `S08`, `S11`, `S12`, `S25`, `S30`, `R5` | Trang chủ Nhà nông U50+, Đơn hàng & Nhật ký | W02 | `/farmer` |
| `BP-07` | Reconstructed from spec | `S20`, `S21`, `S22` | NaiAcademy (Bài học Hạt điều + Quiz) & Thư viện 3D | W03 / Public | `/learn` |
| `BP-08` | Reconstructed from spec | `S37`–`S40`, `S48`–`S49` | Không gian Tổ chức & Đối tác (HTX / B2B / Trường học) | W05 | `/organization` |
| `PR-01` | Newly proposed prototype tool | — | Trung tâm Trình diễn Ban Giám khảo & Flows A–H | Prototype | `/demo` |
