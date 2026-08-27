import { Router } from 'express';

import { healthController } from '../controllers/health.controller';

const healthRouter = Router();

healthRouter.post('/', healthController.check);

export default healthRouter;
