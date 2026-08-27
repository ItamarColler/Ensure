import type { RouteMount } from '../http/route-mount';

import healthRouter from './health.router';
import vehicleRouter from './vehicle.router';

export const routeMounts: readonly RouteMount[] = [
  { path: '/vehicle', router: vehicleRouter },
  { path: '/health', router: healthRouter },
];
