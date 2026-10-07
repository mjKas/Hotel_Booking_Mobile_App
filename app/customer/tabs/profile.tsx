import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

import { toErrorMessage } from '@/src/api/apiError';
import { BrandHeader } from '@/src/components/brand-header';
import { FormModal, useFormInputProps } from '@/src/components/form-modal';
import { LoadingState } from '@/src/components/screen-states';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/authStore';
import { ROLE_LABELS } from '@/src/types/domain';

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
  const inputProps = useFormInputProps();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // The guard above this screen means a null user only happens mid sign-out.
  if (!user) {
    return <LoadingState label="Loading your profile…" />;
  }

  function openEdit() {
    if (!user) return;
    setError(null);
    setSaved(false);
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
      // PATCH /auth/me accepts full_name and phone only; the API has no way to
      // change an email address (see docs/BACKEND_ISSUES.md).
      setUser(
        await authService.updateProfile({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
        }),
      );

      setIsEditing(false);
      setSaved(true);
    } catch (err) {
      setError(toErrorMessage(err, 'We could not save your details.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <BrandHeader
        title="My Profile"
        subtitle={ROLE_LABELS[user.role]}
        action={{ label: 'Edit', icon: 'pencil-outline', onPress: openEdit }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Avatar.Text
            size={72}
            label={initials(user.fullName)}
            color="#000000"
            style={styles.avatar}
          />

          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {saved ? (
          <Text style={styles.savedText}>Your details have been saved.</Text>
        ) : null}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>

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
            <Button
              mode="outlined"
              onPress={openEdit}
              textColor={colors.secondary}
              style={styles.editButton}
            >
              Edit details
            </Button>
          </Card.Actions>
        </Card>

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
            onPress={() => router.navigate('/customer/tabs/booking')}
          />

          <Divider />

          <List.Item
            title="Security"
            description="Biometric sign-in and devices"
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            left={(props) => (
              <List.Icon
                {...props}
                icon="shield-account-outline"
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
            onPress={() => router.navigate('/customer/security')}
          />
        </Card>

        <Text style={styles.hint}>
          Sign Out is in the menu (☰) at the top left.
        </Text>
      </ScrollView>

      <FormModal
        visible={isEditing}
        title="Edit your details"
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
        submitLabel="Save"
        submitting={isSaving}
        error={error}
      >
        <TextInput
          {...inputProps}
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          {...inputProps}
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <TextInput
          {...inputProps}
          label="Email"
          value={user.email}
          editable={false}
          right={<TextInput.Icon icon="lock-outline" />}
        />

        <Text style={styles.fieldNote}>
          Email addresses cannot be changed in the app yet. Please contact the
          front desk if yours needs updating.
        </Text>
      </FormModal>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 16,
      paddingBottom: 40,
    },

    profileCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },

    avatar: {
      backgroundColor: colors.secondary,
    },

    name: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 12,
    },

    email: {
      color: colors.textSecondary,
      marginTop: 4,
    },

    savedText: {
      color: colors.success,
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '600',
    },

    card: {
      marginTop: 14,
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

    editButton: {
      borderColor: colors.secondary,
      borderRadius: 8,
    },

    hint: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      fontSize: 13,
    },

    fieldNote: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      marginTop: -6,
      marginBottom: 8,
    },
  });
