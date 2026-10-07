import React, { useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';

import { ApiError, toErrorMessage } from '@/src/api/apiError';
import { BrandHeader, countLabel } from '@/src/components/brand-header';
import { FormModal, useFormInputProps } from '@/src/components/form-modal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import { StatusBadge, type BadgeTone } from '@/src/components/status-badge';
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
  const inputProps = useFormInputProps();

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

  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState<number | null>(null);
  const [floor, setFloor] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
    setDialogVisible(false);
    setFormError(null);
  };

  const saveRoom = async () => {
    setFormError(null);

    const nightlyRate = Number(price);
    const floorNumber = Number(floor);

    // These mirror RoomWriteRequest on the API, so a form that passes here is
    // not bounced with a 422 after the round trip.
    if (!roomNumber.trim() || roomNumber.trim().length > 10) {
      setFormError('Enter a room number of up to 10 characters.');
      return;
    }

    if (roomTypeId === null) {
      setFormError('Choose a room type.');
      return;
    }

    if (
      !Number.isFinite(nightlyRate) ||
      nightlyRate <= 0 ||
      nightlyRate > 10000
    ) {
      setFormError('Enter a nightly rate between 0 and 10,000.');
      return;
    }

    if (
      !floor.trim() ||
      !Number.isInteger(floorNumber) ||
      floorNumber < 0 ||
      floorNumber > 50
    ) {
      setFormError('Enter a floor number between 0 and 50.');
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

      Alert.alert(
        editingRoomId !== null ? 'Room updated' : 'Room added',
        `Room ${payload.roomNumber} has been saved.`,
      );
    } catch (err) {
      // A duplicate room number comes back as a 409 with a field error. A 500
      // on create is a server fault - see docs/BACKEND_ISSUES.md.
      setFormError(
        err instanceof ApiError && err.fieldErrors?.roomNumber
          ? err.fieldErrors.roomNumber
          : toErrorMessage(err, 'We could not save this room.'),
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
              onSuccess: () =>
                Alert.alert(
                  'Room deleted',
                  `Room ${room.roomNumber} has been removed.`,
                ),
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

  const saving = createRoom.isPending || updateRoom.isPending;

  return (
    <View style={styles.container}>

      <BrandHeader
        title="Manage Rooms"
        subtitle={countLabel(rooms.length, 'room')}
        action={{ label: 'Add', icon: 'plus', onPress: openAddRoom }}
      />

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

                <StatusBadge
                  label={ROOM_STATUS_LABELS[item.status]}
                  tone={roomTone(item.status)}
                />

              </View>

              <Text style={styles.roomType}>
                {item.roomType.name}
              </Text>

              <View style={styles.details}>
                <Text style={styles.capacity}>
                  {item.roomType.maxOccupancy} Guests · Floor {item.floor}
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
                  contentStyle={styles.actionContent}
                >
                  Edit
                </Button>

                <Button
                  mode="outlined"
                  textColor={colors.error}
                  onPress={() =>
                    confirmDelete(item)
                  }
                  disabled={deleteRoom.isPending}
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                  contentStyle={styles.actionContent}
                >
                  Delete
                </Button>

              </View>

            </Card.Content>
          </Card>
        )}
      />

      {/* ADD / EDIT MODAL */}

      <FormModal
        visible={dialogVisible}
        title={editingRoomId !== null ? 'Edit Room' : 'Add New Room'}
        onClose={closeDialog}
        onSubmit={saveRoom}
        submitLabel={editingRoomId !== null ? 'Save Room' : 'Add Room'}
        submitting={saving}
        error={formError}
      >
        <TextInput
          {...inputProps}
          label="Room Number"
          value={roomNumber}
          onChangeText={setRoomNumber}
          maxLength={10}
          autoCapitalize="characters"
          returnKeyType="next"
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
          {...inputProps}
          label="Floor"
          value={floor}
          onChangeText={setFloor}
          keyboardType="number-pad"
          returnKeyType="next"
        />

        <TextInput
          {...inputProps}
          label="Price per Night"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          returnKeyType="next"
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
          {...inputProps}
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={600}
        />
      </FormModal>

    </View>
  );
}

function roomTone(status: RoomStatus): BadgeTone {
  switch (status) {
    case 'AVAILABLE':
      return 'success';

    case 'OCCUPIED':
      return 'info';

    default:
      // MAINTENANCE and OUT_OF_SERVICE both read as unavailable.
      return 'error';
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

    capacity: {
      color: colors.textPrimary,
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
      borderWidth: 1.5,
    },

    actionContent: {
      height: 44,
    },

    editButton: {
      borderColor: colors.secondary,
    },

    deleteButton: {
      borderColor: colors.error,
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
      backgroundColor: colors.background,
    },
  });
