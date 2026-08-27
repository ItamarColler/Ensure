import { estimatePremium } from '@ensure/shared';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trans, useTranslation } from 'react-i18next';

import { NumericInline } from '../../components/NumericInline';
import { useDraftStore } from '../../store';

const premiumFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

export function Quote() {
  const { t } = useTranslation();
  const vehicle = useDraftStore((state) => state.vehicle);
  const coverage = useDraftStore((state) => state.coverage);

  if (!vehicle || !coverage) {
    return;
  }

  return (
    <Paper variant="outlined" sx={{ padding: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          {t('quote.title')}
        </Typography>

        <Typography variant="body1">
          <Trans
            i18nKey="quote.vehicleLine"
            values={{
              plate: vehicle.license_plate,
              manufacturer: vehicle.manufacturer,
              model: vehicle.model,
              year: vehicle.year,
              color: vehicle.color,
            }}
            components={{ ltr: <NumericInline /> }}
          />
        </Typography>

        <Divider />

        <Typography variant="subtitle1" component="h3">
          {t('quote.coverageTitle')}
        </Typography>

        <Typography variant="body1">
          {t(`coverage:tiers.${coverage.tier}.label`)}
        </Typography>

        {coverage.addOns.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="subtitle1" component="h3">
              {t('coverage:addOnsTitle')}
            </Typography>

            {coverage.addOns.map((addOn) => (
              <Typography key={addOn} variant="body1">
                {t(`coverage:addOns.${addOn}`)}
              </Typography>
            ))}
          </Stack>
        )}

        <Divider />

        <Stack spacing={1}>
          <Typography variant="body1">
            {t('auth:estimatedPremiumLabel')}
          </Typography>

          <Typography variant="h5" component="p">
            <NumericInline>
              {premiumFormatter.format(estimatePremium(vehicle, coverage))}
            </NumericInline>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t('auth:estimatedPremiumCaption')}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
