import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ApiError } from '../api/apiError';
import type { AuthSession } from '../types/domain';
import { authService } from './authService';

/**
 * Biometric sign-in for every account type - guests and administrators alike.
 *
 * Enrolment asks the server for a one-time secret and writes it to SecureStore
 * with `requireAuthentication`, which puts it behind the Android Keystore /
 * iOS Keychain biometric gate. Signing in reads it back - the OS prompts for a
 * fingerprint or face - and exchanges it for a normal session. No password and
 * no biometric data is ever stored; the OS keeps the biometrics to itself.
 *
 * One account is enrolled per device. The secret is tied server-side to that
 * account's email and this install's device id, and the exchange is checked
 * against the enrolled email, so one person's face cannot open another
 * person's account on a shared phone. Enrolling a second account replaces the
 * first on this device.
 *
 * The enrolment itself lives on the server, so an administrator can revoke it.
 * When that happens the exchange returns 401 and we wipe the local state here,
 * which is what makes the remote reset visible on the phone.
 */

const DEVICE_ID_KEY = 'hotel.device_id';
const ENROLLED_EMAIL_KEY = 'hotel.biometric_email';
const CREDENTIAL_ID_KEY = 'hotel.biometric_credential_id';
const DECLINED_KEY = 'hotel.biometric_declined';
const SECRET_KEY = 'hotel_biometric_token';

const PROMPT = 'Sign in to Royal Crest Hotel';

/** Shown instead of native exception text, which means nothing to a guest. */
export const BIOMETRIC_SETUP_FAILED =
  'Biometric authentication could not be enabled. Please check your device ' +
  'settings and try again.';

export class BiometricResetError extends Error {
  constructor() {
    super(
      'Biometric sign-in was reset for this device. ' +
        'Please sign in with your password.',
    );
    this.name = 'BiometricResetError';
  }
}

export class BiometricCancelledError extends Error {
  constructor(message = 'Biometric sign-in was cancelled.') {
    super(message);
    this.name = 'BiometricCancelledError';
  }
}

export class BiometricUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BiometricUnavailableError';
  }
}

export type BiometricKind = 'face' | 'fingerprint' | 'iris' | 'generic';

export interface BiometricAvailability {
  supported: boolean;
  kind: BiometricKind;
  /** "Face ID", "Touch ID", "fingerprint"... for button labels. */
  label: string;
  /** A MaterialCommunityIcons name matching the sensor. */
  icon: string;
  /** Why it is unavailable, in words a guest can act on. */
  reason?: string;
}

const UNSUPPORTED: BiometricAvailability = {
  supported: false,
  kind: 'generic',
  label: 'biometrics',
  icon: 'fingerprint',
};

function randomId(): string {
  // Not security-sensitive: the device id only has to be stable and unique per
  // install. The secret behind it is what authenticates.
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${random()}${random()}${Date.now().toString(36)}`;
}

/** A label the account owner will recognise in the device list. */
function deviceLabel(): string {
  const name = Device.deviceName?.trim();
  const model = Device.modelName?.trim();

  return (name || model || `${Platform.OS} device`).slice(0, 80);
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function declinedKey(email: string): string {
  return `${DECLINED_KEY}:${normaliseEmail(email)}`;
}

/** Both platforms report a dismissed prompt as a "canceled" error message. */
function isCancellation(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? '');
  return /cancel/i.test(message);
}

/**
 * Picks the sensor the sign-in button should show. iPhones offer either Face
 * ID or Touch ID; Android phones are matched on fingerprint first because
 * that is the strong (Class 3) sensor SecureStore can use on most handsets.
 */
function describeSensor(
  types: LocalAuthentication.AuthenticationType[],
): Omit<BiometricAvailability, 'supported' | 'reason'> {
  const hasFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );
  const hasIris = types.includes(
    LocalAuthentication.AuthenticationType.IRIS,
  );

  if (Platform.OS === 'ios') {
    if (hasFace) {
      return { kind: 'face', label: 'Face ID', icon: 'face-recognition' };
    }
    if (hasFingerprint) {
      return { kind: 'fingerprint', label: 'Touch ID', icon: 'fingerprint' };
    }
  } else {
    if (hasFingerprint) {
      return {
        kind: 'fingerprint',
        label: 'fingerprint',
        icon: 'fingerprint',
      };
    }
    if (hasFace) {
      return {
        kind: 'face',
        label: 'face unlock',
        icon: 'face-recognition',
      };
    }
    if (hasIris) {
      return { kind: 'iris', label: 'iris scan', icon: 'eye-outline' };
    }
  }

  return { kind: 'generic', label: 'biometrics', icon: 'fingerprint' };
}

export const biometricService = {
  /** Stable per-install identifier, created on first use. */
  async getDeviceId(): Promise<string> {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (existing) {
      return existing;
    }

    const deviceId = randomId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);

    return deviceId;
  },

  /**
   * Whether this handset can hold an enrolment, and which sensor it uses.
   *
   * `canUseBiometricAuthentication` is the decisive check: it reports whether
   * SecureStore can store a value with `requireAuthentication`, which needs a
   * *strong* biometric (Class 3). A weak one - some face unlocks - would pass
   * `isEnrolledAsync` and then throw when we tried to write the secret.
   */
  async getAvailability(): Promise<BiometricAvailability> {
    if (Platform.OS === 'web') {
      return {
        ...UNSUPPORTED,
        reason: 'Biometric sign-in is only available in the mobile app.',
      };
    }

    // Expo Go is a shared app whose Info.plist has no NSFaceIDUsageDescription,
    // so SecureStore refuses `requireAuthentication` there on iOS. The key is
    // added by the config plugins in app.json, which only apply to a build of
    // this app (a development build or a store build).
    if (
      Platform.OS === 'ios' &&
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ) {
      return {
        ...UNSUPPORTED,
        kind: 'face',
        label: 'Face ID',
        icon: 'face-recognition',
        reason:
          'Face ID sign-in needs the installed Royal Crest app. It is not ' +
          'available when running inside Expo Go.',
      };
    }

    try {
      const [hasHardware, isEnrolled, types] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);

      const sensor = describeSensor(types);

      if (!hasHardware) {
        return {
          ...UNSUPPORTED,
          ...sensor,
          reason: 'This device does not have a fingerprint or face sensor.',
        };
      }

      if (!isEnrolled) {
        return {
          ...UNSUPPORTED,
          ...sensor,
          reason:
            `Set up ${sensor.label} in your device settings first, then ` +
            'come back here.',
        };
      }

      if (!SecureStore.canUseBiometricAuthentication()) {
        return {
          ...UNSUPPORTED,
          ...sensor,
          reason:
            'This device’s biometric sensor is not secure enough to protect ' +
            'your sign-in.',
        };
      }

      return { supported: true, ...sensor };
    } catch (error) {
      if (__DEV__) {
        console.warn('Biometric capability check failed', error);
      }

      return {
        ...UNSUPPORTED,
        reason: 'Biometric sign-in is not available on this device.',
      };
    }
  },

  async isSupported(): Promise<boolean> {
    return (await this.getAvailability()).supported;
  },

  /** The account this device is enrolled for, or null if it is not enrolled. */
  async getEnrolledEmail(): Promise<string | null> {
    return AsyncStorage.getItem(ENROLLED_EMAIL_KEY);
  },

  async isEnrolledOnThisDevice(): Promise<boolean> {
    return (await this.getEnrolledEmail()) !== null;
  },

  /**
   * Whether *this* account is the one enrolled here. Another person's
   * enrolment on a shared phone must not read as "on" for you.
   */
  async isEnrolledFor(email: string): Promise<boolean> {
    const enrolled = await this.getEnrolledEmail();
    return enrolled !== null && normaliseEmail(enrolled) === normaliseEmail(email);
  },

  /**
   * Whether this account has already said no to the enrolment offer on this
   * device. Asking once is helpful; asking at every sign-in is nagging. Kept
   * per account so one person declining does not hide it from the next.
   */
  async hasDeclinedEnrolment(email: string): Promise<boolean> {
    return (await AsyncStorage.getItem(declinedKey(email))) === 'true';
  },

  async declineEnrolment(email: string): Promise<void> {
    await AsyncStorage.setItem(declinedKey(email), 'true');
  },

  async getCredentialId(): Promise<number | null> {
    const value = await AsyncStorage.getItem(CREDENTIAL_ID_KEY);
    return value ? Number(value) : null;
  },

  /**
   * Registers this device against the signed-in account, whatever its role.
   * Requires an active session - call it straight after a password sign-in or
   * a registration.
   */
  async enrol(email: string): Promise<void> {
    const availability = await this.getAvailability();

    if (!availability.supported) {
      throw new BiometricUnavailableError(
        availability.reason ?? 'Biometric sign-in is not available here.',
      );
    }

    // Prove the person holding the phone owns the biometrics before tying
    // them to this account.
    const check = await LocalAuthentication.authenticateAsync({
      promptMessage: `Turn on ${availability.label} sign-in`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });

    if (!check.success) {
      throw new BiometricCancelledError(
        'Biometric sign-in was not turned on.',
      );
    }

    // A shared phone holds one enrolment. Someone else's local secret goes
    // before this account's is written, so the two can never be mixed up.
    if (!(await this.isEnrolledFor(email))) {
      await this.clearLocal();
    }

    const deviceId = await this.getDeviceId();
    const enrolment = await authService.enrolBiometric(
      deviceId,
      deviceLabel(),
    );

    try {
      // Written behind the OS biometric gate; reading it back triggers a prompt.
      await SecureStore.setItemAsync(
        SECRET_KEY,
        enrolment.biometricToken,
        {
          requireAuthentication: true,
          authenticationPrompt: PROMPT,
        },
      );
    } catch (error) {
      // The server already holds a credential this phone can never use. Take it
      // back so it does not linger as a "Never used" device.
      try {
        await authService.removeBiometricDevice(enrolment.id);
      } catch {
        // Best effort - the device list still offers Remove.
      }

      throw error;
    }

    await AsyncStorage.multiSet([
      [ENROLLED_EMAIL_KEY, normaliseEmail(email)],
      [CREDENTIAL_ID_KEY, String(enrolment.id)],
    ]);

    await AsyncStorage.removeItem(declinedKey(email));
  },

  /**
   * Prompts for the fingerprint or face, then exchanges the unlocked secret
   * for a session.
   *
   * Throws `BiometricCancelledError` if the user backs out, and
   * `BiometricResetError` if the server no longer recognises this device.
   */
  async signIn(): Promise<AuthSession> {
    const email = await this.getEnrolledEmail();

    if (!email) {
      throw new BiometricCancelledError(
        'Biometric sign-in has not been set up on this device.',
      );
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: PROMPT,
      cancelLabel: 'Use password',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      throw new BiometricCancelledError();
    }

    let secret: string | null = null;

    try {
      secret = await SecureStore.getItemAsync(SECRET_KEY, {
        requireAuthentication: true,
        authenticationPrompt: PROMPT,
      });
    } catch (error) {
      // Backing out of the keychain prompt is not a reason to forget the
      // enrolment.
      if (isCancellation(error)) {
        throw new BiometricCancelledError();
      }

      // Otherwise the keystore entry is gone - typically because the user
      // changed their passcode or re-enrolled a fingerprint, which
      // invalidates it.
      secret = null;
    }

    if (!secret) {
      await this.clearLocal();
      throw new BiometricResetError();
    }

    const deviceId = await this.getDeviceId();

    let session: AuthSession;

    try {
      session = await authService.biometricLogin(
        email,
        deviceId,
        secret,
      );
    } catch (error) {
      // 401 here means the server-side enrolment is gone: an administrator
      // reset it, the password changed, or the account was suspended. Either
      // way this device can no longer use biometrics.
      if (error instanceof ApiError && error.isUnauthorized) {
        await this.clearLocal();
        throw new BiometricResetError();
      }

      throw error;
    }

    // Belt and braces: never accept a session for anyone but the enrolled
    // account.
    if (normaliseEmail(session.user.email) !== normaliseEmail(email)) {
      await authService.logout();
      await this.clearLocal();
      throw new BiometricResetError();
    }

    return session;
  },

  /** Turns biometric sign-in off, on the server and on this device. */
  async disable(): Promise<void> {
    const credentialId = await this.getCredentialId();

    if (credentialId !== null) {
      try {
        await authService.removeBiometricDevice(credentialId);
      } catch {
        // Already revoked server-side; clearing locally is still correct.
      }
    }

    await this.clearLocal();
  },

  /** Forgets the enrolment on this device without calling the server. */
  async clearLocal(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECRET_KEY, {
        requireAuthentication: true,
      });
    } catch {
      // Nothing stored, or the entry was already invalidated.
    }

    await AsyncStorage.multiRemove([
      ENROLLED_EMAIL_KEY,
      CREDENTIAL_ID_KEY,
    ]);
  },
};

/**
 * Turns anything enrolment or sign-in can throw into a sentence for the
 * screen. Server messages are already written for people; native exceptions
 * (FunctionCallException and friends) are logged and replaced.
 */
export function toBiometricErrorMessage(
  error: unknown,
  fallback = BIOMETRIC_SETUP_FAILED,
): string {
  if (
    error instanceof BiometricCancelledError ||
    error instanceof BiometricResetError ||
    error instanceof BiometricUnavailableError
  ) {
    return error.message;
  }

  if (error instanceof ApiError) {
    if (error.isForbidden) {
      return (
        'The server did not allow biometric sign-in for this account. ' +
        'Please contact the front desk.'
      );
    }

    return error.message;
  }

  if (__DEV__) {
    console.warn('Biometric operation failed', error);
  }

  return fallback;
}
