insert into public.farms (
  id, slug, name, owner_name, owner_age_label, region, address_label, admin_unit_code,
  lat, lng, area_ha, main_crops, ocop_status, ocop_label, ocop_note, story_headline,
  story_summary, banner_image, owner_portrait, gallery_images, youth_supporters, is_demo
) values
  (
    'farm-ba-minh-tan-trieu', 'vuon-buoi-chu-ba-minh', 'Vườn Bưởi Chú Ba Minh', 'Chú Ba Minh', 'Nông hộ 58 tuổi', 'Phường Tân Triều', 'Cù lao Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9718, 106.7932, 2.2, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Rượu bưởi,Mứt vỏ bưởi}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Nhà vườn tự khai nhật ký canh tác; HTX Tân Triều đối chiếu chứng từ định kỳ (chưa thay thế giấy chứng nhận pháp lý OCOP).', 'Ký ức phù sa & Cái tâm người làm vườn cù lao',
    'Hơn ba thập kỷ bám đất phù sa sông Đồng Nai, Chú Ba Minh giữ lối canh tác hữu cơ truyền thống và đồng hành cùng sinh viên Đại học Đồng Nai để đưa trái bưởi đường lá cam lên chợ số.', '/images/stitch/stitch-12.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-19.jpg,/images/stitch/stitch-20.jpg,/images/stitch/stitch-21.jpg,/images/stitch/stitch-22.jpg}', '{Nguyễn Văn An (ĐH Đồng Nai),Minh Anh (Đoàn viên hỗ trợ)}', true
  ),
  (
    'farm-ba-tu-demo', 'nha-vuon-ba-tu-long-khanh', 'Nhà vườn Ba Tư', 'Chú Ba Tư', 'Nông hộ 50 tuổi', 'Phường Long Khánh', 'Ấp Bàu Cối, Phường Long Khánh, Thành phố Đồng Nai, Việt Nam', '26080',
    10.9345, 107.2412, 2.5, '{Chôm chôm Java,Chôm chôm nhãn,Sầu riêng Ri6}', 'self_declared_unverified', 'Chưa xác minh OCOP chính thức', 'Thông tin vườn và nhật ký mùa vụ do chú Ba Tư tự khai cùng 2 đoàn viên Minh Anh & Tuấn ghi nhận; chưa gắn sao OCOP chính thức.', '2,5 ha đất đỏ bazan Long Khánh bước lên chợ số cùng thanh niên',
    'Canh tác 2,5 ha chôm chôm và sầu riêng theo hướng an toàn tại Phường Long Khánh, chú Ba Tư bắt đầu bán hàng trực tuyến qua 3 bước chụp ảnh và ghi âm giọng nói cùng hai đoàn viên tình nguyện.', '/images/stitch/stitch-40.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-07.jpg,/images/stitch/stitch-04.jpg,/images/stitch/stitch-30.jpg,/images/stitch/stitch-32.jpg}', '{Minh Anh (Đoàn viên),Tuấn (Đoàn viên)}', true
  ),
  (
    'farm-co-tu-cam-my', 'vuon-co-tu-sinh-thai-cam-my', 'Vườn Cô Tư Sinh Thái', 'Cô Tư', 'Nông hộ 52 tuổi', 'Xã Xuân Đường', 'Ấp Suối Lức, Xã Xuân Đường, Thành phố Đồng Nai, Việt Nam', '26347',
    10.7985, 107.259, 3.1, '{Sầu riêng hạt lép,Mật ong hoa nhãn}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Hồ sơ đang trong hàng chờ đối chiếu của Điều phối viên khu vực Xã Xuân Đường.', 'Vườn cây ăn trái kết hợp nuôi ong hoa nhãn tự nhiên',
    'Vườn Cô Tư trồng xen canh sầu riêng Ri6 với đàn ong lấy mật mùa hoa nhãn, giữ thảm cỏ sinh học bảo vệ đất đỏ.', '/images/stitch/stitch-38.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-49.jpg,/images/stitch/stitch-06.jpg}', '{Đội TNV Xã Xuân Đường}', true
  ),
  (
    'farm-htx-xuan-loc', 'htx-nong-nghiep-xuan-loc', 'HTX Nông nghiệp Xuân Lộc', 'Tổ hợp tác Xuân Lộc', 'Hợp tác xã địa phương', 'Phường Xuân Lộc', 'Khu phố Gia Ray, Phường Xuân Lộc, Thành phố Đồng Nai, Việt Nam', '26425',
    10.9228, 107.4095, 12, '{Hạt điều rang muối vỏ lụa,Cà phê rang mộc,Ổi lê Suối Cát}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Tập hợp 42 hộ xã viên chế biến hạt điều rang củi truyền thống và cây ăn trái tại Phường Xuân Lộc.', 'Giữ lửa chảo rang điều củi & chuẩn hóa tem truy xuất HTX',
    'Các xã viên Xuân Lộc kết hợp quy trình rang củi thủ công cùng sự hỗ trợ đóng gói, dán mã QR lô hàng từ đội trí thức trẻ.', '/images/stitch/stitch-39.jpg', '/images/stitch/stitch-50.jpg', '{/images/stitch/stitch-05.jpg,/images/stitch/stitch-08.jpg,/images/stitch/stitch-51.jpg}', '{Nhóm TNV Số hóa Xuân Lộc}', true
  ),
  (
    'farm-binh-loc-sau-sang', 'vuon-chom-chom-sau-sang', 'Vườn Chôm chôm Sáu Sáng', 'Chú Sáu Sáng', 'Nông hộ 55 tuổi', 'Phường Bình Lộc', 'Tổ 7, Cây Da, Phường Bình Lộc, Thành phố Đồng Nai, Việt Nam', '26089',
    10.9674, 107.2286, 3.4, '{Chôm chôm Thái,Măng cụt Bình Lộc,Chôm chôm Java}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Vườn sinh thái Bình Lộc tham gia nhật ký tưới tiết kiệm và truy xuất theo lô.', 'Mùa chôm chôm – măng cụt xanh mát vùng đồi Bình Lộc',
    'Gắn du lịch hái trái cùng mô tả giống cây chuẩn cho khách tham quan cuối tuần.', '/images/stitch/stitch-40.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-07.jpg,/images/stitch/stitch-30.jpg}', '{Tuấn (Đoàn viên Long Khánh)}', true
  ),
  (
    'farm-bao-vinh-mit', 'trang-trai-mit-cacao-bao-vinh', 'Trang trại Mít & Ca cao Bảo Vinh', 'Chị Hai Hồng', 'Nông hộ 47 tuổi', 'Phường Bảo Vinh', 'Khu phố Ruộng Lớn, Phường Bảo Vinh, Thành phố Đồng Nai, Việt Nam', '26098',
    10.9462, 107.2698, 4, '{Mít tố nữ sấy giòn,Bột ca cao nguyên chất,Sầu riêng chuồng bò}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Hồ sơ chế biến ca cao thủ công đang trong giai đoạn hoàn thiện tem bao bì.', 'Từ trái ca cao chín đỏ dưới tán mít đến ly ca cao rang xay',
    'Chú trọng lên men ủ gỗ sồi 6 ngày trước khi phơi nắng sân gạch sạch.', '/images/stitch/stitch-14.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-08.jpg,/images/stitch/stitch-31.jpg}', '{Hương Giang (TNV Thiết kế bao bì)}', true
  ),
  (
    'farm-hang-gon-sau-rieng', 'vuon-sau-rieng-co-hang-gon', 'Vườn Sầu riêng Cổ Hàng Gòn', 'Ông Năm Lộc', 'Nông hộ 62 tuổi', 'Phường Hàng Gòn', 'Khu đồi Hàng Gòn, Phường Hàng Gòn, Thành phố Đồng Nai, Việt Nam', '26113',
    10.892, 107.229, 5.2, '{Sầu riêng Musang King,Sầu riêng Ri6,Bơ 034}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Ghi chép nhật ký ngày ra hoa – đậu trái chi tiết từng lô cây lâu năm.', 'Vườn sầu riêng lâu năm kết hợp bơ 034 trên đất bazan Hàng Gòn',
    'Áp dụng thẻ QR gắn cuống trái giúp khách tra đúng tuổi quả trước khi tách múi.', '/images/stitch/stitch-38.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-04.jpg,/images/stitch/stitch-49.jpg}', '{Minh Anh (Đoàn viên)}', true
  ),
  (
    'farm-tri-an-xoai', 'htx-xoai-cat-tri-an', 'Hợp tác xã Xoài & Bưởi Trị An', 'Anh Quốc Bảo', 'Đại diện HTX 44 tuổi', 'Phường Trị An', 'Ven hồ Trị An, Phường Trị An, Thành phố Đồng Nai, Việt Nam', '26170',
    11.0965, 107.0385, 8.5, '{Xoài cát Hòa Lộc,Xoài keo sấy dẻo,Bưởi thanh trà}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Hồ sơ xã viên Trị An bao trái sinh học và ghi nhật ký mùa vụ tập trung.', 'Hương xoài nắng gió hồ Trị An vươn ra thị trường thanh niên',
    'Phường Trị An mới nâng cấp năm 2026 thúc đẩy chuyển đổi số đồng bộ cho 18 hộ trồng xoài.', '/images/stitch/stitch-19.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-20.jpg,/images/stitch/stitch-35.jpg}', '{Đội TNV Trị An}', true
  ),
  (
    'farm-phu-ly-nam-rau', 'vuon-nam-rau-rung-phu-ly', 'Vườn Nấm & Rau Rừng Phú Lý', 'Cô Út Lan', 'Nông hộ 49 tuổi', 'Xã Phú Lý', 'Ấp Lý Lịch, Xã Phú Lý, Thành phố Đồng Nai, Việt Nam', '26173',
    11.245, 107.092, 3, '{Nấm mối đen,Rau bép non,Măng le khô Phú Lý}', 'self_declared_unverified', 'Tự khai nguồn gốc', 'Thu hái sáng sớm và đóng gói túi giấy giữ mát.', 'Hương vị xanh sạch từ vùng đệm rừng Phú Lý',
    'Cung cấp rau rừng bản địa và nấm mối đen nuôi trồng hữu cơ theo mùa.', '/images/stitch/stitch-20.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-36.jpg,/images/stitch/stitch-37.jpg}', '{Nguyễn Văn An}', true
  ),
  (
    'farm-tan-an-buoi', 'trang-trai-buoi-huu-co-tan-an', 'Trang trại Bưởi Hữu cơ Tân An', 'Chú Tư Nghĩa', 'Nông hộ 56 tuổi', 'Xã Tân An', 'Ấp Cây Cầy, Xã Tân An, Thành phố Đồng Nai, Việt Nam', '26179',
    11.031, 106.968, 2.8, '{Bưởi da xanh hữu cơ,Chanh không hạt,Cam xoàn}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Sử dụng phân trùn quế và bẫy bả sinh học thay thuốc hóa học.', 'Vườn cây có múi dùng phân trùn quế dọc sông Đồng Nai',
    'Chú Tư Nghĩa tự ủ phân hữu cơ từ vỏ trái cây và phụ phẩm nông nghiệp tại Xã Tân An.', '/images/stitch/stitch-16.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-26.jpg,/images/stitch/stitch-28.jpg}', '{Hùng Dũng (TNV ĐH Nông Lâm)}', true
  ),
  (
    'farm-thanh-son-chuoi', 'vuon-chuoi-tay-thanh-son', 'Tổ hợp Chuối & Bưởi Thanh Sơn', 'Anh Minh Khôi', 'Nông hộ trẻ 34 tuổi', 'Xã Thanh Sơn', 'Ấp 3, Thanh Sơn, Xã Thanh Sơn, Thành phố Đồng Nai, Việt Nam', '26209',
    11.214, 107.258, 6.5, '{Chuối Laba sấy dẻo,Bưởi da xanh,Ổi ruột đỏ}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Tiên phong ghi nhật ký điện tử từ ứng dụng di động.', 'Nông dân thế hệ 9x số hóa vùng cây ăn trái qua đồi Thanh Sơn',
    'Kết hợp sấy năng lượng mặt trời để tăng hạn dùng chuối Laba lên 6 tháng không chất bảo quản.', '/images/stitch/stitch-16.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-41.jpg,/images/stitch/stitch-42.jpg}', '{Nhóm TNV Định Quán}', true
  ),
  (
    'farm-la-nga-xoai', 'vuon-xoai-buoi-la-nga', 'Tổ Hợp tác Xoài Bưởi La Ngà', 'Cô Ba Hậu', 'Nông hộ 53 tuổi', 'Xã La Ngà', 'Ven cầu La Ngà, Xã La Ngà, Thành phố Đồng Nai, Việt Nam', '26227',
    11.153, 107.211, 7.2, '{Xoài tượng da xanh,Xoài Ba Màu,Mứt xoài dẻo}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Hồ sơ đối chiếu vùng xoài dọc Quốc lộ 20.', 'Xoài chín nắng ven sông La Ngà – Giòn thơm ít xơ',
    'Tạo sinh kế ổn định cho 14 hộ phụ nữ chế biến mứt xoài và xoài sấy.', '/images/stitch/stitch-35.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-43.jpg,/images/stitch/stitch-52.jpg}', '{Lan Phương (TNV Marketing)}', true
  ),
  (
    'farm-nam-cat-tien-cacao', 'vuon-cacao-nam-cat-tien', 'Vườn Ca Cao Sinh Cảnh Nam Cát Tiên', 'Chú Bảy Tám', 'Nông hộ 57 tuổi', 'Xã Nam Cát Tiên', 'Ấp 4, Nam Cát Tiên, Xã Nam Cát Tiên, Thành phố Đồng Nai, Việt Nam', '26122',
    11.418, 107.425, 4.6, '{Hạt ca cao lên men,Sô-cô-la đen 70%,Trà vỏ ca cao}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Vùng ca cao sinh cảnh giữ bóng mát ven vườn quốc gia.', 'Canh tác ca cao giữ tán rừng tự nhiên vùng Nam Cát Tiên',
    'Không phát quang hóa chất, thu trái chín ủ men thủ công theo chuẩn hương trái cây.', '/images/stitch/stitch-08.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-14.jpg,/images/stitch/stitch-50.jpg}', '{Khánh Linh (Đoàn viên Định Quán)}', true
  ),
  (
    'farm-dak-lua-lua-sen', 'canh-dong-lua-sen-dak-lua', 'Cánh đồng Lúa Thơm & Sen Đak Lua', 'Tổ hợp tác Đak Lua', 'Tổ nông dân trẻ', 'Xã Đak Lua', 'Cánh đồng Bàu Sen, Xã Đak Lua, Thành phố Đồng Nai, Việt Nam', '26119',
    11.468, 107.372, 9, '{Gạo ST25 lúa mùa,Hạt sen sấy giòn,Trà tim sen}', 'self_declared_unverified', 'Tự khai canh tác', 'Ghi chép lịch gieo sạ và thu hoạch bằng tay, phơi nắng sân.', 'Lúa thơm và sen sạch nơi cực Đông Bắc bên sông Đồng Nai',
    'Cầu nối đưa nông sản xã xa nhất phía Nam tới trực tiếp bàn ăn đô thị.', '/images/stitch/stitch-22.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-33.jpg,/images/stitch/stitch-55.jpg}', '{Đội TNV Mùa Hè Xanh}', true
  ),
  (
    'farm-dau-giay-nam', 'trai-nam-sach-dau-giay', 'Trại Nấm Sạch & Linh Chi Dầu Giây', 'Kỹ sư Thanh Tâm', 'Khởi nghiệp nông nghiệp 31 tuổi', 'Phường Dầu Giây', 'Khu dân cư Dầu Giây, Phường Dầu Giây, Thành phố Đồng Nai, Việt Nam', '26326',
    10.9465, 107.143, 1.8, '{Nấm bào ngư xám,Nấm linh chi đỏ thái lát,Nấm đùi gà}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Phôi nấm từ mùn cưa cao su thanh trùng hơi nước khép kín.', 'Phòng nuôi nấm cảm biến độ ẩm sạch không thuốc kích thích',
    'Mỗi bịch phôi được gắn mã lô giúp theo dõi số ngày ra tai nấm chuẩn sạch.', '/images/stitch/stitch-56.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-57.jpg,/images/stitch/stitch-59.jpg}', '{CLB Khởi nghiệp Thanh niên}', true
  ),
  (
    'farm-bau-ham-tieu', 'vuon-tieu-bau-ham', 'Vườn Tiêu & Chuối Chế Biến Bàu Hàm', 'Chú Tám Lợi', 'Nông hộ 60 tuổi', 'Xã Bàu Hàm', 'Ấp Cây Điều, Xã Bàu Hàm, Thành phố Đồng Nai, Việt Nam', '26254',
    10.992, 107.105, 4.3, '{Tiêu đen sọ đỏ,Tiêu xanh ngâm giấm,Chuối sấy mè gừng}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Đang đối chiếu chứng từ sơ chế tiêu đạt độ ẩm lưu trữ dưới 12%.', 'Hạt tiêu cay nồng trên vùng đất sỏi đỏ Bàu Hàm',
    'Thu hái từng chùm chín đỏ rực cuối vụ xuân, phơi trên giàn lưới tránh lẫn tạp chất.', '/images/stitch/stitch-60.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-61.jpg,/images/stitch/stitch-51.jpg}', '{TNV Xã Bàu Hàm}', true
  ),
  (
    'farm-xuan-bac-nhan', 'trang-trai-nhan-xuan-bac', 'Trang trại Nhãn & Bưởi Xuân Bắc', 'Cô Sáu Duyên', 'Nông hộ 51 tuổi', 'Xã Xuân Bắc', 'Ấp 2, Xuân Bắc, Xã Xuân Bắc, Thành phố Đồng Nai, Việt Nam', '26428',
    11.005, 107.378, 5, '{Nhãn tiêu da bò,Long nhãn sấy khô,Bưởi da xanh}', 'self_declared_unverified', 'Tự khai mùa vụ', 'Đóng gói túi lưới và hũ sấy nhiệt thấp bảo toàn vị ngọt.', 'Tách cơm long nhãn vàng óng theo quy trình gia đình sạch',
    'Không xông lưu huỳnh, giữ màu vàng nâu tự nhiên và mùi thơm hoa nhãn nhẹ.', '/images/stitch/stitch-18.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-48.jpg,/images/stitch/stitch-06.jpg}', '{Hội Thanh niên Xuân Bắc}', true
  ),
  (
    'farm-cam-my-sau-rieng', 'vuon-sau-rieng-dona-cam-my', 'Vườn Sầu riêng Dona Cẩm Mỹ', 'Anh Tấn Phát', 'Nông hộ 41 tuổi', 'Xã Cẩm Mỹ', 'Ấp Sông Ray 2, Xã Cẩm Mỹ, Thành phố Đồng Nai, Việt Nam', '26341',
    10.8165, 107.274, 3.8, '{Sầu riêng Dona,Mít Thái siêu sớm,Sầu riêng cấp đông}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Ghi rõ ngày thụ phấn và cắt nước trước thu hoạch trong nhật ký mùa vụ.', 'Sầu riêng Dona múi lớn cơm vàng mượt vùng Cẩm Mỹ',
    'Áp dụng cấp đông nhanh từng múi để phục vụ khách quanh năm không lo trái mùa.', '/images/stitch/stitch-49.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-04.jpg,/images/stitch/stitch-38.jpg}', '{Minh Anh & Tuấn}', true
  ),
  (
    'farm-tran-bien-rau', 'vuon-rau-thuy-canh-tran-bien', 'Vườn Rau Thủy Canh & Quà OCOP Trấn Biên', 'Nhóm Trẻ Trấn Biên', 'HTX Thanh niên', 'Phường Trấn Biên', 'Đường Hà Huy Giáp, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam', '26041',
    10.946, 106.8235, 1.2, '{Cải bó xôi thủy canh,Combo Quà OCOP Đồng Nai,Xà lách thủy canh}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Trạm đóng gói trung tâm kết hợp nông sản sạch từ các vườn thành viên.', 'Trạm xanh đô thị & Đóng gói Combo quà OCOP Thanh niên',
    'Là đầu mối gom hàng từ các vườn tỉnh, giao nhanh nội thành và giới thiệu du lịch sinh thái.', '/images/stitch/stitch-29.jpg', '/images/stitch/stitch-31.jpg', '{/images/stitch/stitch-36.jpg,/images/stitch/stitch-37.jpg}', '{Thu Hà (Đoàn Trấn Biên),Ban Tình nguyện}', true
  ),
  (
    'farm-binh-phuoc-dieu', 'htx-hat-dieu-binh-phuoc', 'HTX Hạt Điều Bazan Bình Phước', 'Bà Năm Hương', 'Chủ nhiệm HTX 54 tuổi', 'Phường Bình Phước', 'Khu phố Tân Bình, Phường Bình Phước, Thành phố Đồng Nai, Việt Nam', '25195',
    11.535, 106.898, 14.5, '{Hạt điều rang muối W240,Bơ hạt điều không đường,Hạt điều tỏi ớt}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Liên kết 28 hộ trồng điều phía Bắc Thành phố Đồng Nai chuẩn hóa bao bì & QR.', 'Thủ phủ hạt điều bazan kết nối chợ OCOP Thành phố Đồng Nai',
    'Mở rộng vùng nguyên liệu phía Bắc sau hợp nhất hành chính, đảm bảo đồng nhất chất lượng nhân điều.', '/images/stitch/stitch-05.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-34.jpg,/images/stitch/stitch-39.jpg}', '{Đội TNV Bình Phước}', true
  ),
  (
    'farm-dong-xoai-tieu', 'vuon-tieu-mat-rung-dong-xoai', 'Vườn Tiêu Đen & Mật Rừng Đồng Xoài', 'Chú Tư Hải', 'Nông hộ 52 tuổi', 'Phường Đồng Xoài', 'Khu phố Phước Tân, Phường Đồng Xoài, Thành phố Đồng Nai, Việt Nam', '25210',
    11.5425, 106.915, 4.8, '{Tiêu đen hạt chắc,Tiêu trắng tẩy tự nhiên,Mật ong rừng nguyên chất}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Đang bổ sung phiếu kiểm nghiệm độ ẩm mẫu tham khảo.', 'Tiêu xanh hữu cơ leo trụ sống bằng cây muồng đen',
    'Giảm trụ bê tông, ưu tiên cây che bóng tự nhiên giúp vườn mát và giữ độ ẩm đất.', '/images/stitch/stitch-62.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-60.jpg,/images/stitch/stitch-06.jpg}', '{Đội TNV Đồng Xoài}', true
  ),
  (
    'farm-phuoc-long-bo', 'trang-trai-bo-caphe-phuoc-long', 'Trang trại Bơ Sáp & Cà phê Phước Long', 'Anh Hùng Sơn', 'Nông hộ 43 tuổi', 'Phường Phước Long', 'Triền đồi Bà Rá, Phường Phước Long, Thành phố Đồng Nai, Việt Nam', '25217',
    11.838, 106.992, 6.2, '{Bơ sáp Booth 7,Cà phê Arabica - Robusta phối trộn,Chanh dây tím}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Vùng khí hậu mát sườn núi Bà Rá phù hợp giống bơ sáp và cà phê chất lượng.', 'Hương cà phê & Bơ sáp sườn đồi Bà Rá',
    'Thu hái chín đỏ 95%, phơi giàn nâng trên sàn cách đất 80 cm đảm bảo vệ sinh.', '/images/stitch/stitch-08.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-50.jpg,/images/stitch/stitch-63.jpg}', '{Nhóm TNV Phước Long}', true
  ),
  (
    'farm-dak-nhau-dieu', 'vuon-dieu-huu-co-dak-nhau', 'Vườn Điều Hữu cơ Đak Nhau', 'Anh Điểu Hùng', 'Nông hộ S''tiêng 39 tuổi', 'Xã Đak Nhau', 'Thôn Thống Nhất, Xã Đak Nhau, Thành phố Đồng Nai, Việt Nam', '25399',
    11.855, 107.265, 11, '{Hạt điều hữu cơ rang mộc,Mắc ca nứt vỏ,Mật hoa rừng}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Ghi nhận mô hình giữ rừng điều lâu năm và tăng thu nhập đồng bào địa phương.', 'Hạt điều & Mắc ca vùng cao nguyên bazan Đak Nhau',
    'Đồng bào S''tiêng tại Đak Nhau phối hợp thanh niên gắn mã QR kể câu chuyện mùa rụng hạt tháng Ba.', '/images/stitch/stitch-34.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-05.jpg,/images/stitch/stitch-39.jpg}', '{Đội TNV Số hóa Vùng cao}', true
  ),
  (
    'farm-phuoc-son-mat-ong', 'to-hop-tac-phuoc-son', 'Tổ Hợp tác Điều & Mật Rừng Phước Sơn', 'Chú Ba Sơn', 'Tổ trưởng hợp tác 51 tuổi', 'Xã Phước Sơn', 'Thôn 3, Xã Phước Sơn, Xã Phước Sơn, Thành phố Đồng Nai, Việt Nam', '25420',
    11.682, 107.291, 8.4, '{Hạt điều vỏ lụa,Mật ong hoa rừng,Khoai môn sáp}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Lưu ý địa giới: Xã Phước Sơn hiện áp dụng diện tích 386,56 km²; hồ sơ đề xuất điều chỉnh 659,163 km² theo NQ 71/NQ-HĐND 11/11/2026 đang chờ quyết định cấp có thẩm quyền.', 'Nông sản Xã Phước Sơn — Minh bạch cả mùa vụ lẫn dữ liệu hành chính',
    'Cung cấp điều rang mộc và mật rừng sạch từ vùng giáp ranh Đông Nam Bộ – Tây Nguyên với ghi chú hành chính cập nhật 25/11/2026.', '/images/stitch/stitch-65.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-06.jpg,/images/stitch/stitch-51.jpg}', '{Tổ TNV Phước Sơn}', true
  ),
  (
    'farm-thong-nhat-xoai', 'vuon-xoai-suoi-tre-thong-nhat', 'Vườn Xoài Suối Tre Thống Nhất', 'Chú Tư Hiếu', 'Nông hộ 54 tuổi', 'Xã Thống Nhất', 'Ấp Lộ Đức, Xã Thống Nhất, Thành phố Đồng Nai, Việt Nam', '26299',
    10.978, 107.148, 3.8, '{Xoài keo sấy dẻo,Xoài cát Hòa Lộc,Chuối sứ}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Vườn mẫu tại Xã Thống Nhất áp dụng nhật ký tưới nhỏ giọt và bao trái sinh học.', 'Xoài chín cây & quy trình sấy dẻo giữ vị tự nhiên',
    'Phối hợp đội thanh niên địa phương số hóa từng đợt thu hái và đóng gói túi zip.', '/images/stitch/stitch-09.jpg', '/images/stitch/stitch-12.jpg', '{/images/stitch/stitch-10.jpg,/images/stitch/stitch-48.jpg}', '{Nhóm TNV Xã Thống Nhất}', true
  ),
  (
    'farm-nhon-trach-tra', 'vuon-tra-thanh-yen-nhon-trach', 'Vườn Trà Thanh Yên Nhơn Trạch', 'Cô Bảy Liên', 'Nông hộ 57 tuổi', 'Phường Nhơn Trạch', 'Khu Phú Hội, Phường Nhơn Trạch, Thành phố Đồng Nai, Việt Nam', '26485',
    10.715, 106.885, 1.9, '{Trà lá thảo mộc,Dứa mật,Mật ong vườn}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Lưu giữ kỹ thuật sao trà thủ công vùng Nhơn Trạch gắn mã lô QR.', 'Hương trà quê gắn kết du lịch sinh thái vùng sông nước',
    'Mở đón khách trải nghiệm hái lá trà buổi sớm và sao chảo gang truyền thống.', '/images/stitch/stitch-55.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-16.jpg,/images/stitch/stitch-18.jpg}', '{Đoàn Thanh niên Nhơn Trạch}', true
  ),
  (
    'farm-long-thanh-mit', 'nong-trai-trai-cay-long-thanh', 'Nông trại Mít & Sầu riêng Long Thành', 'Anh Quốc Bảo', 'Nông hộ 41 tuổi', 'Phường Long Thành', 'Tổ 11, Long Thành, Phường Long Thành, Thành phố Đồng Nai, Việt Nam', '26368',
    10.795, 106.952, 4.5, '{Mít sấy giòn,Sầu riêng tách múi,Chôm chôm}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Đang hoàn thiện nhật ký kho lạnh bảo quản trái cây sau thu hoạch.', 'Chế biến sâu nâng giá trị nông sản tươi Long Thành',
    'Phân loại trái loại 2 đủ độ chín để sấy giòn, giảm thất thoát sau thu hoạch.', '/images/stitch/stitch-14.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-49.jpg,/images/stitch/stitch-52.jpg}', '{CLB Nông nghiệp Trẻ Long Thành}', true
  ),
  (
    'farm-phu-lam-ong', 'trai-ong-hoa-nhan-phu-lam', 'Trại Ong Hoa Nhãn Phú Lâm', 'Chú Năm Dưỡng', 'Nông hộ 59 tuổi', 'Xã Phú Lâm', 'Ấp Thanh Lâm, Xã Phú Lâm, Thành phố Đồng Nai, Việt Nam', '26158',
    11.275, 107.432, 2, '{Mật ong hoa nhãn,Phấn hoa tự nhiên,Thanh long ruột đỏ}', 'self_declared_unverified', 'Nhà vườn tự khai', 'Ghi chép lịch di chuyển đàn ong theo mùa hoa nhãn và hoa chôm chôm.', 'Giữ đàn ong mật sạch đồng hành cùng mùa hoa trái Đồng Nai',
    'Không cho ong ăn đường trong mùa khai thác mật để giữ độ sánh thơm tự nhiên.', '/images/stitch/stitch-06.jpg', '/images/stitch/stitch-11.jpg', '{/images/stitch/stitch-10.jpg,/images/stitch/stitch-51.jpg}', '{Đội TNV Xã Phú Lâm}', true
  ),
  (
    'farm-dak-o-bu-gia', 'vuon-sau-rieng-bu-gia-dak-o', 'Vườn Sầu riêng Đồi Bù Gia Đắk Ơ', 'Chú Sáu Bình', 'Nông hộ 53 tuổi', 'Xã Đắk Ơ', 'Thôn Bù Gia, Xã Đắk Ơ, Thành phố Đồng Nai, Việt Nam', '25225',
    12.012, 107.125, 5.6, '{Sầu riêng Monthong,Hồ tiêu đen,Bơ sáp}', 'coop_checked_demo', 'Hồ sơ đã đối chiếu', 'Vùng đất đỏ phía Bắc kết nối tuyến gom hàng lạnh hàng tuần về trung tâm.', 'Vùng đồi Đắk Ơ ứng dụng nhật ký tưới và phân bón theo chặng',
    'Tổ hợp tác hỗ trợ cân đo độ khô hạt tiêu và đánh dấu cây sầu riêng thu hái đồng đều.', '/images/stitch/stitch-38.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-04.jpg,/images/stitch/stitch-62.jpg}', '{Tổ TNV Đắk Ơ}', true
  ),
  (
    'farm-tho-son-non', 'nong-trai-dieu-rau-tho-son', 'Nông trại Điều & Rau Rừng Thọ Sơn', 'Chị H''Mai', 'Nông hộ 38 tuổi', 'Xã Thọ Sơn', 'Thôn 2, Thọ Sơn, Xã Thọ Sơn, Thành phố Đồng Nai, Việt Nam', '25402',
    11.734, 107.284, 7.2, '{Hạt điều rang mộc,Rau rừng theo mùa,Măng khô}', 'pending_review', 'Đang chờ đối chiếu hồ sơ', 'Hồ sơ vườn điều dưới tán cây bản địa đang đối chiếu diện tích canh tác thực tế.', 'Bảo tồn giống rau rừng và hạt điều tự nhiên vùng Thọ Sơn',
    'Thu hái theo mùa mưa và phơi sấy sạch dưới giàn lưới chống côn trùng.', '/images/stitch/stitch-35.jpg', '/images/stitch/stitch-54.jpg', '{/images/stitch/stitch-34.jpg,/images/stitch/stitch-39.jpg}', '{Nhóm TNV Thọ Sơn}', true
  ),
  (
    'farm-tt-ho-01', 'vuon-buoi-chu-nam-tan-trieu', 'Hộ Bưởi Chú Năm Tân Triều', 'Chú Năm Hòa', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Cụm Bến Đò Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9742, 106.7985, 1.8, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Chú Năm Tân Triều đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-24.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-02', 'vuon-buoi-co-bay-cu-lao', 'Hộ Bưởi Cô Bảy Cù Lao', 'Cô Bảy Mai', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Tổ 3, Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9698, 106.7905, 1.6, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Cô Bảy Cù Lao đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-25.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-03', 'vuon-buoi-anh-tu-tan-trieu', 'Hộ Canh tác Sinh học Anh Tư Tân Triều', 'Anh Tư Khải', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Ấp Tân Bình, Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9765, 106.8012, 2.1, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Canh tác Sinh học Anh Tư Tân Triều đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-26.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-04', 'vuon-buoi-chu-muoi-phu-sa', 'Hộ Bưởi Chú Mười Phù Sa', 'Chú Mười Tâm', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Ven sông Đồng Nai, Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9675, 106.7872, 2.4, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Chú Mười Phù Sa đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-28.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-05', 'vuon-che-bien-co-sau-tan-trieu', 'Tổ Sơ chế Vỏ bưởi Cô Sáu', 'Cô Sáu Ngọc', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Chợ Bến Cá, Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9712, 106.8045, 1.2, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Tổ Sơ chế Vỏ bưởi Cô Sáu đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-18.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-06', 'vuon-buoi-anh-hung-tan-an', 'Hộ Bưởi Da xanh Anh Hùng Tân An', 'Anh Hùng Dũng', 'Xã viên HTX Tân Triều', 'Xã Tân An', 'Xã Tân An, Xã Tân An, Thành phố Đồng Nai, Việt Nam', '26179',
    11.0285, 106.9612, 2, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Da xanh Anh Hùng Tân An đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-44.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-07', 'vuon-buoi-chi-lan-tri-an', 'Hộ Bưởi Đường Chị Lan Trị An', 'Chị Lan Anh', 'Xã viên HTX Tân Triều', 'Phường Trị An', 'Khu phố 4, Trị An, Phường Trị An, Thành phố Đồng Nai, Việt Nam', '26170',
    11.0925, 107.0385, 1.9, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Đường Chị Lan Trị An đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-45.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-08', 'vuon-buoi-ong-bay-bien-hoa', 'Hộ Bưởi Vườn Phố Ông Bảy Biên Hòa', 'Ông Bảy Thuận', 'Xã viên HTX Tân Triều', 'Phường Biên Hòa', 'Khu vườn ven sông, Biên Hòa, Phường Biên Hòa, Thành phố Đồng Nai, Việt Nam', '26068',
    10.9412, 106.8195, 1.5, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Bưởi Vườn Phố Ông Bảy Biên Hòa đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-46.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-09', 'vuon-chanh-day-trang-bom', 'Tổ Hộ Trái cây Có múi Trảng Bom', 'Chị Minh Châu', 'Xã viên HTX Tân Triều', 'Phường Trảng Bom', 'Phường Trảng Bom, Phường Trảng Bom, Thành phố Đồng Nai, Việt Nam', '26248',
    10.9522, 107.0018, 2.6, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Tổ Hộ Trái cây Có múi Trảng Bom đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-53.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  ),
  (
    'farm-tt-ho-10', 'vuon-buoi-vinh-an-htx', 'Hộ Liên kết Bưởi Đông Bắc Tân Triều', 'Chú Chín Lộc', 'Xã viên HTX Tân Triều', 'Phường Tân Triều', 'Tổ 9, Tân Triều, Phường Tân Triều, Thành phố Đồng Nai, Việt Nam', '26188',
    10.9792, 106.7944, 2.3, '{Bưởi da xanh Tân Triều,Bưởi đường lá cam,Mứt vỏ bưởi}', 'coop_checked_demo', 'HTX Tân Triều đối chiếu nội bộ', 'Hộ thành viên thuộc cụm mô hình HTX Tân Triều (dữ liệu thực hành nội bộ).', 'Hộ thành viên Hộ Liên kết Bưởi Đông Bắc Tân Triều đồng bộ nhật ký gom lô HTX Tân Triều',
    'Tham gia chia sẻ nhật ký chăm sóc, thu gom theo lịch chuyến xe mát và đối chiếu thanh toán minh bạch.', '/images/stitch/stitch-03.jpg', '/images/stitch/stitch-13.jpg', '{/images/stitch/stitch-24.jpg,/images/stitch/stitch-27.jpg}', '{TNV HTX Tân Triều}', true
  )
on conflict (id) do nothing;
