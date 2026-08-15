import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { router } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

export default function CustomerHomeScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

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
              Welcome back!
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
        source={{
          uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        }}
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
          <View style={styles.dateBox}>
            <Text style={styles.label}>
              CHECK-IN
            </Text>

            <Text style={styles.value}>
              08 Aug 2026
            </Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.label}>
              CHECK-OUT
            </Text>

            <Text style={styles.value}>
              10 Aug 2026
            </Text>
          </View>
        </View>

        <View style={styles.guestBox}>
          <Text style={styles.label}>
            GUESTS
          </Text>

          <Text style={styles.value}>
            2 Guests
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push('/rooms')}
          style={styles.searchButton}
          contentStyle={styles.buttonContent}
        >
          Search Rooms
        </Button>
      </Surface>

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
          source={{
            uri: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
          }}
          style={styles.featuredImage}
        />

        <View style={styles.featuredContent}>
          <Text style={styles.roomTitle}>
            Deluxe Room
          </Text>

          <Text style={styles.roomDescription}>
            Spacious room with modern facilities and a comfortable
            atmosphere.
          </Text>

          <View style={styles.roomBottom}>
            <Text style={styles.price}>
              $120 / night
            </Text>

            <Button
              mode="contained"
              compact
              onPress={() => router.push('/rooms/1')}
            >
              View
            </Button>
          </View>
        </View>
      </Surface>
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