import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { RequireAdmin, RequireAnonymous, RequireAuth } from './route-guards';
import { useAuthStore } from '@/src/store/authStore';
import type { User } from '@/src/types/domain';

// `expo-router`'s real `Redirect` triggers actual navigation side effects, which
// the test renderer has no router context for. Swap it for something that just
// records which href it was asked to redirect to, so we can assert on it.
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Text: MockText } = require('react-native');

  return {
    Redirect: ({ href }: { href: string }) => (
      <MockText testID="redirect">{href}</MockText>
    ),
  };
});

jest.mock('@/src/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

function setUser(user: User | null) {
  mockedUseAuthStore.mockImplementation(
    (selector: (state: { user: User | null }) => unknown) =>
      selector({ user }),
  );
}

const adminUser: User = {
  id: 1,
  email: 'admin@aqqo.com',
  fullName: 'Ada Min',
  phone: null,
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const registeredUser: User = {
  id: 2,
  email: 'guest@aqqo.com',
  fullName: 'Reg Ular',
  phone: null,
  role: 'REGISTERED_USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('RequireAuth', () => {
  it('sends a signed-out visitor to the login screen', async () => {
    setUser(null);

    await render(
      <RequireAuth>
        <Text>Secret content</Text>
      </RequireAuth>,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent('/auth/login');
    // A guard must not render its children alongside the redirect, even for a
    // single frame - that would leak the protected content.
    expect(screen.queryByText('Secret content')).toBeNull();
  });

  it('renders the children for a signed-in user', async () => {
    setUser(registeredUser);

    await render(
      <RequireAuth>
        <Text>Secret content</Text>
      </RequireAuth>,
    );

    expect(screen.getByText('Secret content')).toBeOnTheScreen();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});

describe('RequireAdmin', () => {
  it('sends a signed-out visitor to the login screen', async () => {
    setUser(null);

    await render(
      <RequireAdmin>
        <Text>Admin content</Text>
      </RequireAdmin>,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent('/auth/login');
    expect(screen.queryByText('Admin content')).toBeNull();
  });

  it('sends a signed-in non-admin to the customer tabs', async () => {
    setUser(registeredUser);

    await render(
      <RequireAdmin>
        <Text>Admin content</Text>
      </RequireAdmin>,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent(
      '/customer/tabs',
    );
    expect(screen.queryByText('Admin content')).toBeNull();
  });

  it('renders the children for an admin', async () => {
    setUser(adminUser);

    await render(
      <RequireAdmin>
        <Text>Admin content</Text>
      </RequireAdmin>,
    );

    expect(screen.getByText('Admin content')).toBeOnTheScreen();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});

describe('RequireAnonymous', () => {
  it('renders the children for a signed-out visitor', async () => {
    setUser(null);

    await render(
      <RequireAnonymous>
        <Text>Login form</Text>
      </RequireAnonymous>,
    );

    expect(screen.getByText('Login form')).toBeOnTheScreen();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('sends a signed-in admin away to the admin area', async () => {
    setUser(adminUser);

    await render(
      <RequireAnonymous>
        <Text>Login form</Text>
      </RequireAnonymous>,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent('/admin');
    expect(screen.queryByText('Login form')).toBeNull();
  });

  it('sends a signed-in regular user away to the customer tabs', async () => {
    setUser(registeredUser);

    await render(
      <RequireAnonymous>
        <Text>Login form</Text>
      </RequireAnonymous>,
    );

    expect(screen.getByTestId('redirect')).toHaveTextContent(
      '/customer/tabs',
    );
    expect(screen.queryByText('Login form')).toBeNull();
  });
});
