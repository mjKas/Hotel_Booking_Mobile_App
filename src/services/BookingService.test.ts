import { apiClient } from '../api/apiClient';
import { bookingService } from './BookingService';
import type { WireBooking, WireRoom, WireRoomType } from './mappers';

jest.mock('../api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const wireRoomType: WireRoomType = {
  id: 2,
  name: 'Deluxe King',
  description: 'A deluxe room overlooking the courtyard.',
  max_occupancy: 3,
  base_rate: 189,
  amenities: ['Wi-Fi', 'Bathtub'],
  image_url: 'https://example.test/deluxe.jpg',
};

const wireRoom: WireRoom = {
  id: 7,
  room_number: '204',
  floor: 2,
  status: 'AVAILABLE',
  room_type_id: 2,
  room_type: wireRoomType,
  nightly_rate: 199,
  description: 'Courtyard room',
};

const wireBooking: WireBooking = {
  id: 31,
  reference: 'RC-0031',
  user_id: 7,
  guest_name: 'Ella Hart',
  guest_email: 'ella.hart@example.test',
  room_id: 7,
  room: wireRoom,
  check_in: '2026-09-01',
  check_out: '2026-09-04',
  guests: 2,
  nights: 3,
  nightly_rate: 199,
  subtotal: 597,
  taxes: 71.64,
  total_price: 668.64,
  currency: 'GBP',
  status: 'CONFIRMED',
  special_requests: 'High floor please',
  created_at: '2026-08-22T10:00:00Z',
  updated_at: '2026-08-22T10:05:00Z',
};

describe('bookingService.listBookings', () => {
  it('requests the bookings collection with its trailing slash', async () => {
    // FastAPI 307-redirects the bare form, so the trailing slash must stay.
    mockedApiClient.get.mockResolvedValue([wireBooking]);

    await bookingService.listBookings();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/bookings/', {
      query: {
        status: undefined,
        search: undefined,
        from: undefined,
        to: undefined,
      },
    });
  });

  it('passes the ALL status through untouched so the caller can switch the filter off', async () => {
    // 'ALL' is a real filter value, not a sentinel to be stripped out.
    mockedApiClient.get.mockResolvedValue([wireBooking]);

    await bookingService.listBookings({ status: 'ALL' });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/bookings/', {
      query: {
        status: 'ALL',
        search: undefined,
        from: undefined,
        to: undefined,
      },
    });
  });

  it('combines the status, search and date range filters into one query', async () => {
    mockedApiClient.get.mockResolvedValue([wireBooking]);

    await bookingService.listBookings({
      status: 'CONFIRMED',
      search: 'Ella',
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/bookings/', {
      query: {
        status: 'CONFIRMED',
        search: 'Ella',
        from: '2026-09-01',
        to: '2026-09-30',
      },
    });
  });

  it('maps every returned booking into the camelCase domain shape', async () => {
    mockedApiClient.get.mockResolvedValue([wireBooking]);

    const bookings = await bookingService.listBookings();

    expect(bookings).toEqual([
      {
        id: 31,
        reference: 'RC-0031',
        userId: 7,
        guestName: 'Ella Hart',
        guestEmail: 'ella.hart@example.test',
        roomId: 7,
        room: expect.objectContaining({ id: 7, roomNumber: '204' }),
        checkIn: '2026-09-01',
        checkOut: '2026-09-04',
        guests: 2,
        nights: 3,
        nightlyRate: 199,
        subtotal: 597,
        taxes: 71.64,
        totalPrice: 668.64,
        currency: 'GBP',
        status: 'CONFIRMED',
        specialRequests: 'High floor please',
        createdAt: '2026-08-22T10:00:00Z',
        updatedAt: '2026-08-22T10:05:00Z',
      },
    ]);
  });
});

describe('bookingService.getBooking', () => {
  it('requests a single booking by id without a trailing slash', async () => {
    mockedApiClient.get.mockResolvedValue(wireBooking);

    await bookingService.getBooking(31);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/bookings/31');
  });

  it('maps the returned booking into the domain shape', async () => {
    mockedApiClient.get.mockResolvedValue(wireBooking);

    const booking = await bookingService.getBooking(31);

    expect(booking.reference).toBe('RC-0031');
  });
});

describe('bookingService.createBooking', () => {
  it('posts to the bookings collection with its trailing slash and the snake_case payload', async () => {
    mockedApiClient.post.mockResolvedValue(wireBooking);

    await bookingService.createBooking({
      roomId: 7,
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
      specialRequests: 'High floor please',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/bookings/', {
      room_id: 7,
      check_in: '2026-09-01',
      check_out: '2026-09-04',
      guests: 2,
      special_requests: 'High floor please',
    });
  });

  it('converts a missing specialRequests into null rather than sending undefined', async () => {
    mockedApiClient.post.mockResolvedValue(wireBooking);

    await bookingService.createBooking({
      roomId: 7,
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/bookings/',
      expect.objectContaining({ special_requests: null }),
    );
  });

  it('converts an empty specialRequests string into null', async () => {
    mockedApiClient.post.mockResolvedValue(wireBooking);

    await bookingService.createBooking({
      roomId: 7,
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
      specialRequests: '',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/bookings/',
      expect.objectContaining({ special_requests: null }),
    );
  });

  it('maps the created booking response into the domain shape', async () => {
    mockedApiClient.post.mockResolvedValue(wireBooking);

    const booking = await bookingService.createBooking({
      roomId: 7,
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
    });

    expect(booking.id).toBe(31);
    expect(booking.room.roomNumber).toBe('204');
  });
});

describe('bookingService.updateBooking', () => {
  it('patches the single booking endpoint without a trailing slash', async () => {
    mockedApiClient.patch.mockResolvedValue(wireBooking);

    await bookingService.updateBooking(31, {
      checkIn: '2026-09-02',
      checkOut: '2026-09-05',
      guests: 3,
      status: 'CONFIRMED',
      specialRequests: 'Late check-in',
    });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/bookings/31', {
      check_in: '2026-09-02',
      check_out: '2026-09-05',
      guests: 3,
      status: 'CONFIRMED',
      special_requests: 'Late check-in',
    });
  });

  it('passes an omitted specialRequests through as undefined rather than nullifying it', async () => {
    // Unlike createBooking, updateBooking has no falsy-to-null conversion.
    mockedApiClient.patch.mockResolvedValue(wireBooking);

    await bookingService.updateBooking(31, { guests: 4 });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/bookings/31', {
      check_in: undefined,
      check_out: undefined,
      guests: 4,
      status: undefined,
      special_requests: undefined,
    });
  });

  it('maps the updated booking response into the domain shape', async () => {
    mockedApiClient.patch.mockResolvedValue(wireBooking);

    const booking = await bookingService.updateBooking(31, { guests: 4 });

    expect(booking.guests).toBe(2);
    expect(booking.status).toBe('CONFIRMED');
  });
});

describe('bookingService.cancelBooking', () => {
  it('deletes the single booking endpoint without a trailing slash', async () => {
    mockedApiClient.delete.mockResolvedValue(wireBooking);

    await bookingService.cancelBooking(31);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/bookings/31');
  });

  it('resolves with the mapped booking rather than void, since this is a soft cancel', async () => {
    mockedApiClient.delete.mockResolvedValue({
      ...wireBooking,
      status: 'CANCELLED',
    });

    const booking = await bookingService.cancelBooking(31);

    expect(booking.status).toBe('CANCELLED');
  });
});
