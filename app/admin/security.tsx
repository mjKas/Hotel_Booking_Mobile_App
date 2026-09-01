import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  Divider,
  Switch,
  Text,
} from 'react-native-paper';
import { useFocusEffect } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { EmptyState } from '@/src/components/screen-states';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatDateTime } from '@/src/lib/format';
import { biometricService } from '@/src/services/biometricService';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/authStore';
import type { BiometricDevice } from '@/src/types/domain';

/**
 * Biometric sign-in settings for the signed-in administrator.
 *
 * The switch enrols or removes *this* device. The list below shows every device
 * on the account, which is how someone notices a phone they no longer have —
 * an administrator can also clear these from the web app.
 */
export default function AdminSecurityScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);

  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsSupported(await biometricService.isSupported());
    setIsEnrolled(await biometricService.isEnrolledOnThisDevice());

    try {
      setDevices(await authService.listBiometricDevices());
    } catch (err) {
      setError(toErrorMessage(err, 'We could not load your devices.'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleToggle(enabled: boolean) {
    if (!user) return;

    setNotice(null);
    setError(null);
    setIsBusy(true);

    try {
      if (enabled) {
        await biometricService.enrol(user.email);
        setNotice(
          'Biometric sign-in is on. You can now unlock this device with your ' +
            'fingerprint or face.',
        );
      } else {
        await biometricService.disable();
        setNotice('Biometric sign-in has been turned off on this device.');
      }

      await load();
    } catch (err) {
      setError(
        toErrorMessage(
          err,
          enabled
            ? 'We could not set up biometric sign-in.'
            : 'We could not turn biometric sign-in off.',
        ),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove(device: BiometricDevice) {
    setNotice(null);
    setError(null);
    setIsBusy(true);

    try {
      await authService.removeBiometricDevice(device.id);

      // If that was this handset, forget the local secret as well.
      const thisDeviceId = await biometricService.getDeviceId();
      if (device.deviceId === thisDeviceId) {
        await biometricService.clearLocal();
      }

      setNotice(
        `${device.deviceLabel || 'That device'} can no longer sign in with ` +
          'biometrics.',
      );

      await load();
    } catch (err) {
      setError(toErrorMessage(err, 'We could not remove that device.'));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      {notice ? (
        <Banner visible icon="check-circle-outline" style={styles.banner}>
          {notice}
        </Banner>
      ) : null}

      {error ? (
        <Banner visible icon="alert-circle-outline" style={styles.banner}>
          {error}
        </Banner>
      ) : null}

      <Card style={styles.card}>
        <Card.Title
          title="Biometric sign-in"
          subtitle="Unlock this device with your fingerprint or face"
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
        />

        <Card.Content>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.toggleTitle}>
                {isEnrolled ? 'On for this device' : 'Off for this device'}
              </Text>

              <Text style={styles.toggleHint}>
                {isSupported
                  ? 'Your password still works, and stays required after any ' +
                    'password change.'
                  : 'This device has no fingerprint or face registered in its ' +
                    'system settings.'}
              </Text>
            </View>

            <Switch
              value={isEnrolled}
              onValueChange={handleToggle}
              disabled={isBusy || (!isSupported && !isEnrolled)}
              color={colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Devices on your account"
          subtitle="An administrator can also reset these from the web app"
          titleStyle={styles.cardTitle}
          subtitleStyle={styles.cardSubtitle}
        />

        <Card.Content>
          {devices.length === 0 ? (
            <EmptyState
              title="No devices set up"
              description="Turn the switch above on to enrol this one."
            />
          ) : (
            devices.map((device, index) => (
              <View key={device.id}>
                {index > 0 ? <Divider style={styles.divider} /> : null}

                <View style={styles.deviceRow}>
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>
                      {device.deviceLabel || 'Unnamed device'}
                    </Text>

                    <Text style={styles.deviceMeta}>
                      Enrolled {formatDate(device.createdAt)}
                    </Text>

                    <Text style={styles.deviceMeta}>
                      {device.lastUsedAt
                        ? `Last used ${formatDateTime(device.lastUsedAt)}`
                        : 'Never used'}
                    </Text>
                  </View>

                  <Button
                    mode="text"
                    compact
                    disabled={isBusy}
                    onPress={() => handleRemove(device)}
                    textColor={colors.error}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 16,
      paddingBottom: 32,
    },

    banner: {
      marginBottom: 12,
      backgroundColor: colors.surfaceVariant,
    },

    card: {
      marginBottom: 16,
      backgroundColor: colors.surface,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    cardSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },

    toggleLabel: {
      flex: 1,
    },

    toggleTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },

    toggleHint: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },

    divider: {
      marginVertical: 12,
      backgroundColor: colors.surfaceVariant,
    },

    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    deviceDetails: {
      flex: 1,
    },

    deviceName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },

    deviceMeta: {
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
