import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function BookingConfirmationScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>

      {/* Hotel Branding */}
      <View style={styles.branding}>
        <Image
          source={require('../../assets/images/royal-crest-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.hotelName}>
          Royal Crest Hotel
        </Text>
      </View>

      {/* Confirmation Icon */}
      <View style={styles.icon}>
        <Text style={styles.check}>✓</Text>
      </View>

      {/* Confirmation Message */}
      <Text style={styles.title}>
        Booking Confirmed!
      </Text>

      <Text style={styles.subtitle}>
        Your reservation has been successfully confirmed.
      </Text>

      {/* Booking Summary */}
      <View style={styles.bookingCard}>
        <Text style={styles.bookingId}>
          BOOKING NUMBER
        </Text>

        <Text style={styles.bookingNumber}>
          BK-1024
        </Text>

        <View style={styles.divider} />

        <Text style={styles.room}>
          Deluxe Room
        </Text>

        <Text style={styles.details}>
          08 Aug – 10 Aug 2026
        </Text>

        <Text style={styles.details}>
          2 Guests
        </Text>

        <View style={styles.divider} />

        <Text style={styles.totalLabel}>
          Total
        </Text>

        <Text style={styles.total}>
          $264
        </Text>
      </View>

      {/* View Booking */}
      <Button
        mode="contained"
        onPress={() =>
          router.push('/bookings/1024')
        }
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        View Booking
      </Button>

      {/* Back Home */}
      <Button
        mode="text"
        textColor={colors.primary}
        onPress={() =>
          router.replace('/customer/tabs')
        }
      >
        Back to Home
      </Button>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 35,
    },

    /* Hotel Branding */
    branding: {
      alignItems: 'center',
      marginBottom: 25,
    },

    logo: {
      width: 65,
      height: 65,
      borderRadius: 10,
      marginBottom: 8,
    },

    hotelName: {
      color: colors.textPrimary,
      fontSize: 21,
      fontWeight: '800',
      textAlign: 'center',
    },

    /* Confirmation Icon */
    icon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.successSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },

    check: {
      color: colors.success,
      fontSize: 42,
      fontWeight: '700',
    },

    /* Confirmation Message */
    title: {
      fontSize: 27,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 20,
      textAlign: 'center',
    },

    subtitle: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 21,
    },

    /* Booking Card */
    bookingCard: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 28,
    },

    bookingId: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },

    bookingNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 4,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },

    room: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    details: {
      color: colors.textSecondary,
      marginTop: 5,
    },

    totalLabel: {
      color: colors.textSecondary,
    },

    total: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 3,
    },

    /* Buttons */
    button: {
      width: '100%',
      marginTop: 25,
      borderRadius: 10,
    },

    buttonContent: {
      height: 50,
    },
  });