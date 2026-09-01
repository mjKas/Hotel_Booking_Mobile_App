import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { toErrorMessage } from '@/src/api/apiError';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

/**
 * The loading, error and empty states every data-backed screen needs, so they
 * look and behave the same everywhere instead of being re-invented per screen.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const colors = useAppThemeColors();

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
  fallback = 'We could not load this right now.',
}: {
  error: unknown;
  onRetry?: () => void;
  fallback?: string;
}) {
  const colors = useAppThemeColors();

  return (
    <View style={styles.centered}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Something went wrong
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {toErrorMessage(error, fallback)}
      </Text>

      {onRetry ? (
        <Button
          mode="outlined"
          onPress={onRetry}
          style={styles.action}
          textColor={colors.primary}
        >
          Try again
        </Button>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useAppThemeColors();

  return (
    <View style={styles.centered}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>

      {description ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.action}
          buttonColor={colors.primary}
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  message: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

  action: {
    marginTop: 20,
    borderRadius: 10,
  },
});
