import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Button,
  Card,
  Chip,
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

  const { height: screenHeight } = useWindowDimensions();

  const [rooms, setRooms] = useState(initialRooms);

  const [editingRoomId, setEditingRoomId] =
    useState<string | null>(null);

  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios'
        ? 'keyboardWillShow'
        : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios'
        ? 'keyboardWillHide'
        : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const openAddRoom = () => {
    Keyboard.dismiss();

    setEditingRoomId(null);
    setRoomNumber('');
    setRoomType('');
    setPrice('');
    setCapacity('');

    setDialogVisible(true);
  };

  const openEditRoom = (room: Room) => {
    Keyboard.dismiss();

    setEditingRoomId(room.id);
    setRoomNumber(room.number);
    setRoomType(room.type);
    setPrice(String(room.price));
    setCapacity(String(room.capacity));

    setDialogVisible(true);
  };

  const closeDialog = () => {
    Keyboard.dismiss();
    setDialogVisible(false);
  };

  const saveRoom = () => {
    Keyboard.dismiss();

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
    } else {
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
    }

    setDialogVisible(false);
  };

  const deleteRoom = (id: string) => {
    setRooms((current) =>
      current.filter((room) => room.id !== id),
    );
  };

  const dialogMaxHeight = keyboardVisible
    ? screenHeight * 0.48
    : screenHeight * 0.70;

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.branding}>

          <Image
            source={require('../../assets/images/royal-crest-logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <Text style={styles.brandName}>
              Royal Crest Hotel
            </Text>

            <Text style={styles.pageTitle}>
              Manage Rooms
            </Text>

            <Text style={styles.subtitle}>
              {rooms.length} rooms
            </Text>
          </View>

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

      {/* ROOM LIST */}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
                  style={getStatusStyle(
                    item.status,
                    styles,
                  )}
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
                <Text
                  style={{
                    color: colors.textPrimary,
                  }}
                >
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
                  onPress={() =>
                    openEditRoom(item)
                  }
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

      {/* ADD / EDIT MODAL */}

      <Modal
        visible={dialogVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
        >

          <Pressable
            style={styles.modalBackdrop}
            onPress={closeDialog}
          />

          <View
            style={[
              styles.formCard,
              {
                maxHeight: dialogMaxHeight,
              },
            ]}
          >

            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingRoomId
                  ? 'Edit Room'
                  : 'Add New Room'}
              </Text>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >

              <TextInput
                label="Room Number"
                mode="outlined"
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="number-pad"
                returnKeyType="next"
                style={styles.dialogInput}
              />

              <TextInput
                label="Room Type"
                mode="outlined"
                value={roomType}
                onChangeText={setRoomType}
                returnKeyType="next"
                style={styles.dialogInput}
              />

              <TextInput
                label="Price per Night"
                mode="outlined"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="next"
                style={styles.dialogInput}
              />

              <TextInput
                label="Capacity"
                mode="outlined"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={styles.dialogInput}
              />

            </ScrollView>

            <View style={styles.formActions}>

              <Button
                mode="text"
                onPress={closeDialog}
                textColor={colors.textPrimary}
                style={styles.formActionButton}
              >
                Cancel
              </Button>

              <Button
                mode="text"
                onPress={saveRoom}
                textColor={colors.secondary}
                style={styles.formActionButton}
              >
                {editingRoomId
                  ? 'Save Room'
                  : 'Add Room'}
              </Button>

            </View>

          </View>

        </KeyboardAvoidingView>
      </Modal>

    </View>
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

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({

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
      backgroundColor: colors.surface,
    },

    brandName: {
      color: colors.headerText,
      fontSize: 19,
      fontWeight: '800',
    },

    pageTitle: {
      color: colors.headerText,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },

    subtitle: {
      color: colors.headerSubtle,
      marginTop: 2,
      fontSize: 13,
    },

    list: {
      padding: 16,
      paddingBottom: 40,
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
      width: 58,
      height: 58,
      alignItems: 'center',
      justifyContent: 'center',
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
      alignItems: 'center',
      marginTop: 10,
    },

    price: {
      color: colors.textPrimary,
      fontWeight: '700',
    },

    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15,
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

    modalRoot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    formCard: {
      width: '90%',
      maxWidth: 420,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.25,
      shadowRadius: 15,
    },

    formHeader: {
      paddingHorizontal: 24,
      paddingTop: 22,
      paddingBottom: 14,
    },

    formTitle: {
      fontSize: 29,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    formScroll: {
      flexGrow: 0,
    },

    formContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },

    dialogInput: {
      marginBottom: 13,
      backgroundColor: colors.surface,
    },

    formActions: {
      minHeight: 64,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },

    formActionButton: {
      marginLeft: 4,
    },
  });