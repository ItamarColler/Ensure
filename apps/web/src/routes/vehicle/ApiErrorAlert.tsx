import type { ApiError } from '@ensure/shared';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

interface ApiErrorAlertProps {
  error: ApiError;
  onRetry: () => void;
  retryPending: boolean;
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
        <Button
          type="button"
          variant="text"
          color="inherit"
          startIcon={<RefreshIcon />}
          disabled={retryPending}
          onClick={onRetry}
          sx={{ minInlineSize: 44, minBlockSize: 44 }}
        >
          {retryPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t('errors:retry')
          )}
        </Button>
      }
    >
      {t([`errors:${error.code}`, 'errors:fallback'])}
    </Alert>
  );
}
