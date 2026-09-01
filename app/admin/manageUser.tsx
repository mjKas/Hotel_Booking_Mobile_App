import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import { ApiError, toErrorMessage } from '@/src/api/apiError';
import {
  ErrorState,
  LoadingState,
} from '@/src/components/screen-states';
import {
  useCreateUser,
  useDeleteUser,
  useResetUserBiometric,
  useUpdateUser,
  useUsers,
} from '@/src/hooks/queries';
import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';
import { useAuthStore } from '@/src/store/authStore';
import { ROLE_LABELS, type Role, type User } from '@/src/types/domain';

export default function ManageUser() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const currentUser = useAuthStore((state) => state.user);

  const { data: users, isPending, isError, error, refetch } = useUsers();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetBiometric = useResetUserBiometric();

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

  const openAddUser = () => {
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

    if (!name.trim() || !email.trim()) {
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

      closeModal();
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
      `Are you sure you want to delete ${user.fullName}?`,
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
              onError: (err) =>
                Alert.alert(
                  'Could not delete',
                  // Accounts with booking history cannot be deleted; the
                  // server says so and suggests suspending instead.
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

  const handleResetBiometric = (user: User) => {
    Alert.alert(
      'Reset biometric sign-in',
      `Every device enrolled against ${user.email} will lose biometric ` +
        'access. They can still sign in with their password.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetBiometric.mutate(user.id, {
              onSuccess: () =>
                Alert.alert(
                  'Biometric sign-in reset',
                  `${user.email} will be asked for a password on their next ` +
                    'sign-in.',
                ),
              onError: (err) =>
                Alert.alert(
                  'Could not reset',
                  toErrorMessage(
                    err,
                    'We could not reset biometric sign-in.',
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

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios' ? 'padding' : 'height'
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* ============================= */}
          {/* BRANDING HEADER */}
          {/* Same style as Manage Rooms */}
          {/* ============================= */}

          <View
            style={[
              styles.brandingHeader,
              {
                backgroundColor: colors.secondary,
              },
            ]}
          >
            <View style={styles.brandingContent}>

              {/* Logo */}
              <Image
                source={require('../../assets/images/royal-crest-logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />

              {/* Branding Text */}
              <View style={styles.brandingText}>
                <Text style={styles.hotelName}>
                  Royal Crest Hotel
                </Text>

                <Text style={styles.userCount}>
                  {users.length}{' '}
                  {users.length === 1
                    ? 'account'
                    : 'accounts'}
                </Text>
              </View>

              {/* Add Button */}
              <Button
                mode="text"
                onPress={openAddUser}
                icon="plus"
                textColor="#000000"
                labelStyle={styles.addButtonLabel}
                compact
              >
                Add
              </Button>

            </View>
          </View>

          {/* ============================= */}
          {/* TOP NAVIGATION HEADER */}
          {/* ============================= */}

          <View style={styles.topHeader}>
            <View style={styles.menuPlaceholder} />

            <Text
              style={[
                styles.topHeaderTitle,
                {
                  color: '#FFFFFF',
                },
              ]}
            >
              Manage Users
            </Text>

            <View style={styles.topHeaderSpacer} />
          </View>

          {/* ============================= */}
          {/* USERS */}
          {/* ============================= */}

          <View style={styles.userList}>
            {users.map((user) => (
              <Surface
                key={user.id}
                elevation={2}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                {/* User Top */}
                <View style={styles.userTopRow}>

                  <View
                    style={[
                      styles.userIcon,
                      {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <Text style={styles.userIconText}>
                      {user.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        {
                          color: colors.textPrimary,
                        },
                      ]}
                    >
                      {user.fullName}
                      {user.id === currentUser?.id ? ' (you)' : ''}
                    </Text>

                    <Text
                      style={[
                        styles.userRole,
                        {
                          color: colors.secondary,
                        },
                      ]}
                    >
                      {ROLE_LABELS[user.role]}
                      {user.status === 'SUSPENDED' ? ' · Suspended' : ''}
                    </Text>
                  </View>
                </View>

                {/* User Details */}
                <View style={styles.userDetails}>
                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {user.email}
                  </Text>

                  {user.phone ? (
                    <Text
                      style={[
                        styles.detailText,
                        {
                          color: colors.textSecondary,
                        },
                      ]}
                    >
                      {user.phone}
                    </Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      openEditUser(user)
                    }
                    style={[
                      styles.editButton,
                      {
                        borderColor:
                          colors.secondary,
                      },
                    ]}
                    contentStyle={
                      styles.actionContent
                    }
                    labelStyle={[
                      styles.editButtonLabel,
                      {
                        color: colors.secondary,
                      },
                    ]}
                  >
                    Edit
                  </Button>

                  <Button
                    mode="outlined"
                    disabled={user.id === currentUser?.id}
                    onPress={() =>
                      handleDelete(user)
                    }
                    style={styles.deleteButton}
                    contentStyle={
                      styles.actionContent
                    }
                    labelStyle={
                      styles.deleteButtonLabel
                    }
                  >
                    Delete
                  </Button>
                </View>

                {/* Clears every phone enrolled for biometric sign-in. */}
                <Button
                  mode="text"
                  icon="fingerprint"
                  onPress={() => handleResetBiometric(user)}
                  disabled={resetBiometric.isPending}
                  textColor={colors.textSecondary}
                  contentStyle={styles.actionContent}
                >
                  Reset biometric
                </Button>
              </Surface>
            ))}

            {users.length === 0 && (
              <Surface
                elevation={1}
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor:
                      colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  No users found
                </Text>

                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Add a new user to get started.
                </Text>
              </Surface>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ============================= */}
      {/* ADD / EDIT MODAL */}
      {/* ============================= */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalOverlay}>
            <Surface
              elevation={5}
              style={styles.modalCard}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {editingUser
                    ? 'Edit User'
                    : 'Add User'}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {editingUser
                    ? 'Update the user information'
                    : 'Create a new user account'}
                </Text>

                {/* Name */}
                <TextInput
                  mode="outlined"
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                  error={
                    submitted && !name.trim()
                  }
                  textColor={colors.textPrimary}
                  outlineColor={
                    colors.textFieldOutline
                  }
                  activeOutlineColor={
                    colors.textFieldActiveOutline
                  }
                  placeholderTextColor={
                    colors.textFieldPlaceholder
                  }
                />

                {submitted && !name.trim() && (
                  <Text style={styles.errorText}>
                    Please enter the user&apos;s name.
                  </Text>
                )}

                {/* Email */}
                <TextInput
                  mode="outlined"
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!editingUser}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                  error={
                    submitted && !email.trim()
                  }
                  textColor={colors.textPrimary}
                  outlineColor={
                    colors.textFieldOutline
                  }
                  activeOutlineColor={
                    colors.textFieldActiveOutline
                  }
                  placeholderTextColor={
                    colors.textFieldPlaceholder
                  }
                />

                {submitted && !email.trim() && (
                  <Text style={styles.errorText}>
                    Please enter the user&apos;s email.
                  </Text>
                )}

                {/* Password - only when creating an account */}
                {!editingUser && (
                  <>
                    <TextInput
                      mode="outlined"
                      label="Temporary Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[
                        styles.modalInput,
                        {
                          backgroundColor:
                            colors.surface,
                        },
                      ]}
                      error={submitted && !isPasswordValid}
                      textColor={colors.textPrimary}
                      outlineColor={
                        colors.textFieldOutline
                      }
                      activeOutlineColor={
                        colors.textFieldActiveOutline
                      }
                      placeholderTextColor={
                        colors.textFieldPlaceholder
                      }
                    />

                    {submitted && !isPasswordValid && (
                      <Text style={styles.errorText}>
                        At least 10 characters with an upper case letter, a
                        lower case letter and a number.
                      </Text>
                    )}
                  </>
                )}

                {/* Phone */}
                <TextInput
                  mode="outlined"
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                  textColor={colors.textPrimary}
                  outlineColor={
                    colors.textFieldOutline
                  }
                  activeOutlineColor={
                    colors.textFieldActiveOutline
                  }
                  placeholderTextColor={
                    colors.textFieldPlaceholder
                  }
                />

                {/* Role */}
                <Text
                  style={[
                    styles.roleLabel,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  User Role
                </Text>

                <View style={styles.roleContainer}>
                  <Button
                    mode={
                      role === 'REGISTERED_USER'
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() =>
                      setRole('REGISTERED_USER')
                    }
                    style={styles.roleButton}
                    buttonColor={
                      role === 'REGISTERED_USER'
                        ? colors.secondary
                        : undefined
                    }
                    textColor={
                      colors.textPrimary
                    }
                  >
                    Customer
                  </Button>

                  <Button
                    mode={
                      role === 'ADMIN'
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() =>
                      setRole('ADMIN')
                    }
                    style={styles.roleButton}
                    buttonColor={
                      role === 'ADMIN'
                        ? colors.secondary
                        : undefined
                    }
                    textColor={
                      colors.textPrimary
                    }
                  >
                    Admin
                  </Button>
                </View>

                {formError && (
                  <HelperText type="error" visible>
                    {formError}
                  </HelperText>
                )}

                {/* Save */}
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={
                    createUser.isPending || updateUser.isPending
                  }
                  disabled={
                    createUser.isPending || updateUser.isPending
                  }
                  style={styles.saveButton}
                  contentStyle={
                    styles.saveButtonContent
                  }
                  buttonColor={colors.secondary}
                  textColor={colors.textPrimary}
                >
                  {editingUser
                    ? 'Save Changes'
                    : 'Add User'}
                </Button>

                {/* Cancel */}
                <Button
                  mode="text"
                  onPress={closeModal}
                  style={styles.cancelButton}
                  textColor={
                    colors.textSecondary
                  }
                >
                  Cancel
                </Button>
              </ScrollView>
            </Surface>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ================================================= */
/* STYLES */
/* ================================================= */

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 30,
    },

    container: {
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
    },

    /* ============================= */
    /* TOP HEADER */
    /* ============================= */

    topHeader: {
      height: 80,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },

    menuPlaceholder: {
      width: 48,
    },

    topHeaderTitle: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },

    topHeaderSpacer: {
      width: 48,
    },

    /* ============================= */
    /* BRANDING HEADER */
    /* ============================= */

    brandingHeader: {
      minHeight: 160,
      paddingHorizontal: 42,
      paddingVertical: 22,
      justifyContent: 'center',
    },

    brandingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },

    logo: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: '#FFFFFF',
      marginRight: 18,
    },

    brandingText: {
      flex: 1,
      justifyContent: 'center',
    },

    hotelName: {
      color: '#FFFFFF',
      fontSize: 27,
      fontWeight: '800',
      lineHeight: 32,
    },

    userCount: {
      color: '#FFFFFF',
      fontSize: 18,
      marginTop: 2,
    },

    addButtonLabel: {
      color: '#000000',
      fontSize: 18,
      fontWeight: '500',
    },

    /* ============================= */
    /* USER LIST */
    /* ============================= */

    userList: {
      paddingHorizontal: 34,
      paddingTop: 34,
      gap: 18,
    },

    userCard: {
      borderRadius: 24,
      padding: 28,
    },

    userTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    userIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 18,
    },

    userIconText: {
      color: '#FFFFFF',
      fontSize: 26,
      fontWeight: '800',
    },

    userInfo: {
      flex: 1,
    },

    userName: {
      fontSize: 24,
      fontWeight: '800',
    },

    userRole: {
      fontSize: 15,
      fontWeight: '700',
      marginTop: 3,
      textTransform: 'uppercase',
    },

    userDetails: {
      marginTop: 22,
      gap: 8,
    },

    detailText: {
      fontSize: 16,
    },

    actions: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 24,
    },

    editButton: {
      flex: 1,
      borderWidth: 1.5,
      borderRadius: 12,
    },

    deleteButton: {
      flex: 1,
      borderColor: '#FF8A8A',
      borderWidth: 1.5,
      borderRadius: 12,
    },

    actionContent: {
      height: 50,
    },

    editButtonLabel: {
      fontSize: 17,
      fontWeight: '600',
    },

    deleteButtonLabel: {
      color: '#FF8A8A',
      fontSize: 17,
      fontWeight: '600',
    },

    emptyCard: {
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
    },

    emptyText: {
      fontSize: 16,
      marginTop: 8,
    },

    /* ============================= */
    /* MODAL */
    /* ============================= */

    modalContainer: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },

    modalCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 36,
      maxHeight: '90%',
    },

    modalTitle: {
      fontSize: 28,
      fontWeight: '800',
    },

    modalSubtitle: {
      fontSize: 15,
      marginTop: 5,
      marginBottom: 24,
    },

    modalInput: {
      marginBottom: 12,
    },

    errorText: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 8,
      marginTop: -6,
    },

    roleLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 8,
      marginBottom: 10,
    },

    roleContainer: {
      flexDirection: 'row',
      gap: 12,
    },

    roleButton: {
      flex: 1,
      borderRadius: 10,
    },

    saveButton: {
      marginTop: 26,
      borderRadius: 10,
    },

    saveButtonContent: {
      height: 50,
    },

    cancelButton: {
      marginTop: 4,
    },
  });