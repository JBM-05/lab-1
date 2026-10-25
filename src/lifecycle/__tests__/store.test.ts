import { describe, expect, it, jest } from '@jest/globals';
import { decodeLog, encodeLog, formatLog, type LifecycleEvent } from '../model';
import { LifecycleStore, type LogStorage } from '../store';

const size = { width: 400, height: 800 };
function setup(storage?: LogStorage, sessionId = 'test-session') {
  const memory = { value: null as string | null };
  const adapter = storage ?? {
    read: async () => memory.value,
    write: async (value: string) => {
      memory.value = value;
    },
  };
  const store = new LifecycleStore(adapter, sessionId, 'ios', () => '2026-10-25T12:00:00.000Z');
  store.start('active', size);
  return { store, memory, adapter };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('lifecycle behavior', () => {
  it('orders observations and classifies resume through inactive without conflating focus', async () => {
    const { store } = setup();
    store.start('active', size);
    store.increment();
    store.changeState('inactive');
    store.changeState('active');
    store.changeState('background');
    store.changeState('inactive');
    store.changeState('active');
    store.focus('blur');
    store.focus('focus');
    store.changeWindow({ width: 800, height: 400 });
    store.changeWindow({ width: 800, height: 400 });
    await store.settled();
    const { events, count, state } = store.getSnapshot();
    expect(events.filter((event) => event.kind === 'startup')).toHaveLength(1);
    expect(events.filter((event) => event.kind === 'window-size')).toHaveLength(2);
    expect(events.filter((event) => event.kind === 'state-change' && event.resumed)).toHaveLength(
      1,
    );
    expect(events.map((event) => event.sequence)).toEqual(events.map((_, index) => index + 1));
    expect(count).toBe(1);
    expect(state).toBe('active');
    expect(formatLog(events)).toContain('No reliable JavaScript destruction callback');
  });

  it('retains the latest 500 events, restores old sessions, and resets the counter', async () => {
    const { store, adapter } = setup();
    store.increment();
    for (let index = 0; index < 600; index++) store.focus(index % 2 ? 'focus' : 'blur');
    await store.settled();
    expect(store.getSnapshot().events).toHaveLength(500);
    const next = setup(adapter, 'next-session').store;
    await next.settled();
    expect(next.getSnapshot().events).toHaveLength(500);
    expect(next.getSnapshot().events[0].sessionId).toBe('test-session');
    expect(next.getSnapshot().events.at(-1)?.sessionId).toBe('next-session');
    expect(next.getSnapshot().count).toBe(0);
  });

  it('keeps observations made while history is loading and retries a failed read', async () => {
    const read = jest
      .fn<LogStorage['read']>()
      .mockRejectedValueOnce(new Error('offline storage'))
      .mockResolvedValueOnce(null);
    const write = jest.fn<LogStorage['write']>().mockResolvedValue(undefined);
    const { store } = setup({ read, write });
    store.changeState('background');
    await store.settled();
    expect(store.getSnapshot().storageStatus).toBe('error');
    expect(write).not.toHaveBeenCalled();
    store.retry();
    await store.settled();
    expect(store.getSnapshot().events.at(-1)?.kind).toBe('state-change');
    expect(store.getSnapshot().storageStatus).toBe('saved');
  });

  it('recovers a failed write without losing live events', async () => {
    const write = jest
      .fn<LogStorage['write']>()
      .mockRejectedValueOnce(new Error('disk'))
      .mockResolvedValue(undefined);
    const { store } = setup({ read: async () => null, write });
    await store.settled();
    expect(store.getSnapshot().storageStatus).toBe('error');
    store.changeState('background');
    store.retry();
    await store.settled();
    expect(store.getSnapshot().storageStatus).toBe('saved');
    expect(decodeLog(write.mock.calls.at(-1)![0])).toHaveLength(4);
  });

  it('clears after an in-flight write and does not resurrect history', async () => {
    const writing = deferred<void>();
    let stored: string | null = null;
    let calls = 0;
    const { store } = setup({
      read: async () => null,
      write: async (value) => {
        if (++calls === 1) await writing.promise;
        stored = value;
      },
    });
    await Promise.resolve();
    await Promise.resolve();
    store.clear();
    writing.resolve();
    await store.settled();
    expect(decodeLog(stored)).toEqual([]);
    expect(store.getSnapshot().events).toEqual([]);
  });

  it('clears during hydration without merging the old log back in', async () => {
    const old = setup();
    await old.store.settled();
    const reading = deferred<string | null>();
    let stored: string | null = null;
    const { store } = setup({
      read: () => reading.promise,
      write: async (value) => {
        stored = value;
      },
    });
    store.clear();
    store.changeState('background');
    reading.resolve(old.memory.value);
    await store.settled();
    expect(decodeLog(stored)).toHaveLength(1);
    expect(decodeLog(stored)[0].kind).toBe('state-change');
  });

  it('does not overwrite corrupt history until Clear Log is chosen', async () => {
    const write = jest.fn<LogStorage['write']>().mockResolvedValue(undefined);
    const { store } = setup({ read: async () => '{invalid', write });
    await store.settled();
    expect(store.getSnapshot().storageError).toContain('invalid');
    expect(write).not.toHaveBeenCalled();
    store.clear();
    await store.settled();
    expect(store.getSnapshot().storageStatus).toBe('saved');
    expect(decodeLog(write.mock.calls[0][0])).toEqual([]);
  });

  it('rejects invalid persisted schema, event payloads, and duplicate identifiers', () => {
    expect(() => decodeLog('{"version":2,"events":[]}')).toThrow();
    expect(() => decodeLog('{"version":1,"events":[{"kind":"state-change"}]}')).toThrow();
    const event: LifecycleEvent = {
      kind: 'startup',
      sequence: 1,
      sessionId: 's',
      platform: 'ios',
      timestamp: '2026-10-25T12:00:00.000Z',
    };
    expect(() => decodeLog(encodeLog([event, event]))).toThrow();
  });
});
