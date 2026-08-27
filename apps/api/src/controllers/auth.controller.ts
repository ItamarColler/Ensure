import type { RegisterRequest } from '@ensure/shared';
import type { Request, Response } from 'express';

import { setAuthCookies } from '../http/auth-cookies';
import { sendResult } from '../http/send-result';
import { authService } from '../services/auth.service';

class AuthController {
  readonly register = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as RegisterRequest;

    const result = await authService.register(payload);

    if (result.ok) {
      setAuthCookies(res, result.data.user.id);
    }

    sendResult(res, result);
  };
}

export const authController = new AuthController();
