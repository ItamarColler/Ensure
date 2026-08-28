import assert from 'node:assert/strict';
import test from 'node:test';

import { guardRedirectPath, sealRedirectPath } from './wizard';

const draft = { vehicle: {}, coverage: {} };

const authed = { ...draft, auth: { id: 'u' } };

await test('personal without an authenticated user redirects to register', () => {
  assert.equal(guardRedirectPath('/personal', draft), '/register');
});

await test('personal with every prerequisite present does not redirect', () => {
  assert.equal(guardRedirectPath('/personal', authed), undefined);
});

await test('contact requires the identity slice', () => {
  assert.equal(guardRedirectPath('/contact', authed), '/personal');
  assert.equal(
    guardRedirectPath('/contact', { ...authed, identity: {} }),
    undefined,
  );
});

await test('driving requires both the identity and contact slices', () => {
  assert.equal(guardRedirectPath('/driving', authed), '/personal');
  assert.equal(
    guardRedirectPath('/driving', { ...authed, identity: {} }),
    '/contact',
  );
  assert.equal(
    guardRedirectPath('/driving', { ...authed, identity: {}, contact: {} }),
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
  assert.equal(sealRedirectPath('/personal', true), '/confirmation');
  assert.equal(sealRedirectPath('/contact', true), '/confirmation');
  assert.equal(sealRedirectPath('/driving', true), '/confirmation');
});

await test('the seal does not redirect confirmation onto itself', () => {
  assert.equal(sealRedirectPath('/confirmation', true), undefined);
});

await test('without an issued policy the seal never redirects', () => {
  assert.equal(sealRedirectPath('/driving', false), undefined);
  assert.equal(sealRedirectPath('/vehicle', false), undefined);
});

await test('the seal ignores paths outside the wizard', () => {
  assert.equal(sealRedirectPath('/not-a-wizard-path', true), undefined);
});

await test('the guard opens each step as its slice is filled', () => {
  const withIdentity = { ...authed, identity: {} };
  const withContact = { ...withIdentity, contact: {} };

  assert.equal(guardRedirectPath('/personal', authed), undefined);
  assert.equal(guardRedirectPath('/contact', withIdentity), undefined);
  assert.equal(guardRedirectPath('/driving', withContact), undefined);
});
