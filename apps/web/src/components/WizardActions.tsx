import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { PendingButton } from './PendingButton';
import { previousStepPath } from '../wizard';

interface WizardActionsProps {
  submitLabel: ReactNode;
  pending?: boolean;
  backLabel?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function WizardActions({
  submitLabel,
  pending,
  backLabel,
  onBack,
  showBack,
}: WizardActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const target = previousStepPath(pathname);

    if (target) {
      void navigate(target);
    }
  };

  return (
    <Stack spacing={1}>
      <PendingButton
        type="submit"
        variant="contained"
        fullWidth
        {...(pending !== undefined && { pending })}
      >
        {submitLabel}
      </PendingButton>

      {showBack !== false && (
        <Button
          type="button"
          variant="text"
          onClick={goBack}
          sx={{ color: 'text.secondary' }}
        >
          {backLabel ?? t('wizard.back')}
        </Button>
      )}
    </Stack>
  );
}
