import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { ApiError } from '../api/apiError';
import { authService } from './authService';
import {
  BiometricCancelledError,
  BiometricResetError,
  biometricService,
} from './biometricService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// __esModule marks this as an ES module so Babel's interop hands the source the
// same object the test mutates, rather than a one-time copy of its properties.
jest.mock('expo-device', () => ({
  __esModule: true,
  deviceName: null,
  modelName: null,
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  canUseBiometricAuthentication: jest.fn(),
}));

jest.mock('./authService', () => ({
  authService: {
    enrolBiometric: jest.fn(),
    biometricLogin: jest.fn(),
    removeBiometricDevice: jest.fn(),
  },
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const localAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const auth = authService as jest.Mocked<typeof authService>;
const device = Device as { deviceName: string | null; modelName: string | null };

const DEVICE_ID_KEY = 'hotel.device_id';
const ENROLLED_EMAIL_KEY = 'hotel.biometric_email';
const CREDENTIAL_ID_KEY = 'hotel.biometric_credential_id';
const DECLINED_KEY = 'hotel.biometric_declined';
const SECRET_KEY = 'hotel_biometric_token';

const session = {
  user: {
    id: 1,
    email: 'admin@example.test',
    fullName: 'Site Admin',
    phone: null,
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    createdAt: '2026-01-01T00:00:00Z',
  },
  accessToken: 'access-abc',
  refreshToken: 'refresh-xyz',
  expiresInSeconds: 900,
};

beforeEach(() => {
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
  storage.removeItem.mockResolvedValue(undefined);
  storage.multiSet.mockResolvedValue(undefined);
  storage.multiRemove.mockResolvedValue(undefined);
  secureStore.setItemAsync.mockResolvedValue(undefined);
  secureStore.deleteItemAsync.mockResolvedValue(undefined);
  device.deviceName = null;
  device.modelName = null;
});

describe('getDeviceId', () => {
  it('reuses the identifier stored on first run', async () => {
    storage.getItem.mockResolvedValue('device-abc');

    await expect(biometricService.getDeviceId()).resolves.toBe('device-abc');
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('creates and persists an identifier when there is none', async () => {
    const deviceId = await biometricService.getDeviceId();

    expect(deviceId).toEqual(expect.any(String));
    expect(deviceId.length).toBeGreaterThan(0);
    expect(storage.setItem).toHaveBeenCalledWith(DEVICE_ID_KEY, deviceId);
  });

  it('generates a different identifier per install', async () => {
    const first = await biometricService.getDeviceId();
    const second = await biometricService.getDeviceId();

    expect(first).not.toBe(second);
  });
});

describe('isSupported', () => {
  it('is true only when the hardware, an enrolment and strong biometrics all line up', async () => {
    localAuth.hasHardwareAsync.mockResolvedValue(true);
    localAuth.isEnrolledAsync.mockResolvedValue(true);
    secureStore.canUseBiometricAuthentication.mockReturnValue(true);

    await expect(biometricService.isSupported()).resolves.toBe(true);
  });

  it('is false when the handset has no biometric hardware', async () => {
    localAuth.hasHardwareAsync.mockResolvedValue(false);
    localAuth.isEnrolledAsync.mockResolvedValue(true);
    secureStore.canUseBiometricAuthentication.mockReturnValue(true);

    await expect(biometricService.isSupported()).resolves.toBe(false);
  });

  it('is false when the user has not registered a fingerprint or face', async () => {
    localAuth.hasHardwareAsync.mockResolvedValue(true);
    localAuth.isEnrolledAsync.mockResolvedValue(false);
    secureStore.canUseBiometricAuthentication.mockReturnValue(true);

    await expect(biometricService.isSupported()).resolves.toBe(false);
  });

  it('is false when only a weak biometric is available', async () => {
    // A Class 2 face unlock passes isEnrolledAsync but cannot gate the
    // keystore entry, so enrolment would throw later if we said yes here.
    localAuth.hasHardwareAsync.mockResolvedValue(true);
    localAuth.isEnrolledAsync.mockResolvedValue(true);
    secureStore.canUseBiometricAuthentication.mockReturnValue(false);

    await expect(biometricService.isSupported()).resolves.toBe(false);
  });

  it('is false rather than throwing when a native check fails', async () => {
    localAuth.hasHardwareAsync.mockRejectedValue(new Error('module unavailable'));
    localAuth.isEnrolledAsync.mockResolvedValue(true);

    await expect(biometricService.isSupported()).resolves.toBe(false);
  });
});

describe('enrolment state', () => {
  it('reports the enrolled account', async () => {
    storage.getItem.mockResolvedValue('admin@example.test');

    await expect(biometricService.getEnrolledEmail()).resolves.toBe('admin@example.test');
    await expect(biometricService.isEnrolledOnThisDevice()).resolves.toBe(true);
  });

  it('reports no enrolment when nothing is stored', async () => {
    await expect(biometricService.getEnrolledEmail()).resolves.toBeNull();
    await expect(biometricService.isEnrolledOnThisDevice()).resolves.toBe(false);
  });

  it('remembers that the offer was declined', async () => {
    storage.getItem.mockResolvedValue('true');

    await expect(biometricService.hasDeclinedEnrolment()).resolves.toBe(true);
  });

  it('treats anything other than the literal flag as not declined', async () => {
    storage.getItem.mockResolvedValue('false');

    await expect(biometricService.hasDeclinedEnrolment()).resolves.toBe(false);
  });

  it('records a decline so the prompt stops nagging', async () => {
    await biometricService.declineEnrolment();

    expect(storage.setItem).toHaveBeenCalledWith(DECLINED_KEY, 'true');
  });

  it('reads the credential id back as a number', async () => {
    storage.getItem.mockResolvedValue('9');

    await expect(biometricService.getCredentialId()).resolves.toBe(9);
  });

  it('returns null when no credential id is stored', async () => {
    await expect(biometricService.getCredentialId()).resolves.toBeNull();
  });
});

describe('enrol', () => {
  beforeEach(() => {
    auth.enrolBiometric.mockResolvedValue({
      id: 9,
      deviceId: 'device-abc',
      deviceLabel: 'Test device',
      createdAt: '2026-08-01T09:00:00Z',
      lastUsedAt: null,
      biometricToken: 'super-secret-token',
    });
  });

  it('writes the secret behind the OS biometric gate', async () => {
    // Without requireAuthentication the secret could be read by anyone with
    // the unlocked phone, which defeats the whole feature.
    await biometricService.enrol('admin@example.test');

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      SECRET_KEY,
      'super-secret-token',
      { requireAuthentication: true },
    );
  });

  it('records the account and credential id for later sign-ins', async () => {
    await biometricService.enrol('admin@example.test');

    expect(storage.multiSet).toHaveBeenCalledWith([
      [ENROLLED_EMAIL_KEY, 'admin@example.test'],
      [CREDENTIAL_ID_KEY, '9'],
    ]);
  });

  it('clears a previous decline so the state is not contradictory', async () => {
    await biometricService.enrol('admin@example.test');

    expect(storage.removeItem).toHaveBeenCalledWith(DECLINED_KEY);
  });

  it('sends a device label the account owner will recognise', async () => {
    device.deviceName = "  Ella's iPhone  ";

    await biometricService.enrol('admin@example.test');

    expect(auth.enrolBiometric).toHaveBeenCalledWith(expect.any(String), "Ella's iPhone");
  });

  it('falls back to the model name when the device has no user-set name', async () => {
    device.modelName = 'Pixel 9';

    await biometricService.enrol('admin@example.test');

    expect(auth.enrolBiometric).toHaveBeenCalledWith(expect.any(String), 'Pixel 9');
  });

  it('falls back to the platform when neither name is available', async () => {
    await biometricService.enrol('admin@example.test');

    expect(auth.enrolBiometric).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('device'),
    );
  });

  it('stores nothing locally when the server refuses the enrolment', async () => {
    auth.enrolBiometric.mockRejectedValue(new ApiError(403, 'Administrators only.'));

    await expect(biometricService.enrol('guest@example.test')).rejects.toThrow(
      'Administrators only.',
    );
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    expect(storage.multiSet).not.toHaveBeenCalled();
  });
});

describe('signIn', () => {
  function enrolledDevice() {
    storage.getItem.mockImplementation(async (key: string) => {
      if (key === ENROLLED_EMAIL_KEY) return 'admin@example.test';
      if (key === DEVICE_ID_KEY) return 'device-abc';
      if (key === CREDENTIAL_ID_KEY) return '9';
      return null;
    });
  }

  it('refuses before prompting when the device was never enrolled', async () => {
    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricCancelledError);
    expect(localAuth.authenticateAsync).not.toHaveBeenCalled();
  });

  it('exchanges the unlocked secret for a session', async () => {
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue('super-secret-token');
    auth.biometricLogin.mockResolvedValue(session);

    await expect(biometricService.signIn()).resolves.toEqual(session);
    expect(auth.biometricLogin).toHaveBeenCalledWith(
      'admin@example.test',
      'device-abc',
      'super-secret-token',
    );
  });

  it('reads the secret back through the biometric gate', async () => {
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue('super-secret-token');
    auth.biometricLogin.mockResolvedValue(session);

    await biometricService.signIn();

    expect(secureStore.getItemAsync).toHaveBeenCalledWith(SECRET_KEY, {
      requireAuthentication: true,
    });
  });

  it('stops when the user backs out of the prompt', async () => {
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: false } as never);

    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricCancelledError);
    expect(auth.biometricLogin).not.toHaveBeenCalled();
  });

  it('keeps the enrolment intact when the user merely cancels', async () => {
    // Cancelling is not a revocation; wiping local state would force a
    // password re-enrolment after a mistyped fingerprint.
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: false } as never);

    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricCancelledError);
    expect(storage.multiRemove).not.toHaveBeenCalled();
  });

  it('treats an invalidated keystore entry as a reset', async () => {
    // Changing the device passcode or re-registering a fingerprint wipes the
    // entry; the user has to enrol again from a password session.
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockRejectedValue(new Error('key invalidated'));

    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricResetError);
    expect(storage.multiRemove).toHaveBeenCalledWith([
      ENROLLED_EMAIL_KEY,
      CREDENTIAL_ID_KEY,
    ]);
  });

  it('treats a missing secret as a reset', async () => {
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue(null);

    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricResetError);
  });

  it('wipes the device enrolment when an administrator has revoked it remotely', async () => {
    // This is the behaviour the backend suite calls "a reset from the web app
    // locks the device out" - the phone side of that contract.
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue('super-secret-token');
    auth.biometricLogin.mockRejectedValue(new ApiError(401, 'Unknown device.'));

    await expect(biometricService.signIn()).rejects.toBeInstanceOf(BiometricResetError);
    expect(storage.multiRemove).toHaveBeenCalledWith([
      ENROLLED_EMAIL_KEY,
      CREDENTIAL_ID_KEY,
    ]);
  });

  it('keeps the enrolment when the exchange fails for an unrelated reason', async () => {
    // A 500 or a network blip is not a revocation; wiping here would make a
    // server outage silently un-enrol every phone.
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue('super-secret-token');
    auth.biometricLogin.mockRejectedValue(new ApiError(500, 'Server error.'));

    await expect(biometricService.signIn()).rejects.toMatchObject({ status: 500 });
    expect(storage.multiRemove).not.toHaveBeenCalled();
  });

  it('offers a password escape hatch on the OS prompt', async () => {
    enrolledDevice();
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as never);
    secureStore.getItemAsync.mockResolvedValue('super-secret-token');
    auth.biometricLogin.mockResolvedValue(session);

    await biometricService.signIn();

    expect(localAuth.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ cancelLabel: 'Use password' }),
    );
  });
});

describe('disable', () => {
  it('revokes the device server-side and forgets it locally', async () => {
    storage.getItem.mockResolvedValue('9');
    auth.removeBiometricDevice.mockResolvedValue(undefined);

    await biometricService.disable();

    expect(auth.removeBiometricDevice).toHaveBeenCalledWith(9);
    expect(storage.multiRemove).toHaveBeenCalledWith([
      ENROLLED_EMAIL_KEY,
      CREDENTIAL_ID_KEY,
    ]);
  });

  it('still clears local state when the server call fails', async () => {
    // The enrolment may already be revoked; the phone must not stay in a
    // half-enrolled state that prompts for a secret the server has forgotten.
    storage.getItem.mockResolvedValue('9');
    auth.removeBiometricDevice.mockRejectedValue(new ApiError(404, 'Unknown device.'));

    await expect(biometricService.disable()).resolves.toBeUndefined();
    expect(storage.multiRemove).toHaveBeenCalled();
  });

  it('skips the server call when no credential id was recorded', async () => {
    await biometricService.disable();

    expect(auth.removeBiometricDevice).not.toHaveBeenCalled();
    expect(storage.multiRemove).toHaveBeenCalled();
  });
});

describe('clearLocal', () => {
  it('deletes the secret and the enrolment markers', async () => {
    await biometricService.clearLocal();

    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(SECRET_KEY, {
      requireAuthentication: true,
    });
    expect(storage.multiRemove).toHaveBeenCalledWith([
      ENROLLED_EMAIL_KEY,
      CREDENTIAL_ID_KEY,
    ]);
  });

  it('still forgets the enrolment when the secret cannot be deleted', async () => {
    secureStore.deleteItemAsync.mockRejectedValue(new Error('already invalidated'));

    await expect(biometricService.clearLocal()).resolves.toBeUndefined();
    expect(storage.multiRemove).toHaveBeenCalled();
  });
});
