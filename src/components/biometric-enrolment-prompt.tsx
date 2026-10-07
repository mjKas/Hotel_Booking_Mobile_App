import { useCallback, useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import {
  BiometricCancelledError,
  biometricService,
  toBiometricErrorMessage,
  type BiometricAvailability,
} from '@/src/services/biometricService';
import { useAuthStore } from '@/src/store/authStore';

/**
 * Offers biometric sign-in once, to any signed-in account - after a password
 * sign-in or straight after creating an account.
 *
 * It is mounted by both the admin and the customer layouts rather than the
 * login or register screens on purpose: the anonymous-only guard redirects the
 * instant the session lands, so a dialog raised there would be torn down
 * before anyone saw it.
 */
export function BiometricEnrolmentPrompt() {
  const colors = useAppThemeColors();
  const user = useAuthStore((state) => state.user);

  const [availability, setAvailability] =
    useState<BiometricAvailability | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function check() {
        if (!user) return;

        const [enrolled, declined, capability] = await Promise.all([
          biometricService.isEnrolledFor(user.email),
          biometricService.hasDeclinedEnrolment(user.email),
          biometricService.getAvailability(),
        ]);

        if (!cancelled && !enrolled && !declined && capability.supported) {
          setAvailability(capability);
          setResult(null);
          setIsVisible(true);
        }
      }

      void check();

      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  async function handleEnable() {
    if (!user) return;

    setIsEnrolling(true);

    try {
      await biometricService.enrol(user.email);
      setResult(
        `${availability?.label ?? 'Biometric'} sign-in is on. Next time, ` +
          'sign in without typing your password.',
      );
    } catch (error) {
      // Enrolment is a convenience - never block anyone over it - but do say
      // that it did not happen. Remember the answer so it is not offered
      // again on every visit; the Security screen can still turn it on.
      await biometricService.declineEnrolment(user.email);

      setResult(
        error instanceof BiometricCancelledError
          ? 'Biometric sign-in was not turned on. You can turn it on later ' +
              'under Security.'
          : toBiometricErrorMessage(error),
      );
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleDecline() {
    setIsVisible(false);
    if (user) await biometricService.declineEnrolment(user.email);
  }

  const label = availability?.label ?? 'biometric';

  return (
    <Portal>
      <Dialog
        visible={isVisible}
        onDismiss={result ? () => setIsVisible(false) : handleDecline}
        dismissable={!isEnrolling}
        style={{ backgroundColor: colors.surface }}
      >
        <Dialog.Icon icon={availability?.icon ?? 'fingerprint'} />

        <Dialog.Title style={{ color: colors.textPrimary }}>
          {result ? 'Biometric sign-in' : `Enable ${label} sign-in?`}
        </Dialog.Title>

        <Dialog.Content>
          <Text style={{ color: colors.textSecondary }}>
            {result ??
              `Next time you can sign in on this device with ${label} ` +
                'instead of typing your password. Your password keeps ' +
                'working, and you can turn this off under Security.'}
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          {result ? (
            <Button
              onPress={() => setIsVisible(false)}
              textColor={colors.secondary}
            >
              OK
            </Button>
          ) : (
            <>
              <Button
                onPress={handleDecline}
                disabled={isEnrolling}
                textColor={colors.textPrimary}
              >
                Not now
              </Button>

              <Button
                onPress={handleEnable}
                loading={isEnrolling}
                disabled={isEnrolling}
                textColor={colors.secondary}
              >
                Enable
              </Button>
            </>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
