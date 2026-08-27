import type { CoverageSelection, VehicleInfo } from '@ensure/shared';
import { coverageSelectionSchema, vehicleInfoSchema } from '@ensure/shared';
import { desc, eq } from 'drizzle-orm';

import type { DbExecutor } from '../db/pool';
import { db } from '../db/pool';
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

export async function findApplicationById(
  id: string,
): Promise<ApplicationRow | undefined> {
  const rows: ApplicationRow[] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  return rows[0];
}

export async function markApplicationPendingReview(
  tx: DbExecutor,
  applicationId: string,
): Promise<void> {
  await tx
    .update(applications)
    .set({ status: 'pending_review', stage: 3, updatedAt: new Date() })
    .where(eq(applications.id, applicationId));
}

export interface PersistedStageOneDraft {
  vehicle: VehicleInfo;
  coverage: CoverageSelection;
}

export async function findPersistedDraft(
  applicationId: string,
): Promise<PersistedStageOneDraft> {
  const vehicleRows: VehicleRow[] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.applicationId, applicationId))
    .limit(1);

  const vehicleRow = vehicleRows[0];

  if (!vehicleRow) {
    throw new Error('application has no persisted vehicle');
  }

  const coverageRows: CoverageSelectionRow[] = await db
    .select()
    .from(coverageSelections)
    .where(eq(coverageSelections.applicationId, applicationId))
    .limit(1);

  const coverageRow = coverageRows[0];

  if (!coverageRow) {
    throw new Error('application has no persisted coverage selection');
  }

  return {
    vehicle: vehicleInfoSchema.parse({
      license_plate: vehicleRow.licensePlate,
      manufacturer: vehicleRow.manufacturer,
      model: vehicleRow.model,
      year: vehicleRow.year,
      color: vehicleRow.color,
    }),
    coverage: coverageSelectionSchema.parse({
      tier: coverageRow.coverageType,
      addOns: coverageRow.options.addOns,
    }),
  };
}

export async function findLatestApplicationByUserId(
  userId: string,
): Promise<ApplicationRow | undefined> {
  const rows: ApplicationRow[] = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt))
    .limit(1);

  return rows[0];
}
