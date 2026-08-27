import type { IssuePolicyRequest } from '@ensure/shared';
import type { Request, Response } from 'express';

import { sendResult } from '../http/send-result';
import { policyIssuanceService } from '../services/policy-issuance.service';

class PolicyController {
  readonly issue = async (
    userId: string,
    req: Request,
    res: Response,
  ): Promise<void> => {
    const payload = req.body as IssuePolicyRequest;

    const result = await policyIssuanceService.issue(userId, payload);

    sendResult(res, result);
  };
}

export const policyController = new PolicyController();
