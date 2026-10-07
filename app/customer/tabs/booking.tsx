import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { BookingCard } from '@/src/components/booking-card';
import { BrandHeader, countLabel } from '@/src/components/brand-header';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useBookings, useCancelBooking } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import type { Booking } from '@/src/types/domain';

/**
 * The signed-in guest's own bookings. GET /bookings/ is scoped server-side to
 * the caller for anyone who is not an administrator, so no other guest's
 * bookings can reach this screen; the query cache is wiped on sign-out.
 */
export default function CustomerBookingsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const {
    data: bookings,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useBookings();

  const cancelBooking = useCancelBooking();

  const confirmCancel = (booking: Booking) => {
    Alert.alert(
      'Cancel booking',
      `Cancel ${booking.reference} for ${booking.room.roomType.name}?`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () =>
            cancelBooking.mutate(booking.id, {
              onSuccess: (updated) =>
                Alert.alert(
                  'Booking cancelled',
                  `${updated.reference} has been cancelled.`,
                ),
              onError: (err) =>
                Alert.alert(
                  'Could not cancel',
                  toErrorMessage(err, 'We could not cancel this booking.'),
                ),
            }),
        },
      ],
    );
  };

  if (isPending) {
    return <LoadingState label="Loading your bookings…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load your bookings."
      />
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader
        title="My Bookings"
        subtitle={countLabel(bookings.length, 'booking')}
        action={{
          label: 'Refresh',
          icon: 'refresh',
          onPress: () => void refetch(),
          loading: isRefetching,
        }}
      />

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          <EmptyState
            title="No bookings yet"
            description="Find a room and your reservations will appear here."
            actionLabel="View rooms"
            onAction={() => router.navigate('/customer/rooms')}
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            actions={[
              {
                label: 'View',
                tone: 'primary',
                onPress: () => router.push(`/customer/booking/${item.id}`),
              },
              {
                label: 'Cancel',
                tone: 'destructive',
                onPress: () => confirmCancel(item),
                disabled:
                  item.status === 'CANCELLED' ||
                  item.status === 'CHECKED_OUT' ||
                  cancelBooking.isPending,
              },
            ]}
          />
        )}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    list: {
      padding: 16,
      paddingBottom: 40,
    },
  });
