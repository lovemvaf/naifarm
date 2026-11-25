# Báo cáo kiểm định dữ liệu địa giới hành chính Thành phố Đồng Nai (25/11/2026)

- **Nguồn dữ liệu thô:** `data/raw/Dong_Nai_Dia_Gioi_Hanh_Chinh_2026-11-25.csv` (43 cột chuẩn)
- **Tệp JSON đầu ra:** `src/data/geography/dong-nai-administrative-units.json`, `src/data/geography/administrative-metadata.json`, `src/data/geography/historical-aliases.json`
- **Script kiểm định:** `npm run data:import` (`scripts/import-administrative-data.ts`) & `npm run data:validate` (`scripts/validate-administrative-data.ts`)

## Kết quả kiểm định tự động
- **Tổng số đơn vị hành chính (ĐVHC) hoạt động:** `95` (`trang_thai = active`), mã đơn vị cha duy nhất `75` (`Thành phố Đồng Nai`, Thành phố trực thuộc trung ương).
- **Cơ cấu loại hình:** `33 Phường` + `62 Xã`.
- **Số đơn vị nâng cấp Xã → Phường năm 2026 (`chuyen_xa_len_phuong_2026 = true`):** `10` đơn vị (`25270` Phường Lộc Ninh, `25357` Phường Tân Khai, `25363` Phường Đồng Phú, `26116` Phường Tân Phú, `26170` Phường Trị An, `26248` Phường Trảng Bom, `26326` Phường Dầu Giây, `26368` Phường Long Thành, `26425` Phường Xuân Lộc, `26485` Phường Nhơn Trạch).
- **Xử lý trùng slug thô trong CSV:** Hai đơn vị khác nhau đều mang raw slug `xa-loc-thanh` là `25280` (`Xã Lộc Thạnh`) và `25294` (`Xã Lộc Thành`). Bộ nạp giữ nguyên trường `slug` thô và sinh thêm `uniqueSlug` (`xa-loc-thanh-25280`, `xa-loc-thanh-25294`), đồng thời luôn khóa chính bằng `maDvhc`.
- **Trạng thái hồ sơ Xã Phước Sơn (`25420`):** `trang_thai_dieu_chinh_dia_gioi = chu_truong_da_thong_qua_cho_quyet_dinh_cap_co_tham_quyen`; diện tích hiện hành giữ ở `386,56 km²` (`dien_tich_km2_de_an_2026` & `dien_tich_hien_trang_theo_to_trinh_11_2026`), ghi nhận minh bạch `659,163 km²` là diện tích đề xuất tiếp nhận thêm từ Lâm Đồng theo NQ 71/NQ-HĐND ngày 11/11/2026 đang chờ quyết định cấp có thẩm quyền.
- **Tính trung thực GIS:** `0/95` đơn vị có `vi_do_wgs84`, `kinh_do_wgs84`, `geometry_wkt`, hoặc `crs_geometry` xác minh (`trang_thai_gis = chua_xac_minh_toa_do_va_polygon`). Tuyệt đối không bịa tọa độ hay polygon trong JSON hành chính; các tọa độ nhà vườn hiển thị trên Leaflet được tách riêng ở lớp mock data với nhãn rõ ràng *"Tọa độ minh họa vùng sinh thái"*.
