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
  Divider,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  total: number;
};

const initialBookings: Booking[] = [
  {
    id: 'B001',
    guestName: 'John Smith',
    email: 'john@example.com',
    room: '101',
    checkIn: '2026-08-20',
    checkOut: '2026-08-23',
    guests: 2,
    status: 'Confirmed',
    total: 360,
  },
  {
    id: 'B002',
    guestName: 'Sarah Williams',
    email: 'sarah@example.com',
    room: '201',
    checkIn: '2026-08-22',
    checkOut: '2026-08-25',
    guests: 4,
    status: 'Pending',
    total: 660,
  },
  {
    id: 'B003',
    guestName: 'David Brown',
    email: 'david@example.com',
    room: '102',
    checkIn: '2026-08-18',
    checkOut: '2026-08-20',
    guests: 2,
    status: 'Confirmed',
    total: 180,
  },
];

export default function ManageBookings() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const [bookings, setBookings] =
    useState<Booking[]>(initialBookings);

  const [editingBooking, setEditingBooking] =
    useState<Booking | null>(null);

  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [status, setStatus] =
    useState<Booking['status']>('Confirmed');

  const openEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setGuestName(booking.guestName);
    setEmail(booking.email);
    setRoom(booking.room);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuests(String(booking.guests));
    setStatus(booking.status);
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setGuestName('');
    setEmail('');
    setRoom('');
    setCheckIn('');
    setCheckOut('');
    setGuests('');
    setStatus('Confirmed');
  };

  const saveBooking = () => {
    if (
      !editingBooking ||
      !guestName.trim() ||
      !email.trim() ||
      !room.trim() ||
      !checkIn.trim() ||
      !checkOut.trim() ||
      !guests.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all booking fields.',
      );
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === editingBooking.id
          ? {
              ...booking,
              guestName: guestName.trim(),
              email: email.trim(),
              room: room.trim(),
              checkIn: checkIn.trim(),
              checkOut: checkOut.trim(),
              guests: Number(guests),
              status,
            }
          : booking,
      ),
    );

    closeEdit();
  };

  const deleteBooking = (id: string) => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBookings((current) =>
              current.filter((booking) => booking.id !== id),
            );
          },
        },
      ],
    );
  };

  const getStatusStyle = (
    bookingStatus: Booking['status'],
  ) => {
    switch (bookingStatus) {
      case 'Confirmed':
        return styles.confirmedStatus;
      case 'Pending':
        return styles.pendingStatus;
      case 'Cancelled':
        return styles.cancelledStatus;
      default:
        return styles.pendingStatus;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor: colors.background,
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
          <View style={styles.header}>
            <Button
              icon="menu"
              mode="text"
              onPress={() => router.back()}
              textColor={colors.textPrimary}
              compact
            />

            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Manage Bookings
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.secondary,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Manage Bookings
              </Text>

              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {bookings.length}{' '}
                {bookings.length === 1
                  ? 'booking'
                  : 'bookings'}
              </Text>
            </View>

            <View style={styles.themeSelector}>
              <ThemeModeSelector />
            </View>
          </View>

          {bookings.map((booking) => (
            <Surface
              key={booking.id}
              elevation={2}
              style={[
                styles.bookingCard,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.bookingTop}>
                <View>
                  <Text
                    style={[
                      styles.bookingId,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {booking.id}
                  </Text>

                  <Text
                    style={[
                      styles.bookingLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    BOOKING
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(booking.status),
                  ]}
                >
                  <Text style={styles.statusText}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.guestName,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {booking.guestName}
              </Text>

              <Text
                style={[
                  styles.email,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {booking.email}
              </Text>

              <Divider
                style={[
                  styles.divider,
                  {
                    backgroundColor: colors.textSecondary,
                  },
                ]}
              />

              <View style={styles.detailsRow}>
                <View style={styles.detail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    ROOM
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {booking.room}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    GUESTS
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {booking.guests}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    CHECK-IN
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {booking.checkIn}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    CHECK-OUT
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {booking.checkOut}
                  </Text>
                </View>
              </View>

              <View style={styles.totalRow}>
                <Text
                  style={[
                    styles.totalLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  TOTAL
                </Text>

                <Text
                  style={[
                    styles.totalValue,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  ${booking.total}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <Button
                  mode="outlined"
                  onPress={() => openEdit(booking)}
                  style={[
                    styles.editButton,
                    {
                      borderColor: colors.secondary,
                    },
                  ]}
                  textColor={colors.secondary}
                  contentStyle={styles.buttonContent}
                >
                  Edit
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => deleteBooking(booking.id)}
                  style={styles.deleteButton}
                  textColor={colors.error}
                  contentStyle={styles.buttonContent}
                >
                  Delete
                </Button>
              </View>
            </Surface>
          ))}

          {editingBooking && (
            <Surface
              elevation={3}
              style={[
                styles.editCard,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.editTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Edit Booking
              </Text>

              <Text
                style={[
                  styles.editSubtitle,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Update booking information
              </Text>

              <TextInput
                mode="outlined"
                label="Guest Name"
                value={guestName}
                onChangeText={setGuestName}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <TextInput
                mode="outlined"
                label="Room"
                value={room}
                onChangeText={setRoom}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <TextInput
                mode="outlined"
                label="Check-in"
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <TextInput
                mode="outlined"
                label="Check-out"
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="YYYY-MM-DD"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <TextInput
                mode="outlined"
                label="Number of Guests"
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
                textColor={colors.textPrimary}
                outlineColor={colors.textSecondary}
                activeOutlineColor={colors.secondary}
              />

              <Text
                style={[
                  styles.statusHeading,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Booking Status
              </Text>

              <View style={styles.statusButtons}>
                {(
                  [
                    'Confirmed',
                    'Pending',
                    'Cancelled',
                  ] as Booking['status'][]
                ).map((item) => (
                  <Button
                    key={item}
                    mode={
                      status === item
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() => setStatus(item)}
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
                    {item}
                  </Button>
                ))}
              </View>

              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={closeEdit}
                  style={styles.cancelButton}
                  textColor={colors.textSecondary}
                >
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  onPress={saveBooking}
                  style={styles.saveButton}
                  buttonColor={colors.secondary}
                  textColor={colors.textPrimary}
                >
                  Save Changes
                </Button>
              </View>
            </Surface>
          )}

          <Text
            style={[
              styles.footer,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Manage guest reservations and booking details.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
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

    header: {
      height: 80,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
    },

    headerSpacer: {
      width: 48,
    },

    hero: {
      minHeight: 180,
      paddingHorizontal: 42,
      paddingVertical: 34,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    heroTitle: {
      fontSize: 40,
      fontWeight: '800',
    },

    heroSubtitle: {
      fontSize: 20,
      marginTop: 4,
    },

    themeSelector: {
      alignSelf: 'center',
    },

    bookingCard: {
      marginHorizontal: 34,
      marginTop: 28,
      borderRadius: 24,
      padding: 34,
    },

    bookingTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    bookingId: {
      fontSize: 30,
      fontWeight: '800',
    },

    bookingLabel: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: -2,
    },

    statusBadge: {
      borderRadius: 30,
      paddingHorizontal: 22,
      paddingVertical: 12,
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
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.5,
    },

    guestName: {
      fontSize: 26,
      fontWeight: '700',
      marginTop: 30,
    },

    email: {
      fontSize: 16,
      marginTop: 5,
    },

    divider: {
      marginVertical: 20,
      opacity: 0.35,
    },

    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    detail: {
      width: '48%',
    },

    detailLabel: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4,
    },

    detailValue: {
      fontSize: 17,
      fontWeight: '600',
    },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 24,
    },

    totalLabel: {
      fontSize: 14,
      fontWeight: '700',
    },

    totalValue: {
      fontSize: 22,
      fontWeight: '800',
    },

    actionRow: {
      flexDirection: 'row',
      gap: 14,
    },

    editButton: {
      flex: 1,
      borderWidth: 1.5,
      borderRadius: 10,
    },

    deleteButton: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.error,
      borderRadius: 10,
    },

    buttonContent: {
      height: 50,
    },

    editCard: {
      marginHorizontal: 34,
      marginTop: 28,
      borderRadius: 24,
      padding: 28,
    },

    editTitle: {
      fontSize: 28,
      fontWeight: '800',
    },

    editSubtitle: {
      fontSize: 16,
      marginTop: 4,
      marginBottom: 22,
    },

    input: {
      marginBottom: 14,
    },

    statusHeading: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 8,
      marginBottom: 10,
    },

    statusButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    statusButton: {
      borderRadius: 10,
    },

    editActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },

    cancelButton: {
      flex: 1,
      borderRadius: 10,
    },

    saveButton: {
      flex: 1,
      borderRadius: 10,
    },

    footer: {
      textAlign: 'center',
      fontSize: 14,
      marginHorizontal: 30,
      marginTop: 24,
    },
  });