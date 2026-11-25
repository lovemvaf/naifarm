"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Layers, Leaf, MapPin, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/format";
import type { AnatomyKind } from "@/types/naifarm";

export type ProduceAnatomyId = AnatomyKind;

interface AnatomyLayer {
  id: string;
  labelVi: string;
  labelEn: string;
  shortTagVi: string;
  shortTagEn: string;
  summaryVi: string;
  summaryEn: string;
  agriFactVi: string;
  agriFactEn: string;
  indicatorVi: string;
  indicatorEn: string;
  pinX: number;
  pinY: number;
}

interface ProduceAnatomySpec {
  id: ProduceAnatomyId;
  shortVi: string;
  shortEn: string;
  titleVi: string;
  titleEn: string;
  regionVi: string;
  regionEn: string;
  soilVi: string;
  soilEn: string;
  harvestVi: string;
  harvestEn: string;
  keyMetricVi: string;
  keyMetricEn: string;
  safetyNoteVi?: string;
  safetyNoteEn?: string;
  layers: AnatomyLayer[];
}

const PRODUCE_SPECS: Record<ProduceAnatomyId, ProduceAnatomySpec> = {
  pomelo: {
    id: "pomelo",
    shortVi: "Bưởi",
    shortEn: "Pomelo",
    titleVi: "Bưởi da xanh & Bưởi đường lá cam",
    titleEn: "Tan Trieu Green-Skin & Orange-Leaf Pomelo",
    regionVi: "Phường Tân Triều, Thành phố Đồng Nai",
    regionEn: "Tan Trieu Ward, Dong Nai City",
    soilVi: "Đất phù sa cổ ven sông Đồng Nai",
    soilEn: "Ancient riverside alluvial soil",
    harvestVi: "Tháng 8 – Tháng 12 & vụ Tết",
    harvestEn: "Aug – Dec & Tet season",
    keyMetricVi: "11,0° – 12,4° Brix",
    keyMetricEn: "11.0° – 12.4° Brix",
    layers: [
      {
        id: "rind",
        labelVi: "Lớp vỏ xanh & túi tinh dầu",
        labelEn: "Green Oil-Gland Rind",
        shortTagVi: "Vỏ ~1,2 cm",
        shortTagEn: "Rind ~1.2 cm",
        summaryVi: "Túi tinh dầu dày bảo vệ quả tự nhiên 10–14 ngày ở nhiệt độ thoáng mát.",
        summaryEn: "Dense essential-oil glands naturally protect moisture for 10–14 cool days.",
        agriFactVi: "Phụ phẩm vỏ bưởi sạch được tận dụng chưng cất tinh dầu hoặc nấu mứt vỏ bưởi.",
        agriFactEn: "Clean peel by-products are distilled for essential oil or candied peel jam.",
        indicatorVi: "Tinh dầu thơm · Bảo quản tự nhiên",
        indicatorEn: "High citrus oil · Natural shelf life",
        pinX: 300,
        pinY: 64,
      },
      {
        id: "pith",
        labelVi: "Lớp cùi trắng xốp (Albedo)",
        labelEn: "Spongy White Pith (Albedo)",
        shortTagVi: "Đệm giảm chấn",
        shortTagEn: "Shock absorber",
        summaryVi: "Lớp cùi trắng vừa phải giúp bảo vệ múi quả không dập khi vận chuyển.",
        summaryEn: "Even white albedo cushions the segments against transport bruising.",
        agriFactVi: "Giàu pectin thực phẩm; nông hộ chế biến thành chè bưởi truyền thống.",
        agriFactEn: "Rich in food-grade pectin used for traditional pomelo dessert.",
        indicatorVi: "Giảm dập nát · Giàu Pectin",
        indicatorEn: "Low bruising · Rich in Pectin",
        pinX: 280,
        pinY: 112,
      },
      {
        id: "segments",
        labelVi: "Tép bưởi hồng mọng ráo nước",
        labelEn: "Juicy Dry-Firm Pink Segments",
        shortTagVi: "11–13 múi đều",
        shortTagEn: "11–13 segments",
        summaryVi: "Tép ráo, bóc tách dễ dàng, vị ngọt thanh hậu dịu đặc trưng phù sa cù lao.",
        summaryEn: "Firm juice vesicles separate cleanly with balanced alluvial sweetness.",
        agriFactVi: "Cân đối Kali hữu cơ giúp giảm tỷ lệ sượng khô đầu cuống.",
        agriFactEn: "Balanced organic potassium minimizes granulation near the stem.",
        indicatorVi: "11,8° Brix · Vitamin C cao",
        indicatorEn: "11.8° Brix · Vitamin C rich",
        pinX: 225,
        pinY: 165,
      },
      {
        id: "seed",
        labelVi: "Lõi trung tâm & hạt lép",
        labelEn: "Center Core & Small Seeds",
        shortTagVi: "Thịt quả ~62%",
        shortTagEn: "~62% edible flesh",
        summaryVi: "Quả đạt chuẩn vườn Tân Triều có lõi đặc, ít hạt hoặc hạt lép tự nhiên.",
        summaryEn: "Selected orchard lots feature compact core and very few seeds.",
        agriFactVi: "Nhật ký bón phân & ngày hái được gắn trực tiếp lên mã QR từng rổ.",
        agriFactEn: "Fertilizer and harvest dates map directly to each batch QR code.",
        indicatorVi: "Tỷ lệ thịt quả cao",
        indicatorEn: "High flesh-to-rind ratio",
        pinX: 200,
        pinY: 150,
      },
    ],
  },
  rambutan: {
    id: "rambutan",
    shortVi: "Chôm chôm",
    shortEn: "Rambutan",
    titleVi: "Chôm chôm Java & Chôm chôm Nhãn",
    titleEn: "Long Khanh Java & Longan Rambutan",
    regionVi: "Phường Long Khánh & Bình Lộc, Đồng Nai",
    regionEn: "Long Khanh & Binh Loc Wards, Dong Nai",
    soilVi: "Đất đỏ bazan tơi xốp giàu khoáng",
    soilEn: "Mineral-rich volcanic basalt red soil",
    harvestVi: "Tháng 5 – Tháng 8 & vụ nghịch tháng 11",
    harvestEn: "May – Aug & Nov off-season",
    keyMetricVi: "Tróc hạt · Tươi < 24h",
    keyMetricEn: "Freestone · < 24h fresh",
    layers: [
      {
        id: "hairs",
        labelVi: "Râu quả mảnh ngả xanh đầu râu",
        labelEn: "Flexible Spinterns with Green Tips",
        shortTagVi: "Độ tươi sau cắt",
        shortTagEn: "Freshness cue",
        summaryVi: "Đầu râu còn xanh tươi báo hiệu chùm quả mới cắt trong ngày.",
        summaryEn: "Bright green spintern tips signal same-day morning harvest.",
        agriFactVi: "Thu hái lúc sáng sớm để giữ ẩm và hạn chế thâm đầu râu.",
        agriFactEn: "Morning harvesting preserves turgor pressure and color.",
        indicatorVi: "Thu hoạch sáng sớm",
        indicatorEn: "Early morning harvest",
        pinX: 308,
        pinY: 88,
      },
      {
        id: "skin",
        labelVi: "Lớp vỏ đỏ hồng bền nhiệt",
        labelEn: "Red-Rose Leathery Pericarp",
        shortTagVi: "Chín đỏ 80–90%",
        shortTagEn: "80–90% red ripeness",
        summaryVi: "Vỏ dày vừa giúp giảm thoát ẩm khi vận chuyển ngắn trong ngày.",
        summaryEn: "Protective shell prevents dehydration during regional cold transport.",
        agriFactVi: "Không ngâm hóa chất giữ màu; bảo quản mát 10–12°C trong giỏ thoáng.",
        agriFactEn: "No synthetic dye washes; stored cool at 10–12°C in ventilated crates.",
        indicatorVi: "Không nhuộm màu",
        indicatorEn: "No artificial color",
        pinX: 280,
        pinY: 138,
      },
      {
        id: "flesh",
        labelVi: "Cùi trắng trong giòn ngọt",
        labelEn: "Crisp Translucent Aril",
        shortTagVi: "Giòn ráo tróc hạt",
        shortTagEn: "Crisp freestone pulp",
        summaryVi: "Cơm dày, giòn thanh, vị ngọt đậm nhờ nền bazan giàu kali.",
        summaryEn: "Dense translucent aril separates crisply without excess drip.",
        agriFactVi: "Chủ vườn Ba Tư phân loại cỡ A ngay tại vườn trước khi đóng túi lưới.",
        agriFactEn: "Graded Grade-A at the orchard before ventilated mesh packing.",
        indicatorVi: "18–20° Brix",
        indicatorEn: "18–20° Brix",
        pinX: 230,
        pinY: 158,
      },
      {
        id: "stone",
        labelVi: "Hạt tróc không bám cùi",
        labelEn: "Clean Freestone Seed Coat",
        shortTagVi: "Róc lụa sạch",
        shortTagEn: "Clean separation",
        summaryVi: "Giống Java & Nhãn đạt chuẩn cho cảm giác róc hạt sạch, không lợn cợn.",
        summaryEn: "Clean testa peel keeps each bite smooth without papery seed skin.",
        agriFactVi: "Gắn QR NF-DEMO-001 giúp người mua xem ngày hái từng đợt.",
        agriFactEn: "Batch QR NF-DEMO-001 lets buyers confirm exact harvest window.",
        indicatorVi: "Tróc hạt tự nhiên",
        indicatorEn: "Natural freestone trait",
        pinX: 200,
        pinY: 150,
      },
    ],
  },
  durian: {
    id: "durian",
    shortVi: "Sầu riêng",
    shortEn: "Durian",
    titleVi: "Sầu riêng Ri6 & Monthong Đồng Nai",
    titleEn: "Dong Nai Ri6 & Monthong Durian",
    regionVi: "Phường Long Khánh & Xã Cẩm Mỹ, Đồng Nai",
    regionEn: "Long Khanh Ward & Cam My Commune",
    soilVi: "Đất đỏ bazan thoát nước tốt",
    soilEn: "Well-drained volcanic basalt hills",
    harvestVi: "Tháng 4 – Tháng 8",
    harvestEn: "Apr – Aug main crop",
    keyMetricVi: "Tỷ lệ cơm > 32%",
    keyMetricEn: "> 32% flesh ratio",
    layers: [
      {
        id: "spines",
        labelVi: "Gai kim tự tháp nở đầu",
        labelEn: "Pyramidal Ripe Spines",
        shortTagVi: "Dấu hiệu chín cây",
        shortTagEn: "Tree-ripened cue",
        summaryVi: "Khoảng cách gai nở rộng đều và cuống tươi chắc là dấu hiệu chín già.",
        summaryEn: "Widened spine spacing and firm peduncle indicate full maturity.",
        agriFactVi: "Thợ cắt gõ kiểm âm từng quả trước khi hạ từ cành xuống đệm lót.",
        agriFactEn: "Acoustic tapping confirms full cavity maturity before lowering from branch.",
        indicatorVi: "Thu hoạch đủ tuổi ≥ 85%",
        indicatorEn: "≥ 85% harvest maturity",
        pinX: 302,
        pinY: 75,
      },
      {
        id: "locule",
        labelVi: "Rãnh múi & Vách chia hộc",
        labelEn: "5-Carpel Seam & White Wall",
        shortTagVi: "Hộc tròn đều",
        shortTagEn: "Symmetric locules",
        summaryVi: "5 rãnh vách rõ nét giúp tách múi dễ dàng mà không làm nát phần cơm.",
        summaryEn: "Defined 5-carpel seams allow clean hand splitting along natural lines.",
        agriFactVi: "Thụ phấn bổ sung tự nhiên cho số hộc đều 4–5 hộc đầy.",
        agriFactEn: "Balanced pollination yields 4–5 uniformly filled compartments.",
        indicatorVi: "Tách múi dễ dàng",
        indicatorEn: "Clean seam opening",
        pinX: 270,
        pinY: 120,
      },
      {
        id: "aril",
        labelVi: "Múi cơm vàng nghệ ráo dẻo",
        labelEn: "Golden Creamy Dry-Rich Pulp",
        shortTagVi: "Vàng đậm · Không sượng",
        shortTagEn: "Rich gold · Non-watery",
        summaryVi: "Cơm dẻo mịn, ráo tay, béo bùi hậu ngọt không gắt cổ.",
        summaryEn: "Velvety golden aril with clean dry surface and rich nutty finish.",
        agriFactVi: "Ngưng tưới kiểm soát ẩm 14 ngày trước cắt giúp chống sượng cơm hiệu quả.",
        agriFactEn: "Controlled pre-harvest moisture prevents uneven watery flesh.",
        indicatorVi: "Cơm ráo mịn",
        indicatorEn: "Dry creamy texture",
        pinX: 224,
        pinY: 162,
      },
      {
        id: "seed",
        labelVi: "Hạt lép & Cuống QR lô",
        labelEn: "Small Seed & Batch QR Tie",
        shortTagVi: "Hạt lép dẹp",
        shortTagEn: "Flat aborted seed",
        summaryVi: "Hạt lép dẹp giúp gia tăng tối đa phần cơm vàng trên mỗi hộc.",
        summaryEn: "High ratio of flat seeds maximizes edible golden aril volume.",
        agriFactVi: "Mỗi cuống quả gắn tem QR ghi ngày hái và vườn nguồn gốc.",
        agriFactEn: "Individual stem QR links harvest date and orchard origin.",
        indicatorVi: "Định danh từng trái",
        indicatorEn: "Per-fruit QR tag",
        pinX: 200,
        pinY: 150,
      },
    ],
  },
  cashew: {
    id: "cashew",
    shortVi: "Hạt điều",
    shortEn: "Cashew",
    titleVi: "Hạt điều rang củi Xuân Lộc & An toàn CNSL",
    titleEn: "Xuan Loc Roasted Cashew & CNSL Safety",
    regionVi: "Phường Xuân Lộc & vùng Bình Phước cũ",
    regionEn: "Xuan Loc & Dong Nai Basalt Belt",
    soilVi: "Đất đỏ bazan cao độ trung bình",
    soilEn: "Highland red basalt loam",
    harvestVi: "Tháng 2 – Tháng 5",
    harvestEn: "Feb – May dry season",
    keyMetricVi: "Nhân W240/A+ · Rang nhiệt chuẩn",
    keyMetricEn: "W240 Grade · Safe thermal roast",
    safetyNoteVi:
      "Cảnh báo an toàn CNSL: Lớp vỏ cứng giữa của hạt điều tươi chứa nhựa phenolic (Anacardic acid / Cardol) gây kích ứng/bỏng da nếu bóc sống bằng tay không. Phải qua hấp/rang nhiệt đạt chuẩn mới ăn trực tiếp.",
    safetyNoteEn:
      "CNSL Safety Warning: Raw cashew shells contain caustic phenolic oil (anacardic acid & cardol). Never crack or eat raw wild cashews by hand — proper thermal roasting neutralizes sap safely.",
    layers: [
      {
        id: "shell",
        labelVi: "Vỏ cứng & khoang nhựa CNSL (cần xử lý nhiệt)",
        labelEn: "Outer Shell & CNSL Resin Layer (Heat Treated)",
        shortTagVi: "Nhựa nóng rát · Phải rang/hấp",
        shortTagEn: "Contains CNSL sap · Heat required",
        summaryVi: "Khoang xốp giữa hai lớp vỏ chứa dầu vỏ hạt điều (CNSL) gây rát da khi chưa chế biến.",
        summaryEn: "Honeycomb mesocarp holds caustic CNSL oil before thermal treatment.",
        agriFactVi: "Làng nghề Xuân Lộc rang củi hoặc hấp hơi cao áp để tách sạch dầu vỏ trước khi ăn.",
        agriFactEn: "Artisan wood-roasting & steam processing safely neutralize shell resin.",
        indicatorVi: "An toàn nhiệt đạt chuẩn",
        indicatorEn: "Thermally neutralized",
        pinX: 295,
        pinY: 74,
      },
      {
        id: "testa",
        labelVi: "Lớp vỏ lụa nâu bảo vệ nhân",
        labelEn: "Crisp Thin Brown Testa",
        shortTagVi: "Giữ giòn & chống ẩm",
        shortTagEn: "Protects crunch",
        summaryVi: "Vỏ lụa mỏng giữ hương thơm rang củi tự nhiên và bảo vệ nhân khỏi oxy hóa.",
        summaryEn: "Natural thin husk locks in wood-roasted aroma and slows oxidation.",
        agriFactVi: "Sau rang muối vỏ lụa, vỏ lụa tróc giòn giúp người ăn bóc tách rất sạch.",
        agriFactEn: "Salt-roasting crisps the testa for easy peeling before enjoying.",
        indicatorVi: "Rang củi giữ lụa",
        indicatorEn: "Wood-roasted in husk",
        pinX: 256,
        pinY: 118,
      },
      {
        id: "kernel",
        labelVi: "Nhân điều hình thận trắng ngà W240",
        labelEn: "Ivory Kidney Kernel (W240 Whole)",
        shortTagVi: "Bùi ngậy · Nguyên hạt",
        shortTagEn: "Rich & creamy",
        summaryVi: "Nhân mẩy nguyên hạt không gãy vụn, hàm lượng chất béo không bão hòa tự nhiên cao.",
        summaryEn: "Plump intact kernels with clean crunch and monounsaturated lipids.",
        agriFactVi: "Đóng hũ hút chân không kiểm soát độ ẩm ≤ 3.5%.",
        agriFactEn: "Vacuum-sealed under ≤ 3.5% moisture for lasting crunch.",
        indicatorVi: "Nguyên nhân ≥ 95%",
        indicatorEn: "≥ 95% whole kernels",
        pinX: 205,
        pinY: 155,
      },
      {
        id: "apple",
        labelVi: "Quả giả (Cuống đào lộn hột)",
        labelEn: "Cashew Apple (Swollen Receptacle)",
        shortTagVi: "Thịt quả phụ phẩm",
        shortTagEn: "Attached orchard fruit",
        summaryVi: "Quả giả mọng nước chỉ dùng tại chỗ trong ngày; hạt thật nằm treo ở phần đáy.",
        summaryEn: "Juicy swollen stalk holds the true kidney nut at its base tip.",
        agriFactVi: "Tái chế phụ phẩm quả điều làm phân ủ hữu cơ tại vườn.",
        agriFactEn: "Orchard apples are composted locally into organic soil mulch.",
        indicatorVi: "Hạt treo đáy quả",
        indicatorEn: "True nut at tip",
        pinX: 118,
        pinY: 96,
      },
    ],
  },
  coffee: {
    id: "coffee",
    shortVi: "Cà phê",
    shortEn: "Coffee",
    titleVi: "Cà phê Robusta thu hái trái chín Xuân Lộc",
    titleEn: "Xuan Loc Ripe-Cherry Robusta Coffee",
    regionVi: "Vùng đồi bazan Xuân Lộc & Cẩm Mỹ",
    regionEn: "Xuan Loc & Cam My Basalt Hills",
    soilVi: "Đất bazan nâu đỏ thoát nước sâu",
    soilEn: "Deep-draining red-brown basalt",
    harvestVi: "Tháng 11 – Tháng 2",
    harvestEn: "Nov – Feb harvest window",
    keyMetricVi: "Tỷ lệ trái chín > 95% · Rang mộc",
    keyMetricEn: "> 95% ripe cherry · Pure roast",
    layers: [
      {
        id: "cherry",
        labelVi: "Vỏ quả chín đỏ & lớp nhớt ngọt",
        labelEn: "Ripe Red Exocarp & Mucilage",
        shortTagVi: "Chọn trái chín đỏ",
        shortTagEn: "Ripe cherry pick",
        summaryVi: "Lớp nhớt giàu đường tự nhiên lên men kiểm soát tạo hậu vị ngọt thanh cho hạt.",
        summaryEn: "Natural sugary mucilage contributes clean sweetness during honey/washed fermentation.",
        agriFactVi: "Hái chọn từng đợt trái chín đỏ giúp giảm vị chát gắt từ hạt xanh.",
        agriFactEn: "Selective ripe picking removes astringency caused by unripe green cherries.",
        indicatorVi: "Không trộn hạt non",
        indicatorEn: "Zero unripe blending",
        pinX: 298,
        pinY: 82,
      },
      {
        id: "parchment",
        labelVi: "Vỏ trấu & vỏ lụa bạc",
        labelEn: "Parchment Hull & Silver Skin",
        shortTagVi: "Phơi giàn nâng",
        shortTagEn: "Raised-bed dried",
        summaryVi: "Vỏ thóc bảo vệ nhân xanh trong suốt quá trình phơi khô trên giàn lưới sạch.",
        summaryEn: "Protective hull guards the bean core while drying cleanly on raised beds.",
        agriFactVi: "Phơi trên bạt/giàn nâng tránh nhiễm ẩm mốc mặt đất.",
        agriFactEn: "Off-ground drying prevents earthy taint and mold.",
        indicatorVi: "Độ ẩm chuẩn 12%",
        indicatorEn: "Target 12% moisture",
        pinX: 266,
        pinY: 132,
      },
      {
        id: "endosperm",
        labelVi: "Cặp nhân hạt đối xứng (2 bán cầu)",
        labelEn: "Symmetric Paired Coffee Beans",
        shortTagVi: "Rãnh xoắn chuẩn",
        shortTagEn: "Center cut seam",
        summaryVi: "Hai nửa nhân chắc đều với rãnh thẳng/xoắn đặc trưng cà phê nguyên chất.",
        summaryEn: "Dense twin endosperm halves roast evenly for clean cocoa-nut aroma.",
        agriFactVi: "Rang mộc không tẩm bơ đậu nành hay hương liệu hóa học.",
        agriFactEn: "Pure roast with zero corn, soy, or synthetic butter additives.",
        indicatorVi: "100% Robusta nguyên chất",
        indicatorEn: "100% Pure Robusta",
        pinX: 205,
        pinY: 155,
      },
      {
        id: "roast",
        labelVi: "Túi van 1 chiều & Mã lô rang",
        labelEn: "One-Way Degassing Valve & Batch QR",
        shortTagVi: "Giữ hương tươi rang",
        shortTagEn: "Fresh aroma seal",
        summaryVi: "Van một chiều thoát khí CO2 sau rang mà không để oxy bên ngoài lọt ngược vào.",
        summaryEn: "One-way valve releases post-roast CO2 while blocking stale air ingress.",
        agriFactVi: "Quét QR trên túi để xem ngày hái và ngày rang cụ thể.",
        agriFactEn: "Scan pouch QR to check exact harvest and roast dates.",
        indicatorVi: "Truy xuất ngày rang",
        indicatorEn: "Verified roast date",
        pinX: 120,
        pinY: 204,
      },
    ],
  },
  pepper: {
    id: "pepper",
    shortVi: "Hồ tiêu",
    shortEn: "Pepper",
    titleVi: "Tiêu đen & Tiêu sọ hạt chắc Đồng Nai",
    titleEn: "Dong Nai Dense Black & White Peppercorns",
    regionVi: "Đồng Xoài, Lộc Ninh & đồi bazan Đồng Nai",
    regionEn: "Bazan Highland Pepper Belt",
    soilVi: "Đất bazan thoát nước độ cao vừa",
    soilEn: "Highland basalt ridge soil",
    harvestVi: "Tháng 1 – Tháng 4",
    harvestEn: "Jan – Apr dry harvest",
    keyMetricVi: "Dung trọng ≥ 550 g/L",
    keyMetricEn: "Density ≥ 550 g/L",
    layers: [
      {
        id: "pericarp",
        labelVi: "Vỏ ngoài nhăn đen (Tiêu đen) chứa tinh dầu",
        labelEn: "Wrinkled Outer Pericarp (Black Pepper)",
        shortTagVi: "Thơm cay tinh dầu",
        shortTagEn: "Aromatic terpenes",
        summaryVi: "Lớp vỏ nhăn giữ hàm lượng tinh dầu thơm nồng đặc trưng khi xay mới.",
        summaryEn: "Dark sun-dried pericarp holds volatile oils for bold fragrance.",
        agriFactVi: "Thu hoạch chùm tiêu chín bói giúp vỏ bám chắc và ít lép.",
        agriFactEn: "Picked when berries blush yellow-red for high kernel density.",
        indicatorVi: "Sàng sạch ≥ 550 g/L",
        indicatorEn: "Cleaned ≥ 550 g/L",
        pinX: 288,
        pinY: 88,
      },
      {
        id: "mesocarp",
        labelVi: "Lớp cùi mỏng tách sạch khi làm tiêu sọ",
        labelEn: "Removed Flesh Shell (White Pepper)",
        shortTagVi: "Ngâm nước sạch",
        shortTagEn: "Clean-water soaked",
        summaryVi: "Khi ngâm nước chảy sạch bóc lớp vỏ cùi, phần lõi bên trong tạo ra hạt tiêu trắng (tiêu sọ).",
        summaryEn: "Gentle clean-water retting removes the outer pericarp to yield ivory white pepper.",
        agriFactVi: "Không dùng hóa chất tẩy trắng clo công nghiệp.",
        agriFactEn: "Zero industrial chlorine bleaching.",
        indicatorVi: "Không chất tẩy trắng",
        indicatorEn: "Unbleached ivory natural",
        pinX: 256,
        pinY: 132,
      },
      {
        id: "piperine",
        labelVi: "Nhân hạt đặc giàu Piperine cay ấm",
        labelEn: "Dense Solid Kernel Rich in Piperine",
        shortTagVi: "Cay sâu ấm vị",
        shortTagEn: "Warm Piperine heat",
        summaryVi: "Nhân chắc mẩy không rỗng ruột, mang vị cay nồng và hậu thơm kéo dài.",
        summaryEn: "Solid starchy core delivers lingering warmth and piperine pungency.",
        agriFactVi: "Sàng tách hạt nhẹ lép để bảo đảm đồng đều độ nặng hạt.",
        agriFactEn: "Gravity winnowing removes hollow berries for uniform weight.",
        indicatorVi: "Hạt chắc không lép",
        indicatorEn: "Dense solid center",
        pinX: 205,
        pinY: 155,
      },
      {
        id: "dry",
        labelVi: "Phơi sạp lưới độ ẩm an toàn ≤ 12%",
        labelEn: "Clean Sun-Dried Safe Moisture ≤ 12%",
        shortTagVi: "Chống ẩm mốc",
        shortTagEn: "Mold-safe moisture",
        summaryVi: "Làm khô nhanh giúp giữ màu tự nhiên và hương thơm bền nhiều tháng.",
        summaryEn: "Rapid raised-rack drying prevents moisture spoilage.",
        agriFactVi: "Đóng túi zip bạc / hũ thủy tinh chống thoát tinh dầu.",
        agriFactEn: "Sealed foil pouches & glass jars retain essential oil aroma.",
        indicatorVi: "Độ ẩm ≤ 12%",
        indicatorEn: "Moisture ≤ 12%",
        pinX: 118,
        pinY: 196,
      },
    ],
  },
  cacao: {
    id: "cacao",
    shortVi: "Ca cao",
    shortEn: "Cacao",
    titleVi: "Ca cao Định Quán — Lên men thùng gỗ chuẩn vị",
    titleEn: "Dinh Quan Fermented Cacao Pods & Nibs",
    regionVi: "Xã Định Quán & Tà Lài, Thành phố Đồng Nai",
    regionEn: "Dinh Quan & Ta Lai Wards, Dong Nai",
    soilVi: "Đất phù sa xen bazan dưới tán râm",
    soilEn: "Alluvial-basalt under partial shade canopy",
    harvestVi: "Tháng 11 – Tháng 6",
    harvestEn: "Nov – Jun main harvest",
    keyMetricVi: "Lên men 6 ngày · Độ chín chuẩn",
    keyMetricEn: "6-day box fermentation",
    layers: [
      {
        id: "pod",
        labelVi: "Vỏ trái dày 10 rãnh màu hổ phách",
        labelEn: "10-Ridged Amber Cacao Pod Husk",
        shortTagVi: "Chặt tách tại vườn",
        shortTagEn: "Orchard pod crack",
        summaryVi: "Vỏ quả chín vàng cam chứa cụm hạt trắng muốt bên trong.",
        summaryEn: "Thick amber-gold pod cushions sweet pulp-coated beans.",
        agriFactVi: "Chỉ thu quả chín tự nhiên trên thân cây lâu năm.",
        agriFactEn: "Harvested ripe directly from main trunk & primary branches.",
        indicatorVi: "Trồng xen tán sinh thái",
        indicatorEn: "Agroforestry canopy",
        pinX: 304,
        pinY: 84,
      },
      {
        id: "pulp",
        labelVi: "Cơm nhầy trắng kích hoạt lên men tự nhiên",
        labelEn: "Sweet White Mucilage Pulp",
        shortTagVi: "Lên men 6 ngày",
        shortTagEn: "6-day fermentation",
        summaryVi: "Đường tự nhiên trong cơm trắng nuôi men và vi khuẩn tạo tiền chất hương socola.",
        summaryEn: "Wild yeast fermentation breaks down sugar pulp to unlock chocolate precursors.",
        agriFactVi: "Đảo đều 48 giờ/lần trong thùng gỗ sạch kiểm soát nhiệt 45–50°C.",
        agriFactEn: "Turned every 48h in wooden boxes at 45–50°C.",
        indicatorVi: "Thùng gỗ lên men chuẩn",
        indicatorEn: "Controlled wooden ferment",
        pinX: 256,
        pinY: 132,
      },
      {
        id: "cotyledon",
        labelVi: "Ngòi hạt (Nibs) nâu tím rạn nứt",
        labelEn: "Fissured Brown-Violet Cacao Nibs",
        shortTagVi: "Lên men đạt > 85%",
        shortTagEn: "> 85% well-fermented",
        summaryVi: "Khi cắt đôi thử nghiệm (cut test), hạt đạt chuẩn lên men có rãnh nâu xốp rõ.",
        summaryEn: "Cut-test reveals crisp fissured brown cotyledons with mild berry notes.",
        agriFactVi: "Giảm đắng gắt, nổi bật hương trái cây vùng nhiệt đới.",
        agriFactEn: "Clean balance of cocoa richness and tropical fruit acidity.",
        indicatorVi: "Cut-test đạt chuẩn",
        indicatorEn: "Passed cut-test ratio",
        pinX: 205,
        pinY: 162,
      },
      {
        id: "butter",
        labelVi: "Bơ ca cao tự nhiên & Bột nguyên chất",
        labelEn: "Pure Cacao Butter & Natural Powder",
        shortTagVi: "Không pha tạp",
        shortTagEn: "Pure unalkalized",
        summaryVi: "Ép lạnh giữ nguyên bơ ca cao thơm mịn phục vụ làm socola thủ công.",
        summaryEn: "Cold-pressed natural cocoa butter forms silky craft dark chocolate.",
        agriFactVi: "Sản phẩm Định Quán là điểm sáng OCOP Đồng Nai được khách quốc tế ưa chuộng.",
        agriFactEn: "Flagship Dinh Quan specialty favored by international tour guests.",
        indicatorVi: "Nguyên chất 100%",
        indicatorEn: "100% Pure Cacao",
        pinX: 118,
        pinY: 196,
      },
    ],
  },
  avocado: {
    id: "avocado",
    shortVi: "Bơ sáp",
    shortEn: "Avocado",
    titleVi: "Bơ sáp Booth 7 & Bơ 034 đồi Bà Rá",
    titleEn: "Ba Ra Hillside Booth 7 Creamy Avocado",
    regionVi: "Vùng đồi bazan phía Bắc Thành phố Đồng Nai",
    regionEn: "Northern Basalt Hills, Dong Nai City",
    soilVi: "Đất đỏ bazan tơi xốp giữ ẩm",
    soilEn: "Moist volcanic basalt red soil",
    harvestVi: "Tháng 7 – Tháng 11",
    harvestEn: "Jul – Nov harvest",
    keyMetricVi: "Chất khô > 24% · Không xơ",
    keyMetricEn: "> 24% dry matter · Fiberless",
    layers: [
      {
        id: "skin",
        labelVi: "Vỏ sần xanh dày chống dập",
        labelEn: "Textured Green Protective Skin",
        shortTagVi: "Dễ bóc sạch vỏ",
        shortTagEn: "Easy peel shell",
        summaryVi: "Vỏ hơi nhám lấm tấm vàng là dấu hiệu bơ già đủ ngày thu hái.",
        summaryEn: "Subtle golden speckling over textured skin signals tree maturity.",
        agriFactVi: "Hái quả già cây giúp bơ chín dẻo tự nhiên không bị nhăn thối cuống.",
        agriFactEn: "Mature picking ensures creamy ripening without stem-end rot.",
        indicatorVi: "Bơ già cây 100%",
        indicatorEn: "Full tree maturity",
        pinX: 296,
        pinY: 84,
      },
      {
        id: "flesh",
        labelVi: "Cơm vàng kem dẻo mịn không xơ",
        labelEn: "Golden Fiberless Creamy Flesh",
        shortTagVi: "Vàng béo đặc ruột",
        shortTagEn: "Thick golden butter",
        summaryVi: "Thịt quả dày màu vàng chanh ngả ngọc, béo ngậy giàu chất béo thực vật tốt.",
        summaryEn: "Thick velvety yellow flesh packed with heart-healthy oleic lipids.",
        agriFactVi: "Thịt bơ Booth 7 dẻo đặc hơn bơ nước, rất hợp ăn tươi hoặc chế biến.",
        agriFactEn: "Booth 7 stays firm and creamy without watery separation.",
        indicatorVi: "Độ dẻo cao · Không xơ",
        indicatorEn: "Zero stringy fibers",
        pinX: 245,
        pinY: 145,
      },
      {
        id: "seed",
        labelVi: "Hạt tròn chắc khít khoang",
        labelEn: "Compact Central Seed Pit",
        shortTagVi: "Không lỏng lắc trước hái",
        shortTagEn: "Tight pre-harvest fit",
        summaryVi: "Khoang hạt nhỏ gọn tối đa tỷ lệ thịt bơ ăn được mỗi trái.",
        summaryEn: "Compact round pit maximizes edible creamy avocado yield.",
        agriFactVi: "Đậy giấy báo mát 2–3 ngày đến khi ấn đầu cuống mềm nhẹ là ăn ngon nhất.",
        agriFactEn: "Wrap in breathable paper 2–3 days until gentle stem-tip give.",
        indicatorVi: "Tỷ lệ thịt ~72%",
        indicatorEn: "~72% flesh yield",
        pinX: 200,
        pinY: 155,
      },
      {
        id: "stem",
        labelVi: "Nút cuống xanh kín khí",
        labelEn: "Sealed Green Stem Cap",
        shortTagVi: "Giữ cuống lúc vận chuyển",
        shortTagEn: "Stem-on picking",
        summaryVi: "Giữ đoạn cuống ngắn 1 cm chống vi khuẩn xâm nhập vào khoang thịt quả.",
        summaryEn: "Keeping a 1 cm stem stub prevents post-harvest browning.",
        agriFactVi: "Bọc lưới xốp từng trái khi đóng thùng giao đi xa.",
        agriFactEn: "Individually foam-sleeved for safe parcel shipping.",
        indicatorVi: "Cắt chừa cuống 1 cm",
        indicatorEn: "1 cm protective stem",
        pinX: 200,
        pinY: 52,
      },
    ],
  },
  honey: {
    id: "honey",
    shortVi: "Mật ong",
    shortEn: "Honey",
    titleVi: "Mật ong hoa nhãn & hoa chôm chôm tự nhiên",
    titleEn: "Orchard Blossom Honey Harvesting Cycle",
    regionVi: "Xã Xuân Đường & Long Khánh, Đồng Nai",
    regionEn: "Xuan Duong & Long Khanh Canopy Belt",
    soilVi: "Vùng tán cây ăn trái hoa rộ tự nhiên",
    soilEn: "Flowering longan & rambutan canopy",
    harvestVi: "Tháng 2 – Tháng 5 mùa hoa",
    harvestEn: "Feb – May bloom harvest",
    keyMetricVi: "Thủy phần ≤ 20% · Vít nắp tự nhiên",
    keyMetricEn: "Moisture ≤ 20% · Capped comb",
    layers: [
      {
        id: "cap",
        labelVi: "Lớp sáp ong vít nắp báo mật chín",
        labelEn: "Natural Beeswax Capping (Ripe Honey)",
        shortTagVi: "Vít nắp ≥ 80% cầu",
        shortTagEn: "≥ 80% capped frame",
        summaryVi: "Ong thợ chỉ tiết sáp vít nắp khi mật đã quạt bay hơi đủ độ đặc tiêu chuẩn.",
        summaryEn: "Bees seal comb cells with wax only after fanning nectar down to ripe viscosity.",
        agriFactVi: "Không quay mật non còn loãng chưa vít nắp; giảm tối đa nguy cơ lên men.",
        agriFactEn: "Never extract uncapped watery nectar; ensures natural shelf stability.",
        indicatorVi: "Mật chín tự nhiên",
        indicatorEn: "Naturally ripened",
        pinX: 292,
        pinY: 88,
      },
      {
        id: "cell",
        labelVi: "Tổ sáp lục giác chứa mật vàng hổ phách",
        labelEn: "Hexagonal Honeycomb Cells",
        shortTagVi: "Hổ phách trong sánh",
        shortTagEn: "Clear amber nectar",
        summaryVi: "Màu hổ phách sánh mịn, mùi thơm dịu đặc trưng của hoa nhãn và hoa chôm chôm.",
        summaryEn: "Clear golden-amber honey infused with subtle orchard blossom aroma.",
        agriFactVi: "Đặt thùng ong dưới tán vườn sạch không phun thuốc trong đợt hoa nở.",
        agriFactEn: "Hives sit strictly under spray-free orchard canopies during bloom.",
        indicatorVi: "Không pha đường",
        indicatorEn: "100% pure floral",
        pinX: 225,
        pinY: 142,
      },
      {
        id: "moisture",
        labelVi: "Kiểm tra thủy phần (≤ 20%) bằng khúc xạ kế",
        labelEn: "Refractometer Moisture Check (≤ 20%)",
        shortTagVi: "Sánh đặc đạt chuẩn",
        shortTagEn: "Standard low water",
        summaryVi: "Thủy phần thấp giúp mật giữ được hương vị lâu dài ở nhiệt độ phòng.",
        summaryEn: "Low moisture level keeps honey fresh cleanly at room temperature.",
        agriFactVi: "Gắn ngày quay mật & mã vườn trên tem QR từng chai thủy tinh.",
        agriFactEn: "Extraction date and apiary location linked via bottle QR.",
        indicatorVi: "Thủy phần ≤ 20%",
        indicatorEn: "Moisture ≤ 20%",
        pinX: 196,
        pinY: 200,
      },
      {
        id: "jar",
        labelVi: "Chiết rót chai thủy tinh sạch khử trùng",
        labelEn: "Food-Grade Glass Bottling",
        shortTagVi: "An toàn thực phẩm",
        shortTagEn: "Clean glass seal",
        summaryVi: "Không gia nhiệt cao gây biến đổi enzym tự nhiên của mật hoa.",
        summaryEn: "Raw unheated filtration retains natural pollen enzymes and aroma.",
        agriFactVi: "Lưu ý bảo quản: Không dùng cho trẻ dưới 1 tuổi theo khuyến cáo dinh dưỡng.",
        agriFactEn: "Label reminder: Do not feed raw honey to infants under 12 months.",
        indicatorVi: "Lọc thô giữ enzym",
        indicatorEn: "Raw enzymatic aroma",
        pinX: 112,
        pinY: 165,
      },
    ],
  },
};

function renderProduceSvg(id: ProduceAnatomyId, layers: AnatomyLayer[], activeId: string, onPick: (id: string) => void) {
  switch (id) {
    case "pomelo":
      return (
        <g>
          <circle cx="200" cy="150" r="102" fill="#2D6A44" stroke={activeId === "rind" ? "#D7A34D" : "#19472E"} strokeWidth={activeId === "rind" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("rind")} />
          <circle cx="200" cy="150" r="85" fill="#F6F2DC" stroke={activeId === "pith" ? "#245B3D" : "#C9CEBE"} strokeWidth={activeId === "pith" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("pith")} />
          <circle cx="200" cy="150" r="66" fill="#E36D65" stroke={activeId === "segments" ? "#245B3D" : "#D6DED2"} strokeWidth={activeId === "segments" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("segments")} />
          <g stroke="#FAF6EA" strokeWidth="2.5" opacity="0.85" className="pointer-events-none">
            {[0, 30, 60, 90, 120, 150].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={deg} x1={200 - Math.cos(rad) * 65} y1={150 - Math.sin(rad) * 65} x2={200 + Math.cos(rad) * 65} y2={150 + Math.sin(rad) * 65} />;
            })}
          </g>
          <circle cx="200" cy="150" r="15" fill="#FAF6EC" stroke={activeId === "seed" ? "#245B3D" : "#B8C4AE"} strokeWidth={activeId === "seed" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("seed")} />
        </g>
      );
    case "rambutan":
      return (
        <g>
          <g stroke="#689F38" strokeWidth="3" strokeLinecap="round" className="cursor-pointer" onClick={() => onPick("hairs")}>
            {Array.from({ length: 24 }, (_, idx) => {
              const a = (idx / 24) * Math.PI * 2;
              return <line key={idx} x1={200 + Math.cos(a) * 84} y1={150 + Math.sin(a) * 84} x2={200 + Math.cos(a) * 110} y2={150 + Math.sin(a) * 110} />;
            })}
          </g>
          <circle cx="200" cy="150" r="88" fill="#B83B2B" stroke={activeId === "skin" ? "#D7A34D" : "#7F2014"} strokeWidth={activeId === "skin" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("skin")} />
          <circle cx="200" cy="150" r="68" fill="#FAF6EC" stroke={activeId === "flesh" ? "#245B3D" : "#D6DED2"} strokeWidth={activeId === "flesh" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("flesh")} />
          <ellipse cx="200" cy="150" rx="28" ry="20" fill="#B38654" stroke={activeId === "stone" ? "#245B3D" : "#754E2A"} strokeWidth={activeId === "stone" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("stone")} />
        </g>
      );
    case "durian":
      return (
        <g>
          <polygon
            points={Array.from({ length: 20 }, (_, i) => {
              const r = i % 2 === 0 ? 112 : 90;
              const a = (i / 20) * Math.PI * 2;
              return `${(200 + Math.cos(a) * r).toFixed(1)},${(150 + Math.sin(a) * r).toFixed(1)}`;
            }).join(" ")}
            fill="#5C7A3E"
            stroke={activeId === "spines" ? "#D7A34D" : "#384E22"}
            strokeWidth={activeId === "spines" ? 4.5 : 2}
            className="cursor-pointer"
            onClick={() => onPick("spines")}
          />
          <circle cx="200" cy="150" r="82" fill="#E8DFC5" stroke={activeId === "locule" ? "#245B3D" : "#C9CEBE"} strokeWidth={activeId === "locule" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("locule")} />
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 200 + Math.cos(rad) * 44;
            const cy = 150 + Math.sin(rad) * 44;
            return <ellipse key={deg} cx={cx} cy={cy} rx="24" ry="18" fill="#F2C652" stroke={activeId === "aril" ? "#245B3D" : "#B8841E"} strokeWidth={activeId === "aril" ? 3.5 : 1.2} className="cursor-pointer" onClick={() => onPick("aril")} />;
          })}
          <circle cx="200" cy="150" r="16" fill="#FAF8F1" stroke={activeId === "seed" ? "#245B3D" : "#C9CEBE"} strokeWidth={activeId === "seed" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("seed")} />
        </g>
      );
    case "cashew":
      return (
        <g>
          {/* Cashew Apple */}
          <path d="M72 72 Q145 55 150 112 Q148 158 100 156 Q62 146 72 72 Z" fill="#E59A38" stroke={activeId === "apple" ? "#245B3D" : "#B46D17"} strokeWidth={activeId === "apple" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("apple")} />
          {/* Kidney nut shell */}
          <path d="M168 135 C185 82 282 72 308 134 C324 176 286 226 244 218 C215 212 212 182 186 184 C162 186 154 162 168 135 Z" fill="#6F4423" stroke={activeId === "shell" ? "#D7A34D" : "#442610"} strokeWidth={activeId === "shell" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("shell")} />
          {/* Testa husk */}
          <path d="M180 140 C194 98 270 90 292 140 C304 170 274 208 242 202 C222 198 216 174 196 174 C178 174 172 156 180 140 Z" fill="#C99E6B" stroke={activeId === "testa" ? "#245B3D" : "#8C6239"} strokeWidth={activeId === "testa" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("testa")} />
          {/* Kernel */}
          <path d="M192 144 C204 114 256 108 274 144 C284 166 260 192 238 188 C222 184 218 164 202 166 C190 166 186 156 192 144 Z" fill="#FAF0D7" stroke={activeId === "kernel" ? "#245B3D" : "#D6C098"} strokeWidth={activeId === "kernel" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("kernel")} />
        </g>
      );
    case "coffee":
      return (
        <g>
          <ellipse cx="200" cy="148" rx="96" ry="86" fill="#A62B2B" stroke={activeId === "cherry" ? "#D7A34D" : "#6E1919"} strokeWidth={activeId === "cherry" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("cherry")} />
          <ellipse cx="200" cy="148" rx="76" ry="68" fill="#E9D6A5" stroke={activeId === "parchment" ? "#245B3D" : "#B8A06A"} strokeWidth={activeId === "parchment" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("parchment")} />
          <path d="M196 90 A52 58 0 0 0 196 206 Z" fill="#7D9168" stroke={activeId === "endosperm" ? "#245B3D" : "#4E5F3E"} strokeWidth={activeId === "endosperm" ? 3.5 : 1.5} className="cursor-pointer" onClick={() => onPick("endosperm")} />
          <path d="M204 90 A52 58 0 0 1 204 206 Z" fill="#7D9168" stroke={activeId === "endosperm" ? "#245B3D" : "#4E5F3E"} strokeWidth={activeId === "endosperm" ? 3.5 : 1.5} className="cursor-pointer" onClick={() => onPick("endosperm")} />
          <rect x="82" y="184" width="76" height="44" rx="10" fill="#245B3D" stroke={activeId === "roast" ? "#D7A34D" : "#19472E"} strokeWidth={activeId === "roast" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("roast")} />
          <text x="120" y="211" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">QR ROAST</text>
        </g>
      );
    case "pepper":
      return (
        <g>
          <circle cx="200" cy="150" r="94" fill="#2C2C2A" stroke={activeId === "pericarp" ? "#D7A34D" : "#111110"} strokeWidth={activeId === "pericarp" ? 5 : 2} strokeDasharray="8 4" className="cursor-pointer" onClick={() => onPick("pericarp")} />
          <circle cx="200" cy="150" r="74" fill="#8C7B65" stroke={activeId === "mesocarp" ? "#245B3D" : "#5D503F"} strokeWidth={activeId === "mesocarp" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("mesocarp")} />
          <circle cx="200" cy="150" r="54" fill="#EFE4CC" stroke={activeId === "piperine" ? "#245B3D" : "#B8A889"} strokeWidth={activeId === "piperine" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("piperine")} />
          <rect x="78" y="178" width="84" height="36" rx="10" fill="#FFF2D8" stroke={activeId === "dry" ? "#245B3D" : "#D7A34D"} strokeWidth={activeId === "dry" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("dry")} />
          <text x="120" y="200" textAnchor="middle" fill="#80520C" fontSize="11" fontWeight="bold">≤ 12% H₂O</text>
        </g>
      );
    case "cacao":
      return (
        <g>
          <ellipse cx="205" cy="150" rx="116" ry="78" fill="#B87D28" stroke={activeId === "pod" ? "#D7A34D" : "#7E5212"} strokeWidth={activeId === "pod" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("pod")} />
          <ellipse cx="205" cy="150" rx="94" ry="58" fill="#FBF7EB" stroke={activeId === "pulp" ? "#245B3D" : "#D6DED2"} strokeWidth={activeId === "pulp" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("pulp")} />
          {[148, 178, 208, 238, 262].map((cx, idx) => (
            <ellipse key={cx} cx={cx} cy={idx % 2 === 0 ? 142 : 158} rx="14" ry="20" fill="#633A2E" stroke={activeId === "cotyledon" ? "#D7A34D" : "#3E221A"} strokeWidth={activeId === "cotyledon" ? 3.5 : 1.2} className="cursor-pointer" onClick={() => onPick("cotyledon")} />
          ))}
          <rect x="78" y="178" width="86" height="36" rx="10" fill="#4B2E24" stroke={activeId === "butter" ? "#D7A34D" : "#2D1B15"} strokeWidth={activeId === "butter" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("butter")} />
          <text x="121" y="200" textAnchor="middle" fill="#FAF8F1" fontSize="11" fontWeight="bold">100% NIBS</text>
        </g>
      );
    case "avocado":
      return (
        <g>
          <rect x="193" y="34" width="14" height="24" rx="4" fill="#4B3B28" stroke={activeId === "stem" ? "#D7A34D" : "#2A2014"} strokeWidth={activeId === "stem" ? 3 : 1} className="cursor-pointer" onClick={() => onPick("stem")} />
          <path d="M200 54 C248 54 276 126 276 184 C276 232 242 260 200 260 C158 260 124 232 124 184 C124 126 152 54 200 54 Z" fill="#2A582C" stroke={activeId === "skin" ? "#D7A34D" : "#18381A"} strokeWidth={activeId === "skin" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("skin")} />
          <path d="M200 66 C240 66 264 130 264 182 C264 222 234 248 200 248 C166 248 136 222 136 182 C136 130 160 66 200 66 Z" fill="#DCE468" stroke={activeId === "flesh" ? "#245B3D" : "#B3BD3E"} strokeWidth={activeId === "flesh" ? 4 : 1.5} className="cursor-pointer" onClick={() => onPick("flesh")} />
          <circle cx="200" cy="182" r="36" fill="#7D4C29" stroke={activeId === "seed" ? "#D7A34D" : "#4E2E17"} strokeWidth={activeId === "seed" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("seed")} />
        </g>
      );
    case "honey":
    default:
      return (
        <g>
          <rect x="92" y="56" width="216" height="178" rx="18" fill="#FAF3D8" stroke={activeId === "cap" ? "#D7A34D" : "#C9A55A"} strokeWidth={activeId === "cap" ? 5 : 2} className="cursor-pointer" onClick={() => onPick("cap")} />
          {[
            [150, 108], [198, 108], [246, 108],
            [174, 150], [222, 150], [270, 150],
            [150, 192], [198, 192], [246, 192],
          ].map(([cx, cy], idx) => (
            <polygon
              key={idx}
              points={`${cx},${cy - 22} ${cx + 19},${cy - 11} ${cx + 19},${cy + 11} ${cx},${cy + 22} ${cx - 19},${cy + 11} ${cx - 19},${cy - 11}`}
              fill={idx % 3 === 0 ? "#FFF8DC" : "#E59A24"}
              stroke={activeId === "cell" ? "#245B3D" : "#B57310"}
              strokeWidth={activeId === "cell" ? 3 : 1.5}
              className="cursor-pointer"
              onClick={() => onPick("cell")}
            />
          ))}
          <rect x="64" y="146" width="96" height="40" rx="10" fill="#FFFFFF" stroke={activeId === "jar" ? "#245B3D" : "#80520C"} strokeWidth={activeId === "jar" ? 4 : 2} className="cursor-pointer" onClick={() => onPick("jar")} />
          <text x="112" y="170" textAnchor="middle" fill="#80520C" fontSize="11" fontWeight="bold">≤ 20% H₂O</text>
        </g>
      );
  }
}

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
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [selectedProduce, setSelectedProduce] = useState<ProduceAnatomyId>(initialProduce);
  const spec = PRODUCE_SPECS[selectedProduce] ?? PRODUCE_SPECS.pomelo;
  const [activeLayerId, setActiveLayerId] = useState<string>(spec.layers[0].id);

  const currentLayer =
    spec.layers.find((layer) => layer.id === activeLayerId) ?? spec.layers[0];

  const handleSelectProduce = (id: ProduceAnatomyId) => {
    setSelectedProduce(id);
    const nextSpec = PRODUCE_SPECS[id] ?? PRODUCE_SPECS.pomelo;
    setActiveLayerId(nextSpec.layers[0].id);
  };

  return (
    <section
      aria-label={isEn ? "Interactive 2D Produce Cross-Section Anatomy" : "Sơ đồ cấu tạo nông sản 2D tương tác"}
      className={cn(
        "rounded-[18px] border border-[#D6DED2] bg-white p-5 shadow-[0_2px_8px_rgba(37,53,43,0.05)] md:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAEFE6] pb-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-semibold text-[#245B3D]">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {isEn
                ? "2D Produce Anatomy Card (9 Dong Nai Crops)"
                : "Thẻ giải phẫu nông sản 2D (9 nhóm đặc sản Đồng Nai)"}
            </span>
          </p>
          <h3 className="mt-2 font-editorial text-xl font-bold text-[#25352B]">
            {isEn ? spec.titleEn : spec.titleVi}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#52645A]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
              {isEn ? spec.regionEn : spec.regionVi}
            </span>
            <span>· {isEn ? spec.soilEn : spec.soilVi}</span>
          </p>
        </div>

        {allowSwitch ? (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={isEn ? "Select produce crop" : "Chọn nông sản Đồng Nai"}>
            {(Object.keys(PRODUCE_SPECS) as ProduceAnatomyId[]).map((id) => {
              const item = PRODUCE_SPECS[id];
              const active = id === selectedProduce;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectProduce(id)}
                  className={cn(
                    "min-h-[36px] rounded-full px-3 text-xs font-semibold transition cursor-pointer",
                    active
                      ? "bg-[#245B3D] text-white"
                      : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                  )}
                >
                  {isEn ? item.shortEn : item.shortVi}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {spec.safetyNoteVi ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-[12px] border border-[#A32D2D]/40 bg-[#FDECEC] p-3.5 text-xs text-[#7A1E1E]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#A32D2D]" aria-hidden="true" />
          <p>{isEn ? spec.safetyNoteEn : spec.safetyNoteVi}</p>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Clean 2D cross-section SVG diagram with numbered clickable/keyboard hotspots */}
        <div className="flex flex-col justify-between rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-5 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#52645A]">
            <span>{isEn ? "2D Vector Cross-Section" : "Mặt cắt trực quan 2D"}</span>
            <span className="rounded-full bg-[#FFF2D8] px-2.5 py-0.5 font-semibold text-[#80520C]">
              {isEn ? spec.keyMetricEn : spec.keyMetricVi}
            </span>
          </div>

          <div
            role="region"
            aria-label={`${isEn ? "2D cross-section diagram of" : "Sơ đồ mặt cắt"} ${isEn ? spec.titleEn : spec.titleVi}`}
            className="my-4 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 400 300"
              className="h-auto w-full max-w-[360px]"
            >
              <rect x="0" y="0" width="400" height="300" rx="18" fill="#F5F3E9" />
              {renderProduceSvg(spec.id, spec.layers, activeLayerId, setActiveLayerId)}
              {/* Numbered interactive hotspots */}
              {spec.layers.map((layer, idx) => {
                const selected = layer.id === currentLayer.id;
                return (
                  <g
                    key={layer.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${idx + 1}. ${isEn ? layer.labelEn : layer.labelVi}`}
                    onClick={() => setActiveLayerId(layer.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveLayerId(layer.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <circle
                      cx={layer.pinX}
                      cy={layer.pinY}
                      r={selected ? 15 : 13}
                      fill={selected ? "#D7A34D" : "#FFFFFF"}
                      stroke="#245B3D"
                      strokeWidth="2.5"
                    />
                    <text
                      x={layer.pinX}
                      y={layer.pinY + 4}
                      textAnchor="middle"
                      fill="#25352B"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D6DED2] pt-3 text-[11px] text-[#52645A]">
            <span>{isEn ? `Season: ${spec.harvestEn}` : `Mùa vụ: ${spec.harvestVi}`}</span>
            <span className="font-semibold text-[#245B3D]">
              {isEn ? "Click or Tab 1–4 to inspect" : "Bấm số 1–4 để xem từng lớp"}
            </span>
          </div>
        </div>

        {/* Layer selection & educational details */}
        <div className="space-y-4 lg:col-span-7">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {spec.layers.map((layer, index) => {
              const selected = layer.id === currentLayer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    "flex items-center justify-between rounded-[12px] border p-3 text-left transition cursor-pointer",
                    selected
                      ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D] shadow-[0_2px_6px_rgba(36,91,61,0.12)]"
                      : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#FAF8F1]",
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <p
                      className={cn(
                        "text-[11px] font-bold",
                        selected ? "text-[#19472E]" : "text-[#44564C]",
                      )}
                    >
                      {isEn ? `Layer ${index + 1}` : `Lớp ${index + 1}`} ·{" "}
                      {isEn ? layer.shortTagEn : layer.shortTagVi}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {isEn ? layer.labelEn : layer.labelVi}
                    </p>
                  </div>
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selected ? "text-[#245B3D]" : "text-[#D6DED2]",
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <div className="rounded-[16px] border border-[#D6DED2] bg-[#FAF8F1] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <Leaf className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>{isEn ? currentLayer.labelEn : currentLayer.labelVi}</span>
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F3E9] px-3 py-1 text-xs font-semibold text-[#24603B]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {isEn ? currentLayer.indicatorEn : currentLayer.indicatorVi}
              </span>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-[#25352B]">
              {isEn ? currentLayer.summaryEn : currentLayer.summaryVi}
            </p>

            <div className="mt-3 rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs text-[#52645A]">
              <strong className="text-[#245B3D]">
                {isEn ? "Orchard & Traceability Note: " : "Thực tế nhà vườn & truy xuất: "}
              </strong>
              {isEn ? currentLayer.agriFactEn : currentLayer.agriFactVi}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
