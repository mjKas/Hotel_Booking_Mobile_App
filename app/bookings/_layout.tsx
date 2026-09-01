import { Stack } from 'expo-router';

import { RequireAuth } from '@/src/components/route-guards';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function BookingsLayout() {
  const colors = useAppThemeColors();

  return (
    <RequireAuth>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="create"
          options={{
            title: 'Book Room',
          }}
        />

        <Stack.Screen
          name="[id]"
          options={{
            title: 'Booking Details',
          }}
        />

        <Stack.Screen
          name="confirmation"
          options={{
            title: 'Booking Confirmation',
            headerBackVisible: false,
          }}
        />
      </Stack>
    </RequireAuth>
  );
}
