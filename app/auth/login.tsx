import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
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
  const textPrimaryColor = useThemeColor({}, 'textPrimary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isDark =
    colors.surface.toLowerCase() !== '#ffffff' &&
    colors.surface.toLowerCase() !== '#fff';

  const signInBackground = isDark ? '#FFFFFF' : '#0B315E';
  const signInText = isDark ? '#0B315E' : '#FFFFFF';

  const adminText = isDark ? '#FFFFFF' : '#0B315E';
  const adminBorder = isDark ? '#FFFFFF' : '#0B315E';

  const registerText = isDark ? '#FFFFFF' : '#0B315E';

  const handleCustomerLogin = () => {
    console.log('Customer login pressed');
    router.replace('/customer/tabs');
  };

  const handleAdminLogin = () => {
    console.log('Admin login pressed');
    router.replace('/admin');
  };

  return (
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

        {/* Email */}
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          labelStyle={[
            styles.buttonLabel,
            {
              color: signInText,
            },
          ]}
        >
          Sign In
        </Button>

        {/* Admin Login */}
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
          labelStyle={[
            styles.buttonLabel,
            {
              color: adminText,
            },
          ]}
        >
          Demo Admin Login
        </Button>

        {/* Create Account */}
        <Button
          mode="text"
          onPress={() => router.push('/auth/register')}
          style={styles.createAccountButton}
          labelStyle={[
            styles.createAccountLabel,
            {
              color: registerText,
            },
          ]}
        >
          Create an account
        </Button>

      </Surface>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
      backgroundColor: colors.background,
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

    buttonLabel: {
      fontSize: 17,
      fontWeight: '500',
    },

    createAccountLabel: {
      fontSize: 17,
      fontWeight: '500',
    },
  });