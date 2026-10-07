// expo-router bundles its own React Navigation; its helpers must match it.
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { Drawer } from 'expo-router/drawer';

import {
  AppDrawerContent,
  BackAndMenuButtons,
  useDrawerScreenOptions,
  type DrawerLink,
} from '@/src/components/app-drawer';
import { BiometricEnrolmentPrompt } from '@/src/components/biometric-enrolment-prompt';
import { RequireAuth } from '@/src/components/route-guards';

const TAB_TITLES: Record<string, string> = {
  index: 'Find a Stay',
  booking: 'My Bookings',
  profile: 'Profile',
};

/**
 * The tabs are a nested navigator, so the drawer links to their routes
 * directly rather than listing its own screens.
 */
const CUSTOMER_LINKS: DrawerLink[] = [
  {
    label: 'Profile',
    icon: 'account-outline',
    href: '/customer/tabs/profile',
    match: ['/customer/tabs/profile'],
  },
  {
    label: 'My Bookings',
    icon: 'calendar-check-outline',
    href: '/customer/tabs/booking',
    match: ['/customer/tabs/booking', '/customer/booking'],
  },
  {
    label: 'View Rooms',
    icon: 'bed-outline',
    href: '/customer/rooms',
    match: ['/customer/rooms', '/customer/room'],
  },
  {
    label: 'Find a Stay',
    icon: 'calendar-search',
    href: '/customer/tabs',
    match: ['/customer/tabs', '/customer'],
    exact: true,
  },
  {
    label: 'Security',
    icon: 'shield-account-outline',
    href: '/customer/security',
    match: ['/customer/security'],
  },
];

export default function CustomerLayout() {
  const screenOptions = useDrawerScreenOptions('/customer/security');

  return (
    <RequireAuth>
      {/* Offered straight after sign-up and after a password sign-in. */}
      <BiometricEnrolmentPrompt />

      <Drawer
        drawerContent={(props) => (
          <AppDrawerContent
            {...props}
            sectionTitle="MY STAY"
            links={CUSTOMER_LINKS}
          />
        )}
        screenOptions={screenOptions}
        // Back from a detail page returns to the page that opened it, not to
        // the first drawer screen.
        backBehavior="history"
      >
        <Drawer.Screen
          name="tabs"
          options={({ route }) => ({
            title:
              TAB_TITLES[getFocusedRouteNameFromRoute(route) ?? 'index'] ??
              'Royal Crest Hotel',
          })}
        />

        <Drawer.Screen name="rooms" options={{ title: 'View Rooms' }} />

        <Drawer.Screen name="security" options={{ title: 'Security' }} />

        {/* Pages opened from other pages. They are not menu entries, but they
            live in the drawer so the menu stays reachable, and they get a
            back arrow next to it. */}
        <Drawer.Screen
          name="room/[id]"
          options={{
            title: 'Room Details',
            headerLeft: () => <BackAndMenuButtons fallback="/customer/rooms" />,
          }}
        />

        <Drawer.Screen
          name="booking/create"
          options={{
            title: 'Book Room',
            headerLeft: () => <BackAndMenuButtons fallback="/customer/rooms" />,
          }}
        />

        <Drawer.Screen
          name="booking/[id]"
          options={{
            title: 'Booking Details',
            headerLeft: () => (
              <BackAndMenuButtons fallback="/customer/tabs/booking" />
            ),
          }}
        />

        <Drawer.Screen
          name="booking/confirmation"
          options={{
            title: 'Booking Confirmed',
            // Going back here would land on the already-submitted form.
            headerLeft: () => (
              <BackAndMenuButtons
                fallback="/customer/tabs/booking"
                showBack={false}
              />
            ),
          }}
        />
      </Drawer>
    </RequireAuth>
  );
}
