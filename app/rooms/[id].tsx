import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Text,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

const room = {
  id: '1',
  roomNumber: '101',
  type: 'Deluxe Room',
  price: 120,
  capacity: 2,
  description:
    'Enjoy a comfortable and relaxing stay in our beautifully designed Deluxe Room. The room combines modern facilities with a warm and welcoming atmosphere.',
  images: [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427',
  ],
  amenities: [
    'Free WiFi',
    'Air Conditioning',
    'Smart TV',
    'Private Bathroom',
    'Mini Bar',
    'Room Service',
  ],
};

export default function RoomDetailsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  useLocalSearchParams();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {room.images.map((image, index) => (
          <View key={index}>
            <View style={styles.imageContainer}>
              <Text style={styles.imageNumber}>
                {index + 1} / {room.images.length}
              </Text>

              <View
                style={[
                  styles.image,
                  { backgroundColor: colors.imagePlaceholder },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.type}>{room.type}</Text>

        <Text style={styles.roomNumber}>
          Room {room.roomNumber}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${room.price}
          </Text>

          <Text style={styles.perNight}>
            / night
          </Text>
        </View>

        <View style={styles.capacity}>
          <Text style={styles.capacityText}>
            Suitable for {room.capacity} guests
          </Text>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.heading}>
          About this room
        </Text>

        <Text style={styles.description}>
          {room.description}
        </Text>

        <Text style={styles.heading}>
          Amenities
        </Text>

        <View style={styles.amenities}>
          {room.amenities.map((amenity) => (
            <Chip
              key={amenity}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {amenity}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
          onPress={() =>
            router.push('/bookings/create')
          }
        >
          Book This Room
        </Button>
        <Button
         mode="text"
        icon="arrow-left"
        onPress={() => router.back()}
        >
        Back
        </Button>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  imageContainer: {
    width: 390,
    height: 280,
    position: 'relative',
  },

  image: {
    flex: 1,
  },

  imageNumber: {
    position: 'absolute',
    zIndex: 2,
    right: 15,
    top: 50,
    backgroundColor: colors.primary,
    color: colors.headerText,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },

  content: {
    padding: 20,
  },

  type: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  roomNumber: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 15,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 18,
  },

  price: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  perNight: {
    marginLeft: 5,
    color: colors.textSecondary,
  },

  capacity: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
  },

  divider: {
    marginVertical: 22,
  },

  heading: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },

  description: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 22,
  },

  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    backgroundColor: colors.surfaceVariant,
  },

  chipText: {
    color: colors.textPrimary,
  },

  capacityText: {
    color: colors.textPrimary,
  },

  bookButton: {
    marginTop: 30,
    borderRadius: 10,
  },

  bookButtonContent: {
    height: 52,
  },
});
