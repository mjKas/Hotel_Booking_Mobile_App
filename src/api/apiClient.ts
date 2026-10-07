import { config } from '../lib/config';
import { ApiError, extractMessage, parseFieldErrors } from './apiError';
import { tokenStore } from './tokenStore';

type RequestOptions = {
  body?: unknown;
  /** Skip the Authorization header, e.g. for login and register. */
  anonymous?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Shared across concurrent callers so a burst of 401s triggers exactly one
 * refresh. Holding the promise (rather than a boolean flag) means the second
 * caller waits for the answer instead of giving up.
 */
let refreshInFlight: Promise<boolean> | null = null;

function buildUrl(
  path: string,
  query: RequestOptions['query'],
): string {
  const url = `${config.apiBaseUrl}${path}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }

  const search = params.toString();

  return search ? `${url}?${search}` : url;
}

async function performRefresh(): Promise<boolean> {
  const refreshToken = await tokenStore.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(
      `${config.apiBaseUrl}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      },
    );

    if (!response.ok) {
      // The refresh token is spent or revoked; the session is over.
      await tokenStore.clear();
      return false;
    }

    const data = await response.json();

    await tokenStore.setTokens(
      data.access_token,
      data.refresh_token ?? refreshToken,
    );

    return true;
  } catch {
    // A network blip should not sign the user out - only a rejection does.
    return false;
  }
}

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {},
  retry = false,
): Promise<T> {
  const { body, anonymous = false, query } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // The API answers reads with `Cache-Control: max-age=3600`, so without this
  // the phone's own HTTP cache (NSURLCache / OkHttp) replays an hour-old list
  // after every add, edit or delete. `no-cache` also makes the server skip its
  // Redis cache, whose hits currently fail with a 500 (docs/BACKEND_ISSUES.md).
  const isRead = method === 'GET';

  if (isRead) {
    headers['Cache-Control'] = 'no-cache';
    headers.Pragma = 'no-cache';
  }

  if (!anonymous) {
    const accessToken = tokenStore.getAccessToken();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(
      buildUrl(path, query),
      {
        method,
        headers,
        // React Native's fetch turns this into a cache-busting query param
        // for GETs, which bypasses the device cache on every platform.
        cache: isRead ? 'no-store' : undefined,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  } catch (error) {
    if (__DEV__) {
      console.warn(`[api] ${method} ${path} could not be sent`, error);
    }

    throw new ApiError(
      0,
      'Unable to reach the server. Check your connection and try again.',
    );
  }

  // The access token lives for 15 minutes, so this path is common. Refresh
  // once and replay the original request before surfacing an error.
  if (
    response.status === 401 &&
    !anonymous &&
    !retry
  ) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request<T>(
        path,
        method,
        options,
        true,
      );
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (__DEV__) {
      console.warn(
        `[api] ${method} ${path} failed with ${response.status}`,
        data,
      );
    }

    // A 5xx body is a bare "Internal Server Error" with nothing the user can
    // act on, so say plainly that the fault is on the server's side.
    const message =
      response.status >= 500
        ? `The server could not complete this request (error ${response.status}). ` +
          'Please try again later.'
        : extractMessage(data, 'The request failed.');

    throw new ApiError(
      response.status,
      message,
      parseFieldErrors(data),
    );
  }

  return data as T;
}

export const apiClient = {
  get<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      path,
      'GET',
      options,
    );
  },

  post<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      path,
      'POST',
      {
        ...options,
        body,
      },
    );
  },

  put<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      path,
      'PUT',
      {
        ...options,
        body,
      },
    );
  },

  patch<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      path,
      'PATCH',
      {
        ...options,
        body,
      },
    );
  },

  delete<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      path,
      'DELETE',
      options,
    );
  },
};
