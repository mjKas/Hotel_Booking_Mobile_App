import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  ThemePreferenceProvider,
  useThemePreference,
} from '../src/context/theme-preference';
import { ApiError } from '../src/api/apiError';
import { useAuthStore } from '../src/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx will not fix itself on retry, and retrying a 401 fights with the
      // token refresh already built into apiClient.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }

        return failureCount < 2;
      },
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
});

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

  // Spends the stored refresh token to rebuild the session on a cold start.
  useEffect(() => {
    void restore();
  }, [restore]);

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
          <Stack.Screen name="rooms" />
          <Stack.Screen name="bookings" />
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
