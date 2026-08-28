import type {
  ApplicantContact,
  ApplicantIdentity,
  ApplicantRisk,
  CoverageSelection,
  VehicleInfo,
} from '@ensure/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mergePersistedDraft } from './draft-merge';

interface VehicleSlice {
  vehicle: VehicleInfo | undefined;
  setVehicle: (vehicle: VehicleInfo) => void;
  clearVehicle: () => void;
}

interface CoverageSlice {
  coverage?: CoverageSelection | undefined;
  setCoverage: (coverage: CoverageSelection) => void;
}

interface ApplicantSlice {
  identity?: ApplicantIdentity | undefined;
  contact?: ApplicantContact | undefined;
  risk?: ApplicantRisk | undefined;
  setIdentity: (identity: ApplicantIdentity) => void;
  setContact: (contact: ApplicantContact) => void;
  setRisk: (risk: ApplicantRisk) => void;
}

interface ApplicationSlice {
  applicationId: string | undefined;
  setApplicationId: (applicationId: string) => void;
  clearDraft: () => void;
}

export type DraftStore = VehicleSlice &
  CoverageSlice &
  ApplicantSlice &
  ApplicationSlice;

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      vehicle: undefined,
      applicationId: undefined,
      setVehicle: (vehicle) => {
        set({ vehicle });
      },
      clearVehicle: () => {
        set({ vehicle: undefined });
      },
      setCoverage: (coverage) => {
        set({ coverage });
      },
      setApplicationId: (applicationId) => {
        set({ applicationId });
      },
      setIdentity: (identity) => {
        set({ identity });
      },
      setContact: (contact) => {
        set({ contact });
      },
      setRisk: (risk) => {
        set({ risk });
      },
      clearDraft: () => {
        set({
          vehicle: undefined,
          coverage: undefined,
          applicationId: undefined,
          identity: undefined,
          contact: undefined,
          risk: undefined,
        });
      },
    }),
    {
      name: 'ensure-draft',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      merge: mergePersistedDraft,
      partialize: (state) => ({
        ...(state.vehicle !== undefined && { vehicle: state.vehicle }),
        ...(state.coverage !== undefined && { coverage: state.coverage }),
        ...(state.applicationId !== undefined && {
          applicationId: state.applicationId,
        }),
        ...(state.identity !== undefined && { identity: state.identity }),
        ...(state.contact !== undefined && { contact: state.contact }),
        ...(state.risk !== undefined && { risk: state.risk }),
      }),
    },
  ),
);
