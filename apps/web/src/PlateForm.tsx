import {
  vehicleLookupRequestSchema,
  type VehicleInfo,
  type VehicleLookupRequest,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiErrorAlert } from './ApiErrorAlert';
import { VehicleConfirm } from './VehicleConfirm';
import { postJson, type ApiErrorException } from './api-client';
import { useDraftStore } from './store';

function stripPlate(value: string): string {
  return value.replaceAll(/[\s-]/g, '');
}

function groupPlate(value: string): string {
  const digits = stripPlate(value);

  if (digits.length === 7) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }

  if (digits.length === 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  return value;
}

export function PlateForm() {
  const { t } = useTranslation();
  const storedVehicle = useDraftStore((state) => state.vehicle);
  const clearVehicle = useDraftStore((state) => state.clearVehicle);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<VehicleLookupRequest, unknown, VehicleLookupRequest>({
    resolver: zodResolver(vehicleLookupRequestSchema),
    mode: 'onBlur',
    defaultValues: { plate: '' },
  });

  const lookup = useMutation<VehicleInfo, ApiErrorException, string>({
    mutationFn: (plate) => postJson<VehicleInfo>('/vehicle/lookup', { plate }),
  });

  const { failureCount } = lookup;

  useEffect(() => {
    if (failureCount > 0) {
      setFocus('plate');
    }
  }, [failureCount, setFocus]);

  const submit = handleSubmit((values) => {
    lookup.mutate(values.plate);
  });

  const vehicle = lookup.data ?? storedVehicle;
  const plate = lookup.variables ?? storedVehicle?.license_plate;

  if (vehicle && plate) {
    return (
      <VehicleConfirm
        vehicle={vehicle}
        plate={plate}
        onBack={() => {
          lookup.reset();
          clearVehicle();
        }}
      />
    );
  }

  return (
    <Stack
      component="form"
      spacing={3}
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <Typography variant="h6" component="h2">
        {t('vehicle:heading')}
      </Typography>

      <TextField
        label={t('vehicle:plateLabel')}
        fullWidth
        disabled={lookup.isPending}
        slotProps={{
          htmlInput: { dir: 'ltr', inputMode: 'numeric', autoComplete: 'off' },
        }}
        {...register('plate')}
        onFocus={() => {
          setValue('plate', stripPlate(getValues('plate')));
        }}
        onBlur={(event) => {
          setValue('plate', groupPlate(event.target.value), {
            shouldValidate: true,
            shouldTouch: true,
          });
        }}
        error={errors.plate !== undefined}
        helperText={errors.plate && t('vehicle:plateFormatInvalid')}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={lookup.isPending}
      >
        {lookup.isPending ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          t('vehicle:lookupCta')
        )}
      </Button>

      {lookup.error && (
        <ApiErrorAlert
          error={lookup.error.apiError}
          onRetry={() => {
            void submit();
          }}
          retryPending={lookup.isPending}
        />
      )}
    </Stack>
  );
}
