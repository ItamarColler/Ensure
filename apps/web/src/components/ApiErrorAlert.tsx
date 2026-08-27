import type { ApiError, ApiErrorCode } from '@ensure/shared';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';

import { PendingButton } from './PendingButton';

interface ApiErrorAlertProps {
  error: ApiError;
  onRetry: () => void;
  retryPending: boolean;
}

export function apiErrorMessageKeys(code: ApiErrorCode): [string, string] {
  return [`errors:${code}`, 'errors:fallback'];
}

export function ApiErrorAlert({
  error,
  onRetry,
  retryPending,
}: ApiErrorAlertProps) {
  const { t } = useTranslation();

  return (
    <Alert
      severity="error"
      action={
        <PendingButton
          type="button"
          variant="text"
          color="inherit"
          startIcon={<RefreshIcon />}
          pending={retryPending}
          onClick={onRetry}
          sx={{ minInlineSize: 44, minBlockSize: 44 }}
        >
          {t('errors:retry')}
        </PendingButton>
      }
    >
      {t(apiErrorMessageKeys(error.code))}
    </Alert>
  );
}
