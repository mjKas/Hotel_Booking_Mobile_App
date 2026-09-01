/**
 * Domain types for the mobile client.
 *
 * These mirror the FastAPI response models in `hotelmanagement/app/schemas/api.py`
 * but use camelCase: the service layer maps snake_case wire fields onto these
 * so screens never deal with two naming conventions.
 */

/* ------------------------------------------------------------------ roles */

export type Role = 'ADMIN' | 'REGISTERED_USER';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  REGISTERED_USER: 'Customer',
};

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string | null;
}

/* ------------------------------------------------------------- biometrics */

export interface BiometricDevice {
  id: number;
  deviceId: string;
  deviceLabel: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface BiometricEnrolment extends BiometricDevice {
  /** Returned exactly once, at enrolment. Never persisted in plain storage. */
  biometricToken: string;
}

/* ------------------------------------------------------------- room types */

export interface RoomType {
  id: number;
  name: string;
  description: string;
  maxOccupancy: number;
  baseRate: number;
  amenities: string[];
  imageUrl: string;
}

/* ------------------------------------------------------------------ rooms */

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of service',
};

export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: number;
  roomType: RoomType;
  nightlyRate: number;
  description: string;
}

export interface RoomWritePayload {
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: number;
  nightlyRate: number;
  description: string;
}

/* ----------------------------------------------------------- availability */

export interface AvailabilityQuery {
  checkIn: string; // yyyy-mm-dd
  checkOut: string; // yyyy-mm-dd
  guests: number;
  roomTypeId?: number | null;
  maxNightlyRate?: number | null;
}

/** A priced room for a specific stay. The server computes the money. */
export interface AvailabilityResult {
  room: Room;
  nights: number;
  nightlyRate: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
}

/* --------------------------------------------------------------- bookings */

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  CHECKED_OUT: 'Checked out',
  CANCELLED: 'Cancelled',
};

export interface Booking {
  id: number;
  reference: string;
  userId: number;
  guestName: string;
  guestEmail: string;
  roomId: number;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  nightlyRate: number;
  subtotal: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface UpdateBookingPayload {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  status?: BookingStatus;
  specialRequests?: string;
}

export interface BookingFilters {
  status?: BookingStatus | 'ALL';
  search?: string;
  from?: string;
  to?: string;
}

/* ---------------------------------------------------------------- reports */

export interface OccupancyReport {
  occupied: number;
  available: number;
  maintenance: number;
  totalRooms: number;
  occupancyRate: number;
}

export interface RevenueReport {
  currency: string;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  averageDailyRate: number;
  byMonth: { month: string; revenue: number }[];
}

export interface DashboardSummary {
  occupancy: OccupancyReport;
  revenue: RevenueReport;
  totalUsers: number;
  activeBookings: number;
  arrivalsToday: number;
  departuresToday: number;
  recentBookings: Booking[];
}
