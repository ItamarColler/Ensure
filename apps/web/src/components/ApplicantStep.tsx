import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FieldError } from 'react-hook-form';
import type { BaseSyntheticEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiErrorException } from '../api-client';
import { ApiErrorAlert } from './ApiErrorAlert';
import { WizardActions } from './WizardActions';

export function errorKey(error: FieldError | undefined): string | undefined {
  return error?.message === undefined
    ? undefined
    : `applicant:errors.${error.message}`;
}

interface ApplicantStepProps {
  heading: string;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onRetry: () => void;
  onSubmit: (event: BaseSyntheticEvent) => Promise<void>;
  children?: ReactNode;
}

export function ApplicantStep({
  heading,
  submitLabel,
  pending,
  error,
  onRetry,
  onSubmit,
  children,
}: ApplicantStepProps) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
    >
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h6" component="h1">
            {heading}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t('applicant:subtitle')}
          </Typography>
        </Stack>

        {error instanceof ApiErrorException && (
          <ApiErrorAlert
            error={error.apiError}
            onRetry={onRetry}
            retryPending={pending}
          />
        )}

        <Stack spacing={6}>{children}</Stack>

        <WizardActions submitLabel={submitLabel} pending={pending} />
      </Stack>
    </form>
  );
}
