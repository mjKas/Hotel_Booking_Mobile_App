import { apiClient } from '../api/apiClient';

export type CreateBookingPayload = {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type Booking = {
  id: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
};

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>(
      '/bookings/my',
    );
  },

  async createBooking(
    payload: CreateBookingPayload,
  ): Promise<Booking> {
    return apiClient.post<Booking>(
      '/bookings',
      {
        room_id: payload.roomId,
        check_in: payload.checkIn,
        check_out: payload.checkOut,
        guests: payload.guests,
      },
    );
  },

  async cancelBooking(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/bookings/${id}`,
    );
  },
};