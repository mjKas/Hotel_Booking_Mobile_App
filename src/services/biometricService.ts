import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ApiError } from '../api/apiError';
import type { AuthSession } from '../types/domain';
import { authService } from './authService';

/**
 * Biometric sign-in for administrator accounts.
 *
 * Enrolment asks the server for a one-time secret and writes it to SecureStore
 * with `requireAuthentication`, which puts it behind the Android Keystore /
 * iOS Keychain biometric gate. Signing in reads it back - the OS prompts for a
 * fingerprint or face - and exchanges it for a normal session.
 *
 * The enrolment itself lives on the server, so an administrator can revoke it
 * from the web app. When that happens the exchange returns 401 and we wipe the
 * local state here, which is what makes the remote reset visible on the phone.
 */

const DEVICE_ID_KEY = 'hotel.device_id';
const ENROLLED_EMAIL_KEY = 'hotel.biometric_email';
const CREDENTIAL_ID_KEY = 'hotel.biometric_credential_id';
const DECLINED_KEY = 'hotel.biometric_declined';
const SECRET_KEY = 'hotel_biometric_token';

const PROMPT = 'Unlock Royal Crest admin';

export class BiometricResetError extends Error {
  constructor() {
    super(
      'An administrator reset biometric sign-in on this device. ' +
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

function randomId(): string {
  // Not security-sensitive: the device id only has to be stable and unique per
  // install. The secret behind it is what authenticates.
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${random()}${random()}${Date.now().toString(36)}`;
}

/** A label the account owner will recognise in the web app's device list. */
function deviceLabel(): string {
  const name = Device.deviceName?.trim();
  const model = Device.modelName?.trim();

  return (name || model || `${Platform.OS} device`).slice(0, 80);
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
   * Whether this handset can actually hold an enrolment.
   *
   * `canUseBiometricAuthentication` is the decisive check: it reports whether
   * SecureStore can store a value with `requireAuthentication`, which needs a
   * *strong* biometric (Class 3). A weak one - some face unlocks - would pass
   * `isEnrolledAsync` and then throw when we tried to write the secret.
   *
   * The LocalAuthentication checks are still worth making, because they are
   * what the sign-in prompt itself depends on.
   */
  async isSupported(): Promise<boolean> {
    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      return (
        hasHardware &&
        isEnrolled &&
        SecureStore.canUseBiometricAuthentication()
      );
    } catch {
      return false;
    }
  },

  /** The account this device is enrolled for, or null if it is not enrolled. */
  async getEnrolledEmail(): Promise<string | null> {
    return AsyncStorage.getItem(ENROLLED_EMAIL_KEY);
  },

  async isEnrolledOnThisDevice(): Promise<boolean> {
    return (await this.getEnrolledEmail()) !== null;
  },

  /**
   * Whether the user has already said no to the enrolment offer on this
   * device. Asking once is helpful; asking at every sign-in is nagging.
   */
  async hasDeclinedEnrolment(): Promise<boolean> {
    return (await AsyncStorage.getItem(DECLINED_KEY)) === 'true';
  },

  async declineEnrolment(): Promise<void> {
    await AsyncStorage.setItem(DECLINED_KEY, 'true');
  },

  async getCredentialId(): Promise<number | null> {
    const value = await AsyncStorage.getItem(CREDENTIAL_ID_KEY);
    return value ? Number(value) : null;
  },

  /**
   * Registers this device against the signed-in administrator account.
   * Requires an active session - call it straight after a password login.
   */
  async enrol(email: string): Promise<void> {
    const deviceId = await this.getDeviceId();
    const enrolment = await authService.enrolBiometric(
      deviceId,
      deviceLabel(),
    );

    // Written behind the OS biometric gate; reading it back triggers a prompt.
    await SecureStore.setItemAsync(
      SECRET_KEY,
      enrolment.biometricToken,
      { requireAuthentication: true },
    );

    await AsyncStorage.multiSet([
      [ENROLLED_EMAIL_KEY, email],
      [CREDENTIAL_ID_KEY, String(enrolment.id)],
    ]);

    await AsyncStorage.removeItem(DECLINED_KEY);
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
      });
    } catch {
      // The keystore entry is gone - typically because the user changed their
      // device passcode or re-enrolled their fingerprint, which invalidates it.
      secret = null;
    }

    if (!secret) {
      await this.clearLocal();
      throw new BiometricResetError();
    }

    const deviceId = await this.getDeviceId();

    try {
      return await authService.biometricLogin(
        email,
        deviceId,
        secret,
      );
    } catch (error) {
      // 401 here means the server-side enrolment is gone: an administrator
      // reset it from the web app, the password changed, or the account was
      // suspended. Either way this device can no longer use biometrics.
      if (error instanceof ApiError && error.isUnauthorized) {
        await this.clearLocal();
        throw new BiometricResetError();
      }

      throw error;
    }
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
