import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  CreateVideoJobInput,
  FfprobeQcReport,
  VideoJobRecord,
  VideoJobStatus,
  VideoRenderMode,
} from "../../../../src/lib/video-studio/contracts";

interface RawJobRow {
  job_id: string;
  idempotency_key: string;
  owner_id: string;
  organization_id: string;
  target_type: "product" | "tour";
  target_id: string;
  title: string;
  payload_json: string;
  mode_requested: VideoRenderMode;
  mode_used: VideoRenderMode;
  status: VideoJobStatus;
  provenance_note: string;
  aspect_ratio: "9:16" | "16:9" | "1:1";
  locale: "vi" | "en";
  duration_sec: number;
  mp4_url: string | null;
  vtt_url: string | null;
  poster_url: string | null;
  qc_json: string | null;
  error_code: string | null;
  error_message: string | null;
  lease_owner: string | null;
  lease_expires_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ClaimedVideoJob {
  record: VideoJobRecord;
  input: CreateVideoJobInput;
}

export class SqliteVideoQueue {
  private db: DatabaseSync;

  constructor(dbPath: string) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;

      CREATE TABLE IF NOT EXISTS video_jobs (
        job_id TEXT PRIMARY KEY,
        idempotency_key TEXT NOT NULL UNIQUE,
        owner_id TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        title TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        mode_requested TEXT NOT NULL,
        mode_used TEXT NOT NULL,
        status TEXT NOT NULL,
        provenance_note TEXT NOT NULL,
        aspect_ratio TEXT NOT NULL,
        locale TEXT NOT NULL,
        duration_sec INTEGER NOT NULL,
        mp4_url TEXT,
        vtt_url TEXT,
        poster_url TEXT,
        qc_json TEXT,
        error_code TEXT,
        error_message TEXT,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        lease_owner TEXT,
        lease_expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_video_jobs_status_created
        ON video_jobs (status, created_at);

      CREATE TABLE IF NOT EXISTS video_job_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private rowToRecord(row: RawJobRow): VideoJobRecord {
    return {
      jobId: row.job_id,
      idempotencyKey: row.idempotency_key,
      ownerId: row.owner_id,
      organizationId: row.organization_id,
      targetType: row.target_type,
      targetId: row.target_id,
      title: row.title,
      modeRequested: row.mode_requested,
      modeUsed: row.mode_used,
      status: row.status,
      provenanceNote: row.provenance_note,
      aspectRatio: row.aspect_ratio,
      locale: row.locale,
      durationSec: row.duration_sec,
      mp4Url: row.mp4_url ?? undefined,
      vttUrl: row.vtt_url ?? undefined,
      posterUrl: row.poster_url ?? undefined,
      qcReport: row.qc_json ? (JSON.parse(row.qc_json) as FfprobeQcReport) : undefined,
      errorCode: row.error_code ?? undefined,
      errorMessage: row.error_message ?? undefined,
      createdAtIso: row.created_at,
      updatedAtIso: row.updated_at,
      completedAtIso: row.completed_at ?? undefined,
    };
  }

  appendEvent(jobId: string, eventType: string, message: string) {
    this.db
      .prepare("INSERT INTO video_job_events (job_id, event_type, message, created_at) VALUES (?, ?, ?, ?)")
      .run(jobId, eventType, message, new Date().toISOString());
  }

  createOrReuseJob(input: CreateVideoJobInput): { created: boolean; record: VideoJobRecord } {
    const existing = this.db
      .prepare("SELECT * FROM video_jobs WHERE idempotency_key = ?")
      .get(input.idempotencyKey) as RawJobRow | undefined;

    if (existing) {
      return { created: false, record: this.rowToRecord(existing) };
    }

    const now = new Date().toISOString();
    const jobId = `vjob-${crypto.randomUUID().slice(0, 12)}`;
    const modeUsed: VideoRenderMode = "FAST";
    const provenanceNote =
      input.modeRequested === "FAST"
        ? "FFmpeg Fast Render (ảnh & dữ liệu thật trong vườn)"
        : "Yêu cầu Hybrid/Cinematic → tự động chuyển về FFmpeg Fast Render do Muse chưa bật";

    this.db
      .prepare(
        `INSERT INTO video_jobs (
          job_id, idempotency_key, owner_id, organization_id, target_type, target_id,
          title, payload_json, mode_requested, mode_used, status, provenance_note,
          aspect_ratio, locale, duration_sec, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        jobId,
        input.idempotencyKey,
        input.ownerId,
        input.organizationId,
        input.targetType,
        input.targetId,
        input.title,
        JSON.stringify(input),
        input.modeRequested,
        modeUsed,
        provenanceNote,
        input.aspectRatio,
        input.locale,
        input.durationSec,
        now,
        now,
      );

    this.appendEvent(jobId, "queued", `Job created (modeRequested=${input.modeRequested})`);
    const createdRow = this.db.prepare("SELECT * FROM video_jobs WHERE job_id = ?").get(jobId) as RawJobRow;
    return { created: true, record: this.rowToRecord(createdRow) };
  }

  getJob(jobId: string): VideoJobRecord | null {
    const row = this.db.prepare("SELECT * FROM video_jobs WHERE job_id = ?").get(jobId) as RawJobRow | undefined;
    return row ? this.rowToRecord(row) : null;
  }

  listJobs(limit = 25): VideoJobRecord[] {
    const safeLimit = Math.min(100, Math.max(1, limit));
    const rows = this.db
      .prepare("SELECT * FROM video_jobs ORDER BY created_at DESC LIMIT ?")
      .all(safeLimit) as unknown as RawJobRow[];
    return rows.map((r) => this.rowToRecord(r));
  }

  claimNextQueuedJob(workerInstanceId: string, leaseSeconds = 120): ClaimedVideoJob | null {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const candidate = this.db
        .prepare("SELECT * FROM video_jobs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1")
        .get() as RawJobRow | undefined;

      if (!candidate) {
        this.db.exec("COMMIT");
        return null;
      }

      const now = new Date();
      const leaseExp = new Date(now.getTime() + leaseSeconds * 1000).toISOString();
      const upd = this.db
        .prepare(
          `UPDATE video_jobs
           SET status = 'preparing',
               attempt_count = attempt_count + 1,
               lease_owner = ?,
               lease_expires_at = ?,
               updated_at = ?
           WHERE job_id = ? AND status = 'queued'`,
        )
        .run(workerInstanceId, leaseExp, now.toISOString(), candidate.job_id);

      if (upd.changes === 0) {
        this.db.exec("COMMIT");
        return null;
      }

      this.appendEvent(candidate.job_id, "claimed", `Claimed by ${workerInstanceId}`);
      this.db.exec("COMMIT");

      const updatedRow = this.db
        .prepare("SELECT * FROM video_jobs WHERE job_id = ?")
        .get(candidate.job_id) as RawJobRow;
      return {
        record: this.rowToRecord(updatedRow),
        input: JSON.parse(updatedRow.payload_json) as CreateVideoJobInput,
      };
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  updateStatus(
    jobId: string,
    patch: Partial<{
      status: VideoJobStatus;
      modeUsed: VideoRenderMode;
      provenanceNote: string;
      mp4Url: string;
      vttUrl: string;
      posterUrl: string;
      qcReport: FfprobeQcReport;
      errorCode: string;
      errorMessage: string;
      completedAtIso: string;
    }>,
  ): VideoJobRecord | null {
    const existing = this.getJob(jobId);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db
      .prepare(
        `UPDATE video_jobs
         SET status = ?,
             mode_used = ?,
             provenance_note = ?,
             mp4_url = ?,
             vtt_url = ?,
             poster_url = ?,
             qc_json = ?,
             error_code = ?,
             error_message = ?,
             updated_at = ?,
             completed_at = ?
         WHERE job_id = ?`,
      )
      .run(
        patch.status ?? existing.status,
        patch.modeUsed ?? existing.modeUsed,
        patch.provenanceNote ?? existing.provenanceNote,
        patch.mp4Url ?? existing.mp4Url ?? null,
        patch.vttUrl ?? existing.vttUrl ?? null,
        patch.posterUrl ?? existing.posterUrl ?? null,
        patch.qcReport ? JSON.stringify(patch.qcReport) : existing.qcReport ? JSON.stringify(existing.qcReport) : null,
        patch.errorCode ?? existing.errorCode ?? null,
        patch.errorMessage ?? existing.errorMessage ?? null,
        now,
        patch.completedAtIso ?? existing.completedAtIso ?? null,
        jobId,
      );

    if (patch.status) {
      this.appendEvent(jobId, patch.status, patch.errorMessage || patch.provenanceNote || patch.status);
    }
    return this.getJob(jobId);
  }

  cancelJob(jobId: string): VideoJobRecord | null {
    const existing = this.getJob(jobId);
    if (!existing) return null;
    if (existing.status === "completed" || existing.status === "failed" || existing.status === "canceled") {
      return existing;
    }
    return this.updateStatus(jobId, {
      status: "canceled",
      errorCode: "USER_CANCELED",
      errorMessage: "Tác vụ đã được hủy bởi người dùng.",
    });
  }

  reconcileExpiredLeases(): number {
    const now = new Date().toISOString();
    const res = this.db
      .prepare(
        `UPDATE video_jobs
         SET status = 'needs_reconciliation',
             updated_at = ?,
             error_code = 'LEASE_EXPIRED',
             error_message = 'Worker lease expired before completion; inspect or retry.'
         WHERE status IN ('preparing', 'generating_ai', 'rendering', 'validating', 'uploading')
           AND lease_expires_at IS NOT NULL
           AND lease_expires_at < ?`,
      )
      .run(now, now);
    return Number(res.changes ?? 0);
  }

  close() {
    this.db.close();
  }
}
