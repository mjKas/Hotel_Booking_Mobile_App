import { Redirect } from 'expo-router';

import { useAuthStore } from '@/src/store/authStore';

/**
 * Entry point. Sends the user wherever their restored session belongs -
 * administrators to the console, customers to the booking tabs, and anyone
 * without a session to the sign-in screen.
 */
export default function Index() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Redirect
      href={user.role === 'ADMIN' ? '/admin' : '/customer/tabs'}
    />
  );
}
