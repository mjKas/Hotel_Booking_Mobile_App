import { StyleSheet, View } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
} from 'react-native-paper';
import { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Backend authentication will be connected later
    console.log('Login:', email);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome Back
        </Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to continue to your hotel account
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
          onPress={handleLogin}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => {}}
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  title: {
    color: '#082A55',
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  loginButton: {
    marginTop: 8,
    borderRadius: 10,
  },

  buttonContent: {
    height: 50,
  },
});