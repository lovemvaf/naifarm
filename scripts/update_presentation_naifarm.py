#!/usr/bin/env python3
"""
update_presentation_naifarm.py
Transform DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx
into NAIFARM — CHỢ OCOP THANH NIÊN · THÀNH PHỐ ĐỒNG NAI
incorporating live screenshots from https://naifarm.vercel.app/
"""

import os
import sys
import pptx
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

PPTX_PATH = '/home/ngoctan/Desktop/DONG_NAI_MEMORY_THUYET_TRINH_VUON_UOM_Y_TUONG_SO_2026_FINAL.pptx'
SCREENSHOTS_DIR = '/home/ngoctan/Downloads/naifarm/docs/screenshots/desktop'

def replace_image(slide, shape_name, new_img_path):
    if not os.path.exists(new_img_path):
        print(f"Warning: image path does not exist: {new_img_path}")
        return False
    for shape in slide.shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE and shape.name == shape_name:
            blip = shape._element.xpath('.//a:blip/@r:embed')[0]
            img_part = slide.part.related_part(blip)
            with open(new_img_path, 'rb') as f:
                img_part._blob = f.read()
            print(f"Replaced image in {shape_name} with {new_img_path}")
            return True
    print(f"Shape {shape_name} not found in slide")
    return False

def update_para(p, new_text):
    if not p.runs:
        p.text = new_text
        return
    p.runs[0].text = new_text
    for r in p.runs[1:]:
        r.text = ""

def replace_text_in_slide(slide, replacements):
    """
    replacements is a list of (search_substr, new_full_text)
    or lambda checker.
    """
    for shape in slide.shapes:
        if shape.has_text_frame:
            for p in shape.text_frame.paragraphs:
                for search, repl in replacements:
                    if search in p.text:
                        update_para(p, repl)
                        break

def main():
    print(f"Loading presentation from {PPTX_PATH}...")
    prs = Presentation(PPTX_PATH)
    total_slides = len(prs.slides)
    print(f"Total slides: {total_slides}")

    # ==================== SLIDE 1 ====================
    print("Updating Slide 1...")
    s1 = prs.slides[0]
    replace_text_in_slide(s1, [
        ("HÀNH TRÌNH “VƯỜN ƯƠM Ý TƯỞNG SỐ”", "HÀNH TRÌNH “VƯỜN ƯƠM Ý TƯỞNG SỐ” TP. ĐỒNG NAI 2026 · HACKATHON 2026"),
        ("DONG NAI MEMORY", "NAIFARM"),
        ("CHUYỆN ĐẤT VÀ NGƯỜI ĐỒNG NAI", "CHỢ OCOP THANH NIÊN · THÀNH PHỐ ĐỒNG NAI"),
        ("Không gian khám phá văn hóa", "Nền tảng thương mại điện tử OCOP kết nối nhà nông U50+,"),
        ("kết hợp tư liệu số", "thanh niên tình nguyện số hóa và điều phối logistics nông sản."),
        ("Từ những dấu xưa", "“Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị”"),
        ("NHÓM TÁC GIẢ THỰC HIỆN DỰ ÁN", "NHÓM TÁC GIẢ THỰC HIỆN DỰ ÁN"),
        ("Trương Thị Thu Hiền", "Nhóm 8 (Group 8)  ·  Hackathon Thành phố Đồng Nai 2026"),
        ("Sông Đồng Nai qua Biên Hòa", "Chợ OCOP Thanh niên Đồng Nai — Giao diện live tại naifarm.vercel.app"),
        ("Văn miếu Trấn Biên", "Chi tiết sản phẩm & Mô hình 3D Bưởi Tân Triều tương tác")
    ])
    QR_PATH = '/home/ngoctan/Desktop/qrcode_naifarm.vercel.app.png'
    replace_image(s1, "Image 1", QR_PATH)
    replace_image(s1, "Image 2", QR_PATH)
    for shape in s1.shapes:
        if shape.name in ['Image 1', 'Image 2']:
            orig_w = shape.width
            orig_h = shape.height
            square_dim = orig_h
            shape.width = square_dim
            shape.left = shape.left + (orig_w - square_dim) // 2
        elif shape.name == 'Text 17':
            for p in shape.text_frame.paragraphs:
                update_para(p, 'Quét mã QR mở website live: https://naifarm.vercel.app/')
        elif shape.name == 'Text 19':
            for p in shape.text_frame.paragraphs:
                update_para(p, 'Quét mã QR trải nghiệm trực tiếp nguyên mẫu NaiFarm trên điện thoại')

    # ==================== SLIDE 2 ====================
    print("Updating Slide 2...")
    s2 = prs.slides[1]
    replace_text_in_slide(s2, [
        ("BỐI CẢNH VĂN HÓA", "BỐI CẢNH NÔNG NGHIỆP & OCOP ĐỒNG NAI"),
        ("Một vùng đất, nhiều miền ký ức", "Vựa nông sản trù phú đứng trước làn sóng chuyển đổi số"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("1. Từ khảo cổ đến dinh Trấn Biên", "1. Đặc sản OCOP trứ danh vùng đất Đồng Nai"),
        ("Đàn đá Bình Đa, Mộ cự thạch", "Bưởi Tân Triều, Chôm chôm Long Khánh, Tiêu Xuân Lộc, Sầu riêng Cẩm Mỹ & Hạt điều."),
        ("Văn miếu Trấn Biên · CC", "Vùng cây ăn trái Đồng Nai · Nguồn OCOP Đồng Nai"),
        ("2. Nghề truyền thống", "2. Thực trạng nhà vườn: Người lớn tuổi canh tác chủ lực"),
        ("Làng gốm Biên Hòa", "Hơn 65% chủ vườn là nông dân U50+, khó tiếp cận các sàn TMĐT phức tạp hiện nay."),
        ("Đồ gốm Biên Hòa", "Nhà vườn canh tác truyền thống"),
        ("3. Dấu ấn văn hóa", "3. Tiềm năng liên kết thanh niên tình nguyện"),
        ("Lễ Sayangva", "Lực lượng Đoàn viên thanh niên dồi dào kỹ năng số, khao khát cống hiến cho quê hương."),
        ("Minh họa sinh cảnh", "Sức trẻ thanh niên tình nguyện số"),
        ("4. Kết nối di sản", "4. Kinh tế số kết hợp du lịch nông nghiệp trải nghiệm"),
        ("Nhà lao Tân Hiệp", "Bản đồ sinh thái nông nghiệp kết hợp đặt lịch tham quan và hộ chiếu số cho từng vườn."),
        ("Bù Gia Mập", "Du lịch sinh thái vườn Đồng Nai"),
        ("VĂN HÓA  •  LỊCH SỬ", "NÔNG SẢN ĐỒNG NAI  •  NHÀ NÔNG U50+  •  THANH NIÊN TÌNH NGUYỆN  •  LOGISTICS LẠNH  —  Hệ sinh thái số hóa toàn diện")
    ])

    # ==================== SLIDE 3 ====================
    print("Updating Slide 3...")
    s3 = prs.slides[2]
    replace_text_in_slide(s3, [
        ("BÀI TOÁN THỰC TIỄN TẠI ĐỊA PHƯƠNG", "BÀI TOÁN THỰC TIỄN TẠI ĐỊA PHƯƠNG & CƠ SỞ ĐOÀN"),
        ("Ba rào cản khi tìm hiểu", "Ba rào cản lớn khi đưa nông sản OCOP lên không gian số"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("Tư liệu phân tán", "Minh bạch nguồn gốc"),
        ("Sách địa chí, hồ sơ di tích", "Nông sản OCOP dễ bị nhái nhãn mác; người tiêu dùng thiếu công cụ tra cứu nhật ký và xuất xứ lô hàng thực tế."),
        ("Nguồn khó gom & dễ nhầm tên", "Thiếu định danh lô hàng số"),
        ("Khó khai thác nhanh", "Rào cản công nghệ U50+"),
        ("Cán bộ Đoàn mất nhiều công", "Giao diện TMĐT hiện tại quá nhiều thao tác phức tạp, chữ nhỏ, thủ tục đăng bán rườm rà với nhà nông lớn tuổi."),
        ("Tốn thời gian soạn học liệu", "Nông dân khó tự vận hành"),
        ("Sinh hoạt còn một chiều", "Thiếu cơ chế gắn kết Đoàn"),
        ("Đoàn viên chủ yếu nghe đọc", "Hoạt động tình nguyện chưa gắn với quy trình kiểm chứng thực tế tại từng nhà vườn; thiếu cơ chế xác thực giờ công."),
        ("Thiếu tương tác & phản hồi", "Chưa có công cụ ghi nhận 2 lớp"),
        ("Làm sao để lịch sử địa phương", "“Làm sao để bà con nông dân U50+ bán nông sản số dễ dàng với sự trợ lực minh bạch của thanh niên?”")
    ])

    # ==================== SLIDE 4 ====================
    print("Updating Slide 4...")
    s4 = prs.slides[3]
    replace_text_in_slide(s4, [
        ("ĐỐI TƯỢNG THỤ HƯỞNG RÕ RÀNG", "ĐỐI TƯỢNG THỤ HƯỞNG RÕ RÀNG"),
        ("Ba nhóm người dùng trên cùng một nền web", "Bốn nhóm người dùng liên kết trên cùng một nền tảng đa không gian"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("KHÁM PHÁ", "NGƯỜI TIÊU DÙNG (W01)"),
        ("Đoàn viên · Học sinh", "Khách hàng · Giới trẻ"),
        ("• Đọc chuyện đất & người dẫn nguồn", "• Mua nông sản OCOP minh bạch giá"),
        ("• Quét QR làm MemoryQuest ẩn danh", "• Quét QR xem hộ chiếu & mùa vụ"),
        ("• Quan sát sa bàn 3D / sơ đồ 2D", "• Đặt tour trải nghiệm & xem OCOP Live"),
        ("TỔ CHỨC", "NHÀ NÔNG U50+ (W02)"),
        ("Cán bộ Đoàn · Giáo viên", "Chủ vườn · Hộ sản xuất"),
        ("• Mở phiên & tạo QR trong vài giây", "• Giao diện chữ lớn, nút bấm 56px"),
        ("• Theo dõi câu sai nhiều để thảo luận", "• Đăng bán 3 bước bằng giọng nói AI"),
        ("• Xuất biên bản ẩn danh sạch PII", "• Xác nhận nhận đơn & giờ tình nguyện"),
        ("GÌN GIỮ", "THANH NIÊN TÌNH NGUYỆN (W03)"),
        ("Người dân · Cộng đồng", "Đoàn viên · Sinh viên"),
        ("• Tra cứu lễ hội & địa chỉ đỏ miễn phí", "• Nhận nhiệm vụ hỗ trợ số hóa vườn"),
        ("• Đóng góp tư liệu qua MemoryLab", "• Tích lũy OCOP Youth Impact Pass"),
        ("• Báo sai sử liệu hoặc bản quyền ảnh", "• Học mở nông nghiệp & tương tác 3D")
    ])
    replace_image(s4, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")
    replace_image(s4, "Image 2", f"{SCREENSHOTS_DIR}/07_farmer_w02.png")
    replace_image(s4, "Image 3", f"{SCREENSHOTS_DIR}/09_volunteer_w03.png")

    # ==================== SLIDE 5 ====================
    print("Updating Slide 5...")
    s5 = prs.slides[4]
    replace_text_in_slide(s5, [
        ("KIẾN TRÚC GIÁ TRỊ VẬN HÀNH", "KIẾN TRÚC HỆ SINH THÁI 6 KHÔNG GIAN (W01–W06)"),
        ("Nối tư liệu có nguồn thẳng tới buổi sinh hoạt chi đoàn", "Vận hành liên thông từ chợ người mua đến nhà vườn và cơ sở Đoàn"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("NGUYÊN MẪU WEB CHẠY CỤC BỘ", "NGUYÊN MẪU NAIFARM ĐANG CHẠY LIVE"),
        ("Nguyên mẫu Dong Nai Memory", "Nguyên mẫu NaiFarm — Đang triển khai tại naifarm.vercel.app"),
        ("QUẢN TRỊ NGUỒN", "1. CHỢ CÔNG KHAI (W01)"),
        ("1. Tư liệu có nguồn", "Chợ OCOP Editorial 60/40, giỏ hàng, đặt hàng COD Demo & hộ chiếu SVG."),
        ("TRẢI NGHIỆM CÔNG KHAI", "2. NHÀ NÔNG U50+ (W02)"),
        ("2. Không gian khám phá", "Đăng bán bằng giọng nói AI, nút 56px, nhận đơn và xác nhận giờ công."),
        ("HỌC QUA TRẢI NGHIỆM", "3. THANH NIÊN SỐ (W03)"),
        ("3. Hành trình MemoryQuest", "Nhiệm vụ số hóa vườn, Youth Impact Pass tách riêng Giờ duyệt / Chờ duyệt."),
        ("KẾT NỐI CỘNG ĐỒNG", "4. ĐIỀU PHỐI VIÊN & HTX (W04–W05)"),
        ("4. Sân chơi sinh hoạt", "Chuyến xe mát, đối chiếu hồ sơ OCOP, khóa duyệt 2 lớp và phân quyền W06.")
    ])
    replace_image(s5, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")

    # ==================== SLIDE 6 ====================
    print("Updating Slide 6...")
    s6 = prs.slides[5]
    replace_text_in_slide(s6, [
        ("CHIỀU SÂU NỘI DUNG VĂN HÓA", "CHỢ NÔNG SẢN EDITORIAL & HỘ CHIẾU QR MINH BẠCH"),
        ("Đồng Nai xưa và nay & Văn hóa", "Thiết kế chuẩn báo chí nông nghiệp & Tách bạch dữ liệu chứng nhận"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("CHỤP TRỰC TIẾP", "CHỢ OCOP TRỰC TUYẾN"),
        ("Giao diện thực tế /dong-nai-xua-va-nay", "Giao diện /marketplace: Lọc theo mùa vụ, vùng trồng & danh mục OCOP Đồng Nai"),
        ("08 HỒ SƠ CỘNG ĐỒNG", "HỘ CHIẾU NÔNG SẢN SỐ"),
        ("Giao diện /van-hoa", "Giao diện /trace/NF-DEMO-001: Hộ chiếu QR SVG, mã lô thực tế & nhật ký mùa vụ"),
        ("NÂNG CAO ĐỘ TIN CẬY", "CHỢ EDITORIAL CHUẨN DESIGN SYSTEM"),
        ("Đặt tư liệu địa phương vào trục so sánh", "Bảng màu lá rừng #245B3D, gạo ấm #F5F3E9, font Be Vietnam Pro & Lora chuẩn mực."),
        ("TIẾP CẬN ĐA DÂN TỘC", "HỘ CHIẾU NÔNG SẢN MINH BẠCH NHÃN"),
        ("Tôn trọng bản sắc qua trang phục", "Tách bạch rõ giữa 'Nhà vườn tự khai' và 'Hồ sơ đã đối chiếu' — không mạo danh OCOP.")
    ])
    replace_image(s6, "Image 1", f"{SCREENSHOTS_DIR}/02_marketplace.png")
    replace_image(s6, "Image 2", f"{SCREENSHOTS_DIR}/04_trace_nf_demo_001.png")

    # ==================== SLIDE 7 ====================
    print("Updating Slide 7...")
    s7 = prs.slides[6]
    replace_text_in_slide(s7, [
        ("CHUẨN HÓA ĐỊA DANH THEO DÒNG LỊCH SỬ", "BẢN ĐỒ VÙNG TRỒNG & DU LỊCH TRẢI NGHIỆM ĐỒNG NAI"),
        ("Bản đồ & Dòng thời gian", "Khám phá các vùng sinh thái đặc trưng & Đặt lịch trực tiếp tại vườn"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("11 ĐIỂM CÔNG BỐ", "BẢN ĐỒ VÙNG TRỒNG ĐỒNG NAI"),
        ("Bản đồ 11 địa điểm công bố", "Bản đồ sinh thái Đồng Nai trên /explore: Tân Triều, Long Khánh, Xuân Lộc, Cẩm Mỹ"),
        ("Tên địa danh lịch sử được giữ nguyên", "Tọa độ vùng sinh thái trực quan, tích hợp bộ lọc danh mục và lịch nông vụ."),
        ("TRƯỚC 01/07/2025", "VÙNG BƯỞI TÂN TRIỀU & CÙ LAO"),
        ("Tỉnh Biên Hòa / Long Khánh cũ", "Chỉ dẫn địa lý Bưởi đường lá cam, Bưởi da xanh ven lưu vực sông Đồng Nai."),
        ("TỪ 01/07/2025", "THỦ PHỦ TRÁI CÂY LONG KHÁNH"),
        ("Địa danh theo Nghị quyết UBTVQH", "Chôm chôm Java, Tiêu sọ đỏ, Sầu riêng kết hợp tour sinh thái trải nghiệm tại vườn.")
    ])
    replace_image(s7, "Image 1", f"{SCREENSHOTS_DIR}/05_explore_map.png")

    # ==================== SLIDE 8 ====================
    print("Updating Slide 8...")
    s8 = prs.slides[7]
    replace_text_in_slide(s8, [
        ("TRẢI NGHIỆM HỒ SƠ ĐỊA ĐIỂM", "TRẢI NGHIỆM ĐA GIÁC QUAN: 3D WEBGL & OCOP LIVE"),
        ("Một địa chỉ đỏ thực sự có thể khám phá", "Quan sát giải phẫu nông sản 3D & Phòng phát trực tiếp tại vườn"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("HỒ SƠ 3 LỚP", "MÔ HÌNH 3D BƯỞI TÂN TRIỀU"),
        ("Hồ sơ Di tích Nhà lao Tân Hiệp", "Mô hình 3D Three.js: 4 điểm tương tác (Vỏ, Tép, Cùi, Hạt) kèm fallback 2D mượt mà"),
        ("SA BÀN 3D MINH HỌA", "PHÒNG OCOP LIVE 3 GÓC MÁY"),
        ("Sa bàn WebGL Three.js minh họa", "Phòng Live Replay Demo (/live): 3 góc quay tại vườn & ghim giỏ hàng mua tức thì"),
        ("Đối chiếu chéo nhiều nguồn", "TẢI ĐỘNG NHẸ NHÀNG (LAZY LOADING)"),
        ("Gắn mã nguồn sử liệu vào từng nhận định", "Tải theo nhu cầu, dpr tối ưu 1.0-1.5, không giật lag trên thiết bị di động bình dân.")
    ])
    replace_image(s8, "Image 1", f"{SCREENSHOTS_DIR}/03_product_buoi_3d.png")
    replace_image(s8, "Image 2", f"{SCREENSHOTS_DIR}/06_live_room.png")

    # ==================== SLIDE 9 ====================
    print("Updating Slide 9...")
    s9 = prs.slides[8]
    replace_text_in_slide(s9, [
        ("TRA CỨU DỰA TRÊN KHO ĐOẠN SỬ LIỆU", "TRỢ LÝ THÔNG MINH NAIAI ĐA KHÔNG GIAN NGỮ CẢNH"),
        ("Trợ lý Tìm hiểu Lịch sử có dẫn nguồn", "Tư vấn mua sắm, kỹ thuật canh tác và hỗ trợ tình nguyện theo thời gian thực"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("TRUY XUẤT ĐOẠN DUYỆT", "TRỢ LÝ NGỮ CẢNH THÔNG MINH"),
        ("Truy vấn thực tế trên /assistant", "Cửa sổ NaiAI nổi: Tự động thích ứng câu hỏi theo từng vai trò W01–W04"),
        ("1. Bám sát đoạn nguồn đã duyệt", "1. Nhận diện ngữ cảnh không gian làm việc"),
        ("Chỉ đọc tài liệu đã qua kiểm chứng", "Tại W01 gợi ý sản phẩm & công thức; tại W02 hướng dẫn canh tác; tại W03 hỗ trợ tình nguyện."),
        ("2. Minh bạch dị bản số liệu", "2. Tự động ẩn thông minh (Non-intrusive)"),
        ("Nếu tư liệu có nhiều mốc khác nhau", "Tự ẩn khi người dùng vào màn hình thanh toán hoặc khi bà con đang bấm mic ghi âm."),
        ("3. Trực quan hóa nguồn dẫn", "3. Gắn thẻ điều hướng trực tiếp"),
        ("Mở rộng thẻ tham khảo để đọc thêm", "Mọi câu trả lời gợi ý đều có nút mở nhanh sản phẩm, hồ sơ nhà vườn hoặc bài học liên quan.")
    ])
    replace_image(s9, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")

    # ==================== SLIDE 10 ====================
    print("Updating Slide 10...")
    s10 = prs.slides[9]
    replace_text_in_slide(s10, [
        ("TRẢI NGHIỆM HỌC TẬP CHỦ ĐỘNG", "HỌC MỞ NÔNG NGHIỆP & ĐĂNG BÁN BẰNG GIỌNG NÓI CHO U50+"),
        ("MemoryQuest: Học lịch sử bằng hành trình", "Đơn giản hóa công nghệ cho người già & Gieo tri thức OCOP cho người trẻ"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("1. Khởi động", "1. Chụp ảnh vườn"),
        ("05 câu Pre-test", "Tải 1 ảnh duy nhất"),
        ("2. Khám phá", "2. Giọng nói mô phỏng"),
        ("04 chặng chứng cứ", "Bấm mic nói tên & giá"),
        ("3. Cảm nhận", "3. AI sinh bản nháp"),
        ("Viết thu hoạch ngắn", "Tự điền form bán hàng"),
        ("4. Đánh giá", "4. Công bố tức thì"),
        ("05 câu Post-test", "Xuất hiện ngay ở chợ"),
        ("5. Bảng vinh danh", "5. Nhận đơn dễ dàng"),
        ("Ghi nhận số hóa", "Nút to 56px nhận đơn"),
        ("CHỤP TRỰC TIẾP TỪ NGUYÊN MẪU", "QUY TRÌNH ĐĂNG BÁN 3 BƯỚC (/farmer/publish)"),
        ("Giao diện chặng chứng cứ", "Wizard 3 bước cho nông dân: Chụp ảnh -> Bấm mic nói -> AI tạo bản nháp -> Đăng bán."),
        ("THẺ BẢO TỒN KÝ ỨC", "THẺ OCOP YOUTH IMPACT PASS (/volunteer)"),
        ("Mẫu thẻ xuất tự động", "Thẻ giờ công thanh niên: Tách bạch rõ ràng giữa Giờ đã duyệt và Giờ chờ duyệt.")
    ])
    replace_image(s10, "Image 1", f"{SCREENSHOTS_DIR}/08_farmer_publish.png")
    replace_image(s10, "Image 2", f"{SCREENSHOTS_DIR}/09_volunteer_w03.png")

    # ==================== SLIDE 11 ====================
    print("Updating Slide 11...")
    s11 = prs.slides[10]
    replace_text_in_slide(s11, [
        ("MÔ HÌNH TỔ CHỨC ĐỀ XUẤT CHO CƠ SỞ ĐOÀN", "CƠ CHẾ KIỂM CHỨNG GIỜ CÔNG 2 LỚP CHO CƠ SỞ ĐOÀN"),
        ("Kịch bản một buổi sinh hoạt chi đoàn", "Quy trình khép kín chống gian lận giờ tình nguyện & hỗ trợ nhà nông thực chất"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("BƯỚC 1 · 2–3 PHÚT", "BƯỚC 1 · PHÁT ĐỘNG NHIỆM VỤ"),
        ("Chọn mẫu & Tạo mã QR", "Nhà vườn gửi yêu cầu hỗ trợ"),
        ("Bí thư chọn chuyên đề chuẩn", "Nhà vườn U50+ gửi yêu cầu (chụp ảnh, gắn tem QR, dán bao bì); Đoàn trường phân công thanh niên."),
        ("BƯỚC 2 · 3–4 PHÚT", "BƯỚC 2 · THỰC ĐỊA HỖ TRỢ"),
        ("Quét QR & Làm Pre-test", "Thanh niên hỗ trợ số hóa tại vườn"),
        ("Đoàn viên quét mã làm 05 câu", "Đội thanh niên tình nguyện đến thực địa hỗ trợ thu hoạch, đóng gói và tải minh chứng ảnh lên W03."),
        ("BƯỚC 3 · 12–15 PHÚT", "BƯỚC 3 · NHÀ VƯỜN XÁC NHẬN (LỚP 1)"),
        ("Giải mã 4 chặng chứng cứ", "Chủ vườn xác nhận bàn giao"),
        ("Đọc hồ sơ có nguồn, đối chiếu", "Chủ vườn kiểm tra kết quả và bấm 'Xác nhận bàn giao' ngay trên giao diện chữ lớn tại /farmer."),
        ("BƯỚC 4 · 5–6 PHÚT", "BƯỚC 4 · CÁN BỘ ĐOÀN DUYỆT (LỚP 2)"),
        ("Tổng kết & Đánh giá mức tiến bộ", "Mở khóa duyệt giờ chính thức"),
        ("Hệ thống hiển thị ngay câu sai", "Nút duyệt trên W04 chỉ mở khóa khi chủ vườn đã xác nhận; giờ chính thức cộng vào Youth Pass."),
        ("“Không cần cài app, không lộ danh tính cá nhân, cán bộ Đoàn có ngay bức tranh hiểu biết của chi đoàn.”",
         "“Quy trình khóa 2 lớp đảm bảo giờ công tình nguyện thanh niên gắn liền với giá trị thực tế tại từng nhà vườn.”")
    ])

    # ==================== SLIDE 12 ====================
    print("Updating Slide 12...")
    s12 = prs.slides[11]
    replace_text_in_slide(s12, [
        ("CÔNG CỤ ĐIỀU HÀNH PHIÊN HỌC", "TRUNG TÂM TRÌNH DIỄN & BẢNG ĐIỀU PHỐI ĐA VAI"),
        ("Bảng điều khiển Cán bộ Đoàn & Demo thực tế", "Demo Hub 8 luồng nghiệp vụ liên hoàn & Giám sát vận hành thời gian thực"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("DỮ LIỆU TRÌNH DIỄN MẪU", "HUB ĐIỀU HƯỚNG TRÌNH DIỄN BAN GIÁM KHẢO"),
        ("Màn hình /organizer phiên DNM-2026", "Màn hình /demo: Hub điều hướng 8 Flows A–H, đối chiếu 12 màn Stitch & nút Reset Demo"),
        ("Tất cả trên một màn hình", "ĐIỀU PHỐI LIÊN HOÀN 6 KHÔNG GIAN"),
        ("• Nhân bản mẫu chuyên đề không ghi đè gốc", "• Chuyển đổi tức thì giữa 6 không gian W01–W06 mà không cần đăng nhập."),
        ("• Chiếu QR & sao chép liên kết", "• Đặt hàng COD Demo -> Nhà nông nhận đơn -> Khách theo dõi chuỗi lạnh."),
        ("• Cô lập dữ liệu chặt theo từng chi đoàn", "• Khóa duyệt giờ 2 lớp: Ngăn chặn tự ý duyệt giờ khi chưa bàn giao."),
        ("Minh bạch số liệu hiển thị", "Minh bạch số liệu nguyên mẫu"),
        ("n=12 học viên và điểm 47,5%", "Mọi đơn hàng, giờ công và dữ liệu truy xuất là dữ liệu mô phỏng minh bạch, không giả mạo pháp lý OCOP."),
        ("XEM DEMO THỰC TẾ", "▶  TRẢI NGHIỆM TRỰC TIẾP"),
        ("Mở http://127.0.0.1:5173/organizer", "Mở https://naifarm.vercel.app/demo"),
        ("VIDEO DEMO DỰ PHÒNG", "🌐  SỐ HÓA TOÀN DIỆN"),
        ("Mở VIDEO_DEMO_90S.mp4 offline", "Đồng bộ tức thì trên cùng trình duyệt")
    ])
    replace_image(s12, "Image 1", f"{SCREENSHOTS_DIR}/14_demo_hub.png")

    # ==================== SLIDE 13 ====================
    print("Updating Slide 13...")
    s13 = prs.slides[12]
    replace_text_in_slide(s13, [
        ("NỀN TẢNG KỸ THUẬT & QUẢN TRỊ HỌC THUẬT", "NỀN TẢNG KỸ THUẬT HIỆN ĐẠI & TÍNH TRUNG THỰC"),
        ("Kiến trúc ba lớp & Quy trình kiểm chứng", "Kiến trúc Next.js App Router, React 19 & Trạng thái thống nhất trên trình duyệt"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("KIẾN TRÚC 03 LỚP THỐNG NHẤT", "CÔNG NGHỆ HIỆN ĐẠI & GIAO DIỆN CHUẨN MỰC"),
        ("Lớp 1 · Giao diện web đa màn hình", "Lớp 1 · Giao diện App Router đa màn hình"),
        ("React 19, TypeScript, Vite, Tailwind CSS", "Next.js 16.4, React 19, TypeScript 5, Tailwind CSS v4, Lucide SVG & Motion"),
        ("Lớp 2 · Dịch vụ nghiệp vụ & An toàn", "Lớp 2 · Mô hình 3D & Trực quan số liệu"),
        ("Phân tách 08 nhóm quyền · Cô lập chi đoàn", "Three.js + React Three Fiber 3D Bưởi Tân Triều, Recharts KPI & QRCode SVG"),
        ("Lớp 3 · Kho dữ liệu 30 bảng & Trích dẫn", "Lớp 3 · Quản lý trạng thái dùng chung"),
        ("Cập nhật sổ cái 1 lần -> đồng bộ", "DemoStoreContext + localStorage: Đồng bộ tức thì 6 không gian W01–W06"),
        ("QUY TRÌNH KIỂM CHỨNG NGUỒN TÁCH VAI (SOD)", "TÍNH MINH BẠCH & NGUYÊN TẮC THIẾT KẾ"),
        ("1", "1"),
        ("Tiếp nhận bản thảo (DRAFT)", "Thân thiện U50+ (W02)"),
        ("Đề xuất mới từ MemoryLab", "Chữ >=18px, nút bấm >=56px, hỗ trợ giọng nói mô phỏng, loại bỏ thao tác rườm rà."),
        ("2", "2"),
        ("Khóa nguồn & Giấy phép (Ledger)", "Minh bạch OCOP"),
        ("Hệ thống từ chối nguồn chung chung", "Tách bạch rõ rệt giữa dữ liệu tự khai của nhà vườn và hồ sơ đã qua đối chiếu chứng từ."),
        ("3", "3"),
        ("Thẩm định tách vai (SoD)", "Kiểm chứng 2 lớp"),
        ("Tài khoản phê duyệt phải khác người soạn", "Cơ chế khóa duyệt giờ tình nguyện: Bắt buộc chủ vườn xác nhận bàn giao trước."),
        ("4", "4"),
        ("Công bố & Đính chính tức thì", "Hiệu năng mượt mà"),
        ("Mọi chỉnh sửa hồ sơ tự quay lại bước thẩm định", "Zero layout shift, 0 overflow ngang, kiểm thử tự động đạt chuẩn trên 6 kích cỡ màn hình.")
    ])

    # ==================== SLIDE 14 ====================
    print("Updating Slide 14...")
    s14 = prs.slides[13]
    replace_text_in_slide(s14, [
        ("GIÁ TRỊ KHÁC BIỆT THỰC CHẤT", "BỐN TRỤ CỘT GIÁ TRỊ KHÁC BIỆT THỰC CHẤT"),
        ("Điểm mới nằm ở quy trình, không ở tên công nghệ", "Khác biệt từ tư duy phụng sự nông dân U50+ và gắn kết thanh niên"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("NGUỒN RÕ", "VỊ NHÂN SINH CHO U50+"),
        ("Từ chối nguồn chung chung; minh bạch bản quyền ảnh.", "Giao diện đơn giản nhất cho người lớn tuổi; đăng bán bằng giọng nói AI."),
        ("HỌC QUA TRẢI NGHIỆM", "MINH BẠCH NGUỒN GỐC"),
        ("Giải mã chứng cứ thay cho nghe chép thụ động.", "Hộ chiếu QR SVG, tách bạch dữ liệu tự khai và đối chiếu chứng từ OCOP."),
        ("CÔNG CỤ CHO ĐOÀN", "SỨ MỆNH THANH NIÊN"),
        ("Nối thẳng bài đọc tới phiên sinh hoạt chi đoàn.", "Cống hiến có đo lường thực chất với cơ chế khóa duyệt giờ 2 lớp.")
    ])
    # Update table on slide 14
    for shape in s14.shapes:
        if shape.has_table:
            table = shape.table
            print(f"Updating Table on Slide 14 ({len(table.rows)}x{len(table.columns)})...")
            table.cell(0, 1).text = "Sàn TMĐT thông thường"
            table.cell(0, 2).text = "NaiFarm (Chợ OCOP Thanh niên)"
            
            table.cell(1, 0).text = "Tiếp cận Nhà nông U50+"
            table.cell(1, 1).text = "Giao diện phức tạp, nhiều bước, chữ nhỏ, hướng tới người trẻ rành công nghệ."
            table.cell(1, 2).text = "Thiết kế riêng cho U50+: nút 56px, chữ 18px, đăng bán 3 bước bằng giọng nói AI."
            
            table.cell(2, 0).text = "Minh bạch OCOP"
            table.cell(2, 1).text = "Tem nhãn dễ làm giả, thiếu nhật ký mùa vụ số và không truy xuất được lô hàng."
            table.cell(2, 2).text = "Hộ chiếu QR SVG thật, tách bạch rõ ràng giữa 'Tự khai' và 'Đã đối chiếu chứng từ'."
            
            table.cell(3, 0).text = "Vai trò Thanh niên"
            table.cell(3, 1).text = "Chỉ kêu gọi giải cứu nông sản thời vụ, thiếu công cụ ghi nhận đóng góp số."
            table.cell(3, 2).text = "Gắn kết nhiệm vụ số hóa thực tế, tích lũy Youth Impact Pass với khóa duyệt 2 lớp."
            
            table.cell(4, 0).text = "Trải nghiệm Khách mua"
            table.cell(4, 1).text = "Danh sách ảnh phẳng tĩnh, thiếu câu chuyện vùng miền và kết nối nhà vườn."
            table.cell(4, 2).text = "Phong cách Editorial 60/40, tương tác 3D Bưởi Tân Triều, OCOP Live & tour sinh thái."

    # ==================== SLIDE 15 ====================
    print("Updating Slide 15...")
    s15 = prs.slides[14]
    replace_text_in_slide(s15, [
        ("TÍNH KHẢ THI & NGUỒN LỰC THỰC HIỆN", "TÍNH KHẢ THI & LỘ TRÌNH TRIỂN KHAI 06 THÁNG"),
        ("Hiện trạng nguyên mẫu, lộ trình 06 tháng & dự toán", "Hiện trạng nguyên mẫu, lộ trình đưa vào đời sống & kế hoạch kinh phí"),
        ("DONG NAI MEMORY", "NAIFARM · Chợ OCOP Thanh niên · Vườn ươm ý tưởng số 2026"),
        ("THÁNG 1 · ĐÃ HOÀN THÀNH LÕI", "GIAI ĐOẠN 1 · ĐÃ HOÀN THÀNH"),
        ("Nguyên mẫu Web 0đ", "Nguyên mẫu Frontend 0đ"),
        ("Vận hành cục bộ; đủ quy trình", "Hoàn thiện 21 routes, 12 màn Stitch, chạy live tại naifarm.vercel.app."),
        ("THÁNG 2 · ĐỀ XUẤT", "GIAI ĐOẠN 2 · THÁNG 2–3/2026"),
        ("Rà soát & Tối ưu di động", "Thí điểm thực địa"),
        ("Đối chiếu sử liệu cùng giáo viên", "Thử nghiệm tại 3 nhà vườn (Tân Triều, Long Khánh, Xuân Lộc) & 1 Đoàn trường."),
        ("THÁNG 3–4 · ĐỀ XUẤT", "GIAI ĐOẠN 3 · THÁNG 4–5/2026"),
        ("Thí điểm 1–2 Chi đoàn", "Tích hợp Backend & Logistics"),
        ("Dùng màn chiếu + thẻ QR giấy", "Kết nối API cơ sở dữ liệu, cổng thanh toán ViettelPay/VNPAY và xe mát."),
        ("THÁNG 5–6 · ĐỀ XUẤT", "GIAI ĐOẠN 4 · THÁNG 6/2026"),
        ("Hoàn thiện & Chuyển giao", "Chuyển giao & Nhân rộng"),
        ("Bổ sung ảnh thực địa có phép", "Bàn giao Tỉnh Đoàn, Liên minh HTX Đồng Nai và Sở Nông nghiệp & PTNT."),
        ("Dự toán kinh phí tham khảo theo 3 quy mô", "Dự toán kinh phí tham khảo theo 3 giai đoạn triển khai:"),
        ("Bốn nguyên tắc vận hành bắt buộc", "Bốn nguyên tắc vận hành bắt buộc khi triển khai thực tế"),
        ("1. Sửa sự kiện phải quay lại duyệt tách vai", "1. Khóa duyệt 2 lớp bắt buộc: Giờ tình nguyện chỉ tính khi nhà vườn đã bấm xác nhận."),
        ("2. Ảnh/lời kể chỉ công khai khi có phép", "2. Minh bạch xuất xứ: Không dán nhãn OCOP cho sản phẩm chưa qua đối chiếu chứng từ."),
        ("3. Minh họa 3D giữ nhãn phân biệt ảnh thật", "3. Tôn trọng nhà nông: Đơn giản hóa tối đa giao diện, không bắt nông dân học thao tác khó."),
        ("4. Không biến điểm số thành bảng xếp hạng tên cá nhân", "4. Bảo mật dữ liệu: Mã hóa thông tin cá nhân của tình nguyện viên và chủ vườn.")
    ])
    # Update table on slide 15
    for shape in s15.shapes:
        if shape.has_table:
            table = shape.table
            print(f"Updating Table on Slide 15 ({len(table.rows)}x{len(table.columns)})...")
            table.cell(0, 0).text = "Mức triển khai"
            table.cell(0, 1).text = "Phạm vi áp dụng"
            table.cell(0, 2).text = "Tổng dự toán tham khảo"
            table.cell(0, 3).text = "Trạng thái xác nhận"
            
            table.cell(1, 0).text = "Mức A · Nguyên mẫu Hackathon"
            table.cell(1, 1).text = "Toàn bộ 6 không gian W01–W06 chạy live Vercel"
            table.cell(1, 2).text = "0 đ chi phí phần mềm"
            table.cell(1, 3).text = "ĐÃ HOÀN THÀNH & DEPLOY LIVE"
            
            table.cell(2, 0).text = "Mức B · Thí điểm 3 nhà vườn (2 tháng)"
            table.cell(2, 1).text = "Thẻ QR in ấn, bao bì mẫu, tập huấn bà con U50+"
            table.cell(2, 2).text = "3.500.000 – 6.000.000 đ"
            table.cell(2, 3).text = "ĐỀ XUẤT THÍ ĐIỂM (Quý 1/2026)"
            
            table.cell(3, 0).text = "Mức C · Mở rộng toàn tỉnh (6 tháng)"
            table.cell(3, 1).text = "Cloud server, kết nối chuỗi xe lạnh, đào tạo Đoàn"
            table.cell(3, 2).text = "15.000.000 – 35.000.000 đ"
            table.cell(3, 3).text = "KẾ HOẠCH NHÂN RỘNG (Quý 2/2026)"

    # ==================== SLIDE 16 ====================
    print("Updating Slide 16...")
    s16 = prs.slides[15]
    replace_text_in_slide(s16, [
        ("DONG NAI MEMORY · CHUYỆN ĐẤT VÀ NGƯỜI ĐỒNG NAI", "NAIFARM · CHỢ OCOP THANH NIÊN THÀNH PHỐ ĐỒNG NAI"),
        ("TỪ NHỮNG DẤU XƯA ĐẾN", "“GIEO TRI THỨC – KẾT NỐI NHÀ NÔNG –"),
        ("CÂU CHUYỆN HÔM NAY.", "LAN TỎA GIÁ TRỊ NÔNG SẢN ĐỒNG NAI”"),
        ("Công nghệ không thay thế những chuyến về nguồn", 
         "Công nghệ số không chỉ dừng lại ở thuật toán hay giao diện đẹp, mà là cầu nối thấu cảm đưa nông sản của cha ông vươn xa nhờ sức trẻ và tri thức của thế hệ hôm nay."),
        ("Xin trân trọng cảm ơn Ban Giám khảo.", "Xin trân trọng cảm ơn Ban Giám khảo!"),
        ("Sông Đồng Nai đoạn qua Biên Hòa", "Trải nghiệm trực tiếp tại: https://naifarm.vercel.app/"),
        ("Nguyên mẫu ứng dụng Dong Nai Memory", "NaiFarm — Sáng kiến Chuyển đổi số Nông nghiệp Đồng Nai 2026")
    ])
    replace_image(s16, "Image 1", f"{SCREENSHOTS_DIR}/01_home.png")
    replace_image(s16, "Image 2", f"{SCREENSHOTS_DIR}/04_trace_nf_demo_001.png")

    print(f"Saving updated presentation to {PPTX_PATH}...")
    prs.save(PPTX_PATH)
    print("Successfully transformed presentation to NaiFarm!")

if __name__ == '__main__':
    main()
