import {
  loginFormSchema,
  registerFormSchema,
  type AuthResponse,
  type CoverageSelection,
  type LoginFormValues,
  type RegisterFormValues,
  type VehicleInfo,
} from '@ensure/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { ApiErrorException, postJson } from '../../api-client';
import { useAuthStore } from '../../auth-store';
import { ApiErrorAlert } from '../../components/ApiErrorAlert';
import { NumericInline } from '../../components/NumericInline';
import { PendingButton } from '../../components/PendingButton';
import { useDraftStore } from '../../store';
import { nextStepPath } from '../../wizard';

type AuthMode = 'register' | 'login';

interface StageOneDraft {
  vehicle: VehicleInfo;
  coverage: CoverageSelection;
}

function stageOneDraft(): StageOneDraft {
  const { vehicle, coverage } = useDraftStore.getState();

  if (!vehicle || !coverage) {
    throw new ApiErrorException({
      code: 'VALIDATION_ERROR',
      message: 'stage one draft missing',
    });
  }

  return { vehicle, coverage };
}

function useAdoptAuthResponse(): (data: AuthResponse) => void {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (data: AuthResponse) => {
    const draft = useDraftStore.getState();

    draft.setVehicle(data.vehicle);
    draft.setCoverage(data.coverage);
    draft.setApplicationId(data.applicationId);
    useAuthStore.getState().setUser(data.user);

    const target = nextStepPath(pathname);

    if (target) {
      void navigate(target);
    }
  };
}

interface RegisterFormProps {
  onConflict: (email: string) => void;
}

function RegisterForm({ onConflict }: RegisterFormProps) {
  const adoptAuthResponse = useAdoptAuthResponse();
  const { t } = useTranslation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues, unknown, RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      termsAccepted: false,
      marketingOptIn: false,
    },
  });

  const submitRegister = useMutation<
    AuthResponse,
    ApiErrorException,
    RegisterFormValues
  >({
    mutationFn: (values) =>
      postJson<AuthResponse>('/auth/register', {
        email: values.email,
        password: values.password,
        termsAccepted: true,
        ...(values.marketingOptIn && { marketingOptIn: true }),
        ...stageOneDraft(),
      }),
    onSuccess: adoptAuthResponse,
    onError: (error, values) => {
      if (error.apiError.code === 'CONFLICT') {
        onConflict(values.email);
      }
    },
  });

  const submit = handleSubmit((values) => {
    submitRegister.mutate(values);
  });

  return (
    <Stack
      component="form"
      noValidate
      sx={{ flex: 1, minBlockSize: 0 }}
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <Box
        sx={{
          flex: 1,
          minBlockSize: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={6} sx={{ marginBlock: 'auto', inlineSize: '100%' }}>
          <TextField
            label={t('auth:emailLabel')}
            fullWidth
            autoComplete="email"
            disabled={submitRegister.isPending}
            slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'email' } }}
            {...register('email')}
            error={errors.email !== undefined}
            helperText={errors.email && t('auth:emailInvalid')}
          />

          <TextField
            label={t('auth:passwordLabel')}
            type="password"
            fullWidth
            autoComplete="new-password"
            disabled={submitRegister.isPending}
            slotProps={{ htmlInput: { dir: 'ltr' } }}
            {...register('password')}
            error={errors.password !== undefined}
            helperText={errors.password && t('auth:passwordTooShort')}
          />

          <Stack>
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      name={field.name}
                      checked={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        field.onChange(event.target.checked);
                      }}
                    />
                  }
                  label={t('auth:termsLabel')}
                />
              )}
            />

            {errors.termsAccepted && (
              <FormHelperText error>{t('auth:termsRequired')}</FormHelperText>
            )}

            <Controller
              name="marketingOptIn"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      name={field.name}
                      checked={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        field.onChange(event.target.checked);
                      }}
                    />
                  }
                  label={t('auth:marketingLabel')}
                />
              )}
            />
          </Stack>

          {submitRegister.error && (
            <ApiErrorAlert
              error={submitRegister.error.apiError}
              onRetry={() => {
                void submit();
              }}
              retryPending={submitRegister.isPending}
            />
          )}
        </Stack>
      </Box>

      <PendingButton
        type="submit"
        variant="contained"
        fullWidth
        pending={submitRegister.isPending}
        sx={{ minBlockSize: 44, flex: '0 0 auto', marginBlockStart: 6 }}
      >
        {t('auth:registerCta')}
      </PendingButton>
    </Stack>
  );
}

interface LoginFormProps {
  conflictEmail: string | undefined;
}

function LoginForm({ conflictEmail }: LoginFormProps) {
  const adoptAuthResponse = useAdoptAuthResponse();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues, unknown, LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
    defaultValues: { email: conflictEmail ?? '', password: '' },
  });

  const submitLogin = useMutation<
    AuthResponse,
    ApiErrorException,
    LoginFormValues
  >({
    mutationFn: (values) =>
      postJson<AuthResponse>('/auth/login', {
        email: values.email,
        password: values.password,
        ...stageOneDraft(),
      }),
    onSuccess: adoptAuthResponse,
  });

  const submit = handleSubmit((values) => {
    submitLogin.mutate(values);
  });

  return (
    <Stack
      component="form"
      noValidate
      sx={{ flex: 1, minBlockSize: 0 }}
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <Box
        sx={{
          flex: 1,
          minBlockSize: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={6} sx={{ marginBlock: 'auto', inlineSize: '100%' }}>
          {conflictEmail !== undefined && (
            <Alert severity="info">
              <Trans
                i18nKey="auth:emailAlreadyRegistered"
                values={{ email: conflictEmail }}
                components={{ ltr: <NumericInline /> }}
              />
            </Alert>
          )}

          <TextField
            label={t('auth:emailLabel')}
            fullWidth
            autoComplete="email"
            disabled={submitLogin.isPending}
            slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'email' } }}
            {...register('email')}
            error={errors.email !== undefined}
            helperText={errors.email && t('auth:emailInvalid')}
          />

          <TextField
            label={t('auth:passwordLabel')}
            type="password"
            fullWidth
            autoComplete="current-password"
            disabled={submitLogin.isPending}
            slotProps={{ htmlInput: { dir: 'ltr' } }}
            {...register('password')}
            error={errors.password !== undefined}
            helperText={errors.password && t('auth:passwordTooShort')}
          />

          {submitLogin.error && (
            <ApiErrorAlert
              error={submitLogin.error.apiError}
              onRetry={() => {
                void submit();
              }}
              retryPending={submitLogin.isPending}
            />
          )}
        </Stack>
      </Box>

      <PendingButton
        type="submit"
        variant="contained"
        fullWidth
        pending={submitLogin.isPending}
        sx={{ minBlockSize: 44, flex: '0 0 auto', marginBlockStart: 6 }}
      >
        {t('auth:loginCta')}
      </PendingButton>
    </Stack>
  );
}

export function AuthPanel() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('register');
  const [conflictEmail, setConflictEmail] = useState<string | undefined>(
    undefined,
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 3,
        blockSize: 380,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={6} sx={{ flex: 1, minBlockSize: 0 }}>
        <Tabs
          value={mode}
          variant="fullWidth"
          onChange={(_event, value: unknown) => {
            setConflictEmail(undefined);
            setMode(value === 'login' ? 'login' : 'register');
          }}
        >
          <Tab value="register" label={t('auth:registerTab')} />
          <Tab value="login" label={t('auth:loginTab')} />
        </Tabs>

        {mode === 'register' ? (
          <RegisterForm
            onConflict={(email) => {
              setConflictEmail(email);
              setMode('login');
            }}
          />
        ) : (
          <LoginForm conflictEmail={conflictEmail} />
        )}
      </Stack>
    </Paper>
  );
}
