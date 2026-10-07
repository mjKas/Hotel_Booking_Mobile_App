import { ApiError } from './apiError';
import { tokenStore } from './tokenStore';

jest.mock('../lib/config', () => ({
  config: {
    apiBaseUrl: 'https://api.test',
    currency: 'GBP',
    locale: 'en-GB',
    hotelName: 'Royal Crest Hotel',
    taxRate: 0.12,
  },
}));

jest.mock('./tokenStore', () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clear: jest.fn(),
    hasSession: jest.fn(),
  },
}));

const tokens = tokenStore as jest.Mocked<typeof tokenStore>;

/** A minimal stand-in for the parts of Response that apiClient actually uses. */
function reply(
  status: number,
  body?: unknown,
  { invalidJson = false }: { invalidJson?: boolean } = {},
) {
  const text = invalidJson
    ? '<html>502 Bad Gateway</html>'
    : body === undefined
      ? ''
      : JSON.stringify(body);

  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(text),
    json: jest.fn().mockResolvedValue(body),
  };
}

let fetchMock: jest.Mock;

/**
 * apiClient holds a module-level promise to de-duplicate refreshes, so each
 * test needs a freshly-required module.
 */
function loadApiClient() {
  let client: typeof import('./apiClient').apiClient;

  jest.isolateModules(() => {
    client = require('./apiClient').apiClient;
  });

  return client!;
}

beforeEach(() => {
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  tokens.getAccessToken.mockReturnValue(null);
  tokens.getRefreshToken.mockResolvedValue(null);
  tokens.setTokens.mockResolvedValue(undefined);
  tokens.clear.mockResolvedValue(undefined);
});

describe('request building', () => {
  it('prefixes the configured API base URL', async () => {
    fetchMock.mockResolvedValue(reply(200, { id: 1 }));

    await loadApiClient().get('/rooms/');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/rooms/',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends each verb with the matching HTTP method', async () => {
    fetchMock.mockResolvedValue(reply(200, {}));
    const apiClient = loadApiClient();

    await apiClient.get('/a');
    await apiClient.post('/b', {});
    await apiClient.put('/c', {});
    await apiClient.patch('/d', {});
    await apiClient.delete('/e');

    expect(fetchMock.mock.calls.map(([, init]) => init.method)).toEqual([
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ]);
  });

  it('serialises the body as JSON and declares the content type', async () => {
    fetchMock.mockResolvedValue(reply(200, {}));

    await loadApiClient().post('/bookings/', { room_id: 7, guests: 2 });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe('{"room_id":7,"guests":2}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('omits the content type when there is no body to describe', async () => {
    fetchMock.mockResolvedValue(reply(200, {}));

    await loadApiClient().get('/rooms/');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBeUndefined();
    expect(init.headers['Content-Type']).toBeUndefined();
    expect(init.headers.Accept).toBe('application/json');
  });
});

describe('query strings', () => {
  it('appends the supplied parameters', async () => {
    fetchMock.mockResolvedValue(reply(200, []));

    await loadApiClient().get('/availability', {
      query: { check_in: '2026-09-01', guests: 2 },
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.test/availability?check_in=2026-09-01&guests=2',
    );
  });

  it('drops undefined, null and empty values so optional filters are omitted', async () => {
    // An empty search box must not become "?search=", which the backend would
    // treat as a filter matching nothing.
    fetchMock.mockResolvedValue(reply(200, []));

    await loadApiClient().get('/bookings/', {
      query: { status: 'CONFIRMED', search: '', from: undefined, to: null },
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.test/bookings/?status=CONFIRMED',
    );
  });

  it('leaves the URL untouched when every parameter was dropped', async () => {
    fetchMock.mockResolvedValue(reply(200, []));

    await loadApiClient().get('/bookings/', { query: { search: '' } });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/bookings/');
  });

  it('encodes values that are not URL safe', async () => {
    fetchMock.mockResolvedValue(reply(200, []));

    await loadApiClient().get('/bookings/', { query: { search: 'Ella Hart & co' } });

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.test/bookings/?search=Ella+Hart+%26+co',
    );
  });

  it('stringifies numeric and boolean parameters, including zero and false', async () => {
    fetchMock.mockResolvedValue(reply(200, []));

    await loadApiClient().get('/rooms/', { query: { floor: 0, includeClosed: false } });

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.test/rooms/?floor=0&includeClosed=false',
    );
  });
});

describe('authorisation header', () => {
  it('attaches the bearer token when the user is signed in', async () => {
    tokens.getAccessToken.mockReturnValue('access-abc');
    fetchMock.mockResolvedValue(reply(200, {}));

    await loadApiClient().get('/auth/me');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer access-abc');
  });

  it('sends no bearer token when there is no session', async () => {
    fetchMock.mockResolvedValue(reply(200, {}));

    await loadApiClient().get('/rooms/');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('never attaches a token to an anonymous request', async () => {
    // Login and register must not carry a stale token from a previous user.
    tokens.getAccessToken.mockReturnValue('access-abc');
    fetchMock.mockResolvedValue(reply(200, {}));

    await loadApiClient().post('/auth/login', { email: 'a@b.test' }, { anonymous: true });

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});

describe('responses', () => {
  it('returns the parsed JSON body', async () => {
    fetchMock.mockResolvedValue(reply(200, { id: 7, room_number: '204' }));

    await expect(loadApiClient().get('/rooms/7')).resolves.toEqual({
      id: 7,
      room_number: '204',
    });
  });

  it('returns undefined for a 204 without reading a body', async () => {
    const response = reply(204);
    fetchMock.mockResolvedValue(response);

    await expect(loadApiClient().delete('/rooms/7')).resolves.toBeUndefined();
    expect(response.text).not.toHaveBeenCalled();
  });

  it('returns null for an empty 200 body', async () => {
    fetchMock.mockResolvedValue(reply(200));

    await expect(loadApiClient().get('/ping')).resolves.toBeNull();
  });

  it('falls back to raw text when the body is not JSON', async () => {
    // A proxy returning an HTML error page must not crash the JSON parser.
    fetchMock.mockResolvedValue(reply(200, undefined, { invalidJson: true }));

    await expect(loadApiClient().get('/rooms/')).resolves.toBe(
      '<html>502 Bad Gateway</html>',
    );
  });
});

describe('error handling', () => {
  it('throws an ApiError carrying the server status and message', async () => {
    fetchMock.mockResolvedValue(
      reply(409, { detail: { message: 'That room is already booked.' } }),
    );

    await expect(loadApiClient().post('/bookings/', {})).rejects.toMatchObject({
      status: 409,
      message: 'That room is already booked.',
    });
  });

  it('attaches field errors so a form can highlight the offending inputs', async () => {
    fetchMock.mockResolvedValue(
      reply(422, {
        detail: {
          message: 'Check the form.',
          field_errors: { full_name: 'Tell us your name.' },
        },
      }),
    );

    await expect(loadApiClient().post('/auth/register', {})).rejects.toMatchObject({
      status: 422,
      fieldErrors: { fullName: 'Tell us your name.' },
    });
  });

  it('uses a generic message when the server sends an unrecognised body', async () => {
    fetchMock.mockResolvedValue(reply(500, { unexpected: true }));

    await expect(loadApiClient().get('/reports/dashboard')).rejects.toMatchObject({
      status: 500,
      message: 'The request failed.',
    });
  });

  it('reports an unreachable server as a network error rather than leaking the cause', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const error = await loadApiClient().get('/rooms/').catch((caught: unknown) => caught);

    // Not `toBeInstanceOf(ApiError)`: isolateModules gives the client its own
    // copy of the apiError module, so the classes are structurally identical
    // but not reference-equal.
    expect(error).toBeInstanceOf(Error);
    expect((error as ApiError).name).toBe('ApiError');
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).isNetworkError).toBe(true);
    expect((error as ApiError).message).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
  });
});

describe('expired access tokens', () => {
  it('refreshes once and replays the original request', async () => {
    tokens.getAccessToken.mockReturnValueOnce('stale-token').mockReturnValue('fresh-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');

    fetchMock
      .mockResolvedValueOnce(reply(401, { detail: 'Not authenticated' }))
      .mockResolvedValueOnce(
        reply(200, { access_token: 'fresh-token', refresh_token: 'refresh-new' }),
      )
      .mockResolvedValueOnce(reply(200, { id: 2, email: 'ella@example.test' }));

    await expect(loadApiClient().get('/auth/me')).resolves.toEqual({
      id: 2,
      email: 'ella@example.test',
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.test/auth/refresh');
    expect(tokens.setTokens).toHaveBeenCalledWith('fresh-token', 'refresh-new');
    // The replay must carry the new token, not the one that just failed.
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-token');
  });

  it('keeps the existing refresh token when the server rotates only the access token', async () => {
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');

    fetchMock
      .mockResolvedValueOnce(reply(401, {}))
      .mockResolvedValueOnce(reply(200, { access_token: 'fresh-token' }))
      .mockResolvedValueOnce(reply(200, {}));

    await loadApiClient().get('/auth/me');

    expect(tokens.setTokens).toHaveBeenCalledWith('fresh-token', 'refresh-xyz');
  });

  it('surfaces the 401 when there is no refresh token to spend', async () => {
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue(null);
    fetchMock.mockResolvedValue(reply(401, { detail: 'Not authenticated' }));

    await expect(loadApiClient().get('/auth/me')).rejects.toMatchObject({ status: 401 });
    // One call for the original request; no pointless refresh attempt.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears the session when the refresh token is rejected', async () => {
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-spent');

    fetchMock
      .mockResolvedValueOnce(reply(401, {}))
      .mockResolvedValueOnce(reply(401, { detail: 'Refresh token revoked' }));

    await expect(loadApiClient().get('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(tokens.clear).toHaveBeenCalledTimes(1);
  });

  it('does not sign the user out when the refresh itself hits a network blip', async () => {
    // Losing signal mid-refresh should leave the session intact to retry.
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');

    fetchMock
      .mockResolvedValueOnce(reply(401, {}))
      .mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(loadApiClient().get('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(tokens.clear).not.toHaveBeenCalled();
  });

  it('never refreshes for an anonymous request', async () => {
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');
    fetchMock.mockResolvedValue(reply(401, { detail: 'Incorrect email or password.' }));

    await expect(
      loadApiClient().post('/auth/login', { email: 'a@b.test' }, { anonymous: true }),
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after one replay instead of looping', async () => {
    // A 401 that survives a successful refresh means the account is gone or
    // suspended; retrying forever would hang the screen.
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');

    fetchMock
      .mockResolvedValueOnce(reply(401, {}))
      .mockResolvedValueOnce(reply(200, { access_token: 'fresh', refresh_token: 'newer' }))
      .mockResolvedValueOnce(reply(401, { detail: 'Account suspended' }));

    await expect(loadApiClient().get('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('refreshes only once for a burst of concurrent 401s', async () => {
    // Every screen fires its queries at once on resume; without the shared
    // in-flight promise each one would spend the single-use refresh token.
    tokens.getAccessToken.mockReturnValue('stale-token');
    tokens.getRefreshToken.mockResolvedValue('refresh-xyz');

    fetchMock.mockImplementation(async (url: string) => {
      if (url === 'https://api.test/auth/refresh') {
        return reply(200, { access_token: 'fresh-token', refresh_token: 'refresh-new' });
      }
      return fetchMock.mock.calls.filter(([called]) => called !== 'https://api.test/auth/refresh')
        .length <= 3
        ? reply(401, {})
        : reply(200, { ok: true });
    });

    const apiClient = loadApiClient();
    await Promise.all([
      apiClient.get('/bookings/'),
      apiClient.get('/rooms/'),
      apiClient.get('/auth/me'),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter(
      ([url]) => url === 'https://api.test/auth/refresh',
    );
    expect(refreshCalls).toHaveLength(1);
  });
});
