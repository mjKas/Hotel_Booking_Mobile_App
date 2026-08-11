import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

import { useThemePreference } from '@/src/context/theme-preference';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export function ThemeModeSelector() {
  const { themeMode, setThemeMode } = useThemePreference();
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Appearance</Text>

      <SegmentedButtons
        value={themeMode}
        onValueChange={(value) => {
          if (value === 'light' || value === 'dark') {
            setThemeMode(value);
          }
        }}
        buttons={[
          {
            value: 'light',
            label: 'Light',
            icon: 'white-balance-sunny',
          },
          {
            value: 'dark',
            label: 'Dark',
            icon: 'weather-night',
          },
        ]}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },

    label: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
