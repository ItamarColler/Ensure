
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Control, FieldError } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { NumericInline } from '../../components/NumericInline';
import type { ApplicantFormValues } from './Details';

export const applicantFormId = 'applicant-details-form';

export const driversCountOptions = [1, 2, 3, 4] as const;

export const familyStatusOptions = [
  'single',
  'married',
  'divorced',
  'widowed',
] as const;

interface ApplicantDetailsFormProps {
  control: Control<ApplicantFormValues>;
  disabled: boolean;
  onSubmit: () => void;
  children?: React.ReactNode;
}

function selectValue(value: string | number | undefined): string | number {
  return value ?? '';
}

function errorKey(error: FieldError | undefined): string | undefined {
  return error?.message === undefined
    ? undefined
    : `applicant:errors.${error.message}`;
}

export function ApplicantDetailsForm({
  control,
  disabled,
  onSubmit,
  children,
}: ApplicantDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <form id={applicantFormId} onSubmit={onSubmit} noValidate>
      <Stack spacing="24px">
        <Stack spacing="16px">
          <Typography
            component="h2"
            sx={{ fontSize: '11.5px', fontWeight: 700 }}
          >
            {t('applicant:groups.identity')}
          </Typography>

          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                disabled={disabled}
                label={t('applicant:firstNameLabel')}
                autoComplete="given-name"
                error={fieldState.error !== undefined}
                helperText={t(errorKey(fieldState.error) ?? 'applicant:blankHelper')}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                disabled={disabled}
                label={t('applicant:lastNameLabel')}
                autoComplete="family-name"
                error={fieldState.error !== undefined}
                helperText={t(errorKey(fieldState.error) ?? 'applicant:blankHelper')}
              />
            )}
          />

          <Controller
            name="nationalId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                disabled={disabled}
                label={t('applicant:nationalIdLabel')}
                slotProps={{
                  htmlInput: {
                    dir: 'ltr',
                    inputMode: 'numeric',
                    autoComplete: 'off',
                    maxLength: 9,
                  },
                }}
                error={fieldState.error !== undefined}
                helperText={t(
                  errorKey(fieldState.error) ?? 'applicant:nationalIdHint',
                )}
              />
            )}
          />
        </Stack>

        <Stack spacing="16px">
          <Typography
            component="h2"
            sx={{ fontSize: '11.5px', fontWeight: 700 }}
          >
            {t('applicant:groups.contact')}
          </Typography>

          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                disabled={disabled}
                label={t('applicant:phoneLabel')}
                slotProps={{
                  htmlInput: {
                    dir: 'ltr',
                    inputMode: 'tel',
                    autoComplete: 'tel',
                  },
                }}
                error={fieldState.error !== undefined}
                helperText={
                  <Trans
                    i18nKey={errorKey(fieldState.error) ?? 'applicant:phoneHint'}
                    components={{ ltr: <NumericInline /> }}
                  />
                }
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                disabled={disabled}
                label={t('applicant:addressLabel')}
                autoComplete="street-address"
                multiline
                error={fieldState.error !== undefined}
                helperText={t(
                  errorKey(fieldState.error) ?? 'applicant:addressHint',
                )}
              />
            )}
          />
        </Stack>

        <Stack spacing="16px">
          <Typography
            component="h2"
            sx={{ fontSize: '11.5px', fontWeight: 700 }}
          >
            {t('applicant:groups.risk')}
          </Typography>

          <Controller
            name="driversCount"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                value={selectValue(field.value)}
                disabled={disabled}
                label={t('applicant:driversCountLabel')}
                error={fieldState.error !== undefined}
                helperText={t(errorKey(fieldState.error) ?? 'applicant:blankHelper')}
              >
                {driversCountOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {t(`applicant:driversCount.${String(option)}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="familyStatus"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                value={selectValue(field.value)}
                disabled={disabled}
                label={t('applicant:familyStatusLabel')}
                error={fieldState.error !== undefined}
                helperText={t(errorKey(fieldState.error) ?? 'applicant:blankHelper')}
              >
                {familyStatusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {t(`applicant:familyStatus.${option}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>

        {children}
      </Stack>
    </form>
  );
}
