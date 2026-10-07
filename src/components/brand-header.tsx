import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { config } from '@/src/lib/config';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

type BrandHeaderAction = {
  label: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

type BrandHeaderProps = {
  /** The section name under the hotel name, e.g. "Manage Rooms". */
  title: string;
  /** Third line: an item count ("13 rooms") or a short subtitle. */
  subtitle?: string;
  action?: BrandHeaderAction;
};

/**
 * The orange band at the top of every management and customer screen: logo,
 * hotel name, section title, a count, and one action. It is the Manage Rooms
 * header lifted out so every screen draws the same one.
 */
export function BrandHeader({ title, subtitle, action }: BrandHeaderProps) {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.branding}>
        <Image
          source={require('../../assets/images/royal-crest-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.text}>
          <Text style={styles.brandName} numberOfLines={1}>
            {config.hotelName}
          </Text>

          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {action ? (
        <Button
          mode="text"
          icon={action.icon}
          onPress={action.onPress}
          loading={action.loading}
          disabled={action.disabled}
          compact
          textColor={colors.brandBandAction}
          labelStyle={styles.actionLabel}
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}

/** "1 room" / "13 rooms". */
export function countLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.brandBand,
      paddingVertical: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    branding: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },

    logo: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: 12,
      backgroundColor: '#FFFFFF',
    },

    text: {
      flex: 1,
    },

    brandName: {
      color: colors.brandBandText,
      fontSize: 19,
      fontWeight: '800',
    },

    pageTitle: {
      color: colors.brandBandText,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },

    subtitle: {
      color: colors.brandBandText,
      opacity: 0.85,
      marginTop: 2,
      fontSize: 13,
    },

    actionLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
