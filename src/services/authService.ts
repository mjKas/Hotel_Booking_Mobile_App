import { apiClient } from '../api/apiClient';
import { tokenStore } from '../api/tokenStore';
import { ApiError } from '../api/apiError';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    phone?: string | null;
    role: string;
  };
};

function mapUser(user: AuthResponse['user']): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone ?? null,
    role: user.role,
  };
}

export const authService = {
  async login(
    payload: LoginPayload,
  ): Promise<User> {
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/login',
        {
          email: payload.email,
          password: payload.password,
        },
        {
          anonymous: true,
        },
      );

    await tokenStore.setTokens(
      response.access_token,
      response.refresh_token,
    );

    return mapUser(response.user);
  },

  async register(
    payload: RegisterPayload,
  ): Promise<User> {
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/register',
        {
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
        },
        {
          anonymous: true,
        },
      );

    await tokenStore.setTokens(
      response.access_token,
      response.refresh_token,
    );

    return mapUser(response.user);
  },

  async me(): Promise<User> {
    const response =
      await apiClient.get<AuthResponse['user']>(
        '/auth/me',
      );

    return mapUser(response);
  },

  async logout(): Promise<void> {
    try {
      const refreshToken =
        await tokenStore.getRefreshToken();

      if (refreshToken) {
        await apiClient.post(
          '/auth/logout',
          {
            refresh_token: refreshToken,
          },
        );
      }
    } catch {
      // Logout locally even if the server request fails.
    } finally {
      await tokenStore.clear();
    }
  },
};