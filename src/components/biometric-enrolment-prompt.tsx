import { useCallback, useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { biometricService } from '@/src/services/biometricService';
import { useAuthStore } from '@/src/store/authStore';

/**
 * Offers biometric sign-in to an administrator once, after they have signed in
 * with a password.
 *
 * This lives in the admin area rather than on the login screen on purpose: the
 * anonymous-only guard redirects the instant the session lands, so a dialog
 * raised during sign-in would be torn down before anyone saw it.
 */
export function BiometricEnrolmentPrompt() {
  const colors = useAppThemeColors();
  const user = useAuthStore((state) => state.user);

  const [isVisible, setIsVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function check() {
        if (user?.role !== 'ADMIN') return;

        const [enrolled, declined, supported] = await Promise.all([
          biometricService.isEnrolledOnThisDevice(),
          biometricService.hasDeclinedEnrolment(),
          biometricService.isSupported(),
        ]);

        if (!cancelled && !enrolled && !declined && supported) {
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
    } catch (error) {
      // Enrolment is a convenience - never block the admin over it.
      console.warn('Biometric enrolment failed', error);
    } finally {
      setIsEnrolling(false);
      setIsVisible(false);
    }
  }

  async function handleDecline() {
    setIsVisible(false);
    await biometricService.declineEnrolment();
  }

  return (
    <Portal>
      <Dialog
        visible={isVisible}
        onDismiss={handleDecline}
        dismissable={!isEnrolling}
      >
        <Dialog.Title>Enable biometric sign-in?</Dialog.Title>

        <Dialog.Content>
          <Text style={{ color: colors.textSecondary }}>
            Next time you can sign in on this device with your fingerprint or
            face instead of typing your password. You can turn this off under
            Security, and an administrator can reset it from the web app.
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleDecline} disabled={isEnrolling}>
            Not now
          </Button>

          <Button
            onPress={handleEnable}
            loading={isEnrolling}
            disabled={isEnrolling}
          >
            Enable
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
