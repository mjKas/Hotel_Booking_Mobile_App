import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  Text,
} from 'react-native-paper';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function BookingDetailsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const booking = {
    id: 'BK-1024',
    status: 'CONFIRMED',
    room: 'Deluxe Room',
    roomNumber: '101',
    checkIn: '08 Aug 2026',
    checkOut: '10 Aug 2026',
    guests: 2,
    roomTotal: 240,
    taxes: 24,
    total: 264,
    guestName: 'John Doe',
    email: 'john@example.com',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Booking Details</Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.bookingId}>
                {booking.id}
              </Text>

              <Text style={styles.room}>
                {booking.room}
              </Text>

              <Text style={styles.roomNumber}>
                Room {booking.roomNumber}
              </Text>
            </View>

            <View style={styles.status}>
              <Text style={styles.statusText}>
                {booking.status}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Stay Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check-in
            </Text>
            <Text>{booking.checkIn}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Check-out
            </Text>
            <Text>{booking.checkOut}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Guests
            </Text>
            <Text>{booking.guests}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Guest
          </Text>

          <Text style={styles.guestName}>
            {booking.guestName}
          </Text>

          <Text style={styles.email}>
            {booking.email}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>
            Price Summary
          </Text>

          <View style={styles.row}>
            <Text>Room</Text>
            <Text>${booking.roomTotal}</Text>
          </View>

          <View style={styles.row}>
            <Text>Taxes</Text>
            <Text>${booking.taxes}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              ${booking.total}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        textColor={colors.error}
        style={styles.cancelButton}
        onPress={() => {}}
      >
        Cancel Booking
      </Button>
       <Button
               mode="text"
              icon="arrow-left"
              onPress={() => router.back()}
              >
              Back
              </Button>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 18,
  },

  card: {
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

  guestName: {
    fontSize: 16,
    fontWeight: '600',
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
    borderColor: colors.error,
    borderRadius: 10,
  },
});
