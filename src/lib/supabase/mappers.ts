import type {
  AdminGrant,
  AdminUnit,
  AuditLogEntry,
  BatchEvent,
  DocumentReviewCase,
  ExperienceBooking,
  ExperiencePackage,
  Farm,
  OrderItem,
  Product,
  Profile,
  RfqRequest,
  SupportRequest,
  TraceBatch,
  VolunteerMission,
  DemoOrder,
  AppRole,
} from "@/types/naifarm";

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
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    ownerName: str(row.owner_name),
    ownerAgeLabel: str(row.owner_age_label),
    region: str(row.region) as Farm["region"],
    addressLabel: str(row.address_label),
    adminUnitCode: row.admin_unit_code ? String(row.admin_unit_code) : null,
    lat: num(row.lat),
    lng: num(row.lng),
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
    experiences,
    isDemo: bool(row.is_demo),
  };
}

export function mapProduct(row: Row): Product {
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    category: str(row.category, "Trái cây tươi") as Product["category"],
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    region: str(row.region),
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
    has3DViewer: bool(row.has_3d_viewer),
    isDemo: bool(row.is_demo),
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
  return {
    batchCode: str(row.batch_code),
    productId: str(row.product_id),
    productName: str(row.product_name),
    farmId: str(row.farm_id),
    farmName: str(row.farm_name),
    region: str(row.region),
    harvestDate: str(row.harvest_date),
    packDate: str(row.pack_date),
    declarationLevel: str(row.declaration_level),
    docStatus: str(row.doc_status),
    summary: str(row.summary),
    events,
    isDemo: bool(row.is_demo),
  };
}

export function mapOrderItem(row: Row): OrderItem {
  return {
    productId: str(row.product_id),
    productName: str(row.product_name),
    unitLabel: str(row.unit_label),
    quantity: num(row.quantity),
    unitPriceVnd: num(row.unit_price_vnd),
    image: str(row.image),
  };
}

export function mapOrder(row: Row, items: OrderItem[]): DemoOrder {
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
    isDemo: bool(row.is_demo),
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
    isDemo: bool(row.is_demo),
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

export function mapAdminUnit(row: Row): AdminUnit {
  return {
    code: str(row.code),
    fullName: str(row.full_name),
    level: str(row.level),
    lat: num(row.lat),
    lng: num(row.lng),
  };
}
