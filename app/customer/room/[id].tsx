import React from 'react';
import {
  Image,
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

import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { useRoom } from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatMoney } from '@/src/lib/format';
import { ROOM_STATUS_LABELS } from '@/src/types/domain';

export default function RoomDetailsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = Number(id);

  const { data: room, isPending, isError, error, refetch } = useRoom(
    Number.isFinite(roomId) ? roomId : null,
  );

  if (isPending) {
    return <LoadingState label="Loading this room…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load this room."
      />
    );
  }

  const images = room.roomType.imageUrl
    ? [room.roomType.imageUrl]
    : [];

  const isBookable =
    room.status === 'AVAILABLE' || room.status === 'OCCUPIED';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hotel Branding */}
      <View style={styles.branding}>
        <Image
          source={require('../../../assets/images/royal-crest-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.hotelName}>
          Royal Crest Hotel
        </Text>
      </View>

      {/* Room Images */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {(images.length > 0 ? images : [null]).map((image, index) => (
          <View key={index}>
            <View style={styles.imageContainer}>
              <Text style={styles.imageNumber}>
                {index + 1} / {Math.max(1, images.length)}
              </Text>

              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.image,
                    {
                      backgroundColor:
                        colors.imagePlaceholder,
                    },
                  ]}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Room Information */}
      <View style={styles.content}>
        <Text style={styles.type}>
          {room.roomType.name}
        </Text>

        <Text style={styles.roomNumber}>
          Room {room.roomNumber} · Floor {room.floor}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatMoney(room.nightlyRate)}
          </Text>

          <Text style={styles.perNight}>
            / night
          </Text>
        </View>

        <View style={styles.capacity}>
          <Text style={styles.capacityText}>
            Suitable for {room.roomType.maxOccupancy} guests
          </Text>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.heading}>
          About this room
        </Text>

        <Text style={styles.description}>
          {room.description || room.roomType.description}
        </Text>

        {room.roomType.amenities.length > 0 ? (
          <>
            <Text style={styles.heading}>
              Amenities
            </Text>

            <View style={styles.amenities}>
              {room.roomType.amenities.map((amenity) => (
                <Chip
                  key={amenity}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </>
        ) : null}

        <Button
          mode="contained"
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
          disabled={!isBookable}
          onPress={() =>
            router.push(`/customer/booking/create?roomId=${room.id}`)
          }
        >
          {isBookable
            ? 'Book This Room'
            : `Unavailable — ${ROOM_STATUS_LABELS[room.status]}`}
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

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    /* Hotel Branding */
    branding: {
      backgroundColor: colors.surface,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 18,
    },

    logo: {
      width: 65,
      height: 65,
      borderRadius: 10,
      marginBottom: 8,
    },

    hotelName: {
      color: colors.textPrimary,
      fontSize: 21,
      fontWeight: '800',
      textAlign: 'center',
    },

    /* Room Images */
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
      top: 20,
      backgroundColor: colors.primary,
      color: colors.headerText,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
    },

    /* Room Content */
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

    capacityText: {
      color: colors.textPrimary,
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

    bookButton: {
      marginTop: 30,
      borderRadius: 10,
    },

    bookButtonContent: {
      height: 52,
    },
  });