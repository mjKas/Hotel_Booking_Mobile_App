import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuthStore } from '@/src/store/authStore';

/**
 * Client-side guards for the router.
 *
 * These are a usability aid, not a security boundary - the API re-checks every
 * request. Their job is to stop a deep link (`hotelbookingmobile://admin`)
 * dropping someone into a screen they cannot load data for.
 *
 * `_layout.tsx` holds the splash until the session has been restored, so by the
 * time these render the status is settled.
 */

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Redirect href="/customer/tabs" />;
  }

  return <>{children}</>;
}

/** Keeps a signed-in user out of the login and register screens. */
export function RequireAnonymous({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return (
      <Redirect
        href={user.role === 'ADMIN' ? '/admin' : '/customer/tabs'}
      />
    );
  }

  return <>{children}</>;
}
