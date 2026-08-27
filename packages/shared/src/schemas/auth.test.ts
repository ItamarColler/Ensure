import assert from 'node:assert/strict';
import test from 'node:test';

import type { CoverageSelection } from './coverage';
import { registerFormSchema, registerRequestSchema } from './auth';
import type { VehicleInfo } from './vehicle';

const vehicle: VehicleInfo = {
  license_plate: '12345678',
  manufacturer: 'Toyota',
  model: 'Corolla',
  year: 2019,
  color: 'White',
};

const coverage: CoverageSelection = { tier: 'thirdParty', addOns: ['towing'] };

function registerRequest(overrides: Record<string, unknown>): unknown {
  return {
    email: 'tracer@example.com',
    password: 'password123',
    termsAccepted: true,
    vehicle,
    coverage,
    ...overrides,
  };
}

await test('a padded mixed case email is trimmed and lowercased by the request schema', () => {
  const parsed = registerRequestSchema.parse(
    registerRequest({ email: '  Tracer@Example.COM ' }),
  );

  assert.equal(parsed.email, 'tracer@example.com');
});

await test('a password shorter than eight characters is rejected', () => {
  assert.equal(
    registerRequestSchema.safeParse(registerRequest({ password: 'short12' }))
      .success,
    false,
  );
});

await test('the register request requires terms to be accepted', () => {
  assert.equal(
    registerRequestSchema.safeParse(registerRequest({ termsAccepted: false }))
      .success,
    false,
  );
  assert.equal(
    registerRequestSchema.safeParse(
      registerRequest({ termsAccepted: undefined }),
    ).success,
    false,
  );
  assert.equal(
    registerRequestSchema.safeParse(registerRequest({})).success,
    true,
  );
});

await test('the register form schema accepts a boolean terms field but refines it to true', () => {
  const accepted = registerFormSchema.safeParse({
    email: 'tracer@example.com',
    password: 'password123',
    termsAccepted: true,
    marketingOptIn: false,
  });
  const refused = registerFormSchema.safeParse({
    email: 'tracer@example.com',
    password: 'password123',
    termsAccepted: false,
    marketingOptIn: false,
  });

  assert.equal(accepted.success, true);
  assert.equal(refused.success, false);
});
