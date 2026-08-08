import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />

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