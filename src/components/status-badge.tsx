import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export type BadgeTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

/**
 * The pill used for room and booking statuses. Colours come from the theme's
 * status tokens, so the label stays readable in light and dark mode.
 */
export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: BadgeTone;
}) {
  const colors = useAppThemeColors();

  const palette: Record<BadgeTone, { bg: string; fg: string }> = {
    success: { bg: colors.successSurface, fg: colors.success },
    info: { bg: colors.infoSurface, fg: colors.info },
    warning: { bg: colors.errorSurface, fg: colors.warning },
    error: { bg: colors.errorSurface, fg: colors.error },
    neutral: { bg: colors.background, fg: colors.textSecondary },
  };

  const { bg, fg } = palette[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
