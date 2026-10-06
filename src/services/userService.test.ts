import { apiClient } from '../api/apiClient';
import { userService } from './userService';
import type { WireBiometricDevice, WireUser } from './mappers';

jest.mock('../api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const wireUser: WireUser = {
  id: 2,
  email: 'ella.hart@example.test',
  full_name: 'Ella Hart',
  phone: '+44 7700 900002',
  role: 'REGISTERED_USER',
  status: 'ACTIVE',
  created_at: '2026-03-02T16:40:00Z',
};

const wireBiometricDevice: WireBiometricDevice = {
  id: 9,
  device_id: 'device-abc',
  device_label: "Ella's iPhone",
  created_at: '2026-08-01T09:00:00Z',
  last_used_at: '2026-08-20T18:30:00Z',
};

describe('userService.list', () => {
  it('requests the users collection with its trailing slash', async () => {
    // FastAPI 307-redirects the bare form, dropping the request body on the way.
    mockedApiClient.get.mockResolvedValue([wireUser]);

    await userService.list();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/users/');
  });

  it('maps every returned user into the camelCase domain shape', async () => {
    mockedApiClient.get.mockResolvedValue([wireUser]);

    const users = await userService.list();

    expect(users).toEqual([
      {
        id: 2,
        email: 'ella.hart@example.test',
        fullName: 'Ella Hart',
        phone: '+44 7700 900002',
        role: 'REGISTERED_USER',
        status: 'ACTIVE',
        createdAt: '2026-03-02T16:40:00Z',
      },
    ]);
  });
});

describe('userService.get', () => {
  it('requests a single user by id without a trailing slash', async () => {
    mockedApiClient.get.mockResolvedValue(wireUser);

    await userService.get(2);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/users/2');
  });

  it('maps the returned user into the domain shape', async () => {
    mockedApiClient.get.mockResolvedValue(wireUser);

    const user = await userService.get(2);

    expect(user.fullName).toBe('Ella Hart');
  });
});

describe('userService.create', () => {
  it('posts to the users collection with its trailing slash and the snake_case payload', async () => {
    mockedApiClient.post.mockResolvedValue(wireUser);

    await userService.create({
      fullName: 'Ella Hart',
      email: 'ella.hart@example.test',
      phone: '+44 7700 900002',
      password: 'correct-horse-battery-staple',
      role: 'REGISTERED_USER',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/users/', {
      full_name: 'Ella Hart',
      email: 'ella.hart@example.test',
      phone: '+44 7700 900002',
      password: 'correct-horse-battery-staple',
      role: 'REGISTERED_USER',
    });
  });

  it('passes an omitted phone straight through as undefined, unlike update', async () => {
    // create has no `?? null` fallback, so a missing phone stays undefined here.
    mockedApiClient.post.mockResolvedValue(wireUser);

    await userService.create({
      fullName: 'No Phone',
      email: 'no.phone@example.test',
      password: 'correct-horse-battery-staple',
      role: 'REGISTERED_USER',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/users/',
      expect.objectContaining({ phone: undefined }),
    );
  });

  it('maps the created user response into the domain shape', async () => {
    mockedApiClient.post.mockResolvedValue(wireUser);

    const user = await userService.create({
      fullName: 'Ella Hart',
      email: 'ella.hart@example.test',
      phone: '+44 7700 900002',
      password: 'correct-horse-battery-staple',
      role: 'REGISTERED_USER',
    });

    expect(user.id).toBe(2);
    expect(user.role).toBe('REGISTERED_USER');
  });
});

describe('userService.update', () => {
  it('puts to the single user endpoint without a trailing slash and the snake_case payload', async () => {
    mockedApiClient.put.mockResolvedValue(wireUser);

    await userService.update(2, {
      fullName: 'Ella Hart',
      phone: '+44 7700 900002',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith('/users/2', {
      full_name: 'Ella Hart',
      phone: '+44 7700 900002',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
  });

  it('nullifies an absent phone rather than sending undefined', async () => {
    mockedApiClient.put.mockResolvedValue(wireUser);

    await userService.update(2, {
      fullName: 'Ella Hart',
      role: 'REGISTERED_USER',
      status: 'ACTIVE',
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith(
      '/users/2',
      expect.objectContaining({ phone: null }),
    );
  });

  it('honours an explicit null phone as well', async () => {
    mockedApiClient.put.mockResolvedValue(wireUser);

    await userService.update(2, {
      fullName: 'Ella Hart',
      phone: null,
      role: 'REGISTERED_USER',
      status: 'ACTIVE',
    });

    expect(mockedApiClient.put).toHaveBeenCalledWith(
      '/users/2',
      expect.objectContaining({ phone: null }),
    );
  });

  it('maps the updated user response into the domain shape', async () => {
    mockedApiClient.put.mockResolvedValue(wireUser);

    const user = await userService.update(2, {
      fullName: 'Ella Hart',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    expect(user.status).toBe('ACTIVE');
  });
});

describe('userService.remove', () => {
  it('deletes the single user endpoint without a trailing slash', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await userService.remove(2);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/users/2');
  });

  it('resolves with no value', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await expect(userService.remove(2)).resolves.toBeUndefined();
  });
});

describe('userService.listBiometricDevices', () => {
  it('requests the biometric devices nested under the user', async () => {
    mockedApiClient.get.mockResolvedValue([wireBiometricDevice]);

    await userService.listBiometricDevices(2);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/users/2/biometric');
  });

  it('maps every returned device into the camelCase domain shape', async () => {
    mockedApiClient.get.mockResolvedValue([wireBiometricDevice]);

    const devices = await userService.listBiometricDevices(2);

    expect(devices).toEqual([
      {
        id: 9,
        deviceId: 'device-abc',
        deviceLabel: "Ella's iPhone",
        createdAt: '2026-08-01T09:00:00Z',
        lastUsedAt: '2026-08-20T18:30:00Z',
      },
    ]);
  });
});

describe('userService.resetBiometric', () => {
  it('deletes the biometric devices nested under the user, revoking every enrolment', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await userService.resetBiometric(2);

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/users/2/biometric');
  });

  it('resolves with no value', async () => {
    mockedApiClient.delete.mockResolvedValue(undefined);

    await expect(userService.resetBiometric(2)).resolves.toBeUndefined();
  });
});
