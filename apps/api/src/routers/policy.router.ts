import { issuePolicyRequestSchema } from '@ensure/shared';
import { Router } from 'express';

import { policyController } from '../controllers/policy.controller';
import { verifyCsrf } from '../middleware/csrf';
import { rateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate-body';

const issueRateLimit = { limit: 10, windowMs: 60_000 };

const policyRouter = Router();

policyRouter.post(
  '/issue',
  verifyCsrf,
  rateLimit(issueRateLimit),
  validateBody(issuePolicyRequestSchema),
  requireAuth(policyController.issue),
);

export default policyRouter;
