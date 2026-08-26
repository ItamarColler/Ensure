import type { CoverageSelection, VehicleInfo } from '@ensure/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VehicleSlice {
  vehicle?: VehicleInfo;
  setVehicle: (vehicle: VehicleInfo) => void;
}

interface CoverageSlice {
  coverage?: CoverageSelection;
  setCoverage: (coverage: CoverageSelection) => void;
}

type DraftStore = VehicleSlice & CoverageSlice;

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      setVehicle: (vehicle) => {
        set({ vehicle });
      },
      setCoverage: (coverage) => {
        set({ coverage });
      },
    }),
    {
      name: 'ensure-draft',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (state) => ({
        ...(state.vehicle !== undefined && { vehicle: state.vehicle }),
        ...(state.coverage !== undefined && { coverage: state.coverage }),
      }),
    },
  ),
);
