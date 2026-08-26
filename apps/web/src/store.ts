import type { VehicleInfo } from '@ensure/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VehicleSlice {
  vehicle?: VehicleInfo;
  setVehicle: (vehicle: VehicleInfo) => void;
}

type DraftStore = VehicleSlice;

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      setVehicle: (vehicle) => {
        set({ vehicle });
      },
    }),
    {
      name: 'ensure-draft',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (state) => ({
        ...(state.vehicle !== undefined && { vehicle: state.vehicle }),
      }),
    },
  ),
);
