import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Portal,
  Surface,
  Text,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { useAvailability } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { addDays, formatDate, formatMoney, todayISO } from '@/src/lib/format';
import { useAuthStore } from '@/src/store/authStore';
import type { AvailabilityQuery } from '@/src/types/domain';

const MAX_GUESTS = 8;

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32';

export default function CustomerHomeScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);

  const [checkIn, setCheckIn] = useState(addDays(todayISO(), 1));
  const [checkOut, setCheckOut] = useState(addDays(todayISO(), 3));
  const [guests, setGuests] = useState(2);

  // Which date the calendar sheet is editing, if any.
  const [picking, setPicking] = useState<'checkIn' | 'checkOut' | null>(
    null,
  );

  // Only set once the user presses Search, so the screen does not fire a
  // query on every date tweak.
  const [search, setSearch] = useState<AvailabilityQuery | null>(null);

  const availability = useAvailability(search);

  function handleDayPress(date: string) {
    if (picking === 'checkIn') {
      setCheckIn(date);

      // Keep the range valid: a check-out on or before the new check-in is
      // pushed out by a night.
      if (date >= checkOut) {
        setCheckOut(addDays(date, 1));
      }
    } else if (picking === 'checkOut') {
      setCheckOut(date);
    }

    setPicking(null);
  }

  function handleSearch() {
    setSearch({ checkIn, checkOut, guests });
  }

  const calendarTheme = {
    calendarBackground: colors.surface,
    textSectionTitleColor: colors.textSecondary,
    dayTextColor: colors.textPrimary,
    monthTextColor: colors.textPrimary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.headerText,
    todayTextColor: colors.secondary,
    arrowColor: colors.primary,
    textDisabledColor: colors.border,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hotel Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/images/royal-crest-logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <Text style={styles.brand}>
              Royal Crest Hotel
            </Text>

            <Text style={styles.welcome}>
              Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}!
            </Text>
          </View>
        </View>

        <Button
          mode="text"
          textColor={colors.primary}
          onPress={() => router.push('/customer/tabs/profile')}
        >
          Profile
        </Button>
      </View>

      {/* Hero Image */}
      <Image
        source={{ uri: HERO_IMAGE }}
        style={styles.heroImage}
      />

      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>
          Your perfect stay awaits
        </Text>

        <Text style={styles.heroSubtitle}>
          Comfortable rooms and exceptional hospitality.
        </Text>
      </View>

      {/* Room Search */}
      <Surface style={styles.searchCard} elevation={3}>
        <Text style={styles.sectionTitle}>
          Find your room
        </Text>

        <View style={styles.dateRow}>
          <Button
            mode="outlined"
            style={styles.dateBox}
            contentStyle={styles.dateBoxContent}
            onPress={() => setPicking('checkIn')}
            textColor={colors.textPrimary}
          >
            <Text style={styles.label}>CHECK-IN{'\n'}</Text>
            <Text style={styles.value}>{formatDate(checkIn)}</Text>
          </Button>

          <Button
            mode="outlined"
            style={styles.dateBox}
            contentStyle={styles.dateBoxContent}
            onPress={() => setPicking('checkOut')}
            textColor={colors.textPrimary}
          >
            <Text style={styles.label}>CHECK-OUT{'\n'}</Text>
            <Text style={styles.value}>{formatDate(checkOut)}</Text>
          </Button>
        </View>

        <View style={styles.guestBox}>
          <Text style={styles.label}>
            GUESTS
          </Text>

          <View style={styles.guestControls}>
            <Button
              mode="outlined"
              compact
              disabled={guests <= 1}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              −
            </Button>

            <Text style={styles.value}>
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </Text>

            <Button
              mode="outlined"
              compact
              disabled={guests >= MAX_GUESTS}
              onPress={() => setGuests(Math.min(MAX_GUESTS, guests + 1))}
            >
              +
            </Button>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSearch}
          loading={availability.isFetching}
          disabled={availability.isFetching}
          style={styles.searchButton}
          contentStyle={styles.buttonContent}
        >
          Search Rooms
        </Button>
      </Surface>

      {/* Search results */}
      {search ? (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>
            {formatDate(search.checkIn)} – {formatDate(search.checkOut)}
          </Text>

          {availability.isPending ? (
            <ActivityIndicator
              style={styles.resultsSpinner}
              color={colors.primary}
            />
          ) : availability.isError ? (
            <Text style={styles.resultsMessage}>
              {toErrorMessage(
                availability.error,
                'We could not search for rooms.',
              )}
            </Text>
          ) : availability.data.length === 0 ? (
            <Text style={styles.resultsMessage}>
              No rooms are free for those dates. Try a shorter stay or fewer
              guests.
            </Text>
          ) : (
            availability.data.map((result) => (
              <Surface
                key={result.room.id}
                style={styles.resultCard}
                elevation={1}
              >
                <View style={styles.resultDetails}>
                  <Text style={styles.roomTitle}>
                    {result.room.roomType.name}
                  </Text>

                  <Text style={styles.roomDescription}>
                    Room {result.room.roomNumber} · sleeps{' '}
                    {result.room.roomType.maxOccupancy}
                  </Text>

                  <Text style={styles.price}>
                    {formatMoney(result.total, result.currency)} total ·{' '}
                    {result.nights}{' '}
                    {result.nights === 1 ? 'night' : 'nights'}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  compact
                  onPress={() =>
                    router.push(
                      `/bookings/create?roomId=${result.room.id}`,
                    )
                  }
                >
                  Book
                </Button>
              </Surface>
            ))
          )}
        </View>
      ) : null}

      {/* Featured Rooms */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Featured Rooms
        </Text>

        <Button
          mode="text"
          textColor={colors.secondary}
          onPress={() => router.push('/rooms')}
        >
          View All
        </Button>
      </View>

      <Surface style={styles.featuredCard} elevation={2}>
        <Image
          source={{ uri: PLACEHOLDER_IMAGE }}
          style={styles.featuredImage}
        />

        <View style={styles.featuredContent}>
          <Text style={styles.roomTitle}>
            Browse the whole hotel
          </Text>

          <Text style={styles.roomDescription}>
            Every room, its facilities and its nightly rate.
          </Text>

          <View style={styles.roomBottom}>
            <Button
              mode="contained"
              compact
              onPress={() => router.push('/rooms')}
            >
              View rooms
            </Button>
          </View>
        </View>
      </Surface>

      <Portal>
        <Modal
          visible={picking !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPicking(null)}
        >
          <View style={styles.calendarBackdrop}>
            <Surface style={styles.calendarSheet} elevation={4}>
              <Text style={styles.sectionTitle}>
                {picking === 'checkIn'
                  ? 'Choose your check-in'
                  : 'Choose your check-out'}
              </Text>

              <Calendar
                minDate={
                  picking === 'checkOut'
                    ? addDays(checkIn, 1)
                    : todayISO()
                }
                onDayPress={(day) => handleDayPress(day.dateString)}
                markedDates={{
                  [picking === 'checkIn' ? checkIn : checkOut]: {
                    selected: true,
                    selectedColor: colors.primary,
                  },
                }}
                theme={calendarTheme}
              />

              <Button
                mode="text"
                onPress={() => setPicking(null)}
                textColor={colors.primary}
              >
                Cancel
              </Button>
            </Surface>
          </View>
        </Modal>
      </Portal>
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
      paddingBottom: 30,
    },

    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    logo: {
      width: 55,
      height: 55,
      borderRadius: 8,
      marginRight: 10,
    },

    brand: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    welcome: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 13,
    },

    heroImage: {
      width: '100%',
      height: 230,
    },

    heroOverlay: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
    },

    heroTitle: {
      color: colors.headerText,
      fontSize: 23,
      fontWeight: '700',
    },

    heroSubtitle: {
      color: colors.headerSubtle,
      marginTop: 5,
      fontSize: 14,
    },

    searchCard: {
      margin: 16,
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    dateRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },

    dateBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
    },

    guestBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
    },

    label: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '700',
    },

    value: {
      fontSize: 15,
      color: colors.textPrimary,
      fontWeight: '600',
      marginTop: 4,
    },

    dateBoxContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingVertical: 8,
    },

    guestControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },

    results: {
      paddingHorizontal: 20,
      marginTop: 24,
    },

    resultsSpinner: {
      marginVertical: 24,
    },

    resultsMessage: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 10,
    },

    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginTop: 12,
    },

    resultDetails: {
      flex: 1,
    },

    calendarBackdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    calendarSheet: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
    },

    searchButton: {
      marginTop: 16,
      borderRadius: 10,
    },

    buttonContent: {
      height: 48,
    },

    sectionHeader: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    featuredCard: {
      marginHorizontal: 16,
      marginTop: 4,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },

    featuredImage: {
      width: '100%',
      height: 180,
    },

    featuredContent: {
      padding: 15,
    },

    roomTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    roomDescription: {
      color: colors.textSecondary,
      marginTop: 5,
      lineHeight: 20,
    },

    roomBottom: {
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    price: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });