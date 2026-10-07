import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerToggleButton,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { router, usePathname, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { useAuthStore } from '@/src/store/authStore';
import { ROLE_LABELS } from '@/src/types/domain';

export type DrawerLink = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  href: Href;
  /** Paths that count as "this item is open"; sub-paths match too. */
  match: string[];
  /** Only the exact path counts, e.g. the tab navigator's index. */
  exact?: boolean;
};

type AppDrawerContentProps = DrawerContentComponentProps & {
  sectionTitle: string;
  /**
   * Explicit links, for drawers whose screens are nested navigators (the
   * customer tabs). Without them the drawer's own screens are listed.
   */
  links?: DrawerLink[];
};

/**
 * One drawer for both areas of the app: who is signed in, the section's
 * links, the light/dark switch, and a Sign Out that is always in the same
 * easy-to-find place.
 */
export function AppDrawerContent({
  sectionTitle,
  links,
  ...props
}: AppDrawerContentProps) {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      props.navigation.closeDrawer();
      // Revokes the refresh token server-side, then clears the session and
      // every cached query on this device.
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      if (__DEV__) console.warn('Sign out failed', error);
      Alert.alert('Could not sign out', 'Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <View style={styles.account}>
            <Text style={styles.accountName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <Text style={styles.accountMeta} numberOfLines={1}>
              {user.email} · {ROLE_LABELS[user.role]}
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{sectionTitle}</Text>

        {links ? (
          links.map((link) => {
            const focused = link.match.some((path) =>
              link.exact
                ? pathname === path
                : pathname === path || pathname.startsWith(`${path}/`),
            );

            return (
              <DrawerItem
                key={link.label}
                label={link.label}
                focused={focused}
                icon={({ color, size }) => (
                  <MaterialCommunityIcons
                    name={link.icon}
                    color={color}
                    size={size}
                  />
                )}
                onPress={() => {
                  props.navigation.closeDrawer();
                  router.navigate(link.href);
                }}
                activeTintColor={colors.secondary}
                inactiveTintColor={colors.textPrimary}
                activeBackgroundColor={colors.background}
                labelStyle={styles.itemLabel}
                style={styles.item}
              />
            );
          })
        ) : (
          <DrawerItemList {...props} />
        )}
      </DrawerContentScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <ThemeModeSelector />

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleSignOut}
          loading={isSigningOut}
          disabled={isSigningOut}
          textColor={colors.error}
          style={styles.signOut}
          contentStyle={styles.signOutContent}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}

/**
 * Header left for pages opened from another page (room details, booking
 * screens): a back arrow, plus the menu button so the drawer and Sign Out are
 * still one tap away. Back falls back to `fallback` when there is no history,
 * e.g. after a cold start straight onto the page.
 */
export function BackAndMenuButtons({
  fallback,
  showBack = true,
}: {
  fallback: Href;
  showBack?: boolean;
}) {
  const colors = useAppThemeColors();

  return (
    <View style={styles.headerLeft}>
      <DrawerToggleButton
        tintColor={colors.navBarText}
        accessibilityLabel="Open menu"
      />

      {showBack ? (
        <IconButton
          icon="arrow-left"
          iconColor={colors.navBarText}
          accessibilityLabel="Go back"
          style={styles.backButton}
          onPress={() =>
            router.canGoBack() ? router.back() : router.navigate(fallback)
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    margin: 0,
  },
});

/**
 * Header options shared by both drawers: the navy bar with the hamburger on
 * the left, the title centred, and a shortcut to Security on the right.
 */
export function useDrawerScreenOptions(securityHref: Href) {
  const colors = useAppThemeColors();

  return {
    headerShown: true,
    headerTitleAlign: 'center' as const,
    headerStyle: { backgroundColor: colors.navBar },
    headerTintColor: colors.navBarText,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
    headerRight: () => (
      <IconButton
        icon="shield-account-outline"
        iconColor={colors.navBarText}
        accessibilityLabel="Security settings"
        onPress={() => router.navigate(securityHref)}
      />
    ),

    drawerStyle: { width: 320, backgroundColor: colors.surface },
    drawerActiveTintColor: colors.secondary,
    drawerInactiveTintColor: colors.textPrimary,
    drawerActiveBackgroundColor: colors.background,
    drawerLabelStyle: { fontSize: 17, fontWeight: '500' as const },
    drawerItemStyle: {
      borderRadius: 12,
      marginHorizontal: 8,
      marginVertical: 3,
    },

    sceneStyle: { backgroundColor: colors.background },
  };
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 16,
    },

    account: {
      marginHorizontal: 20,
      marginBottom: 20,
    },

    accountName: {
      color: colors.textPrimary,
      fontSize: 19,
      fontWeight: '800',
    },

    accountMeta: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },

    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.8,
      marginHorizontal: 20,
      marginBottom: 12,
    },

    item: {
      borderRadius: 12,
      marginHorizontal: 8,
      marginVertical: 3,
    },

    itemLabel: {
      fontSize: 17,
      fontWeight: '500',
    },

    footer: {
      paddingHorizontal: 16,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 16,
    },

    signOut: {
      borderColor: colors.error,
      borderRadius: 10,
    },

    signOutContent: {
      height: 46,
    },
  });
