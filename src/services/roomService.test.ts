import { apiClient } from '../api/apiClient';
import { roomService } from './roomService';
import type { WireAvailability, WireRoom, WireRoomType } from './mappers';

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

const wireAvailability: WireAvailability = {
  room: wireRoom,
  nights: 3,
  nightly_rate: 199,
  subtotal: 597,
  taxes: 71.64,
  total: 668.64,
  currency: 'GBP',
};

describe('roomService.listRooms', () => {
  it('requests the rooms collection with its trailing slash', async () => {
    // FastAPI 307-redirects the bare form, and RN fetch drops the body on redirect.
    mockedApiClient.get.mockResolvedValue([wireRoom]);

    await roomService.listRooms();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/rooms/');
  });

  it('maps every returned room into the camelCase domain shape', async () => {
    mockedApiClient.get.mockResolvedValue([wireRoom]);

    const rooms = await roomService.listRooms();

    expect(rooms).toEqual([
      {
        id: 7,
        roomNumber: '204',
        floor: 2,
        status: 'AVAILABLE',
        roomTypeId: 2,
        roomType: {
          id: 2,
          name: 'Deluxe King',
          description: 'A deluxe room overlooking the courtyard.',
          maxOccupancy: 3,
          baseRate: 189,
          amenities: ['Wi-Fi', 'Bathtub'],
          imageUrl: 'https://example.test/deluxe.jpg',
        },
        nightlyRate: 199,
        description: 'Courtyard room',
      },
    ]);
  });
});

describe('roomService.listBookableRooms', () => {
  it('requests the available rooms endpoint without a trailing slash', async () => {
    mockedApiClient.get.mockResolvedValue([wireRoom]);

    await roomService.listBookableRooms();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/rooms/available');
  });

  it('maps the returned rooms through mapRoom', async () => {
    mockedApiClient.get.mockResolvedValue([wireRoom]);

    const rooms = await roomService.listBookableRooms();

    expect(rooms[0].roomNumber).toBe('204');
    expect(rooms[0].roomType.name).toBe('Deluxe King');
  });
});

describe('roomService.getRoom', () => {
  it('requests a single room by id', async () => {
    mockedApiClient.get.mockResolvedValue(wireRoom);

    await roomService.getRoom(7);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/rooms/7');
  });

  it('maps the returned room into the domain shape', async () => {
    mockedApiClient.get.mockResolvedValue(wireRoom);

    const room = await roomService.getRoom(7);

    expect(room.id).toBe(7);
    expect(room.roomTypeId).toBe(2);
  });
});

describe('roomService.quote', () => {
  it('requests the quote endpoint for the room with the stay dates as query params', async () => {
    mockedApiClient.get.mockResolvedValue(wireAvailability);

    await roomService.quote(7, '2026-09-01', '2026-09-04');

    expect(mockedApiClient.get).toHaveBeenCalledWith('/rooms/7/quote', {
      query: { check_in: '2026-09-01', check_out: '2026-09-04' },
    });
  });

  it('maps the returned quote into an availability result', async () => {
    mockedApiClient.get.mockResolvedValue(wireAvailability);

    const result = await roomService.quote(7, '2026-09-01', '2026-09-04');

    expect(result).toEqual({
      room: expect.objectContaining({ id: 7, roomNumber: '204' }),
      nights: 3,
      nightlyRate: 199,
      subtotal: 597,
      taxes: 71.64,
      total: 668.64,
      currency: 'GBP',
    });
  });
});

describe('roomService.searchAvailability', () => {
  it('requests the availability endpoint with the required query params', async () => {
    mockedApiClient.get.mockResolvedValue([wireAvailability]);

    await roomService.searchAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/availability', {
      query: {
        check_in: '2026-09-01',
        check_out: '2026-09-04',
        guests: 2,
        room_type_id: undefined,
        max_nightly_rate: undefined,
      },
    });
  });

  it('includes roomTypeId and maxNightlyRate in the query when they are provided', async () => {
    mockedApiClient.get.mockResolvedValue([wireAvailability]);

    await roomService.searchAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
      roomTypeId: 5,
      maxNightlyRate: 250,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/availability', {
      query: {
        check_in: '2026-09-01',
        check_out: '2026-09-04',
        guests: 2,
        room_type_id: 5,
        max_nightly_rate: 250,
      },
    });
  });

  it('omits roomTypeId and maxNightlyRate from the query when they are null', async () => {
    mockedApiClient.get.mockResolvedValue([wireAvailability]);

    await roomService.searchAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
      roomTypeId: null,
      maxNightlyRate: null,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/availability', {
      query: {
        check_in: '2026-09-01',
        check_out: '2026-09-04',
        guests: 2,
        room_type_id: undefined,
        max_nightly_rate: undefined,
      },
    });
  });

  it('maps every returned result through mapAvailability', async () => {
    mockedApiClient.get.mockResolvedValue([wireAvailability]);

    const results = await roomService.searchAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      guests: 2,
    });

    expect(results).toHaveLength(1);
    expect(results[0].currency).toBe('GBP');
    expect(results[0].room.roomNumber).toBe('204');
  });
});

describe('roomService.listRoomTypes', () => {
  it('requests the room types collection with its trailing slash', async () => {
    mockedApiClient.get.mockResolvedValue([wireRoomType]);

    await roomService.listRoomTypes();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/room-types/');
  });

  it('maps every returned room type into the domain shape', async () => {
    mockedApiClient.get.mockResolvedValue([wireRoomType]);

    const roomTypes = await roomService.listRoomTypes();

    expect(roomTypes).toEqual([
      {
        id: 2,
        name: 'Deluxe King',
        description: 'A deluxe room overlooking the courtyard.',
        maxOccupancy: 3,
        baseRate: 189,
        amenities: ['Wi-Fi', 'Bathtub'],
        imageUrl: 'https://example.test/deluxe.jpg',
      },
    ]);
  });
});

describe('roomService.createRoom', () => {
  it('posts to the rooms collection with its trailing slash', async () => {
    mockedApiClient.post.mockResolvedValue(wireRoom);

    await roomService.createRoom({
      roomNumber: '204',
      floor: 2,
      status: 'AVAILABLE',
      roomTypeId: 2,
      nightlyRate: 199,
      description: 'Courtyard room',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/rooms/', {
      room_number: '204',
      floor: 2,
      status: 'AVAILABLE',
      room_type_id: 2,
      nightly_rate: 199,
      description: 'Courtyard room',
    });
  });

  it('converts the camelCase payload into the snake_case wire shape', async () => {
    mockedApiClient.post.mockResolvedValue(wireRoom);

    await roomService.createRoom({
      roomNumber: '305',
      floor: 3,
      status: 'MAINTENANCE',
      roomTypeId: 4,
      nightlyRate: 249,
      description: 'Top floor suite',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/rooms/',
      expect.objectContaining({
        room_number: '305',
        room_type_id: 4,
        nightly_rate: 249,
      }),
    );
  });

  it('maps the created room response into the domain shape', async () => {
    mockedApiClient.post.mockResolvedValue(wireRoom);

    const room = await roomService.createRoom({
      roomNumber: '204',
      floor: 2,
      status: 'AVAILABLE',
      roomTypeId: 2,
      nightlyRate: 199,
      description: 'Courtyard room',
    });

    expect(room.roomNumber).toBe('204');
    expect(room.roomType.name).toBe('Deluxe King');
  });
});

describe('roomService.updateRoom', () => {
  it('puts to the single room endpoint without a trailing slash', async () => {
    mockedApiClient.put.mockResolvedValue(wireRoom);

    await roomService.updateRoom(7, {
      roomNumber: '204',
      floor: 2,
      status: 'OCCUPIED',
      roomTypeId: 2,
      nightlyRate: 219,
      description: 'Courtyard room, recently redecorated',
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith('/rooms/7', {
      room_number: '204',
      floor: 2,
      status: 'OCCUPIED',
      room_type_id: 2,
      nightly_rate: 219,
      description: 'Courtyard room, recently redecorated',
    });
  });

  it('maps the updated room response into the domain shape', async () => {
    mockedApiClient.put.mockResolvedValue(wireRoom);

    const room = await roomService.updateRoom(7, {
      roomNumber: '204',
      floor: 2,
      status: 'AVAILABLE',
      roomTypeId: 2,
      nightlyRate: 199,
      description: 'Courtyard room',
    });

    expect(room.id).toBe(7);
  });
});

describe('roomService.deleteRoom', () => {
  it('deletes the single room endpoint without a trailing slash', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await roomService.deleteRoom(7);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/rooms/7');
  });

  it('resolves with no value', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await expect(roomService.deleteRoom(7)).resolves.toBeUndefined();
  });
});
