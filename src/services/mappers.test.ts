import {
  mapAvailability,
  mapBiometricDevice,
  mapBiometricEnrolment,
  mapBooking,
  mapDashboard,
  mapRoom,
  mapRoomType,
  mapUser,
  type WireBooking,
  type WireDashboard,
  type WireRoom,
  type WireRoomType,
} from './mappers';

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

describe('mapUser', () => {
  it('maps every field onto the domain user', () => {
    expect(
      mapUser({
        id: 2,
        email: 'ella.hart@example.test',
        full_name: 'Ella Hart',
        phone: '+44 7700 900002',
        role: 'REGISTERED_USER',
        status: 'ACTIVE',
        created_at: '2026-03-02T16:40:00Z',
      }),
    ).toEqual({
      id: 2,
      email: 'ella.hart@example.test',
      fullName: 'Ella Hart',
      phone: '+44 7700 900002',
      role: 'REGISTERED_USER',
      status: 'ACTIVE',
      createdAt: '2026-03-02T16:40:00Z',
    });
  });

  it('normalises a missing phone to null so the profile screen has one empty case', () => {
    expect(
      mapUser({
        id: 3,
        email: 'noah.reid@example.test',
        full_name: 'Noah Reid',
        phone: null,
        role: 'ADMIN',
        status: 'SUSPENDED',
        created_at: '2026-03-02T16:40:00Z',
      }).phone,
    ).toBeNull();

    expect(
      mapUser({
        id: 4,
        email: 'no.phone@example.test',
        full_name: 'No Phone',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: '2026-03-02T16:40:00Z',
      } as never).phone,
    ).toBeNull();
  });

  it('passes admin and suspended values through untouched', () => {
    const user = mapUser({
      id: 1,
      email: 'admin@example.test',
      full_name: 'Site Admin',
      phone: null,
      role: 'ADMIN',
      status: 'SUSPENDED',
      created_at: '2026-01-01T00:00:00Z',
    });

    expect(user.role).toBe('ADMIN');
    expect(user.status).toBe('SUSPENDED');
  });
});

describe('biometric mappers', () => {
  const wireDevice = {
    id: 9,
    device_id: 'device-abc',
    device_label: "Ella's iPhone",
    created_at: '2026-08-01T09:00:00Z',
    last_used_at: '2026-08-20T18:30:00Z',
  };

  it('maps an enrolled device', () => {
    expect(mapBiometricDevice(wireDevice)).toEqual({
      id: 9,
      deviceId: 'device-abc',
      deviceLabel: "Ella's iPhone",
      createdAt: '2026-08-01T09:00:00Z',
      lastUsedAt: '2026-08-20T18:30:00Z',
    });
  });

  it('keeps a never-used device as null rather than undefined', () => {
    expect(mapBiometricDevice({ ...wireDevice, last_used_at: null }).lastUsedAt).toBeNull();
  });

  it('carries the one-time secret through on enrolment', () => {
    const enrolment = mapBiometricEnrolment({
      ...wireDevice,
      biometric_token: 'super-secret-token',
    });

    expect(enrolment.biometricToken).toBe('super-secret-token');
    expect(enrolment.deviceId).toBe('device-abc');
  });
});

describe('room mappers', () => {
  it('maps a room type', () => {
    expect(mapRoomType(wireRoomType)).toEqual({
      id: 2,
      name: 'Deluxe King',
      description: 'A deluxe room overlooking the courtyard.',
      maxOccupancy: 3,
      baseRate: 189,
      amenities: ['Wi-Fi', 'Bathtub'],
      imageUrl: 'https://example.test/deluxe.jpg',
    });
  });

  it('defaults missing amenities to an empty array so the list can be mapped over', () => {
    expect(mapRoomType({ ...wireRoomType, amenities: undefined as never }).amenities).toEqual([]);
  });

  it('maps a room and its nested room type in one pass', () => {
    const room = mapRoom(wireRoom);

    expect(room).toEqual({
      id: 7,
      roomNumber: '204',
      floor: 2,
      status: 'AVAILABLE',
      roomTypeId: 2,
      roomType: mapRoomType(wireRoomType),
      nightlyRate: 199,
      description: 'Courtyard room',
    });
    expect(room.roomType.maxOccupancy).toBe(3);
  });

  it('preserves a non-bookable room status', () => {
    expect(mapRoom({ ...wireRoom, status: 'MAINTENANCE' }).status).toBe('MAINTENANCE');
  });
});

describe('mapAvailability', () => {
  it('maps a priced availability result including the nested room', () => {
    expect(
      mapAvailability({
        room: wireRoom,
        nights: 3,
        nightly_rate: 199,
        subtotal: 597,
        taxes: 71.64,
        total: 668.64,
        currency: 'GBP',
      }),
    ).toEqual({
      room: mapRoom(wireRoom),
      nights: 3,
      nightlyRate: 199,
      subtotal: 597,
      taxes: 71.64,
      total: 668.64,
      currency: 'GBP',
    });
  });
});

describe('mapBooking', () => {
  it('maps every booking field, including the price breakdown', () => {
    expect(mapBooking(wireBooking)).toEqual({
      id: 31,
      reference: 'RC-0031',
      userId: 7,
      guestName: 'Ella Hart',
      guestEmail: 'ella.hart@example.test',
      roomId: 7,
      room: mapRoom(wireRoom),
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
    });
  });

  it('maps total_price onto totalPrice, not total', () => {
    // These two names differ between the availability quote and the booking,
    // which is exactly the kind of mismatch that renders as "£undefined".
    const booking = mapBooking(wireBooking);

    expect(booking.totalPrice).toBe(668.64);
    expect((booking as unknown as Record<string, unknown>).total).toBeUndefined();
  });

  it('keeps absent special requests as null', () => {
    expect(mapBooking({ ...wireBooking, special_requests: null }).specialRequests).toBeNull();
  });

  it('preserves a cancelled status', () => {
    expect(mapBooking({ ...wireBooking, status: 'CANCELLED' }).status).toBe('CANCELLED');
  });
});

describe('mapDashboard', () => {
  const wireDashboard: WireDashboard = {
    occupancy: {
      occupied: 12,
      available: 6,
      maintenance: 2,
      total_rooms: 20,
      occupancy_rate: 0.6,
    },
    revenue: {
      currency: 'GBP',
      monthly_revenue: 48200,
      previous_month_revenue: 41000,
      average_daily_rate: 176.5,
      by_month: [{ month: '2026-08', revenue: 48200 }],
    },
    total_users: 84,
    active_bookings: 19,
    arrivals_today: 4,
    departures_today: 3,
    recent_bookings: [wireBooking],
  };

  it('maps the nested occupancy and revenue reports', () => {
    const dashboard = mapDashboard(wireDashboard);

    expect(dashboard.occupancy).toEqual({
      occupied: 12,
      available: 6,
      maintenance: 2,
      totalRooms: 20,
      occupancyRate: 0.6,
    });
    expect(dashboard.revenue).toEqual({
      currency: 'GBP',
      monthlyRevenue: 48200,
      previousMonthRevenue: 41000,
      averageDailyRate: 176.5,
      byMonth: [{ month: '2026-08', revenue: 48200 }],
    });
  });

  it('maps the flat headline counters', () => {
    const dashboard = mapDashboard(wireDashboard);

    expect(dashboard.totalUsers).toBe(84);
    expect(dashboard.activeBookings).toBe(19);
    expect(dashboard.arrivalsToday).toBe(4);
    expect(dashboard.departuresToday).toBe(3);
  });

  it('maps each recent booking through the booking mapper', () => {
    const dashboard = mapDashboard(wireDashboard);

    expect(dashboard.recentBookings).toHaveLength(1);
    expect(dashboard.recentBookings[0]).toEqual(mapBooking(wireBooking));
  });

  it('defaults missing collections to empty arrays for a brand-new hotel', () => {
    const dashboard = mapDashboard({
      ...wireDashboard,
      revenue: { ...wireDashboard.revenue, by_month: undefined as never },
      recent_bookings: undefined as never,
    });

    expect(dashboard.revenue.byMonth).toEqual([]);
    expect(dashboard.recentBookings).toEqual([]);
  });
});
