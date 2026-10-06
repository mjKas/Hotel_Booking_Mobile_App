import {
  ApiError,
  extractMessage,
  parseFieldErrors,
  toErrorMessage,
} from './apiError';

describe('ApiError', () => {
  it('is a real Error subclass so it survives try/catch and instanceof', () => {
    const error = new ApiError(404, 'We could not find that room.');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('We could not find that room.');
    expect(error.status).toBe(404);
  });

  it('classifies the statuses the screens branch on', () => {
    expect(new ApiError(0, 'offline').isNetworkError).toBe(true);
    expect(new ApiError(401, 'nope').isUnauthorized).toBe(true);
    expect(new ApiError(403, 'nope').isForbidden).toBe(true);
    expect(new ApiError(404, 'nope').isNotFound).toBe(true);
    expect(new ApiError(409, 'taken').isConflict).toBe(true);
  });

  it('does not misclassify an unrelated status', () => {
    const serverError = new ApiError(500, 'boom');

    expect(serverError.isNetworkError).toBe(false);
    expect(serverError.isUnauthorized).toBe(false);
    expect(serverError.isForbidden).toBe(false);
    expect(serverError.isNotFound).toBe(false);
    expect(serverError.isConflict).toBe(false);
  });

  it('carries optional field errors for form binding', () => {
    const error = new ApiError(422, 'Check the form.', {
      fullName: 'Required.',
    });

    expect(error.fieldErrors).toEqual({ fullName: 'Required.' });
    expect(new ApiError(500, 'boom').fieldErrors).toBeUndefined();
  });
});

describe('toErrorMessage', () => {
  it('uses the message of an ApiError', () => {
    expect(toErrorMessage(new ApiError(409, 'That room is taken.'))).toBe(
      'That room is taken.',
    );
  });

  it('uses the message of any other Error', () => {
    expect(toErrorMessage(new TypeError('bad input'))).toBe('bad input');
  });

  it('falls back when handed a thrown value that is not an Error', () => {
    expect(toErrorMessage('a bare string')).toBe('Something went wrong.');
    expect(toErrorMessage(null)).toBe('Something went wrong.');
    expect(toErrorMessage(undefined)).toBe('Something went wrong.');
    expect(toErrorMessage({ message: 'not a real Error' })).toBe(
      'Something went wrong.',
    );
  });

  it('falls back for an Error with an empty message', () => {
    expect(toErrorMessage(new Error(''))).toBe('Something went wrong.');
  });

  it('accepts a caller-supplied fallback', () => {
    expect(toErrorMessage(null, 'Could not load rooms.')).toBe(
      'Could not load rooms.',
    );
  });
});

describe('extractMessage', () => {
  const fallback = 'Something went wrong.';

  it('reads the message from our own problem() error shape', () => {
    expect(
      extractMessage({ detail: { message: 'That room is taken.' } }, fallback),
    ).toBe('That room is taken.');
  });

  it('reads the first message from a Pydantic validation array', () => {
    expect(
      extractMessage(
        {
          detail: [
            { loc: ['body', 'email'], msg: 'value is not a valid email' },
            { loc: ['body', 'password'], msg: 'too short' },
          ],
        },
        fallback,
      ),
    ).toBe('value is not a valid email');
  });

  it('accepts a bare string body', () => {
    expect(extractMessage('Service unavailable', fallback)).toBe(
      'Service unavailable',
    );
  });

  it('accepts a string detail', () => {
    expect(extractMessage({ detail: 'Not authenticated' }, fallback)).toBe(
      'Not authenticated',
    );
  });

  it('falls back to a top-level message field', () => {
    expect(extractMessage({ message: 'Gateway timeout' }, fallback)).toBe(
      'Gateway timeout',
    );
  });

  it('ignores whitespace-only messages rather than showing a blank alert', () => {
    expect(extractMessage('   ', fallback)).toBe(fallback);
    expect(extractMessage({ detail: '  ' }, fallback)).toBe(fallback);
    expect(extractMessage({ detail: { message: '   ' } }, fallback)).toBe(
      fallback,
    );
  });

  it('falls back for shapes it does not recognise', () => {
    expect(extractMessage(null, fallback)).toBe(fallback);
    expect(extractMessage(undefined, fallback)).toBe(fallback);
    expect(extractMessage(42, fallback)).toBe(fallback);
    expect(extractMessage({}, fallback)).toBe(fallback);
    expect(extractMessage({ detail: [] }, fallback)).toBe(fallback);
    expect(extractMessage({ detail: { code: 'x' } }, fallback)).toBe(fallback);
  });
});

describe('parseFieldErrors', () => {
  it('camelCases our own field_errors map to match the form field names', () => {
    expect(
      parseFieldErrors({
        detail: {
          message: 'Check the form.',
          field_errors: {
            full_name: 'Tell us your name.',
            email: 'That email is already registered.',
          },
        },
      }),
    ).toEqual({
      fullName: 'Tell us your name.',
      email: 'That email is already registered.',
    });
  });

  it('takes the field name from the last element of a Pydantic loc array', () => {
    expect(
      parseFieldErrors({
        detail: [
          { loc: ['body', 'check_in'], msg: 'invalid date' },
          { loc: ['body', 'guests'], msg: 'must be positive' },
        ],
      }),
    ).toEqual({ checkIn: 'invalid date', guests: 'must be positive' });
  });

  it('skips a whole-body error that has no field to attach to', () => {
    // loc: ['body'] means "the request as a whole", which cannot be shown
    // against any single input.
    expect(parseFieldErrors({ detail: [{ loc: ['body'], msg: 'invalid' }] })).toBeUndefined();
  });

  it('skips malformed entries instead of throwing', () => {
    expect(
      parseFieldErrors({
        detail: [
          { msg: 'no loc at all' },
          { loc: ['body', 'email'] },
          { loc: ['body', 'phone'], msg: 'too short' },
        ],
      }),
    ).toEqual({ phone: 'too short' });
  });

  it('ignores non-string values in a field_errors map', () => {
    expect(
      parseFieldErrors({
        detail: { field_errors: { email: 'Required.', guests: 3 } },
      }),
    ).toEqual({ email: 'Required.' });
  });

  it('returns undefined when there is nothing to bind to a form', () => {
    expect(parseFieldErrors(null)).toBeUndefined();
    expect(parseFieldErrors(undefined)).toBeUndefined();
    expect(parseFieldErrors('a string')).toBeUndefined();
    expect(parseFieldErrors({})).toBeUndefined();
    expect(parseFieldErrors({ detail: 'Not authenticated' })).toBeUndefined();
    expect(parseFieldErrors({ detail: { message: 'no fields' } })).toBeUndefined();
    expect(parseFieldErrors({ detail: [] })).toBeUndefined();
  });
});
