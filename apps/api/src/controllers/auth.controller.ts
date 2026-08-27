import type { LoginRequest, RegisterRequest } from '@ensure/shared';
import type { Request, Response } from 'express';

import { clearAuthCookies, setAuthCookies } from '../http/auth-cookies';
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

  readonly login = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as LoginRequest;

    const result = await authService.login(payload);

    if (result.ok) {
      setAuthCookies(res, result.data.user.id);
    }

    sendResult(res, result);
  };

  readonly session = async (
    userId: string,
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const result = await authService.sessionUser(userId);

    sendResult(res, result);
  };

  readonly logout = (
    _userId: string,
    _req: Request,
    res: Response,
  ): Promise<void> => {
    clearAuthCookies(res);

    sendResult(res, { ok: true, data: { loggedOut: true } });

    return Promise.resolve();
  };
}

export const authController = new AuthController();
