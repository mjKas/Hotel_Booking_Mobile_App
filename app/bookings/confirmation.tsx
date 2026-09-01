import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useBooking } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatMoney } from '@/src/lib/format';

export default function BookingConfirmationScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const id = Number(bookingId);

  const { data: booking, isPending, isError, error, refetch } = useBooking(
    Number.isFinite(id) && id > 0 ? id : null,
  );

  if (isPending) {
    return <LoadingState label="Confirming your booking…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load your confirmation."
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          {booking.reference}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.room}>
          {booking.room.roomType.name}
        </Text>

        <Text style={styles.details}>
          {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
        </Text>

        <Text style={styles.details}>
          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'} · Room{' '}
          {booking.room.roomNumber}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.totalLabel}>
          Total
        </Text>

        <Text style={styles.total}>
          {formatMoney(booking.totalPrice, booking.currency)}
        </Text>
      </View>

      {/* View Booking */}
      <Button
        mode="contained"
        onPress={() =>
          router.replace(`/bookings/${booking.id}`)
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
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 35,
      paddingBottom: 40,
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