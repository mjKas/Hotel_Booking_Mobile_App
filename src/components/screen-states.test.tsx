import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { ApiError } from '@/src/api/apiError';
import { EmptyState, ErrorState, LoadingState } from './screen-states';

// The theme context throws unless it is wrapped in its provider; mocking the
// colour hook directly is simpler than standing up the whole theme context
// for components that only read a handful of colour values from it.
jest.mock('@/src/hooks/use-app-theme-colors', () => ({
  useAppThemeColors: () => ({
    primary: '#123456',
    textPrimary: '#000000',
    textSecondary: '#666666',
  }),
}));

function withPaper(children: ReactNode) {
  return <PaperProvider>{children}</PaperProvider>;
}

describe('LoadingState', () => {
  it('shows the default loading label when none is given', async () => {
    await render(withPaper(<LoadingState />));

    expect(screen.getByText('Loading…')).toBeOnTheScreen();
  });

  it('shows a custom label when one is supplied', async () => {
    await render(withPaper(<LoadingState label="Fetching your bookings…" />));

    expect(screen.getByText('Fetching your bookings…')).toBeOnTheScreen();
    expect(screen.queryByText('Loading…')).toBeNull();
  });
});

describe('ErrorState', () => {
  it("shows the ApiError's own message", async () => {
    const error = new ApiError(404, 'We could not find that room.');

    await render(withPaper(<ErrorState error={error} />));

    expect(
      screen.getByText('We could not find that room.'),
    ).toBeOnTheScreen();
  });

  it('falls back to the default message for a non-Error value', async () => {
    await render(withPaper(<ErrorState error="just a string" />));

    expect(
      screen.getByText('We could not load this right now.'),
    ).toBeOnTheScreen();
  });

  it('falls back to a custom message when one is supplied', async () => {
    await render(
      withPaper(<ErrorState error={{ weird: true }} fallback="Nope." />),
    );

    expect(screen.getByText('Nope.')).toBeOnTheScreen();
  });

  it('does not render a retry button when onRetry is not given', async () => {
    await render(withPaper(<ErrorState error="boom" />));

    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('renders a retry button when onRetry is given', async () => {
    await render(withPaper(<ErrorState error="boom" onRetry={() => {}} />));

    expect(screen.getByText('Try again')).toBeOnTheScreen();
  });

  it('calls the retry handler when the retry button is pressed', async () => {
    const onRetry = jest.fn();

    await render(withPaper(<ErrorState error="boom" onRetry={onRetry} />));
    fireEvent.press(screen.getByText('Try again'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('always renders the title', async () => {
    await render(withPaper(<EmptyState title="No bookings yet" />));

    expect(screen.getByText('No bookings yet')).toBeOnTheScreen();
  });

  it('renders the description only when one is supplied', async () => {
    await render(
      withPaper(
        <EmptyState
          title="No bookings yet"
          description="Book a room to see it here."
        />,
      ),
    );

    expect(
      screen.getByText('Book a room to see it here.'),
    ).toBeOnTheScreen();
  });

  it('omits the description when none is supplied', async () => {
    await render(withPaper(<EmptyState title="No bookings yet" />));

    expect(screen.queryByText('Book a room to see it here.')).toBeNull();
  });

  it('omits the action button when only actionLabel is supplied', async () => {
    await render(
      withPaper(<EmptyState title="No bookings yet" actionLabel="Browse rooms" />),
    );

    expect(screen.queryByText('Browse rooms')).toBeNull();
  });

  it('omits the action button when only onAction is supplied', async () => {
    await render(
      withPaper(<EmptyState title="No bookings yet" onAction={() => {}} />),
    );

    // Neither label makes it a coherent button, so nothing should render.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the action button when both actionLabel and onAction are supplied', async () => {
    await render(
      withPaper(
        <EmptyState
          title="No bookings yet"
          actionLabel="Browse rooms"
          onAction={() => {}}
        />,
      ),
    );

    expect(screen.getByText('Browse rooms')).toBeOnTheScreen();
  });

  it('calls the action handler when the action button is pressed', async () => {
    const onAction = jest.fn();

    await render(
      withPaper(
        <EmptyState
          title="No bookings yet"
          actionLabel="Browse rooms"
          onAction={onAction}
        />,
      ),
    );
    fireEvent.press(screen.getByText('Browse rooms'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
