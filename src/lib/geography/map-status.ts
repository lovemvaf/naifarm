/**
 * Map tile & vector layer resilience state machine.
 * Debounces repeated Leaflet tileerror events so the UI shows at most one quiet,
 * non-blocking status notice while local Dong Nai GeoJSON vector layers continue working.
 */

export type MapBasemapState = "healthy" | "tiles_degraded" | "offline_vector_only";

export interface MapStatusSnapshot {
  state: MapBasemapState;
  tileErrorCount: number;
  lastErrorAt: number | null;
  dismissedNotice: boolean;
}

const DEBOUNCE_WINDOW_MS = 1200;
const OFFLINE_THRESHOLD = 3;

export class MapStatusStore {
  private state: MapBasemapState = "healthy";
  private tileErrorCount = 0;
  private lastErrorAt: number | null = null;
  private dismissedNotice = false;
  private listeners = new Set<(snap: MapStatusSnapshot) => void>();

  constructor(initialOffline = false) {
    if (initialOffline) {
      this.state = "offline_vector_only";
    }
  }

  getSnapshot(): MapStatusSnapshot {
    return {
      state: this.state,
      tileErrorCount: this.tileErrorCount,
      lastErrorAt: this.lastErrorAt,
      dismissedNotice: this.dismissedNotice,
    };
  }

  subscribe(listener: (snap: MapStatusSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snap = this.getSnapshot();
    for (const cb of this.listeners) cb(snap);
  }

  recordTileError(now = Date.now()): void {
    this.tileErrorCount += 1;
    // Debounce burst errors inside window so we don't spam React state transitions per tile
    if (this.lastErrorAt && now - this.lastErrorAt < DEBOUNCE_WINDOW_MS && this.state !== "healthy") {
      this.lastErrorAt = now;
      if (this.tileErrorCount >= OFFLINE_THRESHOLD && this.state === "tiles_degraded") {
        this.state = "offline_vector_only";
        this.emit();
      }
      return;
    }
    this.lastErrorAt = now;
    this.state = this.tileErrorCount >= OFFLINE_THRESHOLD ? "offline_vector_only" : "tiles_degraded";
    this.emit();
  }

  recordTileLoad(): void {
    if (this.state !== "healthy") {
      this.state = "healthy";
      this.tileErrorCount = 0;
      this.dismissedNotice = false;
      this.emit();
    }
  }

  dismiss(): void {
    if (!this.dismissedNotice) {
      this.dismissedNotice = true;
      this.emit();
    }
  }

  reset(): void {
    this.state = typeof navigator !== "undefined" && navigator.onLine === false ? "offline_vector_only" : "healthy";
    this.tileErrorCount = 0;
    this.lastErrorAt = null;
    this.dismissedNotice = false;
    this.emit();
  }
}
