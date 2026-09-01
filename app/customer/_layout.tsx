import { Stack } from 'expo-router';

import { RequireAuth } from '@/src/components/route-guards';

export default function CustomerLayout() {
  return (
    <RequireAuth>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
      </Stack>
    </RequireAuth>
  );
}
