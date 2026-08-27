import type {
  ApplicantDetails,
  PolicyIssuedResponse,
  VehicleInfo,
} from '@ensure/shared';
import { applicantDetailsSchema, estimatePremium } from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ApiErrorException, postJson } from '../../api-client';
import { useAuthStore } from '../../auth-store';
import { ApiErrorAlert } from '../../components/ApiErrorAlert';
import { PendingButton } from '../../components/PendingButton';
import type { PremiumSummaryRow } from '../../components/PremiumSummary';
import { PremiumSummary } from '../../components/PremiumSummary';
import { SummaryBar } from '../../components/SummaryBar';
import { useDraftStore } from '../../store';
import { ApplicantDetailsForm, applicantFormId } from './ApplicantDetailsForm';

const wideLayout = '@container (min-width: 640px)';

const neutralDriversCount = 1;

export type ApplicantFormValues = Omit<
  ApplicantDetails,
  'driversCount' | 'familyStatus'
> &
  Partial<Pick<ApplicantDetails, 'driversCount' | 'familyStatus'>>;

function vehicleLine(vehicle: VehicleInfo): string {
  return `${vehicle.manufacturer} ${vehicle.model} ${String(vehicle.year)}`;
}

export function Details() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const vehicle = useDraftStore((state) => state.vehicle);
  const coverage = useDraftStore((state) => state.coverage);
  const draftApplicationId = useDraftStore((state) => state.applicationId);
  const sessionApplication = useAuthStore((state) => state.application);
  const setPolicy = useAuthStore((state) => state.setPolicy);

  const { control, handleSubmit } = useForm<
    ApplicantFormValues,
    unknown,
    ApplicantDetails
  >({
    resolver: zodResolver<ApplicantFormValues, unknown, ApplicantDetails>(
      applicantDetailsSchema,
    ),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      nationalId: '',
      phone: '',
    },
  });

  const watchedDriversCount = useWatch({ control, name: 'driversCount' });
  const watchedFamilyStatus = useWatch({ control, name: 'familyStatus' });

  const mutation = useMutation({
    mutationFn: (values: ApplicantDetails) =>
      postJson<PolicyIssuedResponse>('/policy/issue', {
        ...values,
        applicationId: draftApplicationId ?? sessionApplication?.id,
      }),
    onSuccess: (data) => {
      setPolicy(data);
      void navigate('/confirmation', { replace: true });
    },
  });

  if (!vehicle || !coverage) {
    return;
  }

  const premium = estimatePremium(
    vehicle,
    coverage,
    new Date().getFullYear(),
    watchedDriversCount ?? neutralDriversCount,
    watchedFamilyStatus ?? 'single',
  );

  const rows: PremiumSummaryRow[] = [
    {
      label: t('applicant:summary.vehicleRow'),
      value: vehicle.license_plate,
      ltr: true,
    },
    { label: t('applicant:summary.modelRow'), value: vehicleLine(vehicle) },
    {
      label: t('applicant:summary.coverageRow'),
      value: t(`coverage:tiers.${coverage.tier}.label`),
    },
    ...coverage.addOns.map((addOn) => ({
      label: t('applicant:summary.addOnsRow'),
      value: t(`coverage:addOns.${addOn}`),
    })),
    {
      label: t('applicant:summary.driversRow'),
      value: t(
        watchedDriversCount === undefined
          ? 'applicant:pendingRowPlaceholder'
          : `applicant:driversCount.${String(watchedDriversCount)}`,
      ),
    },
    {
      label: t('applicant:summary.familyStatusRow'),
      value: t(
        watchedFamilyStatus === undefined
          ? 'applicant:pendingRowPlaceholder'
          : `applicant:familyStatus.${watchedFamilyStatus}`,
      ),
    },
  ];

  const submit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const summary = (
    <PremiumSummary
      title={t('applicant:summary.title')}
      rows={rows}
      premiumLabel={t('applicant:summary.premiumLabel')}
      premium={premium}
      note={t('applicant:summary.premiumNote')}
      density="tight"
    />
  );

  return (
    <Box sx={{ containerType: 'inline-size' }}>
      <Stack spacing="16px">
        <Typography variant="h5" component="h1">
          {t('applicant:title')}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t('applicant:subtitle')}
        </Typography>

        {mutation.error instanceof ApiErrorException && (
          <ApiErrorAlert
            error={mutation.error.apiError}
            onRetry={() => {
              if (mutation.variables !== undefined) {
                mutation.mutate(mutation.variables);
              }
            }}
            retryPending={mutation.isPending}
          />
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '22px',
            alignItems: 'start',
            [wideLayout]: { gridTemplateColumns: '1fr 264px' },
          }}
        >
          <ApplicantDetailsForm
            control={control}
            disabled={mutation.isPending}
            onSubmit={() => {
              void submit();
            }}
          >
            <Box sx={{ display: 'none', [wideLayout]: { display: 'block' } }}>
              <PendingButton
                type="submit"
                form={applicantFormId}
                variant="contained"
                fullWidth
                pending={mutation.isPending}
              >
                {t('applicant:cta')}
              </PendingButton>
            </Box>
          </ApplicantDetailsForm>

          <Box
            sx={{
              order: -1,
              marginBlockEnd: '12px',
              [wideLayout]: {
                order: 0,
                marginBlockEnd: 0,
                position: 'sticky',
                insetBlockStart: '16px',
              },
            }}
          >
            {summary}
          </Box>
        </Box>

        <Box sx={{ [wideLayout]: { display: 'none' } }}>
          <SummaryBar
            premium={premium}
            label={t('applicant:summary.barLabel')}
            formId={applicantFormId}
            pending={mutation.isPending}
          >
            {t('applicant:cta')}
          </SummaryBar>
        </Box>
      </Stack>
    </Box>
  );
}
