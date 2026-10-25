import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { AppState, Dimensions, Platform } from 'react-native';
import { observeLifecycle } from '../native-observer';
import { LifecycleStore } from '../store';

afterEach(() => {
  jest.restoreAllMocks();
});
describe('native observer', () => {
  it('removes subscriptions on cleanup and reattaches without duplicate startup', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const removals: unknown[] = [];
    const add = () => {
      const remove = jest.fn();
      removals.push(remove);
      return { remove };
    };
    const app = jest.spyOn(AppState, 'addEventListener').mockImplementation(add);
    const subscribeDimensions = Dimensions.addEventListener.bind(Dimensions);
    jest.spyOn(Dimensions, 'addEventListener').mockImplementation((type, handler) => {
      const subscription = subscribeDimensions(type, handler);
      const remove = jest.spyOn(subscription, 'remove');
      removals.push(remove);
      return subscription;
    });
    const store = new LifecycleStore(
      { read: async () => null, write: async () => undefined },
      's',
      'android',
    );
    try {
      const stop = observeLifecycle(store);
      expect(app.mock.calls.map(([name]) => name)).toEqual(['change', 'focus', 'blur']);
      stop();
      expect(removals).toHaveLength(4);
      removals.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
      const stopAgain = observeLifecycle(store);
      expect(store.getSnapshot().events.filter((event) => event.kind === 'startup')).toHaveLength(
        1,
      );
      stopAgain();
      await store.settled();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
