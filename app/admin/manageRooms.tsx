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
  const [rooms, setRooms] = useState(initialRooms);
  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  const openAddRoom = () => {
    setRoomNumber('');
    setRoomType('');
    setPrice('');
    setCapacity('');
    setDialogVisible(true);
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      number: roomNumber,
      type: roomType,
      price: Number(price),
      capacity: Number(capacity),
      status: 'AVAILABLE',
    };

    setRooms((current) => [...current, newRoom]);
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
                    style={getStatusStyle(item.status)}
                    textStyle={getStatusTextStyle(
                      item.status,
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
                    onPress={() => {}}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>

                  <Button
                    mode="outlined"
                    textColor="#D32F2F"
                    onPress={() =>
                      deleteRoom(item.id)
                    }
                    style={styles.actionButton}
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
            Add New Room
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
            >
              Cancel
            </Button>

            <Button onPress={addRoom}>
              Add Room
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function getStatusStyle(
  status: Room['status'],
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    backgroundColor: '#082A55',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: '#DCE5F0',
    marginTop: 3,
  },

  list: {
    padding: 16,
    paddingBottom: 35,
  },

  card: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EAF0F7',
  },

  number: {
    fontSize: 19,
    fontWeight: '800',
    color: '#082A55',
  },

  roomLabel: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '700',
  },

  roomType: {
    fontSize: 19,
    fontWeight: '700',
    color: '#082A55',
    marginTop: 14,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  price: {
    color: '#082A55',
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

  available: {
    backgroundColor: '#E8F5E9',
  },

  availableText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '800',
  },

  occupied: {
    backgroundColor: '#E3F2FD',
  },

  occupiedText: {
    color: '#1976D2',
    fontSize: 10,
    fontWeight: '800',
  },

  maintenance: {
    backgroundColor: '#FFEBEE',
  },

  maintenanceText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '800',
  },

  dialogInput: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
});