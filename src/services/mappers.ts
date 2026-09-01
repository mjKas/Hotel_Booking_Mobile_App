/**
 * snake_case wire shapes from FastAPI, and the functions that turn them into
 * the camelCase domain types the screens use.
 *
 * Keeping every mapping in one file means a change to the API contract has a
 * single place to land, rather than being scattered across services.
 */
import type {
  AvailabilityResult,
  BiometricDevice,
  BiometricEnrolment,
  Booking,
  BookingStatus,
  DashboardSummary,
  OccupancyReport,
  RevenueReport,
  Role,
  Room,
  RoomStatus,
  RoomType,
  User,
  UserStatus,
} from '../types/domain';

export interface WireUser {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  created_at: string;
}

export interface WireSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: WireUser;
}

export interface WireTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface WireBiometricDevice {
  id: number;
  device_id: string;
  device_label: string;
  created_at: string;
  last_used_at: string | null;
}

export interface WireBiometricEnrolment extends WireBiometricDevice {
  biometric_token: string;
}

export interface WireRoomType {
  id: number;
  name: string;
  description: string;
  max_occupancy: number;
  base_rate: number;
  amenities: string[];
  image_url: string;
}

export interface WireRoom {
  id: number;
  room_number: string;
  floor: number;
  status: RoomStatus;
  room_type_id: number;
  room_type: WireRoomType;
  nightly_rate: number;
  description: string;
}

export interface WireAvailability {
  room: WireRoom;
  nights: number;
  nightly_rate: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface WireBooking {
  id: number;
  reference: string;
  user_id: number;
  guest_name: string;
  guest_email: string;
  room_id: number;
  room: WireRoom;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_rate: number;
  subtotal: number;
  taxes: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface WireDashboard {
  occupancy: {
    occupied: number;
    available: number;
    maintenance: number;
    total_rooms: number;
    occupancy_rate: number;
  };
  revenue: {
    currency: string;
    monthly_revenue: number;
    previous_month_revenue: number;
    average_daily_rate: number;
    by_month: { month: string; revenue: number }[];
  };
  total_users: number;
  active_bookings: number;
  arrivals_today: number;
  departures_today: number;
  recent_bookings: WireBooking[];
}

export function mapUser(wire: WireUser): User {
  return {
    id: wire.id,
    email: wire.email,
    fullName: wire.full_name,
    phone: wire.phone ?? null,
    role: wire.role,
    status: wire.status,
    createdAt: wire.created_at,
  };
}

export function mapBiometricDevice(
  wire: WireBiometricDevice,
): BiometricDevice {
  return {
    id: wire.id,
    deviceId: wire.device_id,
    deviceLabel: wire.device_label,
    createdAt: wire.created_at,
    lastUsedAt: wire.last_used_at,
  };
}

export function mapBiometricEnrolment(
  wire: WireBiometricEnrolment,
): BiometricEnrolment {
  return {
    ...mapBiometricDevice(wire),
    biometricToken: wire.biometric_token,
  };
}

export function mapRoomType(wire: WireRoomType): RoomType {
  return {
    id: wire.id,
    name: wire.name,
    description: wire.description,
    maxOccupancy: wire.max_occupancy,
    baseRate: wire.base_rate,
    amenities: wire.amenities ?? [],
    imageUrl: wire.image_url,
  };
}

export function mapRoom(wire: WireRoom): Room {
  return {
    id: wire.id,
    roomNumber: wire.room_number,
    floor: wire.floor,
    status: wire.status,
    roomTypeId: wire.room_type_id,
    roomType: mapRoomType(wire.room_type),
    nightlyRate: wire.nightly_rate,
    description: wire.description,
  };
}

export function mapAvailability(
  wire: WireAvailability,
): AvailabilityResult {
  return {
    room: mapRoom(wire.room),
    nights: wire.nights,
    nightlyRate: wire.nightly_rate,
    subtotal: wire.subtotal,
    taxes: wire.taxes,
    total: wire.total,
    currency: wire.currency,
  };
}

export function mapBooking(wire: WireBooking): Booking {
  return {
    id: wire.id,
    reference: wire.reference,
    userId: wire.user_id,
    guestName: wire.guest_name,
    guestEmail: wire.guest_email,
    roomId: wire.room_id,
    room: mapRoom(wire.room),
    checkIn: wire.check_in,
    checkOut: wire.check_out,
    guests: wire.guests,
    nights: wire.nights,
    nightlyRate: wire.nightly_rate,
    subtotal: wire.subtotal,
    taxes: wire.taxes,
    totalPrice: wire.total_price,
    currency: wire.currency,
    status: wire.status,
    specialRequests: wire.special_requests,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

function mapOccupancy(
  wire: WireDashboard['occupancy'],
): OccupancyReport {
  return {
    occupied: wire.occupied,
    available: wire.available,
    maintenance: wire.maintenance,
    totalRooms: wire.total_rooms,
    occupancyRate: wire.occupancy_rate,
  };
}

function mapRevenue(wire: WireDashboard['revenue']): RevenueReport {
  return {
    currency: wire.currency,
    monthlyRevenue: wire.monthly_revenue,
    previousMonthRevenue: wire.previous_month_revenue,
    averageDailyRate: wire.average_daily_rate,
    byMonth: wire.by_month ?? [],
  };
}

export function mapDashboard(
  wire: WireDashboard,
): DashboardSummary {
  return {
    occupancy: mapOccupancy(wire.occupancy),
    revenue: mapRevenue(wire.revenue),
    totalUsers: wire.total_users,
    activeBookings: wire.active_bookings,
    arrivalsToday: wire.arrivals_today,
    departuresToday: wire.departures_today,
    recentBookings: (wire.recent_bookings ?? []).map(mapBooking),
  };
}
