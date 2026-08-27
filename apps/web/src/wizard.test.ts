import assert from 'node:assert/strict';
import test from 'node:test';

import { guardRedirectPath, sealRedirectPath } from './wizard';

const draft = { vehicle: {}, coverage: {} };

await test('details without an authenticated user redirects to register', () => {
  assert.equal(guardRedirectPath('/details', draft), '/register');
});

await test('details with every prerequisite present does not redirect', () => {
  assert.equal(
    guardRedirectPath('/details', { ...draft, auth: { id: 'u' } }),
    undefined,
  );
});

await test('confirmation requires only an authenticated user', () => {
  assert.equal(guardRedirectPath('/confirmation', {}), '/register');
  assert.equal(
    guardRedirectPath('/confirmation', { auth: { id: 'u' } }),
    undefined,
  );
});

await test('an issued policy seals every wizard step to confirmation', () => {
  assert.equal(sealRedirectPath('/vehicle', true), '/confirmation');
  assert.equal(sealRedirectPath('/coverage', true), '/confirmation');
  assert.equal(sealRedirectPath('/register', true), '/confirmation');
  assert.equal(sealRedirectPath('/details', true), '/confirmation');
});

await test('the seal does not redirect confirmation onto itself', () => {
  assert.equal(sealRedirectPath('/confirmation', true), undefined);
});

await test('without an issued policy the seal never redirects', () => {
  assert.equal(sealRedirectPath('/details', false), undefined);
  assert.equal(sealRedirectPath('/vehicle', false), undefined);
});

await test('the seal ignores paths outside the wizard', () => {
  assert.equal(sealRedirectPath('/not-a-wizard-path', true), undefined);
});
