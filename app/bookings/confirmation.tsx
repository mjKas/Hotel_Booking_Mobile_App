import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router } from 'expo-router';

export default function BookingConfirmationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.check}>✓</Text>
      </View>

      <Text style={styles.title}>
        Booking Confirmed!
      </Text>

      <Text style={styles.subtitle}>
        Your reservation has been successfully confirmed.
      </Text>

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

      <Button
        mode="text"
        textColor="#082A55"
        onPress={() =>
          router.replace('/customer')
        }
      >
        Back to Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: '#2E7D32',
    fontSize: 42,
    fontWeight: '700',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#082A55',
    marginTop: 20,
  },

  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

  bookingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 28,
  },

  bookingId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },

  bookingNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#082A55',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },

  room: {
    fontSize: 18,
    fontWeight: '700',
    color: '#082A55',
  },

  details: {
    color: '#6B7280',
    marginTop: 5,
  },

  totalLabel: {
    color: '#6B7280',
  },

  total: {
    color: '#082A55',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 3,
  },

  button: {
    width: '100%',
    marginTop: 25,
    borderRadius: 10,
  },

  buttonContent: {
    height: 50,
  },
});