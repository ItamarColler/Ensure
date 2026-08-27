import assert from 'node:assert/strict';
import test from 'node:test';

import {
  driverCountFactor,
  estimatePremium,
  FAMILY_STATUS_FACTOR,
} from './premium';
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

await test('driver count factors bucket at one, two, three and four plus drivers', () => {
  assert.equal(driverCountFactor(1), 1);
  assert.equal(driverCountFactor(2), 1.15);
  assert.equal(driverCountFactor(3), 1.3);
  assert.equal(driverCountFactor(4), 1.5);
  assert.equal(driverCountFactor(20), 1.5);
});

await test('family status factors discount married and stay neutral otherwise', () => {
  assert.equal(FAMILY_STATUS_FACTOR.married, 0.95);
  assert.equal(FAMILY_STATUS_FACTOR.single, 1);
  assert.equal(FAMILY_STATUS_FACTOR.divorced, 1);
  assert.equal(FAMILY_STATUS_FACTOR.widowed, 1);
});

await test('neutral defaults reproduce the three argument estimate bit for bit', () => {
  const coverage: CoverageSelection = {
    tier: 'comprehensive',
    addOns: ['towing', 'glass'],
  };

  assert.equal(
    estimatePremium(vehicleOfYear(2019), coverage, referenceYear),
    estimatePremium(vehicleOfYear(2019), coverage, referenceYear, 1, 'single'),
  );
});

await test('a married two driver comprehensive policy composes all five factors', () => {
  const coverage: CoverageSelection = {
    tier: 'comprehensive',
    addOns: ['towing', 'glass'],
  };

  assert.equal(
    estimatePremium(vehicleOfYear(2019), coverage, referenceYear, 2, 'married'),
    5239,
  );
});

await test('identical five argument inputs always produce an identical premium', () => {
  const vehicle = vehicleOfYear(2019);
  const coverage: CoverageSelection = { tier: 'thirdParty', addOns: ['towing'] };

  assert.equal(
    estimatePremium(vehicle, coverage, referenceYear, 3, 'married'),
    estimatePremium(vehicle, coverage, referenceYear, 3, 'married'),
  );
});
