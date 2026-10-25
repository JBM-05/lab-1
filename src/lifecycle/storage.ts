import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LogStorage } from './store';

const STORAGE_KEY = '@lifecycle-lab/events-v1';
// Diagnostics only: AsyncStorage is not credential storage.
export const logStorage: LogStorage = {
  read: () => AsyncStorage.getItem(STORAGE_KEY),
  write: (value) => AsyncStorage.setItem(STORAGE_KEY, value),
};
