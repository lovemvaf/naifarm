"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { INITIAL_FARMS } from "@/data/demo/farms";
import { INITIAL_PRODUCTS } from "@/data/demo/products";
import { INITIAL_BATCHES } from "@/data/demo/batches";
import { INITIAL_CERTIFICATIONS } from "@/data/demo/certifications";
import { INITIAL_DIARY_ENTRIES, INITIAL_SEASONS } from "@/data/demo/seasons-diaries";
import { INITIAL_ORDERS } from "@/data/demo/orders";
import {
  INITIAL_MISSIONS,
  INITIAL_SUPPORT_REQUESTS,
  INITIAL_VOLUNTEER_HOURS,
} from "@/data/demo/missions";
import { INITIAL_LIVESTREAMS } from "@/data/demo/livestreams";
import { INITIAL_LESSONS } from "@/data/demo/learning";
import {
  DEMO_AUTH_ACCOUNTS,
  INITIAL_ADDRESS_BOOK,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARTNER_ORGS,
  INITIAL_TICKETS,
  ROLE_BUNDLE_QUICK_ACCOUNTS,
} from "@/data/demo/partners-tickets";
import {
  INITIAL_ADMIN_GRANTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOC_CASES,
} from "@/data/demo/community";
import {
  INITIAL_TOUR_PACKAGES,
  INITIAL_V4_BOOKINGS,
} from "@/data/fixtures/agritourism-experiences";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_PROMOTIONS,
  OFFICIAL_OBSERVANCES,
} from "@/data/fixtures/calendar-campaigns";
import { DEFAULT_CLOCK_ISO, getActiveClockIso } from "@/lib/clock/vn-clock";
import { applyPromotionsToCart } from "@/lib/commerce/promotion-engine";
import { detectCalendarOverlap } from "@/lib/calendar/calendar-engine";
import { checkMakerChecker } from "@/lib/permissions/access-control";
import { INITIAL_CREDENTIAL_RECORDS } from "@/data/fixtures/quality-credentials";
import {
  INITIAL_COOP_POOLS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_LOGISTICS_TRIPS,
  INITIAL_MEMBER_DELIVERIES,
  INITIAL_MENTOR_CASES,
  INITIAL_PRODUCT_REVIEWS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECEIVABLES_PAYABLES,
  INITIAL_REFUND_REQUESTS,
  INITIAL_SCHOOL_CLASSES,
  INITIAL_SPONSOR_CAMPAIGNS,
  INITIAL_STUDENT_SUBMISSIONS,
  INITIAL_SUPPLIERS,
  INITIAL_WAREHOUSES,
  INITIAL_WAREHOUSE_STOCKS,
} from "@/data/fixtures/erp-operations";
import { getAdministrativeUnitByCode } from "@/lib/geography/administrative-lookup";
import { formatAdministrativeAddress } from "@/lib/geography/normalize-address";
import { impactAnalysisForRecall } from "@/lib/quality/recall-engine";
import type {
  AddressBookEntry,
  AdminGrant,
  AppRole,
  AuditLogEntry,
  BatchEvent,
  CalendarEvent,
  CampaignRecord,
  CampaignStatus,
  CartItem,
  CertificationStatus,
  CoopPool,
  CredentialLifecycleStatus,
  CredentialRecord,
  DeliveryMethod,
  DemoAuthAccount,
  DemoOrder,
  DiaryEntry,
  DocumentReviewCase,
  ExpenseEntry,
  ExperienceBooking,
  Farm,
  FarmCertification,
  InternationalInquiry,
  InventoryMovement,
  LearningLesson,
  LearningProgressRecord,
  LivestreamSession,
  Locale,
  LogisticsTrip,
  MemberDelivery,
  MentorCase,
  OrderStatus,
  ObservanceRecord,
  OrganizationKind,
  PartnerOrganization,
  Product,
  ProductReviewEntry,
  Profile,
  ProductionSeason,
  PromotionRecord,
  PurchaseOrder,
  ReceivablePayable,
  RefundRequest,
  SchoolClass,
  SponsorCampaign,
  StudentSubmission,
  Supplier,
  SupportRequest,
  SupportTicket,
  TourPackage,
  TraceBatch,
  UserNotification,
  VolunteerHourRecord,
  VolunteerMission,
  Warehouse,
  WarehouseStock,
  WorkspaceId,
} from "@/types/naifarm";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapFarmCertificationToCredential, mapProfile } from "@/lib/supabase/mappers";
import { fetchCoreData } from "@/lib/supabase/hydrate";

const STORAGE_KEY = "naifarm_demo_state_v4";

const SUPABASE_READY = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const supabase = SUPABASE_READY ? createClient() : null;
const DEMO_REAL_PASSWORD = "naifarm123";

const DEMO_REAL_EMAIL_MAP: Record<string, string> = {
  "ngoclinh.buyer@example.com": "customer@naifarm.vn",
  "chubatu.vuon@example.com": "farmer.batu@naifarm.vn",
  "minhanh.tnv@example.com": "volunteer@naifarm.vn",
  "thuha.dieuphoi@example.com": "coordinator@naifarm.vn",
  "htxtantrieu@example.com": "org@naifarm.vn",
  "admin.quantri@example.com": "admin@naifarm.vn",
};

const ROLE_WORKSPACE: Record<AppRole, WorkspaceId> = {
  customer: "W01",
  farmer: "W02",
  volunteer: "W03",
  coordinator: "W04",
  organization: "W05",
  admin: "W06",
};

const ROLE_LABEL: Record<AppRole, string> = {
  customer: "W01 · Cá nhân & Khách mua",
  farmer: "W02 · Nhà nông",
  volunteer: "W03 · Thanh niên Tình nguyện",
  coordinator: "W04 · Điều phối cộng đồng",
  organization: "W05 · Đối tác & HTX",
  admin: "W06 · Quản trị minh bạch",
};

const ROLE_AVATAR_BG: Record<AppRole, string> = {
  customer: "#245B3D",
  farmer: "#80520C",
  volunteer: "#245B78",
  coordinator: "#5B3D80",
  organization: "#0C5280",
  admin: "#B3492F",
};

function buildAccountFromProfile(
  profile: Profile,
  email: string,
  fallback?: DemoAuthAccount | null,
): DemoAuthAccount {
  const initials = profile.fullName
    .split(/\s+/)
    .slice(-2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return {
    id: profile.id,
    name: profile.fullName || fallback?.name || "Thành viên NaiFarm",
    emailDemo: email,
    roleLabel: ROLE_LABEL[profile.role],
    workspaceId: ROLE_WORKSPACE[profile.role],
    farmId: profile.farmId ?? fallback?.farmId,
    avatarText: initials || "ND",
    avatarBg: ROLE_AVATAR_BG[profile.role],
    unitCode: fallback?.unitCode ?? "26041",
    unitName: fallback?.unitName ?? "Phường Trấn Biên",
    bio: `Tài khoản NaiFarm · ${ROLE_LABEL[profile.role]}`,
    canPublicSignUp: fallback?.canPublicSignUp ?? true,
  };
}

interface DemoState {
  clockOverrideIso: string | null;
  activeWorkspace: WorkspaceId;
  activeOrgKind: OrganizationKind;
  activeScopeUnitCode: string;
  authUser: DemoAuthAccount | null;
  session: Session | null;
  profile: Profile | null;
  demoAccounts: DemoAuthAccount[];
  roleBundleAccounts: DemoAuthAccount[];
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  certifications: FarmCertification[];
  credentialRecords: CredentialRecord[];
  seasons: ProductionSeason[];
  diaryEntries: DiaryEntry[];
  lessons: LearningLesson[];
  learningProgress: LearningProgressRecord;
  cart: CartItem[];
  appliedPromoCodes: string[];
  followedProductIds: string[];
  favoriteProductIds: string[];
  recentlyViewedIds: string[];
  compareProductIds: string[];
  orders: DemoOrder[];
  refundRequests: RefundRequest[];
  productReviews: ProductReviewEntry[];
  warehouses: Warehouse[];
  warehouseStocks: WarehouseStock[];
  inventoryMovements: InventoryMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  coopPools: CoopPool[];
  memberDeliveries: MemberDelivery[];
  expenses: ExpenseEntry[];
  receivablesPayables: ReceivablePayable[];
  missions: VolunteerMission[];
  volunteerHours: VolunteerHourRecord[];
  supportRequests: SupportRequest[];
  livestreams: LivestreamSession[];
  tourPackages: TourPackage[];
  experienceBookings: ExperienceBooking[];
  calendarEvents: CalendarEvent[];
  campaigns: CampaignRecord[];
  promotions: PromotionRecord[];
  officialObservances: ObservanceRecord[];
  internationalInquiries: InternationalInquiry[];
  dismissedReminderKeys: string[];
  schoolClasses: SchoolClass[];
  studentSubmissions: StudentSubmission[];
  logisticsTrips: LogisticsTrip[];
  mentorCases: MentorCase[];
  sponsorCampaigns: SponsorCampaign[];
  docCases: DocumentReviewCase[];
  adminGrants: AdminGrant[];
  auditLogs: AuditLogEntry[];
  organizations: PartnerOrganization[];
  notifications: UserNotification[];
  tickets: SupportTicket[];
  addressBook: AddressBookEntry[];
  hideAiChatOnSubflow: boolean;
}

const INITIAL_INQUIRIES: InternationalInquiry[] = [
  {
    id: "INQ-2026-01",
    productId: "P08",
    productName: "Hạt điều rang muối vỏ lụa Xuân Lộc",
    farmId: "farm-htx-xuan-loc",
    farmName: "HTX Nông nghiệp Xuân Lộc",
    buyerName: "Elena Lim (Singapore Importer)",
    country: "Singapore",
    preferredLanguage: "en",
    quantityNote: "120 jars (500g wood-roasted sample lot)",
    packagingNote: "Vacuum sealed glass/PET jar with English nutrition & allergen label",
    sampleRequested: true,
    message: "Requesting MOQ and shelf-life verification sheet for specialty food showcase.",
    createdAtIso: "2026-11-24T10:15:00+07:00",
    status: "submitted_local",
  },
  {
    id: "INQ-2026-02",
    productId: "P06",
    productName: "Bưởi da xanh Tân Triều",
    farmId: "farm-ba-minh-tan-trieu",
    farmName: "Vườn Bưởi Chú Ba Minh",
    buyerName: "Kenji Sato (Osaka Gourmet)",
    country: "Japan",
    preferredLanguage: "en",
    quantityNote: "Weekend hospitality tasting & cooperative orchard sourcing inquiry",
    packagingNote: "Requires Phytosanitary / MSVT record review prior to formal export quote",
    sampleRequested: false,
    message: "Inquiring whether Tan Trieu pomelo lots hold export growing-area codes for Osaka retail.",
    createdAtIso: "2026-11-25T09:00:00+07:00",
    status: "seller_responded",
    responseNote: "HTX Tân Triều replied: Current lot serves domestic/orchard tasting; formal phytosanitary export quote reviewed per shipment.",
  },
];

function getInitialState(): DemoState {
  return {
    clockOverrideIso: null,
    activeWorkspace: "W01",
    activeOrgKind: "coop",
    activeScopeUnitCode: "ALL",
    authUser: null,
    session: null,
    profile: null,
    demoAccounts: DEMO_AUTH_ACCOUNTS,
    roleBundleAccounts: ROLE_BUNDLE_QUICK_ACCOUNTS,
    farms: INITIAL_FARMS,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
    certifications: INITIAL_CERTIFICATIONS,
    credentialRecords: INITIAL_CREDENTIAL_RECORDS,
    seasons: INITIAL_SEASONS,
    diaryEntries: INITIAL_DIARY_ENTRIES,
    lessons: INITIAL_LESSONS,
    learningProgress: {
      completedLessonIds: ["LESSON-01", "LESSON-13"],
      quizAnswers: { "LESSON-01": 0, "LESSON-13": 0 },
      masteredPhraseIds: ["PHR-01", "PHR-02"],
      matchedPairIds: ["PHR-01"],
      roleplayChoices: {},
      practicePoints: 40,
      submittedArtifactNotes: {},
    },
    cart: [
      {
        productId: "P01",
        quantity: 2,
        selectedOptionLabel: "2 kg (Giỏ gia đình)",
      },
    ],
    appliedPromoCodes: [],
    followedProductIds: [],
    favoriteProductIds: ["P06", "P01"],
    recentlyViewedIds: ["P01", "P06"],
    compareProductIds: [],
    orders: INITIAL_ORDERS,
    refundRequests: INITIAL_REFUND_REQUESTS,
    productReviews: INITIAL_PRODUCT_REVIEWS,
    warehouses: INITIAL_WAREHOUSES,
    warehouseStocks: INITIAL_WAREHOUSE_STOCKS,
    inventoryMovements: INITIAL_INVENTORY_MOVEMENTS,
    suppliers: INITIAL_SUPPLIERS,
    purchaseOrders: INITIAL_PURCHASE_ORDERS,
    coopPools: INITIAL_COOP_POOLS,
    memberDeliveries: INITIAL_MEMBER_DELIVERIES,
    expenses: INITIAL_EXPENSES,
    receivablesPayables: INITIAL_RECEIVABLES_PAYABLES,
    missions: INITIAL_MISSIONS,
    volunteerHours: INITIAL_VOLUNTEER_HOURS,
    supportRequests: INITIAL_SUPPORT_REQUESTS,
    livestreams: INITIAL_LIVESTREAMS,
    tourPackages: INITIAL_TOUR_PACKAGES,
    experienceBookings: INITIAL_V4_BOOKINGS,
    calendarEvents: INITIAL_CALENDAR_EVENTS,
    campaigns: INITIAL_CAMPAIGNS,
    promotions: INITIAL_PROMOTIONS,
    officialObservances: OFFICIAL_OBSERVANCES,
    internationalInquiries: INITIAL_INQUIRIES,
    dismissedReminderKeys: [],
    schoolClasses: INITIAL_SCHOOL_CLASSES,
    studentSubmissions: INITIAL_STUDENT_SUBMISSIONS,
    logisticsTrips: INITIAL_LOGISTICS_TRIPS,
    mentorCases: INITIAL_MENTOR_CASES,
    sponsorCampaigns: INITIAL_SPONSOR_CAMPAIGNS,
    docCases: INITIAL_DOC_CASES,
    adminGrants: INITIAL_ADMIN_GRANTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    organizations: INITIAL_PARTNER_ORGS,
    notifications: INITIAL_NOTIFICATIONS,
    tickets: INITIAL_TICKETS,
    addressBook: INITIAL_ADDRESS_BOOK,
    hideAiChatOnSubflow: false,
  };
}

interface PublishProductInput {
  name: string;
  category: Product["category"];
  priceVnd: number;
  unitLabel: string;
  stockKg: number;
  batchCode: string;
  shortDescription: string;
  image: string;
  farmId?: string;
}

interface PlaceOrderInput {
  customerName: string;
  customerPhoneDemo: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  deliverySlotLabel?: string;
  couponCode?: string;
  paymentMethod?: "cod" | "sepay_bank";
}

interface SignUpGuestInput {
  name: string;
  emailDemo: string;
  requestedRole: WorkspaceId;
  unitCode: string;
}

interface AddSeasonDiaryInput {
  seasonId: string;
  batchCode: string;
  stage: DiaryEntry["stage"];
  title: string;
  detail: string;
  actorName: string;
  sourceDeclaration: DiaryEntry["sourceDeclaration"];
  photo?: string;
  visibility?: "public" | "internal";
}

interface DemoStoreContextValue extends DemoState {
  hydrated: boolean;
  activeClockIso: string;
  setClockOverrideIso: (iso: string | null) => void;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  setActiveOrgKind: (kind: OrganizationKind) => void;
  setActiveScopeUnitCode: (unitCode: string) => void;
  setHideAiChatOnSubflow: (hidden: boolean) => void;
  signInDemoAccount: (accountId: string) => DemoAuthAccount | null;
  supabaseRealSignIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; account?: DemoAuthAccount | null; message: string }>;
  supabaseQuickSignIn: (
    accountId: string,
  ) => Promise<{ ok: boolean; account?: DemoAuthAccount | null; message: string }>;
  supabaseRealSignUp: (
    email: string,
    password: string,
    fullName: string,
    role: AppRole,
  ) => Promise<{ ok: boolean; message: string }>;
  supabaseResetPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  signUpDemoGuest: (input: SignUpGuestInput) => { ok: boolean; account?: DemoAuthAccount; message: string };
  signOutDemo: () => void;
  toggleAppliedPromoCode: (code: string) => void;
  clearAppliedPromoCodes: () => void;
  bookTourExperience: (input: {
    tourSlug: string;
    slotId: string;
    guestName: string;
    adultCount: number;
    childCount: number;
    language: Locale;
    allergenNote?: string;
    schoolGroup?: boolean;
    schoolConsentVerified?: boolean;
    note: string;
  }) => { ok: boolean; booking?: ExperienceBooking; message: string };
  updateExperienceBookingStatus: (
    bookingId: string,
    status: ExperienceBooking["status"],
    review?: { rating: number; comment: string },
  ) => void;
  upsertCalendarEvent: (ev: CalendarEvent) => { ok: boolean; message: string; overlapCount?: number };
  dismissReminder: (dedupeKey: string) => void;
  createCampaign: (input: Omit<CampaignRecord, "id" | "status" | "budgetSpentVnd" | "fixtureSessionsCount" | "fixtureOrdersCount" | "fixtureRevenueVnd">) => CampaignRecord;
  advanceCampaignStatus: (
    campaignId: string,
    nextStatus: CampaignStatus,
    actorName: string,
  ) => { ok: boolean; message: string };
  submitInternationalInquiry: (input: Omit<InternationalInquiry, "id" | "createdAtIso" | "status">) => InternationalInquiry;
  respondInternationalInquiry: (inquiryId: string, responseNote: string) => void;
  recordLearningQuizAnswer: (lessonId: string, optionIndex: number, isCorrect: boolean) => void;
  toggleMasteredPhrase: (phraseId: string) => void;
  recordMatchedPair: (phraseId: string) => void;
  recordRoleplayChoice: (scenarioId: string, optionId: string, scoreDelta: number) => void;
  resetLearningProgress: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAddressEntry: (input: {
    label: string;
    recipientName: string;
    phoneDemo: string;
    detailAddress: string;
    administrativeUnitCode: string;
  }) => { ok: boolean; message: string };
  removeAddressEntry: (id: string) => void;
  addToCart: (productId: string, quantity?: number, optionLabel?: string) => { ok: boolean; message: string };
  updateCartQty: (productId: string, nextQty: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFollowSeason: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  markRecentlyViewed: (productId: string) => void;
  toggleCompareProduct: (productId: string) => { ok: boolean; message?: string };
  clearCompareProducts: () => void;
  placeDemoOrder: (input: PlaceOrderInput) => {
    ok: boolean;
    orderId?: string;
    orderIds?: string[];
    orders?: DemoOrder[];
    message: string;
  };
  markOrderPaid: (
    orderId: string,
    transactionInfo?: { gateway?: string; referenceCode?: string; amountVnd?: number }
  ) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => void;
  requestOrderRefund: (
    orderId: string,
    reason: string,
    amountVnd: number,
    restockQty: number,
  ) => { ok: boolean; message: string };
  decideRefundRequest: (
    refundId: string,
    decision: "approved_by_finance" | "rejected",
    checkerName: string,
  ) => { ok: boolean; message: string };
  submitProductReview: (
    productId: string,
    orderId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment: string,
  ) => { ok: boolean; message: string };
  publishFarmerProduct: (input: PublishProductInput) => Product;
  toggleProductVisibility: (productId: string) => void;
  addHarvestDiaryEvent: (batchCode: string, event: Omit<BatchEvent, "id">) => void;
  addSeasonDiaryEntry: (input: AddSeasonDiaryInput) => DiaryEntry;
  createProductionSeason: (input: {
    farmId: string;
    cropName: string;
    variety: string;
    seasonName: string;
    expectedHarvestDate: string;
    areaHa: number;
    summary: string;
  }) => ProductionSeason;
  addOrUpdateCertification: (input: {
    farmId: string;
    standardType: FarmCertification["standardType"];
    status: CertificationStatus;
    scopeSummary: string;
  }) => FarmCertification;
  updateCredentialLifecycle: (
    recordId: string,
    nextStatus: CredentialLifecycleStatus,
    note: string,
    actorName?: string,
  ) => void;
  renewCredentialRecord: (recordId: string, actorName?: string) => CredentialRecord | null;
  holdOrRecallBatch: (
    batchCode: string,
    nextStatus: "quarantine" | "recalled" | "active",
    reason: string,
    actorName?: string,
  ) => { affectedCount: number; message: string };
  recordInventoryMovement: (input: {
    warehouseId: string;
    productId: string;
    type: InventoryMovement["type"];
    quantityDelta: number;
    reason: string;
    actorName: string;
  }) => { ok: boolean; message: string };
  advancePurchaseOrder: (
    poId: string,
    nextStatus: PurchaseOrder["status"],
    qcNote?: string,
  ) => void;
  settleMemberDelivery: (
    deliveryId: string,
    checkerName: string,
  ) => { ok: boolean; message: string };
  gradeStudentSubmission: (
    submissionId: string,
    score: number,
  ) => { ok: boolean; message: string };
  updateLogisticsTripStatus: (
    tripId: string,
    status: LogisticsTrip["status"],
    podNote?: string,
  ) => void;
  submitSupportRequest: (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => SupportRequest;
  acceptMission: (missionId: string, volunteerName?: string) => void;
  submitMissionEvidence: (missionId: string, evidenceNote: string, hours: number, evidenceImage?: string) => void;
  confirmMissionByFarmer: (missionId: string) => void;
  approveMissionHoursByCoordinator: (missionId: string, reviewerName?: string) => { ok: boolean; message: string };
  requestMissionRevision: (missionId: string, reason: string) => void;
  createLivestreamSession: (input: {
    title: string;
    farmId: string;
    scheduleLabel: string;
    hostYouth: string;
    pinnedProductId: string;
    summary: string;
  }) => LivestreamSession;
  submitExperienceBooking: (input: Omit<ExperienceBooking, "id" | "status">) => ExperienceBooking;
  reviewDocumentCase: (
    caseId: string,
    status: "Hồ sơ đã đối chiếu" | "Yêu cầu bổ sung",
    note: string,
  ) => void;
  toggleAdminGrant: (grantId: string, reason: string) => void;
  createSupportTicket: (input: {
    requesterName: string;
    roleLabel: string;
    category: string;
    subject: string;
    administrativeUnitCode: string;
    note: string;
  }) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void;
  resetDemoState: () => void;
}

const emptySubscribe = () => () => {};

const DemoStoreContext = createContext<DemoStoreContextValue | undefined>(undefined);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(getInitialState);
  const [storageReady, setStorageReady] = useState(false);
  const workspaceTouchedRef = useRef(false);
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<DemoState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            session: prev.session,
            profile: prev.profile,
            activeWorkspace: workspaceTouchedRef.current
              ? prev.activeWorkspace
              : parsed.activeWorkspace ?? prev.activeWorkspace,
            hideAiChatOnSubflow: false,
          }));
        }
      } catch {
        // Fallback safely if storage is unavailable
      } finally {
        setStorageReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      const serializable = { ...state, session: null, profile: null };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota exceptions
    }
  }, [state, storageReady]);

  const setActiveWorkspace = useCallback((ws: WorkspaceId) => {
    workspaceTouchedRef.current = true;
    setState((prev) => (prev.activeWorkspace === ws ? prev : { ...prev, activeWorkspace: ws }));
  }, []);

  const setActiveOrgKind = useCallback((kind: OrganizationKind) => {
    setState((prev) => ({ ...prev, activeOrgKind: kind }));
  }, []);

  const setActiveScopeUnitCode = useCallback((unitCode: string) => {
    setState((prev) => ({ ...prev, activeScopeUnitCode: unitCode }));
  }, []);

  const setHideAiChatOnSubflow = useCallback((hidden: boolean) => {
    setState((prev) =>
      prev.hideAiChatOnSubflow === hidden ? prev : { ...prev, hideAiChatOnSubflow: hidden },
    );
  }, []);

  const persistCart = useCallback((cart: CartItem[]) => {
    if (!supabase || !state.session) return;
    const userId = state.session.user.id;
    void (async () => {
      await supabase.from("cart_items").delete().eq("user_id", userId);
      if (cart.length) {
        await supabase.from("cart_items").insert(
          cart.map((item) => ({
            user_id: userId,
            product_id: item.productId,
            quantity: item.quantity,
            selected_option_label: item.selectedOptionLabel ?? null,
          })),
        );
      }
    })();
  }, [state.session]);

  const persistIds = useCallback(
    (table: "favorites" | "season_follows", ids: string[]) => {
      if (!supabase || !state.session) return;
      const userId = state.session.user.id;
      void (async () => {
        await supabase.from(table).delete().eq("user_id", userId);
        if (ids.length) {
          await supabase.from(table).insert(ids.map((id) => ({ user_id: userId, product_id: id })));
        }
      })();
    },
    [state.session],
  );

  const persistMission = useCallback((id: string, patch: Record<string, unknown>) => {
    if (!supabase) return;
    void supabase.from("missions").update(patch).eq("id", id).then(() => {});
  }, []);

  const activeClockIso = getActiveClockIso(state.clockOverrideIso);

  const setClockOverrideIso = useCallback((iso: string | null) => {
    setState((prev) => ({ ...prev, clockOverrideIso: iso }));
  }, []);

  const supabaseRealSignIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ ok: boolean; account?: DemoAuthAccount | null; message: string }> => {
      if (!supabase) return { ok: false, message: "Chế độ trải nghiệm — Supabase chưa kết nối." };
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { ok: false, message: error?.message ?? "Đăng nhập thất bại." };
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      const mapped = mapProfile((prof as Record<string, unknown>) ?? null);
      const account = mapped ? buildAccountFromProfile(mapped, email) : null;
      workspaceTouchedRef.current = true;
      setState((prev) => ({
        ...prev,
        session: data.session as Session | null,
        profile: mapped,
        authUser: account,
        activeWorkspace: account ? account.workspaceId : prev.activeWorkspace,
      }));
      return { ok: true, account, message: "Đăng nhập thành công." };
    },
    [],
  );

  const supabaseQuickSignIn = useCallback(
    async (
      accountId: string,
    ): Promise<{ ok: boolean; account?: DemoAuthAccount | null; message: string }> => {
      const found =
        state.demoAccounts.find((a) => a.id === accountId) ??
        state.roleBundleAccounts.find((a) => a.id === accountId) ??
        null;
      if (!found) return { ok: false, message: "Không tìm thấy tài khoản." };
      const applyDemoAccount = () => {
        workspaceTouchedRef.current = true;
        setState((prev) => ({
          ...prev,
          authUser: found,
          activeWorkspace: found.workspaceId,
          activeOrgKind: found.organizationKind ?? prev.activeOrgKind,
          activeScopeUnitCode: "ALL",
        }));
      };
      if (!supabase) {
        applyDemoAccount();
        return { ok: true, account: found, message: "Đăng nhập thành công." };
      }
      const realEmail = DEMO_REAL_EMAIL_MAP[found.emailDemo];
      if (!realEmail) {
        applyDemoAccount();
        return { ok: true, account: found, message: "Đăng nhập thành công." };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: DEMO_REAL_PASSWORD,
      });
      if (error || !data.user) {
        return { ok: false, message: error?.message ?? "Đăng nhập thất bại." };
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      const mapped = mapProfile((prof as Record<string, unknown>) ?? null);
      const account = mapped
        ? { ...found, ...buildAccountFromProfile(mapped, realEmail, found) }
        : found;
      workspaceTouchedRef.current = true;
      setState((prev) => ({
        ...prev,
        session: data.session as Session | null,
        profile: mapped,
        authUser: account,
        activeWorkspace: account.workspaceId,
        activeOrgKind: account.organizationKind ?? prev.activeOrgKind,
        activeScopeUnitCode: "ALL",
      }));
      return { ok: true, account, message: "Đăng nhập thành công." };
    },
    [state.demoAccounts, state.roleBundleAccounts],
  );

  const supabaseRealSignUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: AppRole,
    ): Promise<{ ok: boolean; message: string }> => {
      if (!supabase) return { ok: false, message: "Chế độ trải nghiệm — Supabase chưa kết nối." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (error || !data.user) {
        return { ok: false, message: error?.message ?? "Đăng ký thất bại." };
      }
      return { ok: true, message: "Đăng ký thành công! Vui lòng xác minh email để đăng nhập." };
    },
    [],
  );

  const supabaseResetPassword = useCallback(
    async (email: string): Promise<{ ok: boolean; message: string }> => {
      if (!supabase) return { ok: false, message: "Chế độ trải nghiệm — Supabase chưa kết nối." };
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/sign-in`,
      });
      if (error) return { ok: false, message: error.message };
      return {
        ok: true,
        message: "Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.",
      };
    },
    [],
  );

  useEffect(() => {
    if (!supabase || !storageReady) return;
    let mounted = true;

    void fetchCoreData()
      .then((core) => {
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          farms: core.farms.length ? core.farms : prev.farms,
          products: core.products.length ? core.products : prev.products,
          batches: core.batches.length ? core.batches : prev.batches,
          orders: core.orders.length ? core.orders : prev.orders,
          missions: core.missions.length ? core.missions : prev.missions,
          supportRequests: core.supportRequests.length ? core.supportRequests : prev.supportRequests,
          experienceBookings: core.experienceBookings.length ? core.experienceBookings : prev.experienceBookings,
          docCases: core.docCases.length ? core.docCases : prev.docCases,
          adminGrants: core.adminGrants.length ? core.adminGrants : prev.adminGrants,
          auditLogs: core.auditLogs.length ? core.auditLogs : prev.auditLogs,
          calendarEvents: core.calendarEvents.length ? core.calendarEvents : prev.calendarEvents,
          campaigns: core.campaigns.length ? core.campaigns : prev.campaigns,
          promotions: core.promotions.length ? core.promotions : prev.promotions,
          officialObservances: core.observances.length ? core.observances : prev.officialObservances,
          seasons: core.seasons.length ? core.seasons : prev.seasons,
          diaryEntries: core.diaryEntries.length ? core.diaryEntries : prev.diaryEntries,
          credentials: core.credentials.length ? core.credentials : prev.credentialRecords,
          lessons: core.lessons.length ? core.lessons : prev.lessons,
          studentSubmissions: core.submissions.length ? core.submissions : prev.studentSubmissions,
          schoolClasses: core.schoolClasses.length ? core.schoolClasses : prev.schoolClasses,
          cart: core.cartItems.length ? core.cartItems : prev.cart,
          favoriteProductIds: core.favoriteIds.length ? core.favoriteIds : prev.favoriteProductIds,
          followedProductIds: core.followedIds.length ? core.followedIds : prev.followedProductIds,
          notifications: core.notifications.length ? core.notifications : prev.notifications,
          tickets: core.tickets.length ? core.tickets : prev.tickets,
          addressBook: core.addressBook.length ? core.addressBook : prev.addressBook,
          organizations: core.partnerOrgs.length ? core.partnerOrgs : prev.organizations,
          sponsorCampaigns: core.sponsorCampaigns.length ? core.sponsorCampaigns : prev.sponsorCampaigns,
          warehouses: core.warehouses.length ? core.warehouses : prev.warehouses,
          warehouseStocks: core.warehouseStocks.length ? core.warehouseStocks : prev.warehouseStocks,
          inventoryMovements: core.inventoryMovements.length ? core.inventoryMovements : prev.inventoryMovements,
          suppliers: core.suppliers.length ? core.suppliers : prev.suppliers,
          purchaseOrders: core.purchaseOrders.length ? core.purchaseOrders : prev.purchaseOrders,
          coopPools: core.coopPools.length ? core.coopPools : prev.coopPools,
          memberDeliveries: core.memberDeliveries.length ? core.memberDeliveries : prev.memberDeliveries,
          expenses: core.expenses.length ? core.expenses : prev.expenses,
          receivablesPayables: core.receivablesPayables.length ? core.receivablesPayables : prev.receivablesPayables,
          refundRequests: core.refundRequests.length ? core.refundRequests : prev.refundRequests,
          volunteerHours: core.volunteerHours.length ? core.volunteerHours : prev.volunteerHours,
          logisticsTrips: core.logisticsTrips.length ? core.logisticsTrips : prev.logisticsTrips,
        }));
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [storageReady, state.session?.user.id]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted || !data.session) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (!mounted) return;
      const mapped = mapProfile((prof as Record<string, unknown>) ?? null);
      const account = mapped
        ? buildAccountFromProfile(mapped, data.session.user.email ?? "")
        : null;
      workspaceTouchedRef.current = true;
      setState((prev) => ({
        ...prev,
        session: data.session as Session | null,
        profile: mapped,
        authUser: account,
        activeWorkspace: mapped ? ROLE_WORKSPACE[mapped.role] : prev.activeWorkspace,
      }));
    };

    void bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      if (!nextSession) {
        setState((prev) => ({
          ...prev,
          session: null,
          profile: null,
          authUser: null,
          activeWorkspace: "W01",
        }));
        workspaceTouchedRef.current = false;
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", nextSession.user.id)
        .maybeSingle();
      if (!mounted) return;
      const mapped = mapProfile((prof as Record<string, unknown>) ?? null);
      const account = mapped
        ? buildAccountFromProfile(mapped, nextSession.user.email ?? "")
        : null;
      workspaceTouchedRef.current = true;
      setState((prev) => ({
        ...prev,
        session: nextSession as Session | null,
        profile: mapped,
        authUser: account,
        activeWorkspace: mapped ? ROLE_WORKSPACE[mapped.role] : prev.activeWorkspace,
      }));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInDemoAccount = (accountId: string) => {
    const found =
      state.demoAccounts.find((a) => a.id === accountId) ??
      state.roleBundleAccounts.find((a) => a.id === accountId) ??
      null;
    if (!found) return null;
    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      authUser: found,
      activeWorkspace: found.workspaceId,
      activeOrgKind: found.organizationKind ?? prev.activeOrgKind,
      activeScopeUnitCode: "ALL",
    }));
    return found;
  };

  const signUpDemoGuest = (input: SignUpGuestInput) => {
    const restricted: WorkspaceId[] = ["W04", "W05", "W06"];
    if (restricted.includes(input.requestedRole)) {
      return {
        ok: false,
        message:
          "Vai trò Điều phối (W04), Tổ chức (W05) và Quản trị (W06) không cấp từ đăng ký công khai; cần phân quyền nội bộ.",
      };
    }
    const unit = getAdministrativeUnitByCode(input.unitCode) ?? getAdministrativeUnitByCode("26041")!;
    const cleanName = input.name.trim();
    if (cleanName.length < 2) {
      return { ok: false, message: "Vui lòng nhập họ tên tối thiểu 2 ký tự." };
    }
    const initials = cleanName
      .split(/\s+/)
      .slice(-2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");
    const roleMap: Record<"W01" | "W02" | "W03", string> = {
      W01: "W01 · Cá nhân & Khách mua",
      W02: "W02 · Nhà nông",
      W03: "W03 · Thanh niên Tình nguyện",
    };
    const roleKey = (input.requestedRole === "W02" || input.requestedRole === "W03"
      ? input.requestedRole
      : "W01") as "W01" | "W02" | "W03";

    const created: DemoAuthAccount = {
      id: `user-custom-${Date.now()}`,
      name: cleanName,
      emailDemo: input.emailDemo.trim() || "thanhvien@example.com",
      roleLabel: roleMap[roleKey],
      workspaceId: roleKey,
      farmId: roleKey === "W02" ? "farm-ba-tu-demo" : undefined,
      avatarText: initials || "ND",
      avatarBg: roleKey === "W02" ? "#80520C" : roleKey === "W03" ? "#245B78" : "#245B3D",
      unitCode: unit.maDvhc,
      unitName: unit.tenDayDu,
      bio: `Tài khoản trải nghiệm tại ${unit.tenDayDu} (lưu cục bộ trên trình duyệt).`,
      canPublicSignUp: true,
    };

    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      demoAccounts: [created, ...prev.demoAccounts],
      authUser: created,
      activeWorkspace: created.workspaceId,
    }));
    return {
      ok: true,
      account: created,
      message: `Đã tạo và kích hoạt tài khoản ${created.name} (${created.roleLabel}).`,
    };
  };

  const signOutDemo = () => {
    if (supabase) {
      void supabase.auth.signOut();
    }
    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      session: null,
      profile: null,
      authUser: null,
      activeWorkspace: "W01",
      activeOrgKind: "coop",
      activeScopeUnitCode: "ALL",
      compareProductIds: [],
    }));
  };

  const markNotificationRead = (id: string) => {
    if (supabase) {
      void supabase.from("notifications").update({ read: true }).eq("id", id).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    if (supabase) {
      void supabase.from("notifications").update({ read: true }).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const addAddressEntry = (input: {
    label: string;
    recipientName: string;
    phoneDemo: string;
    detailAddress: string;
    administrativeUnitCode: string;
  }) => {
    const unit = getAdministrativeUnitByCode(input.administrativeUnitCode);
    if (!unit) {
      return { ok: false, message: "Vui lòng chọn Phường/Xã hợp lệ thuộc Thành phố Đồng Nai." };
    }
    const created: AddressBookEntry = {
      id: `ADDR-${Date.now()}`,
      label: input.label.trim() || "Địa chỉ nhận hàng",
      recipientName: input.recipientName.trim() || "Ngọc Linh",
      phoneDemo: input.phoneDemo.trim() || "090x xxx 000",
      detailAddress: input.detailAddress.trim(),
      administrativeUnitCode: unit.maDvhc,
      fullAddress: formatAdministrativeAddress(input.detailAddress, unit),
      isDefault: false,
    };
    setState((prev) => ({
      ...prev,
      addressBook: [created, ...prev.addressBook],
    }));
    if (supabase) {
      void supabase
        .from("address_book")
        .insert({
          id: created.id,
          label: created.label,
          recipient_name: created.recipientName,
          phone_demo: created.phoneDemo,
          detail_address: created.detailAddress,
          administrative_unit_code: created.administrativeUnitCode,
          full_address: created.fullAddress,
          is_default: created.isDefault,
          user_id: state.session?.user.id ?? null,
        })
        .then(() => {});
    }
    return { ok: true, message: `Đã lưu địa chỉ tại ${unit.tenDayDu}.` };
  };

  const removeAddressEntry = (id: string) => {
    if (supabase) {
      void supabase.from("address_book").delete().eq("id", id).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      addressBook: prev.addressBook.filter((a) => a.id !== id),
    }));
  };

  const addToCart = (productId: string, quantity = 1, optionLabel?: string) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, message: "Không tìm thấy sản phẩm." };
    const linkedBatch = state.batches.find((b) => b.batchCode === product.batchCode);
    if (
      linkedBatch &&
      (linkedBatch.lotStatus === "quarantine" ||
        linkedBatch.lotStatus === "recalled" ||
        linkedBatch.lotStatus === "expired")
    ) {
      return {
        ok: false,
        message: `Lô ${linkedBatch.batchCode} đang tạm giữ hoặc thu hồi kiểm tra, tạm ngừng đặt mua.`,
      };
    }
    if (product.stockKg <= 0 || product.seasonStatus !== "in_season") {
      return { ok: false, message: "Sản phẩm đang hẹn mùa hoặc hết hàng sẵn, chưa thể thêm vào giỏ." };
    }
    const existing = state.cart.find((c) => c.productId === productId);
    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (nextQty > product.stockKg) {
      return {
        ok: false,
        message: `Số lượng vượt tồn khả dụng (${product.stockKg} ${product.unitLabel}).`,
      };
    }
    setState((prev) => {
      const idx = prev.cart.findIndex((c) => c.productId === productId);
      const nextCart = [...prev.cart];
      if (idx >= 0) {
        nextCart[idx] = {
          ...nextCart[idx],
          quantity: Math.min(product.stockKg, nextCart[idx].quantity + quantity),
          selectedOptionLabel: optionLabel ?? nextCart[idx].selectedOptionLabel,
        };
      } else {
        nextCart.push({ productId, quantity, selectedOptionLabel: optionLabel });
      }
      persistCart(nextCart);
      return { ...prev, cart: nextCart };
    });
    return { ok: true, message: `Đã thêm ${product.name} vào giỏ hàng.` };
  };

  const updateCartQty = (productId: string, nextQty: number) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;
    setState((prev) => {
      if (nextQty <= 0) {
        const nextCart = prev.cart.filter((c) => c.productId !== productId);
        persistCart(nextCart);
        return { ...prev, cart: nextCart };
      }
      const clamped = Math.min(product.stockKg, nextQty);
      const nextCart = prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: clamped } : c));
      persistCart(nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const removeFromCart = (productId: string) => {
    setState((prev) => {
      const nextCart = prev.cart.filter((c) => c.productId !== productId);
      persistCart(nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const toggleFollowSeason = (productId: string) => {
    setState((prev) => {
      const exists = prev.followedProductIds.includes(productId);
      const next = exists
        ? prev.followedProductIds.filter((id) => id !== productId)
        : [...prev.followedProductIds, productId];
      persistIds("season_follows", next);
      return { ...prev, followedProductIds: next };
    });
  };

  const toggleFavorite = (productId: string) => {
    setState((prev) => {
      const exists = prev.favoriteProductIds.includes(productId);
      const next = exists
        ? prev.favoriteProductIds.filter((id) => id !== productId)
        : [...prev.favoriteProductIds, productId];
      persistIds("favorites", next);
      return { ...prev, favoriteProductIds: next };
    });
  };

  const markRecentlyViewed = useCallback((productId: string) => {
    setState((prev) => {
      if (prev.recentlyViewedIds[0] === productId) return prev;
      const filtered = prev.recentlyViewedIds.filter((id) => id !== productId);
      return { ...prev, recentlyViewedIds: [productId, ...filtered].slice(0, 8) };
    });
  }, []);

  const toggleCompareProduct = (productId: string) => {
    const target = state.products.find((p) => p.id === productId);
    if (!target) return { ok: false, message: "Không tìm thấy sản phẩm." };
    const exists = state.compareProductIds.includes(productId);
    if (exists) {
      setState((prev) => ({
        ...prev,
        compareProductIds: prev.compareProductIds.filter((id) => id !== productId),
      }));
      return { ok: true };
    }
    if (state.compareProductIds.length >= 3) {
      return { ok: false, message: "Chỉ so sánh tối đa 3 sản phẩm cùng lúc." };
    }
    if (state.compareProductIds.length > 0) {
      const first = state.products.find((p) => p.id === state.compareProductIds[0]);
      if (first && first.category !== target.category) {
        return {
          ok: false,
          message: `Chỉ so sánh sản phẩm cùng nhóm danh mục (${first.category}).`,
        };
      }
    }
    setState((prev) => ({
      ...prev,
      compareProductIds: [...prev.compareProductIds, productId],
    }));
    return { ok: true };
  };

  const clearCompareProducts = () => {
    setState((prev) => ({ ...prev, compareProductIds: [] }));
  };

  const toggleAppliedPromoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (!upper) return;
    setState((prev) => {
      const exists = prev.appliedPromoCodes.includes(upper);
      return {
        ...prev,
        appliedPromoCodes: exists
          ? prev.appliedPromoCodes.filter((c) => c !== upper)
          : [...prev.appliedPromoCodes, upper],
      };
    });
  };

  const clearAppliedPromoCodes = () => {
    setState((prev) => ({ ...prev, appliedPromoCodes: [] }));
  };

  const bookTourExperience: DemoStoreContextValue["bookTourExperience"] = (input) => {
    const tour = state.tourPackages.find((t) => t.slug === input.tourSlug);
    if (!tour) return { ok: false, message: "Không tìm thấy gói trải nghiệm vườn." };
    const slot = tour.slots.find((s) => s.id === input.slotId);
    if (!slot) return { ok: false, message: "Không tìm thấy khung giờ đã chọn." };
    const totalGuests = Math.max(0, input.adultCount) + Math.max(0, input.childCount);
    if (totalGuests < 1) return { ok: false, message: "Vui lòng chọn ít nhất 1 khách tham gia." };
    const remaining = Math.max(0, slot.capacity - slot.bookedCount);
    if (totalGuests > remaining) {
      return {
        ok: false,
        message: `Khung giờ chỉ còn ${remaining} chỗ trống (bạn đang chọn ${totalGuests} khách).`,
      };
    }
    if (input.schoolGroup && !input.schoolConsentVerified) {
      return {
        ok: false,
        message: "Đoàn trường học / học sinh bắt buộc xác nhận có đồng thuận của phụ huynh & phương án an toàn.",
      };
    }
    const totalEstimateVnd =
      input.adultCount * tour.adultPriceVnd + input.childCount * tour.childPriceVnd;
    const booking: ExperienceBooking = {
      id: `EXP-BOOK-${String(state.experienceBookings.length + 1).padStart(3, "0")}`,
      tourSlug: tour.slug,
      slotId: slot.id,
      farmId: tour.farmId,
      farmName: tour.farmName,
      packageTitle: tour.titleVi,
      packageTitleEn: tour.titleEn,
      guestName: input.guestName.trim() || state.authUser?.name || "Khách tham quan",
      guestCount: totalGuests,
      adultCount: input.adultCount,
      childCount: input.childCount,
      language: input.language,
      dateLabel: `${slot.dateIso.split("-").reverse().join("/")} · ${slot.startTime}`,
      allergenNote: input.allergenNote?.trim() || undefined,
      schoolGroup: Boolean(input.schoolGroup),
      schoolConsentVerified: Boolean(input.schoolConsentVerified),
      totalEstimateVnd,
      note: input.note.trim(),
      status: "Chờ nhà vườn xác nhận",
    };

    setState((prev) => ({
      ...prev,
      experienceBookings: [booking, ...prev.experienceBookings],
      tourPackages: prev.tourPackages.map((t) =>
        t.id !== tour.id
          ? t
          : {
              ...t,
              slots: t.slots.map((s) =>
                s.id !== slot.id
                  ? s
                  : {
                      ...s,
                      bookedCount: s.bookedCount + totalGuests,
                      status:
                        s.bookedCount + totalGuests >= s.capacity
                          ? "full"
                          : s.bookedCount + totalGuests >= s.capacity - 3
                          ? "almost_full"
                          : "open",
                    },
              ),
            },
      ),
    }));

    return {
      ok: true,
      booking,
      message: `Đã gửi yêu cầu đặt tour ${booking.id} (${totalGuests} khách) chờ ${tour.farmName} xác nhận.`,
    };
  };

  const updateExperienceBookingStatus: DemoStoreContextValue["updateExperienceBookingStatus"] = (
    bookingId,
    status,
    review,
  ) => {
    if (supabase) {
      void supabase
        .from("experience_bookings")
        .update({ status })
        .eq("id", bookingId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      experienceBookings: prev.experienceBookings.map((b) =>
        b.id !== bookingId
          ? b
          : {
              ...b,
              status,
              reviewRating: review?.rating ?? b.reviewRating,
              reviewComment: review?.comment ?? b.reviewComment,
            },
      ),
    }));
  };

  const upsertCalendarEvent: DemoStoreContextValue["upsertCalendarEvent"] = (ev) => {
    const existing = state.calendarEvents.find((c) => c.id === ev.id);
    if (existing?.isOfficialReadOnly) {
      return {
        ok: false,
        message: "Mốc ngày lễ/văn hóa chính thức trong Registry ở chế độ Chỉ đọc — không thể sửa đổi.",
      };
    }
    const overlaps = detectCalendarOverlap(state.calendarEvents, ev);
    if (supabase) {
      void supabase.from("calendar_events").upsert({
        id: ev.id,
        title: ev.title,
        title_en: ev.titleEn,
        description: ev.description,
        description_en: ev.descriptionEn,
        event_kind: ev.eventKind,
        classification: ev.classification,
        organizer: ev.organizer,
        status: ev.status,
        start_iso: ev.startIso,
        end_iso: ev.endIso,
        all_day: ev.allDay,
        timezone: ev.timezone,
        recurrence_rule: ev.recurrenceRule ?? null,
        priority: ev.priority,
        visibility: ev.visibility,
        administrative_unit_code: ev.administrativeUnitCode ?? null,
        farm_id: ev.farmId ?? null,
        organization_id: ev.organizationId ?? null,
        assigned_to: ev.assignedTo ?? null,
        linked_route: ev.linkedRoute ?? null,
        linked_entity_id: ev.linkedEntityId ?? null,
        location_label: ev.locationLabel ?? null,
        is_official_read_only: ev.isOfficialReadOnly ?? false,
      }).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      calendarEvents: existing
        ? prev.calendarEvents.map((c) => (c.id === ev.id ? ev : c))
        : [ev, ...prev.calendarEvents],
    }));
    return {
      ok: true,
      overlapCount: overlaps.length,
      message:
        overlaps.length > 0
          ? `Đã lưu lịch (${overlaps.length} lịch trùng khung giờ cùng vườn/người phụ trách).`
          : "Đã lưu sự kiện vào NaiCalendar.",
    };
  };

  const dismissReminder = (dedupeKey: string) => {
    setState((prev) =>
      prev.dismissedReminderKeys.includes(dedupeKey)
        ? prev
        : { ...prev, dismissedReminderKeys: [...prev.dismissedReminderKeys, dedupeKey] },
    );
  };

  const createCampaign: DemoStoreContextValue["createCampaign"] = (input) => {
    const created: CampaignRecord = {
      ...input,
      id: `CMP-CUSTOM-${Date.now().toString().slice(-5)}`,
      status: "submitted",
      budgetSpentVnd: 0,
      fixtureSessionsCount: 0,
      fixtureOrdersCount: 0,
      fixtureRevenueVnd: 0,
    };
    if (supabase) {
      void supabase.from("campaigns").insert({
        id: created.id,
        slug:
          created.slug ||
          created.titleVi
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        title_vi: created.titleVi,
        title_en: created.titleEn,
        subtitle_vi: created.subtitleVi,
        subtitle_en: created.subtitleEn,
        objective_vi: created.objectiveVi,
        objective_en: created.objectiveEn,
        classification: created.classification,
        organizer: created.organizer,
        target_audience: created.targetAudience,
        status: created.status,
        start_iso: created.startIso,
        end_iso: created.endIso,
        timezone: created.timezone,
        priority: created.priority,
        show_national_flag_accent: created.showNationalFlagAccent,
        banner_image: created.bannerImage,
        banner_alt_vi: created.bannerAltVi,
        banner_alt_en: created.bannerAltEn,
        primary_cta_label_vi: created.primaryCtaLabelVi,
        primary_cta_label_en: created.primaryCtaLabelEn,
        primary_cta_href: created.primaryCtaHref,
        maker_name: created.makerName,
        product_ids: created.productIds,
        farm_ids: created.farmIds,
        experience_slugs: created.experienceSlugs,
        live_ids: created.liveIds,
        lesson_slugs: created.lessonSlugs,
        promotion_ids: created.promotionIds,
        budget_planned_vnd: created.budgetPlannedVnd,
        budget_spent_vnd: 0,
        fixture_sessions_count: 0,
        fixture_orders_count: 0,
        fixture_revenue_vnd: 0,
        agenda_items: created.agendaItems,
      }).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      campaigns: [created, ...prev.campaigns],
    }));
    return created;
  };

  const advanceCampaignStatus: DemoStoreContextValue["advanceCampaignStatus"] = (
    campaignId,
    nextStatus,
    actorName,
  ) => {
    const cmp = state.campaigns.find((c) => c.id === campaignId);
    if (!cmp) return { ok: false, message: "Không tìm thấy chiến dịch." };
    if (nextStatus === "approved" || nextStatus === "active" || nextStatus === "scheduled") {
      const check = checkMakerChecker(cmp.makerName, actorName);
      if (!check.allowed) {
        return {
          ok: false,
          message:
            check.reason ?? "Người tạo chiến dịch không thể tự phê duyệt phát hành (Maker ≠ Checker).",
        };
      }
    }
    if (supabase) {
      void supabase
        .from("campaigns")
        .update({
          status: nextStatus,
          approver_name:
            nextStatus === "approved" || nextStatus === "scheduled" || nextStatus === "active"
              ? actorName
              : null,
        })
        .eq("id", campaignId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) =>
        c.id !== campaignId
          ? c
          : {
              ...c,
              status: nextStatus,
              approverName:
                nextStatus === "approved" || nextStatus === "scheduled" || nextStatus === "active"
                  ? actorName
                  : c.approverName,
            },
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: actorName,
          action: "CAMPAIGN_STATE_TRANSITION",
          target: campaignId,
          note: `Chuyển trạng thái chiến dịch -> ${nextStatus}`,
        },
        ...prev.auditLogs,
      ],
    }));
    return { ok: true, message: `Đã cập nhật trạng thái chiến dịch ${campaignId} → ${nextStatus}.` };
  };

  const submitInternationalInquiry: DemoStoreContextValue["submitInternationalInquiry"] = (input) => {
    const created: InternationalInquiry = {
      ...input,
      id: `INQ-${Date.now().toString().slice(-6)}`,
      createdAtIso: activeClockIso,
      status: "submitted_local",
    };
    setState((prev) => ({
      ...prev,
      internationalInquiries: [created, ...prev.internationalInquiries],
    }));
    return created;
  };

  const respondInternationalInquiry = (inquiryId: string, responseNote: string) => {
    setState((prev) => ({
      ...prev,
      internationalInquiries: prev.internationalInquiries.map((inq) =>
        inq.id === inquiryId
          ? { ...inq, status: "seller_responded", responseNote }
          : inq,
      ),
    }));
  };

  const recordLearningQuizAnswer = (lessonId: string, optionIndex: number, isCorrect: boolean) => {
    setState((prev) => {
      const alreadyCompleted = prev.learningProgress.completedLessonIds.includes(lessonId);
      const nextCompleted =
        isCorrect && !alreadyCompleted
          ? [...prev.learningProgress.completedLessonIds, lessonId]
          : prev.learningProgress.completedLessonIds;
      const pointDelta = isCorrect && !alreadyCompleted ? 20 : 0;
      return {
        ...prev,
        learningProgress: {
          ...prev.learningProgress,
          quizAnswers: { ...prev.learningProgress.quizAnswers, [lessonId]: optionIndex },
          completedLessonIds: nextCompleted,
          practicePoints: prev.learningProgress.practicePoints + pointDelta,
        },
      };
    });
  };

  const toggleMasteredPhrase = (phraseId: string) => {
    setState((prev) => {
      const exists = prev.learningProgress.masteredPhraseIds.includes(phraseId);
      return {
        ...prev,
        learningProgress: {
          ...prev.learningProgress,
          masteredPhraseIds: exists
            ? prev.learningProgress.masteredPhraseIds.filter((id) => id !== phraseId)
            : [...prev.learningProgress.masteredPhraseIds, phraseId],
          practicePoints: prev.learningProgress.practicePoints + (exists ? 0 : 10),
        },
      };
    });
  };

  const recordMatchedPair = (phraseId: string) => {
    setState((prev) => {
      if (prev.learningProgress.matchedPairIds.includes(phraseId)) return prev;
      return {
        ...prev,
        learningProgress: {
          ...prev.learningProgress,
          matchedPairIds: [...prev.learningProgress.matchedPairIds, phraseId],
          practicePoints: prev.learningProgress.practicePoints + 10,
        },
      };
    });
  };

  const recordRoleplayChoice = (scenarioId: string, optionId: string, scoreDelta: number) => {
    setState((prev) => {
      const prevPicked = prev.learningProgress.roleplayChoices[scenarioId];
      return {
        ...prev,
        learningProgress: {
          ...prev.learningProgress,
          roleplayChoices: { ...prev.learningProgress.roleplayChoices, [scenarioId]: optionId },
          practicePoints:
            prev.learningProgress.practicePoints + (!prevPicked && scoreDelta > 0 ? scoreDelta : 0),
        },
      };
    });
  };

  const resetLearningProgress = () => {
    setState((prev) => ({
      ...prev,
      learningProgress: {
        completedLessonIds: [],
        quizAnswers: {},
        masteredPhraseIds: [],
        matchedPairIds: [],
        roleplayChoices: {},
        practicePoints: 0,
        submittedArtifactNotes: {},
      },
    }));
  };

  const placeDemoOrder = (input: PlaceOrderInput) => {
    if (state.authUser?.isMinor) {
      return {
        ok: false,
        message: "Tài khoản học sinh dưới 18 tuổi không thực hiện giao dịch mua bán độc lập.",
      };
    }
    if (state.cart.length === 0) {
      return { ok: false, message: "Giỏ hàng đang trống." };
    }
    const lineItems = state.cart
      .map((c) => {
        const prod = state.products.find((p) => p.id === c.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          productName: prod.name,
          unitLabel: prod.unitLabel,
          quantity: c.quantity,
          unitPriceVnd: prod.priceVnd,
          costSnapshotVnd: prod.costVnd ?? Math.round(prod.priceVnd * 0.65),
          batchCode: prod.batchCode,
          image: prod.image,
          farmId: prod.farmId,
          farmName: prod.farmName,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (lineItems.length === 0) {
      return { ok: false, message: "Không có sản phẩm hợp lệ trong giỏ." };
    }

    for (const item of lineItems) {
      const p = state.products.find((x) => x.id === item.productId);
      const b = p ? state.batches.find((bat) => bat.batchCode === p.batchCode) : undefined;
      if (b && (b.lotStatus === "quarantine" || b.lotStatus === "recalled" || b.lotStatus === "expired")) {
        return { ok: false, message: `${item.productName} thuộc lô ${b.batchCode} đang tạm giữ, không thể đặt.` };
      }
      if (!p || item.quantity > p.stockKg) {
        return { ok: false, message: `${item.productName} vượt quá tồn khả dụng hiện tại.` };
      }
    }

    // Group cart items by seller (parent order + seller suborders)
    const groupedByFarm = new Map<string, typeof lineItems>();
    for (const item of lineItems) {
      const list = groupedByFarm.get(item.farmId) ?? [];
      list.push(item);
      groupedByFarm.set(item.farmId, list);
    }

    const parentOrderId = `PAR-2026-${String(Date.now()).slice(-6)}`;
    const couponList = [
      ...(input.couponCode?.trim() ? [input.couponCode.trim().toUpperCase()] : []),
      ...state.appliedPromoCodes,
    ];
    const couponNorm = couponList[0];
    const totalSubtotal = lineItems.reduce((s, i) => s + i.unitPriceVnd * i.quantity, 0);
    const baseShipping = input.deliveryMethod === "delivery" ? 20000 : 0;
    const promoEval = applyPromotionsToCart(
      state.promotions,
      couponList,
      totalSubtotal,
      baseShipping,
      "vi",
      activeClockIso || DEFAULT_CLOCK_ISO,
      Boolean(state.authUser?.isMinor),
    );
    const createdOrders: DemoOrder[] = [];
    let idxOffset = 0;

    for (const [farmId, farmItems] of groupedByFarm.entries()) {
      const subtotalVnd = farmItems.reduce((sum, i) => sum + i.unitPriceVnd * i.quantity, 0);
      const discountVnd =
        idxOffset === 0
          ? promoEval.totalMerchDiscountVnd > 0
            ? Math.min(subtotalVnd, promoEval.totalMerchDiscountVnd)
            : couponNorm === "NAIFARM10" && subtotalVnd >= 100000
            ? 10000
            : couponNorm === "MUAVU20" && subtotalVnd >= 200000
            ? 20000
            : 0
          : 0;
      const shippingFeeVnd =
        input.deliveryMethod === "delivery"
          ? Math.max(0, 20000 - (idxOffset === 0 ? promoEval.totalShipDiscountVnd : 0))
          : 0;
      const totalVnd = Math.max(0, subtotalVnd - discountVnd + shippingFeeVnd);
      const newId = `NF-ORD-DEMO-${String(10 + state.orders.length + idxOffset).padStart(2, "0")}`;
      idxOffset += 1;

      createdOrders.push({
        id: newId,
        parentOrderId,
        customerId: state.authUser?.id ?? "CUST-01",
        customerName: input.customerName.trim() || state.authUser?.name || "Ngọc Linh",
        customerPhoneDemo: input.customerPhoneDemo.trim() || "090x xxx 128",
        farmId,
        farmName: farmItems[0].farmName,
        administrativeUnitCode: state.authUser?.unitCode ?? "26041",
        items: farmItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          unitLabel: item.unitLabel,
          quantity: item.quantity,
          unitPriceVnd: item.unitPriceVnd,
          costSnapshotVnd: item.costSnapshotVnd,
          batchCode: item.batchCode,
          image: item.image,
        })),
        deliveryMethod: input.deliveryMethod,
        deliverySlotLabel:
          input.deliverySlotLabel ??
          (input.deliveryMethod === "pickup" ? "Nhận trực tiếp tại vườn" : "Khung giờ 14:00 – 17:30"),
        deliveryAddress:
          input.deliveryMethod === "pickup"
            ? `Nhận trực tiếp tại ${farmItems[0].farmName}`
            : input.deliveryAddress.trim() ||
              "Số 12 Đường Hà Huy Giáp, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam",
        subtotalVnd,
        discountVnd,
        taxVnd: 0,
        shippingFeeVnd,
        totalVnd,
        refundedMerchandiseVnd: 0,
        refundedShippingVnd: 0,
        platformFeeVnd: Math.round((subtotalVnd - discountVnd) * 0.05),
        couponCode: discountVnd > 0 ? couponNorm : undefined,
        paymentMethod: input.paymentMethod ?? "cod",
        paymentLabel:
          input.paymentMethod === "sepay_bank"
            ? "Chuyển khoản VietQR qua SePay (MBBank)"
            : "Thanh toán khi nhận hàng (không gian trải nghiệm)",
        paymentStatus: "unpaid",
        settlementStatus: "pending",
        status: "pending_confirm",
        orderDateIso: activeClockIso || DEFAULT_CLOCK_ISO,
        promisedDateIso: "2026-11-26T17:30:00+07:00",
        createdAtLabel: "25/11/2026 · Vừa đặt",
        timeline: [
          { step: "Khách gửi đơn hàng", time: "Vừa xong", done: true },
          { step: `${farmItems[0].farmName} xác nhận đơn`, time: "Đang chờ", done: false },
          { step: "Đóng gói & gắn mã QR lô hàng", time: "Chưa thực hiện", done: false },
          {
            step:
              input.deliveryMethod === "pickup"
                ? "Sẵn sàng nhận tại vườn"
                : "Chuyến xe mát giao hàng",
            time: "Chưa thực hiện",
            done: false,
          },
        ],
        isDemo: true,
      });
    }

    const appliedIds = new Set(promoEval.applied.map((a) => a.promo.id));

    if (supabase && state.session) {
      const userId = state.session.user.id;
      void (async () => {
        for (const order of createdOrders) {
          const { error } = await supabase.from("orders").insert({
            id: order.id,
            customer_id: userId,
            customer_name: order.customerName,
            customer_phone_demo: order.customerPhoneDemo,
            farm_id: order.farmId,
            farm_name: order.farmName,
            delivery_method: order.deliveryMethod,
            delivery_address: order.deliveryAddress,
            subtotal_vnd: order.subtotalVnd,
            shipping_fee_vnd: order.shippingFeeVnd,
            total_vnd: order.totalVnd,
            payment_label: order.paymentLabel,
            status: order.status,
            timeline: order.timeline,
            created_at_label: order.createdAtLabel,
          });
          if (error) continue;
          await supabase.from("order_items").insert(
            order.items.map((item) => ({
              order_id: order.id,
              product_id: item.productId,
              product_name: item.productName,
              unit_label: item.unitLabel,
              quantity: item.quantity,
              unit_price_vnd: item.unitPriceVnd,
              image: item.image,
            })),
          );
        }
        persistCart([]);
        const redeemedPromoIds = promoEval.applied.map((a) => a.promo.id);
        if (supabase && redeemedPromoIds.length) {
          void supabase.rpc("increment_promo_redemption", { promo_id: redeemedPromoIds[0], qty: redeemedPromoIds.length });
        }
      })();
    }

    setState((prev) => ({
      ...prev,
      orders: [...createdOrders, ...prev.orders],
      cart: [],
      appliedPromoCodes: [],
      promotions: prev.promotions.map((p) => {
        if (!appliedIds.has(p.id)) return p;
        const match = promoEval.applied.find((a) => a.promo.id === p.id);
        return {
          ...p,
          redeemedCount: p.redeemedCount + 1,
          stockUsedUnits: p.stockUsedUnits != null ? p.stockUsedUnits + 1 : p.stockUsedUnits,
          budgetUsedVnd: p.budgetUsedVnd + (match?.merchDiscountVnd ?? 0) + (match?.shipDiscountVnd ?? 0),
        };
      }),
      products: prev.products.map((p) => {
        const bought = lineItems.find((i) => i.productId === p.id);
        return bought ? { ...p, stockKg: Math.max(0, p.stockKg - bought.quantity) } : p;
      }),
    }));

    return {
      ok: true,
      orderId: createdOrders[0].id,
      orderIds: createdOrders.map((o) => o.id),
      orders: createdOrders,
      message:
        createdOrders.length > 1
          ? `Đã tách ${createdOrders.length} đơn theo từng nhà vườn (${createdOrders.map((o) => o.id).join(", ")}).`
          : `Đã ghi nhận đơn hàng ${createdOrders[0].id}.`,
    };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, cancelReason?: string) => {
    if (supabase) {
      void supabase
        .from("orders")
        .update({ status, cancel_reason: cancelReason ?? null })
        .eq("id", orderId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) => {
        if (ord.id !== orderId) return ord;
        const stepLabels: Record<OrderStatus, string[]> = {
          pending_confirm: ["Khách gửi đơn hàng"],
          preparing: ["Khách gửi đơn hàng", `${ord.farmName} đã xác nhận & đang chuẩn bị`],
          shipping: [
            "Khách gửi đơn hàng",
            `${ord.farmName} đã xác nhận`,
            "Đóng gói & dán tem QR",
            "Đang vận chuyển",
          ],
          ready_pickup: [
            "Khách gửi đơn hàng",
            `${ord.farmName} đã xác nhận`,
            "Đã soạn sẵn tại vườn chờ khách nhận",
          ],
          completed: [
            "Khách gửi đơn hàng",
            `${ord.farmName} đã xác nhận`,
            "Đóng gói & dán tem QR",
            "Đã bàn giao hoàn tất",
          ],
          cancelled: ["Khách gửi đơn hàng", `Đơn đã hủy (${cancelReason || "Chủ vườn cập nhật"})`],
        };
        const activeSteps = stepLabels[status];
        return {
          ...ord,
          status,
          confirmedAtIso: ord.confirmedAtIso ?? (status !== "pending_confirm" && status !== "cancelled" ? "2026-11-25T11:00:00+07:00" : undefined),
          completedAtIso: status === "completed" ? "2026-11-25T14:00:00+07:00" : ord.completedAtIso,
          deliveredDateIso: status === "completed" ? "2026-11-25T14:00:00+07:00" : ord.deliveredDateIso,
          paymentStatus: status === "completed" ? "collected_cod" : ord.paymentStatus,
          cancelReason: cancelReason ?? ord.cancelReason,
          timeline: activeSteps.map((s, idx) => ({
            step: s,
            time: idx === activeSteps.length - 1 ? "Cập nhật từ nhà vườn" : "Hoàn tất",
            done: true,
          })),
        };
      }),
    }));
  };

  const markOrderPaid = (
    orderId: string,
    transactionInfo?: { gateway?: string; referenceCode?: string; amountVnd?: number }
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) => {
        if (ord.id !== orderId && ord.parentOrderId !== orderId) return ord;
        return {
          ...ord,
          paymentStatus: "paid_bank",
          paymentLabel: `Đã thanh toán MBBank (SePay)${transactionInfo?.referenceCode ? ` · ${transactionInfo.referenceCode}` : ""}`,
          timeline: [
            ...ord.timeline,
            {
              step: "Xác nhận chuyển khoản MBBank (SePay)",
              time: "Vừa xong",
              done: true,
            },
          ],
        };
      }),
    }));
  };

  const requestOrderRefund = (
    orderId: string,
    reason: string,
    amountVnd: number,
    restockQty: number,
  ) => {
    const ord = state.orders.find((o) => o.id === orderId);
    if (!ord) return { ok: false, message: "Không tìm thấy đơn hàng." };
    const maxEligible = Math.max(0, ord.subtotalVnd - (ord.discountVnd ?? 0) - (ord.refundedMerchandiseVnd ?? 0));
    if (amountVnd <= 0 || amountVnd > maxEligible) {
      return {
        ok: false,
        message: `Số tiền hoàn (${amountVnd.toLocaleString("vi-VN")} đ) vượt quá phần hàng hóa hợp lệ còn lại (${maxEligible.toLocaleString("vi-VN")} đ).`,
      };
    }
    const created: RefundRequest = {
      id: `RF-${String(state.refundRequests.length + 1).padStart(2, "0")}`,
      orderId: ord.id,
      farmId: ord.farmId,
      requesterName: state.authUser?.name ?? ord.customerName,
      reason: reason.trim() || "Yêu cầu kiểm tra hoàn tiền một phần",
      amountVnd,
      restockQty: Math.max(0, restockQty),
      status: "pending_maker",
      makerName: state.authUser?.name ?? "CSKH NaiFarm",
      requestedDateIso: "2026-11-25",
    };
    setState((prev) => ({
      ...prev,
      refundRequests: [created, ...prev.refundRequests],
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: created.makerName,
          action: "CREATE_REFUND_REQUEST",
          target: `${created.id} (${ord.id})`,
          note: `Đề xuất hoàn ${amountVnd.toLocaleString("vi-VN")} đ — chờ bộ phận tài chính đối soát duyệt.`,
        },
        ...prev.auditLogs,
      ],
    }));
    if (supabase) {
      void supabase
        .from("refund_requests")
        .insert({
          id: created.id,
          order_id: created.orderId,
          farm_id: created.farmId,
          requester_name: created.requesterName,
          reason: created.reason,
          amount_vnd: created.amountVnd,
          restock_qty: created.restockQty,
          status: created.status,
          maker_name: created.makerName,
          requested_date_iso: created.requestedDateIso,
        })
        .then(() => {});
    }
    return { ok: true, message: `Đã gửi đề xuất hoàn tiền ${created.id} vào hàng chờ duyệt độc lập.` };
  };

  const decideRefundRequest = (
    refundId: string,
    decision: "approved_by_finance" | "rejected",
    checkerName: string,
  ) => {
    const rf = state.refundRequests.find((r) => r.id === refundId);
    if (!rf) return { ok: false, message: "Không tìm thấy yêu cầu hoàn tiền." };
    if (checkerName.trim().toLowerCase() === rf.makerName.trim().toLowerCase()) {
      return {
        ok: false,
        message: "Vi phạm tách quyền Maker–Checker: người lập yêu cầu không thể tự duyệt hoàn tiền.",
      };
    }

    setState((prev) => ({
      ...prev,
      refundRequests: prev.refundRequests.map((r) =>
        r.id === refundId ? { ...r, status: decision, checkerName } : r,
      ),
      orders:
        decision === "approved_by_finance"
          ? prev.orders.map((ord) => {
              if (ord.id !== rf.orderId) return ord;
              const nextRefunded = (ord.refundedMerchandiseVnd ?? 0) + rf.amountVnd;
              const isFull = nextRefunded >= Math.max(0, ord.subtotalVnd - (ord.discountVnd ?? 0));
              return {
                ...ord,
                refundedMerchandiseVnd: nextRefunded,
                refundedAtIso: "2026-11-25T15:00:00+07:00",
                paymentStatus: isFull ? "refunded_full" : "refunded_partial",
                items: ord.items.map((it, idx) =>
                  idx === 0 ? { ...it, restockedQty: (it.restockedQty ?? 0) + rf.restockQty } : it,
                ),
              };
            })
          : prev.orders,
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: checkerName,
          action: decision === "approved_by_finance" ? "APPROVE_REFUND" : "REJECT_REFUND",
          target: `${rf.id} (${rf.orderId})`,
          note: `Phê duyệt hoàn ${rf.amountVnd.toLocaleString("vi-VN")} đ (tồn nhập lại: ${rf.restockQty}).`,
        },
        ...prev.auditLogs,
      ],
    }));
    if (supabase) {
      void supabase
        .from("refund_requests")
        .update({ status: decision, checker_name: checkerName })
        .eq("id", refundId)
        .then(() => {});
    }
    return {
      ok: true,
      message:
        decision === "approved_by_finance"
          ? `Đã duyệt hoàn ${rf.amountVnd.toLocaleString("vi-VN")} đ cho đơn ${rf.orderId}.`
          : `Đã từ chối đề xuất hoàn tiền ${rf.id}.`,
    };
  };

  const submitProductReview = (
    productId: string,
    orderId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment: string,
  ) => {
    const order = state.orders.find(
      (o) => o.id === orderId && o.status === "completed" && o.items.some((i) => i.productId === productId),
    );
    if (!order) {
      return { ok: false, message: "Chỉ có thể gửi đánh giá sau khi đơn chứa sản phẩm đã hoàn thành." };
    }
    const created: ProductReviewEntry = {
      id: `REV-${Date.now()}`,
      productId,
      orderId,
      authorName: state.authUser?.name ?? order.customerName,
      rating,
      comment: comment.trim(),
      createdDateLabel: "25/11/2026",
      verifiedOrderPurchase: true,
    };
    setState((prev) => ({
      ...prev,
      productReviews: [created, ...prev.productReviews],
    }));
    return { ok: true, message: "Đã ghi nhận đánh giá từ đơn hàng hoàn thành." };
  };

  const publishFarmerProduct = (input: PublishProductInput) => {
    const farm = state.farms.find((f) => f.id === (input.farmId ?? "farm-ba-tu-demo")) ?? state.farms[1];
    const nextId = `P${String(state.products.length + 1).padStart(2, "0")}`;
    const slug = `${input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${nextId.toLowerCase()}`;
    const newProduct: Product = {
      id: nextId,
      skuCode: `NF-SKU-${nextId.slice(1)}`,
      slug,
      name: input.name,
      category: input.category,
      farmId: farm.id,
      farmName: farm.name,
      administrativeUnitCode: farm.administrativeUnitCode,
      administrativeUnitName: farm.administrativeUnitName,
      region: farm.administrativeUnitName,
      unitLabel: input.unitLabel || "kg",
      priceVnd: input.priceVnd,
      costVnd: Math.round((input.priceVnd * 0.66) / 500) * 500,
      stockKg: input.stockKg,
      seasonStatus: "in_season",
      batchCode: input.batchCode || "NF-DEMO-001",
      shortDescription: input.shortDescription,
      storyNote: "Sản phẩm vừa được nhà vườn duyệt bản nháp và đăng lên gian hàng.",
      image: input.image || "/images/stitch/stitch-53.jpg",
      gallery: [input.image || "/images/stitch/stitch-53.jpg"],
      tags: [input.name.toLowerCase(), farm.administrativeUnitName.toLowerCase()],
      sourceKind: "synthetic",
      isDemo: true,
    };

    if (supabase) {
      void supabase
        .from("products")
        .insert({
          id: newProduct.id,
          slug: newProduct.slug,
          name: newProduct.name,
          category: newProduct.category,
          farm_id: newProduct.farmId,
          farm_name: newProduct.farmName,
          region: newProduct.region,
          unit_label: newProduct.unitLabel,
          price_vnd: newProduct.priceVnd,
          stock_kg: newProduct.stockKg,
          season_status: newProduct.seasonStatus,
          batch_code: newProduct.batchCode,
          short_description: newProduct.shortDescription,
          image: newProduct.image,
          gallery: newProduct.gallery,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    return newProduct;
  };

  const toggleProductVisibility = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              seasonStatus: p.seasonStatus === "in_season" ? "out_of_season" : "in_season",
            }
          : p,
      ),
    }));
  };

  const addHarvestDiaryEvent = (batchCode: string, event: Omit<BatchEvent, "id">) => {
    if (supabase) {
      void supabase
        .from("batch_events")
        .insert({
          id: `ev-${Date.now()}`,
          batch_code: batchCode,
          date_label: event.dateLabel,
          title: event.title,
          detail: event.detail,
          actor_category: event.actorCategory,
          source_declaration: event.sourceDeclaration,
          photo: event.photo ?? null,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        b.batchCode === batchCode
          ? {
              ...b,
              events: [...b.events, { ...event, id: `ev-${Date.now()}` }],
            }
          : b,
      ),
    }));
  };

  const addSeasonDiaryEntry = (input: AddSeasonDiaryInput) => {
    const season =
      state.seasons.find((s) => s.id === input.seasonId) ?? state.seasons[0];
    const visibility = input.visibility ?? "public";
    const created: DiaryEntry = {
      id: `DIARY-${Date.now()}`,
      seasonId: season.id,
      batchCode: input.batchCode,
      farmId: season.farmId,
      farmName: season.farmName,
      dateLabel: "25/11/2026 · Vừa ghi nhận",
      stage: input.stage,
      title: input.title,
      detail: input.detail,
      actorName: input.actorName,
      sourceDeclaration: input.sourceDeclaration,
      photo: input.photo || "/images/stitch/stitch-32.jpg",
      visibility,
      version: 1,
      isDemo: true,
    };

    if (supabase) {
      void supabase
        .from("diary_entries")
        .insert({
          id: created.id,
          season_id: created.seasonId,
          batch_code: created.batchCode || null,
          farm_id: created.farmId || null,
          farm_name: created.farmName,
          date_label: created.dateLabel,
          stage: created.stage,
          title: created.title,
          detail: created.detail,
          actor_name: created.actorName,
          source_declaration: created.sourceDeclaration,
          photo: created.photo || null,
          visibility: visibility,
          version: created.version,
          user_id: state.session?.user.id ?? null,
        })
        .then(() => {});
    }

    setState((prev) => ({
      ...prev,
      diaryEntries: [created, ...prev.diaryEntries],
      batches: prev.batches.map((b) =>
        b.batchCode === input.batchCode
          ? {
              ...b,
              events: [
                ...b.events,
                {
                  id: `ev-${created.id}`,
                  dateLabel: created.dateLabel,
                  stage: created.stage,
                  title: created.title,
                  detail: created.detail,
                  actorCategory: created.actorName,
                  sourceDeclaration: created.sourceDeclaration,
                  photo: created.photo,
                  visibility,
                },
              ],
            }
          : b,
      ),
    }));
    return created;
  };

  const createProductionSeason = (input: {
    farmId: string;
    cropName: string;
    variety: string;
    seasonName: string;
    expectedHarvestDate: string;
    areaHa: number;
    summary: string;
  }) => {
    const farm = state.farms.find((f) => f.id === input.farmId) ?? state.farms[1];
    const created: ProductionSeason = {
      id: `SEASON-${String(state.seasons.length + 1).padStart(2, "0")}`,
      farmId: farm.id,
      farmName: farm.name,
      administrativeUnitCode: farm.administrativeUnitCode,
      administrativeUnitName: farm.administrativeUnitName,
      cropName: input.cropName,
      variety: input.variety,
      seasonName: input.seasonName,
      startDate: "25/11/2026",
      expectedHarvestDate: input.expectedHarvestDate,
      areaHa: input.areaHa,
      growingZoneCode: farm.growingZoneCode ?? `MAU-MSVT-${farm.administrativeUnitCode}-01`,
      status: "đang chăm sóc",
      summary: input.summary,
      batchCodes: [farm.id === "farm-ba-tu-demo" ? "NF-DEMO-001" : "NF-TT-2026-01"],
      isDemo: true,
    };
    if (supabase) {
      void supabase
        .from("seasons")
        .insert({
          id: created.id,
          farm_id: created.farmId,
          farm_name: created.farmName,
          administrative_unit_code: created.administrativeUnitCode,
          administrative_unit_name: created.administrativeUnitName,
          crop_name: created.cropName,
          variety: created.variety,
          season_name: created.seasonName,
          start_date: created.startDate,
          expected_harvest_date: created.expectedHarvestDate,
          area_ha: created.areaHa,
          growing_zone_code: created.growingZoneCode,
          status: created.status,
          summary: created.summary,
          batch_codes: created.batchCodes,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      seasons: [created, ...prev.seasons],
    }));
    return created;
  };

  const addOrUpdateCertification = (input: {
    farmId: string;
    standardType: FarmCertification["standardType"];
    status: CertificationStatus;
    scopeSummary: string;
  }) => {
    const farm = state.farms.find((f) => f.id === input.farmId) ?? state.farms[1];
    const labels: Record<CertificationStatus, string> = {
      ocop_declared_demo: "Hồ sơ tự khai OCOP",
      vietgap_declared_demo: "Tự khai quy trình VietGAP",
      coop_checked_demo: "HTX đã đối chiếu nội bộ",
      pending_review: "Đang chờ đối chiếu hồ sơ",
      needs_revision: "Cần bổ sung chứng từ",
      expired_demo: "Hồ sơ mẫu đã hết hạn",
      unverified: "Chưa đối chiếu hồ sơ",
    };
    const prefix =
      input.standardType === "VietGAP"
        ? "MAU-VG"
        : input.standardType === "OCOP"
        ? "MAU-OCOP"
        : input.standardType === "Mã số vùng trồng"
        ? "MAU-MSVT"
        : "MAU-ATTP";

    const created: FarmCertification = {
      id: `CERT-${Date.now()}`,
      farmId: farm.id,
      farmName: farm.name,
      administrativeUnitCode: farm.administrativeUnitCode,
      administrativeUnitName: farm.administrativeUnitName,
      standardType: input.standardType,
      certificateCode: `${prefix}-${String(state.certifications.length + 1).padStart(3, "0")}`,
      status: input.status,
      statusLabel: labels[input.status],
      scopeSummary: input.scopeSummary,
      issuerLabel: "Nhà vườn cập nhật hồ sơ mẫu",
      issuedDateDemo: "25/11/2026",
      validUntilDemo: "25/11/2028",
      qrBatchCode: farm.id === "farm-ba-tu-demo" ? "NF-DEMO-001" : "NF-TT-2026-01",
      disclaimer: "Hồ sơ mẫu trong không gian trải nghiệm — không có giá trị chứng nhận pháp lý.",
      isDemo: true,
    };
    setState((prev) => ({
      ...prev,
      certifications: [created, ...prev.certifications],
    }));
    if (supabase) {
      void supabase
        .from("credentials")
        .upsert(mapFarmCertificationToCredential(created, farm), { onConflict: "id" })
        .then(() => {});
    }
    return created;
  };

  const updateCredentialLifecycle = (
    recordId: string,
    nextStatus: CredentialLifecycleStatus,
    note: string,
    actorName = "Điều phối / Chuyên môn",
  ) => {
    if (supabase) {
      const patch: Record<string, unknown> = {
        lifecycle_status: nextStatus,
        checked_at: "2026-11-25",
        notes_internal: note,
      };
      if (nextStatus === "source_verified") patch.verification_level = "verifier_checked";
      if (nextStatus === "document_matched") patch.verification_level = "doc_matched";
      void supabase.from("credentials").update(patch).eq("id", recordId).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      credentialRecords: prev.credentialRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              lifecycleStatus: nextStatus,
              verificationLevel:
                nextStatus === "source_verified"
                  ? "verifier_checked"
                  : nextStatus === "document_matched"
                  ? "doc_matched"
                  : r.verificationLevel,
              checkedAt: "2026-11-25",
              notesInternal: note,
            }
          : r,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: actorName,
          action: "CREDENTIAL_STATUS_UPDATE",
          target: recordId,
          note: `${nextStatus}: ${note}`,
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const renewCredentialRecord = (recordId: string, actorName = "Nhà vườn / Quản lý HTX") => {
    const oldRec = state.credentialRecords.find((r) => r.id === recordId);
    if (!oldRec) return null;
    const renewed: CredentialRecord = {
      ...oldRec,
      id: `${oldRec.id}-R-${String(Date.now()).slice(-4)}`,
      certificateNumber: oldRec.certificateNumber ? `${oldRec.certificateNumber}-R2` : undefined,
      validFrom: "2026-11-25",
      validTo: "2028-11-25",
      lifecycleStatus: "pending_verification",
      verificationLevel: "self_declared",
      renewedFromId: oldRec.id,
      checkedAt: "2026-11-25",
    };
    if (supabase) {
      void supabase
        .from("credentials")
        .insert({
          id: renewed.id,
          type_id: renewed.typeId,
          holder_id: renewed.holderId,
          holder_legal_name: renewed.holderLegalName,
          product_ids: renewed.productIds,
          site_ids: renewed.siteIds,
          facility_ids: renewed.facilityIds,
          lot_ids: renewed.lotIds ?? null,
          issuer: renewed.issuer,
          certificate_number: renewed.certificateNumber ?? null,
          decision_number: renewed.decisionNumber ?? null,
          standard_version: renewed.standardVersion ?? null,
          issue_date: renewed.issueDate ?? null,
          valid_from: renewed.validFrom ?? null,
          valid_to: renewed.validTo ?? null,
          evidence_ids: renewed.evidenceIds,
          source_url: renewed.sourceUrl ?? null,
          source_published_at: renewed.sourcePublishedAt ?? null,
          checked_at: renewed.checkedAt ?? null,
          verification_level: renewed.verificationLevel,
          lifecycle_status: renewed.lifecycleStatus,
          scope_description: renewed.scopeDescription,
          origin: renewed.origin,
          permission_to_publish: renewed.permissionToPublish,
          notes_internal: renewed.notesInternal ?? null,
          renewed_from_id: renewed.renewedFromId ?? null,
          eligible_category_hint: renewed.eligibleCategoryHint,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      credentialRecords: [renewed, ...prev.credentialRecords],
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: actorName,
          action: "CREDENTIAL_RENEWAL_CREATED",
          target: `${renewed.id} <- ${oldRec.id}`,
          note: "Tạo bản ghi gia hạn mới liên kết lịch sử cũ (chờ đối chiếu).",
        },
        ...prev.auditLogs,
      ],
    }));
    return renewed;
  };

  const holdOrRecallBatch = (
    batchCode: string,
    nextStatus: "quarantine" | "recalled" | "active",
    reason: string,
    actorName = "Kiểm soát chất lượng (QC)",
  ) => {
    const impact = impactAnalysisForRecall(batchCode, state.batches, state.orders);
    const affectedSet = new Set(impact.affectedBatchCodes);
    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        affectedSet.has(b.batchCode.toUpperCase())
          ? {
              ...b,
              lotStatus: nextStatus,
              docStatus:
                nextStatus === "recalled"
                  ? "Đã tạm thu hồi kiểm tra"
                  : nextStatus === "quarantine"
                  ? "Đang tạm giữ chờ kiểm tra QC"
                  : "Đang lưu hành",
              events: [
                ...b.events,
                {
                  id: `ev-qc-${Date.now()}-${b.batchCode}`,
                  dateLabel: "25/11/2026 · Cập nhật QC",
                  stage: "Thu hoạch & Đóng gói",
                  title:
                    nextStatus === "recalled"
                      ? `Thu hồi lô ${b.batchCode}`
                      : nextStatus === "quarantine"
                      ? `Tạm giữ kiểm tra lô ${b.batchCode}`
                      : `Mở khóa lưu hành lô ${b.batchCode}`,
                  detail: reason,
                  actorCategory: actorName,
                  sourceDeclaration: "HTX đối chiếu",
                  visibility: "public",
                  eventType: nextStatus === "active" ? "release" : "recall",
                },
              ],
            }
          : b,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: actorName,
          action: `LOT_${nextStatus.toUpperCase()}`,
          target: impact.affectedBatchCodes.join(", "),
          note: `${reason} (Ảnh hưởng ${impact.affectedOrders.length} đơn).`,
        },
        ...prev.auditLogs,
      ],
    }));
    return {
      affectedCount: impact.affectedBatchCodes.length,
      message: `Đã cập nhật trạng thái "${nextStatus}" cho ${impact.affectedBatchCodes.length} lô liên quan.`,
    };
  };

  const recordInventoryMovement = (input: {
    warehouseId: string;
    productId: string;
    type: InventoryMovement["type"];
    quantityDelta: number;
    reason: string;
    actorName: string;
  }) => {
    if (!input.reason.trim()) {
      return { ok: false, message: "Bắt buộc nhập lý do khi điều chỉnh tồn kho." };
    }
    const stock = state.warehouseStocks.find(
      (s) => s.warehouseId === input.warehouseId && s.productId === input.productId,
    );
    const prod = state.products.find((p) => p.id === input.productId);
    const currentOnHand = stock?.onHandQty ?? prod?.stockKg ?? 0;
    const nextOnHand = currentOnHand + input.quantityDelta;
    if (nextOnHand < 0) {
      return { ok: false, message: "Tồn kho không thể âm sau khi điều chỉnh." };
    }

    const mv: InventoryMovement = {
      id: `MOV-${Date.now()}`,
      warehouseId: input.warehouseId,
      productId: input.productId,
      batchCode: stock?.batchCode ?? prod?.batchCode ?? "NF-DEMO-001",
      type: input.type,
      quantityDelta: input.quantityDelta,
      unitLabel: stock?.unitLabel ?? prod?.unitLabel ?? "kg",
      dateIso: "2026-11-25",
      actorName: input.actorName,
      reason: input.reason.trim(),
      isInternalTransfer: input.type === "transfer",
    };

    setState((prev) => ({
      ...prev,
      inventoryMovements: [mv, ...prev.inventoryMovements],
      warehouseStocks: stock
        ? prev.warehouseStocks.map((s) =>
            s.id === stock.id ? { ...s, onHandQty: Math.max(0, s.onHandQty + input.quantityDelta) } : s,
          )
        : prev.warehouseStocks,
      products: prev.products.map((p) =>
        p.id === input.productId ? { ...p, stockKg: Math.max(0, p.stockKg + input.quantityDelta) } : p,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: input.actorName,
          action: "INVENTORY_MOVEMENT",
          target: `${input.productId} (${input.quantityDelta >= 0 ? "+" : ""}${input.quantityDelta})`,
          note: input.reason.trim(),
        },
        ...prev.auditLogs,
      ],
    }));

    if (supabase) {
      void supabase
        .from("inventory_movements")
        .insert({
          id: mv.id,
          warehouse_id: mv.warehouseId,
          product_id: mv.productId,
          batch_code: mv.batchCode,
          type: mv.type,
          quantity_delta: mv.quantityDelta,
          unit_label: mv.unitLabel,
          date_iso: mv.dateIso,
          actor_name: mv.actorName,
          reason: mv.reason,
          is_internal_transfer: mv.isInternalTransfer ?? null,
        })
        .then(() => {});
    }

    return { ok: true, message: `Đã ghi nhận phiếu kho ${mv.id}.` };
  };

  const advancePurchaseOrder = (
    poId: string,
    nextStatus: PurchaseOrder["status"],
    qcNote?: string,
  ) => {
    if (supabase) {
      void supabase
        .from("purchase_orders")
        .update({ status: nextStatus, qc_note: qcNote ?? null })
        .eq("id", poId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((po) =>
        po.id === poId ? { ...po, status: nextStatus, qcNote: qcNote ?? po.qcNote } : po,
      ),
    }));
  };

  const settleMemberDelivery = (deliveryId: string, checkerName: string) => {
    const md = state.memberDeliveries.find((d) => d.id === deliveryId);
    if (!md) return { ok: false, message: "Không tìm thấy phiếu giao hàng xã viên." };
    if (checkerName.trim().toLowerCase() === md.makerName.trim().toLowerCase()) {
      return {
        ok: false,
        message: "Người lập phiếu thanh toán xã viên không thể tự duyệt đối soát.",
      };
    }
    if (supabase) {
      void supabase
        .from("member_deliveries")
        .update({ settlement_status: "da_duyet_thanh_toan", checker_name: checkerName })
        .eq("id", deliveryId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      memberDeliveries: prev.memberDeliveries.map((d) =>
        d.id === deliveryId
          ? { ...d, settlementStatus: "da_duyet_thanh_toan", checkerName }
          : d,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: checkerName,
          action: "SETTLE_COOP_MEMBER",
          target: md.id,
          note: `Duyệt chi trả ${md.netPayableVnd.toLocaleString("vi-VN")} đ cho ${md.memberFarmName}.`,
        },
        ...prev.auditLogs,
      ],
    }));
    return { ok: true, message: `Đã duyệt đối soát ${md.id} cho ${md.memberFarmName}.` };
  };

  const gradeStudentSubmission = (submissionId: string, score: number) => {
    const sub = state.studentSubmissions.find((s) => s.id === submissionId);
    if (!sub) return { ok: false, message: "Không tìm thấy bài nộp học sinh." };
    if (sub.isMinor && !sub.hasGuardianConsent) {
      return {
        ok: false,
        message: "Tài khoản học sinh nhỏ tuổi chưa có xác nhận đồng thuận của phụ huynh/người giám hộ.",
      };
    }
    if (supabase && state.session) {
      void supabase
        .from("student_submissions")
        .upsert({
          id: submissionId,
          class_id: sub.classId,
          student_name: sub.studentName,
          is_minor: sub.isMinor,
          has_guardian_consent: sub.hasGuardianConsent,
          title: sub.title,
          rubric_score: score,
          status: "graded",
          user_id: state.session.user.id,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      studentSubmissions: prev.studentSubmissions.map((s) =>
        s.id === submissionId ? { ...s, rubricScore: score, status: "graded" } : s,
      ),
    }));
    return { ok: true, message: `Đã chấm điểm ${score}/10 cho bài "${sub.title}".` };
  };

  const updateLogisticsTripStatus = (
    tripId: string,
    status: LogisticsTrip["status"],
    podNote?: string,
  ) => {
    if (supabase) {
      void supabase
        .from("logistics_trips")
        .update({ status, pod_note: podNote ?? null })
        .eq("id", tripId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      logisticsTrips: prev.logisticsTrips.map((t) =>
        t.id === tripId ? { ...t, status, podNote: podNote ?? t.podNote } : t,
      ),
    }));
  };

  const submitSupportRequest = (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => {
    const created: SupportRequest = {
      ...req,
      id: `REQ-${String(state.supportRequests.length + 1).padStart(2, "0")}`,
      status: "Chờ điều phối phân công",
      createdAtLabel: "25/11/2026 · Vừa gửi",
    };
    if (supabase) {
      void supabase
        .from("support_requests")
        .insert({
          id: created.id,
          farm_id: created.farmId,
          farm_name: created.farmName,
          title: created.title,
          need_type: created.needType,
          preferred_time: created.preferredTime,
          location_mode: created.locationMode,
          note: created.note,
          status: created.status,
          created_at_label: created.createdAtLabel,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      supportRequests: [created, ...prev.supportRequests],
    }));
    return created;
  };

  const acceptMission = (missionId: string, volunteerName = "Minh Anh") => {
    if (state.session) {
      persistMission(missionId, { status: "assigned", assignee_id: state.session.user.id });
    }
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, status: "assigned", assigneeName: volunteerName } : m,
      ),
    }));
  };

  const submitMissionEvidence = (
    missionId: string,
    evidenceNote: string,
    hours: number,
    evidenceImage = "/images/stitch/stitch-32.jpg",
  ) => {
    persistMission(missionId, {
      status: "submitted",
      evidence_note: evidenceNote,
      submitted_hours: hours,
      evidence_image: evidenceImage,
      revision_reason: null,
    });
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: "submitted",
              evidenceNote,
              submittedHours: hours,
              evidenceImage,
              revisionReason: undefined,
            }
          : m,
      ),
    }));
  };

  const confirmMissionByFarmer = (missionId: string) => {
    persistMission(missionId, { status: "farm_accepted" });
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, status: "farm_accepted" } : m,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: "Nhà vườn (W02)",
          action: "CONFIRM_DELIVERABLE",
          target: missionId,
          note: "Chủ vườn xác nhận đã nhận bàn giao sản phẩm từ thanh niên.",
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const approveMissionHoursByCoordinator = (missionId: string, reviewerName = "Thu Hà (Điều phối)") => {
    const m = state.missions.find((x) => x.id === missionId);
    if (!m) return { ok: false, message: "Không tìm thấy nhiệm vụ." };
    if (m.assigneeName && reviewerName.toLowerCase().includes(m.assigneeName.toLowerCase())) {
      return {
        ok: false,
        message: "Người thực hiện nhiệm vụ không được tự duyệt giờ công của chính mình.",
      };
    }
    if (m.status !== "farm_accepted") {
      return {
        ok: false,
        message: "Chưa đủ điều kiện: Nhà vườn (W02) phải xác nhận đã nhận bàn giao trước khi Điều phối duyệt giờ.",
      };
    }
    persistMission(missionId, {
      status: "coordinator_approved",
      approved_hours: m.submittedHours,
    });
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((x) =>
        x.id === missionId
          ? { ...x, status: "coordinator_approved", approvedHours: x.submittedHours }
          : x,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: reviewerName,
          action: "APPROVE_HOURS_LEDGER",
          target: `${missionId} (+${m.submittedHours} giờ)`,
          note: "Đã ghi sổ giờ tình nguyện độc lập sau xác nhận của chủ vườn.",
        },
        ...prev.auditLogs,
      ],
    }));
    return { ok: true, message: `Đã duyệt +${m.submittedHours} giờ cho ${m.id}.` };
  };

  const requestMissionRevision = (missionId: string, reason: string) => {
    persistMission(missionId, { status: "revision_requested", revision_reason: reason });
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((x) =>
        x.id === missionId ? { ...x, status: "revision_requested", revisionReason: reason } : x,
      ),
    }));
  };

  const createLivestreamSession = (input: {
    title: string;
    farmId: string;
    scheduleLabel: string;
    hostYouth: string;
    pinnedProductId: string;
    summary: string;
  }) => {
    const farm = state.farms.find((f) => f.id === input.farmId) ?? state.farms[0];
    const prod = state.products.find((p) => p.id === input.pinnedProductId);
    const created: LivestreamSession = {
      id: `NF-LIVE-${String(state.livestreams.length + 1).padStart(2, "0")}`,
      title: input.title,
      farmId: farm.id,
      farmName: farm.name,
      hostYouth: input.hostYouth || "Minh Anh (TNV)",
      farmerName: farm.ownerName,
      scheduleLabel: input.scheduleLabel,
      status: "scheduled",
      pinnedProductIds: [input.pinnedProductId],
      angles: [
        {
          id: "preview",
          label: "Ảnh bối cảnh vườn",
          image: prod?.image || farm.bannerImage,
          caption: `${farm.name} — lịch phát dự kiến.`,
        },
      ],
      summary: input.summary,
      isDemo: true,
    };
    setState((prev) => ({ ...prev, livestreams: [created, ...prev.livestreams] }));
    return created;
  };

  const submitExperienceBooking = (input: Omit<ExperienceBooking, "id" | "status">) => {
    const created: ExperienceBooking = {
      ...input,
      id: `EXP-BOOK-${String(state.experienceBookings.length + 1).padStart(2, "0")}`,
      status: "Chờ nhà vườn xác nhận",
    };
    if (supabase) {
      void supabase
        .from("experience_bookings")
        .insert({
          id: created.id,
          farm_id: created.farmId,
          farm_name: created.farmName,
          package_title: created.packageTitle,
          guest_name: created.guestName,
          guest_count: created.guestCount,
          date_label: created.dateLabel,
          note: created.note,
          status: created.status,
          guest_id: state.session?.user.id ?? null,
        })
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      experienceBookings: [created, ...prev.experienceBookings],
    }));
    return created;
  };

  const reviewDocumentCase = (
    caseId: string,
    status: "Hồ sơ đã đối chiếu" | "Yêu cầu bổ sung",
    note: string,
  ) => {
    const targetCase = state.docCases.find((d) => d.id === caseId);
    if (supabase) {
      void supabase
        .from("document_review_cases")
        .update({ status, reviewer_note: note })
        .eq("id", caseId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      docCases: prev.docCases.map((c) =>
        c.id === caseId ? { ...c, status, reviewerNote: note } : c,
      ),
      farms:
        targetCase && status === "Hồ sơ đã đối chiếu"
          ? prev.farms.map((f) =>
              f.id === targetCase.farmId
                ? { ...f, ocopStatus: "coop_checked_demo", ocopLabel: "Hồ sơ đã đối chiếu" }
                : f,
            )
          : prev.farms,
    }));
  };

  const toggleAdminGrant = (grantId: string, reason: string) => {
    const grant = state.adminGrants.find((g) => g.id === grantId);
    if (!grant) return;
    const beforeSummary = grant.active ? "Đang hiệu lực" : "Đã tạm thu hồi";
    const afterSummary = grant.active ? "Đã tạm thu hồi" : "Đang hiệu lực";
    if (supabase) {
      void supabase
        .from("admin_grants")
        .update({ active: !grant.active, last_reason: reason })
        .eq("id", grantId)
        .then(() => {});
    }
    setState((prev) => ({
      ...prev,
      adminGrants: prev.adminGrants.map((g) =>
        g.id === grantId ? { ...g, active: !g.active, lastReason: reason } : g,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: state.authUser?.name ?? "Quản trị Hệ thống",
          action: grant.active ? "REVOKE_GRANT" : "ENABLE_GRANT",
          target: grant.id,
          note: reason,
          beforeSummary,
          afterSummary,
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const createSupportTicket = (input: {
    requesterName: string;
    roleLabel: string;
    category: string;
    subject: string;
    administrativeUnitCode: string;
    note: string;
  }) => {
    const unit = getAdministrativeUnitByCode(input.administrativeUnitCode);
    const created: SupportTicket = {
      id: `TKT-${String(state.tickets.length + 1).padStart(2, "0")}`,
      requesterName: input.requesterName,
      roleLabel: input.roleLabel,
      category: input.category,
      subject: input.subject,
      administrativeUnitCode: unit?.maDvhc ?? "26041",
      administrativeUnitName: unit?.tenDayDu ?? "Phường Trấn Biên",
      status: "Mới tiếp nhận",
      priority: "Thường",
      createdAtLabel: "25/11/2026 · Vừa gửi",
      note: input.note,
    };
    setState((prev) => ({
      ...prev,
      tickets: [created, ...prev.tickets],
    }));
    if (supabase) {
      void supabase
        .from("tickets")
        .insert({
          id: created.id,
          requester_name: created.requesterName,
          role_label: created.roleLabel,
          category: created.category,
          subject: created.subject,
          administrative_unit_code: created.administrativeUnitCode,
          administrative_unit_name: created.administrativeUnitName,
          status: created.status,
          priority: created.priority,
          created_at_label: created.createdAtLabel,
          note: created.note,
          user_id: state.session?.user.id ?? null,
        })
        .then(() => {});
    }
    return created;
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    if (supabase) {
      void supabase.from("tickets").update({ status }).eq("id", ticketId).then(() => {});
    }
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
    }));
  };

  const resetDemoState = () => {
    const fresh = getInitialState();
    setState(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <DemoStoreContext.Provider
      value={{
        ...state,
        hydrated,
        activeClockIso,
        setClockOverrideIso,
        setActiveWorkspace,
        setActiveOrgKind,
        setActiveScopeUnitCode,
        setHideAiChatOnSubflow,
        signInDemoAccount,
        supabaseRealSignIn,
        supabaseQuickSignIn,
        supabaseRealSignUp,
        supabaseResetPassword,
        signUpDemoGuest,
        signOutDemo,
        toggleAppliedPromoCode,
        clearAppliedPromoCodes,
        bookTourExperience,
        updateExperienceBookingStatus,
        upsertCalendarEvent,
        dismissReminder,
        createCampaign,
        advanceCampaignStatus,
        submitInternationalInquiry,
        respondInternationalInquiry,
        recordLearningQuizAnswer,
        toggleMasteredPhrase,
        recordMatchedPair,
        recordRoleplayChoice,
        resetLearningProgress,
        markNotificationRead,
        markAllNotificationsRead,
        addAddressEntry,
        removeAddressEntry,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleFollowSeason,
        toggleFavorite,
        markRecentlyViewed,
        toggleCompareProduct,
        clearCompareProducts,
        placeDemoOrder,
        markOrderPaid,
        updateOrderStatus,
        requestOrderRefund,
        decideRefundRequest,
        submitProductReview,
        publishFarmerProduct,
        toggleProductVisibility,
        addHarvestDiaryEvent,
        addSeasonDiaryEntry,
        createProductionSeason,
        addOrUpdateCertification,
        updateCredentialLifecycle,
        renewCredentialRecord,
        holdOrRecallBatch,
        recordInventoryMovement,
        advancePurchaseOrder,
        settleMemberDelivery,
        gradeStudentSubmission,
        updateLogisticsTripStatus,
        submitSupportRequest,
        acceptMission,
        submitMissionEvidence,
        confirmMissionByFarmer,
        approveMissionHoursByCoordinator,
        requestMissionRevision,
        createLivestreamSession,
        submitExperienceBooking,
        reviewDocumentCase,
        toggleAdminGrant,
        createSupportTicket,
        updateTicketStatus,
        resetDemoState,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useAuth must be used inside DemoStoreProvider");
  return { session: ctx.session, profile: ctx.profile };
}
