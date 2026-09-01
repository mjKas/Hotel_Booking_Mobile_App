import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { RequireAnonymous } from '@/src/components/route-guards';
import { useAuthStore } from '@/src/store/authStore';
import { toErrorMessage } from '@/src/api/apiError';
import {
  BiometricCancelledError,
  biometricService,
} from '@/src/services/biometricService';
import type { User } from '@/src/types/domain';

export default function LoginScreen() {
  return (
    <RequireAnonymous>
      <LoginForm />
    </RequireAnonymous>
  );
}

function LoginForm() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const primaryColor = useThemeColor({}, 'primary');
  const textPrimaryColor = useThemeColor({}, 'textPrimary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const signIn = useAuthStore((state) => state.signIn);
  const signInWithBiometrics = useAuthStore(
    (state) => state.signInWithBiometrics,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Whether this handset already holds an enrolment, and for whom.
  const [enrolledEmail, setEnrolledEmail] = useState<string | null>(null);

  const isDark =
    colors.surface.toLowerCase() !== '#ffffff' &&
    colors.surface.toLowerCase() !== '#fff';

  const signInBackground = isDark ? '#FFFFFF' : '#0B315E';
  const signInText = isDark ? '#0B315E' : '#FFFFFF';

  const accentText = isDark ? '#FFFFFF' : '#0B315E';
  const accentBorder = isDark ? '#FFFFFF' : '#0B315E';

  // Re-checked on focus so the button disappears as soon as an admin has
  // reset this device from the web app and been bounced back here.
  const refreshEnrolment = useCallback(() => {
    let cancelled = false;

    void biometricService.getEnrolledEmail().then((value) => {
      if (!cancelled) {
        setEnrolledEmail(value);
        if (value) setEmail((current) => current || value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(refreshEnrolment);

  useEffect(refreshEnrolment, [refreshEnrolment]);

  function goHome(user: User) {
    router.replace(
      user.role === 'ADMIN' ? '/admin' : '/customer/tabs',
    );
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // The enrolment offer is raised once the admin area mounts, not here:
      // the anonymous-only guard redirects as soon as this resolves, which
      // would tear down any dialog this screen tried to show.
      goHome(await signIn({
        email: email.trim(),
        password,
      }));
    } catch (err) {
      setError(toErrorMessage(err, 'We could not sign you in.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBiometricSignIn() {
    setError(null);
    setIsUnlocking(true);

    try {
      goHome(await signInWithBiometrics());
    } catch (err) {
      // Backing out of the OS prompt is not an error worth shouting about.
      if (!(err instanceof BiometricCancelledError)) {
        setError(
          toErrorMessage(err, 'We could not verify your biometrics.'),
        );
      }

      // A reset clears the local enrolment, so re-read it either way.
      setEnrolledEmail(await biometricService.getEnrolledEmail());
    } finally {
      setIsUnlocking(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Surface style={styles.card} elevation={3}>

            {/* Brand */}
            <View style={styles.brandContainer}>
              <Image
                source={require('../../assets/images/royal-crest-logo.jpg')}
                style={[
                  styles.brandLogo,
                  {
                    backgroundColor: primaryColor,
                  },
                ]}
                resizeMode="contain"
              />

              <View style={styles.brandTextContainer}>
                <Text
                  style={[
                    styles.brandName,
                    {
                      color: textPrimaryColor,
                    },
                  ]}
                >
                  Royal Crest
                </Text>

                <Text
                  style={[
                    styles.brandHotel,
                    {
                      color: textPrimaryColor,
                    },
                  ]}
                >
                  Hotel
                </Text>

                <Text
                  style={[
                    styles.brandReservations,
                    {
                      color: textSecondaryColor,
                    },
                  ]}
                >
                  RESERVATIONS
                </Text>
              </View>
            </View>

            {/* Heading */}
            <Text
              style={[
                styles.title,
                {
                  color: textPrimaryColor,
                },
              ]}
            >
              Welcome Back
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: textSecondaryColor,
                },
              ]}
            >
              Sign in to continue
            </Text>

            {/* Appearance */}
            <View style={styles.themeSelector}>
              <ThemeModeSelector />
            </View>

            {error ? (
              <HelperText
                type="error"
                visible
                style={styles.errorText}
              >
                {error}
              </HelperText>
            ) : null}

            {/* Biometric unlock, only once this device has been enrolled */}
            {enrolledEmail ? (
              <>
                <Button
                  mode="outlined"
                  icon="fingerprint"
                  onPress={handleBiometricSignIn}
                  loading={isUnlocking}
                  disabled={isUnlocking || isSubmitting}
                  style={[
                    styles.biometricButton,
                    {
                      borderColor: accentBorder,
                    },
                  ]}
                  contentStyle={styles.buttonContent}
                  labelStyle={[
                    styles.buttonLabel,
                    {
                      color: accentText,
                    },
                  ]}
                >
                  Sign in with biometrics
                </Button>

                <Text
                  style={[
                    styles.biometricHint,
                    {
                      color: textSecondaryColor,
                    },
                  ]}
                >
                  Set up for {enrolledEmail}
                </Text>
              </>
            ) : null}

            {/* Email */}
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={styles.input}
              outlineColor={isDark ? '#D6E0EC' : '#E1E1E1'}
              activeOutlineColor={isDark ? '#FFFFFF' : '#0B315E'}
              textColor={colors.textPrimary}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Password */}
            <TextInput
              label="Password"
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              onSubmitEditing={handleSignIn}
              style={styles.input}
              outlineColor={isDark ? '#D6E0EC' : '#E1E1E1'}
              activeOutlineColor={isDark ? '#FFFFFF' : '#0B315E'}
              textColor={colors.textPrimary}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Sign In */}
            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={isSubmitting}
              disabled={isSubmitting || isUnlocking}
              style={[
                styles.button,
                {
                  backgroundColor: signInBackground,
                },
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={[
                styles.buttonLabel,
                {
                  color: signInText,
                },
              ]}
            >
              Sign In
            </Button>

            {/* Create Account */}
            <Button
              mode="text"
              onPress={() => router.push('/auth/register')}
              disabled={isSubmitting || isUnlocking}
              style={styles.createAccountButton}
              labelStyle={[
                styles.createAccountLabel,
                {
                  color: accentText,
                },
              ]}
            >
              Create an account
            </Button>

          </Surface>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },

    container: {
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },

    card: {
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
      paddingHorizontal: 24,
      paddingVertical: 26,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },

    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },

    brandLogo: {
      width: 58,
      height: 58,
      borderRadius: 12,
      marginRight: 12,
    },

    brandTextContainer: {
      justifyContent: 'center',
    },

    brandName: {
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 22,
    },

    brandHotel: {
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 22,
    },

    brandReservations: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 2,
      marginTop: 2,
    },

    title: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 8,
    },

    subtitle: {
      textAlign: 'center',
      fontSize: 17,
      marginBottom: 24,
    },

    themeSelector: {
      marginBottom: 22,
    },

    errorText: {
      fontSize: 14,
      marginBottom: 6,
      paddingHorizontal: 0,
    },

    biometricButton: {
      marginBottom: 6,
      borderRadius: 10,
      borderWidth: 1.5,
    },

    biometricHint: {
      textAlign: 'center',
      fontSize: 13,
      marginBottom: 18,
    },

    input: {
      marginBottom: 15,
      backgroundColor: colors.surface,
    },

    button: {
      marginTop: 8,
      borderRadius: 10,
    },

    createAccountButton: {
      marginTop: 6,
    },

    buttonContent: {
      height: 50,
    },

    buttonLabel: {
      fontSize: 17,
      fontWeight: '500',
    },

    createAccountLabel: {
      fontSize: 17,
      fontWeight: '500',
    },
  });
