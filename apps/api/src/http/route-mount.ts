import type { Router } from 'express';

export interface RouteMount {
  path: string;
  router: Router;
}
