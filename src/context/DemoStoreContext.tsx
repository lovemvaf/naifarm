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
} from "@/data/demo/partners-tickets";
import {
  INITIAL_ADMIN_GRANTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOC_CASES,
  INITIAL_EXPERIENCE_BOOKINGS,
} from "@/data/demo/community";
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
  AuditLogEntry,
  BatchEvent,
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
  InventoryMovement,
  LearningLesson,
  LivestreamSession,
  LogisticsTrip,
  MemberDelivery,
  MentorCase,
  OrderStatus,
  OrganizationKind,
  PartnerOrganization,
  Product,
  ProductReviewEntry,
  ProductionSeason,
  PurchaseOrder,
  ReceivablePayable,
  RefundRequest,
  SchoolClass,
  SponsorCampaign,
  StudentSubmission,
  Supplier,
  SupportRequest,
  SupportTicket,
  TraceBatch,
  UserNotification,
  VolunteerHourRecord,
  VolunteerMission,
  Warehouse,
  WarehouseStock,
  WorkspaceId,
} from "@/types/naifarm";

const STORAGE_KEY = "naifarm_demo_state_v3";

interface DemoState {
  activeWorkspace: WorkspaceId;
  activeOrgKind: OrganizationKind;
  activeScopeUnitCode: string;
  authUser: DemoAuthAccount | null;
  demoAccounts: DemoAuthAccount[];
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  certifications: FarmCertification[];
  credentialRecords: CredentialRecord[];
  seasons: ProductionSeason[];
  diaryEntries: DiaryEntry[];
  lessons: LearningLesson[];
  cart: CartItem[];
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
  experienceBookings: ExperienceBooking[];
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

function getInitialState(): DemoState {
  return {
    activeWorkspace: "W01",
    activeOrgKind: "coop",
    activeScopeUnitCode: "ALL",
    authUser: null,
    demoAccounts: DEMO_AUTH_ACCOUNTS,
    farms: INITIAL_FARMS,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
    certifications: INITIAL_CERTIFICATIONS,
    credentialRecords: INITIAL_CREDENTIAL_RECORDS,
    seasons: INITIAL_SEASONS,
    diaryEntries: INITIAL_DIARY_ENTRIES,
    lessons: INITIAL_LESSONS,
    cart: [
      {
        productId: "P01",
        quantity: 2,
        selectedOptionLabel: "2 kg (Giỏ gia đình)",
      },
    ],
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
    experienceBookings: INITIAL_EXPERIENCE_BOOKINGS,
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
  setActiveWorkspace: (ws: WorkspaceId) => void;
  setActiveOrgKind: (kind: OrganizationKind) => void;
  setActiveScopeUnitCode: (unitCode: string) => void;
  setHideAiChatOnSubflow: (hidden: boolean) => void;
  signInDemoAccount: (accountId: string) => DemoAuthAccount | null;
  signUpDemoGuest: (input: SignUpGuestInput) => { ok: boolean; account?: DemoAuthAccount; message: string };
  signOutDemo: () => void;
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
    message: string;
  };
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const signInDemoAccount = (accountId: string) => {
    const found = state.demoAccounts.find((a) => a.id === accountId) ?? null;
    if (!found) return null;
    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      authUser: found,
      activeWorkspace: found.workspaceId,
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
    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      authUser: null,
      activeWorkspace: "W01",
      activeOrgKind: "coop",
      activeScopeUnitCode: "ALL",
      compareProductIds: [],
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
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
    return { ok: true, message: `Đã lưu địa chỉ tại ${unit.tenDayDu}.` };
  };

  const removeAddressEntry = (id: string) => {
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
      return { ...prev, cart: nextCart };
    });
    return { ok: true, message: `Đã thêm ${product.name} vào giỏ hàng.` };
  };

  const updateCartQty = (productId: string, nextQty: number) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;
    setState((prev) => {
      if (nextQty <= 0) {
        return { ...prev, cart: prev.cart.filter((c) => c.productId !== productId) };
      }
      const clamped = Math.min(product.stockKg, nextQty);
      return {
        ...prev,
        cart: prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: clamped } : c)),
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => c.productId !== productId),
    }));
  };

  const toggleFollowSeason = (productId: string) => {
    setState((prev) => {
      const exists = prev.followedProductIds.includes(productId);
      return {
        ...prev,
        followedProductIds: exists
          ? prev.followedProductIds.filter((id) => id !== productId)
          : [...prev.followedProductIds, productId],
      };
    });
  };

  const toggleFavorite = (productId: string) => {
    setState((prev) => {
      const exists = prev.favoriteProductIds.includes(productId);
      return {
        ...prev,
        favoriteProductIds: exists
          ? prev.favoriteProductIds.filter((id) => id !== productId)
          : [...prev.favoriteProductIds, productId],
      };
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

  const placeDemoOrder = (input: PlaceOrderInput) => {
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
    const couponNorm = input.couponCode?.trim().toUpperCase();
    const createdOrders: DemoOrder[] = [];
    let idxOffset = 0;

    for (const [farmId, farmItems] of groupedByFarm.entries()) {
      const subtotalVnd = farmItems.reduce((sum, i) => sum + i.unitPriceVnd * i.quantity, 0);
      const discountVnd =
        idxOffset === 0 && couponNorm === "NAIFARM10" && subtotalVnd >= 100000
          ? 10000
          : idxOffset === 0 && couponNorm === "MUAVU20" && subtotalVnd >= 200000
          ? 20000
          : 0;
      const shippingFeeVnd = input.deliveryMethod === "delivery" ? 20000 : 0;
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
        paymentLabel: "Thanh toán khi nhận hàng (không gian trải nghiệm)",
        paymentStatus: "unpaid",
        settlementStatus: "pending",
        status: "pending_confirm",
        orderDateIso: "2026-11-25T10:30:00+07:00",
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

    setState((prev) => ({
      ...prev,
      orders: [...createdOrders, ...prev.orders],
      cart: [],
      products: prev.products.map((p) => {
        const bought = lineItems.find((i) => i.productId === p.id);
        return bought ? { ...p, stockKg: Math.max(0, p.stockKg - bought.quantity) } : p;
      }),
    }));

    return {
      ok: true,
      orderId: createdOrders[0].id,
      orderIds: createdOrders.map((o) => o.id),
      message:
        createdOrders.length > 1
          ? `Đã tách ${createdOrders.length} đơn theo từng nhà vườn (${createdOrders.map((o) => o.id).join(", ")}).`
          : `Đã ghi nhận đơn hàng ${createdOrders[0].id}.`,
    };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, cancelReason?: string) => {
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
    return created;
  };

  const updateCredentialLifecycle = (
    recordId: string,
    nextStatus: CredentialLifecycleStatus,
    note: string,
    actorName = "Điều phối / Chuyên môn",
  ) => {
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

    return { ok: true, message: `Đã ghi nhận phiếu kho ${mv.id}.` };
  };

  const advancePurchaseOrder = (
    poId: string,
    nextStatus: PurchaseOrder["status"],
    qcNote?: string,
  ) => {
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
    setState((prev) => ({
      ...prev,
      supportRequests: [created, ...prev.supportRequests],
    }));
    return created;
  };

  const acceptMission = (missionId: string, volunteerName = "Minh Anh") => {
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
    return created;
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
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
        setActiveWorkspace,
        setActiveOrgKind,
        setActiveScopeUnitCode,
        setHideAiChatOnSubflow,
        signInDemoAccount,
        signUpDemoGuest,
        signOutDemo,
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
