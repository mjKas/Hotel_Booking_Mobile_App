import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomerLogin = () => {
    console.log('Customer login pressed');

    router.replace('/customer');
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
          textColor="#082A55"
        >
          Create an account
        </Button>

      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F8FA',
  },

  card: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  brand: {
    textAlign: 'center',
    color: '#FCA311',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 18,
  },

  title: {
    textAlign: 'center',
    color: '#082A55',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },

  button: {
    marginTop: 8,
    borderRadius: 10,
  },

  adminButton: {
    marginTop: 12,
    borderRadius: 10,
    borderColor: '#082A55',
  },

  buttonContent: {
    height: 50,
  },
});