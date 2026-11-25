import { z } from "zod";

export type CmsWorkflowStatus = "draft" | "in_review" | "published";

export const CmsBlockSchema = z.object({
  id: z.string().min(2),
  scope: z.enum(["site", "hero", "banner", "footer", "farmer", "organization", "product"]),
  labelVi: z.string().min(1),
  labelEn: z.string().min(1),
  status: z.enum(["draft", "in_review", "published"]),
  draftViTitle: z.string(),
  draftEnTitle: z.string(),
  draftViBody: z.string(),
  draftEnBody: z.string(),
  publishedViTitle: z.string(),
  publishedEnTitle: z.string(),
  publishedViBody: z.string(),
  publishedEnBody: z.string(),
  imageUrl: z.string().optional(),
  focalPoint: z.string().default("50% 50%"),
  updatedAtIso: z.string(),
  updatedBy: z.string(),
});

export type CmsBlock = z.infer<typeof CmsBlockSchema>;

export const CmsRevisionSchema = z.object({
  revisionId: z.string(),
  blockId: z.string(),
  savedAtIso: z.string(),
  actor: z.string(),
  action: z.enum(["save_draft", "submit_review", "publish", "rollback", "import"]),
  snapshot: CmsBlockSchema,
});

export type CmsRevision = z.infer<typeof CmsRevisionSchema>;

export const CmsUploadedAssetSchema = z.object({
  assetId: z.string(),
  name: z.string(),
  mime: z.string(),
  bytes: z.number(),
  dataUrl: z.string(),
  uploadedAtIso: z.string(),
});

export type CmsUploadedAsset = z.infer<typeof CmsUploadedAssetSchema>;

export const CmsExportBundleSchema = z.object({
  schemaVersion: z.literal("naifarm-cms-v5"),
  exportedAtIso: z.string(),
  blocks: z.array(CmsBlockSchema),
  revisions: z.array(CmsRevisionSchema),
});

export type CmsExportBundle = z.infer<typeof CmsExportBundleSchema>;

export const DEFAULT_CMS_BLOCKS: CmsBlock[] = [
  {
    id: "hero.main",
    scope: "hero",
    labelVi: "Trang chủ · Tiêu đề Hero chính",
    labelEn: "Home · Main Hero Section",
    status: "published",
    draftViTitle: "Hương vị Đồng Nai\nTừ vườn đến mọi nhà.",
    draftEnTitle: "Taste Dong Nai.\nFrom farm to table.",
    draftViBody:
      "Khám phá đặc sản địa phương, kết nối nhà vườn và trải nghiệm nét đẹp nông nghiệp Đồng Nai.",
    draftEnBody:
      "Discover local specialties, meet growers and explore Dong Nai’s farming heritage.",
    publishedViTitle: "Hương vị Đồng Nai\nTừ vườn đến mọi nhà.",
    publishedEnTitle: "Taste Dong Nai.\nFrom farm to table.",
    publishedViBody:
      "Khám phá đặc sản địa phương, kết nối nhà vườn và trải nghiệm nét đẹp nông nghiệp Đồng Nai.",
    publishedEnBody:
      "Discover local specialties, meet growers and explore Dong Nai’s farming heritage.",
    imageUrl: "/images/hero/dong-nai-orchard-hero.jpg",
    focalPoint: "62% 52%",
    updatedAtIso: "2026-11-25T19:00:00+07:00",
    updatedBy: "Ban biên tập NaiFarm",
  },
  {
    id: "banner.main",
    scope: "banner",
    labelVi: "Banner Chiến dịch Văn hóa & Mùa vụ",
    labelEn: "Cultural & Harvest Campaign Strip",
    status: "published",
    draftViTitle: "Tuần lễ Nông sản Sạch & Kết nối Thanh niên Đồng Nai 2026",
    draftEnTitle: "Dong Nai Clean Produce & Youth Solidarity Week 2026",
    draftViBody: "Khám phá gian hàng OCOP theo mùa, tour trải nghiệm vườn và học tập song ngữ.",
    draftEnBody: "Discover seasonal OCOP listings, orchard agritourism, and bilingual workshops.",
    publishedViTitle: "",
    publishedEnTitle: "",
    publishedViBody: "",
    publishedEnBody: "",
    focalPoint: "50% 50%",
    updatedAtIso: "2026-11-25T10:00:00+07:00",
    updatedBy: "Ban biên tập NaiFarm",
  },
  {
    id: "footer.brand",
    scope: "footer",
    labelVi: "Chân trang · Thông điệp thương hiệu",
    labelEn: "Footer · Brand Tagline",
    status: "published",
    draftViTitle: "Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị.",
    draftEnTitle: "Sow knowledge – Connect farmers – Spread value.",
    draftViBody:
      "Nền tảng kết nối nông sản Đồng Nai, nhật ký mùa vụ minh bạch, truy xuất nguồn gốc QR và thanh niên tình nguyện đồng hành cùng nhà vườn địa phương.",
    draftEnBody:
      "Connecting Dong Nai orchard harvests, transparent field logs, QR traceability, and youth volunteers.",
    publishedViTitle: "",
    publishedEnTitle: "",
    publishedViBody: "",
    publishedEnBody: "",
    focalPoint: "50% 50%",
    updatedAtIso: "2026-11-25T10:00:00+07:00",
    updatedBy: "Ban biên tập NaiFarm",
  },
  {
    id: "farmer.featured_story",
    scope: "farmer",
    labelVi: "Hồ sơ Nhà vườn Ba Tư · Giới thiệu ngắn",
    labelEn: "Orchard Spotlight · Ba Tu Orchard Intro",
    status: "published",
    draftViTitle: "Vườn Chôm chôm & Sầu riêng Ba Tư Long Khánh",
    draftEnTitle: "Ba Tu Family Orchard · Long Khanh",
    draftViBody: "Canh tác 2,5 ha trên đất bazan Long Khánh, đồng bộ tem QR NF-DEMO-001.",
    draftEnBody: "2.5 ha family orchard in Long Khanh basalt hills synced with QR lot NF-DEMO-001.",
    publishedViTitle: "Vườn Chôm chôm & Sầu riêng Ba Tư Long Khánh",
    publishedEnTitle: "Ba Tu Family Orchard · Long Khanh",
    publishedViBody: "Canh tác 2,5 ha trên đất bazan Long Khánh, đồng bộ tem QR NF-DEMO-001.",
    publishedEnBody: "2.5 ha family orchard in Long Khanh basalt hills synced with QR lot NF-DEMO-001.",
    imageUrl: "/images/stitch/stitch-11.jpg",
    focalPoint: "50% 40%",
    updatedAtIso: "2026-11-25T10:00:00+07:00",
    updatedBy: "Chú Ba Tư",
  },
  {
    id: "organization.spotlight",
    scope: "organization",
    labelVi: "Hợp tác xã Tân Triều · Thông báo vùng bưởi",
    labelEn: "Tan Trieu Cooperative · Seasonal Notice",
    status: "published",
    draftViTitle: "HTX Tân Triều sẵn sàng thu hoạch vụ Tết 2026",
    draftEnTitle: "Tan Trieu Coop Harvest Lots Open for Tet 2026",
    draftViBody: "Liên kết 20 hộ trồng bưởi da xanh & bưởi đường lá cam theo chuẩn đối chiếu chứng từ.",
    draftEnBody: "Pooling 20 member orchards with document-checked traceability logs.",
    publishedViTitle: "HTX Tân Triều sẵn sàng thu hoạch vụ Tết 2026",
    publishedEnTitle: "Tan Trieu Coop Harvest Lots Open for Tet 2026",
    publishedViBody: "Liên kết 20 hộ trồng bưởi da xanh & bưởi đường lá cam theo chuẩn đối chiếu chứng từ.",
    publishedEnBody: "Pooling 20 member orchards with document-checked traceability logs.",
    imageUrl: "/images/stitch/stitch-03.jpg",
    focalPoint: "50% 50%",
    updatedAtIso: "2026-11-25T10:00:00+07:00",
    updatedBy: "Ban Chủ nhiệm HTX Tân Triều",
  },
];

const DB_NAME = "naifarm_local_cms_v5";
const DB_VERSION = 1;
const STORE_KEY = "cms_state_fallback_v5";

interface StoredCmsState {
  blocks: CmsBlock[];
  revisions: CmsRevision[];
  assets: CmsUploadedAsset[];
}

function openCmsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open error"));
  });
}

export async function loadCmsFromIdb(): Promise<StoredCmsState> {
  const fallback: StoredCmsState = {
    blocks: DEFAULT_CMS_BLOCKS,
    revisions: [],
    assets: [],
  };
  if (typeof window === "undefined") return fallback;
  try {
    const db = await openCmsDb();
    const result = await new Promise<StoredCmsState | undefined>((resolve, reject) => {
      const tx = db.transaction("kv", "readonly");
      const store = tx.objectStore("kv");
      const req = store.get("root");
      req.onsuccess = () => resolve(req.result as StoredCmsState | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (result && Array.isArray(result.blocks) && result.blocks.length > 0) {
      return result;
    }
  } catch {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCmsState;
        if (parsed && Array.isArray(parsed.blocks)) return parsed;
      }
    } catch {
      // ignore storage quota / private mode
    }
  }
  return fallback;
}

export async function saveCmsToIdb(state: StoredCmsState): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openCmsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      const store = tx.objectStore("kv");
      const req = store.put(state, "root");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors safely
    }
  }
}

export function validateUploadImageFile(file: File): { ok: true } | { ok: false; reason: string } {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) {
    return { ok: false, reason: "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP (<= 2 MB)." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, reason: "Dung lượng ảnh vượt quá giới hạn 2 MB trong bộ nhớ cục bộ." };
  }
  return { ok: true };
}
