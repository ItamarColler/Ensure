export type WizardPrerequisite = 'vehicle' | 'coverage' | 'auth';

export type WizardDraftSnapshot = Readonly<
  Partial<Record<WizardPrerequisite, unknown>>
>;

interface WizardStepShape {
  readonly key: string;
  readonly path: string;
  readonly requires: readonly WizardPrerequisite[];
  readonly implemented: boolean;
}

export const wizardSteps = [
  { key: 'vehicle', path: '/vehicle', requires: [], implemented: true },
  {
    key: 'coverage',
    path: '/coverage',
    requires: ['vehicle'],
    implemented: true,
  },
  {
    key: 'register',
    path: '/register',
    requires: ['vehicle', 'coverage'],
    implemented: true,
  },
  {
    key: 'details',
    path: '/details',
    requires: ['vehicle', 'coverage', 'auth'],
    implemented: true,
  },
  {
    key: 'confirmation',
    path: '/confirmation',
    requires: ['auth'],
    implemented: false,
  },
] as const satisfies readonly WizardStepShape[];

export type WizardStep = (typeof wizardSteps)[number];

export type WizardStepKey = WizardStep['key'];

export function stepIndex(pathname: string): number | undefined {
  const index = wizardSteps.findIndex((step) => step.path === pathname);

  return index === -1 ? undefined : index;
}

const prerequisiteRedirects: Record<WizardPrerequisite, string> = {
  vehicle: '/vehicle',
  coverage: '/coverage',
  auth: '/register',
};

const sealPath = '/confirmation';

export function guardRedirectPath(
  pathname: string,
  snapshot: WizardDraftSnapshot,
): string | undefined {
  const index = stepIndex(pathname);

  if (index === undefined) {
    return undefined;
  }

  const step = wizardSteps[index];

  if (step === undefined) {
    return undefined;
  }

  const missing = step.requires.find(
    (requirement) => snapshot[requirement] === undefined,
  );

  return missing === undefined ? undefined : prerequisiteRedirects[missing];
}

export function sealRedirectPath(
  pathname: string,
  hasIssuedPolicy: boolean,
): string | undefined {
  if (!hasIssuedPolicy || pathname === sealPath) {
    return undefined;
  }

  return stepIndex(pathname) === undefined ? undefined : sealPath;
}

export function nextStepPath(pathname: string): string | undefined {
  const index = stepIndex(pathname);

  return index === undefined ? undefined : wizardSteps[index + 1]?.path;
}

export function previousStepPath(pathname: string): string | undefined {
  const index = stepIndex(pathname);

  if (index === undefined || index === 0) {
    return undefined;
  }

  return wizardSteps[index - 1]?.path;
}

export const wizardResetPath: string = wizardSteps[0].path;
