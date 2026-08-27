import assert from 'node:assert/strict';
import test from 'node:test';

import type { NextFunction, Request, Response } from 'express';

import { verifyCsrf } from './csrf';

interface CapturedResponse {
  status?: number;
  payload?: unknown;
}

interface ResponseFake {
  status: (code: number) => ResponseFake;
  json: (payload: unknown) => ResponseFake;
}

interface Invocation {
  captured: CapturedResponse;
  nextCalls: number;
}

const csrfToken = 'ea9f1c0d4b7a2e5f';

const unauthorizedPayload = {
  ok: false,
  error: { code: 'UNAUTHORIZED', message: 'not authenticated' },
};

function createResponseFake(captured: CapturedResponse): ResponseFake {
  const fake: ResponseFake = {
    status: (code) => {
      captured.status = code;
      return fake;
    },
    json: (payload) => {
      captured.payload = payload;
      return fake;
    },
  };

  return fake;
}

function invoke(
  cookies: Record<string, string>,
  headers: Record<string, string>,
): Invocation {
  const captured: CapturedResponse = {};
  let nextCalls = 0;

  const request = { cookies, headers } as unknown as Request;

  const next: NextFunction = () => {
    nextCalls += 1;
  };

  verifyCsrf(
    request,
    createResponseFake(captured) as unknown as Response,
    next,
  );

  return { captured, nextCalls };
}

await test('a header matching the csrf cookie passes through', () => {
  const invocation = invoke({ csrf: csrfToken }, { 'x-csrf-token': csrfToken });

  assert.equal(invocation.nextCalls, 1);
  assert.equal(invocation.captured.status, undefined);
});

await test('a missing header is rejected with the unauthorized envelope', () => {
  const invocation = invoke({ csrf: csrfToken }, {});

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('a missing cookie is rejected with the unauthorized envelope', () => {
  const invocation = invoke({}, { 'x-csrf-token': csrfToken });

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('a header that does not match the cookie is rejected', () => {
  const invocation = invoke(
    { csrf: csrfToken },
    { 'x-csrf-token': 'a-forged-token' },
  );

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('an empty cookie and an empty header are not treated as a match', () => {
  const invocation = invoke({ csrf: '' }, { 'x-csrf-token': '' });

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 401);
});
