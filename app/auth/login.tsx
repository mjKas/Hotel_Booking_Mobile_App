import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export default function LoginScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /*
   * We use the theme's surface colour to determine whether
   * we are currently in the dark theme.
   *
   * Light theme surface is normally close to white.
   * Dark theme surface is a dark/navy colour.
   */
  const isDark =
    colors.surface.toLowerCase() !== '#ffffff' &&
    colors.surface.toLowerCase() !== '#fff';

  const handleCustomerLogin = () => {
    console.log('Customer login pressed');
    router.replace('/customer/tabs');
  };

  const handleAdminLogin = () => {
    console.log('Admin login pressed');
    router.replace('/admin');
  };

  /*
   * Button colours
   *
   * Light:
   *   Sign In       = navy
   *   Sign In text  = white
   *
   * Dark:
   *   Sign In       = white
   *   Sign In text  = navy
   *
   * This prevents the button from disappearing against
   * the dark navy card.
   */
  const signInBackground = isDark ? '#FFFFFF' : '#0B315E';
  const signInText = isDark ? '#0B315E' : '#FFFFFF';

  /*
   * Admin button
   *
   * Keep it transparent but give it a clearly visible
   * border and text in both themes.
   */
  const adminText = isDark ? '#FFFFFF' : '#0B315E';
  const adminBorder = isDark ? '#FFFFFF' : '#0B315E';

  /*
   * Register link
   */
  const registerText = isDark ? '#FFFFFF' : '#0B315E';

  return (
    <View style={styles.brandContainer}>
  <View
    style={[
      styles.brandLogo,
      {
        backgroundColor: primaryColor,
      },
    ]}
  >
    <Text
      style={[
        styles.brandLogoText,
        {
          color: secondaryColor,
        },
      ]}
    >
      A
    </Text>
  </View>

  <View>
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
        {/* Appearance */}
        <View style={styles.themeSelector}>
          <ThemeModeSelector />
        </View>

        {/* Email */}
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
          style={styles.input}
          outlineColor={isDark ? '#D6E0EC' : '#E1E1E1'}
          activeOutlineColor={isDark ? '#FFFFFF' : '#0B315E'}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Sign In */}
        <Button
          mode="contained"
          onPress={handleCustomerLogin}
          style={[
            styles.button,
            {
              backgroundColor: signInBackground,
            },
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={{
            color: signInText,
            fontSize: 17,
            fontWeight: '500',
          }}
        >
          Sign In
        </Button>

        {/* Demo Admin Login */}
        <Button
          mode="outlined"
          onPress={handleAdminLogin}
          style={[
            styles.adminButton,
            {
              borderColor: adminBorder,
            },
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={{
            color: adminText,
            fontSize: 17,
            fontWeight: '500',
          }}
        >
          Demo Admin Login
        </Button>

        {/* Create Account */}
        <Button
          mode="text"
          onPress={() => router.push('/auth/register')}
          style={styles.createAccountButton}
          labelStyle={{
            color: registerText,
            fontSize: 17,
            fontWeight: '500',
          }}
        >
          Create an account
        </Button>

      </Surface>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },

    card: {
      padding: 24,
      borderRadius: 18,
      backgroundColor: colors.surface,
    },

    brand: {
      textAlign: 'center',
      color: colors.secondary,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 18,
    },

    title: {
      textAlign: 'center',
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
    },

    subtitle: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 17,
      marginTop: 8,
      marginBottom: 28,
    },

    themeSelector: {
      marginBottom: 22,
    },

    input: {
      marginBottom: 15,
      backgroundColor: colors.surface,
    },

    button: {
      marginTop: 8,
      borderRadius: 10,
    },

    adminButton: {
      marginTop: 12,
      borderRadius: 10,
      borderWidth: 1.5,
    },

    createAccountButton: {
      marginTop: 2,
    },

    buttonContent: {
      height: 50,
    },
  });