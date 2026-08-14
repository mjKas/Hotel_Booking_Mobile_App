import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentComponentProps,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const colors = useAppThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.navigation}>
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
      </View>

      <View
        style={[
          styles.appearanceSection,
          {
            borderTopColor: colors.surfaceVariant,
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

        drawerActiveBackgroundColor:
          colors.surfaceVariant,

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
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  navigation: {
    flex: 1,
    paddingTop: 24,
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
    paddingBottom: 20,
    borderTopWidth: 1,
  },
});