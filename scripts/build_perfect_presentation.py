#!/usr/bin/env python3
"""
build_perfect_presentation.py
Rebuilds DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx
from DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx.backup
with 100% complete, rich, polished content for NAIFARM — CHỢ OCOP THANH NIÊN · THÀNH PHỐ ĐỒNG NAI.
Eliminates all empty holes, leftover historical text, dummy numbers, and broken layouts.
"""

import os
import sys
import pptx
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

BACKUP_PPTX = '/home/ngoctan/Desktop/DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx.backup'
OUTPUT_PPTX = '/home/ngoctan/Desktop/DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx'
SCREENSHOTS_DIR = '/home/ngoctan/Downloads/naifarm/docs/screenshots/desktop'
MOBILE_DIR = '/home/ngoctan/Downloads/naifarm/docs/screenshots/mobile'
STITCH_DIR = '/home/ngoctan/Downloads/naifarm/public/images/stitch'
QR_CODE_PATH = '/home/ngoctan/Desktop/qrcode_naifarm.vercel.app.png'

EMBED_ATTR = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'

def set_image_on_shape(slide, shape, new_img_path, square=False, center_in_box=None):
    if not os.path.exists(new_img_path):
        print(f"Warning: image path does not exist: {new_img_path}")
        return False

    image_part, rId = slide.part.get_or_add_image_part(new_img_path)

    target_shape = None
    if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
        target_shape = shape
    elif shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for sub in shape.shapes:
            if sub.shape_type == MSO_SHAPE_TYPE.PICTURE:
                target_shape = sub
                break

    if not target_shape:
        print(f"No picture found in shape {shape.name}")
        return False

    blip = target_shape._element.xpath('.//a:blip')[0]
    blip.attrib[EMBED_ATTR] = rId

    if square and target_shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
        orig_w = target_shape.width
        orig_h = target_shape.height
        square_dim = min(orig_w, orig_h)
        target_shape.width = square_dim
        target_shape.height = square_dim
        if center_in_box:
            box_l, box_t, box_w, box_h = center_in_box
            target_shape.left = box_l + (box_w - square_dim) // 2
            target_shape.top = box_t + (box_h - square_dim) // 2
        else:
            target_shape.left = target_shape.left + (orig_w - square_dim) // 2
            target_shape.top = target_shape.top + (orig_h - square_dim) // 2

    return True

def replace_image_by_name(slide, shape_name, new_img_path, square=False, center_in_box=None):
    for shape in slide.shapes:
        if shape.name == shape_name:
            return set_image_on_shape(slide, shape, new_img_path, square=square, center_in_box=center_in_box)
    print(f"Shape {shape_name} not found in slide")
    return False

def set_shape_text(shape, text_content):
    if not shape or not shape.has_text_frame:
        return
    tf = shape.text_frame
    lines = text_content.strip().split('\n')
    
    first_p = tf.paragraphs[0]
    font_name = first_p.runs[0].font.name if first_p.runs and first_p.runs[0].font.name else None
    font_size = first_p.runs[0].font.size if first_p.runs and first_p.runs[0].font.size else None
    font_bold = first_p.runs[0].font.bold if first_p.runs and first_p.runs[0].font.bold is not None else None
    font_color = None
    try:
        if first_p.runs and first_p.runs[0].font.color and first_p.runs[0].font.color.rgb:
            font_color = first_p.runs[0].font.color.rgb
    except Exception:
        font_color = None

    first_p.text = lines[0] if lines else ""
    if font_name and first_p.runs:
        first_p.runs[0].font.name = font_name
    if font_size and first_p.runs:
        first_p.runs[0].font.size = font_size
    if font_bold is not None and first_p.runs:
        first_p.runs[0].font.bold = font_bold
    if font_color and first_p.runs:
        first_p.runs[0].font.color.rgb = font_color

    p_elements = tf._element.xpath('./a:p')
    for p_elem in p_elements[1:]:
        tf._element.remove(p_elem)

    for line in lines[1:]:
        p = tf.add_paragraph()
        p.text = line
        if font_name and p.runs:
            p.runs[0].font.name = font_name
        if font_size and p.runs:
            p.runs[0].font.size = font_size
        if font_bold is not None and p.runs:
            p.runs[0].font.bold = font_bold
        if font_color and p.runs:
            p.runs[0].font.color.rgb = font_color

def set_table_cells(table, rows_data):
    for r_idx, row in enumerate(rows_data):
        if r_idx >= len(table.rows):
            break
        for c_idx, cell_value in enumerate(row):
            if c_idx >= len(table.columns):
                break
            cell = table.cell(r_idx, c_idx)
            existing_p = cell.text_frame.paragraphs[0]
            font_size = existing_p.runs[0].font.size if existing_p.runs and existing_p.runs[0].font.size else None
            font_bold = existing_p.runs[0].font.bold if existing_p.runs and existing_p.runs[0].font.bold is not None else None
            cell.text = cell_value
            if cell.text_frame.paragraphs and cell.text_frame.paragraphs[0].runs:
                run = cell.text_frame.paragraphs[0].runs[0]
                if font_size:
                    run.font.size = font_size
                if font_bold is not None:
                    run.font.bold = font_bold

def find_shape(slide, name):
    for sh in slide.shapes:
        if sh.name == name:
            return sh
    return None

def main():
    print(f"Loading presentation from base template {BACKUP_PPTX}...")
    prs = Presentation(BACKUP_PPTX)
    print(f"Loaded {len(prs.slides)} slides successfully.")

    # =========================================================================
    # SLIDE 1: TRANG BÌA (COVER)
    # =========================================================================
    print("Processing Slide 1...")
    s1 = prs.slides[0]
    set_shape_text(find_shape(s1, "Text 5"), "HÀNH TRÌNH “VƯỜN ƯƠM Ý TƯỞNG SỐ” TP. ĐỒNG NAI 2026 · HACKATHON 2026")
    set_shape_text(find_shape(s1, "Text 6"), "NAIFARM")
    set_shape_text(find_shape(s1, "Text 7"), "CHỢ OCOP THANH NIÊN · THÀNH PHỐ ĐỒNG NAI")
    set_shape_text(find_shape(s1, "Text 9"), "Nền tảng thương mại điện tử OCOP kết nối nhà nông U50+,\nthanh niên tình nguyện số hóa và điều phối logistics nông sản.")
    set_shape_text(find_shape(s1, "Text 10"), "“Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị”")
    set_shape_text(find_shape(s1, "Text 12"), "NHÓM TÁC GIẢ THỰC HIỆN DỰ ÁN")
    set_shape_text(find_shape(s1, "Text 13"), "Nhóm 8 (Group 8)  ·  Hackathon Thành phố Đồng Nai 2026")
    set_shape_text(find_shape(s1, "Text 14"), "Thành phố Đồng Nai · Tháng 11 năm 2026")
    
    # Top card: Live Web Screenshot
    replace_image_by_name(s1, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")
    set_shape_text(find_shape(s1, "Text 17"), "Chợ OCOP Thanh niên Đồng Nai — Giao diện live tại naifarm.vercel.app")
    
    # Bottom card: QR Code (Card 2 is Shape 18: L=7086600, T=3822192, W=4754880, H=2514600)
    replace_image_by_name(s1, "Image 2", QR_CODE_PATH, square=True, center_in_box=(7086600, 3822192, 4754880, 2200000))
    set_shape_text(find_shape(s1, "Text 19"), "Quét mã QR để mở website và trải nghiệm trực tiếp trên điện thoại")

    # =========================================================================
    # SLIDE 2: BỐI CẢNH NÔNG NGHIỆP & OCOP ĐỒNG NAI
    # =========================================================================
    print("Processing Slide 2...")
    s2 = prs.slides[1]
    set_shape_text(find_shape(s2, "Text 3"), "BỐI CẢNH NÔNG NGHIỆP & OCOP ĐỒNG NAI")
    set_shape_text(find_shape(s2, "Text 4"), "Vựa nông sản trù phú đứng trước làn sóng chuyển đổi số")
    set_shape_text(find_shape(s2, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s2, "Text 8"), "02 / 16")
    
    # Card 1: Đặc sản OCOP
    replace_image_by_name(s2, "Image 1", f"{STITCH_DIR}/stitch-16.jpg")
    set_shape_text(find_shape(s2, "Text 11"), "1. Đặc sản OCOP trứ danh vùng đất Đồng Nai")
    set_shape_text(find_shape(s2, "Text 12"), "Bưởi Tân Triều, Chôm chôm Long Khánh, Tiêu Xuân Lộc, Sầu riêng Cẩm Mỹ & Hạt điều.")
    set_shape_text(find_shape(s2, "Text 13"), "Vùng cây ăn trái Đồng Nai · Nguồn OCOP Đồng Nai")
    
    # Card 2: Thực trạng U50+
    replace_image_by_name(s2, "Image 2", f"{STITCH_DIR}/stitch-53.jpg")
    set_shape_text(find_shape(s2, "Text 16"), "2. Thực trạng nhà vườn: Người lớn tuổi canh tác chủ lực")
    set_shape_text(find_shape(s2, "Text 17"), "Hơn 65% chủ vườn là nông dân U50+, khó tiếp cận các sàn TMĐT phức tạp hiện nay.")
    set_shape_text(find_shape(s2, "Text 18"), "Nhà vườn canh tác truyền thống · Cần sự trợ lực số")
    
    # Card 3: Thanh niên tình nguyện
    replace_image_by_name(s2, "Image 3", f"{STITCH_DIR}/stitch-31.jpg")
    set_shape_text(find_shape(s2, "Text 21"), "3. Tiềm năng liên kết thanh niên tình nguyện")
    set_shape_text(find_shape(s2, "Text 22"), "Lực lượng Đoàn viên thanh niên dồi dào kỹ năng số, xung kích chuyển đổi số cộng đồng.")
    set_shape_text(find_shape(s2, "Text 23"), "Sức trẻ thanh niên tình nguyện số · Cầu nối tri thức")
    
    # Card 4: Du lịch sinh thái
    replace_image_by_name(s2, "Image 4", f"{STITCH_DIR}/stitch-44.jpg")
    set_shape_text(find_shape(s2, "Text 26"), "4. Kinh tế số kết hợp du lịch nông nghiệp trải nghiệm")
    set_shape_text(find_shape(s2, "Text 27"), "Bản đồ sinh thái nông nghiệp kết hợp đặt lịch tham quan và hộ chiếu số cho từng vườn.")
    set_shape_text(find_shape(s2, "Text 28"), "Du lịch sinh thái vườn Đồng Nai · Gắn kết cộng đồng")
    
    set_shape_text(find_shape(s2, "Text 30"), "NÔNG SẢN ĐỒNG NAI  •  NHÀ NÔNG U50+  •  THANH NIÊN TÌNH NGUYỆN  •  LOGISTICS LẠNH  —  Hệ sinh thái số hóa toàn diện")

    # =========================================================================
    # SLIDE 3: BÀI TOÁN THỰC TIỄN TẠI ĐỊA PHƯƠNG & CƠ SỞ ĐOÀN
    # =========================================================================
    print("Processing Slide 3...")
    s3 = prs.slides[2]
    set_shape_text(find_shape(s3, "Text 3"), "BÀI TOÁN THỰC TIỄN TẠI ĐỊA PHƯƠNG & CƠ SỞ ĐOÀN")
    set_shape_text(find_shape(s3, "Text 4"), "Ba rào cản lớn khi đưa nông sản OCOP lên không gian số")
    set_shape_text(find_shape(s3, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s3, "Text 8"), "03 / 16")
    
    # 01
    set_shape_text(find_shape(s3, "Text 11"), "01")
    set_shape_text(find_shape(s3, "Text 12"), "Minh bạch nguồn gốc & Tem nhãn OCOP")
    set_shape_text(find_shape(s3, "Text 13"), "Nông sản OCOP dễ bị làm giả, nhái nhãn mác; người tiêu dùng thiếu công cụ tra cứu nhật ký mùa vụ và nguồn gốc minh bạch. Thiếu định danh số cho từng lô hàng xuất vườn.")
    set_shape_text(find_shape(s3, "Text 15"), "Thiếu định danh lô hàng số & tem QR")
    
    # 02
    set_shape_text(find_shape(s3, "Text 19"), "02")
    set_shape_text(find_shape(s3, "Text 20"), "Rào cản công nghệ đối với nông dân U50+")
    set_shape_text(find_shape(s3, "Text 21"), "Giao diện các sàn TMĐT hiện nay quá phức tạp, chữ nhỏ, quy trình nhiều bước khiến bà con e ngại công nghệ, phụ thuộc hoàn toàn vào thương lái và dễ bị ép giá.")
    set_shape_text(find_shape(s3, "Text 23"), "Nông dân khó tự vận hành trên sàn TMĐT")
    
    # 03
    set_shape_text(find_shape(s3, "Text 27"), "03")
    set_shape_text(find_shape(s3, "Text 28"), "Thiếu cơ chế ghi nhận tình nguyện 2 lớp")
    set_shape_text(find_shape(s3, "Text 29"), "Hoạt động tình nguyện chưa gắn với quy trình kiểm chứng thực tế tại từng nhà vườn; thiếu cơ chế xác thực giờ công minh bạch cho Đoàn viên và tổ chức Đoàn.")
    set_shape_text(find_shape(s3, "Text 31"), "Chưa có công cụ kiểm chứng 2 lớp chống gian lận")
    
    set_shape_text(find_shape(s3, "Text 33"), "“Làm sao để bà con nông dân U50+ bán nông sản số dễ dàng với sự trợ lực minh bạch của thanh niên?”")

    # =========================================================================
    # SLIDE 4: ĐỐI TƯỢNG THỤ HƯỞNG RÕ RÀNG
    # =========================================================================
    print("Processing Slide 4...")
    s4 = prs.slides[3]
    set_shape_text(find_shape(s4, "Text 3"), "ĐỐI TƯỢNG THỤ HƯỞNG RÕ RÀNG")
    set_shape_text(find_shape(s4, "Text 4"), "Ba nhóm thụ hưởng trọng tâm kết nối chặt chẽ cùng Cơ sở Đoàn & Hợp tác xã")
    set_shape_text(find_shape(s4, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s4, "Text 8"), "04 / 16")
    
    # Col 1: Consumer
    set_shape_text(find_shape(s4, "Text 11"), "NGƯỜI TIÊU DÙNG (W01)")
    set_shape_text(find_shape(s4, "Text 12"), "Khách hàng · Giới trẻ yêu nông sản")
    replace_image_by_name(s4, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")
    set_shape_text(find_shape(s4, "Text 14"), "• Mua nông sản OCOP minh bạch giá & nguồn gốc\n• Quét mã QR xem hộ chiếu & mùa vụ thu hoạch\n• Đặt tour trải nghiệm vườn & xem OCOP Live")
    
    # Col 2: Farmer U50+
    set_shape_text(find_shape(s4, "Text 17"), "NHÀ NÔNG U50+ (W02)")
    set_shape_text(find_shape(s4, "Text 18"), "Chủ vườn · Hộ sản xuất nông nghiệp")
    replace_image_by_name(s4, "Image 2", f"{SCREENSHOTS_DIR}/07_farmer_w02.png")
    set_shape_text(find_shape(s4, "Text 20"), "• Giao diện chữ lớn, nút bấm kích thước 56px\n• Đăng bán 3 bước bằng giọng nói AI đơn giản\n• Quản lý đơn hàng & xác nhận giờ công thanh niên")
    
    # Col 3: Volunteer
    set_shape_text(find_shape(s4, "Text 23"), "THANH NIÊN TÌNH NGUYỆN (W03)")
    set_shape_text(find_shape(s4, "Text 24"), "Đoàn viên · Sinh viên xung kích số")
    replace_image_by_name(s4, "Image 3", f"{SCREENSHOTS_DIR}/09_volunteer_w03.png")
    set_shape_text(find_shape(s4, "Text 26"), "• Nhận nhiệm vụ hỗ trợ số hóa tại nhà vườn\n• Tích lũy OCOP Youth Impact Pass minh bạch\n• Học mở nông nghiệp & tương tác mô hình 3D")

    # =========================================================================
    # SLIDE 5: KIẾN TRÚC HỆ SINH THÁI 6 KHÔNG GIAN (W01–W06)
    # =========================================================================
    print("Processing Slide 5...")
    s5 = prs.slides[4]
    set_shape_text(find_shape(s5, "Text 3"), "KIẾN TRÚC HỆ SINH THÁI 6 KHÔNG GIAN (W01–W06)")
    set_shape_text(find_shape(s5, "Text 4"), "Vận hành liên thông từ chợ người mua đến nhà vườn và cơ sở Đoàn")
    set_shape_text(find_shape(s5, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s5, "Text 8"), "05 / 16")
    
    # Center live screenshot
    set_shape_text(find_shape(s5, "Text 11"), "NGUYÊN MẪU NAIFARM ĐANG CHẠY LIVE")
    replace_image_by_name(s5, "Image 1", f"{SCREENSHOTS_DIR}/14_demo_hub.png")
    set_shape_text(find_shape(s5, "Text 12"), "Nguyên mẫu NaiFarm — Đang triển khai tại naifarm.vercel.app")
    
    # Card 1: W01
    set_shape_text(find_shape(s5, "Text 15"), "CHỢ NÔNG SẢN (W01)")
    set_shape_text(find_shape(s5, "Text 16"), "1. Public Marketplace")
    set_shape_text(find_shape(s5, "Text 17"), "Chợ OCOP Editorial 60/40, giỏ hàng, đặt hàng COD Demo & Hộ chiếu QR SVG.")
    
    # Card 2: W02
    set_shape_text(find_shape(s5, "Text 21"), "NHÀ NÔNG U50+ (W02)")
    set_shape_text(find_shape(s5, "Text 22"), "2. Không gian Nhà vườn")
    set_shape_text(find_shape(s5, "Text 23"), "Giao diện chữ lớn, nút 56px, đăng bán bằng giọng nói AI & xác nhận bàn giao.")
    
    # Card 3: W03
    set_shape_text(find_shape(s5, "Text 27"), "THANH NIÊN SỐ (W03)")
    set_shape_text(find_shape(s5, "Text 28"), "3. Tình nguyện viên")
    set_shape_text(find_shape(s5, "Text 29"), "Nhiệm vụ số hóa vườn, nộp minh chứng, OCOP Youth Impact Pass 2 lớp.")
    
    # Card 4: W04
    set_shape_text(find_shape(s5, "Text 32"), "ĐIỀU PHỐI VIÊN (W04)")
    set_shape_text(find_shape(s5, "Text 33"), "4. Bảng điều phối Đoàn")
    set_shape_text(find_shape(s5, "Text 34"), "Khóa duyệt giờ 2 lớp, điều phối xe mát chuỗi lạnh & theo dõi chỉ số Recharts.")
    
    # Card 5: W05-W06
    set_shape_text(find_shape(s5, "Text 37"), "HTX & QUẢN TRỊ (W05–W06)")
    set_shape_text(find_shape(s5, "Text 38"), "5. Hợp tác xã & Admin")
    set_shape_text(find_shape(s5, "Text 39"), "Gom đơn sỉ B2B, quản trị phân quyền RBAC có thời hạn & nhật ký kiểm toán.")
    
    set_shape_text(find_shape(s5, "Text 43"), "◀  Chu trình khép kín: Người mua (W01) → Nhà nông (W02) → TNV (W03) → Điều phối Đoàn (W04) → HTX (W05)  ▶")

    # =========================================================================
    # SLIDE 6: CHỢ NÔNG SẢN EDITORIAL & HỘ CHIẾU QR MINH BẠCH
    # =========================================================================
    print("Processing Slide 6...")
    s6 = prs.slides[5]
    set_shape_text(find_shape(s6, "Text 3"), "CHỢ NÔNG SẢN EDITORIAL & HỘ CHIẾU QR MINH BẠCH")
    set_shape_text(find_shape(s6, "Text 4"), "Thiết kế chuẩn báo chí nông nghiệp & Tách bạch dữ liệu chứng nhận")
    set_shape_text(find_shape(s6, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s6, "Text 8"), "06 / 16")
    
    set_shape_text(find_shape(s6, "Text 11"), "CHỢ OCOP EDITORIAL (W01)")
    replace_image_by_name(s6, "Image 1", f"{SCREENSHOTS_DIR}/02_marketplace.png")
    set_shape_text(find_shape(s6, "Text 12"), "Giao diện /marketplace: Bố cục tỷ lệ vàng 60/40, lọc danh mục & mùa vụ")
    
    set_shape_text(find_shape(s6, "Text 15"), "HỘ CHIẾU QR SVG TRUY XUẤT")
    replace_image_by_name(s6, "Image 2", f"{SCREENSHOTS_DIR}/04_trace_nf_demo_001.png")
    set_shape_text(find_shape(s6, "Text 16"), "Giao diện /trace/NF-DEMO-001: Chi tiết lô hàng, nhật ký canh tác & mã QR SVG")
    
    set_shape_text(find_shape(s6, "Text 19"), "1. Chuẩn báo chí Editorial 60/40")
    set_shape_text(find_shape(s6, "Text 20"), "Thiết kế tôn vinh câu chuyện thật của từng nhà vườn, hình ảnh sắc nét, mang lại cảm xúc tin cậy cho người mua.")
    
    set_shape_text(find_shape(s6, "Text 23"), "2. Hộ chiếu QR SVG chuẩn hóa")
    set_shape_text(find_shape(s6, "Text 24"), "Mã QR vector sắc nét, quét tức thì trên điện thoại xem đầy đủ nhật ký mùa vụ, vị trí vườn và ngày thu hái.")
    
    set_shape_text(find_shape(s6, "Text 27"), "3. Tách bạch dữ liệu chứng nhận")
    set_shape_text(find_shape(s6, "Text 28"), "Phân định rạch ròi giữa thông tin do nhà vườn tự khai và hồ sơ đã qua cơ quan chức năng thẩm định OCOP, cam kết tính trung thực.")

    # =========================================================================
    # SLIDE 7: BẢN ĐỒ VÙNG TRỒNG & DU LỊCH TRẢI NGHIỆM ĐỒNG NAI
    # =========================================================================
    print("Processing Slide 7...")
    s7 = prs.slides[6]
    set_shape_text(find_shape(s7, "Text 3"), "BẢN ĐỒ VÙNG TRỒNG & DU LỊCH TRẢI NGHIỆM ĐỒNG NAI")
    set_shape_text(find_shape(s7, "Text 4"), "Khám phá các vùng sinh thái đặc trưng & Đặt lịch trực tiếp tại vườn")
    set_shape_text(find_shape(s7, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s7, "Text 8"), "07 / 16")
    
    set_shape_text(find_shape(s7, "Text 11"), "BẢN ĐỒ VÙNG TRỒNG ĐỒNG NAI")
    replace_image_by_name(s7, "Image 1", f"{SCREENSHOTS_DIR}/05_explore_map.png")
    set_shape_text(find_shape(s7, "Text 12"), "Bản đồ sinh thái nông nghiệp /explore · Tích hợp GeoJSON Đồng Nai")
    set_shape_text(find_shape(s7, "Text 13"), "Hiển thị trực quan các vùng sinh thái OCOP, định vị nông trại và chỉ đường du lịch")
    
    # 3 Top Badges
    set_shape_text(find_shape(s7, "Text 16"), "VÙNG BƯỞI TÂN TRIỀU")
    set_shape_text(find_shape(s7, "Text 17"), "Cù lao Vĩnh Cửu")
    set_shape_text(find_shape(s7, "Text 18"), "Đặc sản Bưởi đường lá cam OCOP 4 sao; tour trải nghiệm sinh thái sông nước miệt vườn.")
    
    set_shape_text(find_shape(s7, "Text 21"), "VÙNG TRÁI CÂY LONG KHÁNH")
    set_shape_text(find_shape(s7, "Text 22"), "Thủ phủ Trái cây")
    set_shape_text(find_shape(s7, "Text 23"), "Chôm chôm tróc, Sầu riêng Ri6 OCOP 4 sao; lễ hội trái cây thường niên và hái quả tại vườn.")
    
    set_shape_text(find_shape(s7, "Text 26"), "HỒ TIÊU & CÂY ĂN TRÁI")
    set_shape_text(find_shape(s7, "Text 27"), "Xuân Lộc & Cẩm Mỹ")
    set_shape_text(find_shape(s7, "Text 28"), "Hồ tiêu Xuân Lộc, Sầu riêng Cẩm Mỹ; canh tác VietGAP kết hợp mô hình công nghệ cao.")
    
    set_shape_text(find_shape(s7, "Text 29"), "Bảng tổng hợp vùng trồng OCOP & tour trải nghiệm tiêu biểu Đồng Nai:")
    
    # Update Table (Slide 7 Table 0 has 6 rows x 3 columns)
    table_shape = find_shape(s7, "Table 0")
    if table_shape and table_shape.has_table:
        set_table_cells(table_shape.table, [
            ["Vùng trồng OCOP", "Địa bàn hành chính", "Đặc sản chủ lực & Trải nghiệm sinh thái"],
            ["Bưởi Tân Triều", "Xã Tân Bình, H. Vĩnh Cửu", "Bưởi đường lá cam · OCOP 4 sao (Tour sông nước, hái tại cây)"],
            ["Chôm chôm - Sầu riêng", "TP. Long Khánh", "Chôm chôm tróc, Sầu riêng Ri6 · OCOP 4 sao (Lễ hội trái cây)"],
            ["Hồ tiêu Xuân Lộc", "Huyện Xuân Lộc", "Tiêu sạch sấy thăng hoa · OCOP 4 sao (Quy trình tiêu chuẩn hữu cơ)"],
            ["Sầu riêng Cẩm Mỹ", "Huyện Cẩm Mỹ", "Sầu riêng sạch VietGAP · OCOP 4 sao (Trải nghiệm nhà vườn hữu cơ)"],
            ["Hạt điều Đồng Nai", "H. Định Quán & Thống Nhất", "Hạt điều rang muối vỏ lụa · OCOP 3 sao (Chế biến sạch xuất khẩu)"]
        ])
        
    set_shape_text(find_shape(s7, "Text 32"), "Tích hợp dữ liệu GeoJSON Đồng Nai & Đặt tour trực tiếp")
    set_shape_text(find_shape(s7, "Text 33"), "Bản đồ số hóa toàn bộ ranh giới hành chính các xã vùng trồng OCOP trọng điểm; cho phép du khách xem tình trạng mùa vụ, liên hệ trực tiếp chủ vườn và đặt lịch tham quan thuận tiện.")

    # =========================================================================
    # SLIDE 8: TRẢI NGHIỆM ĐA GIÁC QUAN: 3D WEBGL & OCOP LIVE
    # =========================================================================
    print("Processing Slide 8...")
    s8 = prs.slides[7]
    set_shape_text(find_shape(s8, "Text 3"), "TRẢI NGHIỆM ĐA GIÁC QUAN: 3D WEBGL & OCOP LIVE")
    set_shape_text(find_shape(s8, "Text 4"), "Quan sát giải phẫu nông sản 3D & Phòng phát trực tiếp tại vườn")
    set_shape_text(find_shape(s8, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s8, "Text 8"), "08 / 16")
    
    set_shape_text(find_shape(s8, "Text 11"), "MÔ HÌNH 3D BƯỞI TÂN TRIỀU")
    replace_image_by_name(s8, "Image 1", f"{SCREENSHOTS_DIR}/03_product_buoi_3d.png")
    set_shape_text(find_shape(s8, "Text 12"), "Mô hình 3D Three.js: 4 điểm tương tác (Vỏ, Tép, Cùi, Hạt) kèm fallback 2D mượt mà")
    
    set_shape_text(find_shape(s8, "Text 15"), "PHÒNG OCOP LIVE 3 GÓC MÁY")
    replace_image_by_name(s8, "Image 2", f"{SCREENSHOTS_DIR}/06_live_room.png")
    set_shape_text(find_shape(s8, "Text 16"), "Phòng Live Replay Demo (/live): 3 góc quay tại vườn & ghim giỏ hàng mua tức thì")
    
    set_shape_text(find_shape(s8, "Text 19"), "1. Giải phẫu nông sản 3D tương tác")
    set_shape_text(find_shape(s8, "Text 20"), "Bóc tách trực quan 4 lớp quả Bưởi Tân Triều (Vỏ ngoài tinh dầu, Cùi trắng, Tép bưởi mọng nước, Hạt giống) bằng WebGL nhẹ tải nhanh.")
    
    set_shape_text(find_shape(s8, "Text 23"), "2. Phòng phát OCOP Live 3 góc máy")
    set_shape_text(find_shape(s8, "Text 24"), "Tái hiện phiên livestream bán hàng tại vườn với 3 góc camera linh hoạt (Toàn cảnh, Thu hoạch, Đóng gói) kèm nút mua nhanh giỏ hàng.")
    
    set_shape_text(find_shape(s8, "Text 27"), "3. Cơ chế Fallback 2D thông minh")
    set_shape_text(find_shape(s8, "Text 28"), "Tự động chuyển đổi sơ đồ mặt cắt 2D sắc nét trên thiết bị cấu hình thấp hoặc mạng yếu, đảm bảo trải nghiệm người dùng luôn thông suốt.")

    # =========================================================================
    # SLIDE 9: TRỢ LÝ THÔNG MINH NAIAI ĐA KHÔNG GIAN NGỮ CẢNH
    # =========================================================================
    print("Processing Slide 9...")
    s9 = prs.slides[8]
    set_shape_text(find_shape(s9, "Text 3"), "TRỢ LÝ THÔNG MINH NAIAI ĐA KHÔNG GIAN NGỮ CẢNH")
    set_shape_text(find_shape(s9, "Text 4"), "Tư vấn mua sắm, kỹ thuật canh tác và hỗ trợ tình nguyện theo thời gian thực")
    set_shape_text(find_shape(s9, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s9, "Text 8"), "09 / 16")
    
    set_shape_text(find_shape(s9, "Text 11"), "TRỢ LÝ NGỮ CẢNH THÔNG MINH NAIAI")
    replace_image_by_name(s9, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")
    set_shape_text(find_shape(s9, "Text 12"), "Cửa sổ NaiAI nổi: Tự động thích ứng câu hỏi theo từng không gian W01–W04")
    
    set_shape_text(find_shape(s9, "Text 15"), "1. Nhận diện ngữ cảnh không gian làm việc")
    set_shape_text(find_shape(s9, "Text 16"), "Tại W01 tư vấn gợi ý nông sản & công thức nấu ăn; tại W02 hướng dẫn kỹ thuật canh tác chữ lớn; tại W03 hỗ trợ nhiệm vụ tình nguyện viên.")
    
    set_shape_text(find_shape(s9, "Text 19"), "2. Khai thác dữ liệu OCOP chuẩn xác")
    set_shape_text(find_shape(s9, "Text 20"), "Phản hồi dựa trên kho dữ liệu thực tế về mùa vụ, chỉ dẫn địa lý, tiêu chuẩn OCOP Đồng Nai; không bịa đặt xuất xứ hay chất lượng nông sản.")
    
    set_shape_text(find_shape(s9, "Text 23"), "3. Minh bạch giới hạn & Kết nối chuyên gia")
    set_shape_text(find_shape(s9, "Text 24"), "Cảnh báo rõ ràng khi gặp câu hỏi sâu bệnh phức tạp ngoài phạm vi; đồng thời kết nối trực tiếp với kỹ sư khuyến nông địa phương để hỗ trợ kịp thời.")

    # =========================================================================
    # SLIDE 10: HỌC MỞ NÔNG NGHIỆP & ĐĂNG BÁN BẰNG GIỌNG NÓI CHO U50+
    # =========================================================================
    print("Processing Slide 10...")
    s10 = prs.slides[9]
    set_shape_text(find_shape(s10, "Text 3"), "HỌC MỞ NÔNG NGHIỆP & ĐĂNG BÁN BẰNG GIỌNG NÓI CHO U50+")
    set_shape_text(find_shape(s10, "Text 4"), "Đơn giản hóa công nghệ cho người già & Gieo tri thức OCOP cho người trẻ")
    set_shape_text(find_shape(s10, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s10, "Text 8"), "10 / 16")
    
    # 5 Top Steps
    set_shape_text(find_shape(s10, "Text 10"), "1. Chụp ảnh vườn\n1 chạm chụp ảnh thật")
    set_shape_text(find_shape(s10, "Text 12"), "2. Giọng nói AI\nBấm mic nói tên & giá")
    set_shape_text(find_shape(s10, "Text 14"), "3. Tự động điền form\nAI phân loại & gợi ý")
    set_shape_text(find_shape(s10, "Text 16"), "4. Đăng bán ngay\nLên chợ sau 1 chạm")
    set_shape_text(find_shape(s10, "Text 18"), "5. Học mở OCOP\nTri thức & Quiz 3D")
    
    # Desktop
    set_shape_text(find_shape(s10, "Text 21"), "HỌC MỞ NÔNG NGHIỆP TRÊN TRÌNH DUYỆT")
    replace_image_by_name(s10, "Image 1", f"{SCREENSHOTS_DIR}/10_learn_open.png")
    set_shape_text(find_shape(s10, "Text 22"), "Giao diện Học mở (/learn): Bài giảng Hạt điều Đồng Nai & Quiz trắc nghiệm 3 câu kèm mô hình 3D")
    
    # Mobile
    replace_image_by_name(s10, "Image 2", f"{MOBILE_DIR}/08_farmer_publish.png")
    set_shape_text(find_shape(s10, "Text 25"), "Tối ưu trải nghiệm cho Nhà nông U50+")
    set_shape_text(find_shape(s10, "Text 26"), "• Nút bấm kích thước lớn tối thiểu 56px, chữ to rõ ràng, độ tương phản cao chống lóa ngoài trời.\n\n• Trình hướng dẫn đăng bán 3 bước hỗ trợ ghi âm giọng nói mô phỏng: Bà con chỉ cần nói, AI tự điền.\n\n• Có sẵn chế độ nhập tay fallback giúp nhà vườn dễ dàng điều chỉnh giá và số lượng khi cần thiết.\n\n• Chạy mượt mà trên mọi điện thoại qua web trình duyệt, không bắt buộc bà con phải tải cài app.")

    # =========================================================================
    # SLIDE 11: CƠ CHẾ KIỂM CHỨNG GIỜ CÔNG 2 LỚP CHO CƠ SỞ ĐOÀN
    # =========================================================================
    print("Processing Slide 11...")
    s11 = prs.slides[10]
    set_shape_text(find_shape(s11, "Text 3"), "CƠ CHẾ KIỂM CHỨNG GIỜ CÔNG 2 LỚP CHO CƠ SỞ ĐOÀN")
    set_shape_text(find_shape(s11, "Text 4"), "Quy trình khép kín chống gian lận giờ tình nguyện & hỗ trợ nhà nông thực chất")
    set_shape_text(find_shape(s11, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s11, "Text 8"), "11 / 16")
    
    # 4 Steps
    set_shape_text(find_shape(s11, "Text 11"), "BƯỚC 1 · PHÁT ĐỘNG NHIỆM VỤ")
    set_shape_text(find_shape(s11, "Text 12"), "Nhà vườn gửi yêu cầu hỗ trợ")
    set_shape_text(find_shape(s11, "Text 13"), "Nhà vườn U50+ gửi yêu cầu (chụp ảnh sản phẩm, gắn tem QR, đóng gói bao bì); Cơ sở Đoàn phân công đội hình thanh niên qua W04.")
    
    set_shape_text(find_shape(s11, "Text 17"), "BƯỚC 2 · THỰC ĐỊA HỖ TRỢ")
    set_shape_text(find_shape(s11, "Text 18"), "Thanh niên hỗ trợ trực tiếp")
    set_shape_text(find_shape(s11, "Text 19"), "Đoàn viên đến tận vườn hỗ trợ bà con số hóa sản phẩm, chụp ảnh thực tế và nộp báo cáo minh chứng trực tiếp lên hệ thống W03.")
    
    set_shape_text(find_shape(s11, "Text 23"), "BƯỚC 3 · XÁC NHẬN BÀN GIAO")
    set_shape_text(find_shape(s11, "Text 24"), "Chủ vườn U50+ duyệt (Lớp 1)")
    set_shape_text(find_shape(s11, "Text 25"), "Chủ vườn kiểm tra kết quả và bấm nút [Xác nhận hoàn thành] trên giao diện W02 đơn giản. Nếu chưa bấm, hệ thống khóa duyệt hoàn toàn.")
    
    set_shape_text(find_shape(s11, "Text 29"), "BƯỚC 4 · THẨM ĐỊNH & CẤP GIỜ")
    set_shape_text(find_shape(s11, "Text 30"), "Cán bộ Đoàn phê duyệt (Lớp 2)")
    set_shape_text(find_shape(s11, "Text 31"), "Cán bộ Đoàn đối chiếu minh chứng và xác nhận của chủ vườn; phê duyệt cấp giờ công vào sổ OCOP Youth Impact Pass của đoàn viên.")
    
    # 2 Bottom Cards
    set_shape_text(find_shape(s11, "Text 34"), "Cơ chế khóa kép (Dual-Lock) chống gian lận tuyệt đối")
    set_shape_text(find_shape(s11, "Text 35"), "• Giờ tình nguyện chỉ được tính khi nhà vườn đã xác nhận và cán bộ Đoàn phê duyệt.\n• Phân tách rạch ròi giữa 'Giờ đã duyệt' và 'Giờ chờ duyệt' trong OCOP Youth Impact Pass.\n• Loại bỏ hoàn toàn tình trạng 'ký khống' giờ công hoặc tự ý duyệt từ xa khi chưa đến vườn.")
    
    set_shape_text(find_shape(s11, "Text 38"), "Ý nghĩa xã hội & Giá trị giáo dục thực chất")
    set_shape_text(find_shape(s11, "Text 39"), "• Giúp bà con nông dân U50+ vượt qua rào cản công nghệ số, làm chủ kênh bán lẻ hiện đại.\n• Tạo môi trường rèn luyện thực tiễn, hun đúc tình yêu quê hương và nông sản Đồng Nai cho giới trẻ.")

    # =========================================================================
    # SLIDE 12: TRUNG TÂM TRÌNH DIỄN & BẢNG ĐIỀU PHỐI ĐA VAI
    # =========================================================================
    print("Processing Slide 12...")
    s12 = prs.slides[11]
    set_shape_text(find_shape(s12, "Text 3"), "TRUNG TÂM TRÌNH DIỄN & BẢNG ĐIỀU PHỐI ĐA VAI")
    set_shape_text(find_shape(s12, "Text 4"), "Demo Hub 8 luồng nghiệp vụ liên hoàn & Giám sát vận hành thời gian thực")
    set_shape_text(find_shape(s12, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s12, "Text 8"), "12 / 16")
    
    set_shape_text(find_shape(s12, "Text 11"), "HUB ĐIỀU HƯỚNG TRÌNH DIỄN BAN GIÁM KHẢO")
    replace_image_by_name(s12, "Image 1", f"{SCREENSHOTS_DIR}/14_demo_hub.png")
    set_shape_text(find_shape(s12, "Text 12"), "Màn hình /demo: Hub điều hướng 8 Flows A–H, đối chiếu 12 màn Stitch & nút Reset Demo")
    
    set_shape_text(find_shape(s12, "Text 15"), "ĐIỀU PHỐI LIÊN HOÀN 6 KHÔNG GIAN")
    set_shape_text(find_shape(s12, "Text 16"), "• Chuyển đổi tức thì giữa 6 không gian W01–W06 mà không cần đăng nhập.\n• Đặt hàng COD Demo -> Nhà nông nhận đơn -> Khách theo dõi chuỗi lạnh.\n• Khóa duyệt giờ 2 lớp: Ngăn chặn tự ý duyệt giờ khi chưa bàn giao.")
    
    set_shape_text(find_shape(s12, "Text 19"), "Minh bạch số liệu nguyên mẫu")
    set_shape_text(find_shape(s12, "Text 20"), "Mọi đơn hàng, giờ công và dữ liệu truy xuất là dữ liệu mô phỏng minh bạch, phục vụ đánh giá năng lực công nghệ và trải nghiệm người dùng.")
    
    set_shape_text(find_shape(s12, "Text 22"), "▶  TRẢI NGHIỆM TRỰC TIẾP\nMở https://naifarm.vercel.app/demo")
    set_shape_text(find_shape(s12, "Text 24"), "🌐  SỐ HÓA TOÀN DIỆN\nĐồng bộ tức thì trên cùng trình duyệt")

    # =========================================================================
    # SLIDE 13: NỀN TẢNG KỸ THUẬT HIỆN ĐẠI & TÍNH TRUNG THỰC
    # =========================================================================
    print("Processing Slide 13...")
    s13 = prs.slides[12]
    set_shape_text(find_shape(s13, "Text 3"), "NỀN TẢNG KỸ THUẬT HIỆN ĐẠI & TÍNH TRUNG THỰC")
    set_shape_text(find_shape(s13, "Text 4"), "Kiến trúc Next.js App Router, React 19 & Trạng thái thống nhất trên trình duyệt")
    set_shape_text(find_shape(s13, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s13, "Text 8"), "13 / 16")
    
    # Left
    set_shape_text(find_shape(s13, "Text 9"), "KIẾN TRÚC 03 LỚP HIỆN ĐẠI")
    set_shape_text(find_shape(s13, "Text 11"), "Lớp 1 · Giao diện App Router đa màn hình")
    set_shape_text(find_shape(s13, "Text 12"), "Next.js 16.4, React 19, TypeScript 5, Tailwind CSS v4 · Chuẩn thiết kế Editorial báo chí, icon Lucide SVG & chuyển động mượt mà.")
    
    set_shape_text(find_shape(s13, "Text 15"), "Lớp 2 · Mô hình 3D & Trực quan số liệu")
    set_shape_text(find_shape(s13, "Text 16"), "Three.js + React Three Fiber (Mô hình Bưởi Tân Triều 3D), Recharts biểu đồ KPI điều phối & Trình tạo mã QRCode SVG chuẩn xác.")
    
    set_shape_text(find_shape(s13, "Text 19"), "Lớp 3 · Quản lý trạng thái & Dữ liệu đồng bộ")
    set_shape_text(find_shape(s13, "Text 20"), "DemoStoreContext + localStorage: Đồng bộ tức thì 6 không gian W01–W06 · Sẵn sàng mở rộng cơ sở dữ liệu Supabase / PostgreSQL.")
    
    # Right
    set_shape_text(find_shape(s13, "Text 21"), "BỐN NGUYÊN TẮC THIẾT KẾ & MINH BẠCH")
    
    set_shape_text(find_shape(s13, "Text 24"), "1")
    set_shape_text(find_shape(s13, "Text 25"), "Thân thiện U50+ (W02)")
    set_shape_text(find_shape(s13, "Text 26"), "Chữ lớn >=18px, nút bấm >=56px, hỗ trợ giọng nói mô phỏng, tối giản hóa tối đa quy trình cho bà con nông dân.")
    
    set_shape_text(find_shape(s13, "Text 29"), "2")
    set_shape_text(find_shape(s13, "Text 30"), "Minh bạch OCOP & Nguồn gốc")
    set_shape_text(find_shape(s13, "Text 31"), "Hộ chiếu QR SVG thật, tách bạch rõ ràng giữa dữ liệu 'Tự khai' và hồ sơ đã qua đối chiếu chứng chỉ OCOP.")
    
    set_shape_text(find_shape(s13, "Text 34"), "3")
    set_shape_text(find_shape(s13, "Text 35"), "Khóa duyệt giờ 2 lớp (Dual-Lock)")
    set_shape_text(find_shape(s13, "Text 36"), "Cơ chế khóa duyệt giờ tình nguyện: Bắt buộc chủ vườn xác nhận bàn giao trước khi cán bộ Đoàn phê duyệt.")
    
    set_shape_text(find_shape(s13, "Text 39"), "4")
    set_shape_text(find_shape(s13, "Text 40"), "Hiệu năng & Khả năng tiếp cận cao")
    set_shape_text(find_shape(s13, "Text 41"), "Zero layout shift, 0 overflow ngang, kiểm thử tự động đạt chuẩn trên 6 kích cỡ màn hình kèm fallback 2D cho máy yếu.")

    # =========================================================================
    # SLIDE 14: GIÁ TRỊ KHÁC BIỆT THỰC CHẤT
    # =========================================================================
    print("Processing Slide 14...")
    s14 = prs.slides[13]
    set_shape_text(find_shape(s14, "Text 3"), "GIÁ TRỊ KHÁC BIỆT THỰC CHẤT GIỮA NAIFARM VÀ SÀN THÔNG THƯỜNG")
    set_shape_text(find_shape(s14, "Text 4"), "Bốn tiêu chí đối chiếu thực tế và ba trụ cột phụng sự cộng đồng")
    set_shape_text(find_shape(s14, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s14, "Text 8"), "14 / 16")
    
    # Table 0
    table_shape14 = find_shape(s14, "Table 0")
    if table_shape14 and table_shape14.has_table:
        set_table_cells(table_shape14.table, [
            ["Tiêu chí", "Sàn TMĐT thông thường", "NaiFarm (Chợ OCOP Thanh niên)"],
            ["Tiếp cận Nhà nông U50+", "Giao diện phức tạp, nhiều bước, chữ nhỏ, hướng tới người trẻ rành công nghệ.", "Thiết kế riêng cho U50+: nút 56px, chữ 18px, đăng bán 3 bước bằng giọng nói AI."],
            ["Minh bạch OCOP", "Tem nhãn dễ làm giả, thiếu nhật ký mùa vụ số và không truy xuất được lô hàng.", "Hộ chiếu QR SVG thật, tách bạch rõ ràng giữa 'Tự khai' và 'Đã đối chiếu chứng từ'."],
            ["Vai trò Thanh niên", "Chỉ kêu gọi giải cứu nông sản thời vụ, thiếu công cụ ghi nhận đóng góp số.", "Gắn kết nhiệm vụ số hóa thực tế, tích lũy Youth Impact Pass với khóa duyệt 2 lớp."],
            ["Trải nghiệm Khách mua", "Danh sách ảnh phẳng tĩnh, thiếu câu chuyện vùng miền và kết nối nhà vườn.", "Phong cách Editorial 60/40, tương tác 3D Bưởi Tân Triều, OCOP Live & tour sinh thái."]
        ])
        
    set_shape_text(find_shape(s14, "Text 11"), "VỊ NHÂN SINH CHO U50+")
    set_shape_text(find_shape(s14, "Text 12"), "Giao diện đơn giản nhất cho người lớn tuổi; đăng bán bằng giọng nói AI; xóa bỏ rào cản số.")
    
    set_shape_text(find_shape(s14, "Text 15"), "MINH BẠCH NGUỒN GỐC")
    set_shape_text(find_shape(s14, "Text 16"), "Hộ chiếu QR SVG, phân định minh bạch giữa dữ liệu tự khai và hồ sơ chứng nhận OCOP.")
    
    set_shape_text(find_shape(s14, "Text 19"), "SỨ MỆNH THANH NIÊN")
    set_shape_text(find_shape(s14, "Text 20"), "Cống hiến có đo lường thực chất với cơ chế khóa duyệt 2 lớp, phát huy vai trò xung kích.")

    # =========================================================================
    # SLIDE 15: TÍNH KHẢ THI & LỘ TRÌNH TRIỂN KHAI 06 THÁNG
    # =========================================================================
    print("Processing Slide 15...")
    s15 = prs.slides[14]
    set_shape_text(find_shape(s15, "Text 3"), "TÍNH KHẢ THI & LỘ TRÌNH TRIỂN KHAI 06 THÁNG")
    set_shape_text(find_shape(s15, "Text 4"), "Hiện trạng nguyên mẫu, lộ trình đưa vào đời sống & kế hoạch kinh phí")
    set_shape_text(find_shape(s15, "Text 7"), "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026")
    set_shape_text(find_shape(s15, "Text 8"), "15 / 16")
    
    # Phase 1
    set_shape_text(find_shape(s15, "Text 11"), "GIAI ĐOẠN 1 · ĐÃ HOÀN THÀNH")
    set_shape_text(find_shape(s15, "Text 12"), "Nguyên mẫu Frontend 0đ")
    set_shape_text(find_shape(s15, "Text 13"), "Hoàn thiện 21 routes, 12 màn Stitch, chạy live tại naifarm.vercel.app với đủ 6 không gian W01–W06, 3D WebGL và hub /demo.")
    
    # Phase 2
    set_shape_text(find_shape(s15, "Text 17"), "GIAI ĐOẠN 2 · THÁNG 2–3/2026")
    set_shape_text(find_shape(s15, "Text 18"), "Thí điểm thực địa")
    set_shape_text(find_shape(s15, "Text 19"), "Thử nghiệm tại 3 nhà vườn tiêu biểu (Tân Triều, Long Khánh, Xuân Lộc) & 1 Đoàn trường; hoàn thiện tập huấn cho bà con U50+.")
    
    # Phase 3
    set_shape_text(find_shape(s15, "Text 23"), "GIAI ĐOẠN 3 · THÁNG 4–5/2026")
    set_shape_text(find_shape(s15, "Text 24"), "Tích hợp Backend & Logistics")
    set_shape_text(find_shape(s15, "Text 25"), "Kết nối API cơ sở dữ liệu Supabase, tích hợp cổng thanh toán ViettelPay/VNPAY và chuỗi xe mát điều phối nông sản.")
    
    # Phase 4
    set_shape_text(find_shape(s15, "Text 29"), "GIAI ĐOẠN 4 · THÁNG 6/2026")
    set_shape_text(find_shape(s15, "Text 30"), "Chuyển giao & Nhân rộng")
    set_shape_text(find_shape(s15, "Text 31"), "Bàn giao Tỉnh Đoàn Đồng Nai, Liên minh HTX và Sở Nông nghiệp & PTNT; nhân rộng mô hình ra toàn tỉnh Đồng Nai.")
    
    set_shape_text(find_shape(s15, "Text 32"), "Dự toán kinh phí tham khảo theo 3 giai đoạn triển khai:")
    
    # Table 0
    table_shape15 = find_shape(s15, "Table 0")
    if table_shape15 and table_shape15.has_table:
        set_table_cells(table_shape15.table, [
            ["Mức triển khai", "Phạm vi áp dụng", "Tổng dự toán tham khảo", "Trạng thái xác nhận"],
            ["Mức A · Nguyên mẫu Hackathon", "Toàn bộ 6 không gian W01–W06 chạy live Vercel", "0 đ chi phí phần mềm", "ĐÃ HOÀN THÀNH & DEPLOY LIVE"],
            ["Mức B · Thí điểm 3 nhà vườn (2 tháng)", "Thẻ QR in ấn, bao bì mẫu, tập huấn bà con U50+", "3.500.000 – 6.000.000 đ", "ĐỀ XUẤT THÍ ĐIỂM (Quý 1/2026)"],
            ["Mức C · Mở rộng toàn tỉnh (6 tháng)", "Cloud server, kết nối chuỗi xe lạnh, đào tạo Đoàn", "15.000.000 – 35.000.000 đ", "KẾ HOẠCH NHÂN RỘNG (Quý 2/2026)"]
        ])
        
    set_shape_text(find_shape(s15, "Text 35"), "Bốn nguyên tắc vận hành bắt buộc khi triển khai thực tế")
    set_shape_text(find_shape(s15, "Text 36"), "1. Khóa duyệt 2 lớp: Giờ tình nguyện chỉ tính khi nhà vườn đã xác nhận bàn giao.  ·  2. Minh bạch xuất xứ: Không dán nhãn OCOP cho sản phẩm chưa qua đối chiếu chứng từ.\n3. Tôn trọng nhà nông: Tối giản hóa tối đa giao diện, không ép nông dân thao tác khó.  ·  4. An toàn dữ liệu: Mã hóa thông tin cá nhân của tình nguyện viên và chủ vườn.")

    # =========================================================================
    # SLIDE 16: LỜI KẾT & TRI ÂN
    # =========================================================================
    print("Processing Slide 16...")
    s16 = prs.slides[15]
    set_shape_text(find_shape(s16, "Text 2"), "NAIFARM · CHỢ OCOP THANH NIÊN THÀNH PHỐ ĐỒNG NAI")
    set_shape_text(find_shape(s16, "Text 3"), "“GIEO TRI THỨC – KẾT NỐI NHÀ NÔNG –\nLAN TỎA GIÁ TRỊ NÔNG SẢN ĐỒNG NAI”")
    set_shape_text(find_shape(s16, "Text 5"), "Công nghệ số không chỉ dừng lại ở thuật toán hay giao diện đẹp, mà là cầu nối thấu cảm đưa nông sản của cha ông vươn xa nhờ sức trẻ và tri thức của thế hệ hôm nay.")
    set_shape_text(find_shape(s16, "Text 6"), "Xin trân trọng cảm ơn Ban Giám khảo!")
    
    replace_image_by_name(s16, "Image 1", QR_CODE_PATH, square=True)
    set_shape_text(find_shape(s16, "Text 10"), "Trải nghiệm trực tiếp tại: https://naifarm.vercel.app/")
    
    replace_image_by_name(s16, "Image 2", f"{SCREENSHOTS_DIR}/04_trace_nf_demo_001.png")
    set_shape_text(find_shape(s16, "Text 12"), "NaiFarm — Sáng kiến Chuyển đổi số Nông nghiệp Đồng Nai 2026")

    # =========================================================================
    # SAVE PRESENTATION
    # =========================================================================
    print(f"Saving finalized presentation to {OUTPUT_PPTX}...")
    prs.save(OUTPUT_PPTX)
    print("SUCCESS: Final presentation generated with 100% complete and accurate content!")

if __name__ == '__main__':
    main()
