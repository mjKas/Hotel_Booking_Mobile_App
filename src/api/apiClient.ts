import { config } from '../lib/config';
import { ApiError } from './apiError';
import { tokenStore } from './tokenStore';

type RequestOptions = {
  body?: unknown;
  anonymous?: boolean;
};

let refreshing = false;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshing) {
    return false;
  }

  refreshing = true;

  try {
    const refreshToken = await tokenStore.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

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
    await tokenStore.clear();
    return false;
  } finally {
    refreshing = false;
  }
}

async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {},
  retry = false,
): Promise<T> {
  const { body, anonymous = false } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
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
      `${config.apiBaseUrl}${path}`,
      {
        method,
        headers,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  } catch {
    throw new ApiError(
      0,
      'Unable to connect to the server.',
    );
  }

  // Access token expired.
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

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.detail ||
          data?.message ||
          'The request failed.';

    throw new ApiError(
      response.status,
      message,
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