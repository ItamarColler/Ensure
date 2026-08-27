import type { AuthResponse, RegisterRequest, Result } from '@ensure/shared';
import bcrypt from 'bcryptjs';

import { config } from '../config';
import { db } from '../db/pool';
import { insertDraft } from '../repositories/application.repo';
import { findUserByEmail, insertUser } from '../repositories/user.repo';

const uniqueViolationCode = '23505';

const emailTaken: Result<never> = {
  ok: false,
  error: { code: 'CONFLICT', message: 'email already registered' },
};

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error && Reflect.get(error, 'code') === uniqueViolationCode
  );
}

export class AuthService {
  async register(payload: RegisterRequest): Promise<Result<AuthResponse>> {
    const existing = await findUserByEmail(payload.email);

    if (existing) {
      return emailTaken;
    }

    const passwordHash = await bcrypt.hash(payload.password, config.bcryptCost);

    try {
      return await db.transaction(async (tx): Promise<Result<AuthResponse>> => {
        const user = await insertUser(tx, {
          email: payload.email,
          passwordHash,
          termsAccepted: payload.termsAccepted,
          marketingOptIn: payload.marketingOptIn ?? false,
        });

        const draft = await insertDraft(
          tx,
          user.id,
          payload.vehicle,
          payload.coverage,
        );

        return {
          ok: true,
          data: {
            user: { id: user.id, email: user.email },
            applicationId: draft.applicationId,
            vehicle: draft.vehicle,
            coverage: draft.coverage,
          },
        };
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return emailTaken;
      }

      throw error;
    }
  }
}

export const authService = new AuthService();
