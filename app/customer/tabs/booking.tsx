import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

const bookings = [
  {
    id: 'BK-1024',
    status: 'CONFIRMED',
    room: 'Deluxe Room',
    dates: '08 Aug - 10 Aug 2026',
    guests: 2,
    total: 264,
  },
  {
    id: 'BK-1025',
    status: 'PENDING',
    room: 'Family Suite',
    dates: '18 Aug - 20 Aug 2026',
    guests: 4,
    total: 484,
  },
];

export default function CustomerBookingsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Bookings</Text>

      {bookings.map((booking) => (
        <Card key={booking.id} style={styles.card}>
          <Card.Content>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.bookingId}>
                  {booking.id}
                </Text>

                <Text style={styles.room}>
                  {booking.room}
                </Text>
              </View>

              <Chip
                compact
                style={styles.statusChip}
                textStyle={styles.statusText}
              >
                {booking.status}
              </Chip>
            </View>

            <Text style={styles.details}>{booking.dates}</Text>
            <Text style={styles.details}>
              {booking.guests} Guests
            </Text>

            <View style={styles.bottomRow}>
              <Text style={styles.total}>${booking.total}</Text>

              <Button
                mode="contained"
                compact
                buttonColor={colors.secondary}
                textColor="#000000"
                onPress={() => router.push('/bookings/1024')}
              >
                View
              </Button>
            <Button
              mode="text"
              icon="arrow-left"
              onPress={() => router.back()}
            >
              Back
            </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 18,
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      marginBottom: 14,
    },

    topRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },

    bookingId: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '700',
    },

    room: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 5,
    },

    statusChip: {
      backgroundColor: colors.successSurface,
    },

    statusText: {
      color: colors.success,
      fontSize: 10,
      fontWeight: '800',
    },

    details: {
      color: colors.textSecondary,
      marginTop: 8,
    },

    bottomRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },

    total: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
  });
