import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
} from 'expo-router/drawer';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BiometricEnrolmentPrompt } from '@/src/components/biometric-enrolment-prompt';
import { RequireAdmin } from '@/src/components/route-guards';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

function CustomDrawerContent(props: any) {
  const colors = useAppThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          ADMINISTRATION
        </Text>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View
        style={[
          styles.appearanceSection,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.surfaceVariant,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          APPEARANCE
        </Text>

        <ThemeModeSelector />
      </View>
    </View>
  );
}

export default function AdminLayout() {
  const colors = useAppThemeColors();

  return (
    <RequireAdmin>
      <BiometricEnrolmentPrompt />

      <Drawer
        drawerContent={(props) => (
          <CustomDrawerContent {...props} />
        )}
        screenOptions={{
          headerShown: true,

          drawerStyle: {
            width: 330,
            backgroundColor: colors.surface,
          },

          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.textPrimary,

          drawerActiveBackgroundColor: colors.surfaceVariant,

          drawerLabelStyle: {
            fontSize: 17,
            fontWeight: '500',
          },

          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 8,
            marginVertical: 3,
          },

          headerStyle: {
            backgroundColor: colors.surface,
          },

          headerTintColor: colors.textPrimary,

          headerTitleStyle: {
            fontWeight: '700',
          },

          sceneStyle: {
            backgroundColor: colors.background,
          },
        }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  appearanceSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    borderTopWidth: 1,
  },
});