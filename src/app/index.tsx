import Constants from 'expo-constants';
import { useState } from 'react';
import { FlatList, Platform, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabButton } from '@/components/lab-button';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { describeEvent, formatLog } from '@/lifecycle/model';
import { useLifecycle } from '@/lifecycle/provider';

export default function HomeScreen() {
  const lab = useLifecycle();
  const theme = useTheme();
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const runtime =
    Platform.OS === 'web'
      ? 'Web preview — not mobile lifecycle evidence'
      : Constants.executionEnvironment === 'storeClient'
        ? 'Expo Go — host-runtime observations'
        : 'Native app runtime';

  async function shareLog() {
    setShareError(null);
    setSharing(true);
    try {
      await Share.share({
        title: 'Lifecycle Lab',
        message: `${runtime}\n${formatLog(lab.events)}`,
      });
    } catch {
      setShareError(
        'Could not share the log. Try Share Log again; entries remain available below.',
      );
    } finally {
      setSharing(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={[...lab.events].reverse()}
        keyExtractor={(event) => `${event.sessionId}:${event.sequence}`}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle" accessibilityRole="header">
              Lifecycle Log
            </ThemedText>
            <ThemedText themeColor="textSecondary">{runtime}</ThemedText>
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText selectable accessibilityLiveRegion="polite">
                App state: {lab.state}
              </ThemedText>
              <ThemedText selectable>
                Window: {lab.window.width} × {lab.window.height} dp
              </ThemedText>
              <ThemedText selectable type="small">
                Current session: {lab.sessionId}
              </ThemedText>
              <ThemedText selectable accessibilityLiveRegion="polite">
                Counter: {lab.count}
              </ThemedText>
              <LabButton label="Increment counter" onPress={lab.increment} />
              <ThemedText type="small" themeColor="textSecondary">
                The counter lives in memory. A new JavaScript runtime resets it.
              </ThemedText>
            </View>
            <View style={styles.actions}>
              <LabButton label="Clear Log" onPress={lab.clear} />
              <LabButton
                label={sharing ? 'Sharing…' : 'Share Log'}
                onPress={() => void shareLog()}
                disabled={sharing || lab.events.length === 0}
              />
            </View>
            <ThemedText type="small" accessibilityLiveRegion="polite">
              Storage: {lab.storageStatus} · {lab.events.length}/500 entries
            </ThemedText>
            {lab.storageError && (
              <View style={styles.header}>
                <ThemedText selectable accessibilityRole="alert">
                  {lab.storageError}
                </ThemedText>
                <LabButton label="Retry storage" onPress={lab.retry} />
              </View>
            )}
            {shareError && (
              <ThemedText selectable accessibilityRole="alert">
                {shareError}
              </ThemedText>
            )}
            <ThemedText type="small" themeColor="textSecondary">
              Newest first. Earlier-session entries are saved history. Abrupt termination can lose
              pending writes; a new session does not reveal why the previous one ended.
            </ThemedText>
            <ThemedText accessibilityRole="header" style={{ fontWeight: '700' }}>
              Observed events
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <ThemedText>
            No recorded events. Use Home, switch apps, or rotate to observe changes.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <View style={[styles.event, { borderColor: theme.backgroundSelected }]}>
            <ThemedText selectable>{describeEvent(item)}</ThemedText>
            <ThemedText selectable type="small" themeColor="textSecondary">
              {item.timestamp} · #{item.sequence} · {item.platform}
            </ThemedText>
            <ThemedText selectable type="small" themeColor="textSecondary">
              {item.sessionId === lab.sessionId ? 'Current session' : 'Saved session'}:{' '}
              {item.sessionId}
            </ThemedText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: BottomTabInset + 40,
  },
  header: { gap: 12, marginBottom: 16 },
  card: { padding: 16, gap: 12, borderRadius: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  event: { paddingVertical: 16, borderBottomWidth: 1, gap: 6 },
});
