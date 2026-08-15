import { apiClient } from '../api/apiClient';

export type User = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status?: string;
  createdAt?: string;
};

type BackendUser = {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  status?: string;
  created_at?: string;
};

type UpdateProfileData = {
  fullName?: string;
  phone?: string | null;
};

function mapUser(user: BackendUser): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone ?? null,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
  };
}

export const userService = {
  /**
   * Get the currently authenticated user's profile.
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<BackendUser>(
      '/auth/me',
    );

    return mapUser(response);
  },

  /**
   * Update the currently authenticated user's profile.
   */
  async updateProfile(
    data: UpdateProfileData,
  ): Promise<User> {
    const response = await apiClient.patch<BackendUser>(
      '/auth/me',
      {
        full_name: data.fullName,
        phone: data.phone,
      },
    );

    return mapUser(response);
  },

  /**
   * Change the currently authenticated user's password.
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await apiClient.post(
      '/auth/change-password',
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
    );
  },
};