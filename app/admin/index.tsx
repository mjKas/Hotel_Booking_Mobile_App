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
    >
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={82}
          label="JD"
          color={colors.headerText}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          John Doe
        </Text>

        <Text style={styles.email}>
          john@example.com
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <List.Item
            title="Full Name"
            description="John Doe"
            left={(props) => (
              <List.Icon {...props} icon="account-outline" />
            )}
          />

          <Divider />

          <List.Item
            title="Email"
            description="john@example.com"
            left={(props) => (
              <List.Icon {...props} icon="email-outline" />
            )}
          />

          <Divider />

          <List.Item
            title="Phone"
            description="+94 77 123 4567"
            left={(props) => (
              <List.Icon {...props} icon="phone-outline" />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Item
          title="My Bookings"
          description="View your reservations"
          left={(props) => (
            <List.Icon {...props} icon="calendar-check-outline" />
          )}
          right={(props) => (
            <List.Icon {...props} icon="chevron-right" />
          )}
          onPress={() =>
            router.push('/bookings/1024')
          }
        />

        <Divider />

        <Card.Content style={styles.settingsContent}>
          <ThemeModeSelector />
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        icon="logout"
        textColor={colors.error}
        style={styles.logout}
        onPress={() => {
          router.replace('/auth/login');
        }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingBottom: 40,
  },

  profileHeader: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },

  avatar: {
    backgroundColor: colors.secondary,
  },

  name: {
    color: colors.headerText,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 12,
  },

  email: {
    color: colors.headerSubtle,
    marginTop: 4,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  settingsContent: {
    paddingVertical: 14,
  },

  logout: {
    marginHorizontal: 16,
    marginTop: 25,
    borderColor: colors.error,
    borderRadius: 10,
  },
});
