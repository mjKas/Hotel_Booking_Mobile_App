import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';

import { bookingService } from '@/src/services/BookingService';
import { reportService } from '@/src/services/reportService';
import { roomService } from '@/src/services/roomService';
import {
  userService,
  type AdminCreateUserPayload,
  type AdminUpdateUserPayload,
} from '@/src/services/userService';
import type {
  AvailabilityQuery,
  Booking,
  BookingFilters,
  CreateBookingPayload,
  Room,
  RoomWritePayload,
  UpdateBookingPayload,
  User,
} from '@/src/types/domain';

/**
 * Query keys live in one place so a mutation's invalidation cannot drift from
 * the key its reads use.
 */
export const queryKeys = {
  rooms: {
    all: ['rooms'] as const,
    list: () => ['rooms', 'list'] as const,
    detail: (id: number) => ['rooms', 'detail', id] as const,
    types: () => ['rooms', 'types'] as const,
    quote: (roomId: number, checkIn: string, checkOut: string) =>
      ['rooms', 'quote', roomId, checkIn, checkOut] as const,
  },
  availability: (query: AvailabilityQuery) =>
    ['availability', query] as const,
  bookings: {
    all: ['bookings'] as const,
    list: (filters: BookingFilters) =>
      ['bookings', 'list', filters] as const,
    detail: (id: number) => ['bookings', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => ['users', 'list'] as const,
  },
  reports: {
    dashboard: () => ['reports', 'dashboard'] as const,
  },
} as const;

/* ------------------------------------------------------------------ rooms */

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: () => roomService.listRooms(),
  });
}

export function useRoom(roomId: number | null) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId ?? 0),
    queryFn: () => roomService.getRoom(roomId as number),
    enabled: roomId !== null,
  });
}

export function useRoomTypes() {
  return useQuery({
    queryKey: queryKeys.rooms.types(),
    queryFn: () => roomService.listRoomTypes(),
    staleTime: 5 * 60_000,
  });
}

export function useRoomQuote(
  roomId: number | null,
  checkIn: string,
  checkOut: string,
) {
  return useQuery({
    queryKey: queryKeys.rooms.quote(roomId ?? 0, checkIn, checkOut),
    queryFn: () =>
      roomService.quote(roomId as number, checkIn, checkOut),
    enabled: roomId !== null && Boolean(checkIn) && Boolean(checkOut),
  });
}

export function useAvailability(
  query: AvailabilityQuery | null,
) {
  return useQuery({
    queryKey: queryKeys.availability(
      query ?? { checkIn: '', checkOut: '', guests: 0 },
    ),
    queryFn: () =>
      roomService.searchAvailability(query as AvailabilityQuery),
    enabled: query !== null,
  });
}

export function useCreateRoom(
  options?: UseMutationOptions<Room, Error, RoomWritePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoomWritePayload) =>
      roomService.createRoom(payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateRoom(
  options?: UseMutationOptions<
    Room,
    Error,
    { roomId: number; payload: RoomWritePayload }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: number;
      payload: RoomWritePayload;
    }) => roomService.updateRoom(roomId, payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteRoom(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => roomService.deleteRoom(roomId),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

/* --------------------------------------------------------------- bookings */

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: () => bookingService.listBookings(filters),
  });
}

export function useBooking(bookingId: number | null) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId ?? 0),
    queryFn: () => bookingService.getBooking(bookingId as number),
    enabled: bookingId !== null,
  });
}

export function useCreateBooking(
  options?: UseMutationOptions<Booking, Error, CreateBookingPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingService.createBooking(payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      // A new booking changes what is available and the dashboard counters.
      void queryClient.invalidateQueries({
        queryKey: ['availability'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['reports'],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateBooking(
  options?: UseMutationOptions<
    Booking,
    Error,
    { bookingId: number; payload: UpdateBookingPayload }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number;
      payload: UpdateBookingPayload;
    }) => bookingService.updateBooking(bookingId, payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCancelBooking(
  options?: UseMutationOptions<Booking, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) =>
      bookingService.cancelBooking(bookingId),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(...args);
    },
  });
}

/* ------------------------------------------------------------------ users */

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => userService.list(),
  });
}

export function useCreateUser(
  options?: UseMutationOptions<User, Error, AdminCreateUserPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCreateUserPayload) =>
      userService.create(payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateUser(
  options?: UseMutationOptions<
    User,
    Error,
    { userId: number; payload: AdminUpdateUserPayload }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: AdminUpdateUserPayload;
    }) => userService.update(userId, payload),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.remove(userId),
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
      options?.onSuccess?.(...args);
    },
  });
}

/** Clears every biometric enrolment for one account. Admin only. */
export function useResetUserBiometric(
  options?: UseMutationOptions<void, Error, number>,
) {
  return useMutation({
    mutationFn: (userId: number) => userService.resetBiometric(userId),
    ...options,
  });
}

/* ---------------------------------------------------------------- reports */

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(),
    queryFn: () => reportService.dashboard(),
  });
}
