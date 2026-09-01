import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { router } from 'expo-router';

import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useDashboard } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatMoney } from '@/src/lib/format';
import { useAuthStore } from '@/src/store/authStore';
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from '@/src/types/domain';

/** Today's numbers for the front desk, from GET /reports/dashboard. */
export default function AdminDashboardScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const { data, isPending, isError, error, refetch } = useDashboard();

  async function handleSignOut() {
    await signOut();
    router.replace('/auth/login');
  }

  if (isPending) {
    return <LoadingState label="Loading today's numbers…" />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const occupancyPercent = Math.round(
    data.occupancy.occupancyRate * 100,
  );

  const revenueDelta =
    data.revenue.monthlyRevenue - data.revenue.previousMonthRevenue;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.greeting}>
        Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}
      </Text>

      <Text style={styles.subheading}>
        Here is how the hotel is doing today.
      </Text>

      <View style={styles.statGrid}>
        <StatTile
          label="Occupancy"
          value={`${occupancyPercent}%`}
          hint={`${data.occupancy.occupied} of ${data.occupancy.totalRooms} rooms`}
          styles={styles}
        />

        <StatTile
          label="Available"
          value={String(data.occupancy.available)}
          hint={`${data.occupancy.maintenance} in maintenance`}
          styles={styles}
        />

        <StatTile
          label="Arrivals today"
          value={String(data.arrivalsToday)}
          hint={`${data.departuresToday} departures`}
          styles={styles}
        />

        <StatTile
          label="Active bookings"
          value={String(data.activeBookings)}
          hint={`${data.totalUsers} accounts`}
          styles={styles}
        />
      </View>

      <Card style={styles.card}>
        <Card.Title
          title="Revenue this month"
          titleStyle={styles.cardTitle}
        />

        <Card.Content>
          <Text style={styles.revenue}>
            {formatMoney(
              data.revenue.monthlyRevenue,
              data.revenue.currency,
            )}
          </Text>

          <Text style={styles.revenueDelta}>
            {revenueDelta >= 0 ? '▲' : '▼'}{' '}
            {formatMoney(
              Math.abs(revenueDelta),
              data.revenue.currency,
            )}{' '}
            versus last month
          </Text>

          <Text style={styles.revenueMeta}>
            Average daily rate{' '}
            {formatMoney(
              data.revenue.averageDailyRate,
              data.revenue.currency,
            )}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Recent bookings"
          titleStyle={styles.cardTitle}
        />

        <Card.Content>
          {data.recentBookings.length === 0 ? (
            <Text style={styles.emptyText}>
              No bookings have been made yet.
            </Text>
          ) : (
            data.recentBookings.map((booking, index) => (
              <View key={booking.id}>
                {index > 0 ? <Divider style={styles.divider} /> : null}

                <View style={styles.bookingRow}>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingGuest}>
                      {booking.guestName}
                    </Text>

                    <Text style={styles.bookingMeta}>
                      {booking.reference} · Room{' '}
                      {booking.room.roomNumber}
                    </Text>

                    <Text style={styles.bookingMeta}>
                      {formatDate(booking.checkIn)} –{' '}
                      {formatDate(booking.checkOut)}
                    </Text>
                  </View>

                  <View style={styles.bookingRight}>
                    <Chip
                      compact
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: statusColour(
                            booking.status,
                            colors,
                          ),
                        },
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Chip>

                    <Text style={styles.bookingTotal}>
                      {formatMoney(
                        booking.totalPrice,
                        booking.currency,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>

        <Card.Actions>
          <Button
            onPress={() => router.push('/admin/manageBookings')}
            textColor={colors.primary}
          >
            Manage bookings
          </Button>
        </Card.Actions>
      </Card>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOut}
        textColor={colors.error}
      >
        Sign out
      </Button>
    </ScrollView>
  );
}

function StatTile({
  label,
  value,
  hint,
  styles,
}: {
  label: string;
  value: string;
  hint: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </View>
  );
}

function statusColour(
  status: BookingStatus,
  colors: ReturnType<typeof useAppThemeColors>,
): string {
  switch (status) {
    case 'CANCELLED':
      return colors.errorSurface;
    case 'CHECKED_OUT':
      return colors.surfaceVariant;
    default:
      return colors.surfaceVariant;
  }
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 16,
      paddingBottom: 32,
    },

    greeting: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    subheading: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 20,
    },

    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },

    statTile: {
      flexGrow: 1,
      flexBasis: '45%',
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },

    statLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },

    statValue: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 6,
    },

    statHint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },

    card: {
      marginBottom: 16,
      backgroundColor: colors.surface,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    revenue: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    revenueDelta: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },

    revenueMeta: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },

    divider: {
      marginVertical: 12,
      backgroundColor: colors.surfaceVariant,
    },

    bookingRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },

    bookingDetails: {
      flex: 1,
    },

    bookingRight: {
      alignItems: 'flex-end',
    },

    bookingGuest: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    bookingMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },

    bookingTotal: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 6,
    },

    statusChip: {
      borderRadius: 8,
    },

    statusChipText: {
      fontSize: 12,
      color: colors.textPrimary,
    },

    emptyText: {
      fontSize: 15,
      color: colors.textSecondary,
    },

    signOut: {
      marginTop: 4,
      borderRadius: 10,
      borderColor: colors.error,
    },
  });
