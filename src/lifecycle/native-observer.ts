import { AppState, Dimensions, Platform } from 'react-native';
import { normalizeState } from './model';
import type { LifecycleStore } from './store';

export function observeLifecycle(store: LifecycleStore): () => void {
  const window = Dimensions.get('window');
  store.start(normalizeState(AppState.currentState), {
    width: window.width,
    height: window.height,
  });
  // Reconcile after effect reattachment without inventing another startup event.
  store.changeState(normalizeState(AppState.currentState));
  store.changeWindow({ width: window.width, height: window.height });
  const subscriptions = [
    AppState.addEventListener('change', (state) => store.changeState(normalizeState(state))),
    Dimensions.addEventListener('change', ({ window: size }) =>
      store.changeWindow({ width: size.width, height: size.height }),
    ),
  ];
  if (Platform.OS === 'android') {
    subscriptions.push(AppState.addEventListener('focus', () => store.focus('focus')));
    subscriptions.push(AppState.addEventListener('blur', () => store.focus('blur')));
  }
  return () => subscriptions.forEach((subscription) => subscription.remove());
}
