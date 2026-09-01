import { apiClient } from '../api/apiClient';
import type {
  Booking,
  BookingFilters,
  CreateBookingPayload,
  UpdateBookingPayload,
} from '../types/domain';
import { mapBooking, type WireBooking } from './mappers';

export const bookingService = {
  /**
   * The server scopes this to the caller's own bookings unless they are an
   * administrator, so there is one endpoint for both the customer list and the
   * admin console. Pass `status: 'ALL'` to switch the status filter off.
   */
  async listBookings(
    filters: BookingFilters = {},
  ): Promise<Booking[]> {
    const wire = await apiClient.get<WireBooking[]>('/bookings/', {
      query: {
        status: filters.status,
        search: filters.search,
        from: filters.from,
        to: filters.to,
      },
    });

    return wire.map(mapBooking);
  },

  async getBooking(bookingId: number): Promise<Booking> {
    return mapBooking(
      await apiClient.get<WireBooking>(`/bookings/${bookingId}`),
    );
  },

  async createBooking(
    payload: CreateBookingPayload,
  ): Promise<Booking> {
    return mapBooking(
      await apiClient.post<WireBooking>('/bookings/', {
        room_id: payload.roomId,
        check_in: payload.checkIn,
        check_out: payload.checkOut,
        guests: payload.guests,
        special_requests: payload.specialRequests || null,
      }),
    );
  },

  async updateBooking(
    bookingId: number,
    payload: UpdateBookingPayload,
  ): Promise<Booking> {
    return mapBooking(
      await apiClient.patch<WireBooking>(`/bookings/${bookingId}`, {
        check_in: payload.checkIn,
        check_out: payload.checkOut,
        guests: payload.guests,
        status: payload.status,
        special_requests: payload.specialRequests,
      }),
    );
  },

  /**
   * A soft cancel: the booking is kept with status CANCELLED and returned, so
   * this resolves with the updated record rather than void.
   */
  async cancelBooking(bookingId: number): Promise<Booking> {
    return mapBooking(
      await apiClient.delete<WireBooking>(`/bookings/${bookingId}`),
    );
  },
};
