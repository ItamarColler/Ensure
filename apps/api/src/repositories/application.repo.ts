import type { CoverageSelection, VehicleInfo } from '@ensure/shared';
import { coverageSelectionSchema, vehicleInfoSchema } from '@ensure/shared';

import type { DbExecutor } from '../db/pool';
import type {
  ApplicationRow,
  CoverageSelectionRow,
  VehicleRow,
} from '../db/rows';
import { applications, coverageSelections, vehicles } from '../db/schema';

export interface PersistedDraft {
  applicationId: string;
  vehicle: VehicleInfo;
  coverage: CoverageSelection;
}

export async function insertDraft(
  tx: DbExecutor,
  userId: string,
  vehicle: VehicleInfo,
  coverage: CoverageSelection,
): Promise<PersistedDraft> {
  const insertedApplications: ApplicationRow[] = await tx
    .insert(applications)
    .values({ userId })
    .returning();

  const application = insertedApplications[0];

  if (!application) {
    throw new Error('application insert returned no row');
  }

  const insertedVehicles: VehicleRow[] = await tx
    .insert(vehicles)
    .values({
      applicationId: application.id,
      licensePlate: vehicle.license_plate,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
    })
    .returning();

  const persistedVehicle = insertedVehicles[0];

  if (!persistedVehicle) {
    throw new Error('vehicle insert returned no row');
  }

  const insertedCoverage: CoverageSelectionRow[] = await tx
    .insert(coverageSelections)
    .values({
      applicationId: application.id,
      coverageType: coverage.tier,
      options: { addOns: [...coverage.addOns] },
    })
    .returning();

  const persistedCoverage = insertedCoverage[0];

  if (!persistedCoverage) {
    throw new Error('coverage selection insert returned no row');
  }

  return {
    applicationId: application.id,
    vehicle: vehicleInfoSchema.parse({
      license_plate: persistedVehicle.licensePlate,
      manufacturer: persistedVehicle.manufacturer,
      model: persistedVehicle.model,
      year: persistedVehicle.year,
      color: persistedVehicle.color,
    }),
    coverage: coverageSelectionSchema.parse({
      tier: persistedCoverage.coverageType,
      addOns: persistedCoverage.options.addOns,
    }),
  };
}
