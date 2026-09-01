/**
 * A single error shape for the whole app.
 *
 * The FastAPI backend returns `{"detail": {"message", "field_errors"}}` for its
 * own failures and `{"detail": [{loc, msg}]}` for Pydantic validation errors.
 * `apiClient` normalises both into this class so screens only ever handle one
 * shape, and `fieldErrors` can be mapped straight onto form inputs.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Field-level validation errors, keyed by camelCased form field name. */
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

/** Narrows an unknown thrown value into a message that is safe to render. */
export function toErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}

/**
 * Pulls a human-readable message out of whatever the server sent back.
 *
 * `detail` is an object for our own `problem()` errors, an array for Pydantic
 * validation failures, and occasionally a bare string.
 */
export function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const body = data as Record<string, unknown>;
  const detail = body.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const message = (detail as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as Record<string, unknown>;
    if (typeof first?.msg === 'string') {
      return first.msg;
    }
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  return fallback;
}

/**
 * Maps server-side field errors onto form field names.
 *
 * Both shapes are handled: our `field_errors` map, and Pydantic's `loc` array
 * where the last element names the field. Keys are camelCased so they line up
 * with the field names used in the screens.
 */
export function parseFieldErrors(
  data: unknown,
): Record<string, string> | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const detail = (data as Record<string, unknown>).detail;
  const errors: Record<string, string> = {};

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const fieldErrors = (detail as Record<string, unknown>).field_errors;

    if (fieldErrors && typeof fieldErrors === 'object') {
      for (const [key, value] of Object.entries(
        fieldErrors as Record<string, unknown>,
      )) {
        if (typeof value === 'string') {
          errors[toCamelCase(key)] = value;
        }
      }
    }
  }

  if (Array.isArray(detail)) {
    for (const entry of detail) {
      const item = entry as { loc?: unknown[]; msg?: unknown };

      if (!Array.isArray(item.loc) || typeof item.msg !== 'string') {
        continue;
      }

      const field = item.loc[item.loc.length - 1];

      if (typeof field === 'string' && field !== 'body') {
        errors[toCamelCase(field)] = item.msg;
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}
