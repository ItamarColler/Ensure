import Stack from '@mui/material/Stack';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ApiErrorAlert } from './ApiErrorAlert';
import { PendingButton } from './PendingButton';
import { postJson, type ApiErrorException } from '../api-client';
import { useAuthStore } from '../auth-store';
import { useDraftStore } from '../store';
import { wizardResetPath } from '../wizard';

interface LogoutResult {
  loggedOut: boolean;
}

export function LogoutButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const logout = useMutation<LogoutResult, ApiErrorException>({
    mutationFn: () => postJson<LogoutResult>('/auth/logout', {}),
    onSuccess: () => {
      useAuthStore.getState().clearUser();
      useDraftStore.getState().clearDraft();
      void navigate(wizardResetPath);
    },
  });

  return (
    <Stack spacing={1} sx={{ marginInlineStart: 'auto' }}>
      <PendingButton
        type="button"
        variant="outlined"
        color="inherit"
        pending={logout.isPending}
        onClick={() => {
          logout.mutate();
        }}
        sx={{ minInlineSize: 44, minBlockSize: 44 }}
      >
        {t('auth:logout')}
      </PendingButton>

      {logout.error && (
        <ApiErrorAlert
          error={logout.error.apiError}
          onRetry={() => {
            logout.mutate();
          }}
          retryPending={logout.isPending}
        />
      )}
    </Stack>
  );
}
