"use client";

import React, { useState } from "react";
import { CheckCircle2, Layers, Leaf, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/format";

export type ProduceAnatomyId = "pomelo" | "rambutan" | "cashew" | "durian";

interface AnatomyLayer {
  id: string;
  label: string;
  shortTag: string;
  summary: string;
  agriFact: string;
  indicator: string;
}

interface ProduceAnatomySpec {
  id: ProduceAnatomyId;
  title: string;
  regionLabel: string;
  soilType: string;
  harvestWindow: string;
  keyMetric: string;
  layers: AnatomyLayer[];
}

const PRODUCE_SPECS: Record<ProduceAnatomyId, ProduceAnatomySpec> = {
  pomelo: {
    id: "pomelo",
    title: "Bưởi da xanh & Bưởi đường lá cam",
    regionLabel: "Phường Tân Triều, Thành phố Đồng Nai",
    soilType: "Đất phù sa cổ ven sông Đồng Nai",
    harvestWindow: "Tháng 8 – Tháng 12 & vụ Tết",
    keyMetric: "Độ ngọt 11,0° – 12,4° Brix",
    layers: [
      {
        id: "rind",
        label: "Lớp vỏ xanh & tinh dầu",
        shortTag: "Vỏ ngoài 1,2 cm",
        summary: "Vỏ xanh căng bóng, túi tinh dầu dày giữ độ tươi tự nhiên 10–14 ngày ở nhiệt độ mát.",
        agriFact: "Vỏ bưởi sau thu hoạch còn được tái chế làm mứt vỏ bưởi, tinh dầu xông phòng.",
        indicator: "Tinh dầu cao · Bảo quản tự nhiên",
      },
      {
        id: "pith",
        label: "Lớp cùi trắng xốp",
        shortTag: "Đệm giảm chấn",
        summary: "Màng cùi mỏng vừa phải bảo vệ múi bưởi không dập nát khi vận chuyển đi xa.",
        agriFact: "Giàu pectin và chất xơ hòa tan; hộ chế biến nấu chè bưởi truyền thống.",
        indicator: "Giảm dập nát · Giàu Pectin",
      },
      {
        id: "segments",
        label: "Tép bưởi hồng mọng ráo nước",
        shortTag: "11–13 múi đều",
        summary: "Tép ráo, tách múi không dính tay, vị ngọt thanh hậu dịu đặc trưng phù sa cù lao.",
        agriFact: "Thu hoạch đúng lứa giúp tỷ lệ múi chắc đạt cao, hạn chế sượng đầu cuống.",
        indicator: "11,8° Brix · Giàu Vitamin C",
      },
      {
        id: "seed",
        label: "Lõi & hạt lép tự nhiên",
        shortTag: "Ít hạt / Không hạt",
        summary: "Quả đạt chuẩn vườn Tân Triều có lõi đặc vừa, hạt ít hoặc lép để tối đa phần thịt quả.",
        agriFact: "Nhật ký tỉa cành & tưới cân bằng Kali hữu cơ quyết định độ giòn của tép.",
        indicator: "Tỷ lệ thịt quả ~62%",
      },
    ],
  },
  rambutan: {
    id: "rambutan",
    title: "Chôm chôm Java & Chôm chôm nhãn",
    regionLabel: "Phường Long Khánh & Bình Lộc, Thành phố Đồng Nai",
    soilType: "Đất đỏ bazan tơi xốp giàu khoáng",
    harvestWindow: "Tháng 5 – Tháng 8 & vụ nghịch tháng 11",
    keyMetric: "Độ giòn cùi cao · Tróc hạt sạch",
    layers: [
      {
        id: "hairs",
        label: "Râu quả mảnh giữ ẩm",
        shortTag: "Đầu râu xanh",
        summary: "Đầu râu còn ánh xanh tươi là dấu hiệu quả mới cắt trong vòng 24 giờ tại vườn.",
        agriFact: "Nhà vườn Ba Tư hái buổi sáng sớm khi sương vừa tan để quả không mất nước.",
        indicator: "Độ tươi < 24 giờ sau hái",
      },
      {
        id: "shell",
        label: "Lớp vỏ đỏ thẫm",
        shortTag: "Chín đều 85–95%",
        summary: "Màu vỏ chuyển đỏ sậm đồng đều giúp giữ hương thơm nhẹ bên trong lớp cùi.",
        agriFact: "Tránh hái khi vỏ còn quá xanh vì cùi sẽ chua và khó tróc vỏ lụa quanh hạt.",
        indicator: "Chín cây tự nhiên",
      },
      {
        id: "aril",
        label: "Thịt quả trắng giòn (Áo hạt)",
        shortTag: "Ngọt 16°–18° Brix",
        summary: "Cùi dày, giòn sật, ráo nước và tách rời hoàn toàn khỏi lớp vỏ hạt khi ăn.",
        agriFact: "Bón phân hữu cơ ủ hoai mục kết hợp tủ gốc rơm giữ ẩm giúp cùi dày hơn.",
        indicator: "Giòn ráo · Tróc hạt",
      },
    ],
  },
  cashew: {
    id: "cashew",
    title: "Hạt điều rang củi giữ vỏ lụa",
    regionLabel: "Phường Xuân Lộc, Bình Phước, Đak Nhau",
    soilType: "Đất đỏ bazan vùng đồi Đông Nam Bộ",
    harvestWindow: "Tháng 2 – Tháng 4 (Vụ khô ráo)",
    keyMetric: "Size A / W240 · Nhân nguyên > 95%",
    layers: [
      {
        id: "pseudo",
        label: "Quả giả (Đào lộn hột)",
        shortTag: "Cuống phình mọng",
        summary: "Phần cuống phình to chứa nhiều nước và vitamin C, dùng làm siro hoặc nước ép lên men.",
        agriFact: "Chờ trái rụng tự nhiên xuống nền vườn sạch giúp hạt thật đạt độ chắc tối ưu.",
        indicator: "Phụ phẩm chế biến nước ép",
      },
      {
        id: "shell",
        label: "Vỏ cứng chứa nhựa điều (CNSL)",
        shortTag: "Bảo vệ nhân",
        summary: "Lớp vỏ hạt thật rất cứng và chứa tinh dầu vỏ điều cần xử lý chuẩn kỹ thuật khi bóc vỏ.",
        agriFact: "Không bóc vỏ sống bằng tay; áp dụng hấp hơi hoặc rang củi kiểm soát nhiệt.",
        indicator: "Xử lý nhiệt an toàn",
      },
      {
        id: "testa",
        label: "Lớp vỏ lụa nâu tự nhiên",
        shortTag: "Giữ hương & chống ẩm",
        summary: "Lớp áo mỏng màu nâu sậm bảo vệ nhân điều khỏi oxy hóa và giữ mùi thơm đặc trưng.",
        agriFact: "Rang muối nguyên vỏ lụa giúp hạn chế dầu muối thấm sâu gây gắt dầu.",
        indicator: "Rang muối vừa 1,2%",
      },
      {
        id: "kernel",
        label: "Nhân điều trắng ngà béo bùi",
        shortTag: "2 lá mầm nguyên vẹn",
        summary: "Nhân chắc, độ ẩm dưới 4%, vị bùi thanh tự nhiên và giàu chất béo không bão hòa.",
        agriFact: "Gắn QR theo từng mẻ rang giúp tra rõ ngày phơi hạt và ngày đóng hũ.",
        indicator: "Độ ẩm < 4% · Giòn bùi",
      },
    ],
  },
  durian: {
    id: "durian",
    title: "Sầu riêng Ri6 & Dona cơm vàng",
    regionLabel: "Xã Cẩm Mỹ, Xã Định Quán, Phường Hàng Gòn",
    soilType: "Đất bazan thoát nước tốt trên triền đồi",
    harvestWindow: "Tháng 5 – Tháng 7 & vụ nghịch rải vụ",
    keyMetric: "Hạt lép · Cơm ráo mịn",
    layers: [
      {
        id: "spines",
        label: "Vỏ gai tháp đều & Cuống tươi",
        shortTag: "Gai nở tròn",
        summary: "Gai sầu riêng mở rộng và có tiếng gõ đanh chắc báo hiệu trái đã đủ tuổi thu hoạch.",
        agriFact: "Ghi nhật ký ngày đậu hoa giúp ước lượng tuổi trái chính xác 105–115 ngày.",
        indicator: "Đủ tuổi ~110 ngày sau đậu hoa",
      },
      {
        id: "flesh",
        label: "Múi cơm vàng ráo béo dịu",
        shortTag: "Tỷ lệ cơm > 32%",
        summary: "Thịt quả màu vàng nghệ tự nhiên, mịn dẻo không sượng nước, thơm dịu không gắt.",
        agriFact: "Kiểm soát tưới trước thu hoạch 14 ngày là bí quyết chống sượng cơm hiệu quả.",
        indicator: "Cơm vàng đậm · Hạt lép",
      },
      {
        id: "aroma",
        label: "Vách múi & Cuống thông khí",
        shortTag: "Mở múi theo rãnh",
        summary: "Rãnh nứt tự nhiên dọc thân quả giúp người mua tách múi gọn mà không nát cơm.",
        agriFact: "Quét QR trên cuống trái xem được lịch bón phân hữu cơ và ngày hái tại vườn.",
        indicator: "Truy xuất QR gắn cuống",
      },
    ],
  },
};

interface ProduceAnatomy2DProps {
  initialProduce?: ProduceAnatomyId;
  allowSwitch?: boolean;
  className?: string;
}

export function ProduceAnatomy2D({
  initialProduce = "pomelo",
  allowSwitch = true,
  className,
}: ProduceAnatomy2DProps) {
  const [selectedProduce, setSelectedProduce] = useState<ProduceAnatomyId>(initialProduce);
  const spec = PRODUCE_SPECS[selectedProduce];
  const [activeLayerId, setActiveLayerId] = useState<string>(spec.layers[0].id);

  const currentLayer =
    spec.layers.find((layer) => layer.id === activeLayerId) ?? spec.layers[0];

  const handleSelectProduce = (id: ProduceAnatomyId) => {
    setSelectedProduce(id);
    setActiveLayerId(PRODUCE_SPECS[id].layers[0].id);
  };

  return (
    <section
      aria-label="Sơ đồ cấu tạo nông sản 2D tương tác"
      className={cn(
        "rounded-[18px] border border-[#D6DED2] bg-white p-5 shadow-[0_2px_8px_rgba(37,53,43,0.05)] md:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAEFE6] pb-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-semibold text-[#245B3D]">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thẻ giải phẫu nông sản 2D · Dễ đọc trên mọi thiết bị</span>
          </p>
          <h3 className="mt-2 font-editorial text-xl font-bold text-[#25352B]">
            {spec.title}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#52645A]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
              {spec.regionLabel}
            </span>
            <span>· {spec.soilType}</span>
          </p>
        </div>

        {allowSwitch ? (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Chọn nông sản Đồng Nai">
            {(Object.keys(PRODUCE_SPECS) as ProduceAnatomyId[]).map((id) => {
              const active = id === selectedProduce;
              const shortNames: Record<ProduceAnatomyId, string> = {
                pomelo: "Bưởi Tân Triều",
                rambutan: "Chôm chôm",
                cashew: "Hạt điều",
                durian: "Sầu riêng",
              };
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectProduce(id)}
                  className={cn(
                    "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
                    active
                      ? "bg-[#245B3D] text-white"
                      : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                  )}
                >
                  {shortNames[id]}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Clean 2D cross-section SVG diagram */}
        <div className="flex flex-col justify-between rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-5 lg:col-span-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#52645A]">
            <span>Mặt cắt trực quan 2D</span>
            <span className="rounded-full bg-[#FFF2D8] px-2.5 py-0.5 font-semibold text-[#80520C]">
              {spec.keyMetric}
            </span>
          </div>

          <div className="my-4 flex items-center justify-center">
            <svg
              viewBox="0 0 280 220"
              className="h-auto w-full max-w-[280px]"
              role="img"
              aria-label={`Sơ đồ mặt cắt ${spec.title}`}
            >
              <rect x="0" y="0" width="280" height="220" rx="18" fill="#F5F3E9" />
              {/* Outer ring / layer 0 */}
              <circle
                cx="132"
                cy="112"
                r="84"
                fill={selectedProduce === "cashew" ? "#8C5A32" : selectedProduce === "rambutan" ? "#B83B2B" : "#2D6A44"}
                stroke={activeLayerId === spec.layers[0].id ? "#D7A34D" : "#1D442B"}
                strokeWidth={activeLayerId === spec.layers[0].id ? "4" : "1.5"}
                className="cursor-pointer transition-all"
                onClick={() => setActiveLayerId(spec.layers[0].id)}
              />
              {/* Middle ring / layer 1 */}
              <circle
                cx="132"
                cy="112"
                r="67"
                fill={selectedProduce === "cashew" ? "#D6B18A" : selectedProduce === "durian" ? "#E8D8A0" : "#F6F2DC"}
                stroke={activeLayerId === spec.layers[1].id ? "#245B3D" : "#C9CEBE"}
                strokeWidth={activeLayerId === spec.layers[1].id ? "3.5" : "1"}
                className="cursor-pointer transition-all"
                onClick={() => setActiveLayerId(spec.layers[1].id)}
              />
              {/* Core flesh / layer 2 */}
              <circle
                cx="132"
                cy="112"
                r="50"
                fill={
                  selectedProduce === "pomelo"
                    ? "#DF6A62"
                    : selectedProduce === "durian"
                    ? "#F2C652"
                    : selectedProduce === "rambutan"
                    ? "#FAF6EC"
                    : "#F3E5C8"
                }
                stroke={activeLayerId === (spec.layers[2]?.id ?? spec.layers[1].id) ? "#245B3D" : "#D6DED2"}
                strokeWidth={activeLayerId === (spec.layers[2]?.id ?? spec.layers[1].id) ? "3.5" : "1"}
                className="cursor-pointer transition-all"
                onClick={() => setActiveLayerId((spec.layers[2] ?? spec.layers[1]).id)}
              />
              {/* Segment lines for pomelo/durian */}
              {selectedProduce === "pomelo" || selectedProduce === "durian" ? (
                <g stroke="#FAF6EA" strokeWidth="2" opacity="0.8">
                  <line x1="132" y1="62" x2="132" y2="162" />
                  <line x1="82" y1="112" x2="182" y2="112" />
                  <line x1="97" y1="77" x2="167" y2="147" />
                  <line x1="167" y1="77" x2="97" y2="147" />
                </g>
              ) : null}
              {/* Inner core / layer 3 or 2 */}
              <ellipse
                cx="132"
                cy="112"
                rx={selectedProduce === "cashew" ? "26" : "18"}
                ry={selectedProduce === "cashew" ? "18" : "22"}
                fill={selectedProduce === "cashew" ? "#EFE2C8" : "#F5ECCD"}
                stroke={
                  activeLayerId === (spec.layers[3]?.id ?? spec.layers[spec.layers.length - 1].id)
                    ? "#245B3D"
                    : "#B2AA8E"
                }
                strokeWidth="2.5"
                className="cursor-pointer transition-all"
                onClick={() =>
                  setActiveLayerId(spec.layers[spec.layers.length - 1].id)
                }
              />
              {/* Leaf top accent */}
              <path
                d="M132 26 C150 12, 182 14, 192 30 C176 42, 148 40, 132 26 Z"
                fill="#6C9C5B"
                stroke="#245B3D"
                strokeWidth="1.5"
              />
              <text x="14" y="206" fontSize="11" fill="#52645A" fontWeight="600">
                Bấm trực tiếp vào từng lớp để xem đặc tính canh tác
              </text>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E8DD] pt-3 text-xs text-[#52645A]">
            <span className="inline-flex items-center gap-1 font-medium text-[#245B3D]">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              Mùa vụ: {spec.harvestWindow}
            </span>
          </div>
        </div>

        {/* Interactive layer cards & agricultural rationale */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-7">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {spec.layers.map((layer, index) => {
              const selected = layer.id === currentLayer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    "flex flex-col items-start rounded-[14px] border p-3.5 text-left transition",
                    selected
                      ? "border-[#245B3D] bg-[#EAF0E5] shadow-[0_2px_8px_rgba(36,91,61,0.1)]"
                      : "border-[#D6DED2] bg-white hover:border-[#6C9C5B]",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#245B3D]">
                      Lớp {index + 1} · {layer.shortTag}
                    </span>
                    {selected ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
                    ) : null}
                  </div>
                  <span className="mt-1 text-sm font-bold text-[#25352B]">
                    {layer.label}
                  </span>
                  <span className="mt-1 text-xs font-medium text-[#52645A]">
                    {layer.indicator}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B3D]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {currentLayer.label}
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[#25352B] border border-[#D6DED2]">
                {currentLayer.shortTag}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#25352B]">
              {currentLayer.summary}
            </p>
            <p className="mt-2 rounded-[10px] bg-white px-3 py-2 text-xs leading-relaxed text-[#52645A] border border-[#E5EAE0]">
              <strong className="text-[#245B3D]">Kiến thức canh tác & tiêu dùng:</strong>{" "}
              {currentLayer.agriFact}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
