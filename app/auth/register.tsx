import React, { useState } from 'react';
import {
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

export default function RegisterScreen() {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const textColor = useThemeColor({}, 'text');
  const textPrimaryColor = useThemeColor({}, 'textPrimary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  // Text field theme colors
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

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitted, setSubmitted] = useState(false);

  // Validation
  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPasswordValid = password.length >= 8;

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleRegister = () => {
    setSubmitted(true);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !isEmailValid ||
      !isPasswordValid ||
      !passwordsMatch
    ) {
      return;
    }

    const values = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
    };

    // TODO:
    // Connect this to your Spring Boot registration API.
    //
    // Example:
    // await registerUser(values);

    console.log('Registration:', values);
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

          {/* Registration Card */}
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
            <Text
              style={[
                styles.brand,
                {
                  color: secondaryColor,
                },
              ]}
            >
              GrandStay
            </Text>

            {/* Heading */}
            <Text
              style={[
                styles.title,
                {
                  color: textColor,
                },
              ]}
            >
              Create Account
            </Text>

            {/* Subtitle */}
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
              error={
                submitted && !fullName.trim()
              }
              style={[
                styles.input,
                inputStyle,
              ]}
              outlineColor={textFieldOutline}
              activeOutlineColor={
                textFieldActiveOutline
              }
              textColor={textFieldText}
              placeholderTextColor={
                textFieldPlaceholder
              }
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
              style={[
                styles.input,
                inputStyle,
              ]}
              outlineColor={textFieldOutline}
              activeOutlineColor={
                textFieldActiveOutline
              }
              textColor={textFieldText}
              placeholderTextColor={
                textFieldPlaceholder
              }
            />

            {submitted && !email.trim() && (
              <HelperText type="error">
                Please enter your email address.
              </HelperText>
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
              style={[
                styles.input,
                inputStyle,
              ]}
              outlineColor={textFieldOutline}
              activeOutlineColor={
                textFieldActiveOutline
              }
              textColor={textFieldText}
              placeholderTextColor={
                textFieldPlaceholder
              }
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
              error={
                submitted && !isPasswordValid
              }
              style={[
                styles.input,
                inputStyle,
              ]}
              outlineColor={textFieldOutline}
              activeOutlineColor={
                textFieldActiveOutline
              }
              textColor={textFieldText}
              placeholderTextColor={
                textFieldPlaceholder
              }
            />

            {submitted && !isPasswordValid && (
              <HelperText type="error">
                Password must be at least 8 characters.
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
              error={
                submitted && !passwordsMatch
              }
              style={[
                styles.input,
                inputStyle,
              ]}
              outlineColor={textFieldOutline}
              activeOutlineColor={
                textFieldActiveOutline
              }
              textColor={textFieldText}
              placeholderTextColor={
                textFieldPlaceholder
              }
            />

            {submitted && !passwordsMatch && (
              <HelperText type="error">
                Passwords do not match.
              </HelperText>
            )}

            {/* Create Account Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              style={[
                styles.registerButton,
                {
                  backgroundColor: secondaryColor,
                },
              ]}
              contentStyle={
                styles.registerButtonContent
              }
              labelStyle={[
                styles.registerButtonLabel,
                {
                  color: textPrimaryColor,
                },
              ]}
            >
              Create Account
            </Button>

            {/* Login Link */}
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
                onPress={() =>
                  router.replace('/login')
                }
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
            Your information is securely protected and
            will only be used to provide our services.
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

  /* Brand */
  brand: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },

  /* Heading */
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },

  /* Appearance */
  themeSelector: {
    marginBottom: 22,
  },

  /* Inputs */
  input: {
    marginBottom: 4,
  },

  /* Button */
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

  /* Login */
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  /* Privacy */
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});