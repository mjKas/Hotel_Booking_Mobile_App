import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Divider,
  HelperText,
  List,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { LoadingState } from '@/src/components/screen-states';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/authStore';

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function CustomerProfileScreen() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const signOut = useAuthStore((state) => state.signOut);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The guard above this screen means a null user only happens mid sign-out.
  if (!user) {
    return <LoadingState label="Loading your profile…" />;
  }

  function openEdit() {
    if (!user) return;
    setError(null);
    setFullName(user.fullName);
    setPhone(user.phone ?? '');
    setIsEditing(true);
  }

  async function handleSave() {
    if (fullName.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      setUser(
        await authService.updateProfile({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
        }),
      );

      setIsEditing(false);
    } catch (err) {
      setError(toErrorMessage(err, 'We could not save your details.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    // Revokes the refresh token server-side before clearing local state.
    await signOut();
    router.replace('/auth/login');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hotel Branding */}
      <View style={styles.branding}>
        <Image
          source={require('../../../assets/images/royal-crest-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.hotelName}>
          Royal Crest Hotel
        </Text>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={82}
          label={initials(user.fullName)}
          color={colors.headerText}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user.fullName}
        </Text>

        <Text style={styles.email}>
          {user.email}
        </Text>
      </View>

      {/* Personal Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <List.Item
            title="Full Name"
            description={user.fullName}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="account-outline"
                color={colors.secondary}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Email"
            description={user.email}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="email-outline"
                color={colors.secondary}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Phone"
            description={user.phone ?? 'Not provided'}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="phone-outline"
                color={colors.secondary}
              />
            )}
          />
        </Card.Content>

        <Card.Actions>
          <Button onPress={openEdit} textColor={colors.primary}>
            Edit details
          </Button>
        </Card.Actions>
      </Card>

      {/* Account Options */}
      <Card style={styles.card}>
        <List.Item
          title="My Bookings"
          description="View your reservations"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          left={(props) => (
            <List.Icon
              {...props}
              icon="calendar-check-outline"
              color={colors.secondary}
            />
          )}
          right={(props) => (
            <List.Icon
              {...props}
              icon="chevron-right"
              color={colors.textSecondary}
            />
          )}
          onPress={() =>
            router.push('/customer/tabs/booking')
          }
        />
      </Card>

      {/* Logout */}
      <Button
        mode="outlined"
        icon="logout"
        textColor={colors.error}
        style={styles.logout}
        onPress={handleSignOut}
      >
        Logout
      </Button>

      <Portal>
        <Dialog
          visible={isEditing}
          onDismiss={() => setIsEditing(false)}
          dismissable={!isSaving}
        >
          <Dialog.Title>Edit your details</Dialog.Title>

          <Dialog.Content>
            <TextInput
              label="Full name"
              mode="outlined"
              value={fullName}
              onChangeText={setFullName}
              style={styles.dialogInput}
            />

            <TextInput
              label="Phone number"
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.dialogInput}
            />

            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingBottom: 40,
    },

    branding: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingTop: 30,
      paddingBottom: 18,
    },

    logo: {
      width: 70,
      height: 70,
      borderRadius: 10,
      marginBottom: 8,
    },

    hotelName: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },

    profileHeader: {
      backgroundColor: colors.primary,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 30,
    },

    avatar: {
      backgroundColor: colors.secondary,
    },

    name: {
      color: colors.headerText,
      fontSize: 23,
      fontWeight: '800',
      marginTop: 12,
    },

    email: {
      color: colors.headerSubtle,
      marginTop: 4,
    },

    card: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 14,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },

    listTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
    },

    listDescription: {
      color: colors.textSecondary,
    },

    dialogInput: {
      marginBottom: 10,
      backgroundColor: colors.surface,
    },

    logout: {
      marginHorizontal: 16,
      marginTop: 25,
      borderColor: colors.error,
      borderRadius: 10,
    },
  });