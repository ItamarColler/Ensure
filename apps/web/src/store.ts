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
  coverage?: CoverageSelection;
  setCoverage: (coverage: CoverageSelection) => void;
}

export type DraftStore = VehicleSlice & CoverageSlice;

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      vehicle: undefined,
      setVehicle: (vehicle) => {
        set({ vehicle });
      },
      clearVehicle: () => {
        set({ vehicle: undefined });
      },
      setCoverage: (coverage) => {
        set({ coverage });
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
      }),
    },
  ),
);
