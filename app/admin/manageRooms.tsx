import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

const initialRooms: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'Deluxe Room',
    price: 120,
    capacity: 2,
    status: 'AVAILABLE',
  },
  {
    id: '2',
    number: '102',
    type: 'Standard Room',
    price: 90,
    capacity: 2,
    status: 'OCCUPIED',
  },
  {
    id: '3',
    number: '201',
    type: 'Family Suite',
    price: 220,
    capacity: 4,
    status: 'AVAILABLE',
  },
  {
    id: '4',
    number: '301',
    type: 'Premium Suite',
    price: 280,
    capacity: 4,
    status: 'MAINTENANCE',
  },
];

export default function ManageRoomsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const [rooms, setRooms] = useState(initialRooms);
  const [editingRoomId, setEditingRoomId] =
    useState<string | null>(null);
  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  const openAddRoom = () => {
    setEditingRoomId(null);
    setRoomNumber('');
    setRoomType('');
    setPrice('');
    setCapacity('');
    setDialogVisible(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.number);
    setRoomType(room.type);
    setPrice(String(room.price));
    setCapacity(String(room.capacity));
    setDialogVisible(true);
  };

  const saveRoom = () => {
    if (editingRoomId) {
      setRooms((current) =>
        current.map((room) =>
          room.id === editingRoomId
            ? {
                ...room,
                number: roomNumber,
                type: roomType,
                price: Number(price),
                capacity: Number(capacity),
              }
            : room,
        ),
      );
      setDialogVisible(false);
      return;
    }

    setRooms((current) => [
      ...current,
      {
        id: Date.now().toString(),
        number: roomNumber,
        type: roomType,
        price: Number(price),
        capacity: Number(capacity),
        status: 'AVAILABLE',
      },
    ]);
    setDialogVisible(false);
  };

  const deleteRoom = (id: string) => {
    setRooms((current) =>
      current.filter((room) => room.id !== id),
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Manage Rooms
            </Text>

            <Text style={styles.subtitle}>
              {rooms.length} rooms
            </Text>
          </View>

          <Button
            mode="contained"
            icon="plus"
            onPress={openAddRoom}
            compact
            buttonColor={colors.secondary}
            textColor="#000000"
          >
            Add
          </Button>
        </View>

        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.roomHeader}>
                  <View style={styles.roomNumber}>
                    <Text style={styles.number}>
                      {item.number}
                    </Text>

                    <Text style={styles.roomLabel}>
                      ROOM
                    </Text>
                  </View>

                  <Chip
                    compact
                    style={getStatusStyle(item.status, styles)}
                    textStyle={getStatusTextStyle(
                      item.status,
                      styles,
                    )}
                  >
                    {item.status}
                  </Chip>
                </View>

                <Text style={styles.roomType}>
                  {item.type}
                </Text>

                <View style={styles.details}>
                  <Text>
                    {item.capacity} Guests
                  </Text>

                  <Text style={styles.price}>
                    ${item.price} / night
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    textColor={colors.secondary}
                    onPress={() => openEditRoom(item)}
                    style={[
                      styles.actionButton,
                      styles.editButton,
                    ]}
                  >
                    Edit
                  </Button>

                  <Button
                    mode="outlined"
                    textColor={colors.error}
                    onPress={() =>
                      deleteRoom(item.id)
                    }
                    style={[
                      styles.actionButton,
                      styles.deleteButton,
                    ]}
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        />
      </View>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>
            {editingRoomId ? 'Edit Room' : 'Add New Room'}
          </Dialog.Title>

          <Dialog.Content>
            <TextInput
              label="Room Number"
              mode="outlined"
              value={roomNumber}
              onChangeText={setRoomNumber}
              style={styles.dialogInput}
            />

            <TextInput
              label="Room Type"
              mode="outlined"
              value={roomType}
              onChangeText={setRoomType}
              style={styles.dialogInput}
            />

            <TextInput
              label="Price per Night"
              mode="outlined"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.dialogInput}
            />

            <TextInput
              label="Capacity"
              mode="outlined"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setDialogVisible(false)
              }
              textColor={colors.textPrimary}
            >
              Cancel
            </Button>

            <Button
              onPress={saveRoom}
              textColor={colors.secondary}
            >
              {editingRoomId ? 'Save Room' : 'Add Room'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function getStatusStyle(
  status: Room['status'],
  styles: ReturnType<typeof createStyles>,
) {
  switch (status) {
    case 'AVAILABLE':
      return styles.available;

    case 'OCCUPIED':
      return styles.occupied;

    default:
      return styles.maintenance;
  }
}

function getStatusTextStyle(
  status: Room['status'],
  styles: ReturnType<typeof createStyles>,
) {
  switch (status) {
    case 'AVAILABLE':
      return styles.availableText;

    case 'OCCUPIED':
      return styles.occupiedText;

    default:
      return styles.maintenanceText;
  }
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: colors.headerText,
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: colors.headerSubtle,
    marginTop: 3,
  },

  list: {
    padding: 16,
    paddingBottom: 35,
  },

  card: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },

  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  roomNumber: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },

  number: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  roomLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  roomType: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 14,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  price: {
    color: colors.textPrimary,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },

  actionButton: {
    flex: 1,
    borderRadius: 8,
  },

  editButton: {
    borderColor: colors.secondary,
  },

  deleteButton: {
    borderColor: colors.error,
  },

  available: {
    backgroundColor: colors.successSurface,
  },

  availableText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },

  occupied: {
    backgroundColor: colors.infoSurface,
  },

  occupiedText: {
    color: colors.info,
    fontSize: 10,
    fontWeight: '800',
  },

  maintenance: {
    backgroundColor: colors.errorSurface,
  },

  maintenanceText: {
    color: colors.error,
    fontSize: 10,
    fontWeight: '800',
  },

  dialogInput: {
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
});
