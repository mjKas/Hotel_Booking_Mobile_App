import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';

import { toErrorMessage } from '@/src/api/apiError';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import {
  useCreateRoom,
  useDeleteRoom,
  useRoomTypes,
  useRooms,
  useUpdateRoom,
} from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatMoney } from '@/src/lib/format';
import {
  ROOM_STATUS_LABELS,
  type Room,
  type RoomStatus,
} from '@/src/types/domain';

const STATUSES: RoomStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
];

export default function ManageRoomsScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const { height: screenHeight } = useWindowDimensions();

  const { data: rooms, isPending, isError, error, refetch } = useRooms();

  // A room must belong to an existing room type, so the picker below is
  // driven by what the hotel actually has configured.
  const roomTypes = useRoomTypes();

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [editingRoomId, setEditingRoomId] =
    useState<number | null>(null);

  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState<number | null>(null);
  const [floor, setFloor] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
    setRoomTypeId(roomTypes.data?.[0]?.id ?? null);
    setFloor('');
    setPrice('');
    setStatus('AVAILABLE');
    setDescription('');
    setFormError(null);

    setDialogVisible(true);
  };

  const openEditRoom = (room: Room) => {
    Keyboard.dismiss();

    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setRoomTypeId(room.roomTypeId);
    setFloor(String(room.floor));
    setPrice(String(room.nightlyRate));
    setStatus(room.status);
    setDescription(room.description);
    setFormError(null);

    setDialogVisible(true);
  };

  const closeDialog = () => {
    Keyboard.dismiss();
    setDialogVisible(false);
    setFormError(null);
  };

  const saveRoom = async () => {
    Keyboard.dismiss();
    setFormError(null);

    const nightlyRate = Number(price);
    const floorNumber = Number(floor);

    if (!roomNumber.trim()) {
      setFormError('Enter a room number.');
      return;
    }

    if (roomTypeId === null) {
      setFormError('Choose a room type.');
      return;
    }

    if (!Number.isFinite(nightlyRate) || nightlyRate <= 0) {
      setFormError('Enter a nightly rate above zero.');
      return;
    }

    if (!Number.isFinite(floorNumber) || floorNumber < 0) {
      setFormError('Enter a floor number.');
      return;
    }

    const payload = {
      roomNumber: roomNumber.trim(),
      floor: floorNumber,
      status,
      roomTypeId,
      nightlyRate,
      description: description.trim(),
    };

    try {
      if (editingRoomId !== null) {
        await updateRoom.mutateAsync({
          roomId: editingRoomId,
          payload,
        });
      } else {
        await createRoom.mutateAsync(payload);
      }

      setDialogVisible(false);
    } catch (err) {
      // A duplicate room number comes back as a 409.
      setFormError(
        toErrorMessage(err, 'We could not save this room.'),
      );
    }
  };

  const confirmDelete = (room: Room) => {
    Alert.alert(
      'Delete room',
      `Delete room ${room.roomNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteRoom.mutate(room.id, {
              onError: (err) =>
                Alert.alert(
                  'Could not delete',
                  // Rooms with booking history are refused with a 409.
                  toErrorMessage(
                    err,
                    'We could not delete this room.',
                  ),
                ),
            }),
        },
      ],
    );
  };

  const dialogMaxHeight = keyboardVisible
    ? screenHeight * 0.48
    : screenHeight * 0.70;

  if (isPending) {
    return <LoadingState label="Loading rooms…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load the rooms."
      />
    );
  }

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
        refreshing={false}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          <EmptyState
            title="No rooms yet"
            description="Add the first room to get started."
            actionLabel="Add a room"
            onAction={openAddRoom}
          />
        }
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>

              <View style={styles.roomHeader}>

                <View style={styles.roomNumber}>
                  <Text style={styles.number}>
                    {item.roomNumber}
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
                  {ROOM_STATUS_LABELS[item.status]}
                </Chip>

              </View>

              <Text style={styles.roomType}>
                {item.roomType.name}
              </Text>

              <View style={styles.details}>
                <Text
                  style={{
                    color: colors.textPrimary,
                  }}
                >
                  {item.roomType.maxOccupancy} Guests · Floor{' '}
                  {item.floor}
                </Text>

                <Text style={styles.price}>
                  {formatMoney(item.nightlyRate)} / night
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
                    confirmDelete(item)
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
                {editingRoomId !== null
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
                returnKeyType="next"
                style={styles.dialogInput}
              />

              <Text style={styles.fieldLabel}>Room Type</Text>

              <View style={styles.chipRow}>
                {(roomTypes.data ?? []).map((type) => (
                  <Chip
                    key={type.id}
                    selected={roomTypeId === type.id}
                    showSelectedCheck={false}
                    onPress={() => setRoomTypeId(type.id)}
                    style={[
                      styles.pickerChip,
                      roomTypeId === type.id && {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    {type.name}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Floor"
                mode="outlined"
                value={floor}
                onChangeText={setFloor}
                keyboardType="number-pad"
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

              <Text style={styles.fieldLabel}>Status</Text>

              <View style={styles.chipRow}>
                {STATUSES.map((option) => (
                  <Chip
                    key={option}
                    selected={status === option}
                    showSelectedCheck={false}
                    onPress={() => setStatus(option)}
                    style={[
                      styles.pickerChip,
                      status === option && {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    {ROOM_STATUS_LABELS[option]}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Description"
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={600}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={styles.dialogInput}
              />

              {formError && (
                <HelperText type="error" visible>
                  {formError}
                </HelperText>
              )}

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
                loading={createRoom.isPending || updateRoom.isPending}
                disabled={createRoom.isPending || updateRoom.isPending}
                textColor={colors.secondary}
                style={styles.formActionButton}
              >
                {editingRoomId !== null
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
      // MAINTENANCE and OUT_OF_SERVICE both read as unavailable.
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
      ...StyleSheet.absoluteFill,
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

    fieldLabel: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginTop: 4,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },

    pickerChip: {
      backgroundColor: colors.surfaceVariant,
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