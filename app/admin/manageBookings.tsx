import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function ManageBookingsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Bookings</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
});
