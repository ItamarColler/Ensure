import {
  applicantRiskSchema,
  type ApplicantContact,
  type ApplicantIdentity,
  type ApplicantRisk,
  type ApplicantStepAccepted,
  type FamilyStatus,
  type PolicyIssuedResponse,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ApplicantStep, errorKey } from '../../components/ApplicantStep';
import { postJson, type ApiErrorException } from '../../api-client';
import { useAuthStore } from '../../auth-store';
import { useDraftStore } from '../../store';

export const driversCountOptions = [1, 2, 3, 4] as const;

export const familyStatusOptions = [
  'single',
  'married',
  'divorced',
  'widowed',
] as const;

interface RiskInput {
  driversCount?: number | undefined;
  familyStatus?: FamilyStatus | undefined;
}

function selectValue(value: string | number | undefined): string | number {
  return value ?? '';
}

export function Driving() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const identity = useDraftStore((state) => state.identity);
  const contact = useDraftStore((state) => state.contact);
  const risk = useDraftStore((state) => state.risk);
  const setRisk = useDraftStore((state) => state.setRisk);
  const draftApplicationId = useDraftStore((state) => state.applicationId);
  const sessionApplication = useAuthStore((state) => state.application);
  const setPolicy = useAuthStore((state) => state.setPolicy);

  const { control, handleSubmit } = useForm<
    RiskInput,
    unknown,
    ApplicantRisk
  >({
    resolver: zodResolver<RiskInput, unknown, ApplicantRisk>(
      applicantRiskSchema,
    ),
    mode: 'onBlur',
    defaultValues: {
      ...(risk?.driversCount !== undefined && {
        driversCount: risk.driversCount,
      }),
      ...(risk?.familyStatus !== undefined && {
        familyStatus: risk.familyStatus,
      }),
    },
  });

  const issue = async (
    values: ApplicantRisk,
    completed: ApplicantIdentity,
    reachable: ApplicantContact,
  ): Promise<PolicyIssuedResponse> => {
    await postJson<ApplicantStepAccepted>('/applicant/risk', values);

    return postJson<PolicyIssuedResponse>('/policy/issue', {
      ...completed,
      ...reachable,
      ...values,
      applicationId: draftApplicationId ?? sessionApplication?.id,
    });
  };

  const mutation = useMutation<
    PolicyIssuedResponse,
    ApiErrorException,
    ApplicantRisk
  >({
    mutationFn: (values) => {
      if (!identity || !contact) {
        throw new Error('APPLICANT_PREREQUISITES_MISSING');
      }

      return issue(values, identity, contact);
    },
    onSuccess: (data, values) => {
      setRisk(values);
      setPolicy(data);
      void navigate('/confirmation', { replace: true });
    },
  });

  const submit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <ApplicantStep
      heading={t('applicant:groups.risk')}
      submitLabel={t('applicant:cta')}
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
        name="driversCount"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            value={selectValue(field.value)}
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
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
    </ApplicantStep>
  );
}
