export type MediaSourceKind =
  | "external_embed_click_to_load"
  | "external_source_link_only"
  | "owned_local_mp4";

export interface MediaAsset {
  id: string;
  kind: MediaSourceKind;
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  publisher: string;
  publishedAt: string;
  categoryKey:
    | "pomelo"
    | "tour"
    | "rambutan"
    | "honey"
    | "cashew"
    | "durian"
    | "cacao"
    | "coffee"
    | "pepper"
    | "ocop";
  rightsLabelVi: string;
  rightsLabelEn: string;
  posterImage: string;
  externalUrl: string;
  youtubeId?: string;
  localMp4Path?: string;
  localVttVi?: string;
  localVttEn?: string;
  transcriptVi?: string;
  transcriptEn?: string;
  scopeNoteVi?: string;
  scopeNoteEn?: string;
}

export interface MediaRelation {
  mediaId: string;
  targetType: "product" | "farm" | "lesson" | "tour" | "livestream";
  targetId: string;
}

const YOUTUBE_ALLOWLIST = new Set([
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
]);

export function isAllowlistedEmbedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return YOUTUBE_ALLOWLIST.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Audited Media & Documentary Story Registry (V5.08 §8.3 candidate URLs + local FFmpeg studio previews).
 * External publisher URLs are labeled candidly: never presented as seller-owned orchard footage unless matching holder,
 * and never re-hosted or downloaded.
 */
export const MEDIA_LIBRARY: MediaAsset[] = [
  {
    id: "MEDIA-YT-BUOI-TAN-TRIEU",
    kind: "external_embed_click_to_load",
    titleVi: "Ghé làng bưởi Tân Triều — Thức giấc với mùa vàng",
    titleEn: "Visiting Tan Trieu Pomelo Village — Harvest Season Feature",
    summaryVi:
      "Tư liệu truyền hình ghi lại không khí canh tác và thu hoạch tại vùng bưởi Tân Triều ven sông Đồng Nai.",
    summaryEn:
      "Broadcast feature documenting traditional orchard cultivation in Dong Nai's historic Tan Trieu pomelo cluster.",
    publisher: "YouTube · Nguồn công khai V5.08 §8.3",
    publishedAt: "2024",
    categoryKey: "pomelo",
    rightsLabelVi: "Nhúng click-to-load của nhà xuất bản (chưa giữ bản quyền tải lại)",
    rightsLabelEn: "Publisher click-to-load embed (regional reference, not seller-owned)",
    posterImage: "/images/stitch/stitch-03.jpg",
    externalUrl: "https://www.youtube.com/watch?v=POMqTeHpPPQ",
    youtubeId: "POMqTeHpPPQ",
    transcriptVi:
      "Tư liệu giới thiệu thổ nhưỡng cù lao Tân Triều, độ ngọt tự nhiên của bưởi đường lá cam và sinh kế hộ trồng bưởi.",
    transcriptEn:
      "Regional documentary covering Tan Trieu alluvial soil, orange-leaf sweet pomelo traits, and orchard livelihoods.",
  },
  {
    id: "MEDIA-YT-TOUR-LONG-KHANH",
    kind: "external_embed_click_to_load",
    titleVi: "Khát vọng mùa vàng tập 95 — Du lịch vườn trái cây Long Khánh",
    titleEn: "Long Khanh Orchard Agritourism Feature (THVL)",
    summaryVi:
      "Khám phá mô hình du lịch vườn sinh thái kết hợp thu hoạch trái cây theo mùa tại Long Khánh.",
    summaryEn:
      "Broadcast segment showcasing seasonal orchard agritourism and farm-gate tasting experiences in Long Khanh.",
    publisher: "Đài TH Vĩnh Long (THVL)",
    publishedAt: "2024",
    categoryKey: "tour",
    rightsLabelVi: "Nhúng click-to-load chính thức của THVL trên YouTube",
    rightsLabelEn: "Official THVL YouTube click-to-load embed",
    posterImage: "/images/stitch/stitch-19.jpg",
    externalUrl: "https://www.youtube.com/watch?v=E2l0ZnKPQ5M",
    youtubeId: "E2l0ZnKPQ5M",
  },
  {
    id: "MEDIA-YT-CASHEW-BPTV",
    kind: "external_embed_click_to_load",
    titleVi: "Câu chuyện vùng Hạt điều Bazan (BPTV)",
    titleEn: "Basalt Cashew Region Documentary (BPTV)",
    summaryVi:
      "Tư liệu phóng sự về quy trình thu hái và rang củi truyền thống hạt điều vùng đất đỏ bazan.",
    summaryEn:
      "Regional broadcast story highlighting cashew harvesting, safety handling, and wood-roasting heritage.",
    publisher: "BPTV · Truyền hình địa phương",
    publishedAt: "2024",
    categoryKey: "cashew",
    rightsLabelVi: "Tư liệu vùng công khai · Nhúng click-to-load",
    rightsLabelEn: "Regional broadcast archive · Click-to-load embed",
    posterImage: "/images/stitch/stitch-39.jpg",
    externalUrl: "https://www.youtube.com/watch?v=eNGb_z6_siw",
    youtubeId: "eNGb_z6_siw",
  },
  {
    id: "MEDIA-YT-CACAO-TRONG-DUC",
    kind: "external_embed_click_to_load",
    titleVi: "Khám phá vùng trồng & chế biến Ca cao Đồng Nai",
    titleEn: "Exploring Dong Nai Cacao Cultivation & Fermentation",
    summaryVi:
      "Tư liệu tham khảo quy trình lên men hạt cacao và chế biến sản phẩm OCOP vùng Định Quán.",
    summaryEn:
      "Reference video showing cacao pod harvest, wooden box fermentation, and artisan chocolate steps.",
    publisher: "Nguồn video bên thứ ba (Candidate V5.08 §8.3)",
    publishedAt: "2024",
    categoryKey: "cacao",
    rightsLabelVi: "Candidate tham khảo vùng · Mở nhúng khi người dùng bấm",
    rightsLabelEn: "Third-party regional reference · Loads only on click",
    posterImage: "/images/products/chocolate-cacao.jpg",
    externalUrl: "https://www.youtube.com/watch?v=gFw7RakIKa4",
    youtubeId: "gFw7RakIKa4",
  },
  {
    id: "MEDIA-PRESS-RAMBUTAN-2025",
    kind: "external_source_link_only",
    titleVi: "Chôm chôm đầu vụ tại Long Khánh (tư liệu mùa vụ 06/2025)",
    titleEn: "Early-Season Rambutan Harvest in Long Khanh (Bao Dong Nai, 06/2025)",
    summaryVi:
      "Bài phóng sự Báo Đồng Nai về mùa chôm chôm đầu vụ; giá năm 2025 chỉ mang tính mốc thời điểm cũ.",
    summaryEn:
      "Bao Dong Nai seasonal report from June 2025 (historical price note — not current marketplace pricing).",
    publisher: "Báo Đồng Nai",
    publishedAt: "2025-06",
    categoryKey: "rambutan",
    rightsLabelVi: "Liên kết báo chí gốc (không tải lại file gốc)",
    rightsLabelEn: "External press source link only",
    posterImage: "/images/stitch/stitch-40.jpg",
    externalUrl:
      "https://baodongnai.com.vn/video-clip/202506/chom-chom-dau-vu-tai-long-khanh-gia-cao-nhat-trong-vai-nam-tro-lai-day-8f008a8/",
  },
  {
    id: "MEDIA-PRESS-HONEY-2025",
    kind: "external_source_link_only",
    titleVi: "Mật ngọt từ đất Long Khánh — Hành trình thương hiệu mật ong hoa chôm chôm",
    titleEn: "Sweet Honey from Long Khanh — Women Farmers Building Floral Honey",
    summaryVi:
      "Câu chuyện nghề nuôi ong dưới tán vườn chôm chôm và nhãn tại Đồng Nai từ phóng sự Báo Đồng Nai.",
    summaryEn:
      "Documentary clip on apiary farmers raising bees under rambutan and longan canopies in Dong Nai.",
    publisher: "Báo Đồng Nai",
    publishedAt: "2025-05",
    categoryKey: "honey",
    rightsLabelVi: "Liên kết trang gốc Báo Đồng Nai",
    rightsLabelEn: "Official press source link",
    posterImage: "/images/stitch/stitch-06.jpg",
    externalUrl:
      "https://baodongnai.com.vn/video-clip/202505/mat-ngot-tu-dat-long-khanh-hanh-trinh-nu-nong-dan-xay-dung-thuong-hieu-dac-san-tu-hoa-chom-chom-46306bf/",
  },
  {
    id: "MEDIA-PRESS-DURIAN-SONGRAY",
    kind: "external_source_link_only",
    titleVi: "Mô hình trồng sầu riêng vùng Sông Ray (NRTV)",
    titleEn: "Song Ray Durian Orchard Cultivation Story (NRTV)",
    summaryVi:
      "Tư liệu canh tác địa phương tại Xã Sông Ray (mang tính tham khảo câu chuyện vùng, không thay thế hồ sơ VietGAP).",
    summaryEn:
      "Local cultivation feature from Song Ray portal (regional background story only, not a formal VietGAP claim).",
    publisher: "Cổng thông tin Sông Ray / NRTV",
    publishedAt: "2025",
    categoryKey: "durian",
    rightsLabelVi: "Liên kết cổng thông tin địa phương",
    rightsLabelEn: "Municipal portal reference link",
    posterImage: "/images/stitch/stitch-38.jpg",
    externalUrl:
      "https://songray.dongnai.gov.vn/vi/videoclips/video-xa-song-ray-mo-hinh-trong-sau-rieng-3-goc.html",
  },
  {
    id: "MEDIA-PRESS-OCOP-TET-2026",
    kind: "external_source_link_only",
    titleVi: "Sản phẩm OCOP địa phương vươn xa & chuẩn bị vào mùa cao điểm",
    titleEn: "Local Dong Nai OCOP Specialties Expanding & Preparing for Peak Season",
    summaryVi:
      "Tin chuyên đề Báo Đồng Nai (02/2026 & 10/2026) về chuyển đổi số và kết nối tiêu thụ đặc sản địa phương.",
    summaryEn:
      "Bao Dong Nai reports (Feb & Oct 2026) covering local OCOP product packaging and market linkages.",
    publisher: "Báo Đồng Nai",
    publishedAt: "2026-10",
    categoryKey: "ocop",
    rightsLabelVi: "Bài viết báo chí chính thức (chỉ mở liên kết nguồn)",
    rightsLabelEn: "Official newspaper feature link",
    posterImage: "/images/products/ocop-gift-basket.jpg",
    externalUrl:
      "https://baodongnai.com.vn/kinh-te/202610/san-pham-dia-phuong-chuan-bi-vao-mua-tet-c5d516d/",
  },
  {
    id: "MEDIA-STUDIO-P06-VI",
    kind: "owned_local_mp4",
    titleVi: "Clip giới thiệu ngắn · Bưởi Tân Triều (FFmpeg Studio V5)",
    titleEn: "NaiFarm Studio Reel · Tan Trieu Pomelo (Local FFmpeg)",
    summaryVi:
      "Video MP4 (H.264 + AAC + phụ đề WebVTT) dựng từ ảnh & dữ liệu thật trên hạ tầng Creative Studio nội bộ.",
    summaryEn:
      "Local FFmpeg-rendered MP4 story reel with embedded VI/EN captions and QR batch summary.",
    publisher: "NaiFarm Creative Studio (Local FFmpeg)",
    publishedAt: "2026-11-25",
    categoryKey: "pomelo",
    rightsLabelVi: "Tài sản dựng nội bộ NaiFarm · Tự do trình chiếu",
    rightsLabelEn: "NaiFarm studio owned asset · Cleared for playback",
    posterImage: "/images/stitch/stitch-03.jpg",
    externalUrl: "/media/studio-samples/p06-buoi-tan-trieu-vi.mp4",
    localMp4Path: "/media/studio-samples/p06-buoi-tan-trieu-vi.mp4",
    localVttVi: "/media/studio-samples/p06-buoi-tan-trieu-vi.vtt",
    transcriptVi:
      "Bưởi da xanh Tân Triều trồng trên phù sa cổ ven sông Đồng Nai. Quét mã QR NF-TT-2026-01 để xem nhật ký mùa vụ.",
    transcriptEn:
      "Tan Trieu Green-Skin Pomelo grown on ancient Dong Nai river alluvium. Scan NF-TT-2026-01 for full harvest diary.",
  },
];

export function resolveCategoryMedia(categoryLabel: string, anatomyType?: string): MediaAsset {
  const lower = `${categoryLabel} ${anatomyType ?? ""}`.toLowerCase();
  if (lower.includes("pomelo") || lower.includes("bưởi")) {
    return MEDIA_LIBRARY[0];
  }
  if (lower.includes("rambutan") || lower.includes("chôm chôm")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-PRESS-RAMBUTAN-2025") ?? MEDIA_LIBRARY[1];
  }
  if (lower.includes("durian") || lower.includes("sầu riêng")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-PRESS-DURIAN-SONGRAY") ?? MEDIA_LIBRARY[1];
  }
  if (lower.includes("cashew") || lower.includes("điều")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-YT-CASHEW-BPTV") ?? MEDIA_LIBRARY[2];
  }
  if (lower.includes("cacao")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-YT-CACAO-TRONG-DUC") ?? MEDIA_LIBRARY[3];
  }
  if (lower.includes("honey") || lower.includes("mật ong")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-PRESS-HONEY-2025") ?? MEDIA_LIBRARY[5];
  }
  if (lower.includes("tour") || lower.includes("du lịch")) {
    return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-YT-TOUR-LONG-KHANH") ?? MEDIA_LIBRARY[1];
  }
  return MEDIA_LIBRARY.find((m) => m.id === "MEDIA-PRESS-OCOP-TET-2026") ?? MEDIA_LIBRARY[0];
}
