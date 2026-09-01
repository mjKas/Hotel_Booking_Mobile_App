import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  Button,
  Chip,
  Divider,
  HelperText,
  Searchbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import { toErrorMessage } from '@/src/api/apiError';
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
import { formatDate, formatMoney } from '@/src/lib/format';
import {
  BOOKING_STATUS_LABELS,
  type Booking,
  type BookingStatus,
} from '@/src/types/domain';

const STATUS_FILTERS: (BookingStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

const EDITABLE_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

export default function ManageBookings() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  // 'ALL' switches the server-side status filter off; without it the API only
  // returns the active statuses.
  const [statusFilter, setStatusFilter] =
    useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const {
    data: bookings,
    isPending,
    isError,
    error,
    refetch,
  } = useBookings({
    status: statusFilter,
    search: search.trim() || undefined,
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

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEdit = (booking: Booking) => {
    setEditingBooking(booking);

    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuests(String(booking.guests));
    setSpecialRequests(booking.specialRequests ?? '');
    setStatus(booking.status);
    setFormError(null);
  };

  // ==========================================
  // CLOSE EDIT
  // ==========================================

  const closeEdit = () => {
    setEditingBooking(null);

    setCheckIn('');
    setCheckOut('');
    setGuests('');
    setSpecialRequests('');
    setStatus('CONFIRMED');
    setFormError(null);
  };

  // ==========================================
  // SAVE BOOKING
  // ==========================================

  const saveBooking = async () => {
    if (!editingBooking) return;

    setFormError(null);

    const guestCount = Number(guests);

    if (
      !checkIn.trim() ||
      !checkOut.trim() ||
      !Number.isFinite(guestCount) ||
      guestCount < 1
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete the dates and guest count.',
      );

      return;
    }

    try {
      await updateBooking.mutateAsync({
        bookingId: editingBooking.id,
        payload: {
          checkIn: checkIn.trim(),
          checkOut: checkOut.trim(),
          guests: guestCount,
          status,
          specialRequests: specialRequests.trim() || undefined,
        },
      });

      closeEdit();
    } catch (err) {
      // Moving dates can collide with another booking (409), and a cancelled
      // or checked-out stay cannot be edited at all.
      setFormError(
        toErrorMessage(err, 'We could not update this booking.'),
      );
    }
  };

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const confirmCancel = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Cancel ${booking.reference} for ${booking.guestName}? ` +
        'The room goes back on sale immediately.',
      [
        {
          text: 'Keep it',
          style: 'cancel',
        },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => {
            cancelBooking.mutate(booking.id, {
              onError: (err) =>
                Alert.alert(
                  'Could not cancel',
                  toErrorMessage(
                    err,
                    'We could not cancel this booking.',
                  ),
                ),
            });
          },
        },
      ],
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (
    bookingStatus: BookingStatus,
  ) => {
    switch (bookingStatus) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return styles.confirmedStatus;

      case 'PENDING':
        return styles.pendingStatus;

      case 'CANCELLED':
        return styles.cancelledStatus;

      default:
        return styles.pendingStatus;
    }
  };

  if (isPending) {
    return <LoadingState label="Loading bookings…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load the bookings."
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* =====================================
              HEADER + BRANDING
              ===================================== */}

          <View style={styles.header}>

           

            {/* BRANDING */}

            <View style={styles.branding}>

              <Image
                source={require('../../assets/images/royal-crest-logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.brandingText}>

                <Text style={styles.hotelName}>
                  Royal Crest Hotel
                </Text>

                <Text style={styles.pageTitle}>
                  Manage Bookings
                </Text>

                <Text style={styles.headerSubtitle}>
                  {bookings.length}{' '}
                  {bookings.length === 1
                    ? 'booking'
                    : 'bookings'}
                </Text>

              </View>

            </View>

            {/* ADD */}

            <Button
              mode="text"
              icon="refresh"
              compact
              textColor="#000000"
              onPress={() => void refetch()}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
            >
              Refresh
            </Button>

          </View>

          {/* =====================================
              FILTERS
              ===================================== */}

          <Searchbar
            placeholder="Search guest, email or reference"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
                  statusFilter === option && {
                    backgroundColor: colors.secondary,
                  },
                ]}
              >
                {option === 'ALL'
                  ? 'All'
                  : BOOKING_STATUS_LABELS[option]}
              </Chip>
            ))}
          </ScrollView>

          {/* =====================================
              BOOKING RECORDS
              ===================================== */}

          {bookings.length === 0 && (
            <EmptyState
              title="No bookings match"
              description="Try a different status or clear the search."
            />
          )}

          {bookings.map((booking) => (
            <Surface
              key={booking.id}
              elevation={2}
              style={styles.bookingCard}
            >

              {/* BOOKING HEADER */}

              <View style={styles.bookingTop}>

                <View>
                  <Text style={styles.bookingId}>
                    {booking.reference}
                  </Text>

                  <Text style={styles.bookingLabel}>
                    BOOKING
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(
                      booking.status,
                    ),
                  ]}
                >
                  <Text style={styles.statusText}>
                    {BOOKING_STATUS_LABELS[
                      booking.status
                    ].toUpperCase()}
                  </Text>
                </View>

              </View>

              {/* GUEST */}

              <Text style={styles.guestName}>
                {booking.guestName}
              </Text>

              <Text style={styles.email}>
                {booking.guestEmail}
              </Text>

              <Divider style={styles.divider} />

              {/* ROOM / GUESTS */}

              <View style={styles.detailsRow}>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    ROOM
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.room.roomNumber}
                  </Text>

                </View>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    GUESTS
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.guests}
                  </Text>

                </View>

              </View>

              {/* CHECK-IN / CHECK-OUT */}

              <View style={styles.detailsRow}>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    CHECK-IN
                  </Text>

                  <Text style={styles.detailValue}>
                    {formatDate(booking.checkIn)}
                  </Text>

                </View>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    CHECK-OUT
                  </Text>

                  <Text style={styles.detailValue}>
                    {formatDate(booking.checkOut)}
                  </Text>

                </View>

              </View>

              {/* TOTAL */}

              <View style={styles.totalRow}>

                <Text style={styles.totalLabel}>
                  TOTAL
                </Text>

                <Text style={styles.totalValue}>
                  {formatMoney(
                    booking.totalPrice,
                    booking.currency,
                  )}
                </Text>

              </View>

              {/* ACTIONS */}

              <View style={styles.actionRow}>

                <Button
                  mode="outlined"
                  onPress={() =>
                    openEdit(booking)
                  }
                  style={[
                    styles.actionButton,
                    styles.editButton,
                  ]}
                  textColor={colors.secondary}
                  contentStyle={
                    styles.buttonContent
                  }
                >
                  Edit
                </Button>

                <Button
                  mode="outlined"
                  disabled={
                    booking.status === 'CANCELLED' ||
                    booking.status === 'CHECKED_OUT'
                  }
                  onPress={() =>
                    confirmCancel(booking)
                  }
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                  textColor={colors.error}
                  contentStyle={
                    styles.buttonContent
                  }
                >
                  Cancel
                </Button>

              </View>

            </Surface>
          ))}

          {/* =====================================
              EDIT BOOKING
              ===================================== */}

          {editingBooking && (
            <Surface
              elevation={3}
              style={styles.editCard}
            >

              <Text style={styles.editTitle}>
                Edit Booking
              </Text>

              <Text style={styles.editSubtitle}>
                Update booking information
              </Text>

              <Text style={styles.editReadOnly}>
                {editingBooking.reference} · {editingBooking.guestName} ·
                Room {editingBooking.room.roomNumber}
              </Text>

              <TextInput
                mode="outlined"
                label="Check-in"
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
                style={styles.input}
                textColor={colors.textPrimary}
                outlineColor={
                  colors.textSecondary
                }
                activeOutlineColor={
                  colors.secondary
                }
              />

              <TextInput
                mode="outlined"
                label="Check-out"
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
                style={styles.input}
                textColor={colors.textPrimary}
                outlineColor={
                  colors.textSecondary
                }
                activeOutlineColor={
                  colors.secondary
                }
              />

              <TextInput
                mode="outlined"
                label="Number of Guests"
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
                style={styles.input}
                textColor={colors.textPrimary}
                outlineColor={
                  colors.textSecondary
                }
                activeOutlineColor={
                  colors.secondary
                }
              />

              <TextInput
                mode="outlined"
                label="Special Requests"
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
                maxLength={500}
                style={styles.input}
                textColor={colors.textPrimary}
                outlineColor={
                  colors.textSecondary
                }
                activeOutlineColor={
                  colors.secondary
                }
              />

              <Text style={styles.statusHeading}>
                Booking Status
              </Text>

              <View style={styles.statusButtons}>

                {EDITABLE_STATUSES.map((item) => (
                  <Button
                    key={item}
                    mode={
                      status === item
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() =>
                      setStatus(item)
                    }
                    style={styles.statusButton}
                    buttonColor={
                      status === item
                        ? colors.secondary
                        : undefined
                    }
                    textColor={
                      status === item
                        ? colors.textPrimary
                        : colors.textSecondary
                    }
                  >
                    {BOOKING_STATUS_LABELS[item]}
                  </Button>
                ))}

              </View>

              {formError && (
                <HelperText type="error" visible>
                  {formError}
                </HelperText>
              )}

              {/* EDIT ACTIONS */}

              <View style={styles.editActions}>

                <Button
                  mode="outlined"
                  onPress={closeEdit}
                  style={styles.cancelButton}
                  textColor={
                    colors.textSecondary
                  }
                >
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  onPress={saveBooking}
                  loading={updateBooking.isPending}
                  disabled={updateBooking.isPending}
                  style={styles.saveButton}
                  buttonColor={
                    colors.secondary
                  }
                  textColor={
                    colors.textPrimary
                  }
                >
                  Save Changes
                </Button>

              </View>

            </Surface>
          )}

          {/* =====================================
              FOOTER
              ===================================== */}

          <Text style={styles.footer}>
            Manage guest reservations and
            booking details.
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// STYLES
// ==========================================

const createStyles = (
  colors: ReturnType<
    typeof useAppThemeColors
  >,
) =>
  StyleSheet.create({

    // ----------------------------------------
    // MAIN
    // ----------------------------------------

    keyboardContainer: {
      flex: 1,
    },

    searchBar: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.surface,
    },

    filterRow: {
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    filterChip: {
      backgroundColor: colors.surfaceVariant,
    },

    editReadOnly: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 14,
    },

    scrollContent: {
      flexGrow: 1,
    },

    container: {
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
      paddingBottom: 30,
    },

    // ----------------------------------------
    // HEADER + BRANDING
    // ----------------------------------------

    header: {
      minHeight: 145,

      paddingTop: 42,
      paddingBottom: 20,
      paddingHorizontal: 20,

      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: colors.secondary,
    },

    branding: {
      flex: 1,

      flexDirection: 'row',
      alignItems: 'center',

      marginLeft: 6,
    },

    logo: {
      width: 70,
      height: 70,

      borderRadius: 35,

      backgroundColor: '#FFFFFF',
    },

    brandingText: {
      flex: 1,
      marginLeft: 14,
    },

     pageTitle: {
      color: colors.headerText,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },

    hotelName: {
      fontSize: 23,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    headerTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#FFFFFF',

      marginTop: 1,
    },

    headerSubtitle: {
      fontSize: 16,
      color: '#FFFFFF',

      marginTop: 1,
    },

    addButton: {
      marginLeft: 6,
    },

    addButtonLabel: {
      fontSize: 16,
      color: '#000000',
    },

    // ----------------------------------------
    // BOOKING CARD
    // ----------------------------------------

    bookingCard: {
      marginHorizontal: 34,
      marginTop: 18,

      borderRadius: 18,

      padding: 22,

      backgroundColor: colors.surface,
    },

    bookingTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    bookingId: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    bookingLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,

      marginTop: -1,
    },

    // ----------------------------------------
    // STATUS
    // ----------------------------------------

    statusBadge: {
      borderRadius: 30,

      paddingHorizontal: 16,
      paddingVertical: 9,
    },

    confirmedStatus: {
      backgroundColor: '#164D2A',
    },

    pendingStatus: {
      backgroundColor: '#73520A',
    },

    cancelledStatus: {
      backgroundColor: '#642727',
    },

    statusText: {
      color: '#FFFFFF',

      fontSize: 10,
      fontWeight: '800',

      letterSpacing: 0.4,
    },

    // ----------------------------------------
    // GUEST
    // ----------------------------------------

    guestName: {
      fontSize: 20,
      fontWeight: '700',

      marginTop: 20,

      color: colors.textPrimary,
    },

    email: {
      fontSize: 14,

      marginTop: 4,

      color: colors.textSecondary,
    },

    divider: {
      marginVertical: 15,

      opacity: 0.35,

      backgroundColor:
        colors.textSecondary,
    },

    // ----------------------------------------
    // DETAILS
    // ----------------------------------------

    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',

      marginBottom: 14,
    },

    detail: {
      width: '48%',
    },

    detailLabel: {
      fontSize: 10,
      fontWeight: '700',

      marginBottom: 3,

      color: colors.textSecondary,
    },

    detailValue: {
      fontSize: 15,
      fontWeight: '600',

      color: colors.textPrimary,
    },

    // ----------------------------------------
    // TOTAL
    // ----------------------------------------

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginTop: 2,
      marginBottom: 18,
    },

    totalLabel: {
      fontSize: 12,
      fontWeight: '700',

      color: colors.textSecondary,
    },

    totalValue: {
      fontSize: 19,
      fontWeight: '800',

      color: colors.textPrimary,
    },

    // ----------------------------------------
    // ACTION BUTTONS
    // ----------------------------------------

    actionRow: {
      flexDirection: 'row',
      gap: 10,
    },

    actionButton: {
      flex: 1,
      borderRadius: 8,
    },

    editButton: {
      borderColor: colors.secondary,
      borderWidth: 1.5,
    },

    deleteButton: {
      borderColor: colors.error,
      borderWidth: 1.5,
    },

    buttonContent: {
      height: 44,
    },

    // ----------------------------------------
    // EDIT CARD
    // ----------------------------------------

    editCard: {
      marginHorizontal: 34,
      marginTop: 20,

      borderRadius: 18,

      padding: 22,

      backgroundColor: colors.surface,
    },

    editTitle: {
      fontSize: 24,
      fontWeight: '800',

      color: colors.textPrimary,
    },

    editSubtitle: {
      fontSize: 14,

      marginTop: 3,
      marginBottom: 18,

      color: colors.textSecondary,
    },

    input: {
      marginBottom: 12,

      backgroundColor: colors.surface,
    },

    // ----------------------------------------
    // STATUS EDIT
    // ----------------------------------------

    statusHeading: {
      fontSize: 15,
      fontWeight: '700',

      marginTop: 6,
      marginBottom: 9,

      color: colors.textPrimary,
    },

    statusButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    statusButton: {
      borderRadius: 8,
    },

    // ----------------------------------------
    // EDIT ACTIONS
    // ----------------------------------------

    editActions: {
      flexDirection: 'row',
      gap: 10,

      marginTop: 20,
    },

    cancelButton: {
      flex: 1,
      borderRadius: 8,
    },

    saveButton: {
      flex: 1,
      borderRadius: 8,
    },

    // ----------------------------------------
    // FOOTER
    // ----------------------------------------

    footer: {
      textAlign: 'center',

      fontSize: 13,

      marginHorizontal: 30,
      marginTop: 20,

      color: colors.textSecondary,
    },
  });