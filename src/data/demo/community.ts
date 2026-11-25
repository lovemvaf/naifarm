export interface LessonQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CASHEW_LESSON = {
  id: "lesson-hat-dieu-dong-nai",
  title: "Hành trình của hạt điều Đồng Nai — Từ vườn cây đến sản phẩm OCOP",
  duration: "15 phút",
  level: "Phổ thông & Sinh viên (Học mở)",
  objective:
    "Hiểu đặc điểm sinh trưởng của cây điều vùng đất đỏ Đồng Nai, quy trình thu hoạch an toàn, rang củi giữ vỏ lụa và vai trò của mã QR truy xuất.",
  sections: [
    {
      heading: "1. Vì sao đất đỏ bazan Đồng Nai hợp với cây điều?",
      body: "Điều thích nghi tốt với khí hậu nhiệt đới hai mùa mưa nắng rõ rệt tại Xuân Lộc, Định Quán, Cẩm Mỹ. Rễ cọc ăn sâu giúp cây chịu hạn tốt trong mùa khô khi hạt điều vào giai đoạn chắc nhân.",
      image: "stitch/stitch-39.webp",
    },
    {
      heading: "2. Hai phần đặc biệt: Quả giả (đào lộn hột) & Hạt thật",
      body: "Phần cuống phình to mọng nước gọi là quả giả, còn hạt điều thật nằm bên ngoài ở đầu quả. Khi thu hoạch, nông dân chờ hạt rụng tự nhiên trên nền vườn sạch để nhân đạt độ bùi cao nhất.",
      image: "stitch/stitch-50.webp",
    },
    {
      heading: "3. Rang củi giữ vỏ lụa & Minh bạch lô hàng bằng QR",
      body: "Vỏ hạt điều thô chứa nhựa vỏ điều cần xử lý đúng kỹ thuật. Khi rang chín bằng chảo gang, lớp vỏ lụa nâu giúp giữ hương thơm và hạn chế ẩm. Gắn mã QR lô sản xuất giúp người mua xem rõ ngày thu hoạch và cơ sở chế biến.",
      image: "stitch/stitch-05.webp",
    },
  ],
  quiz: [
    {
      id: "q1",
      question: "Thời điểm thu hoạch hạt điều cho chất lượng nhân bùi và chắc nhất là khi nào?",
      options: [
        "Hái khi trái còn xanh non trên cành",
        "Chờ hạt chín và rụng tự nhiên rồi thu gom trên vườn sạch",
        "Ngâm nước nhiều ngày trước khi phơi",
      ],
      correctIndex: 1,
      explanation: "Hạt điều rụng tự nhiên đảm bảo nhân đã tích đủ dưỡng chất và độ khô đồng đều.",
    },
    {
      id: "q2",
      question: "Vai trò của lớp vỏ lụa mỏng quanh nhân điều rang muối Xuân Lộc là gì?",
      options: [
        "Giúp giữ hương thơm tự nhiên, giảm gãy vỡ và tạo vị bùi đặc trưng",
        "Làm tăng trọng lượng nước trong hạt",
        "Thay thế hoàn toàn bao bì đóng gói",
      ],
      correctIndex: 0,
      explanation: "Vỏ lụa mỏng bảo vệ nhân điều khi rang củi và giữ vị giòn bùi truyền thống.",
    },
    {
      id: "q3",
      question: "Mã QR trên hộ chiếu nông sản NaiFarm giúp người tiêu dùng kiểm tra điều gì trung thực nhất?",
      options: [
        "Tự động chứng nhận an toàn thực phẩm tuyệt đối",
        "Xem mã lô, ngày thu hoạch/đóng gói, chủ thể khai báo và tình trạng đối chiếu chứng từ",
        "Thay đổi giá bán sản phẩm tự động",
      ],
      correctIndex: 1,
      explanation: "Mã QR công khai nguồn gốc khai báo, lịch sử mốc thời gian và tách bạch trạng thái đối chiếu chứng từ.",
    },
  ] satisfies LessonQuestion[],
};
