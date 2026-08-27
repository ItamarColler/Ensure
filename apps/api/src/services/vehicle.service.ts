import type { Result, VehicleInfo } from '@ensure/shared';

import { insurerClient } from '../clients/insurer.client';

export class VehicleService {
  async lookup(plate: string): Promise<Result<VehicleInfo>> {
    return insurerClient.lookupVehicle(plate);
  }
}

export const vehicleService = new VehicleService();
