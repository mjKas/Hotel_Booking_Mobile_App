import { apiClient } from '../api/apiClient';
import type {
  AvailabilityQuery,
  AvailabilityResult,
  Room,
  RoomType,
  RoomWritePayload,
} from '../types/domain';
import {
  mapAvailability,
  mapRoom,
  mapRoomType,
  type WireAvailability,
  type WireRoom,
  type WireRoomType,
} from './mappers';

/**
 * Collection routes keep their trailing slash on purpose: FastAPI 307-redirects
 * the bare form, and React Native's fetch does not replay a POST body across a
 * redirect.
 */
export const roomService = {
  async listRooms(): Promise<Room[]> {
    const wire = await apiClient.get<WireRoom[]>('/rooms/');
    return wire.map(mapRoom);
  },

  async listBookableRooms(): Promise<Room[]> {
    const wire = await apiClient.get<WireRoom[]>('/rooms/available');
    return wire.map(mapRoom);
  },

  async getRoom(roomId: number): Promise<Room> {
    return mapRoom(
      await apiClient.get<WireRoom>(`/rooms/${roomId}`),
    );
  },

  /** Price for one room over a specific stay, computed server-side. */
  async quote(
    roomId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<AvailabilityResult> {
    return mapAvailability(
      await apiClient.get<WireAvailability>(
        `/rooms/${roomId}/quote`,
        { query: { check_in: checkIn, check_out: checkOut } },
      ),
    );
  },

  /** Rooms that are free for the whole stay and large enough for the party. */
  async searchAvailability(
    query: AvailabilityQuery,
  ): Promise<AvailabilityResult[]> {
    const wire = await apiClient.get<WireAvailability[]>(
      '/availability',
      {
        query: {
          check_in: query.checkIn,
          check_out: query.checkOut,
          guests: query.guests,
          room_type_id: query.roomTypeId ?? undefined,
          max_nightly_rate: query.maxNightlyRate ?? undefined,
        },
      },
    );

    return wire.map(mapAvailability);
  },

  async listRoomTypes(): Promise<RoomType[]> {
    const wire = await apiClient.get<WireRoomType[]>('/room-types/');
    return wire.map(mapRoomType);
  },

  /* -------------------------------------------------------------- admin */

  async createRoom(payload: RoomWritePayload): Promise<Room> {
    return mapRoom(
      await apiClient.post<WireRoom>('/rooms/', toWire(payload)),
    );
  },

  async updateRoom(
    roomId: number,
    payload: RoomWritePayload,
  ): Promise<Room> {
    return mapRoom(
      await apiClient.put<WireRoom>(`/rooms/${roomId}`, toWire(payload)),
    );
  },

  async deleteRoom(roomId: number): Promise<void> {
    await apiClient.delete(`/rooms/${roomId}`);
  },
};

function toWire(payload: RoomWritePayload) {
  return {
    room_number: payload.roomNumber,
    floor: payload.floor,
    status: payload.status,
    room_type_id: payload.roomTypeId,
    nightly_rate: payload.nightlyRate,
    description: payload.description,
  };
}
