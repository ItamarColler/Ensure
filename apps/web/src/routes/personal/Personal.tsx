import {
  applicantIdentitySchema,
  type ApplicantIdentity,
  type ApplicantStepAccepted,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { ApplicantStep, errorKey } from '../../components/ApplicantStep';
import { postJson, type ApiErrorException } from '../../api-client';
import { useDraftStore } from '../../store';
import { nextStepPath } from '../../wizard';

type IdentityInput = Record<keyof ApplicantIdentity, string>;

export function Personal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const identity = useDraftStore((state) => state.identity);
  const setIdentity = useDraftStore((state) => state.setIdentity);

  const { control, handleSubmit } = useForm<
    IdentityInput,
    unknown,
    ApplicantIdentity
  >({
    resolver: zodResolver<IdentityInput, unknown, ApplicantIdentity>(
      applicantIdentitySchema,
    ),
    mode: 'onBlur',
    defaultValues: {
      firstName: identity?.firstName ?? '',
      lastName: identity?.lastName ?? '',
      nationalId: identity?.nationalId ?? '',
    },
  });

  const mutation = useMutation<
    ApplicantStepAccepted,
    ApiErrorException,
    ApplicantIdentity
  >({
    mutationFn: (values) =>
      postJson<ApplicantStepAccepted>('/applicant/identity', values),
    onSuccess: (_data, values) => {
      setIdentity(values);

      const target = nextStepPath(pathname);

      if (target) {
        void navigate(target);
      }
    },
  });

  const submit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <ApplicantStep
      heading={t('applicant:groups.identity')}
      submitLabel={t('applicant:continueCta')}
      pending={mutation.isPending}
      error={mutation.error}
      onRetry={() => {
        if (mutation.variables !== undefined) {
          mutation.mutate(mutation.variables);
        }
      }}
      onSubmit={submit}
      showBack={false}
    >
      <Controller
        name="firstName"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
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
    </ApplicantStep>
  );
}
