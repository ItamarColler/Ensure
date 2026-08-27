import { vehicleInfoSchema, type VehicleInfo } from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { NumericInline } from '../../components/NumericInline';
import { WizardActions } from '../../components/WizardActions';
import { useDraftStore } from '../../store';
import { nextStepPath } from '../../wizard';

interface VehicleConfirmProps {
  vehicle: VehicleInfo;
  plate: string;
  onBack: () => void;
}

export function VehicleConfirm({
  vehicle,
  plate,
  onBack,
}: VehicleConfirmProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const setVehicle = useDraftStore((state) => state.setVehicle);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleInfo, unknown, VehicleInfo>({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: vehicle,
  });

  const submit = handleSubmit((values) => {
    setVehicle({ ...values, license_plate: vehicle.license_plate });

    const target = nextStepPath(pathname);

    if (target) {
      void navigate(target);
    }
  });

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
        <Trans
          i18nKey="vehicle:confirmForPlate"
          values={{ plate }}
          components={{ ltr: <NumericInline /> }}
        />
      </Typography>

      <TextField
        label={t('vehicle:manufacturer')}
        fullWidth
        multiline
        {...register('manufacturer')}
        error={errors.manufacturer !== undefined}
        helperText={errors.manufacturer && t('vehicle:fieldRequired')}
      />

      <TextField
        label={t('vehicle:model')}
        fullWidth
        multiline
        {...register('model')}
        error={errors.model !== undefined}
        helperText={errors.model && t('vehicle:fieldRequired')}
      />

      <TextField
        label={t('vehicle:year')}
        type="number"
        fullWidth
        slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'numeric' } }}
        {...register('year', { valueAsNumber: true })}
        error={errors.year !== undefined}
        helperText={errors.year && t('vehicle:fieldRequired')}
      />

      <TextField
        label={t('vehicle:color')}
        fullWidth
        {...register('color')}
        error={errors.color !== undefined}
        helperText={errors.color && t('vehicle:fieldRequired')}
      />

      <WizardActions submitLabel={t('vehicle:confirmCta')} onBack={onBack} />
    </Stack>
  );
}
