import { Drawer } from 'expo-router/drawer';

export default function AdminLayout() {
  return (
    <Drawer>
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