import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  Text,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';

export default function CreateBookingScreen() {
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
      Math.ceil(difference / (1000 * 60 * 60 * 24)),
    );
  }, [checkIn, checkOut]);

  const total = numberOfNights * pricePerNight;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Book Your Room</Text>

      <Card style={styles.roomCard}>
        <Card.Content>
          <Text style={styles.roomName}>Deluxe Room</Text>
          <Text style={styles.roomNumber}>Room 101</Text>

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

      <Text style={styles.sectionTitle}>
        Check-in
      </Text>

      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
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
                  selectedColor: '#082A55',
                },
              }
            : {}
        }
        theme={{
          selectedDayBackgroundColor: '#082A55',
          todayTextColor: '#FCA311',
          arrowColor: '#082A55',
        }}
      />

      {checkIn && (
        <>
          <Text style={styles.selectedDate}>
            Check-in: {checkIn}
          </Text>

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
                      selectedColor: '#FCA311',
                    },
                  }
                : {}
            }
            theme={{
              selectedDayBackgroundColor: '#FCA311',
              todayTextColor: '#082A55',
              arrowColor: '#082A55',
            }}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>
        Guests
      </Text>

      <View style={styles.guestSelector}>
        <Button
          mode="outlined"
          onPress={() =>
            setGuests(Math.max(1, guests - 1))
          }
        >
          −
        </Button>

        <Text style={styles.guestCount}>
          {guests} Guests
        </Text>

        <Button
          mode="outlined"
          onPress={() => setGuests(guests + 1)}
        >
          +
        </Button>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>
            Price Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text>
              {numberOfNights} nights × ${pricePerNight}
            </Text>

            <Text>${total}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Taxes</Text>
            <Text>${Math.round(total * 0.1)}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              ${total + Math.round(total * 0.1)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        disabled={
          !checkIn ||
          !checkOut ||
          numberOfNights <= 0
        }
        onPress={() =>
          router.push('/bookings/confirmation')
        }
        style={styles.confirmButton}
        contentStyle={styles.buttonContent}
      >
        Confirm Booking
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#082A55',
    marginBottom: 18,
  },

  roomCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },

  roomName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#082A55',
  },

  roomNumber: {
    color: '#6B7280',
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
    color: '#082A55',
  },

  perNight: {
    color: '#6B7280',
    marginLeft: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#082A55',
    marginTop: 20,
    marginBottom: 10,
  },

  selectedDate: {
    backgroundColor: '#EAF0F7',
    color: '#082A55',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },

  guestCount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#082A55',
  },

  summaryCard: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#082A55',
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  divider: {
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#082A55',
  },

  total: {
    fontSize: 20,
    fontWeight: '800',
    color: '#082A55',
  },

  confirmButton: {
    marginTop: 24,
    borderRadius: 10,
  },

  buttonContent: {
    height: 52,
  },
});