import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, fireEventAsync, render, screen } from '@testing-library/react-native';
import { Share } from 'react-native';
import HomeScreen from '@/app/index';
import { useLifecycle } from '../provider';
import type { LabSnapshot } from '../store';

jest.mock('../provider', () => ({ useLifecycle: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual<typeof import('react-native')>('react-native').View,
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'storeClient' },
}));

function state(overrides: Partial<LabSnapshot> = {}) {
  return {
    events: [],
    state: 'active' as const,
    window: { width: 400, height: 800 },
    count: 0,
    storageStatus: 'saved' as const,
    storageError: null,
    sessionId: 'test-session',
    increment: jest.fn(),
    clear: jest.fn(),
    retry: jest.fn(),
    ...overrides,
  };
}

describe('Lifecycle Log accessibility', () => {
  it('provides named controls, empty state, and counter action', async () => {
    const lab = state();
    jest.mocked(useLifecycle).mockReturnValue(lab);
    await render(<HomeScreen />);
    expect(screen.getByRole('header', { name: 'Lifecycle Log' })).toBeTruthy();
    expect(screen.getByText(/No recorded events/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share Log' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Increment counter' }));
    expect(lab.increment).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear Log' }));
    expect(lab.clear).toHaveBeenCalledTimes(1);
  });
  it('announces storage failure and exposes retry', async () => {
    const lab = state({ storageStatus: 'error', storageError: 'Could not save logs.' });
    jest.mocked(useLifecycle).mockReturnValue(lab);
    await render(<HomeScreen />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save logs.');
    await fireEvent.press(screen.getByRole('button', { name: 'Retry storage' }));
    expect(lab.retry).toHaveBeenCalledTimes(1);
  });
  it('shares an observed snapshot and preserves entries after sharing fails', async () => {
    const lab = state({
      events: [
        {
          kind: 'startup',
          sessionId: 'old-session',
          sequence: 1,
          timestamp: '2026-10-25T12:00:00.000Z',
          platform: 'ios',
        },
      ],
    });
    jest.mocked(useLifecycle).mockReturnValue(lab);
    const share = jest.spyOn(Share, 'share').mockRejectedValueOnce(new Error('Unavailable'));
    await render(<HomeScreen />);
    await fireEventAsync.press(screen.getByRole('button', { name: 'Share Log' }));
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('old-session #1') }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/Could not share/);
    expect(screen.getByText('JavaScript session started')).toBeTruthy();
    share.mockRestore();
  });
});
