import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { stepIndex, wizardSteps } from './wizard';

export function WizardStepper() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const activeStep = stepIndex(pathname) ?? 0;

  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {wizardSteps.map((step) => (
        <Step key={step.key} disabled={!step.implemented}>
          <StepLabel>{t(`steps.${step.key}`)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
