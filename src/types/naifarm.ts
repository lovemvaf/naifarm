export type WorkspaceId = "W01" | "W02" | "W03" | "W04" | "W05" | "W06";

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

export type OcopStatus =
  | "self_declared_unverified"
  | "coop_checked_demo"
  | "pending_review";

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

export type RegionName =
  | "Phường Tân Triều"
  | "Phường Long Khánh"
  | "Phường Xuân Lộc"
  | "Cẩm Mỹ & Định Quán";

export interface Farm {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  ownerAgeLabel: string;
  region: RegionName;
  addressLabel: string;
  adminUnitCode?: string | null;
  lat: number;
  lng: number;
  areaHa: number;
  mainCrops: string[];
  ocopStatus: OcopStatus;
  ocopLabel: string;
  ocopNote: string;
  storyHeadline: string;
  storySummary: string;
  bannerImage: string;
  ownerPortrait: string;
  galleryImages: string[];
  youthSupporters: string[];
  experiences: ExperiencePackage[];
  isDemo?: boolean;
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

export interface ProductWeightOption {
  label: string;
  kgMultiplier: number;
  priceVnd: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "Trái cây tươi" | "Hạt & Cà phê" | "Mật ong & Đặc sản";
  farmId: string;
  farmName: string;
  region: string;
  unitLabel: string;
  priceVnd: number;
  stockKg: number;
  seasonStatus: ProductSeasonStatus;
  batchCode: string;
  brixNote?: string;
  shortDescription: string;
  storyNote: string;
  image: string;
  gallery: string[];
  weightOptions?: ProductWeightOption[];
  has3DViewer?: boolean;
  isDemo?: boolean;
}

export interface BatchEvent {
  id: string;
  dateLabel: string;
  title: string;
  detail: string;
  actorCategory: string;
  sourceDeclaration: "Nhà vườn tự khai" | "Thanh niên hỗ trợ ghi nhận" | "HTX đối chiếu";
  photo?: string;
}

export interface TraceBatch {
  batchCode: string;
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  region: string;
  harvestDate: string;
  packDate: string;
  declarationLevel: string;
  docStatus: string;
  summary: string;
  events: BatchEvent[];
  isDemo?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptionLabel?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitLabel: string;
  quantity: number;
  unitPriceVnd: number;
  image: string;
}

export interface DemoOrder {
  id: string;
  customerName: string;
  customerPhoneDemo: string;
  farmId: string;
  farmName: string;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  subtotalVnd: number;
  shippingFeeVnd: number;
  totalVnd: number;
  paymentLabel: string;
  status: OrderStatus;
  createdAtLabel: string;
  timeline: { step: string; time: string; done: boolean }[];
  cancelReason?: string;
  isDemo?: boolean;
}

export interface VolunteerMission {
  id: string;
  title: string;
  farmId: string;
  farmName: string;
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
  isDemo?: boolean;
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
  isDemo?: boolean;
}

export interface RfqRequest {
  id: string;
  company: string;
  note: string;
  status: string;
  createdAtLabel: string;
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
}

export interface AdminUnit {
  code: string;
  fullName: string;
  level: string;
  lat: number;
  lng: number;
}
