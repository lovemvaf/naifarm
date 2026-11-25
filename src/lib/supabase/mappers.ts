import type {
  AddressBookEntry,
  AdminGrant,
  AdminUnit,
  AppRole,
  AuditLogEntry,
  BatchEvent,
  CalendarEvent,
  CampaignRecord,
  DemoGeoPoint,
  DemoOrder,
  DemoOrderItem,
  DocumentReviewCase,
  DongNaiZone,
  ExperienceBooking,
  ExperiencePackage,
  Farm,
  ObservanceRecord,
  PartnerOrganization,
  Product,
  Profile,
  PromotionRecord,
  RfqRequest,
  SponsorCampaign,
  SupportRequest,
  SupportTicket,
  TraceBatch,
  UserNotification,
  VolunteerMission,
} from "@/types/naifarm";
import { getAdministrativeUnitByCode } from "@/lib/geography/administrative-lookup";

type Row = Record<string, unknown>;

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function zoneFromRegion(region: string): DongNaiZone {
  if (region.includes("Tân Triều")) return "Tân Triều & Trung tâm";
  if (region.includes("Long Khánh")) return "Long Khánh & Lân cận";
  if (region.includes("Xuân Lộc")) return "Xuân Lộc & Đông Nam";
  if (region.includes("Cẩm Mỹ") || region.includes("Định Quán")) return "Cẩm Mỹ & Định Quán";
  return "Bắc Đồng Nai";
}

function unitNameFor(code: string | null | undefined, fallback: string): string {
  const unit = getAdministrativeUnitByCode(code);
  return unit?.tenDayDu ?? unit?.ten ?? fallback;
}

function toGeoPoint(lat: number, lng: number): DemoGeoPoint {
  return {
    lat,
    lng,
    latLabel: lat.toFixed(4),
    lngLabel: lng.toFixed(4),
    isDemoCoordinate: true,
    note: "Tọa độ minh họa sinh thái",
  };
}

export function mapProfile(row: Row | null): Profile | null {
  if (!row) return null;
  return {
    id: str(row.id),
    fullName: str(row.full_name),
    phone: row.phone === null || row.phone === undefined ? null : String(row.phone),
    role: str(row.role, "customer") as AppRole,
    farmId: row.farm_id === null || row.farm_id === undefined ? null : String(row.farm_id),
  };
}

export function mapExperience(row: Row): ExperiencePackage {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    title: str(row.title),
    duration: str(row.duration),
    pricePerGuest: num(row.price_per_guest),
    maxGuests: num(row.max_guests),
    scheduleSummary: str(row.schedule_summary),
    safetyNote: str(row.safety_note),
    image: str(row.image),
  };
}

export function mapFarm(row: Row, experiences: ExperiencePackage[]): Farm {
  const region = str(row.region);
  const adminUnitCode = row.admin_unit_code ? String(row.admin_unit_code) : "";
  const addressLabel = str(row.address_label);
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    ownerName: str(row.owner_name),
    ownerAgeLabel: str(row.owner_age_label),
    administrativeUnitCode: adminUnitCode,
    administrativeUnitName: unitNameFor(adminUnitCode, region),
    zoneLabel: zoneFromRegion(region),
    region,
    detailAddress: addressLabel,
    addressLabel,
    areaHa: num(row.area_ha),
    mainCrops: strArray(row.main_crops),
    ocopStatus: str(row.ocop_status, "self_declared_unverified") as Farm["ocopStatus"],
    ocopLabel: str(row.ocop_label),
    ocopNote: str(row.ocop_note),
    storyHeadline: str(row.story_headline),
    storySummary: str(row.story_summary),
    bannerImage: str(row.banner_image),
    ownerPortrait: str(row.owner_portrait),
    galleryImages: strArray(row.gallery_images),
    youthSupporters: strArray(row.youth_supporters),
    coordinates: toGeoPoint(num(row.lat), num(row.lng)),
    experiences,
    isDemo: true,
  };
}

export function mapProduct(row: Row): Product {
  const region = str(row.region);
  const adminUnitCode = row.admin_unit_code ? String(row.admin_unit_code) : "";
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    category: str(row.category, "Trái cây tươi") as Product["category"],
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    administrativeUnitCode: adminUnitCode,
    administrativeUnitName: unitNameFor(adminUnitCode, region),
    region,
    unitLabel: str(row.unit_label, "kg"),
    priceVnd: num(row.price_vnd),
    stockKg: num(row.stock_kg),
    seasonStatus: str(row.season_status, "in_season") as Product["seasonStatus"],
    batchCode: str(row.batch_code),
    brixNote: row.brix_note ? String(row.brix_note) : undefined,
    shortDescription: str(row.short_description),
    storyNote: str(row.story_note),
    image: str(row.image),
    gallery: strArray(row.gallery),
    weightOptions: Array.isArray(row.weight_options)
      ? (row.weight_options as Product["weightOptions"])
      : undefined,
    isDemo: true,
  };
}

export function mapBatchEvent(row: Row): BatchEvent {
  return {
    id: str(row.id),
    dateLabel: str(row.date_label),
    title: str(row.title),
    detail: str(row.detail),
    actorCategory: str(row.actor_category),
    sourceDeclaration: str(row.source_declaration, "Nhà vườn tự khai") as BatchEvent["sourceDeclaration"],
    photo: row.photo ? String(row.photo) : undefined,
  };
}

export function mapBatch(row: Row, events: BatchEvent[]): TraceBatch {
  const region = str(row.region);
  const adminUnitCode = row.admin_unit_code ? String(row.admin_unit_code) : "";
  return {
    batchCode: str(row.batch_code),
    productId: str(row.product_id),
    productName: str(row.product_name),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    administrativeUnitCode: adminUnitCode,
    administrativeUnitName: unitNameFor(adminUnitCode, region),
    region,
    harvestDate: str(row.harvest_date),
    packDate: str(row.pack_date),
    declarationLevel: str(row.declaration_level),
    docStatus: str(row.doc_status),
    summary: str(row.summary),
    events,
    isDemo: true,
  };
}

export function mapOrderItem(row: Row): DemoOrderItem {
  return {
    productId: str(row.product_id),
    productName: str(row.product_name),
    unitLabel: str(row.unit_label),
    quantity: num(row.quantity),
    unitPriceVnd: num(row.unit_price_vnd),
    image: str(row.image),
  };
}

export function mapOrder(row: Row, items: DemoOrderItem[]): DemoOrder {
  return {
    id: str(row.id),
    customerName: str(row.customer_name),
    customerPhoneDemo: str(row.customer_phone_demo),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    items,
    deliveryMethod: str(row.delivery_method, "delivery") as DemoOrder["deliveryMethod"],
    deliveryAddress: str(row.delivery_address),
    subtotalVnd: num(row.subtotal_vnd),
    shippingFeeVnd: num(row.shipping_fee_vnd),
    totalVnd: num(row.total_vnd),
    paymentLabel: str(row.payment_label),
    status: str(row.status, "pending_confirm") as DemoOrder["status"],
    createdAtLabel: str(row.created_at_label),
    timeline: Array.isArray(row.timeline)
      ? (row.timeline as DemoOrder["timeline"])
      : [],
    cancelReason: row.cancel_reason ? String(row.cancel_reason) : undefined,
    isDemo: true,
  };
}

export function mapMission(row: Row): VolunteerMission {
  return {
    id: str(row.id),
    title: str(row.title),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    location: str(row.location),
    mode: str(row.mode, "Trực tiếp tại vườn") as VolunteerMission["mode"],
    skillTag: str(row.skill_tag, "Chụp ảnh & AI đăng bán") as VolunteerMission["skillTag"],
    assigneeName: row.assignee_name ? String(row.assignee_name) : undefined,
    expectedHours: num(row.expected_hours),
    submittedHours: num(row.submitted_hours),
    approvedHours: num(row.approved_hours),
    dueDate: str(row.due_date),
    deliverableSummary: str(row.deliverable_summary),
    evidenceNote: row.evidence_note ? String(row.evidence_note) : undefined,
    evidenceImage: row.evidence_image ? String(row.evidence_image) : undefined,
    revisionReason: row.revision_reason ? String(row.revision_reason) : undefined,
    status: str(row.status, "open") as VolunteerMission["status"],
    isDemo: true,
  };
}

export function mapSupportRequest(row: Row): SupportRequest {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    title: str(row.title),
    needType: str(row.need_type),
    preferredTime: str(row.preferred_time),
    locationMode: str(row.location_mode, "Tại vườn") as SupportRequest["locationMode"],
    note: str(row.note),
    status: str(row.status, "Chờ điều phối phân công") as SupportRequest["status"],
    createdAtLabel: str(row.created_at_label),
  };
}

export function mapRfqRequest(row: Row): RfqRequest {
  return {
    id: str(row.id),
    company: str(row.company),
    note: str(row.note),
    status: str(row.status, "Mới gửi"),
    createdAtLabel: str(row.created_at_label),
  };
}

export function mapExperienceBooking(row: Row): ExperienceBooking {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    packageTitle: str(row.package_title),
    guestName: str(row.guest_name),
    guestCount: num(row.guest_count, 1),
    dateLabel: str(row.date_label),
    note: str(row.note),
    status: str(row.status, "Chờ nhà vườn xác nhận") as ExperienceBooking["status"],
  };
}

export function mapDocCase(row: Row): DocumentReviewCase {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    documentTitle: str(row.document_title),
    submittedAt: str(row.submitted_at),
    scopeNote: str(row.scope_note),
    status: str(row.status, "Chờ đối chiếu") as DocumentReviewCase["status"],
    reviewerNote: row.reviewer_note ? String(row.reviewer_note) : undefined,
  };
}

export function mapGrant(row: Row): AdminGrant {
  return {
    id: str(row.id),
    accountName: str(row.account_name),
    organizationName: str(row.organization_name),
    workspaceScope: str(row.workspace_scope, "W01") as AdminGrant["workspaceScope"],
    capability: str(row.capability),
    unitScope: str(row.unit_scope),
    expiresAt: str(row.expires_at),
    active: bool(row.active, true),
    lastReason: str(row.last_reason),
  };
}

export function mapAuditLog(row: Row): AuditLogEntry {
  return {
    id: str(row.id),
    time: str(row.time),
    actor: str(row.actor),
    action: str(row.action),
    target: str(row.target),
    note: str(row.note),
  };
}

export function mapCalendarEvent(row: Row): CalendarEvent {
  return {
    id: str(row.id),
    title: str(row.title),
    titleEn: str(row.title_en),
    description: str(row.description),
    descriptionEn: str(row.description_en),
    eventKind: str(row.event_kind, "meeting") as CalendarEvent["eventKind"],
    classification: str(row.classification, "platform_initiative") as CalendarEvent["classification"],
    organizer: str(row.organizer),
    status: str(row.status, "scheduled") as CalendarEvent["status"],
    startIso: str(row.start_iso),
    endIso: str(row.end_iso),
    allDay: bool(row.all_day),
    timezone: str(row.timezone, "Asia/Ho_Chi_Minh") as CalendarEvent["timezone"],
    recurrenceRule: row.recurrence_rule ? String(row.recurrence_rule) : undefined,
    priority: str(row.priority, "normal") as CalendarEvent["priority"],
    visibility: str(row.visibility, "public") as CalendarEvent["visibility"],
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : undefined,
    farmId: row.farm_id ? String(row.farm_id) : undefined,
    organizationId: row.organization_id ? String(row.organization_id) : undefined,
    assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
    linkedRoute: row.linked_route ? String(row.linked_route) : undefined,
    linkedEntityId: row.linked_entity_id ? String(row.linked_entity_id) : undefined,
    locationLabel: row.location_label ? String(row.location_label) : undefined,
    isOfficialReadOnly: bool(row.is_official_read_only),
  };
}

export function mapObservance(row: Row): ObservanceRecord {
  return {
    id: str(row.id),
    titleVi: str(row.title_vi),
    titleEn: str(row.title_en),
    dateLabelVi: str(row.date_label_vi),
    monthDay: str(row.month_day),
    isLunarVariable: bool(row.is_lunar_variable),
    yearVerified: num(row.year_verified),
    legalOrOfficialSource: str(row.legal_or_official_source),
    sourceUrl: str(row.source_url),
    category: str(row.category, "vietnam_official") as ObservanceRecord["category"],
    noteVi: str(row.note_vi),
    noteEn: str(row.note_en),
    isReadOnlyOfficial: bool(row.is_read_only_official, true) as true,
  };
}

export function mapCampaign(row: Row): CampaignRecord {
  return {
    id: str(row.id),
    slug: str(row.slug),
    titleVi: str(row.title_vi),
    titleEn: str(row.title_en),
    subtitleVi: str(row.subtitle_vi),
    subtitleEn: str(row.subtitle_en),
    objectiveVi: str(row.objective_vi),
    objectiveEn: str(row.objective_en),
    classification: str(row.classification, "platform_initiative") as CampaignRecord["classification"],
    organizer: str(row.organizer),
    targetAudience: strArray(row.target_audience).filter(
      (a): a is CampaignRecord["targetAudience"][number] =>
        a === "domestic_customer" || a === "international_guest" || a === "adult_member" || a === "organization",
    ),
    status: str(row.status, "draft") as CampaignRecord["status"],
    startIso: str(row.start_iso),
    endIso: str(row.end_iso),
    timezone: str(row.timezone, "Asia/Ho_Chi_Minh") as CampaignRecord["timezone"],
    priority: num(row.priority),
    showNationalFlagAccent: bool(row.show_national_flag_accent),
    bannerImage: str(row.banner_image),
    bannerAltVi: str(row.banner_alt_vi),
    bannerAltEn: str(row.banner_alt_en),
    primaryCtaLabelVi: str(row.primary_cta_label_vi),
    primaryCtaLabelEn: str(row.primary_cta_label_en),
    primaryCtaHref: str(row.primary_cta_href),
    makerName: str(row.maker_name),
    approverName: row.approver_name ? String(row.approver_name) : undefined,
    productIds: strArray(row.product_ids),
    farmIds: strArray(row.farm_ids),
    experienceSlugs: strArray(row.experience_slugs),
    liveIds: strArray(row.live_ids),
    lessonSlugs: strArray(row.lesson_slugs),
    promotionIds: strArray(row.promotion_ids),
    budgetPlannedVnd: num(row.budget_planned_vnd),
    budgetSpentVnd: num(row.budget_spent_vnd),
    fixtureSessionsCount: num(row.fixture_sessions_count),
    fixtureOrdersCount: num(row.fixture_orders_count),
    fixtureRevenueVnd: num(row.fixture_revenue_vnd),
    agendaItems: Array.isArray(row.agenda_items) ? (row.agenda_items as CampaignRecord["agendaItems"]) : [],
    recapStoryVi: row.recap_story_vi ? String(row.recap_story_vi) : undefined,
    recapStoryEn: row.recap_story_en ? String(row.recap_story_en) : undefined,
  };
}

export function mapPromotion(row: Row): PromotionRecord {
  return {
    id: str(row.id),
    code: str(row.code),
    campaignId: row.campaign_id ? String(row.campaign_id) : undefined,
    titleVi: str(row.title_vi),
    titleEn: str(row.title_en),
    kind: str(row.kind, "percent") as PromotionRecord["kind"],
    discountPercent: row.discount_percent != null ? Number(row.discount_percent) : undefined,
    discountFixedVnd: row.discount_fixed_vnd != null ? num(row.discount_fixed_vnd) : undefined,
    shippingDiscountVnd: row.shipping_discount_vnd != null ? num(row.shipping_discount_vnd) : undefined,
    minSpendVnd: num(row.min_spend_vnd),
    maxDiscountVnd: num(row.max_discount_vnd),
    maxRedemptionsTotal: num(row.max_redemptions_total),
    redeemedCount: num(row.redeemed_count),
    stockAllocatedUnits: row.stock_allocated_units != null ? num(row.stock_allocated_units) : undefined,
    stockUsedUnits: row.stock_used_units != null ? num(row.stock_used_units) : undefined,
    stackable: bool(row.stackable),
    eligibleLocales: strArray(row.eligible_locales).filter(
      (l): l is PromotionRecord["eligibleLocales"][number] => l === "vi" || l === "en",
    ),
    eligibleCategories: row.eligible_categories
      ? strArray(row.eligible_categories).filter(
          (c): c is Product["category"] =>
            [
              "Trái cây tươi",
              "Bưởi & Cây có múi",
              "Chôm chôm & Sầu riêng",
              "Hạt điều & Rang củi",
              "Cà phê & Ca cao",
              "Mật ong & Rượu trái cây",
              "Nông sản chế biến & Mứt",
              "Rau củ & Nấm sạch",
              "Tiêu & Gia vị vùng đồi",
              "Quà tặng OCOP & Combo",
              "Thảo mộc & Gia vị hữu cơ mẫu",
              "Đặc sản du lịch & Hộp quà",
            ].includes(c as Product["category"]),
        )
      : undefined,
    eligibleProductIds: row.eligible_product_ids ? strArray(row.eligible_product_ids) : undefined,
    targetSellerId: row.target_seller_id ? String(row.target_seller_id) : undefined,
    startIso: str(row.start_iso),
    endIso: str(row.end_iso),
    active: bool(row.active),
    approvedBy: row.approved_by ? String(row.approved_by) : undefined,
    makerName: str(row.maker_name),
    budgetCapVnd: num(row.budget_cap_vnd),
    budgetUsedVnd: num(row.budget_used_vnd),
    excludeMinors: bool(row.exclude_minors),
  };
}

export function mapAdminUnit(row: Row): AdminUnit {
  return {
    code: str(row.code),
    fullName: str(row.full_name),
    level: str(row.level),
    lat: num(row.lat),
    lng: num(row.lng),
  };
}

export function mapNotification(row: Row): UserNotification {
  return {
    id: str(row.id),
    title: str(row.title),
    titleEn: row.title_en ? String(row.title_en) : undefined,
    message: str(row.message),
    messageEn: row.message_en ? String(row.message_en) : undefined,
    category: str(row.category, "system") as UserNotification["category"],
    createdAtLabel: str(row.created_at_label),
    read: bool(row.read),
    href: str(row.href),
    dedupeKey: row.dedupe_key ? String(row.dedupe_key) : undefined,
    roleScope: row.role_scope ? (String(row.role_scope) as UserNotification["roleScope"]) : undefined,
  };
}

export function mapTicket(row: Row): SupportTicket {
  return {
    id: str(row.id),
    requesterName: str(row.requester_name),
    roleLabel: str(row.role_label),
    category: str(row.category),
    subject: str(row.subject),
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : "",
    administrativeUnitName: str(row.administrative_unit_name),
    status: str(row.status, "Mới tiếp nhận") as SupportTicket["status"],
    priority: str(row.priority, "Thường") as SupportTicket["priority"],
    createdAtLabel: str(row.created_at_label),
    note: str(row.note),
  };
}

export function mapAddressEntry(row: Row): AddressBookEntry {
  return {
    id: str(row.id),
    label: str(row.label),
    recipientName: str(row.recipient_name),
    phoneDemo: str(row.phone_demo),
    detailAddress: str(row.detail_address),
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : "",
    fullAddress: str(row.full_address),
    isDefault: bool(row.is_default),
  };
}

export function mapPartnerOrg(row: Row): PartnerOrganization {
  return {
    id: str(row.id),
    name: str(row.name),
    type: str(row.type, "HTX") as PartnerOrganization["type"],
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : "",
    administrativeUnitName: str(row.administrative_unit_name),
    linkedFarmsCount: num(row.linked_farms_count),
    contactRoleDemo: str(row.contact_role_demo),
    focusArea: str(row.focus_area),
    statusLabel: str(row.status_label),
  };
}

export function mapSponsorCampaign(row: Row): SponsorCampaign {
  return {
    id: str(row.id),
    sponsorName: str(row.sponsor_name),
    title: str(row.title),
    plannedBudgetVnd: num(row.planned_budget_vnd),
    approvedBudgetVnd: num(row.approved_budget_vnd),
    milestoneSummary: str(row.milestone_summary),
    outputsAcceptedCount: num(row.outputs_accepted_count),
  };
}
