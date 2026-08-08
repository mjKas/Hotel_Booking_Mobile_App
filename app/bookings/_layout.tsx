import { Stack } from 'expo-router';

export default function BookingsLayout() {
  return (
    <Stack>
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