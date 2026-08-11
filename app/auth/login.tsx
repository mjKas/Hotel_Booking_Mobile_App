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

export default function LoginScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

        <Text style={styles.brand}>
          GrandStay
        </Text>

        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Sign in to continue
        </Text>

        <View style={styles.themeSelector}>
          <ThemeModeSelector />
        </View>

        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleCustomerLogin}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <Button
          mode="outlined"
          onPress={handleAdminLogin}
          style={styles.adminButton}
          contentStyle={styles.buttonContent}
        >
          Demo Admin Login
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/auth/register')}
          textColor={colors.primary}
        >
          Create an account
        </Button>

      </Surface>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) => StyleSheet.create({
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
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    marginBottom: 15,
    backgroundColor: colors.surface,
  },

  themeSelector: {
    marginBottom: 22,
  },

  button: {
    marginTop: 8,
    borderRadius: 10,
  },

  adminButton: {
    marginTop: 12,
    borderRadius: 10,
    borderColor: colors.primary,
  },

  buttonContent: {
    height: 50,
  },
});
