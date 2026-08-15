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
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin';
};

const initialUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+94 77 123 4567',
    role: 'Customer',
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+94 71 456 7890',
    role: 'Customer',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@royalcrest.com',
    phone: '+94 76 111 2233',
    role: 'Admin',
  },
];

export default function ManageUser() {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);

  const [users, setUsers] = useState<User[]>(initialUsers);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] =
    useState<'Customer' | 'Admin'>('Customer');

  const [submitted, setSubmitted] = useState(false);

  const openAddUser = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Customer');
    setSubmitted(false);
    setModalVisible(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setSubmitted(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSubmitted(false);
  };

  const handleSave = () => {
    setSubmitted(true);

    if (!name.trim() || !email.trim()) {
      return;
    }

    if (editingUser) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role,
              }
            : user,
        ),
      );
    } else {
      const newUser: User = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
      };

      setUsers((currentUsers) => [
        ...currentUsers,
        newUser,
      ]);
    }

    closeModal();
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers((currentUsers) =>
              currentUsers.filter(
                (item) => item.id !== user.id,
              ),
            );
          },
        },
      ],
    );
  };

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
                    ? 'user'
                    : 'users'}
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
                      {user.name
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
                      {user.name}
                    </Text>

                    <Text
                      style={[
                        styles.userRole,
                        {
                          color: colors.secondary,
                        },
                      ]}
                    >
                      {user.role}
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
                    Please enter the user's name.
                  </Text>
                )}

                {/* Email */}
                <TextInput
                  mode="outlined"
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
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
                    Please enter the user's email.
                  </Text>
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
                      role === 'Customer'
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() =>
                      setRole('Customer')
                    }
                    style={styles.roleButton}
                    buttonColor={
                      role === 'Customer'
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
                      role === 'Admin'
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() =>
                      setRole('Admin')
                    }
                    style={styles.roleButton}
                    buttonColor={
                      role === 'Admin'
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

                {/* Save */}
                <Button
                  mode="contained"
                  onPress={handleSave}
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