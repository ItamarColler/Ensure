import type {
  PolicyIssuedResponse,
  SessionApplication,
  SessionResponse,
  SessionUser,
} from '@ensure/shared';
import { create } from 'zustand';

import { ApiErrorException, postJson, readCsrfCookie } from './api-client';

interface AuthStore {
  user: SessionUser | undefined;
  application: SessionApplication | undefined;
  policy: PolicyIssuedResponse | undefined;
  setUser: (user: SessionUser) => void;
  setSession: (session: SessionResponse) => void;
  setPolicy: (policy: PolicyIssuedResponse) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: undefined,
  application: undefined,
  policy: undefined,
  setUser: (user) => {
    set({ user });
  },
  setSession: (session) => {
    set({
      user: session.user,
      application: session.application,
      policy: session.policy,
    });
  },
  setPolicy: (policy) => {
    set({ policy });
  },
  clearUser: () => {
    set({ user: undefined, application: undefined, policy: undefined });
  },
}));

export async function restoreSession(): Promise<void> {
  if (useAuthStore.getState().user) {
    return;
  }

  if (readCsrfCookie() === undefined) {
    return;
  }

  try {
    useAuthStore
      .getState()
      .setSession(await postJson<SessionResponse>('/auth/session', {}));
  } catch (error) {
    if (!(error instanceof ApiErrorException)) {
      throw error;
    }
  }
}
