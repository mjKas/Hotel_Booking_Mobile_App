import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Searchbar, Text, TextInput } from 'react-native-paper';

import { toErrorMessage } from '@/src/api/apiError';
import { BookingCard } from '@/src/components/booking-card';
import { BrandHeader, countLabel } from '@/src/components/brand-header';
import { FormModal, useFormInputProps } from '@/src/components/form-modal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import {
  useBookings,
  useCancelBooking,
  useUpdateBooking,
} from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import {
  BOOKING_STATUS_LABELS,
  type Booking,
  type BookingStatus,
  type UpdateBookingPayload,
} from '@/src/types/domain';

const STATUS_FILTERS: (BookingStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

/**
 * Statuses staff can move a booking to. CANCELLED is left out on purpose:
 * cancelling goes through the Cancel button (DELETE), and the API refuses to
 * reinstate a cancelled booking, so cancelled ones are not editable here.
 */
const EDITABLE_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Waits for typing to pause so the search is not re-run on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default function ManageBookings() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const inputProps = useFormInputProps();

  // 'ALL' switches the server-side status filter off.
  const [statusFilter, setStatusFilter] =
    useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const {
    data: bookings,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useBookings({
    status: statusFilter,
    search: debouncedSearch || undefined,
  });

  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();

  const [editingBooking, setEditingBooking] =
    useState<Booking | null>(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
  const [formError, setFormError] = useState<string | null>(null);

  const openEdit = (booking: Booking) => {
    Keyboard.dismiss();
    setEditingBooking(booking);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuests(String(booking.guests));
    setSpecialRequests(booking.specialRequests ?? '');
    setStatus(booking.status);
    setFormError(null);
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setFormError(null);
  };

  const saveBooking = async () => {
    if (!editingBooking) return;

    setFormError(null);

    const nextCheckIn = checkIn.trim();
    const nextCheckOut = checkOut.trim();
    const guestCount = Number(guests);
    const maxGuests = editingBooking.room.roomType.maxOccupancy;

    if (!ISO_DATE.test(nextCheckIn) || !ISO_DATE.test(nextCheckOut)) {
      setFormError('Enter both dates as YYYY-MM-DD.');
      return;
    }

    if (nextCheckOut <= nextCheckIn) {
      setFormError('Check-out must be after check-in.');
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setFormError('Enter the number of guests.');
      return;
    }

    if (guestCount > maxGuests) {
      setFormError(`This room sleeps a maximum of ${maxGuests} guests.`);
      return;
    }

    // Send only what changed. The API re-checks availability whenever the
    // dates move, so resending unchanged dates would only add failure modes.
    const payload: UpdateBookingPayload = {};

    if (nextCheckIn !== editingBooking.checkIn) payload.checkIn = nextCheckIn;
    if (nextCheckOut !== editingBooking.checkOut) payload.checkOut = nextCheckOut;
    if (guestCount !== editingBooking.guests) payload.guests = guestCount;
    if (status !== editingBooking.status) payload.status = status;

    const requests = specialRequests.trim();
    if (requests !== (editingBooking.specialRequests ?? '')) {
      payload.specialRequests = requests;
    }

    if (Object.keys(payload).length === 0) {
      closeEdit();
      return;
    }

    try {
      const updated = await updateBooking.mutateAsync({
        bookingId: editingBooking.id,
        payload,
      });

      closeEdit();
      Alert.alert('Booking updated', `${updated.reference} has been saved.`);
    } catch (err) {
      // Moving dates can collide with another booking (409).
      setFormError(
        toErrorMessage(err, 'We could not update this booking.'),
      );
    }
  };

  const confirmCancel = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Cancel ${booking.reference} for ${booking.guestName}? ` +
        'The room goes back on sale immediately.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => {
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
            });
          },
        },
      ],
    );
  };

  if (isPending) {
    return <LoadingState label="Loading bookings…" />;
  }

  if (isError && !bookings) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load the bookings."
      />
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader
        title="Manage Bookings"
        subtitle={countLabel(bookings.length, 'booking')}
        action={{
          label: 'Refresh',
          icon: 'refresh',
          onPress: () => void refetch(),
          loading: isFetching,
        }}
      />

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={false}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          <View>
            <Searchbar
              placeholder="Search guest, email or reference"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.searchBar}
              inputStyle={{ color: colors.textPrimary }}
              iconColor={colors.textPrimary}
              placeholderTextColor={colors.textSecondary}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.filterRow}
            >
              {STATUS_FILTERS.map((option) => (
                <Chip
                  key={option}
                  selected={statusFilter === option}
                  showSelectedCheck={false}
                  onPress={() => setStatusFilter(option)}
                  style={[
                    styles.filterChip,
                    statusFilter === option && styles.filterChipActive,
                  ]}
                  textStyle={
                    statusFilter === option
                      ? styles.filterTextActive
                      : styles.filterText
                  }
                >
                  {option === 'ALL' ? 'All' : BOOKING_STATUS_LABELS[option]}
                </Chip>
              ))}
            </ScrollView>

            {isError ? (
              <Text style={styles.inlineError}>
                {toErrorMessage(error, 'We could not refresh the bookings.')}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No bookings match"
            description="Try a different status or clear the search."
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            actions={[
              {
                label: 'Edit',
                tone: 'primary',
                onPress: () => openEdit(item),
                disabled: item.status === 'CANCELLED',
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

      <FormModal
        visible={editingBooking !== null}
        title="Edit Booking"
        subtitle={
          editingBooking
            ? `${editingBooking.reference} · ${editingBooking.guestName} · ` +
              `Room ${editingBooking.room.roomNumber}`
            : undefined
        }
        onClose={closeEdit}
        onSubmit={saveBooking}
        submitLabel="Save Changes"
        submitting={updateBooking.isPending}
        error={formError}
      >
        <TextInput
          {...inputProps}
          label="Check-in (YYYY-MM-DD)"
          value={checkIn}
          onChangeText={setCheckIn}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          returnKeyType="next"
        />

        <TextInput
          {...inputProps}
          label="Check-out (YYYY-MM-DD)"
          value={checkOut}
          onChangeText={setCheckOut}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          returnKeyType="next"
        />

        <TextInput
          {...inputProps}
          label="Number of Guests"
          value={guests}
          onChangeText={setGuests}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        <TextInput
          {...inputProps}
          label="Special Requests"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        <Text style={styles.fieldLabel}>Booking Status</Text>

        <View style={styles.chipRow}>
          {EDITABLE_STATUSES.map((item) => (
            <Chip
              key={item}
              selected={status === item}
              showSelectedCheck={false}
              onPress={() => setStatus(item)}
              style={[
                styles.filterChip,
                status === item && styles.filterChipActive,
              ]}
              textStyle={
                status === item ? styles.filterTextActive : styles.filterText
              }
            >
              {BOOKING_STATUS_LABELS[item]}
            </Chip>
          ))}
        </View>

        <Text style={styles.fieldNote}>
          The total is recalculated by the server when the dates change.
        </Text>
      </FormModal>
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

    searchBar: {
      backgroundColor: colors.surface,
      borderRadius: 30,
    },

    filterRow: {
      gap: 8,
      paddingVertical: 12,
    },

    filterChip: {
      backgroundColor: colors.surface,
      borderRadius: 20,
    },

    filterChipActive: {
      backgroundColor: colors.secondary,
    },

    filterText: {
      color: colors.textPrimary,
    },

    filterTextActive: {
      color: '#000000',
      fontWeight: '700',
    },

    inlineError: {
      color: colors.error,
      marginBottom: 10,
    },

    fieldLabel: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginTop: 4,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },

    fieldNote: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
  });
