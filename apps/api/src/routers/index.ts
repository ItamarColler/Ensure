import { healthController, vehicleController } from '../controllers';
import type { RouteMount } from '../http/route-mount';

import { createHealthRouter } from './health.router';
import { createVehicleRouter } from './vehicle.router';

export const routeMounts: readonly RouteMount[] = [
  { path: '/vehicle', router: createVehicleRouter(vehicleController) },
  { path: '/health', router: createHealthRouter(healthController) },
];
