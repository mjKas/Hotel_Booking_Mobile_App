import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { router } from 'expo-router';

export default function CustomerHomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>GrandStay</Text>
          <Text style={styles.welcome}>Welcome back!</Text>
        </View>

        <Button
          mode="text"
          textColor="#082A55"
          onPress={() => router.push('/customer/tabs/profile')}
        >
          Profile
        </Button>
      </View>

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        }}
        style={styles.heroImage}
      />

      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>Your perfect stay awaits</Text>
        <Text style={styles.heroSubtitle}>
          Comfortable rooms and exceptional hospitality.
        </Text>
      </View>

      <Surface style={styles.searchCard} elevation={3}>
        <Text style={styles.sectionTitle}>Find your room</Text>

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.label}>CHECK-IN</Text>
            <Text style={styles.value}>08 Aug 2026</Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.label}>CHECK-OUT</Text>
            <Text style={styles.value}>10 Aug 2026</Text>
          </View>
        </View>

        <View style={styles.guestBox}>
          <Text style={styles.label}>GUESTS</Text>
          <Text style={styles.value}>2 Guests</Text>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Rooms</Text>

        <Button
          mode="text"
          textColor="#FCA311"
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
          <Text style={styles.roomTitle}>Deluxe Room</Text>
          <Text style={styles.roomDescription}>
            Spacious room with modern facilities and a comfortable atmosphere.
          </Text>

          <View style={styles.roomBottom}>
            <Text style={styles.price}>$120 / night</Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brand: {
    fontSize: 25,
    fontWeight: '800',
    color: '#082A55',
  },

  welcome: {
    marginTop: 3,
    color: '#6B7280',
  },

  heroImage: {
    width: '100%',
    height: 230,
  },

  heroOverlay: {
    backgroundColor: '#082A55',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
  },

  heroSubtitle: {
    color: '#E5E5E5',
    marginTop: 5,
    fontSize: 14,
  },

  searchCard: {
    margin: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#082A55',
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  dateBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 12,
  },

  guestBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },

  label: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },

  value: {
    fontSize: 15,
    color: '#082A55',
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
    backgroundColor: '#FFFFFF',
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
    color: '#082A55',
  },

  roomDescription: {
    color: '#6B7280',
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
    color: '#082A55',
  },
});