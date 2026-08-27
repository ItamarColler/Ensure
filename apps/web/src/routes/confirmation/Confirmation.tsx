import CheckRounded from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useAuthStore } from '../../auth-store';
import { NumericInline } from '../../components/NumericInline';
import type { PremiumSummaryRow } from '../../components/PremiumSummary';
import { PremiumSummary } from '../../components/PremiumSummary';

interface ContactRowProps {
  label: string;
  children?: React.ReactNode;
}

function ContactRow({ label, children }: ContactRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '6.5px' }}>
      <Typography
        component="span"
        sx={{ fontSize: '10.5px', color: 'text.secondary' }}
      >
        {label}
      </Typography>

      <Typography
        component="span"
        sx={{ fontSize: '10.5px', color: 'text.primary', minInlineSize: 0 }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export function Confirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const policy = useAuthStore((state) => state.policy);

  if (!policy) {
    return (
      <Stack spacing="9px">
        <Typography component="h1" sx={{ fontSize: '18px', fontWeight: 700 }}>
          {t('policy:absent.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t('policy:absent.body')}
        </Typography>

        <Box>
          <Button
            variant="contained"
            onClick={() => {
              void navigate('/vehicle');
            }}
          >
            {t('policy:absent.cta')}
          </Button>
        </Box>
      </Stack>
    );
  }

  const rows: PremiumSummaryRow[] = [
    {
      label: t('applicant:summary.vehicleRow'),
      value: policy.vehicle.license_plate,
      ltr: true,
    },
    {
      label: t('applicant:summary.modelRow'),
      value: `${policy.vehicle.manufacturer} ${policy.vehicle.model} ${String(policy.vehicle.year)}`,
    },
    {
      label: t('applicant:summary.coverageRow'),
      value: t(`coverage:tiers.${policy.coverage.tier}.label`),
    },
    ...policy.coverage.addOns.map((addOn) => ({
      label: t('applicant:summary.addOnsRow'),
      value: t(`coverage:addOns.${addOn}`),
    })),
    {
      label: t('applicant:summary.driversRow'),
      value: t(`applicant:driversCount.${String(policy.driversCount)}`),
    },
    {
      label: t('applicant:summary.familyStatusRow'),
      value: t(`applicant:familyStatus.${policy.familyStatus}`),
    },
    {
      label: t('policy:statusLabel'),
      value: t('policy:statusPendingReview'),
    },
  ];

  return (
    <Stack spacing="9px">
      <Stack spacing="9px" sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            inlineSize: 44,
            blockSize: 44,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckRounded sx={{ color: 'primary.main' }} />
        </Box>

        <Typography component="h1" sx={{ fontSize: '18px', fontWeight: 700 }}>
          {t('policy:title')}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t('policy:subtitle')}
        </Typography>

        <Typography
          component="p"
          sx={{ fontSize: '10.5px', color: 'text.secondary' }}
        >
          {t('policy:policyNumberLabel')}
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'text.primary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <NumericInline>{policy.policyNumber}</NumericInline>
        </Typography>
      </Stack>

      <PremiumSummary
        title={t('policy:summaryTitle')}
        rows={rows}
        premiumLabel={t('policy:premiumLabel')}
        premium={policy.premiumAmount}
        note={t('policy:premiumNote')}
        density="medium"
      />

      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderRadius: '11px',
          padding: '12px',
        }}
      >
        <Stack spacing="5px">
          <Typography
            component="p"
            sx={{ fontSize: '9.7px', color: 'text.secondary' }}
          >
            {t('policy:contactTitle')}
          </Typography>

          <Typography component="p" sx={{ fontSize: '11.5px', fontWeight: 700 }}>
            {t('policy:contactCompany')}
          </Typography>

          <ContactRow label={t('policy:contactPhoneLabel')}>
            <NumericInline>{t('policy:contactPhone')}</NumericInline>
          </ContactRow>

          <ContactRow label={t('policy:contactEmailLabel')}>
            <NumericInline>{t('policy:contactEmail')}</NumericInline>
          </ContactRow>

          <ContactRow label={t('policy:contactHoursLabel')}>
            <Trans
              i18nKey="policy:contactHours"
              components={{ ltr: <NumericInline /> }}
            />
          </ContactRow>

          <Typography
            component="p"
            sx={{ fontSize: '9.7px', color: 'text.secondary' }}
          >
            {t('policy:contactPlaceholderNote')}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
