import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
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
  BiometricDevice,
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
    lists: () => ['bookings', 'list'] as const,
    list: (filters: BookingFilters) =>
      ['bookings', 'list', filters] as const,
    detail: (id: number) => ['bookings', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => ['users', 'list'] as const,
    biometric: (userId: number) =>
      ['users', 'biometric', userId] as const,
  },
  reports: {
    dashboard: () => ['reports', 'dashboard'] as const,
  },
} as const;

/*
 * Every successful write below patches the cached list straight away and then
 * invalidates it. The patch is what makes the screen change on the same frame
 * as the success; the refetch that follows confirms it against the server.
 */

function upsertById<T extends { id: number }>(
  list: T[] | undefined,
  item: T,
  position: 'start' | 'end' = 'end',
): T[] | undefined {
  if (!list) return list;

  if (list.some((existing) => existing.id === item.id)) {
    return list.map((existing) =>
      existing.id === item.id ? item : existing,
    );
  }

  return position === 'start' ? [item, ...list] : [...list, item];
}

function removeById<T extends { id: number }>(
  list: T[] | undefined,
  id: number,
): T[] | undefined {
  return list?.filter((item) => item.id !== id);
}

/** Replaces one booking in every cached booking list, whatever its filters. */
function patchBookingLists(queryClient: QueryClient, booking: Booking) {
  queryClient.setQueriesData<Booking[]>(
    { queryKey: queryKeys.bookings.lists() },
    (list) =>
      list?.map((existing) =>
        existing.id === booking.id ? booking : existing,
      ),
  );

  queryClient.setQueryData(queryKeys.bookings.detail(booking.id), booking);
}

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
    onSuccess: (room, ...rest) => {
      queryClient.setQueryData<Room[]>(queryKeys.rooms.list(), (list) =>
        upsertById(list, room),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(room, ...rest);
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
    onSuccess: (room, ...rest) => {
      queryClient.setQueryData<Room[]>(queryKeys.rooms.list(), (list) =>
        upsertById(list, room),
      );
      queryClient.setQueryData(queryKeys.rooms.detail(room.id), room);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(room, ...rest);
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
    onSuccess: (data, roomId, ...rest) => {
      queryClient.setQueryData<Room[]>(queryKeys.rooms.list(), (list) =>
        removeById(list, roomId),
      );
      queryClient.removeQueries({
        queryKey: queryKeys.rooms.detail(roomId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(data, roomId, ...rest);
    },
  });
}

/* --------------------------------------------------------------- bookings */

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: () => bookingService.listBookings(filters),
    // Keeps the current cards on screen while a new search or status filter
    // loads. Without it the whole screen flips to a spinner on every
    // keystroke, which unmounts the search box and drops the keyboard.
    placeholderData: keepPreviousData,
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
    onSuccess: (booking, ...rest) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(booking.id),
        booking,
      );
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
      options?.onSuccess?.(booking, ...rest);
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
    onSuccess: (booking, ...rest) => {
      patchBookingLists(queryClient, booking);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(booking, ...rest);
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
    onSuccess: (booking, ...rest) => {
      patchBookingLists(queryClient, booking);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(booking, ...rest);
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
    onSuccess: (user, ...rest) => {
      // The API lists newest accounts first, so the new one goes on top.
      queryClient.setQueryData<User[]>(queryKeys.users.list(), (list) =>
        upsertById(list, user, 'start'),
      );
      queryClient.setQueryData<BiometricDevice[]>(
        queryKeys.users.biometric(user.id),
        [],
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.list(),
      });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(user, ...rest);
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
    onSuccess: (user, ...rest) => {
      queryClient.setQueryData<User[]>(queryKeys.users.list(), (list) =>
        upsertById(list, user),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.list(),
      });
      // A renamed guest shows up under their new name on their bookings.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      options?.onSuccess?.(user, ...rest);
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
    onSuccess: (data, userId, ...rest) => {
      queryClient.setQueryData<User[]>(queryKeys.users.list(), (list) =>
        removeById(list, userId),
      );
      queryClient.removeQueries({
        queryKey: queryKeys.users.biometric(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.list(),
      });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      options?.onSuccess?.(data, userId, ...rest);
    },
  });
}

/** The devices enrolled for biometric sign-in on one account. Admin only. */
export function useUserBiometricDevices(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.biometric(userId),
    queryFn: () => userService.listBiometricDevices(userId),
  });
}

/** Clears every biometric enrolment for one account. Admin only. */
export function useResetUserBiometric(
  options?: UseMutationOptions<void, Error, number>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.resetBiometric(userId),
    ...options,
    onSuccess: (data, userId, ...rest) => {
      queryClient.setQueryData<BiometricDevice[]>(
        queryKeys.users.biometric(userId),
        [],
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.biometric(userId),
      });
      options?.onSuccess?.(data, userId, ...rest);
    },
  });
}

/* ---------------------------------------------------------------- reports */

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(),
    queryFn: () => reportService.dashboard(),
  });
}
