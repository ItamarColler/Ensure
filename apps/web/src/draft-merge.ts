import { coverageSelectionSchema, vehicleInfoSchema } from '@ensure/shared';

import type { DraftStore } from './store';

type PersistedSlices = Partial<
  Record<'vehicle' | 'coverage' | 'applicationId', unknown>
>;

export function mergePersistedDraft(
  persisted: unknown,
  current: DraftStore,
): DraftStore {
  const slices = persisted as PersistedSlices | undefined;
  const vehicle = vehicleInfoSchema.safeParse(slices?.vehicle);
  const coverage = coverageSelectionSchema.safeParse(slices?.coverage);
  const applicationId = slices?.applicationId;

  return {
    ...current,
    ...(vehicle.success && { vehicle: vehicle.data }),
    ...(coverage.success && { coverage: coverage.data }),
    ...(typeof applicationId === 'string' &&
      applicationId.length > 0 && { applicationId }),
  };
}
