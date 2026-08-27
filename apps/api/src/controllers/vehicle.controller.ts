import type { VehicleLookupRequest } from '@ensure/shared';
import type { Request, Response } from 'express';

import { sendResult } from '../http/send-result';
import { vehicleService } from '../services';

class VehicleController {
  readonly lookup = async (req: Request, res: Response): Promise<void> => {
    const { plate } = req.body as VehicleLookupRequest;

    const result = await vehicleService.lookup(plate);

    sendResult(res, result);
  };
}

export const vehicleController = new VehicleController();
