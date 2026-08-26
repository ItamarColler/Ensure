import type { Result, VehicleInfo } from '@ensure/shared';

import { insurerClient } from '../clients';

export class VehicleService {
  async lookup(plate: string): Promise<Result<VehicleInfo>> {
    return insurerClient.lookupVehicle(plate);
  }
}
