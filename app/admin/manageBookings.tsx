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
  Divider,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

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

  // ==========================================
  // OPEN EDIT
  // ==========================================

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

  // ==========================================
  // CLOSE EDIT
  // ==========================================

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

  // ==========================================
  // SAVE BOOKING
  // ==========================================

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

  // ==========================================
  // DELETE BOOKING
  // ==========================================

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
              current.filter(
                (booking) => booking.id !== id,
              ),
            );
          },
        },
      ],
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

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
              icon="plus"
              compact
              textColor="#000000"
              onPress={() => {}}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
            >
              Add
            </Button>

          </View>

          {/* =====================================
              BOOKING RECORDS
              ===================================== */}

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
                    {booking.id}
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
                    {booking.status.toUpperCase()}
                  </Text>
                </View>

              </View>

              {/* GUEST */}

              <Text style={styles.guestName}>
                {booking.guestName}
              </Text>

              <Text style={styles.email}>
                {booking.email}
              </Text>

              <Divider style={styles.divider} />

              {/* ROOM / GUESTS */}

              <View style={styles.detailsRow}>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    ROOM
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.room}
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
                    {booking.checkIn}
                  </Text>

                </View>

                <View style={styles.detail}>

                  <Text style={styles.detailLabel}>
                    CHECK-OUT
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.checkOut}
                  </Text>

                </View>

              </View>

              {/* TOTAL */}

              <View style={styles.totalRow}>

                <Text style={styles.totalLabel}>
                  TOTAL
                </Text>

                <Text style={styles.totalValue}>
                  ${booking.total}
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
                  onPress={() =>
                    deleteBooking(booking.id)
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
                  Delete
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

              <TextInput
                mode="outlined"
                label="Guest Name"
                value={guestName}
                onChangeText={setGuestName}
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
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
                label="Room"
                value={room}
                onChangeText={setRoom}
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
                label="Check-in"
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
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

              <Text style={styles.statusHeading}>
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
                    {item}
                  </Button>
                ))}

              </View>

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