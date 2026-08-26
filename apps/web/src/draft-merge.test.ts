import assert from 'node:assert/strict';
import test from 'node:test';

import type { CoverageSelection, VehicleInfo } from '@ensure/shared';

import { mergePersistedDraft } from './draft-merge';
import type { DraftStore } from './store';

function unexercisedAction(): never {
  throw new Error('MERGE_MUST_NOT_INVOKE_STORE_ACTIONS');
}

function currentDraft(): DraftStore {
  return {
    vehicle: undefined,
    setVehicle: unexercisedAction,
    clearVehicle: unexercisedAction,
    setCoverage: unexercisedAction,
  };
}

const validVehicle: VehicleInfo = {
  license_plate: '12345678',
  manufacturer: 'Toyota',
  model: 'Corolla',
  year: 2019,
  color: 'White',
};

const validCoverage: CoverageSelection = {
  tier: 'comprehensive',
  addOns: ['towing', 'glass'],
};

await test('the H-02 trigger, a coverage slice missing addOns, is dropped without throwing', () => {
  const current = currentDraft();

  assert.doesNotThrow(() => {
    mergePersistedDraft({ coverage: { tier: 'comprehensive' } }, current);
  });

  const merged = mergePersistedDraft(
    { coverage: { tier: 'comprehensive' } },
    current,
  );

  assert.equal(Object.hasOwn(merged, 'coverage'), false);
  assert.deepEqual(merged, current);
});

await test('a fully valid persisted draft restores both slices byte for byte', () => {
  const merged = mergePersistedDraft(
    { vehicle: validVehicle, coverage: validCoverage },
    currentDraft(),
  );

  assert.deepEqual(merged.vehicle, validVehicle);
  assert.deepEqual(merged.coverage, validCoverage);
});

await test('a non-object persisted value leaves the current state untouched', () => {
  const current = currentDraft();

  assert.deepEqual(mergePersistedDraft(undefined, current), current);
  assert.deepEqual(mergePersistedDraft('ensure-draft', current), current);
  assert.equal(
    Object.hasOwn(mergePersistedDraft(42, current), 'coverage'),
    false,
  );
});

await test('a malformed vehicle slice is dropped while a valid coverage slice is kept', () => {
  const merged = mergePersistedDraft(
    { vehicle: { ...validVehicle, year: 'abc' }, coverage: validCoverage },
    currentDraft(),
  );

  assert.equal(merged.vehicle, undefined);
  assert.deepEqual(merged.coverage, validCoverage);
});

await test('a coverage slice violating the tier add-on refine is dropped', () => {
  const merged = mergePersistedDraft(
    { coverage: { tier: 'compulsory', addOns: ['glass'] } },
    currentDraft(),
  );

  assert.equal(Object.hasOwn(merged, 'coverage'), false);
});
