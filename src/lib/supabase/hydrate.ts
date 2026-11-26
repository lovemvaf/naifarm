import { createClient } from "@/lib/supabase/client";
import {
  mapAddressEntry,
  mapAdminUnit,
  mapAuditLog,
  mapBatch,
  mapBatchEvent,
  mapCalendarEvent,
  mapCampaign,
  mapCoopPool,
  mapCredential,
  mapDiaryEntry,
  mapDocCase,
  mapExperience,
  mapExperienceBooking,
  mapExpense,
  mapFarm,
  mapFarmCertification,
  mapGrant,
  mapInternationalInquiry,
  mapInventoryMovement,
  mapLesson,
  mapLessonProgress,
  mapLogisticsTrip,
  mapMemberDelivery,
  mapMentorCase,
  mapMission,
  mapNotification,
  mapObservance,
  mapOrder,
  mapOrderItem,
  mapPartnerOrg,
  mapProduct,
  mapProductReview,
  mapPurchaseOrder,
  mapPromotion,
  mapReceivablePayable,
  mapRefundRequest,
  mapRfqRequest,
  mapSchoolClass,
  mapSeason,
  mapSponsorCampaign,
  mapSubmission,
  mapSupplier,
  mapSupportRequest,
  mapTicket,
  mapTourPackage,
  mapVolunteerHour,
  mapWarehouse,
  mapWarehouseStock,
} from "@/lib/supabase/mappers";
import type {
  AddressBookEntry,
  AdminGrant,
  AdminUnit,
  AuditLogEntry,
  CalendarEvent,
  CampaignRecord,
  CoopPool,
  CredentialRecord,
  DiaryEntry,
  ProductionSeason,
  DemoOrder,
  DocumentReviewCase,
  ExpenseEntry,
  ExperienceBooking,
  ExperiencePackage,
  Farm,
  FarmCertification,
  InternationalInquiry,
  InventoryMovement,
  LearningLesson,
  LearningProgressRecord,
  LogisticsTrip,
  MemberDelivery,
  MentorCase,
  ObservanceRecord,
  PartnerOrganization,
  Product,
  ProductReviewEntry,
  PromotionRecord,
  PurchaseOrder,
  ReceivablePayable,
  RefundRequest,
  RfqRequest,
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
  seasons: ProductionSeason[];
  diaryEntries: DiaryEntry[];
  credentials: CredentialRecord[];
  lessons: LearningLesson[];
  submissions: StudentSubmission[];
  schoolClasses: SchoolClass[];
  cartItems: { productId: string; quantity: number; selectedOptionLabel?: string }[];
  favoriteIds: string[];
  followedIds: string[];
  notifications: UserNotification[];
  tickets: SupportTicket[];
  addressBook: AddressBookEntry[];
  partnerOrgs: PartnerOrganization[];
  sponsorCampaigns: SponsorCampaign[];
  warehouses: Warehouse[];
  warehouseStocks: WarehouseStock[];
  inventoryMovements: InventoryMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  coopPools: CoopPool[];
  memberDeliveries: MemberDelivery[];
  expenses: ExpenseEntry[];
  receivablesPayables: ReceivablePayable[];
  refundRequests: RefundRequest[];
  volunteerHours: VolunteerHourRecord[];
  logisticsTrips: LogisticsTrip[];
  productReviews: ProductReviewEntry[];
  internationalInquiries: InternationalInquiry[];
  tourPackages: TourPackage[];
  certifications: FarmCertification[];
  mentorCases: MentorCase[];
  learningProgress: LearningProgressRecord;
}

let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  if (!cachedSupabase) {
    cachedSupabase = createClient();
  }
  return cachedSupabase;
}

async function selectAll(
  supabase: ReturnType<typeof createClient>,
  table: string,
) {
  try {
    const { data, error } = await supabase.from(table).select("*");
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export async function fetchCoreData(): Promise<CoreData> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }
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
    seasonRows,
    diaryRows,
    credentialRows,
    lessonRows,
    submissionRows,
    classRows,
    cartRows,
    favoriteRows,
    followRows,
    notificationRows,
    ticketRows,
    addressRows,
    partnerOrgRows,
    sponsorCampaignRows,
    warehouseRows,
    warehouseStockRows,
    inventoryMovementRows,
    supplierRows,
    purchaseOrderRows,
    coopPoolRows,
    memberDeliveryRows,
    expenseRows,
    receivableRows,
    refundRows,
    volunteerHourRows,
    logisticsTripRows,
    productReviewRows,
    inquiryRows,
    tourPackageRows,
    certificationRows,
    mentorCaseRows,
    lessonProgressRow,
  ] = await Promise.all([
    selectAll(supabase, "farms"),
    selectAll(supabase, "experiences"),
    selectAll(supabase, "products"),
    selectAll(supabase, "batches"),
    selectAll(supabase, "batch_events"),
    selectAll(supabase, "orders"),
    selectAll(supabase, "order_items"),
    selectAll(supabase, "missions"),
    selectAll(supabase, "support_requests"),
    selectAll(supabase, "rfq_requests"),
    selectAll(supabase, "experience_bookings"),
    selectAll(supabase, "document_review_cases"),
    selectAll(supabase, "admin_grants"),
    selectAll(supabase, "audit_logs"),
    selectAll(supabase, "admin_units"),
    selectAll(supabase, "calendar_events"),
    selectAll(supabase, "official_observances"),
    selectAll(supabase, "campaigns"),
    selectAll(supabase, "promotions"),
    selectAll(supabase, "seasons"),
    selectAll(supabase, "diary_entries"),
    selectAll(supabase, "credentials"),
    selectAll(supabase, "lessons"),
    selectAll(supabase, "student_submissions"),
    selectAll(supabase, "school_classes"),
    userId
      ? supabase.from("cart_items").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("favorites").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("season_follows").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("notifications").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("tickets").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    userId
      ? supabase.from("address_book").select("*").eq("user_id", userId).then((r) => (r.error ? [] : r.data ?? []))
      : Promise.resolve([]),
    selectAll(supabase, "partner_orgs"),
    selectAll(supabase, "sponsor_campaigns"),
    selectAll(supabase, "warehouses"),
    selectAll(supabase, "warehouse_stocks"),
    selectAll(supabase, "inventory_movements"),
    selectAll(supabase, "suppliers"),
    selectAll(supabase, "purchase_orders"),
    selectAll(supabase, "coop_pools"),
    selectAll(supabase, "member_deliveries"),
    selectAll(supabase, "expenses"),
    selectAll(supabase, "receivables_payables"),
    selectAll(supabase, "refund_requests"),
    selectAll(supabase, "volunteer_hours"),
    selectAll(supabase, "logistics_trips"),
    selectAll(supabase, "product_reviews"),
    selectAll(supabase, "international_inquiries"),
    selectAll(supabase, "tour_packages"),
    selectAll(supabase, "farm_certifications"),
    selectAll(supabase, "mentor_cases"),
    userId
      ? supabase.from("lesson_progress").select("*").eq("user_id", userId).maybeSingle().then((r) => r.data ?? null)
      : Promise.resolve(null),
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

  const farmNameById = new Map<string, string>();
  for (const farm of farms) {
    farmNameById.set(farm.id, farm.name);
  }
  const productNameById = new Map<string, string>();
  for (const product of products) {
    productNameById.set(product.id, product.name);
  }

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
    seasons: seasonRows.map(mapSeason),
    diaryEntries: diaryRows.map(mapDiaryEntry),
    credentials: credentialRows.map(mapCredential),
    lessons: lessonRows.map(mapLesson),
    submissions: submissionRows.map(mapSubmission),
    schoolClasses: classRows.map(mapSchoolClass),
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
    notifications: notificationRows.map(mapNotification),
    tickets: ticketRows.map(mapTicket),
    addressBook: addressRows.map(mapAddressEntry),
    partnerOrgs: partnerOrgRows.map(mapPartnerOrg),
    sponsorCampaigns: sponsorCampaignRows.map(mapSponsorCampaign),
    warehouses: warehouseRows.map(mapWarehouse),
    warehouseStocks: warehouseStockRows.map(mapWarehouseStock),
    inventoryMovements: inventoryMovementRows.map(mapInventoryMovement),
    suppliers: supplierRows.map(mapSupplier),
    purchaseOrders: purchaseOrderRows.map(mapPurchaseOrder),
    coopPools: coopPoolRows.map(mapCoopPool),
    memberDeliveries: memberDeliveryRows.map(mapMemberDelivery),
    expenses: expenseRows.map(mapExpense),
    receivablesPayables: receivableRows.map(mapReceivablePayable),
    refundRequests: refundRows.map(mapRefundRequest),
    volunteerHours: volunteerHourRows.map(mapVolunteerHour),
    logisticsTrips: logisticsTripRows.map(mapLogisticsTrip),
    productReviews: productReviewRows.map(mapProductReview),
    internationalInquiries: inquiryRows.map((row) =>
      mapInternationalInquiry(row, farmNameById, productNameById),
    ),
    tourPackages: tourPackageRows.map(mapTourPackage),
    certifications: certificationRows.map(mapFarmCertification),
    mentorCases: mentorCaseRows.map(mapMentorCase),
    learningProgress: lessonProgressRow
      ? mapLessonProgress(lessonProgressRow)
      : {
          completedLessonIds: [],
          quizAnswers: {},
          masteredPhraseIds: [],
          matchedPairIds: [],
          roleplayChoices: {},
          practicePoints: 0,
          submittedArtifactNotes: {},
        },
  };
}
