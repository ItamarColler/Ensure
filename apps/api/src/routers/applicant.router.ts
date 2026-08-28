import {
  applicantContactSchema,
  applicantIdentitySchema,
  applicantRiskSchema,
} from '@ensure/shared';
import { Router } from 'express';

import { applicantController } from '../controllers/applicant.controller';
import { verifyCsrf } from '../middleware/csrf';
import { rateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/require-auth';
import { validateBody } from '../middleware/validate-body';

const stepRateLimit = { limit: 30, windowMs: 60_000 };

const applicantRouter = Router();

applicantRouter.post(
  '/identity',
  verifyCsrf,
  rateLimit(stepRateLimit),
  validateBody(applicantIdentitySchema),
  requireAuth(applicantController.accept),
);

applicantRouter.post(
  '/contact',
  verifyCsrf,
  rateLimit(stepRateLimit),
  validateBody(applicantContactSchema),
  requireAuth(applicantController.accept),
);

applicantRouter.post(
  '/risk',
  verifyCsrf,
  rateLimit(stepRateLimit),
  validateBody(applicantRiskSchema),
  requireAuth(applicantController.accept),
);

export default applicantRouter;
