import {
  applicantContactSchema,
  applicantIdentitySchema,
  applicantRiskSchema,
  coverageSelectionSchema,
  vehicleInfoSchema,
} from '@ensure/shared';

import type { DraftStore } from './store';

type PersistedSlices = Partial<
  Record<
    'vehicle' | 'coverage' | 'applicationId' | 'identity' | 'contact' | 'risk',
    unknown
  >
>;

export function mergePersistedDraft(
  persisted: unknown,
  current: DraftStore,
): DraftStore {
  const slices = persisted as PersistedSlices | undefined;
  const vehicle = vehicleInfoSchema.safeParse(slices?.vehicle);
  const coverage = coverageSelectionSchema.safeParse(slices?.coverage);
  const applicationId = slices?.applicationId;
  const identity = applicantIdentitySchema.safeParse(slices?.identity);
  const contact = applicantContactSchema.safeParse(slices?.contact);
  const risk = applicantRiskSchema.safeParse(slices?.risk);

  return {
    ...current,
    ...(vehicle.success && { vehicle: vehicle.data }),
    ...(coverage.success && { coverage: coverage.data }),
    ...(typeof applicationId === 'string' &&
      applicationId.length > 0 && { applicationId }),
    ...(identity.success && { identity: identity.data }),
    ...(contact.success && { contact: contact.data }),
    ...(risk.success && { risk: risk.data }),
  };
}
