import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'hotel_refresh_token';

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setTokens(
    newAccessToken: string,
    newRefreshToken: string,
  ): Promise<void> {
    accessToken = newAccessToken;

    try {
      await SecureStore.setItemAsync(
        REFRESH_TOKEN_KEY,
        newRefreshToken,
      );
    } catch {
      // Token could not be persisted.
    }
  },

  async clear(): Promise<void> {
    accessToken = null;

    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // Nothing else to do.
    }
  },

  async hasSession(): Promise<boolean> {
    if (accessToken) {
      return true;
    }

    const refreshToken = await this.getRefreshToken();

    return refreshToken !== null;
  },
};