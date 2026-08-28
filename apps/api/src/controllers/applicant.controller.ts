import type { Request, Response } from 'express';

import { sendResult } from '../http/send-result';

class ApplicantController {
  readonly accept = (
    _userId: string,
    _req: Request,
    res: Response,
  ): Promise<void> => {
    sendResult(res, { ok: true, data: { valid: true } });

    return Promise.resolve();
  };
}

export const applicantController = new ApplicantController();
