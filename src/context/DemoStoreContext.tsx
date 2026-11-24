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
import { INITIAL_ORDERS } from "@/data/demo/orders";
import { INITIAL_MISSIONS, INITIAL_SUPPORT_REQUESTS } from "@/data/demo/missions";
import { INITIAL_LIVESTREAMS } from "@/data/demo/livestreams";
import {
  INITIAL_ADMIN_GRANTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOC_CASES,
  INITIAL_EXPERIENCE_BOOKINGS,
} from "@/data/demo/community";
import type {
  AdminGrant,
  AuditLogEntry,
  BatchEvent,
  CartItem,
  DeliveryMethod,
  DemoOrder,
  DocumentReviewCase,
  ExperienceBooking,
  Farm,
  LivestreamSession,
  OrderStatus,
  Product,
  SupportRequest,
  TraceBatch,
  VolunteerMission,
  WorkspaceId,
} from "@/types/naifarm";

const STORAGE_KEY = "naifarm_demo_state_v1";

interface DemoState {
  activeWorkspace: WorkspaceId;
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  cart: CartItem[];
  followedProductIds: string[];
  favoriteProductIds: string[];
  orders: DemoOrder[];
  missions: VolunteerMission[];
  supportRequests: SupportRequest[];
  livestreams: LivestreamSession[];
  experienceBookings: ExperienceBooking[];
  docCases: DocumentReviewCase[];
  adminGrants: AdminGrant[];
  auditLogs: AuditLogEntry[];
  hideAiChatOnSubflow: boolean;
}

function getInitialState(): DemoState {
  return {
    activeWorkspace: "W01",
    farms: INITIAL_FARMS,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
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
    supportRequests: INITIAL_SUPPORT_REQUESTS,
    livestreams: INITIAL_LIVESTREAMS,
    experienceBookings: INITIAL_EXPERIENCE_BOOKINGS,
    docCases: INITIAL_DOC_CASES,
    adminGrants: INITIAL_ADMIN_GRANTS,
    auditLogs: INITIAL_AUDIT_LOGS,
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

interface DemoStoreContextValue extends DemoState {
  hydrated: boolean;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  setHideAiChatOnSubflow: (hidden: boolean) => void;
  addToCart: (productId: string, quantity?: number, optionLabel?: string) => { ok: boolean; message: string };
  updateCartQty: (productId: string, nextQty: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFollowSeason: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  placeDemoOrder: (input: PlaceOrderInput) => { ok: boolean; orderId?: string; message: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => void;
  publishFarmerProduct: (input: PublishProductInput) => Product;
  addHarvestDiaryEvent: (batchCode: string, event: Omit<BatchEvent, "id">) => void;
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
    note: string
  ) => void;
  toggleAdminGrant: (grantId: string, reason: string) => void;
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
    () => false
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
        // Fallback safely to default seed if storage is unavailable
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
      // Ignore quota errors in private browsing
    }
  }, [state, storageReady]);

  const setActiveWorkspace = useCallback((ws: WorkspaceId) => {
    workspaceTouchedRef.current = true;
    setState((prev) => (prev.activeWorkspace === ws ? prev : { ...prev, activeWorkspace: ws }));
  }, []);

  const setHideAiChatOnSubflow = useCallback((hidden: boolean) => {
    setState((prev) =>
      prev.hideAiChatOnSubflow === hidden ? prev : { ...prev, hideAiChatOnSubflow: hidden }
    );
  }, []);

  const addToCart = (productId: string, quantity = 1, optionLabel?: string) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, message: "Không tìm thấy sản phẩm." };
    if (product.stockKg <= 0 || product.seasonStatus !== "in_season") {
      return { ok: false, message: "Sản phẩm đang hẹn mùa, chưa thể thêm vào giỏ." };
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
    return { ok: true, message: `Đã thêm ${product.name} vào giỏ demo.` };
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
    const newId = `NF-ORD-${String(10 + state.orders.length).padStart(2, "0")}`;

    const newOrder: DemoOrder = {
      id: newId,
      customerName: input.customerName.trim() || "Ngọc Linh (Demo)",
      customerPhoneDemo: input.customerPhoneDemo.trim() || "090x xxx 128",
      farmId: items[0].farmId,
      farmName: items[0].farmName,
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
          : input.deliveryAddress.trim() || "Phường Tân Phong, TP. Biên Hòa (Địa chỉ demo)",
      subtotalVnd,
      shippingFeeVnd,
      totalVnd,
      paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)",
      status: "pending_confirm",
      createdAtLabel: "24/11/2026 · Vừa đặt (Demo)",
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
      region: farm.region,
      unitLabel: input.unitLabel || "kg",
      priceVnd: input.priceVnd,
      stockKg: input.stockKg,
      seasonStatus: "in_season",
      batchCode: input.batchCode || "NF-DEMO-001",
      shortDescription: input.shortDescription,
      storyNote: "Sản phẩm vừa được chú Ba Tư duyệt bản nháp AI và đăng từ Không gian Nhà nông (Demo).",
      image: input.image || "/images/stitch/stitch-53.jpg",
      gallery: [input.image || "/images/stitch/stitch-53.jpg"],
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
          : b
      ),
    }));
  };

  const submitSupportRequest = (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => {
    const created: SupportRequest = {
      ...req,
      id: `REQ-DEMO-${String(state.supportRequests.length + 1).padStart(2, "0")}`,
      status: "Chờ điều phối phân công",
      createdAtLabel: "24/11/2026 · Vừa gửi",
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
        m.id === missionId ? { ...m, status: "assigned", assigneeName: volunteerName } : m
      ),
    }));
  };

  const submitMissionEvidence = (
    missionId: string,
    evidenceNote: string,
    hours: number,
    evidenceImage = "/images/stitch/stitch-32.jpg"
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
          : m
      ),
    }));
  };

  const confirmMissionByFarmer = (missionId: string) => {
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, status: "farm_accepted" } : m
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "24/11/2026 Hiện tại",
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
          : x
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "24/11/2026 Hiện tại",
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
        x.id === missionId ? { ...x, status: "revision_requested", revisionReason: reason } : x
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
    note: string
  ) => {
    const targetCase = state.docCases.find((d) => d.id === caseId);
    setState((prev) => ({
      ...prev,
      docCases: prev.docCases.map((c) =>
        c.id === caseId ? { ...c, status, reviewerNote: note } : c
      ),
      farms:
        targetCase && status === "Hồ sơ đã đối chiếu (Demo)"
          ? prev.farms.map((f) =>
              f.id === targetCase.farmId
                ? { ...f, ocopStatus: "coop_checked_demo", ocopLabel: "Hồ sơ đã đối chiếu (Demo)" }
                : f
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
        g.id === grantId ? { ...g, active: !g.active, lastReason: reason } : g
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          time: "24/11/2026 Hiện tại",
          actor: "Admin Demo (W06)",
          action: grant.active ? "REVOKE_GRANT_DEMO" : "ENABLE_GRANT_DEMO",
          target: grant.id,
          note: reason,
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const resetDemoState = () => {
    const fresh = getInitialState();
    setState(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <DemoStoreContext.Provider
      value={{
        ...state,
        hydrated,
        setActiveWorkspace,
        setHideAiChatOnSubflow,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleFollowSeason,
        toggleFavorite,
        placeDemoOrder,
        updateOrderStatus,
        publishFarmerProduct,
        addHarvestDiaryEvent,
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
