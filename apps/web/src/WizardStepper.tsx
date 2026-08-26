import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const stepKeys = [
  'vehicle',
  'coverage',
  'quote',
  'register',
  'details',
  'confirmation',
] as const;

const implementedStepCount = 3;

const stepIndexByPath: Record<string, number> = {
  '/vehicle': 0,
  '/coverage': 1,
  '/quote': 2,
};

export function WizardStepper() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const activeStep = stepIndexByPath[pathname] ?? 0;

  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {stepKeys.map((stepKey, index) => (
        <Step key={stepKey} disabled={index >= implementedStepCount}>
          <StepLabel>{t(`steps.${stepKey}`)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
