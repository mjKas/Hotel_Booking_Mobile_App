import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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

export default function CustomerProfileScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hotel Branding */}
      <View style={styles.branding}>
        <Image
          source={require('../../../assets/images/royal-crest-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.hotelName}>
          Royal Crest Hotel
        </Text>
      </View>

      {/* Profile Header */}
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

      {/* Personal Information */}
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

      {/* Account Options */}
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
      </Card>

      {/* Logout */}
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

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingBottom: 40,
    },

    branding: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingTop: 30,
      paddingBottom: 18,
    },

    logo: {
      width: 70,
      height: 70,
      borderRadius: 10,
      marginBottom: 8,
    },

    hotelName: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },

    profileHeader: {
      backgroundColor: colors.primary,
      alignItems: 'center',
      paddingTop: 30,
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

    listTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
    },

    listDescription: {
      color: colors.textSecondary,
    },

    logout: {
      marginHorizontal: 16,
      marginTop: 25,
      borderColor: colors.error,
      borderRadius: 10,
    },
  });