"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { INITIAL_LIVESTREAMS } from "@/data/demo/livestreams";
import {
  mapAdminUnit,
  mapAuditLog,
  mapBatch,
  mapBatchEvent,
  mapDocCase,
  mapExperience,
  mapExperienceBooking,
  mapFarm,
  mapGrant,
  mapMission,
  mapOrder,
  mapOrderItem,
  mapProduct,
  mapProfile,
  mapRfqRequest,
  mapSupportRequest,
} from "@/lib/supabase/mappers";
import type {
  AdminGrant,
  AdminUnit,
  AppRole,
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
  Profile,
  RfqRequest,
  SupportRequest,
  TraceBatch,
  VolunteerMission,
  WorkspaceId,
} from "@/types/naifarm";

interface StoreState {
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  adminUnits: AdminUnit[];
  cart: CartItem[];
  followedProductIds: string[];
  favoriteProductIds: string[];
  orders: DemoOrder[];
  missions: VolunteerMission[];
  supportRequests: SupportRequest[];
  livestreams: LivestreamSession[];
  experienceBookings: ExperienceBooking[];
  rfqRequests: RfqRequest[];
  docCases: DocumentReviewCase[];
  adminGrants: AdminGrant[];
  auditLogs: AuditLogEntry[];
}

const EMPTY_STATE: StoreState = {
  farms: [],
  products: [],
  batches: [],
  adminUnits: [],
  cart: [],
  followedProductIds: [],
  favoriteProductIds: [],
  orders: [],
  missions: [],
  supportRequests: [],
  livestreams: INITIAL_LIVESTREAMS,
  experienceBookings: [],
  rfqRequests: [],
  docCases: [],
  adminGrants: [],
  auditLogs: [],
};

const ROLE_WORKSPACE: Record<AppRole, WorkspaceId> = {
  customer: "W01",
  farmer: "W02",
  volunteer: "W03",
  coordinator: "W04",
  organization: "W05",
  admin: "W06",
};

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

interface StoreContextValue extends StoreState {
  hydrated: boolean;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  activeWorkspace: WorkspaceId;
  hideAiChatOnSubflow: boolean;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  setHideAiChatOnSubflow: (hidden: boolean) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    optionLabel?: string
  ) => Promise<{ ok: boolean; message: string }>;
  updateCartQty: (productId: string, nextQty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleFollowSeason: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  placeDemoOrder: (
    input: PlaceOrderInput
  ) => Promise<{ ok: boolean; orderId?: string; message: string }>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    cancelReason?: string
  ) => Promise<void>;
  publishFarmerProduct: (input: PublishProductInput) => Promise<Product>;
  addHarvestDiaryEvent: (batchCode: string, event: Omit<BatchEvent, "id">) => Promise<void>;
  submitSupportRequest: (
    req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">
  ) => Promise<SupportRequest>;
  acceptMission: (missionId: string, volunteerName?: string) => Promise<void>;
  submitMissionEvidence: (
    missionId: string,
    evidenceNote: string,
    hours: number,
    evidenceImage?: string
  ) => Promise<void>;
  confirmMissionByFarmer: (missionId: string) => Promise<void>;
  approveMissionHoursByCoordinator: (
    missionId: string
  ) => Promise<{ ok: boolean; message: string }>;
  requestMissionRevision: (missionId: string, reason: string) => Promise<void>;
  createLivestreamSession: (input: {
    title: string;
    farmId: string;
    scheduleLabel: string;
    hostYouth: string;
    pinnedProductId: string;
    summary: string;
  }) => LivestreamSession;
  submitExperienceBooking: (
    input: Omit<ExperienceBooking, "id" | "status">
  ) => Promise<ExperienceBooking>;
  submitRfq: (input: { company: string; note: string }) => Promise<RfqRequest>;
  reviewDocumentCase: (
    caseId: string,
    status: "Hồ sơ đã đối chiếu" | "Yêu cầu bổ sung",
    note: string
  ) => Promise<void>;
  toggleAdminGrant: (grantId: string, reason: string) => Promise<void>;
  resetDemoState: () => Promise<void>;
}

const emptySubscribe = () => () => {};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "san-pham";
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<StoreState>(EMPTY_STATE);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceId>("W01");
  const [hideAiChatOnSubflow, setHideAiChatOnSubflowState] = useState(false);
  const workspaceTouchedRef = useRef(false);

  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const role = profile?.role ?? null;

  const loadUserScoped = useCallback(
    async (hasUser: boolean) => {
      if (!hasUser) {
        setState((prev) => ({
          ...prev,
          cart: [],
          followedProductIds: [],
          favoriteProductIds: [],
          orders: [],
          missions: [],
          supportRequests: [],
          experienceBookings: [],
          rfqRequests: [],
          docCases: [],
          adminGrants: [],
          auditLogs: [],
        }));
        return;
      }

      const [cartRes, favRes, followRes, orderRes, itemRes, missionRes, reqRes, bookRes, rfqRes, docRes, grantRes, auditRes] =
        await Promise.all([
          supabase.from("cart_items").select("product_id, quantity, selected_option_label"),
          supabase.from("favorites").select("product_id"),
          supabase.from("season_follows").select("product_id"),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("order_items").select("*"),
          supabase.from("missions").select("*").order("created_at", { ascending: true }),
          supabase.from("support_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("experience_bookings").select("*").order("created_at", { ascending: false }),
          supabase.from("rfq_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("document_review_cases").select("*").order("created_at", { ascending: false }),
          supabase.from("admin_grants").select("*").order("created_at", { ascending: true }),
          supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
        ]);

      const orderItemsByOrder = new Map<string, ReturnType<typeof mapOrderItem>[]>();
      for (const row of itemRes.data ?? []) {
        const orderId = String((row as Record<string, unknown>).order_id);
        const list = orderItemsByOrder.get(orderId) ?? [];
        list.push(mapOrderItem(row as Record<string, unknown>));
        orderItemsByOrder.set(orderId, list);
      }

      setState((prev) => ({
        ...prev,
        cart: (cartRes.data ?? []).map((row) => {
          const record = row as Record<string, unknown>;
          return {
            productId: String(record.product_id),
            quantity: Number(record.quantity),
            selectedOptionLabel: record.selected_option_label
              ? String(record.selected_option_label)
              : undefined,
          } satisfies CartItem;
        }),
        favoriteProductIds: (favRes.data ?? []).map((row) =>
          String((row as Record<string, unknown>).product_id)
        ),
        followedProductIds: (followRes.data ?? []).map((row) =>
          String((row as Record<string, unknown>).product_id)
        ),
        orders: (orderRes.data ?? []).map((row) => {
          const record = row as Record<string, unknown>;
          return mapOrder(record, orderItemsByOrder.get(String(record.id)) ?? []);
        }),
        missions: (missionRes.data ?? []).map((row) => mapMission(row as Record<string, unknown>)),
        supportRequests: (reqRes.data ?? []).map((row) =>
          mapSupportRequest(row as Record<string, unknown>)
        ),
        experienceBookings: (bookRes.data ?? []).map((row) =>
          mapExperienceBooking(row as Record<string, unknown>)
        ),
        rfqRequests: (rfqRes.data ?? []).map((row) => mapRfqRequest(row as Record<string, unknown>)),
        docCases: (docRes.data ?? []).map((row) => mapDocCase(row as Record<string, unknown>)),
        adminGrants: (grantRes.data ?? []).map((row) => mapGrant(row as Record<string, unknown>)),
        auditLogs: (auditRes.data ?? []).map((row) => mapAuditLog(row as Record<string, unknown>)),
      }));
    },
    [supabase]
  );

  const loadPublic = useCallback(async () => {
    const [farmRes, expRes, prodRes, batchRes, eventRes, unitRes] = await Promise.all([
      supabase.from("farms").select("*").order("created_at", { ascending: true }),
      supabase.from("experiences").select("*"),
      supabase.from("products").select("*").order("created_at", { ascending: true }),
      supabase.from("batches").select("*").order("created_at", { ascending: true }),
      supabase.from("batch_events").select("*").order("created_at", { ascending: true }),
      supabase.from("admin_units").select("*").order("code", { ascending: true }),
    ]);

    const expByFarm = new Map<string, ReturnType<typeof mapExperience>[]>();
    for (const row of expRes.data ?? []) {
      const record = row as Record<string, unknown>;
      const farmId = String(record.farm_id);
      const list = expByFarm.get(farmId) ?? [];
      list.push(mapExperience(record));
      expByFarm.set(farmId, list);
    }

    const eventsByBatch = new Map<string, ReturnType<typeof mapBatchEvent>[]>();
    for (const row of eventRes.data ?? []) {
      const record = row as Record<string, unknown>;
      const batchCode = String(record.batch_code);
      const list = eventsByBatch.get(batchCode) ?? [];
      list.push(mapBatchEvent(record));
      eventsByBatch.set(batchCode, list);
    }

    setState((prev) => ({
      ...prev,
      farms: (farmRes.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return mapFarm(record, expByFarm.get(String(record.id)) ?? []);
      }),
      products: (prodRes.data ?? []).map((row) => mapProduct(row as Record<string, unknown>)),
      batches: (batchRes.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return mapBatch(record, eventsByBatch.get(String(record.batch_code)) ?? []);
      }),
      adminUnits: (unitRes.data ?? []).map((row) => mapAdminUnit(row as Record<string, unknown>)),
    }));
  }, [supabase]);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      const mapped = mapProfile((data as Record<string, unknown>) ?? null);
      setProfile(mapped);
      if (mapped && !workspaceTouchedRef.current) {
        setActiveWorkspaceState(ROLE_WORKSPACE[mapped.role]);
      }
      return mapped;
    },
    [supabase]
  );

  const refresh = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setSession(currentSession);
    const user = currentSession?.user ?? null;
    if (user) {
      await Promise.all([loadPublic(), loadProfile(user.id), loadUserScoped(true)]);
    } else {
      await Promise.all([loadPublic(), loadUserScoped(false)]);
    }
  }, [supabase, loadPublic, loadProfile, loadUserScoped]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session: current },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(current);
        if (current?.user) {
          await Promise.all([
            loadPublic(),
            loadProfile(current.user.id),
            loadUserScoped(true),
          ]);
        } else {
          await Promise.all([loadPublic(), loadUserScoped(false)]);
        }
      } finally {
        if (mounted) setReady(true);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
        loadUserScoped(true);
      } else {
        setProfile(null);
        loadUserScoped(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadPublic, loadProfile, loadUserScoped]);

  const setActiveWorkspace = useCallback((ws: WorkspaceId) => {
    workspaceTouchedRef.current = true;
    setActiveWorkspaceState(ws);
  }, []);

  const setHideAiChatOnSubflow = useCallback((hidden: boolean) => {
    setHideAiChatOnSubflowState(hidden);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setActiveWorkspaceState("W01");
    workspaceTouchedRef.current = false;
  }, [supabase]);

  const reloadCart = useCallback(async () => {
    const [cartRes, favRes, followRes] = await Promise.all([
      supabase.from("cart_items").select("product_id, quantity, selected_option_label"),
      supabase.from("favorites").select("product_id"),
      supabase.from("season_follows").select("product_id"),
    ]);
    setState((prev) => ({
      ...prev,
      cart: (cartRes.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return {
          productId: String(record.product_id),
          quantity: Number(record.quantity),
          selectedOptionLabel: record.selected_option_label
            ? String(record.selected_option_label)
            : undefined,
        } satisfies CartItem;
      }),
      favoriteProductIds: (favRes.data ?? []).map((row) =>
        String((row as Record<string, unknown>).product_id)
      ),
      followedProductIds: (followRes.data ?? []).map((row) =>
        String((row as Record<string, unknown>).product_id)
      ),
    }));
  }, [supabase]);

  const reloadOrders = useCallback(async () => {
    const [orderRes, itemRes, prodRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("order_items").select("*"),
      supabase.from("products").select("*").order("created_at", { ascending: true }),
    ]);
    const byOrder = new Map<string, ReturnType<typeof mapOrderItem>[]>();
    for (const row of itemRes.data ?? []) {
      const record = row as Record<string, unknown>;
      const orderId = String(record.order_id);
      const list = byOrder.get(orderId) ?? [];
      list.push(mapOrderItem(record));
      byOrder.set(orderId, list);
    }
    setState((prev) => ({
      ...prev,
      products: (prodRes.data ?? []).map((row) => mapProduct(row as Record<string, unknown>)),
      orders: (orderRes.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return mapOrder(record, byOrder.get(String(record.id)) ?? []);
      }),
    }));
  }, [supabase]);

  const reloadProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    setState((prev) => ({
      ...prev,
      products: (data ?? []).map((row) => mapProduct(row as Record<string, unknown>)),
    }));
  }, [supabase]);

  const reloadBatches = useCallback(async () => {
    const [batchRes, eventRes] = await Promise.all([
      supabase.from("batches").select("*").order("created_at", { ascending: true }),
      supabase.from("batch_events").select("*").order("created_at", { ascending: true }),
    ]);
    const eventsByBatch = new Map<string, ReturnType<typeof mapBatchEvent>[]>();
    for (const row of eventRes.data ?? []) {
      const record = row as Record<string, unknown>;
      const batchCode = String(record.batch_code);
      const list = eventsByBatch.get(batchCode) ?? [];
      list.push(mapBatchEvent(record));
      eventsByBatch.set(batchCode, list);
    }
    setState((prev) => ({
      ...prev,
      batches: (batchRes.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return mapBatch(record, eventsByBatch.get(String(record.batch_code)) ?? []);
      }),
    }));
  }, [supabase]);

  const reloadMissions = useCallback(async () => {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: true });
    setState((prev) => ({
      ...prev,
      missions: (data ?? []).map((row) => mapMission(row as Record<string, unknown>)),
    }));
  }, [supabase]);

  const reloadSupport = useCallback(async () => {
    const { data } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setState((prev) => ({
      ...prev,
      supportRequests: (data ?? []).map((row) =>
        mapSupportRequest(row as Record<string, unknown>)
      ),
    }));
  }, [supabase]);

  const reloadBookings = useCallback(async () => {
    const { data } = await supabase
      .from("experience_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setState((prev) => ({
      ...prev,
      experienceBookings: (data ?? []).map((row) =>
        mapExperienceBooking(row as Record<string, unknown>)
      ),
    }));
  }, [supabase]);

  const reloadDocCases = useCallback(async () => {
    const [docRes, farmRes] = await Promise.all([
      supabase.from("document_review_cases").select("*").order("created_at", { ascending: false }),
      supabase.from("farms").select("*").order("created_at", { ascending: true }),
    ]);
    setState((prev) => {
      const expByFarm = new Map(
        prev.farms.map((farm) => [farm.id, farm.experiences] as const)
      );
      return {
        ...prev,
        docCases: (docRes.data ?? []).map((row) => mapDocCase(row as Record<string, unknown>)),
        farms: (farmRes.data ?? []).map((row) => {
          const record = row as Record<string, unknown>;
          return mapFarm(record, expByFarm.get(String(record.id)) ?? []);
        }),
      };
    });
  }, [supabase]);

  const reloadGrants = useCallback(async () => {
    const [grantRes, auditRes] = await Promise.all([
      supabase.from("admin_grants").select("*").order("created_at", { ascending: true }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
    ]);
    setState((prev) => ({
      ...prev,
      adminGrants: (grantRes.data ?? []).map((row) => mapGrant(row as Record<string, unknown>)),
      auditLogs: (auditRes.data ?? []).map((row) => mapAuditLog(row as Record<string, unknown>)),
    }));
  }, [supabase]);

  const reloadAudit = useCallback(async () => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });
    setState((prev) => ({
      ...prev,
      auditLogs: (data ?? []).map((row) => mapAuditLog(row as Record<string, unknown>)),
    }));
  }, [supabase]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1, optionLabel?: string) => {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return { ok: false, message: "Không tìm thấy sản phẩm." };
      if (product.stockKg <= 0 || product.seasonStatus !== "in_season") {
        return { ok: false, message: "Sản phẩm đang hẹn mùa, chưa thể thêm vào giỏ." };
      }
      const existing = state.cart.find((c) => c.productId === productId);
      const otherFarmItem = state.cart.find((c) => {
        if (c.productId === productId) return false;
        const inCart = state.products.find((p) => p.id === c.productId);
        return inCart ? inCart.farmId !== product.farmId : false;
      });
      if (otherFarmItem) {
        return {
          ok: false,
          message:
            "Mỗi đơn chỉ gồm nông sản của một nhà vườn. Vui lòng đặt đơn hiện tại trước khi thêm sản phẩm từ vườn khác.",
        };
      }
      const nextQty = (existing?.quantity ?? 0) + quantity;
      if (nextQty > product.stockKg) {
        return {
          ok: false,
          message: `Số lượng vượt tồn khả dụng (${product.stockKg} ${product.unitLabel}).`,
        };
      }
      const userId = session?.user.id;
      if (!userId) return { ok: false, message: "Vui lòng đăng nhập để thêm vào giỏ." };

      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity: Math.min(product.stockKg, nextQty),
          selected_option_label: optionLabel ?? existing?.selectedOptionLabel ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" }
      );
      if (error) return { ok: false, message: error.message };
      await reloadCart();
      return { ok: true, message: `Đã thêm ${product.name} vào giỏ.` };
    },
    [state.products, state.cart, session, supabase, reloadCart]
  );

  const updateCartQty = useCallback(
    async (productId: string, nextQty: number) => {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return;
      const userId = session?.user.id;
      if (!userId) return;
      if (nextQty <= 0) {
        await supabase.from("cart_items").delete().eq("product_id", productId).eq("user_id", userId);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity: Math.min(product.stockKg, nextQty), updated_at: new Date().toISOString() })
          .eq("product_id", productId)
          .eq("user_id", userId);
      }
      await reloadCart();
    },
    [state.products, session, supabase, reloadCart]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      const userId = session?.user.id;
      if (!userId) return;
      await supabase.from("cart_items").delete().eq("product_id", productId).eq("user_id", userId);
      await reloadCart();
    },
    [session, supabase, reloadCart]
  );

  const toggleFollowSeason = useCallback(
    async (productId: string) => {
      const userId = session?.user.id;
      if (!userId) return;
      const exists = state.followedProductIds.includes(productId);
      if (exists) {
        await supabase
          .from("season_follows")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", userId);
      } else {
        await supabase.from("season_follows").insert({ user_id: userId, product_id: productId });
      }
      await reloadCart();
    },
    [session, state.followedProductIds, supabase, reloadCart]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const userId = session?.user.id;
      if (!userId) return;
      const exists = state.favoriteProductIds.includes(productId);
      if (exists) {
        await supabase.from("favorites").delete().eq("product_id", productId).eq("user_id", userId);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
      }
      await reloadCart();
    },
    [session, state.favoriteProductIds, supabase, reloadCart]
  );

  const placeDemoOrder = useCallback(
    async (input: PlaceOrderInput) => {
      const userId = session?.user.id;
      if (!userId) return { ok: false, message: "Vui lòng đăng nhập để đặt hàng." };
      if (state.cart.length === 0) return { ok: false, message: "Giỏ hàng đang trống." };

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
            stockKg: prod.stockKg,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (items.length === 0) return { ok: false, message: "Không có sản phẩm hợp lệ trong giỏ." };

      for (const item of items) {
        if (item.quantity > item.stockKg) {
          return { ok: false, message: `${item.productName} vượt quá tồn kho hiện tại.` };
        }
      }

      const subtotalVnd = items.reduce((sum, i) => sum + i.unitPriceVnd * i.quantity, 0);
      const shippingFeeVnd = input.deliveryMethod === "delivery" ? 20000 : 0;
      const totalVnd = subtotalVnd + shippingFeeVnd;
      const newId = `NF-ORD-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      const stamp = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} · ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const timeline = [
        { step: "Khách đặt đơn COD", time: "Vừa xong", done: true },
        { step: `${items[0].farmName} xác nhận đơn`, time: "Đang chờ", done: false },
        { step: "Đóng gói & gắn mã QR lô hàng", time: "Chưa thực hiện", done: false },
        {
          step:
            input.deliveryMethod === "pickup"
              ? "Sẵn sàng nhận tại vườn"
              : "Chuyến xe mát giao hàng",
          time: "Chưa thực hiện",
          done: false,
        },
      ];

      const { error: orderError } = await supabase.from("orders").insert({
        id: newId,
        customer_id: userId,
        customer_name: input.customerName.trim() || "Khách mua",
        customer_phone_demo: input.customerPhoneDemo.trim() || "090x xxx 128",
        farm_id: items[0].farmId,
        farm_name: items[0].farmName,
        delivery_method: input.deliveryMethod,
        delivery_address:
          input.deliveryMethod === "pickup"
            ? `Nhận trực tiếp tại ${items[0].farmName}`
            : input.deliveryAddress.trim() || "Phường Trấn Biên, TP. Đồng Nai",
        subtotal_vnd: subtotalVnd,
        shipping_fee_vnd: shippingFeeVnd,
        total_vnd: totalVnd,
        payment_label: "COD (Thanh toán khi nhận hàng)",
        status: "pending_confirm",
        timeline,
        created_at_label: `${stamp} · Vừa đặt`,
        is_demo: false,
      });
      if (orderError) return { ok: false, message: orderError.message };

      const { error: itemError } = await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: newId,
          product_id: item.productId,
          product_name: item.productName,
          unit_label: item.unitLabel,
          quantity: item.quantity,
          unit_price_vnd: item.unitPriceVnd,
          image: item.image,
        }))
      );
      if (itemError) return { ok: false, message: itemError.message };

      await supabase.from("cart_items").delete().eq("user_id", userId);
      await Promise.all([reloadOrders(), reloadCart(), reloadProducts()]);
      return { ok: true, orderId: newId, message: `Đã tạo đơn hàng ${newId}.` };
    },
    [session, state.cart, state.products, supabase, reloadOrders, reloadCart, reloadProducts]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, cancelReason?: string) => {
      const ord = state.orders.find((o) => o.id === orderId);
      if (!ord) return;
      const stepLabels: Record<OrderStatus, string[]> = {
        pending_confirm: ["Khách đặt đơn COD"],
        preparing: ["Khách đặt đơn COD", `${ord.farmName} đã xác nhận & đang chuẩn bị`],
        shipping: [
          "Khách đặt đơn COD",
          `${ord.farmName} đã xác nhận`,
          "Đóng gói & dán tem QR",
          "Đang vận chuyển",
        ],
        ready_pickup: [
          "Khách đặt đơn COD",
          `${ord.farmName} đã xác nhận`,
          "Đã soạn sẵn tại vườn chờ khách nhận",
        ],
        completed: [
          "Khách đặt đơn COD",
          `${ord.farmName} đã xác nhận`,
          "Đóng gói & dán tem QR",
          "Đã bàn giao hoàn tất",
        ],
        cancelled: ["Khách đặt đơn COD", `Đơn đã hủy (${cancelReason || "Chủ vườn cập nhật"})`],
      };
      const activeSteps = stepLabels[status];
      const timeline = activeSteps.map((s, idx) => ({
        step: s,
        time: idx === activeSteps.length - 1 ? "Cập nhật từ W02" : "Hoàn tất",
        done: true,
      }));
      const { error } = await supabase
        .from("orders")
        .update({ status, cancel_reason: cancelReason ?? ord.cancelReason ?? null, timeline })
        .eq("id", orderId);
      if (error) throw error;
      await reloadOrders();
    },
    [state.orders, supabase, reloadOrders]
  );

  const publishFarmerProduct = useCallback(
    async (input: PublishProductInput) => {
      const farm =
        state.farms.find((f) => f.id === (input.farmId ?? profile?.farmId ?? "")) ??
        state.farms.find((f) => f.id === profile?.farmId);
      if (!farm) {
        throw new Error("Không tìm thấy nhà vườn gắn với tài khoản.");
      }
      const nextId = `P${Date.now().toString(36).toUpperCase()}`;
      const slug = `${slugify(input.name)}-${nextId.toLowerCase()}`;
      const image = input.image || "stitch/stitch-53.webp";

      let batchCode = input.batchCode || `NF-${nextId}`;
      const { data: existingBatch } = await supabase
        .from("batches")
        .select("farm_id")
        .eq("batch_code", batchCode)
        .maybeSingle();
      if (existingBatch) {
        batchCode = `${batchCode}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      }
      const payload = {
        id: nextId,
        slug,
        name: input.name,
        category: input.category,
        farm_id: farm.id,
        farm_name: farm.name,
        region: farm.region,
        unit_label: input.unitLabel || "kg",
        price_vnd: input.priceVnd,
        stock_kg: input.stockKg,
        season_status: "in_season",
        batch_code: batchCode,
        short_description: input.shortDescription,
        story_note: "Sản phẩm vừa được chủ vườn duyệt bản nháp và đăng từ Không gian Nhà nông.",
        image,
        gallery: [image],
        is_demo: false,
      };
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;

      const now = new Date();
      const dateLabel = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;
      const { error: batchError } = await supabase.from("batches").upsert(
        {
          batch_code: payload.batch_code,
          product_id: nextId,
          product_name: payload.name,
          farm_id: farm.id,
          farm_name: farm.name,
          region: farm.region,
          harvest_date: dateLabel,
          pack_date: dateLabel,
          declaration_level: "Nhà vườn tự khai",
          doc_status: "Chưa đối chiếu",
          summary: "Lô hàng mới được nhà vườn đăng bán từ Không gian Nhà nông.",
          is_demo: false,
        },
        { onConflict: "batch_code" }
      );
      if (batchError) throw batchError;

      await Promise.all([reloadProducts(), reloadBatches()]);
      return {
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
        batchCode: payload.batch_code,
        shortDescription: input.shortDescription,
        storyNote: payload.story_note,
        image,
        gallery: [image],
        isDemo: false,
      } satisfies Product;
    },
    [state.farms, profile, supabase, reloadProducts, reloadBatches]
  );

  const addHarvestDiaryEvent = useCallback(
    async (batchCode: string, event: Omit<BatchEvent, "id">) => {
      const { error } = await supabase.from("batch_events").insert({
        batch_code: batchCode,
        date_label: event.dateLabel,
        title: event.title,
        detail: event.detail,
        actor_category: event.actorCategory,
        source_declaration: event.sourceDeclaration,
        photo: event.photo ?? null,
      });
      if (error) throw error;
      await reloadBatches();
    },
    [supabase, reloadBatches]
  );

  const submitSupportRequest = useCallback(
    async (req: Omit<SupportRequest, "id" | "status" | "createdAtLabel">) => {
      const id = `REQ-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      const createdAtLabel = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} · Vừa gửi`;
      const payload = {
        id,
        farm_id: req.farmId,
        farm_name: req.farmName,
        title: req.title,
        need_type: req.needType,
        preferred_time: req.preferredTime,
        location_mode: req.locationMode,
        note: req.note,
        status: "Chờ điều phối phân công",
        created_at_label: createdAtLabel,
      };
      const { error } = await supabase.from("support_requests").insert(payload);
      if (error) throw error;
      await reloadSupport();
      return {
        id,
        farmId: req.farmId,
        farmName: req.farmName,
        title: req.title,
        needType: req.needType,
        preferredTime: req.preferredTime,
        locationMode: req.locationMode,
        note: req.note,
        status: "Chờ điều phối phân công",
        createdAtLabel,
      } satisfies SupportRequest;
    },
    [supabase, reloadSupport]
  );

  const acceptMission = useCallback(
    async (missionId: string, volunteerName?: string) => {
      const userId = session?.user.id ?? null;
      if (!userId) throw new Error("Vui lòng đăng nhập.");
      const { error } = await supabase
        .from("missions")
        .update({
          status: "assigned",
          assignee_id: userId,
          assignee_name: volunteerName ?? profile?.fullName ?? "Tình nguyện viên",
        })
        .eq("id", missionId);
      if (error) throw error;
      await reloadMissions();
    },
    [session, profile, supabase, reloadMissions]
  );

  const submitMissionEvidence = useCallback(
    async (
      missionId: string,
      evidenceNote: string,
      hours: number,
      evidenceImage = "stitch/stitch-32.webp"
    ) => {
      const { error } = await supabase
        .from("missions")
        .update({
          status: "submitted",
          evidence_note: evidenceNote,
          submitted_hours: hours,
          evidence_image: evidenceImage,
          revision_reason: null,
        })
        .eq("id", missionId);
      if (error) throw error;
      await reloadMissions();
    },
    [supabase, reloadMissions]
  );

  const confirmMissionByFarmer = useCallback(
    async (missionId: string) => {
      const { error } = await supabase
        .from("missions")
        .update({ status: "farm_accepted" })
        .eq("id", missionId);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        time: "Hiện tại",
        actor: `${profile?.fullName ?? "Nhà vườn"} (W02)`,
        action: "CONFIRM_DELIVERABLE",
        target: missionId,
        note: "Chủ vườn xác nhận đã nhận bàn giao sản phẩm từ thanh niên.",
      });
      await Promise.all([reloadMissions(), reloadAudit()]);
    },
    [profile, supabase, reloadMissions, reloadAudit]
  );

  const approveMissionHoursByCoordinator = useCallback(
    async (missionId: string) => {
      const mission = state.missions.find((m) => m.id === missionId);
      if (!mission) return { ok: false, message: "Không tìm thấy nhiệm vụ." };
      if (mission.status !== "farm_accepted") {
        return {
          ok: false,
          message:
            "Chưa đủ điều kiện: Nhà vườn (W02) phải xác nhận đã nhận bàn giao trước khi Điều phối duyệt giờ.",
        };
      }
      const { error } = await supabase
        .from("missions")
        .update({ status: "coordinator_approved", approved_hours: mission.submittedHours })
        .eq("id", missionId);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        time: "Hiện tại",
        actor: `${profile?.fullName ?? "Điều phối"} (W04)`,
        action: "APPROVE_HOURS_LEDGER",
        target: `${missionId} (+${mission.submittedHours} giờ)`,
        note: "Đã ghi sổ giờ tình nguyện độc lập sau xác nhận của chủ vườn.",
      });
      await Promise.all([reloadMissions(), reloadAudit()]);
      return { ok: true, message: `Đã duyệt +${mission.submittedHours} giờ cho ${missionId}.` };
    },
    [state.missions, profile, supabase, reloadMissions, reloadAudit]
  );

  const requestMissionRevision = useCallback(
    async (missionId: string, reason: string) => {
      const { error } = await supabase
        .from("missions")
        .update({ status: "revision_requested", revision_reason: reason })
        .eq("id", missionId);
      if (error) throw error;
      await reloadMissions();
    },
    [supabase, reloadMissions]
  );

  const createLivestreamSession = useCallback(
    (input: {
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
        id: `NF-LIVE-${Date.now().toString(36).toUpperCase()}`,
        title: input.title,
        farmId: farm?.id ?? input.farmId,
        farmName: farm?.name ?? "",
        hostYouth: input.hostYouth || "Minh Anh (TNV)",
        farmerName: farm?.ownerName ?? "",
        scheduleLabel: input.scheduleLabel,
        status: "scheduled",
        pinnedProductIds: [input.pinnedProductId],
        angles: [
          {
            id: "preview",
            label: "Ảnh bối cảnh vườn",
            image: prod?.image || farm?.bannerImage || "stitch/stitch-40.webp",
            caption: `${farm?.name ?? ""} — lịch phát dự kiến.`,
          },
        ],
        summary: input.summary,
        isDemo: true,
      };
      setState((prev) => ({ ...prev, livestreams: [created, ...prev.livestreams] }));
      return created;
    },
    [state.farms, state.products]
  );

  const submitExperienceBooking = useCallback(
    async (input: Omit<ExperienceBooking, "id" | "status">) => {
      const id = `EXP-BOOK-${Date.now().toString(36).toUpperCase()}`;
      const payload = {
        id,
        farm_id: input.farmId,
        farm_name: input.farmName,
        package_title: input.packageTitle,
        guest_name: input.guestName,
        guest_count: input.guestCount,
        date_label: input.dateLabel,
        note: input.note,
        status: "Chờ nhà vườn xác nhận",
        guest_id: session?.user.id ?? null,
      };
      const { error } = await supabase.from("experience_bookings").insert(payload);
      if (error) throw error;
      await reloadBookings();
      return { ...input, id, status: "Chờ nhà vườn xác nhận" } satisfies ExperienceBooking;
    },
    [session, supabase, reloadBookings]
  );

  const submitRfq = useCallback(
    async (input: { company: string; note: string }) => {
      const id = `RFQ-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      const createdAtLabel = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} · ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const { error } = await supabase.from("rfq_requests").insert({
        id,
        company: input.company,
        note: input.note,
        status: "Mới gửi",
        created_at_label: createdAtLabel,
        created_by: session?.user.id ?? null,
      });
      if (error) throw error;
      const created: RfqRequest = {
        id,
        company: input.company,
        note: input.note,
        status: "Mới gửi",
        createdAtLabel,
      };
      setState((prev) => ({ ...prev, rfqRequests: [created, ...prev.rfqRequests] }));
      return created;
    },
    [supabase, session]
  );

  const reviewDocumentCase = useCallback(
    async (
      caseId: string,
      status: "Hồ sơ đã đối chiếu" | "Yêu cầu bổ sung",
      note: string
    ) => {
      const target = state.docCases.find((d) => d.id === caseId);
      const { error } = await supabase
        .from("document_review_cases")
        .update({ status, reviewer_note: note })
        .eq("id", caseId);
      if (error) throw error;
      if (target && status === "Hồ sơ đã đối chiếu") {
        await supabase
          .from("farms")
          .update({ ocop_status: "coop_checked_demo", ocop_label: "Hồ sơ đã đối chiếu" })
          .eq("id", target.farmId);
      }
      await reloadDocCases();
    },
    [state.docCases, supabase, reloadDocCases]
  );

  const toggleAdminGrant = useCallback(
    async (grantId: string, reason: string) => {
      const grant = state.adminGrants.find((g) => g.id === grantId);
      if (!grant) return;
      const { error } = await supabase
        .from("admin_grants")
        .update({ active: !grant.active, last_reason: reason })
        .eq("id", grantId);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        time: "Hiện tại",
        actor: `${profile?.fullName ?? "Admin"} (W06)`,
        action: grant.active ? "REVOKE_GRANT" : "ENABLE_GRANT",
        target: grant.id,
        note: reason,
      });
      await reloadGrants();
    },
    [state.adminGrants, profile, supabase, reloadGrants]
  );

  const resetDemoState = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      hydrated: ready && hydrated,
      session,
      profile,
      role,
      activeWorkspace,
      hideAiChatOnSubflow,
      setActiveWorkspace,
      setHideAiChatOnSubflow,
      signOut,
      refresh,
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
      submitRfq,
      reviewDocumentCase,
      toggleAdminGrant,
      resetDemoState,
    }),
    [
      state,
      ready,
      hydrated,
      session,
      profile,
      role,
      activeWorkspace,
      hideAiChatOnSubflow,
      setActiveWorkspace,
      setHideAiChatOnSubflow,
      signOut,
      refresh,
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
      submitRfq,
      reviewDocumentCase,
      toggleAdminGrant,
      resetDemoState,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAuth must be used inside DemoStoreProvider");
  return {
    session: ctx.session,
    profile: ctx.profile,
    role: ctx.role,
    hydrated: ctx.hydrated,
    signOut: ctx.signOut,
  };
}
