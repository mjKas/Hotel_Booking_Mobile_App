import { Drawer } from 'expo-router/drawer';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function AdminLayout() {
  const colors = useAppThemeColors();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: {
          backgroundColor: colors.surface,
        },
        drawerContentStyle: {
          backgroundColor: colors.surface,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />

      <Drawer.Screen
        name="manageRooms"
        options={{
          drawerLabel: 'Manage Rooms',
          title: 'Manage Rooms',
        }}
      />

      <Drawer.Screen
        name="manageBookings"
        options={{
          drawerLabel: 'Manage Bookings',
          title: 'Manage Bookings',
        }}
      />
    </Drawer>
  );
}
