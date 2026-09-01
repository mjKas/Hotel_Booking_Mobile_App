import React, { useState } from 'react';
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
import { router } from 'expo-router';

import { useThemeColor } from '@/src/hooks/use-theme-color';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { RequireAnonymous } from '@/src/components/route-guards';
import { useAuthStore } from '@/src/store/authStore';
import { ApiError, toErrorMessage } from '@/src/api/apiError';

export default function RegisterScreen() {
  return (
    <RequireAnonymous>
      <RegisterForm />
    </RequireAnonymous>
  );
}

function RegisterForm() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const textPrimaryColor = useThemeColor({}, 'textPrimary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const secondaryColor = useThemeColor({}, 'secondary');

  const textFieldBackground = useThemeColor(
    {},
    'textFieldBackground',
  );

  const textFieldOutline = useThemeColor(
    {},
    'textFieldOutline',
  );

  const textFieldActiveOutline = useThemeColor(
    {},
    'textFieldActiveOutline',
  );

  const textFieldText = useThemeColor(
    {},
    'textFieldText',
  );

  const textFieldPlaceholder = useThemeColor(
    {},
    'textFieldPlaceholder',
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const register = useAuthStore((state) => state.register);

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Mirrors the server's rule in app/schemas/api.py, so a valid-looking form
  // is not rejected after the round trip.
  const isPasswordValid =
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleRegister = async () => {
    setSubmitted(true);
    setFormError(null);
    setEmailError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !isEmailValid ||
      !isPasswordValid ||
      !passwordsMatch
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      // Registration always creates a customer account, and it signs you in.
      router.replace('/customer/tabs');
    } catch (error) {
      // A duplicate email comes back as a 409 with a field error, which
      // belongs on the email input rather than in the general banner.
      if (error instanceof ApiError && error.fieldErrors?.email) {
        setEmailError(error.fieldErrors.email);
      }

      setFormError(
        toErrorMessage(error, 'We could not create your account.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: textFieldBackground,
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Surface
            elevation={3}
            style={[
              styles.card,
              {
                backgroundColor: surfaceColor,
              },
            ]}
          >
            {/* Brand */}
            <View style={styles.brandContainer}>
              <Image
                source={require('../../assets/images/royal-crest-logo.jpg')}
                style={styles.brandLogo}
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
              Create Account
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: textSecondaryColor,
                },
              ]}
            >
              Create an account to get started
            </Text>

            {/* Appearance */}
            <View style={styles.themeSelector}>
              <ThemeModeSelector />
            </View>

            {/* Full Name */}
            <TextInput
              mode="flat"
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="account-outline"
                  color={textFieldPlaceholder}
                />
              }
              error={submitted && !fullName.trim()}
              style={[styles.input, inputStyle]}
              outlineColor={textFieldOutline}
              activeOutlineColor={textFieldActiveOutline}
              textColor={textFieldText}
              placeholderTextColor={textFieldPlaceholder}
            />

            {submitted && !fullName.trim() && (
              <HelperText type="error">
                Please enter your full name.
              </HelperText>
            )}

            {/* Email */}
            <TextInput
              mode="flat"
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="email-outline"
                  color={textFieldPlaceholder}
                />
              }
              error={
                submitted &&
                (!email.trim() || !isEmailValid)
              }
              style={[styles.input, inputStyle]}
              outlineColor={textFieldOutline}
              activeOutlineColor={textFieldActiveOutline}
              textColor={textFieldText}
              placeholderTextColor={textFieldPlaceholder}
            />

            {submitted && !email.trim() && (
              <HelperText type="error">
                Please enter your email address.
              </HelperText>
            )}

            {emailError && (
              <HelperText type="error">{emailError}</HelperText>
            )}

            {submitted &&
              email.trim() &&
              !isEmailValid && (
                <HelperText type="error">
                  Please enter a valid email address.
                </HelperText>
              )}

            {/* Phone */}
            <TextInput
              mode="flat"
              label="Phone Number (Optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="phone-outline"
                  color={textFieldPlaceholder}
                />
              }
              style={[styles.input, inputStyle]}
              outlineColor={textFieldOutline}
              activeOutlineColor={textFieldActiveOutline}
              textColor={textFieldText}
              placeholderTextColor={textFieldPlaceholder}
            />

            {/* Password */}
            <TextInput
              mode="flat"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="lock-outline"
                  color={textFieldPlaceholder}
                />
              }
              right={
                <TextInput.Icon
                  icon={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  color={textFieldPlaceholder}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                />
              }
              error={submitted && !isPasswordValid}
              style={[styles.input, inputStyle]}
              outlineColor={textFieldOutline}
              activeOutlineColor={textFieldActiveOutline}
              textColor={textFieldText}
              placeholderTextColor={textFieldPlaceholder}
            />

            {submitted && !isPasswordValid && (
              <HelperText type="error">
                Use at least 10 characters with an upper case letter, a lower
                case letter and a number.
              </HelperText>
            )}

            {/* Confirm Password */}
            <TextInput
              mode="flat"
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="lock-check-outline"
                  color={textFieldPlaceholder}
                />
              }
              right={
                <TextInput.Icon
                  icon={
                    showConfirmPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  color={textFieldPlaceholder}
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword,
                    )
                  }
                />
              }
              error={submitted && !passwordsMatch}
              style={[styles.input, inputStyle]}
              outlineColor={textFieldOutline}
              activeOutlineColor={textFieldActiveOutline}
              textColor={textFieldText}
              placeholderTextColor={textFieldPlaceholder}
            />

            {submitted && !passwordsMatch && (
              <HelperText type="error">
                Passwords do not match.
              </HelperText>
            )}

            {formError && (
              <HelperText type="error" visible>
                {formError}
              </HelperText>
            )}

            {/* Create Account */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={[
                styles.registerButton,
                {
                  backgroundColor: secondaryColor,
                },
              ]}
              contentStyle={styles.registerButtonContent}
              labelStyle={[
                styles.registerButtonLabel,
                {
                  color: textPrimaryColor,
                },
              ]}
            >
              Create Account
            </Button>

            {/* Sign In */}
            <View style={styles.loginRow}>
              <Text
                variant="bodyMedium"
                style={{
                  color: textSecondaryColor,
                }}
              >
                Already have an account?
              </Text>

              <Button
                mode="text"
                compact
                onPress={() => router.replace('/auth/login')}
                textColor={secondaryColor}
              >
                Sign In
              </Button>
            </View>
          </Surface>

          {/* Privacy Notice */}
          <Text
            variant="bodySmall"
            style={[
              styles.footerText,
              {
                color: textSecondaryColor,
              },
            ]}
          >
            Your information is securely protected and will
            only be used to provide our services.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  container: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  card: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
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
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },

  themeSelector: {
    marginBottom: 22,
  },

  input: {
    marginBottom: 4,
  },

  registerButton: {
    marginTop: 18,
    borderRadius: 10,
  },

  registerButtonContent: {
    height: 50,
  },

  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  footerText: {
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});