import type { Result } from '@ensure/shared';
import type { RequestHandler } from 'express';

import { readCsrfCookie } from '../http/auth-cookies';
import { sendResult } from '../http/send-result';

const csrfHeaderName = 'x-csrf-token';

const csrfMismatch: Result<never> = {
  ok: false,
  error: { code: 'UNAUTHORIZED', message: 'not authenticated' },
};

export const verifyCsrf: RequestHandler = (req, res, next) => {
  const cookieToken = readCsrfCookie(req);
  const headerToken = req.headers[csrfHeaderName];

  if (!cookieToken || typeof headerToken !== 'string') {
    sendResult(res, csrfMismatch);
    return;
  }

  if (headerToken !== cookieToken) {
    sendResult(res, csrfMismatch);
    return;
  }

  next();
};
