import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  Text,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function CreateBookingScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const pricePerNight = 120;

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference = end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference / (1000 * 60 * 60 * 24),
      ),
    );
  }, [checkIn, checkOut]);

  const total = numberOfNights * pricePerNight;
  const taxes = Math.round(total * 0.1);
  const grandTotal = total + taxes;

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
        Book Your Room
      </Text>

      {/* Selected Room */}
      <Card style={styles.roomCard}>
        <Card.Content>
          <Text style={styles.roomName}>
            Deluxe Room
          </Text>

          <Text style={styles.roomNumber}>
            Room 101
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${pricePerNight}
            </Text>

            <Text style={styles.perNight}>
              / night
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Check-in */}
      <Text style={styles.sectionTitle}>
        Check-in
      </Text>

      <Calendar
        minDate={
          new Date()
            .toISOString()
            .split('T')[0]
        }
        onDayPress={(day) => {
          setCheckIn(day.dateString);

          if (
            checkOut &&
            day.dateString >= checkOut
          ) {
            setCheckOut('');
          }
        }}
        markedDates={
          checkIn
            ? {
                [checkIn]: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }
            : {}
        }
        theme={{
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textSecondary,
          dayTextColor: colors.textPrimary,
          monthTextColor: colors.textPrimary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.headerText,
          todayTextColor: colors.secondary,
          arrowColor: colors.primary,
          textDisabledColor: colors.border,
        }}
      />

      {checkIn && (
        <>
          <Text style={styles.selectedDate}>
            Check-in: {checkIn}
          </Text>

          {/* Check-out */}
          <Text style={styles.sectionTitle}>
            Check-out
          </Text>

          <Calendar
            minDate={checkIn}
            onDayPress={(day) => {
              if (day.dateString > checkIn) {
                setCheckOut(day.dateString);
              }
            }}
            markedDates={
              checkOut
                ? {
                    [checkOut]: {
                      selected: true,
                      selectedColor: colors.secondary,
                    },
                  }
                : {}
            }
            theme={{
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              dayTextColor: colors.textPrimary,
              monthTextColor: colors.textPrimary,
              selectedDayBackgroundColor: colors.secondary,
              selectedDayTextColor: colors.headerText,
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
              textDisabledColor: colors.border,
            }}
          />

          {checkOut && (
            <Text style={styles.selectedDate}>
              Check-out: {checkOut}
            </Text>
          )}
        </>
      )}

      {/* Guests */}
      <Text style={styles.sectionTitle}>
        Guests
      </Text>

      <View style={styles.guestSelector}>
        <Button
          mode="outlined"
          onPress={() =>
            setGuests(
              Math.max(1, guests - 1),
            )
          }
        >
          −
        </Button>

        <Text style={styles.guestCount}>
          {guests} Guests
        </Text>

        <Button
          mode="outlined"
          onPress={() =>
            setGuests(guests + 1)
          }
        >
          +
        </Button>
      </View>

      {/* Price Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>
            Price Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {numberOfNights} nights × $
              {pricePerNight}
            </Text>

            <Text style={styles.summaryText}>
              ${total}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Taxes
            </Text>

            <Text style={styles.summaryText}>
              ${taxes}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              ${grandTotal}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Confirm Booking */}
      <Button
        mode="contained"
        disabled={
          !checkIn ||
          !checkOut ||
          numberOfNights <= 0
        }
        onPress={() =>
          router.push(
            '/bookings/confirmation',
          )
        }
        style={styles.confirmButton}
        contentStyle={styles.buttonContent}
      >
        Confirm Booking
      </Button>

      {/* Back */}
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

    /* Room */
    roomCard: {
      marginHorizontal: 20,
      borderRadius: 14,
      backgroundColor: colors.surface,
      marginBottom: 24,
    },

    roomName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    roomNumber: {
      color: colors.textSecondary,
      marginTop: 4,
    },

    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 12,
    },

    price: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    perNight: {
      color: colors.textSecondary,
      marginLeft: 4,
    },

    /* Sections */
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
    },

    selectedDate: {
      backgroundColor: colors.surfaceVariant,
      color: colors.textPrimary,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 20,
      marginTop: 10,
    },

    /* Guests */
    guestSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 12,
      marginHorizontal: 20,
    },

    guestCount: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    /* Summary */
    summaryCard: {
      marginHorizontal: 20,
      marginTop: 24,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },

    summaryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
    },

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 6,
    },

    summaryText: {
      color: colors.textPrimary,
    },

    divider: {
      marginVertical: 12,
    },

    totalLabel: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    total: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    /* Buttons */
    confirmButton: {
      marginHorizontal: 20,
      marginTop: 24,
      borderRadius: 10,
    },

    buttonContent: {
      height: 52,
    },
  });