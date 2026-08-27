import type { FamilyStatus } from './schemas/applicant';
import type {
  AddOn,
  CoverageSelection,
  CoverageTier,
} from './schemas/coverage';
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

const youngVehicleMaxAge = 2;
const midAgeVehicleMaxAge = 7;
const youngVehicleFactor = 1.3;
const midAgeVehicleFactor = 1;
const agedVehicleFactor = 0.8;

const soleDriverFactor = 1;
const twoDriverFactor = 1;
const threeDriverFactor = 1;
const manyDriverFactor = 1;

const marriedFamilyStatusFactor = 1;
const neutralFamilyStatusFactor = 1;

export const FAMILY_STATUS_FACTOR: Record<FamilyStatus, number> = {
  married: marriedFamilyStatusFactor,
  single: neutralFamilyStatusFactor,
  divorced: neutralFamilyStatusFactor,
  widowed: neutralFamilyStatusFactor,
};

export function driverCountFactor(driversCount: number): number {
  if (driversCount <= 1) {
    return soleDriverFactor;
  }

  if (driversCount === 2) {
    return twoDriverFactor;
  }

  if (driversCount === 3) {
    return threeDriverFactor;
  }

  return manyDriverFactor;
}

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
  driversCount = 1,
  familyStatus: FamilyStatus = 'single',
): number {
  return Math.round(
    BASE_PREMIUM_BY_TIER[coverage.tier] *
      vehicleAgeFactor(vehicle.year, referenceYear) *
      driverCountFactor(driversCount) *
      FAMILY_STATUS_FACTOR[familyStatus] +
      addOnTotal(coverage.addOns),
  );
}
