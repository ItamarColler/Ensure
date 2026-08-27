import type { CoverageSelection, VehicleInfo } from '@ensure/shared';
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

interface ApplicationSlice {
  applicationId: string | undefined;
  setApplicationId: (applicationId: string) => void;
  clearDraft: () => void;
}

export type DraftStore = VehicleSlice & CoverageSlice & ApplicationSlice;

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
      clearDraft: () => {
        set({
          vehicle: undefined,
          coverage: undefined,
          applicationId: undefined,
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
      }),
    },
  ),
);
