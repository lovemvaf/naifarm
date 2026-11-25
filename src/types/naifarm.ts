export type Locale = "vi" | "en";

export type CurrencyDisplayMode = "vnd" | "vnd_usd_est";

export type WorkspaceId = "W01" | "W02" | "W03" | "W04" | "W05" | "W06";

export type PermissionBundleId =
  | "buyer"
  | "international_guest"
  | "guardian"
  | "farm_owner"
  | "coop_board"
  | "coop_sales"
  | "coop_accountant"
  | "coop_warehouse_qc"
  | "volunteer_adult"
  | "student_minor_consented"
  | "student_minor_unconsented"
  | "coordinator"
  | "school_teacher"
  | "b2b_buyer"
  | "logistics_dispatcher"
  | "authority_verifier"
  | "platform_admin"
  | "auditor_readonly";

export type ScopeRoleTag =
  | "own"
  | "farm"
  | "organization"
  | "program"
  | "unit"
  | "assigned"
  | "platform";

export type SourceKind = "public_reference" | "synthetic";

export type OcopStatus =
  | "self_declared_unverified"
  | "coop_checked_demo"
  | "pending_review";

export type CertificationStatus =
  | "ocop_declared_demo"
  | "vietgap_declared_demo"
  | "coop_checked_demo"
  | "pending_review"
  | "needs_revision"
  | "expired_demo"
  | "unverified";

export type CredentialKind =
  | "certificate"
  | "rating"
  | "identifier"
  | "gi"
  | "trace_mechanism"
  | "legal_facility"
  | "food_safety_system"
  | "qms"
  | "gap"
  | "organic"
  | "sustainability"
  | "aquaculture";

export type CredentialLifecycleStatus =
  | "not_provided"
  | "self_declared"
  | "pending_verification"
  | "document_matched"
  | "source_verified"
  | "announced_pending_dossier"
  | "assessed_not_yet_certified"
  | "historical_check_required"
  | "expiring_soon"
  | "expired"
  | "suspended"
  | "revoked"
  | "rejected"
  | "not_applicable";

export interface CredentialType {
  id: string; // Q01..Q26
  displayName: string;
  kind: CredentialKind;
  eligibleCategories: string[];
  scopeTypes: ("product" | "site" | "facility" | "lot" | "operator" | "territory" | "aquaculture_reference")[];
  requiredEvidence: string[];
  verificationSources: string[];
  sourceUrlPrimary: string;
  logoPolicy: "neutral_text_chip_only";
  summary: string;
}

export interface EvidenceItem {
  id: string;
  uri: string;
  type: "official_announcement" | "pdf_appendix" | "public_registry" | "synthetic_sample";
  sourceTitle: string;
  page?: string;
  sourceOriginalAddress?: string;
  checkedAt: string;
  licenseOrPermission: string;
  checksum?: string;
  redactionStatus: "public" | "redacted" | "restricted";
}

export interface CredentialRecord {
  id: string;
  typeId: string; // Q01..Q26
  holderId: string;
  holderLegalName: string;
  productIds: string[];
  siteIds: string[];
  facilityIds: string[];
  lotIds?: string[];
  issuer: string;
  certificateNumber?: string;
  decisionNumber?: string;
  standardVersion?: string;
  issueDate?: string;
  validFrom?: string;
  validTo?: string;
  evidenceIds: string[];
  sourceUrl?: string;
  sourcePublishedAt?: string;
  checkedAt?: string;
  verificationLevel: "self_declared" | "doc_matched" | "public_source_recorded" | "verifier_checked";
  lifecycleStatus: CredentialLifecycleStatus;
  scopeDescription: string;
  origin: SourceKind;
  permissionToPublish: boolean;
  notesInternal?: string;
  renewedFromId?: string;
  eligibleCategoryHint: string;
}

export interface PublicReferenceItem {
  id: string;
  name: string;
  subjectName: string;
  category: string;
  administrativeUnitCode?: string;
  administrativeUnitName: string;
  sourceAddressOriginal: string;
  credentialTypeIds: string[];
  credentialSummary: string;
  decisionOrSourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
  checkedAt: string;
  lifecycleStatus: CredentialLifecycleStatus;
  scopeWarning?: string;
  image: string;
  sourceKind: "public_reference";
}

export interface AssetManifestEntry {
  assetId: string;
  localPath: string;
  categoryTags: string[];
  sourceOrigin: string;
  license: string;
  checkedAt: string;
  mime: string;
  altTemplate: string;
}

export type ProductSeasonStatus = "in_season" | "pre_order" | "out_of_season";

export type OrderStatus =
  | "pending_confirm"
  | "preparing"
  | "shipping"
  | "ready_pickup"
  | "completed"
  | "cancelled";

export type DeliveryMethod = "delivery" | "pickup";

export type MissionStatus =
  | "open"
  | "assigned"
  | "submitted"
  | "farm_accepted"
  | "coordinator_approved"
  | "revision_requested";

export type LiveStatus = "replay_demo" | "scheduled" | "ended";

export type DongNaiZone =
  | "Tân Triều & Trung tâm"
  | "Long Khánh & Lân cận"
  | "Xuân Lộc & Đông Nam"
  | "Cẩm Mỹ & Định Quán"
  | "Bắc Đồng Nai";

export type ProductCategory =
  | "Trái cây tươi"
  | "Bưởi & Cây có múi"
  | "Chôm chôm & Sầu riêng"
  | "Hạt điều & Rang củi"
  | "Cà phê & Ca cao"
  | "Mật ong & Rượu trái cây"
  | "Nông sản chế biến & Mứt"
  | "Rau củ & Nấm sạch"
  | "Tiêu & Gia vị vùng đồi"
  | "Quà tặng OCOP & Combo"
  | "Thảo mộc & Gia vị hữu cơ mẫu"
  | "Đặc sản du lịch & Hộp quà";

export type AnatomyKind = "pomelo" | "rambutan" | "cashew" | "durian";

export interface DemoGeoPoint {
  lat: number;
  lng: number;
  latLabel: string;
  lngLabel: string;
  isDemoCoordinate: true;
  note: string;
}

export interface ExperiencePackage {
  id: string;
  farmId: string;
  title: string;
  duration: string;
  pricePerGuest: number;
  maxGuests: number;
  scheduleSummary: string;
  safetyNote: string;
  image: string;
}

export interface Farm {
  id: string;
  slug: string;
  name: string;
  enName?: string;
  organizationId?: string;
  ownerName: string;
  ownerAgeLabel: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  zoneLabel: DongNaiZone;
  region: string;
  detailAddress: string;
  addressLabel: string;
  areaHa: number;
  mainCrops: string[];
  ocopStatus: OcopStatus;
  ocopLabel: string;
  ocopNote: string;
  growingZoneCode?: string;
  storyHeadline: string;
  enStoryHeadline?: string;
  storySummary: string;
  enStorySummary?: string;
  bannerImage: string;
  ownerPortrait: string;
  galleryImages: string[];
  youthSupporters: string[];
  coordinates: DemoGeoPoint;
  experiences: ExperiencePackage[];
  isDemo: true;
  sourceKind?: SourceKind;
}

export interface Product {
  id: string;
  slug: string;
  skuCode?: string;
  name: string;
  enName?: string;
  category: ProductCategory;
  farmId: string;
  farmName: string;
  organizationId?: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  region: string;
  unitLabel: string;
  priceVnd: number;
  compareAtPriceVnd?: number;
  costVnd?: number;
  stockKg: number;
  seasonStatus: ProductSeasonStatus;
  batchCode: string;
  seasonId?: string;
  certificationIds?: string[];
  credentialIds?: string[];
  anatomyType?: AnatomyKind;
  brixNote?: string;
  expiryDays?: number;
  storageNote?: string;
  originNote?: string;
  isRescue?: boolean;
  isNaiBox?: boolean;
  adultOnly?: boolean;
  allergens?: string[];
  exportShippingNote?: string;
  eligibleForPreorder?: boolean;
  preOrderEtaLabel?: string;
  shortDescription: string;
  enShortDescription?: string;
  storyNote: string;
  image: string;
  gallery: string[];
  weightOptions?: { label: string; kgMultiplier: number; priceVnd: number }[];
  tags?: string[];
  isDemo: true;
  sourceKind?: SourceKind;
}

export interface BatchEvent {
  id: string;
  dateLabel: string;
  stage?: string;
  title: string;
  detail: string;
  actorCategory: string;
  sourceDeclaration: "Nhà vườn tự khai" | "Thanh niên hỗ trợ ghi nhận" | "HTX đối chiếu";
  photo?: string;
  visibility?: "public" | "internal";
  eventType?: "sow" | "care" | "inspection" | "harvest" | "pack" | "receive" | "transfer" | "release" | "ship" | "return" | "recall";
  quantityKg?: number;
  unitLabel?: string;
}

export interface TraceBatch {
  batchCode: string;
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  region: string;
  seasonId?: string;
  harvestDate: string;
  packDate: string;
  expiryDate?: string;
  quantityKg?: number;
  remainingKg?: number;
  storageCondition?: string;
  parentBatchCodes?: string[];
  childBatchCodes?: string[];
  lotStatus?: "active" | "quarantine" | "recalled" | "expired";
  declarationLevel: string;
  docStatus: string;
  summary: string;
  events: BatchEvent[];
  isDemo: true;
}

export interface FarmCertification {
  id: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  standardType: "VietGAP" | "OCOP" | "Mã số vùng trồng" | "ATTP cơ sở";
  certificateCode: string;
  starLevelLabel?: string;
  status: CertificationStatus;
  statusLabel: string;
  scopeSummary: string;
  issuerLabel: string;
  issuedDateDemo: string;
  validUntilDemo: string;
  qrBatchCode?: string;
  disclaimer: string;
  isDemo: true;
}

export interface ProductionSeason {
  id: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  cropName: string;
  variety: string;
  seasonName: string;
  startDate: string;
  expectedHarvestDate: string;
  areaHa: number;
  growingZoneCode: string;
  status: "đang chăm sóc" | "sắp thu hoạch" | "đang thu hoạch" | "đã kết thúc";
  summary: string;
  batchCodes: string[];
  expectedYieldKg?: number;
  actualYieldKg?: number;
  estimatedCostVnd?: number;
  actualCostVnd?: number;
  isDemo: true;
}

export interface DiaryEntry {
  id: string;
  seasonId: string;
  batchCode: string;
  farmId: string;
  farmName: string;
  dateLabel: string;
  stage:
    | "Làm đất & Tỉa cành"
    | "Bón phân hữu cơ"
    | "Kiểm soát sinh học"
    | "Tưới & Chăm sóc"
    | "Đo độ Brix & Khảo sát"
    | "Thu hoạch & Đóng gói";
  title: string;
  detail: string;
  actorName: string;
  sourceDeclaration: "Nhà vườn tự khai" | "Thanh niên hỗ trợ ghi nhận" | "HTX đối chiếu";
  photo?: string;
  visibility?: "public" | "internal";
  materialsUsed?: string;
  version?: number;
  isDemo: true;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptionLabel?: string;
}

export interface DemoOrderItem {
  productId: string;
  productName: string;
  unitLabel: string;
  quantity: number;
  unitPriceVnd: number;
  costSnapshotVnd?: number | null;
  batchCode?: string;
  restockedQty?: number;
  image: string;
}

export interface DemoOrder {
  id: string;
  parentOrderId?: string;
  organizationId?: string;
  channel?: ChannelKind;
  customerId?: string;
  customerName: string;
  customerPhoneDemo: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode?: string;
  items: DemoOrderItem[];
  deliveryMethod: DeliveryMethod;
  deliverySlotLabel?: string;
  deliveryAddress: string;
  subtotalVnd: number;
  discountVnd?: number;
  taxVnd?: number;
  shippingFeeVnd: number;
  totalVnd: number;
  refundedMerchandiseVnd?: number;
  refundedShippingVnd?: number;
  platformFeeVnd?: number;
  couponCode?: string;
  paymentMethod?: "cod" | "sepay_bank";
  paymentLabel: string;
  paymentStatus?: "unpaid" | "paid_bank" | "collected_cod" | "refunded_partial" | "refunded_full";
  settlementStatus?: "pending" | "settled" | "disputed";
  status: OrderStatus;
  orderDateIso?: string;
  confirmedAtIso?: string;
  completedAtIso?: string;
  refundedAtIso?: string;
  promisedDateIso?: string;
  deliveredDateIso?: string;
  createdAtLabel: string;
  timeline: { step: string; time: string; done: boolean }[];
  cancelReason?: string;
  isDemo: true;
}

export interface VolunteerMission {
  id: string;
  title: string;
  titleEn?: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode?: string;
  location: string;
  mode: "Trực tiếp tại vườn" | "Hỗ trợ từ xa (Online)";
  skillTag:
    | "Chụp ảnh & AI đăng bán"
    | "Thiết lập QR & Nhật ký"
    | "Livestream bán hàng"
    | "Đại sứ Song ngữ & Đón khách"
    | "Truyền thông & Văn hóa";
  audienceAge?: "adult" | "minor_supervised";
  guardianConsentRequired?: boolean;
  linkedCampaignId?: string;
  languageRequired?: "vi" | "en" | "bilingual";
  assigneeName?: string;
  expectedHours: number;
  submittedHours: number;
  approvedHours: number;
  dueDate: string;
  deliverableSummary: string;
  evidenceNote?: string;
  evidenceImage?: string;
  revisionReason?: string;
  status: MissionStatus;
  isDemo: true;
}

export interface VolunteerHourRecord {
  id: string;
  missionId: string;
  volunteerName: string;
  farmId: string;
  farmName: string;
  hours: number;
  status: "pending_farmer" | "pending_coordinator" | "approved" | "revision";
  recordedDate: string;
  note: string;
}

export interface SupportRequest {
  id: string;
  farmId: string;
  farmName: string;
  title: string;
  needType: string;
  preferredTime: string;
  locationMode: "Tại vườn" | "Online";
  note: string;
  status: "Chờ điều phối phân công" | "Đã tạo nhiệm vụ";
  createdAtLabel: string;
}

export interface LivestreamSession {
  id: string;
  title: string;
  titleEn?: string;
  farmId: string;
  farmName: string;
  hostYouth: string;
  farmerName: string;
  scheduleLabel: string;
  startIso?: string;
  status: LiveStatus;
  pinnedProductIds: string[];
  linkedTourSlug?: string;
  linkedCampaignId?: string;
  linkedLessonSlug?: string;
  angles: { id: string; label: string; labelEn?: string; image: string; caption: string; captionEn?: string }[];
  summary: string;
  summaryEn?: string;
  isDemo: true;
}

export interface ExperienceBooking {
  id: string;
  tourSlug?: string;
  slotId?: string;
  farmId: string;
  farmName: string;
  packageTitle: string;
  packageTitleEn?: string;
  guestName: string;
  guestCount: number;
  adultCount?: number;
  childCount?: number;
  language?: Locale;
  dateLabel: string;
  allergenNote?: string;
  schoolGroup?: boolean;
  schoolConsentVerified?: boolean;
  totalEstimateVnd?: number;
  note: string;
  status: "Chờ nhà vườn xác nhận" | "Đã xác nhận" | "Đã check-in" | "Đề nghị đổi ca" | "Đã hủy";
  reviewComment?: string;
  reviewRating?: number;
}

export interface LearningLesson {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  ambassadorLevel?: AmbassadorLevel;
  topicTag: string;
  topicTagEn?: string;
  durationLabel: string;
  durationLabelEn?: string;
  levelLabel: string;
  levelLabelEn?: string;
  regionCode: string;
  regionName: string;
  summary: string;
  summaryEn?: string;
  learningObjectiveEn?: string;
  image: string;
  anatomyTarget: AnatomyKind;
  sections: {
    heading: string;
    headingEn?: string;
    body: string;
    bodyEn?: string;
    image: string;
  }[];
  quizQuestion: {
    prompt: string;
    promptEn?: string;
    options: string[];
    optionsEn?: string[];
    correctIndex: number;
    explanation: string;
    explanationEn?: string;
  };
}

export interface PartnerOrganization {
  id: string;
  name: string;
  type: "HTX" | "Đoàn trường" | "Doanh nghiệp phân phối" | "Hội Nông dân";
  administrativeUnitCode: string;
  administrativeUnitName: string;
  linkedFarmsCount: number;
  contactRoleDemo: string;
  focusArea: string;
  statusLabel: string;
}

export interface UserNotification {
  id: string;
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  category: "order" | "season" | "mission" | "system" | "calendar" | "campaign";
  createdAtLabel: string;
  read: boolean;
  href: string;
  dedupeKey?: string;
  roleScope?: WorkspaceId;
}

export interface SupportTicket {
  id: string;
  requesterName: string;
  roleLabel: string;
  category: string;
  subject: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  status: "Mới tiếp nhận" | "Đang xử lý" | "Đã phản hồi";
  priority: "Thường" | "Ưu tiên";
  createdAtLabel: string;
  note: string;
}

export interface DemoAuthAccount {
  id: string;
  name: string;
  emailDemo: string;
  roleLabel: string;
  roleLabelEn?: string;
  bundleId?: PermissionBundleId;
  workspaceId: WorkspaceId;
  organizationId?: string;
  organizationKind?: OrganizationKind;
  isMinor?: boolean;
  hasGuardianConsent?: boolean;
  preferredLocale?: Locale;
  farmId?: string;
  avatarText: string;
  avatarBg: string;
  unitCode: string;
  unitName: string;
  bio: string;
  bioEn?: string;
  canPublicSignUp: boolean;
}

export interface AddressBookEntry {
  id: string;
  label: string;
  recipientName: string;
  phoneDemo: string;
  detailAddress: string;
  administrativeUnitCode: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface DocumentReviewCase {
  id: string;
  farmId: string;
  farmName: string;
  documentTitle: string;
  submittedAt: string;
  scopeNote: string;
  status: "Chờ đối chiếu" | "Hồ sơ đã đối chiếu" | "Yêu cầu bổ sung";
  reviewerNote?: string;
}

export interface AdminGrant {
  id: string;
  accountName: string;
  organizationName: string;
  workspaceScope: WorkspaceId;
  capability: string;
  unitScope: string;
  expiresAt: string;
  active: boolean;
  lastReason: string;
}

export interface AuditLogEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  note: string;
  correlationId?: string;
  beforeSummary?: string;
  afterSummary?: string;
}

// --- V3 ERP / COOPERATIVE / ORG / ANALYTICS INTERFACES ---

export interface Warehouse {
  id: string;
  name: string;
  farmId: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  storageType: "kho_mat" | "kho_kho" | "diem_gom_htx";
  bins: string[];
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  batchCode: string;
  binCode: string;
  unitLabel: string;
  unitCostVnd: number;
  onHandQty: number;
  reservedQty: number;
  blockedQty: number;
  quarantineQty: number;
  expiryDateIso?: string;
  minThreshold: number;
  maxThreshold: number;
}

export interface InventoryMovement {
  id: string;
  warehouseId: string;
  productId: string;
  batchCode: string;
  type: "inbound" | "outbound" | "transfer" | "adjustment" | "return_restock" | "loss";
  quantityDelta: number;
  unitLabel: string;
  dateIso: string;
  actorName: string;
  reason: string;
  isInternalTransfer?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  ratingNote: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  farmId: string;
  itemName: string;
  quantity: number;
  unitLabel: string;
  unitCostVnd: number;
  totalVnd: number;
  expectedDateIso: string;
  status: "rfq_draft" | "po_approved" | "received_qc_pass" | "qc_rejected";
  qcNote?: string;
}

export interface MemberDelivery {
  id: string;
  poolId: string;
  memberFarmId: string;
  memberFarmName: string;
  productName: string;
  unitLabel: string;
  deliveredQty: number;
  gradeLabel: string;
  agreedBuyPriceVnd: number;
  sharedFeeVnd: number;
  netPayableVnd: number;
  settlementStatus: "cho_doi_soat" | "da_duyet_thanh_toan" | "tranh_chap";
  makerName: string;
  checkerName?: string;
  deliveredDateIso: string;
}

export interface CoopPool {
  id: string;
  title: string;
  targetOrderCode: string;
  mixedBatchCode: string;
  totalCommittedQty: number;
  unitLabel: string;
  status: "dang_gom" | "da_phan_bo" | "da_doi_soat";
}

export interface ExpenseEntry {
  id: string;
  farmId: string;
  category: "vat_tu" | "dong_goi" | "van_chuyen_noi_bo" | "nhan_cong_thoi_vu";
  description: string;
  amountVnd: number;
  dateIso: string;
}

export interface ReceivablePayable {
  id: string;
  farmId: string;
  kind: "receivable" | "payable";
  counterpartyName: string;
  originalVnd: number;
  paidVnd: number;
  dueDateIso: string;
  status: "open" | "overdue" | "settled";
}

export interface RefundRequest {
  id: string;
  orderId: string;
  farmId: string;
  requesterName: string;
  reason: string;
  amountVnd: number;
  restockQty: number;
  status: "pending_maker" | "approved_by_finance" | "rejected";
  makerName: string;
  checkerName?: string;
  requestedDateIso: string;
}

export interface ProductReviewEntry {
  id: string;
  productId: string;
  orderId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdDateLabel: string;
  verifiedOrderPurchase: true;
}

export type OrganizationKind = "coop" | "school" | "b2b" | "sponsor" | "logistics" | "mentor" | "authority";

export interface SchoolClass {
  id: string;
  name: string;
  schoolName: string;
  teacherName: string;
  lessonIds: string[];
  enrolledCount: number;
  minorConsentCount: number;
  fieldTripDate: string;
}

export interface StudentSubmission {
  id: string;
  classId: string;
  studentName: string;
  isMinor: boolean;
  hasGuardianConsent: boolean;
  title: string;
  rubricScore?: number;
  status: "submitted" | "graded";
}

export interface LogisticsTrip {
  id: string;
  routeLabel: string;
  driverName: string;
  orderIds: string[];
  parcelCount: number;
  plannedDeparture: string;
  status: "scheduled" | "in_transit" | "delivered_pod" | "failed_reschedule";
  podNote?: string;
}

export interface MentorCase {
  id: string;
  title: string;
  farmName: string;
  mentorName: string;
  topic: string;
  scheduledAt: string;
  status: "open" | "reviewed";
  feedback?: string;
}

export interface SponsorCampaign {
  id: string;
  sponsorName: string;
  title: string;
  plannedBudgetVnd: number;
  approvedBudgetVnd: number;
  milestoneSummary: string;
  outputsAcceptedCount: number;
}

export type PeriodKey =
  | "current_month"
  | "previous_month"
  | "org_tt_nov_1_24"
  | "last_7d"
  | "last_30d"
  | "all";

// --- V4 DOMAIN INTERFACES (HTX SCOPED BI, AGRITOURISM, AMBASSADOR, CALENDAR, CAMPAIGNS) ---

export type ChannelKind = "online_market" | "wholesale_b2b" | "farm_outlet";

export interface OrganizationUnit {
  id: string;
  name: string;
  enName: string;
  kind: OrganizationKind;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  memberFarmIds: string[];
  warehouseIds: string[];
  channels: ChannelKind[];
  collectionZones: string[];
  isSampleScenario: true;
  summary: string;
  enSummary: string;
}

export type ArApAgingBucket = "current" | "1_30" | "31_60" | "61_90" | "over_90";

export interface TourItineraryStop {
  timeLabel: string;
  titleVi: string;
  titleEn: string;
  detailVi: string;
  detailEn: string;
}

export interface TourSlot {
  id: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  guideId: string;
  guideName: string;
  language: "vi" | "en" | "bilingual";
  status: "open" | "almost_full" | "full" | "cancelled";
}

export interface TourPackage {
  id: string;
  slug: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  zoneLabel: DongNaiZone;
  experienceKind:
    | "harvest"
    | "storytelling"
    | "processing"
    | "family"
    | "school_trip"
    | "qr_workshop"
    | "bilingual_tour"
    | "farm_to_table"
    | "festival";
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  seasonNoteVi: string;
  seasonNoteEn: string;
  durationHours: number;
  adultPriceVnd: number;
  childPriceVnd: number;
  minGuests: number;
  maxGuests: number;
  languages: ("vi" | "en")[];
  ageSuitability: "all_ages" | "family_6_plus" | "school_supervised" | "adult_18_plus";
  accessibilityNoteVi: string;
  accessibilityNoteEn: string;
  allergenNoteVi: string;
  allergenNoteEn: string;
  safetyNoteVi: string;
  safetyNoteEn: string;
  weatherContingencyVi: string;
  weatherContingencyEn: string;
  meetingPointVi: string;
  meetingPointEn: string;
  coordinateVerified: boolean;
  includesVi: string[];
  includesEn: string[];
  itinerary: TourItineraryStop[];
  slots: TourSlot[];
  linkedProductIds: string[];
  linkedLiveIds: string[];
  image: string;
  gallery: string[];
  ratingFixture: number;
  reviewCountFixture: number;
}

export type AmbassadorLevel = "A1" | "A2" | "B1" | "FieldLab" | "LocalAgri";

export interface PhraseCard {
  id: string;
  lessonId: string;
  level: AmbassadorLevel;
  enText: string;
  viText: string;
  pronunciationHint: string;
  contextVi: string;
  contextEn: string;
  cautionVi?: string;
  cautionEn?: string;
}

export interface QuestionBankItem {
  id: string;
  lessonId: string;
  level: AmbassadorLevel;
  kind: "multiple_choice" | "photo_qr" | "order_steps";
  promptVi: string;
  promptEn: string;
  optionsVi: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationVi: string;
  explanationEn: string;
  learningObjective: string;
  difficulty: "basic" | "intermediate" | "applied";
  image?: string;
}

export interface RoleplayOption {
  id: string;
  textVi: string;
  textEn: string;
  isRecommended: boolean;
  feedbackVi: string;
  feedbackEn: string;
  rubricDimension: "accuracy" | "clarity" | "courtesy" | "safety" | "provenance" | "deliverable";
  scoreDelta: number;
}

export interface RoleplayScenario {
  id: string;
  lessonId: string;
  level: AmbassadorLevel;
  titleVi: string;
  titleEn: string;
  customerPromptVi: string;
  customerPromptEn: string;
  contextDataNote: string;
  options: RoleplayOption[];
}

export interface LearningProgressRecord {
  completedLessonIds: string[];
  quizAnswers: Record<string, number>;
  masteredPhraseIds: string[];
  matchedPairIds: string[];
  roleplayChoices: Record<string, string>;
  practicePoints: number;
  submittedArtifactNotes: Record<string, string>;
}

export interface ObservanceRecord {
  id: string;
  titleVi: string;
  titleEn: string;
  dateLabelVi: string;
  monthDay: string; // MM-DD or variable-lunar
  isLunarVariable?: boolean;
  yearVerified: number;
  legalOrOfficialSource: string;
  sourceUrl: string;
  category: "vietnam_official" | "un_fao" | "traditional_lunar" | "seasonal_agri";
  noteVi: string;
  noteEn: string;
  isReadOnlyOfficial: true;
}

export type CalendarEventKind =
  | "observance"
  | "harvest"
  | "live"
  | "tour"
  | "promotion"
  | "training"
  | "mission"
  | "school_assignment"
  | "supplier_delivery"
  | "cert_expiry"
  | "inventory_count"
  | "settlement"
  | "meeting"
  | "reminder"
  | "volunteer_shift";

export type CalendarVisibility = "public" | "w02" | "w03" | "w04" | "w05" | "w06";

export interface CalendarEvent {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  eventKind: CalendarEventKind;
  classification: "official_observance" | "platform_initiative" | "commercial" | "internal";
  organizer: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  startIso: string;
  endIso: string;
  allDay: boolean;
  timezone: "Asia/Ho_Chi_Minh";
  recurrenceRule?: string;
  priority: "low" | "normal" | "high";
  visibility: CalendarVisibility;
  administrativeUnitCode?: string;
  farmId?: string;
  organizationId?: string;
  assignedTo?: string;
  linkedRoute?: string;
  linkedEntityId?: string;
  locationLabel?: string;
  isOfficialReadOnly?: boolean;
}

export type CampaignStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "scheduled"
  | "active"
  | "ended"
  | "paused"
  | "cancelled";

export interface CampaignRecord {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  objectiveVi: string;
  objectiveEn: string;
  classification: "platform_initiative" | "commercial" | "cultural_recap";
  organizer: string;
  targetAudience: ("domestic_customer" | "international_guest" | "adult_member" | "organization")[];
  status: CampaignStatus;
  startIso: string;
  endIso: string;
  timezone: "Asia/Ho_Chi_Minh";
  priority: number;
  showNationalFlagAccent: boolean;
  bannerImage: string;
  bannerAltVi: string;
  bannerAltEn: string;
  primaryCtaLabelVi: string;
  primaryCtaLabelEn: string;
  primaryCtaHref: string;
  makerName: string;
  approverName?: string;
  productIds: string[];
  farmIds: string[];
  experienceSlugs: string[];
  liveIds: string[];
  lessonSlugs: string[];
  promotionIds: string[];
  budgetPlannedVnd: number;
  budgetSpentVnd: number;
  fixtureSessionsCount: number;
  fixtureOrdersCount: number;
  fixtureRevenueVnd: number;
  agendaItems: { time: string; titleVi: string; titleEn: string; route: string }[];
  recapStoryVi?: string;
  recapStoryEn?: string;
}

export type PromotionKind =
  | "percent"
  | "fixed_amount"
  | "min_cart"
  | "bundle"
  | "shipping_discount"
  | "preorder"
  | "flash_sale";

export interface PromotionRecord {
  id: string;
  code: string;
  campaignId?: string;
  titleVi: string;
  titleEn: string;
  kind: PromotionKind;
  discountPercent?: number;
  discountFixedVnd?: number;
  shippingDiscountVnd?: number;
  minSpendVnd: number;
  maxDiscountVnd: number;
  maxRedemptionsTotal: number;
  redeemedCount: number;
  stockAllocatedUnits?: number;
  stockUsedUnits?: number;
  stackable: boolean;
  eligibleLocales: Locale[];
  eligibleCategories?: ProductCategory[];
  eligibleProductIds?: string[];
  targetSellerId?: string;
  startIso: string;
  endIso: string;
  active: boolean;
  approvedBy?: string;
  makerName: string;
  budgetCapVnd: number;
  budgetUsedVnd: number;
  excludeMinors: boolean;
}

export interface InternationalInquiry {
  id: string;
  productId?: string;
  productName?: string;
  farmId: string;
  farmName: string;
  buyerName: string;
  country: string;
  preferredLanguage: Locale;
  quantityNote: string;
  packagingNote: string;
  sampleRequested: boolean;
  message: string;
  createdAtIso: string;
  status: "submitted_local" | "seller_responded";
  responseNote?: string;
}

export type AppRole =
  | "customer"
  | "farmer"
  | "volunteer"
  | "coordinator"
  | "organization"
  | "admin";

export interface Profile {
  id: string;
  fullName: string;
  phone: string | null;
  role: AppRole;
  farmId: string | null;
}

export interface AdminUnit {
  code: string;
  fullName: string;
  level: string;
  lat: number;
  lng: number;
}

export interface RfqRequest {
  id: string;
  company: string;
  note: string;
  status: string;
  createdAtLabel: string;
}

