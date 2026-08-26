import {
  coverageSelectionSchema,
  tierAddOnMap,
  type AddOn,
  type CoverageSelection,
  type CoverageTier,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useDraftStore } from '../../store';

const tierOrder: readonly CoverageTier[] = [
  'compulsory',
  'thirdParty',
  'comprehensive',
];

function validAddOnsFor(tier: CoverageTier | undefined): readonly AddOn[] {
  return tier === undefined ? [] : tierAddOnMap[tier];
}

function radioValueFor(tier: CoverageTier | undefined): string {
  return tier ?? '';
}

export function Coverage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const coverage = useDraftStore((state) => state.coverage);
  const setCoverage = useDraftStore((state) => state.setCoverage);

  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CoverageSelection, unknown, CoverageSelection>({
    resolver: zodResolver(coverageSelectionSchema),
    defaultValues: coverage ?? { addOns: [] },
  });

  const availableAddOns = validAddOnsFor(watch('tier'));

  const submit = handleSubmit((values) => {
    setCoverage(values);
    void navigate('/quote');
  });

  return (
    <Stack
      component="form"
      spacing={4}
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <Typography variant="h6" component="h2">
        {t('coverage:title')}
      </Typography>

      <FormControl
        component="fieldset"
        fullWidth
        error={errors.tier !== undefined}
      >
        <Controller
          name="tier"
          control={control}
          render={({ field }) => {
            const currentTier = field.value;

            return (
              <RadioGroup
                name={field.name}
                value={radioValueFor(currentTier)}
                onChange={(event) => {
                  const nextTier = tierOrder.find(
                    (tier) => tier === event.target.value,
                  );

                  if (nextTier !== undefined) {
                    field.onChange(nextTier);
                    setValue(
                      'addOns',
                      getValues('addOns').filter((addOn) =>
                        tierAddOnMap[nextTier].includes(addOn),
                      ),
                    );
                  }
                }}
              >
                <Stack spacing={2}>
                  {tierOrder.map((tier) => (
                    <Paper
                      key={tier}
                      variant="outlined"
                      sx={{
                        padding: 3,
                        borderWidth: currentTier === tier ? 2 : 1,
                        borderColor:
                          currentTier === tier ? 'primary.main' : 'divider',
                      }}
                    >
                      <FormControlLabel
                        value={tier}
                        control={<Radio />}
                        sx={{ margin: 0, alignItems: 'flex-start' }}
                        label={
                          <Stack spacing={1} sx={{ paddingBlockStart: 1 }}>
                            <Typography variant="h6" component="span">
                              {t(`coverage:tiers.${tier}.label`)}
                            </Typography>

                            <Typography variant="body1" color="text.secondary">
                              {t(`coverage:tiers.${tier}.explanation`)}
                            </Typography>

                            {tier === 'compulsory' && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t('coverage:tiers.compulsory.helper')}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </Paper>
                  ))}
                </Stack>
              </RadioGroup>
            );
          }}
        />

        {errors.tier && (
          <FormHelperText>{t('coverage:tierRequired')}</FormHelperText>
        )}
      </FormControl>

      {availableAddOns.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="h6" component="h3">
            {t('coverage:addOnsTitle')}
          </Typography>

          <Controller
            name="addOns"
            control={control}
            render={({ field }) => (
              <Stack>
                {availableAddOns.map((addOn) => (
                  <FormControlLabel
                    key={addOn}
                    control={
                      <Checkbox
                        checked={field.value.includes(addOn)}
                        onChange={(event) => {
                          field.onChange(
                            event.target.checked
                              ? [...field.value, addOn]
                              : field.value.filter((value) => value !== addOn),
                          );
                        }}
                      />
                    }
                    label={t(`coverage:addOns.${addOn}`)}
                  />
                ))}
              </Stack>
            )}
          />
        </Stack>
      )}

      <Stack spacing={1}>
        <Button type="submit" variant="contained" fullWidth>
          {t('coverage:cta')}
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={() => {
            void navigate('/vehicle');
          }}
          sx={{ color: 'text.secondary' }}
        >
          {t('vehicle:back')}
        </Button>
      </Stack>
    </Stack>
  );
}
