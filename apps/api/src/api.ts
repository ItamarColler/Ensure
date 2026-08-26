import { Router } from 'express';

import type { RouteMount } from './http/route-mount';

export function createApi(mounts: readonly RouteMount[]): Router {
  const router = Router();

  for (const mount of mounts) {
    router.use(mount.path, mount.router);
  }

  return router;
}
