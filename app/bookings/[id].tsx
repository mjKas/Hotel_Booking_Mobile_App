import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  Portal,
  Text,
} from 'react-native-paper';

import { toErrorMessage } from '@/src/api/apiError';
import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useBooking, useCancelBooking } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatMoney } from '@/src/lib/format';
import { BOOKING_STATUS_LABELS } from '@/src/types/domain';

export default function BookingDetailsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);

  const { data: booking, isPending, isError, error, refetch } = useBooking(
    Number.isFinite(bookingId) ? bookingId : null,
  );

  const cancelBooking = useCancelBooking();

  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleCancel() {
    setCancelError(null);

    try {
      await cancelBooking.mutateAsync(bookingId);
      setIsConfirmingCancel(false);
    } catch (err) {
      setCancelError(
        toErrorMessage(err, 'We could not cancel this booking.'),
      );
    }
  }

  if (isPending) {
    return <LoadingState label="Loading this booking…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load this booking."
      />
    );
  }

  // Cancelling a stay that has already been checked out or cancelled is a 409
  // server-side, so do not offer it.
  const canCancel =
    booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT';

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

      {/* Page Title */}
      <Text style={styles.title}>
        Booking Details
      </Text>

      {/* Booking Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.bookingId}>
                {booking.reference}
              </Text>

              <Text style={styles.room}>
                {booking.room.roomType.name}
              </Text>

              <Text style={styles.roomNumber}>
                Room {booking.room.roomNumber}
              </Text>
            </View>

            <View style={styles.status}>
              <Text style={styles.statusText}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stay Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Stay Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check-in
            </Text>

            <Text style={styles.value}>
              {formatDate(booking.checkIn)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check-out
            </Text>

            <Text style={styles.value}>
              {formatDate(booking.checkOut)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Guests
            </Text>

            <Text style={styles.value}>
              {booking.guests}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Guest Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Guest
          </Text>

          <Text style={styles.guestName}>
            {booking.guestName}
          </Text>

          <Text style={styles.email}>
            {booking.guestEmail}
          </Text>
        </Card.Content>
      </Card>

      {/* Price Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Price Summary
          </Text>

          <View style={styles.row}>
            <Text style={styles.value}>
              Room · {booking.nights}{' '}
              {booking.nights === 1 ? 'night' : 'nights'}
            </Text>

            <Text style={styles.value}>
              {formatMoney(booking.subtotal, booking.currency)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.value}>
              Taxes
            </Text>

            <Text style={styles.value}>
              {formatMoney(booking.taxes, booking.currency)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              {formatMoney(booking.totalPrice, booking.currency)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Cancel Booking */}
      {canCancel ? (
        <Button
          mode="outlined"
          textColor={colors.error}
          style={styles.cancelButton}
          onPress={() => {
            setCancelError(null);
            setIsConfirmingCancel(true);
          }}
        >
          Cancel Booking
        </Button>
      ) : null}

      {/* Back */}
      <Button
        mode="text"
        icon="arrow-left"
        onPress={() => router.back()}
      >
        Back
      </Button>

      <Portal>
        <Dialog
          visible={isConfirmingCancel}
          onDismiss={() => setIsConfirmingCancel(false)}
          dismissable={!cancelBooking.isPending}
        >
          <Dialog.Title>Cancel {booking.reference}?</Dialog.Title>

          <Dialog.Content>
            <Text style={{ color: colors.textSecondary }}>
              The room goes back on sale straight away. This cannot be undone —
              you would need to book again.
            </Text>

            {cancelError ? (
              <Text
                style={{ color: colors.error, marginTop: 12 }}
              >
                {cancelError}
              </Text>
            ) : null}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => setIsConfirmingCancel(false)}
              disabled={cancelBooking.isPending}
            >
              Keep it
            </Button>

            <Button
              onPress={handleCancel}
              loading={cancelBooking.isPending}
              disabled={cancelBooking.isPending}
              textColor={colors.error}
            >
              Cancel booking
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

    /* Hotel Branding */
    branding: {
      backgroundColor: colors.surface,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 18,
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

    /* Page Title */
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 18,
    },

    /* Cards */
    card: {
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    bookingId: {
      color: colors.textSecondary,
      fontSize: 13,
    },

    room: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 5,
    },

    roomNumber: {
      color: colors.textSecondary,
      marginTop: 3,
    },

    status: {
      backgroundColor: colors.successSurface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      height: 32,
    },

    statusText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: '800',
    },

    heading: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 15,
    },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 7,
    },

    label: {
      color: colors.textSecondary,
    },

    value: {
      color: colors.textPrimary,
    },

    guestName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    email: {
      color: colors.textSecondary,
      marginTop: 4,
    },

    divider: {
      marginVertical: 12,
    },

    totalLabel: {
      fontWeight: '800',
      color: colors.textPrimary,
    },

    total: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    cancelButton: {
      marginHorizontal: 20,
      borderColor: colors.error,
      borderRadius: 10,
      marginTop: 5,
    },
  });