import assert from 'node:assert/strict';
import test from 'node:test';

import { vehicleLookupRequestSchema } from '@ensure/shared';
import type { NextFunction, Request, Response } from 'express';

import { validateBody } from './validate-body';

interface CapturedResponse {
  status?: number;
  payload?: unknown;
}

interface ResponseFake {
  status: (code: number) => ResponseFake;
  json: (payload: unknown) => ResponseFake;
}

interface Invocation {
  body: unknown;
  captured: CapturedResponse;
  nextCalls: number;
}

const middleware = validateBody(vehicleLookupRequestSchema);

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

function invoke(body: unknown): Invocation {
  const request = { body } as unknown as Request;
  const captured: CapturedResponse = {};
  let nextCalls = 0;

  const next: NextFunction = () => {
    nextCalls += 1;
  };

  middleware(
    request,
    createResponseFake(captured) as unknown as Response,
    next,
  );

  return { body: request.body, captured, nextCalls };
}

await test('a valid body reaches the handler with the plate transform applied', () => {
  const invocation = invoke({ plate: '12-345-67' });

  assert.equal(invocation.nextCalls, 1);
  assert.deepEqual(invocation.body, { plate: '1234567' });
  assert.equal(invocation.captured.status, undefined);
});

await test('a wrong-length plate short-circuits with a 400 validation error', () => {
  const invocation = invoke({ plate: '123' });

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 400);
  assert.deepEqual(invocation.captured.payload, {
    ok: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'request body failed validation',
    },
  });
});

await test('a missing plate short-circuits with a 400 validation error', () => {
  const invocation = invoke({});

  assert.equal(invocation.nextCalls, 0);
  assert.equal(invocation.captured.status, 400);
});
