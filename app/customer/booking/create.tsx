import React, { useState } from 'react';
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
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { router, useLocalSearchParams } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useCreateBooking, useRoom, useRoomQuote } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatMoney, todayISO } from '@/src/lib/format';

export default function CreateBookingScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const { roomId: roomIdParam } = useLocalSearchParams<{
    roomId?: string;
  }>();
  const roomId = Number(roomIdParam);
  const hasRoom = Number.isFinite(roomId) && roomId > 0;

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState<string | null>(null);

  const room = useRoom(hasRoom ? roomId : null);

  // The server owns the arithmetic: nightly rate, tax and total all come from
  // the quote, so the figure shown here is the figure that gets booked.
  const quote = useRoomQuote(
    hasRoom ? roomId : null,
    checkIn,
    checkOut,
  );

  const createBooking = useCreateBooking();

  const numberOfNights = quote.data?.nights ?? 0;

  const maxGuests = room.data?.roomType.maxOccupancy ?? 8;

  async function handleConfirm() {
    setError(null);

    try {
      const booking = await createBooking.mutateAsync({
        roomId,
        checkIn,
        checkOut,
        guests,
        specialRequests: specialRequests.trim() || undefined,
      });

      router.replace(
        `/bookings/confirmation?bookingId=${booking.id}`,
      );
    } catch (err) {
      // 409 means someone else took the room between the quote and the submit.
      setError(
        toErrorMessage(err, 'We could not confirm this booking.'),
      );
    }
  }

  if (!hasRoom) {
    return (
      <ErrorState
        error={new Error('Choose a room before booking.')}
        onRetry={() => router.replace('/rooms')}
        fallback="Choose a room before booking."
      />
    );
  }

  if (room.isPending) {
    return <LoadingState label="Loading this room…" />;
  }

  if (room.isError) {
    return (
      <ErrorState
        error={room.error}
        onRetry={() => void room.refetch()}
        fallback="We could not load this room."
      />
    );
  }

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
            {room.data.roomType.name}
          </Text>

          <Text style={styles.roomNumber}>
            Room {room.data.roomNumber} · Sleeps{' '}
            {room.data.roomType.maxOccupancy}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatMoney(room.data.nightlyRate)}
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
        minDate={todayISO()}
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
          {guests} {guests === 1 ? 'Guest' : 'Guests'}
        </Text>

        <Button
          mode="outlined"
          disabled={guests >= maxGuests}
          onPress={() =>
            setGuests(Math.min(maxGuests, guests + 1))
          }
        >
          +
        </Button>
      </View>

      {/* Special requests */}
      <Text style={styles.sectionTitle}>
        Special requests
      </Text>

      <TextInput
        mode="outlined"
        placeholder="Anything we should know? (optional)"
        value={specialRequests}
        onChangeText={setSpecialRequests}
        multiline
        numberOfLines={3}
        maxLength={500}
        style={styles.requestsInput}
        textColor={colors.textPrimary}
      />

      {/* Price Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>
            Price Summary
          </Text>

          {!checkIn || !checkOut ? (
            <Text style={styles.summaryText}>
              Choose your dates to see the price.
            </Text>
          ) : quote.isPending ? (
            <Text style={styles.summaryText}>Pricing your stay…</Text>
          ) : quote.isError ? (
            <Text style={styles.summaryText}>
              {toErrorMessage(
                quote.error,
                'We could not price this stay.',
              )}
            </Text>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  {quote.data.nights}{' '}
                  {quote.data.nights === 1 ? 'night' : 'nights'} ×{' '}
                  {formatMoney(
                    quote.data.nightlyRate,
                    quote.data.currency,
                  )}
                </Text>

                <Text style={styles.summaryText}>
                  {formatMoney(
                    quote.data.subtotal,
                    quote.data.currency,
                  )}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  Taxes
                </Text>

                <Text style={styles.summaryText}>
                  {formatMoney(quote.data.taxes, quote.data.currency)}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.total}>
                  {formatMoney(quote.data.total, quote.data.currency)}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {error ? (
        <HelperText type="error" visible style={styles.errorText}>
          {error}
        </HelperText>
      ) : null}

      {/* Confirm Booking */}
      <Button
        mode="contained"
        loading={createBooking.isPending}
        disabled={
          !checkIn ||
          !checkOut ||
          numberOfNights <= 0 ||
          quote.isPending ||
          quote.isError ||
          createBooking.isPending
        }
        onPress={handleConfirm}
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
    requestsInput: {
      marginBottom: 8,
      backgroundColor: colors.surface,
    },

    errorText: {
      fontSize: 14,
      paddingHorizontal: 0,
    },

    confirmButton: {
      marginHorizontal: 20,
      marginTop: 24,
      borderRadius: 10,
    },

    buttonContent: {
      height: 52,
    },
  });