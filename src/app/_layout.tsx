import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { LifecycleProvider } from '@/lifecycle/provider';
import { useEffect } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LifecycleProvider>
        <AppTabs />
      </LifecycleProvider>
    </ThemeProvider>
  );
}
