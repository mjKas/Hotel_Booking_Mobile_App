import React from 'react';
import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent, useDrawerScreenOptions } from '@/src/components/app-drawer';
import { BiometricEnrolmentPrompt } from '@/src/components/biometric-enrolment-prompt';
import { RequireAdmin } from '@/src/components/route-guards';

export default function AdminLayout() {
  const screenOptions = useDrawerScreenOptions('/admin/security');

  return (
    <RequireAdmin>
      <BiometricEnrolmentPrompt />

      <Drawer
        drawerContent={(props) => (
          <AppDrawerContent {...props} sectionTitle="ADMINISTRATION" />
        )}
        screenOptions={screenOptions}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Dashboard',
            drawerLabel: 'Dashboard',
          }}
        />

        <Drawer.Screen
          name="manageRooms"
          options={{
            title: 'Manage Rooms',
            drawerLabel: 'Manage Rooms',
          }}
        />

        <Drawer.Screen
          name="manageBookings"
          options={{
            title: 'Manage Bookings',
            drawerLabel: 'Manage Bookings',
          }}
        />

        <Drawer.Screen
          name="manageUser"
          options={{
            title: 'Manage Users',
            drawerLabel: 'Manage Users',
          }}
        />

        <Drawer.Screen
          name="security"
          options={{
            title: 'Security',
            drawerLabel: 'Security',
          }}
        />
      </Drawer>
    </RequireAdmin>
  );
}
