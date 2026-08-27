import assert from 'node:assert/strict';
import test from 'node:test';

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { requireAuth } from './require-auth';

const secret = 'require-auth-test-secret';

process.env['JWT_SECRET'] = secret;

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
  handledUserIds: string[];
}

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

function invoke(cookies: Record<string, string>): Invocation {
  const captured: CapturedResponse = {};
  const handledUserIds: string[] = [];

  const middleware = requireAuth((userId) => {
    handledUserIds.push(userId);

    return Promise.resolve();
  });

  const request = { cookies } as unknown as Request;
  const next: NextFunction = () => undefined;

  middleware(
    request,
    createResponseFake(captured) as unknown as Response,
    next,
  );

  return { captured, handledUserIds };
}

await test('a request without a token cookie never reaches the handler', () => {
  const invocation = invoke({});

  assert.deepEqual(invocation.handledUserIds, []);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('a garbage token is rejected with the same envelope', () => {
  const invocation = invoke({ token: 'not-a-json-web-token' });

  assert.deepEqual(invocation.handledUserIds, []);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('an expired token is rejected with the same envelope', () => {
  const expired = jwt.sign({}, secret, {
    subject: 'user-1',
    expiresIn: '0s',
  });

  const invocation = invoke({ token: expired });

  assert.deepEqual(invocation.handledUserIds, []);
  assert.equal(invocation.captured.status, 401);
  assert.deepEqual(invocation.captured.payload, unauthorizedPayload);
});

await test('a token signed for another secret is rejected', () => {
  const foreign = jwt.sign({}, 'a-different-secret', { subject: 'user-1' });

  const invocation = invoke({ token: foreign });

  assert.deepEqual(invocation.handledUserIds, []);
  assert.equal(invocation.captured.status, 401);
});

await test('a token carrying no subject is rejected', () => {
  const subjectless = jwt.sign({}, secret);

  const invocation = invoke({ token: subjectless });

  assert.deepEqual(invocation.handledUserIds, []);
  assert.equal(invocation.captured.status, 401);
});

await test('a valid token calls the handler once with its subject', () => {
  const token = jwt.sign({}, secret, {
    subject: 'user-1',
    expiresIn: '24h',
  });

  const invocation = invoke({ token });

  assert.deepEqual(invocation.handledUserIds, ['user-1']);
  assert.equal(invocation.captured.status, undefined);
  assert.equal(invocation.captured.payload, undefined);
});
