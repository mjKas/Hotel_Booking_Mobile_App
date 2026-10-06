import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import type { AuthSession, User } from '../types/domain';
import { useAuthStore } from './authStore';

jest.mock('../services/authService', () => ({
  authService: {
    restore: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('../services/biometricService', () => ({
  biometricService: { signIn: jest.fn() },
}));

const auth = authService as jest.Mocked<typeof authService>;
const biometrics = biometricService as jest.Mocked<typeof biometricService>;

const guest: User = {
  id: 2,
  email: 'ella.hart@example.test',
  fullName: 'Ella Hart',
  phone: null,
  role: 'REGISTERED_USER',
  status: 'ACTIVE',
  createdAt: '2026-03-02T16:40:00Z',
};

const admin: User = { ...guest, id: 1, email: 'admin@example.test', role: 'ADMIN' };

function sessionFor(user: User): AuthSession {
  return {
    user,
    accessToken: 'access-abc',
    refreshToken: 'refresh-xyz',
    expiresInSeconds: 900,
  };
}

/** The store is a module singleton, so each test starts it from scratch. */
beforeEach(() => {
  useAuthStore.setState({ status: 'loading', user: null });
});

describe('initial state', () => {
  it('starts in the loading state so guards do not redirect before restore runs', () => {
    // Treating an unrestored session as "anonymous" would bounce a signed-in
    // user to the login screen on every cold start.
    const state = useAuthStore.getState();

    expect(state.status).toBe('loading');
    expect(state.user).toBeNull();
  });
});

describe('isAdmin', () => {
  it('is false while signed out', () => {
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('is false for a registered guest', () => {
    useAuthStore.setState({ user: guest, status: 'authenticated' });

    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('is true for an administrator', () => {
    useAuthStore.setState({ user: admin, status: 'authenticated' });

    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });
});

describe('restore', () => {
  it('settles on authenticated when a stored session is rebuilt', async () => {
    auth.restore.mockResolvedValue(guest);

    await useAuthStore.getState().restore();

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: guest });
  });

  it('settles on anonymous when there is nothing to restore', async () => {
    auth.restore.mockResolvedValue(null);

    await useAuthStore.getState().restore();

    expect(useAuthStore.getState()).toMatchObject({ status: 'anonymous', user: null });
  });

  it('leaves the loading state exactly once, whatever the outcome', async () => {
    auth.restore.mockResolvedValue(null);

    await useAuthStore.getState().restore();

    expect(useAuthStore.getState().status).not.toBe('loading');
  });
});

describe('signIn', () => {
  it('stores the user and returns it to the caller', async () => {
    auth.login.mockResolvedValue(sessionFor(guest));

    await expect(
      useAuthStore.getState().signIn({ email: guest.email, password: 'Guest#2026' }),
    ).resolves.toEqual(guest);

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: guest });
  });

  it('passes the credentials straight through to the service', async () => {
    auth.login.mockResolvedValue(sessionFor(guest));

    await useAuthStore.getState().signIn({ email: guest.email, password: 'Guest#2026' });

    expect(auth.login).toHaveBeenCalledWith({
      email: guest.email,
      password: 'Guest#2026',
    });
  });

  it('leaves the store untouched when the credentials are rejected', async () => {
    // A failed sign-in that flipped the status to authenticated would let the
    // guards wave the visitor through with a null user.
    auth.login.mockRejectedValue(new Error('Incorrect email or password.'));

    await expect(
      useAuthStore.getState().signIn({ email: guest.email, password: 'wrong' }),
    ).rejects.toThrow('Incorrect email or password.');

    expect(useAuthStore.getState()).toMatchObject({ status: 'loading', user: null });
  });
});

describe('signInWithBiometrics', () => {
  it('signs in through the biometric service and stores the user', async () => {
    biometrics.signIn.mockResolvedValue(sessionFor(admin));

    await expect(useAuthStore.getState().signInWithBiometrics()).resolves.toEqual(admin);
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: admin });
  });

  it('does not fall back to a password sign-in', async () => {
    biometrics.signIn.mockResolvedValue(sessionFor(admin));

    await useAuthStore.getState().signInWithBiometrics();

    expect(auth.login).not.toHaveBeenCalled();
  });

  it('propagates a cancelled or revoked enrolment without signing anyone in', async () => {
    biometrics.signIn.mockRejectedValue(new Error('Biometric sign-in was cancelled.'));

    await expect(useAuthStore.getState().signInWithBiometrics()).rejects.toThrow(
      'Biometric sign-in was cancelled.',
    );
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('register', () => {
  it('signs the new account in immediately', async () => {
    auth.register.mockResolvedValue(sessionFor(guest));

    await expect(
      useAuthStore.getState().register({
        fullName: 'Ella Hart',
        email: guest.email,
        password: 'Guest#2026',
      }),
    ).resolves.toEqual(guest);

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: guest });
  });

  it('leaves the store untouched when registration fails', async () => {
    auth.register.mockRejectedValue(new Error('That email is already registered.'));

    await expect(
      useAuthStore.getState().register({
        fullName: 'Ella Hart',
        email: guest.email,
        password: 'Guest#2026',
      }),
    ).rejects.toThrow('That email is already registered.');

    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('signOut', () => {
  it('clears the user and returns to anonymous', async () => {
    useAuthStore.setState({ user: admin, status: 'authenticated' });
    auth.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState()).toMatchObject({ status: 'anonymous', user: null });
  });

  it('revokes the session through the service, not just locally', async () => {
    useAuthStore.setState({ user: admin, status: 'authenticated' });
    auth.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().signOut();

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('no longer reports the signed-out user as an administrator', async () => {
    useAuthStore.setState({ user: admin, status: 'authenticated' });
    auth.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });
});

describe('setUser', () => {
  it('replaces the stored user after a profile edit', () => {
    useAuthStore.setState({ user: guest, status: 'authenticated' });

    useAuthStore.getState().setUser({ ...guest, fullName: 'Ella Hart-Reid' });

    expect(useAuthStore.getState().user?.fullName).toBe('Ella Hart-Reid');
  });

  it('marks the session authenticated', () => {
    useAuthStore.getState().setUser(guest);

    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('reflects a role change immediately in isAdmin', () => {
    // An administrator demoted mid-session must lose the admin tabs without
    // needing to sign out and back in.
    useAuthStore.setState({ user: admin, status: 'authenticated' });

    useAuthStore.getState().setUser({ ...admin, role: 'REGISTERED_USER' });

    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });
});
