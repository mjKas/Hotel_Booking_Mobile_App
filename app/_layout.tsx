import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import {
  ThemePreferenceProvider,
  useThemePreference,
} from '../src/context/theme-preference';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutContent />
    </ThemePreferenceProvider>
  );
}

function RootLayoutContent() {
  const { themeMode, paperTheme } = useThemePreference();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="rooms" />
        <Stack.Screen name="bookings" />
        <Stack.Screen name="admin" />
      </Stack>
    </PaperProvider>
  );
}
