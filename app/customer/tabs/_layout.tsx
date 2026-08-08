import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#082A55',
        tabBarInactiveTintColor: '#8A8A8A',

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-check-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}