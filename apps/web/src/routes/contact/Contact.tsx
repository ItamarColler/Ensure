import {
  applicantContactSchema,
  type ApplicantContact,
  type ApplicantStepAccepted,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { ApplicantStep, errorKey } from '../../components/ApplicantStep';
import { postJson, type ApiErrorException } from '../../api-client';
import { NumericInline } from '../../components/NumericInline';
import { useDraftStore } from '../../store';
import { nextStepPath } from '../../wizard';

type ContactInput = Record<keyof ApplicantContact, string>;

export function Contact() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contact = useDraftStore((state) => state.contact);
  const setContact = useDraftStore((state) => state.setContact);

  const { control, handleSubmit } = useForm<
    ContactInput,
    unknown,
    ApplicantContact
  >({
    resolver: zodResolver<ContactInput, unknown, ApplicantContact>(
      applicantContactSchema,
    ),
    mode: 'onBlur',
    defaultValues: {
      phone: contact?.phone ?? '',
      address: contact?.address ?? '',
    },
  });

  const mutation = useMutation<
    ApplicantStepAccepted,
    ApiErrorException,
    ApplicantContact
  >({
    mutationFn: (values) =>
      postJson<ApplicantStepAccepted>('/applicant/contact', values),
    onSuccess: (_data, values) => {
      setContact(values);

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
      heading={t('applicant:groups.contact')}
      submitLabel={t('applicant:continueCta')}
      pending={mutation.isPending}
      error={mutation.error}
      onRetry={() => {
        if (mutation.variables !== undefined) {
          mutation.mutate(mutation.variables);
        }
      }}
      onSubmit={submit}
    >
      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            disabled={mutation.isPending}
            label={t('applicant:phoneLabel')}
            slotProps={{
              htmlInput: { dir: 'ltr', inputMode: 'tel', autoComplete: 'tel' },
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
            disabled={mutation.isPending}
            label={t('applicant:addressLabel')}
            autoComplete="street-address"
            multiline
            error={fieldState.error !== undefined}
            helperText={t(errorKey(fieldState.error) ?? 'applicant:addressHint')}
          />
        )}
      />
    </ApplicantStep>
  );
}
