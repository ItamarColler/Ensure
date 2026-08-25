import type { Result, VehicleInfo } from '@ensure/shared';

import type { InsurerClient } from '../clients/insurer.client';

export class VehicleService {
  constructor(private readonly insurerClient: InsurerClient) {}

  async lookup(plate: string): Promise<Result<VehicleInfo>> {
    return this.insurerClient.lookupVehicle(plate);
  }
}
