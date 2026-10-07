import React, { useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput } from 'react-native-paper';

import { ApiError, toErrorMessage } from '@/src/api/apiError';
import { BrandHeader, countLabel } from '@/src/components/brand-header';
import { FormModal, useFormInputProps } from '@/src/components/form-modal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import {
  useCreateUser,
  useDeleteUser,
  useResetUserBiometric,
  useUpdateUser,
  useUserBiometricDevices,
  useUsers,
} from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { biometricService } from '@/src/services/biometricService';
import { useAuthStore } from '@/src/store/authStore';
import { ROLE_LABELS, type Role, type User } from '@/src/types/domain';

const ROLES: Role[] = ['REGISTERED_USER', 'ADMIN'];

export default function ManageUser() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const inputProps = useFormInputProps();

  const currentUser = useAuthStore((state) => state.user);

  const { data: users, isPending, isError, error, refetch } = useUsers();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('REGISTERED_USER');
  const [password, setPassword] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // A new account needs a password; the API's rule is 10 characters with
  // mixed case and a digit, so check it here rather than after the round trip.
  const isPasswordValid =
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const openAddUser = () => {
    Keyboard.dismiss();
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('REGISTERED_USER');
    setPassword('');
    setSubmitted(false);
    setFormError(null);
    setModalVisible(true);
  };

  const openEditUser = (user: User) => {
    Keyboard.dismiss();
    setEditingUser(user);
    setName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setRole(user.role);
    setPassword('');
    setSubmitted(false);
    setFormError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSubmitted(false);
    setFormError(null);
  };

  const handleSave = async () => {
    setSubmitted(true);
    setFormError(null);

    if (!name.trim() || (!editingUser && !isEmailValid)) {
      return;
    }

    if (!editingUser && !isPasswordValid) {
      return;
    }

    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          userId: editingUser.id,
          payload: {
            fullName: name.trim(),
            phone: phone.trim() || null,
            role,
            // Editing here never changes the suspension state; that is a
            // separate decision made from the web console.
            status: editingUser.status,
          },
        });
      } else {
        await createUser.mutateAsync({
          fullName: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          role,
        });
      }

      const savedName = name.trim();
      const wasEditing = editingUser !== null;

      closeModal();

      Alert.alert(
        wasEditing ? 'Account updated' : 'Account created',
        `${savedName} has been saved.`,
      );
    } catch (err) {
      // The API refuses self-demotion and duplicate emails with a 409.
      setFormError(
        err instanceof ApiError && err.fieldErrors?.email
          ? err.fieldErrors.email
          : toErrorMessage(err, 'We could not save this account.'),
      );
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.fullName}? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUser.mutate(user.id, {
              onSuccess: () =>
                Alert.alert(
                  'Account deleted',
                  `${user.fullName} has been removed.`,
                ),
              onError: (err) =>
                Alert.alert(
                  'Could not delete',
                  // Accounts with booking history cannot be deleted; the
                  // server says so (409) and suggests suspending instead.
                  toErrorMessage(
                    err,
                    'We could not delete this account.',
                  ),
                ),
            });
          },
        },
      ],
    );
  };

  if (isPending) {
    return <LoadingState label="Loading accounts…" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        fallback="We could not load the accounts."
      />
    );
  }

  const saving = createUser.isPending || updateUser.isPending;

  return (
    <View style={styles.container}>
      <BrandHeader
        title="Manage Users"
        subtitle={countLabel(users.length, 'account')}
        action={{ label: 'Add', icon: 'plus', onPress: openAddUser }}
      />

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          <EmptyState
            title="No users found"
            description="Add a new user to get started."
            actionLabel="Add a user"
            onAction={openAddUser}
          />
        }
        renderItem={({ item }) => (
          <UserCard
            user={item}
            isCurrentUser={item.id === currentUser?.id}
            deleting={deleteUser.isPending && deleteUser.variables === item.id}
            onEdit={() => openEditUser(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <FormModal
        visible={modalVisible}
        title={editingUser ? 'Edit User' : 'Add User'}
        subtitle={
          editingUser
            ? 'Update the user information'
            : 'Create a new user account'
        }
        onClose={closeModal}
        onSubmit={handleSave}
        submitLabel={editingUser ? 'Save' : 'Create'}
        submitting={saving}
        error={formError}
      >
        <TextInput
          {...inputProps}
          label="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          error={submitted && !name.trim()}
        />

        {submitted && !name.trim() ? (
          <HelperText type="error" style={styles.helper}>
            Please enter the user&apos;s name.
          </HelperText>
        ) : null}

        <TextInput
          {...inputProps}
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          editable={!editingUser}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          error={!editingUser && submitted && !isEmailValid}
          right={
            editingUser ? <TextInput.Icon icon="lock-outline" /> : undefined
          }
        />

        {editingUser ? (
          <Text style={styles.fieldNote}>
            The API does not support changing an email address yet.
          </Text>
        ) : submitted && !isEmailValid ? (
          <HelperText type="error" style={styles.helper}>
            Please enter a valid email address.
          </HelperText>
        ) : null}

        <TextInput
          {...inputProps}
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType={editingUser ? 'done' : 'next'}
        />

        {!editingUser ? (
          <>
            <TextInput
              {...inputProps}
              label="Temporary Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              error={submitted && !isPasswordValid}
            />

            <HelperText
              type={submitted && !isPasswordValid ? 'error' : 'info'}
              style={styles.helper}
            >
              At least 10 characters, with upper and lower case and a number.
            </HelperText>
          </>
        ) : null}

        <Text style={styles.fieldLabel}>Role</Text>

        <View style={styles.chipRow}>
          {ROLES.map((option) => (
            <Chip
              key={option}
              selected={role === option}
              showSelectedCheck={false}
              onPress={() => setRole(option)}
              disabled={editingUser?.id === currentUser?.id}
              style={[
                styles.chip,
                role === option && { backgroundColor: colors.secondary },
              ]}
              textStyle={role === option ? styles.chipTextActive : undefined}
            >
              {ROLE_LABELS[option]}
            </Chip>
          ))}
        </View>
      </FormModal>
    </View>
  );
}

/**
 * One account, with its own biometric device count so a reset is visible on
 * the card the moment it succeeds.
 */
function UserCard({
  user,
  isCurrentUser,
  deleting,
  onEdit,
  onDelete,
}: {
  user: User;
  isCurrentUser: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const devices = useUserBiometricDevices(user.id);
  const resetBiometric = useResetUserBiometric();

  const deviceCount = devices.data?.length ?? 0;

  const biometricSummary = devices.isPending
    ? 'Checking biometric sign-in…'
    : devices.isError
      ? 'Biometric status unavailable'
      : deviceCount === 0
        ? 'Biometric sign-in not set up'
        : `Biometric sign-in on ${countLabel(deviceCount, 'device')}`;

  const handleReset = () => {
    Alert.alert(
      'Reset biometric sign-in',
      `Every device enrolled against ${user.email} will lose biometric ` +
        'access. They can still sign in with their password and set it up ' +
        'again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetBiometric.mutate(user.id, {
              onSuccess: async () => {
                // Resetting your own account also forgets this phone's copy.
                if (await biometricService.isEnrolledFor(user.email)) {
                  await biometricService.clearLocal();
                }

                Alert.alert(
                  'Biometric sign-in reset',
                  `${user.email} will be asked for a password on their next ` +
                    'sign-in.',
                );
              },
              onError: (err) =>
                Alert.alert(
                  'Could not reset',
                  toErrorMessage(err, 'We could not reset biometric sign-in.'),
                ),
            });
          },
        },
      ],
    );
  };

  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {user.fullName}
            {isCurrentUser ? ' (you)' : ''}
          </Text>

          <Text style={styles.role}>
            {ROLE_LABELS[user.role].toUpperCase()}
            {user.status === 'SUSPENDED' ? ' · SUSPENDED' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>{user.email}</Text>
        {user.phone ? (
          <Text style={styles.detailText}>{user.phone}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onEdit}
          textColor={colors.secondary}
          style={[styles.actionButton, { borderColor: colors.secondary }]}
          contentStyle={styles.actionContent}
        >
          Edit
        </Button>

        <Button
          mode="outlined"
          onPress={onDelete}
          disabled={isCurrentUser || deleting}
          loading={deleting}
          textColor={colors.error}
          style={[
            styles.actionButton,
            {
              borderColor: colors.error,
              opacity: isCurrentUser ? 0.45 : 1,
            },
          ]}
          contentStyle={styles.actionContent}
        >
          Delete
        </Button>
      </View>

      <View style={styles.biometricRow}>
        <Text style={styles.biometricText}>{biometricSummary}</Text>

        <Button
          mode="text"
          icon="fingerprint"
          compact
          onPress={handleReset}
          loading={resetBiometric.isPending}
          disabled={
            resetBiometric.isPending ||
            (devices.isSuccess && deviceCount === 0)
          }
          textColor={colors.textPrimary}
        >
          Reset biometric
        </Button>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    list: {
      padding: 16,
      paddingBottom: 40,
    },

    card: {
      marginBottom: 14,
      borderRadius: 14,
      padding: 18,
      backgroundColor: colors.surface,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.secondary,
    },

    avatarText: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    info: {
      flex: 1,
      marginLeft: 14,
    },

    name: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
    },

    role: {
      fontSize: 13,
      fontWeight: '800',
      marginTop: 3,
      letterSpacing: 0.4,
      color: colors.secondary,
    },

    details: {
      marginTop: 14,
      gap: 4,
    },

    detailText: {
      fontSize: 15,
      color: colors.textSecondary,
    },

    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15,
    },

    actionButton: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1.5,
    },

    actionContent: {
      height: 44,
    },

    biometricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 8,
    },

    biometricText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
    },

    helper: {
      paddingHorizontal: 0,
      marginTop: -8,
      marginBottom: 6,
    },

    fieldNote: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: -8,
      marginBottom: 10,
    },

    fieldLabel: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginTop: 4,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },

    chip: {
      backgroundColor: colors.background,
    },

    chipTextActive: {
      color: '#000000',
      fontWeight: '700',
    },
  });
