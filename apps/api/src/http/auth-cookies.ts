import { randomBytes } from 'node:crypto';

import type { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config';

const tokenCookieName = 'token';
const csrfCookieName = 'csrf';
const tokenCookiePath = '/api';
const csrfCookiePath = '/';
const sessionMaxAgeMs = 86_400_000;
const tokenLifetime = '24h';
const csrfTokenBytes = 32;

function tokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: tokenCookiePath,
    secure: config.cookieSecure,
  };
}

function csrfCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    sameSite: 'lax',
    path: csrfCookiePath,
    secure: config.cookieSecure,
  };
}

function readCookie(req: Request, name: string): string | undefined {
  const cookies: unknown = req.cookies;

  if (typeof cookies !== 'object' || !cookies) {
    return undefined;
  }

  const value = (cookies as Record<string, unknown>)[name];

  return typeof value === 'string' ? value : undefined;
}

export function readTokenCookie(req: Request): string | undefined {
  return readCookie(req, tokenCookieName);
}

export function readCsrfCookie(req: Request): string | undefined {
  return readCookie(req, csrfCookieName);
}

export function setAuthCookies(res: Response, userId: string): void {
  const token = jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: tokenLifetime,
  });

  res.cookie(tokenCookieName, token, {
    ...tokenCookieOptions(),
    maxAge: sessionMaxAgeMs,
  });

  res.cookie(csrfCookieName, randomBytes(csrfTokenBytes).toString('hex'), {
    ...csrfCookieOptions(),
    maxAge: sessionMaxAgeMs,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(tokenCookieName, tokenCookieOptions());
  res.clearCookie(csrfCookieName, csrfCookieOptions());
}
