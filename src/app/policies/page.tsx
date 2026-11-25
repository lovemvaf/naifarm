import React from "react";
import Link from "next/link";
import { ArrowLeft, FileCheck2, Lock, PackageCheck, ShieldAlert, Truck } from "lucide-react";
import { Badge, Card } from "@/components/ui/Primitives";

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-4 py-8 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245B3D] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Quay lại Trang chủ</span>
      </Link>

      <div className="space-y-2">
        <Badge tone="info">Quy ước hoạt động · Không gian trải nghiệm</Badge>
        <h1 className="font-editorial text-3xl font-semibold text-[#25352B]">
          Chính sách, Minh bạch dữ liệu &amp; Điều khoản trải nghiệm
        </h1>
        <p className="text-sm text-[#52645A]">
          Tài liệu mô tả cách vận hành giao diện NaiFarm trong phạm vi trải nghiệm sản phẩm. Thao tác
          trên website không phát sinh thanh toán, giao hàng thật, nghĩa vụ thuế hoặc cấp chứng nhận pháp lý.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="space-y-2.5 p-5">
          <div className="flex items-center gap-2 text-[#245B3D]">
            <Truck className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#25352B]">Giao nhận &amp; Lấy hàng tại vườn</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#52645A]">
            Người mua có thể chọn giao đến địa chỉ tại 95 Phường/Xã Thành phố Đồng Nai hoặc khu vực lân cận
            như TP.HCM, hoặc chọn hẹn nhận trực tiếp tại vườn theo khung giờ. Mọi mốc trạng thái vận
            chuyển là trạng thái ghi nhận tuần tự theo đơn trong bộ nhớ cục bộ.
          </p>
        </Card>

        <Card className="space-y-2.5 p-5">
          <div className="flex items-center gap-2 text-[#245B3D]">
            <PackageCheck className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#25352B]">Đổi trả &amp; Yêu cầu hoàn tiền</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#52645A]">
            Với đơn hàng đang giao hoặc đã hoàn thành trong không gian trải nghiệm, khách mua có thể gửi
            yêu cầu hủy hoặc hoàn tiền một phần/toàn phần kèm lý do. Yêu cầu sẽ chuyển qua quy trình tách
            quyền người tạo và người duyệt trước khi điều chỉnh tồn kho lô liên quan.
          </p>
        </Card>

        <Card className="space-y-2.5 p-5">
          <div className="flex items-center gap-2 text-[#245B3D]">
            <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#25352B]">Chứng nhận chất lượng &amp; Danh mục tham khảo</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#52645A]">
            NaiFarm tách bạch hoàn toàn{" "}
            <strong className="text-[#25352B]">Danh mục OCOP / VietGAP tham khảo</strong> (liên kết tới
            quyết định, phụ lục công bố công khai từ cơ quan nhà nước — không mở đặt mua) với{" "}
            <strong className="text-[#25352B]">Sản phẩm thực hành</strong> và{" "}
            <strong className="text-[#25352B]">Hồ sơ mẫu</strong>. Các nhãn chứng nhận chỉ hiển thị khi
            hồ sơ đúng phạm vi sản phẩm và còn hiệu lực.
          </p>
        </Card>

        <Card className="space-y-2.5 p-5">
          <div className="flex items-center gap-2 text-[#245B3D]">
            <Lock className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#25352B]">Quyền riêng tư &amp; Dữ liệu thiết bị</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#52645A]">
            Website không yêu cầu hay lưu trữ mật khẩu thật, số CMND/CCCD, tài khoản ngân hàng hoặc tọa
            độ GPS nền. Dữ liệu định vị chỉ được trình duyệt cung cấp một lần khi bạn nhấn &ldquo;Vị trí
            của tôi&rdquo; và không được lưu cố định lên máy chủ.
          </p>
        </Card>
      </div>

      <Card className="border-[#D7A34D] bg-[#FFF2D8]/50 p-5 text-xs leading-relaxed text-[#25352B]">
        <p className="flex items-center gap-1.5 font-bold text-[#80520C]">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Lưu ý sử dụng minh bạch</span>
        </p>
        <p className="mt-1.5 text-[#52645A]">
          Nếu cần đặt lại toàn bộ phiên trải nghiệm về trạng thái ban đầu hoặc xem tài liệu đối chiếu
          nguồn công bố, bạn có thể mở mục{" "}
          <Link href="/account/settings" className="font-semibold text-[#245B3D] underline">
            Cài đặt tài khoản
          </Link>{" "}
          hoặc{" "}
          <Link href="/quality" className="font-semibold text-[#245B3D] underline">
            Trung tâm Chất lượng
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
