import { apiClient } from '../api/apiClient';

export type Room = {
  id: number;
  roomNumber: string;
  roomType: string;
  price: number;
  capacity: number;
  available: boolean;
};

export const roomService = {
  async getAvailableRooms(
    checkIn: string,
    checkOut: string,
  ): Promise<Room[]> {
    return apiClient.get<Room[]>(
      '/rooms/available',
      {
        // We'll adjust this once we confirm
        // your actual FastAPI endpoint.
      },
    );
  },

  async getRoom(id: number): Promise<Room> {
    return apiClient.get<Room>(
      `/rooms/${id}`,
    );
  },
};