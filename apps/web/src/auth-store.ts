import type { SessionUser } from '@ensure/shared';
import { create } from 'zustand';

import { ApiErrorException, postJson } from './api-client';

interface AuthStore {
  user: SessionUser | undefined;
  setUser: (user: SessionUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: undefined,
  setUser: (user) => {
    set({ user });
  },
  clearUser: () => {
    set({ user: undefined });
  },
}));

export async function restoreSession(): Promise<void> {
  if (useAuthStore.getState().user) {
    return;
  }

  try {
    useAuthStore
      .getState()
      .setUser(await postJson<SessionUser>('/auth/session', {}));
  } catch (error) {
    if (!(error instanceof ApiErrorException)) {
      throw error;
    }
  }
}
