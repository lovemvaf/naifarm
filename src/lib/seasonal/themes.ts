export type SeasonalThemeId =
  | "normal"
  | "dong_nai_festival"
  | "tet"
  | "national_day_2_9"
  | "reunification_30_4"
  | "youth_month"
  | "harvest_season"
  | "agritourism"
  | "mid_autumn"
  | "youth_education"
  | "cms_custom";

export type DecorationMotif =
  | "botanical_leaves"
  | "festival_blossoms_flag"
  | "tet_apricot_lanterns"
  | "national_flag_stars"
  | "youth_ribbons"
  | "harvest_citrus_boughs"
  | "mid_autumn_lanterns";

export interface SeasonalHeroSlide {
  id: string;
  themeId: SeasonalThemeId;
  badgeVi: string;
  badgeEn: string;
  titleVi: string;
  titleEn: string;
  ribbonVi: string;
  ribbonEn: string;
  subtitleVi: string;
  subtitleEn: string;
  ctaLabelVi: string;
  ctaLabelEn: string;
  ctaHref: string;
  secondaryCtaLabelVi: string;
  secondaryCtaLabelEn: string;
  secondaryCtaHref: string;
  desktopWebp: string;
  mobileWebp: string;
  fallbackJpg: string;
  altVi: string;
  altEn: string;
  showNationalFlag: boolean;
  motif: DecorationMotif;
  titleColorHex: string;
}

export interface SeasonalThemeConfig {
  id: SeasonalThemeId;
  nameVi: string;
  nameEn: string;
  startAt: string | null;
  endAt: string | null;
  timezone: "Asia/Ho_Chi_Minh";
  priority: number;
  enabled: boolean;
  approvedStatus: "approved" | "draft" | "community_sample";
  heroAssets: {
    desktopWebp: string;
    mobileWebp: string;
    fallbackJpg: string;
  };
  mobileAssets: {
    compactBannerWebp: string;
    reduceDecorations: boolean;
  };
  decorationAssets: {
    motif: DecorationMotif;
    showNationalFlag: boolean;
    showBlossoms: boolean;
    showLanterns: boolean;
    showHarvestBoughs: boolean;
    footerLandscapeTint: string;
  };
  accentTokens: {
    heroTitleColor: string;
    ribbonBg: string;
    ribbonText: string;
    toplineBg: string;
    toplineText: string;
    pageCornerTint: string;
  };
  motionIntensity: "none" | "subtle" | "festive";
  cta: {
    primaryVi: string;
    primaryEn: string;
    primaryHref: string;
    secondaryVi: string;
    secondaryEn: string;
    secondaryHref: string;
  };
  toplineNoticeVi: string;
  toplineNoticeEn: string;
  targetRoutes: "public" | "home_only" | "all_public";
}

/**
 * Year-specific Vietnamese Lunar Calendar ranges (Gregorian ISO dates, UTC+7).
 * Never hard-code one Tet or Mid-Autumn Gregorian date for all years.
 */
export const VIETNAMESE_LUNAR_WINDOWS: Record<
  number,
  { tetStart: string; tetEnd: string; midAutumnStart: string; midAutumnEnd: string }
> = {
  2025: {
    tetStart: "2025-01-20T00:00:00+07:00",
    tetEnd: "2025-02-05T23:59:59+07:00",
    midAutumnStart: "2025-09-28T00:00:00+07:00",
    midAutumnEnd: "2025-10-08T23:59:59+07:00",
  },
  2026: {
    tetStart: "2026-02-07T00:00:00+07:00",
    tetEnd: "2026-02-24T23:59:59+07:00",
    midAutumnStart: "2026-09-18T00:00:00+07:00",
    midAutumnEnd: "2026-09-27T23:59:59+07:00",
  },
  2027: {
    tetStart: "2027-01-27T00:00:00+07:00",
    tetEnd: "2027-02-13T23:59:59+07:00",
    midAutumnStart: "2027-09-08T00:00:00+07:00",
    midAutumnEnd: "2027-09-17T23:59:59+07:00",
  },
  2028: {
    tetStart: "2028-01-16T00:00:00+07:00",
    tetEnd: "2028-02-02T23:59:59+07:00",
    midAutumnStart: "2028-09-25T00:00:00+07:00",
    midAutumnEnd: "2028-10-05T23:59:59+07:00",
  },
  2029: {
    tetStart: "2029-02-03T00:00:00+07:00",
    tetEnd: "2029-02-20T23:59:59+07:00",
    midAutumnStart: "2029-09-14T00:00:00+07:00",
    midAutumnEnd: "2029-09-24T23:59:59+07:00",
  },
  2030: {
    tetStart: "2030-01-24T00:00:00+07:00",
    tetEnd: "2030-02-10T23:59:59+07:00",
    midAutumnStart: "2030-09-04T00:00:00+07:00",
    midAutumnEnd: "2030-09-14T23:59:59+07:00",
  },
};

export function getSeasonalThemesForYear(year: number): SeasonalThemeConfig[] {
  const lunar = VIETNAMESE_LUNAR_WINDOWS[year] ?? VIETNAMESE_LUNAR_WINDOWS[2026];
  return [
    {
      id: "normal",
      nameVi: "Ngày thường — Nông nghiệp xanh Đồng Nai",
      nameEn: "Everyday — Green Dong Nai Agriculture",
      startAt: null,
      endAt: null,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 1,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-festival-orchard-desktop.webp",
        mobileWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        fallbackJpg: "/images/hero/dong-nai-orchard-hero.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "botanical_leaves",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#E7EFE1",
      },
      accentTokens: {
        heroTitleColor: "#1E4D33",
        ribbonBg: "#F3DDA0",
        ribbonText: "#3E2D12",
        toplineBg: "#EAF0E5",
        toplineText: "#1E4D33",
        pageCornerTint: "rgba(108, 156, 91, 0.14)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Khám phá ngay",
        primaryEn: "Shop Produce",
        primaryHref: "/marketplace",
        secondaryVi: "Xem lịch sự kiện",
        secondaryEn: "Event Calendar",
        secondaryHref: "/events",
      },
      toplineNoticeVi: "Nông sản Đồng Nai minh bạch QR · 95 Phường/Xã · Không gian trải nghiệm",
      toplineNoticeEn: "Traceable Dong Nai OCOP Produce · 95 Wards & Communes · Experience Hub",
      targetRoutes: "all_public",
    },
    {
      id: "dong_nai_festival",
      nameVi: "Ngày hội Nông sản Đồng Nai",
      nameEn: "Dong Nai Agricultural Festival",
      startAt: `${year}-11-18T00:00:00+07:00`,
      endAt: `${year}-12-05T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 95,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-festival-orchard-desktop.webp",
        mobileWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        fallbackJpg: "/images/hero/dong-nai-orchard-hero.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "festival_blossoms_flag",
        showNationalFlag: true,
        showBlossoms: true,
        showLanterns: true,
        showHarvestBoughs: true,
        footerLandscapeTint: "#E9EFDF",
      },
      accentTokens: {
        heroTitleColor: "#A52C22",
        ribbonBg: "#F4C465",
        ribbonText: "#3B270C",
        toplineBg: "#E9EDDF",
        toplineText: "#1E4D33",
        pageCornerTint: "rgba(215, 163, 77, 0.16)",
      },
      motionIntensity: "festive",
      cta: {
        primaryVi: "Khám phá ngay",
        primaryEn: "Explore Now",
        primaryHref: "/marketplace",
        secondaryVi: "Xem lịch sự kiện",
        secondaryEn: "View Schedule",
        secondaryHref: "/events",
      },
      toplineNoticeVi: "Ngày hội Nông sản Đồng Nai 2026 · Trưng bày OCOP · Kết nối nhà vườn & thanh niên",
      toplineNoticeEn: "Dong Nai Produce Festival 2026 · OCOP Showcase · Connecting Orchards & Youth",
      targetRoutes: "all_public",
    },
    {
      id: "tet",
      nameVi: "Tết Nguyên đán — Xuân Nông sản Việt",
      nameEn: "Lunar New Year (Tet) Harvest",
      startAt: lunar.tetStart,
      endAt: lunar.tetEnd,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 100,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-harvest-basket-desktop.webp",
        mobileWebp: "/images/hero/v9-harvest-basket-mobile.webp",
        fallbackJpg: "/images/products/ocop-gift-basket.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-harvest-basket-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "tet_apricot_lanterns",
        showNationalFlag: false,
        showBlossoms: true,
        showLanterns: true,
        showHarvestBoughs: false,
        footerLandscapeTint: "#F5ECD8",
      },
      accentTokens: {
        heroTitleColor: "#A52C22",
        ribbonBg: "#F5D076",
        ribbonText: "#4A1A14",
        toplineBg: "#F8EBD2",
        toplineText: "#7C241C",
        pageCornerTint: "rgba(215, 163, 77, 0.22)",
      },
      motionIntensity: "festive",
      cta: {
        primaryVi: "Chọn quà Tết OCOP",
        primaryEn: "Tet OCOP Gifts",
        primaryHref: "/marketplace?collection=naibox",
        secondaryVi: "Lịch phiên chợ Tết",
        secondaryEn: "Tet Market Dates",
        secondaryHref: "/events",
      },
      toplineNoticeVi: "Xuân sum vầy · Hộp quà OCOP Đồng Nai truy xuất QR từ nhà vườn",
      toplineNoticeEn: "Lunar New Year · QR-Traceable Dong Nai OCOP Gift Hampers",
      targetRoutes: "all_public",
    },
    {
      id: "national_day_2_9",
      nameVi: "Quốc khánh 2/9 — Tự hào Nông sản Việt",
      nameEn: "National Day Sept 2 — Vietnamese Produce Pride",
      startAt: `${year}-08-25T00:00:00+07:00`,
      endAt: `${year}-09-05T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 98,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-festival-orchard-desktop.webp",
        mobileWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        fallbackJpg: "/images/hero/dong-nai-orchard-hero.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-festival-orchard-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "national_flag_stars",
        showNationalFlag: true,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EFECE0",
      },
      accentTokens: {
        heroTitleColor: "#A52C22",
        ribbonBg: "#F6D98B",
        ribbonText: "#4B2219",
        toplineBg: "#F5EAD8",
        toplineText: "#8C221A",
        pageCornerTint: "rgba(185, 28, 28, 0.10)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Đặc sản OCOP Đồng Nai",
        primaryEn: "Dong Nai OCOP",
        primaryHref: "/marketplace",
        secondaryVi: "Bản đồ vùng trồng",
        secondaryEn: "Orchard Map",
        secondaryHref: "/explore",
      },
      toplineNoticeVi: "Chào mừng Quốc khánh 2/9 · Tự hào nông sản Việt truy xuất minh bạch",
      toplineNoticeEn: "National Day Sept 2 · Celebrating Traceable Vietnamese Agriculture",
      targetRoutes: "all_public",
    },
    {
      id: "reunification_30_4",
      nameVi: "Kỷ niệm 30/4 & Quốc tế Lao động 1/5",
      nameEn: "Reunification Day Apr 30 & Labor Day May 1",
      startAt: `${year}-04-24T00:00:00+07:00`,
      endAt: `${year}-05-04T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 96,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-agritourism-ba-tu-desktop.webp",
        mobileWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        fallbackJpg: "/media/studio-samples/tour-01-ba-tu-orchard-en.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "national_flag_stars",
        showNationalFlag: true,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EAF0E5",
      },
      accentTokens: {
        heroTitleColor: "#A52C22",
        ribbonBg: "#F5D98E",
        ribbonText: "#3F2612",
        toplineBg: "#EFECE0",
        toplineText: "#245B3D",
        pageCornerTint: "rgba(36, 91, 61, 0.12)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Đặt tour miệt vườn lễ",
        primaryEn: "Holiday Orchard Tours",
        primaryHref: "/explore?view=tours",
        secondaryVi: "Mua đặc sản mùa hè",
        secondaryEn: "Shop Summer Fruit",
        secondaryHref: "/marketplace",
      },
      toplineNoticeVi: "Kỳ nghỉ 30/4 – 1/5 · Khám phá vườn trái cây Tân Triều & Long Khánh",
      toplineNoticeEn: "Apr 30 – May 1 Holiday · Visit Tan Trieu & Long Khanh Orchards",
      targetRoutes: "all_public",
    },
    {
      id: "youth_month",
      nameVi: "Tháng Thanh niên — Số hóa Nông sản",
      nameEn: "Youth Month — Digital Orchard Bridge",
      startAt: `${year}-03-01T00:00:00+07:00`,
      endAt: `${year}-03-31T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 85,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-agritourism-ba-tu-desktop.webp",
        mobileWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        fallbackJpg: "/media/studio-samples/tour-01-ba-tu-orchard-en.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "youth_ribbons",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#E5EFEA",
      },
      accentTokens: {
        heroTitleColor: "#1D4F3B",
        ribbonBg: "#D8EED9",
        ribbonText: "#183D2A",
        toplineBg: "#E6F1EC",
        toplineText: "#1C4F3A",
        pageCornerTint: "rgba(36, 91, 61, 0.14)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Tham gia tình nguyện",
        primaryEn: "Join Youth Missions",
        primaryHref: "/volunteer",
        secondaryVi: "Học tập kỹ năng số",
        secondaryEn: "Digital Learning",
        secondaryHref: "/learn",
      },
      toplineNoticeVi: "Tháng Thanh niên · Đoàn viên đồng hành chụp ảnh, gắn tem QR & livestream cùng nhà vườn",
      toplineNoticeEn: "Youth Month · Volunteers helping orchards with QR tags, photography & livestreams",
      targetRoutes: "all_public",
    },
    {
      id: "harvest_season",
      nameVi: "Mùa thu hoạch Trái cây Đồng Nai",
      nameEn: "Dong Nai Peak Harvest Season",
      startAt: `${year}-05-15T00:00:00+07:00`,
      endAt: `${year}-07-20T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 80,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-summer-mango-desktop.webp",
        mobileWebp: "/images/hero/v9-summer-mango-mobile.webp",
        fallbackJpg: "/images/products/fresh-mango.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-summer-mango-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "harvest_citrus_boughs",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EFF2E2",
      },
      accentTokens: {
        heroTitleColor: "#245B3D",
        ribbonBg: "#F4D58B",
        ribbonText: "#3D2B10",
        toplineBg: "#EEF3E2",
        toplineText: "#245B3D",
        pageCornerTint: "rgba(108, 156, 91, 0.16)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Mua trái cây đang vụ",
        primaryEn: "Shop Peak Harvest",
        primaryHref: "/marketplace?collection=in_season",
        secondaryVi: "Xem nhật ký mùa vụ",
        secondaryEn: "Trace Harvest Lots",
        secondaryHref: "/trace/NF-DEMO-001",
      },
      toplineNoticeVi: "Chính vụ chôm chôm, sầu riêng Ri6 & bưởi da xanh · Hái sớm giao trong ngày",
      toplineNoticeEn: "Peak harvest for rambutan, Ri6 durian & green-skin pomelo · Fresh orchard lots",
      targetRoutes: "all_public",
    },
    {
      id: "agritourism",
      nameVi: "Mùa Du lịch Trải nghiệm Miệt vườn",
      nameEn: "Orchard Agritourism Season",
      startAt: `${year}-07-21T00:00:00+07:00`,
      endAt: `${year}-08-24T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 75,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-agritourism-ba-tu-desktop.webp",
        mobileWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        fallbackJpg: "/media/studio-samples/tour-01-ba-tu-orchard-en.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "botanical_leaves",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EAF0E5",
      },
      accentTokens: {
        heroTitleColor: "#1E4D33",
        ribbonBg: "#E6F0DD",
        ribbonText: "#1E4D33",
        toplineBg: "#EAF0E5",
        toplineText: "#1E4D33",
        pageCornerTint: "rgba(108, 156, 91, 0.14)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Đặt tour trải nghiệm",
        primaryEn: "Book Orchard Tour",
        primaryHref: "/explore?view=tours",
        secondaryVi: "Mở bản đồ 95 xã/phường",
        secondaryEn: "95-Unit Map",
        secondaryHref: "/explore",
      },
      toplineNoticeVi: "Du lịch miệt vườn cuối tuần · Tham quan vườn, hái trái và trải nghiệm tem QR",
      toplineNoticeEn: "Weekend Agritourism · Orchard walks, fruit tastings & bilingual youth guides",
      targetRoutes: "all_public",
    },
    {
      id: "mid_autumn",
      nameVi: "Trung thu — Đêm hội Trăng rằm Nông sản",
      nameEn: "Mid-Autumn Harvest & Lanterns",
      startAt: lunar.midAutumnStart,
      endAt: lunar.midAutumnEnd,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 92,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-pomelo-craft-desktop.webp",
        mobileWebp: "/images/hero/v9-pomelo-craft-mobile.webp",
        fallbackJpg: "/images/products/pomelo-peel-jam.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-pomelo-craft-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "mid_autumn_lanterns",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: true,
        showHarvestBoughs: true,
        footerLandscapeTint: "#F4EEDB",
      },
      accentTokens: {
        heroTitleColor: "#8C3A16",
        ribbonBg: "#F7D98C",
        ribbonText: "#4A240C",
        toplineBg: "#F6EED9",
        toplineText: "#6E3012",
        pageCornerTint: "rgba(215, 163, 77, 0.20)",
      },
      motionIntensity: "festive",
      cta: {
        primaryVi: "Bưởi & Trà Trung thu",
        primaryEn: "Mid-Autumn Pomelo & Tea",
        primaryHref: "/marketplace",
        secondaryVi: "Lịch hoạt động",
        secondaryEn: "Activity Schedule",
        secondaryHref: "/events",
      },
      toplineNoticeVi: "Vui Tết Trung thu · Bưởi Tân Triều, trà hoa và hộp quà sum vầy",
      toplineNoticeEn: "Mid-Autumn Harvest · Tan Trieu pomelo, artisanal teas & family gift sets",
      targetRoutes: "all_public",
    },
    {
      id: "youth_education",
      nameVi: "Chiến dịch Học tập & Cộng đồng Nông nghiệp Số",
      nameEn: "Digital Agriculture Learning & Community Drive",
      startAt: `${year}-10-01T00:00:00+07:00`,
      endAt: `${year}-11-17T23:59:59+07:00`,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 70,
      enabled: true,
      approvedStatus: "approved",
      heroAssets: {
        desktopWebp: "/images/hero/v9-longan-orchard-desktop.webp",
        mobileWebp: "/images/hero/v9-longan-orchard-mobile.webp",
        fallbackJpg: "/images/products/fresh-longan.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-longan-orchard-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "youth_ribbons",
        showNationalFlag: false,
        showBlossoms: false,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EAF0E5",
      },
      accentTokens: {
        heroTitleColor: "#1E4D33",
        ribbonBg: "#E3EEDB",
        ribbonText: "#1E4D33",
        toplineBg: "#EAF0E5",
        toplineText: "#1E4D33",
        pageCornerTint: "rgba(108, 156, 91, 0.14)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Mở góc học tập 9 nhóm",
        primaryEn: "Explore 9 Learning Tracks",
        primaryHref: "/learn",
        secondaryVi: "Nhiệm vụ cộng đồng",
        secondaryEn: "Community Missions",
        secondaryHref: "/volunteer",
      },
      toplineNoticeVi: "Học tập nông nghiệp song ngữ VI/EN miễn phí cho 9 nhóm đối tượng",
      toplineNoticeEn: "Open bilingual VI/EN agricultural learning across 9 learner tracks",
      targetRoutes: "all_public",
    },
    {
      id: "cms_custom",
      nameVi: "Chiến dịch Tùy chỉnh CMS",
      nameEn: "CMS Custom Campaign Theme",
      startAt: null,
      endAt: null,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 110,
      enabled: false,
      approvedStatus: "draft",
      heroAssets: {
        desktopWebp: "/images/hero/v9-harvest-basket-desktop.webp",
        mobileWebp: "/images/hero/v9-harvest-basket-mobile.webp",
        fallbackJpg: "/images/products/ocop-gift-basket.jpg",
      },
      mobileAssets: {
        compactBannerWebp: "/images/hero/v9-harvest-basket-mobile.webp",
        reduceDecorations: true,
      },
      decorationAssets: {
        motif: "festival_blossoms_flag",
        showNationalFlag: false,
        showBlossoms: true,
        showLanterns: false,
        showHarvestBoughs: true,
        footerLandscapeTint: "#EFECE0",
      },
      accentTokens: {
        heroTitleColor: "#245B3D",
        ribbonBg: "#F3DDA0",
        ribbonText: "#3A2810",
        toplineBg: "#EAF0E5",
        toplineText: "#245B3D",
        pageCornerTint: "rgba(215, 163, 77, 0.14)",
      },
      motionIntensity: "subtle",
      cta: {
        primaryVi: "Xem chương trình",
        primaryEn: "View Program",
        primaryHref: "/events",
        secondaryVi: "Chợ nông sản",
        secondaryEn: "Marketplace",
        secondaryHref: "/marketplace",
      },
      toplineNoticeVi: "Chiến dịch cấu hình từ CMS cục bộ · Có thể xem trước và hẹn giờ tự tắt",
      toplineNoticeEn: "Local CMS custom campaign · Previewable with scheduled auto-expiry",
      targetRoutes: "all_public",
    },
  ];
}

export interface SeasonalOverrideState {
  forcedThemeId: SeasonalThemeId | null;
  expiresAtIso: string | null;
  decorationsEnabled: boolean;
}

export function resolveActiveSeasonalTheme(
  clockIso: string,
  override?: SeasonalOverrideState | null,
): { theme: SeasonalThemeConfig; allThemes: SeasonalThemeConfig[]; isOverrideActive: boolean } {
  const clockMs = Date.parse(clockIso);
  const safeMs = Number.isFinite(clockMs) ? clockMs : Date.parse("2026-11-25T12:00:00+07:00");
  const year = new Date(safeMs).getUTCFullYear();
  const allThemes = getSeasonalThemesForYear(year);

  if (override?.forcedThemeId) {
    const expMs = override.expiresAtIso ? Date.parse(override.expiresAtIso) : Infinity;
    if (!Number.isFinite(expMs) || safeMs <= expMs) {
      const forced = allThemes.find((t) => t.id === override.forcedThemeId);
      if (forced) {
        return { theme: forced, allThemes, isOverrideActive: true };
      }
    }
  }

  const activeCandidates = allThemes
    .filter((t) => {
      if (!t.enabled || !t.startAt || !t.endAt) return false;
      const s = Date.parse(t.startAt);
      const e = Date.parse(t.endAt);
      return Number.isFinite(s) && Number.isFinite(e) && safeMs >= s && safeMs <= e;
    })
    .sort((a, b) => b.priority - a.priority);

  const resolved = activeCandidates[0] ?? allThemes[0];
  return { theme: resolved, allThemes, isOverrideActive: false };
}

export function buildV9HeroSlides(activeTheme: SeasonalThemeConfig): SeasonalHeroSlide[] {
  const festivalSlide: SeasonalHeroSlide = {
    id: "slide-festival",
    themeId: activeTheme.id,
    badgeVi: "Chợ OCOP Thanh niên Đồng Nai",
    badgeEn: "Dong Nai Youth OCOP Market",
    titleVi:
      activeTheme.id === "tet"
        ? "Xuân Nông sản Đồng Nai 2026"
        : activeTheme.id === "national_day_2_9"
        ? "Tự hào Nông sản Việt 2/9"
        : activeTheme.id === "mid_autumn"
        ? "Đêm hội Trăng rằm Nông sản"
        : "Ngày hội Nông sản Đồng Nai 2026",
    titleEn:
      activeTheme.id === "tet"
        ? "Dong Nai Tet Harvest 2026"
        : activeTheme.id === "national_day_2_9"
        ? "Vietnamese Produce Pride 2/9"
        : activeTheme.id === "mid_autumn"
        ? "Mid-Autumn Orchard Harvest"
        : "Dong Nai Produce Festival 2026",
    ribbonVi: "Kết nối nhà vườn · Lan tỏa đặc sản · Cùng thanh niên phát triển nông nghiệp số",
    ribbonEn: "Connecting orchards · Sharing specialties · Youth-powered digital agriculture",
    subtitleVi:
      "Bưởi Tân Triều, sầu riêng Long Khánh, hạt điều rang củi gắn mã QR truy xuất từng lô từ 95 phường/xã.",
    subtitleEn:
      "Tan Trieu pomelo, Long Khanh durian, and wood-roasted cashews with QR batch traceability across 95 wards & communes.",
    ctaLabelVi: activeTheme.cta.primaryVi,
    ctaLabelEn: activeTheme.cta.primaryEn,
    ctaHref: activeTheme.cta.primaryHref,
    secondaryCtaLabelVi: activeTheme.cta.secondaryVi,
    secondaryCtaLabelEn: activeTheme.cta.secondaryEn,
    secondaryCtaHref: activeTheme.cta.secondaryHref,
    desktopWebp: activeTheme.heroAssets.desktopWebp,
    mobileWebp: activeTheme.heroAssets.mobileWebp,
    fallbackJpg: activeTheme.heroAssets.fallbackJpg,
    altVi: "Không gian vườn bưởi, chôm chôm và đặc sản nông sản Đồng Nai",
    altEn: "Dong Nai pomelo, rambutan and regional OCOP orchard harvest scene",
    showNationalFlag: activeTheme.decorationAssets.showNationalFlag,
    motif: activeTheme.decorationAssets.motif,
    titleColorHex: activeTheme.accentTokens.heroTitleColor,
  };

  return [
    festivalSlide,
    {
      id: "slide-harvest-ocop",
      themeId: "harvest_season",
      badgeVi: "Đặc sản OCOP · Truy xuất QR",
      badgeEn: "OCOP Specialties · QR Traceability",
      titleVi: "Hương vị Đồng Nai từ vườn đến nhà",
      titleEn: "Taste Dong Nai From Farm to Table",
      ribbonVi: "168 nông sản theo mùa · 40 nhà vườn & HTX · 26 chuẩn chất lượng minh bạch",
      ribbonEn: "168 seasonal products · 40 orchards & co-ops · 26 transparent quality standards",
      subtitleVi:
        "Kiểm tra nhật ký canh tác, độ ngọt Brix, nguồn gốc chứng nhận và đặt mua trực tiếp từ nhà vườn.",
      subtitleEn:
        "Inspect seasonal farm logs, Brix sweetness notes, verified credential sources, and order directly from growers.",
      ctaLabelVi: "Mua sắm nông sản",
      ctaLabelEn: "Shop Produce",
      ctaHref: "/marketplace",
      secondaryCtaLabelVi: "Quét mã truy xuất QR",
      secondaryCtaLabelEn: "Scan QR Passport",
      secondaryCtaHref: "/trace/scan",
      desktopWebp: "/images/hero/v9-harvest-basket-desktop.webp",
      mobileWebp: "/images/hero/v9-harvest-basket-mobile.webp",
      fallbackJpg: "/images/products/ocop-gift-basket.jpg",
      altVi: "Giỏ quà đặc sản OCOP và nông sản sạch Đồng Nai",
      altEn: "Dong Nai OCOP specialty produce and gift hamper",
      showNationalFlag: false,
      motif: "harvest_citrus_boughs",
      titleColorHex: "#1E4D33",
    },
    {
      id: "slide-agritourism-youth",
      themeId: "agritourism",
      badgeVi: "Du lịch miệt vườn & Thanh niên số",
      badgeEn: "Agritourism & Youth Digital Bridge",
      titleVi: "Trải nghiệm vườn cùng Thanh niên Đồng Nai",
      titleEn: "Experience Orchards With Local Youth",
      ribbonVi: "Bản đồ 95 phường/xã · Học tập song ngữ 2D · Tình nguyện hỗ trợ nhà vườn",
      ribbonEn: "95-unit map · Bilingual 2D learning · Youth volunteering for family farms",
      subtitleVi:
        "Đặt lịch tham quan vườn bưởi, vườn chôm chôm cuối tuần và học ngôn ngữ nông sản Việt–Anh trực quan.",
      subtitleEn:
        "Reserve weekend orchard visits, meet family growers, and practice interactive VI–EN agricultural lessons.",
      ctaLabelVi: "Khám phá bản đồ & Tour",
      ctaLabelEn: "Explore Map & Tours",
      ctaHref: "/explore",
      secondaryCtaLabelVi: "Học tập nông nghiệp số",
      secondaryCtaLabelEn: "Open Learning Hub",
      secondaryCtaHref: "/learn",
      desktopWebp: "/images/hero/v9-agritourism-ba-tu-desktop.webp",
      mobileWebp: "/images/hero/v9-agritourism-ba-tu-mobile.webp",
      fallbackJpg: "/media/studio-samples/tour-01-ba-tu-orchard-en.jpg",
      altVi: "Nhà vườn Đồng Nai và thanh niên tình nguyện đón khách tham quan miệt vườn",
      altEn: "Dong Nai orchard owners and youth volunteers welcoming agritourism guests",
      showNationalFlag: false,
      motif: "youth_ribbons",
      titleColorHex: "#1E4D33",
    },
  ];
}
