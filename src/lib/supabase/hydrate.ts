import { createClient } from "@/lib/supabase/client";
import {
  mapAdminUnit,
  mapAuditLog,
  mapBatch,
  mapBatchEvent,
  mapCalendarEvent,
  mapCampaign,
  mapDocCase,
  mapExperience,
  mapExperienceBooking,
  mapFarm,
  mapGrant,
  mapMission,
  mapObservance,
  mapOrder,
  mapOrderItem,
  mapProduct,
  mapPromotion,
  mapRfqRequest,
  mapSupportRequest,
} from "@/lib/supabase/mappers";
import type {
  CalendarEvent,
  CampaignRecord,
  ObservanceRecord,
  PromotionRecord,
  AdminGrant,
  AdminUnit,
  AuditLogEntry,
  DocumentReviewCase,
  ExperienceBooking,
  ExperiencePackage,
  Farm,
  Product,
  RfqRequest,
  SupportRequest,
  TraceBatch,
  VolunteerMission,
  DemoOrder,
} from "@/types/naifarm";

export interface CoreData {
  farms: Farm[];
  products: Product[];
  batches: TraceBatch[];
  orders: DemoOrder[];
  missions: VolunteerMission[];
  supportRequests: SupportRequest[];
  rfqRequests: RfqRequest[];
  experienceBookings: ExperienceBooking[];
  docCases: DocumentReviewCase[];
  adminGrants: AdminGrant[];
  auditLogs: AuditLogEntry[];
  adminUnits: AdminUnit[];
  calendarEvents: CalendarEvent[];
  observances: ObservanceRecord[];
  campaigns: CampaignRecord[];
  promotions: PromotionRecord[];
  cartItems: { productId: string; quantity: number; selectedOptionLabel?: string }[];
  favoriteIds: string[];
  followedIds: string[];
}

const supabase = createClient();

async function selectAll(table: string) {
  const { data } = await supabase.from(table).select("*");
  return (data ?? []) as Record<string, unknown>[];
}

export async function fetchCoreData(): Promise<CoreData> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const [
    farmRows,
    experienceRows,
    productRows,
    batchRows,
    batchEventRows,
    orderRows,
    orderItemRows,
    missionRows,
    supportRows,
    rfqRows,
    bookingRows,
    docRows,
    grantRows,
    auditRows,
    unitRows,
    calendarRows,
    observanceRows,
    campaignRows,
    promotionRows,
    cartRows,
    favoriteRows,
    followRows,
  ] = await Promise.all([
    selectAll("farms"),
    selectAll("experiences"),
    selectAll("products"),
    selectAll("batches"),
    selectAll("batch_events"),
    selectAll("orders"),
    selectAll("order_items"),
    selectAll("missions"),
    selectAll("support_requests"),
    selectAll("rfq_requests"),
    selectAll("experience_bookings"),
    selectAll("document_review_cases"),
    selectAll("admin_grants"),
    selectAll("audit_logs"),
    selectAll("admin_units"),
    selectAll("calendar_events"),
    selectAll("official_observances"),
    selectAll("campaigns"),
    selectAll("promotions"),
    userId
      ? supabase.from("cart_items").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("favorites").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("season_follows").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
  ]);

  const experiencesByFarm = new Map<string, ExperiencePackage[]>();
  for (const row of experienceRows) {
    const farmId = String(row.farm_id ?? "");
    const list = experiencesByFarm.get(farmId) ?? [];
    list.push(mapExperience(row));
    experiencesByFarm.set(farmId, list);
  }

  const farms = farmRows.map((row) =>
    mapFarm(row, experiencesByFarm.get(String(row.id ?? "")) ?? []),
  );
  const products = productRows.map(mapProduct);

  const eventsByBatch = new Map<string, ReturnType<typeof mapBatchEvent>[]>();
  for (const row of batchEventRows) {
    const code = String(row.batch_code ?? "");
    const list = eventsByBatch.get(code) ?? [];
    list.push(mapBatchEvent(row));
    eventsByBatch.set(code, list);
  }
  const batches = batchRows.map((row) =>
    mapBatch(row, eventsByBatch.get(String(row.batch_code ?? "")) ?? []),
  );

  const itemsByOrder = new Map<string, ReturnType<typeof mapOrderItem>[]>();
  for (const row of orderItemRows) {
    const id = String(row.order_id ?? "");
    const list = itemsByOrder.get(id) ?? [];
    list.push(mapOrderItem(row));
    itemsByOrder.set(id, list);
  }
  const orders = orderRows.map((row) =>
    mapOrder(row, itemsByOrder.get(String(row.id ?? "")) ?? []),
  );

  return {
    farms,
    products,
    batches,
    orders,
    missions: missionRows.map(mapMission),
    supportRequests: supportRows.map(mapSupportRequest),
    rfqRequests: rfqRows.map(mapRfqRequest),
    experienceBookings: bookingRows.map(mapExperienceBooking),
    docCases: docRows.map(mapDocCase),
    adminGrants: grantRows.map(mapGrant),
    auditLogs: auditRows.map(mapAuditLog),
    adminUnits: unitRows.map(mapAdminUnit),
    calendarEvents: calendarRows.map(mapCalendarEvent),
    observances: observanceRows.map(mapObservance),
    campaigns: campaignRows.map(mapCampaign),
    promotions: promotionRows.map(mapPromotion),
    cartItems: cartRows.map((row) => ({
      productId: String(row.product_id ?? ""),
      quantity: Number(row.quantity ?? 1),
      selectedOptionLabel:
        row.selected_option_label === null || row.selected_option_label === undefined
          ? undefined
          : String(row.selected_option_label),
    })),
    favoriteIds: favoriteRows.map((row) => String(row.product_id ?? "")),
    followedIds: followRows.map((row) => String(row.product_id ?? "")),
  };
}
