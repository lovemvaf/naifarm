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
import { getAdministrativeUnitByCode } from "@/lib/geography/administrative-lookup";
import { formatAdministrativeAddress } from "@/lib/geography/normalize-address";
import type {
  AddressBookEntry,
  AdminGrant,
  AuditLogEntry,
  BatchEvent,
  CartItem,
  CertificationStatus,
  DeliveryMethod,
  DemoAuthAccount,
  DemoOrder,
  DiaryEntry,
  DocumentReviewCase,
  ExperienceBooking,
  Farm,
  FarmCertification,
  LearningLesson,
  LivestreamSession,
  OrderStatus,
  PartnerOrganization,
  Product,
  ProductionSeason,
  SupportRequest,
  SupportTicket,
  TraceBatch,
  UserNotification,
  VolunteerHourRecord,
  VolunteerMission,
  WorkspaceId,
} from "@/types/naifarm";

const STORAGE_KEY = "naifarm_demo_state_v2";

interface DemoState {
  activeWorkspace: WorkspaceId;
  authUser: DemoAuthAccount | null;
  demoAccounts: DemoAuthAccount[];
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  certifications: FarmCertification[];
  seasons: ProductionSeason[];
  diaryEntries: DiaryEntry[];
  lessons: LearningLesson[];
  cart: CartItem[];
  followedProductIds: string[];
  favoriteProductIds: string[];
  orders: DemoOrder[];
  missions: VolunteerMission[];
  volunteerHours: VolunteerHourRecord[];
  supportRequests: SupportRequest[];
  livestreams: LivestreamSession[];
  experienceBookings: ExperienceBooking[];
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
    authUser: null,
    demoAccounts: DEMO_AUTH_ACCOUNTS,
    farms: INITIAL_FARMS,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
    certifications: INITIAL_CERTIFICATIONS,
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
    orders: INITIAL_ORDERS,
    missions: INITIAL_MISSIONS,
    volunteerHours: INITIAL_VOLUNTEER_HOURS,
    supportRequests: INITIAL_SUPPORT_REQUESTS,
    livestreams: INITIAL_LIVESTREAMS,
    experienceBookings: INITIAL_EXPERIENCE_BOOKINGS,
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
}

interface DemoStoreContextValue extends DemoState {
  hydrated: boolean;
  setActiveWorkspace: (ws: WorkspaceId) => void;
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
  placeDemoOrder: (input: PlaceOrderInput) => { ok: boolean; orderId?: string; message: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => void;
  publishFarmerProduct: (input: PublishProductInput) => Product;
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
  submitSupportRequest: (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => SupportRequest;
  acceptMission: (missionId: string, volunteerName?: string) => void;
  submitMissionEvidence: (missionId: string, evidenceNote: string, hours: number, evidenceImage?: string) => void;
  confirmMissionByFarmer: (missionId: string) => void;
  approveMissionHoursByCoordinator: (missionId: string) => { ok: boolean; message: string };
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
    status: "Hồ sơ đã đối chiếu (Demo)" | "Yêu cầu bổ sung",
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
        // Fallback safely to initial dataset if storage is blocked
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
      W02: "W02 · Nhà nông (Đăng ký Demo)",
      W03: "W03 · Thanh niên Tình nguyện",
    };
    const roleKey = (input.requestedRole === "W02" || input.requestedRole === "W03"
      ? input.requestedRole
      : "W01") as "W01" | "W02" | "W03";

    const created: DemoAuthAccount = {
      id: `demo-custom-${Date.now()}`,
      name: cleanName,
      emailDemo: input.emailDemo.trim() || "thanhvien.moi@naifarm-demo.local",
      roleLabel: roleMap[roleKey],
      workspaceId: roleKey,
      farmId: roleKey === "W02" ? "farm-ba-tu-demo" : undefined,
      avatarText: initials || "ND",
      avatarBg: roleKey === "W02" ? "#80520C" : roleKey === "W03" ? "#245B78" : "#245B3D",
      unitCode: unit.maDvhc,
      unitName: unit.tenDayDu,
      bio: `Tài khoản trải nghiệm demo mới tạo tại ${unit.tenDayDu} (chỉ lưu trong trình duyệt).`,
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
      message: `Đã kích hoạt tài khoản demo ${created.name} (${created.roleLabel}).`,
    };
  };

  const signOutDemo = () => {
    workspaceTouchedRef.current = true;
    setState((prev) => ({
      ...prev,
      authUser: null,
      activeWorkspace: "W01",
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
      phoneDemo: input.phoneDemo.trim() || "090x xxx 000 (Demo)",
      detailAddress: input.detailAddress.trim(),
      administrativeUnitCode: unit.maDvhc,
      fullAddress: `${formatAdministrativeAddress(input.detailAddress, unit)} (Địa chỉ minh họa)`,
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
    if (product.stockKg <= 0 || product.seasonStatus !== "in_season") {
      return { ok: false, message: "Sản phẩm đang hẹn mùa hoặc hết mùa, chưa thể thêm vào giỏ." };
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
    return { ok: true, message: `Đã thêm ${product.name} vào giỏ hàng demo.` };
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

  const placeDemoOrder = (input: PlaceOrderInput) => {
    if (state.cart.length === 0) {
      return { ok: false, message: "Giỏ hàng đang trống." };
    }
    const items = state.cart
      .map((c) => {
        const prod = state.products.find((p) => p.id === c.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          productName: prod.name,
          unitLabel: prod.unitLabel,
          quantity: c.quantity,
          unitPriceVnd: prod.priceVnd,
          image: prod.image,
          farmId: prod.farmId,
          farmName: prod.farmName,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (items.length === 0) {
      return { ok: false, message: "Không có sản phẩm hợp lệ trong giỏ." };
    }

    for (const item of items) {
      const p = state.products.find((x) => x.id === item.productId);
      if (!p || item.quantity > p.stockKg) {
        return { ok: false, message: `${item.productName} vượt quá tồn kho demo hiện tại.` };
      }
    }

    const subtotalVnd = items.reduce((sum, i) => sum + i.unitPriceVnd * i.quantity, 0);
    const shippingFeeVnd = input.deliveryMethod === "delivery" ? 20000 : 0;
    const totalVnd = subtotalVnd + shippingFeeVnd;
    const newId = `NF-ORD-DEMO-${String(10 + state.orders.length).padStart(2, "0")}`;

    const newOrder: DemoOrder = {
      id: newId,
      customerName: input.customerName.trim() || state.authUser?.name || "Ngọc Linh (Demo)",
      customerPhoneDemo: input.customerPhoneDemo.trim() || "090x xxx 128",
      farmId: items[0].farmId,
      farmName: items[0].farmName,
      administrativeUnitCode: state.authUser?.unitCode ?? "26041",
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitLabel: item.unitLabel,
        quantity: item.quantity,
        unitPriceVnd: item.unitPriceVnd,
        image: item.image,
      })),
      deliveryMethod: input.deliveryMethod,
      deliveryAddress:
        input.deliveryMethod === "pickup"
          ? `Nhận trực tiếp tại ${items[0].farmName}`
          : input.deliveryAddress.trim() ||
            "Số 12 Đường Hà Huy Giáp, Phường Trấn Biên, Thành phố Đồng Nai, Việt Nam (Địa chỉ minh họa)",
      subtotalVnd,
      shippingFeeVnd,
      totalVnd,
      paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)",
      status: "pending_confirm",
      createdAtLabel: "25/11/2026 · Vừa đặt (Demo)",
      timeline: [
        { step: "Khách đặt đơn COD (Demo)", time: "Vừa xong", done: true },
        { step: `${items[0].farmName} xác nhận đơn`, time: "Đang chờ", done: false },
        { step: "Đóng gói & gắn mã QR lô hàng", time: "Chưa thực hiện", done: false },
        {
          step: input.deliveryMethod === "pickup" ? "Sẵn sàng nhận tại vườn" : "Chuyến xe mát giao hàng",
          time: "Chưa thực hiện",
          done: false,
        },
      ],
      isDemo: true,
    };

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      cart: [],
      products: prev.products.map((p) => {
        const bought = items.find((i) => i.productId === p.id);
        return bought ? { ...p, stockKg: Math.max(0, p.stockKg - bought.quantity) } : p;
      }),
    }));

    return { ok: true, orderId: newId, message: `Đã tạo đơn hàng demo ${newId}.` };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, cancelReason?: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) => {
        if (ord.id !== orderId) return ord;
        const stepLabels: Record<OrderStatus, string[]> = {
          pending_confirm: ["Khách đặt đơn COD (Demo)"],
          preparing: ["Khách đặt đơn COD (Demo)", `${ord.farmName} đã xác nhận & đang chuẩn bị`],
          shipping: [
            "Khách đặt đơn COD (Demo)",
            `${ord.farmName} đã xác nhận`,
            "Đóng gói & dán tem QR",
            "Đang vận chuyển (Demo)",
          ],
          ready_pickup: [
            "Khách đặt đơn COD (Demo)",
            `${ord.farmName} đã xác nhận`,
            "Đã soạn sẵn tại vườn chờ khách nhận",
          ],
          completed: [
            "Khách đặt đơn COD (Demo)",
            `${ord.farmName} đã xác nhận`,
            "Đóng gói & dán tem QR",
            "Đã bàn giao hoàn tất (Demo)",
          ],
          cancelled: ["Khách đặt đơn COD (Demo)", `Đơn đã hủy (${cancelReason || "Chủ vườn cập nhật"})`],
        };
        const activeSteps = stepLabels[status];
        return {
          ...ord,
          status,
          cancelReason: cancelReason ?? ord.cancelReason,
          timeline: activeSteps.map((s, idx) => ({
            step: s,
            time: idx === activeSteps.length - 1 ? "Cập nhật từ W02" : "Hoàn tất",
            done: true,
          })),
        };
      }),
    }));
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
      stockKg: input.stockKg,
      seasonStatus: "in_season",
      batchCode: input.batchCode || "NF-DEMO-001",
      shortDescription: input.shortDescription,
      storyNote: "Sản phẩm vừa được nhà vườn duyệt bản nháp và đăng từ Không gian Nhà nông (Demo).",
      image: input.image || "/images/stitch/stitch-53.jpg",
      gallery: [input.image || "/images/stitch/stitch-53.jpg"],
      tags: [input.name.toLowerCase(), farm.administrativeUnitName.toLowerCase()],
      isDemo: true,
    };

    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    return newProduct;
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
      growingZoneCode: farm.growingZoneCode ?? `DEMO-MSVT-${farm.administrativeUnitCode}-01`,
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
      ocop_declared_demo: "Tự khai OCOP (Demo)",
      vietgap_declared_demo: "Tự khai VietGAP (Demo)",
      coop_checked_demo: "HTX đã đối chiếu nội bộ (Demo)",
      pending_review: "Đang chờ đối chiếu hồ sơ (Demo)",
      needs_revision: "Cần bổ sung chứng từ (Demo)",
      expired_demo: "Hồ sơ mẫu đã hết hạn (Demo)",
      unverified: "Chưa có chứng nhận chính thức",
    };
    const prefix =
      input.standardType === "VietGAP"
        ? "DEMO-VG"
        : input.standardType === "OCOP"
        ? "DEMO-OCOP"
        : input.standardType === "Mã số vùng trồng"
        ? "DEMO-MSVT"
        : "DEMO-ATTP";

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
      issuerLabel: "Nhà vườn cập nhật minh họa trên NaiFarm (Demo)",
      issuedDateDemo: "25/11/2026",
      validUntilDemo: "25/11/2028",
      qrBatchCode: farm.id === "farm-ba-tu-demo" ? "NF-DEMO-001" : "NF-TT-2026-01",
      disclaimer: "Hồ sơ chứng nhận minh họa — không có giá trị chứng nhận pháp lý.",
      isDemo: true,
    };
    setState((prev) => ({
      ...prev,
      certifications: [created, ...prev.certifications],
    }));
    return created;
  };

  const submitSupportRequest = (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => {
    const created: SupportRequest = {
      ...req,
      id: `REQ-DEMO-${String(state.supportRequests.length + 1).padStart(2, "0")}`,
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

  const approveMissionHoursByCoordinator = (missionId: string) => {
    const m = state.missions.find((x) => x.id === missionId);
    if (!m) return { ok: false, message: "Không tìm thấy nhiệm vụ." };
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
          actor: "Thu Hà (Điều phối W04)",
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
          caption: `${farm.name} — lịch phát dự kiến (Demo).`,
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
    status: "Hồ sơ đã đối chiếu (Demo)" | "Yêu cầu bổ sung",
    note: string,
  ) => {
    const targetCase = state.docCases.find((d) => d.id === caseId);
    setState((prev) => ({
      ...prev,
      docCases: prev.docCases.map((c) =>
        c.id === caseId ? { ...c, status, reviewerNote: note } : c,
      ),
      farms:
        targetCase && status === "Hồ sơ đã đối chiếu (Demo)"
          ? prev.farms.map((f) =>
              f.id === targetCase.farmId
                ? { ...f, ocopStatus: "coop_checked_demo", ocopLabel: "Hồ sơ đã đối chiếu (Demo)" }
                : f,
            )
          : prev.farms,
    }));
  };

  const toggleAdminGrant = (grantId: string, reason: string) => {
    const grant = state.adminGrants.find((g) => g.id === grantId);
    if (!grant) return;
    setState((prev) => ({
      ...prev,
      adminGrants: prev.adminGrants.map((g) =>
        g.id === grantId ? { ...g, active: !g.active, lastReason: reason } : g,
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "25/11/2026 Hiện tại",
          actor: "Admin Demo (W06)",
          action: grant.active ? "REVOKE_GRANT_DEMO" : "ENABLE_GRANT_DEMO",
          target: grant.id,
          note: reason,
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
      status: "Mới tiếp nhận (Demo)",
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
        placeDemoOrder,
        updateOrderStatus,
        publishFarmerProduct,
        addHarvestDiaryEvent,
        addSeasonDiaryEntry,
        createProductionSeason,
        addOrUpdateCertification,
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
