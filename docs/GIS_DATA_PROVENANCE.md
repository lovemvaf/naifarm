# GIS & Administrative Provenance Statement (`GIS_DATA_PROVENANCE.md`)

Tài liệu minh bạch nguồn dữ liệu bản đồ và tọa độ địa lý sử dụng trên NaiFarm V2.0.

## 1. Bản đồ nền (Basemap)
- **Thư viện:** Leaflet `1.9.4` + React Leaflet `5.0.0`.
- **Nguồn Tile:** OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) kèm dòng ghi nhận bản quyền bắt buộc `© OpenStreetMap contributors`.
- **Xử lý sự cố ngoại tuyến:** Khi môi trường không truy cập được tile OSM (`tileerror`), giao diện hiển thị banner cảnh báo lịch sự cùng nút thử tải lại và giữ nguyên danh sách nhà vườn / 95 Phường/Xã đầy đủ ở cột danh sách thay thế.

## 2. Dữ liệu địa giới hành chính Thành phố Đồng Nai (25/11/2026)
- **Tệp nguồn:** `data/raw/Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv` (`95` ĐVHC cấp xã đang hoạt động: `33` Phường + `62` Xã; mã đơn vị cha `75` Thành phố Đồng Nai).
- **Trạng thái GIS trong CSV:** `trang_thai_gis = chua_xac_minh_toa_do_va_polygon` (`0/95` đơn vị có `vi_do_wgs84`, `kinh_do_wgs84`, `geometry_wkt`, hoặc `crs_geometry`).
- **Cam kết trung thực:** Hệ thống **không** tự bịa đường ranh giới polygon pháp lý trên Leaflet và giữ nguyên các trường `viDoWgs84`, `kinhDoWgs84`, `geometryWkt` là `null` trong `src/data/geography/dong-nai-administrative-units.json`.
- **Hồ sơ Xã Phước Sơn (`25420`):** Hiện hành `386,56 km²`; đề xuất tiếp nhận từ Lâm Đồng thành `659,163 km²` (NQ 71/NQ-HĐND ngày 11/11/2026) đang chờ quyết định cấp có thẩm quyền nên chưa áp dụng.

## 3. Tọa độ điểm vườn & Định vị GPS trình duyệt
- **Điểm ghim 24 nhà vườn:** Được khai báo riêng trong `src/data/demo/farms.ts` với cờ `isDemoCoordinate: true` và nhãn chú giải rõ *"Tọa độ minh họa vùng sinh thái"*.
- **GPS thực từ người dùng:** Chỉ gọi `navigator.geolocation.getCurrentPosition()` khi người dùng bấm nút `"Vị trí của tôi"`. Tọa độ người dùng chỉ giữ tạm trong bộ nhớ giao diện để tính khoảng cách bằng `@turf/distance` (ghi chú rõ *"đường chim bay"*), không lưu `localStorage` và không gửi ra máy chủ ngoài.
