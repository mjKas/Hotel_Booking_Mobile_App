import { create } from 'zustand';

import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import type { LoginPayload, RegisterPayload, User } from '../types/domain';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  user: User | null;

  /** True once the stored session has been checked on app start. */
  isAdmin: () => boolean;

  restore: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<User>;
  signInWithBiometrics: () => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

/**
 * The single source of truth for who is signed in.
 *
 * Tokens live in `tokenStore` (SecureStore); this holds the user record and the
 * loading state the route guards read.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,

  isAdmin: () => get().user?.role === 'ADMIN',

  async restore() {
    const user = await authService.restore();

    set({
      user,
      status: user ? 'authenticated' : 'anonymous',
    });
  },

  async signIn(payload) {
    const session = await authService.login(payload);

    set({ user: session.user, status: 'authenticated' });

    return session.user;
  },

  async signInWithBiometrics() {
    const session = await biometricService.signIn();

    set({ user: session.user, status: 'authenticated' });

    return session.user;
  },

  async register(payload) {
    const session = await authService.register(payload);

    set({ user: session.user, status: 'authenticated' });

    return session.user;
  },

  async signOut() {
    await authService.logout();

    // The biometric enrolment deliberately survives a sign-out - that is the
    // whole point of it. Only `biometricService.disable()` removes it.
    set({ user: null, status: 'anonymous' });
  },

  setUser(user) {
    set({ user, status: 'authenticated' });
  },
}));
