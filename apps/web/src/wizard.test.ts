import assert from 'node:assert/strict';
import test from 'node:test';

import {
  guardRedirectPath,
  nextStepPath,
  previousStepPath,
  stepIndex,
  wizardResetPath,
  wizardSteps,
} from './wizard';

await test('stepIndex resolves each implemented path and the register path by order', () => {
  assert.equal(stepIndex('/vehicle'), 0);
  assert.equal(stepIndex('/coverage'), 1);
  assert.equal(stepIndex('/quote'), 2);
  assert.equal(stepIndex('/register'), 3);
});

await test('stepIndex resolves an unknown pathname to undefined', () => {
  assert.equal(stepIndex('/nowhere'), undefined);
  assert.equal(stepIndex(''), undefined);
});

await test('guardRedirectPath reproduces the Phase 02 redirect chain exactly', () => {
  assert.equal(guardRedirectPath('/coverage', {}), '/vehicle');
  assert.equal(guardRedirectPath('/quote', {}), '/vehicle');
  assert.equal(guardRedirectPath('/quote', { vehicle: {} }), '/coverage');
  assert.equal(
    guardRedirectPath('/quote', { vehicle: {}, coverage: {} }),
    undefined,
  );
  assert.equal(guardRedirectPath('/vehicle', {}), undefined);
});

await test('adjacent step derivations walk the manifest in both directions', () => {
  assert.equal(nextStepPath('/vehicle'), '/coverage');
  assert.equal(nextStepPath('/coverage'), '/quote');
  assert.equal(previousStepPath('/coverage'), '/vehicle');
  assert.equal(previousStepPath('/vehicle'), undefined);
});

await test('wizardResetPath is the first step', () => {
  assert.equal(wizardResetPath, '/vehicle');
});

await test('the manifest holds six ordered steps with only the first three implemented', () => {
  assert.deepEqual(
    wizardSteps.map((step) => step.key),
    ['vehicle', 'coverage', 'quote', 'register', 'details', 'confirmation'],
  );

  assert.deepEqual(
    wizardSteps.map((step) => step.implemented),
    [true, true, true, false, false, false],
  );
});

await test('the register step is gated on both draft slices so Phase 3 is a one-field flip', () => {
  const register = wizardSteps.find((step) => step.key === 'register');

  assert.ok(register);
  assert.equal(register.path, '/register');
  assert.deepEqual([...register.requires], ['vehicle', 'coverage']);
});
