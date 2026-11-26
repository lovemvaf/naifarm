import type {
  AddressBookEntry,
  AdminGrant,
  AdminUnit,
  AppRole,
  AuditLogEntry,
  BatchEvent,
  CalendarEvent,
  CampaignRecord,
  CertificationStatus,
  CoopPool,
  CredentialEvidence,
  CredentialRecord,
  DemoGeoPoint,
  DemoOrder,
  DemoOrderItem,
  DocumentReviewCase,
  DongNaiZone,
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
  ObservanceRecord,
  PartnerOrganization,
  DiaryEntry,
  ProductionSeason,
  Product,
  ProductReviewEntry,
  Profile,
  PromotionRecord,
  PurchaseOrder,
  ReceivablePayable,
  RefundRequest,
  RfqRequest,
  SchoolClass,
  SponsorCampaign,
  Supplier,
  SupportRequest,
  SupportTicket,
  StudentSubmission,
  TourPackage,
  TraceBatch,
  UserNotification,
  VolunteerHourRecord,
  VolunteerMission,
  Warehouse,
  WarehouseStock,
} from "@/types/naifarm";
import { getAdministrativeUnitByCode } from "@/lib/geography/administrative-lookup";
import { assetUrl } from "@/lib/storage/assets";

type Row = Record<string, unknown>;

function assetStr(value: unknown, fallback = ""): string {
  const raw = str(value, fallback);
  return raw ? assetUrl(raw) : "";
}

function assetArray(value: unknown): string[] {
  return strArray(value).map((item) => assetUrl(item)).filter(Boolean);
}

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
    image: assetStr(row.image),
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
    bannerImage: assetStr(row.banner_image),
    ownerPortrait: assetStr(row.owner_portrait),
    galleryImages: assetArray(row.gallery_images),
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
    image: assetStr(row.image),
    gallery: assetArray(row.gallery),
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
    photo: row.photo ? assetUrl(String(row.photo)) : undefined,
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
    image: assetStr(row.image),
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
    evidenceImage: row.evidence_image ? assetUrl(String(row.evidence_image)) : undefined,
    revisionReason: row.revision_reason ? String(row.revision_reason) : undefined,
    status: str(row.status, "open") as VolunteerMission["status"],
    isDemo: true,
  };
}

export function mapVolunteerHour(row: Row): VolunteerHourRecord {
  return {
    id: str(row.id),
    missionId: str(row.mission_id),
    volunteerName: str(row.volunteer_name),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    hours: num(row.hours),
    status: str(row.status, "approved") as VolunteerHourRecord["status"],
    recordedDate: str(row.recorded_date),
    note: str(row.note),
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
    bannerImage: assetStr(row.banner_image),
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

export function mapSeason(row: Row): ProductionSeason {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    administrativeUnitCode: str(row.administrative_unit_code),
    administrativeUnitName: str(row.administrative_unit_name),
    cropName: str(row.crop_name),
    variety: str(row.variety),
    seasonName: str(row.season_name),
    startDate: str(row.start_date),
    expectedHarvestDate: str(row.expected_harvest_date),
    areaHa: num(row.area_ha),
    growingZoneCode: str(row.growing_zone_code),
    status: str(row.status, "đang chăm sóc") as ProductionSeason["status"],
    summary: str(row.summary),
    batchCodes: strArray(row.batch_codes),
    expectedYieldKg: row.expected_yield_kg != null ? num(row.expected_yield_kg) : undefined,
    actualYieldKg: row.actual_yield_kg != null ? num(row.actual_yield_kg) : undefined,
    estimatedCostVnd: row.estimated_cost_vnd != null ? num(row.estimated_cost_vnd) : undefined,
    actualCostVnd: row.actual_cost_vnd != null ? num(row.actual_cost_vnd) : undefined,
    isDemo: bool(row.is_demo, true) as true,
  };
}

export function mapDiaryEntry(row: Row): DiaryEntry {
  return {
    id: str(row.id),
    seasonId: str(row.season_id),
    batchCode: str(row.batch_code),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    dateLabel: str(row.date_label),
    stage: str(row.stage, "Làm đất & Tỉa cành") as DiaryEntry["stage"],
    title: str(row.title),
    detail: str(row.detail),
    actorName: str(row.actor_name),
    sourceDeclaration: str(row.source_declaration, "Nhà vườn tự khai") as DiaryEntry["sourceDeclaration"],
    photo: row.photo ? assetUrl(String(row.photo)) : undefined,
    visibility: row.visibility ? String(row.visibility) as DiaryEntry["visibility"] : undefined,
    materialsUsed: row.materials_used ? String(row.materials_used) : undefined,
    version: row.version != null ? num(row.version) : undefined,
    isDemo: bool(row.is_demo, true) as true,
  };
}

export function mapCredential(row: Row): CredentialRecord {
  return {
    id: str(row.id),
    typeId: str(row.type_id),
    holderId: str(row.holder_id),
    holderLegalName: str(row.holder_legal_name),
    productIds: strArray(row.product_ids),
    siteIds: strArray(row.site_ids),
    facilityIds: strArray(row.facility_ids),
    lotIds: row.lot_ids ? strArray(row.lot_ids) : undefined,
    issuer: str(row.issuer),
    certificateNumber: row.certificate_number ? String(row.certificate_number) : undefined,
    decisionNumber: row.decision_number ? String(row.decision_number) : undefined,
    standardVersion: row.standard_version ? String(row.standard_version) : undefined,
    issueDate: row.issue_date ? String(row.issue_date) : undefined,
    validFrom: row.valid_from ? String(row.valid_from) : undefined,
    validTo: row.valid_to ? String(row.valid_to) : undefined,
    evidenceIds: strArray(row.evidence_ids),
    sourceUrl: row.source_url ? String(row.source_url) : undefined,
    sourcePublishedAt: row.source_published_at ? String(row.source_published_at) : undefined,
    checkedAt: row.checked_at ? String(row.checked_at) : undefined,
    verificationLevel: str(row.verification_level, "self_declared") as CredentialRecord["verificationLevel"],
    lifecycleStatus: str(row.lifecycle_status, "not_provided") as CredentialRecord["lifecycleStatus"],
    scopeDescription: str(row.scope_description),
    origin: str(row.origin, "synthetic") as CredentialRecord["origin"],
    permissionToPublish: bool(row.permission_to_publish),
    notesInternal: row.notes_internal ? String(row.notes_internal) : undefined,
    renewedFromId: row.renewed_from_id ? String(row.renewed_from_id) : undefined,
    eligibleCategoryHint: str(row.eligible_category_hint),
  };
}

export function mapCredentialEvidence(row: Row): CredentialEvidence {
  return {
    id: str(row.id),
    credentialId: str(row.credential_id),
    label: str(row.label),
    fileKey: row.file_key ? String(row.file_key) : undefined,
    uploadedAtLabel: str(row.uploaded_at_label),
    status: str(row.status, "pending") as CredentialEvidence["status"],
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
  };
}

function credentialTypeIdFor(standardType: FarmCertification["standardType"]): string {
  if (standardType === "VietGAP") return "Q15";
  if (standardType === "OCOP") return "Q03";
  if (standardType === "Mã số vùng trồng") return "Q04";
  return "Q08";
}

function credentialLifecycleFor(status: CertificationStatus): CredentialRecord["lifecycleStatus"] {
  if (status === "expired_demo") return "expired";
  if (status === "pending_review" || status === "needs_revision") return "pending_verification";
  if (status === "coop_checked_demo") return "document_matched";
  if (status === "unverified") return "not_provided";
  return "self_declared";
}

function credentialVerificationFor(status: CertificationStatus): CredentialRecord["verificationLevel"] {
  return status === "coop_checked_demo" ? "doc_matched" : "self_declared";
}

function isoDateFromLabel(label: string): string | null {
  const parts = label.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export interface CredentialInsertRow {
  id: string;
  type_id: string;
  holder_id: string;
  holder_legal_name: string;
  product_ids: string[];
  site_ids: string[];
  facility_ids: string[];
  lot_ids: string[] | null;
  issuer: string;
  certificate_number: string | null;
  decision_number: string | null;
  standard_version: string | null;
  issue_date: string | null;
  valid_from: string | null;
  valid_to: string | null;
  evidence_ids: string[];
  source_url: string | null;
  source_published_at: string | null;
  checked_at: string | null;
  verification_level: CredentialRecord["verificationLevel"];
  lifecycle_status: CredentialRecord["lifecycleStatus"];
  scope_description: string;
  origin: CredentialRecord["origin"];
  permission_to_publish: boolean;
  notes_internal: string | null;
  renewed_from_id: string | null;
  eligible_category_hint: string;
}

export function mapFarmCertificationToCredential(
  certification: FarmCertification,
  farm: Farm,
): CredentialInsertRow {
  const issueIso = isoDateFromLabel(certification.issuedDateDemo);
  return {
    id: certification.id,
    type_id: credentialTypeIdFor(certification.standardType),
    holder_id: farm.id,
    holder_legal_name: farm.name,
    product_ids: [],
    site_ids: [],
    facility_ids: [],
    lot_ids: null,
    issuer: certification.issuerLabel,
    certificate_number: certification.certificateCode,
    decision_number: null,
    standard_version: null,
    issue_date: issueIso,
    valid_from: issueIso,
    valid_to: isoDateFromLabel(certification.validUntilDemo),
    evidence_ids: [],
    source_url: null,
    source_published_at: null,
    checked_at: null,
    verification_level: credentialVerificationFor(certification.status),
    lifecycle_status: credentialLifecycleFor(certification.status),
    scope_description: certification.scopeSummary,
    origin: "synthetic",
    permission_to_publish: true,
    notes_internal: null,
    renewed_from_id: null,
    eligible_category_hint: "",
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

export function mapWarehouse(row: Row): Warehouse {
  return {
    id: str(row.id),
    name: str(row.name),
    farmId: str(row.farm_id),
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : "",
    administrativeUnitName: str(row.administrative_unit_name),
    storageType: str(row.storage_type, "kho_mat") as Warehouse["storageType"],
    bins: strArray(row.bins),
  };
}

export function mapWarehouseStock(row: Row): WarehouseStock {
  return {
    id: str(row.id),
    warehouseId: str(row.warehouse_id),
    productId: str(row.product_id),
    batchCode: str(row.batch_code),
    binCode: str(row.bin_code),
    unitLabel: str(row.unit_label),
    unitCostVnd: num(row.unit_cost_vnd),
    onHandQty: num(row.on_hand_qty),
    reservedQty: num(row.reserved_qty),
    blockedQty: num(row.blocked_qty),
    quarantineQty: num(row.quarantine_qty),
    expiryDateIso: row.expiry_date_iso ? String(row.expiry_date_iso) : undefined,
    minThreshold: num(row.min_threshold),
    maxThreshold: num(row.max_threshold),
  };
}

export function mapInventoryMovement(row: Row): InventoryMovement {
  return {
    id: str(row.id),
    warehouseId: str(row.warehouse_id),
    productId: str(row.product_id),
    batchCode: str(row.batch_code),
    type: str(row.type, "inbound") as InventoryMovement["type"],
    quantityDelta: num(row.quantity_delta),
    unitLabel: str(row.unit_label),
    dateIso: str(row.date_iso),
    actorName: str(row.actor_name),
    reason: str(row.reason),
    isInternalTransfer: row.is_internal_transfer ? Boolean(row.is_internal_transfer) : undefined,
  };
}

export function mapSupplier(row: Row): Supplier {
  return {
    id: str(row.id),
    name: str(row.name),
    category: str(row.category),
    administrativeUnitCode: row.administrative_unit_code ? String(row.administrative_unit_code) : "",
    administrativeUnitName: str(row.administrative_unit_name),
    ratingNote: str(row.rating_note),
  };
}

export function mapPurchaseOrder(row: Row): PurchaseOrder {
  return {
    id: str(row.id),
    supplierId: str(row.supplier_id),
    supplierName: str(row.supplier_name),
    farmId: str(row.farm_id),
    itemName: str(row.item_name),
    quantity: num(row.quantity),
    unitLabel: str(row.unit_label),
    unitCostVnd: num(row.unit_cost_vnd),
    totalVnd: num(row.total_vnd),
    expectedDateIso: str(row.expected_date_iso),
    status: str(row.status, "rfq_draft") as PurchaseOrder["status"],
    qcNote: row.qc_note ? String(row.qc_note) : undefined,
  };
}

export function mapCoopPool(row: Row): CoopPool {
  return {
    id: str(row.id),
    title: str(row.title),
    targetOrderCode: str(row.target_order_code),
    mixedBatchCode: str(row.mixed_batch_code),
    totalCommittedQty: num(row.total_committed_qty),
    unitLabel: str(row.unit_label),
    status: str(row.status, "dang_gom") as CoopPool["status"],
  };
}

export function mapMemberDelivery(row: Row): MemberDelivery {
  return {
    id: str(row.id),
    poolId: str(row.pool_id),
    memberFarmId: str(row.member_farm_id),
    memberFarmName: str(row.member_farm_name),
    productName: str(row.product_name),
    unitLabel: str(row.unit_label),
    deliveredQty: num(row.delivered_qty),
    gradeLabel: str(row.grade_label),
    agreedBuyPriceVnd: num(row.agreed_buy_price_vnd),
    sharedFeeVnd: num(row.shared_fee_vnd),
    netPayableVnd: num(row.net_payable_vnd),
    settlementStatus: str(row.settlement_status, "cho_doi_soat") as MemberDelivery["settlementStatus"],
    makerName: str(row.maker_name),
    checkerName: row.checker_name ? String(row.checker_name) : undefined,
    deliveredDateIso: str(row.delivered_date_iso),
  };
}

export function mapExpense(row: Row): ExpenseEntry {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    category: str(row.category, "vat_tu") as ExpenseEntry["category"],
    description: str(row.description),
    amountVnd: num(row.amount_vnd),
    dateIso: str(row.date_iso),
  };
}

export function mapReceivablePayable(row: Row): ReceivablePayable {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    kind: str(row.kind, "receivable") as ReceivablePayable["kind"],
    counterpartyName: str(row.counterparty_name),
    originalVnd: num(row.original_vnd),
    paidVnd: num(row.paid_vnd),
    dueDateIso: str(row.due_date_iso),
    status: str(row.status, "open") as ReceivablePayable["status"],
  };
}

export function mapRefundRequest(row: Row): RefundRequest {
  return {
    id: str(row.id),
    orderId: str(row.order_id),
    farmId: str(row.farm_id),
    requesterName: str(row.requester_name),
    reason: str(row.reason),
    amountVnd: num(row.amount_vnd),
    restockQty: num(row.restock_qty),
    status: str(row.status, "pending_maker") as RefundRequest["status"],
    makerName: str(row.maker_name),
    checkerName: row.checker_name ? String(row.checker_name) : undefined,
    requestedDateIso: str(row.requested_date_iso),
  };
}

export function mapLogisticsTrip(row: Row): LogisticsTrip {
  return {
    id: str(row.id),
    routeLabel: str(row.route_label),
    driverName: str(row.driver_name),
    orderIds: strArray(row.order_ids),
    parcelCount: num(row.parcel_count),
    plannedDeparture: str(row.planned_departure),
    status: str(row.status, "scheduled") as LogisticsTrip["status"],
    podNote: row.pod_note ? String(row.pod_note) : undefined,
  };
}

export function mapLesson(row: Row): LearningLesson {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    titleEn: row.title_en ? String(row.title_en) : undefined,
    ambassadorLevel: row.ambassador_level
      ? (str(row.ambassador_level) as LearningLesson["ambassadorLevel"])
      : undefined,
    topicTag: str(row.topic_tag),
    topicTagEn: row.topic_tag_en ? String(row.topic_tag_en) : undefined,
    durationLabel: str(row.duration_label),
    durationLabelEn: row.duration_label_en ? String(row.duration_label_en) : undefined,
    levelLabel: str(row.level_label),
    levelLabelEn: row.level_label_en ? String(row.level_label_en) : undefined,
    regionCode: str(row.region_code),
    regionName: str(row.region_name),
    summary: str(row.summary),
    summaryEn: row.summary_en ? String(row.summary_en) : undefined,
    learningObjectiveEn: row.learning_objective_en ? String(row.learning_objective_en) : undefined,
    image: assetStr(row.image),
    anatomyTarget: str(row.anatomy_target) as LearningLesson["anatomyTarget"],
    sections: Array.isArray(row.sections) ? (row.sections as LearningLesson["sections"]) : [],
    quizQuestion: row.quiz_question
      ? (row.quiz_question as LearningLesson["quizQuestion"])
      : { prompt: "", options: [], correctIndex: 0, explanation: "" },
  };
}

export function mapSubmission(row: Row): StudentSubmission {
  return {
    id: str(row.id),
    classId: str(row.class_id),
    studentName: str(row.student_name),
    isMinor: bool(row.is_minor),
    hasGuardianConsent: bool(row.has_guardian_consent),
    title: str(row.title),
    rubricScore: row.rubric_score != null ? num(row.rubric_score) : undefined,
    status: str(row.status, "submitted") as StudentSubmission["status"],
  };
}

export function mapSchoolClass(row: Row): SchoolClass {
  return {
    id: str(row.id),
    name: str(row.name),
    schoolName: str(row.school_name),
    teacherName: str(row.teacher_name),
    lessonIds: strArray(row.lesson_ids),
    enrolledCount: num(row.enrolled_count),
    minorConsentCount: num(row.minor_consent_count),
    fieldTripDate: str(row.field_trip_date),
  };
}

export function mapProductReview(row: Row): ProductReviewEntry {
  return {
    id: str(row.id),
    productId: str(row.product_id),
    orderId: str(row.order_id),
    authorName: str(row.author_name),
    rating: Number(row.rating) as ProductReviewEntry["rating"],
    comment: str(row.comment),
    createdDateLabel: String(row.created_date_label),
    verifiedOrderPurchase: Boolean(row.verified_order_purchase) as true,
  };
}

export function mapInternationalInquiry(
  row: Row,
  farmNameById?: Map<string, string>,
  productNameById?: Map<string, string>,
): InternationalInquiry {
  const farmId = str(row.farm_id);
  const productId = row.product_id ? String(row.product_id) : undefined;
  const resolvedFarmName = farmNameById?.get(farmId);
  const resolvedProductName = productId && productNameById ? productNameById.get(productId) : undefined;
  return {
    id: str(row.id),
    productId,
    productName: resolvedProductName ?? (row.product_name ? String(row.product_name) : undefined),
    farmId,
    farmName: resolvedFarmName ?? farmId,
    buyerName: str(row.buyer_name),
    country: str(row.country),
    preferredLanguage: str(row.preferred_language, "en") as InternationalInquiry["preferredLanguage"],
    quantityNote: str(row.quantity_note),
    packagingNote: str(row.packaging_note),
    sampleRequested: Boolean(row.sample_requested),
    message: str(row.message),
    createdAtIso: str(row.created_at_iso),
    status: str(row.status, "submitted_local") as InternationalInquiry["status"],
    responseNote: row.response_note ? String(row.response_note) : undefined,
  };
}

export function mapTourPackage(row: Row): TourPackage {
  return {
    id: str(row.id),
    slug: str(row.slug),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    administrativeUnitCode: str(row.administrative_unit_code),
    administrativeUnitName: str(row.administrative_unit_name),
    zoneLabel: str(row.zone_label) as TourPackage["zoneLabel"],
    experienceKind: str(row.experience_kind) as TourPackage["experienceKind"],
    titleVi: str(row.title_vi),
    titleEn: str(row.title_en),
    summaryVi: str(row.summary_vi),
    summaryEn: str(row.summary_en),
    seasonNoteVi: str(row.season_note_vi),
    seasonNoteEn: str(row.season_note_en),
    durationHours: num(row.duration_hours),
    adultPriceVnd: num(row.adult_price_vnd),
    childPriceVnd: num(row.child_price_vnd),
    minGuests: num(row.min_guests),
    maxGuests: num(row.max_guests),
    languages: strArray(row.languages) as ("vi" | "en")[],
    ageSuitability: str(row.age_suitability) as TourPackage["ageSuitability"],
    accessibilityNoteVi: str(row.accessibility_note_vi),
    accessibilityNoteEn: str(row.accessibility_note_en),
    allergenNoteVi: str(row.allergen_note_vi),
    allergenNoteEn: str(row.allergen_note_en),
    safetyNoteVi: str(row.safety_note_vi),
    safetyNoteEn: str(row.safety_note_en),
    weatherContingencyVi: str(row.weather_contingency_vi),
    weatherContingencyEn: str(row.weather_contingency_en),
    meetingPointVi: str(row.meeting_point_vi),
    meetingPointEn: str(row.meeting_point_en),
    coordinateVerified: bool(row.coordinate_verified),
    includesVi: strArray(row.includes_vi),
    includesEn: strArray(row.includes_en),
    itinerary: (row.itinerary as unknown as TourPackage["itinerary"]) ?? [],
    slots: (row.slots as unknown as TourPackage["slots"]) ?? [],
    linkedProductIds: strArray(row.linked_product_ids),
    linkedLiveIds: strArray(row.linked_live_ids),
    image: assetStr(row.image),
    gallery: assetArray(row.gallery),
    ratingFixture: num(row.rating_fixture),
    reviewCountFixture: num(row.review_count_fixture),
  };
}

export function mapFarmCertification(row: Row): FarmCertification {
  return {
    id: str(row.id),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    administrativeUnitCode: str(row.administrative_unit_code),
    administrativeUnitName: str(row.administrative_unit_name),
    standardType: str(row.standard_type) as FarmCertification["standardType"],
    certificateCode: str(row.certificate_code),
    starLevelLabel: row.star_level_label ? String(row.star_level_label) : undefined,
    status: str(row.status) as CertificationStatus,
    statusLabel: str(row.status_label),
    scopeSummary: str(row.scope_summary),
    issuerLabel: str(row.issuer_label),
    issuedDateDemo: str(row.issued_date_demo),
    validUntilDemo: str(row.valid_until_demo),
    qrBatchCode: row.qr_batch_code ? String(row.qr_batch_code) : undefined,
    disclaimer: str(row.disclaimer),
    isDemo: true,
  };
}

export function mapLessonProgress(row: Row): LearningProgressRecord {
  return {
    completedLessonIds: strArray(row.completed_lesson_ids),
    quizAnswers: (row.quiz_answers as Record<string, number>) ?? {},
    masteredPhraseIds: strArray(row.mastered_phrase_ids),
    matchedPairIds: strArray(row.matched_pair_ids),
    roleplayChoices: (row.roleplay_choices as Record<string, string>) ?? {},
    practicePoints: num(row.practice_points),
    submittedArtifactNotes: {},
  };
}
