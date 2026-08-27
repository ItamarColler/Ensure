import { loginRequestSchema, registerRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { verifyCsrf } from '../middleware/csrf';
import { rateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate-body';

const registerRateLimit = { limit: 10, windowMs: 60_000 };
const loginRateLimit = { limit: 5, windowMs: 60_000 };

const authRouter = Router();

authRouter.post(
  '/register',
  rateLimit(registerRateLimit),
  validateBody(registerRequestSchema),
  authController.register,
);

authRouter.post(
  '/login',
  rateLimit(loginRateLimit),
  validateBody(loginRequestSchema),
  authController.login,
);

authRouter.post('/session', requireAuth(authController.session));

authRouter.post('/logout', verifyCsrf, requireAuth(authController.logout));

export default authRouter;
