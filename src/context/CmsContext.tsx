"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  CmsExportBundleSchema,
  DEFAULT_CMS_BLOCKS,
  loadCmsFromIdb,
  saveCmsToIdb,
  type CmsBlock,
  type CmsRevision,
  type CmsUploadedAsset,
} from "@/lib/cms/idb-storage";

interface CmsContextValue {
  cmsReady: boolean;
  blocks: CmsBlock[];
  revisions: CmsRevision[];
  assets: CmsUploadedAsset[];
  getBlock: (id: string) => CmsBlock | undefined;
  saveDraft: (
    blockId: string,
    patch: Partial<Pick<CmsBlock, "draftViTitle" | "draftEnTitle" | "draftViBody" | "draftEnBody" | "imageUrl" | "focalPoint">>,
    actor: string,
  ) => Promise<void>;
  submitForReview: (blockId: string, actor: string) => Promise<void>;
  publishLocal: (blockId: string, actor: string) => Promise<void>;
  rollbackRevision: (revisionId: string, actor: string) => Promise<void>;
  registerUploadedAsset: (asset: CmsUploadedAsset) => Promise<void>;
  exportCmsJson: () => string;
  importCmsJson: (rawJson: string, actor: string) => Promise<{ ok: boolean; message: string }>;
  resetCmsDefaults: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [cmsReady, setCmsReady] = useState(false);
  const [blocks, setBlocks] = useState<CmsBlock[]>(DEFAULT_CMS_BLOCKS);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [assets, setAssets] = useState<CmsUploadedAsset[]>([]);

  useEffect(() => {
    let active = true;
    loadCmsFromIdb().then((stored) => {
      if (!active) return;
      // Merge any new default block IDs without overwriting user edits
      const byId = new Map(stored.blocks.map((b) => [b.id, b]));
      for (const def of DEFAULT_CMS_BLOCKS) {
        if (!byId.has(def.id)) byId.set(def.id, def);
      }
      setBlocks(Array.from(byId.values()));
      setRevisions(stored.revisions);
      setAssets(stored.assets);
      setCmsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(
    async (nextBlocks: CmsBlock[], nextRevs: CmsRevision[], nextAssets: CmsUploadedAsset[]) => {
      setBlocks(nextBlocks);
      setRevisions(nextRevs);
      setAssets(nextAssets);
      await saveCmsToIdb({ blocks: nextBlocks, revisions: nextRevs, assets: nextAssets });
    },
    [],
  );

  const getBlock = useCallback(
    (id: string) => blocks.find((b) => b.id === id),
    [blocks],
  );

  const saveDraft: CmsContextValue["saveDraft"] = useCallback(
    async (blockId, patch, actor) => {
      const now = new Date().toISOString();
      let captured: CmsBlock | null = null;
      const nextBlocks = blocks.map((b) => {
        if (b.id !== blockId) return b;
        const updated: CmsBlock = {
          ...b,
          ...patch,
          status: "draft",
          updatedAtIso: now,
          updatedBy: actor,
        };
        captured = updated;
        return updated;
      });
      if (!captured) return;
      const rev: CmsRevision = {
        revisionId: `REV-${Date.now()}`,
        blockId,
        savedAtIso: now,
        actor,
        action: "save_draft",
        snapshot: captured,
      };
      await persist(nextBlocks, [rev, ...revisions].slice(0, 40), assets);
    },
    [blocks, revisions, assets, persist],
  );

  const submitForReview: CmsContextValue["submitForReview"] = useCallback(
    async (blockId, actor) => {
      const now = new Date().toISOString();
      let captured: CmsBlock | null = null;
      const nextBlocks = blocks.map((b) => {
        if (b.id !== blockId) return b;
        const updated: CmsBlock = {
          ...b,
          status: "in_review",
          updatedAtIso: now,
          updatedBy: actor,
        };
        captured = updated;
        return updated;
      });
      if (!captured) return;
      const rev: CmsRevision = {
        revisionId: `REV-${Date.now()}`,
        blockId,
        savedAtIso: now,
        actor,
        action: "submit_review",
        snapshot: captured,
      };
      await persist(nextBlocks, [rev, ...revisions].slice(0, 40), assets);
    },
    [blocks, revisions, assets, persist],
  );

  const publishLocal: CmsContextValue["publishLocal"] = useCallback(
    async (blockId, actor) => {
      const now = new Date().toISOString();
      let captured: CmsBlock | null = null;
      const nextBlocks = blocks.map((b) => {
        if (b.id !== blockId) return b;
        const updated: CmsBlock = {
          ...b,
          status: "published",
          publishedViTitle: b.draftViTitle,
          publishedEnTitle: b.draftEnTitle,
          publishedViBody: b.draftViBody,
          publishedEnBody: b.draftEnBody,
          updatedAtIso: now,
          updatedBy: actor,
        };
        captured = updated;
        return updated;
      });
      if (!captured) return;
      const rev: CmsRevision = {
        revisionId: `REV-${Date.now()}`,
        blockId,
        savedAtIso: now,
        actor,
        action: "publish",
        snapshot: captured,
      };
      await persist(nextBlocks, [rev, ...revisions].slice(0, 40), assets);
    },
    [blocks, revisions, assets, persist],
  );

  const rollbackRevision: CmsContextValue["rollbackRevision"] = useCallback(
    async (revisionId, actor) => {
      const target = revisions.find((r) => r.revisionId === revisionId);
      if (!target) return;
      const now = new Date().toISOString();
      const restored: CmsBlock = {
        ...target.snapshot,
        status: "published",
        publishedViTitle: target.snapshot.draftViTitle || target.snapshot.publishedViTitle,
        publishedEnTitle: target.snapshot.draftEnTitle || target.snapshot.publishedEnTitle,
        publishedViBody: target.snapshot.draftViBody || target.snapshot.publishedViBody,
        publishedEnBody: target.snapshot.draftEnBody || target.snapshot.publishedEnBody,
        updatedAtIso: now,
        updatedBy: actor,
      };
      const nextBlocks = blocks.map((b) => (b.id === restored.id ? restored : b));
      const rev: CmsRevision = {
        revisionId: `REV-${Date.now()}`,
        blockId: restored.id,
        savedAtIso: now,
        actor,
        action: "rollback",
        snapshot: restored,
      };
      await persist(nextBlocks, [rev, ...revisions].slice(0, 40), assets);
    },
    [blocks, revisions, assets, persist],
  );

  const registerUploadedAsset: CmsContextValue["registerUploadedAsset"] = useCallback(
    async (asset) => {
      const nextAssets = [asset, ...assets.filter((a) => a.assetId !== asset.assetId)].slice(0, 20);
      await persist(blocks, revisions, nextAssets);
    },
    [blocks, revisions, assets, persist],
  );

  const exportCmsJson = useCallback(() => {
    const bundle = {
      schemaVersion: "naifarm-cms-v5" as const,
      exportedAtIso: new Date().toISOString(),
      blocks,
      revisions,
    };
    return JSON.stringify(bundle, null, 2);
  }, [blocks, revisions]);

  const importCmsJson = useCallback(
    async (rawJson: string, actor: string) => {
      try {
        const raw = JSON.parse(rawJson);
        const parsed = CmsExportBundleSchema.safeParse(raw);
        if (!parsed.success) {
          return { ok: false, message: "Tệp JSON CMS không đúng cấu trúc schema v5." };
        }
        const now = new Date().toISOString();
        const stamped = parsed.data.blocks.map((b) => ({
          ...b,
          updatedAtIso: now,
          updatedBy: actor,
        }));
        await persist(stamped, parsed.data.revisions.slice(0, 40), assets);
        return { ok: true, message: `Đã nhập ${stamped.length} khối nội dung CMS.` };
      } catch {
        return { ok: false, message: "Không thể đọc tệp JSON — vui lòng kiểm tra cú pháp." };
      }
    },
    [assets, persist],
  );

  const resetCmsDefaults = useCallback(async () => {
    await persist(DEFAULT_CMS_BLOCKS, [], []);
  }, [persist]);

  return (
    <CmsContext.Provider
      value={{
        cmsReady,
        blocks,
        revisions,
        assets,
        getBlock,
        saveDraft,
        submitForReview,
        publishLocal,
        rollbackRevision,
        registerUploadedAsset,
        exportCmsJson,
        importCmsJson,
        resetCmsDefaults,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error("useCms must be used within CmsProvider");
  }
  return ctx;
}
