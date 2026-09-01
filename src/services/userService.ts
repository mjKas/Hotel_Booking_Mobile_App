import { apiClient } from '../api/apiClient';
import type {
  BiometricDevice,
  RegisterPayload,
  Role,
  User,
  UserStatus,
} from '../types/domain';
import {
  mapBiometricDevice,
  mapUser,
  type WireBiometricDevice,
  type WireUser,
} from './mappers';

export interface AdminCreateUserPayload extends RegisterPayload {
  role: Role;
}

export interface AdminUpdateUserPayload {
  fullName: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
}

/** Administration of other people's accounts. Every call here requires ADMIN. */
export const userService = {
  async list(): Promise<User[]> {
    const wire = await apiClient.get<WireUser[]>('/users/');
    return wire.map(mapUser);
  },

  async get(userId: number): Promise<User> {
    return mapUser(await apiClient.get<WireUser>(`/users/${userId}`));
  },

  async create(
    payload: AdminCreateUserPayload,
  ): Promise<User> {
    return mapUser(
      await apiClient.post<WireUser>('/users/', {
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role,
      }),
    );
  },

  async update(
    userId: number,
    payload: AdminUpdateUserPayload,
  ): Promise<User> {
    return mapUser(
      await apiClient.put<WireUser>(`/users/${userId}`, {
        full_name: payload.fullName,
        phone: payload.phone ?? null,
        role: payload.role,
        status: payload.status,
      }),
    );
  },

  async remove(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  /* -------------------------------------------------------- biometrics */

  async listBiometricDevices(
    userId: number,
  ): Promise<BiometricDevice[]> {
    const wire = await apiClient.get<WireBiometricDevice[]>(
      `/users/${userId}/biometric`,
    );

    return wire.map(mapBiometricDevice);
  },

  /**
   * Revokes every device enrolled against this account. Mirrors the reset
   * action on the web admin console.
   */
  async resetBiometric(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/biometric`);
  },
};
