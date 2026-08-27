import type { ApiError, Result } from '@ensure/shared';

export class ApiErrorException extends Error {
  constructor(readonly apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiErrorException';
  }
}

const upstreamUnreachable: ApiError = {
  code: 'UPSTREAM_ERROR',
  message: 'unreachable',
};

function toApiError(payload: unknown): ApiError {
  if (payload instanceof Object) {
    const code: unknown = Reflect.get(payload, 'code');
    const message: unknown = Reflect.get(payload, 'message');

    if (typeof code === 'string' && typeof message === 'string') {
      return { code, message } as ApiError;
    }
  }

  return upstreamUnreachable;
}

const csrfCookiePrefix = 'csrf=';

function readCsrfCookie(): string | undefined {
  for (const cookie of document.cookie.split('; ')) {
    if (cookie.startsWith(csrfCookiePrefix)) {
      return cookie.slice(csrfCookiePrefix.length);
    }
  }

  return undefined;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const csrf = readCsrfCookie();
  let payload: unknown;

  try {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(csrf !== undefined && { 'x-csrf-token': csrf }),
      },
      body: JSON.stringify(body),
    });

    payload = await response.json();
  } catch {
    throw new ApiErrorException(upstreamUnreachable);
  }

  const result = payload as Result<T>;

  if (!result.ok) {
    throw new ApiErrorException(toApiError(result.error));
  }

  return result.data;
}
