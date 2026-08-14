import React, { useState } from 'react';
import {
  Alert,
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
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

import { useThemeColor } from '@/src/hooks/use-theme-color';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';

type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: BookingStatus;
};

const initialBookings: Booking[] = [
  {
    id: 'BK-1001',
    guestName: 'John Smith',
    email: 'john@example.com',
    room: 'Deluxe Room',
    checkIn: '20 Aug 2026',
    checkOut: '23 Aug 2026',
    guests: 2,
    amount: 450,
    status: 'Confirmed',
  },
  {
    id: 'BK-1002',
    guestName: 'Sarah Wilson',
    email: 'sarah@example.com',
    room: 'Executive Suite',
    checkIn: '25 Aug 2026',
    checkOut: '28 Aug 2026',
    guests: 3,
    amount: 720,
    status: 'Pending',
  },
  {
    id: 'BK-1003',
    guestName: 'David Perera',
    email: 'david@example.com',
    room: 'Standard Room',
    checkIn: '29 Aug 2026',
    checkOut: '31 Aug 2026',
    guests: 2,
    amount: 280,
    status: 'Confirmed',
  },
];

export default function ManageBookingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'textPrimary');
  const secondaryTextColor = useThemeColor(
    {},
    'textSecondary',
  );
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const successSurface = useThemeColor(
    {},
    'successSurface',
  );
  const errorSurface = useThemeColor(
    {},
    'errorSurface',
  );
  const warningColor = useThemeColor({}, 'warning');

  const [bookings, setBookings] =
    useState<Booking[]>(initialBookings);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    BookingStatus | 'All'
  >('All');

  const filteredBookings = bookings.filter((booking) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      booking.id.toLowerCase().includes(searchValue) ||
      booking.guestName.toLowerCase().includes(searchValue) ||
      booking.email.toLowerCase().includes(searchValue) ||
      booking.room.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === 'All' ||
      booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColors = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return {
          background: successSurface,
          text: successColor,
        };

      case 'Cancelled':
        return {
          background: errorSurface,
          text: errorColor,
        };

      case 'Pending':
        return {
          background: `${secondaryColor}22`,
          text: warningColor,
        };
    }
  };

  const handleCreateBooking = () => {
    router.push('/admin/create-booking');
  };

  const handleViewBooking = (booking: Booking) => {
    Alert.alert(
      'Booking Details',
      `Booking: ${booking.id}\n\nGuest: ${booking.guestName}\nEmail: ${booking.email}\nRoom: ${booking.room}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nGuests: ${booking.guests}\nAmount: $${booking.amount}`,
    );
  };

  const handleEditBooking = (booking: Booking) => {
    router.push({
      pathname: '/admin/edit-booking',
      params: {
        id: booking.id,
      },
    });
  };

  const handleConfirmBooking = (bookingId: string) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: 'Confirmed',
            }
          : booking,
      ),
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            setBookings((currentBookings) =>
              currentBookings.map((booking) =>
                booking.id === bookingId
                  ? {
                      ...booking,
                      status: 'Cancelled',
                    }
                  : booking,
              ),
            );
          },
        },
      ],
    );
  };

  const handleDeleteBooking = (bookingId: string) => {
    Alert.alert(
      'Delete Booking',
      'This will permanently remove the booking. Continue?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBookings((currentBookings) =>
              currentBookings.filter(
                (booking) => booking.id !== bookingId,
              ),
            );
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View>
              <Text
                style={[
                  styles.title,
                  {
                    color: textColor,
                  },
                ]}
              >
                Manage Bookings
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                View and manage hotel reservations
              </Text>
            </View>

            <ThemeModeSelector />
          </View>

          <Surface
            elevation={2}
            style={[
              styles.searchCard,
              {
                backgroundColor: surfaceColor,
              },
            ]}
          >
            <TextInput
              mode="flat"
              label="Search bookings"
              value={search}
              onChangeText={setSearch}
              style={[
                styles.searchInput,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
              textColor={textColor}
              placeholderTextColor={secondaryTextColor}
              left={
                <TextInput.Icon
                  icon="magnify"
                  color={secondaryTextColor}
                />
              }
              right={
                search ? (
                  <TextInput.Icon
                    icon="close"
                    color={secondaryTextColor}
                    onPress={() => setSearch('')}
                  />
                ) : undefined
              }
            />

            <View style={styles.filterContainer}>
              <Text
                style={[
                  styles.filterLabel,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                Status
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {(
                  [
                    'All',
                    'Pending',
                    'Confirmed',
                    'Completed',
                    'Cancelled',
                  ] as const
                ).map((status) => {
                  const selected =
                    statusFilter === status;

                  return (
                    <Chip
                      key={status}
                      selected={selected}
                      onPress={() =>
                        setStatusFilter(status)
                      }
                      style={[
                        styles.filterChip,
                        selected && {
                          backgroundColor:
                            secondaryColor,
                        },
                      ]}
                      textStyle={{
                        color: selected
                          ? textColor
                          : secondaryTextColor,
                      }}
                    >
                      {status}
                    </Chip>
                  );
                })}
              </ScrollView>
            </View>
          </Surface>

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.resultText,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? 's' : ''}
            </Text>

            <Button
              mode="contained"
              icon="plus"
              onPress={handleCreateBooking}
              buttonColor={secondaryColor}
              textColor={textColor}
              compact
            >
              New Booking
            </Button>
          </View>

          {filteredBookings.length === 0 ? (
            <Surface
              elevation={1}
              style={[
                styles.emptyCard,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: textColor,
                  },
                ]}
              >
                No bookings found
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                Try changing your search or status filter.
              </Text>
            </Surface>
          ) : (
            filteredBookings.map((booking) => {
              const statusColors =
                getStatusColors(booking.status);

              return (
                <Surface
                  key={booking.id}
                  elevation={2}
                  style={[
                    styles.bookingCard,
                    {
                      backgroundColor: surfaceColor,
                    },
                  ]}
                >
                  <View style={styles.bookingHeader}>
                    <View>
                      <Text
                        style={[
                          styles.bookingId,
                          {
                            color: primaryColor,
                          },
                        ]}
                      >
                        {booking.id}
                      </Text>

                      <Text
                        style={[
                          styles.guestName,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {booking.guestName}
                      </Text>
                    </View>

                    <Chip
                      compact
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            statusColors.background,
                        },
                      ]}
                      textStyle={{
                        color: statusColors.text,
                        fontWeight: '600',
                      }}
                    >
                      {booking.status}
                    </Chip>
                  </View>

                  <Divider
                    style={[
                      styles.divider,
                      {
                        backgroundColor: borderColor,
                      },
                    ]}
                  />

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Room
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {booking.room}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Guests
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {booking.guests}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Check-in
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {booking.checkIn}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Check-out
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {booking.checkOut}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        {
                          color: secondaryTextColor,
                        },
                      ]}
                    >
                      Total
                    </Text>

                    <Text
                      style={[
                        styles.amount,
                        {
                          color: secondaryColor,
                        },
                      ]}
                    >
                      ${booking.amount.toFixed(2)}
                    </Text>
                  </View>

                  <Divider
                    style={[
                      styles.divider,
                      {
                        backgroundColor: borderColor,
                      },
                    ]}
                  />

                  <View style={styles.actions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() =>
                        handleViewBooking(booking)
                      }
                      textColor={primaryColor}
                    >
                      View
                    </Button>

                    <Button
                      mode="outlined"
                      compact
                      onPress={() =>
                        handleEditBooking(booking)
                      }
                      textColor={primaryColor}
                    >
                      Edit
                    </Button>

                    {booking.status === 'Pending' && (
                      <Button
                        mode="contained"
                        compact
                        onPress={() =>
                          handleConfirmBooking(
                            booking.id,
                          )
                        }
                        buttonColor={successColor}
                        textColor="#FFFFFF"
                      >
                        Confirm
                      </Button>
                    )}

                    {booking.status !== 'Cancelled' &&
                      booking.status !== 'Completed' && (
                        <Button
                          mode="text"
                          compact
                          onPress={() =>
                            handleCancelBooking(
                              booking.id,
                            )
                          }
                          textColor={errorColor}
                        >
                          Cancel
                        </Button>
                      )}

                    {booking.status === 'Cancelled' && (
                      <IconButton
                        icon="delete-outline"
                        iconColor={errorColor}
                        size={22}
                        onPress={() =>
                          handleDeleteBooking(
                            booking.id,
                          )
                        }
                      />
                    )}
                  </View>
                </Surface>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  searchCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  searchInput: {
    marginBottom: 12,
  },

  filterContainer: {
    marginTop: 4,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },

  filterRow: {
    gap: 8,
    paddingRight: 8,
  },

  filterChip: {
    marginRight: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },

  bookingCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  bookingId: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  guestName: {
    fontSize: 19,
    fontWeight: '700',
  },

  statusChip: {
    marginLeft: 10,
  },

  divider: {
    marginVertical: 14,
  },

  detailRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amount: {
    fontSize: 20,
    fontWeight: '800',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});