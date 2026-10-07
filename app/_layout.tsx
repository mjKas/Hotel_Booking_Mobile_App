import { useEffect } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  ThemePreferenceProvider,
  useThemePreference,
} from '../src/context/theme-preference';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemePreferenceProvider>
        <RootLayoutContent />
      </ThemePreferenceProvider>
    </QueryClientProvider>
  );
}

function RootLayoutContent() {
  const { themeMode, paperTheme } = useThemePreference();

  const status = useAuthStore((state) => state.status);
  const restore = useAuthStore((state) => state.restore);
  const pathname = usePathname();

  // Spends the stored refresh token to rebuild the session on a cold start.
  useEffect(() => {
    void restore();
  }, [restore]);

  // A keyboard opened on one screen must not follow the user to the next one.
  useEffect(() => {
    Keyboard.dismiss();
  }, [pathname]);

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {status === 'loading' ? (
        <View
          style={[
            styles.splash,
            { backgroundColor: paperTheme.colors.background },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={paperTheme.colors.primary}
          />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="customer" />
          <Stack.Screen name="admin" />
        </Stack>
      )}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
