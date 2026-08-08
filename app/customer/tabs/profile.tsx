import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
} from 'react-native-paper';
import { router } from 'expo-router';

export default function CustomerProfileScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={82}
          label="JD"
          color="#FFFFFF"
          style={styles.avatar}
        />

        <Text style={styles.name}>
          John Doe
        </Text>

        <Text style={styles.email}>
          john@example.com
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <List.Item
            title="Full Name"
            description="John Doe"
            left={(props) => (
              <List.Icon {...props} icon="account-outline" />
            )}
          />

          <Divider />

          <List.Item
            title="Email"
            description="john@example.com"
            left={(props) => (
              <List.Icon {...props} icon="email-outline" />
            )}
          />

          <Divider />

          <List.Item
            title="Phone"
            description="+94 77 123 4567"
            left={(props) => (
              <List.Icon {...props} icon="phone-outline" />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Item
          title="My Bookings"
          description="View your reservations"
          left={(props) => (
            <List.Icon {...props} icon="calendar-check-outline" />
          )}
          right={(props) => (
            <List.Icon {...props} icon="chevron-right" />
          )}
          onPress={() =>
            router.push('/bookings/1024')
          }
        />

        <Divider />

        <List.Item
          title="Settings"
          description="App preferences"
          left={(props) => (
            <List.Icon {...props} icon="cog-outline" />
          )}
          right={(props) => (
            <List.Icon {...props} icon="chevron-right" />
          )}
          onPress={() => {}}
        />
      </Card>

      <Button
        mode="outlined"
        icon="logout"
        textColor="#D32F2F"
        style={styles.logout}
        onPress={() => {
          router.replace('/auth/login');
        }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingBottom: 40,
  },

  profileHeader: {
    backgroundColor: '#082A55',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },

  avatar: {
    backgroundColor: '#FCA311',
  },

  name: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 12,
  },

  email: {
    color: '#DCE5F0',
    marginTop: 4,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#082A55',
    marginBottom: 8,
  },

  logout: {
    marginHorizontal: 16,
    marginTop: 25,
    borderColor: '#D32F2F',
    borderRadius: 10,
  },
});