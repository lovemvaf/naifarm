# NaiFarm V2.0 — Repository & Local Skill Usage Matrix

Tài liệu đối chiếu các kho/kỹ năng cục bộ thực sự đã kiểm chứng trong hệ sinh thái workspace và kế hoạch tái sử dụng cho NaiFarm V2.0 (Frontend-Only Next.js 16 + React 19 + Tailwind CSS v4).

| Hạng mục / Repo / Skill | Đường dẫn cục bộ đã kiểm chứng | Mục đích & Pattern tái sử dụng cho V2.0 | Trạng thái |
| :--- | :--- | :--- | :--- |
| `Dong Nai Memory` | `E:\04_Projects\Dong Nai Memory\apps\web\src\pages\MapPage.tsx` | Mẫu OpenStreetMap Leaflet tile layer, `tileError` fallback, `AdminEraMode` & phân biệt dữ liệu hành chính lịch sử vs hiện hành; xác nhận **không** có GeoJSON 95 phường/xã sẵn | Áp dụng trực tiếp (không sao chép file nguyên xi) |
| `EduMap` | `C:\Users\asus\Documents\EduMap\frontend` | Tham chiếu cấu trúc lọc GIS, phân tách component map/controls/legend | Tham khảo pattern |
| `ui-ux-pro-max` | `.agents/skills/ui-ux-pro-max` | Design system Warm Rice (`#F5F3E9`) + Forest Green (`#245B3D`) + Earth Ink (`#25352B`), tokens, scale khoảng cách và nhịp đọc | Áp dụng |
| `impeccable` | `.agents/skills/impeccable` | Craft floor: bỏ nested cards dư thừa, `::selection` + scrollbar đồng bộ theme, tách elevation bằng border hoặc shadow rõ ràng, không kicker/eyebrow lạm dụng | Áp dụng |
| `hallmark` & `unslop` & `design-taste-frontend` | `.agents/skills/hallmark`, `.agents/skills/unslop`, `.agents/skills/design-taste-frontend` | Audit anti-slop HTML/CSS, kiểm tra responsive 375/768/1440px, sloplint render QA | Áp dụng QA Phase 8 |
| `ws-vi-ux-writing` & `ws-vi-vietnamizer` & `ws-gen-clarity` | `C:\Users\asus\.gemini\config\skills\ws-*` | Chuẩn hóa UX copy tiếng Việt: xưng hô thống nhất, bỏ khẩu ngữ ("bằng tay", "nhé"), sentence-case tiêu đề, thông báo lỗi khôi phục được, nhãn demo trung thực | Áp dụng toàn bộ UI |
| `Leaflet` + `react-leaflet` + `@turf/distance` | `naifarm/node_modules/leaflet`, `react-leaflet@5.0.0`, `@turf/distance@7.4.0` | Bản đồ OpenStreetMap thực, marker phân loại theo mã ĐVHC 95 đơn vị, GPS trình duyệt thực & tính "Khoảng cách đường chim bay" | Cài đặt mới V2.0 |
| `Fuse.js` | `naifarm/node_modules/fuse.js@7.5.0` | Global Search hỗ trợ tìm tiếng Việt có dấu & không dấu qua sản phẩm, nhà vườn, ĐVHC Đồng Nai, lô QR, bài học, nhiệm vụ | Cài đặt mới V2.0 |
| `qrcode` + `qr-scanner` + `jsqr` | `naifarm/node_modules/qrcode@1.5.4`, `qr-scanner@1.4.2` | Tạo mã QR chuẩn (SVG/PNG tải được), quét QR camera/ảnh/mã lô tại `/trace/scan` và kiểm chứng giải mã tự động bằng `jsQR` | Cài đặt mới V2.0 |
| `papaparse` + `zod` + `tsx` | `naifarm/node_modules/papaparse@5.7.1`, `zod@4.6.7`, `tsx` | Parse & validate nghiêm ngặt CSV địa giới hành chính Đồng Nai 25/11/2026 (`95` ĐVHC) và kiểm chứng quan hệ mock data | Cài đặt mới V2.0 |
| `3D Stack` (`three`, `@react-three/fiber`, `@react-three/drei`) | Đã gỡ khỏi `naifarm/package.json` | Gỡ bỏ hoàn toàn theo yêu cầu V2.0; thay bằng 2D Produce Anatomy & Gallery tương tác nhẹ, nhanh, rõ nét trên mọi thiết bị | Đã gỡ bỏ |

> **Ranh giới bảo mật & tuân thủ:** Không sao chép mã nguồn độc quyền từ repo tham khảo, không nhúng khóa API trả phí, không dùng script `.toolbox/qa-runtime` hoặc `.hallmark/` trong bundle triển khai.
