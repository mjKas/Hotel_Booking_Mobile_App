import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';

import { useThemeColor } from '@/src/hooks/use-theme-color';
import { ThemeModeSelector } from '@/src/components/theme-mode-selector';

type UserRole = 'Customer' | 'Admin';
type UserStatus = 'Active' | 'Disabled';

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

const initialUsers: User[] = [
  {
    id: 'USR-1001',
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '+94 77 123 4567',
    role: 'Customer',
    status: 'Active',
  },
  {
    id: 'USR-1002',
    fullName: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+94 71 234 5678',
    role: 'Customer',
    status: 'Active',
  },
  {
    id: 'USR-1003',
    fullName: 'David Perera',
    email: 'david@example.com',
    phone: '+94 76 345 6789',
    role: 'Customer',
    status: 'Disabled',
  },
  {
    id: 'USR-1004',
    fullName: 'Admin User',
    email: 'admin@grandstay.com',
    phone: '+94 70 111 2222',
    role: 'Admin',
    status: 'Active',
  },
];

export default function ManageUsersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'textPrimary');
  const secondaryTextColor = useThemeColor(
    {},
    'textSecondary',
  );
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const successSurface = useThemeColor(
    {},
    'successSurface',
  );
  const errorColor = useThemeColor({}, 'error');
  const errorSurface = useThemeColor(
    {},
    'errorSurface',
  );

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    return (
      user.id.toLowerCase().includes(value) ||
      user.fullName.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value) ||
      user.phone.toLowerCase().includes(value) ||
      user.role.toLowerCase().includes(value) ||
      user.status.toLowerCase().includes(value)
    );
  });

  const handleEditUser = (user: User) => {
    router.push({
      pathname: '/admin/edit-user',
      params: {
        id: user.id,
      },
    });
  };

  const handleDeleteUser = (user: User) => {
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
            setUsers((currentUsers) =>
              currentUsers.filter(
                (currentUser) =>
                  currentUser.id !== user.id,
              ),
            );
          },
        },
      ],
    );
  };

  const getStatusColors = (status: UserStatus) => {
    if (status === 'Active') {
      return {
        background: successSurface,
        text: successColor,
      };
    }

    return {
      background: errorSurface,
      text: errorColor,
    };
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardContainer,
        {
          backgroundColor,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text
                style={[
                  styles.title,
                  {
                    color: textColor,
                  },
                ]}
              >
                Manage Users
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                View and manage registered users
              </Text>
            </View>

            <ThemeModeSelector />
          </View>

          <Surface
            elevation={2}
            style={[
              styles.searchCard,
              {
                backgroundColor: surfaceColor,
              },
            ]}
          >
            <TextInput
              mode="flat"
              label="Search users"
              value={search}
              onChangeText={setSearch}
              style={[
                styles.searchInput,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
              textColor={textColor}
              placeholderTextColor={secondaryTextColor}
              left={
                <TextInput.Icon
                  icon="magnify"
                  color={secondaryTextColor}
                />
              }
              right={
                search ? (
                  <TextInput.Icon
                    icon="close"
                    color={secondaryTextColor}
                    onPress={() => setSearch('')}
                  />
                ) : undefined
              }
            />
          </Surface>

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.resultText,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              {filteredUsers.length} user
              {filteredUsers.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {filteredUsers.length === 0 ? (
            <Surface
              elevation={1}
              style={[
                styles.emptyCard,
                {
                  backgroundColor: surfaceColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: textColor,
                  },
                ]}
              >
                No users found
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                Try a different name, email, role or status.
              </Text>
            </Surface>
          ) : (
            filteredUsers.map((user) => {
              const statusColors = getStatusColors(
                user.status,
              );

              return (
                <Surface
                  key={user.id}
                  elevation={2}
                  style={[
                    styles.userCard,
                    {
                      backgroundColor: surfaceColor,
                    },
                  ]}
                >
                  <View style={styles.userHeader}>
                    <View style={styles.userIdentity}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: primaryColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            {
                              color: '#FFFFFF',
                            },
                          ]}
                        >
                          {user.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.nameContainer}>
                        <Text
                          style={[
                            styles.userName,
                            {
                              color: textColor,
                            },
                          ]}
                        >
                          {user.fullName}
                        </Text>

                        <Text
                          style={[
                            styles.userId,
                            {
                              color: secondaryTextColor,
                            },
                          ]}
                        >
                          {user.id}
                        </Text>
                      </View>
                    </View>

                    <Chip
                      compact
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            statusColors.background,
                        },
                      ]}
                      textStyle={{
                        color: statusColors.text,
                        fontWeight: '600',
                      }}
                    >
                      {user.status}
                    </Chip>
                  </View>

                  <Divider
                    style={[
                      styles.divider,
                      {
                        backgroundColor: borderColor,
                      },
                    ]}
                  />

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text
                        style={[
                          styles.infoLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Email
                      </Text>

                      <Text
                        style={[
                          styles.infoValue,
                          {
                            color: textColor,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text
                        style={[
                          styles.infoLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Phone
                      </Text>

                      <Text
                        style={[
                          styles.infoValue,
                          {
                            color: textColor,
                          },
                        ]}
                      >
                        {user.phone || 'Not provided'}
                      </Text>
                    </View>

                    <View style={styles.infoItemSmall}>
                      <Text
                        style={[
                          styles.infoLabel,
                          {
                            color: secondaryTextColor,
                          },
                        ]}
                      >
                        Role
                      </Text>

                      <Chip
                        compact
                        style={[
                          styles.roleChip,
                          {
                            backgroundColor: `${secondaryColor}22`,
                          },
                        ]}
                        textStyle={{
                          color: secondaryColor,
                          fontWeight: '600',
                        }}
                      >
                        {user.role}
                      </Chip>
                    </View>
                  </View>

                  <Divider
                    style={[
                      styles.divider,
                      {
                        backgroundColor: borderColor,
                      },
                    ]}
                  />

                  <View style={styles.actions}>
                    <Button
                      mode="outlined"
                      compact
                      icon="pencil-outline"
                      onPress={() =>
                        handleEditUser(user)
                      }
                      textColor={primaryColor}
                      style={styles.editButton}
                    >
                      Edit
                    </Button>

                    <IconButton
                      icon="delete-outline"
                      iconColor={errorColor}
                      size={23}
                      onPress={() =>
                        handleDeleteUser(user)
                      }
                    />
                  </View>
                </Surface>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  searchCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  searchInput: {
    marginBottom: 0,
  },

  summaryRow: {
    marginBottom: 14,
  },

  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },

  userCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },

  nameContainer: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: '700',
  },

  userId: {
    fontSize: 12,
    marginTop: 3,
  },

  statusChip: {
    marginLeft: 10,
  },

  divider: {
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  infoItem: {
    flex: 1,
  },

  infoItemSmall: {
    width: 120,
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  roleChip: {
    alignSelf: 'flex-start',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  editButton: {
    marginRight: 4,
  },

  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});