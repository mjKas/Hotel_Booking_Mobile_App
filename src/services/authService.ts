import { apiClient } from '../api/apiClient';
import { tokenStore } from '../api/tokenStore';
import type {
  AuthSession,
  BiometricDevice,
  BiometricEnrolment,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '../types/domain';
import {
  mapBiometricDevice,
  mapBiometricEnrolment,
  mapUser,
  type WireBiometricDevice,
  type WireBiometricEnrolment,
  type WireSession,
  type WireUser,
} from './mappers';

function toSession(wire: WireSession): AuthSession {
  return {
    user: mapUser(wire.user),
    accessToken: wire.access_token,
    refreshToken: wire.refresh_token,
    expiresInSeconds: wire.expires_in,
  };
}

async function storeSession(
  wire: WireSession,
): Promise<AuthSession> {
  const session = toSession(wire);

  await tokenStore.setTokens(
    session.accessToken,
    session.refreshToken,
  );

  return session;
}

export const authService = {
  async login(
    payload: LoginPayload,
  ): Promise<AuthSession> {
    const response = await apiClient.post<WireSession>(
      '/auth/login',
      {
        email: payload.email,
        password: payload.password,
      },
      { anonymous: true },
    );

    return storeSession(response);
  },

  async register(
    payload: RegisterPayload,
  ): Promise<AuthSession> {
    const response = await apiClient.post<WireSession>(
      '/auth/register',
      {
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      },
      { anonymous: true },
    );

    return storeSession(response);
  },

  async me(): Promise<User> {
    return mapUser(
      await apiClient.get<WireUser>('/auth/me'),
    );
  },

  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<User> {
    return mapUser(
      await apiClient.patch<WireUser>('/auth/me', {
        full_name: payload.fullName,
        phone: payload.phone ?? null,
      }),
    );
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Rebuilds the session on app start.
   *
   * The access token only lives in memory, so after a cold start there is just
   * the refresh token in SecureStore. `apiClient` will spend it on the first
   * 401 and retry, which is exactly what this call triggers.
   */
  async restore(): Promise<User | null> {
    if (!(await tokenStore.hasSession())) {
      return null;
    }

    try {
      return await this.me();
    } catch {
      await tokenStore.clear();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken =
        await tokenStore.getRefreshToken();

      if (refreshToken) {
        await apiClient.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch {
      // Sign out locally even if the server could not be reached.
    } finally {
      await tokenStore.clear();
    }
  },

  /* ---------------------------------------------------------- biometrics */

  /**
   * Registers this device against the signed-in account and returns the
   * one-time secret. Open to every role - guests as well as administrators.
   */
  async enrolBiometric(
    deviceId: string,
    deviceLabel: string,
  ): Promise<BiometricEnrolment> {
    return mapBiometricEnrolment(
      await apiClient.post<WireBiometricEnrolment>(
        '/auth/biometric/enroll',
        {
          device_id: deviceId,
          device_label: deviceLabel,
        },
      ),
    );
  },

  /** Exchanges a stored device secret for a normal session. */
  async biometricLogin(
    email: string,
    deviceId: string,
    biometricToken: string,
  ): Promise<AuthSession> {
    const response = await apiClient.post<WireSession>(
      '/auth/biometric/login',
      {
        email,
        device_id: deviceId,
        biometric_token: biometricToken,
      },
      { anonymous: true },
    );

    return storeSession(response);
  },

  async listBiometricDevices(): Promise<BiometricDevice[]> {
    const wire = await apiClient.get<WireBiometricDevice[]>(
      '/auth/biometric/devices',
    );

    return wire.map(mapBiometricDevice);
  },

  async removeBiometricDevice(
    credentialId: number,
  ): Promise<void> {
    await apiClient.delete(
      `/auth/biometric/devices/${credentialId}`,
    );
  },
};
