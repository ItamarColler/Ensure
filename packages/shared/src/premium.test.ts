import assert from 'node:assert/strict';
import test from 'node:test';

import { estimatePremium } from './premium';
import type { CoverageSelection } from './schemas/coverage';
import type { VehicleInfo } from './schemas/vehicle';

const referenceYear = 2026;

function vehicleOfYear(year: number): VehicleInfo {
  return {
    license_plate: '12345678',
    manufacturer: 'Toyota',
    model: 'Corolla',
    year,
    color: 'White',
  };
}

await test('a mid-age comprehensive policy sums the tier base and both flat add-ons', () => {
  const coverage: CoverageSelection = {
    tier: 'comprehensive',
    addOns: ['towing', 'glass'],
  };

  assert.equal(
    estimatePremium(vehicleOfYear(2019), coverage, referenceYear),
    4850,
  );
});

await test('a nearly new compulsory policy applies the young-vehicle surcharge', () => {
  const coverage: CoverageSelection = { tier: 'compulsory', addOns: [] };

  assert.equal(
    estimatePremium(vehicleOfYear(2025), coverage, referenceYear),
    2340,
  );
});

await test('an old third party policy applies the aged-vehicle discount before add-ons', () => {
  const coverage: CoverageSelection = {
    tier: 'thirdParty',
    addOns: ['towing'],
  };

  assert.equal(
    estimatePremium(vehicleOfYear(2010), coverage, referenceYear),
    2330,
  );
});

await test('identical inputs always produce an identical premium', () => {
  const vehicle = vehicleOfYear(2019);
  const coverage: CoverageSelection = {
    tier: 'comprehensive',
    addOns: ['replacementCar'],
  };

  assert.equal(
    estimatePremium(vehicle, coverage, referenceYear),
    estimatePremium(vehicle, coverage, referenceYear),
  );
});
