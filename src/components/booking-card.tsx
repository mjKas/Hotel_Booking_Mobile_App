import { StyleSheet, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';

import { StatusBadge, type BadgeTone } from '@/src/components/status-badge';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatMoney } from '@/src/lib/format';
import {
  BOOKING_STATUS_LABELS,
  type Booking,
  type BookingStatus,
} from '@/src/types/domain';

export function bookingTone(status: BookingStatus): BadgeTone {
  switch (status) {
    case 'CONFIRMED':
    case 'CHECKED_IN':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'error';
    default:
      return 'neutral';
  }
}

export type BookingCardAction = {
  label: string;
  onPress: () => void;
  /** Orange for the main action, pink for a destructive one. */
  tone: 'primary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
};

/**
 * One booking, drawn the same way for staff (Manage Bookings) and guests (My
 * Bookings): reference and status, guest, room and party size, dates, total,
 * then up to two outlined actions.
 */
export function BookingCard({
  booking,
  actions,
}: {
  booking: Booking;
  actions: BookingCardAction[];
}) {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.reference}>
          <Text style={styles.referenceText}>{booking.reference}</Text>
          <Text style={styles.caption}>BOOKING</Text>
        </View>

        <StatusBadge
          label={BOOKING_STATUS_LABELS[booking.status]}
          tone={bookingTone(booking.status)}
        />
      </View>

      <Text style={styles.guestName}>{booking.guestName}</Text>
      <Text style={styles.email}>{booking.guestEmail}</Text>

      <Divider style={styles.divider} />

      <View style={styles.row}>
        <Detail
          label="ROOM"
          value={`${booking.room.roomNumber} · ${booking.room.roomType.name}`}
          styles={styles}
        />
        <Detail label="GUESTS" value={String(booking.guests)} styles={styles} />
      </View>

      <View style={styles.row}>
        <Detail
          label="CHECK-IN"
          value={formatDate(booking.checkIn)}
          styles={styles}
        />
        <Detail
          label="CHECK-OUT"
          value={formatDate(booking.checkOut)}
          styles={styles}
        />
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>
          {formatMoney(booking.totalPrice, booking.currency)}
        </Text>
      </View>

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.label}
              mode="outlined"
              onPress={action.onPress}
              disabled={action.disabled}
              loading={action.loading}
              textColor={
                action.tone === 'primary' ? colors.secondary : colors.error
              }
              style={[
                styles.actionButton,
                {
                  borderColor:
                    action.tone === 'primary' ? colors.secondary : colors.error,
                  opacity: action.disabled ? 0.45 : 1,
                },
              ]}
              contentStyle={styles.actionContent}
            >
              {action.label}
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Detail({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    card: {
      marginBottom: 14,
      borderRadius: 14,
      padding: 18,
      backgroundColor: colors.surface,
    },

    top: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },

    reference: {
      flexShrink: 1,
    },

    referenceText: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    caption: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },

    guestName: {
      fontSize: 19,
      fontWeight: '700',
      marginTop: 16,
      color: colors.textPrimary,
    },

    email: {
      fontSize: 14,
      marginTop: 4,
      color: colors.textSecondary,
    },

    divider: {
      marginVertical: 14,
      opacity: 0.35,
      backgroundColor: colors.textSecondary,
    },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
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

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
      marginBottom: 16,
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

    actions: {
      flexDirection: 'row',
      gap: 10,
    },

    actionButton: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1.5,
    },

    actionContent: {
      height: 44,
    },
  });
