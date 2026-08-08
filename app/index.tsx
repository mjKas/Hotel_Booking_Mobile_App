import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  
     return <Redirect href="/auth/login" />;
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#082A55',
  },
});