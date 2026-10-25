import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const experiments = [
  [
    '1 · Home → return',
    'Increment the counter, note the session, then go Home and return. Compare background/active events and the counter. iOS may also report inactive.',
  ],
  [
    '2 · Rotate twice',
    'Enable device auto-rotation. Rotate portrait → landscape → portrait. Compare window dimensions and counter values. Resizing does not necessarily change AppState or recreate the runtime.',
  ],
  [
    '3 · Switch apps',
    'Open another app, then return. Compare its sequence with Home. On Android, also try the notification shade: blur may occur without an AppState change.',
  ],
  [
    '4 · Swipe away → relaunch',
    'Wait for Storage: saved, note the session and counter, then dismiss the app from Recents and reopen it. In Expo Go, dismiss the host and reopen this project. Compare saved history with the current session. Do not infer a destruction event or termination cause.',
  ],
];
const mapping = [
  ['Created', 'JavaScript session startup, not native window creation.'],
  ['Activated', 'AppState reports active.'],
  ['Deactivated', 'iOS inactive or Android blur are observations with different meanings.'],
  ['Stopped', 'Background is the closest observation; it does not prove execution stopped.'],
  ['Resumed', 'Active after background, including an intermediate inactive state.'],
  [
    'Destroying',
    'No reliable JavaScript termination callback. React effect cleanup is not app destruction.',
  ],
];

export default function GuideScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 24,
          paddingBottom: BottomTabInset + 40,
          gap: 24,
          maxWidth: 800,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <ThemedText type="subtitle" accessibilityRole="header">
          Lab Guide
        </ThemedText>
        <ThemedText>
          Why is mobile different? The OS controls when an app can run, pause, or disappear. Observe
          what happens instead of assuming a fixed event sequence.
        </ThemedText>
        <ThemedText>
          Before recording: disable Fast Refresh, record the OS/device and Expo Go version, and wait
          for storage to finish loading. Export each experiment before clearing the log. Share
          sheets can themselves cause lifecycle changes.
        </ThemedText>
        {experiments.map(([title, body]) => (
          <View key={title} style={{ gap: 8 }}>
            <ThemedText accessibilityRole="header" style={{ fontWeight: '700' }}>
              {title}
            </ThemedText>
            <ThemedText>{body}</ThemedText>
          </View>
        ))}
        <ThemedText accessibilityRole="header" style={{ fontWeight: '700' }}>
          MAUI concepts → React Native observations
        </ThemedText>
        {mapping.map(([title, body]) => (
          <View key={title} style={{ gap: 8 }}>
            <ThemedText style={{ fontWeight: '700' }}>{title}</ThemedText>
            <ThemedText>{body}</ThemedText>
          </View>
        ))}
        <ThemedText>
          Record actual results separately on Android and iOS in Lab01/FINDINGS.md. Expo Go measures
          its host runtime; web is only a preview. A JavaScript reload can also start a session.
          Missing events are not proof of a particular OS action.
        </ThemedText>
        <ThemedText>
          Logs stay on this device until you choose Share Log. Only the latest 500 entries are
          retained. No background polling, accounts, or network service is used by the logger.
          Clearing removes log history, not the counter or current session.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}
