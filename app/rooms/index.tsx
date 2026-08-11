import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Searchbar,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

const rooms = [
  {
    id: '1',
    roomNumber: '101',
    type: 'Deluxe Room',
    price: 120,
    capacity: 2,
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
    description: 'Spacious room with modern facilities.',
  },
  {
    id: '2',
    roomNumber: '102',
    type: 'Standard Room',
    price: 90,
    capacity: 2,
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427',
    description: 'Comfortable room suitable for couples.',
  },
  {
    id: '3',
    roomNumber: '201',
    type: 'Family Suite',
    price: 220,
    capacity: 4,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    description: 'Large suite designed for families.',
  },
];

export default function RoomsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter((room) =>
    room.type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rooms</Text>
        <Text style={styles.subtitle}>
          Find your perfect room
        </Text>
      </View>

      <Searchbar
        placeholder="Search rooms"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Cover
              source={{ uri: item.image }}
              style={styles.image}
            />

            <Card.Content style={styles.cardContent}>
              <Text style={styles.roomType}>
                {item.type}
              </Text>

              <Text style={styles.roomNumber}>
                Room {item.roomNumber}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>

              <View style={styles.details}>
                <Text>{item.capacity} Guests</Text>

                <Text style={styles.price}>
                  ${item.price} / night
                </Text>
              </View>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained"
                onPress={() =>
                  router.push(`/rooms/${item.id}`)
                }
              >
                View Room
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },

  title: {
    color: colors.headerText,
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: colors.headerSubtle,
    marginTop: 4,
  },

  search: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    marginBottom: 18,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  image: {
    height: 210,
  },

  cardContent: {
    paddingTop: 14,
  },

  roomType: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  roomNumber: {
    marginTop: 3,
    color: colors.textSecondary,
  },

  description: {
    marginTop: 10,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    alignItems: 'center',
  },

  price: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 17,
  },

  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
