import express from 'express';
import type { Express } from 'express';

import { createApi } from './api';
import type { RouteMount } from './http/route-mount';
import { errorHandler, notFoundHandler } from './middleware/terminal-handlers';

export function createApp(mounts: readonly RouteMount[]): Express {
  const app = express();

  app.use(express.json());
  app.use('/api', createApi(mounts));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
