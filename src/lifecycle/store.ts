import {
  decodeLog,
  encodeLog,
  retain,
  type AppStatus,
  type LabPlatform,
  type LifecycleEvent,
  type Observation,
  type WindowSize,
} from './model';

export interface LogStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
}
export type LabSnapshot = {
  events: LifecycleEvent[];
  state: AppStatus;
  window: WindowSize;
  count: number;
  storageStatus: 'loading' | 'saving' | 'saved' | 'error';
  storageError: string | null;
};

// A small external store keeps event ordering independent of React render timing.
export class LifecycleStore {
  private snapshot: LabSnapshot = {
    events: [],
    state: 'unknown',
    window: { width: 0, height: 0 },
    count: 0,
    storageStatus: 'loading',
    storageError: null,
  };
  private listeners = new Set<() => void>();
  private sequence = 0;
  private started = false;
  private wasBackground = false;
  private hydrated = false;
  private discardSaved = false;
  private loading: Promise<void> | undefined;
  private writeQueue = Promise.resolve();
  private revision = 0;

  constructor(
    private storage: LogStorage,
    readonly sessionId: string,
    private platform: LabPlatform,
    private now: () => string = () => new Date().toISOString(),
  ) {}

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(change: Partial<LabSnapshot>) {
    this.snapshot = { ...this.snapshot, ...change };
    this.listeners.forEach((listener) => listener());
  }
  private record(observation: Observation) {
    const event: LifecycleEvent = {
      ...observation,
      sessionId: this.sessionId,
      platform: this.platform,
      timestamp: this.now(),
      sequence: ++this.sequence,
    };
    this.update({ events: retain([...this.snapshot.events, event]) });
    if (this.hydrated) this.persist();
  }
  start(state: AppStatus, window: WindowSize) {
    if (this.started) return;
    this.started = true;
    this.wasBackground = state === 'background';
    this.update({ state, window });
    this.record({ kind: 'startup' });
    this.record({ kind: 'initial-state', state });
    this.record({ kind: 'window-size', ...window });
    void this.hydrate();
  }
  changeState = (state: AppStatus) => {
    const previous = this.snapshot.state;
    if (previous === state) return;
    const resumed = state === 'active' && this.wasBackground;
    if (state === 'background') this.wasBackground = true;
    if (state === 'active') this.wasBackground = false;
    this.update({ state });
    this.record({ kind: 'state-change', previous, state, resumed });
  };
  changeWindow = (window: WindowSize) => {
    if (
      window.width === this.snapshot.window.width &&
      window.height === this.snapshot.window.height
    )
      return;
    this.update({ window });
    this.record({ kind: 'window-size', ...window });
  };
  focus = (kind: 'focus' | 'blur') => this.record({ kind });
  increment = () => this.update({ count: this.snapshot.count + 1 });
  clear = () => {
    this.discardSaved = true;
    this.update({ events: [] });
    if (this.hydrated) this.persist();
    else void this.hydrate();
  };
  retry = () => {
    if (this.hydrated) this.persist();
    else void this.hydrate();
  };

  private hydrate(): Promise<void> {
    if (this.loading) return this.loading;
    this.update({ storageStatus: 'loading', storageError: null });
    this.loading = (async () => {
      try {
        const raw = await this.storage.read();
        let saved: LifecycleEvent[] = [];
        try {
          saved = this.discardSaved ? [] : decodeLog(raw);
        } catch {
          this.update({
            storageStatus: 'error',
            storageError: 'Saved log is invalid. Clear Log to replace it with a new log.',
          });
          return;
        }
        this.hydrated = true;
        this.update({ events: retain([...saved, ...this.snapshot.events]) });
        this.persist();
      } catch {
        this.update({
          storageStatus: 'error',
          storageError:
            'Could not load saved logs. Live logging continues. Retry storage to recover history.',
        });
      } finally {
        this.loading = undefined;
      }
    })();
    return this.loading;
  }

  private persist() {
    const revision = ++this.revision;
    const payload = encodeLog(this.snapshot.events);
    this.update({ storageStatus: 'saving', storageError: null });
    this.writeQueue = this.writeQueue.then(async () => {
      // Coalesce queued snapshots; an in-flight write always finishes before clearing.
      if (revision !== this.revision) return;
      try {
        await this.storage.write(payload);
        if (revision === this.revision) this.update({ storageStatus: 'saved', storageError: null });
      } catch {
        if (revision === this.revision)
          this.update({
            storageStatus: 'error',
            storageError:
              'Could not save logs. Live logging continues. Retry storage before closing the app.',
          });
      }
    });
  }

  async settled() {
    await this.loading;
    await this.writeQueue;
  }
}
