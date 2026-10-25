import { createContext, use, useEffect, useSyncExternalStore, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { observeLifecycle } from './native-observer';
import { logStorage } from './storage';
import { LifecycleStore } from './store';

// One session per module/runtime, never per screen or effect invocation.
const runtimeStore = new LifecycleStore(
  logStorage,
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
);
const LifecycleContext = createContext<LifecycleStore | null>(null);

export function LifecycleProvider({
  children,
  store = runtimeStore,
}: PropsWithChildren<{ store?: LifecycleStore }>) {
  useEffect(() => observeLifecycle(store), [store]);
  return <LifecycleContext value={store}>{children}</LifecycleContext>;
}

export function useLifecycle() {
  const store = use(LifecycleContext);
  if (!store) throw new Error('LifecycleProvider is required');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return {
    ...snapshot,
    sessionId: store.sessionId,
    increment: store.increment,
    clear: store.clear,
    retry: store.retry,
  };
}
