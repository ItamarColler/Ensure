import type { AddOn, CoverageSelection, CoverageTier } from './schemas/coverage';
import type { VehicleInfo } from './schemas/vehicle';

export const BASE_PREMIUM_BY_TIER: Record<CoverageTier, number> = {
  compulsory: 1800,
  thirdParty: 2600,
  comprehensive: 4200,
};

export const FLAT_ADDON_PRICES: Record<AddOn, number> = {
  towing: 250,
  glass: 400,
  replacementCar: 600,
};

export const NEUTRAL_DRIVER_COUNT_FACTOR = 1;

export const NEUTRAL_FAMILY_STATUS_FACTOR = 1;

const youngVehicleMaxAge = 2;
const midAgeVehicleMaxAge = 7;
const youngVehicleFactor = 1.3;
const midAgeVehicleFactor = 1;
const agedVehicleFactor = 0.8;

export function vehicleAgeFactor(year: number, referenceYear: number): number {
  const age = referenceYear - year;

  if (age <= youngVehicleMaxAge) {
    return youngVehicleFactor;
  }

  if (age <= midAgeVehicleMaxAge) {
    return midAgeVehicleFactor;
  }

  return agedVehicleFactor;
}

function addOnTotal(addOns: readonly AddOn[]): number {
  let total = 0;

  for (const addOn of addOns) {
    total += FLAT_ADDON_PRICES[addOn];
  }

  return total;
}

export function estimatePremium(
  vehicle: VehicleInfo,
  coverage: CoverageSelection,
  referenceYear: number = new Date().getFullYear(),
): number {
  return Math.round(
    BASE_PREMIUM_BY_TIER[coverage.tier] *
      vehicleAgeFactor(vehicle.year, referenceYear) *
      NEUTRAL_DRIVER_COUNT_FACTOR *
      NEUTRAL_FAMILY_STATUS_FACTOR +
      addOnTotal(coverage.addOns),
  );
}
