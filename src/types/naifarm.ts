export type WorkspaceId = "W01" | "W02" | "W03" | "W04" | "W05" | "W06";

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
  | "Quà tặng OCOP & Combo";

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
  storySummary: string;
  bannerImage: string;
  ownerPortrait: string;
  galleryImages: string[];
  youthSupporters: string[];
  coordinates: DemoGeoPoint;
  experiences: ExperiencePackage[];
  isDemo: true;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  farmId: string;
  farmName: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  region: string;
  unitLabel: string;
  priceVnd: number;
  stockKg: number;
  seasonStatus: ProductSeasonStatus;
  batchCode: string;
  seasonId?: string;
  certificationIds?: string[];
  anatomyType?: AnatomyKind;
  brixNote?: string;
  shortDescription: string;
  storyNote: string;
  image: string;
  gallery: string[];
  weightOptions?: { label: string; kgMultiplier: number; priceVnd: number }[];
  tags?: string[];
  isDemo: true;
}

export interface BatchEvent {
  id: string;
  dateLabel: string;
  stage?: string;
  title: string;
  detail: string;
  actorCategory: string;
  sourceDeclaration: "Nhà vườn tự khai" | "Thanh niên hỗ trợ ghi nhận" | "HTX đối chiếu (Demo)";
  photo?: string;
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
  sourceDeclaration: "Nhà vườn tự khai" | "Thanh niên hỗ trợ ghi nhận" | "HTX đối chiếu (Demo)";
  photo?: string;
  isDemo: true;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptionLabel?: string;
}

export interface DemoOrder {
  id: string;
  customerName: string;
  customerPhoneDemo: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode?: string;
  items: {
    productId: string;
    productName: string;
    unitLabel: string;
    quantity: number;
    unitPriceVnd: number;
    image: string;
  }[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  subtotalVnd: number;
  shippingFeeVnd: number;
  totalVnd: number;
  paymentLabel: "COD Demo (Thanh toán mô phỏng khi nhận hàng)";
  status: OrderStatus;
  createdAtLabel: string;
  timeline: { step: string; time: string; done: boolean }[];
  cancelReason?: string;
  isDemo: true;
}

export interface VolunteerMission {
  id: string;
  title: string;
  farmId: string;
  farmName: string;
  administrativeUnitCode?: string;
  location: string;
  mode: "Trực tiếp tại vườn" | "Hỗ trợ từ xa (Online)";
  skillTag: "Chụp ảnh & AI đăng bán" | "Thiết lập QR & Nhật ký" | "Livestream bán hàng";
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
  farmId: string;
  farmName: string;
  hostYouth: string;
  farmerName: string;
  scheduleLabel: string;
  status: LiveStatus;
  pinnedProductIds: string[];
  angles: { id: string; label: string; image: string; caption: string }[];
  summary: string;
  isDemo: true;
}

export interface ExperienceBooking {
  id: string;
  farmId: string;
  farmName: string;
  packageTitle: string;
  guestName: string;
  guestCount: number;
  dateLabel: string;
  note: string;
  status: "Chờ nhà vườn xác nhận";
}

export interface LearningLesson {
  id: string;
  slug: string;
  title: string;
  topicTag: string;
  durationLabel: string;
  levelLabel: string;
  regionCode: string;
  regionName: string;
  summary: string;
  image: string;
  anatomyTarget: AnatomyKind;
  sections: { heading: string; body: string; image: string }[];
  quizQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
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
  message: string;
  category: "order" | "season" | "mission" | "system";
  createdAtLabel: string;
  read: boolean;
  href: string;
}

export interface SupportTicket {
  id: string;
  requesterName: string;
  roleLabel: string;
  category: string;
  subject: string;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  status: "Mới tiếp nhận (Demo)" | "Đang xử lý" | "Đã phản hồi";
  priority: "Thường" | "Ưu tiên";
  createdAtLabel: string;
  note: string;
}

export interface DemoAuthAccount {
  id: string;
  name: string;
  emailDemo: string;
  roleLabel: string;
  workspaceId: WorkspaceId;
  farmId?: string;
  avatarText: string;
  avatarBg: string;
  unitCode: string;
  unitName: string;
  bio: string;
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
  status: "Chờ đối chiếu" | "Hồ sơ đã đối chiếu (Demo)" | "Yêu cầu bổ sung";
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
}
