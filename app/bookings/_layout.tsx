import { Stack } from 'expo-router';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function BookingsLayout() {
  const colors = useAppThemeColors();

  return (
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
  );
}
