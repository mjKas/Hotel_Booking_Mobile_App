import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
} from 'react-native-paper';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';

export default function CustomerProfileScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* =====================================
          HEADER
          ===================================== */}

      

      {/* =====================================
          BRANDING
          ===================================== */}

      <View style={styles.branding}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>
            RC
          </Text>
        </View>

        <View>
          <Text style={styles.brandName}>
            Royal Crest
          </Text>

          <Text style={styles.brandSubtitle}>
            HOTEL & RESORT
          </Text>
        </View>
      </View>

      {/* =====================================
          PROFILE
          ===================================== */}

      <View style={styles.profileSection}>
        <Avatar.Text
          size={78}
          label="JD"
          color={colors.headerText}
          style={styles.avatar}
        />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            John Doe
          </Text>

          <Text style={styles.email}>
            john@example.com
          </Text>
        </View>
      </View>

      {/* =====================================
          PERSONAL INFORMATION
          ===================================== */}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <List.Item
            title="Full Name"
            description="John Doe"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="account-outline"
                color={colors.secondary}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Email"
            description="john@example.com"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="email-outline"
                color={colors.secondary}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Phone"
            description="+94 77 123 4567"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="phone-outline"
                color={colors.secondary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* =====================================
          BOOKINGS & SETTINGS
          ===================================== */}

      <Card style={styles.card}>
        <List.Item
          title="My Bookings"
          description="View your reservations"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          left={(props) => (
            <List.Icon
              {...props}
              icon="calendar-check-outline"
              color={colors.secondary}
            />
          )}
          right={(props) => (
            <List.Icon
              {...props}
              icon="chevron-right"
              color={colors.textSecondary}
            />
          )}
          onPress={() =>
            router.push('/bookings/1024')
          }
        />

        <Divider />

        <Card.Content style={styles.settingsContent}>
          <Text style={styles.settingsTitle}>
            Appearance
          </Text>

          <ThemeModeSelector />
        </Card.Content>
      </Card>

      {/* =====================================
          LOGOUT
          ===================================== */}

      <Button
        mode="outlined"
        icon="logout"
        textColor={colors.error}
        style={styles.logout}
        contentStyle={styles.logoutContent}
        onPress={() => {
          router.replace('/auth/login');
        }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    // ========================================
    // MAIN
    // ========================================

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingBottom: 40,
    },

    // ========================================
    // HEADER
    // Same style level as ManageRooms
    // ========================================

    header: {
      backgroundColor: colors.primary,

      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    headerTitle: {
      color: colors.headerText,
      fontSize: 25,
      fontWeight: '800',
    },

    headerSubtitle: {
      color: colors.headerSubtle,
      marginTop: 3,
      fontSize: 16,
    },

    // ========================================
    // BRANDING
    // ========================================

    branding: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 20,
      paddingVertical: 18,

      backgroundColor: colors.surface,
    },

    logo: {
      width: 48,
      height: 48,
      borderRadius: 12,

      backgroundColor: colors.secondary,

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 12,
    },

    logoText: {
      color: '#000000',
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 1,
    },

    brandName: {
      color: colors.textPrimary,
      fontSize: 21,
      fontWeight: '800',
    },

    brandSubtitle: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginTop: 2,
    },

    // ========================================
    // PROFILE
    // ========================================

    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',

      marginHorizontal: 16,
      marginTop: 16,

      padding: 18,

      borderRadius: 14,

      backgroundColor: colors.surface,
    },

    avatar: {
      backgroundColor: colors.secondary,
    },

    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },

    name: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
    },

    email: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },

    // ========================================
    // CARDS
    // ========================================

    card: {
      marginHorizontal: 16,
      marginTop: 16,

      borderRadius: 14,

      backgroundColor: colors.surface,

      overflow: 'hidden',
    },

    // ========================================
    // SECTION
    // ========================================

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },

    // ========================================
    // LIST
    // ========================================

    listTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },

    listDescription: {
      color: colors.textSecondary,
      fontSize: 14,
    },

    // ========================================
    // SETTINGS
    // ========================================

    settingsContent: {
      paddingVertical: 14,
    },

    settingsTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 10,
    },

    // ========================================
    // LOGOUT
    // ========================================

    logout: {
      marginHorizontal: 16,
      marginTop: 25,

      borderColor: colors.error,
      borderRadius: 10,
    },

    logoutContent: {
      height: 48,
    },
  });