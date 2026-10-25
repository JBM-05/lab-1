export const MAX_EVENTS = 500;
export type AppStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';
export type LabPlatform = 'android' | 'ios' | 'web';
export type WindowSize = { width: number; height: number };
export type Observation =
  | { kind: 'startup' }
  | { kind: 'initial-state'; state: AppStatus }
  | { kind: 'state-change'; state: AppStatus; previous: AppStatus; resumed: boolean }
  | { kind: 'focus' | 'blur' }
  | { kind: 'window-size'; width: number; height: number };
export type LifecycleEvent = Observation & {
  sessionId: string;
  sequence: number;
  timestamp: string;
  platform: LabPlatform;
};

export function retain(events: LifecycleEvent[]): LifecycleEvent[] {
  return events.slice(-MAX_EVENTS);
}

export function describeEvent(event: Observation): string {
  switch (event.kind) {
    case 'startup':
      return 'JavaScript session started';
    case 'initial-state':
      return `Initial app state: ${event.state}`;
    case 'state-change':
      return `${event.previous} → ${event.state}${event.resumed ? ' (returned from background)' : ''}`;
    case 'focus':
      return 'Android focus gained';
    case 'blur':
      return 'Android focus lost';
    case 'window-size':
      return `Window size: ${event.width} × ${event.height} dp (resize, not necessarily rotation)`;
  }
}

export function formatLog(events: readonly LifecycleEvent[]): string {
  return [
    'Lifecycle Lab — observed JavaScript events',
    'Expo Go observations describe the host runtime. New sessions do not identify a termination cause.',
    'Pending writes can be lost on abrupt termination. No reliable JavaScript destruction callback.',
    ...events.map(
      (event) =>
        `${event.timestamp} | ${event.platform} | ${event.sessionId} #${event.sequence} | ${describeEvent(event)}`,
    ),
  ].join('\n');
}

const states: readonly unknown[] = ['active', 'background', 'inactive', 'unknown', 'extension'];
export function normalizeState(state: unknown): AppStatus {
  return states.includes(state) ? (state as AppStatus) : 'unknown';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEvent(value: unknown): value is LifecycleEvent {
  if (
    !isRecord(value) ||
    typeof value.sessionId !== 'string' ||
    !value.sessionId.length ||
    value.sessionId.length > 100 ||
    !Number.isSafeInteger(value.sequence) ||
    Number(value.sequence) < 1 ||
    typeof value.timestamp !== 'string' ||
    value.timestamp.length > 30 ||
    !Number.isFinite(Date.parse(value.timestamp)) ||
    typeof value.platform !== 'string' ||
    !['android', 'ios', 'web'].includes(value.platform)
  )
    return false;
  switch (value.kind) {
    case 'startup':
    case 'focus':
    case 'blur':
      return true;
    case 'initial-state':
      return states.includes(value.state);
    case 'state-change':
      return (
        states.includes(value.state) &&
        states.includes(value.previous) &&
        typeof value.resumed === 'boolean'
      );
    case 'window-size':
      return (
        typeof value.width === 'number' &&
        Number.isFinite(value.width) &&
        value.width >= 0 &&
        typeof value.height === 'number' &&
        Number.isFinite(value.height) &&
        value.height >= 0
      );
    default:
      return false;
  }
}

export function decodeLog(raw: string | null): LifecycleEvent[] {
  if (raw === null) return [];
  if (raw.length > 1_000_000) throw new Error('Invalid saved log');
  const data: unknown = JSON.parse(raw);
  if (
    !isRecord(data) ||
    data.version !== 1 ||
    !Array.isArray(data.events) ||
    data.events.length > MAX_EVENTS ||
    !data.events.every(isEvent)
  )
    throw new Error('Invalid saved log');
  const keys = new Set(data.events.map((event) => `${event.sessionId}:${event.sequence}`));
  if (keys.size !== data.events.length) throw new Error('Duplicate saved events');
  return data.events;
}

export function encodeLog(events: readonly LifecycleEvent[]): string {
  return JSON.stringify({ version: 1, events });
}
