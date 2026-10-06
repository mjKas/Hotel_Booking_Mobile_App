import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const REFRESH_TOKEN_KEY = 'hotel_refresh_token';

/**
 * The access token lives in a module-level variable, so each test needs a
 * freshly-required module rather than one shared across the file.
 */
function loadTokenStore() {
  let store: typeof import('./tokenStore').tokenStore;

  jest.isolateModules(() => {
    store = require('./tokenStore').tokenStore;
  });

  return store!;
}

describe('access token', () => {
  it('starts empty on a cold start', () => {
    expect(loadTokenStore().getAccessToken()).toBeNull();
  });

  it('is readable synchronously once set', async () => {
    const tokenStore = loadTokenStore();
    await tokenStore.setTokens('access-abc', 'refresh-xyz');

    expect(tokenStore.getAccessToken()).toBe('access-abc');
  });

  it('is never written to the secure store', async () => {
    // Only the long-lived refresh token is persisted; keeping the access token
    // in memory means it cannot be recovered from a stolen device at rest.
    const tokenStore = loadTokenStore();
    await tokenStore.setTokens('access-abc', 'refresh-xyz');

    expect(secureStore.setItemAsync).toHaveBeenCalledTimes(1);
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      'refresh-xyz',
    );
  });
});

describe('refresh token', () => {
  it('is read back from the secure store', async () => {
    secureStore.getItemAsync.mockResolvedValue('refresh-xyz');

    await expect(loadTokenStore().getRefreshToken()).resolves.toBe('refresh-xyz');
    expect(secureStore.getItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it('reads as null when nothing has been stored', async () => {
    secureStore.getItemAsync.mockResolvedValue(null);

    await expect(loadTokenStore().getRefreshToken()).resolves.toBeNull();
  });

  it('reads as null rather than throwing when the keystore is unavailable', async () => {
    // A locked or reset keystore must degrade to "signed out", not crash the
    // app on launch.
    secureStore.getItemAsync.mockRejectedValue(new Error('keystore locked'));

    await expect(loadTokenStore().getRefreshToken()).resolves.toBeNull();
  });
});

describe('setTokens', () => {
  it('keeps the in-memory token even when persistence fails', async () => {
    secureStore.setItemAsync.mockRejectedValue(new Error('disk full'));

    const tokenStore = loadTokenStore();
    await expect(tokenStore.setTokens('access-abc', 'refresh-xyz')).resolves.toBeUndefined();

    // The current session must survive a failed write; only the silent
    // re-login after a restart is lost.
    expect(tokenStore.getAccessToken()).toBe('access-abc');
  });
});

describe('clear', () => {
  it('drops the in-memory token and deletes the persisted one', async () => {
    const tokenStore = loadTokenStore();
    await tokenStore.setTokens('access-abc', 'refresh-xyz');

    await tokenStore.clear();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it('still signs the user out when the delete fails', async () => {
    secureStore.deleteItemAsync.mockRejectedValue(new Error('keystore locked'));

    const tokenStore = loadTokenStore();
    await tokenStore.setTokens('access-abc', 'refresh-xyz');

    await expect(tokenStore.clear()).resolves.toBeUndefined();
    expect(tokenStore.getAccessToken()).toBeNull();
  });
});

describe('hasSession', () => {
  it('is true while an access token is held, without touching the keystore', async () => {
    const tokenStore = loadTokenStore();
    await tokenStore.setTokens('access-abc', 'refresh-xyz');
    secureStore.getItemAsync.mockClear();

    await expect(tokenStore.hasSession()).resolves.toBe(true);
    expect(secureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('is true after a restart when only the refresh token survives', async () => {
    secureStore.getItemAsync.mockResolvedValue('refresh-xyz');

    await expect(loadTokenStore().hasSession()).resolves.toBe(true);
  });

  it('is false when neither token is available', async () => {
    secureStore.getItemAsync.mockResolvedValue(null);

    await expect(loadTokenStore().hasSession()).resolves.toBe(false);
  });

  it('is false when the keystore read fails', async () => {
    secureStore.getItemAsync.mockRejectedValue(new Error('keystore locked'));

    await expect(loadTokenStore().hasSession()).resolves.toBe(false);
  });
});
