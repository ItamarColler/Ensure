import { registerRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { rateLimit } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate-body';

const registerRateLimit = { limit: 10, windowMs: 60_000 };

const authRouter = Router();

authRouter.post(
  '/register',
  rateLimit(registerRateLimit),
  validateBody(registerRequestSchema),
  authController.register,
);

export default authRouter;
