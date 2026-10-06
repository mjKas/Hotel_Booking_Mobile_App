import { apiClient } from '../api/apiClient';
import { tokenStore } from '../api/tokenStore';
import { authService } from './authService';
import type { WireSession, WireUser } from './mappers';

jest.mock('../api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../api/tokenStore', () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clear: jest.fn(),
    hasSession: jest.fn(),
  },
}));

const api = apiClient as jest.Mocked<typeof apiClient>;
const tokens = tokenStore as jest.Mocked<typeof tokenStore>;

const wireUser: WireUser = {
  id: 2,
  email: 'ella.hart@example.test',
  full_name: 'Ella Hart',
  phone: '+44 7700 900002',
  role: 'REGISTERED_USER',
  status: 'ACTIVE',
  created_at: '2026-03-02T16:40:00Z',
};

const wireSession: WireSession = {
  access_token: 'access-abc',
  refresh_token: 'refresh-xyz',
  token_type: 'bearer',
  expires_in: 900,
  user: wireUser,
};

beforeEach(() => {
  tokens.setTokens.mockResolvedValue(undefined);
  tokens.clear.mockResolvedValue(undefined);
});

describe('login', () => {
  it('posts the credentials anonymously so no stale token is sent', async () => {
    api.post.mockResolvedValue(wireSession);

    await authService.login({ email: 'ella.hart@example.test', password: 'Guest#2026' });

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'ella.hart@example.test', password: 'Guest#2026' },
      { anonymous: true },
    );
  });

  it('returns the mapped session', async () => {
    api.post.mockResolvedValue(wireSession);

    await expect(
      authService.login({ email: 'ella.hart@example.test', password: 'Guest#2026' }),
    ).resolves.toEqual({
      user: {
        id: 2,
        email: 'ella.hart@example.test',
        fullName: 'Ella Hart',
        phone: '+44 7700 900002',
        role: 'REGISTERED_USER',
        status: 'ACTIVE',
        createdAt: '2026-03-02T16:40:00Z',
      },
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
      expiresInSeconds: 900,
    });
  });

  it('stores both tokens before returning', async () => {
    api.post.mockResolvedValue(wireSession);

    await authService.login({ email: 'ella.hart@example.test', password: 'Guest#2026' });

    expect(tokens.setTokens).toHaveBeenCalledWith('access-abc', 'refresh-xyz');
  });

  it('stores nothing when the credentials are rejected', async () => {
    api.post.mockRejectedValue(new Error('Incorrect email or password.'));

    await expect(
      authService.login({ email: 'ella.hart@example.test', password: 'wrong' }),
    ).rejects.toThrow('Incorrect email or password.');
    expect(tokens.setTokens).not.toHaveBeenCalled();
  });
});

describe('register', () => {
  it('converts the form payload to the snake_case the API expects', async () => {
    api.post.mockResolvedValue(wireSession);

    await authService.register({
      fullName: 'Ella Hart',
      email: 'ella.hart@example.test',
      phone: '+44 7700 900002',
      password: 'Guest#2026',
    });

    expect(api.post).toHaveBeenCalledWith(
      '/auth/register',
      {
        full_name: 'Ella Hart',
        email: 'ella.hart@example.test',
        phone: '+44 7700 900002',
        password: 'Guest#2026',
      },
      { anonymous: true },
    );
  });

  it('signs the new account straight in', async () => {
    api.post.mockResolvedValue(wireSession);

    const session = await authService.register({
      fullName: 'Ella Hart',
      email: 'ella.hart@example.test',
      password: 'Guest#2026',
    });

    expect(session.user.fullName).toBe('Ella Hart');
    expect(tokens.setTokens).toHaveBeenCalledWith('access-abc', 'refresh-xyz');
  });
});

describe('me', () => {
  it('maps the signed-in user', async () => {
    api.get.mockResolvedValue(wireUser);

    await expect(authService.me()).resolves.toMatchObject({
      id: 2,
      fullName: 'Ella Hart',
    });
    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });
});

describe('updateProfile', () => {
  it('patches the profile with snake_case fields', async () => {
    api.patch.mockResolvedValue(wireUser);

    await authService.updateProfile({ fullName: 'Ella Hart', phone: '+44 7700 900002' });

    expect(api.patch).toHaveBeenCalledWith('/auth/me', {
      full_name: 'Ella Hart',
      phone: '+44 7700 900002',
    });
  });

  it('sends an explicit null when the guest clears their phone number', async () => {
    // Sending undefined would be dropped from the JSON body and the old number
    // would survive, so clearing the field would silently fail.
    api.patch.mockResolvedValue({ ...wireUser, phone: null });

    await authService.updateProfile({ fullName: 'Ella Hart' });

    expect(api.patch).toHaveBeenCalledWith('/auth/me', {
      full_name: 'Ella Hart',
      phone: null,
    });
  });
});

describe('changePassword', () => {
  it('posts both passwords under their API field names', async () => {
    api.post.mockResolvedValue(undefined);

    await authService.changePassword('Guest#2026', 'Guest#2027');

    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      current_password: 'Guest#2026',
      new_password: 'Guest#2027',
    });
  });
});

describe('restore', () => {
  it('returns null without calling the API when there is no stored session', async () => {
    tokens.hasSession.mockResolvedValue(false);

    await expect(authService.restore()).resolves.toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('rebuilds the user from a surviving refresh token', async () => {
    tokens.hasSession.mockResolvedValue(true);
    api.get.mockResolvedValue(wireUser);

    await expect(authService.restore()).resolves.toMatchObject({ id: 2 });
  });

  it('clears the stored tokens when the session can no longer be rebuilt', async () => {
    // A revoked or expired refresh token must not leave the app stuck
    // retrying a dead session on every launch.
    tokens.hasSession.mockResolvedValue(true);
    api.get.mockRejectedValue(new Error('Not authenticated'));

    await expect(authService.restore()).resolves.toBeNull();
    expect(tokens.clear).toHaveBeenCalledTimes(1);
  });
});

describe('logout', () => {
  it('revokes the refresh token server-side then clears it locally', async () => {
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');
    api.post.mockResolvedValue(undefined);

    await authService.logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout', { refresh_token: 'refresh-xyz' });
    expect(tokens.clear).toHaveBeenCalledTimes(1);
  });

  it('skips the server call when there is no refresh token to revoke', async () => {
    tokens.getRefreshToken.mockResolvedValue(null);

    await authService.logout();

    expect(api.post).not.toHaveBeenCalled();
    expect(tokens.clear).toHaveBeenCalledTimes(1);
  });

  it('still signs the user out locally when the server is unreachable', async () => {
    // Being unable to reach the server must never trap someone in a session
    // they have asked to leave.
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');
    api.post.mockRejectedValue(new Error('Network request failed'));

    await expect(authService.logout()).resolves.toBeUndefined();
    expect(tokens.clear).toHaveBeenCalledTimes(1);
  });
});

describe('biometric enrolment', () => {
  const wireEnrolment = {
    id: 9,
    device_id: 'device-abc',
    device_label: "Ella's iPhone",
    created_at: '2026-08-01T09:00:00Z',
    last_used_at: null,
    biometric_token: 'super-secret-token',
  };

  it('posts the device identity and returns the one-time secret', async () => {
    api.post.mockResolvedValue(wireEnrolment);

    await expect(
      authService.enrolBiometric('device-abc', "Ella's iPhone"),
    ).resolves.toMatchObject({
      id: 9,
      deviceId: 'device-abc',
      deviceLabel: "Ella's iPhone",
      biometricToken: 'super-secret-token',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/biometric/enroll', {
      device_id: 'device-abc',
      device_label: "Ella's iPhone",
    });
  });

  it('enrols against the signed-in session rather than anonymously', async () => {
    // Enrolment binds a device to the current account, so it must carry the
    // bearer token; an anonymous call would bind nothing.
    api.post.mockResolvedValue(wireEnrolment);

    await authService.enrolBiometric('device-abc', "Ella's iPhone");

    expect(api.post).toHaveBeenCalledWith('/auth/biometric/enroll', expect.anything());
    expect(api.post.mock.calls[0]).toHaveLength(2);
  });
});

describe('biometric login', () => {
  it('exchanges the device secret for a session anonymously', async () => {
    api.post.mockResolvedValue(wireSession);

    await authService.biometricLogin(
      'ella.hart@example.test',
      'device-abc',
      'super-secret-token',
    );

    expect(api.post).toHaveBeenCalledWith(
      '/auth/biometric/login',
      {
        email: 'ella.hart@example.test',
        device_id: 'device-abc',
        biometric_token: 'super-secret-token',
      },
      { anonymous: true },
    );
  });

  it('stores the resulting tokens like any other sign-in', async () => {
    api.post.mockResolvedValue(wireSession);

    await authService.biometricLogin('ella.hart@example.test', 'device-abc', 'secret');

    expect(tokens.setTokens).toHaveBeenCalledWith('access-abc', 'refresh-xyz');
  });
});

describe('enrolled devices', () => {
  it('maps every device in the list', async () => {
    api.get.mockResolvedValue([
      {
        id: 9,
        device_id: 'device-abc',
        device_label: "Ella's iPhone",
        created_at: '2026-08-01T09:00:00Z',
        last_used_at: '2026-08-20T18:30:00Z',
      },
      {
        id: 10,
        device_id: 'device-def',
        device_label: 'Pixel 9',
        created_at: '2026-08-02T09:00:00Z',
        last_used_at: null,
      },
    ]);

    await expect(authService.listBiometricDevices()).resolves.toEqual([
      {
        id: 9,
        deviceId: 'device-abc',
        deviceLabel: "Ella's iPhone",
        createdAt: '2026-08-01T09:00:00Z',
        lastUsedAt: '2026-08-20T18:30:00Z',
      },
      {
        id: 10,
        deviceId: 'device-def',
        deviceLabel: 'Pixel 9',
        createdAt: '2026-08-02T09:00:00Z',
        lastUsedAt: null,
      },
    ]);
    expect(api.get).toHaveBeenCalledWith('/auth/biometric/devices');
  });

  it('returns an empty list when no device is enrolled', async () => {
    api.get.mockResolvedValue([]);

    await expect(authService.listBiometricDevices()).resolves.toEqual([]);
  });

  it('removes a single device by credential id', async () => {
    api.delete.mockResolvedValue(undefined);

    await authService.removeBiometricDevice(9);

    expect(api.delete).toHaveBeenCalledWith('/auth/biometric/devices/9');
  });
});
