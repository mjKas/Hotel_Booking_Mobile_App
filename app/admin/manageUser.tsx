import React, { useState } from 'react';
import {
  Alert,
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
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';

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
  const [role, setRole] = useState<'Customer' | 'Admin'>(
    'Customer',
  );

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Manage Users
            </Text>

            <Text style={styles.headerSubtitle}>
              {users.length} users
            </Text>
          </View>

          <Button
            mode="text"
            onPress={openAddUser}
            icon="plus"
            textColor="#000000"
            labelStyle={styles.addButtonLabel}
          >
            Add
          </Button>
        </View>

        {/* Theme */}
        <View style={styles.themeSelector}>
          <ThemeModeSelector />
        </View>

        {/* Users */}
        <View style={styles.userList}>
          {users.map((user) => (
            <Surface
              key={user.id}
              elevation={2}
              style={styles.userCard}
            >
              <View style={styles.userTopRow}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.name}
                  </Text>

                  <Text style={styles.userRole}>
                    {user.role}
                  </Text>
                </View>
              </View>

              <View style={styles.userDetails}>
                <Text style={styles.detailText}>
                  {user.email}
                </Text>

                {user.phone ? (
                  <Text style={styles.detailText}>
                    {user.phone}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => openEditUser(user)}
                  style={styles.editButton}
                  contentStyle={styles.actionContent}
                  labelStyle={styles.editButtonLabel}
                >
                  Edit
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => handleDelete(user)}
                  style={styles.deleteButton}
                  contentStyle={styles.actionContent}
                  labelStyle={styles.deleteButtonLabel}
                >
                  Delete
                </Button>
              </View>
            </Surface>
          ))}

          {users.length === 0 && (
            <Surface
              elevation={1}
              style={styles.emptyCard}
            >
              <Text style={styles.emptyTitle}>
                No users found
              </Text>

              <Text style={styles.emptyText}>
                Add a new user to get started.
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Modal */}
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
                <Text style={styles.modalTitle}>
                  {editingUser
                    ? 'Edit User'
                    : 'Add User'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {editingUser
                    ? 'Update the user information'
                    : 'Create a new user account'}
                </Text>

                <TextInput
                  mode="outlined"
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.modalInput}
                  error={
                    submitted && !name.trim()
                  }
                  textColor={colors.textPrimary}
                  outlineColor={colors.textFieldOutline}
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

                <TextInput
                  mode="outlined"
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.modalInput}
                  error={
                    submitted && !email.trim()
                  }
                  textColor={colors.textPrimary}
                  outlineColor={colors.textFieldOutline}
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

                <TextInput
                  mode="outlined"
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  style={styles.modalInput}
                  textColor={colors.textPrimary}
                  outlineColor={colors.textFieldOutline}
                  activeOutlineColor={
                    colors.textFieldActiveOutline
                  }
                  placeholderTextColor={
                    colors.textFieldPlaceholder
                  }
                />

                <Text style={styles.roleLabel}>
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
                      role === 'Customer'
                        ? colors.textPrimary
                        : colors.textPrimary
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

                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  contentStyle={styles.saveButtonContent}
                  buttonColor={colors.secondary}
                  textColor={colors.textPrimary}
                >
                  {editingUser
                    ? 'Save Changes'
                    : 'Add User'}
                </Button>

                <Button
                  mode="text"
                  onPress={closeModal}
                  style={styles.cancelButton}
                  textColor={colors.textSecondary}
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

const createStyles = (
  colors: ReturnType<typeof useAppThemeColors>,
) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 40,
    },

    header: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 42,
      paddingTop: 42,
      paddingBottom: 36,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerTitle: {
      color: '#FFFFFF',
      fontSize: 34,
      fontWeight: '800',
    },

    headerSubtitle: {
      color: '#FFFFFF',
      fontSize: 18,
      marginTop: 4,
    },

    addButtonLabel: {
      color: '#000000',
      fontSize: 18,
      fontWeight: '500',
    },

    themeSelector: {
      paddingHorizontal: 34,
      paddingTop: 18,
      paddingBottom: 8,
    },

    userList: {
      paddingHorizontal: 34,
      paddingTop: 18,
      gap: 18,
    },

    userCard: {
      backgroundColor: colors.surface,
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
      backgroundColor: colors.primary,
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
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '800',
    },

    userRole: {
      color: colors.secondary,
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
      color: colors.textSecondary,
      fontSize: 16,
    },

    actions: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 24,
    },

    editButton: {
      flex: 1,
      borderColor: colors.secondary,
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
      color: colors.secondary,
      fontSize: 17,
      fontWeight: '600',
    },

    deleteButtonLabel: {
      color: '#FF8A8A',
      fontSize: 17,
      fontWeight: '600',
    },

    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
    },

    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },

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
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
    },

    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      marginTop: 5,
      marginBottom: 24,
    },

    modalInput: {
      marginBottom: 12,
      backgroundColor: colors.surface,
    },

    errorText: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 8,
      marginTop: -6,
    },

    roleLabel: {
      color: colors.textPrimary,
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