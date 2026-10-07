import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Switch, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { BrandHeader, countLabel } from '@/src/components/brand-header';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { formatDate, formatDateTime } from '@/src/lib/format';
import { authService } from '@/src/services/authService';
import {
  BiometricCancelledError,
  biometricService,
  toBiometricErrorMessage,
  type BiometricAvailability,
} from '@/src/services/biometricService';
import { useAuthStore } from '@/src/store/authStore';
import type { BiometricDevice } from '@/src/types/domain';

type Notice = { tone: 'success' | 'error'; text: string };

/**
 * Biometric sign-in settings for whoever is signed in - guest or
 * administrator. Mounted by both drawers.
 *
 * The switch enrols or removes *this* device. The list below shows every device
 * on the account, which is how someone notices a phone they no longer have.
 */
export function SecurityScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);

  const [availability, setAvailability] =
    useState<BiometricAvailability | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const load = useCallback(async () => {
    if (!user) return;

    const [capability, enrolled] = await Promise.all([
      biometricService.getAvailability(),
      biometricService.isEnrolledFor(user.email),
    ]);

    setAvailability(capability);
    setIsEnrolled(enrolled);

    try {
      setDevices(await authService.listBiometricDevices());
    } catch (err) {
      setNotice({
        tone: 'error',
        text: toErrorMessage(err, 'We could not load your devices.'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleToggle(enabled: boolean) {
    if (!user) return;

    setNotice(null);
    setIsBusy(true);

    try {
      if (enabled) {
        await biometricService.enrol(user.email);
        setNotice({
          tone: 'success',
          text:
            `${availability?.label ?? 'Biometric'} sign-in is on for this ` +
            'device.',
        });
      } else {
        await biometricService.disable();
        setNotice({
          tone: 'success',
          text: 'Biometric sign-in has been turned off on this device.',
        });
      }
    } catch (err) {
      setNotice({
        tone: 'error',
        text:
          err instanceof BiometricCancelledError
            ? err.message
            : toBiometricErrorMessage(
                err,
                enabled
                  ? undefined
                  : 'We could not turn biometric sign-in off. Please try again.',
              ),
      });
    } finally {
      await load();
      setIsBusy(false);
    }
  }

  async function handleRemove(device: BiometricDevice) {
    setNotice(null);
    setIsBusy(true);

    try {
      await authService.removeBiometricDevice(device.id);

      // If that was this handset, forget the local secret as well.
      const thisDeviceId = await biometricService.getDeviceId();
      if (device.deviceId === thisDeviceId) {
        await biometricService.clearLocal();
      }

      // Drop it from the list now rather than waiting for the reload.
      setDevices((current) =>
        current.filter((item) => item.id !== device.id),
      );

      setNotice({
        tone: 'success',
        text:
          `${device.deviceLabel || 'That device'} can no longer sign in ` +
          'with biometrics.',
      });
    } catch (err) {
      setNotice({
        tone: 'error',
        text: toErrorMessage(err, 'We could not remove that device.'),
      });
    } finally {
      await load();
      setIsBusy(false);
    }
  }

  const supported = availability?.supported ?? false;
  const label = availability?.label ?? 'fingerprint or face';

  return (
    <View style={styles.screen}>
      <BrandHeader
        title="Security"
        subtitle={countLabel(devices.length, 'enrolled device')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => void load()}
            tintColor={colors.secondary}
          />
        }
      >
        {notice ? (
          <View
            style={[
              styles.notice,
              notice.tone === 'error' ? styles.noticeError : styles.noticeOk,
            ]}
          >
            <MaterialCommunityIcons
              name={
                notice.tone === 'error'
                  ? 'alert-circle-outline'
                  : 'check-circle-outline'
              }
              size={22}
              color={notice.tone === 'error' ? colors.error : colors.success}
            />
            <Text style={styles.noticeText}>{notice.text}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <MaterialCommunityIcons
              name={
                (availability?.icon ??
                  'fingerprint') as keyof typeof MaterialCommunityIcons.glyphMap
              }
              size={28}
              color={colors.secondary}
            />
            <Text style={styles.cardTitle}>Biometric sign-in</Text>
          </View>

          <Text style={styles.cardSubtitle}>
            Unlock this device with your {label}.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.toggleTitle}>
                {isEnrolled ? 'On for this device' : 'Off for this device'}
              </Text>

              <Text style={styles.toggleHint}>
                {isLoading
                  ? 'Checking this device…'
                  : supported || isEnrolled
                    ? 'Your password still works, and stays required after ' +
                      'any password change.'
                    : availability?.reason ??
                      'Biometric sign-in is not available on this device.'}
              </Text>
            </View>

            <Switch
              value={isEnrolled}
              onValueChange={handleToggle}
              disabled={isBusy || isLoading || (!supported && !isEnrolled)}
              color={colors.secondary}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Devices on your account</Text>

          <Text style={styles.cardSubtitle}>
            Remove a phone you no longer use. An administrator can also reset
            these.
          </Text>

          {devices.length === 0 ? (
            <Text style={styles.empty}>
              {isLoading
                ? 'Loading devices…'
                : 'No devices set up yet. Turn the switch above on to add this one.'}
            </Text>
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
                    mode="outlined"
                    compact
                    disabled={isBusy}
                    onPress={() => handleRemove(device)}
                    textColor={colors.error}
                    style={styles.removeButton}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 16,
      paddingBottom: 40,
    },

    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 16,
      borderRadius: 14,
      marginBottom: 14,
    },

    noticeOk: {
      backgroundColor: colors.successSurface,
    },

    noticeError: {
      backgroundColor: colors.errorSurface,
    },

    noticeText: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },

    card: {
      marginBottom: 14,
      borderRadius: 14,
      padding: 18,
      backgroundColor: colors.surface,
    },

    cardHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    cardTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    cardSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginTop: 6,
      marginBottom: 14,
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
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },

    toggleHint: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },

    empty: {
      color: colors.textSecondary,
      fontSize: 14,
    },

    divider: {
      marginVertical: 12,
      backgroundColor: colors.border,
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
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },

    deviceMeta: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    removeButton: {
      borderColor: colors.error,
      borderRadius: 8,
    },
  });
